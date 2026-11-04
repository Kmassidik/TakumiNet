use super::*;

/// Returns `None` when this group does not own the route.
pub(super) fn route(ctx: &Ctx, method: &str, path: &str, query: &str) -> Option<(&'static str, Vec<u8>)> {
    match (method, path) {
        ("GET", "/api/workspace") => Some(handle_workspace(ctx)),
        ("POST", "/api/devices") => Some(handle_devices(ctx, query)),
        ("POST", "/api/devices/move") => Some(handle_devices_move(ctx, query)),
        ("POST", "/api/devices/delete") => Some(handle_devices_delete(ctx, query)),
        ("POST", "/api/devices/duplicate") => Some(handle_devices_duplicate(ctx, query)),
        ("POST", "/api/devices/rename") => Some(handle_devices_rename(ctx, query)),
        ("POST", "/api/devices/ip") => Some(handle_devices_ip(ctx, query)),
        ("POST", "/api/devices/ipv6") => Some(handle_devices_ipv6(ctx, query)),
        ("POST", "/api/devices/dot1x") => Some(handle_devices_dot1x(ctx, query)),
        ("POST", "/api/devices/sharedgw") => Some(handle_shared_gateway(ctx, query)),
        ("POST", "/api/groups/collapse") => Some(handle_collapse(ctx, query)),
        ("POST", "/api/groups/expand") => Some(handle_expand(ctx, query)),
        ("POST", "/api/devices/dhcp/reserve") => Some(handle_devices_dhcp_reserve(ctx, query)),
        ("POST", "/api/devices/dhcp/helper") => Some(handle_devices_dhcp_helper(ctx, query)),
        ("POST", "/api/ipv6/dhcp") => Some(handle_ipv6_dhcp(ctx, query)),
        ("POST", "/api/devices/inspect") => Some(handle_devices_inspect(ctx, query)),
        ("POST", "/api/devices/ips") => Some(handle_devices_ips(ctx, query)),
        ("POST", "/api/devices/power") => Some(handle_devices_power(ctx, query)),
        ("POST", "/api/devices/module") => Some(handle_devices_module(ctx, query)),
        ("POST", "/api/devices/dhcp") => Some(handle_devices_dhcp(ctx, query)),
        ("POST", "/api/dhcp/acquire") => Some(handle_dhcp_acquire(ctx, query)),
        ("POST", "/api/bus") => Some(handle_bus(ctx, query)),
        ("POST", "/api/links") => Some(handle_links(ctx, query)),
        ("POST", "/api/links/delete") => Some(handle_links_delete(ctx, query)),
        ("POST", "/api/pdu") => Some(handle_pdu(ctx, query)),
        ("POST", "/api/sim/reset") => Some(handle_sim_reset(ctx)),
        ("POST", "/api/sim/tick") => Some(handle_sim_tick(ctx, query)),
        ("POST", "/api/demo") => Some(handle_demo(ctx)),
        ("POST", "/api/undo") => Some(handle_undo(ctx)),
        ("POST", "/api/redo") => Some(handle_redo(ctx)),
        ("POST", "/api/reset") => Some(handle_reset(ctx)),
        ("POST", "/api/mesh") => Some(handle_mesh(ctx, query)),
        _ => None,
    }
}

fn handle_workspace(ctx: &Ctx) -> (&'static str, Vec<u8>) {
    let json = "application/json";
    let ws = ctx.ws.lock().unwrap_or_else(|e| e.into_inner());
    (json, ws.json().into_bytes())
}

fn handle_devices(ctx: &Ctx, query: &str) -> (&'static str, Vec<u8>) {
    let json = "application/json";
    let model = query_value(query, "model").unwrap_or_default();
    let x = query_value(query, "x").and_then(|v| v.parse::<f32>().ok());
    let y = query_value(query, "y").and_then(|v| v.parse::<f32>().ok());
    let name = query_value(query, "name");
    match (x, y) {
        (Some(x), Some(y)) => {
            let (out, _) = apply(ctx, |ws| {
                let id = ws.add(&model, x, y).ok_or("unknown model")?;
                if let Some(n) = name.as_deref().filter(|n| !n.trim().is_empty()) {
                    ws.rename(&id, n);
                }
                Ok(())
            });
            (json, out.into_bytes())
        }
        _ => (json, json_error("missing x or y").into_bytes()),
    }
}

