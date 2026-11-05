use super::super::*;
use crate::cli::{run as cli_run, Session};

fn lab() -> (Workspace, String) {
    let mut ws = Workspace::empty();
    let sw = ws.add("Switch 24", 200.0, 100.0).unwrap();
    ws.add("PC", 100.0, 300.0).unwrap();
    ws.add("PC", 400.0, 300.0).unwrap();
    ws.add("Sniffer", 600.0, 100.0).unwrap();
    ws.link_ports(&sw, "pc0", "eCopper", Some("FastEthernet0/1"), None).unwrap();
    ws.link_ports(&sw, "pc1", "eCopper", Some("FastEthernet0/2"), None).unwrap();
    ws.link_ports(&sw, "sniffer0", "eCopper", Some("FastEthernet0/9"), None).unwrap();
    ws.set_ip("pc0", "10.90.0.10", 24).unwrap();
    ws.set_ip("pc1", "10.90.0.11", 24).unwrap();
    (ws, sw)
}

#[test]
fn a_mirrored_port_feeds_the_sniffer_and_removing_the_session_stops_it() {
    let (mut ws, sw) = lab();
    ws.set_mirror_source(&sw, "FastEthernet0/1", "both");
    ws.set_mirror_dest(&sw, "FastEthernet0/9");
    ws.send_pdu("pc0", "pc1").unwrap();
    assert_eq!(ws.sniffer_match_count("sniffer0", "icmp", ""), 1);
    ws.clear_mirror(&sw);
    ws.send_pdu("pc0", "pc1").unwrap();
    assert_eq!(ws.sniffer_match_count("sniffer0", "icmp", ""), 1);
}

#[test]
fn the_cli_configures_a_session_and_shows_it() {
    let (mut ws, sw) = lab();
    let mut s = Session::default();
    for line in [
        "enable", "configure terminal",
        "monitor session 1 source interface FastEthernet0/1 both",
        "monitor session 1 destination interface FastEthernet0/9",
        "end",
    ] {
        cli_run(&mut ws, &sw, &mut s, line);
    }
    let table = cli_run(&mut ws, &sw, &mut s, "show monitor session 1");
    assert!(table.contains("source interface FastEthernet0/1 (both)"), "{table}");
    assert!(table.contains("destination interface FastEthernet0/9"), "{table}");
    cli_run(&mut ws, &sw, &mut s, "configure terminal");
    cli_run(&mut ws, &sw, &mut s, "no monitor session 1");
    cli_run(&mut ws, &sw, &mut s, "end");
    assert!(cli_run(&mut ws, &sw, &mut s, "show monitor session 1").contains("no monitor session"));
}

#[test]
fn a_mirror_session_survives_a_save_and_open_round_trip() {
    let (mut ws, sw) = lab();
    ws.set_mirror_source(&sw, "FastEthernet0/1", "rx");
    ws.set_mirror_dest(&sw, "FastEthernet0/9");
    let back = Workspace::from_tnet(&ws.to_tnet()).unwrap();
    assert_eq!(back.mirror_source(&sw), Some(("FastEthernet0/1", "rx")));
    assert_eq!(back.mirror_dest(&sw), Some("FastEthernet0/9"));
}
