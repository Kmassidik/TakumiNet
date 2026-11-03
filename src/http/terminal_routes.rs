use super::*;

/// Returns `None` when this group does not own the route.
pub(super) fn route(ctx: &Ctx, method: &str, path: &str, query: &str) -> Option<(&'static str, Vec<u8>)> {
    match (method, path) {
        ("POST", "/api/cmd") => Some(handle_cmd(ctx, query)),
        ("POST", "/api/complete") => Some(handle_complete(ctx, query)),
        ("POST", "/api/cli") => Some(handle_cli(ctx, query)),
        ("POST", "/api/cli/reset") => Some(handle_cli_reset(ctx, query)),
        ("POST", "/api/console") => Some(handle_console(ctx, query)),
        _ => None,
    }
}

fn handle_cmd(ctx: &Ctx, query: &str) -> (&'static str, Vec<u8>) {
    let json = "application/json";
    let id = query_value(query, "id").unwrap_or_default();
    let line = query_value(query, "line").unwrap_or_default();
    let mut ws = ctx.ws.lock().unwrap_or_else(|e| e.into_inner());
    let trimmed = line.trim_start();
    let head = trimmed.get(..7).unwrap_or("");
    if head.eq_ignore_ascii_case("telnet ") {
        let (output, peer) = crate::cmd::telnet(&mut ws, &id, trimmed[7..].trim());
        let peer = match peer {
            Some(p) => format!(",\"peer\":{}", json_str(&p)),
            None => String::new(),
        };
        (
            json,
            format!("{{\"output\":{}{}}}", json_str(&output), peer).into_bytes(),
        )
    } else {
        let output = crate::cmd::run(&mut ws, &id, &line);
        (json, format!("{{\"output\":{}}}", json_str(&output)).into_bytes())
    }
}

fn handle_complete(ctx: &Ctx, query: &str) -> (&'static str, Vec<u8>) {
    let json = "application/json";
    let id = query_value(query, "id").unwrap_or_default();
    let line = query_value(query, "line").unwrap_or_default();
    let sessions = ctx.cli.lock().unwrap_or_else(|e| e.into_inner());
    let sess = sessions.get(&id).cloned().unwrap_or_default();
    let ws = ctx.ws.lock().unwrap_or_else(|e| e.into_inner());
    let candidates = crate::cli::complete(&ws, &id, &sess, &line);
    let list = candidates
        .iter()
        .map(|c| json_str(c))
        .collect::<Vec<_>>()
        .join(",");
    (json, format!("{{\"candidates\":[{list}]}}").into_bytes())
}

fn handle_cli(ctx: &Ctx, query: &str) -> (&'static str, Vec<u8>) {
    let json = "application/json";
    let id = query_value(query, "id").unwrap_or_default();
    let line = query_value(query, "line").unwrap_or_default();
    let mut sessions = ctx.cli.lock().unwrap_or_else(|e| e.into_inner());
    let mut sess = sessions.remove(&id).unwrap_or_default();
    let mut ws = ctx.ws.lock().unwrap_or_else(|e| e.into_inner());
    let output = cli::run(&mut ws, &id, &mut sess, &line);
    if !line.trim().is_empty() {
        invalidate_pkt_source(ctx);
    }
    let prompt = cli::prompt(&ws, &id, &sess);
    sessions.insert(id, sess);
    (
        json,
        format!(
            "{{\"output\":{},\"prompt\":{}}}",
            json_str(&output),
            json_str(&prompt)
        )
        .into_bytes(),
    )
}

fn handle_cli_reset(ctx: &Ctx, query: &str) -> (&'static str, Vec<u8>) {
    let json = "application/json";
    let id = query_value(query, "id").unwrap_or_default();
    let mut sessions = ctx.cli.lock().unwrap_or_else(|e| e.into_inner());
    sessions.remove(&id);
    (json, "{\"ok\":true}".as_bytes().to_vec())
}

fn handle_console(ctx: &Ctx, query: &str) -> (&'static str, Vec<u8>) {
    let json = "application/json";
    let id = query_value(query, "id").unwrap_or_default();
    let ws = ctx.ws.lock().unwrap_or_else(|e| e.into_inner());
    match ws.console_peer(&id) {
        Some(peer) => {
            let name = ws
                .devices
                .iter()
                .find(|d| d.id == peer)
                .map(|d| d.name.clone())
                .unwrap_or_else(|| peer.to_string());
            (
                json,
                format!("{{\"peer\":{},\"name\":{}}}", json_str(peer), json_str(&name))
                    .into_bytes(),
            )
        }
        None => (json, json_error("no console cable").into_bytes()),
    }
}
