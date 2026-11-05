use super::super::*;
use crate::cli::{run as cli_run, Session};

fn lab() -> (Workspace, String) {
    let mut ws = Workspace::empty();
    let sw = ws.add("Switch 24", 300.0, 100.0).unwrap();
    ws.add("Server", 600.0, 100.0).unwrap();
    ws.add("PC", 600.0, 300.0).unwrap();
    ws.link_ports(&sw, "server0", "eCopper", Some("FastEthernet0/1"), None).unwrap();
    ws.link_ports(&sw, "pc0", "eCopper", Some("FastEthernet0/2"), None).unwrap();
    ws.set_dhcp_pool("server0", "10.40.0.0", 24, "10.40.0.1", "").unwrap();
    (ws, sw)
}

#[test]
fn an_untrusted_server_port_blocks_the_offer_until_it_is_trusted() {
    let (mut ws, sw) = lab();
    ws.set_dhcp_snooping(&sw, true);
    let err = ws.acquire_dhcp("pc0").unwrap_err();
    assert!(err.contains("no DHCP server"), "{err}");
    assert_eq!(ws.dhcp_snoop_drops(&sw), 1);
    ws.dhcp_snooping_trust(&sw, "FastEthernet0/1", true);
    let lease = ws.acquire_dhcp("pc0").unwrap();
    assert_eq!(crate::model::ipv4_string(lease.ip), "10.40.0.100");
    let rows = ws.snoop_binding_rows(&sw);
    assert_eq!(rows.len(), 1);
    assert_eq!(rows[0].port, "FastEthernet0/2");
}

#[test]
fn arp_inspection_drops_a_reply_whose_mac_does_not_match_the_binding() {
    let (mut ws, sw) = lab();
    ws.set_dhcp_snooping(&sw, true);
    ws.dhcp_snooping_trust(&sw, "FastEthernet0/1", true);
    ws.acquire_dhcp("pc0").unwrap();
    let ip = ws.devices.iter().find(|d| d.id == "pc0").unwrap().ip.unwrap();
    let mac = crate::net::packet::Mac::for_device("pc0").to_string();
    ws.set_arp_inspection(&sw, true);
    assert!(ws.arp_inspection_allows(&sw, "FastEthernet0/2", ip, &mac));
    assert!(!ws.arp_inspection_allows(&sw, "FastEthernet0/2", ip, "02:00:00:00:00:99"));
    assert_eq!(ws.arp_inspection_drops(&sw), 1);
    ws.dhcp_snooping_trust(&sw, "FastEthernet0/2", true);
    assert!(ws.arp_inspection_allows(&sw, "FastEthernet0/2", ip, "02:00:00:00:00:99"));
}

#[test]
fn snooping_config_and_bindings_round_trip() {
    let (mut ws, sw) = lab();
    ws.set_dhcp_snooping(&sw, true);
    ws.dhcp_snooping_trust(&sw, "FastEthernet0/1", true);
    ws.set_arp_inspection(&sw, true);
    ws.acquire_dhcp("pc0").unwrap();
    let back = Workspace::from_tnet(&ws.to_tnet()).unwrap();
    assert!(back.dhcp_snooping(&sw));
    assert!(back.arp_inspection(&sw));
    assert!(back.port_trusted(&sw, "FastEthernet0/1"));
    assert_eq!(back.snoop_binding_rows(&sw).len(), 1);
}

#[test]
fn the_cli_enables_snooping_trust_and_lists_bindings() {
    let (mut ws, sw) = lab();
    let mut s = Session::default();
    for line in ["enable", "configure terminal", "ip dhcp snooping", "interface FastEthernet0/1", "ip dhcp snooping trust", "end"] {
        cli_run(&mut ws, &sw, &mut s, line);
    }
    ws.acquire_dhcp("pc0").unwrap();
    let table = cli_run(&mut ws, &sw, &mut s, "show ip dhcp snooping binding");
    assert!(table.contains("10.40.0.100") && table.contains("FastEthernet0/2"), "{table}");
}

