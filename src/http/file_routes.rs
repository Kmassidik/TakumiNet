use super::*;

/// Returns `None` when this group does not own the route.
pub(super) fn route(ctx: &Ctx, method: &str, path: &str, query: &str, body: &[u8]) -> Option<(&'static str, Vec<u8>)> {
    match (method, path) {
        ("POST", "/api/save") => Some(handle_save(ctx, query)),
        ("POST", "/api/load") => Some(handle_load(ctx, query)),
        ("GET", "/api/saves") => Some(handle_saves()),
        ("GET", "/api/export") => Some(handle_export(ctx)),
        ("POST", "/api/import") => Some(handle_import(ctx, body)),
        ("GET", "/api/topology") => Some(handle_topology(ctx)),
        ("POST", "/api/ping") => Some(handle_ping(ctx, query)),
        _ => None,
    }
}

fn handle_save(ctx: &Ctx, query: &str) -> (&'static str, Vec<u8>) {
    let json = "application/json";
    let name = sanitize(&query_value(query, "name").unwrap_or_else(|| "untitled".into()));
    let ws = ctx.ws.lock().unwrap_or_else(|e| e.into_inner());
    let _ = std::fs::create_dir_all(SAVE_DIR);
    match std::fs::write(format!("{SAVE_DIR}/{name}.tnet"), ws.to_tnet()) {
        Ok(()) => (json, ws.json().into_bytes()),
        Err(e) => (json, json_error(&format!("save failed: {e}")).into_bytes()),
    }
}

fn handle_load(ctx: &Ctx, query: &str) -> (&'static str, Vec<u8>) {
    let json = "application/json";
    let name = sanitize(&query_value(query, "name").unwrap_or_default());
    let text = match std::fs::read_to_string(format!("{SAVE_DIR}/{name}.tnet")) {
        Ok(t) => t,
        Err(_) => {
            return (json, json_error("no such topology").as_bytes().to_vec())
        }
    };
    match Workspace::from_tnet(&text) {
        Some(loaded) => {
            let (out, _) = apply(ctx, |ws| {
                *ws = loaded;
                Ok(())
            });
            (json, out.into_bytes())
        }
        None => (json, json_error("corrupt topology file").into_bytes()),
    }
}

fn handle_saves() -> (&'static str, Vec<u8>) {
    let json = "application/json";
    let mut names: Vec<String> = std::fs::read_dir(SAVE_DIR)
        .map(|rd| {
            rd.flatten()
                .filter_map(|e| {
                    let p = e.path();
                    if p.extension().and_then(|x| x.to_str()) != Some("tnet") {
                        return None;
                    }
                    p.file_stem().map(|s| s.to_string_lossy().to_string())
                })
                .collect()
        })
        .unwrap_or_default();
    names.sort();
    let list = names.iter().map(|n| json_str(n)).collect::<Vec<_>>().join(",");
    (json, format!("{{\"names\":[{list}]}}").into_bytes())
}

fn handle_export(ctx: &Ctx) -> (&'static str, Vec<u8>) {
    let ws = ctx.ws.lock().unwrap_or_else(|e| e.into_inner());
    ("application/xml; charset=utf-8", ws.to_tnet().into_bytes())
}

fn handle_import(ctx: &Ctx, body: &[u8]) -> (&'static str, Vec<u8>) {
    let json = "application/json";
    let Ok(text) = std::str::from_utf8(body) else {
        return (json, json_error("topology is not UTF-8 XML").into_bytes());
    };
    match Workspace::from_tnet(text) {
        Some(imported) => {
            let (out, _) = apply(ctx, |ws| {
                *ws = imported;
                Ok(())
            });
            (json, out.into_bytes())
        }
        None => (json, json_error("corrupt topology file").into_bytes()),
    }
}

fn handle_topology(ctx: &Ctx) -> (&'static str, Vec<u8>) {
    let json = "application/json";
    (json, to_json(&ctx.topo).into_bytes())
}

fn handle_ping(ctx: &Ctx, query: &str) -> (&'static str, Vec<u8>) {
    let json = "application/json";
    let src = query_value(query, "src").unwrap_or_default();
    let dst = query_value(query, "dst").unwrap_or_default();
    if src.is_empty() || dst.is_empty() {
        (json, json_error("missing src or dst").into_bytes())
    } else {
        match ping(&ctx.topo, &src, &dst) {
            Ok(path) => (json, ping_json(&path, None).into_bytes()),
            Err(e) => (json, ping_json(&[], Some(&e)).into_bytes()),
        }
    }
}
