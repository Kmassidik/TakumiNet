use crate::*;

#[test]
fn dhcp_lease_options_and_renewal_are_consistent() {
    let lab = Lab::start(39_115);
    let pool = lab.post("/api/devices/dhcp?id=server0&network=192.168.2.0&prefix=24&gateway=192.168.2.1&dns=192.168.2.20");
    assert!(!pool.contains("\"error\""), "{pool}");
    let leased = lab.post("/api/dhcp/acquire?id=pc2");
    assert!(leased.contains("\"ip\":\"192.168.2.100\""), "{leased}");
    let config = lab.cmd("pc2", "ipconfig");
    for option in [
        "192.168.2.100",
        "255.255.255.0",
        "Default Gateway.................: 192.168.2.1",
        "DNS Servers.....................: 192.168.2.20",
    ] {
        assert!(config.contains(option), "missing {option}: {config}");
    }

    let renewed = lab.cmd("pc2", "ipconfig /renew");
    assert!(renewed.contains("Lease from server0: 192.168.2.100"), "{renewed}");
    let released = lab.cmd("pc2", "ipconfig /release");
    assert!(released.contains("successfully released"), "{released}");
    let reused = lab.cmd("pc2", "ipconfig /renew");
    assert!(reused.contains("Lease from server0: 192.168.2.100"), "{reused}");

    // A static override must also free the old dynamic address.
    lab.post("/api/devices/ip?id=pc2&ip=192.168.2.50&mask=255.255.255.0&gateway=192.168.2.1&dns=192.168.2.20");
    let after_static = lab.post("/api/dhcp/acquire?id=pc2");
    assert!(after_static.contains("\"ip\":\"192.168.2.100\""), "{after_static}");
    let state = lab.get("/api/workspace");
    assert_eq!(state.matches("\"type\":\"DHCP\",\"proto\":\"DHCP\"").count(), 4, "{state}");
}

#[test]
fn routed_dns_resolves_nslookup_ping_and_browser() {
    let lab = Lab::start(39_116);
    let configured = lab.post("/api/devices/ip?id=pc0&ip=192.168.1.10&mask=255.255.255.0&gateway=192.168.1.1&dns=192.168.2.20");
    assert!(!configured.contains("\"error\""), "{configured}");
    lab.post("/api/devices/dns?id=server0&name=web.lab&ip=192.168.2.20");

    let lookup = lab.cmd("pc0", "nslookup web.lab");
    assert!(lookup.contains("Server:  dns\nAddress:  192.168.2.20"), "{lookup}");
    assert!(lookup.contains("Name:    web.lab\nAddress:  192.168.2.20"), "{lookup}");
    assert_ping(&lab, "pc0", "web.lab", 127);
    let page = lab.post("/api/webfetch?id=pc0&url=http%3A%2F%2Fweb.lab%2F");
    assert!(page.contains("\"status\":200") && page.contains("\"title\":\"Server0\""), "{page}");

    lab.post("/api/devices/dns?id=server0&name=web.lab&remove=1");
    let missing = lab.cmd("pc0", "nslookup web.lab");
    assert!(missing.contains("timed out"), "{missing}");
}

