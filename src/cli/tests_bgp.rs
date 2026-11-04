use super::*;
use crate::workspace::Workspace;

fn border() -> (Workspace, Session) {
    let ws = Workspace::from_tnet(include_str!("../../web/templates/les-l6-02-first-bgp.xml"))
        .unwrap();
    (ws, Session::default())
}

fn configure(ws: &mut Workspace, s: &mut Session, lines: &[&str]) {
    for line in lines {
        let out = run(ws, "border0", s, line);
        assert!(!out.contains('%'), "{line}: {out}");
    }
}

#[test]
fn router_bgp_brings_sessions_up_and_announces() {
    let (mut ws, mut s) = border();
    configure(&mut ws, &mut s, &["enable", "configure terminal", "router bgp 64500"]);
    assert_eq!(s.mode, Mode::Router);
    assert_eq!(s.router.as_deref(), Some("bgp"));
    assert!(run(&mut ws, "border0", &mut s, "").is_empty());

    configure(
        &mut ws,
        &mut s,
        &[
            "neighbor 10.1.1.2 remote-as 64601",
            "neighbor 10.1.2.2 remote-as 64602",
            "network 192.168.50.0 mask 255.255.255.0",
        ],
    );
    assert_eq!(ws.bgp_session_state("border0", "10.1.1.2"), "established");
    assert_eq!(ws.bgp_session_state("border0", "10.1.2.2"), "established");
    assert_eq!(ws.bgp_networks("border0"), vec![(parse_ipv4("192.168.50.0").unwrap(), 24)]);

    let out = run(&mut ws, "border0", &mut s, "end");
    assert_eq!(s.mode, Mode::Priv, "{out}");
    let table = run(&mut ws, "border0", &mut s, "show ip bgp");
    assert!(table.contains("BGP local autonomous system 64500"), "{table}");
    assert!(table.contains("10.1.1.2"), "{table}");
    assert!(table.contains("established"), "{table}");
    assert!(table.contains("192.168.50.0/24"), "{table}");
}

#[test]
fn slash_networks_and_no_forms_round_trip() {
    let (mut ws, mut s) = border();
    configure(
        &mut ws,
        &mut s,
        &[
            "enable",
            "configure terminal",
            "router bgp 64500",
            "neighbor 10.1.1.2 remote-as 64601",
            "network 192.168.50.0/24",
        ],
    );
    assert_eq!(ws.bgp_networks("border0").len(), 1);

    configure(&mut ws, &mut s, &["no network 192.168.50.0/24", "no neighbor 10.1.1.2"]);
    assert!(ws.bgp_networks("border0").is_empty());
    assert_eq!(ws.bgp_session_state("border0", "10.1.1.2"), "none");

    let out = run(&mut ws, "border0", &mut s, "no neighbor 10.1.1.2");
    assert!(out.contains("No such neighbor"), "{out}");
    let out = run(&mut ws, "border0", &mut s, "no network 192.168.50.0/24");
    assert!(out.contains("No such network"), "{out}");
}

#[test]
fn deny_filters_a_prefix_and_shows_it() {
    let (mut ws, mut s) = border();
    configure(
        &mut ws,
        &mut s,
        &[
            "enable",
            "configure terminal",
            "router bgp 64500",
            "neighbor 10.1.2.2 remote-as 64602",
            "deny 192.168.0.0/16",
        ],
    );
    assert_eq!(ws.bgp_denied("border0"), vec![(parse_ipv4("192.168.0.0").unwrap(), 16)]);
    assert!(!ws.show_routes("border0").contains("192.168.0.0/16"), "denied prefix stays out");

    let table = run(&mut ws, "border0", &mut s, "do show ip bgp");
    assert!(table.contains("Denied prefixes (bgp deny):"), "{table}");
    assert!(table.contains("192.168.0.0/16"), "{table}");

    configure(&mut ws, &mut s, &["no deny 192.168.0.0/16"]);
    assert!(ws.bgp_denied("border0").is_empty());
    let out = run(&mut ws, "border0", &mut s, "no deny 192.168.0.0/16");
    assert!(out.contains("No such denied prefix"), "{out}");
}

#[test]
fn bgp_entry_and_arguments_are_validated() {
    let (mut ws, mut s) = border();
    run(&mut ws, "border0", &mut s, "enable");
    run(&mut ws, "border0", &mut s, "configure terminal");

    let out = run(&mut ws, "border0", &mut s, "router bgp");
    assert!(out.contains("% Incomplete command."), "{out}");
    let out = run(&mut ws, "border0", &mut s, "router bgp 0");
    assert!(out.contains("autonomous system must be"), "{out}");
    assert_eq!(s.mode, Mode::Config);

    run(&mut ws, "border0", &mut s, "router bgp 64500");
    let out = run(&mut ws, "border0", &mut s, "neighbor 10.1.1.2 remote-as x");
    assert!(out.contains("% Invalid autonomous system"), "{out}");
    let out = run(&mut ws, "border0", &mut s, "neighbor 10.1.1.2 64601");
    assert!(out.contains("% Incomplete command."), "{out}");
    let out = run(&mut ws, "border0", &mut s, "neighbor 10.1.1.2 peer-as 64601");
    assert!(out.contains("remote-as"), "{out}");
    let out = run(&mut ws, "border0", &mut s, "network 192.168.50.0/40");
    assert!(out.contains("% Invalid prefix length"), "{out}");
    let out = run(&mut ws, "border0", &mut s, "deny junk/8");
    assert!(out.contains("% Invalid network"), "{out}");

    let out = run(&mut ws, "border0", &mut s, "exit");
    assert_eq!(s.mode, Mode::Config, "{out}");
}

#[test]
fn show_ip_bgp_without_configuration_says_so() {
    let (mut ws, mut s) = border();
    run(&mut ws, "border0", &mut s, "enable");
    let out = run(&mut ws, "border0", &mut s, "show ip bgp");
    assert!(out.contains("% BGP is not configured"), "{out}");
}

#[test]
fn a_host_cannot_enter_bgp() {
    let mut ws = Workspace::new();
    let mut s = Session::default();
    run(&mut ws, "pc0", &mut s, "enable");
    run(&mut ws, "pc0", &mut s, "configure terminal");
    let out = run(&mut ws, "pc0", &mut s, "router bgp 64500");
    assert!(out.contains("only routing devices speak BGP"), "{out}");
    assert_eq!(s.mode, Mode::Config);
}
