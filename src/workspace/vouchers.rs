use super::*;

/// A hotspot voucher: one code, one visitor. The validity is sold in minutes
/// of sim time; the session starts when the voucher is redeemed, and after
/// the paid minutes the portal retires it and the guest is blocked again.
#[derive(Clone, Debug, PartialEq)]
pub struct Voucher {
    pub code: String,
    pub minutes: u32,
    pub used_by: Option<String>,
    /// Sim time (seconds) when the voucher was redeemed; `None` while unused.
    pub started_at: Option<f64>,
}

impl Voucher {
    /// Is this voucher's session out of time at sim time `now`? Unused
    /// vouchers never lapse; a redeemed one lives exactly `minutes` minutes
    /// of sim clock from the moment it was redeemed.
    pub fn lapsed(&self, now: f64) -> bool {
        match (self.started_at, self.used_by.as_deref()) {
            (Some(start), Some(_)) => now >= start + f64::from(self.minutes) * 60.0,
            _ => false,
        }
    }
}

impl Workspace {
    pub fn voucher_create(&mut self, gateway: &str, code: &str, minutes: u32) -> Result<(), String> {
        if !self.devices.iter().any(|d| d.id == gateway && d.kind == "rtrw-gateway") {
            return Err("vouchers live on the gateway".into());
        }
        let code = code.trim();
        if code.len() < 4 || code.contains(char::is_whitespace) {
            return Err("a voucher code needs at least 4 characters and no spaces".into());
        }
        if !(1..=10_080).contains(&minutes) {
            return Err("a voucher lasts from 1 minute to 7 days".into());
        }
        let list = self.vouchers.entry(gateway.to_string()).or_default();
        if list.iter().any(|v| v.code == code) {
            return Err(format!("voucher {code} already exists"));
        }
        list.push(Voucher { code: code.to_string(), minutes, used_by: None, started_at: None });
        Ok(())
    }

    /// One voucher, one visitor. The same visitor may type it again. The
    /// session starts ticking at redemption: after `minutes` of sim time the
    /// voucher lapses and the guest is blocked again.
    pub fn voucher_redeem(&mut self, gateway: &str, client: &str, code: &str) -> Result<(), String> {
        if !self.devices.iter().any(|d| d.id == client) {
            return Err("no such device".into());
        }
        let list = self.vouchers.get_mut(gateway).ok_or("no vouchers on this gateway")?;
        let voucher = list.iter_mut().find(|v| v.code == code.trim())
            .ok_or_else(|| "Login refused: unknown voucher".to_string())?;
        match &voucher.used_by {
            Some(owner) if owner != client => Err("Voucher already used".into()),
            _ => {
                if voucher.used_by.is_none() {
                    voucher.started_at = Some(self.sim_time as f64);
                }
                voucher.used_by = Some(client.to_string());
                Ok(())
            }
        }
    }

    /// Vouchers whose sessions have lapsed: the portal retires them so the
    /// guest is held again until a new voucher is redeemed. Each entry is
    /// (gateway, code, minutes sold, visitor who held it).
    pub fn expire_vouchers(&mut self) -> Vec<(String, String, u32, Option<String>)> {
        let now = self.sim_time as f64;
        let mut expired: Vec<(String, String, u32, Option<String>)> = Vec::new();
        for (gateway, list) in self.vouchers.iter_mut() {
            list.retain(|v| {
                if v.lapsed(now) {
                    expired.push((gateway.clone(), v.code.clone(), v.minutes, v.used_by.clone()));
                    false
                } else {
                    true
                }
            });
        }
        expired
    }

    pub fn voucher_rows(&self, gateway: &str) -> Vec<(String, u32, Option<String>)> {
        self.vouchers.get(gateway).into_iter().flatten()
            .map(|v| (v.code.clone(), v.minutes, v.used_by.clone()))
            .collect()
    }

    /// The voucher record rows: how much of the paid window a session has
    /// consumed rides along so a reopened session still runs out on time.
    pub(super) fn write_voucher_records(&self, out: &mut String) {
        let mut vouchers: Vec<_> = self.vouchers.iter().collect();
        vouchers.sort_by_key(|(id, _)| id.as_str());
        for (gateway, list) in vouchers {
            for v in list {
                let spent = match (v.started_at, v.used_by.as_deref()) {
                    (Some(start), Some(_)) => format!("{}", (self.sim_time as f64 - start).max(0.0)),
                    _ => "-".into(),
                };
                out.push_str(&format!(
                    "voucher\t{}\t{}\t{}\t{}\t{}\n",
                    gateway,
                    escape_field(&v.code),
                    v.minutes,
                    v.used_by.as_deref().unwrap_or("-"),
                    spent
                ));
            }
        }
    }

    /// Milliseconds along the path, from the slower port of each cable crossed.
    pub fn path_latency_ms(&self, from: &str, to: &str) -> Option<f64> {
        let path = self.path(from, to)?;
        let delay = |id: &str, raw: &str| {
            self.devices.iter().find(|d| d.id == id).and_then(|d| {
                let names: Vec<String> = d.ports.iter().map(|p| p.name.clone()).collect();
                let name = crate::cli::expand_iface(raw, &names)?;
                d.ports.iter().find(|p| p.name == name).map(|p| p.delay_us)
            }).unwrap_or(100)
        };
        let mut total = 0u64;
        for pair in path.windows(2) {
            let link = self.links.iter().find(|l| {
                (l.a == pair[0] && l.b == pair[1]) || (l.b == pair[0] && l.a == pair[1])
            })?;
            total += delay(&link.a, &link.a_port).max(delay(&link.b, &link.b_port)) as u64;
        }
        Some(total as f64 / 1000.0)
    }
}
