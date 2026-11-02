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

    /// Resolve `name` through a DNS server on the client's L2 segment.
    pub fn resolve_name(&self, client: &str, name: &str) -> Option<u32> {
        use std::collections::VecDeque;
        let name = name.trim().to_ascii_lowercase();
        if name.is_empty() {
            return None;
        }
        let mut seen = vec![client.to_string()];
        let mut q: VecDeque<String> = VecDeque::new();
        q.push_back(client.to_string());
        while let Some(cur) = q.pop_front() {
            for l in &self.links {
                if !l.carries_data() {
                    continue;
                }
                let next = if l.a == cur {
                    &l.b
                } else if l.b == cur {
                    &l.a
                } else {
                    continue;
                };
                if seen.iter().any(|s| s == next) {
                    continue;
                }
                let Some(dev) = self.devices.iter().find(|d| d.id == *next) else {
                    continue;
                };
                if dev.kind == "router" {
                    continue;
                }
                if let Some(list) = self.dns_records.get(&dev.id) {
                    if let Some((_, ip)) = list.iter().find(|(n, _)| *n == name) {
                        return Some(*ip);
                    }
                }
                seen.push(dev.id.clone());
                q.push_back(dev.id.clone());
            }
        }
        None
    }
}
