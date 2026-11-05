//! Access-port protection around IEEE 802.1D: PortFast, BPDU guard,
//! errdisable recovery and storm control. The command names are Cisco's.

use super::*;
use std::collections::{HashMap, HashSet};

#[derive(Clone, Default)]
pub struct L2GuardConfig {
    pub(super) portfast: HashSet<String>,
    pub(super) bpduguard: HashSet<String>,
    pub(super) errdisabled: HashMap<String, String>,
    pub(super) storm_level: HashMap<String, u8>,
    pub(super) storm_seen: HashMap<String, u32>,
    pub(super) storm_drops: HashMap<String, u32>,
}

fn key(id: &str, port: &str) -> String {
    format!("{id}\t{port}")
}

impl Workspace {
    pub fn portfast(&self, id: &str, port: &str) -> bool {
        self.l2_guard.portfast.contains(&key(id, port))
    }

    pub fn set_portfast(&mut self, id: &str, port: &str, on: bool) {
        let k = key(id, port);
        if on { self.l2_guard.portfast.insert(k); } else { self.l2_guard.portfast.remove(&k); }
    }

    pub fn bpduguard(&self, id: &str, port: &str) -> bool {
        self.l2_guard.bpduguard.contains(&key(id, port))
    }

    pub fn set_bpduguard(&mut self, id: &str, port: &str, on: bool) {
        let k = key(id, port);
        if on { self.l2_guard.bpduguard.insert(k); } else { self.l2_guard.bpduguard.remove(&k); }
    }

    pub fn errdisabled_reason(&self, id: &str, port: &str) -> Option<&str> {
        self.l2_guard.errdisabled.get(&key(id, port)).map(String::as_str)
    }

    /// Run after an interface is enabled: a guard port that sees another
    /// switch or router errs down instead of forwarding the rogue BPDU.
    pub(super) fn l2_guard_on_enable(&mut self, id: &str, port: &str) -> bool {
        let k = key(id, port);
        self.l2_guard.errdisabled.remove(&k);
        if !self.l2_guard.bpduguard.contains(&k) {
            return false;
        }
        let rogue = self
            .peer_port(id, port)
            .and_then(|(peer, _)| self.devices.iter().find(|d| d.id == peer))
            .is_some_and(|d| matches!(d.kind.as_str(), "switch" | "switch-l3" | "router" | "hub"));
        if rogue {
            self.l2_guard.errdisabled.insert(k, "BPDU guard: a switch is on this access port".into());
        }
        rogue
    }

    /// `errdisable recovery cause bpduguard` or a fresh `no shutdown`.
    pub fn errdisable_recover(&mut self, id: &str, port: &str) -> bool {
        let k = key(id, port);
        let had = self.l2_guard.errdisabled.remove(&k).is_some();
        if had {
            self.set_port_up(id, port, true);
            self.l2_guard.errdisabled.remove(&k);
        }
        had
    }

    pub fn storm_level(&self, id: &str, port: &str) -> Option<u8> {
        self.l2_guard.storm_level.get(&key(id, port)).copied()
    }

    pub fn set_storm_level(&mut self, id: &str, port: &str, level: u8) {
        self.l2_guard.storm_level.insert(key(id, port), level);
    }

    pub fn clear_storm_level(&mut self, id: &str, port: &str) {
        self.l2_guard.storm_level.remove(&key(id, port));
    }

    pub fn storm_drops(&self, id: &str, port: &str) -> u32 {
        self.l2_guard.storm_drops.get(&key(id, port)).copied().unwrap_or(0)
    }

    pub fn storm_seen(&self, id: &str, port: &str) -> u32 {
        self.l2_guard.storm_seen.get(&key(id, port)).copied().unwrap_or(0)
    }

    /// Count one flooded broadcast on a port. Above the configured level a
    /// deterministic share is dropped, so the counter is stable in tests.
    pub(crate) fn storm_drop(&mut self, id: &str, port: &str, broadcast: bool) -> bool {
        if !broadcast {
            return false;
        }
        let k = key(id, port);
        let Some(level) = self.l2_guard.storm_level.get(&k).copied() else {
            return false;
        };
        let seen = self.l2_guard.storm_seen.entry(k.clone()).or_insert(0);
        *seen = seen.wrapping_add(1);
        if (*seen % 100) >= u32::from(level) {
            *self.l2_guard.storm_drops.entry(k).or_insert(0) += 1;
            return true;
        }
        false
    }

    pub fn errdisable_table(&self, id: &str) -> String {
        let mut rows: Vec<_> = self
            .l2_guard
            .errdisabled
            .iter()
            .filter(|(k, _)| k.starts_with(&format!("{id}\t")))
            .collect();
        rows.sort_by_key(|(k, _)| k.as_str());
        if rows.is_empty() {
            return "% no errdisabled ports\n".into();
        }
        let mut out = String::from("Port             Reason\n");
        for (k, reason) in rows {
            let port = k.split_once('\t').map(|(_, p)| p).unwrap_or(k);
            out.push_str(&format!("{port:<17}{reason}\n"));
        }
        out
    }

    pub(super) fn l2_guard_records(&self) -> String {
        let mut out = String::new();
        let mut pf: Vec<_> = self.l2_guard.portfast.iter().collect();
        pf.sort();
        for k in pf {
            out.push_str(&format!("portfast\t{k}\n"));
        }
        let mut guard: Vec<_> = self.l2_guard.bpduguard.iter().collect();
        guard.sort();
        for k in guard {
            out.push_str(&format!("bpduguard\t{k}\n"));
        }
        let mut storm: Vec<_> = self.l2_guard.storm_level.iter().collect();
        storm.sort_by_key(|(k, _)| k.as_str());
        for (k, level) in storm {
            out.push_str(&format!("storm\t{k}\t{level}\n"));
        }
        out
    }

    pub(super) fn l2_guard_load(&mut self, kind: &str, rest: &[&str]) {
        match (kind, rest) {
            ("portfast", [dev, port]) => { self.set_portfast(dev, port, true); }
            ("bpduguard", [dev, port]) => { self.set_bpduguard(dev, port, true); }
            ("storm", [dev, port, level]) => {
                if let Ok(level) = level.parse::<u8>() {
                    self.set_storm_level(dev, port, level);
                }
            }
            _ => {}
        }
    }
}
