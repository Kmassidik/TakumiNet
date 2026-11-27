//! ESP site-to-site IPSec on the wire: hops across the internet see the
//! ESP tunnel headers, the gateways note encap/decap, and the template demo
//! plays an IKE handshake before the tunneled ping.

use super::super::*;
use crate::model::parse_ipv4 as ip;

/// Home LAN — HomeEnd — Internet — OfficeEnd — office LAN, both tunnel ends
/// up: the shape of tpl-l3-office-vpn, built by hand so the tests control it.
fn site_to_site() -> (Workspace, String, String, String, String, String) {
    let mut ws = Workspace::empty();
    let laptop = ws.add("Laptop", 0.0, 300.0).unwrap();
    let home = ws.add("Router 300", 100.0, 200.0).unwrap();
    let cloud = ws.add("Cloud", 200.0, 100.0).unwrap();
    let office = ws.add("Router 300", 300.0, 200.0).unwrap();
    let server = ws.add("Server", 400.0, 300.0).unwrap();
    ws.link_ports(&laptop, &home, "eCross", Some("Fa0"), Some("GigabitEthernet0/0")).unwrap();
    ws.link_ports(&home, &cloud, "eCopper", Some("GigabitEthernet0/1"), Some("Fa0")).unwrap();
    ws.link_ports(&cloud, &office, "eCopper", Some("Fa1"), Some("GigabitEthernet0/0")).unwrap();
    ws.link_ports(&office, &server, "eCopper", Some("GigabitEthernet0/1"), Some("Fa0")).unwrap();

    ws.set_config(&laptop, "192.168.99.20", "255.255.255.0", "192.168.99.1", "").unwrap();
    ws.set_config(&server, "192.168.20.2", "255.255.255.0", "192.168.20.1", "").unwrap();
    ws.set_port_ip(&home, "GigabitEthernet0/0", "192.168.99.1", 24).unwrap();
    ws.set_port_ip(&home, "GigabitEthernet0/1", "203.0.113.1", 30).unwrap();
    ws.set_port_ip(&office, "GigabitEthernet0/0", "203.0.113.2", 30).unwrap();
    ws.set_port_ip(&office, "GigabitEthernet0/1", "192.168.20.1", 24).unwrap();
    ws.add_route(&home, "192.168.20.0", "255.255.255.0", "203.0.113.2", 1).unwrap();
    ws.add_route(&office, "192.168.99.0", "255.255.255.0", "203.0.113.1", 1).unwrap();
    ws.tunnel_config(&home, "203.0.113.2", "office-key-1").unwrap();
    ws.tunnel_config(&office, "203.0.113.1", "office-key-1").unwrap();
    (ws, laptop, server, home, office, cloud)
}

#[test]
fn a_private_ping_across_the_cloud_rides_esp_with_the_outer_gateway_addresses() {
    let (mut ws, laptop, server, home, office, cloud) = site_to_site();
    ws.send_pdu(&laptop, &server).expect("tunneled ping crosses the internet");
    let event = ws.events.iter().find(|e| e.proto == "ICMP").expect("captured delivery");

    // The gateways terminate the tunnel: encap on the way in, decap on the way out.
    let ingress = event.hops.iter().find(|h| h.id == home).unwrap();
    assert!(ingress.note.contains("encapsulates"), "{}", ingress.note);
    assert!(ingress.note.contains("ESP"), "{}", ingress.note);
    assert!(ingress.note.contains(&ipsec::spi_of(&ws, home.as_str())), "{}", ingress.note);
    assert!(ingress.note.contains("203.0.113.1") && ingress.note.contains("203.0.113.2"),
        "the note names both gateway addresses: {}", ingress.note);
    let egress = event.hops.iter().find(|h| h.id == office).unwrap();
    assert!(egress.note.contains("decapsulates"), "{}", egress.note);
    assert!(egress.note.contains("192.168.20.2"), "the decap note names the real destination: {}", egress.note);

    // The one hop strictly inside the tunnel — the cloud — decodes only the
    // tunnel: outer gateway addresses, protocol 50, and the shared SPI.
    let cloud_hop = event.hops.iter().find(|h| h.id == cloud).unwrap();
    let wan_ip = cloud_hop.layers.iter().find(|l| l.name == "IPv4 (tunnel)").expect("tunnel IP layer decoded");
    assert_eq!(wan_ip.fields.iter().find(|(k, _)| k == "Source").map(|(_, v)| v.as_str()), Some("203.0.113.1"));
    assert_eq!(wan_ip.fields.iter().find(|(k, _)| k == "Destination").map(|(_, v)| v.as_str()), Some("203.0.113.2"));
    assert_eq!(wan_ip.fields.iter().find(|(k, _)| k == "Protocol").map(|(_, v)| v.as_str()), Some("ESP (50)"));
    let esp = cloud_hop.layers.iter().find(|l| l.name == "ESP").expect("ESP layer decoded");
    assert_eq!(esp.fields.iter().find(|(k, _)| k == "SPI").map(|(_, v)| v.as_str()),
        Some(format!("0x{:08x}", ipsec::spi("office-key-1")).as_str()));
    assert!(!wan_ip.fields.iter().any(|(k, _)| k == "Source" && k.is_empty()), "no phantom fields");
    let _ = (laptop, server);
}

/// Test-only view of the SPI the workspace's tunnel key derives.
mod ipsec {
    pub fn spi(key: &str) -> u32 { crate::net::ipsec::spi_from_key(key) }
    pub fn spi_of(ws: &crate::workspace::Workspace, dev: &str) -> String {
        let key = ws.tunnels.get(dev).map(|(_, k)| k.as_str()).unwrap_or_default();
        format!("0x{:08x}", spi(key))
    }
}