fn rogue_lab() -> (Workspace, String, String, String) {
    let mut ws = Workspace::empty();
    let sw0 = ws.add("Switch 24", 200.0, 100.0).unwrap();
    let sw1 = ws.add("Switch 24", 600.0, 100.0).unwrap();
    let rogue = ws.add("Router 300", 200.0, 300.0).unwrap();
    ws.add("Server", 600.0, 300.0).unwrap();
    ws.add("PC", 100.0, 400.0).unwrap();
    ws.link_ports(&sw0, &rogue, "eCopper", Some("FastEthernet0/2"), Some("GigabitEthernet0/0")).unwrap();
    ws.link_ports(&sw0, "pc0", "eCopper", Some("FastEthernet0/1"), None).unwrap();
    ws.link_ports(&sw0, &sw1, "eCopper", Some("FastEthernet0/3"), Some("FastEthernet0/1")).unwrap();
    ws.link_ports(&sw1, "server0", "eCopper", Some("FastEthernet0/2"), None).unwrap();
    ws.set_dhcp_pool("server0", "10.70.0.0", 24, "10.70.0.1", "").unwrap();
    ws.set_dhcp_pool(&rogue, "10.70.0.0", 24, "10.70.0.254", "").unwrap();
    (ws, sw0, sw1, rogue)
}

#[test]
fn without_snooping_the_nearest_rogue_server_wins() {
    let (mut ws, _sw0, _sw1, _rogue) = rogue_lab();
    let lease = ws.acquire_dhcp("pc0").unwrap();
    assert_eq!(lease.server, "router0");
    assert_eq!(lease.gateway, Some(crate::model::parse_ipv4("10.70.0.254").unwrap()));
}

#[test]
fn snooping_falls_through_to_the_trusted_server() {
    let (mut ws, sw0, sw1, _rogue) = rogue_lab();
    ws.set_dhcp_snooping(&sw0, true);
    ws.set_dhcp_snooping(&sw1, true);
    ws.dhcp_snooping_trust(&sw1, "FastEthernet0/2", true);
    let lease = ws.acquire_dhcp("pc0").unwrap();
    assert_eq!(lease.server, "server0", "the legacy server must be used");
    assert_eq!(lease.gateway, Some(crate::model::parse_ipv4("10.70.0.1").unwrap()));
    assert!(ws.dhcp_snoop_drops(&sw0) + ws.dhcp_snoop_drops(&sw1) >= 1);
}

#[test]
fn arp_inspection_drops_a_duplicate_address_reply_from_a_real_delivery() {
    let mut ws = Workspace::empty();
    let sw = ws.add("Switch 24", 200.0, 100.0).unwrap();
    ws.add("PC", 100.0, 300.0).unwrap();
    let ip = "10.80.0.50";
    ws.set_ip("pc0", ip, 24).unwrap();
    let mut dup_dev = ws.devices.iter().find(|d| d.id == "pc0").unwrap().clone();
    dup_dev.id = "dup0".into();
    dup_dev.name = "Attacker".into();
    dup_dev.ip = crate::model::parse_ipv4(ip);
    ws.devices.push(dup_dev);
    let dup = "dup0".to_string();
    ws.add("PC", 400.0, 300.0).unwrap();
    let probe = ws.devices.last().unwrap().id.clone();
    ws.set_ip(&probe, "10.80.0.60", 24).unwrap();
    for (port, id) in [("FastEthernet0/1", "pc0"), ("FastEthernet0/2", dup.as_str()), ("FastEthernet0/3", probe.as_str())] {
        ws.link_ports(&sw, id, "eCopper", Some(port), None).unwrap();
    }
    let mac0 = crate::net::packet::Mac::for_device("pc0").to_string();
    ws.snoop.bindings.push(SnoopBinding {
        switch: sw.clone(), port: "FastEthernet0/1".into(), mac: mac0,
        ip: crate::model::parse_ipv4(ip).unwrap(), vlan: 1,
    });
    ws.set_arp_inspection(&sw, true);
    let _ = crate::net::fwd::deliver(&mut ws, &probe, &dup);
    assert_eq!(ws.arp_inspection_drops(&sw), 1);
}
