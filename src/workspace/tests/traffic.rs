use super::super::*;

#[test]
fn console_link_does_not_carry_traffic() {
    let mut ws = Workspace::empty();
    let pc = ws.add("PC-PT", 100.0, 300.0).unwrap();
    let r = ws.add("2911", 500.0, 100.0).unwrap();
    ws.link_kind(&pc, &r, "eConsole").unwrap();
    ws.set_ip(&pc, "10.0.0.1", 24).unwrap();
    let other = ws.add("PC-PT", 800.0, 300.0).unwrap();
    ws.set_ip(&other, "10.0.0.2", 24).unwrap();

    let err = ws.send_pdu(&pc, &other).unwrap_err();
    assert!(err.contains("not connected"), "{err}");
}

#[test]
fn pdu_is_a_real_frame_across_the_router() {
    use crate::net::packet::Mac;
    let mut ws = Workspace::new();
    ws.send_pdu("pc0", "pc2").unwrap();
    let e = ws.events.last().unwrap();
    assert_eq!(
        e.path,
        vec!["pc0", "switch0", "router0", "switch1", "pc2"],
        "cross-subnet path"
    );
    assert!(e.size > 60, "frame size {} looks truncated", e.size);
    assert_eq!(e.hops.len(), e.path.len());

    // The scheduler stamps one arrival per device and the event lands on
    // the last one.
    assert!(e.hops.windows(2).all(|w| w[1].t > w[0].t), "times must increase");
    let last = e.hops.last().unwrap().t;
    assert!((last - e.time as f64).abs() < 1e-6, "{} vs {}", last, e.time);
    assert!(e.time > 0.0);

    let router = e.hops.iter().find(|h| h.id == "router0").unwrap();
    assert_eq!(router.note, "Router0 decrements TTL 128 to 127 and forwards", "{}", router.note);
    assert_eq!(router.ttl, 127);
    assert_eq!(router.ingress.as_deref(), Some("GigabitEthernet0/0"));
    assert_eq!(router.egress.as_deref(), Some("GigabitEthernet0/1"));

    // L2 boundaries: into the router the frame is addressed to the router,
    // and the last segment carries router0 as sender, pc2 as receiver.
    assert_eq!(e.hops[0].src_mac, Mac::for_device("pc0"));
    assert_eq!(e.hops[0].dst_mac, Mac::for_device("router0"));
    assert_eq!(e.hops[4].src_mac, Mac::for_device("router0"));
    assert_eq!(e.hops[4].dst_mac, Mac::for_device("pc2"));

    // ARP resolution is recorded for the on-link neighbour.
    let reply = ws.tables.arps("pc0");
    assert_eq!(reply.lookup(
        crate::model::parse_ipv4("192.168.2.10").unwrap(),
        ws.sim_time as f64
    ), None, "cross-subnet destination is not an ARP neighbour");
}

#[test]
fn l24_t4_simulation_device_order_equals_forwarding_path() {
    let mut ws = Workspace::from_tnet(include_str!("../../../web/templates/t4.xml")).unwrap();
    for (id, ip, gateway) in [
        ("pc0", "192.168.1.10", "192.168.1.1"),
        ("pc1", "192.168.1.11", "192.168.1.1"),
        ("pc2", "192.168.2.10", "192.168.2.1"),
        ("pc3", "192.168.2.11", "192.168.2.1"),
    ] {
        ws.set_config(id, ip, "255.255.255.0", gateway, "").unwrap();
    }
    for (port, ip) in [("GigabitEthernet0/0", "192.168.1.1"), ("GigabitEthernet0/1", "192.168.2.1")] {
        ws.set_port_ip("router0", port, ip, 24).unwrap();
        assert!(ws.set_port_up("router0", port, true));
    }
    ws.send_pdu("pc0", "pc3").unwrap();

    let event = ws.events.last().unwrap();
    let expected = vec!["pc0", "switch0", "router0", "switch1", "pc3"];
    assert_eq!(event.path, expected);
    let hop_ids = event.hops.iter().map(|hop| hop.id.as_str()).collect::<Vec<_>>();
    assert_eq!(hop_ids, expected);
    assert!(event.hops.windows(2).all(|pair| pair[0].t < pair[1].t));
}

