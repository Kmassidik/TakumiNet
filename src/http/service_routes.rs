use super::*;

/// Returns `None` when this group does not own the route.
pub(super) fn route(ctx: &Ctx, method: &str, path: &str, query: &str) -> Option<(&'static str, Vec<u8>)> {
    let json = "application/json";
    let reply = match (method, path) {
        ("POST", "/api/devices/mailuser") => {
            let id = query_value(query, "id").unwrap_or_default();
            let user = query_value(query, "user").unwrap_or_default();
            let pass = query_value(query, "pass").unwrap_or_default();
            let (out, _) = apply(ctx, |ws| ws.add_mail_user(&id, &user, &pass));
            (json, out.into_bytes())
        }
        ("POST", "/api/mail/send") => {
            let id = query_value(query, "id").unwrap_or_default();
            let server = query_value(query, "server").unwrap_or_default();
            let from = query_value(query, "from").unwrap_or_default();
            let to = query_value(query, "to").unwrap_or_default();
            let subject = query_value(query, "subject").unwrap_or_default();
            let body = query_value(query, "body").unwrap_or_default();
            let (out, _) =
                apply(ctx, |ws| ws.send_mail(&id, &server, &from, &to, &subject, &body));
            (json, out.into_bytes())
        }
        ("POST", "/api/mail/list") => {
            let server = query_value(query, "id").unwrap_or_default();
            let user = query_value(query, "user").unwrap_or_default();
            let ws = ctx.ws.lock().unwrap_or_else(|e| e.into_inner());
            let items = ws
                .mail_list(&server, &user)
                .iter()
                .map(|m| {
                    format!(
                        "{{\"from\":{},\"to\":{},\"subject\":{},\"body\":{},\"read\":{}}}",
                        json_str(&m.from),
                        json_str(&m.to),
                        json_str(&m.subject),
                        json_str(&m.body),
                        m.read
                    )
                })
                .collect::<Vec<_>>()
                .join(",");
            (json, format!("{{\"messages\":[{items}]}}").into_bytes())
        }
        ("POST", "/api/devices/tftp") => {
            let id = query_value(query, "id").unwrap_or_default();
            let name = query_value(query, "name").unwrap_or_default();
            let content = query_value(query, "content").unwrap_or_default();
            let (out, _) = apply(ctx, |ws| ws.tftp_put(&id, &name, &content));
            (json, out.into_bytes())
        }
        ("POST", "/api/tftp/list") => {
            let id = query_value(query, "id").unwrap_or_default();
            let ws = ctx.ws.lock().unwrap_or_else(|e| e.into_inner());
            let files = ws
                .tftp_list(&id)
                .iter()
                .map(|n| json_str(n))
                .collect::<Vec<_>>()
                .join(",");
            (json, format!("{{\"files\":[{files}]}}").into_bytes())
        }
        ("POST", "/api/devices/ftp") => {
            let id = query_value(query, "id").unwrap_or_default();
            let name = query_value(query, "name").unwrap_or_default();
            let content = query_value(query, "content").unwrap_or_default();
            let (out, _) = apply(ctx, |ws| ws.ftp_put(&id, &name, &content));
            (json, out.into_bytes())
        }
        ("POST", "/api/ftp/list") => {
            let id = query_value(query, "id").unwrap_or_default();
            let ws = ctx.ws.lock().unwrap_or_else(|e| e.into_inner());
            let files = ws
                .ftp_list(&id)
                .iter()
                .map(|n| json_str(n))
                .collect::<Vec<_>>()
                .join(",");
            (json, format!("{{\"files\":[{files}]}}").into_bytes())
        }
        ("POST", "/api/devices/ntp") => {
            let id = query_value(query, "id").unwrap_or_default();
            let server = query_value(query, "server").unwrap_or_default();
            let (out, _) = apply(ctx, |ws| ws.ntp_sync(&id, &server).map(|_| ()));
            (json, out.into_bytes())
        }
        ("POST", "/api/ntp/status") => {
            let id = query_value(query, "id").unwrap_or_default();
            let ws = ctx.ws.lock().unwrap_or_else(|e| e.into_inner());
            let (synced, server, offset) = match ws.ntp_status(&id) {
                Some((server, offset)) => (true, server, offset),
                None => (false, String::new(), 0.0),
            };
            (
                json,
                format!(
                    "{{\"synced\":{synced},\"server\":{},\"offsetMs\":{offset:.3}}}",
                    json_str(&server)
                )
                .into_bytes(),
            )
        }
        ("POST", "/api/devices/syslog") => {
            let id = query_value(query, "id").unwrap_or_default();
            let on = matches!(query_value(query, "on").as_deref(), Some("1") | Some("true"));
            let (out, _) = apply(ctx, |ws| ws.syslog_enable(&id, on));
            (json, out.into_bytes())
        }
        ("POST", "/api/syslog/list") => {
            let id = query_value(query, "id").unwrap_or_default();
            let ws = ctx.ws.lock().unwrap_or_else(|e| e.into_inner());
            let entries = ws
                .syslog_list(&id)
                .iter()
                .map(|(time, severity, text)| {
                    format!(
                        "{{\"time\":{time:.3},\"severity\":{},\"text\":{}}}",
                        json_str(severity),
                        json_str(text)
                    )
                })
                .collect::<Vec<_>>()
                .join(",");
            (json, format!("{{\"entries\":[{entries}]}}").into_bytes())
        }
        ("POST", "/api/devices/aaa") => {
            let id = query_value(query, "id").unwrap_or_default();
            let user = query_value(query, "user").unwrap_or_default();
            let pass = query_value(query, "pass").unwrap_or_default();
            let (out, _) = apply(ctx, |ws| ws.aaa_add_user(&id, &user, &pass));
            (json, out.into_bytes())
        }
        ("POST", "/api/aaa/list") => {
            let id = query_value(query, "id").unwrap_or_default();
            let ws = ctx.ws.lock().unwrap_or_else(|e| e.into_inner());
            let users = ws
                .aaa_list(&id)
                .iter()
                .map(|u| json_str(u))
                .collect::<Vec<_>>()
                .join(",");
            (json, format!("{{\"users\":[{users}]}}").into_bytes())
        }
        ("POST", "/api/devices/dns") => {
            let id = query_value(query, "id").unwrap_or_default();
            let name = query_value(query, "name").unwrap_or_default();
            let ip = query_value(query, "ip").unwrap_or_default();
            let remove = matches!(
                query_value(query, "remove").as_deref(),
                Some("1") | Some("true")
            );
            let (out, _) = apply(ctx, |ws| {
                if remove {
                    if ws.remove_dns_record(&id, &name) {
                        Ok(())
                    } else {
                        Err("no such record".into())
                    }
                } else {
                    ws.set_dns_record(&id, &name, &ip)
                }
            });
            (json, out.into_bytes())
        }
        ("POST", "/api/devices/http") => {
            let id = query_value(query, "id").unwrap_or_default();
            let body = query_value(query, "body").unwrap_or_default();
            let (out, _) = apply(ctx, |ws| {
                if ws.set_http_page(&id, &body) {
                    Ok(())
                } else {
                    Err("no such device".into())
                }
            });
            (json, out.into_bytes())
        }
        ("POST", "/api/webfetch") => {
            let id = query_value(query, "id").unwrap_or_default();
            let url = query_value(query, "url").unwrap_or_default();
            let mut ws = ctx.ws.lock().unwrap_or_else(|e| e.into_inner());
            match crate::webapp::fetch(&mut ws, &id, &url) {
                Ok(p) => (
                    json,
                    format!(
                        "{{\"status\":{},\"reason\":{},\"host\":{},\"title\":{},\"text\":{}}}",
                        p.status,
                        json_str(p.reason),
                        json_str(&p.host),
                        json_str(&p.title),
                        json_str(&p.text)
                    )
                    .into_bytes(),
                ),
                Err(e) => (json, json_error(&e).into_bytes()),
            }
        }
        _ => return None,
    };
    Some(reply)
}
