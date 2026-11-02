use super::*;

#[test]
fn json_is_balanced_and_complete() {
    let ws = Workspace::new();
    let j = ws.json();
    assert_eq!(j.matches('{').count(), j.matches('}').count());
    assert_eq!(j.matches("\"id\":").count(), ws.devices.len());
    assert_eq!(j.matches("\"aPort\":").count(), ws.links.len());
    assert!(j.contains("\"label\":\"2911\""));
    assert!(j.contains("\"kind\":\"router\""));
}

#[test]
fn add_names_and_counts_by_kind() {
    let mut ws = Workspace::new();
    let before = ws.devices.len();
    let id = ws.add("PC-PT", 100.0, 100.0).unwrap();
    assert_eq!(ws.devices.len(), before + 1);
    let dev = ws.devices.iter().find(|d| d.id == id).unwrap();
    assert_eq!(dev.name, "PC3");
    assert_eq!(dev.kind, "pc");
    assert!(
        dev.icon.ends_with("pc.svg") || dev.icon.contains("iWorkstation"),
        "{}",
        dev.icon
    );
}

#[test]
fn add_unknown_model_is_rejected() {
    let mut ws = Workspace::new();
    assert!(ws.add("not-a-device", 10.0, 10.0).is_none());
}

#[test]
fn move_and_remove() {
    let mut ws = Workspace::new();
    assert!(ws.mv("pc0", 500.0, 300.0));
    let d = ws.devices.iter().find(|d| d.id == "pc0").unwrap();
    assert_eq!((d.x, d.y), (500.0, 300.0));

    // clamped to the canvas
    assert!(ws.mv("pc0", -500.0, 9999.0));
    let d = ws.devices.iter().find(|d| d.id == "pc0").unwrap();
    assert_eq!((d.x, d.y), (40.0, 500.0));

    let links_before = ws.links.len();
    assert!(ws.remove("pc0"));
    assert!(ws.links.len() < links_before);
    assert!(!ws.remove("pc0"));
}

#[test]
fn linking_assigns_ports_and_rejects_duplicates() {
    let mut ws = Workspace::new();
    let pc = ws.add("PC-PT", 700.0, 450.0).unwrap();

    assert!(ws.link(&pc, "switch0").is_ok());
    let link = ws.links.iter().find(|l| l.a == pc).unwrap();
    assert_eq!(link.a_port, "Fa0");
    assert_eq!(link.b_port, "Fa0/4"); // switch already has 3 links

    assert!(ws.link(&pc, "switch0").is_err(), "duplicate accepted");
    assert!(ws.link(&pc, &pc).is_err(), "self link accepted");
    assert!(ws.link(&pc, "nope").is_err(), "unknown device accepted");

    assert!(ws.unlink(&pc, "switch0"));
    assert!(!ws.unlink(&pc, "switch0"));
}

#[test]
fn router_ports_increment_by_link_count() {
    let mut ws = Workspace::new();
    assert_eq!(ws.next_port("router0"), "Gig0/2"); // already has 2 links
    let pc = ws.add("PC-PT", 700.0, 450.0).unwrap();
    ws.link(&pc, "router0").unwrap();
    assert_eq!(ws.next_port("router0"), "Gig0/3");
}

#[test]
fn every_link_endpoint_exists() {
    let ws = Workspace::new();
    for l in &ws.links {
        assert!(ws.devices.iter().any(|d| d.id == l.a), "missing {}", l.a);
        assert!(ws.devices.iter().any(|d| d.id == l.b), "missing {}", l.b);
    }
}

#[test]
fn console_cable_joins_only_a_host_to_a_network_device() {
    let mut ws = Workspace::new();
    ws.link_kind("pc0", "router0", "eConsole").unwrap();
    assert_eq!(ws.console_peer("pc0"), Some("router0"));
    assert_eq!(ws.console_peer("router0"), None, "only the host drives it");

    // two switches cannot be joined by a console cable
    let sw = ws.add("2960", 700.0, 120.0).unwrap();
    let err = ws.link_kind("switch0", &sw, "eConsole").unwrap_err();
    assert!(err.contains("console cable joins a PC"), "{err}");
    // unknown cable types are refused, not silently typed as copper
    let err = ws.link_kind("pc1", &sw, "eBanana").unwrap_err();
    assert!(err.contains("unknown cable type"), "{err}");

    // a console cable is out of band: it never becomes a data path, and it
    // lands on the console port instead of consuming a Gigabit interface
    assert_eq!(ws.links.iter().filter(|l| l.carries_data()).count(), 6);
    let console = ws.links.iter().find(|l| !l.carries_data()).unwrap();
    assert_eq!(console.a_port, "RS-232");
    assert_eq!(console.b_port, "Console");
}

#[test]
fn console_link_does_not_carry_traffic() {
    let mut ws = Workspace::from_ptw("# console only\n").unwrap();
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
    let e = &ws.events[0];
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
    assert!(ws.events[0].time > 0.0);

    let router = e.hops.iter().find(|h| h.id == "router0").unwrap();
    assert_eq!(router.note, "routed: TTL 128 -> 127", "{}", router.note);
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
    let hop = ws.events[1]
        .hops
        .iter()
        .find(|h| h.id == "switch0")
        .unwrap();
    assert!(hop.note.contains("MAC table hit"), "{}", hop.note);
}

#[test]
fn dhcp_hands_out_sequential_leases_on_the_segment() {
    let mut ws = Workspace::new();
    ws.set_dhcp_pool("server0", "192.168.2.0", 24, "192.168.2.1", "8.8.8.8")
        .unwrap();

    let pc = ws.add("PC-PT", 600.0, 200.0).unwrap();
    ws.link(&pc, "switch1").unwrap();
    let lease = ws.acquire_dhcp(&pc).unwrap();
    assert_eq!(
        crate::model::ipv4_string(lease.ip),
        "192.168.2.100",
        "first lease"
    );
    assert_eq!(lease.prefix, 24);
    assert_eq!(lease.server, "server0");
    let d = ws.devices.iter().find(|d| d.id == pc).unwrap();
    assert_eq!(d.ip, Some(lease.ip));
    assert_eq!(d.gateway, crate::model::parse_ipv4("192.168.2.1"));
    assert!(ws.dhcp_clients.contains(&pc));
    assert!(ws.events.iter().any(|e| e.kind == "DHCP"));

    let pc2 = ws.add("PC-PT", 700.0, 200.0).unwrap();
    ws.link(&pc2, "switch1").unwrap();
    let second = ws.acquire_dhcp(&pc2).unwrap();
    assert_eq!(crate::model::ipv4_string(second.ip), "192.168.2.101");

    // Static configuration takes the host off DHCP again.
    ws.set_config(&pc2, "192.168.2.50", "255.255.255.0", "", "")
        .unwrap();
    assert!(!ws.dhcp_clients.contains(&pc2));
}

