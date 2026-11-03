//! Native template validation. P2 adds each scripted failing-before /
//! passing-after solution here without changing the validator hook.

use std::io::{Read, Write};
use std::net::TcpStream;
use std::path::PathBuf;
use std::process::{Child, Command, Stdio};
use std::time::{Duration, Instant};

struct Server(Child);
impl Drop for Server {
    fn drop(&mut self) {
        let _ = self.0.kill();
        let _ = self.0.wait();
    }
}

fn request(port: u16, method: &str, path: &str) -> (u16, String) {
    let mut stream = TcpStream::connect(("127.0.0.1", port)).expect("connect");
    stream.set_read_timeout(Some(Duration::from_secs(10))).ok();
    write!(stream, "{method} {path} HTTP/1.1\r\nHost: 127.0.0.1\r\nConnection: close\r\n\r\n").unwrap();
    let mut raw = Vec::new();
    stream.read_to_end(&mut raw).unwrap();
    let split = raw.windows(4).position(|window| window == b"\r\n\r\n").map(|index| index + 4).unwrap_or(raw.len());
    let head = String::from_utf8_lossy(&raw[..split]);
    let status = head.split_whitespace().nth(1).and_then(|value| value.parse().ok()).unwrap_or(0);
    (status, String::from_utf8_lossy(&raw[split..]).into_owned())
}

#[test]
fn l16_every_native_template_loads_without_unresolved_devices_or_ports() {
    let root = PathBuf::from(env!("CARGO_MANIFEST_DIR"));
    let port = 38_227;
    let child = Command::new(env!("CARGO_BIN_EXE_pt-web"))
        .env("PORT", port.to_string())
        .env("HOST", "127.0.0.1")
        .env("WEB_ROOT", root.join("web"))
        .stdout(Stdio::null())
        .stderr(Stdio::null())
        .spawn()
        .expect("spawn template validator server");
    let _server = Server(child);
    let deadline = Instant::now() + Duration::from_secs(15);
    while TcpStream::connect(("127.0.0.1", port)).is_err() {
        assert!(Instant::now() < deadline, "server did not open port {port}");
        std::thread::sleep(Duration::from_millis(50));
    }

    let (status, body) = request(port, "GET", "/api/templates");
    assert_eq!(status, 200);
    assert!(!body.contains("\"error\""), "gallery rejected a native template: {body}");
    let directory = root.join("web/templates");
    let entries = match std::fs::read_dir(directory) {
        Ok(entries) => entries,
        Err(error) if error.kind() == std::io::ErrorKind::NotFound => return,
        Err(error) => panic!("cannot enumerate templates: {error}"),
    };
    let mut paths: Vec<PathBuf> = entries.flatten().map(|entry| entry.path())
        .filter(|path| path.extension().and_then(|extension| extension.to_str()) == Some("tnet"))
        .collect();
    paths.sort();
    for path in paths {
        let id = path.file_stem().unwrap().to_string_lossy();
        let (status, body) = request(port, "POST", &format!("/api/templates/open?id={id}"));
        assert_eq!(status, 200, "{}: {body}", path.display());
        assert!(!body.contains("\"error\""), "{} has unresolved devices/ports: {body}", path.display());
        assert!(body.contains("\"lesson\":{"), "{} has no lesson metadata: {body}", path.display());
    }
}
