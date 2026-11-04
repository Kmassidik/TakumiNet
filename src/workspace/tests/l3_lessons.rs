use super::super::*;

const OFFICE: &str = include_str!("../../../web/templates/tpl-l3-office-vlans.xml");

#[test]
fn office_routes_between_vlans_through_the_trunk() {
    let mut ws = Workspace::from_tnet(OFFICE).unwrap();
    assert!(ws.send_pdu("pc0", "server0").is_ok());
    assert!(ws.send_pdu("pc0", "printer0").is_ok());
    assert!(ws.send_pdu("pc0", "pc1").is_ok());
}

#[test]
fn office_vlans_really_separate_traffic_when_the_router_link_is_down() {
    let mut ws = Workspace::from_tnet(OFFICE).unwrap();
    ws.set_port_up("router0", "GigabitEthernet0/0", false);
    assert!(ws.send_pdu("pc0", "pc1").is_ok(), "same VLAN still works");
    assert!(ws.send_pdu("pc0", "server0").is_err(), "different VLANs cannot meet without a router");
}

fn passes(ws: &mut Workspace) -> Vec<bool> {
    ws.run_checks().into_iter().map(|r| r.passed).collect()
}

#[test]
fn three_vlans_lesson_fails_untouched_and_passes_when_followed() {
    let mut ws = Workspace::from_tnet(include_str!("../../../web/templates/les-l3-01-three-vlans.xml")).unwrap();
    assert!(passes(&mut ws).iter().take(4).all(|p| !p));
    for (v, n) in [(10, "staff"), (20, "servers"), (30, "devices")] {
        ws.vlan_create("switch0", v, n).unwrap();
    }
    for (port, v) in [(2, 10), (3, 10), (4, 20), (5, 20), (6, 30)] {
        ws.set_access_vlan("switch0", &format!("FastEthernet0/{port}"), v).unwrap();
    }
    ws.set_trunk("switch0", "FastEthernet0/1", true).unwrap();
    assert_eq!(passes(&mut ws), vec![true; 5]);
}

#[test]
fn inter_vlan_lesson_needs_the_subinterfaces() {
    let mut ws = Workspace::from_tnet(include_str!("../../../web/templates/les-l3-02-inter-vlan.xml")).unwrap();
    assert_eq!(passes(&mut ws), vec![false; 4]);
    for (v, ip) in [(10, "192.168.10.1"), (20, "192.168.20.1"), (30, "192.168.30.1")] {
        let sub = ws.ensure_subinterface("router0", &format!("GigabitEthernet0/0.{v}")).unwrap();
        ws.set_port_ip("router0", &sub, ip, 24).unwrap();
    }
    assert_eq!(passes(&mut ws), vec![true; 4]);
}

#[test]
fn an_acl_keeps_the_printer_vlan_away_from_the_servers() {
    use crate::model::parse_ipv4 as ip;
    let mut ws = Workspace::from_tnet(OFFICE).unwrap();
    assert!(ws.send_pdu("printer0", "server0").is_ok());
    let none = ip("0.0.0.0").unwrap();
    let all = ip("255.255.255.255").unwrap();
    let wild = ip("0.0.0.255").unwrap();
    ws.acl_add("router0", 100, false, ip("192.168.30.0").unwrap(), wild, Some((ip("192.168.20.0").unwrap(), wild))).unwrap();
    ws.acl_add("router0", 100, true, none, all, Some((none, all))).unwrap();
    ws.acl_bind("router0", "GigabitEthernet0/0.30", 100, true).unwrap();
    assert!(ws.send_pdu("printer0", "server0").unwrap_err().contains("ACL denied"));
    assert!(ws.send_pdu("pc0", "server0").is_ok(), "staff still reach the servers");
    assert!(ws.send_pdu("printer0", "pc0").is_ok(), "the printer is only fenced off from the servers");
}

#[test]
fn acl_lesson_fails_before_the_list_and_passes_after() {
    use crate::model::parse_ipv4 as ip;
    let mut ws = Workspace::from_tnet(include_str!("../../../web/templates/les-l3-04-acl-fence.xml")).unwrap();
    assert_eq!(passes(&mut ws), vec![false, true, true]);
    let (none, all, wild) = (ip("0.0.0.0").unwrap(), ip("255.255.255.255").unwrap(), ip("0.0.0.255").unwrap());
    ws.acl_add("router0", 100, false, ip("192.168.30.0").unwrap(), wild, Some((ip("192.168.20.0").unwrap(), wild))).unwrap();
    ws.acl_add("router0", 100, true, none, all, Some((none, all))).unwrap();
    ws.acl_bind("router0", "GigabitEthernet0/0.30", 100, true).unwrap();
    assert_eq!(passes(&mut ws), vec![true, true, true]);
}

