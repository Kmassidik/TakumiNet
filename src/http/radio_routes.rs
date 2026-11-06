use super::*;

/// Returns `None` when this group does not own the route.
pub(super) fn route(ctx: &Ctx, method: &str, path: &str, query: &str) -> Option<(&'static str, Vec<u8>)> {
    match (method, path) {
        ("POST", "/api/wifi/wlan") => Some(handle_wifi_wlan(ctx, query)),
        ("POST", "/api/wifi/wlans") => Some(handle_wifi_wlans(ctx, query)),
        ("POST", "/api/wifi/scan") => Some(handle_wifi_scan(ctx)),
        ("POST", "/api/wifi/join") => Some(handle_wifi_join(ctx, query)),
        ("POST", "/api/wifi/disconnect") => Some(handle_wifi_disconnect(ctx, query)),
        ("POST", "/api/wifi/roam") => Some(handle_wifi_roam(ctx, query)),
        ("POST", "/api/wifi/capwap") => Some(handle_wifi_capwap(ctx, query)),
        ("POST", "/api/capwap/status") => Some(handle_capwap_status(ctx, query)),
        ("POST", "/api/wifi/status") => Some(handle_wifi_status(ctx, query)),
        ("POST", "/api/vpn/config") => Some(handle_vpn_config(ctx, query)),
        ("POST", "/api/vpn/status") => Some(handle_vpn_status(ctx, query)),
        ("POST", "/api/pppoe/config") => Some(handle_pppoe_config(ctx, query)),
        ("POST", "/api/pppoe/connect") => Some(handle_pppoe_connect(ctx, query)),
        ("POST", "/api/pppoe/sessions") => Some(handle_pppoe_sessions(ctx, query)),
        ("POST", "/api/pppoe/status") => Some(handle_pppoe_status(ctx, query)),
        ("POST", "/api/phone/register") => Some(handle_phone_register(ctx, query)),
        ("POST", "/api/phone/call") => Some(handle_phone_call(ctx, query)),
        ("POST" | "GET", "/api/phone/status") => Some(handle_phone_status(ctx, query)),
        ("POST", "/api/iot/read") => Some(handle_iot_read(ctx, query)),
        ("POST", "/api/iot/write") => Some(handle_iot_write(ctx, query)),
        ("POST", "/api/iot/send") => Some(handle_iot_send(ctx, query)),
        ("POST", "/api/ptp/sync") => Some(handle_ptp_sync(ctx, query)),
        ("POST", "/api/prp/enable") => Some(handle_prp_enable(ctx, query)),
        ("POST", "/api/wifi/remove") => Some(handle_wifi_remove(ctx, query)),
        ("POST", "/api/wifi/guest") => Some(handle_wifi_guest(ctx, query)),
        ("POST", "/api/cell/join") => Some(handle_cell_join(ctx, query)),
        ("POST", "/api/cell/status") => Some(handle_cell_status(ctx, query)),
        _ => None,
    }
}

fn handle_wifi_wlan(ctx: &Ctx, query: &str) -> (&'static str, Vec<u8>) {
    let json = "application/json";
    let id = query_value(query, "id").unwrap_or_default();
    let ssid = query_value(query, "ssid").unwrap_or_default();
    let pass = query_value(query, "pass").unwrap_or_default();
    let security = query_value(query, "security");
    let (out, _) = apply(ctx, |ws| match security.as_deref() {
        Some("WPA2-Enterprise") => ws.wlan_add_with(&id, &ssid, "", "WPA2-Enterprise".into()),
        Some("WPA3-SAE") => ws.wlan_add_with(&id, &ssid, &pass, "WPA3-SAE".into()),
        _ => ws.wlan_add(&id, &ssid, &pass),
    });
    (json, out.into_bytes())
}

fn handle_wifi_wlans(ctx: &Ctx, query: &str) -> (&'static str, Vec<u8>) {
    let json = "application/json";
    let id = query_value(query, "id").unwrap_or_default();
    let ws = ctx.ws.lock().unwrap_or_else(|e| e.into_inner());
    let list = ws
        .wlan_list(&id)
        .iter()
        .map(|(ssid, security)| {
            let guest = ws.wlan_guest.contains(&(id.clone(), ssid.clone()));
            format!(
                "{{\"ssid\":{},\"security\":{},\"guest\":{guest}}}",
                json_str(ssid),
                json_str(security)
            )
        })
        .collect::<Vec<_>>()
        .join(",");
    (json, format!("{{\"wlans\":[{list}]}}").into_bytes())
}

