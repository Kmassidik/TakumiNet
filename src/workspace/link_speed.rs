//! Speed and duplex on an Ethernet port: IEEE 802.3 auto-negotiation
//! (Clause 28) and what happens when one end is fixed and the other is not.

use super::*;

#[derive(Clone, Copy, Debug, Default, PartialEq)]
pub struct LinkSetting {
    pub speed: Option<u32>,
    pub full: Option<bool>,
}

impl LinkSetting {
    fn auto(&self) -> bool {
        self.speed.is_none() && self.full.is_none()
    }
}

/// What a cable ended up running at, seen from one port.
#[derive(Clone, Copy, Debug, PartialEq)]
pub struct Negotiated {
    pub speed: u32,
    pub full: bool,
    pub peer_full: bool,
}

impl Negotiated {
    pub fn duplex_mismatch(&self) -> bool {
        self.full != self.peer_full
    }
}

fn key(id: &str, port: &str) -> String {
    format!("{id}\t{port}")
}

/// The fastest a port can go, read from its name.
fn capability(port: &str) -> u32 {
    if port.starts_with("Gigabit") {
        1000
    } else if port.starts_with("Fast") {
        100
    } else {
        10
    }
}

impl Workspace {
    pub fn link_setting(&self, id: &str, port: &str) -> LinkSetting {
        self.link_settings.get(&key(id, port)).copied().unwrap_or_default()
    }

    pub fn set_link_speed(&mut self, id: &str, port: &str, speed: Option<u32>) -> Result<(), String> {
        if let Some(value) = speed {
            if !matches!(value, 10 | 100 | 1000) {
                return Err("speed must be 10, 100, 1000 or auto".into());
            }
            if value > capability(port) {
                return Err(format!("{port} cannot run at {value} Mb/s"));
            }
        }
        self.edit_link_setting(id, port, |s| s.speed = speed)
    }

    pub fn set_link_duplex(&mut self, id: &str, port: &str, full: Option<bool>) -> Result<(), String> {
        self.edit_link_setting(id, port, |s| s.full = full)
    }

    fn edit_link_setting(&mut self, id: &str, port: &str, edit: impl FnOnce(&mut LinkSetting)) -> Result<(), String> {
        let known = self.devices.iter().any(|d| d.id == id && d.ports.iter().any(|p| p.name == port));
        if !known {
            return Err("no such interface".into());
        }
        let mut setting = self.link_setting(id, port);
        edit(&mut setting);
        if setting.auto() {
            self.link_settings.remove(&key(id, port));
        } else {
            self.link_settings.insert(key(id, port), setting);
        }
        Ok(())
    }

    /// Run the negotiation on the cable at `port`. `None` when nothing is
    /// plugged in, or when the two ends cannot agree on a speed (no link).
    pub fn negotiated(&self, id: &str, port: &str) -> Option<Negotiated> {
        let (peer, peer_port) = self.peer_port(id, port)?;
        let (mine, theirs) = (self.link_setting(id, port), self.link_setting(&peer, &peer_port));
        let (cap_mine, cap_theirs) = (capability(port), capability(&peer_port));
        let fixed = |s: &LinkSetting, cap: u32| (s.speed.unwrap_or(cap), s.full.unwrap_or(true));
        match (mine.auto(), theirs.auto()) {
            (true, true) => {
                let speed = cap_mine.min(cap_theirs);
                Some(Negotiated { speed, full: true, peer_full: true })
            }
            (false, true) => {
                let (speed, full) = fixed(&mine, cap_mine);
                (speed <= cap_theirs).then_some(Negotiated { speed, full, peer_full: speed >= 1000 })
            }
            (true, false) => {
                let (speed, peer_full) = fixed(&theirs, cap_theirs);
                (speed <= cap_mine).then_some(Negotiated { speed, full: speed >= 1000, peer_full })
            }
            (false, false) => {
                let (speed, full) = fixed(&mine, cap_mine);
                let (peer_speed, peer_full) = fixed(&theirs, cap_theirs);
                (speed == peer_speed).then_some(Negotiated { speed, full, peer_full })
            }
        }
    }

    /// Two ends that cannot agree on a speed bring no link up at all.
    pub(super) fn speed_mismatch(&self, id: &str, port: &str) -> bool {
        self.peer_port(id, port).is_some() && self.negotiated(id, port).is_none()
    }

    pub(super) fn link_records(&self) -> String {
        let mut rows: Vec<_> = self.link_settings.iter().collect();
        rows.sort_by(|a, b| a.0.cmp(b.0));
        let mut out = String::new();
        for (name, setting) in rows {
            out.push_str(&format!(
                "linkset\t{}\t{}\t{}\n",
                name,
                setting.speed.map_or("auto".to_string(), |s| s.to_string()),
                match setting.full {
                    Some(true) => "full",
                    Some(false) => "half",
                    None => "auto",
                }
            ));
        }
        out
    }

    pub(super) fn load_link_setting(&mut self, id: &str, port: &str, speed: &str, duplex: &str) {
        let _ = self.edit_link_setting(id, port, |s| {
            s.speed = speed.parse().ok();
            s.full = match duplex {
                "full" => Some(true),
                "half" => Some(false),
                _ => None,
            };
        });
    }
}
