//! Drop a deterministic share of frames crossing a duplex-mismatch link.
//!
//! IEEE 802.3 Clause 28: when one end is fixed and the other is auto,
//! the auto end falls back to half duplex.  Late collisions and CRC errors
//! are the real-world symptom, so we model it by dropping every 4th frame
//! crossing that link.

use crate::workspace::{Device, Workspace};

/// Per-link counters accumulated during one simulation session.
#[derive(Clone, Default)]
pub struct Counters {
    /// CRC errors from late collisions on a duplex-mismatch link.
    pub crc_errors: u32,
    /// How many frames crossed this link (for the 1-in-4 drop).
    pub frames_seen: u32,
}

impl Workspace {
    /// Return the counters for a link (keyed by device id + port).
    pub fn link_counters_mut(&mut self, device: &str, port: &str) -> &mut Counters {
        self.link_counters.entry(device.to_string() + "\t" + port).or_default()
    }

    /// Check whether a link has a duplex mismatch and, if so, drop this
    /// frame deterministically (every 4th).  Returns the drop reason text
    /// or `None` when the frame passes.
    pub fn check_duplex_mismatch(&mut self, dev: &Device, port: &str) -> Option<String> {
        let negotiated = self.negotiated(&dev.id, port);
        if let Some(n) = negotiated {
            if n.duplex_mismatch() {
                let counters = self.link_counters_mut(&dev.id, port);
                counters.frames_seen += 1;
                if counters.frames_seen % 4 == 0 {
                    counters.crc_errors += 1;
                    return Some(format!(
                        "duplex mismatch on {} {}: late collisions",
                        dev.name, port
                    ));
                }
                return None;
            }
        }
        None
    }

    /// Reset all per-link counters (called from `/api/reset`).
    pub fn reset_counters(&mut self) {
        for c in self.link_counters.values_mut() {
            c.crc_errors = 0;
            c.frames_seen = 0;
        }
    }

    /// Return the total CRC errors for a link.
    pub fn crc_errors_for(&self, device: &str, port: &str) -> u32 {
        self.link_counters
            .get(&format!("{device}\t{port}"))
            .map(|c| c.crc_errors)
            .unwrap_or(0)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn counters_start_at_zero() {
        let mut ws = Workspace::new();
        assert_eq!(ws.crc_errors_for("sw", "FastEthernet0/1"), 0);
    }

    #[test]
    fn reset_clears_counters() {
        let mut ws = Workspace::new();
        let counters = ws.link_counters_mut("sw", "FastEthernet0/1");
        counters.crc_errors = 42;
        counters.frames_seen = 100;
        ws.reset_counters();
        assert_eq!(ws.crc_errors_for("sw", "FastEthernet0/1"), 0);
        assert_eq!(ws.link_counters_mut("sw", "FastEthernet0/1").frames_seen, 0);
    }
}