#[test]
fn port_security_lesson_needs_the_setting_and_keeps_the_known_pc_working() {
    let mut ws = Workspace::from_tnet(include_str!("../../../web/templates/les-l3-05-port-security.xml")).unwrap();
    assert_eq!(passes(&mut ws), vec![false, true]);
    ws.set_port_security("switch0", "FastEthernet0/2", 1).unwrap();
    assert_eq!(passes(&mut ws), vec![true, true]);
    ws.set_port_security("switch0", "FastEthernet0/2", 2).unwrap();
    assert_eq!(passes(&mut ws), vec![false, true]);
}

#[test]
fn dhcp_per_vlan_lesson_serves_each_vlan_from_its_own_pool() {
    let mut ws = Workspace::from_tnet(include_str!("../../../web/templates/les-l3-03-dhcp-per-vlan.xml")).unwrap();
    assert_eq!(passes(&mut ws), vec![false; 5]);
    assert!(ws.acquire_dhcp("pc0").is_err(), "VLAN 10 cannot hear the server without a relay");
    ws.add_dhcp_pool("server0", "192.168.20.0", 24, "192.168.20.1", "").unwrap();
    ws.add_dhcp_pool("server0", "192.168.10.0", 24, "192.168.10.1", "").unwrap();
    ws.set_dhcp_helper("router0", "GigabitEthernet0/0.10", "192.168.20.2").unwrap();
    for pc in ["pc0", "pc1", "pc2"] {
        ws.acquire_dhcp(pc).unwrap();
    }
    assert_eq!(passes(&mut ws), vec![true; 5]);
    let addr = |ws: &Workspace, id: &str| ws.devices.iter().find(|d| d.id == id).and_then(|d| d.ip).unwrap();
    assert!(crate::model::contains(addr(&ws, "pc0"), crate::model::parse_ipv4("192.168.10.0").unwrap(), 24));
    assert!(crate::model::contains(addr(&ws, "pc2"), crate::model::parse_ipv4("192.168.20.0").unwrap(), 24));
}

#[test]
fn extra_pools_survive_save_and_open_and_replace_a_same_network_pool() {
    let mut ws = Workspace::from_tnet(include_str!("../../../web/templates/les-l3-03-dhcp-per-vlan.xml")).unwrap();
    ws.add_dhcp_pool("server0", "192.168.20.0", 24, "192.168.20.1", "").unwrap();
    ws.add_dhcp_pool("server0", "192.168.10.0", 24, "192.168.10.1", "").unwrap();
    ws.add_dhcp_pool("server0", "192.168.10.0", 24, "192.168.10.254", "").unwrap();
    assert_eq!(ws.dhcp_pool_list("server0").len(), 2);
    let back = Workspace::from_tnet(&ws.to_tnet()).unwrap();
    assert_eq!(back.dhcp_pool_list("server0").len(), 2);
    assert!(ws.add_dhcp_pool("server0", "bad", 24, "", "").is_err());
}

#[test]
fn remote_owner_lesson_needs_matching_tunnel_ends() {
    let mut ws = Workspace::from_tnet(include_str!("../../../web/templates/les-l3-06-remote-owner.xml")).unwrap();
    assert_eq!(passes(&mut ws), vec![false, false]);
    let refusal = ws.send_pdu("laptop0", "server0").unwrap_err();
    assert!(refusal.contains("tunnel"), "{refusal}");
    ws.tunnel_config("router1", "203.0.113.2", "office-key-1").unwrap();
    assert_eq!(ws.tunnel_state("router1"), "down", "one end alone is down");
    ws.tunnel_config("router0", "203.0.113.1", "wrong-key").unwrap();
    assert_eq!(ws.tunnel_state("router1"), "down", "a wrong key never comes up");
    assert_eq!(passes(&mut ws), vec![false, false]);
    ws.tunnel_config("router0", "203.0.113.1", "office-key-1").unwrap();
    assert_eq!(ws.tunnel_state("router0"), "up");
    assert_eq!(passes(&mut ws), vec![true, true]);
    assert!(ws.send_pdu("server0", "laptop0").is_ok(), "the tunnel carries both directions");
    let mut back = Workspace::from_tnet(&ws.to_tnet()).unwrap();
    assert!(back.send_pdu("laptop0", "server0").is_ok(), "the tunnel survives save and open");
    assert!(back.tunnel_clear("router0"));
    assert!(back.send_pdu("laptop0", "server0").is_err());
}

#[test]
fn tunnel_input_is_validated_and_office_traffic_ignores_the_gate() {
    let mut ws = Workspace::from_tnet(include_str!("../../../web/templates/les-l3-06-remote-owner.xml")).unwrap();
    assert!(ws.tunnel_config("laptop0", "203.0.113.2", "office-key-1").is_err(), "not a router");
    assert!(ws.tunnel_config("router1", "not-an-address", "office-key-1").is_err());
    assert!(ws.tunnel_config("router1", "203.0.113.2", "abc").is_err(), "key too short");
    assert!(!ws.tunnel_clear("router1"));
    assert!(ws.send_pdu("pc0", "server0").is_ok(), "traffic that never crosses the cloud is untouched");
}
