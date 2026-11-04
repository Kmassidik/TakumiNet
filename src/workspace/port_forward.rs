use super::*;

impl Workspace {
    pub fn add_port_forward(&mut self, router: &str, outside: u16, target: &str, inside: u16) -> Result<(), String> {
        if !self.devices.iter().any(|d| d.id == router && d.kind == "homerouter") {
            return Err("only a home router forwards ports".into());
        }
        if outside == 0 || inside == 0 {
            return Err("ports run from 1 to 65535".into());
        }
        if outside == 80 {
            return Err("port 80 is the router's own page; pick another outside port".into());
        }
        let device = self.devices.iter().find(|d| d.id == target).ok_or_else(|| format!("no device {target}"))?;
        if device.kind == "homerouter" || device.ip.is_none() {
            return Err("forward to a device that has an address".into());
        }
        let list = self.port_forwards.entry(router.to_string()).or_default();
        if list.iter().any(|(port, _, _)| *port == outside) {
            return Err(format!("outside port {outside} is already forwarded"));
        }
        list.push((outside, target.to_string(), inside));
        list.sort();
        Ok(())
    }

    pub fn remove_port_forward(&mut self, router: &str, outside: u16) -> bool {
        let Some(list) = self.port_forwards.get_mut(router) else { return false };
        let before = list.len();
        list.retain(|(port, _, _)| *port != outside);
        list.len() != before
    }

    pub fn port_forward_for(&self, router: &str, outside: u16) -> Option<(String, u16)> {
        self.port_forwards.get(router)?.iter().find(|(p, _, _)| *p == outside).map(|(_, t, i)| (t.clone(), *i))
    }
}
