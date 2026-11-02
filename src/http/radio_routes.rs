use super::*;

/// Returns `None` when this group does not own the route.
pub(super) fn route(ctx: &Ctx, method: &str, path: &str, query: &str) -> Option<(&'static str, Vec<u8>)> {
    let json = "application/json";
    let reply = match (method, path) {
        ("POST", "/api/wifi/wlan") => {
            let id = query_value(query, "id").unwrap_or_default();
            let ssid = query_value(query, "ssid").unwrap_or_default();
            let pass = query_value(query, "pass").unwrap_or_default();
            let security = query_value(query, "security");
            let (out, _) = apply(ctx, |ws| match security.as_deref() {
                Some("WPA2-Enterprise") => ws.wlan_add_with(&id, &ssid, "", "WPA2-Enterprise".into()),
                _ => ws.wlan_add(&id, &ssid, &pass),
            });
            (json, out.into_bytes())
        }
        ("POST", "/api/wifi/wlans") => {
            let id = query_value(query, "id").unwrap_or_default();
            let ws = ctx.ws.lock().unwrap_or_else(|e| e.into_inner());
            let list = ws
                .wlan_list(&id)
                .iter()
                .map(|(ssid, psk)| {
                    format!(
                        "{{\"ssid\":{},\"security\":{}}}",
                        json_str(ssid),
                        json_str(if psk.is_empty() { "Open" } else { "WPA2-PSK" })
                    )
                })
                .collect::<Vec<_>>()
                .join(",");
            (json, format!("{{\"wlans\":[{list}]}}").into_bytes())
        }
        ("POST", "/api/wifi/scan") => {
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
        ("POST", "/api/wifi/join") => {
            let id = query_value(query, "id").unwrap_or_default();
            let ssid = query_value(query, "ssid").unwrap_or_default();
            let pass = query_value(query, "pass").unwrap_or_default();
            let user = query_value(query, "user").unwrap_or_default();
            let (out, _) = apply(ctx, |ws| {
                ws.wifi_join_auth(&id, &ssid, &pass, &user).map(|_| ())
            });
            (json, out.into_bytes())
        }
        ("POST", "/api/wifi/disconnect") => {
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
        ("POST", "/api/wifi/roam") => {
            let id = query_value(query, "id").unwrap_or_default();
            let wlc = query_value(query, "wlc").unwrap_or_default();
            let (out, _) = apply(ctx, |ws| ws.wifi_roam(&id, &wlc));
            (json, out.into_bytes())
        }
        ("POST", "/api/wifi/capwap") => {
            let id = query_value(query, "id").unwrap_or_default();
            let wlc = query_value(query, "wlc").unwrap_or_default();
            let (out, _) = apply(ctx, |ws| ws.capwap_join(&id, &wlc));
            (json, out.into_bytes())
        }
        ("POST", "/api/wifi/status") => {
            let id = query_value(query, "id").unwrap_or_default();
            let ws = ctx.ws.lock().unwrap_or_else(|e| e.into_inner());
            match ws.wifi_status(&id) {
                Some((ssid, wlc)) => (
                    json,
                    format!(
                        "{{\"associated\":true,\"ssid\":{},\"wlc\":{}}}",
                        json_str(&ssid),
                        json_str(&wlc)
                    )
                    .into_bytes(),
                ),
                None => (
                    json,
                    b"{\"associated\":false,\"ssid\":\"\",\"wlc\":\"\"}".to_vec(),
                ),
            }
        }
        ("POST", "/api/vpn/config") => {
            let id = query_value(query, "id").unwrap_or_default();
            let server = query_value(query, "server").unwrap_or_default();
            let user = query_value(query, "user").unwrap_or_default();
            let (out, _) = apply(ctx, |ws| ws.vpn_config(&id, &server, &user));
            (json, out.into_bytes())
        }
        ("POST", "/api/vpn/status") => {
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
        ("POST", "/api/pppoe/config") => {
            let id = query_value(query, "id").unwrap_or_default();
            let server = query_value(query, "server").unwrap_or_default();
            let user = query_value(query, "user").unwrap_or_default();
            let (out, _) = apply(ctx, |ws| ws.pppoe_config(&id, &server, &user));
            (json, out.into_bytes())
        }
        ("POST", "/api/pppoe/status") => {
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
        ("POST", "/api/phone/register") => {
            let id = query_value(query, "id").unwrap_or_default();
            let cm = query_value(query, "cm").unwrap_or_default();
            let ext = query_value(query, "ext")
                .and_then(|e| e.parse::<u16>().ok())
                .unwrap_or(0);
            let (out, _) = apply(ctx, |ws| ws.phone_register(&id, &cm, ext));
            (json, out.into_bytes())
        }
        ("POST", "/api/phone/status") => {
            let id = query_value(query, "id").unwrap_or_default();
            let ws = ctx.ws.lock().unwrap_or_else(|e| e.into_inner());
            match ws.phone_status(&id) {
                Some((cm, ext)) => (
                    json,
                    format!(
                        "{{\"registered\":true,\"cm\":{},\"extension\":{ext}}}",
                        json_str(&cm)
                    )
                    .into_bytes(),
                ),
                None => (
                    json,
                    b"{\"registered\":false,\"cm\":\"\",\"extension\":0}".to_vec(),
                ),
            }
        }
        ("POST", "/api/iot/read") => {
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
        ("POST", "/api/iot/write") => {
            let id = query_value(query, "id").unwrap_or_default();
            let addr = query_value(query, "addr")
                .and_then(|a| a.parse::<u16>().ok())
                .unwrap_or(0);
            let value = query_value(query, "value")
                .and_then(|v| v.parse::<u16>().ok())
                .unwrap_or(0);
            let mut ws = ctx.ws.lock().unwrap_or_else(|e| e.into_inner());
            match ws.iot_write(&id, addr, value) {
                Ok(old) => (json, format!("{{\"old\":{old}}}").into_bytes()),
                Err(e) => (json, format!("{{\"error\":{}}}", json_str(&e)).into_bytes()),
            }
        }
        ("POST", "/api/iot/send") => {
            let src = query_value(query, "src").unwrap_or_default();
            let dst = query_value(query, "dst").unwrap_or_default();
            let proto = query_value(query, "proto").unwrap_or_default();
            let seq = query_value(query, "seq")
                .and_then(|s| s.parse::<u32>().ok())
                .unwrap_or(0);
            let mut ws = ctx.ws.lock().unwrap_or_else(|e| e.into_inner());
            match ws.send_iot(&src, &dst, &proto, seq) {
                Ok(msg) => (json, format!("{{\"status\":{}}}", json_str(&msg)).into_bytes()),
                Err(e) => (json, format!("{{\"error\":{}}}", json_str(&e)).into_bytes()),
            }
        }
        ("POST", "/api/ptp/sync") => {
            let master = query_value(query, "master").unwrap_or_default();
            let slave = query_value(query, "slave").unwrap_or_default();
            let mut ws = ctx.ws.lock().unwrap_or_else(|e| e.into_inner());
            match ws.ptp_sync(&master, &slave) {
                Ok(off) => (json, format!("{{\"offsetMs\":{off:.3}}}").into_bytes()),
                Err(e) => (json, format!("{{\"error\":{}}}", json_str(&e)).into_bytes()),
            }
        }
        ("POST", "/api/prp/enable") => {
            let id = query_value(query, "id").unwrap_or_default();
            let on = matches!(query_value(query, "on").as_deref(), Some("1") | Some("true"));
            let (out, _) = apply(ctx, |ws| ws.prp_enable(&id, on));
            (json, out.into_bytes())
        }
        ("POST", "/api/cell/join") => {
            let id = query_value(query, "id").unwrap_or_default();
            let tower = query_value(query, "tower").unwrap_or_default();
            let (out, _) = apply(ctx, |ws| ws.cell_join(&id, &tower));
            (json, out.into_bytes())
        }
        ("POST", "/api/cell/status") => {
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
        _ => return None,
    };
    Some(reply)
}
