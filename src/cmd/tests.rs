use super::*;

#[test]
fn ipconfig_reflects_the_device_configuration() {
    let mut ws = Workspace::new();
    let out = run(&mut ws, "pc0", "ipconfig");
    assert!(out.contains("192.168.1.10"), "{out}");
    assert!(out.contains("255.255.255.0"), "{out}");
    assert!(out.contains("192.168.1.1"), "{out}");
    assert!(out.contains("DNS Servers"), "{out}");
}

#[test]
fn ping_crosses_the_router_and_records_an_event() {
    let mut ws = Workspace::new();
    let out = run(&mut ws, "pc0", "ping 192.168.2.10");
    assert_eq!(out.matches("Reply from 192.168.2.10").count(), 4, "{out}");
    assert!(out.contains("0% loss"), "{out}");
    assert!(out.contains("TTL=127"), "{out}");
    assert_eq!(ws.events.iter().filter(|event| event.proto == "ICMP").count(), 1);

    let mut ws = Workspace::new();
    let out = run(&mut ws, "pc0", "ping -n 1 192.168.1.11");
    assert!(out.contains("TTL=128"), "{out}");
}

#[test]
fn ping_reports_an_unreachable_helper() {
    let mut ws = Workspace::new();
    let out = run(&mut ws, "pc0", "ping 10.9.9.9");
    assert!(out.contains("Request timed out"), "{out}");
    assert!(out.contains("100% loss"), "{out}");
}

#[test]
fn tracert_lists_l3_hops_only() {
    let mut ws = Workspace::new();
    let out = run(&mut ws, "pc0", "tracert 192.168.2.10");
    assert!(out.contains("Tracing route to 192.168.2.10"), "{out}");
    assert!(out.contains("192.168.1.1"), "gateway hop: {out}");
    assert!(out.contains("192.168.2.10"), "{out}");
    assert!(!out.contains("192.168.1.10"), "sender is not a hop: {out}");
    assert!(!out.contains("Switch0"), "switches are not hops: {out}");
    assert!(out.contains("Trace complete"), "{out}");
}

#[test]
fn arp_lists_learned_neighbours() {
    let mut ws = Workspace::new();
    run(&mut ws, "pc0", "ping 192.168.1.11");
    let out = run(&mut ws, "pc0", "arp -a");
    assert!(out.contains("192.168.1.11"), "{out}");
    assert!(out.contains("dynamic"), "{out}");

    // Cross-subnet traffic caches the gateway, not the far host.
    run(&mut ws, "pc0", "ping 192.168.2.10");
    let out = run(&mut ws, "pc0", "arp -a");
    assert!(out.contains("192.168.1.1"), "gateway cached: {out}");
}

#[test]
fn telnet_opens_on_a_router_and_fails_on_a_host() {
    let mut ws = Workspace::new();
    let (out, peer) = telnet(&mut ws, "pc0", "192.168.1.1");
    assert!(out.contains("Open"), "{out}");
    assert_eq!(peer.as_deref(), Some("router0"));

    let (out, peer) = telnet(&mut ws, "pc0", "192.168.1.11");
    assert!(out.contains("Could not open"), "{out}");
    assert!(peer.is_none());
}

#[test]
fn nslookup_uses_the_dns_records() {
    let mut ws = Workspace::new();
    ws.set_config(
        "pc2",
        "192.168.2.10",
        "255.255.255.0",
        "192.168.2.1",
        "192.168.2.20",
    )
    .unwrap();
    ws.set_dns_record("server0", "web.lab", "192.168.2.20").unwrap();
    let hit = run(&mut ws, "pc2", "nslookup web.lab");
    assert!(hit.contains("Address:  192.168.2.20"), "{hit}");
    let miss = run(&mut ws, "pc2", "nslookup nothing.lab");
    assert!(miss.contains("timed out"), "{miss}");
}

#[test]
fn unknown_commands_print_the_windows_error() {
    let mut ws = Workspace::new();
    assert!(run(&mut ws, "pc0", "frobnicate").contains("is not recognized"));
}

#[test]
fn ping_honours_the_count_flag() {
    let mut ws = Workspace::new();
    let out = run(&mut ws, "pc0", "ping -n 1 192.168.2.10");
    assert_eq!(out.matches("Reply from 192.168.2.10").count(), 1, "{out}");
    assert!(out.contains("Sent = 1, Received = 1"), "{out}");
    assert!(out.contains("0% loss"), "{out}");

    let out = run(&mut ws, "pc0", "ping -n 3 192.168.2.10");
    assert_eq!(out.matches("Reply from 192.168.2.10").count(), 3, "{out}");
    assert!(out.contains("Sent = 3, Received = 3"), "{out}");

    // The default is still four.
    let out = run(&mut ws, "pc0", "ping 192.168.2.10");
    assert_eq!(out.matches("Reply from 192.168.2.10").count(), 4, "{out}");
    assert!(out.contains("Sent = 4, Received = 4"), "{out}");
}