fn handle_devices_move(ctx: &Ctx, query: &str) -> (&'static str, Vec<u8>) {
    let json = "application/json";
    let id = query_value(query, "id").unwrap_or_default();
    let x = query_value(query, "x").and_then(|v| v.parse::<f32>().ok());
    let y = query_value(query, "y").and_then(|v| v.parse::<f32>().ok());
    match (x, y) {
        (Some(x), Some(y)) => {
            let (out, _) = apply(ctx, |ws| {
                if ws.mv(&id, x, y) { Ok(()) } else { Err("move failed".into()) }
            });
            (json, out.into_bytes())
        }
        _ => (json, json_error("missing x or y").into_bytes()),
    }
}

fn handle_devices_delete(ctx: &Ctx, query: &str) -> (&'static str, Vec<u8>) {
    let json = "application/json";
    let id = query_value(query, "id").unwrap_or_default();
    let (out, _) = apply(ctx, |ws| {
        if ws.remove(&id) { Ok(()) } else { Err("no such device".into()) }
    });
    (json, out.into_bytes())
}

fn handle_devices_duplicate(ctx: &Ctx, query: &str) -> (&'static str, Vec<u8>) {
    let json = "application/json";
    let id = query_value(query, "id").unwrap_or_default();
    let (out, _) = apply(ctx, |ws| {
        ws.duplicate(&id).map(|_| ()).ok_or_else(|| "cannot duplicate".to_string())
    });
    (json, out.into_bytes())
}

fn handle_devices_rename(ctx: &Ctx, query: &str) -> (&'static str, Vec<u8>) {
    let json = "application/json";
    let id = query_value(query, "id").unwrap_or_default();
    let name = query_value(query, "name").unwrap_or_default();
    let (out, _) = apply(ctx, |ws| {
        if ws.rename(&id, &name) { Ok(()) } else { Err("no such device".into()) }
    });
    (json, out.into_bytes())
}

fn handle_devices_ip(ctx: &Ctx, query: &str) -> (&'static str, Vec<u8>) {
    let json = "application/json";
    let id = query_value(query, "id").unwrap_or_default();
    let ip = query_value(query, "ip").unwrap_or_default();
    let mask = query_value(query, "mask").unwrap_or_default();
    let mask = if mask.trim().is_empty() {
        match query_value(query, "prefix").and_then(|p| p.parse::<u8>().ok()) {
            Some(p) => format!("{}.{}.{}.{}", 0u32, 0u32, 0u32, p),
            None => "255.255.255.0".to_string(),
        }
    } else {
        mask
    };
    // "0.0.0.0/24" style prefix was encoded above; convert back.
    let mask = if mask.ends_with(|c: char| c.is_ascii_digit()) && mask.starts_with("0.0.0.") {
        mask.rsplit('.').next().unwrap_or("24").to_string()
    } else {
        mask
    };
    let gateway = query_value(query, "gateway").unwrap_or_default();
    let dns = query_value(query, "dns").unwrap_or_default();
    let (out, _) = apply(ctx, |ws| ws.set_config(&id, &ip, &mask, &gateway, &dns));
    (json, out.into_bytes())
}

fn handle_devices_ipv6(ctx: &Ctx, query: &str) -> (&'static str, Vec<u8>) {
    let json = "application/json";
    let id = query_value(query, "id").unwrap_or_default();
    let auto_config = matches!(query_value(query, "auto").as_deref(), Some("1") | Some("true"));
    let addr = query_value(query, "addr").unwrap_or_default();
    let prefix = query_value(query, "prefix")
        .and_then(|p| p.parse::<u8>().ok())
        .unwrap_or(64);
    let gateway = query_value(query, "gateway").unwrap_or_default();
    let dns = query_value(query, "dns").unwrap_or_default();
    let (out, _) = apply(ctx, |ws| ws.set_ipv6(&id, auto_config, &addr, prefix, &gateway, &dns));
    (json, out.into_bytes())
}

