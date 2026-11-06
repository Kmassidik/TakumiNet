//! Frames a student has sent but not stepped through yet.
//!
//! Two Simple PDUs queued before the next Step share one wave, so they collide
//! on a hub exactly as two frames sent in the same tick would. The queue is
//! transient and is not saved.

use super::*;

impl Workspace {
    pub fn queue_pdu(&mut self, src: &str, dst: &str) -> Result<(), String> {
        if src == dst {
            return Err("source and destination are the same".into());
        }
        if !self.devices.iter().any(|d| d.id == src) {
            return Err(format!("unknown device {src}"));
        }
        if !self.devices.iter().any(|d| d.id == dst) {
            return Err(format!("unknown device {dst}"));
        }
        self.pending_pdu.push((src.to_string(), dst.to_string()));
        Ok(())
    }

    pub fn pending_pdus(&self) -> usize {
        self.pending_pdu.len()
    }

    /// Send every queued frame as one wave; collisions retry deterministically.
    pub fn flush_pending(&mut self) -> Vec<Result<(), String>> {
        let wave: Vec<(String, String)> = self.pending_pdu.drain(..).collect();
        let sends: Vec<(&str, &str)> = wave.iter().map(|(a, b)| (a.as_str(), b.as_str())).collect();
        self.send_concurrent(&sends)
    }
}

impl Workspace {
    pub(super) fn pending_records(&self) -> String {
        let mut out = String::new();
        for (src, dst) in &self.pending_pdu {
            out.push_str(&format!("pending\t{src}\t{dst}\n"));
        }
        out
    }

    pub(super) fn pending_load(&mut self, src: &str, dst: &str) {
        if self.devices.iter().any(|d| d.id == src) && self.devices.iter().any(|d| d.id == dst) {
            self.pending_pdu.push((src.to_string(), dst.to_string()));
        }
    }
}
