//! HTTP/1.1 server: static UI, workspace mutations, simulation and native files.

use crate::model::{demo, to_json, Topology};
use crate::net::sim::ping;
use crate::cli::{self, Session as CliSession};
use crate::workspace::Workspace;
use std::io::{self, BufRead, BufReader, Read, Write};
use std::net::{TcpListener, TcpStream};
use std::sync::{Arc, Mutex};
use std::thread;

mod device_routes;
mod file_routes;
mod radio_routes;
mod service_routes;
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
struct Ctx {
    topo: Topology,
    web_root: String,
    ws: Arc<Mutex<Workspace>>,
    hist: Arc<Mutex<History>>,
    cli: Arc<Mutex<std::collections::HashMap<String, CliSession>>>,
}

const SAVE_DIR: &str = "topologies";

pub fn serve(addr: &str, web_root: &str) -> io::Result<()> {
    let listener = TcpListener::bind(addr)?;
    println!("pt-web listening on http://{addr}");

    let ctx = Ctx {
        topo: demo(),
        web_root: web_root.to_string(),
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

/// A dropped PDU is both an API error and a successful capture mutation.
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
            (json_error(&e), false)
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

    let (path, query) = match target.split_once('?') {
        Some((p, q)) => (p, q),
        None => (target, ""),
    };

    let routed = static_routes::route(ctx, method, path, query)
        .or_else(|| device_routes::route(ctx, method, path, query))
        .or_else(|| service_routes::route(ctx, method, path, query))
        .or_else(|| radio_routes::route(ctx, method, path, query))
        .or_else(|| terminal_routes::route(ctx, method, path, query))
        .or_else(|| file_routes::route(ctx, method, path, query, &request_body));

    let Some((ctype, body)) = routed else {
        return respond(&mut stream, "404 Not Found", "text/plain; charset=utf-8", b"not found\n");
    };

    respond(&mut stream, "200 OK", ctype, &body)
}

#[cfg(test)]
mod tests {
    use super::*;

    fn context() -> Ctx {
        Ctx {
            topo: demo(),
            web_root: String::new(),
            ws: Arc::new(Mutex::new(Workspace::new())),
            hist: Arc::new(Mutex::new(History::default())),
            cli: Arc::new(Mutex::new(std::collections::HashMap::new())),
        }
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
    fn native_open_anyway_reports_drops_and_preserves_strict_transaction() {
        let ctx = context();
        let before = ctx.ws.lock().unwrap().to_tnet();
        let text = br#"<takuminet version="1">
<device id="bad" kind="pc" model="PC-PT" x="1" y="2" name="Bad" ip="bad" prefix="24"/>
<device id="good" kind="pc" model="PC-PT" x="3" y="4" name="Good" ip="192.168.1.2" prefix="24"/>
</takuminet>
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
