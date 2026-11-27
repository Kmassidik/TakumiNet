//! VXLAN encap/decap on the wire: routed hops between two VTEPs see the
//! tunnel headers, and a capture row shows VTEP addresses plus the VNI.

use super::super::*;
use crate::model::parse_ipv4 as ip;

/// LeafA — spine — LeafB, one server behind each leaf, OSPF on the fabric.
/// Every cable names its ports: the fabric interfaces are the VTEPs.
fn leaf_spine_fabric() -> (Workspace, String, String, String, String, String) {
    let mut ws = Workspace::empty();
    let server_a = ws.add("Server", 0.0, 300.0).unwrap();
    let leaf_a = ws.add("Switch L3", 0.0, 200.0).unwrap();
    let spine = ws.add("Switch L3", 100.0, 100.0).unwrap();
    let leaf_b = ws.add("Switch L3", 200.0, 200.0).unwrap();
    let server_b = ws.add("Server", 200.0, 300.0).unwrap();
    ws.link_ports(&server_a, &leaf_a, "eCopper", Some("Fa0"), Some("GigabitEthernet0/2")).unwrap();
    ws.link_ports(&leaf_a, &spine, "eCopper", Some("GigabitEthernet0/1"), Some("GigabitEthernet0/1")).unwrap();
    ws.link_ports(&spine, &leaf_b, "eCopper", Some("GigabitEthernet0/2"), Some("GigabitEthernet0/1")).unwrap();
    ws.link_ports(&leaf_b, &server_b, "eCopper", Some("GigabitEthernet0/2"), Some("Fa0")).unwrap();

    ws.set_config(&server_a, "10.1.1.10", "255.255.255.0", "10.1.1.1", "").unwrap();
    ws.set_config(&server_b, "10.1.2.10", "255.255.255.0", "10.1.2.1", "").unwrap();
    // First routed interface of each leaf doubles as its VTEP address.
    ws.set_port_ip(&leaf_a, "GigabitEthernet0/1", "10.0.12.1", 30).unwrap();
    ws.set_port_ip(&leaf_a, "GigabitEthernet0/2", "10.1.1.1", 24).unwrap();
    ws.set_port_ip(&spine, "GigabitEthernet0/1", "10.0.12.2", 30).unwrap();
    ws.set_port_ip(&spine, "GigabitEthernet0/2", "10.0.23.1", 30).unwrap();
    ws.set_port_ip(&leaf_b, "GigabitEthernet0/1", "10.0.23.2", 30).unwrap();
    ws.set_port_ip(&leaf_b, "GigabitEthernet0/2", "10.1.2.1", 24).unwrap();

    let nets = [
        (&leaf_a, vec![("10.0.12.0", 30), ("10.1.1.0", 24)]),
        (&spine, vec![("10.0.12.0", 30), ("10.0.23.0", 30)]),
        (&leaf_b, vec![("10.0.23.0", 30), ("10.1.2.0", 24)]),
    ];
    for (dev, list) in nets {
        ws.set_routing_protocol(&dev, "ospf", 1).unwrap();
        for (net, prefix) in list {
            ws.add_routing_network(&dev, ip(net).unwrap(), prefix, 0).unwrap();
        }
    }
    (ws, server_a, server_b, leaf_a, leaf_b, spine)
}

#[test]
fn a_tenant_ping_inside_the_tunnel_shows_the_vxlan_headers_at_the_spine() {
    let (mut ws, server_a, server_b, leaf_a, leaf_b, spine) = leaf_spine_fabric();
    ws.vnet_join(&server_a, 100).unwrap();
    ws.vnet_join(&server_b, 100).unwrap();

    ws.send_pdu(&server_a, &server_b).expect("tenant ping crosses the fabric");
    let event = ws.events.iter().find(|e| e.proto == "ICMP").expect("captured delivery");

    // The leaves terminate the tunnel: encap on the way in, decap on the way out.
    let encapsulates = event.hops.iter().find(|h| h.id == leaf_a).unwrap();
    assert!(encapsulates.note.contains("encapsulates"), "{}", encapsulates.note);
    assert!(encapsulates.note.contains("VNI 100"), "{}", encapsulates.note);
    assert!(encapsulates.note.contains("10.0.12.1") && encapsulates.note.contains("10.0.23.2"),
        "the note names both VTEP addresses: {}", encapsulates.note);
    let decapsulates = event.hops.iter().find(|h| h.id == leaf_b).unwrap();
    assert!(decapsulates.note.contains("decapsulates"), "{}", decapsulates.note);
    assert!(decapsulates.note.contains("10.1.2.10"), "the decap note names the real destination: {}", decapsulates.note);

    // A pure underlay hop sees only the tunnel: a VXLAN layer carrying the
    // tenant's VNI over UDP 4789, with the outer headers addressed to the VTEPs.
    let underlay = event.hops.iter().find(|h| h.id == spine).unwrap();
    let tunnel_ip = underlay.layers.iter().find(|l| l.name == "IPv4 (tunnel)").expect("tunnel IP layer decoded");
    assert_eq!(tunnel_ip.fields.iter().find(|(k, _)| k == "Source").map(|(_, v)| v.as_str()), Some("10.0.12.1"));
    assert_eq!(tunnel_ip.fields.iter().find(|(k, _)| k == "Destination").map(|(_, v)| v.as_str()), Some("10.0.23.2"));
    let udp = underlay.layers.iter().find(|l| l.name == "UDP").expect("UDP layer decoded");
    assert_eq!(udp.fields.iter().find(|(k, _)| k == "Destination Port").map(|(_, v)| v.as_str()),
        Some("4789 (VXLAN)"));
    let vxlan = underlay.layers.iter().find(|l| l.name == "VXLAN").expect("VXLAN layer decoded");
    assert_eq!(vxlan.fields.iter().find(|(k, _)| k == "VNI").map(|(_, v)| v.as_str()), Some("100"));
    assert_eq!(underlay.layers.len(), 7, "outer eth/tunnel-ip/udp/vxlan plus the inner stack");
    assert_eq!(event.path, vec![server_a.clone(), leaf_a.clone(), spine.clone(), leaf_b.clone(), server_b.clone()]);
}