fn handle_devices_dot1x(ctx: &Ctx, query: &str) -> (&'static str, Vec<u8>) {
    let json = "application/json";
    let id = query_value(query, "id").unwrap_or_default();
    let enabled = matches!(query_value(query, "enabled").as_deref(), Some("1") | Some("true"));
    let user = query_value(query, "user").unwrap_or_default();
    let pass = query_value(query, "pass").unwrap_or_default();
    let (out, _) = apply(ctx, |ws| ws.set_dot1x(&id, enabled, &user, &pass));
    (json, out.into_bytes())
}

fn handle_devices_dhcp_reserve(ctx: &Ctx, query: &str) -> (&'static str, Vec<u8>) {
    let json = "application/json";
    let id = query_value(query, "id").unwrap_or_default();
    let client = query_value(query, "client").unwrap_or_default();
    let ip = query_value(query, "ip").unwrap_or_default();
    let (out, _) = apply(ctx, |ws| {
        if ip.is_empty() {
            if ws.remove_dhcp_reservation(&id, &client) {
                Ok(())
            } else {
                Err("no such reservation".into())
            }
        } else {
            ws.set_dhcp_reservation(&id, &client, &ip)
        }
    });
    (json, out.into_bytes())
}

fn handle_devices_dhcp_helper(ctx: &Ctx, query: &str) -> (&'static str, Vec<u8>) {
    let json = "application/json";
    let id = query_value(query, "id").unwrap_or_default();
    let iface = query_value(query, "iface").unwrap_or_default();
    let helper = query_value(query, "helper").unwrap_or_default();
    let (out, _) = apply(ctx, |ws| {
        if helper.is_empty() {
            if ws.remove_dhcp_helper(&id, &iface) {
                Ok(())
            } else {
                Err("no helper address configured".into())
            }
        } else {
            ws.set_dhcp_helper(&id, &iface, &helper)
        }
    });
    (json, out.into_bytes())
}

fn handle_ipv6_dhcp(ctx: &Ctx, query: &str) -> (&'static str, Vec<u8>) {
    let json = "application/json";
    let id = query_value(query, "id").unwrap_or_default();
    let server = query_value(query, "server").unwrap_or_default();
    let mut ws = ctx.ws.lock().unwrap_or_else(|e| e.into_inner());
    match ws.dhcpv6(&id, &server) {
        Ok(addr) => {
            (json, format!("{{\"address\":{}}}", json_str(&addr)).into_bytes())
        }
        Err(e) => (json, format!("{{\"error\":{}}}", json_str(&e)).into_bytes()),
    }
}

fn handle_devices_inspect(ctx: &Ctx, query: &str) -> (&'static str, Vec<u8>) {
    let json = "application/json";
    let id = query_value(query, "id").unwrap_or_default();
    let on = matches!(query_value(query, "on").as_deref(), Some("1") | Some("true"));
    let (out, _) = apply(ctx, |ws| ws.set_inspection(&id, on));
    (json, out.into_bytes())
}

fn handle_devices_ips(ctx: &Ctx, query: &str) -> (&'static str, Vec<u8>) {
    let json = "application/json";
    let id = query_value(query, "id").unwrap_or_default();
    let proto = query_value(query, "proto").unwrap_or_default();
    let on = matches!(query_value(query, "on").as_deref(), Some("1") | Some("true"));
    let (out, _) = apply(ctx, |ws| ws.set_ips(&id, &proto, on));
    (json, out.into_bytes())
}

fn handle_devices_power(ctx: &Ctx, query: &str) -> (&'static str, Vec<u8>) {
    let json = "application/json";
    let id = query_value(query, "id").unwrap_or_default();
    let on = matches!(
        query_value(query, "on").as_deref(),
        Some("1") | Some("true") | Some("on")
    );
    let (out, _) = apply(ctx, |ws| {
        if ws.set_power(&id, on) {
            Ok(())
        } else {
            Err("no such device".into())
        }
    });
    (json, out.into_bytes())
}