#[test]
fn switch_learns_source_macs_and_then_hits() {
    use crate::net::packet::Mac;
    let mut ws = Workspace::new();
    ws.send_pdu("pc1", "pc0").unwrap();
    let rows = ws.tables.mac_rows("switch0");
    assert!(
        rows.iter().any(|r| r.mac == Mac::for_device("pc1")),
        "switch0 learned pc1: {rows:?}"
    );

    ws.send_pdu("pc0", "pc1").unwrap();
    let hop = ws.events.last().unwrap()
        .hops
        .iter()
        .find(|h| h.id == "switch0")
        .unwrap();
    assert!(hop.note.contains("MAC table hit"), "{}", hop.note);
}

#[test]
fn shutting_an_interface_breaks_the_path() {
    let mut ws = Workspace::new();
    assert!(ws.set_port_up("router0", "GigabitEthernet0/0", false));
    let err = ws.send_pdu("pc0", "pc2").unwrap_err();
    assert!(
        err.contains("Router0 GigabitEthernet0/0 is administratively down"),
        "{err}"
    );
    assert_eq!(ws.events.len(), 1);
    assert_eq!(ws.events[0].status, "Dropped");

    assert!(ws.set_port_up("router0", "GigabitEthernet0/0", true));
    ws.send_pdu("pc0", "pc2").unwrap();
    assert_eq!(ws.events.iter().filter(|event| event.proto == "ICMP").count(), 2);
    assert_eq!(ws.events.last().unwrap().status, "Successful");
}

#[test]
fn pdu_follows_links_and_records_event() {
    let mut ws = Workspace::new();
    ws.send_pdu("pc0", "pc2").unwrap();
    assert_eq!(ws.events.iter().filter(|event| event.proto == "ICMP").count(), 1);
    let e = ws.events.last().unwrap();
    assert_eq!(e.last, "PC0");
    assert_eq!(e.at, "PC2");
    assert_eq!(e.path.first().unwrap(), "pc0");
    assert_eq!(e.path.last().unwrap(), "pc2");
    assert!(e.time > 0.0);

    ws.reset_sim();
    assert!(ws.events.is_empty());
    assert_eq!(ws.sim_time, 0.0);
}

#[test]
fn pdu_rejects_unknown_and_disconnected() {
    let mut ws = Workspace::new();
    assert!(ws.send_pdu("pc0", "nope").is_err());
    assert!(ws.send_pdu("pc0", "pc0").is_err());

    let laptop = ws.add("Laptop", 800.0, 120.0).unwrap();
    let err = ws.send_pdu("pc0", &laptop).unwrap_err();
    assert!(err.contains("no path"), "{err}");
    assert_eq!(ws.events.len(), 1, "invalid endpoints are not captures");
    assert_eq!(ws.events[0].status, "Dropped");
    assert_eq!(ws.events[0].reason.as_deref(), Some(err.as_str()));
}

#[test]
fn pdu_checks_subnet_when_addresses_exist() {
    let mut ws = Workspace::new();
    ws.bus(2).unwrap();
    let pcs: Vec<String> = ws
        .devices
        .iter()
        .filter(|d| d.kind == "pc" && d.ip.is_some())
        .map(|d| d.id.clone())
        .collect();
    assert_eq!(pcs.len(), 2);

    ws.send_pdu(&pcs[0], &pcs[1]).unwrap();
    assert_eq!(ws.events.iter().filter(|event| event.proto == "ICMP").count(), 1);

    // Move one host to a foreign subnet: the PDU must refuse.
    ws.set_ip(&pcs[1], "10.0.0.5", 24).unwrap();
    let err = ws.send_pdu(&pcs[0], &pcs[1]).unwrap_err();
    assert!(err.contains("no route to 10.0.0.5"), "{err}");
    assert!(err.contains("no default gateway"), "{err}");
    assert_eq!(ws.events.iter().filter(|event| event.status == "Dropped").count(), 1);
    assert_eq!(ws.events.last().unwrap().status, "Dropped");
}

