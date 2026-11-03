use super::*;

impl Workspace {
    /// Add or replace a DNS A record on a server.
    pub fn set_dns_record(&mut self, id: &str, name: &str, ip: &str) -> Result<(), String> {
        if !self.devices.iter().any(|d| d.id == id) {
            return Err("no such device".into());
        }
        let name = name.trim().to_ascii_lowercase();
        if name.is_empty() || name.chars().any(|c| c.is_whitespace()) {
            return Err("invalid record name".into());
        }
        let addr = crate::model::parse_ipv4(ip.trim())
            .ok_or_else(|| format!("invalid address: {ip}"))?;
        let list = self.dns_records.entry(id.to_string()).or_default();
        match list.iter_mut().find(|(n, _)| *n == name) {
            Some(entry) => entry.1 = addr,
            None => list.push((name, addr)),
        }
        list.sort_by(|a, b| a.0.cmp(&b.0));
        Ok(())
    }

    pub fn remove_dns_record(&mut self, id: &str, name: &str) -> bool {
        let name = name.trim().to_ascii_lowercase();
        match self.dns_records.get_mut(id) {
            Some(list) => {
                let before = list.len();
                list.retain(|(n, _)| *n != name);
                list.len() != before
            }
            None => false,
        }
    }

    /// Resolve `name` through the DNS server configured on the client.
    pub fn resolve_name(&self, client: &str, name: &str) -> Option<u32> {
        let name = name.trim().to_ascii_lowercase();
        if name.is_empty() {
            return None;
        }
        let server_ip = self.devices.iter().find(|d| d.id == client)?.dns?;
        let server = self.devices.iter().find(|d| {
            d.ip == Some(server_ip) || d.ports.iter().any(|p| p.ip == Some(server_ip))
        })?;
        self.dns_records
            .get(&server.id)?
            .iter()
            .find(|(record, _)| *record == name)
            .map(|(_, ip)| *ip)
    }
}
