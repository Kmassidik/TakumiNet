//! Swap one device for another model in place.
//!
//! The id and name stay, so lessons, notes and checks keep pointing at it.
//! Cables follow the same port name when the new model has it, otherwise the
//! same position, and a port that no longer exists is reported as dropped.

use super::*;
use crate::workspace::palette;

#[derive(Clone, Debug, Default, PartialEq, Eq)]
pub struct ReplaceReport {
    pub kept: usize,
    pub dropped: Vec<String>,
    /// Configuration the swap removed, in plain words.
    pub cleared: Vec<String>,
}

fn family(kind: &str) -> Option<&'static str> {
    match kind {
        "hub" | "switch" | "switch-l3" => Some("switch"),
        "router" => Some("router"),
        "ap" | "homerouter" | "hotspot-ap" => Some("wireless"),
        "pc" | "laptop" | "server" => Some("host"),
        _ => None,
    }
}

fn moved_ports(old: &Device, new_ports: &[crate::workspace::PortCfg]) -> std::collections::HashMap<String, String> {
    let names: Vec<String> = new_ports.iter().map(|p| p.name.clone()).collect();
    let mut map = std::collections::HashMap::new();
    for (index, prev) in old.ports.iter().enumerate() {
        let shifted = if names.contains(&prev.name) { prev.name.clone() } else { names.get(index).cloned().unwrap_or_default() };
        if !shifted.is_empty() {
            map.insert(prev.name.clone(), shifted);
        }
    }
    map
}

fn migrate_tab_set(map: &mut std::collections::HashSet<String>, id: &str, moved: &std::collections::HashMap<String, String>, label: &str, cleared: &mut Vec<String>) {
    let prefix = format!("{id}\t");
    let taken: Vec<String> = map.iter().filter(|k| k.starts_with(&prefix)).cloned().collect();
    for key in taken {
        map.remove(&key);
        let port = &key[prefix.len()..];
        match moved.get(port) {
            Some(new_port) => { map.insert(format!("{id}\t{new_port}")); }
            None if !cleared.iter().any(|c| c == label) => cleared.push(label.to_string()),
            None => {}
        }
    }
}

fn migrate_tab_keys<T>(map: &mut std::collections::HashMap<String, T>, id: &str, moved: &std::collections::HashMap<String, String>, label: &str, cleared: &mut Vec<String>) {
    let prefix = format!("{id}\t");
    let keys: Vec<String> = map.keys().filter(|k| k.starts_with(&prefix)).cloned().collect();
    let taken: Vec<(String, T)> = keys.into_iter().filter_map(|k| map.remove(&k).map(|v| (k, v))).collect();
    for (key, value) in taken {
        let port = &key[prefix.len()..];
        match moved.get(port) {
            Some(new_port) => { map.insert(format!("{id}\t{new_port}"), value); }
            None if !cleared.iter().any(|c| c == label) => cleared.push(label.to_string()),
            None => {}
        }
    }
}

impl Workspace {
    /// Compatible palette labels for replacing `id`, for the context menu.
    pub fn replace_options(&self, id: &str) -> Vec<String> {
        let Some(old) = self.devices.iter().find(|d| d.id == id) else {
            return Vec::new();
        };
        let Some(want) = family(&old.kind) else {
            return Vec::new();
        };
        CATALOG
            .iter()
            .filter(|(_, _, kind)| family(kind) == Some(want) && *kind != old.kind)
            .map(|(label, _, _)| label.to_string())
            .collect()
    }

