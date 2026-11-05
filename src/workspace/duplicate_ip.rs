//! Duplicate IPv4 address warnings.
//!
//! Delivery does not use the ARP table yet, so a duplicate address does not
//! misdeliver traffic. It is still a configuration mistake; report it in plain
//! words wherever an address is shown or set.

use super::*;

impl Workspace {
    fn effective_ip(device: &Device) -> Option<u32> {
        device.ip.or_else(|| device.ports.iter().find_map(|p| p.ip))
    }

    /// The first other device that uses the same address.
    pub fn duplicate_ip_owner(&self, id: &str) -> Option<(String, u32)> {
        let device = self.devices.iter().find(|d| d.id == id)?;
        let ip = Self::effective_ip(device)?;
        self.devices
            .iter()
            .filter(|d| d.id != id)
            .find(|d| Self::effective_ip(d) == Some(ip))
            .map(|d| (d.name.clone(), ip))
    }

    pub fn duplicate_ip_warning(&self, id: &str) -> Option<String> {
        let (name, ip) = self.duplicate_ip_owner(id)?;
        Some(format!(
            "Duplicate IP address {} also used by {name}.",
            crate::model::ipv4_string(ip)
        ))
    }
}