fn handle_wifi_scan(ctx: &Ctx) -> (&'static str, Vec<u8>) {
    let json = "application/json";
    let ws = ctx.ws.lock().unwrap_or_else(|e| e.into_inner());
    let list = ws
        .wifi_scan()
        .iter()
        .map(|(ssid, sec, wlc)| {
            format!(
                "{{\"ssid\":{},\"security\":{},\"wlc\":{}}}",
                json_str(ssid),
                json_str(sec),
                json_str(wlc)
            )
        })
        .collect::<Vec<_>>()
        .join(",");
    (json, format!("{{\"ssids\":[{list}]}}").into_bytes())
}

fn handle_wifi_join(ctx: &Ctx, query: &str) -> (&'static str, Vec<u8>) {
    let json = "application/json";
    let id = query_value(query, "id").unwrap_or_default();
    let ssid = query_value(query, "ssid").unwrap_or_default();
    let pass = query_value(query, "pass").unwrap_or_default();
    let user = query_value(query, "user").unwrap_or_default();
    let (out, _) = apply(ctx, |ws| {
        ws.wifi_join_auth(&id, &ssid, &pass, &user).map(|_| ())
    });
    (json, out.into_bytes())
}

fn handle_wifi_disconnect(ctx: &Ctx, query: &str) -> (&'static str, Vec<u8>) {
    let json = "application/json";
    let id = query_value(query, "id").unwrap_or_default();
    let (out, _) = apply(ctx, |ws| {
        if ws.wifi_leave(&id) {
            Ok(())
        } else {
            Err("not associated".into())
        }
    });
    (json, out.into_bytes())
}

fn handle_wifi_roam(ctx: &Ctx, query: &str) -> (&'static str, Vec<u8>) {
    let json = "application/json";
    let id = query_value(query, "id").unwrap_or_default();
    let wlc = query_value(query, "wlc").unwrap_or_default();
    let (out, _) = apply(ctx, |ws| ws.wifi_roam(&id, &wlc));
    (json, out.into_bytes())
}

fn handle_wifi_capwap(ctx: &Ctx, query: &str) -> (&'static str, Vec<u8>) {
    let json = "application/json";
    let id = query_value(query, "id").unwrap_or_default();
    let wlc = query_value(query, "wlc").unwrap_or_default();
    let (out, _) = apply(ctx, |ws| ws.capwap_join(&id, &wlc));
    (json, out.into_bytes())
}

fn handle_capwap_status(ctx: &Ctx, query: &str) -> (&'static str, Vec<u8>) {
    let json = "application/json";
    let id = query_value(query, "id").unwrap_or_default();
    let ws = ctx.ws.lock().unwrap_or_else(|e| e.into_inner());
    let wlc = ws.capwap_status(&id).unwrap_or_default();
    (json, format!("{{\"wlc\":{}}}", json_str(&wlc)).into_bytes())
}

fn handle_wifi_status(ctx: &Ctx, query: &str) -> (&'static str, Vec<u8>) {
    let json = "application/json";
    let id = query_value(query, "id").unwrap_or_default();
    let ws = ctx.ws.lock().unwrap_or_else(|e| e.into_inner());
    match ws.wifi_status(&id) {
        Some((ssid, wlc)) => (
            json,
            format!(
                "{{\"associated\":true,\"ssid\":{},\"wlc\":{},\"bars\":{}}}",
                json_str(&ssid),
                json_str(&wlc),
                ws.wifi_signal(&id).unwrap_or(0)
            )
            .into_bytes(),
        ),
        None => (
            json,
            b"{\"associated\":false,\"ssid\":\"\",\"wlc\":\"\"}".to_vec(),
        ),
    }
}

fn handle_vpn_config(ctx: &Ctx, query: &str) -> (&'static str, Vec<u8>) {
    let json = "application/json";
    let id = query_value(query, "id").unwrap_or_default();
    let server = query_value(query, "server").unwrap_or_default();
    let user = query_value(query, "user").unwrap_or_default();
    let (out, _) = apply(ctx, |ws| ws.vpn_config(&id, &server, &user));
    (json, out.into_bytes())
}

fn handle_vpn_status(ctx: &Ctx, query: &str) -> (&'static str, Vec<u8>) {
    let json = "application/json";
    let id = query_value(query, "id").unwrap_or_default();
    let ws = ctx.ws.lock().unwrap_or_else(|e| e.into_inner());
    match ws.vpn_status(&id) {
        Some((server, user)) => (
            json,
            format!(
                "{{\"connected\":true,\"server\":{},\"user\":{}}}",
                json_str(&server),
                json_str(&user)
            )
            .into_bytes(),
        ),
        None => (
            json,
            b"{\"connected\":false,\"server\":\"\",\"user\":\"\"}".to_vec(),
        ),
    }
}

