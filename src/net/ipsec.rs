//! ESP site-to-site IPSec (RFC 4303) encapsulation: what a VPN gateway puts
//! around private traffic before it crosses the internet.
//!
//! The gate and the shared-key state live in the workspace (`tunnels`,
//! `tunnel_blocked`); this module owns the bytes that make the tunnel real:
//! the outer IPv4/ESP headers the ingress gateway adds, their decoded layers,
//! and the capture row an in-path sniffer records at a WAN hop. Inside the
//! tunnel the inner packet travels protected — the simulation models the
//! headers honestly and carries the payload verbatim, unencrypted.

use crate::model::ipv4_string;
use crate::net::packet::{checksum, Mac, Packet};
use crate::workspace::{Layer, SnifferRow, Workspace};

/// IANA IP protocol number for ESP (RFC 4303 §2).
pub const IP_PROTO: u8 = 50;

/// Outer header stack added on the wire: Ethernet (14) + outer IPv4 (20) +
/// ESP header (8) + explicit IV (16), before the protected payload.
pub const OVERHEAD: usize = 14 + 20 + 8 + 16;

/// One ESP wrap: the security parameter index both ends share, the gateway
/// addresses the outer IP uses, and where on the device path those gateways sit.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub struct Encapsulation {
    pub spi: u32,
    /// Ingress VPN gateway (first router with an up tunnel on the path).
    pub gw_src: u32,
    /// Egress VPN gateway (last router with an up tunnel on the path).
    pub gw_dst: u32,
    /// Device-path index of the ingress gateway.
    pub ingress_idx: usize,
    /// Device-path index of the egress gateway.
    pub egress_idx: usize,
}

impl Encapsulation {
    /// Outer IPv4 + ESP headers, outer checksum included. The Security
    /// Parameters Index tells the egress gateway which shared key to use; the
    /// sequence number is 1 because the simulation carries one packet per
    /// capture; the IV derives deterministically from both.
    pub fn header_bytes(&self, inner: &Packet) -> Vec<u8> {
        let payload = 20 + inner.payload_len(); // inner IP + payload
        let mut ip = vec![0u8; 20];
        ip[0] = 0x45; // version 4, IHL 5
        let total = (20 + payload + 8 + 16) as u16;
        ip[2..4].copy_from_slice(&total.to_be_bytes());
        ip[8] = 64; // TTL
        ip[9] = IP_PROTO; // ESP
        ip[12..16].copy_from_slice(&self.gw_src.to_be_bytes());
        ip[16..20].copy_from_slice(&self.gw_dst.to_be_bytes());
        let sum = checksum(&ip);
        ip[10..12].copy_from_slice(&sum.to_be_bytes());

        let mut esp = Vec::with_capacity(24);
        esp.extend(self.spi.to_be_bytes());
        esp.extend(1u32.to_be_bytes()); // sequence number
        esp.extend(self.iv());

        let mut out = Vec::with_capacity(44);
        out.extend(ip);
        out.extend(esp);
        out
    }

    /// The whole frame as it crosses the WAN: Ethernet, the tunnel headers,
    /// then the protected payload. The simulation does not encrypt: the inner
    /// packet rides verbatim where the ciphertext would be.
    pub fn wire_bytes(&self, outer_src: Mac, outer_dst: Mac, inner: &Packet) -> Vec<u8> {
        let mut out = Vec::with_capacity(OVERHEAD + 20 + inner.payload_len());
        out.extend(outer_dst.0);
        out.extend(outer_src.0);
        out.extend(0x0800u16.to_be_bytes());
        out.extend(self.header_bytes(inner));
        out.extend(inner.to_bytes());
        out
    }

    /// Bytes on the wire when the packet is encapsulated.
    pub fn wire_size(&self, inner: &Packet) -> usize {
        OVERHEAD + 20 + inner.payload_len()
    }

    /// Deterministic explicit IV: the SPI stretched over the first twelve
    /// bytes, the sequence number in the last four.
    fn iv(&self) -> [u8; 16] {
        let mut iv = [0u8; 16];
        for chunk in iv[0..12].chunks_exact_mut(4) {
            chunk.copy_from_slice(&self.spi.to_be_bytes());
        }
        iv[12..16].copy_from_slice(&1u32.to_be_bytes());
        iv
    }
}

