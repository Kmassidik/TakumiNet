use crate::*;

#[test]
fn static_and_default_ad_choose_floating_route_and_survive_reopen() {
    let lab = Lab::start(39_110);
    lab.clear_demo();
    for (model, id, x, y) in [
        ("2911", "router1", 200, 100),
        ("2911", "router2", 600, 100),
        ("2911", "router3", 400, 300),
        ("PC-PT", "pc3", 50, 100),
        ("PC-PT", "pc4", 750, 100),
    ] {
        lab.device(model, id, x, y);
    }
    // Three GigabitEthernet interfaces on each 2911 are sufficient. Link order
    // fixes the interface assignments used below.
    for (a, b) in [
        ("router1", "pc3"),
        ("router2", "pc4"),
        ("router1", "router2"),
        ("router1", "router3"),
        ("router3", "router2"),
    ] {
        lab.link(a, b);
    }
    lab.host("pc3", "192.168.10.10", "192.168.10.1");
    lab.host("pc4", "192.168.20.10", "192.168.20.1");

    for (device, interface, ip, mask) in [
        ("router1", "GigabitEthernet0/0", "192.168.10.1", "255.255.255.0"),
        ("router1", "GigabitEthernet0/1", "10.0.12.1", "255.255.255.252"),
        ("router1", "GigabitEthernet0/2", "10.0.13.1", "255.255.255.252"),
        ("router2", "GigabitEthernet0/0", "192.168.20.1", "255.255.255.0"),
        ("router2", "GigabitEthernet0/1", "10.0.12.2", "255.255.255.252"),
        ("router2", "GigabitEthernet0/2", "10.0.23.2", "255.255.255.252"),
        ("router3", "GigabitEthernet0/0", "10.0.13.2", "255.255.255.252"),
        ("router3", "GigabitEthernet0/1", "10.0.23.1", "255.255.255.252"),
    ] {
        lab.address(device, interface, ip, mask);
    }
    lab.config(
        "router1",
        [
            "en",
            "conf t",
            "ip route 192.168.20.0 255.255.255.0 10.0.12.2 1",
            "ip route 192.168.20.0 255.255.255.0 10.0.13.2 10",
            "ip route 0.0.0.0 0.0.0.0 10.0.12.2 50",
            "ip route 0.0.0.0 0.0.0.0 10.0.13.2 60",
            "end",
        ],
    );
    lab.config(
        "router2",
        [
            "en",
            "conf t",
            "ip route 0.0.0.0 0.0.0.0 10.0.12.1 1",
            "ip route 0.0.0.0 0.0.0.0 10.0.23.1 10",
            "end",
        ],
    );
    lab.config(
        "router3",
        [
            "en",
            "conf t",
            "ip route 192.168.10.0 255.255.255.0 10.0.13.1",
            "ip route 192.168.20.0 255.255.255.0 10.0.23.2",
            "end",
        ],
    );

    let routes = lab.cli("router1", "show%20ip%20route");
    assert!(routes.contains("S  192.168.20.0/24 [1/0] via 10.0.12.2"), "{routes}");
    assert!(routes.contains("S  0.0.0.0/0 [50/0] via 10.0.12.2"), "{routes}");
    assert!(!routes.contains("192.168.20.0/24 [10/0]"), "{routes}");
    assert!(!routes.contains("0.0.0.0/0 [60/0]"), "{routes}");
    let return_routes = lab.cli("router2", "show%20ip%20route");
    assert!(return_routes.contains("S  0.0.0.0/0 [1/0] via 10.0.12.1"), "{return_routes}");
    assert_ping(&lab, "pc3", "192.168.20.10", 126);
    assert_trace(
        &lab,
        "pc3",
        "192.168.20.10",
        &["192.168.10.1", "10.0.12.2", "192.168.20.10"],
    );

    lab.config("router1", ["en", "conf t", "interface g0/1", "shutdown", "end"]);
    let routes = lab.cli("router1", "show%20ip%20route");
    assert!(routes.contains("S  192.168.20.0/24 [10/0] via 10.0.13.2"), "{routes}");
    assert!(routes.contains("S  0.0.0.0/0 [60/0] via 10.0.13.2"), "{routes}");
    assert!(!routes.contains("192.168.20.0/24 [1/0]"), "{routes}");
    let return_routes = lab.cli("router2", "show%20ip%20route");
    assert!(return_routes.contains("S  0.0.0.0/0 [10/0] via 10.0.23.1"), "{return_routes}");
    assert!(!return_routes.contains("0.0.0.0/0 [1/0]"), "{return_routes}");
    assert_ping(&lab, "pc3", "192.168.20.10", 125);
    assert_trace(
        &lab,
        "pc3",
        "192.168.20.10",
        &["192.168.10.1", "10.0.13.2", "10.0.23.2", "192.168.20.10"],
    );

    lab.save_reset_load("routing_static_39110");
    let routes = lab.cli("router1", "show%20ip%20route");
    assert!(routes.contains("S  192.168.20.0/24 [10/0] via 10.0.13.2"), "{routes}");
    assert!(routes.contains("S  0.0.0.0/0 [60/0] via 10.0.13.2"), "{routes}");
    let running = lab.cli("router1", "show%20running-config");
    for line in [
        "ip route 192.168.20.0 255.255.255.0 10.0.12.2",
        "ip route 192.168.20.0 255.255.255.0 10.0.13.2 10",
        "ip route 0.0.0.0 0.0.0.0 10.0.12.2 50",
        "ip route 0.0.0.0 0.0.0.0 10.0.13.2 60",
    ] {
        assert!(running.contains(line), "missing {line}: {running}");
    }
    assert_ping(&lab, "pc3", "192.168.20.10", 125);
    assert_trace(
        &lab,
        "pc3",
        "192.168.20.10",
        &["192.168.10.1", "10.0.13.2", "10.0.23.2", "192.168.20.10"],
    );

    lab.config("router1", ["en", "conf t", "interface g0/1", "no shutdown", "end"]);
    let restored = lab.cli("router1", "show%20ip%20route");
    assert!(restored.contains("S  192.168.20.0/24 [1/0] via 10.0.12.2"), "{restored}");
    assert_ping(&lab, "pc3", "192.168.20.10", 126);
}

