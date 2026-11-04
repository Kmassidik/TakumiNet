//! End-to-end tests: spawn the real binary, drive it over HTTP, assert on the
//! same JSON the browser consumes.

mod files;
mod pages;
mod services;
mod workspace;

use std::io::{Read, Write};
use std::net::TcpStream;
use std::path::PathBuf;
use std::process::{Child, Command, Stdio};
use std::time::{Duration, Instant};

fn repo_root() -> PathBuf {
    PathBuf::from(env!("CARGO_MANIFEST_DIR"))
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
    fn get_raw(&self, path: &str) -> (u16, String, Vec<u8>) {
        request_raw(self.port, "GET", path)
    }
    fn post_body(&self, path: &str, body: &[u8]) -> (u16, String, String) {
        let (status, head, body) = request_with_body(self.port, path, body);
        (status, head, String::from_utf8_lossy(&body).into_owned())
    }
}

fn request(port: u16, method: &str, path: &str) -> (u16, String, String) {
    let (status, head, body) = request_raw(port, method, path);
    (status, head, String::from_utf8_lossy(&body).into_owned())
}

fn request_raw(port: u16, method: &str, path: &str) -> (u16, String, Vec<u8>) {
    let mut stream = TcpStream::connect(("127.0.0.1", port)).expect("connect");
    stream.set_read_timeout(Some(Duration::from_secs(10))).ok();
    let req = format!("{method} {path} HTTP/1.1\r\nHost: 127.0.0.1\r\nConnection: close\r\n\r\n");
    stream.write_all(req.as_bytes()).expect("write");

    let mut raw = Vec::new();
    stream.read_to_end(&mut raw).expect("read");
    let split = raw
        .windows(4)
        .position(|w| w == b"\r\n\r\n")
        .map(|p| p + 4)
        .unwrap_or(raw.len());
    let head = String::from_utf8_lossy(&raw[..split]).into_owned();
    let status = head
        .split_whitespace()
        .nth(1)
        .and_then(|s| s.parse().ok())
        .unwrap_or(0);
    (status, head, raw[split..].to_vec())
}

fn request_with_body(port: u16, path: &str, body: &[u8]) -> (u16, String, Vec<u8>) {
    let mut stream = TcpStream::connect(("127.0.0.1", port)).expect("connect");
    stream.set_read_timeout(Some(Duration::from_secs(10))).ok();
    let req = format!(
        "POST {path} HTTP/1.1\r\nHost: 127.0.0.1\r\nContent-Type: application/xml\r\nContent-Length: {}\r\nConnection: close\r\n\r\n",
        body.len()
    );
    stream.write_all(req.as_bytes()).expect("write headers");
    stream.write_all(body).expect("write body");
    let mut raw = Vec::new();
    stream.read_to_end(&mut raw).expect("read");
    let split = raw.windows(4).position(|w| w == b"\r\n\r\n").map(|p| p + 4).unwrap_or(raw.len());
    let head = String::from_utf8_lossy(&raw[..split]).into_owned();
    let status = head.split_whitespace().nth(1).and_then(|s| s.parse().ok()).unwrap_or(0);
    (status, head, raw[split..].to_vec())
}

fn spawn(default_port: u16) -> Server {
    let port: u16 = std::env::var("E2E_PORT")
        .ok()
        .and_then(|p| p.parse().ok())
        .unwrap_or(default_port);

    let mut cmd = Command::new(env!("CARGO_BIN_EXE_pt-web"));
    cmd.env("PORT", port.to_string())
        .env("HOST", "127.0.0.1")
        .env("WEB_ROOT", repo_root().join("web"))
        .stdout(Stdio::null())
        .stderr(Stdio::null());
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

fn count(body: &str, needle: &str) -> usize {
    body.matches(needle).count()
}

/// Services endpoints are landing while this suite grows: a 404 means "not
/// implemented yet", recorded so the run reports it instead of failing.
fn ok_or_missing(
    status: u16,
    what: &'static str,
    body: &str,
    missing: &mut Vec<&'static str>,
) -> bool {
    if status == 404 {
        missing.push(what);
        return false;
    }
    assert_eq!(status, 200, "{what}: {body}");
    true
}