#[test]
fn same_subnet_delivery_uses_links() {
    let mut ws = Workspace::empty();
    let hub = ws.add("Hub", 400.0, 100.0).unwrap();
    let a = ws.add("PC-PT", 100.0, 300.0).unwrap();
    let b = ws.add("PC-PT", 700.0, 300.0).unwrap();
    ws.link(&a, &hub).unwrap();
    ws.link(&b, &hub).unwrap();
    ws.set_ip(&a, "192.168.1.10", 24).unwrap();
    ws.set_ip(&b, "192.168.1.20", 24).unwrap();

    ws.send_pdu(&a, &b).unwrap();
    assert_eq!(ws.events.iter().filter(|event| event.proto == "ICMP").count(), 1);
    assert_eq!(ws.events.last().unwrap().path, vec![a.clone(), hub.clone(), b.clone()]);
}

#[test]
fn cross_subnet_delivery_follows_gateways() {
    let mut ws = Workspace::empty();
    let a = ws.add("PC-PT", 80.0, 380.0).unwrap();
    let b = ws.add("PC-PT", 820.0, 380.0).unwrap();
    let r = ws.add("2911", 450.0, 90.0).unwrap();
    ws.link(&a, &r).unwrap();
    ws.link(&r, &b).unwrap();

    ws.set_config(&a, "192.168.1.10", "255.255.255.0", "192.168.1.1", "")
        .unwrap();
    ws.set_config(&b, "10.0.0.10", "255.255.255.0", "10.0.0.1", "")
        .unwrap();
    ws.set_port_ip(&r, "GigabitEthernet0/0", "192.168.1.1", 24)
        .unwrap();
    ws.set_port_ip(&r, "GigabitEthernet0/1", "10.0.0.1", 24)
        .unwrap();

    assert_eq!(ws.gateway_of(&a), crate::model::parse_ipv4("192.168.1.1"));
    assert_eq!(ws.gateway_of(&b), crate::model::parse_ipv4("10.0.0.1"));
    assert_eq!(ws.gateway_of(&r), None, "routers do not have a default gateway");

    ws.send_pdu(&a, &b).unwrap();
    ws.send_pdu(&b, &a).unwrap();
    let data = ws.events.iter().filter(|event| event.proto == "ICMP").collect::<Vec<_>>();
    assert_eq!(data.len(), 2);
    assert_eq!(data[0].last, "PC0");
    assert_eq!(data[0].at, "PC1");
    assert_eq!(data[1].last, "PC1");
    assert_eq!(data[1].at, "PC0");
    for e in data {
        assert_eq!(e.path.len(), 3, "{:?}", e.path);
    }

    // Removing the gateway makes the same PDU unroutable.
    ws.set_config(&a, "192.168.1.10", "255.255.255.0", "", "")
        .unwrap();
    let err = ws.send_pdu(&a, &b).unwrap_err();
    assert!(err.contains("no route"), "{err}");
    assert!(err.contains("no default gateway"), "{err}");
    assert_eq!(ws.events.iter().filter(|event| event.status == "Dropped").count(), 1);
    assert_eq!(ws.events.last().unwrap().status, "Dropped");
}

#[test]
fn cross_subnet_without_gateway_is_refused() {
    let mut ws = Workspace::new();
    ws.bus(2).unwrap();
    let pcs: Vec<String> = ws
        .devices
        .iter()
        .filter(|d| d.kind == "pc")
        .map(|d| d.id.clone())
        .collect();
    ws.set_ip(&pcs[1], "10.0.0.5", 24).unwrap();

    let err = ws.send_pdu(&pcs[0], &pcs[1]).unwrap_err();
    assert!(err.contains("no route to 10.0.0.5"), "{err}");
    assert!(err.contains("no default gateway"), "{err}");
    assert_eq!(ws.events.len(), 1);
    assert_eq!(ws.events[0].status, "Dropped");
}

