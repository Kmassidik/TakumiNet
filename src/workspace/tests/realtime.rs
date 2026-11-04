use super::super::*;
use crate::model::{ipv4_string, parse_ipv4};

fn ospf_pair() -> (Workspace, String, String) {
    let mut ws = Workspace::empty();
    let r1 = ws.add("2911", 100.0, 100.0).unwrap();
    let r2 = ws.add("2911", 400.0, 100.0).unwrap();
    ws.link_kind(&r1, &r2, "eCopper").unwrap();
    ws.set_port_ip(&r1, "GigabitEthernet0/0", "10.0.0.1", 30).unwrap();
    ws.set_port_ip(&r2, "GigabitEthernet0/0", "10.0.0.2", 30).unwrap();
    assert!(ws.set_port_up(&r1, "GigabitEthernet0/0", true));
    assert!(ws.set_port_up(&r2, "GigabitEthernet0/0", true));
    (ws, r1, r2)
}

fn enable_ospf(ws: &mut Workspace, router: &str) {
    ws.set_routing_protocol(router, "ospf", 1).unwrap();
    ws.add_routing_network(router, parse_ipv4("10.0.0.0").unwrap(), 30, 0).unwrap();
}

#[test]
fn advance_moves_the_clock() {
    let mut ws = Workspace::empty();
    let before = ws.sim_time;
    ws.advance(2.0);
    assert!((ws.sim_time - before - 2.0).abs() < 1e-6);
    ws.advance(f32::NAN);
    ws.advance(-5.0);
    assert!((ws.sim_time - before - 2.0).abs() < 1e-6, "NaN and negatives are ignored");
}

#[test]
fn advance_ages_arp_then_mac() {
    let mut ws = Workspace::new();
    ws.send_pdu("pc0", "pc1").unwrap();
    let neighbor = parse_ipv4("192.168.1.11").unwrap();
    assert!(
        ws.tables.arps("pc0").lookup(neighbor, ws.sim_time as f64).is_some(),
        "pc0 resolved pc1 ({}) during the ping",
        ipv4_string(neighbor)
    );
    assert!(!ws.tables.mac_rows("switch0").is_empty(), "switch0 learned MACs");

    ws.advance(125.0);
    assert!(ws.tables.arp_rows("pc0").is_empty(), "ARP expires after 120 s");
    assert!(!ws.tables.mac_rows("switch0").is_empty(), "MAC aging is 300 s");

    ws.advance(200.0);
    assert!(ws.tables.mac_rows("switch0").is_empty(), "MAC ages out after 300 s");
}

#[test]
fn ospf_hellos_only_when_ospf_is_configured() {
    let (mut ws, r1, r2) = ospf_pair();
    assert_eq!(ws.advance(2.0), 0, "no protocol, no chatter");
    assert!(ws.events.is_empty());

    enable_ospf(&mut ws, &r1);
    assert_eq!(ws.advance(2.0), 0, "a lone speaker has no adjacency");

    enable_ospf(&mut ws, &r2);
    assert_eq!(ws.advance(2.0), 2, "one hello per adjacency, both directions");
    let hellos: Vec<_> = ws.events.iter().filter(|e| e.proto == "OSPF").collect();
    assert_eq!(hellos.len(), 2);
    assert!(hellos[0].note.starts_with("hello to "), "{}", hellos[0].note);
    assert_eq!(hellos[0].layers.len(), 1);
    assert_eq!(hellos[0].status, "Successful");
}

#[test]
fn stp_announcements_need_two_switches() {
    let mut ws = Workspace::empty();
    let s1 = ws.add("2960", 100.0, 100.0).unwrap();
    ws.advance(2.0);
    assert!(ws.events.is_empty(), "a lone switch runs no spanning tree");

    let s2 = ws.add("2960", 300.0, 100.0).unwrap();
    ws.link_kind(&s1, &s2, "eCross").unwrap();
    let emitted = ws.advance(2.0);
    assert_eq!(emitted, 2, "one announcement per participating switch");
    let bpdus: Vec<_> = ws.events.iter().filter(|e| e.proto == "STP").collect();
    assert_eq!(bpdus.len(), 2);
    for event in &bpdus {
        assert!(event.note.contains("announces the root"), "{}", event.note);
        assert_eq!(event.layers.len(), 1);
    }
}

#[test]
fn event_cap_holds_and_ids_survive() {
    let mut ws = Workspace::empty();
    let s1 = ws.add("2960", 100.0, 100.0).unwrap();
    let s2 = ws.add("2960", 300.0, 100.0).unwrap();
    ws.link_kind(&s1, &s2, "eCross").unwrap();
    for _ in 0..600 {
        ws.advance(2.0);
    }
    assert_eq!(ws.events.len(), 1000, "the capture is capped");
    assert_eq!(ws.events.last().unwrap().id, 1200, "ids keep counting");
    assert_eq!(ws.events.first().unwrap().id, 201, "the oldest events fell off");
    assert!(
        ws.events.windows(2).all(|w| w[1].id == w[0].id + 1),
        "ids stay in order and are never reused"
    );
}
