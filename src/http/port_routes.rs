//! Per-port reads and toggles: the ports list and the up/down switch.

use super::*;

/// Returns `None` when this group does not own the route.
pub(super) fn route(ctx: &Ctx, method: &str, path: &str, query: &str) -> Option<(&'static str, Vec<u8>)> {
    match (method, path) {
        ("GET", "/api/devices/ports") => Some(handle_devices_ports(ctx, query)),
        ("POST", "/api/devices/port") => Some(handle_devices_port(ctx, query)),
        _ => None,
    }
}

fn handle_devices_ports(ctx: &Ctx, query: &str) -> (&'static str, Vec<u8>) {
    let json = "application/json";
    let id = query_value(query, "id").unwrap_or_default();
    let ws = ctx.ws.lock().unwrap_or_else(|e| e.into_inner());
    match ws.devices.iter().find(|d| d.id == id) {
        None => (json, json_error("no such device").into_bytes()),
        Some(dev) => {
            let ports = dev
                .ports
                .iter()
                .map(|p| {
                    let ip = match p.ip {
                        Some(a) => json_str(&crate::model::ipv4_string(a)),
                        None => "null".to_string(),
                    };
                    let peer = match ws.peer_port(&id, &p.name) {
                        Some((peer_id, peer_port)) => {
                            let peer_name = ws
                                .devices
                                .iter()
                                .find(|d| d.id == peer_id)
                                .map(|d| d.name.clone())
                                .unwrap_or_else(|| peer_id.clone());
                            format!(
                                "{{\"id\":{},\"name\":{},\"port\":{}}}",
                                json_str(&peer_id),
                                json_str(&peer_name),
                                json_str(&peer_port)
                            )
                        }
                        None => "null".to_string(),
                    };
                    format!(
                        "{{\"name\":{},\"ip\":{},\"prefix\":{},\"up\":{},\"peer\":{}}}",
                        json_str(&p.name),
                        ip,
                        p.prefix,
                        p.up,
                        peer
                    )
                })
                .collect::<Vec<_>>()
                .join(",");
            (json, format!("{{\"ports\":[{ports}]}}").into_bytes())
        }
    }
}

/// Bring one interface administratively up or down.
fn handle_devices_port(ctx: &Ctx, query: &str) -> (&'static str, Vec<u8>) {
    let json = "application/json";
    let id = query_value(query, "id").unwrap_or_default();
    let port = query_value(query, "port").unwrap_or_default();
    let up = matches!(query_value(query, "up").as_deref(), Some("1") | Some("true"));
    let (out, _) = apply(ctx, |ws| {
        if ws.set_port_up(&id, &port, up) {
            Ok(())
        } else {
            Err("no such interface".into())
        }
    });
    (json, out.into_bytes())
}
