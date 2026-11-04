use super::*;

/// Returns `None` when this group does not own the route.
pub(super) fn route(ctx: &Ctx, method: &str, path: &str, query: &str) -> Option<(&'static str, Vec<u8>)> {
    match (method, path) {
        ("POST", "/api/devices/mailuser") => Some(handle_devices_mailuser(ctx, query)),
        ("POST", "/api/mail/send") => Some(handle_mail_send(ctx, query)),
        ("POST", "/api/mail/list") => Some(handle_mail_list(ctx, query)),
        ("POST", "/api/devices/tftp") => Some(handle_devices_tftp(ctx, query)),
        ("POST", "/api/tftp/list") => Some(handle_tftp_list(ctx, query)),
        ("POST", "/api/devices/ftp") => Some(handle_devices_ftp(ctx, query)),
        ("POST", "/api/ftp/list") => Some(handle_ftp_list(ctx, query)),
        ("POST", "/api/devices/ntp") => Some(handle_devices_ntp(ctx, query)),
        ("POST", "/api/ntp/status") => Some(handle_ntp_status(ctx, query)),
        ("POST", "/api/devices/syslog") => Some(handle_devices_syslog(ctx, query)),
        ("POST", "/api/syslog/list") => Some(handle_syslog_list(ctx, query)),
        ("POST", "/api/devices/aaa") => Some(handle_devices_aaa(ctx, query)),
        ("POST", "/api/aaa/list") => Some(handle_aaa_list(ctx, query)),
        ("POST", "/api/devices/dns") => Some(handle_devices_dns(ctx, query)),
        ("POST", "/api/devices/http") => Some(handle_devices_http(ctx, query)),
        ("POST", "/api/router/login") => Some(handle_router_login(ctx, query)),
        ("POST", "/api/devices/routeradmin") => Some(handle_router_admin(ctx, query)),
        ("POST", "/api/devices/portforward") => Some(handle_port_forward(ctx, query)),
        ("POST", "/api/webfetch") => Some(handle_webfetch(ctx, query)),
        _ => None,
    }
}

fn handle_devices_mailuser(ctx: &Ctx, query: &str) -> (&'static str, Vec<u8>) {
    let json = "application/json";
    let id = query_value(query, "id").unwrap_or_default();
    let user = query_value(query, "user").unwrap_or_default();
    let pass = query_value(query, "pass").unwrap_or_default();
    let (out, _) = apply(ctx, |ws| ws.add_mail_user(&id, &user, &pass));
    (json, out.into_bytes())
}

