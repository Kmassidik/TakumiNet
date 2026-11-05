use super::*;
use crate::workspace::Workspace;

fn two_switches() -> (Workspace, String, String) {
    let mut ws = Workspace::new();
    let a = ws.add("Switch 24", 600.0, 100.0).unwrap();
    let b = ws.add("Switch 24", 700.0, 100.0).unwrap();
    ws.link_ports(&a, &b, "eCopper", Some("FastEthernet0/20"), Some("FastEthernet0/20")).unwrap();
    (ws, a, b)
}
const P: &str = "FastEthernet0/20";

fn config(ws: &mut Workspace, id: &str, lines: &[&str]) {
    let mut s = Session::default();
    for line in ["enable", "configure terminal"].iter().chain(lines) {
        let out = run(ws, id, &mut s, line);
        assert!(!out.contains('%'), "{line}: {out}");
    }
}

#[test]
fn matching_auto_ports_run_full_duplex_at_the_slower_speed() {
    let (ws, sw0, _sw1) = two_switches();
    let n = ws.negotiated(&sw0, P).unwrap();
    assert_eq!((n.speed, n.full, n.peer_full), (100, true, true));
}

#[test]
fn a_fixed_speed_that_the_far_end_cannot_reach_drops_the_link() {
    let (mut ws, sw0, sw1) = two_switches();
    config(&mut ws, &sw0, &["interface FastEthernet0/20", "speed 10"]);
    assert!(ws.negotiated(&sw0, P).is_some(), "auto side senses 10");
    config(&mut ws, &sw1, &["interface FastEthernet0/20", "speed 100"]);
    assert!(ws.negotiated(&sw0, P).is_none());
    assert!(!ws.port_state(&sw0, P).line_up);
    let mut s = Session::default();
    run(&mut ws, &sw0, &mut s, "enable");
    let out = run(&mut ws, &sw0, &mut s, "show interfaces FastEthernet0/20");
    assert!(out.contains("Speed mismatch"), "{out}");
}

#[test]
fn one_fixed_end_and_one_auto_end_is_the_classic_duplex_mismatch() {
    let (mut ws, sw0, sw1) = two_switches();
    config(&mut ws, &sw0, &["interface FastEthernet0/20", "speed 100", "duplex full"]);
    let n = ws.negotiated(&sw0, P).unwrap();
    assert!(n.full && !n.peer_full && n.duplex_mismatch());
    let mut s = Session::default();
    run(&mut ws, &sw0, &mut s, "enable");
    let out = run(&mut ws, &sw0, &mut s, "show interfaces FastEthernet0/20");
    assert!(out.contains("Full-duplex, 100Mb/s") && out.contains("Duplex mismatch"), "{out}");
    config(&mut ws, &sw0, &["interface FastEthernet0/20", "no speed", "no duplex"]);
    assert!(ws.negotiated(&sw0, P).is_some_and(|n| !n.duplex_mismatch()));
}

#[test]
fn bad_values_are_refused_and_settings_survive_a_save() {
    let (mut ws, sw0, sw1) = two_switches();
    let mut s = Session::default();
    for line in ["enable", "configure terminal", "interface FastEthernet0/20"] {
        run(&mut ws, &sw0, &mut s, line);
    }
    assert!(run(&mut ws, &sw0, &mut s, "speed 1000").starts_with('%'), "a Fast port cannot do gigabit");
    assert!(run(&mut ws, &sw0, &mut s, "speed 7").starts_with('%'));
    assert!(run(&mut ws, &sw0, &mut s, "duplex sideways").starts_with('%'));
    config(&mut ws, &sw0, &["interface FastEthernet0/20", "speed 100", "duplex half"]);
    let back = Workspace::from_tnet(&ws.to_tnet()).unwrap();
    let setting = back.link_setting(&sw0, P);
    assert_eq!((setting.speed, setting.full), (Some(100), Some(false)));
}
