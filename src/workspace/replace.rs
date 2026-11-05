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
        replacement.dot1x = false;
        replacement.dot1x_user = None;
        replacement.dot1x_pass = None;
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

        // Configuration that no longer applies goes away, not half-valid.
        if old_family != "router" {
            self.routing.remove(id);
            self.bgp.remove(id);
        }
        if old_family != "switch" {
            self.link_settings.retain(|key, _| !key.starts_with(&format!("{id}\t")));
            self.l2_guard.portfast.retain(|k| !k.starts_with(&format!("{id}\t")));
            self.l2_guard.bpduguard.retain(|k| !k.starts_with(&format!("{id}\t")));
            self.l2_guard.errdisabled.retain(|k, _| !k.starts_with(&format!("{id}\t")));
            self.l2_guard.storm_level.retain(|k, _| !k.starts_with(&format!("{id}\t")));
            self.l2_guard.storm_seen.retain(|k, _| !k.starts_with(&format!("{id}\t")));
            self.l2_guard.storm_drops.retain(|k, _| !k.starts_with(&format!("{id}\t")));
            self.snoop.dhcp_on.remove(id);
            self.snoop.arp_on.remove(id);
            self.snoop.trusted.retain(|k| !k.starts_with(&format!("{id}\t")));
            self.snoop.bindings.retain(|b| b.switch != id);
            self.mirror.sessions.remove(id);
        }
        if old_family != "wireless" {
            self.wifi_radios.remove(id);
        }
        if old_family != "host" {
            self.host_firewalls.remove(id);
        }
        if *kind == "hub" {
            self.fhrp.groups.retain(|g| g.device != id);
            self.snoop.dhcp_on.remove(id);
            self.snoop.arp_on.remove(id);
            self.mirror.sessions.remove(id);
        }
        self.recompute_routing();
        Ok(report)
    }
}
