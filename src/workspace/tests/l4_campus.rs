use super::super::*;
use crate::model::parse_ipv4 as ip;

fn passes(ws: &mut Workspace) -> Vec<bool> {
    ws.run_checks().into_iter().map(|r| r.passed).collect()
}

#[test]
fn campus_wifi_lesson_joins_aps_and_fences_the_guest() {
    let mut ws = Workspace::from_tnet(include_str!("../../../web/templates/les-l4-05-campus-wifi.xml")).unwrap();
    assert_eq!(passes(&mut ws), vec![false, false, false]);
    for ap in ["ap0", "ap1", "ap2"] {
        ws.capwap_join(ap, "wlc0").unwrap();
    }
    ws.wlan_add("wlc0", "CampusGuest", "").unwrap();
    ws.wlan_set_guest("wlc0", "CampusGuest", true).unwrap();
    ws.wifi_join("phone0", "CampusGuest", "").unwrap();
    assert_eq!(passes(&mut ws), vec![true, true, true]);
    assert!(ws.send_pdu("laptop0", "server0").is_ok(), "staff still reach the file server");
}

#[test]
fn dmz_lesson_blocks_the_shelf_from_the_inside_but_not_the_public_page() {
    let mut ws = Workspace::from_tnet(include_str!("../../../web/templates/les-l4-06-dmz.xml")).unwrap();
    assert_eq!(passes(&mut ws), vec![true, false, true], "open firewall: everything passes, so the fence check fails");
    let wild = ip("0.0.0.255").unwrap();
    let (none, all) = (ip("0.0.0.0").unwrap(), ip("255.255.255.255").unwrap());
    ws.acl_add("asa0", 120, false, ip("203.0.113.0").unwrap(), wild, Some((ip("172.16.10.0").unwrap(), wild))).unwrap();
    ws.acl_add("asa0", 120, true, none, all, Some((none, all))).unwrap();
    ws.acl_bind("asa0", "GigabitEthernet1/2", 120, true).unwrap();
    assert_eq!(passes(&mut ws), vec![true, true, true]);
    let refusal = ws.send_pdu("server0", "server1").unwrap_err();
    assert!(refusal.contains("ACL denied"), "{refusal}");
}

#[test]
fn the_dmz_template_ships_with_the_fence_already_up() {
    let mut ws = Workspace::from_tnet(include_str!("../../../web/templates/tpl-l4-campus-dmz.xml")).unwrap();
    assert!(ws.send_pdu("server0", "server1").is_err());
    assert!(crate::webapp::fetch(&mut ws, "pc1", "http://203.0.113.10/").is_ok());
}

#[test]
fn the_three_layer_template_routes_floor_to_server() {
    let mut ws = Workspace::from_tnet(include_str!("../../../web/templates/tpl-l4-campus-three-layer.xml")).unwrap();
    assert!(ws.send_pdu("pc0", "server0").is_ok());
    assert!(ws.send_pdu("pc0", "pc2").is_ok());
    assert!(ws.send_pdu("pc0", "pc1").is_ok(), "two VLANs on one floor route through DistA");
}

#[test]
fn the_three_layer_lesson_needs_gateways_and_ospf() {
    let mut ws = Workspace::from_tnet(include_str!("../../../web/templates/les-l4-01-three-layers.xml")).unwrap();
    assert_eq!(passes(&mut ws), vec![false; 4]);
    for (dev, sub, addr) in [
        ("d1", "GigabitEthernet0/2.10", "172.17.10.1"),
        ("d1", "GigabitEthernet0/2.20", "172.17.20.1"),
        ("d2", "GigabitEthernet0/2.10", "172.18.10.1"),
    ] {
        let name = ws.ensure_subinterface(dev, sub).unwrap();
        ws.set_port_ip(dev, &name, addr, 24).unwrap();
    }
    let nets = [
        ("core0", vec![("10.0.12.0", 30), ("10.0.13.0", 30), ("172.16.0.0", 24)]),
        ("d1", vec![("10.0.12.0", 30), ("172.17.10.0", 24), ("172.17.20.0", 24)]),
        ("d2", vec![("10.0.13.0", 30), ("172.18.10.0", 24)]),
    ];
    for (dev, list) in nets {
        ws.set_routing_protocol(dev, "ospf", 1).unwrap();
        for (net, prefix) in list {
            ws.add_routing_network(dev, ip(net).unwrap(), prefix, 0).unwrap();
        }
    }
    assert_eq!(passes(&mut ws), vec![true; 4]);
}
