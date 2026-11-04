//! Endpoint command interpreter: the PC's Command Prompt, run server-side so
//! every command sees the same simulated network the packet engine uses.

use crate::model::ipv4_string;
use crate::workspace::{Device, Workspace};

/// Execute one command line from device `id`.
pub fn run(ws: &mut Workspace, id: &str, line: &str) -> String {
    let line = line.trim();
    if line.is_empty() {
        return String::new();
    }
    let mut parts = line.split_whitespace();
    let verb = parts.next().unwrap_or("").to_ascii_lowercase();
    let args: Vec<&str> = parts.collect();
    let arg = args.first().copied().unwrap_or("");

    match verb.as_str() {
        "ipconfig" if arg.eq_ignore_ascii_case("/release") => ipconfig_release(ws, id),
        "ipconfig" if arg.eq_ignore_ascii_case("/renew") => match ws.acquire_dhcp(id) {
            Ok(lease) => {
                let mut out = format!(
                    "Windows IP Configuration\n\nDHCP enabled: Yes\nLease from {}: {}\n\n",
                    lease.server,
                    ipv4_string(lease.ip)
                );
                out.push_str(&ipconfig(ws, id));
                out
            }
            Err(e) => format!("An error occurred while renewing interface FastEthernet0: {e}\n\n"),
        },
        "ipconfig" => ipconfig(ws, id),
        "ping" => ping(ws, id, &args),
        "tracert" | "traceroute" => tracert(ws, id, &args),
        "arp" => arp(ws, id, arg),
        "route" => match arg.to_ascii_lowercase().as_str() {
            "print" => route_print(ws, id),
            _ => bad_option(),
        },
        "nslookup" => nslookup(ws, id, arg),
        "netstat" => netstat(ws, id),
        "telnet" => telnet(ws, id, arg).0,
        "help" => help(),
        other => format!(
            "'{other}' is not recognized as an internal or external command,\noperable program or batch file.\n\n"
        ),
    }
}

/// Windows' answer to a malformed option list.
fn bad_option() -> String {
    String::from("Bad option\n\n")
}

/// Pull `-flag VALUE` out of `args`, leaving the non-option words in `rest`.
/// `None` means the flag was malformed or out of range.
fn flag_value<'a>(args: &[&'a str], flag: &str, max: usize) -> Option<usize> {
    let mut value = None;
    let mut i = 0;
    while i < args.len() {
        if args[i].eq_ignore_ascii_case(flag) {
            let raw = args.get(i + 1)?;
            let n: usize = raw.parse().ok()?;
            if n == 0 || n > max {
                return None;
            }
            value = Some(n);
            i += 2;
        } else {
            i += 1;
        }
    }
    value
}

fn dev<'a>(ws: &'a Workspace, id: &str) -> Option<&'a Device> {
    ws.devices.iter().find(|d| d.id == id)
}

fn ipconfig(ws: &Workspace, id: &str) -> String {
    let Some(d) = dev(ws, id) else {
        return String::new();
    };
    let ip = d.ip.map(ipv4_string).unwrap_or_else(|| "0.0.0.0".into());
    let mask = ipv4_string(crate::model::mask_of(d.prefix));
    let gw = d.gateway.map(ipv4_string).unwrap_or_else(|| "0.0.0.0".into());
    let dns = d.dns.map(ipv4_string).unwrap_or_else(|| "0.0.0.0".into());
    let mut out = String::from("\nFastEthernet0 Connection:(default port)\n\n");
    out.push_str("   Connection-specific DNS Suffix..: \n");
    out.push_str(&format!("   Physical Address................: {}\n", crate::net::packet::Mac::for_device(&d.id)));
    out.push_str(&format!("   Link-local IPv6 Address.........: FE80::{}FF:FE00:1\n", &d.id.len()));
    out.push_str(&format!("   IPv4 Address....................: {ip}\n"));
    out.push_str(&format!("   Subnet Mask.....................: {mask}\n"));
    out.push_str(&format!("   Default Gateway.................: {gw}\n"));
    out.push_str(&format!("   DNS Servers.....................: {dns}\n\n"));
    out
}

/// `ipconfig /release` — drop the lease and the address it configured.
fn ipconfig_release(ws: &mut Workspace, id: &str) -> String {
    if !ws.devices.iter().any(|d| d.id == id) {
        return String::new();
    }
    ws.release_dhcp(id);
    String::from(
        "Windows IP Configuration\n\nIP address successfully released for adapter \"FastEthernet0\"\n\n",
    )
}

