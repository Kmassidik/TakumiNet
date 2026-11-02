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
    assert!(routing.contains("router rip\n network 192.168.1.0"), "{routing}");
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
    assert!(running.contains("router rip\n network 192.168.1.0"), "{running}");
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
fn unreachable_and_expired_icmp_are_reported() {
    let lab = Lab::start(39_103);
    let unreachable = lab.command("pc0", "ping%20-n%201%2010.9.9.9");
    assert!(unreachable.contains("100% loss"), "{unreachable}");
    let expired = lab.command("pc0", "tracert%20-h%201%20192.168.2.10");
    assert!(expired.contains("192.168.1.1"), "{expired}");
    assert!(!expired.contains("Trace complete"), "{expired}");
}
