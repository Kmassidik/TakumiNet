use super::super::*;

fn hub_lab() -> (Workspace, String, String, String, String) {
    let mut ws = Workspace::empty();
    let hub = ws.add("Hub", 300.0, 100.0).unwrap();
    let a = ws.add("PC", 100.0, 300.0).unwrap();
    let b = ws.add("PC", 300.0, 300.0).unwrap();
    let c = ws.add("PC", 500.0, 300.0).unwrap();
    for (port, id) in [("FastEthernet0", &a), ("FastEthernet1", &b), ("FastEthernet2", &c)] {
        ws.link_ports(&hub, id, "eCopper", Some(port), None).unwrap();
    }
    ws.set_ip(&a, "10.95.0.10", 24).unwrap();
    ws.set_ip(&b, "10.95.0.11", 24).unwrap();
    ws.set_ip(&c, "10.95.0.12", 24).unwrap();
    (ws, hub, a, b, c)
}

#[test]
fn two_queued_frames_through_a_hub_collide_on_one_step() {
    let (mut ws, hub, a, b, c) = hub_lab();
    ws.queue_pdu(&a, &c).unwrap();
    ws.queue_pdu(&b, &c).unwrap();
    assert_eq!(ws.pending_pdus(), 2);
    let results = ws.flush_pending();
    assert!(results.iter().all(|r| r.is_err()), "{results:?}");
    assert_eq!(ws.hub_collisions(&hub), 1);
    assert_eq!(ws.pending_pdus(), 0);
}

#[test]
fn queued_frames_through_a_switch_do_not_collide() {
    let (mut ws, _hub, a, b, c) = hub_lab();
    ws.replace("hub0", "Switch 24").unwrap();
    ws.queue_pdu(&a, &c).unwrap();
    ws.queue_pdu(&b, &c).unwrap();
    let results = ws.flush_pending();
    assert!(results.iter().all(|r| r.is_ok()), "{results:?}");
    assert_eq!(ws.hub_collisions("switch0"), 0);
}

#[test]
fn a_bad_queue_entry_is_refused() {
    let (mut ws, _hub, _a, _b, _c) = hub_lab();
    assert!(ws.queue_pdu("nobody", "pc0").is_err());
    assert!(ws.queue_pdu("pc0", "pc0").is_err());
    assert_eq!(ws.pending_pdus(), 0);
}

#[test]
fn queued_sends_survive_a_save_and_open_round_trip() {
    let (mut ws, _hub, a, b, c) = hub_lab();
    ws.queue_pdu(&a, &c).unwrap();
    ws.queue_pdu(&b, &c).unwrap();
    let back = Workspace::from_tnet(&ws.to_tnet()).unwrap();
    assert_eq!(back.pending_pdus(), 2);
    assert!(back.json().contains("\"pendingPdus\":2"));
}

#[test]
fn a_saved_queue_naming_a_missing_device_is_rejected() {
    let saved = "<?xml version=\"1.0\"?><takumi version=\"1\"><device id=\"pc0\" kind=\"pc\" model=\"PC\" x=\"1\" y=\"1\" name=\"PC0\" ip=\"10.1.0.1\" prefix=\"24\"/><pending source=\"pc0\" target=\"missing\"/></takumi>";
    assert!(Workspace::from_tnet(saved).is_err());
}