/// Resolve `target` to a device by address, then run a real delivery.
fn ping(ws: &mut Workspace, id: &str, args: &[&str]) -> String {
    let count = match flag_value(args, "-n", 20) {
        Some(n) => n,
        None if args.iter().any(|a| a.eq_ignore_ascii_case("-n")) => return bad_option(),
        None => 4,
    };
    // Every non-option word is the host; anything else is a bad option.
    let mut target = None;
    let mut skip = false;
    for arg in args {
        if skip {
            skip = false;
            continue;
        }
        if arg.eq_ignore_ascii_case("-n") {
            skip = true;
            continue;
        }
        if arg.starts_with('-') && arg.len() > 1 {
            return bad_option();
        }
        if target.is_some() {
            return bad_option();
        }
        target = Some(*arg);
    }
    let target = target.unwrap_or("");
    ping_host(ws, id, target, count)
}

fn ping_host(ws: &mut Workspace, id: &str, target: &str, count: usize) -> String {
    let Some(ip) = crate::model::parse_ipv4(target).or_else(|| ws.resolve_name_captured(id, target)) else {
        return format!("Ping request could not find host {target}. Please check the name and try again.\n\n");
    };
    let Some(dst) = ws
        .devices
        .iter()
        .find(|d| d.ip == Some(ip) || d.ports.iter().any(|p| p.ip == Some(ip)))
        .map(|d| d.id.clone())
    else {
        return format!(
            "Pinging {target} with 32 bytes of data:\n\nRequest timed out.\n\nPing statistics for {target}:\n    Packets: Sent = {count}, Received = 0, Lost = {count} (100% loss),\n\n"
        );
    };

    let mut out = format!("Pinging {target} with 32 bytes of data:\n\n");
    match ws.send_pdu(id, &dst) {
        Ok(()) => {
            let ttl = ws
                .events
                .last()
                .and_then(|event| event.hops.last())
                .map_or(128, |hop| hop.ttl);
            for _ in 0..count {
                out.push_str(&format!("Reply from {target}: bytes=32 time<1ms TTL={ttl}\n"));
            }
            out.push_str(&format!(
                "\nPing statistics for {target}:\n    Packets: Sent = {count}, Received = {count}, Lost = 0 (0% loss),\nApproximate round trip times in milli-seconds:\n    Minimum = 0ms, Maximum = 0ms, Average = 0ms\n\n"
            ));
        }
        Err(e) => {
            let reason = if e.contains("administratively down")
                || e.contains("no route")
                || e.contains("powered off")
            {
                "Destination host unreachable"
            } else {
                "Request timed out"
            };
            for _ in 0..count {
                out.push_str(&format!("Reply from {target}: {reason}.\n"));
            }
            out.push_str(&format!(
                "\nPing statistics for {target}:\n    Packets: Sent = {count}, Received = 0, Lost = {count} (100% loss),\n\n"
            ));
        }
    }
    out
}

fn tracert(ws: &mut Workspace, id: &str, args: &[&str]) -> String {
    let limit = match flag_value(args, "-h", 30) {
        Some(n) => n,
        None if args.iter().any(|a| a.eq_ignore_ascii_case("-h")) => return bad_option(),
        None => 30,
    };
    let mut target = None;
    let mut skip = false;
    for arg in args {
        if skip {
            skip = false;
            continue;
        }
        if arg.eq_ignore_ascii_case("-h") {
            skip = true;
            continue;
        }
        if arg.starts_with('-') && arg.len() > 1 {
            return bad_option();
        }
        if target.is_some() {
            return bad_option();
        }
        target = Some(*arg);
    }
    tracert_host(ws, id, target.unwrap_or(""), limit)
}

