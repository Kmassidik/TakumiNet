use super::super::*;

fn pair(kinds: (&str, &str)) -> (Workspace, String, String) {
    let mut ws = Workspace::empty();
    let a = ws.add(kinds.0, 100.0, 100.0).unwrap();
    let b = ws.add(kinds.1, 400.0, 100.0).unwrap();
    (ws, a, b)
}

#[test]
fn two_modern_pcs_accept_straight_and_crossover() {
    for cable in ["eCopper", "eCross"] {
        let (mut ws, a, b) = pair(("PC", "PC"));
        assert!(ws.link_kind(&a, &b, cable).is_ok(), "{cable} should auto-pair");
    }
}

#[test]
fn a_pc_and_a_switch_accept_either_cable() {
    for cable in ["eCopper", "eCross"] {
        let (mut ws, a, b) = pair(("PC", "Switch 24"));
        assert!(ws.link_kind(&a, &b, cable).is_ok(), "{cable} should auto-pair");
    }
}

#[test]
fn two_fixed_hubs_need_a_crossover() {
    let (mut ws, a, b) = pair(("Hub", "Hub"));
    let err = ws.link_kind(&a, &b, "eCopper").unwrap_err();
    assert!(err.contains("crossover"), "{err}");
    assert!(ws.link_kind(&a, &b, "eCross").is_ok());
}

#[test]
fn one_auto_port_lifts_the_fixed_hub_rule() {
    for cable in ["eCopper", "eCross"] {
        let (mut ws, a, b) = pair(("Hub", "PC"));
        assert!(ws.link_kind(&a, &b, cable).is_ok(), "{cable} should auto-pair");
    }
}

#[test]
fn the_pairing_table_is_symmetric() {
    for (a, b) in [("Hub", "Hub"), ("PC", "PC"), ("Hub", "PC"), ("Switch 24", "Router 300")] {
        for cable in ["eCopper", "eCross"] {
            let (mut ws, x, y) = pair((a, b));
            let forward = ws.link_kind(&x, &y, cable);
            let (mut ws2, x2, y2) = pair((b, a));
            let backward = ws2.link_kind(&x2, &y2, cable);
            assert_eq!(forward.is_ok(), backward.is_ok(), "{a}/{b} {cable}");
        }
    }
}
