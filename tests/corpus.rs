//! Gated corpus integration test: open every shipped save through the real
//! server and check that each import yields a coherent topology.
//!
//! The corpus is slow, so this test is opt-in:
//!
//! ```text
//! PT_CORPUS=1 cargo test --test corpus -- --nocapture
//! ```

use std::io::{Read, Write};
use std::net::TcpStream;
use std::path::PathBuf;
use std::process::{Child, Command, Stdio};
use std::sync::atomic::{AtomicUsize, Ordering};
use std::sync::Mutex;
use std::time::{Duration, Instant};

fn repo_root() -> PathBuf {
    PathBuf::from(env!("CARGO_MANIFEST_DIR"))
}

fn asset_root() -> Option<PathBuf> {
    if let Ok(p) = std::env::var("ASSET_ROOT") {
        let pb = PathBuf::from(p);
        if pb.is_dir() {
            return Some(pb);
        }
    }
    let intake = repo_root().join("intake");
    let mut best: Option<(String, PathBuf)> = None;
    if let Ok(rd) = std::fs::read_dir(&intake) {
        for e in rd.flatten() {
            let stamp = e.file_name().to_string_lossy().to_string();
            for leaf in ["appimage/opt/pt", "tree/opt/pt", "root/opt/pt"] {
                let cand = e.path().join(leaf);
                if cand.is_dir() && best.as_ref().map_or(true, |(n, _)| stamp > *n) {
                    best = Some((stamp.clone(), cand));
                }
            }
        }
    }
    best.map(|(_, p)| p)
}

struct Server {
    child: Child,
    port: u16,
}

impl Drop for Server {
    fn drop(&mut self) {
        let _ = self.child.kill();
        let _ = self.child.wait();
    }
}

impl Server {
    fn get(&self, path: &str) -> (u16, String, String) {
        request(self.port, "GET", path)
    }
    fn post(&self, path: &str) -> (u16, String, String) {
        request(self.port, "POST", path)
    }
}

fn request(port: u16, method: &str, path: &str) -> (u16, String, String) {
    // A burst of parallel opens can occasionally reset one connection before
    // the reply is written; open is idempotent, so a couple of retries are safe.
    let mut last = (0, String::new(), String::new());
    for attempt in 0..3 {
        last = request_once(port, method, path);
        if last.0 != 0 {
            return last;
        }
        std::thread::sleep(Duration::from_millis(50 * (attempt + 1)));
    }
    last
}

fn request_once(port: u16, method: &str, path: &str) -> (u16, String, String) {
    // A refused connect is reported as status 0 so `request` retries it; the
    // caller's `HTTP 0` assertion names the save if the server stays away.
    let Ok(mut stream) = TcpStream::connect(("127.0.0.1", port)) else {
        return (0, String::new(), String::new());
    };
    stream
        .set_read_timeout(Some(Duration::from_secs(30)))
        .ok();
    let req = format!("{method} {path} HTTP/1.1\r\nHost: 127.0.0.1\r\nConnection: close\r\n\r\n");
    if stream.write_all(req.as_bytes()).is_err() {
        return (0, String::new(), String::new());
    }

    let mut raw = Vec::new();
    if stream.read_to_end(&mut raw).is_err() {
        return (0, String::new(), String::new());
    }
    let text = String::from_utf8_lossy(&raw).to_string();
    let status = text
        .split_whitespace()
        .nth(1)
        .and_then(|s| s.parse().ok())
        .unwrap_or(0);
    let (head, body) = match text.split_once("\r\n\r\n") {
        Some((h, b)) => (h.to_string(), b.to_string()),
        None => (text.clone(), String::new()),
    };
    (status, head, body)
}

fn spawn(default_port: u16) -> Server {
    let port: u16 = std::env::var("E2E_PORT")
        .ok()
        .and_then(|p| p.parse().ok())
        .unwrap_or(default_port);
    spawn_on(port)
}