#[test]
fn ripv2_installs_fifteen_hops_rejects_sixteen_and_is_protocol_isolated() {
    let lab = Lab::start(39_111);
    lab.clear_demo();
    for i in 1..=18 {
        lab.device("2911", &format!("router{i}"), 100 + i * 35, 100);
    }
    for (id, x, y) in [("pc3", 50, 250), ("pc4", 650, 250), ("pc5", 750, 250), ("pc6", 850, 250)] {
        lab.device("PC-PT", id, x, y);
    }
    for i in 1..17 {
        lab.link(&format!("router{i}"), &format!("router{}", i + 1));
    }
    for (a, b) in [
        ("pc3", "router1"),
        ("pc4", "router16"),
        ("pc5", "router17"),
        ("router1", "router18"),
        ("pc6", "router18"),
    ] {
        lab.link(a, b);
    }
    lab.host("pc3", "192.168.1.10", "192.168.1.1");
    lab.host("pc4", "192.168.15.10", "192.168.15.1");
    lab.host("pc5", "192.168.16.10", "192.168.16.1");
    lab.host("pc6", "198.18.18.10", "198.18.18.1");

    for i in 1..=17 {
        let device = format!("router{i}");
        let first_ip = if i == 1 {
            "10.0.1.1".to_string()
        } else {
            format!("10.0.{}.2", i - 1)
        };
        lab.address(&device, "GigabitEthernet0/0", &first_ip, "255.255.255.252");
        if (2..=16).contains(&i) {
            lab.address(
                &device,
                "GigabitEthernet0/1",
                &format!("10.0.{i}.1"),
                "255.255.255.252",
            );
        }
    }
    lab.address("router1", "GigabitEthernet0/1", "192.168.1.1", "255.255.255.0");
    lab.address("router1", "GigabitEthernet0/2", "10.0.18.1", "255.255.255.252");
    lab.address("router16", "GigabitEthernet0/2", "192.168.15.1", "255.255.255.0");
    lab.address("router17", "GigabitEthernet0/1", "192.168.16.1", "255.255.255.0");
    lab.address("router18", "GigabitEthernet0/0", "10.0.18.2", "255.255.255.252");
    lab.address("router18", "GigabitEthernet0/1", "198.18.18.1", "255.255.255.0");

    for i in 1..=17 {
        let mut lines = vec![
            "en".to_string(),
            "conf t".to_string(),
            "router rip".to_string(),
            "version 2".to_string(),
            "network 10.0.0.0".to_string(),
        ];
        if i == 1 {
            lines.push("network 192.168.1.0".to_string());
        } else if i == 16 {
            lines.push("network 192.168.15.0".to_string());
        } else if i == 17 {
            lines.push("network 192.168.16.0".to_string());
        }
        lines.push("end".to_string());
        lab.config(&format!("router{i}"), lines);
    }
    lab.config(
        "router18",
        [
            "en",
            "conf t",
            "router ospf 18",
            "network 10.0.18.0 0.0.0.3 area 0",
            "network 198.18.18.0 0.0.0.255 area 0",
            "end",
        ],
    );

    let routes = lab.cli("router1", "show%20ip%20route");
    assert!(routes.contains("R  192.168.15.0/24 [120/15] via 10.0.1.2"), "{routes}");
    assert!(!routes.contains("192.168.16.0/24"), "16 must be infinity: {routes}");
    assert!(!routes.contains("198.18.18.0/24"), "OSPF leaked into RIP: {routes}");
    let reverse = lab.cli("router16", "show%20ip%20route");
    assert!(reverse.contains("R  192.168.1.0/24 [120/15] via 10.0.15.1"), "{reverse}");
    let isolated = lab.cli("router18", "show%20ip%20route");
    assert!(!isolated.contains("192.168.1.0/24"), "{isolated}");
    assert!(!isolated.contains("192.168.15.0/24"), "{isolated}");
    assert_ping(&lab, "pc3", "192.168.15.10", 112);
    assert_unreachable(&lab, "pc3", "192.168.16.10");
    assert_unreachable(&lab, "pc3", "198.18.18.10");
}
