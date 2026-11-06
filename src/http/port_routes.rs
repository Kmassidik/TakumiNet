//! Per-port reads and toggles: the ports list and the up/down switch.

use super::*;

/// Returns `None` when this group does not own the route.
pub(super) fn route(ctx: &Ctx, method: &str, path: &str, query: &str) -> Option<(&'static str, Vec<u8>)> {
    match (method, path) {
        ("GET", "/api/devices/ports") => Some(handle_devices_ports(ctx, query)),
        ("POST", "/api/devices/port") => Some(handle_devices_port(ctx, query)),
        ("POST", "/api/devices/linkspeed") => Some(handle_link_speed(ctx, query)),
        ("GET", "/api/devices/poe") => Some(handle_poe_status(ctx, query)),
        ("POST", "/api/devices/poe") => Some(handle_poe_set(ctx, query)),
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
            let collisions = if dev.kind == "hub" {
                format!(",\"collisions\":{}", ws.hub_collisions(&id))
            } else {
                String::new()
            };
            let ports = dev
                .ports
                .iter()
                .map(|p| {
                    let ip = match p.ip {
                        Some(a) => json_str(&crate::model::ipv4_string(a)),
                        None => "null".to_string(),
                    };
                    let err = ws
                        .errdisabled_reason(&id, &p.name)
                        .map(json_str)
                        .unwrap_or_else(|| "null".to_string());
                    let errors = ws.crc_errors_for(&id, &p.name);
                    let cable = ws
                        .links
                        .iter()
                        .find_map(|l| {
                            let names: Vec<String> = dev.ports.iter().map(|p| p.name.clone()).collect();
                            let matches = |side: &str, raw: &str| {
                                side == id
                                    && crate::cli::expand_iface(raw, &names)
                                        .unwrap_or_else(|| raw.to_string())
                                        == p.name
                            };
                            if matches(&l.a, &l.a_port) || matches(&l.b, &l.b_port) {
                                Some(l.kind.clone())
                            } else {
                                None
                            }
                        });
                    let media = if p.name.starts_with("Serial") {
                        "serial"
                    } else if p.name.starts_with("Console") {
                        "console"
                    } else if cable.as_deref() == Some("eFiber") {
                        "sfp"
                    } else if p.name.starts_with("FastEthernet") || p.name.starts_with("GigabitEthernet") {
                        "rj45"
                    } else {
                        "other"
                    };
                    let eth = media == "rj45" || media == "sfp";
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
                    let has_peer = peer != "null";
                    let no_speed = eth && has_peer && ws.negotiated(&id, &p.name).is_none();
                    let link_up = p.up && has_peer && !no_speed;
                    let pair = crate::workspace::mdi::mdi_port(&dev.kind);
                    let pair_fields = if media == "rj45" {
                        format!(
                            ",\"mdi\":{},\"autoMdix\":{}",
                            json_str(match pair.role {
                                crate::workspace::MdiRole::Mdi => "mdi",
                                crate::workspace::MdiRole::Mdix => "mdi-x",
                            }),
                            pair.auto
                        )
                    } else {
                        String::new()
                    };
                    let edge = format!(
                        ",\"media\":{},\"cable\":{},\"linkUp\":{}{}",
                        json_str(media),
                        cable.as_ref().map_or_else(|| "null".to_string(), |c| json_str(c)),
                        link_up,
                        pair_fields
                    );
                    format!(
                        "{{\"name\":{},\"ip\":{},\"prefix\":{},\"up\":{},\"peer\":{}{},\"errdisabled\":{},\"errors\":{}{}}}",
                        json_str(&p.name),
                        ip,
                        p.prefix,
                        p.up,
                        peer,
                        link_fields(&ws, &id, &p.name),
                        err,
                        errors,
                        edge
                    )
                })
                .collect::<Vec<_>>()
                .join(",");
            (json, format!("{{\"ports\":[{ports}]{collisions}}}").into_bytes())
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

/// Speed and duplex fields for an Ethernet port; empty for serial and other media.
fn link_fields(ws: &crate::workspace::Workspace, id: &str, port: &str) -> String {
    if !(port.starts_with("FastEthernet") || port.starts_with("GigabitEthernet")) {
        return String::new();
    }
    let setting = ws.link_setting(id, port);
    let speed = setting.speed.map_or("auto".to_string(), |s| s.to_string());
    let duplex = match setting.full {
        Some(true) => "full",
        Some(false) => "half",
        None => "auto",
    };
    let (link, fault) = match ws.negotiated(id, port) {
        Some(n) => (
            format!("{} Mb/s, {} duplex", n.speed, if n.full { "full" } else { "half" }),
            if n.duplex_mismatch() { "duplex" } else { "" },
        ),
        None if ws.peer_port(id, port).is_some() => ("no link".to_string(), "speed"),
        None => (String::new(), ""),
    };
    format!(
        ",\"eth\":true,\"speed\":{},\"duplex\":{},\"link\":{},\"fault\":{}",
        json_str(&speed),
        json_str(duplex),
        json_str(&link),
        json_str(fault)
    )
}

/// Set a port's fixed speed and duplex; `auto` puts a field back to negotiating.
fn handle_link_speed(ctx: &Ctx, query: &str) -> (&'static str, Vec<u8>) {
    let json = "application/json";
    let id = query_value(query, "id").unwrap_or_default();
    let port = query_value(query, "port").unwrap_or_default();
    let speed = query_value(query, "speed").unwrap_or_else(|| "auto".into());
    let duplex = query_value(query, "duplex").unwrap_or_else(|| "auto".into());
    let (out, _) = apply(ctx, |ws| {
        let speed = match speed.as_str() {
            "auto" => None,
            other => Some(other.parse::<u32>().map_err(|_| "speed must be 10, 100, 1000 or auto".to_string())?),
        };
        let full = match duplex.as_str() {
            "auto" => None,
            "full" => Some(true),
            "half" => Some(false),
            _ => return Err("duplex must be half, full or auto".to_string()),
        };
        ws.set_link_speed(&id, &port, speed)?;
        ws.set_link_duplex(&id, &port, full)
    });
    (json, out.into_bytes())
}

/// Whether a device can run on its cable, whether it does, and what it gets.
fn handle_poe_status(ctx: &Ctx, query: &str) -> (&'static str, Vec<u8>) {
    let id = query_value(query, "id").unwrap_or_default();
    let ws = ctx.ws.lock().unwrap_or_else(|e| e.into_inner());
    let Some(device) = ws.devices.iter().find(|d| d.id == id) else {
        return ("application/json", json_error("no such device").into_bytes());
    };
    let draw = crate::workspace::poe_draw(&device.kind);
    let on = ws.poe.devices.contains(&id);
    let reason = ws.poe_denied(&id).unwrap_or("");
    let body = format!(
        "{{\"capable\":{},\"on\":{},\"watts\":{},\"powered\":{},\"reason\":{}}}",
        draw.is_some(),
        on,
        draw.unwrap_or(0.0),
        on && reason.is_empty(),
        json_str(reason)
    );
    ("application/json", body.into_bytes())
}

/// Tick or untick "powered by its cable" for one device.
fn handle_poe_set(ctx: &Ctx, query: &str) -> (&'static str, Vec<u8>) {
    let id = query_value(query, "id").unwrap_or_default();
    let on = matches!(query_value(query, "on").as_deref(), Some("1") | Some("true"));
    let (out, _) = apply(ctx, |ws| ws.set_poe_device(&id, on));
    ("application/json", out.into_bytes())
}