#[test]
fn ping_rejects_bad_options() {
    let mut ws = Workspace::new();
    for line in [
        "ping -n 0 192.168.2.10",
        "ping -n 21 192.168.2.10",
        "ping -n x 192.168.2.10",
        "ping -n",
        "ping -q 192.168.2.10",
    ] {
        let out = run(&mut ws, "pc0", line);
        assert!(out.starts_with("Bad option"), "{line}: {out}");
    }
    assert!(ws.events.is_empty(), "a rejected option sends nothing");
}

#[test]
fn tracert_honours_the_hop_limit() {
    let mut ws = Workspace::new();
    let all = run(&mut ws, "pc0", "tracert 192.168.2.10");
    assert!(all.contains("maximum of 30 hops"), "{all}");
    assert!(all.contains("192.168.2.10"), "{all}");

    let mut ws = Workspace::new();
    let out = run(&mut ws, "pc0", "tracert -h 1 192.168.2.10");
    assert!(out.contains("maximum of 1 hops"), "{out}");
    assert!(out.contains("192.168.1.1"), "{out}");
    assert!(
        !out.lines().any(|l| l.contains("1 ms") && l.contains("192.168.2.10")),
        "the destination is beyond the limit: {out}"
    );
    assert_eq!(
        out.lines().filter(|l| l.contains("1 ms")).count(),
        1,
        "one hop line only: {out}"
    );
}

#[test]
fn tracert_rejects_bad_options() {
    let mut ws = Workspace::new();
    for line in [
        "tracert -h 0 192.168.2.10",
        "tracert -h 31 192.168.2.10",
        "tracert -h x 192.168.2.10",
        "tracert -h",
    ] {
        let out = run(&mut ws, "pc0", line);
        assert!(out.starts_with("Bad option"), "{line}: {out}");
    }
}

#[test]
fn arp_dash_d_clears_the_cache() {
    let mut ws = Workspace::new();
    run(&mut ws, "pc0", "ping 192.168.1.11");
    let before = run(&mut ws, "pc0", "arp -a");
    assert!(before.contains("192.168.1.11"), "{before}");

    let cleared = run(&mut ws, "pc0", "arp -d");
    assert!(cleared.trim().is_empty(), "{cleared}");

    let after = run(&mut ws, "pc0", "arp -a");
    assert!(!after.contains("192.168.1.11"), "{after}");
    assert!(after.contains("Internet Address"), "header stays: {after}");
    assert!(ws.tables.arp_rows("pc0").is_empty());
}

#[test]
fn ipconfig_release_clears_the_dhcp_state() {
    let mut ws = Workspace::new();
    ws.set_dhcp_pool("server0", "192.168.2.0", 24, "192.168.2.1", "8.8.8.8")
        .unwrap();
    let pc = ws.add("PC-PT", 600.0, 200.0).unwrap();
    ws.link(&pc, "switch1").unwrap();
    ws.acquire_dhcp(&pc).unwrap();
    assert!(ws.dhcp_clients.contains(&pc));

    let out = run(&mut ws, &pc, "ipconfig /release");
    assert!(out.contains("Windows IP Configuration"), "{out}");
    assert!(out.contains("IP address successfully released"), "{out}");

    let d = ws.devices.iter().find(|d| d.id == pc).unwrap();
    assert_eq!(d.ip, None, "address cleared");
    assert_eq!(d.gateway, None, "gateway cleared");
    assert_eq!(d.dns, None, "DNS cleared");
    assert!(!ws.dhcp_clients.contains(&pc), "no longer a DHCP client");
    assert!(run(&mut ws, &pc, "ipconfig").contains("0.0.0.0"));
}

#[test]
fn route_print_lists_statics_and_the_default_gateway() {
    let mut ws = Workspace::new();
    ws.add_route("pc0", "10.0.0.0", "255.0.0.0", "192.168.1.1", 1)
        .unwrap();
    let out = run(&mut ws, "pc0", "route print");
    assert!(out.contains("IPv4 Route Table"), "{out}");
    assert!(out.contains("Active Routes:"), "{out}");
    assert!(out.contains("10.0.0.0"), "{out}");
    assert!(out.contains("255.0.0.0"), "{out}");

    let default = out
        .lines()
        .find(|l| l.trim_start().starts_with("0.0.0.0"))
        .unwrap_or_else(|| panic!("no default route row: {out}"));
    assert!(default.contains("192.168.1.1"), "{default}");
    assert!(default.contains("192.168.1.10"), "{default}");

    assert!(run(&mut ws, "pc0", "route add").starts_with("Bad option"));
}

#[test]
fn help_documents_the_new_options() {
    let mut ws = Workspace::new();
    let out = run(&mut ws, "pc0", "help");
    for needle in [
        "ipconfig /release",
        "ping [-n N]",
        "tracert [-h N]",
        "arp -d",
        "route print",
    ] {
        assert!(out.contains(needle), "{needle} missing: {out}");
    }
}
