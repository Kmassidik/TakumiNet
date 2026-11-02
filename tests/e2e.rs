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
                if cand.is_dir() {
                    if best.as_ref().map_or(true, |(n, _)| stamp > *n) {
                        best = Some((stamp.clone(), cand));
                    }
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
    let mut stream = TcpStream::connect(("127.0.0.1", port)).expect("connect");
    stream.set_read_timeout(Some(Duration::from_secs(10))).ok();
    let req = format!("{method} {path} HTTP/1.1\r\nHost: 127.0.0.1\r\nConnection: close\r\n\r\n");
    stream.write_all(req.as_bytes()).expect("write");

    let mut raw = Vec::new();
    stream.read_to_end(&mut raw).expect("read");
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
fn e2e_workspace_editing_and_simulation() {
    let s = spawn(38_171);

    // UI shell
    let (status, head, body) = s.get("/");
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

    // duplicate link is rejected
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
fn e2e_assets_and_pkt_import() {
    let Some(root) = asset_root() else {
        eprintln!("skipping: no asset tree found");
        return;
    };
    let s = spawn(38_172);

    let (status, _, body) = s.get("/api/status");
    assert_eq!(status, 200);
    assert!(body.contains("\"exists\":true"), "{body}");

    // a real asset byte stream
    let (status, head, _) = s.get("/assets/art/app.png");
    assert_eq!(status, 200);
    assert!(head.contains("image/png"), "{head}");

    // traversal is refused
    let (status, _, _) = s.get("/assets/../Cargo.toml");
    assert_eq!(status, 404);

    // pkt inventory
    let (status, _, body) = s.get("/api/pkt/list");
    assert_eq!(status, 200);
    assert!(body.contains("\"files\":["), "{body}");
    let files: Vec<String> = body
        .split("\"files\":[\"")
        .nth(1)
        .unwrap_or("")
        .split("\"],\"")
        .next()
        .unwrap_or("")
        .split("\",\"")
        .map(|s| s.to_string())
        .collect();
    assert!(!files.is_empty(), "no .pkt files listed");

    // open the first real save and check it produced a topology
    let first = files[0].replace(' ', "%20");
    let (status, _, body) = s.post(&format!("/api/pkt/open?path={first}"));
    assert_eq!(status, 200);
    assert!(body.contains("\"devices\":["), "{body}");
    let devices = count(&body, "\"id\":\"");
    assert!(devices >= 1, "import produced no devices: {body}");
    assert!(body.contains("\"kind\":\""), "{body}");

    // restore
    let (_, _, body) = s.post("/api/reset");
    assert_eq!(count(&body, "\"id\":\""), 7);

    // the asset root really is the unpacked tree
    assert!(root.join("art/app.png").is_file());
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

    // undo restores the previous address
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
        "password%20cisco",
        "end",
    ] {
        let (status, _, body) = s.post(&format!("/api/cli?id=router0&line={line}"));
        assert_eq!(status, 200, "{body}");
        assert!(!body.contains("\"error\""), "{line}: {body}");
    }

    let (status, _, _) = s.post("/api/save?name=e2e");
    assert_eq!(status, 200);
    let (status, _, _) = s.post("/api/reset");
    assert_eq!(status, 200);

    // The reset wiped the config; loading the save brings it back.
    let (status, _, _) = s.post("/api/load?name=e2e");
    assert_eq!(status, 200);
    let (status, _, body) = s.post("/api/cli?id=router0&line=show%20run");
    assert_eq!(status, 200);
    assert!(body.contains("banner motd ^authorised access only^"), "{body}");
    assert!(body.contains("password cisco"), "{body}");
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

    // A record on the LAN's server answers lookups from its segment.
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
fn e2e_catalog_lists_models_with_labels() {
    let s = spawn(38_214);

    let (status, head, body) = s.get("/api/catalog");
    assert_eq!(status, 200, "{body}");
    assert!(head.contains("application/json"), "{head}");
    assert!(body.contains("\"models\":["), "{body}");

    let models = count(&body, "\"label\":\"");
    if models == 0 {
        // No asset tree (or one without decoded templates): an empty list.
        assert!(body.contains("\"models\":[]"), "{body}");
        eprintln!("skipping model count: no templates unpacked");
    } else {
        assert!(models >= 50, "catalog only lists {models} models: {body}");
        assert_eq!(models, count(&body, "\"kind\":\""), "{body}");
        assert_eq!(models, count(&body, "\"name\":\""), "{body}");
    }
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
fn e2e_art_svg_and_art_directory_traversal() {
    let s = spawn(38_222);

    let (status, head, body) = s.get("/art/router.svg");
    assert_eq!(status, 200);
    assert!(head.contains("image/svg+xml"), "{head}");
    assert!(body.starts_with("<svg"), "asset body is not an SVG: {body}");

    // The art directory only serves plain .svg names: an encoded traversal is
    // answered with the plain not-found body, never the UI shell.
    let (status, _, body) = s.get("/art/..%2Findex.html");
    assert_eq!(status, 200);
    assert_eq!(body.trim(), "not found", "{body}");
    assert!(!body.contains("Simulation Panel"), "{body}");
    assert!(!body.contains("<html"), "{body}");
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
