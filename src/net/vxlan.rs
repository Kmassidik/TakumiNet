//! VXLAN (RFC 7348) encapsulation: what an overlay fabric puts around
//! tenant traffic on the underlay.
//!
//! The tenant model itself (`vnet2` records, cross-segment blocking) lives in
//! the workspace; this module owns the bytes that make the tunnel real: the
//! outer IPv4/UDP/VXLAN headers a VTEP adds, their decoded layers, and the
//! capture row an in-path sniffer records at an underlay hop. Inside the
//! tunnel the inner packet travels untouched.

use crate::model::ipv4_string;
use crate::net::packet::{checksum, Mac, Packet};
use crate::workspace::{Layer, SnifferRow, Workspace};

/// IANA-assigned UDP port for VXLAN (RFC 7348 §5).
pub const UDP_PORT: u16 = 4789;

/// Outer header stack added on the wire: Ethernet (14) + outer IPv4 (20) +
/// UDP (8) + VXLAN (8), before the inner packet.
pub const OVERHEAD: usize = 14 + 20 + 8 + 8;

/// One VXLAN wrap: the tenant segment the frame belongs to and the VTEP
/// addresses that tunnel it, plus where on the device path those VTEPs sit.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub struct Encapsulation {
    pub vni: u32,
    /// Ingress VTEP (first routed device on the path).
    pub vtep_src: u32,
    /// Egress VTEP (last routed device on the path).
    pub vtep_dst: u32,
    /// Device-path index of the ingress VTEP.
    pub ingress_idx: usize,
    /// Device-path index of the egress VTEP.
    pub egress_idx: usize,
}

impl Encapsulation {
    /// Outer IPv4 + UDP + VXLAN headers, checksum included.
    pub fn header_bytes(&self, inner: &Packet) -> Vec<u8> {
        let payload = 8 + 20 + inner.payload_len(); // VXLAN header + inner IP + payload
        let mut ip = vec![0u8; 20];
        ip[0] = 0x45; // version 4, IHL 5
        let total = (20 + payload) as u16;
        ip[2..4].copy_from_slice(&total.to_be_bytes());
        ip[8] = 64; // TTL
        ip[9] = 17; // UDP
        ip[12..16].copy_from_slice(&self.vtep_src.to_be_bytes());
        ip[16..20].copy_from_slice(&self.vtep_dst.to_be_bytes());
        let sum = checksum(&ip);
        ip[10..12].copy_from_slice(&sum.to_be_bytes());

        let mut udp = Vec::with_capacity(8);
        // RFC 7348 §4.2: the source UDP port carries a hash of the inner
        // flow so routers can spread tunnels over equal-cost paths.
        udp.extend(flow_port(inner).to_be_bytes());
        udp.extend(UDP_PORT.to_be_bytes());
        udp.extend((8 + payload as u16).to_be_bytes());
        udp.extend([0, 0]); // UDP checksum: zero means none over IPv4

        let mut vxlan = Vec::with_capacity(8);
        vxlan.extend([0x08, 0, 0, 0]); // I flag set, rest reserved
        vxlan.extend([(self.vni >> 16) as u8, (self.vni >> 8) as u8, self.vni as u8]);
        vxlan.extend([0]); // reserved

        let mut out = Vec::with_capacity(36);
        out.extend(ip);
        out.extend(udp);
        out.extend(vxlan);
        out
    }

    /// The whole frame as it crosses the underlay: Ethernet, the tunnel
    /// headers, then the untouched inner packet.
    pub fn wire_bytes(&self, outer_src: Mac, outer_dst: Mac, inner: &Packet) -> Vec<u8> {
        let mut out = Vec::with_capacity(OVERHEAD + 20 + inner.payload_len());
        out.extend(outer_dst.0);
        out.extend(outer_src.0);
        out.extend(0x0800u16.to_be_bytes());
        out.extend(self.header_bytes(inner));
        out.extend(inner.to_bytes());
        out
    }

    /// Bytes on the wire when the frame is encapsulated.
    pub fn wire_size(&self, inner: &Packet) -> usize {
        OVERHEAD + 20 + inner.payload_len()
    }
}

/// A stable non-zero UDP source port derived from the inner flow.
fn flow_port(inner: &Packet) -> u16 {
    let mut h = inner.src ^ inner.dst.rotate_left(7) ^ ((inner.payload_len() as u32) << 16);
    h ^= h >> 13;
    1024 + (h % (65536 - 1024)) as u16
}

/// The overlay plan for a delivery between two servers that share one tenant
/// network and are routed apart by the fabric: which VNI, and the VTEP
/// addresses of the first and last routed device on the path. `None` when no
/// tunnel applies — different tenants (blocked upstream), same L2 segment,
/// or traffic that never leaves a flat network.
pub fn overlay_plan(ws: &Workspace, path: &[String], src: &str, dst: &str) -> Option<Encapsulation> {
    let vni = *ws.vnets.get(src)?;
    if ws.vnets.get(dst) != Some(&vni) {
        return None;
    }
    let routes = |id: &str| {
        ws.devices
            .iter()
            .find(|d| d.id == id)
            .is_some_and(|d| crate::model::routes_packets(&d.kind))
    };
    let ingress_idx = path.iter().position(|id| routes(id))?;
    let egress_idx = path.iter().rposition(|id| routes(id))?;
    if ingress_idx >= egress_idx {
        return None; // one L3 box serves both sides: no tunnel on the wire
    }
    let vtep_ip = |id: &str| {
        ws.devices
            .iter()
            .find(|d| d.id == id)
            .and_then(|d| d.ip.or_else(|| d.ports.iter().find_map(|p| p.ip)))
    };
    Some(Encapsulation {
        vni,
        vtep_src: vtep_ip(&path[ingress_idx])?,
        vtep_dst: vtep_ip(&path[egress_idx])?,
        ingress_idx,
        egress_idx,
    })
}

