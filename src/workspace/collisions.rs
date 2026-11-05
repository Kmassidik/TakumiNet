//! Hub collisions: IEEE 802.3 Clause 4 (CSMA/CD).
//!
//! A hub repeats every frame to every port, so two hosts that send in the
//! same tick collide and both frames are lost. A switch keeps each port on its
//! own collision domain, so the same pair never collides there.

use super::*;

impl Workspace {
    pub fn hub_collisions(&self, id: &str) -> u32 {
        self.collisions.get(id).copied().unwrap_or(0)
    }

    /// Send two or more frames in one tick. If their L2 paths meet at a hub,
    /// both collide, the hub's counter rises, and each frame is re-sent after
    /// a deterministic back-off of 1 to 3 ticks. Otherwise every frame is
    /// delivered normally.
    pub fn send_concurrent(&mut self, sends: &[(&str, &str)]) -> Vec<Result<(), String>> {
        let paths: Vec<Option<Vec<String>>> = sends
            .iter()
            .map(|(src, dst)| crate::net::v6::l2_path(self, src, dst))
            .collect();
        let hub = shared_hub(self, &paths);
        if let Some(hub_id) = hub {
            *self.collisions.entry(hub_id.clone()).or_insert(0) += 1;
            let hub_name = self
                .devices
                .iter()
                .find(|d| d.id == hub_id)
                .map(|d| d.name.clone())
                .unwrap_or(hub_id);
            for (index, (src, dst)) in sends.iter().enumerate() {
                self.advance((1 + index % 3) as f32 * 0.001);
                let _ = self.send_pdu(src, dst);
            }
            return sends
                .iter()
                .map(|_| Err(format!("collision on {hub_name}: frame lost, resent after back-off")))
                .collect();
        }
        sends.iter().map(|(src, dst)| self.send_pdu(src, dst)).collect()
    }

    /// Send one frame from each source to one destination at the same time.
    pub fn send_concurrent_to(&mut self, sources: &[&str], dst: &str) -> Vec<Result<(), String>> {
        let sends: Vec<(&str, &str)> = sources.iter().map(|src| (*src, dst)).collect();
        self.send_concurrent(&sends)
    }

    pub(super) fn collision_records(&self) -> String {
        let mut ids: Vec<_> = self.collisions.iter().collect();
        ids.sort_by_key(|(id, _)| id.as_str());
        let mut out = String::new();
        for (id, count) in ids {
            out.push_str(&format!("collisions\t{}\t{}\n", id, count));
        }
        out
    }
}

/// A hub that appears on at least two of the frames' paths.
fn shared_hub(ws: &Workspace, paths: &[Option<Vec<String>>]) -> Option<String> {
    for (index, path) in paths.iter().enumerate() {
        let Some(path) = path else { continue };
        for id in path {
            if ws
                .devices
                .iter()
                .find(|d| d.id == *id)
                .map_or(false, |d| d.kind == "hub")
            {
                let seen = paths
                    .iter()
                    .enumerate()
                    .filter(|(other, _)| *other != index)
                    .filter(|(_, p)| p.as_ref().map_or(false, |p| p.contains(id)))
                    .count();
                if seen >= 1 {
                    return Some(id.clone());
                }
            }
        }
    }
    None
}
