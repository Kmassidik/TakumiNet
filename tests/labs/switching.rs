use crate::*;

#[test]
fn router_on_a_stick_routes_between_access_vlans() {
    let lab = Lab::start(39_107);
    for line in [
        "en",
        "conf%20t",
        "vlan%2010%20USERS",
        "vlan%2020%20SERVERS",
        "int%20fa0%2F1",
        "switchport%20mode%20trunk",
        "int%20fa0%2F2",
        "switchport%20access%20vlan%2010",
        "int%20fa0%2F3",
        "switchport%20access%20vlan%2020",
    ] {
        let out = lab.cli("switch0", line);
        assert!(!out.contains("% Invalid") && !out.contains("% Incomplete"), "{line}: {out}");
    }
    for line in [
        "en",
        "conf%20t",
        "int%20g0%2F0.10",
        "encapsulation%20dot1Q%2010",
        "ip%20address%20192.168.10.1%20255.255.255.0",
        "int%20g0%2F0.20",
        "encapsulation%20dot1Q%2020",
        "ip%20address%20192.168.20.1%20255.255.255.0",
    ] {
        let out = lab.cli("router0", line);
        assert!(!out.contains("% Invalid") && !out.contains("% Incomplete"), "{line}: {out}");
    }
    lab.post("/api/devices/ip?id=pc0&ip=192.168.10.10&mask=255.255.255.0&gateway=192.168.10.1");
    lab.post("/api/devices/ip?id=pc1&ip=192.168.20.10&mask=255.255.255.0&gateway=192.168.20.1");

    let ping = lab.command("pc0", "ping%20-n%201%20192.168.20.10");
    assert!(ping.contains("Reply from 192.168.20.10") && ping.contains("TTL=127"), "{ping}");
    let running = lab.cli("router0", "do%20show%20run");
    assert!(running.contains("interface GigabitEthernet0/0.10"), "{running}");
    assert!(running.contains("encapsulation dot1Q 10"), "{running}");
    assert!(running.contains("192.168.20.1 255.255.255.0"), "{running}");
    let routes = lab.cli("router0", "do%20show%20ip%20route");
    assert!(routes.contains("192.168.10.0/24") && routes.contains("GigabitEthernet0/0.20"), "{routes}");
}

#[test]
fn ieee_stp_and_rstp_elect_root_and_reconverge() {
    let lab = Lab::start(39_108);
    lab.post("/api/devices?model=2960&x=760&y=120");
    for (a, b) in [("switch0", "switch1"), ("switch1", "switch2"), ("switch2", "switch0")] {
        let body = lab.post(&format!("/api/links?a={a}&b={b}"));
        assert!(!body.contains("\"error\""), "{a}-{b}: {body}");
    }

    // All priorities start at 32768, so switch1 wins on its lower MAC, not id.
    for sw in ["switch0", "switch1", "switch2"] {
        lab.cli(sw, "en");
        let stp = lab.cli(sw, "show%20spanning-tree");
        assert!(stp.contains("Root ID    Priority    32769"), "{sw}: {stp}");
        assert!(stp.contains("Address     0254.4b35.f1c0"), "{sw}: {stp}");
    }
    let blocked = ["switch0", "switch1", "switch2"]
        .into_iter()
        .map(|sw| lab.cli(sw, "show%20spanning-tree").matches(" BLK").count())
        .sum::<usize>();
    assert_eq!(blocked, 1, "exactly one non-designated endpoint must block");

    for line in ["conf%20t", "spanning-tree%20mode%20rapid-pvst", "spanning-tree%20vlan%201%20priority%204096"] {
        let out = lab.cli("switch2", line);
        assert!(!out.contains("% Invalid"), "{line}: {out}");
    }
    let stp = lab.cli("switch2", "do%20show%20spanning-tree");
    assert!(stp.contains("protocol rstp"), "{stp}");
    assert!(stp.contains("Root ID    Priority    4097"), "{stp}");
    assert!(stp.contains("Address     0254.4b35.f679"), "{stp}");
    let running = lab.cli("switch2", "do%20show%20run");
    assert!(running.contains("spanning-tree mode rapid-pvst"), "{running}");
    assert!(running.contains("spanning-tree vlan 1 priority 4096"), "{running}");
    lab.cli("switch2", "end");
    lab.cli("switch2", "wr");
    let startup = lab.cli("switch2", "show%20startup-config");
    assert!(startup.contains("spanning-tree mode rapid-pvst") && startup.contains("spanning-tree vlan 1 priority 4096"), "{startup}");

    // With switch2 as root, switch0 Fa0/5 is its root port. Shutting it down
    // activates the former alternate path through switch1 without a loop.
    for line in ["en", "conf%20t", "int%20fa0%2F5", "shutdown"] {
        lab.cli("switch0", line);
    }
    let sw0 = lab.cli("switch0", "do%20show%20spanning-tree");
    let sw1 = lab.cli("switch1", "show%20spanning-tree");
    assert!(!sw0.contains(" BLK") && !sw1.contains(" BLK"), "{sw0}\n{sw1}");
    assert!(sw0.contains("FastEthernet0/4") && sw0.contains("FWD"), "{sw0}");
    let ping = lab.command("pc0", "ping%20-n%201%20192.168.1.11");
    assert!(ping.contains("Reply from 192.168.1.11"), "{ping}");
}

