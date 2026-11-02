use super::*;

impl Workspace {
    /// Enable port security on a switch port; `max` is the MAC limit.
    pub fn set_port_security(&mut self, device: &str, iface: &str, max: u16) -> Result<(), String> {
        let name = self.canonical_iface(device, iface)?;
        let table = self.port_security.entry(device.to_string()).or_default();
        if max == 0 {
            table.remove(&name);
        } else {
            let macs = table.get(&name).map(|p| p.macs.clone()).unwrap_or_default();
            table.insert(name, PortSecurity { max, macs });
        }
        Ok(())
    }

    /// Learn or reject a source MAC on a secured port.
    pub fn port_security_allowed(&mut self, device: &str, iface: &str, mac: &str) -> bool {
        let Some(table) = self.port_security.get_mut(device) else {
            return true;
        };
        let Some(policy) = table.get_mut(iface) else {
            return true;
        };
        if policy.macs.iter().any(|m| m == mac) {
            return true;
        }
        if policy.macs.len() < policy.max as usize {
            policy.macs.push(mac.to_string());
            return true;
        }
        false
    }

    pub fn port_security_rows(&self, device: &str) -> Vec<(String, u16, usize)> {
        let mut rows: Vec<_> = self
            .port_security
            .get(device)
            .map(|t| {
                t.iter()
                    .map(|(iface, p)| (iface.clone(), p.max, p.macs.len()))
                    .collect::<Vec<_>>()
            })
            .unwrap_or_default();
        rows.sort_by(|a, b| a.0.cmp(&b.0));
        rows
    }

    pub fn set_inspection(&mut self, device: &str, on: bool) -> Result<(), String> {
        if !self.devices.iter().any(|d| d.id == device) {
            return Err("no such device".into());
        }
        if on {
            self.inspect.insert(device.to_string(), true);
        } else {
            self.inspect.remove(device);
        }
        Ok(())
    }

    pub fn inspection_on(&self, device: &str) -> bool {
        self.inspect.get(device).copied().unwrap_or(false)
    }

    pub fn set_ips(&mut self, device: &str, proto: &str, on: bool) -> Result<(), String> {
        if !self.devices.iter().any(|d| d.id == device) {
            return Err("no such device".into());
        }
        let list = self.ips.entry(device.to_string()).or_default();
        let proto = proto.to_ascii_lowercase();
        list.retain(|p| p != &proto);
        if on {
            list.push(proto);
        }
        Ok(())
    }

    pub fn ips_drops(&self, device: &str, proto: &str) -> bool {
        self.ips
            .get(device)
            .map(|l| l.iter().any(|p| p == proto))
            .unwrap_or(false)
    }
}
