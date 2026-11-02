use super::*;

impl Workspace {
    pub fn acl_add(
        &mut self,
        device: &str,
        number: u16,
        permit: bool,
        src: u32,
        src_wc: u32,
        dst: Option<(u32, u32)>,
    ) -> Result<(), String> {
        if !self.devices.iter().any(|d| d.id == device) {
            return Err("no such device".into());
        }
        if number == 0 {
            return Err("invalid access list number".into());
        }
        if number < 100 && dst.is_some() {
            return Err("standard access lists match the source only".into());
        }
        if number >= 100 && dst.is_none() {
            return Err("extended access lists need a destination".into());
        }
        self.acls
            .entry(device.to_string())
            .or_default()
            .entry(number)
            .or_default()
            .push(AclRule {
                permit,
                src,
                src_wc,
                dst,
            });
        Ok(())
    }

    pub(super) fn list_allows(&self, device: &str, number: u16, src: u32, dst: u32) -> bool {
        let Some(rules) = self.acls.get(device).and_then(|m| m.get(&number)) else {
            return true;
        };
        for rule in rules {
            if (rule.src & !rule.src_wc) != (src & !rule.src_wc) {
                continue;
            }
            if let Some((dip, dwc)) = rule.dst {
                if (dip & !dwc) != (dst & !dwc) {
                    continue;
                }
            }
            return rule.permit;
        }
        false
    }

    pub fn acl_bind(
        &mut self,
        device: &str,
        iface: &str,
        number: u16,
        inbound: bool,
    ) -> Result<(), String> {
        let name = self.canonical_iface(device, iface)?;
        self.acl_bindings
            .entry(device.to_string())
            .or_default()
            .insert(name, (number, inbound));
        Ok(())
    }

    pub fn acl_unbind(&mut self, device: &str, iface: &str) -> Result<(), String> {
        let name = self.canonical_iface(device, iface)?;
        if let Some(table) = self.acl_bindings.get_mut(device) {
            table.remove(&name);
        }
        Ok(())
    }

    /// Evaluate the bound list on one interface direction. No binding, or a
    /// binding to an undefined list, permits the packet.
    pub fn acl_allows(&self, device: &str, iface: &str, inbound: bool, src: u32, dst: u32) -> bool {
        let Some(table) = self.acl_bindings.get(device) else {
            return true;
        };
        let Some((number, bound_in)) = table.get(iface) else {
            return true;
        };
        if *bound_in != inbound {
            return true;
        }
        self.list_allows(device, *number, src, dst)
    }

    /// Rendered ACEs: `number permit|deny src wc [dst wc]`.
    pub fn acl_lines(&self, device: &str) -> Vec<String> {
        let mut out = Vec::new();
        if let Some(lists) = self.acls.get(device) {
            let mut nums: Vec<_> = lists.keys().copied().collect();
            nums.sort();
            for n in nums {
                for rule in &lists[&n] {
                    let action = if rule.permit { "permit" } else { "deny" };
                    let src = crate::model::ipv4_string(rule.src);
                    let mut line = format!("{n} {action} {src} {}", crate::model::ipv4_string(rule.src_wc));
                    if let Some((d, wc)) = rule.dst {
                        line.push_str(&format!(
                            " {} {}",
                            crate::model::ipv4_string(d),
                            crate::model::ipv4_string(wc)
                        ));
                    }
                    out.push(line);
                }
            }
        }
        out
    }

    pub fn acl_binding_lines(&self, device: &str) -> Vec<String> {
        let mut out = Vec::new();
        if let Some(table) = self.acl_bindings.get(device) {
            let mut rows: Vec<_> = table.iter().collect();
            rows.sort_by_key(|(iface, _)| iface.as_str());
            for (iface, (number, inbound)) in rows {
                out.push(format!(
                    "{iface} {number} {}",
                    if *inbound { "in" } else { "out" }
                ));
            }
        }
        out
    }
}