#[test]
fn dhcp_needs_a_server_on_the_same_segment() {
    let mut ws = Workspace::new();
    // pc0 sits behind router0, so the server pool is not on its segment.
    ws.set_dhcp_pool("server0", "192.168.2.0", 24, "192.168.2.1", "")
        .unwrap();
    let err = ws.acquire_dhcp("pc0").unwrap_err();
    assert!(err.contains("no DHCP server"), "{err}");
}

#[test]
fn cables_only_join_devices_that_support_them() {
    let mut ws = Workspace::from_ptw("# cable rules\n").unwrap();
    let r1 = ws.add("2911", 200.0, 100.0).unwrap();
    let r2 = ws.add("2911", 700.0, 100.0).unwrap();
    let pc = ws.add("PC-PT", 200.0, 400.0).unwrap();
    let pc2 = ws.add("PC-PT", 700.0, 400.0).unwrap();
    let sw = ws.add("2960", 450.0, 100.0).unwrap();

    // Serial needs serial ports on both ends and picks one of them.
    assert!(ws.link_kind(&r1, &r2, "eSerial").is_ok());
    let serial = ws.links.last().unwrap();
    assert_eq!(serial.a_port, "Serial0/0/0", "{}", serial.a_port);
    assert!(ws.link_kind(&pc, &pc2, "eSerial").is_err());

    // Fiber joins network devices only.
    assert!(ws.link_kind(&sw, &r1, "eFiber").is_ok());
    assert!(ws.link_kind(&pc, &pc2, "eFiber").is_err());

    // Copper joins Ethernet endpoints.
    assert!(ws.link_kind(&pc, &sw, "eCopper").is_ok());

    // Phone and coax have their own endpoints.
    let phone = ws.add("Analog Phone", 900.0, 400.0).unwrap();
    assert!(ws.link_kind(&phone, &r2, "ePhone").is_ok());
    assert!(ws.link_kind(&phone, &pc, "ePhone").is_err());
    let home = ws.add("Home Router", 900.0, 100.0).unwrap();
    assert!(ws.link_kind(&home, &r1, "eCoax").is_ok());
    assert!(ws.link_kind(&r1, &r2, "eCoax").is_err());

    // IoT cable joins IoT endpoints (directly or through a switch).
    let t1 = ws.add("Thing", 600.0, 300.0).unwrap();
    let t2 = ws.add("Thing", 800.0, 300.0).unwrap();
    assert!(ws.link_kind(&t1, &t2, "eIoT").is_ok());
    assert!(ws.link_kind(&t1, &pc, "eIoT").is_err());
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
    assert!(ws.events.is_empty());

    assert!(ws.set_port_up("router0", "GigabitEthernet0/0", true));
    ws.send_pdu("pc0", "pc2").unwrap();
    assert_eq!(ws.events.len(), 1);
}

#[test]
fn pdu_follows_links_and_records_event() {
    let mut ws = Workspace::new();
    ws.send_pdu("pc0", "pc2").unwrap();
    assert_eq!(ws.events.len(), 1);
    let e = &ws.events[0];
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
    assert!(ws.events.is_empty());
}

#[test]
fn duplicate_copies_model_and_offsets() {
    let mut ws = Workspace::new();
    let n = ws.devices.len();
    let id = ws.duplicate("pc0").unwrap();
    assert_eq!(ws.devices.len(), n + 1);
    let d = ws.devices.iter().find(|d| d.id == id).unwrap();
    assert_eq!(d.model, "PC-PT");
    assert!(d.x > 105.0);
}


#[test]
fn from_pkt_builds_typed_topology() {
    let xml = r#"<PACKETTRACER5><VERSION>7.3</VERSION><NETWORK>
    <DEVICE><TYPE model="1941">Router</TYPE><NAME>R1</NAME>
      <SAVE_REF_ID>r1</SAVE_REF_ID>
      <WORKSPACE><LOGICAL><X>10</X><Y>10</Y></LOGICAL></WORKSPACE></DEVICE>
    <DEVICE><TYPE model="2960">Switch</TYPE><NAME>SW1</NAME>
      <SAVE_REF_ID>s1</SAVE_REF_ID>
      <WORKSPACE><LOGICAL><X>300</X><Y>200</Y></LOGICAL></WORKSPACE></DEVICE>
    <LINK><TYPE>eCopper</TYPE><FROM>r1</FROM><PORT>GigabitEthernet0/0</PORT>
      <TO>s1</TO><PORT>FastEthernet0/1</PORT></LINK>
    </NETWORK></PACKETTRACER5>"#;
    let pkt = crate::storage::ptxml::parse(xml);
    let ws = Workspace::from_pkt(&pkt);
    assert_eq!(ws.devices.len(), 2);
    assert_eq!(ws.links.len(), 1);
    assert_eq!(ws.devices[0].name, "R1");
    assert_eq!(ws.devices[0].kind, "router");
    assert_eq!(ws.links[0].a_port, "Gig0/0");
    assert_eq!(ws.links[0].b_port, "Fa0/1");
    assert!(ws.devices[0].x >= 40.0 && ws.devices[1].x >= 40.0);
}


#[test]
fn bus_builds_star_with_addresses() {
    let mut ws = Workspace::new();
    assert_eq!(ws.bus(4).unwrap(), 4);
    // An untouched demo is replaced, so the bus is the whole topology.
    assert_eq!(ws.devices.len(), 5); // hub + 4 PCs
    assert_eq!(ws.links.len(), 4);

    let mut addrs: Vec<String> = ws
        .devices
        .iter()
        .filter_map(|d| d.ip.map(crate::model::ipv4_string))
        .collect();
    addrs.sort();
    assert_eq!(
        addrs,
        vec!["192.168.1.10", "192.168.1.11", "192.168.1.12", "192.168.1.13"]
    );
    assert!(ws.bus(1).is_err());
    assert!(ws.bus(99).is_err());
}

#[test]
fn set_ip_validates_and_stores() {
    let mut ws = Workspace::new();
    assert!(ws.set_ip("pc0", "192.168.1.10", 24).is_ok());
    let pc = ws.devices.iter().find(|d| d.id == "pc0").unwrap();
    assert_eq!(pc.ip, crate::model::parse_ipv4("192.168.1.10"));

    assert!(ws.set_ip("pc0", "999.1.1.1", 24).is_err());
    assert!(ws.set_ip("pc0", "192.168.1.10", 33).is_err());
    assert!(ws.set_ip("nope", "192.168.1.10", 24).is_err());
}

