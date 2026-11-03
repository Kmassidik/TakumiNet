//! Frame and packet objects the simulator actually moves.
//!
//! `sim.rs` answers "which devices does this traverse?". This module owns the
//! bytes that make that answer true: MAC addresses, Ethernet framing, IPv4
//! headers with a real TTL and checksum, ICMP echo, plus the two tables a
//! switch/router keeps (MAC learning, ARP resolution) and their ageing.

use std::collections::HashMap;
use std::fmt;

/// A 48-bit IEEE MAC address.
#[derive(Clone, Copy, PartialEq, Eq, Hash, PartialOrd, Ord)]
pub struct Mac(pub [u8; 6]);

impl Mac {
    pub const BROADCAST: Mac = Mac([0xff; 6]);

    pub fn parse(s: &str) -> Option<Mac> {
        let clean: String = s.chars().filter(|c| *c != '.' && *c != '-' && *c != ':').collect();
        if clean.len() != 12 {
            return None;
        }
        let mut out = [0u8; 6];
        for (i, b) in out.iter_mut().enumerate() {
            *b = u8::from_str_radix(&clean[i * 2..i * 2 + 2], 16).ok()?;
        }
        Some(Mac(out))
    }

    /// Deterministic MAC for a device id, in Cisco's `00:d0:ba` OUI space.
    pub fn for_device(id: &str) -> Mac {
        let mut h: u32 = 0x811c9dc5;
        for b in id.as_bytes() {
            h ^= *b as u32;
            h = h.wrapping_mul(0x01000193);
        }
        Mac([
            0x00,
            0xd0,
            0xba,
            (h >> 16) as u8,
            (h >> 8) as u8,
            h as u8,
        ])
    }

    pub fn is_broadcast(&self) -> bool {
        *self == Mac::BROADCAST
    }

    pub fn is_multicast(&self) -> bool {
        self.0[0] & 1 == 1
    }
}

impl fmt::Display for Mac {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(
            f,
            "{:02x}{:02x}.{:02x}{:02x}.{:02x}{:02x}",
            self.0[0], self.0[1], self.0[2], self.0[3], self.0[4], self.0[5]
        )
    }
}

impl fmt::Debug for Mac {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        fmt::Display::fmt(self, f)
    }
}

#[derive(Clone, Copy, PartialEq, Eq, Debug)]
pub enum EtherType {
    Ipv4,
    Arp,
}

impl EtherType {
    fn code(self) -> u16 {
        match self {
            EtherType::Ipv4 => 0x0800,
            EtherType::Arp => 0x0806,
        }
    }

    fn from_code(code: u16) -> Option<EtherType> {
        match code {
            0x0800 => Some(EtherType::Ipv4),
            0x0806 => Some(EtherType::Arp),
            _ => None,
        }
    }
}

#[derive(Clone, Copy, PartialEq, Eq, Debug)]
pub enum IpProto {
    Icmp,
    Tcp,
    Udp,
}

impl IpProto {
    fn code(self) -> u8 {
        match self {
            IpProto::Icmp => 1,
            IpProto::Tcp => 6,
            IpProto::Udp => 17,
        }
    }

    fn from_code(code: u8) -> Option<IpProto> {
        match code {
            1 => Some(IpProto::Icmp),
            6 => Some(IpProto::Tcp),
            17 => Some(IpProto::Udp),
            _ => None,
        }
    }
}

/// Internet checksum (RFC 1071) over the header words.
pub fn checksum(bytes: &[u8]) -> u16 {
    let mut sum: u32 = 0;
    let mut pairs = bytes.chunks(2);
    for pair in &mut pairs {
        let hi = pair[0] as u32;
        let lo = *pair.get(1).unwrap_or(&0) as u32;
        sum += (hi << 8) | lo;
    }
    while sum >> 16 != 0 {
        sum = (sum & 0xffff) + (sum >> 16);
    }
    !(sum as u16)
}

/// The network layer unit a router rewrites hop by hop.
#[derive(Clone, PartialEq, Eq, Debug)]
pub struct Packet {
    pub src: u32,
    pub dst: u32,
    pub ttl: u8,
    pub proto: IpProto,
    /// ICMP echo fields when `proto == Icmp`; opaque bytes otherwise.
    pub payload: Payload,
}

#[derive(Clone, PartialEq, Eq, Debug)]
pub enum Payload {
    EchoRequest { id: u16, seq: u16 },
    EchoReply { id: u16, seq: u16 },
    Bytes(Vec<u8>),
}

