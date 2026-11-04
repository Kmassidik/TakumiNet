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

#[test]
fn the_balancer_rotates_skips_the_dead_and_reports_an_empty_pool() {
    let mut ws = Workspace::from_tnet(include_str!("../../../web/templates/les-l5-03-load-balancer.xml")).unwrap();
    assert_eq!(passes(&mut ws), vec![false, false, false]);
    let refusal = crate::webapp::fetch(&mut ws, "pc0", "http://203.0.113.80/").unwrap_err();
    assert!(refusal.contains("pool is empty"), "{refusal}");
    for member in ["server0", "server1", "server2"] {
        ws.lb_add_member("lb0", member).unwrap();
    }
    for _ in 0..3 {
        let page = crate::webapp::fetch(&mut ws, "pc0", "http://203.0.113.80/").unwrap();
        assert_eq!(page.title, "WebFront");
    }
    assert!(ws.lb_rows("lb0").iter().all(|(_, hits)| *hits == 1), "round robin shares the three requests");
    assert_eq!(passes(&mut ws), vec![true, true, true]);
    let before = ws.lb_rows("lb0");
    ws.set_port_up("server0", "FastEthernet0", false);
    for _ in 0..2 {
        crate::webapp::fetch(&mut ws, "pc0", "http://203.0.113.80/").unwrap();
    }
    let after = ws.lb_rows("lb0");
    assert_eq!(after[0], before[0], "the dead server took no new request");
    assert_eq!(after[1].1 + after[2].1, before[1].1 + before[2].1 + 2, "the living pair shared the work");
    assert!(ws.lb_add_member("lb0", "server0").is_err(), "no duplicates");
    assert!(ws.lb_add_member("lb0", "pc0").is_err(), "members are servers");
    assert!(ws.lb_add_member("pc0", "server0").is_err(), "pools live on balancers");
    let back = Workspace::from_tnet(&ws.to_tnet()).unwrap();
    assert_eq!(back.lb_rows("lb0").len(), 3, "the pool survives save and open");
    for member in ["server0", "server1", "server2"] {
        ws.lb_remove_member("lb0", member);
    }
    assert!(crate::webapp::fetch(&mut ws, "pc0", "http://203.0.113.80/").is_err());
}