/// Decode a captured frame at an underlay hop: the tunnel headers first,
/// then the inner packet's own layers.
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
                ("Source".into(), ipv4_string(encap.vtep_src)),
                ("Destination".into(), ipv4_string(encap.vtep_dst)),
                ("TTL".into(), "64".into()),
                ("Protocol".into(), "UDP (17)".into()),
            ],
        ),
        Layer::new(
            "UDP",
            vec![
                ("Source Port".into(), "Flow hash".into()),
                ("Destination Port".into(), format!("{UDP_PORT} (VXLAN)")),
            ],
        ),
        Layer::new(
            "VXLAN",
            vec![
                ("Flags".into(), "0x08 (I)".into()),
                ("VNI".into(), encap.vni.to_string()),
            ],
        ),
    ];
    layers.extend(inner_layers);
    layers
}

/// The capture row an in-path sniffer records at an underlay hop: the frame
/// shows the outer VTEP addresses and the VNI, not the tenant addresses.
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
        src_ip: ipv4_string(encap.vtep_src),
        dst_ip: ipv4_string(encap.vtep_dst),
        proto: "vxlan".into(),
        length: encap.wire_size(inner),
        info: format!("VXLAN VNI {} → {}", encap.vni, ipv4_string(inner.dst)),
    });
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::net::packet::{IpProto, Payload};

    fn icmp() -> Packet {
        Packet {
            src: crate::model::parse_ipv4("10.100.1.11").unwrap(),
            dst: crate::model::parse_ipv4("10.100.2.11").unwrap(),
            ttl: 128,
            proto: IpProto::Icmp,
            payload: Payload::EchoRequest { id: 0x0a01, seq: 1 },
        }
    }

    fn encap() -> Encapsulation {
        Encapsulation {
            vni: 100,
            vtep_src: crate::model::parse_ipv4("10.200.11.1").unwrap(),
            vtep_dst: crate::model::parse_ipv4("10.200.21.1").unwrap(),
            ingress_idx: 1,
            egress_idx: 3,
        }
    }

    #[test]
    fn the_wire_frame_carries_outer_vteps_udp_4789_and_the_vni() {
        let inner = icmp();
        let bytes = encap().wire_bytes(Mac([1; 6]), Mac([2; 6]), &inner);
        assert_eq!(&bytes[0..6], &[2; 6], "outer destination MAC first");
        assert_eq!(&bytes[6..12], &[1; 6]);
        assert_eq!(&bytes[12..14], &0x0800u16.to_be_bytes());
        // Outer IPv4: VTEP addresses after the fixed 14-byte Ethernet header.
        assert_eq!(&bytes[26..30], &encap().vtep_src.to_be_bytes());
        assert_eq!(&bytes[30..34], &encap().vtep_dst.to_be_bytes());
        assert_eq!(bytes[23], 17, "outer protocol is UDP");
        // UDP destination port is VXLAN's.
        assert_eq!(&bytes[36..38], &UDP_PORT.to_be_bytes());
        // VXLAN header: I flag then the 24-bit VNI.
        assert_eq!(bytes[42], 0x08);
        assert_eq!(&bytes[46..49], &[0, 0, 100]);
        assert_eq!(bytes.len(), encap().wire_size(&inner));
    }

    #[test]
    fn the_outer_ip_checksum_validates() {
        let inner = icmp();
        let bytes = encap().wire_bytes(Mac([1; 6]), Mac([2; 6]), &inner);
        let mut hdr = bytes[14..34].to_vec();
        hdr[10..12].copy_from_slice(&[0, 0]);
        assert_eq!(checksum(&hdr).to_be_bytes(), bytes[24..26], "header checksum verifies");
    }

    #[test]
    fn decap_recovers_the_inner_packet_untouched() {
        let inner = icmp();
        let bytes = encap().wire_bytes(Mac([1; 6]), Mac([2; 6]), &inner);
        assert_eq!(&bytes[50..], &inner.to_bytes(), "inner packet rides verbatim");
    }

    #[test]
    fn the_source_udp_port_tracks_the_inner_flow() {
        let mut a = icmp();
        let mut b = icmp();
        b.dst = crate::model::parse_ipv4("10.100.3.11").unwrap();
        a.ttl = 64;
        let ea = encap();
        let mut eb = ea;
        eb.vni = 200;
        let pa = ea.header_bytes(&a)[20..24].to_vec();
        let pb = eb.header_bytes(&b)[20..24].to_vec();
        assert_ne!(pa, pb, "a different inner flow hashes to its own source port");
    }

    #[test]
    fn a_vni_above_one_byte_encodes_all_24_bits() {
        let mut e = encap();
        e.vni = 0x0a_bc_d2;
        let bytes = e.header_bytes(&icmp());
        assert_eq!(&bytes[32..35], &[0x0a, 0xbc, 0xd2]);
    }
}
