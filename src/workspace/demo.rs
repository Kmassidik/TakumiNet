use super::*;

impl Workspace {
    /// Sends the template's own traffic so the capture has something to play.
    /// Every step runs the same captured path the user would trigger by hand.
    /// A step that names a missing device or fails stops the run with a plain
    /// message; steps before it stay captured.
    pub fn run_demo(&mut self) -> Result<usize, String> {
        if self.demo.is_empty() {
            return Err("This network has no built-in traffic. Send a PDU to capture something.".into());
        }
        let steps = self.demo.clone();
        let mut wave: Vec<(String, String)> = Vec::new();
        for (index, step) in steps.iter().enumerate() {
            let flush = |ws: &mut Workspace, wave: &mut Vec<(String, String)>| -> Result<(), String> {
                if wave.is_empty() {
                    return Ok(());
                }
                let sends: Vec<(&str, &str)> =
                    wave.iter().map(|(a, b)| (a.as_str(), b.as_str())).collect();
                for result in ws.send_concurrent(&sends) {
                    if let Err(error) = result {
                        if !error.starts_with("collision on") {
                            return Err(format!("Built-in ping failed: {error}"));
                        }
                    }
                }
                wave.clear();
                Ok(())
            };
            let from_known = self.devices.iter().any(|device| device.id == step.from);
            let to_known = self.devices.iter().any(|device| device.id == step.to);
            if !from_known || (step.kind == "ping" && !to_known) {
                flush(self, &mut wave)?;
                let missing = if from_known { &step.to } else { &step.from };
                return Err(format!("Built-in traffic step {} names a device that is not here: {missing}", index + 1));
            }
            match step.kind.as_str() {
                "ping" => {
                    if !self.devices.iter().find(|d| d.id == step.from).is_some_and(|d| d.ip.is_some() || d.ports.iter().any(|p| p.ip.is_some()))
                        || !self.devices.iter().find(|d| d.id == step.to).is_some_and(|d| d.ip.is_some() || d.ports.iter().any(|p| p.ip.is_some()))
                    {
                        flush(self, &mut wave)?;
                        return Err(format!("Built-in ping from {} failed: source and destination must have IPv4 addresses", self.name_of(&step.from)));
                    }
                    wave.push((step.from.clone(), step.to.clone()));
                }
                "http" => {
                    flush(self, &mut wave)?;
                    crate::webapp::fetch(self, &step.from, &step.url)
                        .map_err(|error| format!("Built-in page request from {} failed: {error}", self.name_of(&step.from)))?;
                }
                other => {
                    flush(self, &mut wave)?;
                    return Err(format!("Built-in traffic step {} has an unknown kind '{other}'", index + 1));
                }
            }
        }
        {
            let sends: Vec<(&str, &str)> =
                wave.iter().map(|(a, b)| (a.as_str(), b.as_str())).collect();
            for result in self.send_concurrent(&sends) {
                if let Err(error) = result {
                    if !error.starts_with("collision on") {
                        return Err(format!("Built-in ping failed: {error}"));
                    }
                }
            }
        }
        Ok(steps.len())
    }
}
