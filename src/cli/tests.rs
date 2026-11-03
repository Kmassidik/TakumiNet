use super::*;
use crate::workspace::Workspace;

fn session() -> Session {
    Session::default()
}

#[test]
fn configures_an_interface_and_shows_it() {
    let mut ws = Workspace::new();
    let mut s = session();

    run(&mut ws, "router0", &mut s, "enable");
    assert_eq!(s.mode, Mode::Priv);
    run(&mut ws, "router0", &mut s, "configure terminal");
    assert_eq!(s.mode, Mode::Config);
    run(&mut ws, "router0", &mut s, "interface g0/0");
    assert_eq!(s.mode, Mode::Iface);
    run(&mut ws, "router0", &mut s, "ip address 192.168.1.1 255.255.255.0");
    run(&mut ws, "router0", &mut s, "no shutdown");

    let brief = run(&mut ws, "router0", &mut s, "end");
    assert_eq!(s.mode, Mode::Priv);
    let brief = if brief.is_empty() {
        run(&mut ws, "router0", &mut s, "show ip interface brief")
    } else {
        brief
    };
    assert!(brief.contains("GigabitEthernet0/0"), "{brief}");
    assert!(brief.contains("192.168.1.1"), "{brief}");
    assert!(brief.contains("up"), "{brief}");

    let cfg = run(&mut ws, "router0", &mut s, "show running-config");
    assert!(cfg.contains("hostname Router0"), "{cfg}");
    assert!(cfg.contains("ip address 192.168.1.1 255.255.255.0"), "{cfg}");
    assert!(cfg.contains("no shutdown"), "{cfg}");
}

#[test]
fn accepts_abbreviated_shutdown_and_no_shutdown() {
    let mut ws = Workspace::new();
    let mut s = session();

    run(&mut ws, "router0", &mut s, "en");
    run(&mut ws, "router0", &mut s, "conf t");
    run(&mut ws, "router0", &mut s, "int g0/0");

    let down = |ws: &mut Workspace, s: &mut Session| {
        let brief = run(ws, "router0", s, "do show ip interface brief");
        brief
            .lines()
            .find(|l| l.starts_with("GigabitEthernet0/0"))
            .is_some_and(|l| l.contains("administratively down"))
    };
    assert!(!down(&mut ws, &mut s), "cabled interfaces ship up");

    run(&mut ws, "router0", &mut s, "shut");
    assert!(down(&mut ws, &mut s));

    run(&mut ws, "router0", &mut s, "no shut");
    assert!(!down(&mut ws, &mut s));

    run(&mut ws, "router0", &mut s, "shut");
    assert!(down(&mut ws, &mut s));

    run(&mut ws, "router0", &mut s, "no s");
    assert!(!down(&mut ws, &mut s));
}

#[test]
fn unplugged_interfaces_report_notconnect() {
    let mut ws = Workspace::new();
    let mut s = session();
    run(&mut ws, "router0", &mut s, "en");
    let brief = run(&mut ws, "router0", &mut s, "show ip interface brief");
    let row0 = brief
        .lines()
        .find(|l| l.starts_with("GigabitEthernet0/0"))
        .unwrap();
    assert!(row0.contains(" up "), "cabled port is up: {row0}");
    let row2 = brief
        .lines()
        .find(|l| l.starts_with("GigabitEthernet0/2"))
        .unwrap();
    assert!(row2.contains("notconnect"), "no cable: {row2}");
    assert!(row2.trim_end().ends_with("down"), "{row2}");
}

#[test]
fn show_mac_table_lists_what_the_switch_learned() {
    let mut ws = Workspace::new();
    ws.send_pdu("pc1", "pc0").unwrap();
    let mut s = session();
    run(&mut ws, "switch0", &mut s, "en");
    let out = run(&mut ws, "switch0", &mut s, "show mac address-table");
    assert!(out.contains("Mac Address Table"), "{out}");
    let mac = crate::net::packet::Mac::for_device("pc1").to_string();
    assert!(out.contains(&mac), "missing {mac}: {out}");
    assert!(out.contains("DYNAMIC"), "{out}");
    assert!(out.contains("Total Mac Addresses for this criterion: 2"), "{out}");
}

