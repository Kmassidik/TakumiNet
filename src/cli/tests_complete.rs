use super::*;
use crate::workspace::Workspace;

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