fn handle_pppoe_config(ctx: &Ctx, query: &str) -> (&'static str, Vec<u8>) {
    let json = "application/json";
    let id = query_value(query, "id").unwrap_or_default();
    let server = query_value(query, "server").unwrap_or_default();
    let user = query_value(query, "user").unwrap_or_default();
    let (out, _) = apply(ctx, |ws| ws.pppoe_config(&id, &server, &user));
    (json, out.into_bytes())
}

fn handle_pppoe_status(ctx: &Ctx, query: &str) -> (&'static str, Vec<u8>) {
    let json = "application/json";
    let id = query_value(query, "id").unwrap_or_default();
    let ws = ctx.ws.lock().unwrap_or_else(|e| e.into_inner());
    match ws.pppoe_status(&id) {
        Some((server, user)) => (
            json,
            format!(
                "{{\"connected\":true,\"server\":{},\"user\":{}}}",
                json_str(&server),
                json_str(&user)
            )
            .into_bytes(),
        ),
        None => (
            json,
            b"{\"connected\":false,\"server\":\"\",\"user\":\"\"}".to_vec(),
        ),
    }
}

fn handle_phone_register(ctx: &Ctx, query: &str) -> (&'static str, Vec<u8>) {
    let json = "application/json";
    let id = query_value(query, "id").unwrap_or_default();
    let cm = query_value(query, "cm").unwrap_or_default();
    let ext = query_value(query, "ext")
        .and_then(|e| e.parse::<u16>().ok())
        .unwrap_or(0);
    let (out, _) = apply(ctx, |ws| ws.phone_register(&id, &cm, ext));
    (json, out.into_bytes())
}

fn handle_phone_call(ctx: &Ctx, query: &str) -> (&'static str, Vec<u8>) {
    let json = "application/json";
    let ext = |name: &str| {
        query_value(query, name)
            .and_then(|e| e.parse::<u16>().ok())
            .unwrap_or(0)
    };
    let (from, to) = (ext("from"), ext("to"));
    let (out, _) = apply(ctx, |ws| ws.call(from, to).map(|_| ()));
    (json, out.into_bytes())
}

fn handle_phone_status(ctx: &Ctx, query: &str) -> (&'static str, Vec<u8>) {
    let json = "application/json";
    let id = query_value(query, "id").unwrap_or_default();
    let ws = ctx.ws.lock().unwrap_or_else(|e| e.into_inner());
    match ws.phone_status(&id) {
        Some((cm, ext)) => {
            let call = match ws.call_of(ext) {
                Some((from, to, state)) => {
                    format!("{{\"from\":{from},\"to\":{to},\"state\":{}}}", json_str(&state))
                }
                None => "null".into(),
            };
            (
                json,
                format!(
                    "{{\"registered\":true,\"cm\":{},\"extension\":{ext},\"call\":{call}}}",
                    json_str(&cm)
                )
                .into_bytes(),
            )
        }
        None => (
            json,
            b"{\"registered\":false,\"cm\":\"\",\"extension\":0,\"call\":null}".to_vec(),
        ),
    }
}

fn handle_iot_read(ctx: &Ctx, query: &str) -> (&'static str, Vec<u8>) {
    let json = "application/json";
    let id = query_value(query, "id").unwrap_or_default();
    let addr = query_value(query, "addr")
        .and_then(|a| a.parse::<u16>().ok())
        .unwrap_or(0);
    let mut ws = ctx.ws.lock().unwrap_or_else(|e| e.into_inner());
    match ws.iot_read(&id, addr) {
        Ok(v) => (json, format!("{{\"value\":{v}}}").into_bytes()),
        Err(e) => (json, format!("{{\"error\":{}}}", json_str(&e)).into_bytes()),
    }
}

fn handle_iot_write(ctx: &Ctx, query: &str) -> (&'static str, Vec<u8>) {
    let json = "application/json";
    let id = query_value(query, "id").unwrap_or_default();
    let addr = query_value(query, "addr")
        .and_then(|a| a.parse::<u16>().ok())
        .unwrap_or(0);
    let value = query_value(query, "value")
        .and_then(|v| v.parse::<u16>().ok())
        .unwrap_or(0);
    let mut ws = ctx.ws.lock().unwrap_or_else(|e| e.into_inner());
    match ws.iot_write(&id, addr, value) {
        Ok(old) => {
            (json, format!("{{\"old\":{old}}}").into_bytes())
        }
        Err(e) => (json, format!("{{\"error\":{}}}", json_str(&e)).into_bytes()),
    }
}