#[test]
fn set_config_stores_mask_gateway_and_dns() {
    let mut ws = Workspace::new();
    ws.set_config("pc0", "192.168.1.10", "255.255.255.0", "192.168.1.1", "8.8.8.8")
        .unwrap();
    let d = ws.devices.iter().find(|d| d.id == "pc0").unwrap();
    assert_eq!(d.prefix, 24);
    assert_eq!(d.gateway, crate::model::parse_ipv4("192.168.1.1"));
    assert_eq!(d.dns, crate::model::parse_ipv4("8.8.8.8"));

    // empty gateway/dns are allowed (Packet Tracer leaves them 0.0.0.0)
    ws.set_config("pc1", "192.168.1.11", "255.255.255.0", "", "").unwrap();
    let d = ws.devices.iter().find(|d| d.id == "pc1").unwrap();
    assert_eq!(d.gateway, None);
    assert_eq!(d.dns, None);

    assert!(ws.set_config("pc0", "192.168.1.10", "255.0.255.0", "", "").is_err());
    assert!(ws.set_config("pc0", "192.168.1.10", "24", "bad", "").is_err());
    assert!(ws.set_config("nope", "192.168.1.10", "24", "", "").is_err());
}

#[test]
fn ipv6_section_stores_and_validates() {
    let mut ws = Workspace::new();
    ws.set_ipv6("pc0", false, "2001:db8::1", 64, "2001:db8::ff", "2001:db8::53")
        .unwrap();
    let d = ws.devices.iter().find(|d| d.id == "pc0").unwrap();
    assert_eq!(d.ipv6.as_deref(), Some("2001:db8::1"));
    assert_eq!(d.ipv6_prefix, 64);
    assert_eq!(d.ipv6_gateway.as_deref(), Some("2001:db8::ff"));
    assert_eq!(d.ipv6_dns.as_deref(), Some("2001:db8::53"));

    assert!(ws.set_ipv6("pc0", false, "192.168.1.1", 64, "", "").is_err());
    assert!(ws.set_ipv6("pc0", false, "2001:db8::1", 129, "", "").is_err());
    assert!(ws.set_ipv6("nope", false, "2001:db8::1", 64, "", "").is_err());
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
    assert_eq!(ws.events.len(), 1);

    // Move one host to a foreign subnet: the PDU must refuse.
    ws.set_ip(&pcs[1], "10.0.0.5", 24).unwrap();
    let err = ws.send_pdu(&pcs[0], &pcs[1]).unwrap_err();
    assert!(err.contains("no route to 10.0.0.5"), "{err}");
    assert!(err.contains("no default gateway"), "{err}");
    assert_eq!(ws.events.len(), 1);
}

#[test]
fn static_routes_are_stored_and_shown() {
    let mut ws = Workspace::new();
    ws.set_port_ip("router0", "GigabitEthernet0/0", "192.168.1.1", 24)
        .unwrap();
    ws.add_route("router0", "10.0.0.0", "255.0.0.0", "192.168.1.254")
        .unwrap();
    // Prefix-length masks are accepted too, and 24-bit prefixes normalise.
    ws.add_route("router0", "172.16.5.130", "24", "192.168.1.254")
        .unwrap();

    let dev = ws.devices.iter().find(|d| d.id == "router0").unwrap();
    assert_eq!(dev.routes.len(), 2);
    assert_eq!(
        dev.routes[1],
        (
            crate::model::parse_ipv4("172.16.5.0").unwrap(),
            24,
            crate::model::parse_ipv4("192.168.1.254").unwrap()
        )
    );

    let out = ws.show_routes("router0");
    assert!(out.contains("Codes: C - connected, S - static"), "{out}");
    assert!(
        out.contains("C  192.168.1.0/24 is directly connected, GigabitEthernet0/0"),
        "{out}"
    );
    assert!(out.contains("S  10.0.0.0/8 [1/0] via 192.168.1.254"), "{out}");
    assert!(
        out.contains("S  172.16.5.0/24 [1/0] via 192.168.1.254"),
        "{out}"
    );

    assert!(ws.add_route("router0", "bad", "24", "192.168.1.254").is_err());
    assert!(ws.add_route("router0", "10.0.0.0", "255.0.255.0", "192.168.1.254").is_err());
    assert!(ws.add_route("router0", "10.0.0.0", "24", "nope").is_err());
    assert!(ws.add_route("nope", "10.0.0.0", "24", "192.168.1.254").is_err());
    assert!(ws.show_routes("nope").contains("Unknown"));
}

#[test]
fn same_subnet_delivery_uses_links() {
    let mut ws = Workspace::from_ptw("# lan\n").unwrap();
    let hub = ws.add("Hub", 400.0, 100.0).unwrap();
    let a = ws.add("PC-PT", 100.0, 300.0).unwrap();
    let b = ws.add("PC-PT", 700.0, 300.0).unwrap();
    ws.link(&a, &hub).unwrap();
    ws.link(&b, &hub).unwrap();
    ws.set_ip(&a, "192.168.1.10", 24).unwrap();
    ws.set_ip(&b, "192.168.1.20", 24).unwrap();

    ws.send_pdu(&a, &b).unwrap();
    assert_eq!(ws.events.len(), 1);
    assert_eq!(ws.events[0].path, vec![a.clone(), hub.clone(), b.clone()]);
}

#[test]
fn cross_subnet_delivery_follows_gateways() {
    let mut ws = Workspace::from_ptw("# routed lan\n").unwrap();
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
    assert_eq!(ws.events.len(), 2);
    assert_eq!(ws.events[0].last, "PC0");
    assert_eq!(ws.events[0].at, "PC1");
    assert_eq!(ws.events[1].last, "PC1");
    assert_eq!(ws.events[1].at, "PC0");
    for e in &ws.events {
        assert_eq!(e.path.len(), 3, "{:?}", e.path);
    }

    // Removing the gateway makes the same PDU unroutable.
    ws.set_config(&a, "192.168.1.10", "255.255.255.0", "", "")
        .unwrap();
    let err = ws.send_pdu(&a, &b).unwrap_err();
    assert!(err.contains("no route"), "{err}");
    assert!(err.contains("no default gateway"), "{err}");
    assert_eq!(ws.events.len(), 2);
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
    assert!(ws.events.is_empty());
}

#[test]
fn ptw_round_trip_preserves_topology() {
    let mut ws = Workspace::new();
    ws.send_pdu("pc0", "pc1").unwrap();
    let text = ws.to_ptw();
    let back = Workspace::from_ptw(&text).unwrap();
    assert_eq!(back.devices.len(), ws.devices.len());
    assert_eq!(back.links.len(), ws.links.len());
    assert_eq!(back.devices[0].name, ws.devices[0].name);
    assert_eq!(back.links[0].b_port, ws.links[0].b_port);
}

