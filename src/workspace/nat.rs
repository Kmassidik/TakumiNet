use super::*;

impl Workspace {
    pub fn set_nat_role(&mut self, device: &str, iface: &str, inside: bool) -> Result<(), String> {
        let name = self.canonical_iface(device, iface)?;
        self.nat_roles
            .entry(device.to_string())
            .or_default()
            .insert(name, inside);
        Ok(())
    }

    pub fn clear_nat_role(&mut self, device: &str, iface: &str) -> Result<(), String> {
        let name = self.canonical_iface(device, iface)?;
        if let Some(t) = self.nat_roles.get_mut(device) {
            t.remove(&name);
        }
        Ok(())
    }

    /// `ip nat inside source list N interface IFACE overload`.
    pub fn add_nat_rule(&mut self, device: &str, acl: u16, iface: &str) -> Result<(), String> {
        let name = self.canonical_iface(device, iface)?;
        if acl == 0 {
            return Err("invalid access-list".into());
        }
        let rules = self.nat_rules.entry(device.to_string()).or_default();
        if rules.iter().any(|r| r.acl == acl && r.iface == name) {
            return Err("rule already present".into());
        }
        rules.push(NatRule { acl, iface: name });
        Ok(())
    }

    pub fn clear_nat_rules(&mut self, device: &str) {
        self.nat_rules.remove(device);
        self.nat_translations.remove(device);
    }

    /// Translate an inside source leaving an outside interface. Returns the new
    /// source address and records the binding.
    pub fn nat_translate(
        &mut self,
        device: &str,
        ingress: &str,
        egress: &str,
        src: u32,
        dst: u32,
    ) -> Option<u32> {
        let roles = self.nat_roles.get(device)?;
        if roles.get(ingress) != Some(&true) || roles.get(egress) != Some(&false) {
            return None;
        }
        let matching = self
            .nat_rules
            .get(device)?
            .iter()
            .find(|r| r.iface == egress && self.list_allows(device, r.acl, src, dst))?
            .clone();
        let _ = matching.acl;
        let global = self.devices.iter().find(|d| d.id == device).and_then(|d| {
            d.ports
                .iter()
                .find(|p| p.name == egress)
                .and_then(|p| p.ip)
                .or(d.ip)
        })?;
        let list = self.nat_translations.entry(device.to_string()).or_default();
        list.retain(|(local, _)| *local != src);
        list.push((src, global));
        Some(global)
    }

    pub fn nat_binding_lines(&self, device: &str) -> Vec<String> {
        let mut rows: Vec<_> = self.nat_rules.get(device).cloned().unwrap_or_default();
        rows.sort_by_key(|r| r.acl);
        rows.into_iter()
            .map(|r| format!("inside source list {} interface {} overload", r.acl, r.iface))
            .collect()
    }

    pub fn nat_translation_lines(&self, device: &str) -> Vec<String> {
        self.nat_translations
            .get(device)
            .map(|l| {
                l.iter()
                    .map(|(local, global)| {
                        format!(
                            "{} -> {}",
                            crate::model::ipv4_string(*local),
                            crate::model::ipv4_string(*global)
                        )
                    })
                    .collect()
            })
            .unwrap_or_default()
    }

    /// Which side of an ASA an interface is on, if NAT roles are configured.
    pub fn nat_role(&self, device: &str, iface: &str) -> Option<bool> {
        self.nat_roles
            .get(device)
            .and_then(|t| t.get(iface))
            .copied()
    }
}