impl Packet {
    pub fn echo_request(src: u32, dst: u32, id: u16, seq: u16) -> Packet {
        Packet {
            src,
            dst,
            ttl: 128,
            proto: IpProto::Icmp,
            payload: Payload::EchoRequest { id, seq },
        }
    }

    /// One HTTP GET in a TCP segment, including a valid TCP checksum.
    pub fn http_request(src: u32, dst: u32, host: &str) -> Packet {
        let request = format!("GET / HTTP/1.1\r\nHost: {host}\r\nConnection: close\r\n\r\n");
        let mut tcp = Vec::with_capacity(20 + request.len());
        tcp.extend(49_152u16.to_be_bytes());
        tcp.extend(80u16.to_be_bytes());
        tcp.extend(1u32.to_be_bytes());
        tcp.extend(0u32.to_be_bytes());
        tcp.extend([5 << 4, 0x08]); // 20-byte header, PSH
        tcp.extend(65_535u16.to_be_bytes());
        tcp.extend([0, 0]); // checksum, filled below
        tcp.extend([0, 0]); // urgent pointer
        tcp.extend(request.as_bytes());

        let mut pseudo = Vec::with_capacity(12 + tcp.len());
        pseudo.extend(src.to_be_bytes());
        pseudo.extend(dst.to_be_bytes());
        pseudo.extend([0, IpProto::Tcp.code()]);
        pseudo.extend((tcp.len() as u16).to_be_bytes());
        pseudo.extend(&tcp);
        let sum = checksum(&pseudo);
        tcp[16..18].copy_from_slice(&sum.to_be_bytes());

        Packet {
            src,
            dst,
            ttl: 128,
            proto: IpProto::Tcp,
            payload: Payload::Bytes(tcp),
        }
    }

    /// Serialize the IPv4 header with a correct checksum, then the payload.
    pub fn to_bytes(&self) -> Vec<u8> {
        let mut hdr = vec![0u8; 20];
        hdr[0] = 0x45; // version 4, IHL 5
        hdr[1] = 0;
        let total = 20 + self.payload_len() as u16;
        hdr[2..4].copy_from_slice(&total.to_be_bytes());
        hdr[4..6].copy_from_slice(&0u16.to_be_bytes()); // id
        hdr[6..8].copy_from_slice(&0u16.to_be_bytes()); // flags + frag
        hdr[8] = self.ttl;
        hdr[9] = self.proto.code();
        hdr[12..16].copy_from_slice(&self.src.to_be_bytes());
        hdr[16..20].copy_from_slice(&self.dst.to_be_bytes());
        let sum = checksum(&hdr);
        hdr[10..12].copy_from_slice(&sum.to_be_bytes());
        let mut out = hdr;
        out.extend(self.payload_bytes());
        out
    }

    pub fn payload_len(&self) -> usize {
        match &self.payload {
            // 8-byte ICMP header plus the 32 bytes of data PT pings with.
            Payload::EchoRequest { .. } | Payload::EchoReply { .. } => 8 + ECHO_DATA.len(),
            Payload::Bytes(b) => b.len(),
        }
    }

    fn payload_bytes(&self) -> Vec<u8> {
        match &self.payload {
            Payload::EchoRequest { id, seq } => icmp(8, *id, *seq),
            Payload::EchoReply { id, seq } => icmp(0, *id, *seq),
            Payload::Bytes(b) => b.clone(),
        }
    }
}

/// Packet Tracer's default ping data: 32 bytes.
const ECHO_DATA: &[u8; 32] = b"abcdefghijklmnopqrstuvwxyz012345";

/// ICMP header + echo body, with the checksum filled in.
fn icmp(kind: u8, id: u16, seq: u16) -> Vec<u8> {
    let mut out = vec![kind, 0, 0, 0];
    out.extend(id.to_be_bytes());
    out.extend(seq.to_be_bytes());
    out.extend(ECHO_DATA);
    let sum = checksum(&out);
    out[2..4].copy_from_slice(&sum.to_be_bytes());
    out
}

/// An Ethernet frame: what a switch forwards and rewrites at every hop.
#[derive(Clone, PartialEq, Eq, Debug)]
pub struct Frame {
    pub dst: Mac,
    pub src: Mac,
    pub kind: EtherType,
    pub packet: Packet,
}

impl Frame {
    pub fn ipv4(dst: Mac, src: Mac, packet: Packet) -> Frame {
        Frame {
            dst,
            src,
            kind: EtherType::Ipv4,
            packet,
        }
    }

