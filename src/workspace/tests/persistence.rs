use super::super::*;

#[test]
fn tnet_round_trip_preserves_topology() {
    let mut ws = Workspace::new();
    ws.send_pdu("pc0", "pc1").unwrap();
    let text = ws.to_tnet();
    let back = Workspace::from_tnet(&text).unwrap();
    assert_eq!(back.devices.len(), ws.devices.len());
    assert_eq!(back.links.len(), ws.links.len());
    assert_eq!(back.devices[0].name, ws.devices[0].name);
    assert_eq!(back.links[0].b_port, ws.links[0].b_port);
}

#[test]
fn legacy_routing_records_use_protocol_defaults() {
    let mut ws = Workspace::new();
    ws.add_route("router0", "10.0.0.0", "8", "192.168.1.254", 200)
        .unwrap();
    ws.set_port_bandwidth("router0", "GigabitEthernet0/0", 10_000)
        .unwrap();
    ws.set_port_delay("router0", "GigabitEthernet0/0", 250)
        .unwrap();
    ws.set_routing_protocol("router0", "ospf", 42).unwrap();
    ws.add_routing_network(
        "router0",
        crate::model::parse_ipv4("192.168.1.0").unwrap(),
        24,
        7,
    )
    .unwrap();
    let mut legacy = String::new();
    for line in ws.to_records().lines() {
        let keep = if line.starts_with("route\t") {
            5
        } else if line.starts_with("port\t") {
            8
        } else if line.starts_with("routing\t") {
            3
        } else if line.starts_with("routenet\t") {
            4
        } else {
            usize::MAX
        };
        legacy.push_str(&line.split('\t').take(keep).collect::<Vec<_>>().join("\t"));
        legacy.push('\n');
    }
    let back = Workspace::from_ptw(&legacy).expect("legacy load");
    let router = back.devices.iter().find(|d| d.id == "router0").unwrap();
    assert_eq!(router.routes[0].admin_distance, 1);
    let port = router
        .ports
        .iter()
        .find(|p| p.name == "GigabitEthernet0/0")
        .unwrap();
    assert_eq!((port.bandwidth_kbps, port.delay_us), (1_000_000, 10));
    assert_eq!(
        back.routing["router0"].protocol,
        RoutingProtocol::Ospf { process_id: 1 }
    );
    assert_eq!(back.routing["router0"].networks[0].area, 0);
}

