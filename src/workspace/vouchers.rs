use super::*;

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
        list.push(Voucher { code: code.to_string(), minutes, used_by: None });
        Ok(())
    }

    /// One voucher, one visitor. The same visitor may type it again.
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
                voucher.used_by = Some(client.to_string());
                Ok(())
            }
        }
    }

    pub fn voucher_rows(&self, gateway: &str) -> Vec<(String, u32, Option<String>)> {
        self.vouchers.get(gateway).into_iter().flatten()
            .map(|v| (v.code.clone(), v.minutes, v.used_by.clone()))
            .collect()
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