    /// Configuration that replacing `id` with `model` would remove. Empty when
    /// the swap only changes the model.
    pub fn replace_clears(&self, id: &str, model: &str) -> Vec<String> {
        let Some(old) = self.devices.iter().find(|d| d.id == id) else {
            return Vec::new();
        };
        let model = palette::canonical_model(model);
        let Some((_, _, kind)) = CATALOG.iter().find(|(label, _, _)| *label == model) else {
            return Vec::new();
        };
        if family(&old.kind) != family(kind) {
            return Vec::new();
        }
        let new_ports = palette::default_ports(kind);
        let moved = moved_ports(old, &new_ports);
        let key = |name: &str| name.starts_with(&format!("{id}\t"));
        let port_lost = |k: &str| moved.get(&k[format!("{id}\t").len()..]).is_none();
        let mut out = Vec::new();
        if self.link_settings.keys().any(|k| key(k) && port_lost(k)) {
            out.push("Interface speed and duplex settings".to_string());
        }
        if self.l2_guard.portfast.iter().any(|k| key(k) && port_lost(k))
            || self.l2_guard.bpduguard.iter().any(|k| key(k) && port_lost(k))
            || self.l2_guard.storm_level.keys().any(|k| key(k) && port_lost(k))
        {
            out.push("Layer-2 guard settings".to_string());
        }
        if self.snoop.trusted.iter().any(|k| key(k) && port_lost(k)) {
            out.push("DHCP snooping and ARP inspection".to_string());
        }
        if self.mirror.sessions.get(id).is_some_and(|sessions| {
            sessions.values().any(|s| s.source.as_ref().is_some_and(|(port, _)| moved.get(port).is_none()) || s.dest.as_ref().is_some_and(|port| moved.get(port).is_none()))
        }) {
            out.push("Port mirroring".to_string());
        }
        if self.fhrp.groups.iter().any(|g| g.device == id && moved.get(&g.port).is_none()) {
            out.push("VRRP groups".to_string());
        }
        out
    }