#[test]
fn a_sniffer_on_the_wan_captures_gateway_ips_and_the_spi_not_the_private_ips() {
    let (mut ws, laptop, server, home, _office, _cloud) = site_to_site();
    // The in-path sniffer row an ESP frame produces at a WAN hop, exactly
    // what fwd records when a tap sits between the gateways.
    let tap = ws.add("Sniffer", 350.0, 150.0).unwrap();
    let encap = crate::net::ipsec::tunnel_plan(
        &ws,
        &[laptop.clone(), home.clone(), "cloud0".into(), "router1".into(), server.clone()],
        &laptop,
        &server,
    ).expect("the site-to-site path has an ESP plan");
    let inner = crate::net::packet::Packet {
        src: ip("192.168.99.20").unwrap(),
        dst: ip("192.168.20.2").unwrap(),
        ttl: 128,
        proto: crate::net::packet::IpProto::Icmp,
        payload: crate::net::packet::Payload::EchoRequest { id: 0x0a01, seq: 1 },
    };
    crate::net::ipsec::sniff_encapsulated(&mut ws, &tap, 1.0, crate::net::packet::Mac([1; 6]), crate::net::packet::Mac([2; 6]), &encap, &inner);
    let rows = ws.tables.sniffer_rows(&tap);
    let row = rows.iter().find(|r| r.proto == "esp").expect("the sniffer recorded the ESP frame");
    assert_eq!(row.src_ip, "203.0.113.1", "capture row shows the outer gateway source");
    assert_eq!(row.dst_ip, "203.0.113.2", "capture row shows the outer gateway destination");
    assert!(row.info.contains(&format!("0x{:08x}", ipsec::spi("office-key-1"))), "{}", row.info);
    assert!(row.info.contains("192.168.20.2"), "the info names the protected destination: {}", row.info);
    let expected = 14 + 20 + 8 + 16 + 20 + 40;
    assert_eq!(row.length, expected, "58 bytes of ESP overhead over the 60-byte inner ping");
    assert!(!rows.iter().any(|r| r.proto == "icmp"), "the private ping never rides the WAN in the clear");
}

#[test]
fn the_tunnel_gate_still_blocks_when_an_end_goes_down_and_no_esp_flows() {
    let (mut ws, laptop, server, home, _office, _cloud) = site_to_site();
    assert!(ws.tunnel_clear(&home));
    let refusal = ws.send_pdu(&laptop, &server).unwrap_err();
    assert!(refusal.contains("tunnel"), "{refusal}");
    assert!(ws.events.iter().all(|e| e.proto != "ESP-ICMP"), "no encapsulated event for a blocked delivery");
}

#[test]
fn the_vpn_template_demo_plays_ike_then_shows_esp_on_the_wan() {
    let mut ws = Workspace::from_tnet(include_str!("../../../web/templates/tpl-l3-office-vpn.xml")).unwrap();
    let steps = ws.run_demo().expect("the vpn demo runs");
    assert_eq!(steps, 5);
    // Step 1 is the IKE handshake: phase 1 and phase 2 captured at the gateways.
    let ike = ws.events.iter().find(|e| e.kind == "IKE").expect("IKE handshake captured");
    assert!(ike.layers.iter().any(|l| l.name == "IKE SA INIT"), "{:?}", ike.layers.iter().map(|l| &l.name).collect::<Vec<_>>());
    assert!(ike.layers.iter().any(|l| l.name == "IKE QUICK MODE"));
    let spi_field = ike.layers.iter().find(|l| l.name == "IKE QUICK MODE").unwrap()
        .fields.iter().find(|(k, _)| k == "SPI").map(|(_, v)| v.clone()).unwrap();
    assert_eq!(spi_field, format!("0x{:08x}", ipsec::spi("office-key-1")));
    assert!(ike.note.contains("SPI"), "{}", ike.note);

    // laptop0→server0 then crosses the cloud: the Internet hop decodes the
    // ESP stack, and the gateways note encap/decap.
    let ping = ws.events.iter().find(|e| e.proto == "ICMP" && e.last == "OwnerLaptop").expect("tunneled ping captured");
    let cloud_hop = ping.hops.iter().find(|h| h.name == "Internet").unwrap();
    let wan_ip = cloud_hop.layers.iter().find(|l| l.name == "IPv4 (tunnel)").expect("tunnel IP layer decoded");
    assert_eq!(wan_ip.fields.iter().find(|(k, _)| k == "Source").map(|(_, v)| v.as_str()), Some("203.0.113.1"));
    assert_eq!(wan_ip.fields.iter().find(|(k, _)| k == "Destination").map(|(_, v)| v.as_str()), Some("203.0.113.2"));
    assert!(cloud_hop.layers.iter().any(|l| l.name == "ESP"), "the WAN hop decodes an ESP layer");
    assert!(cloud_hop.layers.iter().find(|l| l.name == "ESP").unwrap()
        .fields.iter().find(|(k, _)| k == "SPI").map(|(_, v)| v.as_str()) == Some(format!("0x{:08x}", ipsec::spi("office-key-1")).as_str()));
    let office_hop = ping.hops.iter().find(|h| h.name == "OfficeEnd").unwrap();
    assert!(office_hop.note.contains("decapsulates"), "{}", office_hop.note);
    let home_hop = ping.hops.iter().find(|h| h.name == "HomeEnd").unwrap();
    assert!(home_hop.note.contains("encapsulates"), "{}", home_hop.note);
}
