//! HTTP/1.1 server: static UI, asset tree, workspace mutations, simulation.

use crate::assets::Assets;
use crate::model::{demo, to_json, Topology};
use crate::sim::ping;
use crate::cli::{self, Session as CliSession};
use crate::ptfile;
use crate::ptxml;
use crate::workspace::Workspace;
use std::fs::File;
use std::io::{self, BufRead, BufReader, Read, Write};
use std::net::{TcpListener, TcpStream};
use std::path::Path;
use std::sync::{Arc, LazyLock, Mutex};
use std::thread;

/// The `.ptd`-derived model list, decoded once per process.
static CATALOG: LazyLock<Vec<crate::catalog::Model>> =
    LazyLock::new(crate::catalog::load_assets);

#[derive(Default)]
struct History {
    undo: Vec<Workspace>,
    redo: Vec<Workspace>,
}

#[derive(Clone)]
struct Ctx {
    topo: Topology,
    assets: Option<Assets>,
    web_root: String,
    totals: Option<(usize, u64)>,
    ws: Arc<Mutex<Workspace>>,
    hist: Arc<Mutex<History>>,
    cli: Arc<Mutex<std::collections::HashMap<String, CliSession>>>,
}

const SAVE_DIR: &str = "topologies";

pub fn serve(addr: &str, web_root: &str) -> io::Result<()> {
    let listener = TcpListener::bind(addr)?;
    let assets = Assets::discover();
    let totals = assets.as_ref().map(|a| a.totals());

    match (&assets, totals) {
        (Some(a), Some((files, bytes))) => println!(
            "assets: {} ({} files, {:.1} MB)",
            a.root.display(),
            files,
            bytes as f64 / 1_048_576.0
        ),
        _ => println!("assets: none found — set ASSET_ROOT to the extracted opt/pt"),
    }
    println!("pt-web listening on http://{addr}");

    let ctx = Ctx {
        topo: demo(),
        assets,
        web_root: web_root.to_string(),
        totals,
        ws: Arc::new(Mutex::new(Workspace::new())),
        hist: Arc::new(Mutex::new(History::default())),
        cli: Arc::new(Mutex::new(std::collections::HashMap::new())),
    };

    for stream in listener.incoming() {
        let Ok(stream) = stream else { continue };
        let ctx = ctx.clone();
        thread::spawn(move || {
            let _ = handle(stream, &ctx);
        });
    }
    Ok(())
}

/// Run a mutation, snapshotting first so Undo works. On error the workspace is
/// rolled back and an error payload is returned.
fn apply<F>(ctx: &Ctx, f: F) -> (String, bool)
where
    F: FnOnce(&mut Workspace) -> Result<(), String>,
{
    let mut ws = ctx.ws.lock().unwrap_or_else(|e| e.into_inner());
    let mut hist = ctx.hist.lock().unwrap_or_else(|e| e.into_inner());
    let backup = ws.clone();

    match f(&mut ws) {
        Ok(()) => {
            hist.undo.push(backup);
            if hist.undo.len() > 100 {
                hist.undo.remove(0);
            }
            hist.redo.clear();
            (ws.json(), true)
        }
        Err(e) => {
            *ws = backup;
            (json_error(&e), false)
        }
    }
}

