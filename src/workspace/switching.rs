use super::*;
use crate::net::packet::Mac;
use std::collections::{BTreeSet, HashMap, VecDeque};

#[derive(Clone, Copy, Debug, PartialEq, Eq, PartialOrd, Ord)]
pub(super) struct BridgeId {
    // Extended system id: configured priority plus the VLAN number.
    pub(super) priority: u32,
    pub(super) mac: Mac,
}

#[derive(Clone, Debug)]
pub(super) struct LogicalEdge {
    a: String,
    b: String,
    a_ports: Vec<String>,
    b_ports: Vec<String>,
    cost: u32,
    a_port_id: u16,
    b_port_id: u16,
}

#[derive(Default)]
pub(super) struct StpTopology {
    pub(super) roots: HashMap<String, BridgeId>,
    pub(super) root_ports: Vec<(String, String)>,
    pub(super) blocked: Vec<(String, String)>,
    pub(super) edges: Vec<LogicalEdge>,
}

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

    /// Create a router-on-a-stick subinterface such as GigabitEthernet0/0.10.
    pub fn ensure_subinterface(&mut self, device: &str, raw: &str) -> Result<String, String> {
        let Some((parent_raw, vlan_raw)) = raw.trim().rsplit_once('.') else {
            return Err(format!("no such interface: {raw}"));
        };
        if vlan_raw.contains('.') || parent_raw.contains('.') {
            return Err(format!("invalid subinterface: {raw}"));
        }
        let vlan = vlan_raw
            .parse::<u16>()
            .ok()
            .filter(|v| (1..=4094).contains(v))
            .ok_or_else(|| format!("invalid subinterface VLAN: {vlan_raw}"))?;
        let parent = self.canonical_iface(device, parent_raw)?;
        let dev = self
            .devices
            .iter_mut()
            .find(|d| d.id == device)
            .ok_or_else(|| "no such device".to_string())?;
        if !matches!(dev.kind.as_str(), "router" | "asa" | "switch-l3") {
            return Err("subinterfaces are only available on routers".into());
        }
        let name = format!("{parent}.{vlan}");
        if !dev.ports.iter().any(|p| p.name == name) {
            let (bandwidth_kbps, delay_us) = default_port_metrics(&name);
            dev.ports.push(PortCfg {
                name: name.clone(),
                ip: None,
                prefix: 24,
                up: true,
                bandwidth_kbps,
                delay_us,
                vlan: 1,
                trunk: false,
                dot1q: Some(vlan),
            });
        }
        Ok(name)
    }

    pub fn set_port_dot1q(&mut self, device: &str, iface: &str, vlan: u16) -> Result<(), String> {
        if !(1..=4094).contains(&vlan) {
            return Err("VLAN id must be 1-4094".into());
        }
        let dev = self
            .devices
            .iter_mut()
            .find(|d| d.id == device)
            .ok_or_else(|| "no such device".to_string())?;
        let port = dev
            .ports
            .iter_mut()
            .find(|p| p.name == iface && p.name.contains('.'))
            .ok_or_else(|| format!("{iface} is not a subinterface"))?;
        port.dot1q = Some(vlan);
        Ok(())
    }

    pub fn set_channel_group(&mut self, device: &str, iface: &str, group: u16) -> Result<(), String> {
        self.set_channel_group_mode(device, iface, group, "on")
    }

    pub fn set_channel_group_mode(
        &mut self,
        device: &str,
        iface: &str,
        group: u16,
        mode: &str,
    ) -> Result<(), String> {
        let name = self.canonical_iface(device, iface)?;
        if group == 0 || group > 48 {
            return Err("channel-group must be 1-48".into());
        }
        if !matches!(mode, "on" | "active" | "passive" | "auto" | "desirable") {
            return Err(format!("invalid channel-group mode: {mode}"));
        }
        self.channels
            .entry(device.to_string())
            .or_default()
            .insert(name.clone(), group);
        self.channel_modes
            .entry(device.to_string())
            .or_default()
            .insert(name, mode.to_string());
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

    pub fn channel_mode(&self, device: &str, iface: &str) -> &str {
        self.channel_modes
            .get(device)
            .and_then(|m| m.get(iface))
            .map(String::as_str)
            .unwrap_or("on")
    }

    fn channel_compatible(&self, a: &str, a_port: &str, b: &str, b_port: &str) -> bool {
        let a_mode = self.channel_mode(a, a_port);
        let b_mode = self.channel_mode(b, b_port);
        matches!((a_mode, b_mode), ("on", "on") | ("active", "active") | ("active", "passive") | ("passive", "active") | ("auto", "desirable") | ("desirable", "auto") | ("desirable", "desirable"))
    }

    fn channel_at(&self, device: &str, port: &str) -> Option<u16> {
        self.channels.get(device)?.get(port).copied()
    }

    /// A member is bundled only when its cable is up and its peer negotiates a
    /// compatible EtherChannel mode in the same group.
    pub fn channel_member_active(&self, device: &str, port: &str) -> bool {
        let Some(group) = self.channel_at(device, port) else {
            return false;
        };
        self.links.iter().any(|l| {
            if !l.carries_data() {
                return false;
            }
            let (peer, peer_port) = if l.a == device && self.port_full_name_id(device, &l.a_port) == port {
                (&l.b, self.port_full_name_id(&l.b, &l.b_port))
            } else if l.b == device && self.port_full_name_id(device, &l.b_port) == port {
                (&l.a, self.port_full_name_id(&l.a, &l.a_port))
            } else {
                return false;
            };
            self.port_state(device, port).line_up
                && self.channel_at(peer, &peer_port) == Some(group)
                && self.channel_compatible(device, port, peer, &peer_port)
        })
    }

    pub fn channel_group_active(&self, device: &str, group: u16) -> bool {
        self.channels
            .get(device)
            .map(|ports| {
                ports
                    .iter()
                    .any(|(port, g)| *g == group && self.channel_member_active(device, port))
            })
            .unwrap_or(false)
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

    fn port_full_name_id(&self, id: &str, raw: &str) -> String {
        self.devices
            .iter()
            .find(|d| d.id == id)
            .map(|d| self.port_full_name(d, raw))
            .unwrap_or_else(|| raw.to_string())
    }

    pub(super) fn port_full_name(&self, dev: &Device, raw: &str) -> String {
        let names: Vec<String> = dev.ports.iter().map(|p| p.name.clone()).collect();
        crate::cli::expand_iface(raw, &names).unwrap_or_else(|| raw.to_string())
    }

    pub(super) fn bridge_id(&self, id: &str, vlan: u16) -> BridgeId {
        BridgeId {
            priority: self.stp_priority(id, vlan) as u32 + vlan as u32,
            mac: Mac::for_device(id),
        }
    }

    fn logical_edges(&self) -> Vec<LogicalEdge> {
        let mut edges = Vec::new();
        let mut used = vec![false; self.links.len()];
        for (idx, link) in self.links.iter().enumerate() {
            if used[idx] || !link.carries_data() {
                continue;
            }
            if self.kind_of(&link.a) != "switch" || self.kind_of(&link.b) != "switch" {
                continue;
            }
            let a_port = self.port_full_name_id(&link.a, &link.a_port);
            let b_port = self.port_full_name_id(&link.b, &link.b_port);
            if !self.port_state(&link.a, &a_port).line_up
                || !self.port_state(&link.b, &b_port).line_up
            {
                continue;
            }
            used[idx] = true;
            let a_group = self.channel_at(&link.a, &a_port);
            let b_group = self.channel_at(&link.b, &b_port);
            let bundled = a_group.is_some()
                && a_group == b_group
                && self.channel_compatible(&link.a, &a_port, &link.b, &b_port);
            let mut members = vec![idx];
            if bundled {
                for (other_idx, other) in self.links.iter().enumerate().skip(idx + 1) {
                    if used[other_idx] || !other.carries_data() {
                        continue;
                    }
                    let oa = self.port_full_name_id(&other.a, &other.a_port);
                    let ob = self.port_full_name_id(&other.b, &other.b_port);
                    let same_pair = (other.a == link.a && other.b == link.b)
                        || (other.a == link.b && other.b == link.a);
                    if !same_pair
                        || !self.port_state(&other.a, &oa).line_up
                        || !self.port_state(&other.b, &ob).line_up
                    {
                        continue;
                    }
                    let groups_match = if other.a == link.a {
                        self.channel_at(&other.a, &oa) == a_group
                            && self.channel_at(&other.b, &ob) == b_group
                    } else {
                        self.channel_at(&other.a, &oa) == b_group
                            && self.channel_at(&other.b, &ob) == a_group
                    };
                    let compatible = self.channel_compatible(&other.a, &oa, &other.b, &ob);
                    if groups_match && compatible {
                        used[other_idx] = true;
                        members.push(other_idx);
                    }
                }
            }
            let mut a_ports = Vec::new();
            let mut b_ports = Vec::new();
            let mut base_cost = u32::MAX;
            for member in &members {
                let l = &self.links[*member];
                let (ap, bp) = if l.a == link.a {
                    (
                        self.port_full_name_id(&l.a, &l.a_port),
                        self.port_full_name_id(&l.b, &l.b_port),
                    )
                } else {
                    (
                        self.port_full_name_id(&l.b, &l.b_port),
                        self.port_full_name_id(&l.a, &l.a_port),
                    )
                };
                base_cost = base_cost.min(if ap.starts_with("Gigabit") { 4 } else { 19 });
                a_ports.push(ap);
                b_ports.push(bp);
            }
            a_ports.sort();
            b_ports.sort();
            let port_number = |port: &str| {
                port.rsplit(['/', '.'])
                    .next()
                    .and_then(|n| n.parse::<u16>().ok())
                    .unwrap_or(1)
                    .min(255)
            };
            let a_port_id = (128 << 8) | a_group.unwrap_or_else(|| port_number(&a_ports[0]));
            let b_port_id = (128 << 8) | b_group.unwrap_or_else(|| port_number(&b_ports[0]));
            edges.push(LogicalEdge {
                a: link.a.clone(),
                b: link.b.clone(),
                a_ports,
                b_ports,
                cost: (base_cost / members.len() as u32).max(1),
                a_port_id,
                b_port_id,
            });
        }
        edges
    }

    pub(super) fn stp_topology(&self) -> StpTopology {
        let mut result = StpTopology {
            edges: self.logical_edges(),
            ..Default::default()
        };
        let mut remaining: BTreeSet<String> = self
            .devices
            .iter()
            .filter(|d| d.kind == "switch")
            .map(|d| d.id.clone())
            .collect();
        while let Some(first) = remaining.pop_first() {
            let mut component = vec![first.clone()];
            let mut queue = VecDeque::from([first]);
            while let Some(cur) = queue.pop_front() {
                for edge in &result.edges {
                    let peer = if edge.a == cur {
                        Some(&edge.b)
                    } else if edge.b == cur {
                        Some(&edge.a)
                    } else {
                        None
                    };
                    if let Some(peer) = peer {
                        if remaining.remove(peer) {
                            component.push(peer.clone());
                            queue.push_back(peer.clone());
                        }
                    }
                }
            }
            let root = component
                .iter()
                .min_by_key(|id| self.bridge_id(id, 1))
                .expect("nonempty component")
                .clone();
            let root_id = self.bridge_id(&root, 1);
            for id in &component {
                result.roots.insert(id.clone(), root_id);
            }

            // Dijkstra computes each switch's root path cost over logical
            // (EtherChannel-collapsed) links. Bridge id only breaks equal-cost
            // relaxation choices; it is never a substitute for the cost.
            let mut dist: HashMap<String, u32> = HashMap::new();
            let mut settled = BTreeSet::new();
            dist.insert(root.clone(), 0);
            while let Some(cur) = component
                .iter()
                .filter(|id| dist.contains_key(*id) && !settled.contains(*id))
                .min_by_key(|id| (dist[*id], self.bridge_id(id, 1)))
                .cloned()
            {
                settled.insert(cur.clone());
                let cur_dist = dist[&cur];
                for edge in &result.edges {
                    let peer = if edge.a == cur {
                        Some(&edge.b)
                    } else if edge.b == cur {
                        Some(&edge.a)
                    } else {
                        None
                    };
                    if let Some(peer) = peer {
                        let candidate = cur_dist.saturating_add(edge.cost);
                        if dist.get(peer).map(|old| candidate < *old).unwrap_or(true) {
                            dist.insert(peer.clone(), candidate);
                        }
                    }
                }
            }

            // Each non-root switch selects its root port using IEEE's ordered
            // root cost, sender bridge id, sender port id, local port id tuple.
            for id in component.iter().filter(|id| **id != root) {
                let mut best: Option<((u32, BridgeId, u16, u16), usize, bool)> = None;
                for (edge_idx, edge) in result.edges.iter().enumerate() {
                    let (peer, peer_port, local_port, local_first) = if edge.a == *id {
                        (&edge.b, edge.b_port_id, edge.a_port_id, true)
                    } else if edge.b == *id {
                        (&edge.a, edge.a_port_id, edge.b_port_id, false)
                    } else {
                        continue;
                    };
                    let key = (
                        dist[peer].saturating_add(edge.cost),
                        self.bridge_id(peer, 1),
                        peer_port,
                        local_port,
                    );
                    if best.as_ref().map(|(old, _, _)| key < *old).unwrap_or(true) {
                        best = Some((key, edge_idx, local_first));
                    }
                }
                if let Some((_, edge_idx, local_first)) = best {
                    let edge = &result.edges[edge_idx];
                    let ports = if local_first { &edge.a_ports } else { &edge.b_ports };
                    for port in ports {
                        result.root_ports.push((id.clone(), port.clone()));
                    }
                }
            }

            // One designated side forwards on every logical segment. The other
            // side alone blocks; blocking both ends would partition the LAN.
            for edge in &result.edges {
                let left = (dist[&edge.a], self.bridge_id(&edge.a, 1), edge.a_port_id);
                let right = (dist[&edge.b], self.bridge_id(&edge.b, 1), edge.b_port_id);
                let losers = if left <= right { &edge.b_ports } else { &edge.a_ports };
                let loser_id = if left <= right { &edge.b } else { &edge.a };
                for port in losers {
                    if !result
                        .root_ports
                        .iter()
                        .any(|(id, root_port)| id == loser_id && root_port == port)
                    {
                        result.blocked.push((loser_id.clone(), port.clone()));
                    }
                }
            }
        }
        result.blocked.sort();
        result.root_ports.sort();
        result
    }


    pub fn set_stp_mode(&mut self, device: &str, mode: &str) -> Result<(), String> {
        if !self.devices.iter().any(|d| d.id == device && d.kind == "switch") {
            return Err("spanning-tree mode is only available on switches".into());
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

    pub fn set_stp_priority(&mut self, device: &str, vlan: u16, priority: u16) -> Result<(), String> {
        if !self.devices.iter().any(|d| d.id == device && d.kind == "switch") {
            return Err("spanning-tree priority is only available on switches".into());
        }
        if !(1..=4094).contains(&vlan) {
            return Err("VLAN id must be 1-4094".into());
        }
        if priority > 61_440 || priority % 4096 != 0 {
            return Err("priority must be 0-61440 in increments of 4096".into());
        }
        self.stp_priorities
            .entry(device.to_string())
            .or_default()
            .insert(vlan, priority);
        Ok(())
    }

    pub fn stp_priority(&self, device: &str, vlan: u16) -> u16 {
        self.stp_priorities
            .get(device)
            .and_then(|p| p.get(&vlan))
            .copied()
            .unwrap_or(32_768)
    }

    pub fn switching_config(&self, id: &str) -> SwitchingConfig {
        SwitchingConfig {
            vlans: self.vlans.get(id).cloned().unwrap_or_default(),
            channels: self.channels.get(id).cloned().unwrap_or_default(),
            channel_modes: self.channel_modes.get(id).cloned().unwrap_or_default(),
            stp_mode: self.stp_modes.get(id).cloned(),
            stp_priorities: self.stp_priorities.get(id).cloned().unwrap_or_default(),
        }
    }
}
