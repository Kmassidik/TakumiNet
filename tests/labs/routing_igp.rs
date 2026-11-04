use crate::*;

#[test]
fn ospf_dijkstra_prefers_longer_fast_path_and_persists_exact_costs() {
    let lab = Lab::start(39_112);
    lab.clear_demo();
    for (model, id, x, y) in [
        ("2911", "router1", 200, 200),
        ("2911", "router2", 400, 80),
        ("2911", "router3", 350, 320),
        ("2911", "router4", 750, 200),
        ("2911", "router5", 550, 320),
        ("PC-PT", "pc3", 50, 200),
        ("PC-PT", "pc4", 900, 200),
    ] {
        lab.device(model, id, x, y);
    }
    for (a, b) in [
        ("router1", "pc3"),
        ("router4", "pc4"),
        ("router1", "router2"),
        ("router2", "router4"),
        ("router1", "router3"),
        ("router3", "router5"),
        ("router5", "router4"),
    ] {
        lab.link(a, b);
    }
    lab.host("pc3", "192.168.1.10", "192.168.1.1");
    lab.host("pc4", "192.168.2.10", "192.168.2.1");
    for (device, interface, ip) in [
        ("router1", "GigabitEthernet0/1", "10.0.12.1"),
        ("router1", "GigabitEthernet0/2", "10.0.13.1"),
        ("router2", "GigabitEthernet0/0", "10.0.12.2"),
        ("router2", "GigabitEthernet0/1", "10.0.24.1"),
        ("router3", "GigabitEthernet0/0", "10.0.13.2"),
        ("router3", "GigabitEthernet0/1", "10.0.35.1"),
        ("router4", "GigabitEthernet0/1", "10.0.24.2"),
        ("router4", "GigabitEthernet0/2", "10.0.54.2"),
        ("router5", "GigabitEthernet0/0", "10.0.35.2"),
        ("router5", "GigabitEthernet0/1", "10.0.54.1"),
    ] {
        lab.address(device, interface, ip, "255.255.255.252");
    }
    lab.address("router1", "GigabitEthernet0/0", "192.168.1.1", "255.255.255.0");
    lab.address("router4", "GigabitEthernet0/0", "192.168.2.1", "255.255.255.0");

    for (device, interface) in [
        ("router1", "g0/1"),
        ("router2", "g0/0"),
        ("router2", "g0/1"),
        ("router4", "g0/1"),
    ] {
        lab.config(device, ["en", "conf t", &format!("interface {interface}"), "bandwidth 1544", "end"]);
    }
    for (device, networks) in [
        ("router1", &["192.168.1.0 0.0.0.255", "10.0.12.0 0.0.0.3", "10.0.13.0 0.0.0.3"][..]),
        ("router2", &["10.0.12.0 0.0.0.3", "10.0.24.0 0.0.0.3"][..]),
        ("router3", &["10.0.13.0 0.0.0.3", "10.0.35.0 0.0.0.3"][..]),
        ("router4", &["192.168.2.0 0.0.0.255", "10.0.24.0 0.0.0.3", "10.0.54.0 0.0.0.3"][..]),
        ("router5", &["10.0.35.0 0.0.0.3", "10.0.54.0 0.0.0.3"][..]),
    ] {
        let mut lines = vec!["en".to_string(), "conf t".to_string(), "router ospf 42".to_string()];
        lines.extend(networks.iter().map(|network| format!("network {network} area 0")));
        lines.push("end".to_string());
        lab.config(device, lines);
    }

    let routes = lab.cli("router1", "show%20ip%20route");
    assert!(routes.contains("O  192.168.2.0/24 [110/4] via 10.0.13.2"), "{routes}");
    assert!(!routes.contains("192.168.2.0/24 [110/129]"), "{routes}");
    let reverse = lab.cli("router4", "show%20ip%20route");
    assert!(reverse.contains("O  192.168.1.0/24 [110/4] via 10.0.54.1"), "{reverse}");
    assert_ping(&lab, "pc3", "192.168.2.10", 124);
    assert_trace(
        &lab,
        "pc3",
        "192.168.2.10",
        &["192.168.1.1", "10.0.13.2", "10.0.35.2", "10.0.54.2", "192.168.2.10"],
    );

    lab.config("router1", ["en", "conf t", "interface g0/2", "shutdown", "end"]);
    let routes = lab.cli("router1", "show%20ip%20route");
    assert!(routes.contains("O  192.168.2.0/24 [110/129] via 10.0.12.2"), "{routes}");
    assert!(!routes.contains("192.168.2.0/24 [110/4]"), "{routes}");
    assert_ping(&lab, "pc3", "192.168.2.10", 125);
    assert_trace(
        &lab,
        "pc3",
        "192.168.2.10",
        &["192.168.1.1", "10.0.12.2", "10.0.24.2", "192.168.2.10"],
    );
    lab.config("router1", ["en", "conf t", "interface g0/2", "no shutdown", "end"]);

    lab.save_reset_load("routing_ospf_39112");
    let routes = lab.cli("router1", "show%20ip%20route");
    assert!(routes.contains("O  192.168.2.0/24 [110/4] via 10.0.13.2"), "{routes}");
    let running = lab.cli("router2", "show%20running-config");
    assert_eq!(running.matches("bandwidth 1544").count(), 2, "{running}");
    assert!(running.contains("router ospf 42"), "{running}");
    assert!(running.contains("network 10.0.12.0 0.0.0.3 area 0"), "{running}");
    assert_ping(&lab, "pc3", "192.168.2.10", 124);
    assert_trace(
        &lab,
        "pc3",
        "192.168.2.10",
        &["192.168.1.1", "10.0.13.2", "10.0.35.2", "10.0.54.2", "192.168.2.10"],
    );
}

