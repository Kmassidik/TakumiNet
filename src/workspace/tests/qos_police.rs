use super::super::*;
use crate::cli::{run as cli_run, Session};

fn switch_ports(ws: &Workspace) -> Vec<(String, String)> {
    let mut out = Vec::new();
    for link in &ws.links {
        for (id, port) in [(&link.a, &link.a_port), (&link.b, &link.b_port)] {
            if ws.devices.iter().any(|d| d.id == *id && d.kind == "switch") {
                out.push((id.clone(), port.clone()));
            }
        }
    }
    out
}

#[test]
fn the_cli_marks_and_polices_an_interface() {
    let mut ws = Workspace::new();
    let ports = switch_ports(&ws);
    let (sw, port) = ports.first().expect("switch port");
    let mut s = Session::default();
    for line in ["enable", "configure terminal", &format!("interface {port}"), "qos trust dscp", "qos cos 5", "qos police 20", "end"] {
        cli_run(&mut ws, sw, &mut s, line);
    }
    let table = cli_run(&mut ws, sw, &mut s, "show qos");
    assert!(table.contains("dscp"), "{table}");
    assert!(table.contains('5') && table.contains("20 Mbit/s"), "{table}");
    assert_eq!(ws.qos_port(sw, port).dscp, 40);
}

#[test]
fn a_policer_caps_the_flow_load() {
    let mut ws = Workspace::new();
    for (sw, port) in switch_ports(&ws) {
        ws.set_qos_port(&sw, &port, |q| q.police_mbit = Some(10));
    }
    ws.flow_set("pc0", "pc1", 100).unwrap();
    let loads = ws.link_loads();
    assert!(loads.iter().all(|l| l.mbit <= 10.01), "{:?}", loads.iter().map(|l| l.mbit).collect::<Vec<_>>());
    assert!(loads.iter().any(|l| (l.mbit - 10.0).abs() < 0.01));
}

#[test]
fn clearing_the_policer_restores_the_flow_rate() {
    let mut ws = Workspace::new();
    for (sw, port) in switch_ports(&ws) {
        ws.set_qos_port(&sw, &port, |q| q.police_mbit = Some(5));
    }
    ws.flow_set("pc0", "pc1", 100).unwrap();
    assert_eq!(ws.flow_policed_mbit("pc0", "pc1", 100), (5.0, 95.0));
    for (sw, port) in switch_ports(&ws) {
        ws.clear_qos_port(&sw, &port);
    }
    assert_eq!(ws.flow_policed_mbit("pc0", "pc1", 100), (100.0, 0.0));
}

#[test]
fn qos_survives_a_save_and_open_round_trip() {
    let mut ws = Workspace::new();
    let ports = switch_ports(&ws);
    let (sw, port) = ports.first().expect("switch port");
    ws.set_qos_port(sw, port, |q| { q.trust_cos = false; q.cos = 3; q.police_mbit = Some(40); });
    let back = Workspace::from_tnet(&ws.to_tnet()).unwrap();
    let q = back.qos_port(sw, port);
    assert_eq!((q.trust_cos, q.cos, q.police_mbit, q.dscp), (false, 3, Some(40), 24));
}
