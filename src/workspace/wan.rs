use super::*;

impl Workspace {
    pub fn vpn_config(
        &mut self,
        client: &str,
        server: &str,
        user: &str,
    ) -> Result<(), String> {
        if !self.devices.iter().any(|d| d.id == client) {
            return Err("no such device".into());
        }
        if crate::model::parse_ipv4(server).is_none() {
            return Err("invalid VPN server address".into());
        }
        if !self.devices.iter().any(|d| d.ip == crate::model::parse_ipv4(server)) {
            return Err(format!("no device at {server}"));
        }
        if user.trim().is_empty() {
            return Err("user name required".into());
        }
        self.vpn
            .insert(client.to_string(), (server.to_string(), user.to_string()));
        Ok(())
    }

    pub fn vpn_status(&self, client: &str) -> Option<(String, String)> {
        self.vpn.get(client).cloned()
    }

    pub fn pppoe_config(
        &mut self,
        client: &str,
        server: &str,
        user: &str,
    ) -> Result<(), String> {
        if !self.devices.iter().any(|d| d.id == client) {
            return Err("no such device".into());
        }
        if !self.devices.iter().any(|d| d.ip == crate::model::parse_ipv4(server)) {
            return Err(format!("no device at {server}"));
        }
        if user.trim().is_empty() {
            return Err("user name required".into());
        }
        self.pppoe
            .insert(client.to_string(), (server.to_string(), user.to_string()));
        Ok(())
    }

    pub fn pppoe_status(&self, client: &str) -> Option<(String, String)> {
        self.pppoe.get(client).cloned()
    }
}