/// The SPI for a tunnel: an FNV-1a hash of the shared key. Both ends derive
/// the same index from the key they share; values 0–255 are IANA-reserved and
/// never handed out.
pub fn spi_from_key(key: &str) -> u32 {
    let mut h = 0x811c9dc5u32;
    for b in key.bytes() {
        h ^= b as u32;
        h = h.wrapping_mul(0x01000193);
    }
    (h & !0xff) | 0x100
}

/// The IPSec plan for a delivery whose path crosses the internet between two
/// routers holding an up, mutually-pointing site-to-site tunnel. `None` when
/// no tunnel applies — no up ends on the path, a single end, or ends that do
/// not point back at each other (the workspace already refuses the delivery).
pub fn tunnel_plan(ws: &Workspace, path: &[String], src: &str, dst: &str) -> Option<Encapsulation> {
    let _ = (src, dst); // the plan follows the path; endpoints only matter via it
    let up = |id: &str| ws.tunnel_state(id) == "up";
    let ingress_idx = path.iter().position(|id| up(id))?;
    let egress_idx = path.iter().rposition(|id| up(id))?;
    if ingress_idx >= egress_idx {
        return None; // one gateway serves both sides: no tunnel on the wire
    }
    // The outer addresses are the WAN addresses the ends are configured with:
    // each end's `peer` is the other's address, so both sides agree by
    // construction — mismatched peers never come up in the first place.
    let (ingress_peer, key) = ws.tunnels.get(&path[ingress_idx])?;
    let (egress_peer, _) = ws.tunnels.get(&path[egress_idx])?;
    let owns = |id: &str, addr: u32| {
        ws.devices.iter().find(|d| d.id == id)
            .is_some_and(|d| d.ip == Some(addr) || d.ports.iter().any(|p| p.ip == Some(addr)))
    };
    // Sanity: each end really holds the address the other points at.
    if !owns(&path[ingress_idx], *egress_peer) || !owns(&path[egress_idx], *ingress_peer) {
        return None;
    }
    Some(Encapsulation {
        spi: spi_from_key(key),
        gw_src: *egress_peer,
        gw_dst: *ingress_peer,
        ingress_idx,
        egress_idx,
    })
}

/// Decode a captured frame at a WAN hop: the tunnel headers first, then the
/// protected packet's own layers.
pub fn decap_layers(
    src_mac: Mac,
    dst_mac: Mac,
    encap: &Encapsulation,
    inner_layers: Vec<Layer>,
) -> Vec<Layer> {
    let mut layers = vec![
        Layer::new(
            "Ethernet II",
            vec![
                ("Destination".into(), dst_mac.to_string()),
                ("Source".into(), src_mac.to_string()),
                ("EtherType".into(), "IPv4 (0x0800)".into()),
            ],
        ),
        Layer::new(
            "IPv4 (tunnel)",
            vec![
                ("Source".into(), ipv4_string(encap.gw_src)),
                ("Destination".into(), ipv4_string(encap.gw_dst)),
                ("TTL".into(), "64".into()),
                ("Protocol".into(), format!("ESP ({IP_PROTO})")),
            ],
        ),
        Layer::new(
            "ESP",
            vec![
                ("SPI".into(), format!("0x{:08x}", encap.spi)),
                ("Sequence".into(), "1".into()),
                ("Payload".into(), "Protected (tunnel mode)".into()),
            ],
        ),
    ];
    layers.extend(inner_layers);
    layers
}

