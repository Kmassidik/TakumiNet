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

#[test]
fn root_and_bundles_lesson_moves_the_root_and_bundles_the_cores() {
    let mut ws = Workspace::from_tnet(include_str!("../../../web/templates/les-l4-02-root-and-bundles.xml")).unwrap();
    assert_eq!(ws.stp_root_of("c1").as_deref(), Some("a2"), "the mishap: a floor switch is the root");
    assert_eq!(passes(&mut ws), vec![false, false, true]);
    ws.set_stp_priority("c1", 1, 0).unwrap();
    assert_eq!(ws.stp_root_of("a1").as_deref(), Some("c1"));
    for (dev, port) in [("c1", "Fa0/23"), ("c1", "Fa0/24"), ("c2", "Fa0/23"), ("c2", "Fa0/24")] {
        ws.set_channel_group(dev, port, 1).unwrap();
    }
    assert_eq!(passes(&mut ws), vec![true, true, true]);
}

#[test]
fn spare_gateway_lesson_fails_over_to_the_second_switch() {
    let mut ws = Workspace::from_tnet(include_str!("../../../web/templates/les-l4-04-spare-gateway.xml")).unwrap();
    let refusal = ws.send_pdu("pc0", "server0").unwrap_err();
    assert!(refusal.contains("not a configured router interface"), "{refusal}");
    assert_eq!(passes(&mut ws), vec![false, false]);
    ws.set_shared_gateway("d1", "172.20.0.1", 110).unwrap();
    ws.set_shared_gateway("d2", "172.20.0.1", 100).unwrap();
    assert_eq!(ws.shared_gateway_owner(ip("172.20.0.1").unwrap()).as_deref(), Some("d1"));
    assert_eq!(passes(&mut ws), vec![true, true]);
    ws.set_port_up("d1", "GigabitEthernet0/2", false);
    assert_eq!(ws.shared_gateway_owner(ip("172.20.0.1").unwrap()).as_deref(), Some("d2"), "failover");
    assert!(ws.send_pdu("pc0", "server0").is_ok());
    let back = Workspace::from_tnet(&ws.to_tnet()).unwrap();
    assert_eq!(back.shared_gateway_rows("d1").len(), 1, "membership survives save and open");
}

#[test]
fn shared_gateway_input_is_validated() {
    let mut ws = Workspace::from_tnet(include_str!("../../../web/templates/les-l4-04-spare-gateway.xml")).unwrap();
    assert!(ws.set_shared_gateway("pc0", "172.20.0.1", 10).is_err(), "not a router");
    assert!(ws.set_shared_gateway("d1", "nonsense", 10).is_err());
    assert!(ws.set_shared_gateway("d1", "9.9.9.9", 10).is_err(), "outside every network");
    assert!(ws.set_shared_gateway("d1", "172.20.0.2", 10).is_err(), "a port's own address");
    assert!(!ws.remove_shared_gateway("d1", "172.20.0.1"));
    ws.set_shared_gateway("d1", "172.20.0.1", 10).unwrap();
    assert!(ws.remove_shared_gateway("d1", "172.20.0.1"));
}
