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

#[test]
fn the_fixed_port_rule_holds_for_every_catalog_model_pair() {
    use crate::workspace::palette::CATALOG;
    let mut kinds: Vec<&str> = Vec::new();
    for (_, _, kind) in CATALOG {
        if !kinds.contains(kind) {
            kinds.push(kind);
        }
    }
    let mut cases = 0;
    for a in &kinds {
        for b in &kinds {
            for cable in ["eCopper", "eCross"] {
                let both_fixed = *a == "hub" && *b == "hub";
                let expected = !both_fixed || cable == "eCross";
                let got = crate::workspace::mdi::pairing_problem(a, b, cable).is_none();
                assert_eq!(got, expected, "{a}/{b} {cable}");
                cases += 1;
            }
        }
    }
    assert_eq!(cases, kinds.len() * kinds.len() * 2);
}
