use super::*;
use crate::model::{contains, parse_ipv4, routes_packets};

impl Workspace {
    /// One member of a shared gateway: this device answers for `vip` when it is
    /// the healthiest member. Higher priority wins.
    pub fn set_shared_gateway(&mut self, device: &str, vip: &str, priority: u8) -> Result<(), String> {
        let Some(dev) = self.devices.iter().find(|d| d.id == device) else {
            return Err("no such device".into());
        };
        if !routes_packets(&dev.kind) {
            return Err("a shared gateway lives on routers".into());
        }
        let addr = parse_ipv4(vip.trim()).ok_or_else(|| format!("invalid address: {vip}"))?;
        let near = dev.ports.iter().any(|p| {
            p.ip.is_some_and(|ip| ip != addr && contains(addr, ip, p.prefix))
        });
        if !near {
            return Err("the shared address must sit in one of this device's networks, and not on a port".into());
        }
        let members = self.shared_gateways.entry(addr).or_default();
        members.retain(|(id, _)| id != device);
        members.push((device.to_string(), priority));
        members.sort();
        Ok(())
    }

    pub fn remove_shared_gateway(&mut self, device: &str, vip: &str) -> bool {
        let Some(addr) = parse_ipv4(vip.trim()) else { return false };
        let Some(members) = self.shared_gateways.get_mut(&addr) else { return false };
        let before = members.len();
        members.retain(|(id, _)| id != device);
        members.len() != before
    }

    /// The member that answers for `vip` now: the highest priority whose port in
    /// the shared network is up.
    pub fn shared_gateway_owner(&self, vip: u32) -> Option<String> {
        let members = self.shared_gateways.get(&vip)?;
        members.iter()
            .filter(|(id, _)| {
                self.devices.iter().find(|d| d.id == **id).is_some_and(|d| {
                    d.ports.iter().any(|p| p.up && p.ip.is_some_and(|ip| ip != vip && contains(vip, ip, p.prefix)))
                })
            })
            .max_by_key(|(id, priority)| (*priority, std::cmp::Reverse(id.clone())))
            .map(|(id, _)| id.clone())
    }

    pub fn shared_gateway_rows(&self, device: &str) -> Vec<(String, u8, bool)> {
        let mut out = Vec::new();
        for (vip, members) in &self.shared_gateways {
            let owner = self.shared_gateway_owner(*vip);
            for (id, priority) in members {
                if id == device {
                    out.push((crate::model::ipv4_string(*vip), *priority, owner.as_deref() == Some(device)));
                }
            }
        }
        out.sort();
        out
    }
}