#[test]
fn power_off_drops_traffic_until_switched_back_on() {
    let mut ws = Workspace::new();
    assert!(ws.is_powered("pc1"));
    assert!(ws.set_power("pc1", false));
    assert!(!ws.is_powered("pc1"));
    let err = ws.send_pdu("pc0", "pc1").unwrap_err();
    assert!(err.contains("powered off"), "{err}");
    assert!(ws.events.is_empty());

    assert!(ws.set_power("pc1", true));
    ws.send_pdu("pc0", "pc1").unwrap();
    assert_eq!(ws.events.len(), 1);
}

#[test]
fn module_slots_add_ports_and_refuse_removal_while_cabled() {
    let mut ws = Workspace::new();
    let before = ws
        .devices
        .iter()
        .find(|d| d.id == "router0")
        .unwrap()
        .ports
        .len();
    ws.set_module("router0", 0, "HWIC-2T").unwrap();
    let dev = ws.devices.iter().find(|d| d.id == "router0").unwrap();
    assert_eq!(dev.ports.len(), before + 2);
    assert!(dev.ports.iter().any(|p| p.name == "Serial0/3/0"));
    assert_eq!(ws.modules("router0")[0].as_deref(), Some("HWIC-2T"));

    // Unknown models, out-of-range slots and slot-less devices are refused.
    assert!(ws.set_module("router0", 0, "NOPE").is_err());
    assert!(ws.set_module("router0", 5, "").is_err());
    assert!(ws.set_module("pc0", 0, "").is_err());

    // Cable the module's own port: removal must then be refused.
    let r1 = ws.add("2911", 700.0, 100.0).unwrap();
    ws.links.push(Link {
        a: "router0".into(),
        a_port: "Serial0/3/0".into(),
        b: r1.clone(),
        b_port: "Serial0/0/0".into(),
        kind: "eSerial".into(),
    });
    let err = ws.set_module("router0", 0, "").unwrap_err();
    assert!(err.contains("cabled"), "{err}");

    ws.unlink("router0", &r1);
    ws.set_module("router0", 0, "").unwrap();
    assert_eq!(ws.modules("router0")[0], None);
}

#[test]
fn dhcp_reservation_wins_over_pool_order() {
    let mut ws = Workspace::new();
    ws.set_dhcp_pool("server0", "192.168.2.0", 24, "192.168.2.1", "")
        .unwrap();
    ws.set_dhcp_reservation("server0", "pc2", "192.168.2.150")
        .unwrap();
    let lease = ws.acquire_dhcp("pc2").unwrap();
    assert_eq!(
        crate::model::ipv4_string(lease.ip),
        "192.168.2.150",
        "reservation beats the .100 walk"
    );
    assert!(ws.set_dhcp_reservation("nope", "pc2", "1.1.1.1").is_err());
    assert!(ws.set_dhcp_reservation("server0", "nope", "1.1.1.1").is_err());
    assert!(ws.set_dhcp_reservation("server0", "pc2", "bad").is_err());
}

#[test]
fn dhcp_relay_reaches_a_server_on_another_subnet() {
    let mut ws = Workspace::new();
    // Server answers for the client's subnet but sits across Router0.
    ws.set_dhcp_pool("server0", "192.168.1.0", 24, "192.168.1.1", "")
        .unwrap();
    let err = ws.acquire_dhcp("pc0").unwrap_err();
    assert!(err.contains("no DHCP server"), "{err}");

    ws.set_dhcp_helper("router0", "GigabitEthernet0/0", "192.168.2.20")
        .unwrap();
    let lease = ws.acquire_dhcp("pc0").unwrap();
    assert_eq!(crate::model::ipv4_string(lease.ip), "192.168.1.100");
    assert_eq!(lease.server, "server0");

    let out = run_show_helper(&ws);
    assert!(out.contains("192.168.2.20"), "{out}");

    let mut ws2 = Workspace::new();
    ws2.set_dhcp_pool("server0", "192.168.1.0", 24, "192.168.1.1", "")
        .unwrap();
    ws2.set_dhcp_helper("router0", "GigabitEthernet0/0", "192.168.2.20")
        .unwrap();
    assert!(ws2.remove_dhcp_helper("router0", "GigabitEthernet0/0"));
    let err = ws2.acquire_dhcp("pc0").unwrap_err();
    assert!(err.contains("no DHCP server"), "{err}");
}

/// Small helper so the workspace test does not need a CLI session.
fn run_show_helper(ws: &Workspace) -> String {
    match ws.dhcp_helpers.get("router0") {
        Some(list) => list
            .iter()
            .map(|(iface, ip)| format!("{} {iface}", crate::model::ipv4_string(*ip)))
            .collect::<Vec<_>>()
            .join("\n"),
        None => String::new(),
    }
}

#[test]
fn ftp_ntp_syslog_and_aaa_work_and_persist() {
    let mut ws = Workspace::new();
    ws.ftp_put("server0", "a.txt", "hello").unwrap();
    assert_eq!(ws.ftp_list("server0"), vec!["a.txt"]);
    assert!(ws.ftp_put("server0", "../x", "y").is_err());
    ws.ftp_put("server0", "a.txt", "").unwrap();
    assert!(ws.ftp_list("server0").is_empty());

    assert_eq!(ws.ntp_sync("pc0", "192.168.2.20").unwrap(), 0.0);
    assert_eq!(ws.ntp_status("pc0").unwrap().0, "192.168.2.20");
    assert!(ws.ntp_sync("pc0", "192.168.2.99").is_err());

    ws.syslog_enable("pc0", true).unwrap();
    ws.send_pdu("pc0", "server0").unwrap();
    let entries = ws.syslog_list("pc0");
    assert_eq!(entries.len(), 1);
    assert!(entries[0].2.contains("PC0"), "{:?}", entries);

    ws.aaa_add_user("server0", "alice", "pw").unwrap();
    assert_eq!(ws.aaa_list("server0"), vec!["alice"]);
    assert!(ws.aaa_add_user("server0", "alice", "pw").is_err());
    assert!(ws.aaa_add_user("server0", "bob", "").is_err());

    ws.ftp_put("server0", "b.txt", "x").unwrap();
    let back = Workspace::from_ptw(&ws.to_ptw()).unwrap();
    assert_eq!(back.ftp_list("server0"), vec!["b.txt"]);
    assert_eq!(back.ntp_status("pc0").unwrap().0, "192.168.2.20");
    assert_eq!(back.syslog_list("pc0").len(), 1);
    assert_eq!(back.aaa_list("server0"), vec!["alice"]);
}