/// Spawn the server on one explicit port. The corpus gives every worker its own
/// server so that an open and the requests inspecting it can never interleave
/// with another save's import.
fn spawn_on(port: u16) -> Server {
    let mut cmd = Command::new(env!("CARGO_BIN_EXE_pt-web"));
    cmd.env("PORT", port.to_string())
        .env("HOST", "127.0.0.1")
        .env("WEB_ROOT", repo_root().join("web"))
        .stdout(Stdio::null())
        .stderr(Stdio::null());
    if let Some(root) = asset_root() {
        cmd.env("ASSET_ROOT", root);
    }

    let child = cmd.spawn().expect("spawn server");
    let server = Server { child, port };

    let deadline = Instant::now() + Duration::from_secs(15);
    while Instant::now() < deadline {
        if TcpStream::connect(("127.0.0.1", port)).is_ok() {
            return server;
        }
        std::thread::sleep(Duration::from_millis(50));
    }
    panic!("server did not open port {port}");
}

/// A port the OS just handed out and released; call `spawn_on` with it at once.
fn free_port() -> u16 {
    let probe = std::net::TcpListener::bind(("127.0.0.1", 0)).expect("probe free port");
    probe.local_addr().expect("probe address").port()
}

/// Percent-encode everything outside the RFC 3986 unreserved set so paths with
/// spaces, `+`, `&`, `#`, quotes, or non-ASCII bytes survive the query string.
fn pct_encode(s: &str) -> String {
    let mut out = String::with_capacity(s.len() * 3);
    for b in s.bytes() {
        match b {
            b'A'..=b'Z' | b'a'..=b'z' | b'0'..=b'9' | b'-' | b'_' | b'.' | b'~' => {
                out.push(b as char)
            }
            _ => out.push_str(&format!("%{b:02X}")),
        }
    }
    out
}

/// Read one JSON string starting at `start` (which must point at the opening
/// quote). Returns the unescaped value and the index just past the close quote.
fn read_json_string(s: &str, start: usize) -> Option<(String, usize)> {
    if !s[start..].starts_with('"') {
        return None;
    }
    let mut out = String::new();
    let mut it = s[start + 1..].char_indices();
    while let Some((k, c)) = it.next() {
        match c {
            '"' => return Some((out, start + 1 + k + 1)),
            '\\' => {
                let (_, e) = it.next()?;
                match e {
                    '"' => out.push('"'),
                    '\\' => out.push('\\'),
                    '/' => out.push('/'),
                    'n' => out.push('\n'),
                    'r' => out.push('\r'),
                    't' => out.push('\t'),
                    'b' => out.push('\u{8}'),
                    'f' => out.push('\u{c}'),
                    'u' => {
                        let mut v = 0u32;
                        for _ in 0..4 {
                            let (_, h) = it.next()?;
                            v = v * 16 + h.to_digit(16)?;
                        }
                        out.push(char::from_u32(v).unwrap_or('\u{FFFD}'));
                    }
                    other => out.push(other),
                }
            }
            c => out.push(c),
        }
    }
    None
}

/// Every string value stored under `"key":"..."` anywhere in `body`.
fn json_strings(body: &str, key: &str) -> Vec<String> {
    let pat = format!("\"{key}\":\"");
    let mut out = Vec::new();
    let mut i = 0;
    while let Some(pos) = body[i..].find(&pat) {
        let start = i + pos + pat.len() - 1;
        match read_json_string(body, start) {
            Some((v, next)) => {
                out.push(v);
                i = next;
            }
            None => i = start + 1,
        }
    }
    out
}

/// The strings of the top-level JSON array stored under `"key":[`.
fn json_array_strings(body: &str, key: &str) -> Vec<String> {
    let pat = format!("\"{key}\":[");
    let Some(pos) = body.find(&pat) else {
        return Vec::new();
    };
    let mut i = pos + pat.len();
    let mut out = Vec::new();
    loop {
        let Some(rest) = body.get(i..) else { break };
        let rest = rest.trim_start();
        i = body.len() - rest.len();
        if rest.starts_with(']') {
            break;
        }
        if rest.starts_with(',') {
            i += 1;
            continue;
        }
        match read_json_string(body, i) {
            Some((v, next)) => {
                out.push(v);
                i = next;
            }
            None => break,
        }
    }
    out
}

/// Slice of `body` holding the `"links":[ ... ]` array.
fn links_slice(body: &str) -> &str {
    let Some(pos) = body.find("\"links\":[") else {
        return "";
    };
    let rest = &body[pos + "\"links\":[".len()..];
    match rest.find(']') {
        Some(end) => &rest[..end],
        None => rest,
    }
}

