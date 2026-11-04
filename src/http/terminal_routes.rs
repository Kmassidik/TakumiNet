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
    let words: Vec<&str> = line.split_whitespace().collect();
    let verb = words.first().map(|w| w.to_ascii_lowercase()).unwrap_or_default();
    if matches!(verb.as_str(), "telnet" | "ssh" | "console") {
        let (output, peer) = crate::cmd::connect(&mut ws, &id, &verb, &words[1..]);
        let peer = match peer {
            Some(p) => format!(",\"peer\":{}", json_str(&p)),
            None => String::new(),
        };
        (
            json,
            format!("{{\"output\":{}{},\"prompt\":{}}}", json_str(&output), peer, json_str(&crate::cmd::prompt(&ws, &id))).into_bytes(),
        )
    } else {
        let output = crate::cmd::run(&mut ws, &id, &line);
        let prompt = crate::cmd::prompt(&ws, &id);
        (json, format!("{{\"output\":{},\"prompt\":{}}}", json_str(&output), json_str(&prompt)).into_bytes())
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