#[test]
fn port_security_limits_macs_and_channel_groups_persist() {
    let mut ws = Workspace::new();
    ws.set_port_security("switch0", "fa0/3", 1).unwrap();
    assert!(ws.port_security_allowed("switch0", "FastEthernet0/3", "aa:bb"));
    assert!(ws.port_security_allowed("switch0", "FastEthernet0/3", "aa:bb"));
    assert!(!ws.port_security_allowed("switch0", "FastEthernet0/3", "cc:dd"));
    assert_eq!(ws.port_security_rows("switch0")[0].1, 1);
    assert_eq!(ws.port_security_rows("switch0")[0].2, 1);

    ws.set_channel_group("switch0", "fa0/2", 1).unwrap();
    ws.set_channel_group("switch0", "fa0/3", 1).unwrap();
    let groups = ws.channel_groups("switch0");
    assert_eq!(groups[0].0, 1);
    assert_eq!(groups[0].1.len(), 2);

    let back = Workspace::from_ptw(&ws.to_ptw()).unwrap();
    assert_eq!(back.port_security_rows("switch0")[0].2, 1);
    assert_eq!(back.channel_groups("switch0")[0].1.len(), 2);
}

#[test]
fn acl_binding_denies_and_persists() {
    use crate::model::parse_ipv4;
    let mut ws = Workspace::new();
    ws.acl_add(
        "router0",
        10,
        false,
        parse_ipv4("192.168.1.0").unwrap(),
        parse_ipv4("0.0.0.255").unwrap(),
        None,
    )
    .unwrap();
    ws.acl_bind("router0", "g0/0", 10, true).unwrap();
    let err = ws.send_pdu("pc0", "server0").unwrap_err();
    assert!(err.contains("ACL denied"), "{err}");
    ws.acl_unbind("router0", "g0/0").unwrap();
    ws.send_pdu("pc0", "server0").unwrap();

    ws.acl_bind("router0", "g0/0", 10, true).unwrap();
    let mut back = Workspace::from_ptw(&ws.to_ptw()).unwrap();
    assert!(back
        .send_pdu("pc0", "server0")
        .unwrap_err()
        .contains("ACL denied"));
    assert!(back.acl_lines("router0")[0].contains("deny 192.168.1.0"));
}

#[test]
fn nat_overload_translates_and_persists() {
    use crate::model::parse_ipv4;
    let mut ws = Workspace::new();
    ws.acl_add(
        "router0",
        10,
        true,
        parse_ipv4("192.168.1.0").unwrap(),
        parse_ipv4("0.0.0.255").unwrap(),
        None,
    )
    .unwrap();
    ws.set_nat_role("router0", "g0/0", true).unwrap();
    ws.set_nat_role("router0", "g0/1", false).unwrap();
    ws.add_nat_rule("router0", 10, "g0/1").unwrap();
    ws.send_pdu("pc0", "server0").unwrap();
    let rows = ws.nat_translation_lines("router0");
    assert_eq!(rows, vec!["192.168.1.10 -> 192.168.2.1"]);
    let note = ws
        .events
        .last()
        .unwrap()
        .hops
        .iter()
        .map(|h| h.note.clone())
        .collect::<Vec<_>>()
        .join("|");
    assert!(note.contains("NAT"), "{note}");

    let back = Workspace::from_ptw(&ws.to_ptw()).unwrap();
    assert_eq!(back.nat_binding_lines("router0").len(), 1);
    assert_eq!(back.nat_roles["router0"]["GigabitEthernet0/0"], true);
}

#[test]
fn rip_propagates_remote_networks_and_persists() {
    use crate::model::parse_ipv4;
    let mut ws = Workspace::new();
    let r1 = ws.add("2911", 300.0, 400.0).unwrap();
    let r2 = ws.add("2911", 600.0, 400.0).unwrap();
    ws.link_kind(&r1, &r2, "eSerial").unwrap();
    ws.set_port_ip(&r1, "Serial0/0/0", "10.0.0.1", 30).unwrap();
    ws.set_port_ip(&r2, "Serial0/0/0", "10.0.0.2", 30).unwrap();
    ws.set_port_ip(&r2, "Serial0/1/0", "10.1.0.1", 24).unwrap();
    ws.set_routing_protocol(&r1, "rip").unwrap();
    ws.add_routing_network(&r1, parse_ipv4("10.0.0.0").unwrap(), 30).unwrap();
    ws.set_routing_protocol(&r2, "ospf").unwrap();
    ws.add_routing_network(&r2, parse_ipv4("10.1.0.0").unwrap(), 24).unwrap();
    assert!(
        ws.dyn_routes[&r1]
            .iter()
            .any(|(n, p, _, _, _)| *n == parse_ipv4("10.1.0.0").unwrap() && *p == 24),
        "{:?}",
        ws.dyn_routes
    );
    assert!(ws.show_routes(&r1).contains("R  10.1.0.0/24"));
    let back = Workspace::from_ptw(&ws.to_ptw()).unwrap();
    assert!(back.routing.contains_key(&r1));
    assert!(back
        .dyn_routes
        .get(&r1)
        .map(|l| !l.is_empty())
        .unwrap_or(false));
}

#[test]
fn wireless_vpn_pppoe_and_phones_work_and_persist() {
    let mut ws = Workspace::new();
    let wlc = ws.add("WLC", 800.0, 100.0).unwrap();
    ws.wlan_add(&wlc, "LAB-WIFI", "supersecret").unwrap();
    assert_eq!(ws.wifi_scan().len(), 1);
    let err = ws.wifi_join("pc0", "LAB-WIFI", "wrongpass").unwrap_err();
    assert_eq!(err, "authentication failed");
    assert_eq!(ws.wifi_join("pc0", "LAB-WIFI", "supersecret").unwrap(), wlc);
    assert_eq!(ws.wifi_status("pc0").unwrap().0, "LAB-WIFI");

    ws.vpn_config("pc0", "192.168.2.20", "vpnuser").unwrap();
    assert_eq!(ws.vpn_status("pc0").unwrap().1, "vpnuser");
    ws.pppoe_config("pc0", "192.168.2.20", "dsluser").unwrap();
    assert!(ws.pppoe_status("pc0").is_some());
    ws.phone_register("pc0", "192.168.2.20", 1001).unwrap();
    assert_eq!(ws.phone_status("pc0").unwrap().1, 1001);

    let back = Workspace::from_ptw(&ws.to_ptw()).unwrap();
    assert_eq!(back.wlan_list(&wlc).len(), 1);
    assert_eq!(back.wifi_status("pc0").unwrap().0, "LAB-WIFI");
    assert!(back.vpn_status("pc0").is_some());
    assert!(back.pppoe_status("pc0").is_some());
    assert_eq!(back.phone_status("pc0").unwrap().1, 1001);
}