#[test]
fn nat_overload_rewrites_only_matching_inside_sources() {
    let lab = Lab::start(39_117);
    lab.device("PC-PT", "pc3", 50, 500);
    lab.device("2960", "switch2", 200, 500);
    lab.link("pc3", "switch2");
    lab.link("router0", "switch2");
    lab.host("pc3", "192.168.3.10", "192.168.3.1");
    lab.address("router0", "GigabitEthernet0/2", "192.168.3.1", "255.255.255.0");
    lab.config(
        "router0",
        [
            "en",
            "conf t",
            "access-list 10 permit 192.168.1.0 0.0.0.255",
            "ip nat inside source list 10 interface g0/1 overload",
            "interface g0/0",
            "ip nat inside",
            "interface g0/1",
            "ip nat outside",
            "interface g0/2",
            "ip nat inside",
            "end",
        ],
    );

    assert_ping(&lab, "pc0", "192.168.2.20", 127);
    let translations = lab.cli("router0", "show%20ip%20nat%20translations");
    assert!(translations.contains("192.168.1.10 -> 192.168.2.1"), "{translations}");
    let state = lab.get("/api/workspace");
    let events = state.split("\"events\":[").nth(1).expect("events");
    let event = &events[events.rfind("\"type\":\"ICMP\",\"proto\":\"ICMP\"").expect("ping event")..];
    let source = event.split("\"id\":\"pc0\"").nth(1).and_then(|h| h.split('}').next()).expect("source hop");
    let destination = event.split("\"id\":\"server0\"").nth(1).and_then(|h| h.split('}').next()).expect("destination hop");
    assert!(source.contains("\"srcIp\":\"192.168.1.10\""), "{source}");
    assert!(destination.contains("\"srcIp\":\"192.168.2.1\""), "{destination}");
    assert!(destination.contains("\"dstIp\":\"192.168.2.20\""), "{destination}");

    assert_ping(&lab, "pc3", "192.168.2.20", 127);
    let translations = lab.cli("router0", "show%20ip%20nat%20translations");
    assert!(!translations.contains("192.168.3.10 ->"), "{translations}");
    let state = lab.get("/api/workspace");
    let events = state.split("\"events\":[").nth(1).expect("events");
    let event = &events[events.rfind("\"type\":\"ICMP\",\"proto\":\"ICMP\"").expect("ping event")..];
    let destination = event.split("\"id\":\"server0\"").nth(1).and_then(|h| h.split('}').next()).expect("destination hop");
    assert!(destination.contains("\"srcIp\":\"192.168.3.10\""), "{destination}");
}

#[test]
fn extended_acl_first_match_permit_and_implicit_deny() {
    let lab = Lab::start(39_118);
    lab.config(
        "router0",
        [
            "en",
            "conf t",
            "access-list 100 deny ip host 192.168.1.10 host 192.168.2.20",
            "access-list 100 permit ip host 192.168.1.11 host 192.168.2.20",
            "access-list 100 permit ip any any",
            "interface g0/1",
            "ip access-group 100 out",
            "end",
        ],
    );
    assert_unreachable(&lab, "pc0", "192.168.2.20");
    assert_ping(&lab, "pc1", "192.168.2.20", 127);
    let lists = lab.cli("router0", "show%20access-lists");
    let deny = lists.find("100 deny 192.168.1.10 0.0.0.0 192.168.2.20 0.0.0.0").expect("deny ACE");
    let permit = lists.find("100 permit 192.168.1.11 0.0.0.0 192.168.2.20 0.0.0.0").expect("permit ACE");
    let any = lists.find("100 permit 0.0.0.0 255.255.255.255 0.0.0.0 255.255.255.255").expect("final permit");
    assert!(deny < permit && permit < any, "ACE order changed: {lists}");
    assert!(lists.contains("GigabitEthernet0/1 100 out"), "{lists}");

    lab.config(
        "router0",
        [
            "conf t",
            "access-list 101 deny ip host 192.168.1.10 host 192.168.2.20",
            "access-list 101 permit ip host 198.51.100.10 host 192.168.2.20",
            "interface g0/1",
            "ip access-group 101 out",
            "end",
        ],
    );
    assert_unreachable(&lab, "pc1", "192.168.2.20");
}

