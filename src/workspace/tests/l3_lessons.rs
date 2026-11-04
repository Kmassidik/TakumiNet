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