#[test]
fn a_sniffer_on_the_underlay_captures_vtep_ips_and_the_vni_not_the_tenant_ips() {
    let (mut ws, server_a, server_b, leaf_a, leaf_b, spine) = leaf_spine_fabric();
    // Tap the spine—LeafB cable: the underlay now runs through the sniffer.
    let tap = ws.add("Sniffer", 150.0, 150.0).unwrap();
    let idx = ws.links.iter().position(|l| l.a == spine && l.b == leaf_b).unwrap();
    ws.links.remove(idx);
    ws.link_ports(&spine, &tap, "eCopper", Some("GigabitEthernet0/2"), Some("Fa0")).unwrap();
    ws.link_ports(&tap, &leaf_b, "eCopper", Some("Fa1"), Some("GigabitEthernet0/1")).unwrap();
    // OSPF adjacencies need a router on each end, so the tapped underlay runs
    // static routes instead: the spine still reaches LeafB's tenant net, and
    // the reverse direction points back through the spine.
    ws.add_route(&spine, "10.1.2.0", "255.255.255.0", "10.0.23.2", 1).unwrap();
    ws.add_route(&leaf_a, "10.1.2.0", "255.255.255.0", "10.0.12.2", 1).unwrap();
    ws.add_route(&leaf_b, "10.1.1.0", "255.255.255.0", "10.0.23.1", 1).unwrap();
    ws.add_route(&leaf_b, "10.0.12.0", "255.255.255.252", "10.0.23.1", 1).unwrap();

    ws.vnet_join(&server_a, 100).unwrap();
    ws.vnet_join(&server_b, 100).unwrap();
    ws.send_pdu(&server_a, &server_b).expect("tenant ping crosses the tapped fabric");

    let rows = ws.tables.sniffer_rows(&tap);
    let row = rows.iter().find(|r| r.proto == "vxlan").expect("the sniffer recorded the tunnel frame");
    assert_eq!(row.src_ip, "10.0.12.1", "capture row shows the outer VTEP source");
    assert_eq!(row.dst_ip, "10.0.23.2", "capture row shows the outer VTEP destination");
    assert!(row.info.contains("VNI 100"), "{}", row.info);
    assert!(row.info.contains("10.1.2.10"), "the info names the tenant destination: {}", row.info);
    assert_eq!(row.length, 110, "50 bytes of tunnel overhead over the inner packet");
    assert!(!rows.iter().any(|r| r.proto == "icmp"), "the inner ping never rides the underlay in the clear");
}

#[test]
fn the_same_ping_without_tenant_networks_stays_in_the_clear() {
    let (mut ws, server_a, server_b, _leaf_a, _leaf_b, spine) = leaf_spine_fabric();
    ws.send_pdu(&server_a, &server_b).expect("plain routed ping");
    let event = ws.events.iter().find(|e| e.proto == "ICMP").expect("captured delivery");
    let underlay = event.hops.iter().find(|h| h.id == spine).unwrap();
    assert!(underlay.layers.iter().all(|l| l.name != "VXLAN"), "no VXLAN layer without a tenant network");
    assert_eq!(underlay.src_ip, ip("10.1.1.10").unwrap(), "no tunnel: the tenant source shows");
}

#[test]
fn the_overlay_template_demo_captures_both_vnis_on_the_fabric() {
    let mut ws = Workspace::from_tnet(include_str!("../../../web/templates/tpl-l5-overlay.xml")).unwrap();
    let steps = ws.run_demo().expect("the overlay demo runs");
    assert_eq!(steps, 4);
    // server0→server2 rides VNI 100; server1→server3 rides VNI 200. Each
    // ping crosses a spine, where the capture must show the tunnel.
    for (vni, from) in [(100u32, "RackA-1"), (200u32, "RackA-2")] {
        let event = ws.events.iter().find(|e| e.proto == "ICMP" && e.last == from)
            .unwrap_or_else(|| panic!("capture for {from}"));
        let spine_hop = event.hops.iter().find(|h| h.name == "Spine1" || h.name == "Spine2")
            .expect("the ping crossed a spine");
        let tunnel_ip = spine_hop.layers.iter().find(|l| l.name == "IPv4 (tunnel)")
            .expect("tunnel IP layer decoded at the spine");
        assert_eq!(tunnel_ip.fields.iter().find(|(k, _)| k == "Source").map(|(_, v)| v.as_str()),
            Some("10.200.11.1"), "ingress VTEP is LeafA's fabric address");
        assert_eq!(tunnel_ip.fields.iter().find(|(k, _)| k == "Destination").map(|(_, v)| v.as_str()),
            Some("10.200.21.1"), "egress VTEP is LeafB's fabric address");
        let vxlan = spine_hop.layers.iter().find(|l| l.name == "VXLAN").expect("VXLAN layer decoded");
        assert_eq!(vxlan.fields.iter().find(|(k, _)| k == "VNI").map(|(_, v)| v.as_str()),
            Some(if vni == 100 { "100" } else { "200" }), "{from} rides VNI {vni}");
    }
    // Cross-segment traffic is refused outright: the same VNI check blocks it
    // before any frame exists, so it never leaves a capture row.
    let across = ws.send_pdu("server0", "server3").unwrap_err();
    assert!(across.contains("virtual network 100") && across.contains("200"), "{across}");
}