#[test]
fn vlan_membership_controls_switching() {
    let mut ws = Workspace::new();
    ws.vlan_create("switch0", 20, "SALES").unwrap();
    // PC1 sits on Fa0/3: moving it to VLAN 20 breaks the default-VLAN path.
    ws.set_access_vlan("switch0", "FastEthernet0/3", 20).unwrap();
    let err = ws.send_pdu("pc0", "pc1").unwrap_err();
    assert!(err.contains("VLAN mismatch"), "{err}");
    ws.set_access_vlan("switch0", "FastEthernet0/2", 20).unwrap();
    ws.send_pdu("pc0", "pc1").unwrap();
    assert_eq!(ws.events.iter().filter(|event| event.proto == "ICMP").count(), 2);
    assert_eq!(ws.events[0].status, "Dropped");
    assert!(ws.events[0].hops.is_empty(), "path selection failed before forwarding");
    assert!(ws.events[0].reason.as_deref().is_some_and(|r| r.contains("VLAN mismatch")));
    assert!(ws.vlan_delete("switch0", 20).is_err(), "still in use");
    assert!(ws.vlan_delete("switch0", 1).is_err(), "default VLAN");
    assert!(ws.vlan_create("switch0", 0, "").is_err());
}

#[test]
fn spanning_tree_blocks_a_redundant_link() {
    let mut ws = Workspace::new();
    let s2 = ws.add("2960", 700.0, 300.0).unwrap();
    ws.link("switch0", "switch1").unwrap();
    ws.link("switch1", &s2).unwrap();
    ws.link("switch0", &s2).unwrap();
    let blocked = ws.stp_blocked_ports();
    assert_eq!(blocked.len(), 1, "only the non-designated endpoint blocks: {blocked:?}");
    // Traffic still flows over the tree.
    ws.send_pdu("pc0", "pc2").unwrap();
    assert_eq!(ws.events.iter().filter(|event| event.proto == "ICMP").count(), 1);
}

#[test]
fn l26_captured_ipv4_bytes_have_a_valid_rfc1071_checksum() {
    let mut ws = Workspace::new();
    ws.send_pdu("pc0", "pc2").unwrap();
    let event = ws.events.iter().rev().find(|event| event.proto == "ICMP").unwrap();
    assert_eq!(&event.bytes[12..14], &[0x08, 0x00]);
    assert_eq!(crate::net::packet::checksum(&event.bytes[14..34]), 0);
    assert_eq!(event.bytes[22], 127, "the wire header contains the routed TTL");
    assert!(event.note.contains("decrements TTL 128 to 127 and forwards"), "{}", event.note);
}

#[test]
fn first_addressed_delivery_captures_real_arp_request_and_reply_frames() {
    let mut ws = Workspace::new();
    ws.send_pdu("pc0", "pc2").unwrap();
    let arp = ws.events.iter().filter(|event| event.proto == "ARP").collect::<Vec<_>>();
    assert_eq!(arp.len(), 2, "request and reply precede the ICMP echo");
    assert_eq!(&arp[0].bytes[12..14], &[0x08, 0x06]);
    assert_eq!(&arp[0].bytes[20..22], &[0, 1]);
    assert_eq!(&arp[1].bytes[20..22], &[0, 2]);
    assert!(arp[0].note.contains("has no ARP entry"), "{}", arp[0].note);
    assert!(arp[1].note.contains("answers"), "{}", arp[1].note);
    assert_eq!(arp[0].at, "Router0");
    assert_eq!(&arp[0].bytes[38..42], &[192, 168, 1, 1]);
    assert_eq!(ws.events.last().unwrap().proto, "ICMP");

    ws.send_pdu("pc0", "pc2").unwrap();
    assert_eq!(ws.events.iter().filter(|event| event.proto == "ARP").count(), 2, "a valid ARP cache entry suppresses another exchange");
}
