//! DHCP snooping and dynamic ARP inspection.
//!
//! DHCP is modelled as a lease exchange rather than forwarded frames, so trust
//! is checked when a server answers: the server's switch port must be trusted
//! once snooping is on. ARP replies come only from their real owner today, so
//! the inspection rule is exposed as a checked table for lessons and tests.

use super::*;
use std::collections::{HashMap, HashSet};

#[derive(Clone, Debug, PartialEq, Eq)]
pub struct SnoopBinding {
    pub switch: String,
    pub port: String,
    pub mac: String,
    pub ip: u32,
    pub vlan: u16,
}

#[derive(Clone, Default)]
pub struct SnoopConfig {
    pub(super) dhcp_on: HashSet<String>,
    pub(super) dhcp_vlans: HashMap<String, HashSet<u16>>,
    pub(super) trusted: HashSet<String>,
    pub(super) bindings: Vec<SnoopBinding>,
    pub(super) dhcp_drops: HashMap<String, u32>,
    pub(super) arp_on: HashSet<String>,
    pub(super) arp_vlans: HashMap<String, HashSet<u16>>,
    pub(super) arp_drops: HashMap<String, u32>,
}

fn key(id: &str, port: &str) -> String {
    format!("{id}\t{port}")
}

impl Workspace {
    pub fn dhcp_snooping(&self, id: &str) -> bool {
        self.snoop.dhcp_on.contains(id)
    }

    pub fn set_dhcp_snooping(&mut self, id: &str, on: bool) {
        if on { self.snoop.dhcp_on.insert(id.to_string()); } else { self.snoop.dhcp_on.remove(id); }
    }

    pub fn dhcp_snooping_vlan(&mut self, id: &str, vlan: u16) {
        self.snoop.dhcp_vlans.entry(id.to_string()).or_default().insert(vlan);
    }

    pub fn dhcp_snooping_trust(&mut self, id: &str, port: &str, on: bool) {
        let k = key(id, port);
        if on { self.snoop.trusted.insert(k); } else { self.snoop.trusted.remove(&k); }
    }

    pub fn port_trusted(&self, id: &str, port: &str) -> bool {
        self.snoop.trusted.contains(&key(id, port))
    }

    pub fn arp_inspection(&self, id: &str) -> bool {
        self.snoop.arp_on.contains(id)
    }

    pub fn set_arp_inspection(&mut self, id: &str, on: bool) {
        if on { self.snoop.arp_on.insert(id.to_string()); } else { self.snoop.arp_on.remove(id); }
    }

    pub fn arp_inspection_vlan(&mut self, id: &str, vlan: u16) {
        self.snoop.arp_vlans.entry(id.to_string()).or_default().insert(vlan);
    }

    pub fn dhcp_snoop_drops(&self, id: &str) -> u32 {
        self.snoop.dhcp_drops.get(id).copied().unwrap_or(0)
    }

    pub fn arp_inspection_drops(&self, id: &str) -> u32 {
        self.snoop.arp_drops.get(id).copied().unwrap_or(0)
    }

    /// The switch port that faces `device`, used for trust and inspection.
    pub(super) fn switch_port_for(&self, device: &str) -> Option<(String, String)> {
        for dev in &self.devices {
            if !matches!(dev.kind.as_str(), "switch" | "switch-l3") {
                continue;
            }
            for port in &dev.ports {
                if let Some((peer, _)) = self.peer_port(&dev.id, &port.name) {
                    if peer == device {
                        return Some((dev.id.clone(), port.name.clone()));
                    }
                }
            }
        }
        None
    }

    /// `Some(reason)` when snooping refuses the offer from this server.
    pub(super) fn dhcp_snoop_block(&mut self, server: &str) -> Option<String> {
        let (switch, port) = self.switch_port_for(server)?;
        if !self.snoop.dhcp_on.contains(&switch) || self.port_trusted(&switch, &port) {
            return None;
        }
        *self.snoop.dhcp_drops.entry(switch.clone()).or_insert(0) += 1;
        Some(format!(
            "DHCP snooping on {}: offer from untrusted port {}",
            self.name_of(&switch),
            port
        ))
    }

    /// Remember a granted lease against the client's access port.
    pub(super) fn record_snoop_binding(&mut self, client: &str, ip: u32) {
        let Some(dev) = self.devices.iter().find(|d| d.id == client) else {
            return;
        };
        let mac = crate::net::packet::Mac::for_device(client).to_string();
        for sw in &self.devices {
            if !matches!(sw.kind.as_str(), "switch" | "switch-l3") {
                continue;
            }
            for port in &sw.ports {
                if self.peer_port(&sw.id, &port.name).map(|(p, _)| p) != Some(client.to_string()) {
                    continue;
                }
                let vlan = port.vlan.max(1);
                if self.snoop.bindings.iter().any(|b| b.ip == ip && b.switch == sw.id) {
                    return;
                }
                self.snoop.bindings.push(SnoopBinding {
                    switch: sw.id.clone(),
                    port: port.name.clone(),
                    mac,
                    ip,
                    vlan,
                });
                let _ = dev;
                return;
            }
        }
    }