#[test]
fn line_protocol_follows_the_peer_interface() {
    let mut ws = Workspace::new();
    let mut sw = session();
    // Shut the switch port that feeds Router0 g0/0.
    run(&mut ws, "switch0", &mut sw, "en");
    run(&mut ws, "switch0", &mut sw, "conf t");
    run(&mut ws, "switch0", &mut sw, "int fa0/1");
    run(&mut ws, "switch0", &mut sw, "shut");

    let mut r = session();
    run(&mut ws, "router0", &mut r, "en");
    let brief = run(&mut ws, "router0", &mut r, "show ip interface brief");
    let row = brief
        .lines()
        .find(|l| l.starts_with("GigabitEthernet0/0"))
        .unwrap();
    assert!(
        row.trim_end().ends_with("down"),
        "protocol follows the peer: {row}"
    );
    let detail = run(&mut ws, "router0", &mut r, "show interfaces g0/0");
    assert!(detail.contains("up, line protocol is down"), "{detail}");

    // Enabling the far end brings the protocol back.
    run(&mut ws, "switch0", &mut sw, "no shut");
    let brief = run(&mut ws, "router0", &mut r, "show ip interface brief");
    let row = brief
        .lines()
        .find(|l| l.starts_with("GigabitEthernet0/0"))
        .unwrap();
    assert!(row.trim_end().ends_with("up"), "{row}");
}

#[test]
fn write_memory_and_reload_round_trip() {
    let mut ws = Workspace::new();
    let mut s = session();
    run(&mut ws, "router0", &mut s, "en");
    run(&mut ws, "router0", &mut s, "conf t");
    run(&mut ws, "router0", &mut s, "banner motd #authorised access only#");
    run(&mut ws, "router0", &mut s, "line con 0");
    assert_eq!(s.mode, Mode::Line);
    run(&mut ws, "router0", &mut s, "password cisco");
    run(&mut ws, "router0", &mut s, "login");
    run(&mut ws, "router0", &mut s, "end");

    let running = run(&mut ws, "router0", &mut s, "show run");
    assert!(
        running.contains("banner motd ^authorised access only^"),
        "{running}"
    );
    assert!(running.contains("line con 0"), "{running}");
    assert!(running.contains("password cisco"), "{running}");

    let saved = run(&mut ws, "router0", &mut s, "write memory");
    assert!(saved.contains("[OK]"), "{saved}");
    let startup = run(&mut ws, "router0", &mut s, "show startup-config");
    assert!(startup.contains("password cisco"), "{startup}");

    // Change the config, then reload: the saved configuration returns.
    run(&mut ws, "router0", &mut s, "conf t");
    run(&mut ws, "router0", &mut s, "hostname BROKEN");
    run(&mut ws, "router0", &mut s, "end");
    let out = run(&mut ws, "router0", &mut s, "reload");
    assert!(out.contains("Reloading"), "{out}");
    let d = ws.devices.iter().find(|d| d.id == "router0").unwrap();
    assert_eq!(d.name, "Router0", "reload restored the saved name");
}

#[test]
fn vlan_config_and_show() {
    let mut ws = Workspace::new();
    let mut s = session();
    run(&mut ws, "switch0", &mut s, "en");
    run(&mut ws, "switch0", &mut s, "conf t");
    assert!(run(&mut ws, "switch0", &mut s, "vlan 20 SALES").is_empty());
    run(&mut ws, "switch0", &mut s, "int fa0/3");
    assert!(run(&mut ws, "switch0", &mut s, "switchport access vlan 20").is_empty());
    run(&mut ws, "switch0", &mut s, "end");

    let out = run(&mut ws, "switch0", &mut s, "show vlan brief");
    assert!(out.contains("SALES"), "{out}");
    assert!(out.contains("FastEthernet0/3"), "{out}");
    let ports = run(&mut ws, "switch0", &mut s, "show interfaces switchport");
    assert!(ports.contains("Access Mode VLAN: 20 (SALES)"), "{ports}");

    run(&mut ws, "switch0", &mut s, "conf t");
    run(&mut ws, "switch0", &mut s, "int fa0/4");
    let err = run(&mut ws, "switch0", &mut s, "switchport access vlan 99");
    assert!(err.contains("does not exist"), "{err}");
}

