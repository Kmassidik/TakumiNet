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
    match std::fs::write(format!("{SAVE_DIR}/{name}.xml"), ws.to_tnet()) {
        Ok(()) => (json, ws.json().into_bytes()),
        Err(e) => (json, json_error(&format!("save failed: {e}")).into_bytes()),
    }
}

fn handle_load(ctx: &Ctx, query: &str) -> (&'static str, Vec<u8>) {
    let json = "application/json";
    let name = sanitize(&query_value(query, "name").unwrap_or_default());
    // Saves are .xml. A .tnet file made by an earlier version still opens (read only).
    let text = match std::fs::read_to_string(format!("{SAVE_DIR}/{name}.xml"))
        .or_else(|_| std::fs::read_to_string(format!("{SAVE_DIR}/{name}.tnet")))
    {
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
    // .xml saves, plus .tnet files from earlier versions. A name appears once.
    let names: std::collections::BTreeSet<String> = std::fs::read_dir(SAVE_DIR)
        .map(|rd| {
            rd.flatten()
                .filter_map(|e| {
                    let p = e.path();
                    if !matches!(p.extension().and_then(|x| x.to_str()), Some("xml" | "tnet")) {
                        return None;
                    }
                    p.file_stem().map(|s| s.to_string_lossy().to_string())
                })
                .collect()
        })
        .unwrap_or_default();
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

#[cfg(not(target_arch = "wasm32"))]
fn template_dir(ctx: &Ctx) -> std::path::PathBuf {
    std::path::Path::new(&ctx.web_root).join("templates")
}

#[cfg(target_arch = "wasm32")]
const EMBEDDED_TEMPLATES: &[(&str, &str)] = &[
    ("t1", include_str!("../../web/templates/t1.xml")),
    ("t2", include_str!("../../web/templates/t2.xml")),
    ("t3", include_str!("../../web/templates/t3.xml")),
    ("t4", include_str!("../../web/templates/t4.xml")),
    ("t5", include_str!("../../web/templates/t5.xml")),
    ("tpl-connect", include_str!("../../web/templates/tpl-connect.xml")),
    ("tpl-star", include_str!("../../web/templates/tpl-star.xml")),
    ("tpl-home", include_str!("../../web/templates/tpl-home.xml")),
    ("tpl-routed", include_str!("../../web/templates/tpl-routed.xml")),
    ("tpl-web", include_str!("../../web/templates/tpl-web.xml")),
    ("tpl-l1-wifi-home", include_str!("../../web/templates/tpl-l1-wifi-home.xml")),
    ("tpl-l1-two-rooms", include_str!("../../web/templates/tpl-l1-two-rooms.xml")),
    ("tpl-l1-broken-wifi", include_str!("../../web/templates/tpl-l1-broken-wifi.xml")),
    ("les-l1-01-router-login", include_str!("../../web/templates/les-l1-01-router-login.xml")),
    ("les-l1-02-wifi-name", include_str!("../../web/templates/les-l1-02-wifi-name.xml")),
    ("les-l1-03-guest-wifi", include_str!("../../web/templates/les-l1-03-guest-wifi.xml")),
    ("les-l1-04-reserve-address", include_str!("../../web/templates/les-l1-04-reserve-address.xml")),
    ("les-l1-05-port-forward", include_str!("../../web/templates/les-l1-05-port-forward.xml")),
    ("les-l1-06-far-room", include_str!("../../web/templates/les-l1-06-far-room.xml")),
    ("tpl-l3-office-vpn", include_str!("../../web/templates/tpl-l3-office-vpn.xml")),
    ("les-l3-06-remote-owner", include_str!("../../web/templates/les-l3-06-remote-owner.xml")),
    ("tpl-l2-rtrw-small", include_str!("../../web/templates/tpl-l2-rtrw-small.xml")),
    ("les-l2-01-first-gateway", include_str!("../../web/templates/les-l2-01-first-gateway.xml")),
    ("les-l2-02-customer-login", include_str!("../../web/templates/les-l2-02-customer-login.xml")),
    ("tpl-l2-rtrw-busy", include_str!("../../web/templates/tpl-l2-rtrw-busy.xml")),
    ("les-l2-03-speed-limits", include_str!("../../web/templates/les-l2-03-speed-limits.xml")),
    ("les-l2-06-find-the-hog", include_str!("../../web/templates/les-l2-06-find-the-hog.xml")),
    ("tpl-l2-rtrw-hotspot", include_str!("../../web/templates/tpl-l2-rtrw-hotspot.xml")),
    ("les-l2-04-voucher-hotspot", include_str!("../../web/templates/les-l2-04-voucher-hotspot.xml")),
    ("les-l2-05-far-house", include_str!("../../web/templates/les-l2-05-far-house.xml")),
    ("tpl-l4-campus-wireless", include_str!("../../web/templates/tpl-l4-campus-wireless.xml")),
    ("tpl-l4-campus-dmz", include_str!("../../web/templates/tpl-l4-campus-dmz.xml")),
    ("les-l4-05-campus-wifi", include_str!("../../web/templates/les-l4-05-campus-wifi.xml")),
    ("les-l4-06-dmz", include_str!("../../web/templates/les-l4-06-dmz.xml")),
    ("tpl-l4-campus-three-layer", include_str!("../../web/templates/tpl-l4-campus-three-layer.xml")),
    ("les-l4-01-three-layers", include_str!("../../web/templates/les-l4-01-three-layers.xml")),
    ("les-l4-02-root-and-bundles", include_str!("../../web/templates/les-l4-02-root-and-bundles.xml")),
    ("les-l4-04-spare-gateway", include_str!("../../web/templates/les-l4-04-spare-gateway.xml")),
    ("tpl-l5-leaf-spine", include_str!("../../web/templates/tpl-l5-leaf-spine.xml")),
    ("les-l5-01-leaf-spine", include_str!("../../web/templates/les-l5-01-leaf-spine.xml")),
    ("les-l5-02-lose-a-spine", include_str!("../../web/templates/les-l5-02-lose-a-spine.xml")),
    ("tpl-l5-load-balanced-web", include_str!("../../web/templates/tpl-l5-load-balanced-web.xml")),
    ("les-l5-03-load-balancer", include_str!("../../web/templates/les-l5-03-load-balancer.xml")),
    ("tpl-l5-overlay", include_str!("../../web/templates/tpl-l5-overlay.xml")),
    ("les-l5-04-overlay-network", include_str!("../../web/templates/les-l5-04-overlay-network.xml")),
    ("les-l5-05-find-the-hot-link", include_str!("../../web/templates/les-l5-05-find-the-hot-link.xml")),
    ("tpl-l7-city-ring", include_str!("../../web/templates/tpl-l7-city-ring.xml")),
    ("les-l7-01-ring-heals", include_str!("../../web/templates/les-l7-01-ring-heals.xml")),
    ("les-l7-02-city-services", include_str!("../../web/templates/les-l7-02-city-services.xml")),
    ("tpl-l8-regency-radio", include_str!("../../web/templates/tpl-l8-regency-radio.xml")),
    ("les-l8-01-far-village", include_str!("../../web/templates/les-l8-01-far-village.xml")),
    ("tpl-l9-backbone-ring", include_str!("../../web/templates/tpl-l9-backbone-ring.xml")),
    ("les-l9-01-ring-cut", include_str!("../../web/templates/les-l9-01-ring-cut.xml")),
    ("tpl-l10-national", include_str!("../../web/templates/tpl-l10-national.xml")),
    ("les-l10-01-gateway-down", include_str!("../../web/templates/les-l10-01-gateway-down.xml")),
    ("tpl-l11-world", include_str!("../../web/templates/tpl-l11-world.xml")),
    ("les-l11-01-cable-cut", include_str!("../../web/templates/les-l11-01-cable-cut.xml")),
    ("tpl-l6-isp-two-upstreams", include_str!("../../web/templates/tpl-l6-isp-two-upstreams.xml")),
    ("tpl-l6-isp-pop", include_str!("../../web/templates/tpl-l6-isp-pop.xml")),
    ("les-l6-01-address-plan", include_str!("../../web/templates/les-l6-01-address-plan.xml")),
    ("les-l6-02-first-bgp", include_str!("../../web/templates/les-l6-02-first-bgp.xml")),
    ("les-l6-03-two-upstreams", include_str!("../../web/templates/les-l6-03-two-upstreams.xml")),
    ("les-l1-07-find-the-fault", include_str!("../../web/templates/les-l1-07-find-the-fault.xml")),
    ("tpl-l3-office-vlans", include_str!("../../web/templates/tpl-l3-office-vlans.xml")),
    ("les-l3-01-three-vlans", include_str!("../../web/templates/les-l3-01-three-vlans.xml")),
    ("les-l3-02-inter-vlan", include_str!("../../web/templates/les-l3-02-inter-vlan.xml")),
    ("les-l3-04-acl-fence", include_str!("../../web/templates/les-l3-04-acl-fence.xml")),
    ("tpl-l4-campus-ospf", include_str!("../../web/templates/tpl-l4-campus-ospf.xml")),
    ("les-l4-03-ospf-campus", include_str!("../../web/templates/les-l4-03-ospf-campus.xml")),
    ("les-l3-05-port-security", include_str!("../../web/templates/les-l3-05-port-security.xml")),
    ("les-l3-03-dhcp-per-vlan", include_str!("../../web/templates/les-l3-03-dhcp-per-vlan.xml")),
];

/// Ready-to-run networks: no steps, nothing to set. Titles and goals for the gallery.
const TEMPLATE_CARDS: &[(&str, &str, &str)] = &[
    ("tpl-connect", "Two computers", "PC0 and PC1 on one cable, ready to ping"),
    ("tpl-star", "Three computers on a switch", "PC0, PC1 and PC2 ready to talk through Switch0"),
    ("tpl-home", "Home network", "Laptop0 and PC0 reach Server0's web page"),
    ("tpl-routed", "Two networks and a router", "PC0 reaches PC3 through Router0"),
    ("tpl-web", "Website by name", "PC0 looks up www.takumi.lab and opens the site"),
    ("tpl-l1-wifi-home", "Family home", "A modem, a router and five devices, ready to share one page"),
    ("tpl-l1-two-rooms", "Two rooms", "A second access point carries the signal to the far room"),
    ("tpl-l1-broken-wifi", "Broken home network", "The laptop cannot reach the phone. Find the wrong gateway"),
    ("tpl-l2-rtrw-small", "RT/RW Net with three homes", "A neighbourhood shares one line through a gateway, a pole radio and three homes"),
    ("tpl-l2-rtrw-busy", "RT/RW Net with a full line", "Four homes share one line and one of them fills it"),
    ("tpl-l2-rtrw-hotspot", "Hotspot at the warung", "Visitors join an open hotspot and pay with vouchers"),
    ("tpl-l4-campus-three-layer", "Three-layer campus", "Access, distribution and core carry two buildings to one server"),
    ("tpl-l4-campus-wireless", "Campus wireless", "One controller, three access points, a staff network and a fenced guest network"),
    ("tpl-l4-campus-dmz", "Campus with a DMZ", "The public web server sits on its own shelf and cannot reach the inside"),
    ("tpl-l5-leaf-spine", "Leaf and spine", "Two racks, two spines, and every server two hops from any other"),
    ("tpl-l5-load-balanced-web", "Load balanced shop", "One address in front, three web servers taking turns behind it"),
    ("tpl-l5-overlay", "Two tenants, one fabric", "Blue and green servers share the leaf-spine and never see each other"),
    ("tpl-l7-city-ring", "City fibre ring", "Four district hubs on one fibre ring carry every district to the city exchange"),
    ("tpl-l8-regency-radio", "Regency over the air", "Two village POPs reach the regency hub, one over microwave radios and one over a satellite terminal"),
    ("tpl-l9-backbone-ring", "Provincial backbone ring", "Five POPs circle the province and the far one still reaches the content server after any single cut"),
    ("tpl-l10-national", "Two provinces and the sea", "Two provinces meet at a national gateway, and a submarine cable carries them to an overseas page"),
    ("tpl-l11-world", "Three countries, three cables", "Three national gateways in a submarine triangle keep the world's name server reachable"),
    ("tpl-l6-isp-two-upstreams", "ISP with two upstreams", "A border router peers with two providers and the customer survives either line being cut"),
    ("tpl-l6-isp-pop", "ISP point of presence", "A border router, a customer gateway, a login server and the resolver that serves them"),
    ("tpl-l3-office-vpn", "Office with a home tunnel", "OwnerLaptop reaches the office file server through a tunnel over the internet"),
    ("tpl-l3-office-vlans", "Office with three VLANs", "Staff, servers and a printer on three VLANs, joined by one router cable"),
    ("tpl-l4-campus-ospf", "Campus with OSPF", "Four routers in a diamond learn each other's networks and survive one cut"),
];

fn template_text(ctx: &Ctx, id: &str) -> Result<String, ()> {
    #[cfg(not(target_arch = "wasm32"))]
    {
        std::fs::read_to_string(template_dir(ctx).join(format!("{id}.xml"))).map_err(|_| ())
    }
    #[cfg(target_arch = "wasm32")]
    {
        let _ = ctx;
        EMBEDDED_TEMPLATES.iter().find(|(template, _)| *template == id)
            .map(|(_, text)| (*text).to_string()).ok_or(())
    }
}

fn handle_templates(ctx: &Ctx) -> (&'static str, Vec<u8>) {
    #[cfg(target_arch = "wasm32")]
    let _ = ctx;
    let json = "application/json";
    #[cfg(not(target_arch = "wasm32"))]
    let sources = {
        let entries = match std::fs::read_dir(template_dir(ctx)) {
            Ok(entries) => entries,
            Err(error) if error.kind() == std::io::ErrorKind::NotFound => {
                return (json, b"{\"templates\":[]}".to_vec());
            }
            Err(error) => return (json, json_error(&format!("cannot read templates: {error}")).into_bytes()),
        };
        let mut paths: Vec<std::path::PathBuf> = entries.flatten().map(|entry| entry.path())
            .filter(|path| path.extension().and_then(|extension| extension.to_str()) == Some("xml"))
            .collect();
        paths.sort();
        let mut sources = Vec::new();
        for path in paths {
            match std::fs::read_to_string(&path) {
                Ok(text) => sources.push((path.display().to_string(), text)),
                Err(error) => return (json, json_error(&format!("cannot read {}: {error}", path.display())).into_bytes()),
            }
        }
        sources
    };
    #[cfg(target_arch = "wasm32")]
    let sources = EMBEDDED_TEMPLATES.iter()
        .map(|(id, text)| ((*id).to_string(), (*text).to_string())).collect::<Vec<_>>();

    let mut lessons = Vec::new();
    let mut templates = Vec::new();
    for (name, text) in sources {
        let workspace = match Workspace::from_tnet(&text) {
            Ok(workspace) => workspace,
            Err(problems) => {
                let summary = problems.first().map(ToString::to_string).unwrap_or_else(|| "invalid template".into());
                return (json, json_error(&format!("{name}: {summary}")).into_bytes());
            }
        };
        match workspace.lesson {
            Some(lesson) => lessons.push(lesson),
            None => templates.push(name),
        }
    }
    lessons.sort_by(|a, b| a.id.cmp(&b.id));
    let lesson_cards = lessons.iter().map(|lesson| format!(
        "{{\"id\":{},\"title\":{},\"level\":{},\"minutes\":{},\"goal\":{},\"stepCount\":{},\"checkCount\":{}}}",
        json_str(&lesson.id), json_str(&lesson.title), lesson.level, lesson.minutes,
        json_str(&lesson.goal), lesson.steps.len(), lesson.checks.len(),
    )).collect::<Vec<_>>().join(",");
    let template_cards = TEMPLATE_CARDS.iter()
        .filter(|(id, _, _)| templates.iter().any(|name| name.ends_with(&format!("{id}.xml")) || name == id))
        .map(|(id, title, goal)| format!(
            "{{\"id\":{},\"title\":{},\"goal\":{}}}", json_str(id), json_str(title), json_str(goal),
        )).collect::<Vec<_>>().join(",");
    (json, format!("{{\"lessons\":[{lesson_cards}],\"templates\":[{template_cards}]}}").into_bytes())
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
    let text = match template_text(ctx, &id) {
        Ok(text) => text,
        Err(()) => return (json, json_error("no such template").into_bytes()),
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
