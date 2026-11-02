//! HTTP/1.1 server: static UI, asset tree, workspace mutations, simulation.

use crate::storage::assets::Assets;
use crate::model::{demo, to_json, Topology};
use crate::net::sim::ping;
use crate::cli::{self, Session as CliSession};
use crate::storage::ptfile;
use crate::storage::ptxml;
use crate::workspace::Workspace;
use std::fs::File;
use std::io::{self, BufRead, BufReader, Read, Write};
use std::net::{TcpListener, TcpStream};
use std::path::Path;
use std::sync::{Arc, LazyLock, Mutex};
use std::thread;

mod device_routes;
mod file_routes;
mod radio_routes;
mod service_routes;
mod static_routes;
mod terminal_routes;
mod util;
use util::*;


/// The `.ptd`-derived model list, decoded once per process.
static CATALOG: LazyLock<Vec<crate::storage::catalog::Model>> =
    LazyLock::new(crate::storage::catalog::load_assets);

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


    let routed = static_routes::route(ctx, method, path, query)
        .or_else(|| device_routes::route(ctx, method, path, query))
        .or_else(|| service_routes::route(ctx, method, path, query))
        .or_else(|| radio_routes::route(ctx, method, path, query))
        .or_else(|| terminal_routes::route(ctx, method, path, query))
        .or_else(|| file_routes::route(ctx, method, path, query));

    let Some((ctype, body)) = routed else {
        return respond(&mut stream, "404 Not Found", "text/plain; charset=utf-8", b"not found\n");
    };

    respond(&mut stream, "200 OK", ctype, &body)
}