#[test]
fn tnet_round_trip_covers_every_edited_field() {
    let mut ws = Workspace::new();
    ws.set_config("pc0", "192.168.1.10", "255.255.255.0", "192.168.1.1", "8.8.8.8")
        .unwrap();
    ws.set_ipv6("pc0", false, "2001:db8::1", 64, "2001:db8::ff", "2001:db8::53")
        .unwrap();
    ws.set_dot1x("pc0", true, "student", "s3cret").unwrap();
    ws.set_port_up("router0", "GigabitEthernet0/0", false);
    ws.set_port_bandwidth("router0", "GigabitEthernet0/0", 10_000).unwrap();
    ws.set_port_delay("router0", "GigabitEthernet0/0", 250).unwrap();
    ws.add_route("router0", "10.0.0.0", "255.0.0.0", "192.168.1.254", 200)
        .unwrap();
    ws.set_routing_protocol("router0", "ospf", 42).unwrap();
    ws.add_routing_network("router0", crate::model::parse_ipv4("192.168.2.0").unwrap(), 24, 7).unwrap();
    ws.set_dhcp_pool("server0", "192.168.2.0", 24, "192.168.2.1", "192.168.2.20")
        .unwrap();
    ws.acquire_dhcp("pc2").unwrap();
    ws.banners
        .insert("router0".into(), "authorised\naccess only".into());
    ws.line_passwords.insert("router0".into(), "lab".into());
    ws.set_power("pc0", false);
    ws.set_module("router0", 0, "HWIC-2T").unwrap();
    ws.set_dns_record("server0", "web.lab", "192.168.2.20").unwrap();
    assert!(ws.set_http_page("server0", "custom page\nsecond line"));
    ws.set_dhcp_reservation("server0", "pc2", "192.168.2.150").unwrap();
    ws.set_dhcp_helper("router0", "GigabitEthernet0/0", "192.168.2.20").unwrap();
    ws.vlan_create("switch0", 20, "SALES").unwrap();
    ws.set_access_vlan("switch0", "FastEthernet0/3", 20).unwrap();
    ws.set_trunk("switch0", "FastEthernet0/1", true).unwrap();
    ws.ensure_subinterface("router0", "g0/0.10").unwrap();
    ws.set_port_ip("router0", "GigabitEthernet0/0.10", "192.168.10.1", 24).unwrap();
    ws.set_channel_group_mode("switch0", "FastEthernet0/1", 1, "active").unwrap();
    ws.set_stp_mode("switch0", "rapid-pvst").unwrap();
    ws.set_stp_priority("switch0", 1, 4096).unwrap();
    ws.add_mail_user("server0", "alice", "pw").unwrap();
    ws.add_mail_user("server0", "bob", "pw2").unwrap();
    ws.send_mail("pc0", "server0", "alice", "bob", "subject", "body\ntext")
        .unwrap();
    ws.tftp_put("server0", "config.txt", "hostname x").unwrap();
    ws.link_kind("pc0", "router0", "eConsole").unwrap();

    let text = ws.to_tnet();
    let back = Workspace::from_tnet(&text).expect("reload");
    assert_eq!(back.to_tnet(), text, "save/load is idempotent");

    let pc0 = back.devices.iter().find(|d| d.id == "pc0").unwrap();
    assert_eq!(
        pc0.gateway,
        Some(crate::model::parse_ipv4("192.168.1.1").unwrap())
    );
    assert_eq!(pc0.dns, Some(crate::model::parse_ipv4("8.8.8.8").unwrap()));
    assert_eq!(pc0.ipv6.as_deref(), Some("2001:db8::1"));
    assert_eq!(pc0.ipv6_prefix, 64);
    assert!(pc0.dot1x);
    assert_eq!(pc0.dot1x_user.as_deref(), Some("student"));
    assert_eq!(pc0.dot1x_pass.as_deref(), Some("s3cret"));

    let r0 = back.devices.iter().find(|d| d.id == "router0").unwrap();
    assert_eq!(r0.routes.len(), 1);
    assert_eq!(r0.routes[0].admin_distance, 200);
    let primary = r0.ports.iter().find(|p| p.name == "GigabitEthernet0/0").unwrap();
    assert_eq!((primary.bandwidth_kbps, primary.delay_us), (10_000, 250));
    assert_eq!(back.routing["router0"].protocol, RoutingProtocol::Ospf { process_id: 42 });
    assert_eq!(back.routing["router0"].networks[0].area, 7);
    let subif = r0.ports.iter().find(|p| p.name == "GigabitEthernet0/0.10").unwrap();
    assert_eq!(subif.dot1q, Some(10));
    assert_eq!(subif.ip, crate::model::parse_ipv4("192.168.10.1"));
    assert!(
        !r0.ports
            .iter()
            .find(|p| p.name == "GigabitEthernet0/0")
            .unwrap()
            .up
    );
    assert!(back.dhcp_pools.contains_key("server0"));
    assert!(back.dhcp_clients.contains("pc2"));
    assert!(!back.is_powered("pc0"), "power switch restored");
    assert_eq!(back.modules("router0")[0].as_deref(), Some("HWIC-2T"));
    let sw = back.devices.iter().find(|d| d.id == "switch0").unwrap();
    assert_eq!(
        sw.ports
            .iter()
            .find(|p| p.name == "FastEthernet0/3")
            .unwrap()
            .vlan,
        20
    );
    assert!(
        sw.ports
            .iter()
            .find(|p| p.name == "FastEthernet0/1")
            .unwrap()
            .trunk
    );
    assert_eq!(back.vlan_name("switch0", 20), "SALES");
    assert_eq!(back.channel_mode("switch0", "FastEthernet0/1"), "active");
    assert_eq!(back.stp_mode("switch0"), "rapid-pvst");
    assert_eq!(back.stp_priority("switch0", 1), 4096);
    let inbox = back.mail_list("server0", "bob");
    assert_eq!(inbox.len(), 1);
    assert_eq!(inbox[0].body, "body\ntext");
    assert_eq!(back.tftp_list("server0"), vec!["config.txt"]);
    assert_eq!(
        back.tftp_get("server0", "config.txt").as_deref(),
        Some("hostname x")
    );
    assert_eq!(
        back.resolve_name("pc2", "web.lab"),
        Some(crate::model::parse_ipv4("192.168.2.20").unwrap())
    );
    assert_eq!(
        back.http_pages.get("server0").map(String::as_str),
        Some("custom page\nsecond line")
    );
    assert_eq!(
        back.dhcp_reservations
            .get("server0")
            .and_then(|l| l.iter().find(|(c, _)| c == "pc2"))
            .map(|(_, ip)| *ip),
        Some(crate::model::parse_ipv4("192.168.2.150").unwrap())
    );
    assert_eq!(
        back.dhcp_helpers
            .get("router0")
            .and_then(|l| l.first())
            .map(|(i, ip)| (i.as_str(), *ip)),
        Some((
            "GigabitEthernet0/0",
            crate::model::parse_ipv4("192.168.2.20").unwrap()
        ))
    );
    assert_eq!(
        back.banners.get("router0").unwrap(),
        "authorised\naccess only"
    );
    assert_eq!(back.line_passwords.get("router0").unwrap(), "lab");
    assert!(back
        .links
        .iter()
        .any(|l| l.kind == "eConsole" && l.a_port == "RS-232"));
}