    /// Re-encapsulate for the next hop: new L2 header, same L3 packet.
    pub fn hop(&self, dst: Mac, src: Mac) -> Frame {
        Frame {
            dst,
            src,
            kind: self.kind,
            packet: self.packet.clone(),
        }
    }

    pub fn to_bytes(&self) -> Vec<u8> {
        let mut out = Vec::with_capacity(14 + self.packet.to_bytes().len());
        out.extend(self.dst.0);
        out.extend(self.src.0);
        out.extend(self.kind.code().to_be_bytes());
        out.extend(self.packet.to_bytes());
        out
    }

    /// Decode a complete Ethernet frame, rejecting truncation and bad headers.
    pub fn parse(bytes: &[u8]) -> Option<Frame> {
        if bytes.len() < 34 {
            return None;
        }
        let mut dst = [0u8; 6];
        let mut src = [0u8; 6];
        dst.copy_from_slice(&bytes[0..6]);
        src.copy_from_slice(&bytes[6..12]);
        let kind = EtherType::from_code(u16::from_be_bytes([bytes[12], bytes[13]]))?;
        if kind != EtherType::Ipv4 {
            return None;
        }
        let hdr = &bytes[14..34];
        if hdr[0] >> 4 != 4 {
            return None;
        }
        let ihl = ((hdr[0] & 0x0f) as usize) * 4;
        if ihl < 20 || hdr.len() < ihl {
            return None;
        }
        let header_sum = u16::from_be_bytes([hdr[10], hdr[11]]);
        let mut zeroed = hdr[..ihl].to_vec();
        zeroed[10] = 0;
        zeroed[11] = 0;
        if checksum(&zeroed) != header_sum {
            return None;
        }
        let proto = IpProto::from_code(hdr[9])?;
        let total = u16::from_be_bytes([hdr[2], hdr[3]]) as usize;
        let body_start = 14 + ihl;
        let body_end = (14 + total).min(bytes.len());
        if body_start > body_end {
            return None;
        }
        let body = &bytes[body_start..body_end];
        let payload = match proto {
            IpProto::Icmp if body.len() >= 8 => {
                let id = u16::from_be_bytes([body[4], body[5]]);
                let seq = u16::from_be_bytes([body[6], body[7]]);
                match body[0] {
                    8 => Payload::EchoRequest { id, seq },
                    0 => Payload::EchoReply { id, seq },
                    _ => Payload::Bytes(body.to_vec()),
                }
            }
            _ => Payload::Bytes(body.to_vec()),
        };
        Some(Frame {
            dst: Mac(dst),
            src: Mac(src),
            kind,
            packet: Packet {
                src: u32::from_be_bytes([hdr[12], hdr[13], hdr[14], hdr[15]]),
                dst: u32::from_be_bytes([hdr[16], hdr[17], hdr[18], hdr[19]]),
                ttl: hdr[8],
                proto,
                payload,
            },
        })
    }
}

/// Result of a router handling an inbound packet.
#[derive(Clone, PartialEq, Eq, Debug)]
pub enum Transit {
    /// Forward with the decremented TTL.
    Forward(Packet),
    /// TTL hit zero: the router answers with ICMP time exceeded.
    TimeExceeded(Packet),
}

impl Packet {
    /// A router decrements the TTL and drops the datagram when the result is
    /// zero, answering with ICMP time exceeded (RFC 1812 §5.3.1).
    pub fn transit(&self) -> Transit {
        if self.ttl <= 1 {
            return Transit::TimeExceeded(self.clone());
        }
        Transit::Forward(Packet {
            ttl: self.ttl - 1,
            ..self.clone()
        })
    }

    /// TTL is not part of the payload, so a drop only depends on the counter.
    pub fn is_for(&self, ip: u32) -> bool {
        self.dst == ip
    }
}

/// One learned (MAC, port) binding.
#[derive(Clone, Copy, PartialEq, Debug)]
pub struct MacEntry {
    pub mac: Mac,
    pub port: usize,
    pub learned_at: f64,
    pub static_entry: bool,
}

/// A switch's forwarding table.
#[derive(Clone, Debug, Default)]
pub struct MacTable {
    entries: HashMap<Mac, MacEntry>,
    aging: f64,
}

impl MacTable {
    pub fn new(aging: f64) -> MacTable {
        MacTable {
            entries: HashMap::new(),
            aging,
        }
    }

