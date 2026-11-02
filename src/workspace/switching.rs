use super::*;

impl Workspace {
    pub(super) fn canonical_iface(&self, device: &str, raw: &str) -> Result<String, String> {
        let d = self
            .devices
            .iter()
            .find(|d| d.id == device)
            .ok_or_else(|| "no such device".to_string())?;
        let names: Vec<String> = d.ports.iter().map(|p| p.name.clone()).collect();
        crate::cli::expand_iface(raw, &names)
            .ok_or_else(|| format!("no such interface: {raw}"))
    }

    pub fn set_channel_group(
        &mut self,
        device: &str,
        iface: &str,
        group: u16,
    ) -> Result<(), String> {
        let name = self.canonical_iface(device, iface)?;
        if group == 0 || group > 48 {
            return Err("channel-group must be 1-48".into());
        }
        self.channels
            .entry(device.to_string())
            .or_default()
            .insert(name, group);
        Ok(())
    }

    pub fn channel_groups(&self, device: &str) -> Vec<(u16, Vec<String>)> {
        let mut groups: std::collections::BTreeMap<u16, Vec<String>> = Default::default();
        if let Some(m) = self.channels.get(device) {
            for (iface, g) in m {
                groups.entry(*g).or_default().push(iface.clone());
            }
        }
        groups
            .into_iter()
            .map(|(g, mut ports)| {
                ports.sort();
                (g, ports)
            })
            .collect()
    }

    /// Create (or rename) a VLAN on a switch.
    pub fn vlan_create(&mut self, id: &str, vlan: u16, name: &str) -> Result<(), String> {
        if !self.devices.iter().any(|d| d.id == id) {
            return Err("no such device".into());
        }
        if vlan == 0 || vlan > 4094 {
            return Err("VLAN id must be 1-4094".into());
        }
        if vlan == 1 {
            return Ok(());
        }
        let name = if name.trim().is_empty() {
            format!("VLAN{vlan:04}")
        } else {
            name.trim().to_string()
        };
        let list = self.vlans.entry(id.to_string()).or_default();
        match list.iter_mut().find(|(v, _)| *v == vlan) {
            Some(entry) => entry.1 = name,
            None => list.push((vlan, name)),
        }
        list.sort_by_key(|(v, _)| *v);
        Ok(())
    }

    pub fn vlan_delete(&mut self, id: &str, vlan: u16) -> Result<(), String> {
        if vlan == 1 {
            return Err("default VLAN cannot be deleted".into());
        }
        let in_use = self
            .devices
            .iter()
            .find(|d| d.id == id)
            .map(|d| d.ports.iter().any(|p| !p.trunk && p.vlan == vlan))
            .unwrap_or(false);
        if in_use {
            return Err(format!("VLAN {vlan} is in use by an access port"));
        }
        match self.vlans.get_mut(id) {
            Some(list) => {
                let before = list.len();
                list.retain(|(v, _)| *v != vlan);
                if list.len() == before {
                    return Err(format!("VLAN {vlan} does not exist"));
                }
                Ok(())
            }
            None => Err(format!("VLAN {vlan} does not exist")),
        }
    }

    pub fn vlan_exists(&self, id: &str, vlan: u16) -> bool {
        vlan == 1
            || self
                .vlans
                .get(id)
                .map(|l| l.iter().any(|(v, _)| *v == vlan))
                .unwrap_or(false)
    }

    pub fn vlan_name(&self, id: &str, vlan: u16) -> String {
        if vlan == 1 {
            return "default".into();
        }
        self.vlans
            .get(id)
            .and_then(|l| l.iter().find(|(v, _)| *v == vlan))
            .map(|(_, n)| n.clone())
            .unwrap_or_else(|| format!("VLAN{vlan:04}"))
    }