fn random_state(seed: &mut u64) -> u64 {
    *seed = seed.wrapping_mul(6_364_136_223_846_793_005).wrapping_add(1);
    *seed
}

#[test]
fn xml_escape_round_trips_2000_random_strings() {
    let alphabet: Vec<char> = "\t\r\n&<>'\"amp;#09;x🦀é漢字 plain".chars().collect();
    let mut seed = 0x4d59_5df4_d0f3_3173;
    for case in 0..2000 {
        let len = (random_state(&mut seed) % 80) as usize;
        let mut value = String::new();
        for _ in 0..len {
            value.push(alphabet[(random_state(&mut seed) as usize) % alphabet.len()]);
        }
        if case % 97 == 0 {
            value.push_str("&amp;\t\r\n\"'🦀");
        }
        assert_eq!(crate::storage::xml::unescape(&crate::storage::xml::escape(&value)), Some(value));
    }
}

#[test]
fn malformed_tnet_truncations_and_random_bytes_never_panic() {
    let valid = Workspace::new().to_tnet();
    for end in 0..=valid.len() {
        let prefix = String::from_utf8_lossy(&valid.as_bytes()[..end]);
        let _ = Workspace::from_tnet(&prefix);
    }
    let mut seed = 0x9e37_79b9_7f4a_7c15;
    for _ in 0..2000 {
        let len = (random_state(&mut seed) % 160) as usize;
        let mut bytes = Vec::with_capacity(len);
        for _ in 0..len {
            bytes.push(random_state(&mut seed) as u8);
        }
        let _ = Workspace::from_tnet(&String::from_utf8_lossy(&bytes));
    }
}

#[test]
fn legacy_ptw_loads_to_the_same_workspace_as_tnet() {
    let ws = Workspace::new();
    let legacy = ws.to_records();
    let old = Workspace::from_ptw(&legacy).expect("legacy read-only load");
    let native = Workspace::from_tnet(&ws.to_tnet()).expect("native load");
    assert_eq!(old.to_records(), native.to_records());
    assert_eq!(old.to_tnet(), native.to_tnet());
}

#[test]
fn unknown_tnet_elements_survive_load_and_save() {
    let text = "<takumi version=\"1\">\n<mystery id=\"l&amp;1\" note=\"漢字&#10;next\"/>\n</takumi>\n";
    let ws = Workspace::from_tnet(text).expect("unknown elements are retained");
    assert_eq!(ws.to_tnet(), text);
}

#[test]
fn l15_loading_a_template_twice_is_deterministic() {
    let mut ws = Workspace::new();
    ws.lesson = Some(Lesson {
        id: "lesson&1".into(),
        title: "Strings <stay> intact".into(),
        level: 2,
        minutes: 15,
        goal: "Line one\nLine two 🦀".into(),
        steps: vec![
            LessonStep { n: 2, text: "Second & final".into(), check: String::new() },
            LessonStep { n: 1, text: "First <step>".into(), check: String::new() },
        ],
        checks: vec![Check {
            id: "ping-1".into(),
            kind: "ping".into(),
            from: "pc0".into(),
            to: "pc1".into(),
            url: String::new(),
            expect: "ok".into(),
            label: "PC0 reaches PC1".into(),
        }],
    });
    let template = ws.to_tnet();
    let first = Workspace::from_tnet(&template).expect("first load");
    let second = Workspace::from_tnet(&template).expect("second load");
    assert_eq!(first.to_tnet(), second.to_tnet(), "native save is stable after lesson normalization");
    let reloaded = Workspace::from_tnet(&first.to_tnet()).expect("normalized reload");
    assert_eq!(reloaded.to_tnet(), first.to_tnet());
    let loaded = first.lesson.as_ref().unwrap();
    assert_eq!(loaded.steps.iter().map(|step| step.n).collect::<Vec<_>>(), vec![1, 2]);
    assert_eq!(loaded.goal, "Line one\nLine two 🦀");
    assert_eq!(loaded.title, "Strings <stay> intact");
}