#[test]
fn etherchannel_bundles_parallel_links_and_survives_member_failure() {
    let lab = Lab::start(39_109);
    lab.post("/api/devices?model=PC-PT&x=700&y=450");
    lab.post("/api/devices/ip?id=pc3&ip=192.168.1.12&mask=255.255.255.0&gateway=192.168.1.1");
    for (a, b) in [("switch0", "switch1"), ("switch0", "switch1"), ("pc3", "switch1")] {
        let body = lab.post(&format!("/api/links?a={a}&b={b}"));
        assert!(!body.contains("\"error\""), "{a}-{b}: {body}");
    }
    // Remove the routed alternate path so this lab proves L2 member failover.
    for line in ["en", "conf%20t", "int%20g0%2F0", "shutdown", "int%20g0%2F1", "shutdown"] {
        lab.cli("router0", line);
    }
    for sw in ["switch0", "switch1"] {
        lab.cli(sw, "en");
        lab.cli(sw, "conf%20t");
        for port in [4, 5] {
            for line in [
                format!("int%20fa0%2F{port}"),
                "switchport%20mode%20trunk".to_string(),
                "channel-group%201%20mode%20active".to_string(),
            ] {
                let out = lab.cli(sw, &line);
                assert!(!out.contains("% Invalid") && !out.contains("% Incomplete"), "{sw} {line}: {out}");
            }
        }
        lab.cli(sw, "end");
    }
    for sw in ["switch0", "switch1"] {
        let summary = lab.cli(sw, "show%20etherchannel%20summary");
        let running = lab.cli(sw, "show%20run");
        assert!(summary.contains("Po1(SU)") && summary.contains("LACP"), "{sw}: {summary}\n{running}");
        assert!(!summary.contains("(D)"), "{sw}: {summary}");
        let stp = lab.cli(sw, "show%20spanning-tree");
        assert!(!stp.contains(" BLK"), "bundle must be one STP link: {sw}: {stp}");
        assert_eq!(running.matches("channel-group 1 mode active").count(), 2, "{running}");
    }

    let ping = lab.command("pc0", "ping%20-n%201%20192.168.1.12");
    assert!(ping.contains("Reply from 192.168.1.12"), "{ping}");
    for line in ["conf%20t", "int%20fa0%2F4", "shutdown"] {
        lab.cli("switch0", line);
    }
    let summary = lab.cli("switch0", "do%20show%20etherchannel%20summary");
    assert!(summary.contains("Po1(SU)") && summary.contains("FastEthernet0/4(D)"), "{summary}");
    let ping = lab.command("pc0", "ping%20-n%201%20192.168.1.12");
    assert!(ping.contains("Reply from 192.168.1.12"), "remaining member must forward: {ping}");

    for line in ["int%20fa0%2F5", "shutdown"] {
        lab.cli("switch0", line);
    }
    let summary = lab.cli("switch0", "do%20show%20etherchannel%20summary");
    assert!(summary.contains("Po1(SD)"), "{summary}");
    let failed = lab.command("pc0", "ping%20-n%201%20192.168.1.12");
    assert!(failed.contains("100% loss"), "{failed}");
    for line in ["int%20fa0%2F4", "no%20shutdown"] {
        lab.cli("switch0", line);
    }
    let restored = lab.command("pc0", "ping%20-n%201%20192.168.1.12");
    assert!(restored.contains("Reply from 192.168.1.12"), "{restored}");
}
