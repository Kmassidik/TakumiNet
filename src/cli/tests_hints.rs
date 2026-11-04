use super::*;
use crate::workspace::Workspace;

const PRIV_HINT: &str = "Takumi: this command works in privileged mode. Type 'enable' first.";
const CONFIG_HINT: &str =
    "Takumi: configuration commands live in config mode. Type 'configure terminal' first.";

#[test]
fn user_mode_show_hints_at_privileged_mode() {
    let mut ws = Workspace::new();
    let mut s = Session::default();
    for line in ["show vlan brief", "sh ip int br", "show running-config", "conf t"] {
        let out = run(&mut ws, "switch0", &mut s, line);
        assert_eq!(s.mode, Mode::User, "{line} must not change the mode");
        assert!(out.contains("% Invalid input detected"), "{line}: {out}");
        assert!(out.contains(PRIV_HINT), "{line}: {out}");
        assert_eq!(out.matches("Takumi:").count(), 1, "{line}: {out}");
    }
}

#[test]
fn garbage_gets_no_hint_in_any_mode() {
    let mut ws = Workspace::new();
    let mut s = Session::default();
    let out = run(&mut ws, "switch0", &mut s, "frobnicate the uplink");
    assert!(out.contains("% Invalid input detected"), "{out}");
    assert!(!out.contains("Takumi:"), "{out}");

    let out = run(&mut ws, "switch0", &mut s, "show flux capacitor");
    assert!(!out.contains("Takumi:"), "unknown show stays hintless: {out}");

    run(&mut ws, "switch0", &mut s, "enable");
    for line in ["frobnicate the uplink", "no garbage here"] {
        let out = run(&mut ws, "switch0", &mut s, line);
        assert!(out.contains("% Invalid input detected"), "{line}: {out}");
        assert!(!out.contains("Takumi:"), "{line}: {out}");
    }
}

#[test]
fn config_vocabulary_in_privileged_mode_hints_at_config_mode() {
    let mut ws = Workspace::new();
    let mut s = Session::default();
    run(&mut ws, "switch0", &mut s, "enable");
    for line in ["vlan 10", "hostname Core1", "interface g0/1", "ip route 10.0.0.0 255.0.0.0 1.1.1.1"] {
        let out = run(&mut ws, "switch0", &mut s, line);
        assert_eq!(s.mode, Mode::Priv, "{line} must not change the mode");
        assert!(out.contains("% Invalid input detected"), "{line}: {out}");
        assert!(out.contains(CONFIG_HINT), "{line}: {out}");
        assert_eq!(out.matches("Takumi:").count(), 1, "{line}: {out}");
    }
}

#[test]
fn the_same_commands_work_hintless_in_their_own_mode() {
    let mut ws = Workspace::new();
    let mut s = Session::default();
    run(&mut ws, "switch0", &mut s, "enable");

    let out = run(&mut ws, "switch0", &mut s, "show vlan brief");
    assert!(!out.contains("% Invalid input detected"), "{out}");
    assert!(!out.contains("Takumi:"), "{out}");

    run(&mut ws, "switch0", &mut s, "configure terminal");
    assert_eq!(s.mode, Mode::Config);
    let out = run(&mut ws, "switch0", &mut s, "vlan 10 sales");
    assert!(!out.contains("Takumi:"), "{out}");
    assert!(ws.vlan_exists("switch0", 10));
}

#[test]
fn the_probe_never_mutates_the_workspace() {
    let mut ws = Workspace::new();
    let mut s = Session::default();
    let snapshot = |ws: &Workspace| -> Vec<(String, Option<u32>)> {
        ws.devices.iter().map(|d| (d.name.clone(), d.ip)).collect()
    };
    let before = snapshot(&ws);
    run(&mut ws, "switch0", &mut s, "show vlan brief");
    run(&mut ws, "switch0", &mut s, "write memory");
    assert_eq!(before, snapshot(&ws), "a rejected line must not change state");
    assert_eq!(s.mode, Mode::User);
}
