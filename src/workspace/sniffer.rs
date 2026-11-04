//! The sniffer's capture buffer: an in-path sniffer passes every frame on
//! unchanged and keeps a bounded record of what crossed it.

use super::*;

/// One captured frame, already summarised for the Capture app.
#[derive(Clone, Debug)]
pub struct SnifferRow {
    /// Simulated arrival time in seconds.
    pub t: f64,
    pub src_mac: String,
    pub dst_mac: String,
    /// `0x0800` for IPv4, `0x0806` for ARP.
    pub ethertype: String,
    /// Empty for frames without an IPv4 header (ARP carries the ARP addresses).
    pub src_ip: String,
    pub dst_ip: String,
    /// `icmp`, `tcp`, `udp` or `arp`.
    pub proto: String,
    /// Frame size in bytes on the wire.
    pub length: usize,
    /// One line of what this frame is.
    pub info: String,
}

/// A sniffer keeps the last 200 frames; older ones fall off the front.
pub const SNIFFER_BUFFER: usize = 200;

impl Tables {
    /// Record one frame on a sniffer, dropping the oldest past the bound.
    pub fn sniff(&mut self, id: &str, row: SnifferRow) {
        let rows = self.sniffer.entry(id.to_string()).or_default();
        rows.push(row);
        if rows.len() > SNIFFER_BUFFER {
            let overflow = rows.len() - SNIFFER_BUFFER;
            rows.drain(..overflow);
        }
    }

    /// Captured frames for one sniffer, oldest first.
    pub fn sniffer_rows(&self, id: &str) -> &[SnifferRow] {
        self.sniffer.get(id).map(Vec::as_slice).unwrap_or(&[])
    }

    pub fn sniffer_clear(&mut self, id: &str) {
        self.sniffer.remove(id);
    }
}

impl Workspace {
    /// How many captured frames on `id` match a protocol and a host address.
    /// An empty filter matches everything.
    pub fn sniffer_match_count(&self, id: &str, proto: &str, host: &str) -> usize {
        self.tables
            .sniffer_rows(id)
            .iter()
            .filter(|row| proto.is_empty() || row.proto == proto)
            .filter(|row| host.is_empty() || row.src_ip == host || row.dst_ip == host)
            .count()
    }
}
