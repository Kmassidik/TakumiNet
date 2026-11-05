use super::super::*;
use crate::cmd::run as cmd_run;

fn pair() -> (Workspace, String, String) {
    let mut ws = Workspace::empty();
    ws.add("PC", 100.0, 100.0).unwrap();
    ws.add("PC", 400.0, 100.0).unwrap();
    ws.set_ip("pc0", "10.99.0.10", 24).unwrap();
    ws.set_ip("pc1", "10.99.0.10", 24).unwrap();
    (ws, "pc0".into(), "pc1".into())
}

#[test]
fn both_hosts_report_the_duplicate_and_it_clears() {
    let (mut ws, a, b) = pair();
    let warning = "Duplicate IP address 10.99.0.10 also used by PC1.";
    assert_eq!(ws.duplicate_ip_warning(&a).as_deref(), Some(warning));
    assert_eq!(ws.duplicate_ip_warning(&b).as_deref(), Some("Duplicate IP address 10.99.0.10 also used by PC0."));
    ws.set_ip(&b, "10.99.0.11", 24).unwrap();
    assert!(ws.duplicate_ip_warning(&a).is_none());
    assert!(ws.duplicate_ip_warning(&b).is_none());
}

#[test]
fn ipconfig_and_ip_addr_print_the_warning() {
    let (mut ws, a, _b) = pair();
    let out = cmd_run(&mut ws, &a, "ipconfig");
    assert!(out.contains("Duplicate IP address 10.99.0.10 also used by PC1."), "{out}");
    let server = ws.add("Server", 600.0, 300.0).unwrap();
    ws.set_ip(&server, "10.99.0.10", 24).unwrap();
    let out = cmd_run(&mut ws, &server, "ip addr");
    assert!(out.contains("Warning: Duplicate IP address"), "{out}");
}

#[test]
fn the_workspace_json_carries_the_warning_for_windows_and_dialogs() {
    let (ws, a, _b) = pair();
    let json = ws.json();
    assert!(json.contains("\"warning\":\"Duplicate IP address 10.99.0.10"), "{json}");
    let dev = ws.devices.iter().find(|d| d.id == a).unwrap();
    assert_eq!(dev.name, "PC0");
}
