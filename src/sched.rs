//! Discrete-event scheduling for simulated traffic.
//!
//! Packet Tracer advances a simulated clock in 1 ms ticks. One delivery becomes
//! one arrival per device, each queued at `now + hop * 1 ms`; multiple PDUs in
//! flight are ordered by their arrival time, not by the order they were sent.

use std::cmp::Ordering;
use std::collections::BinaryHeap;

/// One scheduled arrival.
#[derive(Clone, Debug, PartialEq)]
pub struct Arrival {
    pub at: f64,
    /// Index of the device in the delivery path.
    pub hop: usize,
    pub device: String,
}

impl PartialOrd for Arrival {
    fn partial_cmp(&self, other: &Self) -> Option<Ordering> {
        Some(self.cmp(other))
    }
}

impl Eq for Arrival {}

impl Ord for Arrival {
    fn cmp(&self, other: &Self) -> Ordering {
        // Reversed so `BinaryHeap` pops the earliest arrival first.
        other
            .at
            .partial_cmp(&self.at)
            .unwrap_or(Ordering::Equal)
            .then_with(|| other.hop.cmp(&self.hop))
    }
}

/// A min-heap of pending arrivals keyed on simulated time.
#[derive(Clone, Debug, Default)]
pub struct Scheduler {
    queue: BinaryHeap<Arrival>,
}

impl Scheduler {
    pub fn new() -> Scheduler {
        Scheduler::default()
    }

    /// Queue one arrival per device on `path`, starting at `start`.
    /// Returns the arrival times in path order.
    pub fn schedule(&mut self, start: f64, path: &[String]) -> Vec<f64> {
        let mut times = Vec::with_capacity(path.len());
        for (hop, device) in path.iter().enumerate() {
            let at = start + 0.001 * (hop + 1) as f64;
            times.push(at);
            self.queue.push(Arrival {
                at,
                hop,
                device: device.clone(),
            });
        }
        times
    }

    /// Earliest pending arrival, advancing nothing by itself.
    pub fn pop(&mut self) -> Option<Arrival> {
        self.queue.pop()
    }

    pub fn pending(&self) -> usize {
        self.queue.len()
    }

    pub fn is_empty(&self) -> bool {
        self.queue.is_empty()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn path(names: &[&str]) -> Vec<String> {
        names.iter().map(|s| s.to_string()).collect()
    }

    #[test]
    fn arrives_one_tick_per_hop_in_order() {
        let mut s = Scheduler::new();
        let times = s.schedule(0.0, &path(&["pc0", "sw0", "r0", "pc1"]));
        assert_eq!(times.len(), 4);
        assert!((times[0] - 0.001).abs() < 1e-9);
        assert!((times[3] - 0.004).abs() < 1e-9);
        assert!(times.windows(2).all(|w| w[1] > w[0]));

        let mut seen = Vec::new();
        while let Some(a) = s.pop() {
            seen.push(a.device);
        }
        assert_eq!(seen, path(&["pc0", "sw0", "r0", "pc1"]));
        assert!(s.is_empty());
    }

    #[test]
    fn interleaves_two_deliveries_by_time() {
        let mut s = Scheduler::new();
        s.schedule(0.0, &path(&["a", "b", "c"]));
        s.schedule(0.0005, &path(&["x", "y"]));
        let mut order = Vec::new();
        while let Some(a) = s.pop() {
            order.push(a.device);
        }
        // The second delivery's first arrival (0.0015) beats the first
        // delivery's third (0.003).
        assert_eq!(order, vec!["a", "x", "b", "y", "c"]);
    }

    #[test]
    fn empty_scheduler_pops_nothing() {
        let mut s = Scheduler::new();
        assert_eq!(s.pending(), 0);
        assert!(s.pop().is_none());
    }
}
