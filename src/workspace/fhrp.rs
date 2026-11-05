//! First-hop redundancy: VRRP (IETF RFC 5798).
//!
//! Each router keeps a normal address plus a shared virtual address. The
//! highest-priority live router owns the virtual address and answers for it;
//! when it goes down the next one takes over. `standby` is accepted as an
//! HSRP-compatible alias, but the election is VRRP's.

use super::*;

#[derive(Clone, Debug, PartialEq, Eq)]
pub struct FhrpGroup {
    pub device: String,
    pub port: String,
    pub group: u8,
    pub vip: u32,
    pub priority: u8,
    pub hsrp: bool,
}

#[derive(Clone, Default)]
pub struct FhrpConfig {
    pub(super) groups: Vec<FhrpGroup>,
}

impl Workspace {
    pub fn fhrp_groups(&self, device: &str) -> Vec<&FhrpGroup> {
        self.fhrp.groups.iter().filter(|g| g.device == device).collect()
    }

    /// `vrrp 1 ip A.B.C.D [priority N]`, and the `standby` alias.
    pub fn set_fhrp(&mut self, device: &str, port: &str, group: u8, vip: u32, priority: u8, hsrp: bool) {
        if let Some(existing) = self
            .fhrp
            .groups
            .iter_mut()
            .find(|g| g.device == device && g.port == port && g.group == group)
        {
            existing.vip = vip;
            existing.priority = priority;
            existing.hsrp = hsrp;
        } else {
            self.fhrp.groups.push(FhrpGroup {
                device: device.to_string(),
                port: port.to_string(),
                group,
                vip,
                priority,
                hsrp,
            });
        }
        // The VIP joins the shared-gateway table so routing finds its owner.
        let members = self.shared_gateways.entry(vip).or_default();
        if let Some(member) = members.iter_mut().find(|(id, _)| id == device) {
            member.1 = priority;
        } else {
            members.push((device.to_string(), priority));
        }
        members.sort_by_key(|(id, _)| id.clone());
    }

    pub fn fhrp_disable(&mut self, device: &str, group: u8) {
        let removed: Vec<FhrpGroup> = self
            .fhrp
            .groups
            .iter()
            .filter(|g| g.device == device && g.group == group)
            .cloned()
            .collect();
        self.fhrp.groups.retain(|g| !(g.device == device && g.group == group));
        for g in removed {
            if let Some(members) = self.shared_gateways.get_mut(&g.vip) {
                members.retain(|(id, _)| id != device);
                if members.is_empty() {
                    self.shared_gateways.remove(&g.vip);
                }
            }
        }
    }

    /// `show vrrp brief` (also used for the `standby` alias rows).
    pub fn show_fhrp(&self, device: &str) -> String {
        let groups = self.fhrp_groups(device);
        if groups.is_empty() {
            return "% no VRRP groups\n".into();
        }
        let mut out = String::from(
            "Interface        Grp  Prio  State   Virtual IP      Owner\n",
        );
        for g in groups {
            let owner_id = self.shared_gateway_owner(g.vip);
            let owner = owner_id.as_deref().map_or("none".to_string(), |id| {
                self.devices
                    .iter()
                    .find(|d| d.id == id)
                    .map(|d| d.name.clone())
                    .unwrap_or_else(|| id.to_string())
            });
            let state = if owner_id.as_deref() == Some(g.device.as_str()) { "Master" } else { "Backup" };
            let kind = if g.hsrp { " (standby)" } else { "" };
            out.push_str(&format!(
                "{:<17}{:<5}{:<6}{:<8}{:<16}{owner}{kind}\n",
                g.port,
                g.group,
                g.priority,
                state,
                crate::model::ipv4_string(g.vip)
            ));
        }
        out
    }

    pub(super) fn fhrp_records(&self) -> String {
        let mut rows = self.fhrp.groups.iter().collect::<Vec<_>>();
        rows.sort_by_key(|g| (g.device.clone(), g.port.clone(), g.group));
        let mut out = String::new();
        for g in rows {
            out.push_str(&format!(
                "fhrp\t{}\t{}\t{}\t{}\t{}\t{}\n",
                g.device,
                g.port,
                g.group,
                crate::model::ipv4_string(g.vip),
                g.priority,
                u8::from(g.hsrp)
            ));
        }
        out
    }

    pub(super) fn fhrp_load(&mut self, f: &[&str]) {
        if let ["fhrp", device, port, group, vip, priority, hsrp] = f {
            if let (Ok(group), Some(vip), Ok(priority)) = (
                group.parse::<u8>(),
                crate::model::parse_ipv4(vip),
                priority.parse::<u8>(),
            ) {
                self.set_fhrp(device, port, group, vip, priority, *hsrp == "1");
            }
        }
    }
}
