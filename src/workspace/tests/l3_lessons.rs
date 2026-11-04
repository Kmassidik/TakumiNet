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
