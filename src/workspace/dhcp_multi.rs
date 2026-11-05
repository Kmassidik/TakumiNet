//! Several DHCP servers on one segment: the nearest offer wins.
//!
//! A rogue server close to the client must be able to answer before the real
//! one. Candidates are ordered by hop count and then device id, so the result
//! is deterministic. DHCP snooping filters them before the lease is built.

use super::*;
use std::collections::VecDeque;

impl Workspace {
    /// Every device with a pool on the client's segment, nearest first.
    pub(super) fn dhcp_candidates(&self, id: &str) -> Vec<String> {
        let vlan = self.access_vlan_of(id);
        let mut seen = vec![id.to_string()];
        let mut q: VecDeque<(String, usize)> = VecDeque::new();
        q.push_back((id.to_string(), 0));
        let mut found: Vec<(usize, String)> = Vec::new();
        while let Some((cur, dist)) = q.pop_front() {
            for link in &self.links {
                if !link.carries_data() {
                    continue;
                }
                let next = if link.a == cur {
                    &link.b
                } else if link.b == cur {
                    &link.a
                } else {
                    continue;
                };
                if seen.iter().any(|s| s == next) {
                    continue;
                }
                let Some(dev) = self.devices.iter().find(|d| d.id == *next) else {
                    continue;
                };
                if dev.id != id
                    && self.dhcp_pools.contains_key(&dev.id)
                    && vlan == self.access_vlan_of(&dev.id)
                {
                    found.push((dist + 1, dev.id.clone()));
                }
                // A router ends the segment: offers beyond it need a relay.
                if matches!(dev.kind.as_str(), "router" | "switch-l3") {
                    continue;
                }
                seen.push(dev.id.clone());
                q.push_back((dev.id.clone(), dist + 1));
            }
        }
        found.sort();
        found.into_iter().map(|(_, id)| id).collect()
    }

    /// The first candidate that snooping does not refuse, or `None`.
    pub(super) fn dhcp_pick_server(&mut self, id: &str) -> Option<String> {
        for candidate in self.dhcp_candidates(id) {
            if self.dhcp_snoop_block(&candidate).is_none() {
                return Some(candidate);
            }
        }
        None
    }
}
