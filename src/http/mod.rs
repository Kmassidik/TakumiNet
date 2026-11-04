//! HTTP/1.1 server: static UI, workspace mutations, simulation and native files.

use crate::model::{demo, to_json, Topology};
use crate::net::sim::ping;
use crate::cli::{self, Session as CliSession};
use crate::workspace::Workspace;
use std::io::{self, Read};
#[cfg(not(target_arch = "wasm32"))]
use std::io::{BufRead, BufReader, Write};
#[cfg(not(target_arch = "wasm32"))]
use std::net::{TcpListener, TcpStream};
use std::sync::{Arc, Mutex};
#[cfg(not(target_arch = "wasm32"))]
use std::thread;

mod device_routes;
mod note_routes;
mod file_routes;
mod radio_routes;
mod service_routes;
mod sniffer_routes;
#[cfg(not(target_arch = "wasm32"))]
mod static_routes;
mod terminal_routes;
mod util;
use util::*;


#[derive(Default)]
struct History {
    undo: Vec<Workspace>,
    redo: Vec<Workspace>,
}

#[derive(Clone)]
pub struct Ctx {
    topo: Topology,
    #[cfg(not(target_arch = "wasm32"))]
    web_root: String,
    /// The public address of this site, used in canonical links, social cards and the sitemap.
    /// Set `SITE_URL` (for example `https://takumi.example`); the default points at this machine.
    #[cfg(not(target_arch = "wasm32"))]
    site_url: String,
    ws: Arc<Mutex<Workspace>>,
    hist: Arc<Mutex<History>>,
    cli: Arc<Mutex<std::collections::HashMap<String, CliSession>>>,
}

/// `SITE_URL` without a trailing slash, or `http://localhost:<PORT>` when it is not set.
#[cfg(not(target_arch = "wasm32"))]
fn site_url_from_env() -> String {
    match std::env::var("SITE_URL") {
        Ok(url) if !url.trim().is_empty() => url.trim().trim_end_matches('/').to_string(),
        _ => format!("http://localhost:{}", std::env::var("PORT").unwrap_or_else(|_| "3000".to_string())),
    }
}

impl Ctx {
    pub fn new(web_root: &str) -> Self {
        #[cfg(target_arch = "wasm32")]
        let _ = web_root;
        Self {
            topo: demo(),
            #[cfg(not(target_arch = "wasm32"))]
            web_root: web_root.to_string(),
            #[cfg(not(target_arch = "wasm32"))]
            site_url: site_url_from_env(),
            ws: Arc::new(Mutex::new(Workspace::new())),
            hist: Arc::new(Mutex::new(History::default())),
            cli: Arc::new(Mutex::new(std::collections::HashMap::new())),
        }
    }
}

const SAVE_DIR: &str = "topologies";