#[test]
fn slaac_derives_an_address_from_the_router_prefix() {
    let mut ws = Workspace::new();
    ws.set_ipv6("router0", false, "2001:db8:1::1", 64, "", "").unwrap();
    ws.set_ipv6("pc0", true, "", 64, "", "").unwrap();
    let pc = ws.devices.iter().find(|d| d.id == "pc0").unwrap();
    let addr = pc.ipv6.clone().unwrap();
    assert!(addr.starts_with("2001:db8:1::"), "{addr}");
    assert_eq!(pc.ipv6_gateway.as_deref(), Some("2001:db8:1::1"));
    assert!(pc.ipv6_auto);
    assert!(ws.slaac("server0").is_ok());
}

#[test]
fn wireless_enterprise_roaming_and_capwap() {
    let mut ws = Workspace::new();
    let wlc1 = ws.add("WLC", 800.0, 100.0).unwrap();
    let wlc2 = ws.add("WLC", 900.0, 100.0).unwrap();
    let ap = ws.add("Access Point", 850.0, 200.0).unwrap();
    ws.wlan_add(&wlc1, "LAB-WIFI", "supersecret").unwrap();
    ws.wlan_add(&wlc2, "LAB-WIFI", "supersecret").unwrap();
    ws.wlan_add_with(&wlc1, "CORP", "", "WPA2-Enterprise".into())
        .unwrap();
    ws.aaa_add_user("server0", "alice", "pw1234").unwrap();

    ws.capwap_join(&ap, &wlc1).unwrap();
    assert_eq!(ws.capwap_status(&ap).as_deref(), Some(wlc1.as_str()));
    assert!(ws.capwap_join("pc0", &wlc1).is_err());

    let first = ws.wifi_join("pc0", "LAB-WIFI", "supersecret").unwrap();
    assert!(first == wlc1 || first == wlc2, "{first}");
    ws.wifi_roam("pc0", &wlc2).unwrap();
    assert_eq!(ws.wifi_status("pc0").unwrap().1, wlc2);

    let err = ws.wifi_join_auth("pc0", "CORP", "wrong", "alice").unwrap_err();
    assert_eq!(err, "authentication failed");
    assert!(ws.wifi_join_auth("pc0", "CORP", "pw1234", "alice").is_ok());

    let back = Workspace::from_ptw(&ws.to_ptw()).unwrap();
    assert_eq!(back.wlan_list(&wlc1).len(), 2);
    assert_eq!(back.wifi_status("pc0").unwrap().0, "CORP");
    assert_eq!(back.capwap_status(&ap).as_deref(), Some(wlc1.as_str()));
}

#[test]
fn industrial_protocols_and_cell_tower_work() {
    let mut ws = Workspace::new();
    let plc = ws.add("PLC", 100.0, 500.0).unwrap();
    let ioe = ws.add("IoE", 300.0, 500.0).unwrap();
    let tower = ws.add("Cell Tower", 600.0, 500.0).unwrap();
    let phone = ws.add("PDA", 700.0, 500.0).unwrap();
    ws.link_kind(&plc, &ioe, "eIoT").unwrap();

    assert_eq!(ws.iot_write(&plc, 5, 42).unwrap(), 0);
    assert_eq!(ws.iot_read(&plc, 5).unwrap(), 42);
    assert!(ws.iot_write(&plc, 300, 1).is_err());

    ws.prp_enable(&plc, true).unwrap();
    ws.prp_enable(&ioe, true).unwrap();
    assert_eq!(ws.send_iot(&plc, &ioe, "prp", 7).unwrap(), "PRP delivered");
    let dup = ws.send_iot(&plc, &ioe, "prp", 7).unwrap();
    assert!(dup.contains("duplicate seq 7"), "{dup}");

    assert_eq!(ws.ptp_sync(&plc, &ioe).unwrap(), 0.0);
    assert_eq!(ws.ptp_status(&ioe).unwrap().0, plc);

    ws.cell_join(&phone, &tower).unwrap();
    assert_eq!(ws.cell_status(&phone).as_deref(), Some(tower.as_str()));
    let err = ws.send_iot(&phone, &plc, "cellular", 0).unwrap_err();
    assert!(err.contains("same cell tower"), "{err}");

    let mut back = Workspace::from_ptw(&ws.to_ptw()).unwrap();
    assert_eq!(back.iot_read(&plc, 5).unwrap(), 42);
    assert!(back.prp_on.contains(&plc));
    assert_eq!(back.ptp_status(&ioe).unwrap().0, plc);
    assert_eq!(back.cell_status(&phone).as_deref(), Some(tower.as_str()));
}

#[test]
fn dhcpv6_ips_and_inspection_are_real_state() {
    let mut ws = Workspace::new();
    ws.set_ipv6("server0", false, "2001:db8:5::1", 64, "", "").unwrap();
    let addr = ws.dhcpv6("pc0", "server0").unwrap();
    assert!(addr.starts_with("2001:db8:5::"), "{addr}");
    let pc = ws.devices.iter().find(|d| d.id == "pc0").unwrap();
    assert_eq!(pc.ipv6_gateway.as_deref(), Some("2001:db8:5::1"));
    assert!(!pc.ipv6_auto);
    assert!(ws.dhcpv6("pc0", "pc1").is_err());

    ws.set_ips("router0", "icmp", true).unwrap();
    assert!(ws.ips_drops("router0", "icmp"));
    let err = ws.send_pdu("pc0", "server0").unwrap_err();
    assert!(err.contains("IPS dropped icmp"), "{err}");
    ws.set_ips("router0", "icmp", false).unwrap();
    ws.send_pdu("pc0", "server0").unwrap();

    ws.set_inspection("router0", true).unwrap();
    assert!(ws.inspection_on("router0"));

    let back = Workspace::from_ptw(&ws.to_ptw()).unwrap();
    assert_eq!(back.devices.iter().find(|d| d.id == "pc0").unwrap().ipv6.as_deref(), Some(addr.as_str()));
    assert!(back.inspection_on("router0"));
    assert!(!back.ips_drops("router0", "icmp"));
}