fn tracert_host(ws: &mut Workspace, id: &str, target: &str, limit: usize) -> String {
    let Some(ip) = crate::model::parse_ipv4(target) else {
        return format!("Unable to resolve target system name {target}.\n\n");
    };
    let Some(dst) = ws
        .devices
        .iter()
        .find(|d| d.ip == Some(ip) || d.ports.iter().any(|p| p.ip == Some(ip)))
        .map(|d| d.id.clone())
    else {
        return format!("Unable to resolve target system name {target}.\n\n");
    };
    if let Err(e) = ws.send_pdu(id, &dst) {
        return format!("Tracing route to {target} over a maximum of {limit} hops:\n\n  1     *        *        *     Request timed out.\n\n{e}\n");
    }
    let hops = ws.events.last().map(|e| e.hops.clone()).unwrap_or_default();
    let mut out = format!("Tracing route to {target} over a maximum of {limit} hops:\n\n");
    let mut n = 0;
    let mut complete = false;
    for (i, hop) in hops.iter().enumerate() {
        if i == 0 {
            continue; // the sender itself is not a hop
        }
        // L2 switches do not appear in a traceroute.
        let Some(d) = dev(ws, &hop.id) else { continue };
        if d.kind == "switch" || d.kind == "hub" {
            continue;
        }
        if i == hops.len() - 1 && n == limit {
            break;
        }
        n += 1;
        // A router answers from the interface that received the probe; the
        // destination answers with its own address.
        let addr = if i == hops.len() - 1 {
            d.ip.map(ipv4_string)
        } else {
            hop.ingress
                .as_ref()
                .and_then(|port| {
                    d.ports
                        .iter()
                        .find(|p| &p.name == port)
                        .and_then(|p| p.ip)
                        .map(ipv4_string)
                })
        }
        .unwrap_or_else(|| d.name.clone());
        out.push_str(&format!("  {n}    1 ms    1 ms    1 ms  {addr}\n"));
        complete = i == hops.len() - 1;
    }
    if complete {
        out.push_str("\nTrace complete.\n\n");
    }
    out
}

fn arp(ws: &mut Workspace, id: &str, arg: &str) -> String {
    if arg.eq_ignore_ascii_case("-d") || arg == "*" {
        // A fresh cache is the only whole-table delete the packet API offers.
        *ws.tables.arps(id) = crate::net::packet::ArpTable::new(120.0);
        return String::new();
    }
    let Some(d) = dev(ws, id) else {
        return String::new();
    };
    let own = d.ip.map(ipv4_string).unwrap_or_else(|| "0.0.0.0".into());
    let mut out = format!("\nInterface: {own} --- 0x2\n");
    out.push_str("  Internet Address      Physical Address      Type\n");
    for e in ws.tables.arp_rows(id) {
        let mac = e.mac.to_string().replace('.', "-");
        out.push_str(&format!(
            "  {:<21} {:<21} dynamic\n",
            ipv4_string(e.ip),
            mac
        ));
    }
    out.push('\n');
    out
}

/// `route print` — Windows' IPv4 table: static routes plus the default route.
fn route_print(ws: &Workspace, id: &str) -> String {
    let Some(d) = dev(ws, id) else {
        return String::new();
    };
    let own = d.ip.map(ipv4_string).unwrap_or_else(|| "0.0.0.0".into());
    let mac = crate::net::packet::Mac::for_device(&d.id).to_string().replace('.', "-");
    let mut out = String::from("===========================================================================\n");
    out.push_str("Interface List\n");
    out.push_str(&format!("  2 ...{mac} ......FastEthernet0\n"));
    out.push_str("===========================================================================\n\n");
    out.push_str("IPv4 Route Table\n");
    out.push_str("===========================================================================\n");
    out.push_str("Active Routes:\n");
    out.push_str("Network Destination        Netmask          Gateway       Interface  Metric\n");
    for route in &d.routes {
        out.push_str(&format!(
            "{:<27}{:<17}{:<14}{:<17}{}\n",
            ipv4_string(route.network),
            ipv4_string(crate::model::mask_of(route.prefix)),
            ipv4_string(route.next_hop),
            own,
            25
        ));
    }
    if let Some(gw) = d.gateway {
        out.push_str(&format!(
            "{:<27}{:<17}{:<14}{:<17}{}\n",
            "0.0.0.0",
            "0.0.0.0",
            ipv4_string(gw),
            own,
            25
        ));
    }
    out.push_str("===========================================================================\n");
    out.push_str("Persistent Routes:\n  None\n\n");
    out
}

