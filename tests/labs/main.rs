//! Canonical CCNA labs driven through the same HTTP API as the workspace UI.

use std::fs::File;
use std::io::{Read, Write};
use std::net::TcpStream;
use std::path::PathBuf;
use std::process::{Child, Command, Stdio};
use std::time::{Duration, Instant};

mod basics;
mod routing;
mod routing_igp;
mod services;
mod switching;

struct Lab {
    child: Child,
    port: u16,
    fixture: Option<File>,
}

impl Lab {
    fn start(port: u16) -> Self {
        let child = Command::new(env!("CARGO_BIN_EXE_pt-web"))
            .env("PORT", port.to_string())
            .env("HOST", "127.0.0.1")
            .env("WEB_ROOT", PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("web"))
            .stdout(Stdio::null())
            .stderr(Stdio::null())
            .spawn()
            .expect("spawn lab server");
        let lab = Self {
            child,
            port,
            fixture: std::env::var_os("LAB_FIXTURE_DIR").map(|directory| {
                let directory = PathBuf::from(directory);
                std::fs::create_dir_all(&directory).expect("create lab fixture directory");
                File::create(directory.join(format!("{port}.jsonl"))).expect("create lab fixture")
            }),
        };
        let deadline = Instant::now() + Duration::from_secs(15);
        while Instant::now() < deadline {
            if TcpStream::connect(("127.0.0.1", port)).is_ok() {
                return lab;
            }
            std::thread::sleep(Duration::from_millis(50));
        }
        panic!("lab server did not open port {port}");
    }

    fn post(&self, path: &str) -> String {
        self.request("POST", path)
    }

    fn get(&self, path: &str) -> String {
        self.request("GET", path)
    }

    fn request(&self, method: &str, path: &str) -> String {
        let mut stream = TcpStream::connect(("127.0.0.1", self.port)).expect("connect");
        stream.set_read_timeout(Some(Duration::from_secs(10))).ok();
        let request = format!(
            "{method} {path} HTTP/1.1\r\nHost: 127.0.0.1\r\nConnection: close\r\n\r\n"
        );
        stream.write_all(request.as_bytes()).expect("write");
        let mut raw = Vec::new();
        stream.read_to_end(&mut raw).expect("read");
        let response = String::from_utf8_lossy(&raw);
        let (headers, body) = response.split_once("\r\n\r\n").unwrap();
        if let Some(fixture) = &self.fixture {
            let status = headers
                .split_whitespace()
                .nth(1)
                .and_then(|status| status.parse::<u16>().ok())
                .expect("HTTP response status");
            let content_type = headers
                .lines()
                .find_map(|line| {
                    let (name, value) = line.split_once(':')?;
                    name.eq_ignore_ascii_case("content-type")
                        .then(|| value.trim())
                })
                .unwrap_or("");
            let offset = raw
                .windows(4)
                .position(|window| window == b"\r\n\r\n")
                .map(|position| position + 4)
                .expect("HTTP response body");
            let record = format!(
                "{{\"method\":{},\"target\":{},\"body\":\"{}\",\"status\":{},\"contentType\":{},\"response\":\"{}\"}}\n",
                json_string(method),
                json_string(path),
                base64(&[]),
                status,
                json_string(content_type),
                base64(&raw[offset..]),
            );
            let mut fixture = fixture;
            fixture.write_all(record.as_bytes()).expect("write lab fixture");
        }
        assert!(response.starts_with("HTTP/1.1 200"), "{path}: {response}");
        body.to_string()
    }

    fn cli(&self, device: &str, line: &str) -> String {
        let body = self.post(&format!("/api/cli?id={device}&line={line}"));
        body.split("\"output\":\"").nth(1).map_or(body.clone(), |out| {
            out.split("\",")
                .next()
                .unwrap_or(out)
                .replace("\\n", "\n")
                .replace("\\\"", "\"")
                .to_string()
        })
    }

    fn cli_prompt(&self, device: &str, line: &str) -> String {
        let body = self.post(&format!("/api/cli?id={device}&line={line}"));
        body.split("\"prompt\":\"")
            .nth(1)
            .and_then(|prompt| prompt.split('"').next())
            .expect("CLI prompt")
            .to_string()
    }

    fn command(&self, device: &str, line: &str) -> String {
        let body = self.post(&format!("/api/cmd?id={device}&line={line}"));
        body.split("\"output\":\"").nth(1).map_or(body.clone(), |out| {
            out.split("\",")
                .next()
                .unwrap_or(out)
                .replace("\\n", "\n")
                .replace("\\\"", "\"")
                .to_string()
        })
    }

    fn clear_demo(&self) {
        for id in ["router0", "switch0", "switch1", "pc0", "pc1", "pc2", "server0"] {
            self.post(&format!("/api/devices/delete?id={id}"));
        }
    }

    fn device(&self, model: &str, id: &str, x: usize, y: usize) {
        let body = self.post(&format!("/api/devices?model={model}&x={x}&y={y}"));
        assert!(body.contains(&format!("\"id\":\"{id}\"")), "add {id}: {body}");
    }