fn handle_mail_send(ctx: &Ctx, query: &str) -> (&'static str, Vec<u8>) {
    let json = "application/json";
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

fn handle_mail_list(ctx: &Ctx, query: &str) -> (&'static str, Vec<u8>) {
    let json = "application/json";
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

fn handle_devices_tftp(ctx: &Ctx, query: &str) -> (&'static str, Vec<u8>) {
    let json = "application/json";
    let id = query_value(query, "id").unwrap_or_default();
    let name = query_value(query, "name").unwrap_or_default();
    let content = query_value(query, "content").unwrap_or_default();
    let (out, _) = apply(ctx, |ws| ws.tftp_put(&id, &name, &content));
    (json, out.into_bytes())
}

fn handle_tftp_list(ctx: &Ctx, query: &str) -> (&'static str, Vec<u8>) {
    let json = "application/json";
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

fn handle_devices_ftp(ctx: &Ctx, query: &str) -> (&'static str, Vec<u8>) {
    let json = "application/json";
    let id = query_value(query, "id").unwrap_or_default();
    let name = query_value(query, "name").unwrap_or_default();
    let content = query_value(query, "content").unwrap_or_default();
    let (out, _) = apply(ctx, |ws| ws.ftp_put(&id, &name, &content));
    (json, out.into_bytes())
}

fn handle_ftp_list(ctx: &Ctx, query: &str) -> (&'static str, Vec<u8>) {
    let json = "application/json";
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

fn handle_devices_ntp(ctx: &Ctx, query: &str) -> (&'static str, Vec<u8>) {
    let json = "application/json";
    let id = query_value(query, "id").unwrap_or_default();
    let server = query_value(query, "server").unwrap_or_default();
    let (out, _) = apply(ctx, |ws| ws.ntp_sync(&id, &server).map(|_| ()));
    (json, out.into_bytes())
}

fn handle_ntp_status(ctx: &Ctx, query: &str) -> (&'static str, Vec<u8>) {
    let json = "application/json";
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

fn handle_devices_syslog(ctx: &Ctx, query: &str) -> (&'static str, Vec<u8>) {
    let json = "application/json";
    let id = query_value(query, "id").unwrap_or_default();
    let on = matches!(query_value(query, "on").as_deref(), Some("1") | Some("true"));
    let (out, _) = apply(ctx, |ws| ws.syslog_enable(&id, on));
    (json, out.into_bytes())
}

fn handle_syslog_list(ctx: &Ctx, query: &str) -> (&'static str, Vec<u8>) {
    let json = "application/json";
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

fn handle_devices_aaa(ctx: &Ctx, query: &str) -> (&'static str, Vec<u8>) {
    let json = "application/json";
    let id = query_value(query, "id").unwrap_or_default();
    let user = query_value(query, "user").unwrap_or_default();
    let pass = query_value(query, "pass").unwrap_or_default();
    let (out, _) = apply(ctx, |ws| ws.aaa_add_user(&id, &user, &pass));
    (json, out.into_bytes())
}

fn handle_aaa_list(ctx: &Ctx, query: &str) -> (&'static str, Vec<u8>) {
    let json = "application/json";
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

fn handle_devices_dns(ctx: &Ctx, query: &str) -> (&'static str, Vec<u8>) {
    let json = "application/json";
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

fn handle_devices_http(ctx: &Ctx, query: &str) -> (&'static str, Vec<u8>) {
    let json = "application/json";
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

fn handle_webfetch(ctx: &Ctx, query: &str) -> (&'static str, Vec<u8>) {
    let json = "application/json";
    let id = query_value(query, "id").unwrap_or_default();
    let url = query_value(query, "url").unwrap_or_default();
    let mut ws = ctx.ws.lock().unwrap_or_else(|e| e.into_inner());
    let result = crate::webapp::fetch(&mut ws, &id, &url);
    match result {
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

fn handle_router_login(ctx: &Ctx, query: &str) -> (&'static str, Vec<u8>) {
    let json = "application/json";
    let from = query_value(query, "from").unwrap_or_default();
    let to = query_value(query, "to").unwrap_or_default();
    let user = query_value(query, "user").unwrap_or_default();
    let pass = query_value(query, "pass").unwrap_or_default();
    let (out, _) = apply(ctx, |ws| ws.router_login(&from, &to, &user, &pass));
    (json, out.into_bytes())
}

fn handle_router_admin(ctx: &Ctx, query: &str) -> (&'static str, Vec<u8>) {
    let json = "application/json";
    let id = query_value(query, "id").unwrap_or_default();
    let user = query_value(query, "user").unwrap_or_default();
    let pass = query_value(query, "pass").unwrap_or_default();
    let (out, _) = apply(ctx, |ws| ws.set_router_admin(&id, &user, &pass));
    (json, out.into_bytes())
}

fn handle_port_forward(ctx: &Ctx, query: &str) -> (&'static str, Vec<u8>) {
    let json = "application/json";
    let id = query_value(query, "id").unwrap_or_default();
    let target = query_value(query, "target").unwrap_or_default();
    let port = |key: &str| query_value(query, key).and_then(|v| v.parse::<u16>().ok());
    let remove = matches!(query_value(query, "remove").as_deref(), Some("1") | Some("true"));
    let (out, _) = apply(ctx, |ws| {
        let Some(outside) = port("outside") else { return Err("outside port must be a number from 1 to 65535".to_string()) };
        if remove {
            return if ws.remove_port_forward(&id, outside) { Ok(()) } else { Err(format!("port {outside} is not forwarded")) };
        }
        let Some(inside) = port("inside") else { return Err("inside port must be a number from 1 to 65535".to_string()) };
        ws.add_port_forward(&id, outside, &target, inside)
    });
    (json, out.into_bytes())
}
