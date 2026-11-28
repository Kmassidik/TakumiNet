//! The VRRP preemption lesson: failover, recovery, and what the timers buy.

use super::super::*;
use crate::model::parse_ipv4 as ip;
use crate::cli::{run as cli_run, Session};

const LESSON: &str = include_str!("../../../web/templates/les-l4-11-preemption.xml");

fn configure_lesson_pair(ws: &mut Workspace) {
    let mut s = Session::default();
    for (router, prio) in [("gw0", 150), ("gw1", 100)] {
        for line in [
            "enable",
            "configure terminal",
            "interface GigabitEthernet0/0",
            &format!("vrrp 1 ip 192.168.70.1 priority {prio}"),
        ] {
            cli_run(ws, router, &mut s, line);
        }
    }
}

#[test]
fn the_template_opens_and_starts_unresolved() {
    let mut ws = Workspace::from_tnet(LESSON).unwrap();
    assert!(ws.load_problems.is_empty(), "{:?}", ws.load_problems);
    assert_eq!(ws.lesson.as_ref().map(|l| l.id.as_str()), Some("les-l4-11-preemption"));
    // Nothing shared yet: the first ping check must fail until VRRP is up.
    assert_eq!(
        ws.run_checks().into_iter().map(|r| r.passed).collect::<Vec<_>>(),
        vec![false, false, false, false]
    );
    let refusal = ws.send_pdu("pc0", "srv0").unwrap_err();
    assert!(refusal.contains("not a configured router interface"), "{refusal}");
}

#[test]
fn failover_after_the_master_down_timer_then_preemption_on_recovery() {
    let mut ws = Workspace::from_tnet(LESSON).unwrap();
    let vip = ip("192.168.70.1").unwrap();
    configure_lesson_pair(&mut ws);
    assert_eq!(ws.shared_gateway_owner(vip).as_deref(), Some("gw0"), "priority 150 masters the group");

    ws.set_power("gw0", false);
    assert_eq!(
        ws.shared_gateway_owner(vip).as_deref(),
        Some("gw0"),
        "the backup honours the master-down timer before taking over"
    );
    ws.advance(3.0);
    assert_eq!(ws.shared_gateway_owner(vip).as_deref(), Some("gw0"), "3.0 s < 3 x 1 s + 0.41 s skew");
    ws.advance(0.5);
    assert_eq!(ws.shared_gateway_owner(vip).as_deref(), Some("gw1"), "GateB answers after the timer");
    assert!(ws.send_pdu("pc0", "srv0").is_ok(), "traffic flows through the new master");

    ws.set_power("gw0", true);
    assert_eq!(
        ws.shared_gateway_owner(vip).as_deref(),
        Some("gw0"),
        "the higher priority preempts as soon as the master is back"
    );
    assert_eq!(
        ws.run_checks().into_iter().map(|r| r.passed).collect::<Vec<_>>(),
        vec![true; 4],
        "all lesson checks pass once the group is mastered and reachable"
    );
}

#[test]
fn a_shorter_advertisement_interval_speeds_the_same_failover() {
    let mut ws = Workspace::from_tnet(LESSON).unwrap();
    let vip = ip("192.168.70.1").unwrap();
    configure_lesson_pair(&mut ws);
    assert_eq!(ws.fhrp_groups("gw0")[0].advert_ms, 1000, "RFC 5798 default is one second");

    let mut s = Session::default();
    for line in ["enable", "configure terminal", "interface GigabitEthernet0/0", "vrrp 1 timers advertise 200"] {
        cli_run(&mut ws, "gw0", &mut s, line);
    }
    assert_eq!(ws.fhrp_groups("gw0")[0].advert_ms, 200);

    ws.set_power("gw0", false);
    ws.advance(0.9);
    assert_eq!(
        ws.shared_gateway_owner(vip).as_deref(),
        Some("gw0"),
        "3 x 200 ms + skew is not yet over at 0.9 s"
    );
    ws.advance(0.2);
    assert_eq!(
        ws.shared_gateway_owner(vip).as_deref(),
        Some("gw1"),
        "the same cut heals in about one second with the fast timer"
    );
}

#[test]
fn the_show_table_names_the_master_and_the_lesson_checks_grade_the_pings() {
    let mut ws = Workspace::from_tnet(LESSON).unwrap();
    configure_lesson_pair(&mut ws);
    let mut s = Session::default();
    cli_run(&mut ws, "gw1", &mut s, "enable");
    let table = cli_run(&mut ws, "gw1", &mut s, "show vrrp brief");
    assert!(table.contains("192.168.70.1"), "{table}");
    let row = table.lines().find(|l| l.contains("192.168.70.1")).expect("GateB row");
    assert!(row.contains("Backup"), "GateB sits backup: {row}");
    assert!(row.contains("GateA") && row.contains("100"), "GateA owns it at priority 150: {row}");
    let own = cli_run(&mut ws, "gw0", &mut s, "show vrrp brief");
    assert!(own.contains("Master"), "GateA answers as master: {own}");
}

#[test]
fn the_timers_setting_survives_a_save_and_open() {
    let mut ws = Workspace::from_tnet(LESSON).unwrap();
    configure_lesson_pair(&mut ws);
    let mut s = Session::default();
    for line in ["enable", "configure terminal", "interface GigabitEthernet0/0", "vrrp 1 timers advertise 200"] {
        cli_run(&mut ws, "gw0", &mut s, line);
    }
    let back = Workspace::from_tnet(&ws.to_tnet()).unwrap();
    let group = back.fhrp_groups("gw0").first().cloned().expect("gw0 group");
    assert_eq!(group.advert_ms, 200, "the advertisement interval survives save and open");
    assert_eq!(back.fhrp_groups("gw1").first().map(|g| g.advert_ms), Some(1000), "GateB keeps the default");
}