    /// Learn on ingress only when the frame is not from the interface's own MAC.
    pub fn learn(&mut self, mac: Mac, port: usize, now: f64) {
        if mac.is_multicast() {
            return;
        }
        match self.entries.get_mut(&mac) {
            Some(e) => {
                e.port = port;
                e.learned_at = now;
            }
            None => {
                self.entries.insert(
                    mac,
                    MacEntry {
                        mac,
                        port,
                        learned_at: now,
                        static_entry: false,
                    },
                );
            }
        }
    }

    pub fn lookup(&self, mac: Mac, now: f64) -> Option<MacEntry> {
        let e = *self.entries.get(&mac)?;
        if !e.static_entry && now - e.learned_at > self.aging {
            return None;
        }
        Some(e)
    }

    /// Broadcast, multicast and unknown unicast flood every port but ingress.
    pub fn flood(&self, ingress: usize, ports: usize) -> Vec<usize> {
        (0..ports).filter(|p| *p != ingress).collect()
    }

    /// Drop bindings older than the ageing time.
    pub fn age(&mut self, now: f64) -> usize {
        let cutoff = now - self.aging;
        let before = self.entries.len();
        self.entries
            .retain(|_, e| e.static_entry || e.learned_at > cutoff);
        before - self.entries.len()
    }

    pub fn len(&self) -> usize {
        self.entries.len()
    }

    pub fn is_empty(&self) -> bool {
        self.entries.is_empty()
    }

    /// `show mac address-table` rows, ordered by port then MAC.
    pub fn rows(&self) -> Vec<MacEntry> {
        let mut out: Vec<MacEntry> = self.entries.values().copied().collect();
        out.sort_by_key(|e| (e.port, e.mac));
        out
    }
}

/// A resolved (IPv4, MAC) pair with an expiry.
#[derive(Clone, Copy, PartialEq, Debug)]
pub struct ArpEntry {
    pub ip: u32,
    pub mac: Mac,
    pub learned_at: f64,
}

/// An ARP cache. Unresolved traffic is dropped by the caller, which then emits
/// the ARP request — the same ordering a real host does.
#[derive(Clone, Debug, Default)]
pub struct ArpTable {
    entries: HashMap<u32, ArpEntry>,
    timeout: f64,
}

impl ArpTable {
    pub fn new(timeout: f64) -> ArpTable {
        ArpTable {
            entries: HashMap::new(),
            timeout,
        }
    }

    pub fn insert(&mut self, ip: u32, mac: Mac, now: f64) {
        self.entries.insert(
            ip,
            ArpEntry {
                ip,
                mac,
                learned_at: now,
            },
        );
    }

    pub fn lookup(&self, ip: u32, now: f64) -> Option<Mac> {
        let e = self.entries.get(&ip)?;
        if now - e.learned_at > self.timeout {
            return None;
        }
        Some(e.mac)
    }

    pub fn expire(&mut self, now: f64) -> usize {
        let cutoff = now - self.timeout;
        let before = self.entries.len();
        self.entries.retain(|_, e| e.learned_at > cutoff);
        before - self.entries.len()
    }

    /// `show arp` rows, ordered by address.
    pub fn rows(&self) -> Vec<ArpEntry> {
        let mut out: Vec<ArpEntry> = self.entries.values().copied().collect();
        out.sort_by_key(|e| e.ip);
        out
    }

    pub fn len(&self) -> usize {
        self.entries.len()
    }