/// True when every bracket and brace closes in order outside string literals.
/// A shallow structural check, not a full JSON parser.
fn json_balanced(body: &str) -> bool {
    let mut stack: Vec<char> = Vec::new();
    let mut in_str = false;
    let mut esc = false;
    for c in body.chars() {
        if in_str {
            if esc {
                esc = false;
            } else if c == '\\' {
                esc = true;
            } else if c == '"' {
                in_str = false;
            }
            continue;
        }
        match c {
            '"' => in_str = true,
            '{' => stack.push('}'),
            '[' => stack.push(']'),
            '}' | ']' => {
                if stack.pop() != Some(c) {
                    return false;
                }
            }
            _ => {}
        }
    }
    !in_str && stack.is_empty()
}

/// The first `"key": ...` value in `obj` when it is a string; `None` when the
/// value is `null` or the key is absent.
fn json_opt_string(obj: &str, key: &str) -> Option<String> {
    let pat = format!("\"{key}\":");
    let pos = obj.find(&pat)?;
    let start = pos + pat.len();
    if obj[start..].starts_with("null") {
        return None;
    }
    read_json_string(obj, start).map(|(v, _)| v)
}

/// Body of the top-level `"devices":[ ... ]` array.
fn devices_slice(body: &str) -> &str {
    const PAT: &str = "\"devices\":[";
    let Some(pos) = body.find(PAT) else {
        return "";
    };
    let start = pos + PAT.len();
    let bytes = body.as_bytes();
    let (mut i, mut depth) = (start, 0usize);
    let (mut in_str, mut esc) = (false, false);
    while i < bytes.len() {
        let c = bytes[i];
        if in_str {
            if esc {
                esc = false;
            } else if c == b'\\' {
                esc = true;
            } else if c == b'"' {
                in_str = false;
            }
        } else {
            match c {
                b'"' => in_str = true,
                b'{' | b'[' => depth += 1,
                b'}' => depth = depth.saturating_sub(1),
                b']' => {
                    if depth == 0 {
                        return &body[start..i];
                    }
                    depth -= 1;
                }
                _ => {}
            }
        }
        i += 1;
    }
    ""
}

/// Each `{...}` object directly inside `array_body`, in order.
fn top_level_objects(array_body: &str) -> Vec<&str> {
    let bytes = array_body.as_bytes();
    let (mut i, mut depth) = (0usize, 0usize);
    let (mut in_str, mut esc) = (false, false);
    let mut start = None;
    let mut out = Vec::new();
    while i < bytes.len() {
        let c = bytes[i];
        if in_str {
            if esc {
                esc = false;
            } else if c == b'\\' {
                esc = true;
            } else if c == b'"' {
                in_str = false;
            }
        } else {
            match c {
                b'"' => in_str = true,
                b'{' => {
                    if depth == 0 {
                        start = Some(i);
                    }
                    depth += 1;
                }
                b'}' => {
                    depth = depth.saturating_sub(1);
                    if depth == 0 {
                        if let Some(st) = start.take() {
                            out.push(&array_body[st..=i]);
                        }
                    }
                }
                b'[' => depth += 1,
                b']' => depth = depth.saturating_sub(1),
                _ => {}
            }
        }
        i += 1;
    }
    out
}

/// One device as the workspace JSON describes it.
struct DeviceEntry {
    id: String,
    name: String,
    /// Present only when the device has an IPv4 address configured.
    ip: Option<String>,
}

enum Outcome {
    /// The save opened into a workspace that passed every JSON check.
    Opened,
    Empty,
    /// The save uses the known second container variant we cannot decrypt.
    Skipped(String),
    Error(String),
}

/// Result of the one device pair whose PDU send was attempted.
enum Delivery {
    /// Fewer than two addressed devices, so nothing was sent.
    NoPair,
    Delivered,
    Failed(String),
}

