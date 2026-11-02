use super::*;

/// Returns `None` when this group does not own the route.
pub(super) fn route(ctx: &Ctx, method: &str, path: &str, query: &str) -> Option<(&'static str, Vec<u8>)> {
    match (method, path) {
        ("POST", "/api/save") => Some(handle_save(ctx, query)),
        ("POST", "/api/load") => Some(handle_load(ctx, query)),
        ("GET", "/api/saves") => Some(handle_saves()),
        ("GET", "/api/pkt/list") => Some(handle_pkt_list(ctx)),
        ("POST", "/api/pkt/open") => Some(handle_pkt_open(ctx, query)),
        ("GET", "/api/status") => Some(handle_status(ctx)),
        ("GET", "/api/catalog") => Some(handle_catalog()),
        ("GET", "/api/assets") => Some(handle_assets(ctx, query)),
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
    match std::fs::write(format!("{SAVE_DIR}/{name}.ptw"), ws.to_ptw()) {
        Ok(()) => (json, ws.json().into_bytes()),
        Err(e) => (json, json_error(&format!("save failed: {e}")).into_bytes()),
    }
}

fn handle_load(ctx: &Ctx, query: &str) -> (&'static str, Vec<u8>) {
    let json = "application/json";
    let name = sanitize(&query_value(query, "name").unwrap_or_default());
    let text = match std::fs::read_to_string(format!("{SAVE_DIR}/{name}.ptw")) {
        Ok(t) => t,
        Err(_) => {
            return (json, json_error("no such topology").as_bytes().to_vec())
        }
    };
    match Workspace::from_ptw(&text) {
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
                    if p.extension().and_then(|x| x.to_str()) != Some("ptw") {
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

fn handle_pkt_list(ctx: &Ctx) -> (&'static str, Vec<u8>) {
    let json = "application/json";
    let files = match &ctx.assets {
        Some(a) => list_pkt(&a.root.join("saves"), &a.root.join("saves"), 0),
        None => Vec::new(),
    };
    let list = files
        .iter()
        .map(|f| json_str(f))
        .collect::<Vec<_>>()
        .join(",");
    (json, format!("{{\"files\":[{list}]}}").into_bytes())
}

fn handle_pkt_open(ctx: &Ctx, query: &str) -> (&'static str, Vec<u8>) {
    let json = "application/json";
    let rel = query_value(query, "path").unwrap_or_default();
    let Some(assets) = &ctx.assets else {
        return (json, json_error("no asset root").as_bytes().to_vec());
    };
    let full = assets
        .resolve(&format!("saves/{rel}"))
        .ok_or_else(|| io::Error::new(io::ErrorKind::NotFound, "no such file"));
    let Ok(full) = full else {
        return (json, json_error("no such file").as_bytes().to_vec());
    };
    let parsed = std::fs::read(&full)
        .map_err(|e| e.to_string())
        .and_then(|bytes| ptfile::decrypt(&bytes))
        .and_then(|xml| Ok(String::from_utf8_lossy(&xml).into_owned()));
    match parsed {
        Ok(xml) => {
            let topo = ptxml::parse(&xml);
            if topo.devices.is_empty() {
                return (json, json_error("no devices in file").as_bytes().to_vec());
            }
            let imported = Workspace::from_pkt(&topo);
            let (out, _) = apply(ctx, |ws| {
                *ws = imported;
                Ok(())
            });
            (json, out.into_bytes())
        }
        Err(e) => (json, json_error(&e).into_bytes()),
    }
}

fn handle_status(ctx: &Ctx) -> (&'static str, Vec<u8>) {
    let json = "application/json";
    (json, status_json(ctx).into_bytes())
}

fn handle_catalog() -> (&'static str, Vec<u8>) {
    let json = "application/json";
    (json, crate::storage::catalog::to_json(&CATALOG).into_bytes())
}

fn handle_assets(ctx: &Ctx, query: &str) -> (&'static str, Vec<u8>) {
    let json = "application/json";
    let dir = query_value(query, "dir").unwrap_or_default();
    match &ctx.assets {
        Some(assets) => match assets.list(&dir) {
            Ok(entries) => (json, list_json(&dir, &entries).into_bytes()),
            Err(_) => (json, json_error("no such directory").into_bytes()),
        },
        None => (json, json_error("no asset root; set ASSET_ROOT").into_bytes()),
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
