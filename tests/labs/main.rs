//! Canonical CCNA labs driven through the same HTTP API as the workspace UI.

use std::io::{Read, Write};
use std::net::TcpStream;
use std::path::PathBuf;
use std::process::{Child, Command, Stdio};
use std::time::{Duration, Instant};

struct Lab {
    child: Child,
    port: u16,
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
        let lab = Self { child, port };
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
        let mut stream = TcpStream::connect(("127.0.0.1", self.port)).expect("connect");
        stream.set_read_timeout(Some(Duration::from_secs(10))).ok();
        let request = format!(
            "POST {path} HTTP/1.1\r\nHost: 127.0.0.1\r\nConnection: close\r\n\r\n"
        );
        stream.write_all(request.as_bytes()).expect("write");
        let mut raw = Vec::new();
        stream.read_to_end(&mut raw).expect("read");
        let response = String::from_utf8_lossy(&raw);
        assert!(response.starts_with("HTTP/1.1 200"), "{path}: {response}");
        response.split_once("\r\n\r\n").unwrap().1.to_string()
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
}

impl Drop for Lab {
    fn drop(&mut self) {
        let _ = self.child.kill();
        let _ = self.child.wait();
    }
}

#[test]
fn same_subnet_and_routed_ping_report_delivered_ttl() {
    let lab = Lab::start(39_101);
    let local = lab.command("pc0", "ping%20-n%201%20192.168.1.11");
    assert!(local.contains("TTL=128"), "{local}");
    let routed = lab.command("pc0", "ping%20-n%201%20192.168.2.10");
    assert!(routed.contains("TTL=127"), "{routed}");
}

#[test]
fn traceroute_and_arp_follow_the_delivered_path() {
    let lab = Lab::start(39_102);
    let trace = lab.command("pc0", "tracert%20192.168.2.10");
    assert!(trace.contains("192.168.1.1"), "{trace}");
    assert!(trace.contains("192.168.2.10"), "{trace}");
    assert!(trace.contains("Trace complete"), "{trace}");
    let arp = lab.command("pc0", "arp%20-a");
    assert!(arp.contains("192.168.1.1"), "{arp}");
    assert!(!arp.contains("192.168.2.10"), "{arp}");
}

#[test]
fn unreachable_and_expired_icmp_are_reported() {
    let lab = Lab::start(39_103);
    let unreachable = lab.command("pc0", "ping%20-n%201%2010.9.9.9");
    assert!(unreachable.contains("100% loss"), "{unreachable}");
    let expired = lab.command("pc0", "tracert%20-h%201%20192.168.2.10");
    assert!(expired.contains("192.168.1.1"), "{expired}");
    assert!(!expired.contains("Trace complete"), "{expired}");
}