#[cfg(not(target_arch = "wasm32"))]
pub fn serve(addr: &str, web_root: &str) -> io::Result<()> {
    let listener = TcpListener::bind(addr)?;
    println!("pt-web listening on http://{addr}");

    let ctx = Ctx::new(web_root);

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

/// A dropped PDU is both an API error and a successful capture mutation.
/// Such a half-failed run keeps its new events and answers with the updated
/// workspace plus an `error` field, so the page can render what was captured
/// while it shows the message.
fn apply_capture<F>(ctx: &Ctx, f: F) -> (String, bool)
where
    F: FnOnce(&mut Workspace) -> Result<(), String>,
{
    let mut ws = ctx.ws.lock().unwrap_or_else(|e| e.into_inner());
    let mut hist = ctx.hist.lock().unwrap_or_else(|e| e.into_inner());
    let backup = ws.clone();
    let event_count = ws.events.len();
    match f(&mut ws) {
        Ok(()) => {
            hist.undo.push(backup);
            if hist.undo.len() > 100 {
                hist.undo.remove(0);
            }
            hist.redo.clear();
            (ws.json(), true)
        }
        Err(e) if ws.events.len() > event_count => {
            hist.undo.push(backup);
            if hist.undo.len() > 100 {
                hist.undo.remove(0);
            }
            hist.redo.clear();
            let mut out = ws.json();
            out.pop();
            out.push_str(",\"error\":");
            out.push_str(&json_str(&e));
            out.push('}');
            (out, false)
        }
        Err(e) => {
            *ws = backup;
            (json_error(&e), false)
        }
    }
}

#[cfg(not(target_arch = "wasm32"))]
fn handle(mut stream: TcpStream, ctx: &Ctx) -> io::Result<()> {
    let mut reader = BufReader::new(stream.try_clone()?);
    let mut request_line = String::new();
    reader.read_line(&mut request_line)?;

    let mut parts = request_line.split_whitespace();
    let method = parts.next().unwrap_or("");
    let target = parts.next().unwrap_or("/");

    let mut content_length = 0usize;
    loop {
        let mut header = String::new();
        if reader.read_line(&mut header)? == 0 {
            break;
        }
        if header == "\r\n" || header == "\n" {
            break;
        }
        if let Some((name, value)) = header.split_once(':') {
            if name.eq_ignore_ascii_case("content-length") {
                content_length = value.trim().parse().unwrap_or(0);
            }
        }
    }
    let mut request_body = vec![0; content_length];
    reader.read_exact(&mut request_body)?;

    let (status, ctype, body) = dispatch(ctx, method, target, &request_body);
    if status == 301 {
        return respond_redirect(&mut stream, &String::from_utf8_lossy(&body));
    }
    respond(&mut stream, if status == 404 { "404 Not Found" } else { "200 OK" }, ctype, &body)
}

/// Dispatch the same method, target (path plus query), and body for native HTTP
/// and browser WASM. Static files remain a native-server concern.
pub fn dispatch(ctx: &Ctx, method: &str, target: &str, body: &[u8]) -> (u16, &'static str, Vec<u8>) {
    let (path, query) = target.split_once('?').unwrap_or((target, ""));
    let api = || device_routes::route(ctx, method, path, query)
        .or_else(|| note_routes::route(ctx, method, path, query))
        .or_else(|| service_routes::route(ctx, method, path, query))
        .or_else(|| radio_routes::route(ctx, method, path, query))
        .or_else(|| sniffer_routes::route(ctx, method, path, query))
        .or_else(|| terminal_routes::route(ctx, method, path, query))
        .or_else(|| file_routes::route(ctx, method, path, query, body));

    #[cfg(not(target_arch = "wasm32"))]
    let routed = static_routes::route(ctx, method, path, query).or_else(api);
    #[cfg(target_arch = "wasm32")]
    let routed = api();

    match routed {
        Some((ctype, body)) if ctype == REDIRECT => (301, ctype, body),
        Some((ctype, body)) => (200, ctype, body),
        None => (404, "text/plain; charset=utf-8", b"not found\n".to_vec()),
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn context() -> Ctx {
        Ctx::new("")
    }

    #[test]
    fn native_export_import_round_trip() {
        let ctx = context();
        let (ctype, exported) = file_routes::route(&ctx, "GET", "/api/export", "", b"").unwrap();
        assert_eq!(ctype, "application/xml; charset=utf-8");
        apply(&ctx, |ws| {
            *ws = Workspace::empty();
            Ok(())
        });
        let (_, imported) = file_routes::route(&ctx, "POST", "/api/import", "", &exported).unwrap();
        assert!(!String::from_utf8(imported).unwrap().contains("error"));
        let (_, again) = file_routes::route(&ctx, "GET", "/api/export", "", b"").unwrap();
        assert_eq!(again, exported);
    }

    #[test]
    fn invalid_native_import_preserves_workspace() {
        let ctx = context();
        let before = ctx.ws.lock().unwrap().to_tnet();
        let (_, result) = file_routes::route(&ctx, "POST", "/api/import", "", b"<broken").unwrap();
        assert!(String::from_utf8(result).unwrap().contains("error"));
        assert_eq!(ctx.ws.lock().unwrap().to_tnet(), before);
    }

    #[test]
    fn capture_bytes_and_pcap_export_use_recorded_wire_frames() {
        let ctx = context();
        let (id, expected_hex) = {
            let mut ws = ctx.ws.lock().unwrap();
            ws.send_pdu("pc0", "pc2").unwrap();
            let event = ws.events.iter().rev().find(|event| event.proto == "ICMP").unwrap();
            let hex = event.bytes.iter().map(|byte| format!("{byte:02x}")).collect::<Vec<_>>().join("");
            (event.id, hex)
        };
        let (ctype, body) = file_routes::route(&ctx, "GET", "/api/capture/bytes", &format!("id={id}"), b"").unwrap();
        assert_eq!(ctype, "application/json");
        let body = String::from_utf8(body).unwrap();
        assert!(body.contains(&format!("\"hex\":\"{expected_hex}\"")), "{body}");
        assert!(body.contains(&format!("\"id\":{id}")), "{body}");

        let (_, missing) = file_routes::route(&ctx, "GET", "/api/capture/bytes", "id=999999", b"").unwrap();
        assert!(String::from_utf8(missing).unwrap().contains("unknown capture event"));

        let (ctype, pcap) = file_routes::route(&ctx, "GET", "/api/capture/export", "", b"").unwrap();
        assert_eq!(ctype, "application/vnd.tcpdump.pcap");
        assert_eq!(&pcap[..4], &0xa1b2c3d4u32.to_le_bytes());
        assert!(pcap.len() > 24 + 42);
    }

    #[test]
    fn a_half_failed_demo_returns_the_workspace_with_its_events_plus_the_error() {
        let ctx = context();
        let broken = include_str!("../../web/templates/tpl-l8-regency-radio.xml")
            .replace("from=\"pc1\"", "from=\"pc9\"");
        *ctx.ws.lock().unwrap() = Workspace::from_tnet(&broken).unwrap();
        let (ctype, body) = device_routes::route(&ctx, "POST", "/api/demo", "").unwrap();
        assert_eq!(ctype, "application/json");
        let body = String::from_utf8(body).unwrap();
        assert!(body.contains("\"error\":"), "{body}");
        assert!(body.contains("pc9"), "{body}");
        assert!(body.contains("\"devices\":["), "the reply carries the full workspace: {body}");
        assert!(body.contains("\"proto\":\"ICMP\""), "the first step's events are included: {body}");
        assert!(!ctx.ws.lock().unwrap().events.is_empty(), "the partial capture is kept");
    }

    #[test]
    fn native_open_anyway_reports_drops_and_preserves_strict_transaction() {
        let ctx = context();
        let before = ctx.ws.lock().unwrap().to_tnet();
        let text = br#"<takumi version="1">
<device id="bad" kind="pc" model="PC-PT" x="1" y="2" name="Bad" ip="bad" prefix="24"/>
<device id="good" kind="pc" model="PC-PT" x="3" y="4" name="Good" ip="192.168.1.2" prefix="24"/>
</takumi>
"#;
        let (_, strict) = file_routes::route(&ctx, "POST", "/api/import", "", text).unwrap();
        let strict = String::from_utf8(strict).unwrap();
        assert!(strict.contains("line 2"), "{strict}");
        assert!(strict.contains("\"canOpenAnyway\":true"), "{strict}");
        assert_eq!(ctx.ws.lock().unwrap().to_tnet(), before);

        let (_, recovered) = file_routes::route(&ctx, "POST", "/api/import", "openAnyway=true", text).unwrap();
        let recovered = String::from_utf8(recovered).unwrap();
        assert!(recovered.contains("\"dropped\":1"), "{recovered}");
        assert_eq!(ctx.ws.lock().unwrap().devices.len(), 1);
        assert_eq!(ctx.ws.lock().unwrap().devices[0].id, "good");
    }
}