    fn link(&self, a: &str, b: &str) {
        let body = self.post(&format!("/api/links?a={a}&b={b}"));
        assert!(!body.contains("\"error\""), "link {a}-{b}: {body}");
    }

    fn config<I, S>(&self, device: &str, lines: I)
    where
        I: IntoIterator<Item = S>,
        S: AsRef<str>,
    {
        for line in lines {
            let line = line.as_ref();
            let out = self.cli(device, &encode(line));
            // Helpers may enter configuration separately for every interface;
            // `enable` is intentionally idempotent across those sequences.
            if line == "en" && out.contains("% Invalid input") {
                continue;
            }
            assert!(
                !out.lines().any(|message| {
                    message.starts_with('%') && !message.starts_with("%LINK-")
                }),
                "{device}> {line}: {out}"
            );
        }
    }

    fn address(&self, device: &str, interface: &str, ip: &str, mask: &str) {
        self.config(
            device,
            [
                "en".to_string(),
                "conf t".to_string(),
                format!("interface {interface}"),
                format!("ip address {ip} {mask}"),
                "no shutdown".to_string(),
                "end".to_string(),
            ],
        );
    }

    fn host(&self, id: &str, ip: &str, gateway: &str) {
        let body = self.post(&format!(
            "/api/devices/ip?id={id}&ip={ip}&mask=255.255.255.0&gateway={gateway}"
        ));
        assert!(!body.contains("\"error\""), "address {id}: {body}");
    }

    fn cmd(&self, device: &str, line: &str) -> String {
        self.command(device, &encode(line))
    }

    fn save_reset_load(&self, name: &str) {
        let saved = self.post(&format!("/api/save?name={name}"));
        assert!(!saved.contains("\"error\""), "save {name}: {saved}");
        self.post("/api/reset");
        let loaded = self.post(&format!("/api/load?name={name}"));
        assert!(!loaded.contains("\"error\""), "load {name}: {loaded}");
    }
}

fn json_string(value: &str) -> String {
    let mut encoded = String::with_capacity(value.len() + 2);
    encoded.push('"');
    for character in value.chars() {
        match character {
            '"' => encoded.push_str("\\\""),
            '\\' => encoded.push_str("\\\\"),
            '\n' => encoded.push_str("\\n"),
            '\r' => encoded.push_str("\\r"),
            '\t' => encoded.push_str("\\t"),
            character if character <= '\u{1f}' => {
                encoded.push_str(&format!("\\u{:04x}", character as u32));
            }
            character => encoded.push(character),
        }
    }
    encoded.push('"');
    encoded
}

fn base64(bytes: &[u8]) -> String {
    const ALPHABET: &[u8; 64] =
        b"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    let mut encoded = String::with_capacity((bytes.len() + 2) / 3 * 4);
    for chunk in bytes.chunks(3) {
        encoded.push(ALPHABET[(chunk[0] >> 2) as usize] as char);
        encoded.push(
            ALPHABET[((chunk[0] & 0x03) << 4 | chunk.get(1).copied().unwrap_or(0) >> 4) as usize]
                as char,
        );
        encoded.push(if chunk.len() > 1 {
            ALPHABET[((chunk[1] & 0x0f) << 2 | chunk.get(2).copied().unwrap_or(0) >> 6) as usize]
                as char
        } else {
            '='
        });
        encoded.push(if chunk.len() > 2 {
            ALPHABET[(chunk[2] & 0x3f) as usize] as char
        } else {
            '='
        });
    }
    encoded
}

fn encode(line: &str) -> String {
    line.replace('%', "%25").replace(' ', "%20").replace('/', "%2F")
}

fn assert_ping(lab: &Lab, source: &str, target: &str, ttl: u8) {
    let out = lab.cmd(source, &format!("ping -n 1 {target}"));
    if !(out.contains(&format!("Reply from {target}: bytes=32"))
        && out.contains(&format!("TTL={ttl}"))
        && out.contains("0% loss"))
    {
        let trace = lab.cmd(source, &format!("tracert {target}"));
        panic!("{source} ping {target}: {out}\ntraceroute: {trace}");
    }
}

fn assert_unreachable(lab: &Lab, source: &str, target: &str) {
    let out = lab.cmd(source, &format!("ping -n 1 {target}"));
    assert!(
        out.contains("Received = 0") && out.contains("100% loss") && !out.contains("bytes=32"),
        "{source} unexpectedly reached {target}: {out}"
    );
}

fn assert_trace(lab: &Lab, source: &str, target: &str, expected: &[&str]) {
    let out = lab.cmd(source, &format!("tracert {target}"));
    assert!(out.contains("Trace complete"), "{source} trace {target}: {out}");
    let hops: Vec<&str> = out
        .lines()
        .filter_map(|line| {
            line.split_whitespace().next()?.parse::<usize>().ok()?;
            line.contains(" ms ").then(|| line.split_whitespace().last().unwrap())
        })
        .collect();
    assert_eq!(hops.as_slice(), expected, "{source} trace {target}: {out}");
}

impl Drop for Lab {
    fn drop(&mut self) {
        let _ = self.child.kill();
        let _ = self.child.wait();
    }
}