#[test]
fn ospfv3_stores_ipv6_prefixes_and_shows_them() {
    let mut ws = Workspace::new();
    ws.set_routing_protocol("router0", "ospfv3").unwrap();
    ws.add_v6_network("router0", "2001:db8:9::/64").unwrap();
    ws.add_v6_network("router0", "10.0.0.0/8").unwrap_err();
    ws.set_ipv6("router0", false, "2001:db8:9::1", 64, "", "").unwrap();
    let out = ws.show_ipv6_routes("router0");
    assert!(out.contains("O  2001:db8:9::/64"), "{out}");
    assert!(out.contains("2001:db8:9::1/64"), "{out}");
    let back = Workspace::from_ptw(&ws.to_ptw()).unwrap();
    assert!(back.show_ipv6_routes("router0").contains("2001:db8:9::/64"));
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
    assert_eq!(ws.events.len(), 1);
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
    assert_eq!(blocked.len(), 2, "one blocked link = both ends: {blocked:?}");
    // Traffic still flows over the tree.
    ws.send_pdu("pc0", "pc2").unwrap();
    assert_eq!(ws.events.len(), 1);
}

#[test]
fn mailboxes_accept_and_list_messages() {
    let mut ws = Workspace::new();
    ws.add_mail_user("server0", "alice", "pw").unwrap();
    ws.add_mail_user("server0", "bob", "pw2").unwrap();
    assert!(ws.add_mail_user("server0", "alice", "x").is_err());
    assert!(ws.add_mail_user("nope", "a", "b").is_err());
    assert!(ws.add_mail_user("server0", "", "x").is_err());

    ws.send_mail("pc0", "server0", "alice", "bob", "hi", "body")
        .unwrap();
    let inbox = ws.mail_list("server0", "bob");
    assert_eq!(inbox.len(), 1);
    assert_eq!(inbox[0].subject, "hi");
    assert!(ws.mail_list("server0", "alice").is_empty());
    assert!(ws
        .send_mail("pc0", "server0", "alice", "carol", "x", "y")
        .is_err());
    assert!(ws.events.iter().any(|e| e.proto == "SMTP"));
}

#[test]
fn tftp_files_can_be_put_listed_and_removed() {
    let mut ws = Workspace::new();
    ws.tftp_put("server0", "config.txt", "hello").unwrap();
    assert_eq!(ws.tftp_list("server0"), vec!["config.txt"]);
    assert_eq!(
        ws.tftp_get("server0", "config.txt").as_deref(),
        Some("hello")
    );
    ws.tftp_put("server0", "config.txt", "").unwrap();
    assert!(ws.tftp_list("server0").is_empty());
    assert!(ws.tftp_put("server0", "a/b", "x").is_err());
    assert!(ws.tftp_put("server0", "missing", "").is_err());
}

#[test]
fn dns_resolves_names_on_the_local_segment() {
    let mut ws = Workspace::new();
    ws.set_dns_record("server0", "Web.LAB", "192.168.2.20").unwrap();
    let ip = crate::model::parse_ipv4("192.168.2.20").unwrap();
    assert_eq!(ws.resolve_name("pc2", "web.lab"), Some(ip));
    assert_eq!(ws.resolve_name("pc0", "web.lab"), None, "routers stop the query");
    assert!(ws.remove_dns_record("server0", "web.lab"));
    assert!(!ws.remove_dns_record("server0", "web.lab"));
    assert!(ws.set_dns_record("server0", "bad name", "1.1.1.1").is_err());
    assert!(ws.set_dns_record("server0", "x", "999.1.1.1").is_err());
}

#[test]
fn ptw_round_trip_covers_every_edited_field() {
    let mut ws = Workspace::new();
    ws.set_config("pc0", "192.168.1.10", "255.255.255.0", "192.168.1.1", "8.8.8.8")
        .unwrap();
    ws.set_ipv6("pc0", false, "2001:db8::1", 64, "2001:db8::ff", "2001:db8::53")
        .unwrap();
    ws.set_dot1x("pc0", true, "student", "s3cret").unwrap();
    ws.set_port_up("router0", "GigabitEthernet0/0", false);
    ws.add_route("router0", "10.0.0.0", "255.0.0.0", "192.168.1.254")
        .unwrap();
    ws.set_dhcp_pool("server0", "192.168.2.0", 24, "192.168.2.1", "8.8.8.8")
        .unwrap();
    ws.acquire_dhcp("pc2").unwrap();
    ws.banners
        .insert("router0".into(), "authorised\naccess only".into());
    ws.line_passwords.insert("router0".into(), "cisco".into());
    ws.set_power("pc0", false);
    ws.set_module("router0", 0, "HWIC-2T").unwrap();
    ws.set_dns_record("server0", "web.lab", "192.168.2.20").unwrap();
    assert!(ws.set_http_page("server0", "custom page\nsecond line"));
    ws.set_dhcp_reservation("server0", "pc2", "192.168.2.150").unwrap();
    ws.set_dhcp_helper("router0", "GigabitEthernet0/0", "192.168.2.20").unwrap();
    ws.vlan_create("switch0", 20, "SALES").unwrap();
    ws.set_access_vlan("switch0", "FastEthernet0/3", 20).unwrap();
    ws.set_trunk("switch0", "FastEthernet0/1", true).unwrap();
    ws.add_mail_user("server0", "alice", "pw").unwrap();
    ws.add_mail_user("server0", "bob", "pw2").unwrap();
    ws.send_mail("pc0", "server0", "alice", "bob", "subject", "body\ntext")
        .unwrap();
    ws.tftp_put("server0", "config.txt", "hostname x").unwrap();
    ws.link_kind("pc0", "router0", "eConsole").unwrap();

    let text = ws.to_ptw();
    let back = Workspace::from_ptw(&text).expect("reload");
    assert_eq!(back.to_ptw(), text, "save/load is idempotent");

    let pc0 = back.devices.iter().find(|d| d.id == "pc0").unwrap();
    assert_eq!(
        pc0.gateway,
        Some(crate::model::parse_ipv4("192.168.1.1").unwrap())
    );
    assert_eq!(pc0.dns, Some(crate::model::parse_ipv4("8.8.8.8").unwrap()));
    assert_eq!(pc0.ipv6.as_deref(), Some("2001:db8::1"));
    assert_eq!(pc0.ipv6_prefix, 64);
    assert!(pc0.dot1x);
    assert_eq!(pc0.dot1x_user.as_deref(), Some("student"));
    assert_eq!(pc0.dot1x_pass.as_deref(), Some("s3cret"));

    let r0 = back.devices.iter().find(|d| d.id == "router0").unwrap();
    assert_eq!(r0.routes.len(), 1);
    assert!(
        !r0.ports
            .iter()
            .find(|p| p.name == "GigabitEthernet0/0")
            .unwrap()
            .up
    );
    assert!(back.dhcp_pools.contains_key("server0"));
    assert!(back.dhcp_clients.contains("pc2"));
    assert!(!back.is_powered("pc0"), "power switch restored");
    assert_eq!(back.modules("router0")[0].as_deref(), Some("HWIC-2T"));
    let sw = back.devices.iter().find(|d| d.id == "switch0").unwrap();
    assert_eq!(
        sw.ports
            .iter()
            .find(|p| p.name == "FastEthernet0/3")
            .unwrap()
            .vlan,
        20
    );
    assert!(
        sw.ports
            .iter()
            .find(|p| p.name == "FastEthernet0/1")
            .unwrap()
            .trunk
    );
    assert_eq!(back.vlan_name("switch0", 20), "SALES");
    let inbox = back.mail_list("server0", "bob");
    assert_eq!(inbox.len(), 1);
    assert_eq!(inbox[0].body, "body\ntext");
    assert_eq!(back.tftp_list("server0"), vec!["config.txt"]);
    assert_eq!(
        back.tftp_get("server0", "config.txt").as_deref(),
        Some("hostname x")
    );
    assert_eq!(
        back.resolve_name("pc2", "web.lab"),
        Some(crate::model::parse_ipv4("192.168.2.20").unwrap())
    );
    assert_eq!(
        back.http_pages.get("server0").map(String::as_str),
        Some("custom page\nsecond line")
    );
    assert_eq!(
        back.dhcp_reservations
            .get("server0")
            .and_then(|l| l.iter().find(|(c, _)| c == "pc2"))
            .map(|(_, ip)| *ip),
        Some(crate::model::parse_ipv4("192.168.2.150").unwrap())
    );
    assert_eq!(
        back.dhcp_helpers
            .get("router0")
            .and_then(|l| l.first())
            .map(|(i, ip)| (i.as_str(), *ip)),
        Some((
            "GigabitEthernet0/0",
            crate::model::parse_ipv4("192.168.2.20").unwrap()
        ))
    );
    assert_eq!(
        back.banners.get("router0").unwrap(),
        "authorised\naccess only"
    );
    assert_eq!(back.line_passwords.get("router0").unwrap(), "cisco");
    assert!(back
        .links
        .iter()
        .any(|l| l.kind == "eConsole" && l.a_port == "RS-232"));
}

