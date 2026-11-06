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
    pub advert_ms: u32,
    pub auth: Option<String>,
}

#[derive(Clone, Default)]
pub struct FhrpConfig {
    pub(super) groups: Vec<FhrpGroup>,
    pub(super) elected: std::collections::HashMap<u32, String>,
    pub(super) pending: std::collections::HashMap<u32, f64>,
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
                advert_ms: 1000,
                auth: None,
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
        if !self.fhrp.elected.contains_key(&vip) {
            if let Some(winner) = self.raw_fhrp_winner(vip) {
                self.fhrp.elected.insert(vip, winner);
            }
        }
    }

    fn group_for(&self, vip: u32, device: &str) -> Option<&FhrpGroup> {
        self.fhrp
            .groups
            .iter()
            .find(|g| g.vip == vip && g.device == device)
    }

    /// Highest-priority live member, considering only one authentication set.
    /// The elected master's authentication (or the top live one) is the anchor.
    fn raw_fhrp_winner(&self, vip: u32) -> Option<String> {
        let anchor = self
            .fhrp
            .elected
            .get(&vip)
            .and_then(|id| self.group_for(vip, id))
            .map(|g| g.auth.clone());
        let members: Vec<&FhrpGroup> = self
            .fhrp
            .groups
            .iter()
            .filter(|g| g.vip == vip && self.is_powered(&g.device))
            .filter(|g| {
                self.devices.iter().find(|d| d.id == g.device).is_some_and(|d| {
                    d.ports.iter().any(|p| p.name == g.port && p.up && p.ip.is_some_and(|ip| ip != vip))
                })
            })
            .filter(|g| anchor.as_ref().map_or(true, |a| &g.auth == a))
            .collect();
        let best_auth = members.iter().max_by_key(|g| g.priority).and_then(|g| g.auth.clone());
        members
            .into_iter()
            .filter(|g| g.auth.as_ref() == best_auth.as_ref())
            .max_by_key(|g| (g.priority, std::cmp::Reverse(g.device.clone())))
            .map(|g| g.device.clone())
    }

    /// The master shown by routing and `show vrrp`, including hold-down after
    /// the master dies: the backup takes over after 3 adverts plus skew.
    pub(super) fn fhrp_owner(&self, vip: u32) -> Option<String> {
        let elected = self.fhrp.elected.get(&vip)?.clone();
        let live_winner = self.raw_fhrp_winner(vip);
        let elected_live = self.is_powered(&elected);
        if !elected_live {
            return Some(elected);
        }
        if let Some(winner) = live_winner {
            return Some(winner);
        }
        Some(elected)
    }

    pub(super) fn reconcile_fhrp(&mut self, now: f64) {
        let vips: Vec<u32> = self.fhrp.elected.keys().copied().collect();
        for vip in vips {
            let Some(elected) = self.fhrp.elected.get(&vip).cloned() else {
                continue;
            };
            if self.is_powered(&elected) {
                if let Some(winner) = self.raw_fhrp_winner(vip) {
                    self.fhrp.elected.insert(vip, winner);
                }
                self.fhrp.pending.remove(&vip);
                continue;
            }
            let since = *self.fhrp.pending.entry(vip).or_insert(now);
            let advert = self.group_for(vip, &elected).map_or(1000, |g| g.advert_ms.max(1));
            let skew = self.group_for(vip, &elected).map_or(1.0, |g| (256.0 - f64::from(g.priority)) / 256.0);
            let hold = (3.0 * f64::from(advert) / 1000.0 + skew).max(0.001);
            if now - since >= hold {
                if let Some(winner) = self.raw_fhrp_winner(vip) {
                    self.fhrp.elected.insert(vip, winner);
                }
                self.fhrp.pending.remove(&vip);
            }
        }
    }

    /// A power cut starts the hold-down clock at the current sim time.
    pub(super) fn note_power_loss(&mut self, device: &str) {
        let now = f64::from(self.sim_time);
        let vips: Vec<u32> = self
            .fhrp
            .elected
            .iter()
            .filter(|(_, id)| id.as_str() == device)
            .map(|(vip, _)| *vip)
            .collect();
        for vip in vips {
            self.fhrp.pending.entry(vip).or_insert(now);
        }
    }

    pub fn set_fhrp_timer(&mut self, device: &str, group: u8, advert_ms: u32) {
        for g in self.fhrp.groups.iter_mut().filter(|g| g.device == device && g.group == group) {
            g.advert_ms = advert_ms.clamp(100, 60_000);
        }
    }

    pub fn set_fhrp_auth(&mut self, device: &str, group: u8, auth: Option<String>) {
        for g in self.fhrp.groups.iter_mut().filter(|g| g.device == device && g.group == group) {
            g.auth = auth.clone();
        }
        self.fhrp.pending.clear();
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
        let vips: Vec<u32> = self.fhrp.elected.keys().copied().collect();
        for vip in vips {
            if self.group_for(vip, &device).is_none() {
                self.fhrp.elected.remove(&vip);
                self.fhrp.pending.remove(&vip);
            }
        }
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
            "Interface        Grp  Prio  State   Virtual IP      Owner           Adv(ms) Auth\n",
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
                "{:<17}{:<5}{:<6}{:<8}{:<16}{:<16}{:<8}{}{kind}\n",
                g.port,
                g.group,
                g.priority,
                state,
                crate::model::ipv4_string(g.vip),
                owner,
                g.advert_ms,
                g.auth.as_deref().unwrap_or("-")
            ));
        }
        out
    }

    pub(super) fn fhrp_records(&self) -> String {
        let mut rows = self.fhrp.groups.iter().collect::<Vec<_>>();
        rows.sort_by_key(|g| (g.device.clone(), g.port.clone(), g.group));
        let mut out = String::new();
        for g in rows {
            let auth = g.auth.as_deref().map_or("-".to_string(), |a| {
                a.chars().map(|c| if c.is_whitespace() { '_' } else { c }).collect()
            });
            out.push_str(&format!(
                "fhrp\t{}\t{}\t{}\t{}\t{}\t{}\t{}\t{}\n",
                g.device,
                g.port,
                g.group,
                crate::model::ipv4_string(g.vip),
                g.priority,
                u8::from(g.hsrp),
                g.advert_ms,
                auth
            ));
        }
        out
    }

    pub(super) fn fhrp_load(&mut self, f: &[&str]) {
        let (device, port, group, vip, priority, hsrp, advert, auth) = match f {
            [device, port, group, vip, priority, hsrp] => {
                (*device, *port, *group, *vip, *priority, *hsrp, "1000", "-")
            }
            [device, port, group, vip, priority, hsrp, advert, auth] => {
                (*device, *port, *group, *vip, *priority, *hsrp, *advert, *auth)
            }
            _ => return,
        };
        if let (Ok(group), Some(vip), Ok(priority)) = (
            group.parse::<u8>(),
            crate::model::parse_ipv4(vip),
            priority.parse::<u8>(),
        ) {
            self.set_fhrp(device, port, group, vip, priority, hsrp == "1");
            if let Ok(ms) = advert.parse::<u32>() {
                self.set_fhrp_timer(device, group, ms);
            }
            if auth != "-" {
                self.set_fhrp_auth(device, group, Some(auth.to_string()));
            }
        }
    }
}