    pub fn replace(&mut self, id: &str, model: &str) -> Result<ReplaceReport, String> {
        let old = self
            .devices
            .iter()
            .find(|d| d.id == id)
            .cloned()
            .ok_or_else(|| "no such device".to_string())?;
        let model = palette::canonical_model(model);
        let (_, _, kind) = CATALOG
            .iter()
            .find(|(label, _, _)| *label == model)
            .ok_or_else(|| format!("unknown model '{model}'"))?;
        let old_family = family(&old.kind).ok_or_else(|| format!("{} cannot be replaced", old.name))?;
        if family(kind) != Some(old_family) {
            return Err(format!(
                "{} is a {}; choose another {}",
                old.name,
                old.kind,
                old_family
            ));
        }
        if *kind == old.kind && model == old.model {
            return Err("that is the same model".into());
        }

        let mut cleared = self.replace_clears(id, model);
        let mut replacement = old.clone();
        replacement.model = model.to_string();
        replacement.kind = kind.to_string();
        replacement.icon = palette::logical_icon(model, kind);
        let fresh = palette::default_ports(kind);
        let mut ports = Vec::with_capacity(fresh.len());
        for (index, mut port) in fresh.into_iter().enumerate() {
            if let Some(prev) = old.ports.iter().find(|p| p.name == port.name)
                .or_else(|| old.ports.get(index))
            {
                port.up = prev.up;
                port.ip = prev.ip;
                port.prefix = prev.prefix;
                port.bandwidth_kbps = prev.bandwidth_kbps;
                port.delay_us = prev.delay_us;
                port.vlan = prev.vlan;
                port.trunk = prev.trunk;
                port.dot1q = prev.dot1q;
            }
            ports.push(port);
        }
        replacement.ports = ports;
        if old_family != "host" {
            replacement.ip = None;
            replacement.gateway = None;
            replacement.dns = None;
        }
        *self.devices.iter_mut().find(|d| d.id == id).unwrap() = replacement;

        let mut report = ReplaceReport::default();
        let mut drop_links = Vec::new();
        let names: Vec<String> = self.devices.iter().find(|d| d.id == id).unwrap().ports.iter().map(|p| p.name.clone()).collect();
        for (index, link) in self.links.iter_mut().enumerate() {
            let (side, raw) = if link.a == id {
                (true, link.a_port.clone())
            } else if link.b == id {
                (false, link.b_port.clone())
            } else {
                continue;
            };
            let old_name = crate::cli::expand_iface(&raw, &old.ports.iter().map(|p| p.name.clone()).collect::<Vec<_>>())
                .unwrap_or(raw);
            let old_index = old.ports.iter().position(|p| p.name == old_name);
            let new_name = if names.iter().any(|n| *n == old_name) {
                Some(old_name.clone())
            } else {
                old_index.and_then(|i| names.get(i).cloned())
            };
            match new_name {
                Some(name) => {
                    if side { link.a_port = name; } else { link.b_port = name; }
                    report.kept += 1;
                }
                None => {
                    drop_links.push(index);
                    report.dropped.push(old_name);
                }
            }
        }
        for index in drop_links.into_iter().rev() {
            self.links.remove(index);
        }

        // Per-port configuration follows the cable: same name first, else the
        // same position. Only settings whose port disappeared are reported.
        let moved = moved_ports(&old, &self.devices.iter().find(|d| d.id == id).unwrap().ports);
        let mut lost: Vec<String> = Vec::new();
        migrate_tab_keys(&mut self.link_settings, id, &moved, "Interface speed and duplex settings", &mut lost);
        migrate_tab_set(&mut self.l2_guard.portfast, id, &moved, "Layer-2 guard settings", &mut lost);
        migrate_tab_set(&mut self.l2_guard.bpduguard, id, &moved, "Layer-2 guard settings", &mut lost);
        migrate_tab_keys(&mut self.l2_guard.errdisabled, id, &moved, "Layer-2 guard settings", &mut lost);
        migrate_tab_keys(&mut self.l2_guard.storm_level, id, &moved, "Layer-2 guard settings", &mut lost);
        migrate_tab_keys(&mut self.l2_guard.storm_seen, id, &moved, "Layer-2 guard settings", &mut lost);
        migrate_tab_keys(&mut self.l2_guard.storm_drops, id, &moved, "Layer-2 guard settings", &mut lost);
        migrate_tab_set(&mut self.snoop.trusted, id, &moved, "DHCP snooping and ARP inspection", &mut lost);
        if let Some(sessions) = self.mirror.sessions.get_mut(id) {
            for session in sessions.values_mut() {
                if let Some((port, dir)) = session.source.clone() {
                    match moved.get(&port) { Some(p) => session.source = Some((p.clone(), dir)), None => { session.source = None; if !lost.iter().any(|l| l == "Port mirroring") { lost.push("Port mirroring".into()); } } }
                }
                if let Some(port) = session.dest.clone() {
                    match moved.get(&port) { Some(p) => session.dest = Some(p.clone()), None => { session.dest = None; if !lost.iter().any(|l| l == "Port mirroring") { lost.push("Port mirroring".into()); } } }
                }
            }
        }
        for group in self.fhrp.groups.iter_mut().filter(|g| g.device == id) {
            if let Some(port) = moved.get(&group.port) { group.port = port.clone(); }
            else if !lost.iter().any(|l| l == "VRRP groups") { lost.push("VRRP groups".into()); }
        }
        if let Some(ports) = self.dot1x.ports.get_mut(id) {
            let taken: Vec<(String, _)> = ports.drain().collect();
            for (port, value) in taken {
                if let Some(new_port) = moved.get(&port) { ports.insert(new_port.clone(), value); }
                else if !lost.iter().any(|l| l == "802.1X port control") { lost.push("802.1X port control".into()); }
            }
        }
        if let Some(ports) = self.qos.ports.get_mut(id) {
            let taken: Vec<(String, _)> = ports.drain().collect();
            for (port, value) in taken {
                if let Some(new_port) = moved.get(&port) { ports.insert(new_port.clone(), value); }
                else if !lost.iter().any(|l| l == "QoS settings") { lost.push("QoS settings".into()); }
            }
        }
        if old_family != "wireless" {
            self.wifi_radios.remove(id);
        }
        if old_family != "host" {
            self.host_firewalls.remove(id);
        }
        for label in lost {
            if !cleared.iter().any(|c| *c == label) {
                cleared.push(label);
            }
        }
        report.cleared = cleared;
        self.recompute_routing();
        Ok(report)
    }
}
