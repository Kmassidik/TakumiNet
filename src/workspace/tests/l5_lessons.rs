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

#[test]
fn the_overlay_lesson_separates_tenants_and_survives_a_move() {
    let mut ws = Workspace::from_tnet(include_str!("../../../web/templates/les-l5-04-overlay-network.xml")).unwrap();
    assert_eq!(passes(&mut ws), vec![false, true, false], "one flat fabric: everyone sees everyone");
    for (server, vni) in [("server0", 100), ("server2", 100), ("server1", 200), ("server3", 200)] {
        ws.vnet_join(server, vni).unwrap();
    }
    assert_eq!(passes(&mut ws), vec![true, true, true]);
    assert!(ws.send_pdu("server1", "server3").is_ok(), "green reaches green");
    let moved = Workspace::from_tnet(&ws.to_tnet()).unwrap();
    assert_eq!(moved.vnets.len(), 4, "memberships survive save and open");
    ws.vnet_join("server0", 0).unwrap();
    assert!(ws.send_pdu("server0", "server3").is_ok(), "leaving the overlay lifts the fence");
    assert!(ws.vnet_join("pc9", 100).is_err());
    assert!(ws.vnet_join("server0", 16_777_216).is_err());
    assert!(ws.vnet_join("l1", 100).is_err(), "only servers join tenant networks");
}

#[test]
fn the_hot_link_lesson_cools_down_when_flows_spread() {
    let mut ws = Workspace::from_tnet(include_str!("../../../web/templates/les-l5-05-find-the-hot-link.xml")).unwrap();
    let hottest = ws.link_loads().remove(0);
    assert!(hottest.percent > 100.0, "both flows pile onto one spine: {}", hottest.percent);
    assert_eq!(passes(&mut ws), vec![false]);
    ws.set_flow_spread(true);
    let hottest = ws.link_loads().remove(0);
    assert!(hottest.percent <= 70.0, "spread flows stay cool: {}", hottest.percent);
    assert_eq!(passes(&mut ws), vec![true]);
    let back = Workspace::from_tnet(&ws.to_tnet()).unwrap();
    assert_eq!(back.flow_rows().len(), 2, "flows survive save and open");
    assert!(back.flow_spread);
}

#[test]
fn flow_input_is_validated_and_zero_removes() {
    let mut ws = Workspace::from_tnet(include_str!("../../../web/templates/tpl-l5-leaf-spine.xml")).unwrap();
    assert!(ws.flow_set("server0", "server0", 10).is_err());
    assert!(ws.flow_set("server0", "ghost", 10).is_err());
    assert!(ws.flow_set("server0", "server2", 100_001).is_err());
    ws.flow_set("server0", "server2", 10).unwrap();
    ws.flow_set("server0", "server2", 0).unwrap();
    assert!(ws.flow_rows().is_empty());
    assert_eq!(ws.hottest_link_percent(), 0.0);
}
