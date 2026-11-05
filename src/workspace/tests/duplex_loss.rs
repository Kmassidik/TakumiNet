use crate::workspace::Workspace;
use crate::cli::show_interfaces;

fn mismatch_lab() -> (Workspace, String, String) {
    let mut ws = Workspace::new();
    let pc1 = ws.add("PC", 300.0, 100.0).unwrap();
    let pc2 = ws.add("PC", 500.0, 100.0).unwrap();
    ws.link_ports(&pc1, &pc2, "eCopper", None, None).unwrap();
    // PC1: fixed 100/full; PC2: auto (falls back to half = mismatch).
    ws.set_link_speed(&pc1, "FastEthernet0", Some(100)).unwrap();
    ws.set_link_duplex(&pc1, "FastEthernet0", Some(true)).unwrap();
    ws.set_ip(&pc1, "10.0.0.1", 24).unwrap();
    ws.set_ip(&pc2, "10.0.0.2", 24).unwrap();
    (ws, pc1, pc2)
}

fn matched_lab() -> (Workspace, String, String) {
    let mut ws = Workspace::new();
    let pc1 = ws.add("PC", 300.0, 100.0).unwrap();
    let pc2 = ws.add("PC", 500.0, 100.0).unwrap();
    ws.link_ports(&pc1, &pc2, "eCopper", None, None).unwrap();
    for pc in [&pc1, &pc2] {
        ws.set_link_speed(pc, "FastEthernet0", Some(100)).unwrap();
        ws.set_link_duplex(pc, "FastEthernet0", Some(true)).unwrap();
    }
    ws.set_ip(&pc1, "10.0.0.1", 24).unwrap();
    ws.set_ip(&pc2, "10.0.0.2", 24).unwrap();
    (ws, pc1, pc2)
}

#[test]
fn mismatched_link_has_duplex_mismatch() {
    let (ws, pc1, pc2) = mismatch_lab();
    let n = ws.negotiated(&pc1, "FastEthernet0").unwrap();
    assert!(n.duplex_mismatch(), "fixed-full + auto should mismatch");
    let n2 = ws.negotiated(&pc2, "FastEthernet0").unwrap();
    assert!(n2.duplex_mismatch(), "auto + fixed-full should mismatch");
}

#[test]
fn matched_link_has_no_mismatch() {
    let (ws, pc1, pc2) = matched_lab();
    assert!(!ws.negotiated(&pc1, "FastEthernet0").unwrap().duplex_mismatch());
    assert!(!ws.negotiated(&pc2, "FastEthernet0").unwrap().duplex_mismatch());
}

#[test]
fn mismatched_link_drops_1_in_4_frames() {
    let (mut ws, pc1, pc2) = mismatch_lab();
    for n in 1..=3 {
        let result = crate::net::fwd::deliver(&mut ws, &pc1, &pc2);
        assert!(result.is_ok(), "ping {n} should succeed: {:?}", result.err());
    }
    let dropped = crate::net::fwd::deliver(&mut ws, &pc1, &pc2);
    let err = dropped.unwrap_err();
    assert!(err.reason.contains("late collisions"), "{}", err.reason);
    assert!(err.reason.contains("duplex mismatch on"), "{}", err.reason);
}

#[test]
fn matched_link_loses_no_frames() {
    let (mut ws, pc1, pc2) = matched_lab();
    for n in 1..=10 {
        let result = crate::net::fwd::deliver(&mut ws, &pc1, &pc2);
        assert!(result.is_ok(), "ping {n} should succeed: {:?}", result.err());
    }
    assert_eq!(ws.crc_errors_for(&pc2, "FastEthernet0"), 0);
}

#[test]
fn show_interfaces_prints_input_errors() {
    let (mut ws, pc1, pc2) = mismatch_lab();
    for _ in 0..4 {
        let _ = crate::net::fwd::deliver(&mut ws, &pc1, &pc2);
    }
    let out = show_interfaces(&ws, &pc2, "FastEthernet0");
    assert!(out.contains("1 input errors"), "should show 1 input error: {out}");
}

#[test]
fn reset_clears_counters() {
    let (mut ws, pc1, pc2) = mismatch_lab();
    for _ in 0..4 {
        let _ = crate::net::fwd::deliver(&mut ws, &pc1, &pc2);
    }
    assert_eq!(ws.crc_errors_for(&pc2, "FastEthernet0"), 1);
    ws.reset_counters();
    assert_eq!(ws.crc_errors_for(&pc2, "FastEthernet0"), 0);
}
