use super::super::*;
use crate::cmd::run as cmd_run;

const SLOW: &str = include_str!("../../../web/templates/les-l2-08-slow-link.xml");
const LLDP: &str = include_str!("../../../web/templates/les-l2-09-who-is-there.xml");
const UFW: &str = include_str!("../../../web/templates/les-l3-09-lock-the-server.xml");
const HUB: &str = include_str!("../../../web/templates/les-l2-10-noisy-hub.xml");
const WIFI: &str = include_str!("../../../web/templates/les-l4-08-two-wifi.xml");

fn results(ws: &mut Workspace) -> Vec<bool> {
    ws.run_checks().into_iter().map(|r| r.passed).collect()
}

#[test]
fn slow_link_fails_until_both_ends_agree() {
    let mut ws = Workspace::from_tnet(SLOW).unwrap();
    assert_eq!(results(&mut ws), vec![false, false]);
    ws.set_link_duplex("pc1", "FastEthernet0", Some(true)).unwrap();
    assert_eq!(results(&mut ws), vec![true, true]);
}

#[test]
fn who_is_there_fails_while_the_uplink_is_shut() {
    let mut ws = Workspace::from_tnet(LLDP).unwrap();
    assert_eq!(results(&mut ws), vec![false]);
    assert!(ws.set_port_up("switch0", "FastEthernet0/1", true));
    assert_eq!(results(&mut ws), vec![true]);
}

#[test]
fn lock_the_server_needs_a_firewall_rule_for_the_office_prefix() {
    let mut ws = Workspace::from_tnet(UFW).unwrap();
    assert_eq!(results(&mut ws), vec![true, false]);
    for line in [
        "sudo ufw enable",
        "sudo ufw default deny incoming",
        "sudo ufw allow from 10.10.0.0/25",
    ] {
        cmd_run(&mut ws, "server0", line);
    }
    assert_eq!(results(&mut ws), vec![true, true]);
}

#[test]
fn noisy_hub_passes_only_after_the_hub_is_replaced() {
    let mut ws = Workspace::from_tnet(HUB).unwrap();
    assert_eq!(results(&mut ws), vec![false, true]);
    assert!(ws.remove("hub0"));
    let sw = ws.add("Switch 24", 420.0, 160.0).unwrap();
    ws.link_ports(&sw, "pc0", "eCopper", Some("FastEthernet0/1"), None).unwrap();
    ws.link_ports(&sw, "pc1", "eCopper", Some("FastEthernet0/2"), None).unwrap();
    ws.link_ports(&sw, "pc2", "eCopper", Some("FastEthernet0/3"), None).unwrap();
    assert_eq!(results(&mut ws), vec![true, true]);
}

#[test]
fn two_wifi_networks_pass_after_moving_a_channel() {
    let mut ws = Workspace::from_tnet(WIFI).unwrap();
    assert_eq!(results(&mut ws), vec![false]);
    ws.set_wifi_channel("ap1", 6, "2.4").unwrap();
    assert_eq!(results(&mut ws), vec![true]);
}
