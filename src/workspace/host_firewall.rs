//! The firewall on an end device, driven by `ufw` in its terminal.

use super::*;
use crate::net::packet::{IpProto, Packet, Payload};
use std::net::Ipv6Addr;

/// Source ports from this number up are answers to a request the host sent,
/// so a default-deny host still accepts them (a stateful firewall's job).
const REPLY_PORT_FLOOR: u16 = 49_152;

#[derive(Clone, Debug, PartialEq)]
pub struct UfwRule {
    pub allow: bool,
    pub proto: Option<String>,
    pub port: Option<u16>,
    pub from: Option<(u32, u8)>,
    /// IPv6 source prefix; a rule carries one family or the other.
    pub from6: Option<(Ipv6Addr, u8)>,
}

#[derive(Clone, Debug, Default)]
pub struct HostFirewall {
    pub enabled: bool,
    pub default_allow: bool,
    pub rules: Vec<UfwRule>,
}

impl UfwRule {
    fn matches(&self, proto: &str, port: Option<u16>, src: u32) -> bool {
        self.from6.is_none()
            && self.proto.as_deref().map_or(true, |p| p == proto)
            && self.port.map_or(true, |p| port == Some(p))
            && self.from.map_or(true, |(net, prefix)| {
                let mask = crate::model::mask_of(prefix);
                net & mask == src & mask
            })
    }

    /// An IPv6 ping. A rule written for IPv4 does not apply to a v6 source,
    /// and the protocol keyword `icmp` covers `icmp6`.
    fn matches6(&self, src: Ipv6Addr) -> bool {
        self.port.is_none()
            && self.proto.as_deref().map_or(true, |p| p == "icmp" || p == "icmp6" || p == "ipv6")
            && match self.from6 {
                Some((net, prefix)) => {
                    let bits = u128::from(net) >> (128 - prefix.min(128) as u32);
                    let src_bits = u128::from(src) >> (128 - prefix.min(128) as u32);
                    bits == src_bits
                }
                None => self.from.is_none(),
            }
    }
}

/// What a packet looks like to the host firewall: protocol and destination
/// port. `None` means the packet is an answer or not something ufw filters.
fn classify(packet: &Packet) -> Option<(&'static str, Option<u16>)> {
    match (&packet.proto, &packet.payload) {
        (IpProto::Icmp, Payload::EchoRequest { .. }) => Some(("icmp", None)),
        (IpProto::Icmp, _) => None,
        (proto, Payload::Bytes(bytes)) if bytes.len() >= 4 => {
            let port = u16::from_be_bytes([bytes[2], bytes[3]]);
            if port >= REPLY_PORT_FLOOR {
                return None;
            }
            let name = if *proto == IpProto::Tcp { "tcp" } else { "udp" };
            Some((name, Some(port)))
        }
        _ => None,
    }
}

impl Workspace {
    pub fn ufw(&self, id: &str) -> Option<&HostFirewall> {
        self.host_firewalls.get(id)
    }

    pub fn ufw_mut(&mut self, id: &str) -> &mut HostFirewall {
        self.host_firewalls.entry(id.to_string()).or_default()
    }

    /// The label of a packet this host's firewall refuses, or `None` to accept.
    /// Ping is accepted unless a rule names it, as on a stock Linux box.
    pub fn ufw_blocks(&self, id: &str, packet: &Packet) -> Option<String> {
        let firewall = self.host_firewalls.get(id).filter(|f| f.enabled)?;
        let (proto, port) = classify(packet)?;
        let label = match port {
            Some(p) => format!("{proto}/{p}"),
            None => proto.to_string(),
        };
        for rule in &firewall.rules {
            if rule.matches(proto, port, packet.src) {
                return if rule.allow { None } else { Some(label) };
            }
        }
        if proto == "icmp" || firewall.default_allow {
            None
        } else {
            Some(label)
        }
    }

    /// Whether an IPv6 echo from `src` is refused, and the label to show.
    /// A stock host answers ping, so only an explicit deny rule blocks it.
    pub fn ufw_blocks_v6(&self, id: &str, src: Ipv6Addr) -> Option<String> {
        let firewall = self.host_firewalls.get(id).filter(|f| f.enabled)?;
        for rule in &firewall.rules {
            if rule.matches6(src) {
                return if rule.allow { None } else { Some("icmp6".into()) };
            }
        }
        None
    }

    pub(super) fn ufw_records(&self) -> String {
        let mut ids: Vec<_> = self.host_firewalls.keys().collect();
        ids.sort();
        let mut out = String::new();
        for id in ids {
            let firewall = &self.host_firewalls[id];
            out.push_str(&format!(
                "ufw\t{}\t{}\t{}\n",
                id,
                if firewall.enabled { "on" } else { "off" },
                if firewall.default_allow { "allow" } else { "deny" }
            ));
            for rule in &firewall.rules {
                let from = if let Some((net, prefix)) = rule.from6 {
                    format!("{net}/{prefix}")
                } else if let Some((net, prefix)) = rule.from {
                    format!("{}/{}", crate::model::ipv4_string(net), prefix)
                } else {
                    "-".to_string()
                };
                out.push_str(&format!(
                    "ufwrule\t{}\t{}\t{}\t{}\t{}\n",
                    id,
                    if rule.allow { "allow" } else { "deny" },
                    rule.proto.as_deref().unwrap_or("-"),
                    rule.port.map_or("-".to_string(), |p| p.to_string()),
                    from
                ));
            }
        }
        out
    }

    pub(super) fn ufw_load_policy(&mut self, id: &str, enabled: &str, default: &str) {
        let firewall = self.ufw_mut(id);
        firewall.enabled = enabled == "on";
        firewall.default_allow = default == "allow";
    }

    pub(super) fn ufw_load_rule(&mut self, id: &str, action: &str, proto: &str, port: &str, from: &str) {
        let mut v4 = None;
        let mut v6 = None;
        if from != "-" {
            let (net, prefix) = from.split_once('/').unwrap_or((from, ""));
            if net.contains(':') {
                if let Ok(addr) = net.parse::<std::net::Ipv6Addr>() {
                    v6 = Some((addr, prefix.parse::<u8>().unwrap_or(128)));
                }
            } else if let Some(ip) = crate::model::parse_ipv4(net) {
                v4 = Some((ip, prefix.parse::<u8>().ok().filter(|p| *p <= 32).unwrap_or(32)));
            }
        }
        self.ufw_mut(id).rules.push(UfwRule {
            allow: action == "allow",
            proto: (proto != "-").then(|| proto.to_string()),
            port: port.parse().ok(),
            from: v4,
            from6: v6,
        });
    }
}
