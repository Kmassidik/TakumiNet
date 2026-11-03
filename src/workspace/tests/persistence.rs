use super::super::*;

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
fn legacy_routing_records_use_protocol_defaults() {
    let mut ws = Workspace::new();
    ws.add_route("router0", "10.0.0.0", "8", "192.168.1.254", 200)
        .unwrap();
    ws.set_port_bandwidth("router0", "GigabitEthernet0/0", 10_000)
        .unwrap();
    ws.set_port_delay("router0", "GigabitEthernet0/0", 250)
        .unwrap();
    ws.set_routing_protocol("router0", "ospf", 42).unwrap();
    ws.add_routing_network(
        "router0",
        crate::model::parse_ipv4("192.168.1.0").unwrap(),
        24,
        7,
    )
    .unwrap();
    let mut legacy = String::new();
    for line in ws.to_ptw().lines() {
        let keep = if line.starts_with("route\t") {
            5
        } else if line.starts_with("port\t") {
            8
        } else if line.starts_with("routing\t") {
            3
        } else if line.starts_with("routenet\t") {
            4
        } else {
            usize::MAX
        };
        legacy.push_str(&line.split('\t').take(keep).collect::<Vec<_>>().join("\t"));
        legacy.push('\n');
    }
    let back = Workspace::from_ptw(&legacy).expect("legacy load");
    let router = back.devices.iter().find(|d| d.id == "router0").unwrap();
    assert_eq!(router.routes[0].admin_distance, 1);
    let port = router
        .ports
        .iter()
        .find(|p| p.name == "GigabitEthernet0/0")
        .unwrap();
    assert_eq!((port.bandwidth_kbps, port.delay_us), (1_000_000, 10));
    assert_eq!(
        back.routing["router0"].protocol,
        RoutingProtocol::Ospf { process_id: 1 }
    );
    assert_eq!(back.routing["router0"].networks[0].area, 0);
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
    ws.set_port_bandwidth("router0", "GigabitEthernet0/0", 10_000).unwrap();
    ws.set_port_delay("router0", "GigabitEthernet0/0", 250).unwrap();
    ws.add_route("router0", "10.0.0.0", "255.0.0.0", "192.168.1.254", 200)
        .unwrap();
    ws.set_routing_protocol("router0", "ospf", 42).unwrap();
    ws.add_routing_network("router0", crate::model::parse_ipv4("192.168.2.0").unwrap(), 24, 7).unwrap();
    ws.set_dhcp_pool("server0", "192.168.2.0", 24, "192.168.2.1", "192.168.2.20")
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
    ws.ensure_subinterface("router0", "g0/0.10").unwrap();
    ws.set_port_ip("router0", "GigabitEthernet0/0.10", "192.168.10.1", 24).unwrap();
    ws.set_channel_group_mode("switch0", "FastEthernet0/1", 1, "active").unwrap();
    ws.set_stp_mode("switch0", "rapid-pvst").unwrap();
    ws.set_stp_priority("switch0", 1, 4096).unwrap();
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
    assert_eq!(r0.routes[0].admin_distance, 200);
    let primary = r0.ports.iter().find(|p| p.name == "GigabitEthernet0/0").unwrap();
    assert_eq!((primary.bandwidth_kbps, primary.delay_us), (10_000, 250));
    assert_eq!(back.routing["router0"].protocol, RoutingProtocol::Ospf { process_id: 42 });
    assert_eq!(back.routing["router0"].networks[0].area, 7);
    let subif = r0.ports.iter().find(|p| p.name == "GigabitEthernet0/0.10").unwrap();
    assert_eq!(subif.dot1q, Some(10));
    assert_eq!(subif.ip, crate::model::parse_ipv4("192.168.10.1"));
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
    assert_eq!(back.channel_mode("switch0", "FastEthernet0/1"), "active");
    assert_eq!(back.stp_mode("switch0"), "rapid-pvst");
    assert_eq!(back.stp_priority("switch0", 1), 4096);
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
