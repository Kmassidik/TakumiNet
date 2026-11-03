use super::*;

impl Workspace {
    pub(super) fn name_of(&self, id: &str) -> String {
        self.devices
            .iter()
            .find(|d| d.id == id)
            .map(|d| d.name.clone())
            .unwrap_or_else(|| id.to_string())
    }

    /// Shortest device path over existing links.
    pub fn path(&self, src: &str, dst: &str) -> Option<Vec<String>> {
        use std::collections::{HashMap as Map, VecDeque};
        let mut adj: Map<&str, Vec<&str>> = Map::new();
        for l in &self.links {
            adj.entry(&l.a).or_default().push(&l.b);
            adj.entry(&l.b).or_default().push(&l.a);
        }
        let mut seen = vec![src.to_string()];
        let mut q = VecDeque::new();
        q.push_back(vec![src.to_string()]);
        while let Some(path) = q.pop_front() {
            let last = path.last()?.clone();
            if last == dst {
                return Some(path);
            }
            if path.len() > 64 {
                continue;
            }
            for next in adj.get(last.as_str()).cloned().unwrap_or_default() {
                if seen.iter().any(|s| s == next) {
                    continue;
                }
                seen.push(next.to_string());
                let mut p = path.clone();
                p.push(next.to_string());
                q.push_back(p);
            }
        }
        None
    }

    /// Send one ICMP echo request through the frame-level engine and record it.
    pub fn send_pdu(&mut self, src: &str, dst: &str) -> Result<(), String> {
        self.validate_pdu(src, dst)?;
        match crate::net::fwd::deliver(self, src, dst) {
            Ok(delivery) => self.record_delivery(src, dst, "ICMP", delivery),
            Err(error) => self.record_drop(src, dst, "ICMP", error),
        }
    }

    /// Send an actual TCP/HTTP GET and retain its decoded capture.
    pub fn send_http(&mut self, src: &str, dst: &str, host: &str) -> Result<(), String> {
        self.validate_pdu(src, dst)?;
        match crate::net::fwd::deliver_http(self, src, dst, host) {
            Ok(delivery) => self.record_delivery(src, dst, "HTTP", delivery),
            Err(error) => self.record_drop(src, dst, "HTTP", error),
        }
    }

    fn validate_pdu(&self, src: &str, dst: &str) -> Result<(), String> {
        if !self.devices.iter().any(|d| d.id == src) {
            return Err(format!("unknown device {src}"));
        }
        if !self.devices.iter().any(|d| d.id == dst) {
            return Err(format!("unknown device {dst}"));
        }
        if src == dst {
            return Err("source and destination are the same".into());
        }
        Ok(())
    }

    fn record_delivery(
        &mut self,
        src: &str,
        dst: &str,
        proto: &str,
        delivery: crate::net::fwd::Delivery,
    ) -> Result<(), String> {
        let size = delivery.size();
        self.next_event += 1;
        self.sim_time = delivery.finished_at as f32;
        self.events.push(Event {
            id: self.next_event,
            time: self.sim_time,
            last: self.name_of(src),
            at: self.name_of(dst),
            kind: proto.into(),
            proto: proto.into(),
            path: delivery.path,
            hops: delivery.hops,
            layers: Vec::new(),
            status: "Successful".into(),
            reason: None,
            size,
        });
        let line = format!("{} -> {} {proto}", self.name_of(src), self.name_of(dst));
        self.syslog_record(src, "info", &line);
        self.syslog_record(dst, "info", &line);
        Ok(())
    }

    pub(super) fn record_drop(
        &mut self,
        src: &str,
        dst: &str,
        proto: &str,
        error: crate::net::fwd::DeliveryError,
    ) -> Result<(), String> {
        self.next_event += 1;
        self.sim_time = error.finished_at as f32;
        let reason = error.reason;
        self.events.push(Event {
            id: self.next_event,
            time: self.sim_time,
            last: self.name_of(src),
            at: self.name_of(dst),
            kind: proto.into(),
            proto: proto.into(),
            path: error.path,
            hops: error.hops,
            layers: Vec::new(),
            status: "Dropped".into(),
            reason: Some(reason.clone()),
            size: error.size,
        });
        Err(reason)
    }
}
