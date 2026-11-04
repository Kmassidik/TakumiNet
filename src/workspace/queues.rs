use super::*;

const MBIT_MAX: u32 = 100_000;

impl Workspace {
    /// What a home is trying to pull, in Mbit/s. Zero removes the entry.
    pub fn set_demand(&mut self, client: &str, mbit: u32) -> Result<(), String> {
        if !self.devices.iter().any(|d| d.id == client) {
            return Err("no such device".into());
        }
        if mbit > MBIT_MAX {
            return Err(format!("demand must be at most {MBIT_MAX} Mbit/s"));
        }
        if mbit == 0 {
            self.demands.remove(client);
        } else {
            self.demands.insert(client.to_string(), mbit);
        }
        Ok(())
    }

    /// A per-customer speed limit on the gateway, by login name. Zero removes it.
    pub fn set_queue(&mut self, gateway: &str, user: &str, mbit: u32) -> Result<(), String> {
        if !self.devices.iter().any(|d| d.id == gateway) {
            return Err("no such device".into());
        }
        if self.pppoe_sessions(gateway).iter().all(|(_, name)| name != user) {
            return Err(format!("no session for {user}"));
        }
        if mbit > MBIT_MAX {
            return Err(format!("a limit must be at most {MBIT_MAX} Mbit/s"));
        }
        let list = self.queues.entry(gateway.to_string()).or_default();
        list.retain(|(name, _)| name != user);
        if mbit > 0 {
            list.push((user.to_string(), mbit));
            list.sort();
        }
        Ok(())
    }

    /// The parent limit for the whole group, in Mbit/s. Zero removes it.
    pub fn set_queue_parent(&mut self, gateway: &str, mbit: u32) -> Result<(), String> {
        if !self.devices.iter().any(|d| d.id == gateway) {
            return Err("no such device".into());
        }
        if mbit > MBIT_MAX {
            return Err(format!("a limit must be at most {MBIT_MAX} Mbit/s"));
        }
        if mbit == 0 {
            self.queue_parent.remove(gateway);
        } else {
            self.queue_parent.insert(gateway.to_string(), mbit);
        }
        Ok(())
    }

    /// Measured rates per session: demand, capped by the customer limit, then a
    /// fair share of the parent limit when the group asks for more than it.
    pub fn measured_rates(&self, gateway: &str) -> Vec<(String, String, f64)> {
        let sessions = self.pppoe_sessions(gateway);
        let limits = self.queues.get(gateway);
        let capped: Vec<f64> = sessions.iter().map(|(client, user)| {
            let demand = self.demands.get(client).copied().unwrap_or(5) as f64;
            let limit = limits.and_then(|l| l.iter().find(|(name, _)| name == user)).map(|(_, m)| *m as f64);
            limit.map_or(demand, |l| demand.min(l))
        }).collect();
        let rates = match self.queue_parent.get(gateway) {
            Some(parent) => fair_share(&capped, *parent as f64),
            None => capped,
        };
        sessions.into_iter().zip(rates).map(|((client, user), rate)| (client, user, rate)).collect()
    }

    /// Load on the named upstream port, in percent of its speed.
    pub fn line_load(&self, gateway: &str, port: &str) -> Option<f64> {
        let device = self.devices.iter().find(|d| d.id == gateway)?;
        let speed = device.ports.iter().find(|p| p.name == port).map(|p| p.bandwidth_kbps as f64 / 1000.0)?;
        if speed <= 0.0 {
            return None;
        }
        let total: f64 = self.measured_rates(gateway).iter().map(|(_, _, rate)| rate).sum();
        Some(total / speed * 100.0)
    }
}

/// Max-min fairness: everyone gets an equal share, and whoever wants less
/// hands the rest back to the others.
fn fair_share(wanted: &[f64], total: f64) -> Vec<f64> {
    let mut order: Vec<usize> = (0..wanted.len()).collect();
    order.sort_by(|a, b| wanted[*a].total_cmp(&wanted[*b]));
    let mut rates = vec![0.0; wanted.len()];
    let mut left = total;
    for (position, index) in order.iter().enumerate() {
        let share = left / (wanted.len() - position) as f64;
        let given = wanted[*index].min(share);
        rates[*index] = given;
        left -= given;
    }
    rates
}
