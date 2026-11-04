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
        for (index, step) in steps.iter().enumerate() {
            let known = |id: &str| self.devices.iter().any(|device| device.id == id);
            if !known(&step.from) || (step.kind == "ping" && !known(&step.to)) {
                let missing = if known(&step.from) { &step.to } else { &step.from };
                return Err(format!("Built-in traffic step {} names a device that is not here: {missing}", index + 1));
            }
            match step.kind.as_str() {
                "ping" => self.send_addressed_pdu(&step.from, &step.to)
                    .map_err(|error| format!("Built-in ping from {} failed: {error}", self.name_of(&step.from)))?,
                "http" => {
                    crate::webapp::fetch(self, &step.from, &step.url)
                        .map_err(|error| format!("Built-in page request from {} failed: {error}", self.name_of(&step.from)))?;
                }
                other => return Err(format!("Built-in traffic step {} has an unknown kind '{other}'", index + 1)),
            }
        }
        Ok(steps.len())
    }
}