    pub fn snoop_binding_rows(&self, id: &str) -> Vec<&SnoopBinding> {
        self.snoop.bindings.iter().filter(|b| b.switch == id).collect()
    }

    /// DAI: an untrusted port may use only the MAC bound to its IP.
    pub fn arp_inspection_allows(&mut self, switch: &str, port: &str, ip: u32, mac: &str) -> bool {
        if !self.snoop.arp_on.contains(switch) || self.port_trusted(switch, port) {
            return true;
        }
        let bound = self
            .snoop
            .bindings
            .iter()
            .find(|b| b.switch == switch && b.ip == ip)
            .map(|b| b.mac.clone());
        if let Some(bound) = bound {
            if bound != mac {
                *self.snoop.arp_drops.entry(switch.to_string()).or_insert(0) += 1;
                return false;
            }
        }
        true
    }

    /// DAI on the reply's ingress switch port. Called for every ARP reply.
    pub fn arp_reply_allowed(&mut self, device: &str, ip: u32) -> bool {
        let Some((switch, port)) = self.switch_port_for(device) else {
            return true;
        };
        let mac = crate::net::packet::Mac::for_device(device).to_string();
        self.arp_inspection_allows(&switch, &port, ip, &mac)
    }

    pub fn show_dhcp_snooping(&self, id: &str) -> String {
        if !self.snoop.dhcp_on.contains(id) {
            return "DHCP snooping is off\n".into();
        }
        let mut out = String::from("DHCP snooping is on\n");
        out.push_str(&format!("Dropped offers: {}\n", self.dhcp_snoop_drops(id)));
        let rows = self.snoop_binding_rows(id);
        if rows.is_empty() {
            return out;
        }
        out.push_str("\nMAC address        IP address      Lease  VLAN  Interface\n");
        for b in rows {
            out.push_str(&format!(
                "{:<19}{:<16}{:<7}{:<6}{}\n",
                b.mac,
                crate::model::ipv4_string(b.ip),
                "static",
                b.vlan,
                b.port
            ));
        }
        out
    }

    pub(super) fn snoop_records(&self) -> String {
        let mut out = String::new();
        let mut on: Vec<_> = self.snoop.dhcp_on.iter().collect();
        on.sort();
        for id in on {
            out.push_str(&format!("dhcpsnoop\t{id}\n"));
        }
        let mut vlans: Vec<_> = self.snoop.dhcp_vlans.iter().collect();
        vlans.sort_by_key(|(id, _)| id.as_str());
        for (id, list) in vlans {
            let mut list: Vec<_> = list.iter().collect();
            list.sort();
            for vlan in list {
                out.push_str(&format!("snoopvlan\t{id}\t{vlan}\n"));
            }
        }
        let mut trusted: Vec<_> = self.snoop.trusted.iter().collect();
        trusted.sort();
        for k in trusted {
            out.push_str(&format!("snooptrust\t{k}\n"));
        }
        let mut bindings = self.snoop.bindings.iter().collect::<Vec<_>>();
        bindings.sort_by_key(|b| (b.switch.clone(), b.ip));
        for b in bindings {
            out.push_str(&format!(
                "snoopbind\t{}\t{}\t{}\t{}\t{}\n",
                b.switch,
                b.port,
                b.mac,
                crate::model::ipv4_string(b.ip),
                b.vlan
            ));
        }
        let mut arp: Vec<_> = self.snoop.arp_on.iter().collect();
        arp.sort();
        for id in arp {
            out.push_str(&format!("arpinspect\t{id}\n"));
        }
        out
    }

    pub(super) fn snoop_load(&mut self, f: &[&str]) {
        match f {
            ["dhcpsnoop", id] => self.set_dhcp_snooping(id, true),
            ["snoopvlan", id, vlan] => {
                if let Ok(v) = vlan.parse() { self.dhcp_snooping_vlan(id, v); }
            }
            ["snooptrust", id, port] => self.dhcp_snooping_trust(id, port, true),
            ["snoopbind", switch, port, mac, ip, vlan] => {
                if let Some(ip) = crate::model::parse_ipv4(ip) {
                    self.snoop.bindings.push(SnoopBinding {
                        switch: switch.to_string(),
                        port: port.to_string(),
                        mac: mac.to_string(),
                        ip,
                        vlan: vlan.parse().unwrap_or(1),
                    });
                }
            }
            ["arpinspect", id] => self.set_arp_inspection(id, true),
            _ => {}
        }
    }
}