fn nslookup(ws: &mut Workspace, id: &str, name: &str) -> String {
    let name = name.trim();
    if name.is_empty() {
        return "Default Server:  UnKnown\nAddress:  0.0.0.0\n\n".to_string();
    }
    let server = dev(ws, id)
        .and_then(|d| d.dns)
        .map(ipv4_string)
        .unwrap_or_else(|| "0.0.0.0".into());
    match ws.resolve_name_captured(id, name) {
        Some(ip) => format!(
            "\nServer:  dns\nAddress:  {server}\n\nNon-authoritative answer:\nName:    {name}\nAddress:  {}\n\n",
            ipv4_string(ip)
        ),
        None => String::from(
            "DNS request timed out.\n    timeout was 2 seconds.\n*** Request to UnKnown timed-out\n\n",
        ),
    }
}

fn netstat(ws: &Workspace, id: &str) -> String {
    let ip = dev(ws, id)
        .and_then(|d| d.ip)
        .map(ipv4_string)
        .unwrap_or_else(|| "0.0.0.0".into());
    format!(
        "\nActive Connections\n\n  Proto  Local Address          Foreign Address        State\n  TCP    {ip}:135              0.0.0.0:0              LISTENING\n  TCP    {ip}:445              0.0.0.0:0              LISTENING\n  UDP    {ip}:123              *:*\n\n"
    )
}

/// `telnet HOST` — a reachable router or switch hands back a CLI session.
pub fn telnet(ws: &mut Workspace, id: &str, target: &str) -> (String, Option<String>) {
    let fail = |t: &str| {
        (
            format!("Connecting To {t}...Could not open connection to the host, on port 23: Connect failed\n\n"),
            None,
        )
    };
    let Some(ip) = crate::model::parse_ipv4(target) else {
        return fail(target);
    };
    let Some(dst) = ws
        .devices
        .iter()
        .find(|d| d.ip == Some(ip) || d.ports.iter().any(|p| p.ip == Some(ip)))
        .map(|d| (d.id.clone(), d.kind.clone()))
    else {
        return fail(target);
    };
    if !matches!(dst.1.as_str(), "router" | "switch" | "rtrw-gateway" | "switch-l3") {
        return fail(target);
    }
    match ws.send_pdu(id, &dst.0) {
        Ok(()) => (
            format!("Trying {} ...Open\n\n", ipv4_string(ip)),
            Some(dst.0),
        ),
        Err(_) => (
            format!("Trying {} ...Open\n\nConnection closed by remote host.\n\n", ipv4_string(ip)),
            None,
        ),
    }
}

