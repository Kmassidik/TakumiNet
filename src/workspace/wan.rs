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

    /// One end of a site-to-site tunnel: this router, the peer's address, a shared key.
    pub fn tunnel_config(&mut self, device: &str, peer: &str, key: &str) -> Result<(), String> {
        if !self.devices.iter().any(|d| d.id == device && matches!(d.kind.as_str(), "router" | "asa" | "homerouter")) {
            return Err("tunnels live on routers".into());
        }
        let addr = crate::model::parse_ipv4(peer.trim()).ok_or_else(|| format!("invalid peer address: {peer}"))?;
        if key.trim().len() < 4 {
            return Err("the shared key needs at least 4 characters".into());
        }
        self.tunnels.insert(device.to_string(), (addr, key.trim().to_string()));
        Ok(())
    }

    pub fn tunnel_clear(&mut self, device: &str) -> bool {
        self.tunnels.remove(device).is_some()
    }

    /// `up` when this router and the router it points at point back at each other
    /// with the same key; `down` when configured but unmatched; `none` otherwise.
    pub fn tunnel_state(&self, device: &str) -> &'static str {
        let Some((peer, key)) = self.tunnels.get(device) else { return "none" };
        let owner = self.devices.iter().find(|d| d.ip == Some(*peer) || d.ports.iter().any(|p| p.ip == Some(*peer)));
        let up = owner.is_some_and(|other| {
            self.tunnels.get(&other.id).is_some_and(|(back, other_key)| {
                other_key == key && self.devices.iter().any(|d| d.id == device && (d.ip == Some(*back) || d.ports.iter().any(|p| p.ip == Some(*back))))
            })
        });
        if up { "up" } else { "down" }
    }

    /// Private traffic does not cross the internet cloud without a tunnel between
    /// the routers on both sides of it.
    pub(super) fn tunnel_blocked(&self, src: &str, dst: &str) -> Option<String> {
        let path = self.path(src, dst)?;
        let kind = |id: &String| self.devices.iter().find(|d| &d.id == id).map(|d| d.kind.clone()).unwrap_or_default();
        let at = path.iter().position(|id| kind(id) == "cloud")?;
        let (before, after) = (path.get(at.checked_sub(1)?)?, path.get(at + 1)?);
        if self.tunnel_state(before) == "up" && self.tunnel_state(after) == "up" {
            return None;
        }
        Some(format!(
            "blocked at {}: the internet does not carry this private traffic; build a tunnel between {} and {}",
            self.name_of(&path[at]), self.name_of(before), self.name_of(after)
        ))
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
        let addr = crate::model::parse_ipv4(server);
        if !self.devices.iter().any(|d| d.ip == addr || d.ports.iter().any(|p| p.ip == addr)) {
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

    /// The provider drops private source addresses: traffic crossing a
    /// provider-link needs a masquerade (NAT) rule on the gateway beside it.
    pub(super) fn provider_blocked(&self, src: &str, dst: &str) -> Option<String> {
        let private = |ip: u32| {
            let a = (ip >> 24) & 255;
            let b = (ip >> 16) & 255;
            a == 10 || (a == 192 && b == 168) || (a == 172 && (16..=31).contains(&b))
        };
        let src_ip = self.devices.iter().find(|d| d.id == src).and_then(|d| d.ip)?;
        if !private(src_ip) {
            return None;
        }
        let path = self.path(src, dst)?;
        let kind = |id: &String| self.devices.iter().find(|d| &d.id == id).map(|d| d.kind.clone()).unwrap_or_default();
        let at = path.iter().position(|id| kind(id) == "provider-link")?;
        let gateway = path[..at].iter().rev().find(|id| crate::model::routes_packets(&kind(id)))?;
        if self.nat_rules.get(gateway.as_str()).is_some_and(|rules| !rules.is_empty()) {
            return None;
        }
        Some(format!(
            "blocked at {}: the provider drops private addresses; add the masquerade rule on {}",
            self.name_of(&path[at]), self.name_of(gateway)
        ))
    }
}
