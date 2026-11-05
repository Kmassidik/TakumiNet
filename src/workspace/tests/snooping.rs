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
    assert!(err.contains("DHCP snooping") && err.contains("untrusted"), "{err}");
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
