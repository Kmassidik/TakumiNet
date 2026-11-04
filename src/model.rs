//! Topology domain model.
//!
//! Deliberately free of any simulator-specific behaviour: devices, interfaces,
//! links and routes only. Everything learned from REA lands here first.

use std::fmt::Write as _;

#[derive(Clone, Copy, PartialEq, Eq, Debug)]
pub enum Kind {
    Pc,
    Switch,
    Router,
}

impl Kind {
    pub fn as_str(self) -> &'static str {
        match self {
            Kind::Pc => "pc",
            Kind::Switch => "switch",
            Kind::Router => "router",
        }
    }

    /// Only L3 devices consult a routing table; switches forward on L2.
    pub fn is_l3(self) -> bool {
        !matches!(self, Kind::Switch)
    }
}

pub fn parse_ipv4(s: &str) -> Option<u32> {
    let mut v: u32 = 0;
    let mut n = 0;
    for part in s.split('.') {
        let octet: u32 = part.parse().ok()?;
        if octet > 255 {
            return None;
        }
        v = (v << 8) | octet;
        n += 1;
    }
    if n == 4 {
        Some(v)
    } else {
        None
    }
}

pub fn ipv4_string(ip: u32) -> String {
    format!(
        "{}.{}.{}.{}",
        (ip >> 24) & 0xff,
        (ip >> 16) & 0xff,
        (ip >> 8) & 0xff,
        ip & 0xff
    )
}

pub fn mask_of(prefix: u8) -> u32 {
    if prefix == 0 {
        0
    } else {
        u32::MAX << (32 - prefix.min(32))
    }
}

/// Accepts either dotted ("255.255.255.0") or prefix length ("24").
pub fn parse_mask(s: &str) -> Option<u8> {
    if s.contains('.') {
        let m = parse_ipv4(s)?;
        let inv = !m;
        if inv.wrapping_add(1) & inv != 0 {
            return None; // non-contiguous mask
        }
        Some(m.count_ones() as u8)
    } else {
        let p: u8 = s.parse().ok()?;
        (p <= 32).then_some(p)
    }
}

pub fn contains(ip: u32, net: u32, prefix: u8) -> bool {
    let m = mask_of(prefix);
    (ip & m) == (net & m)
}

#[derive(Clone, Debug)]
pub struct Iface {
    pub name: String,
    pub ip: Option<u32>,
    pub prefix: u8,
}

impl Iface {
    pub fn net(&self) -> Option<u32> {
        self.ip.map(|ip| ip & mask_of(self.prefix))
    }

}

#[derive(Clone, Debug)]
pub struct Route {
    pub dest: u32,
    pub prefix: u8,
    /// `None` means directly connected.
    pub via: Option<u32>,
}

#[derive(Clone, Debug)]
pub struct Device {
    pub id: String,
    pub name: String,
    pub kind: Kind,
    pub x: f64,
    pub y: f64,
    pub ifaces: Vec<Iface>,
    pub routes: Vec<Route>,
}

impl Device {
    pub fn owns(&self, ip: u32) -> bool {
        self.ifaces.iter().any(|i| i.ip == Some(ip))
    }
}

#[derive(Clone, Debug)]
pub struct Link {
    pub a: String,
    pub a_if: String,
    pub b: String,
    pub b_if: String,
}

#[derive(Clone, Debug)]
pub struct Topology {
    pub devices: Vec<Device>,
    pub links: Vec<Link>,
}

impl Topology {
    pub fn device(&self, id: &str) -> Option<&Device> {
        self.devices.iter().find(|d| d.id == id)
    }

    /// Peer device and the interface name on that peer.
    pub fn peer(&self, dev: &str, ifname: &str) -> Option<(&str, &str)> {
        for l in &self.links {
            if l.a == dev && l.a_if == ifname {
                return Some((&l.b, &l.b_if));
            }
            if l.b == dev && l.b_if == ifname {
                return Some((&l.a, &l.a_if));
            }
        }
        None
    }
}

fn ip(s: &str) -> u32 {
    parse_ipv4(s).expect("demo topology has a malformed address")
}

fn iface(name: &str, addr: Option<&str>, prefix: u8) -> Iface {
    Iface {
        name: name.to_string(),
        ip: addr.map(ip),
        prefix,
    }
}

fn link(a: &str, a_if: &str, b: &str, b_if: &str) -> Link {
    Link {
        a: a.into(),
        a_if: a_if.into(),
        b: b.into(),
        b_if: b_if.into(),
    }
}