#[test]
fn lesson_records_validate_uniqueness_kinds_and_device_references() {
    let duplicate = "<takumi version=\"1\"><lesson id=\"x\" title=\"X\" level=\"1\" minutes=\"5\" goal=\"g\"/><step n=\"1\" text=\"a\"/><step n=\"1\" text=\"b\"/></takumi>";
    assert!(Workspace::from_tnet(duplicate).err().expect("duplicate steps rejected").iter().any(|p| p.element == "step"));

    let unknown = "<takumi version=\"1\"><lesson id=\"x\" title=\"X\" level=\"1\" minutes=\"5\" goal=\"g\"/><check id=\"c\" kind=\"made-up\" from=\"pc0\" to=\"\" url=\"\" expect=\"\" label=\"bad\"/></takumi>";
    assert!(Workspace::from_tnet(unknown).err().expect("unknown kind rejected").iter().any(|p| p.attribute == "kind"));

    let missing = "<takumi version=\"1\"><lesson id=\"x\" title=\"X\" level=\"1\" minutes=\"5\" goal=\"g\"/><check id=\"c\" kind=\"ping\" from=\"missing\" to=\"also-missing\" url=\"\" expect=\"ok\" label=\"bad\"/></takumi>";
    let problems = Workspace::from_tnet(missing).err().expect("unknown devices rejected");
    assert!(problems.iter().any(|p| p.attribute == "from"));
    assert!(problems.iter().any(|p| p.attribute == "to"));
}

#[test]
fn lesson_step_names_its_proving_check_and_keeps_it_through_tnet() {
    let mut ws = Workspace::new();
    ws.lesson = Some(Lesson {
        id: "unlock".into(),
        title: "Unlock by check".into(),
        level: 1,
        minutes: 3,
        goal: "Ping works".into(),
        steps: vec![
            LessonStep { n: 1, text: "Address PC0".into(), check: String::new() },
            LessonStep { n: 2, text: "Ping PC1".into(), check: "ping-1".into() },
        ],
        checks: vec![Check {
            id: "ping-1".into(),
            kind: "ping".into(),
            from: "pc0".into(),
            to: "pc1".into(),
            url: String::new(),
            expect: "ok".into(),
            label: "PC0 reaches PC1".into(),
        }],
    });
    let loaded = Workspace::from_tnet(&ws.to_tnet()).expect("round trip");
    let steps = &loaded.lesson.as_ref().unwrap().steps;
    assert_eq!(steps[0].check, "");
    assert_eq!(steps[1].check, "ping-1");
    assert!(loaded.json().contains("\"check\":\"ping-1\""));
}

#[test]
fn files_saved_before_the_rename_still_open_and_new_files_use_the_new_root() {
    let mut ws = Workspace::new();
    ws.add_note(1.0, 2.0, "#fff3b0", "hello");
    let saved = ws.to_tnet();
    assert!(saved.starts_with("<takumi version=\"1\">"), "{saved}");
    assert!(saved.trim_end().ends_with("</takumi>"), "{saved}");

    // The same file with the old root name opens and reads the same.
    let legacy = saved.replace("<takumi ", "<takuminet ").replace("</takumi>", "</takuminet>");
    let loaded = Workspace::from_tnet(&legacy).expect("an old file still opens");
    assert_eq!(loaded.notes.len(), 1);
    assert_eq!(loaded.notes[0].text, "hello");

    // Saving it again writes the new root, so files move to the new name over time.
    assert!(loaded.to_tnet().starts_with("<takumi version=\"1\">"));

    // A root that is neither name, or one that does not close, is still refused.
    assert!(Workspace::from_tnet("<other version=\"1\"></other>").is_err());
    assert!(Workspace::from_tnet("<takuminet version=\"1\"></takumi>").is_err());
    assert!(Workspace::from_tnet("<takumi version=\"1\"></takuminet>").is_err());
}