#[test]
fn ospf_multi_area_abrs_originate_backbone_summaries() {
    let lab = Lab::start(39_113);
    lab.clear_demo();
    for (model, id, x, y) in [
        ("2911", "router1", 150, 150),
        ("2911", "router2", 350, 150),
        ("2911", "router3", 550, 150),
        ("2911", "router4", 750, 150),
        ("PC-PT", "pc3", 20, 150),
        ("PC-PT", "pc4", 880, 150),
    ] {
        lab.device(model, id, x, y);
    }
    for (a, b) in [
        ("router1", "pc3"),
        ("router4", "pc4"),
        ("router1", "router2"),
        ("router2", "router3"),
        ("router3", "router4"),
    ] {
        lab.link(a, b);
    }
    lab.host("pc3", "192.168.1.10", "192.168.1.1");
    lab.host("pc4", "192.168.2.10", "192.168.2.1");
    lab.address("router1", "GigabitEthernet0/0", "192.168.1.1", "255.255.255.0");
    lab.address("router4", "GigabitEthernet0/0", "192.168.2.1", "255.255.255.0");
    for (device, interface, ip) in [
        ("router1", "GigabitEthernet0/1", "10.0.12.1"),
        ("router2", "GigabitEthernet0/0", "10.0.12.2"),
        ("router2", "GigabitEthernet0/1", "10.0.23.1"),
        ("router3", "GigabitEthernet0/0", "10.0.23.2"),
        ("router3", "GigabitEthernet0/1", "10.0.34.1"),
        ("router4", "GigabitEthernet0/1", "10.0.34.2"),
    ] {
        lab.address(device, interface, ip, "255.255.255.252");
    }
    for (device, networks) in [
        ("router1", &[("192.168.1.0 0.0.0.255", 1), ("10.0.12.0 0.0.0.3", 1)][..]),
        ("router2", &[("10.0.12.0 0.0.0.3", 1), ("10.0.23.0 0.0.0.3", 0)][..]),
        ("router3", &[("10.0.23.0 0.0.0.3", 0), ("10.0.34.0 0.0.0.3", 2)][..]),
        ("router4", &[("10.0.34.0 0.0.0.3", 2), ("192.168.2.0 0.0.0.255", 2)][..]),
    ] {
        let mut lines = vec!["en".to_string(), "conf t".to_string(), "router ospf 7".to_string()];
        lines.extend(networks.iter().map(|(network, area)| format!("network {network} area {area}")));
        lines.push("end".to_string());
        lab.config(device, lines);
    }

    let area1 = lab.cli("router1", "show%20ip%20route");
    assert!(area1.contains("O IA  192.168.2.0/24 [110/4] via 10.0.12.2"), "{area1}");
    assert!(area1.contains("O IA  10.0.23.0/30 [110/2] via 10.0.12.2"), "{area1}");
    let abr1 = lab.cli("router2", "show%20ip%20route");
    assert!(abr1.contains("O  192.168.1.0/24 [110/2]"), "{abr1}");
    assert!(abr1.contains("O IA  192.168.2.0/24 [110/3] via 10.0.23.2"), "{abr1}");
    let abr2 = lab.cli("router3", "show%20ip%20route");
    assert!(abr2.contains("O IA  192.168.1.0/24 [110/3] via 10.0.23.1"), "{abr2}");
    assert!(abr2.contains("O  192.168.2.0/24 [110/2]"), "{abr2}");
    let area2 = lab.cli("router4", "show%20ip%20route");
    assert!(area2.contains("O IA  192.168.1.0/24 [110/4] via 10.0.34.1"), "{area2}");
    assert!(area2.contains("O IA  10.0.23.0/30 [110/2] via 10.0.34.1"), "{area2}");
    assert_ping(&lab, "pc3", "192.168.2.10", 124);
    assert_trace(
        &lab,
        "pc3",
        "192.168.2.10",
        &["192.168.1.1", "10.0.12.2", "10.0.23.2", "10.0.34.2", "192.168.2.10"],
    );
    assert_ping(&lab, "pc4", "192.168.1.10", 124);
}

