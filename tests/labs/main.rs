//! Canonical CCNA labs driven through the same HTTP API as the workspace UI.

use std::fs::File;
use std::io::{Read, Write};
use std::net::TcpStream;
use std::path::PathBuf;
use std::process::{Child, Command, Stdio};
use std::time::{Duration, Instant};

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
fn ios_abbreviations_inline_help_and_invalid_input_caret() {
    let lab = Lab::start(39_104);
    assert!(lab.cli("router0", "en").is_empty());

    let running = lab.cli("router0", "sh%20r");
    assert!(running.contains("hostname Router0"), "{running}");
    let brief = lab.cli("router0", "sh%20ip%20int%20b");
    assert!(brief.contains("GigabitEthernet0/0"), "{brief}");

    let help = lab.cli("router0", "show%20%3F");
    assert!(help.contains("show running-config"), "{help}");
    assert!(help.contains("show startup-config"), "{help}");
    assert!(!help.contains("Invalid input"), "{help}");

    let invalid = lab.cli("router0", "show%20bogus");
    assert!(invalid.contains("show bogus\n     ^"), "{invalid}");
    let invalid = lab.cli("router0", "bogus");
    assert!(invalid.contains("bogus\n^"), "{invalid}");

    let saved = lab.cli("router0", "wr");
    assert!(saved.contains("[OK]"), "{saved}");
    let startup = lab.cli("router0", "sh%20start");
    assert!(startup.contains("hostname Router0"), "{startup}");
}

#[test]
fn ios_prompts_do_show_and_running_config_cover_routing() {
    let lab = Lab::start(39_105);
    lab.cli("router0", "en");
    assert_eq!(lab.cli_prompt("router0", "conf%20t"), "Router0(config)#");
    assert_eq!(lab.cli_prompt("router0", "hostname%20EDGE"), "EDGE(config)#");
    lab.cli("router0", "banner%20motd%20%23Authorised%23");
    lab.cli("router0", "ip%20route%2010.10.0.0%20255.255.0.0%20192.168.1.2");

    assert_eq!(lab.cli_prompt("router0", "router%20rip"), "EDGE(config-router)#");
    lab.cli("router0", "network%20192.168.1.0");
    let routing = lab.cli("router0", "do%20sh%20r");
    assert!(routing.contains("router rip\n version 2\n network 192.168.1.0"), "{routing}");
    assert_eq!(lab.cli_prompt("router0", "exit"), "EDGE(config)#");

    assert_eq!(lab.cli_prompt("router0", "line%20con%200"), "EDGE(config-line)#");
    lab.cli("router0", "password%20class");
    let running = lab.cli("router0", "do%20show%20running-config");
    let hostname = running.find("hostname EDGE").expect("hostname");
    let banner = running.find("banner motd ^Authorised^").expect("banner");
    assert!(hostname < banner, "hostname must precede banner: {running}");
    assert!(
        running.contains("ip route 10.10.0.0 255.255.0.0 192.168.1.2"),
        "{running}"
    );
    assert!(running.contains("router rip\n version 2\n network 192.168.1.0"), "{running}");
    assert!(running.contains("password class"), "{running}");
    let startup = lab.cli("router0", "do%20show%20startup-config");
    assert!(startup.contains("Startup configuration is empty"), "{startup}");
    assert_eq!(lab.cli_prompt("router0", "end"), "EDGE#");
}

#[test]
fn ios_startup_snapshots_are_device_scoped_and_immutable() {
    let lab = Lab::start(39_106);
    lab.cli("router0", "en");
    lab.cli("router0", "conf%20t");
    lab.cli("router0", "banner%20motd%20%23R0-SAVED%23");
    lab.cli("router0", "line%20con%200");
    lab.cli("router0", "password%20r0-old");
    lab.cli("router0", "end");
    assert!(lab.cli("router0", "wr").contains("[OK]"));

    lab.cli("router0", "conf%20t");
    lab.cli("router0", "banner%20motd%20%23R0-RUNNING%23");
    lab.cli("router0", "line%20con%200");
    lab.cli("router0", "password%20r0-new");
    lab.cli("router0", "end");

    lab.cli("switch0", "en");
    lab.cli("switch0", "conf%20t");
    lab.cli("switch0", "banner%20motd%20%23SW-SAVED%23");
    lab.cli("switch0", "line%20con%200");
    lab.cli("switch0", "password%20sw-old");
    lab.cli("switch0", "end");
    let other_before_save = lab.cli("switch0", "show%20startup-config");
    assert!(other_before_save.contains("Startup configuration is empty"), "{other_before_save}");
    assert!(lab.cli("switch0", "copy%20run%20start").contains("[OK]"));

    let router_startup = lab.cli("router0", "show%20startup-config");
    assert!(router_startup.contains("R0-SAVED"), "{router_startup}");
    assert!(router_startup.contains("password r0-old"), "{router_startup}");
    assert!(!router_startup.contains("R0-RUNNING"), "{router_startup}");
    assert!(!router_startup.contains("r0-new"), "{router_startup}");
    assert!(!router_startup.contains("SW-SAVED"), "{router_startup}");

    lab.cli("switch0", "conf%20t");
    lab.cli("switch0", "banner%20motd%20%23SW-RUNNING%23");
    lab.cli("switch0", "line%20con%200");
    lab.cli("switch0", "password%20sw-new");
    lab.cli("switch0", "end");
    let switch_startup = lab.cli("switch0", "show%20startup-config");
    assert!(switch_startup.contains("SW-SAVED"), "{switch_startup}");
    assert!(switch_startup.contains("password sw-old"), "{switch_startup}");
    assert!(!switch_startup.contains("SW-RUNNING"), "{switch_startup}");
    assert!(!switch_startup.contains("sw-new"), "{switch_startup}");
    assert!(!switch_startup.contains("R0-SAVED"), "{switch_startup}");
}