#[test]
fn helper_address_config_and_show() {
    let mut ws = Workspace::new();
    let mut s = session();
    run(&mut ws, "router0", &mut s, "en");
    run(&mut ws, "router0", &mut s, "conf t");
    run(&mut ws, "router0", &mut s, "int g0/0");
    let out = run(&mut ws, "router0", &mut s, "ip helper-address 192.168.2.20");
    assert!(out.is_empty(), "{out}");
    run(&mut ws, "router0", &mut s, "end");
    let show = run(&mut ws, "router0", &mut s, "show ip helper-address");
    assert!(show.contains("192.168.2.20"), "{show}");

    run(&mut ws, "router0", &mut s, "conf t");
    run(&mut ws, "router0", &mut s, "int g0/0");
    run(&mut ws, "router0", &mut s, "no ip helper-address");
    let show = run(&mut ws, "router0", &mut s, "do show ip helper-address");
    assert!(show.contains("No helper"), "{show}");
}

#[test]
fn rejects_bad_input_in_each_mode() {
    let mut ws = Workspace::new();
    let mut s = session();
    assert!(run(&mut ws, "pc0", &mut s, "show version").contains("Invalid input"));

    run(&mut ws, "router0", &mut s, "enable");
    run(&mut ws, "router0", &mut s, "configure terminal");
    assert!(run(&mut ws, "router0", &mut s, "interface g9/9").contains("Invalid interface"));

    run(&mut ws, "router0", &mut s, "interface g0/0");
    assert!(run(&mut ws, "router0", &mut s, "ip address 192.168.1.1 bad").contains("Invalid mask"));
}

#[test]
fn configures_and_shows_static_routes() {
    let mut ws = Workspace::new();
    let mut s = session();

    run(&mut ws, "router0", &mut s, "enable");
    run(&mut ws, "router0", &mut s, "configure terminal");
    assert_eq!(s.mode, Mode::Config);
    run(&mut ws, "router0", &mut s, "interface g0/0");
    run(&mut ws, "router0", &mut s, "ip address 192.168.1.1 255.255.255.0");
    run(&mut ws, "router0", &mut s, "no shutdown");
    run(&mut ws, "router0", &mut s, "exit");
    let added = run(
        &mut ws,
        "router0",
        &mut s,
        "ip route 10.0.0.0 255.255.255.0 192.168.1.2",
    );
    assert!(added.is_empty(), "{added}");

    let routes = run(&mut ws, "router0", &mut s, "show ip route");
    assert!(routes.contains("10.0.0.0"), "{routes}");
    assert!(routes.contains("192.168.1.2"), "{routes}");

    run(&mut ws, "router0", &mut s, "end");
    let again = run(&mut ws, "router0", &mut s, "show ip route");
    assert!(again.contains("10.0.0.0"), "{again}");
}

#[test]
fn rejects_malformed_static_routes() {
    let mut ws = Workspace::new();
    let mut s = session();
    run(&mut ws, "router0", &mut s, "enable");
    run(&mut ws, "router0", &mut s, "configure terminal");

    let incomplete = run(&mut ws, "router0", &mut s, "ip route 10.0.0.0");
    assert!(incomplete.contains("Incomplete"), "{incomplete}");

    let bad_mask = run(&mut ws, "router0", &mut s, "ip route 10.0.0.0 bad 192.168.1.2");
    assert!(bad_mask.contains("Invalid mask"), "{bad_mask}");

    let bad_dest = run(&mut ws, "router0", &mut s, "ip route 300.1.1.1 255.0.0.0 192.168.1.2");
    assert!(bad_dest.contains("Invalid address"), "{bad_dest}");
}

#[test]
fn shows_interface_details_after_configuration() {
    let mut ws = Workspace::new();
    let mut s = session();
    run(&mut ws, "router0", &mut s, "enable");
    run(&mut ws, "router0", &mut s, "configure terminal");
    run(&mut ws, "router0", &mut s, "interface g0/0");
    run(&mut ws, "router0", &mut s, "ip address 192.168.1.1 255.255.255.0");
    run(&mut ws, "router0", &mut s, "no shutdown");
    run(&mut ws, "router0", &mut s, "end");

    let out = run(&mut ws, "router0", &mut s, "show interfaces g0/0");
    assert!(out.contains("GigabitEthernet0/0 is up, line protocol is up"), "{out}");
    assert!(out.contains("Internet address is 192.168.1.1/24"), "{out}");
    assert!(out.contains("MTU 1500 bytes"), "{out}");
    assert!(out.contains("BW 1000000 Kbit"), "{out}");
    assert!(out.contains("Full-duplex"), "{out}");

    let ip = run(&mut ws, "router0", &mut s, "show ip interface g0/0");
    assert!(ip.contains("Internet address is 192.168.1.1/24"), "{ip}");
    assert!(ip.contains("MTU is 1500 bytes"), "{ip}");
    assert!(ip.contains("Broadcast address is 192.168.1.255"), "{ip}");
}

