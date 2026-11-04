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
        match self.guest_blocked(src, dst) {
            Some(reason) => Err(reason),
            None => Ok(()),
        }
    }

    pub(super) fn record_delivery(
        &mut self,
        src: &str,
        dst: &str,
        proto: &str,
        mut delivery: crate::net::fwd::Delivery,
    ) -> Result<(), String> {
        if let Some(arp) = delivery.arp.take() {
            self.record_arp_exchange(arp);
        }
        let bytes = delivery.frame.to_bytes();
        let size = bytes.len();
        let mut note = hop_narration(&delivery.hops);
        if note.is_empty() {
            note = format!("{} delivers {proto} to {}", self.name_of(src), self.name_of(dst));
        }
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
            note,
            bytes,
            size,
        });
        let line = format!("{} -> {} {proto}", self.name_of(src), self.name_of(dst));
        self.syslog_record(src, "info", &line);
        self.syslog_record(dst, "info", &line);
        Ok(())
    }

    pub(super) fn record_arp_exchange(&mut self, exchange: crate::net::fwd::ArpExchange) {
        for captured in [exchange.request, exchange.reply] {
            let size = captured.bytes.len();
            self.next_event += 1;
            self.sim_time = captured.finished_at as f32;
            self.events.push(Event {
                id: self.next_event,
                time: self.sim_time,
                last: self.name_of(&captured.src),
                at: self.name_of(&captured.dst),
                kind: "ARP".into(),
                proto: "ARP".into(),
                path: captured.path,
                hops: captured.hops,
                layers: Vec::new(),
                status: "Successful".into(),
                reason: None,
                note: captured.note,
                bytes: captured.bytes,
                size,
            });
        }
    }

    pub(super) fn record_drop(
        &mut self,
        src: &str,
        dst: &str,
        proto: &str,
        mut error: crate::net::fwd::DeliveryError,
    ) -> Result<(), String> {
        if let Some(arp) = error.arp.take() {
            self.record_arp_exchange(arp);
        }
        self.next_event += 1;
        self.sim_time = error.finished_at as f32;
        let reason = error.reason;
        let mut note = hop_narration(&error.hops);
        if !note.is_empty() {
            note.push_str("; ");
        }
        note.push_str(&reason);
        let bytes = error.frame.map(|frame| frame.to_bytes()).unwrap_or_default();
        let size = if bytes.is_empty() { error.size } else { bytes.len() };
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
            note,
            bytes,
            size,
        });
        Err(reason)
    }
}

fn hop_narration(hops: &[crate::net::fwd::Hop]) -> String {
    let mut note = String::new();
    for hop in hops.iter().filter(|hop| !hop.note.is_empty()) {
        if !note.is_empty() {
            note.push_str("; ");
        }
        note.push_str(&hop.note);
    }
    note
}