#[test]
fn simulation_capture_has_real_http_layers_and_dropped_pdus() {
    let lab = Lab::start(39_119);
    lab.post("/api/pdu?src=pc0&dst=server0");
    let page = lab.post("/api/webfetch?id=pc0&url=http%3A%2F%2F192.168.2.20%2F");
    assert!(page.contains("\"status\":200"), "{page}");

    let state = lab.get("/api/workspace");
    assert!(state.contains("\"type\":\"ICMP\",\"proto\":\"ICMP\""), "{state}");
    assert!(state.contains("\"type\":\"HTTP\",\"proto\":\"HTTP\""), "{state}");
    let events = state.split("\"events\":[").nth(1).expect("events");
    let http = &events[events.rfind("\"type\":\"HTTP\",\"proto\":\"HTTP\"").expect("HTTP event")..];
    assert!(http.contains("\"status\":\"Successful\""), "{http}");
    for layer in ["Ethernet II", "IPv4", "TCP", "HTTP"] {
        assert!(http.contains(&format!("\"name\":\"{layer}\"")), "missing {layer}: {http}");
    }
    assert!(http.contains("\"name\":\"Protocol\",\"value\":\"TCP (6)\""), "{http}");
    assert!(http.contains("\"name\":\"Destination Port\",\"value\":\"80\""), "{http}");
    assert!(http.contains("\"name\":\"Request Line\",\"value\":\"GET / HTTP/1.1\""), "{http}");
    assert!(!http.contains("\"name\":\"ICMP\""), "HTTP was relabeled ICMP: {http}");

    lab.config(
        "router0",
        [
            "en",
            "conf t",
            "access-list 100 deny ip host 192.168.1.10 host 192.168.2.20",
            "access-list 100 permit ip any any",
            "interface g0/1",
            "ip access-group 100 out",
            "end",
        ],
    );
    let dropped = lab.post("/api/pdu?src=pc0&dst=server0");
    assert!(dropped.contains("ACL denied"), "{dropped}");
    let state = lab.get("/api/workspace");
    let events = state.split("\"events\":[").nth(1).expect("events");
    let drop = &events[events.rfind("\"type\":\"ICMP\",\"proto\":\"ICMP\"").expect("drop event")..];
    assert!(drop.contains("\"status\":\"Dropped\""), "{drop}");
    assert!(drop.contains("ACL denied on Router0 GigabitEthernet0/1"), "{drop}");
    let hops = drop.split("\"hops\":[").nth(1).expect("drop hops");
    assert!(hops.contains("\"id\":\"router0\""), "partial hops missing: {hops}");
    assert!(!hops.contains("\"id\":\"server0\""), "drop reached destination: {hops}");
}

#[test]
fn control_plane_events_explain_dhcp_dns_and_smtp() {
    let lab = Lab::start(39_120);
    lab.post("/api/devices/dhcp?id=server0&network=192.168.2.0&prefix=24&gateway=192.168.2.1&dns=192.168.2.20");
    lab.post("/api/dhcp/acquire?id=pc2");
    lab.post("/api/devices/ip?id=pc0&ip=192.168.1.10&mask=255.255.255.0&gateway=192.168.1.1&dns=192.168.2.20");
    lab.post("/api/devices/dns?id=server0&name=web.lab&ip=192.168.2.20");
    let lookup = lab.cmd("pc0", "nslookup web.lab");
    assert!(lookup.contains("192.168.2.20"), "{lookup}");
    for user in ["alice", "bob"] {
        lab.post(&format!("/api/devices/mailuser?id=server0&user={user}&pass=pw"));
    }
    lab.post("/api/mail/send?id=pc0&server=server0&from=alice&to=bob&subject=lab&body=hello");

    let state = lab.get("/api/workspace");
    let events = state.split("\"events\":[").nth(1).expect("events");
    for (proto, field) in [
        ("DHCP", "DISCOVER / OFFER / REQUEST / ACK"),
        ("DNS", "web.lab A"),
        ("SMTP", "alice"),
    ] {
        let event = &events[events.rfind(&format!("\"type\":\"{proto}\",\"proto\":\"{proto}\"")).expect(proto)..];
        assert!(event.contains("Control-plane service exchange"), "{proto}: {event}");
        assert!(event.contains(field), "{proto}: {event}");
        assert!(event.contains(&format!("\"name\":\"{proto}\"")), "{proto}: {event}");
    }
    for label in ["MODBUS", "PROFINET", "Cellular"] {
        assert!(state.split("\"filters\":[").nth(1).is_some_and(|f| f.contains(&format!("\"{label}\""))), "missing filter {label}");
    }
}
