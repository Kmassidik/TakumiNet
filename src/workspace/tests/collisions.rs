use super::super::*;

fn two_hosts(kind: &str) -> (Workspace, String, String, String) {
    let mut ws = Workspace::new();
    let model = if kind == "hub" { "Hub" } else { "Switch 24" };
    let shared = ws.add(model, 400.0, 200.0).unwrap();
    let a = ws.add("PC", 200.0, 400.0).unwrap();
    let b = ws.add("PC", 600.0, 400.0).unwrap();
    let ports = if kind == "hub" {
        ("FastEthernet0", "FastEthernet1")
    } else {
        ("FastEthernet0/1", "FastEthernet0/2")
    };
    ws.link_ports(&shared, &a, "eCopper", Some(ports.0), None).unwrap();
    ws.link_ports(&shared, &b, "eCopper", Some(ports.1), None).unwrap();
    (ws, shared, a, b)
}

#[test]
fn two_frames_through_one_hub_in_a_tick_collide() {
    let (mut ws, hub, a, b) = two_hosts("hub");
    let results = ws.send_concurrent(&[(&a, &b), (&b, &a)]);
    assert!(results.iter().all(|r| r.is_err()), "{results:?}");
    assert_eq!(ws.hub_collisions(&hub), 1);
    assert!(results[0].as_ref().unwrap_err().contains("collision on"));
}

#[test]
fn the_same_pair_through_a_switch_never_collides() {
    let (mut ws, switch, a, b) = two_hosts("switch");
    let results = ws.send_concurrent(&[(&a, &b), (&b, &a)]);
    assert!(results.iter().all(|r| r.is_ok()), "{results:?}");
    assert_eq!(ws.hub_collisions(&switch), 0);
}

#[test]
fn a_single_frame_through_a_hub_does_not_collide() {
    let (mut ws, hub, a, b) = two_hosts("hub");
    let results = ws.send_concurrent(&[(&a, &b)]);
    assert!(results[0].is_ok());
    assert_eq!(ws.hub_collisions(&hub), 0);
}

#[test]
fn collision_counters_survive_a_save_and_open_round_trip() {
    let (mut ws, hub, a, b) = two_hosts("hub");
    let _ = ws.send_concurrent(&[(&a, &b), (&b, &a)]);
    let back = Workspace::from_tnet(&ws.to_tnet()).unwrap();
    assert_eq!(back.hub_collisions(&hub), 1);
}

#[test]
fn play_collides_two_pings_through_a_hub_without_a_special_api() {
    let mut ws = Workspace::from_tnet(include_str!("../../../web/templates/tpl-shared-segment.xml")).unwrap();
    ws.run_demo().unwrap();
    assert!(ws.hub_collisions("hub0") > 0, "the hub counter must rise in normal play");
}

#[test]
fn play_on_a_switch_keeps_the_hub_counter_at_zero() {
    let (mut ws, switch, a, b) = two_hosts("switch");
    let c = ws.add("PC", 800.0, 400.0).unwrap();
    ws.link_ports(&switch, &c, "eCopper", Some("FastEthernet0/3"), None).unwrap();
    for id in [&a, &b, &c] {
        ws.set_ip(id, "10.30.0.10", 24).unwrap();
    }
    ws.demo = vec![
        Demo { kind: "ping".into(), from: a.clone(), to: b.clone(), url: String::new() },
        Demo { kind: "ping".into(), from: c, to: b, url: String::new() },
    ];
    ws.run_demo().unwrap();
    assert_eq!(ws.hub_collisions(&switch), 0);
}
