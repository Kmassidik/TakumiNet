use super::super::*;
use crate::cli::{run as cli_run, Session};

fn rogue() -> (Workspace, String) {
    let mut ws = Workspace::new();
    let sw = ws.add("Switch 24", 300.0, 100.0).unwrap();
    let rogue = ws.add("Switch 24", 600.0, 100.0).unwrap();
    ws.link_ports(&sw, &rogue, "eCopper", Some("FastEthernet0/5"), Some("FastEthernet0/1")).unwrap();
    (ws, sw)
}

#[test]
fn portfast_and_guard_flags_round_trip() {
    let (mut ws, sw) = rogue();
    let back = Workspace::from_tnet(&{
        ws.set_portfast(&sw, "FastEthernet0/5", true);
        ws.set_bpduguard(&sw, "FastEthernet0/5", true);
        ws.set_storm_level(&sw, "FastEthernet0/5", 40);
        ws.to_tnet()
    })
    .unwrap();
    assert!(back.portfast(&sw, "FastEthernet0/5"));
    assert!(back.bpduguard(&sw, "FastEthernet0/5"));
    assert_eq!(back.storm_level(&sw, "FastEthernet0/5"), Some(40));
}

#[test]
fn a_rogue_switch_errs_the_guarded_port_down_and_recovery_restores_it() {
    let (mut ws, sw) = rogue();
    ws.set_bpduguard(&sw, "FastEthernet0/5", true);
    ws.set_port_up(&sw, "FastEthernet0/5", false);
    ws.set_port_up(&sw, "FastEthernet0/5", true);
    let reason = ws.errdisabled_reason(&sw, "FastEthernet0/5").unwrap_or("");
    assert!(reason.contains("BPDU guard"), "{reason}");
    assert!(!ws.port_state(&sw, "FastEthernet0/5").admin_up);
    assert!(ws.errdisable_recover(&sw, "FastEthernet0/5"));
    assert!(ws.errdisabled_reason(&sw, "FastEthernet0/5").is_none());
}

#[test]
fn storm_control_counts_broadcast_drops_above_the_level() {
    let (mut ws, sw) = rogue();
    ws.set_storm_level(&sw, "FastEthernet0/5", 50);
    let mut dropped = 0;
    for _ in 0..100 {
        if ws.storm_drop(&sw, "FastEthernet0/5", true) {
            dropped += 1;
        }
    }
    assert_eq!(dropped, 50);
    assert_eq!(ws.storm_drops(&sw, "FastEthernet0/5"), 50);
    assert!(!ws.storm_drop(&sw, "FastEthernet0/5", false));
}

#[test]
fn the_cli_sets_the_guard_and_show_errdisable_names_it() {
    let (mut ws, sw) = rogue();
    let mut s = Session::default();
    for line in [
        "enable", "configure terminal", "interface FastEthernet0/5",
        "spanning-tree portfast", "spanning-tree bpduguard enable",
        "storm-control broadcast level 20", "shutdown", "no shutdown",
    ] {
        cli_run(&mut ws, &sw, &mut s, line);
    }
    cli_run(&mut ws, &sw, &mut s, "end");
    let table = cli_run(&mut ws, &sw, &mut s, "show errdisable");
    assert!(table.contains("FastEthernet0/5") && table.contains("BPDU guard"), "{table}");
    let iface = cli_run(&mut ws, &sw, &mut s, "show interfaces FastEthernet0/5");
    assert!(iface.contains("err-disabled"), "{iface}");
}
