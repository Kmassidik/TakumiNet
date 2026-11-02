use super::super::*;

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