#[test]
fn saves_configuration_and_shows_clock() {
    let mut ws = Workspace::new();
    let mut s = session();
    run(&mut ws, "router0", &mut s, "enable");
    assert_eq!(
        run(&mut ws, "router0", &mut s, "write memory"),
        "Building configuration...\n[OK]\n"
    );
    assert_eq!(
        run(&mut ws, "router0", &mut s, "copy running-config startup-config"),
        "Building configuration...\n[OK]\n"
    );
    assert_eq!(
        run(&mut ws, "router0", &mut s, "clock"),
        "*0:00:00.0 UTC Mon Mar 1 1993\n"
    );
}

#[test]
fn prompt_changes_with_mode() {
    let mut ws = Workspace::new();
    let mut s = session();
    assert_eq!(prompt(&ws, "router0", &s), "Router0>");
    run(&mut ws, "router0", &mut s, "enable");
    assert_eq!(prompt(&ws, "router0", &s), "Router0#");
    run(&mut ws, "router0", &mut s, "configure terminal");
    run(&mut ws, "router0", &mut s, "interface g0/0");
    assert_eq!(prompt(&ws, "router0", &s), "Router0(config-if)#");
}

#[test]
fn no_ip_route_removes_the_static_route() {
    let mut ws = Workspace::new();
    let mut s = session();
    run(&mut ws, "router0", &mut s, "enable");
    run(&mut ws, "router0", &mut s, "configure terminal");
    run(
        &mut ws,
        "router0",
        &mut s,
        "ip route 10.0.0.0 255.255.255.0 192.168.1.2",
    );

    let removed = run(
        &mut ws,
        "router0",
        &mut s,
        "no ip route 10.0.0.0 255.255.255.0 192.168.1.2",
    );
    assert!(
        removed.contains("Removed static route 10.0.0.0/24 via 192.168.1.2"),
        "{removed}"
    );
    let routes = run(&mut ws, "router0", &mut s, "do show ip route");
    assert!(!routes.contains("10.0.0.0"), "route still present: {routes}");

    let again = run(
        &mut ws,
        "router0",
        &mut s,
        "no ip route 10.0.0.0 255.255.255.0 192.168.1.2",
    );
    assert!(again.contains("No matching static route"), "{again}");
}

#[test]
fn no_hostname_restores_the_default_name() {
    let mut ws = Workspace::new();
    let mut s = session();
    run(&mut ws, "router0", &mut s, "enable");
    run(&mut ws, "router0", &mut s, "configure terminal");
    run(&mut ws, "router0", &mut s, "hostname EDGE");
    assert_eq!(prompt(&ws, "router0", &s), "EDGE(config)#");

    run(&mut ws, "router0", &mut s, "no hostname");
    let d = ws.devices.iter().find(|d| d.id == "router0").unwrap();
    assert_eq!(d.name, "Router0");
    assert_eq!(prompt(&ws, "router0", &s), "Router0(config)#");
}

#[test]
fn no_banner_motd_removes_the_banner() {
    let mut ws = Workspace::new();
    let mut s = session();
    run(&mut ws, "router0", &mut s, "enable");
    run(&mut ws, "router0", &mut s, "configure terminal");
    run(&mut ws, "router0", &mut s, "banner motd #authorised access only#");
    assert!(run(&mut ws, "router0", &mut s, "show run").contains("banner motd"));

    run(&mut ws, "router0", &mut s, "no banner motd");
    assert!(!ws.banners.contains_key("router0"));
    let cfg = run(&mut ws, "router0", &mut s, "show run");
    assert!(!cfg.contains("banner motd"), "{cfg}");
}

#[test]
fn no_password_removes_the_line_password() {
    let mut ws = Workspace::new();
    let mut s = session();
    run(&mut ws, "router0", &mut s, "enable");
    run(&mut ws, "router0", &mut s, "configure terminal");
    run(&mut ws, "router0", &mut s, "line con 0");
    assert_eq!(s.mode, Mode::Line);
    run(&mut ws, "router0", &mut s, "password cisco");
    assert_eq!(ws.line_passwords.get("router0").map(String::as_str), Some("cisco"));

    let out = run(&mut ws, "router0", &mut s, "no password");
    assert!(out.is_empty(), "{out}");
    assert!(!ws.line_passwords.contains_key("router0"));
    run(&mut ws, "router0", &mut s, "end");
    let cfg = run(&mut ws, "router0", &mut s, "show run");
    assert!(!cfg.contains("password cisco"), "{cfg}");
}