fn help() -> String {
    String::from(
        "Available commands:\n  ipconfig              Show the adapter configuration\n  ipconfig /release     Release the DHCP address\n  ipconfig /renew       Request a DHCP address\n  ping [-n N] <host>    Send ICMP echo requests (default 4, max 20)\n  tracert [-h N] <host> Trace the path, at most N hops (default 30)\n  arp -a                Show the ARP cache\n  arp -d                Clear the ARP cache\n  route print           Show the IPv4 routing table\n  nslookup <name>       Resolve a name\n  netstat               Show local sockets\n  cls                   Clear the screen\n  exit                  Close the window\n\n",
    )
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn ipconfig_reflects_the_device_configuration() {
        let mut ws = Workspace::new();
        let out = run(&mut ws, "pc0", "ipconfig");
        assert!(out.contains("192.168.1.10"), "{out}");
        assert!(out.contains("255.255.255.0"), "{out}");
        assert!(out.contains("192.168.1.1"), "{out}");
        assert!(out.contains("DNS Servers"), "{out}");
    }

    #[test]
    fn ping_crosses_the_router_and_records_an_event() {
        let mut ws = Workspace::new();
        let out = run(&mut ws, "pc0", "ping 192.168.2.10");
        assert_eq!(out.matches("Reply from 192.168.2.10").count(), 4, "{out}");
        assert!(out.contains("0% loss"), "{out}");
        assert!(out.contains("TTL=127"), "{out}");
        assert_eq!(ws.events.iter().filter(|event| event.proto == "ICMP").count(), 1);

        let mut ws = Workspace::new();
        let out = run(&mut ws, "pc0", "ping -n 1 192.168.1.11");
        assert!(out.contains("TTL=128"), "{out}");
    }

    #[test]
    fn ping_reports_an_unreachable_helper() {
        let mut ws = Workspace::new();
        let out = run(&mut ws, "pc0", "ping 10.9.9.9");
        assert!(out.contains("Request timed out"), "{out}");
        assert!(out.contains("100% loss"), "{out}");
    }

    #[test]
    fn tracert_lists_l3_hops_only() {
        let mut ws = Workspace::new();
        let out = run(&mut ws, "pc0", "tracert 192.168.2.10");
        assert!(out.contains("Tracing route to 192.168.2.10"), "{out}");
        assert!(out.contains("192.168.1.1"), "gateway hop: {out}");
        assert!(out.contains("192.168.2.10"), "{out}");
        assert!(!out.contains("192.168.1.10"), "sender is not a hop: {out}");
        assert!(!out.contains("Switch0"), "switches are not hops: {out}");
        assert!(out.contains("Trace complete"), "{out}");
    }

    #[test]
    fn arp_lists_learned_neighbours() {
        let mut ws = Workspace::new();
        run(&mut ws, "pc0", "ping 192.168.1.11");
        let out = run(&mut ws, "pc0", "arp -a");
        assert!(out.contains("192.168.1.11"), "{out}");
        assert!(out.contains("dynamic"), "{out}");

        // Cross-subnet traffic caches the gateway, not the far host.
        run(&mut ws, "pc0", "ping 192.168.2.10");
        let out = run(&mut ws, "pc0", "arp -a");
        assert!(out.contains("192.168.1.1"), "gateway cached: {out}");
    }

    #[test]
    fn telnet_opens_on_a_router_and_fails_on_a_host() {
        let mut ws = Workspace::new();
        let (out, peer) = telnet(&mut ws, "pc0", "192.168.1.1");
        assert!(out.contains("Open"), "{out}");
        assert_eq!(peer.as_deref(), Some("router0"));

        let (out, peer) = telnet(&mut ws, "pc0", "192.168.1.11");
        assert!(out.contains("Could not open"), "{out}");
        assert!(peer.is_none());
    }

    #[test]
    fn nslookup_uses_the_dns_records() {
        let mut ws = Workspace::new();
        ws.set_config(
            "pc2",
            "192.168.2.10",
            "255.255.255.0",
            "192.168.2.1",
            "192.168.2.20",
        )
        .unwrap();
        ws.set_dns_record("server0", "web.lab", "192.168.2.20").unwrap();
        let hit = run(&mut ws, "pc2", "nslookup web.lab");
        assert!(hit.contains("Address:  192.168.2.20"), "{hit}");
        let miss = run(&mut ws, "pc2", "nslookup nothing.lab");
        assert!(miss.contains("timed out"), "{miss}");
    }

    #[test]
    fn unknown_commands_print_the_windows_error() {
        let mut ws = Workspace::new();
        assert!(run(&mut ws, "pc0", "frobnicate").contains("is not recognized"));
    }

    #[test]
    fn ping_honours_the_count_flag() {
        let mut ws = Workspace::new();
        let out = run(&mut ws, "pc0", "ping -n 1 192.168.2.10");
        assert_eq!(out.matches("Reply from 192.168.2.10").count(), 1, "{out}");
        assert!(out.contains("Sent = 1, Received = 1"), "{out}");
        assert!(out.contains("0% loss"), "{out}");

        let out = run(&mut ws, "pc0", "ping -n 3 192.168.2.10");
        assert_eq!(out.matches("Reply from 192.168.2.10").count(), 3, "{out}");
        assert!(out.contains("Sent = 3, Received = 3"), "{out}");

        // The default is still four.
        let out = run(&mut ws, "pc0", "ping 192.168.2.10");
        assert_eq!(out.matches("Reply from 192.168.2.10").count(), 4, "{out}");
        assert!(out.contains("Sent = 4, Received = 4"), "{out}");
    }

    #[test]
    fn ping_rejects_bad_options() {
        let mut ws = Workspace::new();
        for line in [
            "ping -n 0 192.168.2.10",
            "ping -n 21 192.168.2.10",
            "ping -n x 192.168.2.10",
            "ping -n",
            "ping -q 192.168.2.10",
        ] {
            let out = run(&mut ws, "pc0", line);
            assert!(out.starts_with("Bad option"), "{line}: {out}");
        }
        assert!(ws.events.is_empty(), "a rejected option sends nothing");
    }

    #[test]
    fn tracert_honours_the_hop_limit() {
        let mut ws = Workspace::new();
        let all = run(&mut ws, "pc0", "tracert 192.168.2.10");
        assert!(all.contains("maximum of 30 hops"), "{all}");
        assert!(all.contains("192.168.2.10"), "{all}");

        let mut ws = Workspace::new();
        let out = run(&mut ws, "pc0", "tracert -h 1 192.168.2.10");
        assert!(out.contains("maximum of 1 hops"), "{out}");
        assert!(out.contains("192.168.1.1"), "{out}");
        assert!(
            !out.lines().any(|l| l.contains("1 ms") && l.contains("192.168.2.10")),
            "the destination is beyond the limit: {out}"
        );
        assert_eq!(
            out.lines().filter(|l| l.contains("1 ms")).count(),
            1,
            "one hop line only: {out}"
        );
    }

    #[test]
    fn tracert_rejects_bad_options() {
        let mut ws = Workspace::new();
        for line in [
            "tracert -h 0 192.168.2.10",
            "tracert -h 31 192.168.2.10",
            "tracert -h x 192.168.2.10",
            "tracert -h",
        ] {
            let out = run(&mut ws, "pc0", line);
            assert!(out.starts_with("Bad option"), "{line}: {out}");
        }
    }

    #[test]
    fn arp_dash_d_clears_the_cache() {
        let mut ws = Workspace::new();
        run(&mut ws, "pc0", "ping 192.168.1.11");
        let before = run(&mut ws, "pc0", "arp -a");
        assert!(before.contains("192.168.1.11"), "{before}");

        let cleared = run(&mut ws, "pc0", "arp -d");
        assert!(cleared.trim().is_empty(), "{cleared}");

        let after = run(&mut ws, "pc0", "arp -a");
        assert!(!after.contains("192.168.1.11"), "{after}");
        assert!(after.contains("Internet Address"), "header stays: {after}");
        assert!(ws.tables.arp_rows("pc0").is_empty());
    }

    #[test]
    fn ipconfig_release_clears_the_dhcp_state() {
        let mut ws = Workspace::new();
        ws.set_dhcp_pool("server0", "192.168.2.0", 24, "192.168.2.1", "8.8.8.8")
            .unwrap();
        let pc = ws.add("PC-PT", 600.0, 200.0).unwrap();
        ws.link(&pc, "switch1").unwrap();
        ws.acquire_dhcp(&pc).unwrap();
        assert!(ws.dhcp_clients.contains(&pc));

        let out = run(&mut ws, &pc, "ipconfig /release");
        assert!(out.contains("Windows IP Configuration"), "{out}");
        assert!(out.contains("IP address successfully released"), "{out}");

        let d = ws.devices.iter().find(|d| d.id == pc).unwrap();
        assert_eq!(d.ip, None, "address cleared");
        assert_eq!(d.gateway, None, "gateway cleared");
        assert_eq!(d.dns, None, "DNS cleared");
        assert!(!ws.dhcp_clients.contains(&pc), "no longer a DHCP client");
        assert!(run(&mut ws, &pc, "ipconfig").contains("0.0.0.0"));
    }

    #[test]
    fn route_print_lists_statics_and_the_default_gateway() {
        let mut ws = Workspace::new();
        ws.add_route("pc0", "10.0.0.0", "255.0.0.0", "192.168.1.1", 1)
            .unwrap();
        let out = run(&mut ws, "pc0", "route print");
        assert!(out.contains("IPv4 Route Table"), "{out}");
        assert!(out.contains("Active Routes:"), "{out}");
        assert!(out.contains("10.0.0.0"), "{out}");
        assert!(out.contains("255.0.0.0"), "{out}");

        let default = out
            .lines()
            .find(|l| l.trim_start().starts_with("0.0.0.0"))
            .unwrap_or_else(|| panic!("no default route row: {out}"));
        assert!(default.contains("192.168.1.1"), "{default}");
        assert!(default.contains("192.168.1.10"), "{default}");

        assert!(run(&mut ws, "pc0", "route add").starts_with("Bad option"));
    }

    #[test]
    fn help_documents_the_new_options() {
        let mut ws = Workspace::new();
        let out = run(&mut ws, "pc0", "help");
        for needle in [
            "ipconfig /release",
            "ping [-n N]",
            "tracert [-h N]",
            "arp -d",
            "route print",
        ] {
            assert!(out.contains(needle), "{needle} missing: {out}");
        }
    }
}