fn handle(mut stream: TcpStream, ctx: &Ctx) -> io::Result<()> {
    let mut reader = BufReader::new(stream.try_clone()?);
    let mut request_line = String::new();
    reader.read_line(&mut request_line)?;

    let mut parts = request_line.split_whitespace();
    let method = parts.next().unwrap_or("");
    let target = parts.next().unwrap_or("/");

    loop {
        let mut header = String::new();
        if reader.read_line(&mut header)? == 0 {
            break;
        }
        if header == "\r\n" || header == "\n" {
            break;
        }
    }

    let (path, query) = match target.split_once('?') {
        Some((p, q)) => (p, q),
        None => (target, ""),
    };

    if let Some(rel) = path.strip_prefix("/assets/") {
        return serve_asset(&mut stream, ctx, &pct_decode(rel));
    }

    let json = "application/json";
    let html = "text/html; charset=utf-8";

    let (ctype, body): (&str, Vec<u8>) = match (method, path) {
        ("GET", "/") => (html, file_bytes(&ctx.web_root, "index.html")),
        ("GET", "/workspace.js") => ("text/javascript; charset=utf-8", file_bytes(&ctx.web_root, "workspace.js")),
        ("GET", "/workspace.css") => ("text/css; charset=utf-8", file_bytes(&ctx.web_root, "workspace.css")),
        ("GET", "/browser") | ("GET", "/browser.html") => (html, file_bytes(&ctx.web_root, "browser.html")),
        ("GET", "/browser.js") => ("text/javascript; charset=utf-8", file_bytes(&ctx.web_root, "browser.js")),
        ("GET", "/style.css") => ("text/css; charset=utf-8", file_bytes(&ctx.web_root, "style.css")),
        ("GET", p) if p.starts_with("/art/") => {
            let name = &p["/art/".len()..];
            let safe = !name.is_empty()
                && name.ends_with(".svg")
                && !name.contains('/')
                && !name.contains("..");
            if safe {
                (
                    "image/svg+xml",
                    file_bytes(&ctx.web_root, &format!("art/{name}")),
                )
            } else {
                (html, b"not found".to_vec())
            }
        }

        ("GET", "/api/dialogs") => {
            let q = query_value(query, "q").unwrap_or_default().to_ascii_lowercase();
            let limit = query_value(query, "limit")
                .and_then(|l| l.parse::<usize>().ok())
                .unwrap_or(200)
                .clamp(1, 1000);
            let path = std::path::Path::new("intake/ui-catalog.tsv");
            let mut rows: Vec<(String, String)> = Vec::new();
            if let Ok(text) = std::fs::read_to_string(path) {
                for line in text.lines() {
                    let mut parts = line.split('\t');
                    let (Some(dialog), Some(text)) = (parts.next(), parts.next()) else {
                        continue;
                    };
                    if q.is_empty()
                        || dialog.to_ascii_lowercase().contains(&q)
                        || text.to_ascii_lowercase().contains(&q)
                    {
                        rows.push((dialog.to_string(), text.to_string()));
                    }
                    if rows.len() >= limit {
                        break;
                    }
                }
            }
            let total = std::fs::read_to_string(path)
                .map(|t| t.lines().filter(|l| l.contains('\t')).count())
                .unwrap_or(0);
            let items = rows
                .iter()
                .map(|(dialog, text)| {
                    format!(
                        "{{\"dialog\":{},\"text\":{}}}",
                        json_str(dialog),
                        json_str(text)
                    )
                })
                .collect::<Vec<_>>()
                .join(",");
            (
                json,
                format!(
                    "{{\"available\":{},\"total\":{total},\"items\":[{items}]}}",
                    path.exists()
                )
                .into_bytes(),
            )
        }
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
        ("POST", "/api/cmd") => {
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
        ("POST", "/api/complete") => {
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
        ("POST", "/api/cli") => {
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
        ("POST", "/api/cli/reset") => {
            let id = query_value(query, "id").unwrap_or_default();
            let mut sessions = ctx.cli.lock().unwrap_or_else(|e| e.into_inner());
            sessions.remove(&id);
            (json, "{\"ok\":true}".as_bytes().to_vec())
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
        ("POST", "/api/console") => {
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

        ("POST", "/api/save") => {
            let name = sanitize(&query_value(query, "name").unwrap_or_else(|| "untitled".into()));
            let ws = ctx.ws.lock().unwrap_or_else(|e| e.into_inner());
            let _ = std::fs::create_dir_all(SAVE_DIR);
            match std::fs::write(format!("{SAVE_DIR}/{name}.ptw"), ws.to_ptw()) {
                Ok(()) => (json, ws.json().into_bytes()),
                Err(e) => (json, json_error(&format!("save failed: {e}")).into_bytes()),
            }
        }
        ("POST", "/api/load") => {
            let name = sanitize(&query_value(query, "name").unwrap_or_default());
            let text = match std::fs::read_to_string(format!("{SAVE_DIR}/{name}.ptw")) {
                Ok(t) => t,
                Err(_) => {
                    return respond(&mut stream, "200 OK", json, json_error("no such topology").as_bytes())
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
        ("GET", "/api/saves") => {
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

        ("GET", "/api/pkt/list") => {
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
        ("POST", "/api/pkt/open") => {
            let rel = query_value(query, "path").unwrap_or_default();
            let Some(assets) = &ctx.assets else {
                return respond(&mut stream, "200 OK", json, json_error("no asset root").as_bytes());
            };
            let full = assets
                .resolve(&format!("saves/{rel}"))
                .ok_or_else(|| io::Error::new(io::ErrorKind::NotFound, "no such file"));
            let Ok(full) = full else {
                return respond(&mut stream, "200 OK", json, json_error("no such file").as_bytes());
            };
            let parsed = std::fs::read(&full)
                .map_err(|e| e.to_string())
                .and_then(|bytes| ptfile::decrypt(&bytes))
                .and_then(|xml| Ok(String::from_utf8_lossy(&xml).into_owned()));
            match parsed {
                Ok(xml) => {
                    let topo = ptxml::parse(&xml);
                    if topo.devices.is_empty() {
                        return respond(&mut stream, "200 OK", json, json_error("no devices in file").as_bytes());
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
        ("GET", "/api/status") => (json, status_json(ctx).into_bytes()),
        ("GET", "/api/catalog") => {
            (json, crate::catalog::to_json(&CATALOG).into_bytes())
        }
        ("GET", "/api/assets") => {
            let dir = query_value(query, "dir").unwrap_or_default();
            match &ctx.assets {
                Some(assets) => match assets.list(&dir) {
                    Ok(entries) => (json, list_json(&dir, &entries).into_bytes()),
                    Err(_) => (json, json_error("no such directory").into_bytes()),
                },
                None => (json, json_error("no asset root; set ASSET_ROOT").into_bytes()),
            }
        }
        ("GET", "/api/topology") => (json, to_json(&ctx.topo).into_bytes()),
        ("POST", "/api/ping") => {
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
        _ => {
            return respond(&mut stream, "404 Not Found", "text/plain; charset=utf-8", b"not found\n")
        }
    };

    respond(&mut stream, "200 OK", ctype, &body)
}


/// Recursively collect `.pkt`/`.pka` paths relative to `base`, depth-capped.
fn list_pkt(dir: &Path, base: &Path, depth: u32) -> Vec<String> {
    let mut out = Vec::new();
    if depth > 8 {
        return out;
    }
    let Ok(rd) = std::fs::read_dir(dir) else { return out };
    for entry in rd.flatten() {
        let path = entry.path();
        if path.is_dir() {
            out.extend(list_pkt(&path, base, depth + 1));
        } else if matches!(
            path.extension().and_then(|e| e.to_str()),
            Some("pkt") | Some("pka")
        ) {
            if let Ok(rel) = path.strip_prefix(base) {
                out.push(rel.to_string_lossy().replace('\\', "/"));
            }
        }
    }
    out.sort();
    out
}

fn sanitize(name: &str) -> String {
    let cleaned: String = name
        .chars()
        .map(|c| if c.is_ascii_alphanumeric() || c == '-' || c == '_' { c } else { '_' })
        .collect();
    if cleaned.is_empty() {
        "untitled".into()
    } else {
        cleaned
    }
}

fn serve_asset(stream: &mut TcpStream, ctx: &Ctx, rel: &str) -> io::Result<()> {
    let Some(assets) = &ctx.assets else {
        return respond(stream, "503 Service Unavailable", "text/plain", b"no asset root\n");
    };
    let Some(full) = assets.resolve(rel) else {
        return respond(stream, "404 Not Found", "text/plain", b"not found\n");
    };
    let Ok(meta) = std::fs::metadata(&full) else {
        return respond(stream, "404 Not Found", "text/plain", b"not found\n");
    };
    if !meta.is_file() {
        return respond(stream, "404 Not Found", "text/plain", b"not a file\n");
    }
    let Ok(mut file) = File::open(&full) else {
        return respond(stream, "403 Forbidden", "text/plain", b"unreadable\n");
    };

    write!(
        stream,
        "HTTP/1.1 200 OK\r\nContent-Type: {}\r\nContent-Length: {}\r\n\
         Cache-Control: public, max-age=86400\r\nConnection: close\r\n\r\n",
        content_type(rel),
        meta.len()
    )?;
    io::copy(&mut file, stream)?;
    stream.flush()
}

fn respond(stream: &mut TcpStream, status: &str, ctype: &str, body: &[u8]) -> io::Result<()> {
    write!(
        stream,
        "HTTP/1.1 {status}\r\nContent-Type: {ctype}\r\nContent-Length: {}\r\n\
         Cache-Control: no-store\r\nConnection: close\r\n\r\n",
        body.len()
    )?;
    stream.write_all(body)?;
    stream.flush()
}

fn file_bytes(root: &str, name: &str) -> Vec<u8> {
    std::fs::read(format!("{root}/{name}"))
        .unwrap_or_else(|e| format!("cannot read {name}: {e}").into_bytes())
}

fn query_value(query: &str, key: &str) -> Option<String> {
    for pair in query.split('&') {
        if let Some((k, v)) = pair.split_once('=') {
            if k == key {
                return Some(pct_decode(v));
            }
        }
    }
    None
}

fn pct_decode(s: &str) -> String {
    let bytes = s.as_bytes();
    let mut out = Vec::with_capacity(bytes.len());
    let mut i = 0;
    while i < bytes.len() {
        match bytes[i] {
            b'%' if i + 2 < bytes.len() => {
                let hex = std::str::from_utf8(&bytes[i + 1..i + 3]).ok();
                match hex.and_then(|h| u8::from_str_radix(h, 16).ok()) {
                    Some(b) => {
                        out.push(b);
                        i += 3;
                        continue;
                    }
                    None => out.push(b'%'),
                }
            }
            b'+' => out.push(b' '),
            b => out.push(b),
        }
        i += 1;
    }
    String::from_utf8_lossy(&out).into_owned()
}

fn content_type(name: &str) -> &'static str {
    let ext = Path::new(name)
        .extension()
        .and_then(|e| e.to_str())
        .unwrap_or("")
        .to_ascii_lowercase();
    match ext.as_str() {
        "png" => "image/png",
        "jpg" | "jpeg" => "image/jpeg",
        "gif" => "image/gif",
        "svg" => "image/svg+xml",
        "webp" => "image/webp",
        "ico" => "image/x-icon",
        "bmp" => "image/bmp",
        "wav" => "audio/wav",
        "mp3" => "audio/mpeg",
        "ogg" => "audio/ogg",
        "ttf" => "font/ttf",
        "otf" => "font/otf",
        "woff" => "font/woff",
        "woff2" => "font/woff2",
        "html" | "htm" => "text/html; charset=utf-8",
        "css" => "text/css; charset=utf-8",
        "js" => "text/javascript; charset=utf-8",
        "json" => "application/json",
        "txt" | "ts" | "ptl" | "csv" | "log" | "md" | "ptw" => "text/plain; charset=utf-8",
        "xml" => "application/xml",
        "zip" => "application/zip",
        _ => "application/octet-stream",
    }
}

fn kind_of(name: &str) -> &'static str {
    match content_type(name) {
        "image/png" | "image/jpeg" | "image/gif" | "image/svg+xml" | "image/webp"
        | "image/x-icon" | "image/bmp" => "image",
        t if t.starts_with("audio/") => "audio",
        t if t.starts_with("font/") => "font",
        "text/html; charset=utf-8" | "text/css; charset=utf-8" | "text/plain; charset=utf-8" => "text",
        _ => "data",
    }
}

fn json_str(s: &str) -> String {
    let mut o = String::with_capacity(s.len() + 2);
    o.push('"');
    for c in s.chars() {
        match c {
            '"' => o.push_str("\\\""),
            '\\' => o.push_str("\\\\"),
            '\n' => o.push_str("\\n"),
            '\r' => o.push_str("\\r"),
            '\t' => o.push_str("\\t"),
            c if (c as u32) < 0x20 => o.push_str(&format!("\\u{:04x}", c as u32)),
            c => o.push(c),
        }
    }
    o.push('"');
    o
}

fn status_json(ctx: &Ctx) -> String {
    match (&ctx.assets, ctx.totals) {
        (Some(a), Some((files, bytes))) => format!(
            "{{\"exists\":true,\"root\":{},\"files\":{files},\"bytes\":{bytes}}}",
            json_str(&a.root.display().to_string())
        ),
        _ => "{\"exists\":false,\"root\":null,\"files\":0,\"bytes\":0,\
              \"hint\":\"set ASSET_ROOT to the extracted opt/pt directory\"}"
            .to_string(),
    }
}

fn list_json(dir: &str, entries: &[crate::assets::Entry]) -> String {
    let dir = dir.trim_matches('/');
    let parent = match dir.rsplit_once('/') {
        Some((p, _)) => p.to_string(),
        None => String::new(),
    };

    let mut dirs = String::new();
    let mut files = String::new();
    for e in entries {
        if e.dir {
            if !dirs.is_empty() {
                dirs.push(',');
            }
            dirs.push_str(&format!(
                "{{\"name\":{},\"path\":{}}}",
                json_str(&e.name),
                json_str(&e.path)
            ));
        } else {
            if !files.is_empty() {
                files.push(',');
            }
            files.push_str(&format!(
                "{{\"name\":{},\"path\":{},\"size\":{},\"kind\":\"{}\"}}",
                json_str(&e.name),
                json_str(&e.path),
                e.size,
                kind_of(&e.name)
            ));
        }
    }

    format!(
        "{{\"path\":{},\"parent\":{},\"dirs\":[{}],\"files\":[{}]}}",
        json_str(dir),
        json_str(&parent),
        dirs,
        files
    )
}

fn json_error(msg: &str) -> String {
    format!("{{\"error\":{}}}", json_str(msg))
}

fn ping_json(path: &[String], err: Option<&str>) -> String {
    let mut s = String::from("{\"ok\":");
    s.push_str(if err.is_none() { "true" } else { "false" });
    s.push_str(",\"path\":[");
    for (i, hop) in path.iter().enumerate() {
        if i > 0 {
            s.push(',');
        }
        s.push_str(&json_str(hop));
    }
    s.push_str("],\"reason\":");
    match err {
        Some(e) => s.push_str(&json_str(e)),
        None => s.push_str("null"),
    }
    s.push('}');
    s
}

#[allow(dead_code)]
fn _read_all(mut r: impl Read) -> io::Result<Vec<u8>> {
    let mut v = Vec::new();
    r.read_to_end(&mut v)?;
    Ok(v)
}
