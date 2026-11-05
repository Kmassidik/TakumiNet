use super::super::*;
use crate::cli::{run as cli_run, Session};

fn pair() -> (Workspace, String, String) {
    let mut ws = Workspace::empty();
    let r0 = ws.add("Router 300", 100.0, 100.0).unwrap();
    let r1 = ws.add("Router 300", 400.0, 100.0).unwrap();
    ws.set_port_ip(&r0, "GigabitEthernet0/0", "10.60.0.2", 24).unwrap();
    ws.set_port_ip(&r1, "GigabitEthernet0/0", "10.60.0.3", 24).unwrap();
    ws.set_fhrp(&r0, "GigabitEthernet0/0", 1, crate::model::parse_ipv4("10.60.0.1").unwrap(), 120, false);
    ws.set_fhrp(&r1, "GigabitEthernet0/0", 1, crate::model::parse_ipv4("10.60.0.1").unwrap(), 100, false);
    (ws, r0, r1)
}

#[test]
fn the_highest_priority_live_router_owns_the_virtual_address() {
    let (mut ws, r0, r1) = pair();
    let vip = crate::model::parse_ipv4("10.60.0.1").unwrap();
    assert_eq!(ws.shared_gateway_owner(vip), Some(r0.clone()));
    ws.set_power(&r0, false);
    assert_eq!(ws.shared_gateway_owner(vip), Some(r1.clone()));
    ws.set_power(&r0, true);
    assert_eq!(ws.shared_gateway_owner(vip), Some(r0), "preempt puts the higher priority back");
}

#[test]
fn show_vrrp_brief_marks_master_and_backup() {
    let (mut ws, r0, r1) = pair();
    let master = ws.show_fhrp(&r0);
    let backup = ws.show_fhrp(&r1);
    assert!(master.contains("Master") && master.contains("10.60.0.1"), "{master}");
    assert!(backup.contains("Backup"), "{backup}");
}

#[test]
fn fhrp_survives_a_save_and_open_round_trip() {
    let (ws, r0, _) = pair();
    let back = Workspace::from_tnet(&ws.to_tnet()).unwrap();
    let groups = back.fhrp_groups(&r0);
    assert_eq!(groups.len(), 1);
    assert_eq!(groups[0].priority, 120);
    assert_eq!(crate::model::ipv4_string(groups[0].vip), "10.60.0.1");
}

#[test]
fn the_cli_configures_a_vrrp_group_on_the_interface() {
    let (mut ws, r0, _) = pair();
    let mut s = Session::default();
    for line in ["enable", "configure terminal", "interface GigabitEthernet0/0", "standby 2 ip 10.60.0.9 priority 110", "end"] {
        cli_run(&mut ws, &r0, &mut s, line);
    }
    let table = cli_run(&mut ws, &r0, &mut s, "show standby brief");
    assert!(table.contains("10.60.0.9") && table.contains("110"), "{table}");
}