#[test]
fn router_on_a_stick_routes_between_access_vlans() {
    let lab = Lab::start(39_107);
    for line in [
        "en",
        "conf%20t",
        "vlan%2010%20USERS",
        "vlan%2020%20SERVERS",
        "int%20fa0%2F1",
        "switchport%20mode%20trunk",
        "int%20fa0%2F2",
        "switchport%20access%20vlan%2010",
        "int%20fa0%2F3",
        "switchport%20access%20vlan%2020",
    ] {
        let out = lab.cli("switch0", line);
        assert!(!out.contains("% Invalid") && !out.contains("% Incomplete"), "{line}: {out}");
    }
    for line in [
        "en",
        "conf%20t",
        "int%20g0%2F0.10",
        "encapsulation%20dot1Q%2010",
        "ip%20address%20192.168.10.1%20255.255.255.0",
        "int%20g0%2F0.20",
        "encapsulation%20dot1Q%2020",
        "ip%20address%20192.168.20.1%20255.255.255.0",
    ] {
        let out = lab.cli("router0", line);
        assert!(!out.contains("% Invalid") && !out.contains("% Incomplete"), "{line}: {out}");
    }
    lab.post("/api/devices/ip?id=pc0&ip=192.168.10.10&mask=255.255.255.0&gateway=192.168.10.1");
    lab.post("/api/devices/ip?id=pc1&ip=192.168.20.10&mask=255.255.255.0&gateway=192.168.20.1");

    let ping = lab.command("pc0", "ping%20-n%201%20192.168.20.10");
    assert!(ping.contains("Reply from 192.168.20.10") && ping.contains("TTL=127"), "{ping}");
    let running = lab.cli("router0", "do%20show%20run");
    assert!(running.contains("interface GigabitEthernet0/0.10"), "{running}");
    assert!(running.contains("encapsulation dot1Q 10"), "{running}");
    assert!(running.contains("192.168.20.1 255.255.255.0"), "{running}");
    let routes = lab.cli("router0", "do%20show%20ip%20route");
    assert!(routes.contains("192.168.10.0/24") && routes.contains("GigabitEthernet0/0.20"), "{routes}");
}

#[test]
fn ieee_stp_and_rstp_elect_root_and_reconverge() {
    let lab = Lab::start(39_108);
    lab.post("/api/devices?model=2960&x=760&y=120");
    for (a, b) in [("switch0", "switch1"), ("switch1", "switch2"), ("switch2", "switch0")] {
        let body = lab.post(&format!("/api/links?a={a}&b={b}"));
        assert!(!body.contains("\"error\""), "{a}-{b}: {body}");
    }

    // All priorities start at 32768, so switch1 wins on its lower MAC, not id.
    for sw in ["switch0", "switch1", "switch2"] {
        lab.cli(sw, "en");
        let stp = lab.cli(sw, "show%20spanning-tree");
        assert!(stp.contains("Root ID    Priority    32769"), "{sw}: {stp}");
        assert!(stp.contains("Address     0254.4b35.f1c0"), "{sw}: {stp}");
    }
    let blocked = ["switch0", "switch1", "switch2"]
        .into_iter()
        .map(|sw| lab.cli(sw, "show%20spanning-tree").matches(" BLK").count())
        .sum::<usize>();
    assert_eq!(blocked, 1, "exactly one non-designated endpoint must block");

    for line in ["conf%20t", "spanning-tree%20mode%20rapid-pvst", "spanning-tree%20vlan%201%20priority%204096"] {
        let out = lab.cli("switch2", line);
        assert!(!out.contains("% Invalid"), "{line}: {out}");
    }
    let stp = lab.cli("switch2", "do%20show%20spanning-tree");
    assert!(stp.contains("protocol rstp"), "{stp}");
    assert!(stp.contains("Root ID    Priority    4097"), "{stp}");
    assert!(stp.contains("Address     0254.4b35.f679"), "{stp}");
    let running = lab.cli("switch2", "do%20show%20run");
    assert!(running.contains("spanning-tree mode rapid-pvst"), "{running}");
    assert!(running.contains("spanning-tree vlan 1 priority 4096"), "{running}");
    lab.cli("switch2", "end");
    lab.cli("switch2", "wr");
    let startup = lab.cli("switch2", "show%20startup-config");
    assert!(startup.contains("spanning-tree mode rapid-pvst") && startup.contains("spanning-tree vlan 1 priority 4096"), "{startup}");

    // With switch2 as root, switch0 Fa0/5 is its root port. Shutting it down
    // activates the former alternate path through switch1 without a loop.
    for line in ["en", "conf%20t", "int%20fa0%2F5", "shutdown"] {
        lab.cli("switch0", line);
    }
    let sw0 = lab.cli("switch0", "do%20show%20spanning-tree");
    let sw1 = lab.cli("switch1", "show%20spanning-tree");
    assert!(!sw0.contains(" BLK") && !sw1.contains(" BLK"), "{sw0}\n{sw1}");
    assert!(sw0.contains("FastEthernet0/4") && sw0.contains("FWD"), "{sw0}");
    let ping = lab.command("pc0", "ping%20-n%201%20192.168.1.11");
    assert!(ping.contains("Reply from 192.168.1.11"), "{ping}");
}

