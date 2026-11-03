use super::*;

impl Workspace {
    pub(super) fn slot_count(kind: &str) -> usize {
        match kind {
            "router" | "switch" => 2,
            _ => 0,
        }
    }

    pub fn is_powered(&self, id: &str) -> bool {
        !self.powered_off.contains(id)
    }

    /// Physical power switch; a device that is off drops all traffic.
    pub fn set_power(&mut self, id: &str, on: bool) -> bool {
        if !self.devices.iter().any(|d| d.id == id) {
            return false;
        }
        if on {
            self.powered_off.remove(id);
        } else {
            self.powered_off.insert(id.to_string());
        }
        self.recompute_routing();
        true
    }

    pub fn modules(&self, id: &str) -> Vec<Option<String>> {
        let n = Self::slot_count(&self.kind_of(id));
        let mut out = self.slots.get(id).cloned().unwrap_or_else(|| vec![None; n]);
        out.resize(n, None);
        out
    }

    /// Insert (`model` non-empty) or remove (`""`) a module in `slot`.
    pub fn set_module(&mut self, id: &str, slot: usize, model: &str) -> Result<(), String> {
        let name = self
            .devices
            .iter()
            .find(|d| d.id == id)
            .map(|d| d.name.clone())
            .ok_or_else(|| "no such device".to_string())?;
        let n = Self::slot_count(&self.kind_of(id));
        if slot >= n {
            return Err(if n == 0 {
                format!("{name} has no module slots")
            } else {
                format!("{name} has slots 0-{}", n - 1)
            });
        }
        if !model.is_empty() && !Self::MODULE_MODELS.contains(&model) {
            return Err(format!("unknown module: {model}"));
        }
        let ports_for = |m: &str| -> Vec<String> {
            match m {
                "HWIC-2T" => vec!["Serial0/3/0".to_string(), "Serial0/3/1".to_string()],
                "NM-2FE2W" => vec!["FastEthernet0/0".to_string(), "FastEthernet0/1".to_string()],
                _ => Vec::new(),
            }
        };
        let current = self.modules(id).get(slot).cloned().flatten().unwrap_or_default();
        if current == model {
            return Ok(());
        }
        for port in ports_for(&current) {
            if self.port_used(id, &port) {
                return Err(format!(
                    "{port} is cabled; unplug it before removing the module"
                ));
            }
        }
        if let Some(dev) = self.devices.iter_mut().find(|d| d.id == id) {
            for port in ports_for(&current) {
                dev.ports.retain(|p| p.name != port);
            }
            for port in ports_for(model) {
                if !dev.ports.iter().any(|p| p.name == port) {
                    let (bandwidth_kbps, delay_us) = default_port_metrics(&port);
                    dev.ports.push(PortCfg {
                        name: port,
                        ip: None,
                        prefix: 24,
                        up: true,
                        bandwidth_kbps,
                        delay_us,
                        vlan: 1,
                        trunk: false,
                        dot1q: None,
                    });
                }
            }
        }
        let entry = self
            .slots
            .entry(id.to_string())
            .or_insert_with(|| vec![None; n]);
        entry.resize(n, None);
        entry[slot] = (!model.is_empty()).then(|| model.to_string());
        self.recompute_routing();
        Ok(())
    }
}
