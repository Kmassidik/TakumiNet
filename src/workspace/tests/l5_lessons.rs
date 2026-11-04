use super::super::*;
use crate::model::parse_ipv4 as ip;

fn passes(ws: &mut Workspace) -> Vec<bool> {
    ws.run_checks().into_iter().map(|r| r.passed).collect()
}

#[test]
fn the_leaf_spine_template_crosses_racks_both_ways() {
    let mut ws = Workspace::from_tnet(include_str!("../../../web/templates/tpl-l5-leaf-spine.xml")).unwrap();
    assert!(ws.send_pdu("server0", "server2").is_ok());
    assert!(ws.send_pdu("server3", "server1").is_ok());
}

#[test]
fn the_leaf_spine_lesson_needs_ospf_on_all_four_switches() {
    let mut ws = Workspace::from_tnet(include_str!("../../../web/templates/les-l5-01-leaf-spine.xml")).unwrap();
    assert_eq!(passes(&mut ws), vec![false, false]);
    let nets = [
        ("l1", vec![("10.100.1.0", 24), ("10.200.11.0", 30), ("10.200.12.0", 30)]),
        ("l2", vec![("10.100.2.0", 24), ("10.200.21.0", 30), ("10.200.22.0", 30)]),
        ("s1", vec![("10.200.11.0", 30), ("10.200.21.0", 30)]),
        ("s2", vec![("10.200.12.0", 30), ("10.200.22.0", 30)]),
    ];
    for (dev, list) in nets {
        ws.set_routing_protocol(dev, "ospf", 1).unwrap();
        for (net, prefix) in list {
            ws.add_routing_network(dev, ip(net).unwrap(), prefix, 0).unwrap();
        }
    }
    assert_eq!(passes(&mut ws), vec![true, true]);
}

#[test]
fn losing_either_spine_keeps_the_fabric_alive() {
    let mut ws = Workspace::from_tnet(include_str!("../../../web/templates/les-l5-02-lose-a-spine.xml")).unwrap();
    assert_eq!(passes(&mut ws), vec![true, true]);
    ws.set_port_up("s1", "GigabitEthernet0/1", false);
    ws.set_port_up("s2", "GigabitEthernet0/1", false);
    assert!(ws.send_pdu("server0", "server2").is_err(), "losing both uplinks of a leaf cuts the rack off");
}
