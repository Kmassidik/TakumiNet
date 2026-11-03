use super::*;

impl Workspace {
    /// `write memory` / `copy run start`: snapshot one device's configuration.
    pub fn write_memory(&mut self, id: &str) {
        let Some(device) = self.devices.iter().find(|d| d.id == id).cloned() else {
            return;
        };
        let saved = StartupConfig {
            device,
            banner: self.banners.get(id).cloned(),
            line_password: self.line_passwords.get(id).cloned(),
            routing: self.routing.get(id).cloned(),
            switching: self.switching_config(id),
        };
        self.startup.get_or_insert_with(HashMap::new).insert(id.to_string(), saved);
    }

    /// `show startup-config` for one device.
    pub fn startup_config(&self, id: &str) -> Option<String> {
        let saved = self.startup.as_ref()?.get(id)?;
        Some(crate::cli::config_for(
            &saved.device,
            saved.banner.as_deref(),
            saved.line_password.as_deref(),
            saved.routing.as_ref(),
            &saved.switching,
        ))
    }

    /// `reload`: restore the saved configuration and reboot the simulation.
    pub fn reload(&mut self) -> bool {
        let Some(saved) = self.startup.clone() else {
            return false;
        };
        for (id, saved) in saved {
            if let Some(d) = self.devices.iter_mut().find(|d| d.id == id) {
                *d = saved.device;
            }
            match saved.banner {
                Some(banner) => self.banners.insert(id.clone(), banner),
                None => self.banners.remove(&id),
            };
            match saved.line_password {
                Some(password) => self.line_passwords.insert(id.clone(), password),
                None => self.line_passwords.remove(&id),
            };
            match saved.routing {
                Some(routing) => self.routing.insert(id.clone(), routing),
                None => self.routing.remove(&id),
            };
            let switching = saved.switching;
            if switching.vlans.is_empty() {
                self.vlans.remove(&id);
            } else {
                self.vlans.insert(id.clone(), switching.vlans);
            }
            if switching.channels.is_empty() {
                self.channels.remove(&id);
            } else {
                self.channels.insert(id.clone(), switching.channels);
            }
            if switching.channel_modes.is_empty() {
                self.channel_modes.remove(&id);
            } else {
                self.channel_modes.insert(id.clone(), switching.channel_modes);
            }
            match switching.stp_mode {
                Some(mode) => self.stp_modes.insert(id.clone(), mode),
                None => self.stp_modes.remove(&id),
            };
            if switching.stp_priorities.is_empty() {
                self.stp_priorities.remove(&id);
            } else {
                self.stp_priorities.insert(id.clone(), switching.stp_priorities);
            }
        }
        self.recompute_routing();
        self.events.clear();
        self.next_event = 0;
        self.sim_time = 0.0;
        self.tables = Tables::default();
        true
    }

    pub fn reset_sim(&mut self) {
        self.events.clear();
        self.next_event = 0;
        self.sim_time = 0.0;
        self.tables = Tables::default();
    }

    pub fn duplicate(&mut self, id: &str) -> Option<String> {
        let d = self.devices.iter().find(|d| d.id == id)?.clone();
        self.add(&d.model, d.x + 34.0, d.y + 34.0)
    }

    pub fn rename(&mut self, id: &str, name: &str) -> bool {
        match self.devices.iter_mut().find(|d| d.id == id) {
            Some(d) => {
                d.name = name.to_string();
                true
            }
            None => false,
        }
    }

    /// True while the topology is still the shipped demo (no user edits).
    pub(super) fn is_pristine_demo(&self) -> bool {
        const DEMO: [&str; 7] = [
            "router0", "switch0", "switch1", "pc0", "pc1", "server0", "pc2",
        ];
        self.devices.len() == 7
            && self.links.len() == 6
            && self.events.is_empty()
            && DEMO.iter().all(|id| self.devices.iter().any(|d| d.id == *id))
    }
}