#[test]
fn mesh_links_every_pair_once_and_is_idempotent() {
    let mut ws = Workspace::new();
    let a = ws.add("PC-PT", 100.0, 100.0).unwrap();
    let b = ws.add("Laptop", 200.0, 100.0).unwrap();
    let c = ws.add("Server", 300.0, 100.0).unwrap();
    let ids = vec![a.clone(), b.clone(), c.clone(), c.clone()];

    assert_eq!(ws.mesh(&ids).unwrap(), 3);
    for (x, y) in [(&a, &b), (&a, &c), (&b, &c)] {
        assert!(
            ws.links
                .iter()
                .any(|l| (&l.a == x && &l.b == y) || (&l.a == y && &l.b == x)),
            "missing {x}-{y}"
        );
    }
    assert_eq!(ws.mesh(&ids).unwrap(), 0, "second mesh added links");
    assert_eq!(
        ws.links
            .iter()
            .filter(|l| [&a, &b, &c].iter().any(|d| l.a == **d || l.b == **d))
            .count(),
        3
    );
}

#[test]
fn mesh_of_four_devices_creates_six_links() {
    let mut ws = Workspace::new();
    let mut ids = Vec::new();
    for i in 0..4 {
        ids.push(ws.add("PC-PT", 100.0 + 40.0 * i as f32, 100.0).unwrap());
    }
    let before = ws.links.len();
    assert_eq!(ws.mesh(&ids).unwrap(), 6);
    assert_eq!(ws.links.len(), before + 6);
    assert_eq!(ws.mesh(&ids).unwrap(), 0);
}

#[test]
fn mesh_rejects_fewer_than_two_known_devices() {
    let mut ws = Workspace::new();
    assert!(ws.mesh(&[]).is_err());
    assert!(ws.mesh(&["pc0".to_string()]).is_err());
    assert!(ws.mesh(&["pc0".to_string(), "ghost".to_string()]).is_err());
    assert!(ws.mesh(&["ghost".to_string(), "phantom".to_string()]).is_err());
    // A failed mesh must not have touched the topology.
    assert_eq!(ws.links.len(), 6);
}

#[test]
fn mesh_skips_pairs_that_are_already_linked() {
    let mut ws = Workspace::new();
    let pc = ws.add("PC-PT", 700.0, 450.0).unwrap();
    ws.link(&pc, "switch0").unwrap();
    assert_eq!(ws.mesh(&[pc.clone(), "switch0".to_string()]).unwrap(), 0);
    assert_eq!(ws.mesh(&[pc.clone(), "switch0".to_string()]).unwrap(), 0);
}

#[test]
fn catalog_icons_exist_in_extracted_tree() {
    let art = std::path::Path::new(env!("CARGO_MANIFEST_DIR"))
        .join("intake/20261101-102334/appimage/opt/pt/art");
    if !art.is_dir() {
        return; // extracted asset tree absent: nothing to verify against
    }
    for (label, tile, kind) in CATALOG {
        let p = art.join("ComponentBox").join(tile);
        assert!(p.is_file(), "{label}: missing tile {}", p.display());
        let icon = logical_icon(kind);
        if let Some(name) = icon.strip_prefix("/art/") {
            let p = std::path::Path::new(env!("CARGO_MANIFEST_DIR"))
                .join("web/art")
                .join(name);
            assert!(p.is_file(), "{label}: missing own icon {}", p.display());
        } else {
            let rel = icon.strip_prefix("art/").unwrap_or(icon);
            let p = art.join(rel);
            assert!(p.is_file(), "{label}: missing icon {}", p.display());
        }
    }
}

#[test]
fn palette_and_canvas_share_the_asset_tree_with_svg_fallback() {
    let ws = Workspace::new();
    let json = ws.json();
    for (label, tile, kind) in CATALOG {
        let _ = tile;
        let icon = logical_icon(kind);
        let art = logical_art(kind);
        let needle = format!("\"label\":\"{label}\",\"icon\":\"{icon}\",\"art\":\"{art}\"");
        assert!(json.contains(&needle), "{label}: palette entry mismatch");
    }
    for d in &ws.devices {
        let needle = format!("\"icon\":\"{}\",\"art\":\"{}\"", d.icon, logical_art(&d.kind));
        assert!(json.contains(&needle), "{}: device icon mismatch", d.name);
    }
}

#[test]
fn every_catalog_kind_is_named_and_drawn() {
    // `pc` deliberately shares the generic workstation artwork.
    let fallback = logical_icon("__unknown_kind__");
    for (label, _, kind) in CATALOG {
        assert_ne!(name_prefix(kind), "Device", "{label} lacks a name prefix");
        if *kind != "pc" {
            assert_ne!(logical_icon(kind), fallback, "{label} falls back to the generic icon");
        }
    }
}