#[test]
fn unknown_no_forms_keep_the_ios_error() {
    let mut ws = Workspace::new();
    let mut s = session();
    run(&mut ws, "router0", &mut s, "enable");
    run(&mut ws, "router0", &mut s, "configure terminal");

    let out = run(&mut ws, "router0", &mut s, "no ip domain-lookup");
    assert!(out.contains("% Invalid input detected at '^' marker."), "{out}");
    assert!(out.contains("no ip domain-lookup"), "{out}");

    let bare = run(&mut ws, "router0", &mut s, "no");
    assert!(bare.contains("Invalid input"), "{bare}");
}

#[test]
fn help_lists_the_commands_that_exist() {
    let config = help(Mode::Config);
    for expected in [
        "ip route DEST MASK NH",
        "no ip route DEST MASK NH",
        "no hostname",
        "no banner motd",
        "hostname NAME",
    ] {
        assert!(
            config.lines().any(|l| l.trim_start().starts_with(expected)),
            "missing {expected}: {config}"
        );
    }

    let line = help(Mode::Line);
    assert!(line.contains("password PASSWORD"), "{line}");
    assert!(line.contains("no password"), "{line}");
    assert!(help(Mode::Priv).contains("show running-config"));
    assert!(help(Mode::User).contains("enable"));
    assert!(help(Mode::Iface).contains("no shutdown"));
}

#[test]
fn completes_commands_and_interfaces() {
    let ws = Workspace::new();
    let priv_s = Session { mode: Mode::Priv, iface: None, router: None };

    let sh = complete(&ws, "router0", &priv_s, "sh");
    assert!(sh.contains(&"show running-config".to_string()), "{sh:?}");
    assert!(sh.contains(&"show version".to_string()), "{sh:?}");
    assert!(sh.contains(&"show ip route".to_string()), "{sh:?}");
    assert!(!sh.contains(&"write memory".to_string()), "{sh:?}");

    let show = complete(&ws, "router0", &priv_s, "show ");
    assert!(show.contains(&"show startup-config".to_string()), "{show:?}");
    assert!(!show.contains(&"write memory".to_string()), "{show:?}");

    let ip = complete(&ws, "router0", &priv_s, "show ip ");
    assert_eq!(ip, vec!["show ip interface brief", "show ip route"]);

    let cfg = Session { mode: Mode::Config, iface: None, router: None };
    let gi = complete(&ws, "router0", &cfg, "int g");
    assert!(gi.contains(&"GigabitEthernet0/0".to_string()), "{gi:?}");
    assert!(!gi.iter().any(|c| c.starts_with("Fast")), "{gi:?}");

    let ports = complete(&ws, "router0", &cfg, "interface ");
    assert!(ports.contains(&"Serial0/0/0".to_string()), "{ports:?}");
    let mut sorted = ports.clone();
    sorted.sort();
    sorted.dedup();
    assert_eq!(ports, sorted, "completions must be sorted and unique");
}

mod expand_tests {
    use super::*;
    use crate::workspace::Workspace;

    #[test]
    fn expands_short_interface_names() {
        let ws = Workspace::new();
        let d = ws.devices.iter().find(|d| d.id == "router0").unwrap();
        let ports: Vec<String> = d.ports.iter().map(|p| p.name.clone()).collect();
        assert!(!ports.is_empty(), "router has no ports: {:?}", ws.devices.iter().map(|d| (&d.id, &d.kind)).collect::<Vec<_>>());
        assert_eq!(expand_iface("g0/0", &ports).as_deref(), Some("GigabitEthernet0/0"));
        assert_eq!(expand_iface("Gi0/1", &ports).as_deref(), Some("GigabitEthernet0/1"));
        assert_eq!(expand_iface("g9/9", &ports), None);
    }
}

#[test]
fn no_vlan_deletes_a_vlan() {
    let mut ws = Workspace::new();
    let mut s = Session::default();
    for cmd in ["enable", "configure terminal", "vlan 10 sales", "no vlan 10"] {
        run(&mut ws, "switch0", &mut s, cmd);
    }
    assert!(!ws.vlan_exists("switch0", 10));
}
