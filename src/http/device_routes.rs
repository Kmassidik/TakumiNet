use super::*;

/// Returns `None` when this group does not own the route.
pub(super) fn route(ctx: &Ctx, method: &str, path: &str, query: &str) -> Option<(&'static str, Vec<u8>)> {
    let json = "application/json";
    let reply = match (method, path) {
        ("GET", "/api/workspace") => {
            let ws = ctx.ws.lock().unwrap_or_else(|e| e.into_inner());
            (json, ws.json().into_bytes())
        }

        ("POST", "/api/devices") => {
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
        ("POST", "/api/devices/move") => {
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
        ("POST", "/api/devices/delete") => {
            let id = query_value(query, "id").unwrap_or_default();
            let (out, _) = apply(ctx, |ws| {
                if ws.remove(&id) { Ok(()) } else { Err("no such device".into()) }
            });
            (json, out.into_bytes())
        }
        ("POST", "/api/devices/duplicate") => {
            let id = query_value(query, "id").unwrap_or_default();
            let (out, _) = apply(ctx, |ws| {
                ws.duplicate(&id).map(|_| ()).ok_or_else(|| "cannot duplicate".to_string())
            });
            (json, out.into_bytes())
        }
        ("POST", "/api/devices/rename") => {
            let id = query_value(query, "id").unwrap_or_default();
            let name = query_value(query, "name").unwrap_or_default();
            let (out, _) = apply(ctx, |ws| {
                if ws.rename(&id, &name) { Ok(()) } else { Err("no such device".into()) }
            });
            (json, out.into_bytes())
        }

        ("POST", "/api/devices/ip") => {
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
        ("POST", "/api/devices/ipv6") => {
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
        ("POST", "/api/devices/dot1x") => {
            let id = query_value(query, "id").unwrap_or_default();
            let enabled = matches!(query_value(query, "enabled").as_deref(), Some("1") | Some("true"));
            let user = query_value(query, "user").unwrap_or_default();
            let pass = query_value(query, "pass").unwrap_or_default();
            let (out, _) = apply(ctx, |ws| ws.set_dot1x(&id, enabled, &user, &pass));
            (json, out.into_bytes())
        }
        ("POST", "/api/devices/dhcp/reserve") => {
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
        ("POST", "/api/devices/dhcp/helper") => {
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
        ("POST", "/api/ipv6/dhcp") => {
            let id = query_value(query, "id").unwrap_or_default();
            let server = query_value(query, "server").unwrap_or_default();
            let mut ws = ctx.ws.lock().unwrap_or_else(|e| e.into_inner());
            match ws.dhcpv6(&id, &server) {
                Ok(addr) => (json, format!("{{\"address\":{}}}", json_str(&addr)).into_bytes()),
                Err(e) => (json, format!("{{\"error\":{}}}", json_str(&e)).into_bytes()),
            }
        }
        ("POST", "/api/devices/inspect") => {
            let id = query_value(query, "id").unwrap_or_default();
            let on = matches!(query_value(query, "on").as_deref(), Some("1") | Some("true"));
            let (out, _) = apply(ctx, |ws| ws.set_inspection(&id, on));
            (json, out.into_bytes())
        }
        ("POST", "/api/devices/ips") => {
            let id = query_value(query, "id").unwrap_or_default();
            let proto = query_value(query, "proto").unwrap_or_default();
            let on = matches!(query_value(query, "on").as_deref(), Some("1") | Some("true"));
            let (out, _) = apply(ctx, |ws| ws.set_ips(&id, &proto, on));
            (json, out.into_bytes())
        }
        ("POST", "/api/devices/power") => {
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
        ("POST", "/api/devices/module") => {
            let id = query_value(query, "id").unwrap_or_default();
            let slot = query_value(query, "slot")
                .and_then(|s| s.parse::<usize>().ok())
                .unwrap_or(0);
            let model = query_value(query, "model").unwrap_or_default();
            let (out, _) = apply(ctx, |ws| ws.set_module(&id, slot, &model));
            (json, out.into_bytes())
        }
        ("POST", "/api/devices/dhcp") => {
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
            let (out, _) = apply(ctx, |ws| ws.set_dhcp_pool(&id, &network, prefix, &gateway, &dns));
            (json, out.into_bytes())
        }
        ("POST", "/api/dhcp/acquire") => {
            let id = query_value(query, "id").unwrap_or_default();
            let (out, _) = apply(ctx, |ws| ws.acquire_dhcp(&id).map(|_| ()));
            (json, out.into_bytes())
        }
        ("GET", "/api/devices/ports") => {
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
                            format!(
                                "{{\"name\":{},\"ip\":{},\"prefix\":{},\"up\":{}}}",
                                json_str(&p.name),
                                ip,
                                p.prefix,
                                p.up
                            )
                        })
                        .collect::<Vec<_>>()
                        .join(",");
                    (json, format!("{{\"ports\":[{ports}]}}").into_bytes())
                }
            }
        }
        ("POST", "/api/bus") => {
            let count = query_value(query, "count")
                .and_then(|c| c.parse::<usize>().ok())
                .unwrap_or(4);
            let (out, _) = apply(ctx, |ws| ws.bus(count).map(|_| ()));
            (json, out.into_bytes())
        }
        ("POST", "/api/links") => {
            let a = query_value(query, "a").unwrap_or_default();
            let b = query_value(query, "b").unwrap_or_default();
            let kind = query_value(query, "kind").unwrap_or_else(|| "eCopper".into());
            let (out, _) = apply(ctx, |ws| ws.link_kind(&a, &b, &kind));
            (json, out.into_bytes())
        }
        ("POST", "/api/links/delete") => {
            let a = query_value(query, "a").unwrap_or_default();
            let b = query_value(query, "b").unwrap_or_default();
            let (out, _) = apply(ctx, |ws| {
                if ws.unlink(&a, &b) { Ok(()) } else { Err("no such link".into()) }
            });
            (json, out.into_bytes())
        }

        ("POST", "/api/pdu") => {
            let src = query_value(query, "src").unwrap_or_default();
            let dst = query_value(query, "dst").unwrap_or_default();
            let (out, _) = apply(ctx, |ws| ws.send_pdu(&src, &dst));
            (json, out.into_bytes())
        }
        ("POST", "/api/sim/reset") => {
            let (out, _) = apply(ctx, |ws| {
                ws.reset_sim();
                Ok(())
            });
            (json, out.into_bytes())
        }

        ("POST", "/api/undo") => {
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
        ("POST", "/api/redo") => {
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
        ("POST", "/api/reset") => {
            let (out, _) = apply(ctx, |ws| {
                *ws = Workspace::new();
                Ok(())
            });
            (json, out.into_bytes())
        }
        ("POST", "/api/mesh") => {
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
        _ => return None,
    };
    Some(reply)
}
