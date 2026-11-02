use super::*;

impl Workspace {
    /// `write memory` / `copy run start`: snapshot the device configuration.
    pub fn write_memory(&mut self) {
        self.startup = Some(self.devices.clone());
    }

    /// `show startup-config` for one device.
    pub fn startup_config(&self, id: &str) -> Option<String> {
        let d = self.startup.as_ref()?.iter().find(|d| d.id == id)?;
        Some(crate::cli::config_for(
            d,
            self.banners.get(id).map(String::as_str),
            self.line_passwords.get(id).map(String::as_str),
        ))
    }

    /// `reload`: restore the saved configuration and reboot the simulation.
    pub fn reload(&mut self) -> bool {
        let Some(saved) = self.startup.clone() else {
            return false;
        };
        for s in saved {
            if let Some(d) = self.devices.iter_mut().find(|d| d.id == s.id) {
                *d = s;
            }
        }
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