#[test]
fn etherchannel_bundles_parallel_links_and_survives_member_failure() {
    let lab = Lab::start(39_109);
    lab.post("/api/devices?model=PC-PT&x=700&y=450");
    lab.post("/api/devices/ip?id=pc3&ip=192.168.1.12&mask=255.255.255.0&gateway=192.168.1.1");
    for (a, b) in [("switch0", "switch1"), ("switch0", "switch1"), ("pc3", "switch1")] {
        let body = lab.post(&format!("/api/links?a={a}&b={b}"));
        assert!(!body.contains("\"error\""), "{a}-{b}: {body}");
    }
    // Remove the routed alternate path so this lab proves L2 member failover.
    for line in ["en", "conf%20t", "int%20g0%2F0", "shutdown", "int%20g0%2F1", "shutdown"] {
        lab.cli("router0", line);
    }
    for sw in ["switch0", "switch1"] {
        lab.cli(sw, "en");
        lab.cli(sw, "conf%20t");
        for port in [4, 5] {
            for line in [
                format!("int%20fa0%2F{port}"),
                "switchport%20mode%20trunk".to_string(),
                "channel-group%201%20mode%20active".to_string(),
            ] {
                let out = lab.cli(sw, &line);
                assert!(!out.contains("% Invalid") && !out.contains("% Incomplete"), "{sw} {line}: {out}");
            }
        }
        lab.cli(sw, "end");
    }
    for sw in ["switch0", "switch1"] {
        let summary = lab.cli(sw, "show%20etherchannel%20summary");
        let running = lab.cli(sw, "show%20run");
        assert!(summary.contains("Po1(SU)") && summary.contains("LACP"), "{sw}: {summary}\n{running}");
        assert!(!summary.contains("(D)"), "{sw}: {summary}");
        let stp = lab.cli(sw, "show%20spanning-tree");
        assert!(!stp.contains(" BLK"), "bundle must be one STP link: {sw}: {stp}");
        assert_eq!(running.matches("channel-group 1 mode active").count(), 2, "{running}");
    }

    let ping = lab.command("pc0", "ping%20-n%201%20192.168.1.12");
    assert!(ping.contains("Reply from 192.168.1.12"), "{ping}");
    for line in ["conf%20t", "int%20fa0%2F4", "shutdown"] {
        lab.cli("switch0", line);
    }
    let summary = lab.cli("switch0", "do%20show%20etherchannel%20summary");
    assert!(summary.contains("Po1(SU)") && summary.contains("FastEthernet0/4(D)"), "{summary}");
    let ping = lab.command("pc0", "ping%20-n%201%20192.168.1.12");
    assert!(ping.contains("Reply from 192.168.1.12"), "remaining member must forward: {ping}");

    for line in ["int%20fa0%2F5", "shutdown"] {
        lab.cli("switch0", line);
    }
    let summary = lab.cli("switch0", "do%20show%20etherchannel%20summary");
    assert!(summary.contains("Po1(SD)"), "{summary}");
    let failed = lab.command("pc0", "ping%20-n%201%20192.168.1.12");
    assert!(failed.contains("100% loss"), "{failed}");
    for line in ["int%20fa0%2F4", "no%20shutdown"] {
        lab.cli("switch0", line);
    }
    let restored = lab.command("pc0", "ping%20-n%201%20192.168.1.12");
    assert!(restored.contains("Reply from 192.168.1.12"), "{restored}");
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

#[test]
fn static_and_default_ad_choose_floating_route_and_survive_reopen() {
    let lab = Lab::start(39_110);
    lab.clear_demo();
    for (model, id, x, y) in [
        ("2911", "router1", 200, 100),
        ("2911", "router2", 600, 100),
        ("2911", "router3", 400, 300),
        ("PC-PT", "pc3", 50, 100),
        ("PC-PT", "pc4", 750, 100),
    ] {
        lab.device(model, id, x, y);
    }
    // Three GigabitEthernet interfaces on each 2911 are sufficient. Link order
    // fixes the interface assignments used below.
    for (a, b) in [
        ("router1", "pc3"),
        ("router2", "pc4"),
        ("router1", "router2"),
        ("router1", "router3"),
        ("router3", "router2"),
    ] {
        lab.link(a, b);
    }
    lab.host("pc3", "192.168.10.10", "192.168.10.1");
    lab.host("pc4", "192.168.20.10", "192.168.20.1");

    for (device, interface, ip, mask) in [
        ("router1", "GigabitEthernet0/0", "192.168.10.1", "255.255.255.0"),
        ("router1", "GigabitEthernet0/1", "10.0.12.1", "255.255.255.252"),
        ("router1", "GigabitEthernet0/2", "10.0.13.1", "255.255.255.252"),
        ("router2", "GigabitEthernet0/0", "192.168.20.1", "255.255.255.0"),
        ("router2", "GigabitEthernet0/1", "10.0.12.2", "255.255.255.252"),
        ("router2", "GigabitEthernet0/2", "10.0.23.2", "255.255.255.252"),
        ("router3", "GigabitEthernet0/0", "10.0.13.2", "255.255.255.252"),
        ("router3", "GigabitEthernet0/1", "10.0.23.1", "255.255.255.252"),
    ] {
        lab.address(device, interface, ip, mask);
    }
    lab.config(
        "router1",
        [
            "en",
            "conf t",
            "ip route 192.168.20.0 255.255.255.0 10.0.12.2 1",
            "ip route 192.168.20.0 255.255.255.0 10.0.13.2 10",
            "ip route 0.0.0.0 0.0.0.0 10.0.12.2 50",
            "ip route 0.0.0.0 0.0.0.0 10.0.13.2 60",
            "end",
        ],
    );
    lab.config(
        "router2",
        [
            "en",
            "conf t",
            "ip route 0.0.0.0 0.0.0.0 10.0.12.1 1",
            "ip route 0.0.0.0 0.0.0.0 10.0.23.1 10",
            "end",
        ],
    );
    lab.config(
        "router3",
        [
            "en",
            "conf t",
            "ip route 192.168.10.0 255.255.255.0 10.0.13.1",
            "ip route 192.168.20.0 255.255.255.0 10.0.23.2",
            "end",
        ],
    );

    let routes = lab.cli("router1", "show%20ip%20route");
    assert!(routes.contains("S  192.168.20.0/24 [1/0] via 10.0.12.2"), "{routes}");
    assert!(routes.contains("S  0.0.0.0/0 [50/0] via 10.0.12.2"), "{routes}");
    assert!(!routes.contains("192.168.20.0/24 [10/0]"), "{routes}");
    assert!(!routes.contains("0.0.0.0/0 [60/0]"), "{routes}");
    let return_routes = lab.cli("router2", "show%20ip%20route");
    assert!(return_routes.contains("S  0.0.0.0/0 [1/0] via 10.0.12.1"), "{return_routes}");
    assert_ping(&lab, "pc3", "192.168.20.10", 126);
    assert_trace(
        &lab,
        "pc3",
        "192.168.20.10",
        &["192.168.10.1", "10.0.12.2", "192.168.20.10"],
    );

    lab.config("router1", ["en", "conf t", "interface g0/1", "shutdown", "end"]);
    let routes = lab.cli("router1", "show%20ip%20route");
    assert!(routes.contains("S  192.168.20.0/24 [10/0] via 10.0.13.2"), "{routes}");
    assert!(routes.contains("S  0.0.0.0/0 [60/0] via 10.0.13.2"), "{routes}");
    assert!(!routes.contains("192.168.20.0/24 [1/0]"), "{routes}");
    let return_routes = lab.cli("router2", "show%20ip%20route");
    assert!(return_routes.contains("S  0.0.0.0/0 [10/0] via 10.0.23.1"), "{return_routes}");
    assert!(!return_routes.contains("0.0.0.0/0 [1/0]"), "{return_routes}");
    assert_ping(&lab, "pc3", "192.168.20.10", 125);
    assert_trace(
        &lab,
        "pc3",
        "192.168.20.10",
        &["192.168.10.1", "10.0.13.2", "10.0.23.2", "192.168.20.10"],
    );

    lab.save_reset_load("routing_static_39110");
    let routes = lab.cli("router1", "show%20ip%20route");
    assert!(routes.contains("S  192.168.20.0/24 [10/0] via 10.0.13.2"), "{routes}");
    assert!(routes.contains("S  0.0.0.0/0 [60/0] via 10.0.13.2"), "{routes}");
    let running = lab.cli("router1", "show%20running-config");
    for line in [
        "ip route 192.168.20.0 255.255.255.0 10.0.12.2",
        "ip route 192.168.20.0 255.255.255.0 10.0.13.2 10",
        "ip route 0.0.0.0 0.0.0.0 10.0.12.2 50",
        "ip route 0.0.0.0 0.0.0.0 10.0.13.2 60",
    ] {
        assert!(running.contains(line), "missing {line}: {running}");
    }
    assert_ping(&lab, "pc3", "192.168.20.10", 125);
    assert_trace(
        &lab,
        "pc3",
        "192.168.20.10",
        &["192.168.10.1", "10.0.13.2", "10.0.23.2", "192.168.20.10"],
    );

    lab.config("router1", ["en", "conf t", "interface g0/1", "no shutdown", "end"]);
    let restored = lab.cli("router1", "show%20ip%20route");
    assert!(restored.contains("S  192.168.20.0/24 [1/0] via 10.0.12.2"), "{restored}");
    assert_ping(&lab, "pc3", "192.168.20.10", 126);
}

#[test]
fn ripv2_installs_fifteen_hops_rejects_sixteen_and_is_protocol_isolated() {
    let lab = Lab::start(39_111);
    lab.clear_demo();
    for i in 1..=18 {
        lab.device("2911", &format!("router{i}"), 100 + i * 35, 100);
    }
    for (id, x, y) in [("pc3", 50, 250), ("pc4", 650, 250), ("pc5", 750, 250), ("pc6", 850, 250)] {
        lab.device("PC-PT", id, x, y);
    }
    for i in 1..17 {
        lab.link(&format!("router{i}"), &format!("router{}", i + 1));
    }
    for (a, b) in [
        ("pc3", "router1"),
        ("pc4", "router16"),
        ("pc5", "router17"),
        ("router1", "router18"),
        ("pc6", "router18"),
    ] {
        lab.link(a, b);
    }
    lab.host("pc3", "192.168.1.10", "192.168.1.1");
    lab.host("pc4", "192.168.15.10", "192.168.15.1");
    lab.host("pc5", "192.168.16.10", "192.168.16.1");
    lab.host("pc6", "198.18.18.10", "198.18.18.1");

    for i in 1..=17 {
        let device = format!("router{i}");
        let first_ip = if i == 1 {
            "10.0.1.1".to_string()
        } else {
            format!("10.0.{}.2", i - 1)
        };
        lab.address(&device, "GigabitEthernet0/0", &first_ip, "255.255.255.252");
        if (2..=16).contains(&i) {
            lab.address(
                &device,
                "GigabitEthernet0/1",
                &format!("10.0.{i}.1"),
                "255.255.255.252",
            );
        }
    }
    lab.address("router1", "GigabitEthernet0/1", "192.168.1.1", "255.255.255.0");
    lab.address("router1", "GigabitEthernet0/2", "10.0.18.1", "255.255.255.252");
    lab.address("router16", "GigabitEthernet0/2", "192.168.15.1", "255.255.255.0");
    lab.address("router17", "GigabitEthernet0/1", "192.168.16.1", "255.255.255.0");
    lab.address("router18", "GigabitEthernet0/0", "10.0.18.2", "255.255.255.252");
    lab.address("router18", "GigabitEthernet0/1", "198.18.18.1", "255.255.255.0");

    for i in 1..=17 {
        let mut lines = vec![
            "en".to_string(),
            "conf t".to_string(),
            "router rip".to_string(),
            "version 2".to_string(),
            "network 10.0.0.0".to_string(),
        ];
        if i == 1 {
            lines.push("network 192.168.1.0".to_string());
        } else if i == 16 {
            lines.push("network 192.168.15.0".to_string());
        } else if i == 17 {
            lines.push("network 192.168.16.0".to_string());
        }
        lines.push("end".to_string());
        lab.config(&format!("router{i}"), lines);
    }
    lab.config(
        "router18",
        [
            "en",
            "conf t",
            "router ospf 18",
            "network 10.0.18.0 0.0.0.3 area 0",
            "network 198.18.18.0 0.0.0.255 area 0",
            "end",
        ],
    );

    let routes = lab.cli("router1", "show%20ip%20route");
    assert!(routes.contains("R  192.168.15.0/24 [120/15] via 10.0.1.2"), "{routes}");
    assert!(!routes.contains("192.168.16.0/24"), "16 must be infinity: {routes}");
    assert!(!routes.contains("198.18.18.0/24"), "OSPF leaked into RIP: {routes}");
    let reverse = lab.cli("router16", "show%20ip%20route");
    assert!(reverse.contains("R  192.168.1.0/24 [120/15] via 10.0.15.1"), "{reverse}");
    let isolated = lab.cli("router18", "show%20ip%20route");
    assert!(!isolated.contains("192.168.1.0/24"), "{isolated}");
    assert!(!isolated.contains("192.168.15.0/24"), "{isolated}");
    assert_ping(&lab, "pc3", "192.168.15.10", 112);
    assert_unreachable(&lab, "pc3", "192.168.16.10");
    assert_unreachable(&lab, "pc3", "198.18.18.10");
}

#[test]
fn ospf_dijkstra_prefers_longer_fast_path_and_persists_exact_costs() {
    let lab = Lab::start(39_112);
    lab.clear_demo();
    for (model, id, x, y) in [
        ("2911", "router1", 200, 200),
        ("2911", "router2", 400, 80),
        ("2911", "router3", 350, 320),
        ("2911", "router4", 750, 200),
        ("2911", "router5", 550, 320),
        ("PC-PT", "pc3", 50, 200),
        ("PC-PT", "pc4", 900, 200),
    ] {
        lab.device(model, id, x, y);
    }
    for (a, b) in [
        ("router1", "pc3"),
        ("router4", "pc4"),
        ("router1", "router2"),
        ("router2", "router4"),
        ("router1", "router3"),
        ("router3", "router5"),
        ("router5", "router4"),
    ] {
        lab.link(a, b);
    }
    lab.host("pc3", "192.168.1.10", "192.168.1.1");
    lab.host("pc4", "192.168.2.10", "192.168.2.1");
    for (device, interface, ip) in [
        ("router1", "GigabitEthernet0/1", "10.0.12.1"),
        ("router1", "GigabitEthernet0/2", "10.0.13.1"),
        ("router2", "GigabitEthernet0/0", "10.0.12.2"),
        ("router2", "GigabitEthernet0/1", "10.0.24.1"),
        ("router3", "GigabitEthernet0/0", "10.0.13.2"),
        ("router3", "GigabitEthernet0/1", "10.0.35.1"),
        ("router4", "GigabitEthernet0/1", "10.0.24.2"),
        ("router4", "GigabitEthernet0/2", "10.0.54.2"),
        ("router5", "GigabitEthernet0/0", "10.0.35.2"),
        ("router5", "GigabitEthernet0/1", "10.0.54.1"),
    ] {
        lab.address(device, interface, ip, "255.255.255.252");
    }
    lab.address("router1", "GigabitEthernet0/0", "192.168.1.1", "255.255.255.0");
    lab.address("router4", "GigabitEthernet0/0", "192.168.2.1", "255.255.255.0");

    for (device, interface) in [
        ("router1", "g0/1"),
        ("router2", "g0/0"),
        ("router2", "g0/1"),
        ("router4", "g0/1"),
    ] {
        lab.config(device, ["en", "conf t", &format!("interface {interface}"), "bandwidth 1544", "end"]);
    }
    for (device, networks) in [
        ("router1", &["192.168.1.0 0.0.0.255", "10.0.12.0 0.0.0.3", "10.0.13.0 0.0.0.3"][..]),
        ("router2", &["10.0.12.0 0.0.0.3", "10.0.24.0 0.0.0.3"][..]),
        ("router3", &["10.0.13.0 0.0.0.3", "10.0.35.0 0.0.0.3"][..]),
        ("router4", &["192.168.2.0 0.0.0.255", "10.0.24.0 0.0.0.3", "10.0.54.0 0.0.0.3"][..]),
        ("router5", &["10.0.35.0 0.0.0.3", "10.0.54.0 0.0.0.3"][..]),
    ] {
        let mut lines = vec!["en".to_string(), "conf t".to_string(), "router ospf 42".to_string()];
        lines.extend(networks.iter().map(|network| format!("network {network} area 0")));
        lines.push("end".to_string());
        lab.config(device, lines);
    }

    let routes = lab.cli("router1", "show%20ip%20route");
    assert!(routes.contains("O  192.168.2.0/24 [110/4] via 10.0.13.2"), "{routes}");
    assert!(!routes.contains("192.168.2.0/24 [110/129]"), "{routes}");
    let reverse = lab.cli("router4", "show%20ip%20route");
    assert!(reverse.contains("O  192.168.1.0/24 [110/4] via 10.0.54.1"), "{reverse}");
    assert_ping(&lab, "pc3", "192.168.2.10", 124);
    assert_trace(
        &lab,
        "pc3",
        "192.168.2.10",
        &["192.168.1.1", "10.0.13.2", "10.0.35.2", "10.0.54.2", "192.168.2.10"],
    );

    lab.config("router1", ["en", "conf t", "interface g0/2", "shutdown", "end"]);
    let routes = lab.cli("router1", "show%20ip%20route");
    assert!(routes.contains("O  192.168.2.0/24 [110/129] via 10.0.12.2"), "{routes}");
    assert!(!routes.contains("192.168.2.0/24 [110/4]"), "{routes}");
    assert_ping(&lab, "pc3", "192.168.2.10", 125);
    assert_trace(
        &lab,
        "pc3",
        "192.168.2.10",
        &["192.168.1.1", "10.0.12.2", "10.0.24.2", "192.168.2.10"],
    );
    lab.config("router1", ["en", "conf t", "interface g0/2", "no shutdown", "end"]);

    lab.save_reset_load("routing_ospf_39112");
    let routes = lab.cli("router1", "show%20ip%20route");
    assert!(routes.contains("O  192.168.2.0/24 [110/4] via 10.0.13.2"), "{routes}");
    let running = lab.cli("router2", "show%20running-config");
    assert_eq!(running.matches("bandwidth 1544").count(), 2, "{running}");
    assert!(running.contains("router ospf 42"), "{running}");
    assert!(running.contains("network 10.0.12.0 0.0.0.3 area 0"), "{running}");
    assert_ping(&lab, "pc3", "192.168.2.10", 124);
    assert_trace(
        &lab,
        "pc3",
        "192.168.2.10",
        &["192.168.1.1", "10.0.13.2", "10.0.35.2", "10.0.54.2", "192.168.2.10"],
    );
}

#[test]
fn ospf_multi_area_abrs_originate_backbone_summaries() {
    let lab = Lab::start(39_113);
    lab.clear_demo();
    for (model, id, x, y) in [
        ("2911", "router1", 150, 150),
        ("2911", "router2", 350, 150),
        ("2911", "router3", 550, 150),
        ("2911", "router4", 750, 150),
        ("PC-PT", "pc3", 20, 150),
        ("PC-PT", "pc4", 880, 150),
    ] {
        lab.device(model, id, x, y);
    }
    for (a, b) in [
        ("router1", "pc3"),
        ("router4", "pc4"),
        ("router1", "router2"),
        ("router2", "router3"),
        ("router3", "router4"),
    ] {
        lab.link(a, b);
    }
    lab.host("pc3", "192.168.1.10", "192.168.1.1");
    lab.host("pc4", "192.168.2.10", "192.168.2.1");
    lab.address("router1", "GigabitEthernet0/0", "192.168.1.1", "255.255.255.0");
    lab.address("router4", "GigabitEthernet0/0", "192.168.2.1", "255.255.255.0");
    for (device, interface, ip) in [
        ("router1", "GigabitEthernet0/1", "10.0.12.1"),
        ("router2", "GigabitEthernet0/0", "10.0.12.2"),
        ("router2", "GigabitEthernet0/1", "10.0.23.1"),
        ("router3", "GigabitEthernet0/0", "10.0.23.2"),
        ("router3", "GigabitEthernet0/1", "10.0.34.1"),
        ("router4", "GigabitEthernet0/1", "10.0.34.2"),
    ] {
        lab.address(device, interface, ip, "255.255.255.252");
    }
    for (device, networks) in [
        ("router1", &[("192.168.1.0 0.0.0.255", 1), ("10.0.12.0 0.0.0.3", 1)][..]),
        ("router2", &[("10.0.12.0 0.0.0.3", 1), ("10.0.23.0 0.0.0.3", 0)][..]),
        ("router3", &[("10.0.23.0 0.0.0.3", 0), ("10.0.34.0 0.0.0.3", 2)][..]),
        ("router4", &[("10.0.34.0 0.0.0.3", 2), ("192.168.2.0 0.0.0.255", 2)][..]),
    ] {
        let mut lines = vec!["en".to_string(), "conf t".to_string(), "router ospf 7".to_string()];
        lines.extend(networks.iter().map(|(network, area)| format!("network {network} area {area}")));
        lines.push("end".to_string());
        lab.config(device, lines);
    }

    let area1 = lab.cli("router1", "show%20ip%20route");
    assert!(area1.contains("O IA  192.168.2.0/24 [110/4] via 10.0.12.2"), "{area1}");
    assert!(area1.contains("O IA  10.0.23.0/30 [110/2] via 10.0.12.2"), "{area1}");
    let abr1 = lab.cli("router2", "show%20ip%20route");
    assert!(abr1.contains("O  192.168.1.0/24 [110/2]"), "{abr1}");
    assert!(abr1.contains("O IA  192.168.2.0/24 [110/3] via 10.0.23.2"), "{abr1}");
    let abr2 = lab.cli("router3", "show%20ip%20route");
    assert!(abr2.contains("O IA  192.168.1.0/24 [110/3] via 10.0.23.1"), "{abr2}");
    assert!(abr2.contains("O  192.168.2.0/24 [110/2]"), "{abr2}");
    let area2 = lab.cli("router4", "show%20ip%20route");
    assert!(area2.contains("O IA  192.168.1.0/24 [110/4] via 10.0.34.1"), "{area2}");
    assert!(area2.contains("O IA  10.0.23.0/30 [110/2] via 10.0.34.1"), "{area2}");
    assert_ping(&lab, "pc3", "192.168.2.10", 124);
    assert_trace(
        &lab,
        "pc3",
        "192.168.2.10",
        &["192.168.1.1", "10.0.12.2", "10.0.23.2", "10.0.34.2", "192.168.2.10"],
    );
    assert_ping(&lab, "pc4", "192.168.1.10", 124);
}

#[test]
fn eigrp_composite_uses_bottleneck_bandwidth_delay_and_same_as_only() {
    let lab = Lab::start(39_114);
    lab.clear_demo();
    for (model, id, x, y) in [
        ("2911", "router1", 200, 200),
        ("2911", "router2", 400, 80),
        ("2911", "router3", 350, 320),
        ("2911", "router4", 750, 200),
        ("2911", "router5", 550, 320),
        ("2911", "router6", 350, 500),
        ("PC-PT", "pc3", 50, 200),
        ("PC-PT", "pc4", 900, 200),
        ("PC-PT", "pc5", 350, 650),
    ] {
        lab.device(model, id, x, y);
    }
    for (a, b) in [
        ("router1", "pc3"),
        ("router4", "pc4"),
        ("router1", "router2"),
        ("router2", "router4"),
        ("router1", "router3"),
        ("router3", "router5"),
        ("router5", "router4"),
        ("router3", "router6"),
        ("router6", "pc5"),
    ] {
        lab.link(a, b);
    }
    lab.host("pc3", "192.168.1.10", "192.168.1.1");
    lab.host("pc4", "192.168.2.10", "192.168.2.1");
    lab.host("pc5", "198.18.99.10", "198.18.99.1");
    lab.address("router1", "GigabitEthernet0/0", "192.168.1.1", "255.255.255.0");
    lab.address("router4", "GigabitEthernet0/0", "192.168.2.1", "255.255.255.0");
    lab.address("router6", "GigabitEthernet0/1", "198.18.99.1", "255.255.255.0");
    for (device, interface, ip) in [
        ("router1", "GigabitEthernet0/1", "10.0.12.1"),
        ("router1", "GigabitEthernet0/2", "10.0.13.1"),
        ("router2", "GigabitEthernet0/0", "10.0.12.2"),
        ("router2", "GigabitEthernet0/1", "10.0.24.1"),
        ("router3", "GigabitEthernet0/0", "10.0.13.2"),
        ("router3", "GigabitEthernet0/1", "10.0.35.1"),
        ("router3", "GigabitEthernet0/2", "10.0.99.1"),
        ("router4", "GigabitEthernet0/1", "10.0.24.2"),
        ("router4", "GigabitEthernet0/2", "10.0.54.2"),
        ("router5", "GigabitEthernet0/0", "10.0.35.2"),
        ("router5", "GigabitEthernet0/1", "10.0.54.1"),
        ("router6", "GigabitEthernet0/0", "10.0.99.2"),
    ] {
        lab.address(device, interface, ip, "255.255.255.252");
    }
    for (device, interface, bandwidth, delay) in [
        ("router1", "g0/1", 100_000, 100),
        ("router2", "g0/0", 100_000, 100),
        ("router2", "g0/1", 1_000_000, 10),
        ("router4", "g0/1", 1_000_000, 10),
    ] {
        lab.config(
            device,
            [
                "en".to_string(),
                "conf t".to_string(),
                format!("interface {interface}"),
                format!("bandwidth {bandwidth}"),
                format!("delay {delay}"),
                "end".to_string(),
            ],
        );
    }
    for (device, networks) in [
        ("router1", &["192.168.1.0 0.0.0.255", "10.0.12.0 0.0.0.3", "10.0.13.0 0.0.0.3"][..]),
        ("router2", &["10.0.12.0 0.0.0.3", "10.0.24.0 0.0.0.3"][..]),
        ("router3", &["10.0.13.0 0.0.0.3", "10.0.35.0 0.0.0.3", "10.0.99.0 0.0.0.3"][..]),
        ("router4", &["192.168.2.0 0.0.0.255", "10.0.24.0 0.0.0.3", "10.0.54.0 0.0.0.3"][..]),
        ("router5", &["10.0.35.0 0.0.0.3", "10.0.54.0 0.0.0.3"][..]),
    ] {
        let mut lines = vec!["en".to_string(), "conf t".to_string(), "router eigrp 42".to_string()];
        lines.extend(networks.iter().map(|network| format!("network {network}")));
        lines.push("end".to_string());
        lab.config(device, lines);
    }
    lab.config(
        "router6",
        [
            "en",
            "conf t",
            "router eigrp 99",
            "network 10.0.99.0 0.0.0.3",
            "network 198.18.99.0 0.0.0.255",
            "end",
        ],
    );

    let routes = lab.cli("router1", "show%20ip%20route");
    // Long path: min BW 1,000,000 Kbps, delay 40 us.
    assert!(routes.contains("D  192.168.2.0/24 [90/3584] via 10.0.13.2"), "{routes}");
    assert!(!routes.contains("192.168.2.0/24 [90/28672]"), "{routes}");
    let reverse = lab.cli("router4", "show%20ip%20route");
    assert!(reverse.contains("D  192.168.1.0/24 [90/3584] via 10.0.54.1"), "{reverse}");
    assert_ping(&lab, "pc3", "192.168.2.10", 124);
    assert_trace(
        &lab,
        "pc3",
        "192.168.2.10",
        &["192.168.1.1", "10.0.13.2", "10.0.35.2", "10.0.54.2", "192.168.2.10"],
    );

    lab.config("router1", ["en", "conf t", "interface g0/2", "shutdown", "end"]);
    let routes = lab.cli("router1", "show%20ip%20route");
    // Short path: min BW 100,000 Kbps, cumulative delay 100 + 10 + 10 us.
    assert!(routes.contains("D  192.168.2.0/24 [90/28672] via 10.0.12.2"), "{routes}");
    assert!(!routes.contains("192.168.2.0/24 [90/3584]"), "{routes}");
    assert_ping(&lab, "pc3", "192.168.2.10", 125);
    assert_trace(
        &lab,
        "pc3",
        "192.168.2.10",
        &["192.168.1.1", "10.0.12.2", "10.0.24.2", "192.168.2.10"],
    );
    lab.config("router1", ["en", "conf t", "interface g0/2", "no shutdown", "end"]);

    let different_as_neighbor = lab.cli("router3", "show%20ip%20route");
    assert!(!different_as_neighbor.contains("198.18.99.0/24"), "{different_as_neighbor}");
    let different_as = lab.cli("router6", "show%20ip%20route");
    assert!(!different_as.contains("192.168.1.0/24"), "{different_as}");
    assert!(different_as.contains("198.18.99.0/24"), "{different_as}");
    assert_unreachable(&lab, "pc3", "198.18.99.10");
}

#[test]
fn dhcp_lease_options_and_renewal_are_consistent() {
    let lab = Lab::start(39_115);
    let pool = lab.post("/api/devices/dhcp?id=server0&network=192.168.2.0&prefix=24&gateway=192.168.2.1&dns=192.168.2.20");
    assert!(!pool.contains("\"error\""), "{pool}");
    let leased = lab.post("/api/dhcp/acquire?id=pc2");
    assert!(leased.contains("\"ip\":\"192.168.2.100\""), "{leased}");
    let config = lab.cmd("pc2", "ipconfig");
    for option in [
        "192.168.2.100",
        "255.255.255.0",
        "Default Gateway.................: 192.168.2.1",
        "DNS Servers.....................: 192.168.2.20",
    ] {
        assert!(config.contains(option), "missing {option}: {config}");
    }

    let renewed = lab.cmd("pc2", "ipconfig /renew");
    assert!(renewed.contains("Lease from server0: 192.168.2.100"), "{renewed}");
    let released = lab.cmd("pc2", "ipconfig /release");
    assert!(released.contains("successfully released"), "{released}");
    let reused = lab.cmd("pc2", "ipconfig /renew");
    assert!(reused.contains("Lease from server0: 192.168.2.100"), "{reused}");

    // A static override must also free the old dynamic address.
    lab.post("/api/devices/ip?id=pc2&ip=192.168.2.50&mask=255.255.255.0&gateway=192.168.2.1&dns=192.168.2.20");
    let after_static = lab.post("/api/dhcp/acquire?id=pc2");
    assert!(after_static.contains("\"ip\":\"192.168.2.100\""), "{after_static}");
    let state = lab.get("/api/workspace");
    assert_eq!(state.matches("\"type\":\"DHCP\",\"proto\":\"DHCP\"").count(), 4, "{state}");
}

#[test]
fn routed_dns_resolves_nslookup_ping_and_browser() {
    let lab = Lab::start(39_116);
    let configured = lab.post("/api/devices/ip?id=pc0&ip=192.168.1.10&mask=255.255.255.0&gateway=192.168.1.1&dns=192.168.2.20");
    assert!(!configured.contains("\"error\""), "{configured}");
    lab.post("/api/devices/dns?id=server0&name=web.lab&ip=192.168.2.20");

    let lookup = lab.cmd("pc0", "nslookup web.lab");
    assert!(lookup.contains("Server:  dns\nAddress:  192.168.2.20"), "{lookup}");
    assert!(lookup.contains("Name:    web.lab\nAddress:  192.168.2.20"), "{lookup}");
    assert_ping(&lab, "pc0", "web.lab", 127);
    let page = lab.post("/api/webfetch?id=pc0&url=http%3A%2F%2Fweb.lab%2F");
    assert!(page.contains("\"status\":200") && page.contains("\"title\":\"Server0\""), "{page}");

    lab.post("/api/devices/dns?id=server0&name=web.lab&remove=1");
    let missing = lab.cmd("pc0", "nslookup web.lab");
    assert!(missing.contains("timed out"), "{missing}");
}

#[test]
fn nat_overload_rewrites_only_matching_inside_sources() {
    let lab = Lab::start(39_117);
    lab.device("PC-PT", "pc3", 50, 500);
    lab.device("2960", "switch2", 200, 500);
    lab.link("pc3", "switch2");
    lab.link("router0", "switch2");
    lab.host("pc3", "192.168.3.10", "192.168.3.1");
    lab.address("router0", "GigabitEthernet0/2", "192.168.3.1", "255.255.255.0");
    lab.config(
        "router0",
        [
            "en",
            "conf t",
            "access-list 10 permit 192.168.1.0 0.0.0.255",
            "ip nat inside source list 10 interface g0/1 overload",
            "interface g0/0",
            "ip nat inside",
            "interface g0/1",
            "ip nat outside",
            "interface g0/2",
            "ip nat inside",
            "end",
        ],
    );

    assert_ping(&lab, "pc0", "192.168.2.20", 127);
    let translations = lab.cli("router0", "show%20ip%20nat%20translations");
    assert!(translations.contains("192.168.1.10 -> 192.168.2.1"), "{translations}");
    let state = lab.get("/api/workspace");
    let events = state.split("\"events\":[").nth(1).expect("events");
    let event = &events[events.rfind("\"type\":\"ICMP\",\"proto\":\"ICMP\"").expect("ping event")..];
    let source = event.split("\"id\":\"pc0\"").nth(1).and_then(|h| h.split('}').next()).expect("source hop");
    let destination = event.split("\"id\":\"server0\"").nth(1).and_then(|h| h.split('}').next()).expect("destination hop");
    assert!(source.contains("\"srcIp\":\"192.168.1.10\""), "{source}");
    assert!(destination.contains("\"srcIp\":\"192.168.2.1\""), "{destination}");
    assert!(destination.contains("\"dstIp\":\"192.168.2.20\""), "{destination}");

    assert_ping(&lab, "pc3", "192.168.2.20", 127);
    let translations = lab.cli("router0", "show%20ip%20nat%20translations");
    assert!(!translations.contains("192.168.3.10 ->"), "{translations}");
    let state = lab.get("/api/workspace");
    let events = state.split("\"events\":[").nth(1).expect("events");
    let event = &events[events.rfind("\"type\":\"ICMP\",\"proto\":\"ICMP\"").expect("ping event")..];
    let destination = event.split("\"id\":\"server0\"").nth(1).and_then(|h| h.split('}').next()).expect("destination hop");
    assert!(destination.contains("\"srcIp\":\"192.168.3.10\""), "{destination}");
}

#[test]
fn extended_acl_first_match_permit_and_implicit_deny() {
    let lab = Lab::start(39_118);
    lab.config(
        "router0",
        [
            "en",
            "conf t",
            "access-list 100 deny ip host 192.168.1.10 host 192.168.2.20",
            "access-list 100 permit ip host 192.168.1.11 host 192.168.2.20",
            "access-list 100 permit ip any any",
            "interface g0/1",
            "ip access-group 100 out",
            "end",
        ],
    );
    assert_unreachable(&lab, "pc0", "192.168.2.20");
    assert_ping(&lab, "pc1", "192.168.2.20", 127);
    let lists = lab.cli("router0", "show%20access-lists");
    let deny = lists.find("100 deny 192.168.1.10 0.0.0.0 192.168.2.20 0.0.0.0").expect("deny ACE");
    let permit = lists.find("100 permit 192.168.1.11 0.0.0.0 192.168.2.20 0.0.0.0").expect("permit ACE");
    let any = lists.find("100 permit 0.0.0.0 255.255.255.255 0.0.0.0 255.255.255.255").expect("final permit");
    assert!(deny < permit && permit < any, "ACE order changed: {lists}");
    assert!(lists.contains("GigabitEthernet0/1 100 out"), "{lists}");

    lab.config(
        "router0",
        [
            "conf t",
            "access-list 101 deny ip host 192.168.1.10 host 192.168.2.20",
            "access-list 101 permit ip host 198.51.100.10 host 192.168.2.20",
            "interface g0/1",
            "ip access-group 101 out",
            "end",
        ],
    );
    assert_unreachable(&lab, "pc1", "192.168.2.20");
}

#[test]
fn simulation_capture_has_real_http_layers_and_dropped_pdus() {
    let lab = Lab::start(39_119);
    lab.post("/api/pdu?src=pc0&dst=server0");
    let page = lab.post("/api/webfetch?id=pc0&url=http%3A%2F%2F192.168.2.20%2F");
    assert!(page.contains("\"status\":200"), "{page}");

    let state = lab.get("/api/workspace");
    assert!(state.contains("\"type\":\"ICMP\",\"proto\":\"ICMP\""), "{state}");
    assert!(state.contains("\"type\":\"HTTP\",\"proto\":\"HTTP\""), "{state}");
    let events = state.split("\"events\":[").nth(1).expect("events");
    let http = &events[events.rfind("\"type\":\"HTTP\",\"proto\":\"HTTP\"").expect("HTTP event")..];
    assert!(http.contains("\"status\":\"Successful\""), "{http}");
    for layer in ["Ethernet II", "IPv4", "TCP", "HTTP"] {
        assert!(http.contains(&format!("\"name\":\"{layer}\"")), "missing {layer}: {http}");
    }
    assert!(http.contains("\"name\":\"Protocol\",\"value\":\"TCP (6)\""), "{http}");
    assert!(http.contains("\"name\":\"Destination Port\",\"value\":\"80\""), "{http}");
    assert!(http.contains("\"name\":\"Request Line\",\"value\":\"GET / HTTP/1.1\""), "{http}");
    assert!(!http.contains("\"name\":\"ICMP\""), "HTTP was relabeled ICMP: {http}");

    lab.config(
        "router0",
        [
            "en",
            "conf t",
            "access-list 100 deny ip host 192.168.1.10 host 192.168.2.20",
            "access-list 100 permit ip any any",
            "interface g0/1",
            "ip access-group 100 out",
            "end",
        ],
    );
    let dropped = lab.post("/api/pdu?src=pc0&dst=server0");
    assert!(dropped.contains("ACL denied"), "{dropped}");
    let state = lab.get("/api/workspace");
    let events = state.split("\"events\":[").nth(1).expect("events");
    let drop = &events[events.rfind("\"type\":\"ICMP\",\"proto\":\"ICMP\"").expect("drop event")..];
    assert!(drop.contains("\"status\":\"Dropped\""), "{drop}");
    assert!(drop.contains("ACL denied on Router0 GigabitEthernet0/1"), "{drop}");
    let hops = drop.split("\"hops\":[").nth(1).expect("drop hops");
    assert!(hops.contains("\"id\":\"router0\""), "partial hops missing: {hops}");
    assert!(!hops.contains("\"id\":\"server0\""), "drop reached destination: {hops}");
}

#[test]
fn control_plane_events_explain_dhcp_dns_and_smtp() {
    let lab = Lab::start(39_120);
    lab.post("/api/devices/dhcp?id=server0&network=192.168.2.0&prefix=24&gateway=192.168.2.1&dns=192.168.2.20");
    lab.post("/api/dhcp/acquire?id=pc2");
    lab.post("/api/devices/ip?id=pc0&ip=192.168.1.10&mask=255.255.255.0&gateway=192.168.1.1&dns=192.168.2.20");
    lab.post("/api/devices/dns?id=server0&name=web.lab&ip=192.168.2.20");
    let lookup = lab.cmd("pc0", "nslookup web.lab");
    assert!(lookup.contains("192.168.2.20"), "{lookup}");
    for user in ["alice", "bob"] {
        lab.post(&format!("/api/devices/mailuser?id=server0&user={user}&pass=pw"));
    }
    lab.post("/api/mail/send?id=pc0&server=server0&from=alice&to=bob&subject=lab&body=hello");

    let state = lab.get("/api/workspace");
    let events = state.split("\"events\":[").nth(1).expect("events");
    for (proto, field) in [
        ("DHCP", "DISCOVER / OFFER / REQUEST / ACK"),
        ("DNS", "web.lab A"),
        ("SMTP", "alice"),
    ] {
        let event = &events[events.rfind(&format!("\"type\":\"{proto}\",\"proto\":\"{proto}\"")).expect(proto)..];
        assert!(event.contains("Control-plane service exchange"), "{proto}: {event}");
        assert!(event.contains(field), "{proto}: {event}");
        assert!(event.contains(&format!("\"name\":\"{proto}\"")), "{proto}: {event}");
    }
    for label in ["MODBUS", "PROFINET", "Cellular"] {
        assert!(state.split("\"filters\":[").nth(1).is_some_and(|f| f.contains(&format!("\"{label}\""))), "missing filter {label}");
    }
}
