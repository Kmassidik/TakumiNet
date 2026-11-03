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
        assert!(stp.contains("Address     00d0.ba35.f1c0"), "{sw}: {stp}");
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
    assert!(stp.contains("Address     00d0.ba35.f679"), "{stp}");
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
