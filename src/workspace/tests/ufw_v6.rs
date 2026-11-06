use super::super::*;
use crate::cli::run;
use crate::cmd::run as cmd_run;

fn lab() -> Workspace {
    let mut ws = Workspace::new();
    ws.set_ipv6("pc0", false, "2001:db8::1", 64, "", "").unwrap();
    ws.set_ipv6("pc1", false, "2001:db8::2", 64, "", "").unwrap();
    ws
}

#[test]
fn ping6_reaches_a_host_on_the_same_segment() {
    let mut ws = lab();
    let out = cmd_run(&mut ws, "pc0", "ping6 2001:db8::2");
    assert!(out.contains("Reply from 2001:db8::2"), "{out}");
    assert!(out.contains("0% loss"), "{out}");
}

#[test]
fn a_v6_deny_rule_blocks_the_ping_and_allow_restores_it() {
    let mut ws = lab();
    let host = "pc1";
    assert!(cmd_run(&mut ws, host, "sudo ufw enable").contains("active"));
    assert!(cmd_run(&mut ws, host, "sudo ufw deny from 2001:db8::1").contains("Rules updated"));
    let denied = cmd_run(&mut ws, "pc0", "ping6 2001:db8::2");
    assert!(denied.contains("100% loss"), "{denied}");
    assert!(denied.contains("ufw denied icmp6"), "{denied}");
    assert!(cmd_run(&mut ws, host, "sudo ufw delete deny from 2001:db8::1").contains("Rule deleted"));
    let allowed = cmd_run(&mut ws, "pc0", "ping6 2001:db8::2");
    assert!(allowed.contains("Reply from 2001:db8::2"), "{allowed}");
}

#[test]
fn ufw_status_lists_v6_rules_numbered() {
    let mut ws = lab();
    cmd_run(&mut ws, "pc1", "sudo ufw enable");
    let out = cmd_run(&mut ws, "pc1", "sudo ufw deny from 2001:db8::5/64");
    assert!(out.contains("Rules updated"), "{out}");
    let list = cmd_run(&mut ws, "pc1", "sudo ufw status numbered");
    assert!(list.contains("2001:db8::5/64"), "{list}");
    assert!(list.contains("DENY IN"), "{list}");
}

#[test]
fn v6_rules_survive_a_save_and_open_round_trip() {
    let mut ws = lab();
    cmd_run(&mut ws, "pc1", "sudo ufw enable");
    cmd_run(&mut ws, "pc1", "sudo ufw deny from 2001:db8::1");
    let back = Workspace::from_tnet(&ws.to_tnet()).unwrap();
    let rule = back
        .ufw("pc1")
        .and_then(|f| f.rules.first())
        .expect("rule survives");
    assert_eq!(rule.from6.map(|(a, p)| (a.to_string(), p)), Some(("2001:db8::1".to_string(), 128)));
}

#[test]
fn the_router_cli_does_not_use_ufw() {
    let mut ws = lab();
    assert!(run(&mut ws, "router0", &mut crate::cli::Session::default(), "sudo ufw status").contains("Invalid input"));
}

#[test]
fn nc6_respects_a_v6_deny_by_port_and_protocol() {
    let mut ws = lab();
    cmd_run(&mut ws, "pc1", "sudo ufw enable");
    let denied = cmd_run(&mut ws, "pc0", "nc6 2001:db8::2 22");
    assert!(denied.contains("denied tcp/22"), "{denied}");
    assert!(cmd_run(&mut ws, "pc1", "sudo ufw allow 22/tcp from 2001:db8::1").contains("Rules updated"));
    let allowed = cmd_run(&mut ws, "pc0", "nc6 2001:db8::2 22");
    assert!(allowed.contains("ufw allowed"), "{allowed}");
    let other = cmd_run(&mut ws, "pc0", "nc6 2001:db8::2 80");
    assert!(other.contains("denied tcp/80"), "{other}");
}

#[test]
fn nc6_speaks_udp_and_the_rule_separates_it_from_tcp() {
    let mut ws = lab();
    cmd_run(&mut ws, "pc1", "sudo ufw enable");
    cmd_run(&mut ws, "pc1", "sudo ufw allow 53/udp from 2001:db8::1");
    assert!(cmd_run(&mut ws, "pc0", "nc6 -u 2001:db8::2 53").contains("ufw allowed"));
    let tcp = cmd_run(&mut ws, "pc0", "nc6 2001:db8::2 53");
    assert!(tcp.contains("denied tcp/53"), "{tcp}");
}

#[test]
fn deleting_the_port_rule_blocks_the_v6_connection_again() {
    let mut ws = lab();
    cmd_run(&mut ws, "pc1", "sudo ufw enable");
    cmd_run(&mut ws, "pc1", "sudo ufw allow 443/tcp from 2001:db8::1");
    assert!(cmd_run(&mut ws, "pc0", "nc6 2001:db8::2 443").contains("ufw allowed"));
    cmd_run(&mut ws, "pc1", "sudo ufw delete allow 443/tcp from 2001:db8::1");
    assert!(cmd_run(&mut ws, "pc0", "nc6 2001:db8::2 443").contains("denied tcp/443"));
}