fn handle_devices_module(ctx: &Ctx, query: &str) -> (&'static str, Vec<u8>) {
    let json = "application/json";
    let id = query_value(query, "id").unwrap_or_default();
    let slot = query_value(query, "slot")
        .and_then(|s| s.parse::<usize>().ok())
        .unwrap_or(0);
    let model = query_value(query, "model").unwrap_or_default();
    let (out, _) = apply(ctx, |ws| ws.set_module(&id, slot, &model));
    (json, out.into_bytes())
}

fn handle_devices_dhcp(ctx: &Ctx, query: &str) -> (&'static str, Vec<u8>) {
    let json = "application/json";
    let id = query_value(query, "id").unwrap_or_default();
    let network = query_value(query, "network").unwrap_or_default();
    let prefix = query_value(query, "prefix")
        .and_then(|p| p.parse::<u8>().ok())
        .or_else(|| {
            query_value(query, "mask").and_then(|m| crate::model::parse_mask(&m))
        })
        .unwrap_or(24);
    let gateway = query_value(query, "gateway").unwrap_or_default();
    let dns = query_value(query, "dns").unwrap_or_default();
    let more = matches!(query_value(query, "more").as_deref(), Some("1") | Some("true"));
    let (out, _) = apply(ctx, |ws| if more {
        ws.add_dhcp_pool(&id, &network, prefix, &gateway, &dns)
    } else {
        ws.set_dhcp_pool(&id, &network, prefix, &gateway, &dns)
    });
    (json, out.into_bytes())
}

fn handle_dhcp_acquire(ctx: &Ctx, query: &str) -> (&'static str, Vec<u8>) {
    let json = "application/json";
    let id = query_value(query, "id").unwrap_or_default();
    let (out, _) = apply(ctx, |ws| ws.acquire_dhcp(&id).map(|_| ()));
    (json, out.into_bytes())
}

fn handle_bus(ctx: &Ctx, query: &str) -> (&'static str, Vec<u8>) {
    let json = "application/json";
    let count = query_value(query, "count")
        .and_then(|c| c.parse::<usize>().ok())
        .unwrap_or(4);
    let (out, _) = apply(ctx, |ws| ws.bus(count).map(|_| ()));
    (json, out.into_bytes())
}

fn handle_links(ctx: &Ctx, query: &str) -> (&'static str, Vec<u8>) {
    let json = "application/json";
    let a = query_value(query, "a").unwrap_or_default();
    let b = query_value(query, "b").unwrap_or_default();
    let kind = query_value(query, "kind").unwrap_or_else(|| "eCopper".into());
    let aport = query_value(query, "aport").filter(|p| !p.trim().is_empty());
    let bport = query_value(query, "bport").filter(|p| !p.trim().is_empty());
    let (out, _) = apply(ctx, |ws| {
        ws.link_ports(&a, &b, &kind, aport.as_deref(), bport.as_deref())
    });
    (json, out.into_bytes())
}

fn handle_links_delete(ctx: &Ctx, query: &str) -> (&'static str, Vec<u8>) {
    let json = "application/json";
    let a = query_value(query, "a").unwrap_or_default();
    let b = query_value(query, "b").unwrap_or_default();
    let (out, _) = apply(ctx, |ws| {
        if ws.unlink(&a, &b) { Ok(()) } else { Err("no such link".into()) }
    });
    (json, out.into_bytes())
}

fn handle_pdu(ctx: &Ctx, query: &str) -> (&'static str, Vec<u8>) {
    let json = "application/json";
    let src = query_value(query, "src").unwrap_or_default();
    let dst = query_value(query, "dst").unwrap_or_default();
    let (out, _) = apply_capture(ctx, |ws| ws.send_pdu(&src, &dst));
    (json, out.into_bytes())
}

fn handle_demo(ctx: &Ctx) -> (&'static str, Vec<u8>) {
    let json = "application/json";
    let (out, _) = apply_capture(ctx, |ws| ws.run_demo().map(|_| ()));
    (json, out.into_bytes())
}

fn handle_sim_reset(ctx: &Ctx) -> (&'static str, Vec<u8>) {
    let json = "application/json";
    let (out, _) = apply(ctx, |ws| {
        ws.reset_sim();
        Ok(())
    });
    (json, out.into_bytes())
}