    pub fn is_empty(&self) -> bool {
        self.entries.is_empty()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn mac_round_trips_cisco_and_colon_forms() {
        let m = Mac::parse("00D0.BA12.3456").unwrap();
        assert_eq!(m.0, [0x00, 0xd0, 0xba, 0x12, 0x34, 0x56]);
        assert_eq!(m.to_string(), "00d0.ba12.3456");
        assert_eq!(Mac::parse("00:d0:ba:12:34:56"), Some(m));
        assert_eq!(Mac::parse("00-d0-ba-12-34-56"), Some(m));
        assert_eq!(Mac::parse("00d0.ba12"), None);
        assert_eq!(Mac::parse("zzD0.BA12.3456"), None);
        assert!(Mac::BROADCAST.is_broadcast());
        assert!(Mac::parse("01:00:5e:00:00:01").unwrap().is_multicast());
        assert!(!m.is_multicast());
    }

    #[test]
    fn device_macs_are_stable_and_unique() {
        assert_eq!(Mac::for_device("pc0"), Mac::for_device("pc0"));
        assert_ne!(Mac::for_device("pc0"), Mac::for_device("pc1"));
        assert_eq!(Mac::for_device("pc0").0[..3], [0x00, 0xd0, 0xba]);
    }

    #[test]
    fn checksum_matches_a_known_ip_header() {
        // 192.168.1.1 -> 192.168.2.1, TTL 64, ICMP, 20-byte header, zero sum.
        let hdr = [
            0x45, 0x00, 0x00, 0x1c, 0x00, 0x00, 0x00, 0x00, 0x40, 0x01, 0x00, 0x00, 0xc0, 0xa8,
            0x01, 0x01, 0xc0, 0xa8, 0x02, 0x01,
        ];
        let sum = checksum(&hdr);
        let mut check = hdr;
        check[10] = (sum >> 8) as u8;
        check[11] = sum as u8;
        assert_eq!(checksum(&check), 0);
    }

    #[test]
    fn http_request_is_a_checksummed_tcp_segment() {
        let packet = Packet::http_request(0xc0a8010a, 0xc0a80214, "web.lab");
        assert_eq!(packet.proto, IpProto::Tcp);
        let Payload::Bytes(tcp) = &packet.payload else {
            panic!("HTTP did not use a TCP byte payload");
        };
        assert_eq!(&tcp[..4], &[0xc0, 0x00, 0x00, 0x50]);
        assert!(std::str::from_utf8(&tcp[20..]).unwrap().starts_with("GET / HTTP/1.1\r\nHost: web.lab\r\n"));

        let mut pseudo = Vec::new();
        pseudo.extend(packet.src.to_be_bytes());
        pseudo.extend(packet.dst.to_be_bytes());
        pseudo.extend([0, 6]);
        pseudo.extend((tcp.len() as u16).to_be_bytes());
        pseudo.extend(tcp);
        assert_eq!(checksum(&pseudo), 0, "invalid TCP checksum");
    }

    #[test]
    fn frame_survives_encode_decode() {
        let p = Packet::echo_request(0xc0a80101, 0xc0a80201, 7, 3);
        let f = Frame::ipv4(Mac::BROADCAST, Mac::for_device("pc0"), p.clone());
        let bytes = f.to_bytes();
        let back = Frame::parse(&bytes).expect("decode");
        assert_eq!(back, f);
        assert_eq!(back.packet.payload, p.payload);
    }

    #[test]
    fn parse_rejects_corruption_and_truncation() {
        let f = Frame::ipv4(
            Mac::BROADCAST,
            Mac::for_device("pc0"),
            Packet::echo_request(1, 2, 0, 0),
        );
        let mut bytes = f.to_bytes();
        assert!(Frame::parse(&bytes[..bytes.len() - 1]).is_some()); // total length trims
        assert!(Frame::parse(&bytes[..20]).is_none());
        bytes[24] ^= 0xff; // corrupt the destination address field
        assert!(Frame::parse(&bytes).is_none());
    }

    #[test]
    fn router_decrements_ttl_and_drops_at_zero() {
        let mut p = Packet::echo_request(1, 2, 0, 1);
        p.ttl = 2;
        match p.transit() {
            Transit::Forward(next) => assert_eq!(next.ttl, 1),
            other => panic!("expected forward, got {other:?}"),
        }
        p.ttl = 1;
        assert!(matches!(p.transit(), Transit::TimeExceeded(_)));
        p.ttl = 0;
        assert!(matches!(p.transit(), Transit::TimeExceeded(_)));
    }

    #[test]
    fn mac_table_learns_ages_and_floods() {
        let mut t = MacTable::new(300.0);
        let a = Mac::for_device("pc0");
        t.learn(a, 1, 10.0);
        assert_eq!(t.lookup(a, 10.5).map(|e| e.port), Some(1));
        assert_eq!(t.lookup(a, 311.0), None, "aged out");
        t.learn(a, 2, 20.0);
        assert_eq!(t.lookup(a, 21.0).map(|e| e.port), Some(2), "relearned port");
        t.learn(Mac::BROADCAST, 3, 20.0);
        assert_eq!(t.len(), 1, "multicast is never learned");
        assert_eq!(t.flood(1, 4), vec![0, 2, 3]);
        assert_eq!(t.age(400.0), 1);
        assert!(t.is_empty());
    }

    #[test]
    fn arp_cache_expires() {
        let mut c = ArpTable::new(120.0);
        let ip = 0xc0a80101;
        c.insert(ip, Mac::for_device("pc1"), 5.0);
        assert_eq!(c.lookup(ip, 100.0), Some(Mac::for_device("pc1")));
        assert_eq!(c.lookup(ip, 126.0), None);
        assert_eq!(c.expire(200.0), 1);
        assert!(c.is_empty());
    }
}
