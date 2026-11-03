use super::*;

/// Returns `None` when this group does not own the route.
pub(super) fn route(ctx: &Ctx, method: &str, path: &str, query: &str, body: &[u8]) -> Option<(&'static str, Vec<u8>)> {
    match (method, path) {
        ("POST", "/api/save") => Some(handle_save(ctx, query)),
        ("POST", "/api/load") => Some(handle_load(ctx, query)),
        ("GET", "/api/saves") => Some(handle_saves()),
        ("GET", "/api/export") => Some(handle_export(ctx)),
        ("GET", "/api/capture/bytes") => Some(handle_capture_bytes(ctx, query)),
        ("GET", "/api/capture/export") => Some(handle_capture_export(ctx)),
        ("POST", "/api/import") => Some(handle_import(ctx, query, body)),
        ("GET", "/api/checks") => Some(handle_checks(ctx)),
        ("GET", "/api/templates") => Some(handle_templates(ctx)),
        ("POST", "/api/templates/open") => Some(handle_template_open(ctx, query)),
        ("POST", "/api/new") => Some(handle_new(ctx)),
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
    let recover = matches!(query_value(query, "openAnyway").as_deref(), Some("1" | "true"));
    let loaded = if recover { Workspace::from_tnet_open_anyway(&text) } else { Workspace::from_tnet(&text) };
    match loaded {
        Ok(loaded) => {
            let report = loaded.load_problems.clone();
            let (out, _) = apply(ctx, |ws| {
                *ws = loaded;
                Ok(())
            });
            (json, attach_problems(out, &report).into_bytes())
        }
        Err(problems) => (json, problems_response(&problems).into_bytes()),
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

fn handle_capture_bytes(ctx: &Ctx, query: &str) -> (&'static str, Vec<u8>) {
    let json = "application/json";
    let Ok(id) = query_value(query, "id").unwrap_or_default().parse::<u32>() else {
        return (json, json_error("invalid or missing event id").into_bytes());
    };
    let ws = ctx.ws.lock().unwrap_or_else(|e| e.into_inner());
    let Some(event) = ws.events.iter().find(|event| event.id == id) else {
        return (json, json_error("unknown capture event").into_bytes());
    };
    if event.bytes.is_empty() {
        return (json, json_error("capture event has no frame bytes").into_bytes());
    }
    let mut hex = String::with_capacity(event.bytes.len() * 2);
    for byte in &event.bytes {
        hex.push(char::from_digit((byte >> 4) as u32, 16).unwrap());
        hex.push(char::from_digit((byte & 0x0f) as u32, 16).unwrap());
    }
    (
        json,
        format!("{{\"id\":{id},\"hex\":{},\"length\":{}}}", json_str(&hex), event.bytes.len()).into_bytes(),
    )
}

fn handle_capture_export(ctx: &Ctx) -> (&'static str, Vec<u8>) {
    let ws = ctx.ws.lock().unwrap_or_else(|e| e.into_inner());
    let frames = ws.events.iter().filter(|event| !event.bytes.is_empty()).map(|event| {
        (event.time as f64, event.bytes.as_slice())
    });
    (
        "application/vnd.tcpdump.pcap",
        crate::storage::pcap::write_pcap(frames),
    )
}

fn handle_import(ctx: &Ctx, query: &str, body: &[u8]) -> (&'static str, Vec<u8>) {
    let json = "application/json";
    let Ok(text) = std::str::from_utf8(body) else {
        return (json, json_error("topology is not UTF-8 XML").into_bytes());
    };
    let recover = matches!(query_value(query, "openAnyway").as_deref(), Some("1" | "true"));
    let imported = if recover { Workspace::from_tnet_open_anyway(text) } else { Workspace::from_tnet(text) };
    match imported {
        Ok(imported) => {
            let report = imported.load_problems.clone();
            let (out, _) = apply(ctx, |ws| {
                *ws = imported;
                Ok(())
            });
            (json, attach_problems(out, &report).into_bytes())
        }
        Err(problems) => (json, problems_response(&problems).into_bytes()),
    }
}

fn problems_response(problems: &[crate::workspace::Problem]) -> String {
    let summary = problems.first().map(ToString::to_string).unwrap_or_else(|| "corrupt topology file".into());
    let recoverable = problems.iter().all(|problem| problem.recoverable);
    format!("{{\"error\":{},\"canOpenAnyway\":{},\"problems\":{}}}", json_str(&summary), recoverable, problem_list(problems))
}

fn attach_problems(mut workspace: String, problems: &[crate::workspace::Problem]) -> String {
    if problems.is_empty() || !workspace.ends_with('}') {
        return workspace;
    }
    workspace.pop();
    workspace.push_str(&format!(",\"problems\":{},\"dropped\":{}}}", problem_list(problems), problems.iter().filter(|p| p.severity == crate::workspace::ProblemSeverity::Error).count()));
    workspace
}

fn problem_list(problems: &[crate::workspace::Problem]) -> String {
    let entries = problems.iter().map(|problem| {
        format!("{{\"line\":{},\"element\":{},\"attribute\":{},\"message\":{},\"severity\":{},\"text\":{}}}",
            problem.line,
            json_str(&problem.element),
            json_str(&problem.attribute),
            json_str(&problem.message),
            json_str(if problem.severity == crate::workspace::ProblemSeverity::Error { "error" } else { "warning" }),
            json_str(&problem.to_string()))
    }).collect::<Vec<_>>().join(",");
    format!("[{entries}]")
}

fn handle_checks(ctx: &Ctx) -> (&'static str, Vec<u8>) {
    let mut ws = ctx.ws.lock().unwrap_or_else(|e| e.into_inner());
    let results = ws.run_checks();
    let all_passed = results.iter().all(|result| result.passed);
    let results = results.iter().map(|result| format!(
        "{{\"id\":{},\"label\":{},\"passed\":{},\"actual\":{},\"hint\":{}}}",
        json_str(&result.id), json_str(&result.label), result.passed,
        json_str(&result.actual), json_str(&result.hint),
    )).collect::<Vec<_>>().join(",");
    ("application/json", format!("{{\"allPassed\":{all_passed},\"results\":[{results}]}}").into_bytes())
}

fn template_dir(ctx: &Ctx) -> std::path::PathBuf {
    std::path::Path::new(&ctx.web_root).join("templates")
}

fn handle_templates(ctx: &Ctx) -> (&'static str, Vec<u8>) {
    let json = "application/json";
    let entries = match std::fs::read_dir(template_dir(ctx)) {
        Ok(entries) => entries,
        Err(error) if error.kind() == std::io::ErrorKind::NotFound => {
            return (json, b"{\"templates\":[]}".to_vec());
        }
        Err(error) => return (json, json_error(&format!("cannot read templates: {error}")).into_bytes()),
    };
    let mut paths: Vec<std::path::PathBuf> = entries.flatten().map(|entry| entry.path())
        .filter(|path| path.extension().and_then(|extension| extension.to_str()) == Some("tnet"))
        .collect();
    paths.sort();
    let mut lessons = Vec::new();
    for path in paths {
        let text = match std::fs::read_to_string(&path) {
            Ok(text) => text,
            Err(error) => return (json, json_error(&format!("cannot read {}: {error}", path.display())).into_bytes()),
        };
        let workspace = match Workspace::from_tnet(&text) {
            Ok(workspace) => workspace,
            Err(problems) => {
                let summary = problems.first().map(ToString::to_string).unwrap_or_else(|| "invalid template".into());
                return (json, json_error(&format!("{}: {summary}", path.display())).into_bytes());
            }
        };
        if let Some(lesson) = workspace.lesson {
            lessons.push(lesson);
        }
    }
    lessons.sort_by(|a, b| a.id.cmp(&b.id));
    let templates = lessons.iter().map(|lesson| format!(
        "{{\"id\":{},\"title\":{},\"level\":{},\"minutes\":{},\"goal\":{},\"stepCount\":{},\"checkCount\":{}}}",
        json_str(&lesson.id), json_str(&lesson.title), lesson.level, lesson.minutes,
        json_str(&lesson.goal), lesson.steps.len(), lesson.checks.len(),
    )).collect::<Vec<_>>().join(",");
    (json, format!("{{\"templates\":[{templates}]}}").into_bytes())
}

fn valid_template_id(id: &str) -> bool {
    !id.is_empty() && id.chars().all(|c| c.is_ascii_alphanumeric() || matches!(c, '-' | '_'))
}

fn handle_template_open(ctx: &Ctx, query: &str) -> (&'static str, Vec<u8>) {
    let json = "application/json";
    let id = query_value(query, "id").unwrap_or_default();
    if !valid_template_id(&id) {
        return (json, json_error("invalid template id").into_bytes());
    }
    let text = match std::fs::read_to_string(template_dir(ctx).join(format!("{id}.tnet"))) {
        Ok(text) => text,
        Err(_) => return (json, json_error("no such template").into_bytes()),
    };
    match Workspace::from_tnet(&text) {
        Ok(loaded) => {
            let report = loaded.load_problems.clone();
            let (out, _) = apply(ctx, |workspace| {
                *workspace = loaded;
                Ok(())
            });
            ctx.cli.lock().unwrap_or_else(|e| e.into_inner()).clear();
            (json, attach_problems(out, &report).into_bytes())
        }
        Err(problems) => (json, problems_response(&problems).into_bytes()),
    }
}

fn handle_new(ctx: &Ctx) -> (&'static str, Vec<u8>) {
    let (out, _) = apply(ctx, |workspace| {
        *workspace = Workspace::empty();
        Ok(())
    });
    ctx.cli.lock().unwrap_or_else(|e| e.into_inner()).clear();
    ("application/json", out.into_bytes())
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