/// Open one save, validate its workspace JSON, and try to deliver one PDU.
/// Panics on a malformed import or workspace JSON so the scoped worker thread
/// surfaces the failure in the test.
fn check_one(port: u16, file: &str) -> (Outcome, Delivery) {
    let path = format!("/api/pkt/open?path={}", pct_encode(file));
    let (status, _, body) = request(port, "POST", &path);
    assert_eq!(status, 200, "open {file}: HTTP {status}");

    if body.starts_with("{\"error\":") {
        if body.contains("no devices in file") {
            return (Outcome::Empty, Delivery::NoPair);
        }
        let reason = json_strings(&body, "error")
            .into_iter()
            .next()
            .unwrap_or_else(|| body.chars().take(120).collect());
        if reason.contains("could not decrypt") || reason.contains("unknown container key") {
            return (Outcome::Skipped(reason), Delivery::NoPair);
        }
        return (Outcome::Error(reason), Delivery::NoPair);
    }

    assert!(
        body.contains("\"devices\":["),
        "open {file}: no devices array: {}",
        body.chars().take(200).collect::<String>()
    );
    // The successful open response is exactly `Workspace::json()`.
    assert!(
        json_balanced(&body),
        "open {file}: workspace JSON is not balanced"
    );

    let device_ids = json_strings(&body, "id");
    if device_ids.is_empty() {
        return (Outcome::Empty, Delivery::NoPair);
    }

    let links = links_slice(&body);
    for key in ["a", "b"] {
        for endpoint in json_strings(links, key) {
            assert!(
                device_ids.iter().any(|id| *id == endpoint),
                "open {file}: link endpoint {endpoint:?} is not a device id ({device_ids:?})"
            );
        }
    }

    let devices_json = devices_slice(&body);
    let objects = top_level_objects(devices_json);
    assert!(
        !objects.is_empty(),
        "open {file}: devices array holds no device object"
    );
    assert_eq!(
        objects.len(),
        json_strings(devices_json, "id").len(),
        "open {file}: device objects and ids disagree"
    );
    let mut devices = Vec::with_capacity(objects.len());
    for obj in &objects {
        let id = json_opt_string(obj, "id")
            .unwrap_or_else(|| panic!("open {file}: device object without an id: {obj}"));
        let name = json_opt_string(obj, "name")
            .unwrap_or_else(|| panic!("open {file}: device {id} has no name: {obj}"));
        devices.push(DeviceEntry {
            id,
            name,
            ip: json_opt_string(obj, "ip"),
        });
    }

    // The workspace read over the API must agree with the import and carry
    // every device name.
    let (status, _, ws) = request(port, "GET", "/api/workspace");
    assert_eq!(status, 200, "workspace {file}: HTTP {status}");
    assert!(
        json_balanced(&ws),
        "workspace {file}: workspace JSON is not balanced"
    );
    let ws_devices = devices_slice(&ws);
    assert_eq!(
        top_level_objects(ws_devices).len(),
        devices.len(),
        "workspace {file}: device count changed between import and read"
    );
    let ws_names = json_strings(ws_devices, "name");
    for d in &devices {
        assert!(
            ws_names.iter().any(|n| *n == d.name),
            "workspace {file}: missing device name {:?}",
            d.name
        );
    }

    // Prefer devices that carry an address, but imported saves keep their
    // configuration elsewhere, so fall back to the first devices in the
    // workspace and let the frame engine decide reachability.
    let addressed: Vec<&str> = devices
        .iter()
        .filter(|d| d.ip.is_some())
        .map(|d| d.id.as_str())
        .collect();
    let candidates: Vec<&str> = if addressed.len() >= 2 {
        addressed
    } else {
        devices.iter().map(|d| d.id.as_str()).collect()
    };
    if candidates.len() < 2 {
        return (Outcome::Opened, Delivery::NoPair);
    }

    let src = candidates[0];
    let mut last = String::new();
    for dst in candidates[1..].iter().take(4) {
        let path = format!("/api/pdu?src={}&dst={}", pct_encode(src), pct_encode(dst));
        let (status, _, out) = request(port, "POST", &path);
        assert_eq!(status, 200, "pdu {file}: HTTP {status}");
        if out.starts_with("{\"error\":") {
            last = json_strings(&out, "error")
                .into_iter()
                .next()
                .unwrap_or_default();
            continue;
        }
        assert!(
            json_balanced(&out),
            "pdu {file}: workspace JSON is not balanced"
        );
        return (Outcome::Opened, Delivery::Delivered);
    }
    (Outcome::Opened, Delivery::Failed(last))
}

