use super::super::*;

fn lesson(check: Check) -> Option<Lesson> {
    Some(Lesson {
        id: "lab".into(),
        title: "Check the lab".into(),
        level: 1,
        minutes: 5,
        goal: "Use real network state".into(),
        steps: vec![LessonStep { n: 1, text: "Run the command".into() }],
        checks: vec![check],
    })
}

fn check(kind: &str, from: &str, to: &str, expect: &str) -> Check {
    Check {
        id: "c1".into(),
        kind: kind.into(),
        from: from.into(),
        to: to.into(),
        url: if kind == "http" { to.into() } else { String::new() },
        expect: expect.into(),
        label: format!("{kind} check"),
    }
}

fn passed(ws: &mut Workspace) -> bool {
    ws.run_checks().remove(0).passed
}

#[test]
fn ping_check_matches_the_terminal_before_and_after_repair() {
    let mut ws = Workspace::new();
    ws.lesson = lesson(check("ping", "pc0", "pc2", "ok"));
    ws.set_port_up("router0", "GigabitEthernet0/0", false);
    assert!(!passed(&mut ws));
    assert!(!crate::cmd::run(&mut ws, "pc0", "ping 192.168.2.10").contains("Reply from 192.168.2.10: bytes=32"));

    ws.set_port_up("router0", "GigabitEthernet0/0", true);
    assert!(passed(&mut ws));
    assert!(crate::cmd::run(&mut ws, "pc0", "ping 192.168.2.10").contains("Reply from 192.168.2.10: bytes=32"));

    ws.lesson = lesson(check("ping", "pc0", "pc2", "fail"));
    ws.set_port_up("router0", "GigabitEthernet0/0", false);
    assert!(passed(&mut ws), "expect=fail passes only for real delivery failures");
}

#[test]
fn ttl_check_uses_the_same_delivered_hop_as_ping() {
    let mut ws = Workspace::new();
    ws.lesson = lesson(check("ttl", "pc0", "pc2", "128"));
    assert!(!passed(&mut ws));
    ws.lesson = lesson(check("ttl", "pc0", "pc2", "127"));
    assert!(passed(&mut ws));
    let terminal = crate::cmd::run(&mut ws, "pc0", "ping 192.168.2.10");
    assert!(terminal.contains("TTL=127"), "{terminal}");
}

#[test]
fn http_check_fetches_the_real_page_and_title() {
    let mut ws = Workspace::new();
    ws.lesson = lesson(check("http", "pc0", "http://192.168.2.20/", "Wrong"));
    assert!(!passed(&mut ws));
    ws.lesson = lesson(check("http", "pc0", "http://192.168.2.20/", "Server0"));
    assert!(passed(&mut ws));
    assert_eq!(ws.events.last().map(|event| event.proto.as_str()), Some("HTTP"));
}

#[test]
fn lease_check_observes_dhcp_without_acquiring_a_lease() {
    let mut ws = Workspace::new();
    ws.lesson = lesson(check("lease", "pc2", "", ""));
    assert!(!passed(&mut ws));
    assert!(!ws.dhcp_clients.contains("pc2"), "checking must not change DHCP state");

    ws.set_dhcp_pool("server0", "192.168.2.0", 24, "192.168.2.1", "192.168.2.20").unwrap();
    ws.acquire_dhcp("pc2").unwrap();
    assert!(passed(&mut ws));
    let terminal = crate::cmd::run(&mut ws, "pc2", "ipconfig");
    assert!(terminal.contains("192.168.2.100"), "{terminal}");
}

#[test]
fn arp_check_requires_a_live_cache_entry() {
    let mut ws = Workspace::new();
    ws.lesson = lesson(check("arp", "pc0", "192.168.1.11", ""));
    assert!(!passed(&mut ws));
    crate::cmd::run(&mut ws, "pc0", "ping 192.168.1.11");
    assert!(passed(&mut ws));
    assert!(crate::cmd::run(&mut ws, "pc0", "arp -a").contains("192.168.1.11"));
    crate::cmd::run(&mut ws, "pc0", "arp -d");
    assert!(!passed(&mut ws));
}

#[test]
fn route_check_requires_the_exact_prefix_not_a_covering_default() {
    let mut ws = Workspace::new();
    ws.add_route("router0", "0.0.0.0", "0", "192.168.1.254", 1).unwrap();
    ws.lesson = lesson(check("route", "router0", "", "10.0.0.0/8"));
    assert!(!passed(&mut ws), "a default route must not satisfy an exact-prefix check");

    ws.add_route("router0", "10.0.0.0", "8", "192.168.1.254", 1).unwrap();
    assert!(passed(&mut ws));
    let mut session = crate::cli::Session::default();
    crate::cli::run(&mut ws, "router0", &mut session, "enable");
    let terminal = crate::cli::run(&mut ws, "router0", &mut session, "show ip route");
    assert!(terminal.contains("10.0.0.0/8"), "{terminal}");
}