/// Two LANs joined by two routers. Small enough to reason about by hand,
/// large enough that a routing decision actually has to happen.
pub fn demo() -> Topology {
    Topology {
        devices: vec![
            Device {
                id: "pc1".into(),
                name: "PC1".into(),
                kind: Kind::Pc,
                x: 110.0,
                y: 120.0,
                ifaces: vec![iface("eth0", Some("192.168.1.10"), 24)],
                routes: vec![Route {
                    dest: 0,
                    prefix: 0,
                    via: Some(ip("192.168.1.1")),
                }],
            },
            Device {
                id: "sw1".into(),
                name: "SW1".into(),
                kind: Kind::Switch,
                x: 330.0,
                y: 120.0,
                ifaces: vec![iface("fa0/1", None, 0), iface("fa0/2", None, 0)],
                routes: vec![],
            },
            Device {
                id: "r1".into(),
                name: "R1".into(),
                kind: Kind::Router,
                x: 560.0,
                y: 120.0,
                ifaces: vec![
                    iface("g0/0", Some("192.168.1.1"), 24),
                    iface("g0/1", Some("10.0.0.1"), 24),
                ],
                routes: vec![Route {
                    dest: ip("192.168.2.0"),
                    prefix: 24,
                    via: Some(ip("10.0.0.2")),
                }],
            },
            Device {
                id: "r2".into(),
                name: "R2".into(),
                kind: Kind::Router,
                x: 560.0,
                y: 330.0,
                ifaces: vec![
                    iface("g0/0", Some("10.0.0.2"), 24),
                    iface("g0/1", Some("192.168.2.1"), 24),
                ],
                routes: vec![Route {
                    dest: ip("192.168.1.0"),
                    prefix: 24,
                    via: Some(ip("10.0.0.1")),
                }],
            },
            Device {
                id: "sw2".into(),
                name: "SW2".into(),
                kind: Kind::Switch,
                x: 330.0,
                y: 330.0,
                ifaces: vec![iface("fa0/1", None, 0), iface("fa0/2", None, 0)],
                routes: vec![],
            },
            Device {
                id: "pc2".into(),
                name: "PC2".into(),
                kind: Kind::Pc,
                x: 110.0,
                y: 330.0,
                ifaces: vec![iface("eth0", Some("192.168.2.10"), 24)],
                routes: vec![Route {
                    dest: 0,
                    prefix: 0,
                    via: Some(ip("192.168.2.1")),
                }],
            },
        ],
        links: vec![
            link("pc1", "eth0", "sw1", "fa0/1"),
            link("sw1", "fa0/2", "r1", "g0/0"),
            link("r1", "g0/1", "r2", "g0/0"),
            link("r2", "g0/1", "sw2", "fa0/1"),
            link("sw2", "fa0/2", "pc2", "eth0"),
        ],
    }
}

fn esc(s: &str) -> String {
    s.replace('\\', "\\\\").replace('"', "\\\"")
}

pub fn to_json(t: &Topology) -> String {
    let mut o = String::from("{\"devices\":[");
    for (n, d) in t.devices.iter().enumerate() {
        if n > 0 {
            o.push(',');
        }
        let _ = write!(
            o,
            "{{\"id\":\"{}\",\"name\":\"{}\",\"kind\":\"{}\",\"x\":{},\"y\":{},\"ifaces\":[",
            esc(&d.id),
            esc(&d.name),
            d.kind.as_str(),
            d.x,
            d.y
        );
        for (m, i) in d.ifaces.iter().enumerate() {
            if m > 0 {
                o.push(',');
            }
            let _ = write!(
                o,
                "{{\"name\":\"{}\",\"ip\":{},\"prefix\":{},\"net\":{}}}",
                esc(&i.name),
                match i.ip {
                    Some(v) => format!("\"{}\"", ipv4_string(v)),
                    None => "null".to_string(),
                },
                i.prefix,
                match i.net() {
                    Some(v) => format!("\"{}/{}\"", ipv4_string(v), i.prefix),
                    None => "null".to_string(),
                }
            );
        }
        o.push_str("]}");
    }
    o.push_str("],\"links\":[");
    for (n, l) in t.links.iter().enumerate() {
        if n > 0 {
            o.push(',');
        }
        let _ = write!(
            o,
            "{{\"a\":\"{}\",\"aIf\":\"{}\",\"b\":\"{}\",\"bIf\":\"{}\"}}",
            esc(&l.a),
            esc(&l.a_if),
            esc(&l.b),
            esc(&l.b_if)
        );
    }
    o.push_str("]}");
    o
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn parses_ipv4() {
        assert_eq!(parse_ipv4("192.168.1.1"), Some(0xC0A80101));
        assert_eq!(parse_ipv4("10.0.0.2"), Some(0x0A000002));
        assert_eq!(parse_ipv4("256.1.1.1"), None);
        assert_eq!(parse_ipv4("1.2.3"), None);
    }

    #[test]
    fn parses_dotted_and_prefix_masks() {
        assert_eq!(parse_mask("255.255.255.0"), Some(24));
        assert_eq!(parse_mask("255.255.255.128"), Some(25));
        assert_eq!(parse_mask("255.255.0.0"), Some(16));
        assert_eq!(parse_mask("24"), Some(24));
        assert_eq!(parse_mask("255.0.255.0"), None); // non-contiguous
        assert_eq!(parse_mask("33"), None);
    }

    #[test]
    fn subnet_membership() {
        assert!(contains(ip("192.168.1.10"), ip("192.168.1.0"), 24));
        assert!(!contains(ip("10.0.0.1"), ip("192.168.1.0"), 24));
        assert!(contains(ip("8.8.8.8"), 0, 0));
    }

    #[test]
    fn json_has_every_device() {
        let j = to_json(&demo());
        for d in demo().devices {
            assert!(j.contains(&format!("\"{}\"", d.id)));
        }
    }
}

/// Device kinds that route packets with a routing table and NAT.
pub fn routes_packets(kind: &str) -> bool {
    matches!(kind, "router" | "asa" | "rtrw-gateway")
}