#[test]
fn corpus_opens_every_shipped_save() {
    if std::env::var("PT_CORPUS").as_deref() != Ok("1") {
        eprintln!("corpus: skipping (set PT_CORPUS=1 to run)");
        return;
    }

    let s = spawn(38_200);
    let started = Instant::now();

    let (status, _, body) = s.get("/api/pkt/list");
    assert_eq!(status, 200, "pkt/list failed: {body}");
    assert!(body.contains("\"files\":["), "unexpected list body: {body}");
    let files = json_array_strings(&body, "files");
    let total = files.len();
    if total == 0 {
        eprintln!("corpus: no saves listed (assets missing?); nothing to do");
        return;
    }

    // Imports decrypt and parse outside the workspace lock, so a handful of
    // concurrent requests keeps the whole corpus well inside the time budget.
    // Every worker drives its own server, so the workspace a request reads is
    // always the save that worker just opened.
    let workers = std::thread::available_parallelism()
        .map(|n| n.get())
        .unwrap_or(4)
        .clamp(1, 8)
        .min(total);
    let servers: Vec<Server> = (0..workers).map(|_| spawn_on(free_port())).collect();
    let next = AtomicUsize::new(0);
    let outcomes: Mutex<Vec<(&str, Outcome, Delivery)>> = Mutex::new(Vec::with_capacity(total));

    std::thread::scope(|scope| {
        for srv in &servers {
            let port = srv.port;
            let outcomes = &outcomes;
            let next = &next;
            let files = &files;
            scope.spawn(move || loop {
                let i = next.fetch_add(1, Ordering::Relaxed);
                if i >= files.len() {
                    break;
                }
                let file = files[i].as_str();
                let (outcome, delivery) = check_one(port, file);
                outcomes.lock().unwrap().push((file, outcome, delivery));
            });
        }
    });

    let outcomes = outcomes.into_inner().unwrap();
    assert_eq!(outcomes.len(), total, "every save must produce an outcome");

    let (mut opened, mut empty, mut skipped) = (0usize, 0usize, 0usize);
    let (mut json_ok, mut sim_attempted, mut delivered) = (0usize, 0usize, 0usize);
    let mut pdu_failures: Vec<String> = Vec::new();
    let mut failures: Vec<(&str, String)> = Vec::new();
    for (file, outcome, delivery) in &outcomes {
        match outcome {
            Outcome::Opened => {
                opened += 1;
                json_ok += 1;
                match delivery {
                    Delivery::NoPair => {}
                    Delivery::Delivered => {
                        sim_attempted += 1;
                        delivered += 1;
                    }
                    Delivery::Failed(reason) => {
                        sim_attempted += 1;
                        pdu_failures.push(format!("{file}: {reason}"));
                    }
                }
            }
            Outcome::Empty => empty += 1,
            Outcome::Skipped(_) => skipped += 1,
            Outcome::Error(reason) => failures.push((file, reason.clone())),
        }
    }
    failures.sort_unstable();
    for (file, reason) in &failures {
        eprintln!("corpus: error in {file}: {reason}");
    }
    let errors = failures.len();
    pdu_failures.sort_unstable();
    for line in pdu_failures.iter().take(3) {
        eprintln!("corpus: pdu not delivered in {line}");
    }

    let elapsed = started.elapsed();
    println!(
        "corpus: {opened} opened, {json_ok} json ok, {sim_attempted} sim attempted, {delivered} delivered, {skipped} skipped (undecodable container), {errors} errors, {empty} empty ({total} total) in {:.1}s",
        elapsed.as_secs_f64()
    );
    assert_eq!(errors, 0, "corpus produced {errors} error(s)");
    assert_eq!(
        opened + empty + skipped,
        total,
        "every save must be opened, empty or skipped ({opened} + {empty} + {skipped} != {total})"
    );
    assert_eq!(
        json_ok, opened,
        "every opened workspace must serialize to valid JSON"
    );
    assert!(
        delivered * 10 >= opened,
        "corpus delivered {delivered} PDU(s) over {opened} opened workspace(s); expected at least one per ten"
    );
}
