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

    fn dns_answer(&self, client: &str, name: &str) -> Option<(String, u32, Option<u32>)> {
        let name = name.trim().to_ascii_lowercase();
        if name.is_empty() {
            return None;
        }
        let server_ip = self.devices.iter().find(|d| d.id == client)?.dns?;
        let server = self.devices.iter().find(|d| {
            d.ip == Some(server_ip) || d.ports.iter().any(|p| p.ip == Some(server_ip))
        })?;
        let answer = self
            .dns_records
            .get(&server.id)
            .and_then(|records| records.iter().find(|(record, _)| *record == name))
            .map(|(_, ip)| *ip);
        Some((server.id.clone(), server_ip, answer))
    }

    /// Resolve `name` through the DNS server configured on the client.
    pub fn resolve_name(&self, client: &str, name: &str) -> Option<u32> {
        self.dns_answer(client, name)?.2
    }

    /// Resolve and record the service-plane query/response for inspection.
    pub fn resolve_name_captured(&mut self, client: &str, name: &str) -> Option<u32> {
        let query = name.trim().to_ascii_lowercase();
        let (server, server_ip, answer) = self.dns_answer(client, &query)?;
        let path = self
            .path(client, &server)
            .unwrap_or_else(|| vec![client.to_string(), server.clone()]);
        self.next_event += 1;
        self.sim_time += 0.001;
        self.push_event(Event {
            id: self.next_event,
            time: self.sim_time,
            last: self.name_of(client),
            at: self.name_of(&server),
            kind: "DNS".into(),
            proto: "DNS".into(),
            path,
            hops: Vec::new(),
            layers: vec![Layer::new(
                "DNS",
                vec![
                    ("Capture".into(), "Control-plane service exchange".into()),
                    ("Query".into(), format!("{query} A")),
                    ("Server".into(), crate::model::ipv4_string(server_ip)),
                    (
                        "Response".into(),
                        answer.map_or_else(|| "No A record".into(), crate::model::ipv4_string),
                    ),
                ],
            )],
            status: "Successful".into(),
            reason: None,
            note: format!("{} asks {} to resolve {}", self.name_of(client), self.name_of(&server), query),
            bytes: Vec::new(),
            size: 80,
        });
        answer
    }
}