    pub fn set_access_vlan(&mut self, id: &str, iface: &str, vlan: u16) -> Result<(), String> {
        if !self.vlan_exists(id, vlan) {
            return Err(format!("VLAN {vlan} does not exist"));
        }
        let dev = self
            .devices
            .iter_mut()
            .find(|d| d.id == id)
            .ok_or_else(|| "no such device".to_string())?;
        let port = dev
            .ports
            .iter_mut()
            .find(|p| p.name == iface)
            .ok_or_else(|| format!("invalid interface: {iface}"))?;
        if port.trunk {
            return Err(format!("{iface} is a trunk port"));
        }
        port.vlan = vlan;
        Ok(())
    }

    pub fn set_trunk(&mut self, id: &str, iface: &str, trunk: bool) -> Result<(), String> {
        let dev = self
            .devices
            .iter_mut()
            .find(|d| d.id == id)
            .ok_or_else(|| "no such device".to_string())?;
        let port = dev
            .ports
            .iter_mut()
            .find(|p| p.name == iface)
            .ok_or_else(|| format!("invalid interface: {iface}"))?;
        port.trunk = trunk;
        Ok(())
    }

    /// Ports the spanning tree blocks, as (device id, full port name).
    pub fn stp_blocked_ports(&self) -> Vec<(String, String)> {
        use std::collections::VecDeque;
        let mut switches: Vec<&Device> = self.devices.iter().filter(|d| d.kind == "switch").collect();
        switches.sort_by(|a, b| a.id.cmp(&b.id));
        if switches.len() < 2 {
            return Vec::new();
        }
        let root = switches[0].id.clone();
        let mut tree: Vec<(String, String)> = Vec::new();
        let mut seen = vec![root.clone()];
        let mut q: VecDeque<String> = VecDeque::new();
        q.push_back(root.clone());
        while let Some(cur) = q.pop_front() {
            for l in &self.links {
                if !l.carries_data() {
                    continue;
                }
                let (mine, other, other_port) = if l.a == cur {
                    (&l.a_port, &l.b, &l.b_port)
                } else if l.b == cur {
                    (&l.b_port, &l.a, &l.a_port)
                } else {
                    continue;
                };
                let Some(other_dev) = self.devices.iter().find(|d| d.id == *other) else {
                    continue;
                };
                if other_dev.kind != "switch" || seen.iter().any(|s| *s == *other) {
                    continue;
                }
                tree.push((cur.clone(), mine.clone()));
                tree.push((other.clone(), other_port.clone()));
                seen.push(other.clone());
                q.push_back(other.clone());
            }
        }

        let mut blocked = Vec::new();
        for sw in &switches {
            for l in &self.links {
                if !l.carries_data() {
                    continue;
                }
                let port = if l.a == sw.id {
                    Some(&l.a_port)
                } else if l.b == sw.id {
                    Some(&l.b_port)
                } else {
                    None
                };
                let Some(port) = port else { continue };
                let peer_is_switch = if l.a == sw.id {
                    self.devices.iter().any(|d| d.id == l.b && d.kind == "switch")
                } else {
                    self.devices.iter().any(|d| d.id == l.a && d.kind == "switch")
                };
                if !peer_is_switch {
                    continue;
                }
                let full = self.port_full_name(sw, port);
                let in_tree = tree
                    .iter()
                    .any(|(d, p)| *d == sw.id && self.port_full_name(sw, p) == full);
                if !in_tree {
                    blocked.push((sw.id.clone(), full));
                }
            }
        }
        blocked
    }

    pub(super) fn port_full_name(&self, dev: &Device, raw: &str) -> String {
        let names: Vec<String> = dev.ports.iter().map(|p| p.name.clone()).collect();
        crate::cli::expand_iface(raw, &names).unwrap_or_else(|| raw.to_string())
    }

    pub fn set_stp_mode(&mut self, device: &str, mode: &str) -> Result<(), String> {
        if !self.devices.iter().any(|d| d.id == device) {
            return Err("no such device".into());
        }
        if !matches!(mode, "pvst" | "rapid-pvst") {
            return Err(format!("invalid mode: {mode}"));
        }
        self.stp_modes.insert(device.to_string(), mode.to_string());
        Ok(())
    }

    pub fn stp_mode(&self, device: &str) -> &str {
        self.stp_modes.get(device).map(String::as_str).unwrap_or("pvst")
    }
}
