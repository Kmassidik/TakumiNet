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

#[test]
fn two_sessions_can_copy_one_port_to_two_sniffers() {
    let (mut ws, sw) = lab();
    ws.add("Sniffer", 700.0, 100.0).unwrap();
    ws.link_ports(&sw, "sniffer1", "eCopper", Some("FastEthernet0/10"), None).unwrap();
    ws.set_mirror_source_in(&sw, 1, "FastEthernet0/1", "both");
    ws.set_mirror_dest_in(&sw, 1, "FastEthernet0/9");
    ws.set_mirror_source_in(&sw, 2, "FastEthernet0/1", "both");
    ws.set_mirror_dest_in(&sw, 2, "FastEthernet0/10");
    ws.send_pdu("pc0", "pc1").unwrap();
    assert_eq!(ws.sniffer_match_count("sniffer0", "icmp", ""), 1);
    assert_eq!(ws.sniffer_match_count("sniffer1", "icmp", ""), 1);
    let table = ws.mirror_table(&sw);
    assert!(table.contains("Session 1") && table.contains("Session 2"), "{table}");
}

#[test]
fn a_frame_dropped_later_is_still_mirrored() {
    let (mut ws, sw) = lab();
    ws.set_mirror_source(&sw, "FastEthernet0/1", "both");
    ws.set_mirror_dest(&sw, "FastEthernet0/9");
    ws.ufw_mut("pc1").enabled = true;
    ws.ufw_mut("pc1").rules.push(crate::workspace::UfwRule {
        allow: false, proto: Some("icmp".into()), port: None, from: None, from6: None,
    });
    assert!(ws.send_pdu("pc0", "pc1").is_err());
    assert_eq!(ws.sniffer_match_count("sniffer0", "icmp", ""), 1);
}

#[test]
fn a_second_session_survives_a_round_trip_and_old_files_still_load() {
    let (mut ws, sw) = lab();
    ws.set_mirror_source_in(&sw, 2, "FastEthernet0/2", "tx");
    ws.set_mirror_dest_in(&sw, 2, "FastEthernet0/9");
    let back = Workspace::from_tnet(&ws.to_tnet()).unwrap();
    assert!(back.mirror_table(&sw).contains("Session 2"), "{}", back.mirror_table(&sw));
    let old = "<takumi version=\"1\"><device id=\"s\" kind=\"switch\" model=\"Switch 24\" x=\"1\" y=\"1\" name=\"S\" ip=\"\" prefix=\"24\"/><device id=\"n\" kind=\"sniffer\" model=\"Sniffer\" x=\"2\" y=\"2\" name=\"N\" ip=\"\" prefix=\"24\"/><mirror dev=\"s\" source=\"FastEthernet0/1:rx\" dest=\"FastEthernet0/2\"/></takumi>";
    let ws2 = Workspace::from_tnet(old).unwrap();
    assert!(ws2.mirror_table("s").contains("Session 1"), "{}", ws2.mirror_table("s"));
}
