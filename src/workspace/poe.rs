//! Power over Ethernet (IEEE 802.3af and 802.3at): a switch port can power the
//! device on its cable, up to the switch's power budget. A device marked as
//! powered by its cable only runs while its port supplies that power.

use super::*;

/// What one switch can hand out in total, in watts.
pub const POE_BUDGET_W: f32 = 120.0;

#[derive(Clone, Debug, Default)]
pub struct PoeConfig {
    /// Devices with no wall adapter: the cable is their only power.
    pub devices: std::collections::HashSet<String>,
    /// Switch ports set to `power inline never`, keyed "device<TAB>port".
    pub never: std::collections::HashSet<String>,
}

#[derive(Clone, Debug, PartialEq)]
pub enum PoeState {
    Powered,
    Denied(&'static str),
}

#[derive(Clone, Debug)]
pub struct PoeRow {
    pub switch: String,
    pub port: String,
    pub device: String,
    pub watts: f32,
    pub state: PoeState,
}

/// How much a powered-by-cable device draws, by kind; `None` cannot take PoE.
pub fn poe_draw(kind: &str) -> Option<f32> {
    match kind {
        "ap" | "hotspot-ap" => Some(15.4),
        "phone" => Some(6.5),
        _ => None,
    }
}

fn supplies_power(kind: &str) -> bool {
    matches!(kind, "switch" | "switch-l3")
}

impl Workspace {
    pub fn set_poe_device(&mut self, id: &str, on: bool) -> Result<(), String> {
        let kind = self.kind_of(id);
        if poe_draw(&kind).is_none() {
            return Err("this device cannot take power from its cable".into());
        }
        if on {
            self.poe.devices.insert(id.to_string());
        } else {
            self.poe.devices.remove(id);
        }
        Ok(())
    }

    pub fn set_port_poe(&mut self, id: &str, port: &str, supply: bool) -> Result<(), String> {
        let ok = self.devices.iter().any(|d| d.id == id && supplies_power(&d.kind) && d.ports.iter().any(|p| p.name == port));
        if !ok {
            return Err("this interface cannot supply power".into());
        }
        let key = format!("{id}\t{port}");
        if supply {
            self.poe.never.remove(&key);
        } else {
            self.poe.never.insert(key);
        }
        Ok(())
    }

    pub fn poe_port_on(&self, id: &str, port: &str) -> bool {
        !self.poe.never.contains(&format!("{id}\t{port}"))
    }

    /// Every cable that ends in a powered-by-cable device, in port order, with
    /// whether it got its power. A switch runs out of budget in that order.
    pub fn poe_report(&self) -> Vec<PoeRow> {
        let mut rows = Vec::new();
        for switch in self.devices.iter().filter(|d| supplies_power(&d.kind)) {
            let mut used = 0.0_f32;
            for port in &switch.ports {
                let Some((peer, _)) = self.peer_port(&switch.id, &port.name) else { continue };
                if !self.poe.devices.contains(&peer) {
                    continue;
                }
                let watts = poe_draw(&self.kind_of(&peer)).unwrap_or(0.0);
                let state = if !port.up {
                    PoeState::Denied("the switch port is shut down")
                } else if !self.poe_port_on(&switch.id, &port.name) {
                    PoeState::Denied("power inline never is set on the switch port")
                } else if used + watts > POE_BUDGET_W {
                    PoeState::Denied("the switch is out of PoE budget")
                } else {
                    used += watts;
                    PoeState::Powered
                };
                rows.push(PoeRow { switch: switch.id.clone(), port: port.name.clone(), device: peer, watts, state });
            }
        }
        rows
    }

    pub fn poe_used(&self, switch: &str) -> f32 {
        self.poe_report()
            .iter()
            .filter(|r| r.switch == switch && r.state == PoeState::Powered)
            .map(|r| r.watts)
            .sum()
    }

    /// Why a powered-by-cable device has no power, or `None` when it has some
    /// (or never depended on the cable).
    pub fn poe_denied(&self, id: &str) -> Option<&'static str> {
        if !self.poe.devices.contains(id) {
            return None;
        }
        match self.poe_report().into_iter().find(|r| r.device == id) {
            Some(PoeRow { state: PoeState::Denied(reason), .. }) => Some(reason),
            Some(_) => None,
            None => Some("no PoE switch is cabled to it"),
        }
    }

    pub(super) fn poe_records(&self) -> String {
        let mut out = String::new();
        let mut devices: Vec<_> = self.poe.devices.iter().collect();
        devices.sort();
        for id in devices {
            out.push_str(&format!("poe\t{id}\n"));
        }
        let mut never: Vec<_> = self.poe.never.iter().collect();
        never.sort();
        for key in never {
            out.push_str(&format!("poeport\t{key}\tnever\n"));
        }
        out
    }

    pub(super) fn load_poe_device(&mut self, id: &str) {
        let _ = self.set_poe_device(id, true);
    }

    pub(super) fn load_poe_port(&mut self, id: &str, port: &str) {
        let _ = self.set_port_poe(id, port, false);
    }
}