#[test]
fn eigrp_composite_uses_bottleneck_bandwidth_delay_and_same_as_only() {
    let lab = Lab::start(39_114);
    lab.clear_demo();
    for (model, id, x, y) in [
        ("2911", "router1", 200, 200),
        ("2911", "router2", 400, 80),
        ("2911", "router3", 350, 320),
        ("2911", "router4", 750, 200),
        ("2911", "router5", 550, 320),
        ("2911", "router6", 350, 500),
        ("PC-PT", "pc3", 50, 200),
        ("PC-PT", "pc4", 900, 200),
        ("PC-PT", "pc5", 350, 650),
    ] {
        lab.device(model, id, x, y);
    }
    for (a, b) in [
        ("router1", "pc3"),
        ("router4", "pc4"),
        ("router1", "router2"),
        ("router2", "router4"),
        ("router1", "router3"),
        ("router3", "router5"),
        ("router5", "router4"),
        ("router3", "router6"),
        ("router6", "pc5"),
    ] {
        lab.link(a, b);
    }
    lab.host("pc3", "192.168.1.10", "192.168.1.1");
    lab.host("pc4", "192.168.2.10", "192.168.2.1");
    lab.host("pc5", "198.18.99.10", "198.18.99.1");
    lab.address("router1", "GigabitEthernet0/0", "192.168.1.1", "255.255.255.0");
    lab.address("router4", "GigabitEthernet0/0", "192.168.2.1", "255.255.255.0");
    lab.address("router6", "GigabitEthernet0/1", "198.18.99.1", "255.255.255.0");
    for (device, interface, ip) in [
        ("router1", "GigabitEthernet0/1", "10.0.12.1"),
        ("router1", "GigabitEthernet0/2", "10.0.13.1"),
        ("router2", "GigabitEthernet0/0", "10.0.12.2"),
        ("router2", "GigabitEthernet0/1", "10.0.24.1"),
        ("router3", "GigabitEthernet0/0", "10.0.13.2"),
        ("router3", "GigabitEthernet0/1", "10.0.35.1"),
        ("router3", "GigabitEthernet0/2", "10.0.99.1"),
        ("router4", "GigabitEthernet0/1", "10.0.24.2"),
        ("router4", "GigabitEthernet0/2", "10.0.54.2"),
        ("router5", "GigabitEthernet0/0", "10.0.35.2"),
        ("router5", "GigabitEthernet0/1", "10.0.54.1"),
        ("router6", "GigabitEthernet0/0", "10.0.99.2"),
    ] {
        lab.address(device, interface, ip, "255.255.255.252");
    }
    for (device, interface, bandwidth, delay) in [
        ("router1", "g0/1", 100_000, 100),
        ("router2", "g0/0", 100_000, 100),
        ("router2", "g0/1", 1_000_000, 10),
        ("router4", "g0/1", 1_000_000, 10),
    ] {
        lab.config(
            device,
            [
                "en".to_string(),
                "conf t".to_string(),
                format!("interface {interface}"),
                format!("bandwidth {bandwidth}"),
                format!("delay {delay}"),
                "end".to_string(),
            ],
        );
    }
    for (device, networks) in [
        ("router1", &["192.168.1.0 0.0.0.255", "10.0.12.0 0.0.0.3", "10.0.13.0 0.0.0.3"][..]),
        ("router2", &["10.0.12.0 0.0.0.3", "10.0.24.0 0.0.0.3"][..]),
        ("router3", &["10.0.13.0 0.0.0.3", "10.0.35.0 0.0.0.3", "10.0.99.0 0.0.0.3"][..]),
        ("router4", &["192.168.2.0 0.0.0.255", "10.0.24.0 0.0.0.3", "10.0.54.0 0.0.0.3"][..]),
        ("router5", &["10.0.35.0 0.0.0.3", "10.0.54.0 0.0.0.3"][..]),
    ] {
        let mut lines = vec!["en".to_string(), "conf t".to_string(), "router eigrp 42".to_string()];
        lines.extend(networks.iter().map(|network| format!("network {network}")));
        lines.push("end".to_string());
        lab.config(device, lines);
    }
    lab.config(
        "router6",
        [
            "en",
            "conf t",
            "router eigrp 99",
            "network 10.0.99.0 0.0.0.3",
            "network 198.18.99.0 0.0.0.255",
            "end",
        ],
    );

    let routes = lab.cli("router1", "show%20ip%20route");
    // Long path: min BW 1,000,000 Kbps, delay 40 us.
    assert!(routes.contains("D  192.168.2.0/24 [90/3584] via 10.0.13.2"), "{routes}");
    assert!(!routes.contains("192.168.2.0/24 [90/28672]"), "{routes}");
    let reverse = lab.cli("router4", "show%20ip%20route");
    assert!(reverse.contains("D  192.168.1.0/24 [90/3584] via 10.0.54.1"), "{reverse}");
    assert_ping(&lab, "pc3", "192.168.2.10", 124);
    assert_trace(
        &lab,
        "pc3",
        "192.168.2.10",
        &["192.168.1.1", "10.0.13.2", "10.0.35.2", "10.0.54.2", "192.168.2.10"],
    );

    lab.config("router1", ["en", "conf t", "interface g0/2", "shutdown", "end"]);
    let routes = lab.cli("router1", "show%20ip%20route");
    // Short path: min BW 100,000 Kbps, cumulative delay 100 + 10 + 10 us.
    assert!(routes.contains("D  192.168.2.0/24 [90/28672] via 10.0.12.2"), "{routes}");
    assert!(!routes.contains("192.168.2.0/24 [90/3584]"), "{routes}");
    assert_ping(&lab, "pc3", "192.168.2.10", 125);
    assert_trace(
        &lab,
        "pc3",
        "192.168.2.10",
        &["192.168.1.1", "10.0.12.2", "10.0.24.2", "192.168.2.10"],
    );
    lab.config("router1", ["en", "conf t", "interface g0/2", "no shutdown", "end"]);

    let different_as_neighbor = lab.cli("router3", "show%20ip%20route");
    assert!(!different_as_neighbor.contains("198.18.99.0/24"), "{different_as_neighbor}");
    let different_as = lab.cli("router6", "show%20ip%20route");
    assert!(!different_as.contains("192.168.1.0/24"), "{different_as}");
    assert!(different_as.contains("198.18.99.0/24"), "{different_as}");
    assert_unreachable(&lab, "pc3", "198.18.99.10");
}