/// The capture row an in-path sniffer records at a WAN hop: the frame shows
/// the outer gateway addresses and the SPI, not the private addresses.
pub fn sniff_encapsulated(
    ws: &mut Workspace,
    dev_id: &str,
    t: f64,
    src_mac: Mac,
    dst_mac: Mac,
    encap: &Encapsulation,
    inner: &Packet,
) {
    ws.tables.sniff(dev_id, SnifferRow {
        t,
        src_mac: src_mac.to_string(),
        dst_mac: dst_mac.to_string(),
        ethertype: "0x0800".into(),
        src_ip: ipv4_string(encap.gw_src),
        dst_ip: ipv4_string(encap.gw_dst),
        proto: "esp".into(),
        length: encap.wire_size(inner),
        info: format!("ESP SPI 0x{:08x} → {}", encap.spi, ipv4_string(inner.dst)),
    });
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::net::packet::{IpProto, Payload};

    fn icmp() -> Packet {
        Packet {
            src: crate::model::parse_ipv4("192.168.99.20").unwrap(),
            dst: crate::model::parse_ipv4("192.168.20.2").unwrap(),
            ttl: 128,
            proto: IpProto::Icmp,
            payload: Payload::EchoRequest { id: 0x0a01, seq: 1 },
        }
    }

    fn encap() -> Encapsulation {
        Encapsulation {
            spi: spi_from_key("office-key-1"),
            gw_src: crate::model::parse_ipv4("203.0.113.1").unwrap(),
            gw_dst: crate::model::parse_ipv4("203.0.113.2").unwrap(),
            ingress_idx: 1,
            egress_idx: 3,
        }
    }

    #[test]
    fn the_wire_frame_carries_outer_gateways_esp_and_the_spi() {
        let inner = icmp();
        let e = encap();
        let bytes = e.wire_bytes(Mac([1; 6]), Mac([2; 6]), &inner);
        assert_eq!(&bytes[0..6], &[2; 6], "outer destination MAC first");
        assert_eq!(&bytes[6..12], &[1; 6]);
        assert_eq!(&bytes[12..14], &0x0800u16.to_be_bytes());
        // Outer IPv4: gateway addresses after the 14-byte Ethernet header.
        assert_eq!(&bytes[26..30], &e.gw_src.to_be_bytes());
        assert_eq!(&bytes[30..34], &e.gw_dst.to_be_bytes());
        assert_eq!(bytes[23], IP_PROTO, "outer protocol is ESP (50)");
        // ESP header: the SPI both ends derive from the shared key, then
        // sequence 1, then the IV.
        assert_eq!(&bytes[34..38], &e.spi.to_be_bytes());
        assert_eq!(&bytes[38..42], &1u32.to_be_bytes());
        assert_eq!(&bytes[42..46], &e.spi.to_be_bytes(), "IV starts with the SPI");
        assert_eq!(bytes.len(), e.wire_size(&inner));
    }

    #[test]
    fn the_outer_ip_checksum_validates() {
        let bytes = encap().wire_bytes(Mac([1; 6]), Mac([2; 6]), &icmp());
        let mut hdr = bytes[14..34].to_vec();
        hdr[10..12].copy_from_slice(&[0, 0]);
        assert_eq!(checksum(&hdr).to_be_bytes(), bytes[24..26], "header checksum verifies");
    }

    #[test]
    fn the_protected_payload_rides_after_the_headers() {
        let inner = icmp();
        let bytes = encap().wire_bytes(Mac([1; 6]), Mac([2; 6]), &inner);
        assert_eq!(&bytes[58..], &inner.to_bytes(), "protected payload follows the IV");
    }

    #[test]
    fn the_spi_follows_the_shared_key_and_stays_off_the_reserved_range() {
        let a = spi_from_key("office-key-1");
        let b = spi_from_key("office-key-2");
        assert_ne!(a, b, "a different key selects a different SPI");
        assert!(a >= 0x100, "SPI {a} must avoid IANA-reserved values below 256");
        assert_eq!(spi_from_key("office-key-1"), spi_from_key("office-key-1"), "both ends derive the same SPI");
    }

    #[test]
    fn decap_decodes_the_tunnel_stack_before_the_inner_layers() {
        let e = encap();
        let inner_layer = Layer::new("ICMP", vec![("Type".into(), "Echo request".into())]);
        let layers = decap_layers(Mac([1; 6]), Mac([2; 6]), &e, vec![inner_layer]);
        assert_eq!(layers.len(), 4);
        assert_eq!(layers[1].name, "IPv4 (tunnel)");
        assert_eq!(layers[2].name, "ESP");
        assert!(layers[2].fields.iter().any(|(k, v)| k == "SPI" && v.starts_with("0x")));
        assert_eq!(layers[3].name, "ICMP");
    }
}