fn handle_iot_send(ctx: &Ctx, query: &str) -> (&'static str, Vec<u8>) {
    let json = "application/json";
    let src = query_value(query, "src").unwrap_or_default();
    let dst = query_value(query, "dst").unwrap_or_default();
    let proto = query_value(query, "proto").unwrap_or_default();
    let seq = query_value(query, "seq")
        .and_then(|s| s.parse::<u32>().ok())
        .unwrap_or(0);
    let mut ws = ctx.ws.lock().unwrap_or_else(|e| e.into_inner());
    let result = ws.send_iot(&src, &dst, &proto, seq);
    match result {
        Ok(msg) => (json, format!("{{\"status\":{}}}", json_str(&msg)).into_bytes()),
        Err(e) => (json, format!("{{\"error\":{}}}", json_str(&e)).into_bytes()),
    }
}

fn handle_ptp_sync(ctx: &Ctx, query: &str) -> (&'static str, Vec<u8>) {
    let json = "application/json";
    let master = query_value(query, "master").unwrap_or_default();
    let slave = query_value(query, "slave").unwrap_or_default();
    let mut ws = ctx.ws.lock().unwrap_or_else(|e| e.into_inner());
    match ws.ptp_sync(&master, &slave) {
        Ok(off) => {
            (json, format!("{{\"offsetMs\":{off:.3}}}").into_bytes())
        }
        Err(e) => (json, format!("{{\"error\":{}}}", json_str(&e)).into_bytes()),
    }
}

fn handle_prp_enable(ctx: &Ctx, query: &str) -> (&'static str, Vec<u8>) {
    let json = "application/json";
    let id = query_value(query, "id").unwrap_or_default();
    let on = matches!(query_value(query, "on").as_deref(), Some("1") | Some("true"));
    let (out, _) = apply(ctx, |ws| ws.prp_enable(&id, on));
    (json, out.into_bytes())
}

fn handle_cell_join(ctx: &Ctx, query: &str) -> (&'static str, Vec<u8>) {
    let json = "application/json";
    let id = query_value(query, "id").unwrap_or_default();
    let tower = query_value(query, "tower").unwrap_or_default();
    let (out, _) = apply(ctx, |ws| ws.cell_join(&id, &tower));
    (json, out.into_bytes())
}

fn handle_cell_status(ctx: &Ctx, query: &str) -> (&'static str, Vec<u8>) {
    let json = "application/json";
    let id = query_value(query, "id").unwrap_or_default();
    let ws = ctx.ws.lock().unwrap_or_else(|e| e.into_inner());
    match ws.cell_status(&id) {
        Some(tower) => (
            json,
            format!("{{\"associated\":true,\"tower\":{}}}", json_str(&tower))
                .into_bytes(),
        ),
        None => (json, b"{\"associated\":false,\"tower\":\"\"}".to_vec()),
    }
}

fn handle_wifi_remove(ctx: &Ctx, query: &str) -> (&'static str, Vec<u8>) {
    let json = "application/json";
    let id = query_value(query, "id").unwrap_or_default();
    let ssid = query_value(query, "ssid").unwrap_or_default();
    let (out, _) = apply(ctx, |ws| ws.wlan_remove(&id, &ssid));
    (json, out.into_bytes())
}

fn handle_wifi_guest(ctx: &Ctx, query: &str) -> (&'static str, Vec<u8>) {
    let json = "application/json";
    let id = query_value(query, "id").unwrap_or_default();
    let ssid = query_value(query, "ssid").unwrap_or_default();
    let on = !matches!(query_value(query, "on").as_deref(), Some("0") | Some("false"));
    let (out, _) = apply(ctx, |ws| ws.wlan_set_guest(&id, &ssid, on));
    (json, out.into_bytes())
}

fn handle_pppoe_connect(ctx: &Ctx, query: &str) -> (&'static str, Vec<u8>) {
    let json = "application/json";
    let id = query_value(query, "id").unwrap_or_default();
    let server = query_value(query, "server").unwrap_or_default();
    let user = query_value(query, "user").unwrap_or_default();
    let pass = query_value(query, "pass").unwrap_or_default();
    let (out, _) = apply(ctx, |ws| ws.pppoe_connect(&id, &server, &user, &pass));
    (json, out.into_bytes())
}

fn handle_pppoe_sessions(ctx: &Ctx, query: &str) -> (&'static str, Vec<u8>) {
    let json = "application/json";
    let id = query_value(query, "id").unwrap_or_default();
    let ws = ctx.ws.lock().unwrap_or_else(|e| e.into_inner());
    let rows = ws.pppoe_sessions(&id).iter()
        .map(|(client, user)| format!("{{\"client\":{},\"user\":{}}}", json_str(client), json_str(user)))
        .collect::<Vec<_>>()
        .join(",");
    (json, format!("{{\"sessions\":[{rows}]}}").into_bytes())
}
