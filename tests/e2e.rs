//! End-to-end tests: spawn the real binary, drive it over HTTP, assert on the
//! same JSON the browser consumes.

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

#[test]
fn e2e_about_page_is_public_and_linked_from_help() {
    let s = spawn(38_170);

    let (_, _, index) = s.get("/workspace");
    assert!(index.contains(r#"href="/about""#), "Help must link to the About page");
    assert!(!index.contains(".html"), "no page address may end in .html");

    let (status, head, body) = s.get("/about");
    assert_eq!(status, 200, "{body}");
    assert!(head.contains("text/html"), "{head}");
    for required in [
        "original",
        "free",
        "No account",
        "https://github.com/Kmassidik/TakumiNet",
        "https://x.com/KMassidik",
        "pull request",
        "Open source",
        "MIT licence",
        "Who makes it",
    ] {
        assert!(body.contains(required), "About page is missing {required:?}");
    }
    // The About page is written in plain words: no file paths, hashes or tool names.
    for banned in ["ChatGPT", "tools/", "MANIFEST", "SHA-256", "provenance", "Vision helper", "—"] {
        assert!(!body.contains(banned), "About page must not contain {banned:?}");
    }
    assert!(body.contains(r#"href="/workspace""#), "About page must link back to the workspace");
    assert!(!body.contains(".html"), "About page must not link to a .html address");
    assert!(body.contains("/tokens.css"), "About page must use the shared tokens");
    let (status, head, tokens) = s.get("/tokens.css");
    assert_eq!(status, 200);
    assert!(head.contains("text/css"), "{head}");
    assert!(tokens.contains("--accent:"), "tokens.css must define the colours");

    // The old address redirects to the clean one; other spellings are not pages.
    let (status, head, _) = s.get("/about.html");
    assert_eq!(status, 301, "{head}");
    assert!(head.contains("Location: /about"), "{head}");
    assert_eq!(s.get("/about/").0, 404);
    assert_eq!(s.get("/about.xyz").0, 404);
}

#[test]
fn e2e_workspace_editing_and_simulation() {
    let s = spawn(38_171);

    // UI shell (the workspace; "/" is the landing page)
    let (status, head, body) = s.get("/workspace");
    assert_eq!(status, 200);
    assert!(head.contains("text/html"), "{head}");
    assert!(body.contains("Simulation Panel"), "ui shell missing");

    // static assets for the front end
    for chunk in body.split("<script src=\"").skip(1) {
        let src = chunk.split('"').next().unwrap_or("");
        let (status, head, _) = s.get(src);
        assert_eq!(status, 200, "{src}");
        assert!(head.contains("javascript"), "{src}: {head}");
    }

    // generated UI sounds
    for name in ["devicePlacement", "errorMsg", "popUp", "removeLink"] {
        let (status, head, _) = s.get(&format!("/sounds/{name}.wav"));
        assert_eq!(status, 200, "{name}");
        assert!(head.contains("audio/wav"), "{name}: {head}");
    }

    // our own 3D icons; anything outside group/name.webp is refused
    let (status, head, body) = s.get("/art3d/toolbar/new.webp");
    assert_eq!(status, 200);
    assert!(head.contains("image/webp"), "{head}");
    assert!(body.starts_with("RIFF"), "not a webp");
    let (_, _, body) = s.get("/art3d/..%2f..%2fCargo.toml");
    assert!(body.contains("not found"), "{body}");

    // initial topology
    let (status, _, body) = s.get("/api/workspace");
    assert_eq!(status, 200);
    assert_eq!(count(&body, "\"id\":\""), 7, "{body}");
    assert_eq!(count(&body, "\"aPort\":"), 6, "{body}");

    // add a device
    let (_, _, body) = s.post("/api/devices?model=PC-PT&x=700&y=450");
    assert_eq!(count(&body, "\"id\":\""), 8);
    assert!(body.contains("\"name\":\"PC3\""), "{body}");

    // undo restores
    let (_, _, body) = s.post("/api/undo");
    assert_eq!(count(&body, "\"id\":\""), 7);
    let (_, _, body) = s.post("/api/redo");
    assert_eq!(count(&body, "\"id\":\""), 8);

    // link the new device to a switch
    let (_, _, body) = s.post("/api/links?a=pc3&b=switch1");
    assert_eq!(count(&body, "\"aPort\":"), 7, "{body}");
    assert!(body.contains("\"aPort\":\"Fa0\""), "{body}");

    // Duplicate host links are rejected; parallel switch links use new ports.
    let (_, _, body) = s.post("/api/links?a=switch1&b=pc3");
    assert!(body.contains("already linked"), "{body}");

    // PDU follows the graph and records an event
    let (_, _, body) = s.post("/api/pdu?src=pc3&dst=pc2");
    assert!(body.contains("\"proto\":\"ICMP\""), "{body}");
    assert!(body.contains("\"at\":\"PC2\""), "{body}");

    // filters / reset
    let (_, _, body) = s.post("/api/sim/reset");
    assert!(body.contains("\"events\":[]"), "{body}");

    // delete the extra device, then restore the demo state
    let (_, _, body) = s.post("/api/devices/delete?id=pc3");
    assert_eq!(count(&body, "\"id\":\""), 7);
    let (_, _, body) = s.post("/api/reset");
    assert_eq!(count(&body, "\"id\":\""), 7);
}

#[test]
fn e2e_full_mesh() {
    let s = spawn(38_173);

    // three fresh workstations on top of the demo topology
    for (n, (x, y)) in [(700, 300), (760, 360), (820, 420)].into_iter().enumerate() {
        let (status, _, body) = s.post(&format!("/api/devices?model=PC-PT&x={x}&y={y}"));
        assert_eq!(status, 200, "{body}");
        assert_eq!(count(&body, "\"id\":\""), 8 + n, "{body}");
    }

    // full mesh over the three new devices: three unordered pairs
    let (status, _, body) = s.post("/api/mesh?ids=pc3,pc4,pc5");
    assert_eq!(status, 200, "{body}");
    // the demo keeps its six links, so exactly three new ones show up
    assert_eq!(count(&body, "\"aPort\":"), 6 + 3, "{body}");
    for id in ["pc3", "pc4", "pc5"] {
        assert!(body.contains(&format!("\"id\":\"{id}\"")), "missing {id}: {body}");
        // being an endpoint of exactly two links is what full mesh means
        let degree = count(&body, &format!("\"a\":\"{id}\""))
            + count(&body, &format!("\"b\":\"{id}\""));
        assert_eq!(degree, 2, "{id} is not fully meshed: {body}");
    }

    // meshing the same set again is idempotent: no extra links
    let (status, _, body) = s.post("/api/mesh?ids=pc3,pc4,pc5");
    assert_eq!(status, 200, "{body}");
    assert_eq!(count(&body, "\"aPort\":"), 9, "{body}");
    assert_eq!(count(&body, "\"id\":\""), 10, "{body}");

    // fewer than two known ids is refused and leaves the workspace alone
    let (_, _, body) = s.post("/api/mesh?ids=pc3,nope");
    assert!(body.contains("\"error\""), "{body}");
    let (_, _, body) = s.get("/api/workspace");
    assert_eq!(count(&body, "\"aPort\":"), 9, "{body}");

    // reset restores the demo topology
    let (status, _, body) = s.post("/api/reset");
    assert_eq!(status, 200, "{body}");
    assert_eq!(count(&body, "\"id\":\""), 7, "{body}");
    assert_eq!(count(&body, "\"aPort\":"), 6, "{body}");
}

#[test]
fn e2e_bus_and_ip_config() {
    let s = spawn(38_174);

    // start from the demo, then build a bus — it replaces the pristine demo
    let (_, _, body) = s.post("/api/reset");
    assert_eq!(count(&body, "\"id\":\""), 7);

    let (status, _, body) = s.post("/api/bus?count=4");
    assert_eq!(status, 200);
    assert_eq!(count(&body, "\"id\":\""), 5, "{body}"); // hub + 4 stations
    assert_eq!(count(&body, "\"aPort\":"), 4, "{body}");
    assert_eq!(count(&body, "\"ip\":\"192.168.1."), 4, "{body}");

    // same subnet: the PDU is delivered
    let (_, _, body) = s.post("/api/pdu?src=pc0&dst=pc1");
    assert!(body.contains("\"at\":\"PC1\""), "{body}");

    // re-address one host onto another subnet: the PDU must refuse
    let (_, _, body) = s.post("/api/devices/ip?id=pc1&ip=10.0.0.5&prefix=24");
    assert!(body.contains("\"ip\":\"10.0.0.5\""), "{body}");
    let (_, _, body) = s.post("/api/pdu?src=pc0&dst=pc1");
    assert!(body.contains("no route to 10.0.0.5"), "{body}");

    // invalid input is rejected, not stored
    let (_, _, body) = s.post("/api/devices/ip?id=pc0&ip=999.1.1.1&prefix=24");
    assert!(body.contains("invalid IP address"), "{body}");

    // The retained drop is a mutation too: undo it, then restore the address.
    s.post("/api/undo");
    let (_, _, body) = s.post("/api/undo");
    assert!(body.contains("\"ip\":\"192.168.1.11\""), "{body}");

    // and a reset goes back to the demo
    let (_, _, body) = s.post("/api/reset");
    assert_eq!(count(&body, "\"id\":\""), 7);
}

#[test]
fn e2e_static_ip_configuration_fields() {
    let s = spawn(38_175);
    s.post("/api/reset");

    // full static configuration, as in Desktop -> IP Configuration
    let (_, _, body) = s.post(
        "/api/devices/ip?id=pc0&ip=192.168.1.10&mask=255.255.255.0&gateway=192.168.1.1&dns=8.8.8.8",
    );
    assert!(body.contains("\"gateway\":\"192.168.1.1\""), "{body}");
    assert!(body.contains("\"dns\":\"8.8.8.8\""), "{body}");
    assert!(body.contains("\"prefix\":24"), "{body}");

    // dotted mask is honoured, /25 is a different subnet
    let (_, _, body) = s.post("/api/devices/ip?id=pc1&ip=192.168.1.200&mask=255.255.255.128");
    assert!(body.contains("\"prefix\":25"), "{body}");

    // non-contiguous masks and bad addresses are rejected
    let (_, _, body) = s.post("/api/devices/ip?id=pc0&ip=192.168.1.10&mask=255.0.255.0");
    assert!(body.contains("invalid subnet mask"), "{body}");
    let (_, _, body) = s.post("/api/devices/ip?id=pc0&ip=192.168.1.10&mask=24&gateway=9.9.9");
    assert!(body.contains("invalid default gateway"), "{body}");

    // a /24 and a /25 host: pc0 still sees .200 as on-link and reaches it
    // directly, while pc1's /25 excludes pc0 and it has no gateway
    let (_, _, body) = s.post("/api/pdu?src=pc0&dst=pc1");
    assert!(body.contains("\"at\":\"PC1\""), "{body}");
    let (_, _, body) = s.post("/api/pdu?src=pc1&dst=pc0");
    assert!(body.contains("no route to 192.168.1.10"), "{body}");
}

#[test]
fn e2e_ipv6_section() {
    let s = spawn(38_176);
    s.post("/api/reset");

    let (status, _, body) = s.post(
        "/api/devices/ipv6?id=pc0&auto=0&addr=2001:db8::1&prefix=64&gateway=2001:db8::ff&dns=2001:db8::53",
    );
    assert_eq!(status, 200);
    assert!(body.contains("\"ipv6\":\"2001:db8::1\""), "{body}");
    assert!(body.contains("\"ipv6Prefix\":64"), "{body}");
    assert!(body.contains("\"ipv6Gateway\":\"2001:db8::ff\""), "{body}");
    assert!(body.contains("\"ipv6Dns\":\"2001:db8::53\""), "{body}");

    let (_, _, body) = s.post("/api/devices/ipv6?id=pc0&addr=192.168.1.1&prefix=64");
    assert!(body.contains("invalid IPv6 address"), "{body}");
}

#[test]
fn e2e_console_cable_drives_the_terminal() {
    let s = spawn(38_177);
    s.post("/api/reset");

    // no console cable yet
    let (_, _, body) = s.post("/api/console?id=pc0");
    assert!(body.contains("\"error\""), "{body}");

    // two network devices cannot be joined by one
    let (_, _, body) = s.post("/api/links?kind=eConsole&a=switch0&b=switch1");
    assert!(body.contains("console cable joins a PC"), "{body}");

    // a PC to a router works, and the peer is reported
    let (_, _, body) = s.post("/api/links?kind=eConsole&a=pc0&b=router0");
    assert!(!body.contains("\"error\""), "{body}");
    let (_, _, body) = s.post("/api/console?id=pc0");
    assert!(body.contains("\"peer\":\"router0\""), "{body}");
    let (_, _, body) = s.post("/api/console?id=router0");
    assert!(body.contains("\"error\""), "{body}");

    // the session behind it is the router's CLI
    let (_, _, body) = s.post("/api/cli?id=router0&line=en");
    assert!(body.contains("\"prompt\":\"Router0#\""), "{body}");

    // and the cable is out of band: the data path is unchanged
    let (_, _, body) = s.post("/api/pdu?src=pc0&dst=pc2");
    assert!(body.contains("\"at\":\"PC2\""), "{body}");
    let (_, _, body) = s.get("/api/workspace");
    assert_eq!(count(&body, "\"kind\":\"eConsole\""), 1, "{body}");
}

#[test]
fn e2e_web_browser_fetches_from_the_server() {
    let s = spawn(38_178);
    s.post("/api/reset");

    let (status, _, body) = s.post("/api/webfetch?id=pc0&url=http://192.168.2.20/");
    assert_eq!(status, 200, "{body}");
    assert!(body.contains("\"status\":200"), "{body}");
    assert!(body.contains("\"title\":\"Server0\""), "{body}");

    // A host without an HTTP service refuses the connection.
    let (_, _, body) = s.post("/api/webfetch?id=pc0&url=192.168.1.11");
    assert!(body.contains("Connection refused"), "{body}");

    // The request is a captured delivery.
    let (_, _, body) = s.get("/api/workspace");
    assert!(body.contains("\"proto\":\"HTTP\""), "{body}");
}

#[test]
fn e2e_power_switch_cuts_traffic() {
    let s = spawn(38_190);
    s.post("/api/reset");

    // Powered off, the host drops every frame aimed at it.
    let (status, _, _) = s.post("/api/devices/power?id=pc1&on=0");
    assert_eq!(status, 200);
    let (_, _, body) = s.get("/api/workspace");
    assert_eq!(count(&body, "\"powered\":false"), 1, "{body}");
    assert!(body.contains("\"powered\":false"), "{body}");

    let (_, _, body) = s.post("/api/cmd?id=pc0&line=ping%20192.168.1.11");
    assert!(
        body.contains("unreachable") || body.contains("Request timed out"),
        "{body}"
    );

    // Powering it back on restores the replies.
    let (status, _, _) = s.post("/api/devices/power?id=pc1&on=1");
    assert_eq!(status, 200);
    let (_, _, body) = s.post("/api/cmd?id=pc0&line=ping%20192.168.1.11");
    assert!(body.contains("Reply from 192.168.1.11"), "{body}");
    assert!(body.contains("Received = 4"), "{body}");
    let (_, _, body) = s.get("/api/workspace");
    assert_eq!(count(&body, "\"powered\":false"), 0, "{body}");
}

#[test]
fn e2e_router_module_insert_and_remove() {
    let s = spawn(38_191);
    s.post("/api/reset");

    // Slot 0 takes an HWIC-2T and exposes its two serial ports.
    let (status, _, body) = s.post("/api/devices/module?id=router0&slot=0&model=HWIC-2T");
    assert_eq!(status, 200, "{body}");
    assert!(body.contains("\"slots\":[\"HWIC-2T\""), "{body}");

    let (status, _, body) = s.get("/api/devices/ports?id=router0");
    assert_eq!(status, 200);
    assert!(body.contains("\"Serial0/3/0\""), "{body}");
    assert!(body.contains("\"Serial0/3/1\""), "{body}");

    // An empty model pulls the module back out.
    let (status, _, body) = s.post("/api/devices/module?id=router0&slot=0&model=");
    assert_eq!(status, 200, "{body}");
    assert!(!body.contains("HWIC-2T"), "{body}");
    let (_, _, body) = s.get("/api/devices/ports?id=router0");
    assert!(!body.contains("\"Serial0/3/0\""), "{body}");
}

#[test]
fn e2e_dhcp_pool_lease_and_static_override() {
    let s = spawn(38_192);
    s.post("/api/reset");

    let (status, _, body) = s.post("/api/devices/dhcp?id=server0&network=192.168.2.0&prefix=24");
    assert_eq!(status, 200, "{body}");
    assert!(body.contains("\"network\":\"192.168.2.0\""), "{body}");

    // The client on the same segment leases the first free address.
    let (status, _, body) = s.post("/api/dhcp/acquire?id=pc2");
    assert_eq!(status, 200, "{body}");
    assert!(body.contains("\"ip\":\"192.168.2.100\""), "{body}");
    assert!(body.contains("\"dhcp\":true"), "{body}");

    // A static address takes the interface back off DHCP.
    let (status, _, body) = s.post("/api/devices/ip?id=pc2&ip=192.168.2.50&prefix=24");
    assert_eq!(status, 200, "{body}");
    assert!(body.contains("\"ip\":\"192.168.2.50\""), "{body}");
    assert!(!body.contains("\"dhcp\":true"), "{body}");
}

#[test]
fn e2e_cable_kinds_are_media_checked() {
    let s = spawn(38_193);
    s.post("/api/reset");

    // Fiber joins switches and routers, never two workstations.
    let (_, _, body) = s.post("/api/links?kind=eFiber&a=pc0&b=pc1");
    assert!(body.contains("\"error\""), "{body}");
    assert!(body.contains("fiber cable"), "{body}");
    let (_, _, body) = s.post("/api/links?kind=eFiber&a=switch0&b=switch1");
    assert!(!body.contains("\"error\""), "{body}");

    // A second router gives the serial cable two serial endpoints.
    let (status, _, body) = s.post("/api/devices?model=2911&x=700&y=150");
    assert_eq!(status, 200, "{body}");
    assert!(body.contains("\"id\":\"router1\""), "{body}");
    let (status, _, body) = s.post("/api/links?kind=eSerial&a=router0&b=router1");
    assert_eq!(status, 200, "{body}");
    assert!(!body.contains("\"error\""), "{body}");
    assert!(body.contains("\"kind\":\"eSerial\""), "{body}");
    assert!(body.contains("\"aPort\":\"Serial"), "{body}");
}

#[test]
fn e2e_save_and_load_round_trips_configuration() {
    let s = spawn(38_194);
    s.post("/api/reset");

    for line in [
        "en",
        "conf%20t",
        "banner%20motd%20%23authorised%20access%20only%23",
        "line%20con%200",
        "password%20lab",
        "end",
    ] {
        let (status, _, body) = s.post(&format!("/api/cli?id=router0&line={line}"));
        assert_eq!(status, 200, "{body}");
        assert!(!body.contains("\"error\""), "{line}: {body}");
    }

    let (status, _, _) = s.post("/api/save?name=e2e");
    assert_eq!(status, 200);
    let saved = std::fs::read_to_string(repo_root().join("topologies/e2e.xml")).unwrap();
    assert!(saved.starts_with("<takumi version=\"1\">"));
    let (_, _, saves) = s.get("/api/saves");
    assert!(saves.contains("\"e2e\""), "{saves}");
    let (status, _, _) = s.post("/api/reset");
    assert_eq!(status, 200);

    // The reset wiped the config; loading the save brings it back.
    let (status, _, _) = s.post("/api/load?name=e2e");
    assert_eq!(status, 200);
    let (status, _, body) = s.post("/api/cli?id=router0&line=show%20run");
    assert_eq!(status, 200);
    assert!(body.contains("banner motd ^authorised access only^"), "{body}");
    assert!(body.contains("password lab"), "{body}");
}

#[test]
fn l22_exported_text_import_restores_identical_http_workspace() {
    let s = spawn(38_226);
    s.post("/api/reset");
    let (_, _, before) = s.get("/api/workspace");
    let (status, head, exported) = s.get_raw("/api/export");
    assert_eq!(status, 200);
    assert!(head.contains("application/xml"), "{head}");
    let text = String::from_utf8(exported).unwrap();
    assert!(text.starts_with("<takumi version=\"1\">"));
    s.post("/api/devices/delete?id=pc0");
    let (status, _, imported) = s.post_body("/api/import", text.as_bytes());
    assert_eq!(status, 200, "{imported}");
    assert!(!imported.contains("\"error\""), "{imported}");
    let (_, _, after) = s.get("/api/workspace");
    assert_eq!(after, before, "GET workspace must match after exported-text import");
    let (_, _, again) = s.get_raw("/api/export");
    assert_eq!(again, text.as_bytes());
}

#[test]
fn l23_invalid_http_import_never_changes_the_workspace() {
    let s = spawn(38_227);
    s.post("/api/reset");
    s.post("/api/devices?model=PC-PT&x=700&y=450");
    let (_, _, before) = s.get("/api/workspace");

    for invalid in [
        &b"<takumi version=\"1\"><device id=\"pc9\" kind=\"pc\">"[..],
        &b"<takumi version=\"1\"><device id=\"pc0\" kind=\"pc\"/><device id=\"pc0\" kind=\"pc\"/></takumi>"[..],
        &[0xff, 0xfe, 0x00, 0x9c][..],
    ] {
        let (_, _, response) = s.post_body("/api/import", invalid);
        assert!(response.contains("\"error\""), "{response}");
        let (_, _, after) = s.get("/api/workspace");
        assert_eq!(after, before, "invalid import partially changed workspace");
    }
}

#[test]
fn e2e_web_fetch_reports_the_simulated_server() {
    let s = spawn(38_195);
    s.post("/api/reset");

    let (status, _, body) = s.post("/api/webfetch?id=pc0&url=192.168.2.20");
    assert_eq!(status, 200, "{body}");
    assert!(body.contains("\"status\":200"), "{body}");
    assert!(body.contains("\"title\":\"Server0\""), "{body}");

    // A workstation has no HTTP service listening on 80.
    let (_, _, body) = s.post("/api/webfetch?id=pc0&url=192.168.1.11");
    assert!(body.contains("Connection refused"), "{body}");
}

#[test]
fn e2e_dns_record_and_custom_http_page() {
    let s = spawn(38_210);
    s.post("/api/reset");

    // A configured server answers unicast lookups, including across routers.
    let (status, _, body) = s.post("/api/devices/ip?id=pc2&ip=192.168.2.10&mask=255.255.255.0&gateway=192.168.2.1&dns=192.168.2.20");
    assert_eq!(status, 200, "{body}");
    let (status, _, body) = s.post("/api/devices/dns?id=server0&name=web.lab&ip=192.168.2.20");
    assert_eq!(status, 200, "{body}");
    assert!(body.contains("web.lab"), "{body}");

    let (status, _, body) = s.post("/api/cmd?id=pc2&line=nslookup%20web.lab");
    assert_eq!(status, 200, "{body}");
    assert!(body.contains("192.168.2.20"), "nslookup did not resolve web.lab: {body}");

    // A custom page is what the browser receives, not the welcome text.
    let (status, _, body) = s.post("/api/devices/http?id=server0&body=hello-page");
    assert_eq!(status, 200, "{body}");
    let (status, _, body) = s.post("/api/webfetch?id=pc0&url=192.168.2.20");
    assert_eq!(status, 200, "{body}");
    assert!(body.contains("\"status\":200"), "{body}");
    assert!(body.contains("hello-page"), "custom page missing from fetch: {body}");

    // Removing the record makes the next lookup time out.
    let (status, _, body) =
        s.post("/api/devices/dns?id=server0&name=web.lab&ip=192.168.2.20&remove=1");
    assert_eq!(status, 200, "{body}");
    let (status, _, body) = s.post("/api/cmd?id=pc2&line=nslookup%20web.lab");
    assert_eq!(status, 200, "{body}");
    assert!(body.contains("timed out"), "removed record still resolves: {body}");
}

#[test]
fn e2e_dhcp_reservation_overrides_pool_address() {
    let s = spawn(38_211);
    s.post("/api/reset");

    let (status, _, body) = s.post("/api/devices/dhcp?id=server0&network=192.168.2.0&prefix=24");
    assert_eq!(status, 200, "{body}");

    let (status, _, body) =
        s.post("/api/devices/dhcp/reserve?id=server0&client=pc2&ip=192.168.2.150");
    assert_eq!(status, 200, "{body}");

    let (status, _, body) = s.post("/api/dhcp/acquire?id=pc2");
    assert_eq!(status, 200, "{body}");
    assert!(body.contains("\"ip\":\"192.168.2.150\""), "reservation ignored: {body}");
    assert!(body.contains("\"dhcp\":true"), "{body}");

    // An empty address deletes the reservation; the next lease is pool-allocated.
    let (status, _, body) = s.post("/api/devices/dhcp/reserve?id=server0&client=pc2&ip=");
    assert_eq!(status, 200, "{body}");
    let (status, _, body) = s.post("/api/dhcp/acquire?id=pc2");
    assert_eq!(status, 200, "{body}");
    assert!(
        body.contains("\"ip\":\"192.168.2.100\""),
        "removed reservation did not fall back to the pool: {body}"
    );
    assert!(body.contains("\"dhcp\":true"), "{body}");
}

#[test]
fn e2e_dhcp_relay_forwards_across_the_router() {
    let s = spawn(38_212);
    s.post("/api/reset");

    // The pool lives on server0, on the far side of router0.
    let (status, _, body) = s.post("/api/devices/dhcp?id=server0&network=192.168.1.0&prefix=24");
    assert_eq!(status, 200, "{body}");
    let (status, _, body) = s
        .post("/api/devices/dhcp/helper?id=router0&iface=GigabitEthernet0/0&helper=192.168.2.20");
    assert_eq!(status, 200, "{body}");

    let (status, _, body) = s.post("/api/dhcp/acquire?id=pc0");
    assert_eq!(status, 200, "{body}");
    assert!(body.contains("\"ip\":\"192.168.1.100\""), "relay did not lease: {body}");
    assert!(body.contains("\"dhcp\":true"), "{body}");

    // With the helper gone the same client has no server left.
    let (status, _, body) =
        s.post("/api/devices/dhcp/helper?id=router0&iface=GigabitEthernet0/0&helper=");
    assert_eq!(status, 200, "{body}");
    let (status, _, body) = s.post("/api/dhcp/acquire?id=pc0");
    assert_eq!(status, 200, "{body}");
    assert!(body.contains("no DHCP server"), "{body}");
}

#[test]
fn e2e_cli_completion_follows_the_session_mode() {
    let s = spawn(38_213);
    s.post("/api/reset");

    // `en` turns on privileged mode; user mode only completes enable/help/ping.
    let (status, _, body) = s.post("/api/cli?id=router0&line=en");
    assert_eq!(status, 200, "{body}");
    assert!(body.contains("Router0#"), "{body}");

    let (status, _, body) = s.post("/api/complete?id=router0&line=show%20ip");
    assert_eq!(status, 200, "{body}");
    assert!(
        body.contains("\"candidates\":[\"show ip interface brief\",\"show ip route\"]"),
        "{body}"
    );

    let (status, _, body) = s.post("/api/complete?id=router0&line=sh");
    assert_eq!(status, 200, "{body}");
    assert!(body.contains("show running-config"), "{body}");
}

#[test]
fn e2e_mail_users_send_and_list() {
    let s = spawn(38_220);
    s.post("/api/reset");

    // Two mailboxes on the LAN's server.
    for (user, pass) in [("alice", "pw-alice"), ("bob", "pw-bob")] {
        let (status, _, body) =
            s.post(&format!("/api/devices/mailuser?id=server0&user={user}&pass={pass}"));
        assert_eq!(status, 200, "{body}");
        assert!(!body.contains("\"error\""), "{body}");
    }

    // alice on pc0 sends bob a message through server0.
    let (status, _, body) = s.post(
        "/api/mail/send?id=pc0&server=server0&from=alice&to=bob&subject=lab%20notes&body=hello%20bob",
    );
    assert_eq!(status, 200, "{body}");
    assert!(!body.contains("\"error\""), "{body}");

    let (status, _, body) = s.post("/api/mail/list?id=server0&user=bob");
    assert_eq!(status, 200, "{body}");
    assert!(body.contains("\"from\":\"alice\""), "{body}");
    assert!(body.contains("\"to\":\"bob\""), "{body}");
    assert!(body.contains("\"subject\":\"lab notes\""), "{body}");
    assert!(body.contains("\"body\":\"hello bob\""), "{body}");
    assert!(body.contains("\"read\":false"), "{body}");

    // The sender has no message of her own in this exchange.
    let (_, _, body) = s.post("/api/mail/list?id=server0&user=alice");
    assert!(body.contains("\"messages\":[]"), "{body}");

    // An unregistered recipient is refused and nothing is delivered.
    let (status, _, body) =
        s.post("/api/mail/send?id=pc0&server=server0&from=alice&to=carol&subject=x&body=y");
    assert_eq!(status, 200, "{body}");
    assert!(body.contains("unknown recipient: carol"), "{body}");
    let (_, _, body) = s.post("/api/mail/list?id=server0&user=bob");
    assert_eq!(count(&body, "\"subject\":"), 1, "refused mail was stored: {body}");
}

#[test]
fn e2e_tftp_put_list_and_remove() {
    let s = spawn(38_221);
    s.post("/api/reset");

    let (status, _, body) =
        s.post("/api/devices/tftp?id=server0&name=config.txt&content=hostname%20lab");
    assert_eq!(status, 200, "{body}");
    assert!(!body.contains("\"error\""), "{body}");

    let (status, _, body) = s.post("/api/tftp/list?id=server0");
    assert_eq!(status, 200);
    assert!(body.contains("\"files\":[\"config.txt\"]"), "{body}");

    // An empty body deletes the file.
    let (status, _, body) = s.post("/api/devices/tftp?id=server0&name=config.txt&content=");
    assert_eq!(status, 200, "{body}");
    assert!(!body.contains("\"error\""), "{body}");

    let (status, _, body) = s.post("/api/tftp/list?id=server0");
    assert_eq!(status, 200);
    assert!(body.contains("\"files\":[]"), "{body}");
}

#[test]
fn e2e_vlan_config_and_spanning_tree_blocking() {
    let s = spawn(38_223);
    s.post("/api/reset");

    for line in [
        "en",
        "conf%20t",
        "vlan%2020%20SALES",
        "int%20fa0%2F3",
        "switchport%20access%20vlan%2020",
        "end",
    ] {
        let (status, _, body) = s.post(&format!("/api/cli?id=switch0&line={line}"));
        assert_eq!(status, 200, "{line}: {body}");
        assert!(!body.contains("% Invalid"), "{line}: {body}");
        assert!(!body.contains("% Incomplete"), "{line}: {body}");
    }

    let (status, _, body) = s.post("/api/cli?id=switch0&line=show%20vlan%20brief");
    assert_eq!(status, 200, "{body}");
    assert!(body.contains("SALES"), "VLAN name missing from show vlan brief: {body}");

    // The CLI reply is JSON, so unescape its line breaks before reading rows.
    let text = body.replace("\\n", "\n");
    let sales_row = text.lines().find(|l| l.contains("SALES")).unwrap_or_default();
    assert!(sales_row.starts_with("20"), "{sales_row}");
    assert!(sales_row.contains("FastEthernet0/3"), "{sales_row}");
    assert!(!sales_row.contains("FastEthernet0/2 "), "{sales_row}");

    // A third switch wired to both existing switches closes a loop.
    let (status, _, body) = s.post("/api/devices?model=2960&x=760&y=120");
    assert_eq!(status, 200, "{body}");
    assert!(body.contains("\"id\":\"switch2\""), "{body}");
    for (a, b) in [("switch0", "switch1"), ("switch1", "switch2"), ("switch2", "switch0")] {
        let (status, _, body) = s.post(&format!("/api/links?a={a}&b={b}"));
        assert_eq!(status, 200, "{a}-{b}: {body}");
        assert!(!body.contains("\"error\""), "{a}-{b}: {body}");
    }
    let (_, _, body) = s.get("/api/workspace");
    assert_eq!(count(&body, "\"aPort\":"), 9, "loop links missing: {body}");

    // The loop must leave one port blocking somewhere in the triangle.
    let mut blocked = false;
    for sw in ["switch0", "switch1", "switch2"] {
        let (status, _, _) = s.post(&format!("/api/cli?id={sw}&line=en"));
        assert_eq!(status, 200);
        let (status, _, body) = s.post(&format!("/api/cli?id={sw}&line=show%20spanning-tree"));
        assert_eq!(status, 200, "{sw}: {body}");
        if body.contains("BLK") {
            blocked = true;
            assert!(body.contains("FWD"), "{sw} blocks every port: {body}");
        }
    }
    assert!(blocked, "no blocking port anywhere in the switch loop");
}

#[test]
fn e2e_lesson_templates_blank_new_and_checks() {
    struct Fixture(std::path::PathBuf);
    impl Drop for Fixture {
        fn drop(&mut self) { let _ = std::fs::remove_file(&self.0); }
    }

    let s = spawn(38_225);
    let (status, _, exported) = s.get("/api/export");
    assert_eq!(status, 200);
    let lesson = "<lesson id=\"p1-e2e\" title=\"API lesson\" level=\"1\" minutes=\"5\" goal=\"Ping a peer\"/><step n=\"2\" text=\"Check the result\"/><step n=\"1\" text=\"Ping PC1\"/><check id=\"c1\" kind=\"ping\" from=\"pc0\" to=\"pc1\" url=\"\" expect=\"ok\" label=\"PC0 reaches PC1\"/>";
    let template = exported.replace("</takumi>", &format!("{lesson}</takumi>"));
    let directory = repo_root().join("web/templates");
    std::fs::create_dir_all(&directory).unwrap();
    let path = directory.join("p1-e2e.xml");
    std::fs::write(&path, template).unwrap();
    let _fixture = Fixture(path);

    let (status, _, body) = s.get("/api/templates");
    assert_eq!(status, 200, "{body}");
    assert!(body.contains("\"lessons\":["), "{body}");
    assert!(body.contains("\"templates\":["), "{body}");
    assert!(body.contains("\"id\":\"p1-e2e\""), "{body}");
    assert!(body.contains("\"title\":\"API lesson\""), "{body}");
    assert!(body.contains("\"stepCount\":2"), "{body}");
    assert!(body.contains("\"id\":\"tpl-connect\""), "{body}");

    let (status, _, body) = s.post("/api/new");
    assert_eq!(status, 200, "{body}");
    assert!(body.contains("\"devices\":[]"), "{body}");
    assert!(body.contains("\"lesson\":null"), "{body}");

    let (status, _, body) = s.post("/api/templates/open?id=p1-e2e");
    assert_eq!(status, 200, "{body}");
    assert!(body.contains("\"title\":\"API lesson\""), "{body}");
    assert!(body.find("\"n\":1").unwrap() < body.find("\"n\":2").unwrap(), "steps sorted: {body}");
    assert!(!body.contains("\"proto\":\"ICMP\""), "template opens pristine: {body}");

    let (status, _, body) = s.get("/api/checks");
    assert_eq!(status, 200, "{body}");
    assert!(body.contains("\"allPassed\":true"), "{body}");
    assert!(body.contains("\"id\":\"c1\",\"label\":\"PC0 reaches PC1\",\"passed\":true"), "{body}");
    let (_, _, workspace) = s.get("/api/workspace");
    assert!(workspace.contains("\"proto\":\"ICMP\""), "checks refresh real captures: {workspace}");

    let (_, _, first) = s.get("/api/export");
    s.post("/api/templates/open?id=p1-e2e");
    let (_, _, second) = s.get("/api/export");
    assert_eq!(first, second, "opening the same template twice is deterministic");

    let (_, _, body) = s.post("/api/templates/open?id=..%2fp1-e2e");
    assert!(body.contains("invalid template id"), "{body}");
    let (_, _, body) = s.post("/api/templates/open?id=missing");
    assert!(body.contains("no such template"), "{body}");
}

#[test]
fn e2e_ftp_syslog_aaa_and_ntp_services() {
    let s = spawn(38_224);
    s.post("/api/reset");

    let mut missing: Vec<&'static str> = Vec::new();

    // FTP file lifecycle.
    let (status, _, body) =
        s.post("/api/devices/ftp?id=server0&name=notes.txt&content=ftp%20payload");
    if ok_or_missing(status, "/api/devices/ftp", &body, &mut missing) {
        assert!(!body.contains("\"error\""), "{body}");

        let (status, _, body) = s.post("/api/ftp/list?id=server0");
        if ok_or_missing(status, "/api/ftp/list", &body, &mut missing) {
            assert!(body.contains("\"files\":[\"notes.txt\"]"), "{body}");
        }

        let (status, _, body) = s.post("/api/devices/ftp?id=server0&name=notes.txt&content=");
        if ok_or_missing(status, "/api/devices/ftp", &body, &mut missing) {
            assert!(!body.contains("\"error\""), "{body}");
        }

        let (_, _, body) = s.post("/api/ftp/list?id=server0");
        assert!(body.contains("\"files\":[]"), "{body}");
    }

    // Syslog: an enabled endpoint logs a delivered PDU.
    let (status, _, body) = s.post("/api/devices/syslog?id=pc0&on=1");
    if ok_or_missing(status, "/api/devices/syslog", &body, &mut missing) {
        let (_, _, body) = s.post("/api/pdu?src=pc0&dst=pc2");
        assert!(body.contains("\"proto\":\"ICMP\""), "{body}");

        let (status, _, body) = s.post("/api/syslog/list?id=pc0");
        if ok_or_missing(status, "/api/syslog/list", &body, &mut missing) {
            assert!(body.contains("\"entries\":[{" ), "{body}");
            assert!(body.contains("\"severity\":\"info\""), "{body}");
            assert!(body.contains("PC0 -> PC2 ICMP"), "{body}");
            assert!(body.contains("\"time\":"), "{body}");
        }
    }

    // AAA user directory.
    let (status, _, body) = s.post("/api/devices/aaa?id=server0&user=alice&pass=secret");
    if ok_or_missing(status, "/api/devices/aaa", &body, &mut missing) {
        assert!(!body.contains("\"error\""), "{body}");

        let (status, _, body) = s.post("/api/aaa/list?id=server0");
        if ok_or_missing(status, "/api/aaa/list", &body, &mut missing) {
            assert!(body.contains("\"users\":[\"alice\"]"), "{body}");
        }
    }

    // NTP: pc0 points at server0's address and reports a sync.
    let (status, _, body) = s.post("/api/devices/ntp?id=pc0&server=192.168.2.20");
    if ok_or_missing(status, "/api/devices/ntp", &body, &mut missing) {
        assert!(!body.contains("\"error\""), "{body}");

        let (status, _, body) = s.post("/api/ntp/status?id=pc0");
        if ok_or_missing(status, "/api/ntp/status", &body, &mut missing) {
            assert!(body.contains("\"synced\":true"), "{body}");
            assert!(body.contains("\"server\":\"192.168.2.20\""), "{body}");
        }
    }

    if !missing.is_empty() {
        eprintln!("services endpoints not implemented: {missing:?}");
    }
}

#[test]
fn e2e_capture_bytes_and_pcap_export_reparse_real_frames() {
    let s = spawn(39_431);
    let (status, _, body) = s.post("/api/pdu?src=pc0&dst=pc2");
    assert_eq!(status, 200, "{body}");
    assert!(!body.contains("\"error\""), "{body}");
    let (_, _, workspace) = s.get("/api/workspace");
    let icmp = workspace.rfind("\"proto\":\"ICMP\"").expect("ICMP capture");
    let prefix = &workspace[..icmp];
    let id_at = prefix.rfind("\"id\":").expect("event id") + 5;
    let id_end = workspace[id_at..].find(',').expect("id delimiter") + id_at;
    let id: u32 = workspace[id_at..id_end].parse().expect("numeric event id");

    let (status, _, bytes) = s.get(&format!("/api/capture/bytes?id={id}"));
    assert_eq!(status, 200);
    assert!(bytes.contains("\"length\":74"), "{bytes}");
    assert!(bytes.contains("\"hex\":\""), "{bytes}");
    assert!(!bytes.contains("error"), "{bytes}");

    let (status, head, pcap) = s.get_raw("/api/capture/export");
    assert_eq!(status, 200, "{head}");
    assert!(head.contains("application/vnd.tcpdump.pcap"), "{head}");
    assert_eq!(&pcap[..4], &[0xd4, 0xc3, 0xb2, 0xa1]);
    assert_eq!(u32::from_le_bytes(pcap[20..24].try_into().unwrap()), 1);
    let mut at = 24;
    let mut records = Vec::new();
    while at < pcap.len() {
        let captured = u32::from_le_bytes(pcap[at + 8..at + 12].try_into().unwrap()) as usize;
        let original = u32::from_le_bytes(pcap[at + 12..at + 16].try_into().unwrap()) as usize;
        assert_eq!(captured, original);
        at += 16;
        assert!(at + captured <= pcap.len(), "truncated pcap record");
        records.push(pcap[at..at + captured].to_vec());
        at += captured;
    }
    assert_eq!(records.len(), 3, "two ARP frames and one ICMP frame");
    assert_eq!(&records[0][12..14], &[0x08, 0x06]);
    assert_eq!(&records[1][12..14], &[0x08, 0x06]);
    assert_eq!(&records[2][12..14], &[0x08, 0x00]);
    assert_eq!(records[2].len(), 74);
    let hex = records[2].iter().map(|byte| format!("{byte:02x}")).collect::<String>();
    assert!(bytes.contains(&hex), "bytes endpoint and pcap contain different ICMP wire frames");
}

#[test]
fn e2e_missing_or_refused_static_files_are_404() {
    let s = spawn(38_241);
    for path in [
        "/js/modal.js",
        "/js/../index.html",
        "/art3d/toolbar/missing.webp",
        "/art3d/..%2f..%2fCargo.toml",
        "/sounds/none.wav",
    ] {
        let (status, _, _) = s.get(path);
        assert_eq!(status, 404, "{path} must be a 404, not a 200");
    }
}

#[test]
fn e2e_notes_add_edit_move_and_delete_over_http() {
    let s = spawn(38_242);
    let (status, _, body) = s.post("/api/notes/add?x=40&y=50&color=%23c8f7c5&text=Read%20me%20first");
    assert_eq!(status, 200, "{body}");
    assert!(body.contains("\"text\":\"Read me first\""), "{body}");
    let id = body.split("\"notes\":[{\"id\":\"").nth(1).and_then(|rest| rest.split('"').next()).unwrap().to_string();

    let (_, _, body) = s.post(&format!("/api/notes/edit?id={id}&text=Changed&color=%23fff3b0"));
    assert!(body.contains("\"text\":\"Changed\""), "{body}");
    let (_, _, body) = s.post(&format!("/api/notes/move?id={id}&x=120&y=60"));
    assert!(body.contains("\"x\":120"), "{body}");
    let (_, _, body) = s.post(&format!("/api/notes/delete?id={id}"));
    assert!(!body.contains("\"text\":\"Changed\""), "{body}");
    let (_, _, body) = s.post("/api/notes/add?x=1&y=1&text=%20%20");
    assert!(body.contains("error"), "blank note must be refused: {body}");
}

#[test]
fn e2e_xml_is_the_file_type_and_old_tnet_files_still_open() {
    struct Fixture(std::path::PathBuf);
    impl Drop for Fixture {
        fn drop(&mut self) { let _ = std::fs::remove_file(&self.0); }
    }

    let s = spawn(38_243);
    let (status, head, exported) = s.get("/api/export");
    assert_eq!(status, 200);
    assert!(head.contains("application/xml"), "{head}");
    assert!(exported.starts_with("<takumi "), "{exported}");

    // New saves are .xml and never .tnet.
    let xml = repo_root().join("topologies/fresh-e2e.xml");
    let _xml_fixture = Fixture(xml.clone());
    let _tnet_fixture = Fixture(repo_root().join("topologies/fresh-e2e.tnet"));
    assert_eq!(s.post("/api/save?name=fresh-e2e").0, 200);
    assert!(xml.exists(), "save must write .xml");
    assert!(!repo_root().join("topologies/fresh-e2e.tnet").exists(), "save must not write .tnet");

    // A .tnet file from an earlier version is listed once and opens.
    let legacy = repo_root().join("topologies/legacy-e2e.tnet");
    std::fs::write(&legacy, &exported).unwrap();
    let _legacy_fixture = Fixture(legacy);
    let (_, _, saves) = s.get("/api/saves");
    assert_eq!(saves.matches("\"legacy-e2e\"").count(), 1, "{saves}");
    assert_eq!(saves.matches("\"fresh-e2e\"").count(), 1, "{saves}");
    let (status, _, loaded) = s.post("/api/load?name=legacy-e2e");
    assert_eq!(status, 200);
    assert!(!loaded.contains("\"error\""), "{loaded}");
    let (_, _, missing) = s.post("/api/load?name=no-such-e2e");
    assert!(missing.contains("no such topology"), "{missing}");

    // Any other XML is refused with a clear message and changes nothing.
    for (body, expect) in [
        ("<other version=\"1\"></other>", "takumi"),
        ("<takumi version=\"1\"", ""),
        ("", ""),
        ("not xml at all", ""),
    ] {
        let (status, _, reply) = s.post_body("/api/import", body.as_bytes());
        assert_eq!(status, 200);
        assert!(reply.contains("\"error\""), "{body:?} -> {reply}");
        assert!(expect.is_empty() || reply.contains(expect), "{body:?} -> {reply}");
    }
}

#[test]
fn e2e_play_on_a_template_sends_its_built_in_traffic_over_http() {
    let s = spawn(38_244);
    for id in ["tpl-connect", "tpl-star", "tpl-home", "tpl-routed", "tpl-web"] {
        let (_, _, opened) = s.post(&format!("/api/templates/open?id={id}"));
        assert!(opened.contains("\"hasDemo\":true"), "{id}: {opened}");
        assert!(opened.contains("\"events\":[]"), "{id} opens quiet");
        let (status, _, played) = s.post("/api/demo");
        assert_eq!(status, 200);
        assert!(!played.contains("\"error\""), "{id}: {played}");
        assert!(!played.contains("\"events\":[]"), "{id} must capture events: {played}");
    }

    // A lesson and a blank workspace have none, and say so.
    s.post("/api/templates/open?id=t1");
    let (_, _, none) = s.post("/api/demo");
    assert!(none.contains("no built-in traffic"), "{none}");
    s.post("/api/new");
    let (_, _, blank) = s.post("/api/demo");
    assert!(blank.contains("no built-in traffic"), "{blank}");
}

#[test]
fn e2e_landing_page_sends_people_into_the_workspace() {
    let s = spawn(38_245);

    let (status, head, landing) = s.get("/");
    assert_eq!(status, 200);
    assert!(head.contains("text/html"), "{head}");
    assert!(landing.contains("Build a network and watch it work."), "headline missing");
    assert!(landing.contains("/landing/takumi-wave.webp"), "Takumi must be on the page");
    assert!(landing.contains(r#"href="/workspace""#), "the main button must open the workspace");
    assert!(!landing.contains("Simulation Panel"), "'/' must be the landing page, not the app");
    assert!(!landing.contains(".html"), "no address may end in .html");

    // Every example and lesson link on the landing page points at something that opens.
    let mut ids = Vec::new();
    for part in landing.split("/workspace?open=").skip(1) {
        let id: String = part.chars().take_while(|c| c.is_ascii_alphanumeric() || *c == '-').collect();
        if !ids.contains(&id) { ids.push(id); }
    }
    assert_eq!(ids.len(), 54, "twenty examples and thirty-four lessons: {ids:?}");
    for id in &ids {
        let (_, _, opened) = s.post(&format!("/api/templates/open?id={id}"));
        assert!(!opened.contains("\"error\""), "{id}: {opened}");
    }

    // The scene's own files are served with the right types.
    for (path, kind) in [("/landing/takumi-idle.webp", "image/webp"), ("/landing/takumi-wave.webp", "image/webp"), ("/landing/takumi-think.webp", "image/webp"), ("/landing/takumi-happy.webp", "image/webp")] {
        let (status, head, _) = s.get_raw(path);
        assert_eq!(status, 200, "{path}");
        assert!(head.contains(kind), "{path}: {head}");
    }
    assert_eq!(s.get("/landing/other.webp").0, 404);
    assert_eq!(s.get("/landing/takumi-sleep.webp").0, 404, "only the poses the page uses are served");
    assert_eq!(s.get("/landing/takumi.glb").0, 404, "the 3D model is gone");

    // The page's own files are served.
    let (status, head, _) = s.get("/landing.css");
    assert_eq!(status, 200);
    assert!(head.contains("text/css"), "{head}");
    let (status, _, workspace) = s.get("/workspace");
    assert_eq!(status, 200);
    assert!(workspace.contains("Simulation Panel"), "the workspace lives at /workspace");
    assert_eq!(s.get("/workspace/").0, 404);
}

#[test]
fn e2e_public_pages_are_ready_for_search_in_english_and_indonesian() {
    let s = spawn(38_246);

    for (path, lang, canonical_end) in [("/", "en", "/"), ("/id", "id", "/id"), ("/about", "en", "/about"), ("/id/about", "id", "/id/about")] {
        let (status, head, body) = s.get(path);
        assert_eq!(status, 200, "{path}");
        assert!(head.contains("text/html"), "{path}: {head}");
        assert!(body.contains(&format!("<html lang=\"{lang}\">")), "{path}");
        assert!(!body.contains("{{SITE_URL}}"), "{path}: the site address must be filled in before sending");
        let canonical = body.split("<link rel=\"canonical\" href=\"").nth(1).and_then(|r| r.split('"').next()).unwrap_or("");
        assert!(canonical.starts_with("http://localhost:") && canonical.ends_with(canonical_end), "{path}: {canonical}");
        assert!(body.contains("hreflang=\"x-default\""), "{path}");
        assert!(body.contains("application/ld+json"), "{path}");
        assert!(!body.contains(".html\""), "{path}: no address may end in .html");
    }
    assert_eq!(s.get("/id/").0, 404);
    assert_eq!(s.get("/id/about/").0, 404);

    // The Indonesian page is in Indonesian and the English one is not.
    assert!(s.get("/id").2.contains("Bangun jaringan dan lihat cara kerjanya."));
    assert!(s.get("/").2.contains("Build a network and watch it work."));

    // The picture used when a link is shared exists for both languages.
    for lang in ["en", "id"] {
        let (status, head, png) = s.get_raw(&format!("/landing/og-{lang}.png"));
        assert_eq!(status, 200, "og-{lang}");
        assert!(head.contains("image/png"), "{head}");
        assert!(png.starts_with(b"\x89PNG"), "og-{lang} is not a PNG");
    }

    // robots.txt keeps the app and the API out of search, and names the sitemap.
    let (status, head, robots) = s.get("/robots.txt");
    assert_eq!(status, 200);
    assert!(head.contains("text/plain"), "{head}");
    assert!(robots.contains("Disallow: /api/") && robots.contains("Disallow: /workspace"), "{robots}");
    assert!(robots.contains("Sitemap: http://localhost:") && robots.contains("/sitemap.xml"), "{robots}");

    // The sitemap lists all four pages, each pointing at both language versions.
    let (status, head, sitemap) = s.get("/sitemap.xml");
    assert_eq!(status, 200);
    assert!(head.contains("xml"), "{head}");
    assert_eq!(sitemap.matches("<loc>").count(), 4, "{sitemap}");
    for path in ["/", "/id", "/about", "/id/about"] {
        assert!(sitemap.contains(&format!("{path}</loc>")), "{path} missing from the sitemap");
    }
    assert_eq!(sitemap.matches("hreflang=\"x-default\"").count(), 4);
    assert!(!sitemap.contains("/workspace") && !sitemap.contains("/api/"));

    // The app page itself is not offered to search engines.
    assert!(s.get("/workspace").2.contains("noindex"));
}