/// Advancing the clock is not an edit: it bypasses the undo history so a
/// 2-second heartbeat cannot wash the user's real changes out of it.
fn handle_sim_tick(ctx: &Ctx, query: &str) -> (&'static str, Vec<u8>) {
    let json = "application/json";
    let seconds = query_value(query, "seconds")
        .and_then(|v| v.parse::<f32>().ok())
        .unwrap_or(2.0);
    let mut ws = ctx.ws.lock().unwrap_or_else(|e| e.into_inner());
    ws.advance(seconds);
    (json, ws.json().into_bytes())
}

fn handle_undo(ctx: &Ctx) -> (&'static str, Vec<u8>) {
    let json = "application/json";
    let mut ws = ctx.ws.lock().unwrap_or_else(|e| e.into_inner());
    let mut hist = ctx.hist.lock().unwrap_or_else(|e| e.into_inner());
    match hist.undo.pop() {
        Some(prev) => {
            hist.redo.push(ws.clone());
            *ws = prev;
            (json, ws.json().into_bytes())
        }
        None => (json, json_error("nothing to undo").into_bytes()),
    }
}

fn handle_redo(ctx: &Ctx) -> (&'static str, Vec<u8>) {
    let json = "application/json";
    let mut ws = ctx.ws.lock().unwrap_or_else(|e| e.into_inner());
    let mut hist = ctx.hist.lock().unwrap_or_else(|e| e.into_inner());
    match hist.redo.pop() {
        Some(next) => {
            hist.undo.push(ws.clone());
            *ws = next;
            (json, ws.json().into_bytes())
        }
        None => (json, json_error("nothing to redo").into_bytes()),
    }
}

fn handle_reset(ctx: &Ctx) -> (&'static str, Vec<u8>) {
    let json = "application/json";
    let (out, _) = apply(ctx, |ws| {
        *ws = Workspace::new();
        Ok(())
    });
    (json, out.into_bytes())
}

fn handle_mesh(ctx: &Ctx, query: &str) -> (&'static str, Vec<u8>) {
    let json = "application/json";
    let ids: Vec<String> = query_value(query, "ids")
        .unwrap_or_default()
        .split(',')
        .map(str::trim)
        .filter(|s| !s.is_empty())
        .map(str::to_string)
        .collect();
    let (out, _) = apply(ctx, |ws| ws.mesh(&ids).map(|_| ()));
    (json, out.into_bytes())
}

fn handle_shared_gateway(ctx: &Ctx, query: &str) -> (&'static str, Vec<u8>) {
    let json = "application/json";
    let id = query_value(query, "id").unwrap_or_default();
    let vip = query_value(query, "vip").unwrap_or_default();
    let remove = matches!(query_value(query, "remove").as_deref(), Some("1") | Some("true"));
    let (out, _) = apply(ctx, |ws| {
        if remove {
            return if ws.remove_shared_gateway(&id, &vip) { Ok(()) } else { Err("this device is not a member".to_string()) };
        }
        let Some(priority) = query_value(query, "priority").and_then(|v| v.parse().ok()) else {
            return Err("priority must be a number from 0 to 255".to_string());
        };
        ws.set_shared_gateway(&id, &vip, priority)
    });
    (json, out.into_bytes())
}

fn handle_collapse(ctx: &Ctx, query: &str) -> (&'static str, Vec<u8>) {
    let json = "application/json";
    let name = query_value(query, "name").unwrap_or_default();
    let members: Vec<String> = query_value(query, "members").unwrap_or_default()
        .split(',').filter(|m| !m.is_empty()).map(str::to_string).collect();
    let (out, _) = apply(ctx, |ws| ws.collapse(&name, &members).map(|_| ()));
    (json, out.into_bytes())
}

fn handle_expand(ctx: &Ctx, query: &str) -> (&'static str, Vec<u8>) {
    let json = "application/json";
    let id = query_value(query, "id").unwrap_or_default();
    let (out, _) = apply(ctx, |ws| {
        if ws.expand(&id) { Ok(()) } else { Err("no such group".to_string()) }
    });
    (json, out.into_bytes())
}
