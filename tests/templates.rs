//! Native template validation and scripted failing-before / passing-after labs.

use std::io::{Read, Write};
use std::net::TcpStream;
use std::path::PathBuf;
use std::process::{Child, Command, Stdio};
use std::time::{Duration, Instant};

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
    fn get(&self, path: &str) -> (u16, String) {
        request(self.port, "GET", path)
    }

    fn post(&self, path: &str) -> (u16, String) {
        request(self.port, "POST", path)
    }

    fn post_ok(&self, path: &str) -> String {
        let (status, body) = self.post(path);
        assert_eq!(status, 200, "{path}: {body}");
        assert!(!body.contains("\"error\""), "{path}: {body}");
        body
    }

    fn open(&self, id: &str) -> String {
        self.post_ok(&format!("/api/templates/open?id={id}"))
    }

    fn set_ip(&self, id: &str, ip: &str, gateway: &str, dns: &str) {
        self.post_ok(&format!(
            "/api/devices/ip?id={id}&ip={ip}&mask=255.255.255.0&gateway={gateway}&dns={dns}"
        ));
    }

    fn command(&self, id: &str, line: &str) -> String {
        self.post_ok(&format!("/api/cmd?id={id}&line={}", encode(line)))
    }

    fn cli(&self, id: &str, line: &str) -> String {
        self.post_ok(&format!("/api/cli?id={id}&line={}", encode(line)))
    }

    fn checks(&self) -> String {
        let (status, body) = self.get("/api/checks");
        assert_eq!(status, 200, "{body}");
        body
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

fn encode(value: &str) -> String {
    let mut encoded = String::new();
    for byte in value.bytes() {
        if byte.is_ascii_alphanumeric() || matches!(byte, b'-' | b'_' | b'.' | b'~') {
            encoded.push(char::from(byte));
        } else {
            encoded.push_str(&format!("%{byte:02X}"));
        }
    }
    encoded
}

fn spawn(port: u16) -> Server {
    let root = PathBuf::from(env!("CARGO_MANIFEST_DIR"));
    let child = Command::new(env!("CARGO_BIN_EXE_pt-web"))
        .env("PORT", port.to_string())
        .env("HOST", "127.0.0.1")
        .env("WEB_ROOT", root.join("web"))
        .stdout(Stdio::null())
        .stderr(Stdio::null())
        .spawn()
        .expect("spawn template server");
    let server = Server { child, port };
    let deadline = Instant::now() + Duration::from_secs(15);
    while TcpStream::connect(("127.0.0.1", port)).is_err() {
        assert!(Instant::now() < deadline, "server did not open port {port}");
        std::thread::sleep(Duration::from_millis(50));
    }
    server
}

fn assert_check(body: &str, id: &str, passed: bool) {
    let marker = format!("{{\"id\":\"{id}\"");
    let start = body.find(&marker).unwrap_or_else(|| panic!("missing check {id}: {body}"));
    let object = &body[start..];
    let object = &object[..object.find('}').unwrap_or_else(|| panic!("unterminated check {id}: {body}"))];
    assert!(object.contains(&format!("\"passed\":{passed}")), "unexpected {id} result: {object}");
}

fn assert_all_passed(body: &str, count: usize) {
    assert!(body.contains("\"allPassed\":true"), "{body}");
    assert_eq!(body.matches("\"passed\":true").count(), count, "{body}");
    assert!(!body.contains("\"passed\":false"), "{body}");
}

#[test]
fn l17_t1_static_addresses_fail_before_and_ping_after() {
    let server = spawn(38_228);
    let initial = server.open("t1");
    assert!(initial.contains("\"id\":\"pc0\"") && initial.contains("\"id\":\"pc1\""), "{initial}");
    assert!(initial.contains("\"kind\":\"eCross\""), "{initial}");
    assert_check(&server.checks(), "c1", false);

    server.set_ip("pc0", "192.168.1.10", "", "");
    server.set_ip("pc1", "192.168.1.11", "", "");
    let ping = server.command("pc0", "ping -n 1 192.168.1.11");
    assert!(ping.contains("Reply from 192.168.1.11: bytes=32"), "{ping}");
    assert!(ping.contains("0% loss"), "{ping}");
    assert_all_passed(&server.checks(), 1);
}

#[test]
fn l18_t2_switch_star_learns_three_macs() {
    let server = spawn(38_229);
    let initial = server.open("t2");
    assert!(initial.contains("\"id\":\"switch0\""), "{initial}");
    assert_check(&server.checks(), "c1", false);
    assert_check(&server.checks(), "c4", false);

    for (id, ip) in [("pc0", "192.168.1.10"), ("pc1", "192.168.1.11"), ("pc2", "192.168.1.12")] {
        server.set_ip(id, ip, "", "");
    }
    for (from, target) in [("pc0", "192.168.1.11"), ("pc1", "192.168.1.12"), ("pc2", "192.168.1.10")] {
        let ping = server.command(from, &format!("ping -n 1 {target}"));
        assert!(ping.contains(&format!("Reply from {target}: bytes=32")), "{ping}");
        assert!(ping.contains("0% loss"), "{ping}");
    }
    server.cli("switch0", "en");
    let table = server.cli("switch0", "show mac address-table");
    assert!(table.contains("Total Mac Addresses for this criterion: 3"), "{table}");
    assert_all_passed(&server.checks(), 4);
}

#[test]
fn l19_t3_dhcp_leases_and_web_page_after_solution() {
    let server = spawn(38_230);
    let initial = server.open("t3");
    assert!(initial.contains("\"id\":\"homerouter0\""), "{initial}");
    assert!(initial.contains("\"id\":\"laptop0\""), "{initial}");
    assert_check(&server.checks(), "c1", false);
    assert_check(&server.checks(), "c3", false);

    server.set_ip("server0", "192.168.1.2", "192.168.1.1", "");
    server.post_ok("/api/devices/dhcp?id=server0&network=192.168.1.0&prefix=24&gateway=192.168.1.1&dns=192.168.1.2");
    for client in ["laptop0", "pc0"] {
        let renewed = server.command(client, "ipconfig /renew");
        assert!(renewed.contains("DHCP enabled: Yes"), "{renewed}");
        assert!(renewed.contains("Lease from server0:"), "{renewed}");
    }
    let page = server.post_ok("/api/webfetch?id=laptop0&url=http%3A%2F%2F192.168.1.2%2F");
    assert!(page.contains("\"status\":200") && page.contains("\"title\":\"Server0\""), "{page}");
    assert_all_passed(&server.checks(), 3);
}

#[test]
fn l20_t4_routed_networks_deliver_ttl127_and_connected_routes() {
    let server = spawn(38_231);
    let initial = server.open("t4");
    assert!(initial.contains("\"id\":\"router0\"") && initial.contains("\"id\":\"switch1\""), "{initial}");
    let (status, ports) = server.get("/api/devices/ports?id=router0");
    assert_eq!(status, 200, "{ports}");
    assert!(ports.contains("\"up\":false"), "router interfaces must start shut down: {ports}");
    assert_check(&server.checks(), "c1", false);

    for (id, ip, gateway) in [
        ("pc0", "192.168.1.10", "192.168.1.1"),
        ("pc1", "192.168.1.11", "192.168.1.1"),
        ("pc2", "192.168.2.10", "192.168.2.1"),
        ("pc3", "192.168.2.11", "192.168.2.1"),
    ] {
        server.set_ip(id, ip, gateway, "");
    }
    for line in [
        "en", "conf t", "interface g0/0", "ip address 192.168.1.1 255.255.255.0", "no shutdown",
        "interface g0/1", "ip address 192.168.2.1 255.255.255.0", "no shutdown", "end",
    ] {
        let output = server.cli("router0", line);
        assert!(!output.contains("% Invalid") && !output.contains("% Incomplete"), "{line}: {output}");
    }
    let ping = server.command("pc0", "ping -n 1 192.168.2.11");
    assert!(ping.contains("Reply from 192.168.2.11: bytes=32"), "{ping}");
    assert!(ping.contains("TTL=127") && ping.contains("0% loss"), "{ping}");
    let routes = server.cli("router0", "show ip route");
    assert!(routes.contains("192.168.1.0/24") && routes.contains("192.168.2.0/24"), "{routes}");
    assert_all_passed(&server.checks(), 4);
}

#[test]
fn l21_t5_dns_name_resolves_and_opens_website_after_solution() {
    let server = spawn(38_232);
    let initial = server.open("t5");
    assert!(initial.contains("\"id\":\"server0\"") && initial.contains("\"dnsRecords\":[]"), "{initial}");
    assert_check(&server.checks(), "c1", false);
    assert_check(&server.checks(), "c2", false);

    server.set_ip("server0", "192.168.1.100", "", "");
    server.set_ip("pc0", "192.168.1.10", "", "192.168.1.100");
    server.set_ip("pc1", "192.168.1.11", "", "192.168.1.100");
    server.post_ok("/api/devices/dns?id=server0&name=www.takumi.lab&ip=192.168.1.100");
    server.post_ok("/api/devices/http?id=server0&body=Welcome%20to%20the%20Takumi%20lab");
    let lookup = server.command("pc0", "nslookup www.takumi.lab");
    assert!(lookup.contains("Name:    www.takumi.lab"), "{lookup}");
    assert!(lookup.contains("Address:  192.168.1.100"), "{lookup}");
    let page = server.post_ok("/api/webfetch?id=pc0&url=http%3A%2F%2Fwww.takumi.lab%2F");
    assert!(page.contains("\"status\":200") && page.contains("\"title\":\"Server0\""), "{page}");
    assert!(page.contains("Welcome to the Takumi lab"), "{page}");
    assert_all_passed(&server.checks(), 2);
}

#[test]
fn l16_every_native_template_loads_without_unresolved_devices_or_ports() {
    let root = PathBuf::from(env!("CARGO_MANIFEST_DIR"));
    let server = spawn(38_227);
    let (status, body) = server.get("/api/templates");
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
        let (status, body) = server.post(&format!("/api/templates/open?id={id}"));
        assert_eq!(status, 200, "{}: {body}", path.display());
        assert!(!body.contains("\"error\""), "{} has unresolved devices/ports: {body}", path.display());
        assert!(body.contains("\"lesson\":{"), "{} has no lesson metadata: {body}", path.display());
    }
}
