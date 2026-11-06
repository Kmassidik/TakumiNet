//! Endpoint command interpreter: the PC's Command Prompt, run server-side so
//! every command sees the same simulated network the packet engine uses.

use crate::model::ipv4_string;
use crate::workspace::{Device, Workspace};

mod help;
mod shell;
mod ufw;

pub use shell::{connect, prompt};

/// Execute one command line from device `id`.
pub fn run(ws: &mut Workspace, id: &str, line: &str) -> String {
    let line = line.trim();
    if line.is_empty() {
        return String::new();
    }
    let mut parts = line.split_whitespace();
    let mut verb = parts.next().unwrap_or("").to_ascii_lowercase();
    let mut args: Vec<&str> = parts.collect();
    let root = verb == "sudo" && !args.is_empty() && !help::wants_help(&verb, &args);
    if root {
        verb = args.remove(0).to_ascii_lowercase();
    }
    if help::wants_help(&verb, &args) {
        if let Some(text) = help::command_help(&verb) {
            return text;
        }
    }
    if let Some(out) = shell::run_extra(ws, id, &verb, &args, root) {
        return out;
    }
    let arg = args.first().copied().unwrap_or("");

    match verb.as_str() {
        "ipconfig" | "ifconfig" if arg.eq_ignore_ascii_case("/release") => ipconfig_release(ws, id),
        "ipconfig" | "ifconfig" if arg.eq_ignore_ascii_case("/renew") => match ws.acquire_dhcp(id) {
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
        "ipconfig" | "ifconfig" => ipconfig(ws, id),
        "ping" => ping(ws, id, &args),
        "ping6" => ping6(ws, id, &args),
        "nc6" => nc6(ws, id, &args),
        "tracert" | "traceroute" => tracert(ws, id, &args),
        "arp" => arp(ws, id, arg),
        "route" => match arg.to_ascii_lowercase().as_str() {
            "print" => route_print(ws, id),
            _ => bad_option(),
        },
        "nslookup" => nslookup(ws, id, arg),
        "netstat" | "ss" => netstat(ws, id),
        "telnet" => telnet(ws, id, arg).0,
        "help" => help::overview(),
        "clear" | "cls" => String::new(),
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
    out.push_str(&format!("   DNS Servers.....................: {dns}\n"));
    if let Some(warning) = ws.duplicate_ip_warning(id) {
        out.push_str(&format!("\n   Warning: {warning}\n"));
    }
    out.push('\n');
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

/// `ping6 <address>`: an IPv6 echo over one live L2 segment.
fn nc6(ws: &mut Workspace, id: &str, args: &[&str]) -> String {
    let udp = args.iter().any(|a| *a == "-u");
    let plain: Vec<&str> = args.iter().copied().filter(|a| !a.starts_with('-')).collect();
    let (Some(target), Some(port)) = (plain.first(), plain.get(1)) else {
        return "Usage: nc6 [-u] <address> <port>\n".into();
    };
    let Ok(port) = port.parse::<u16>() else {
        return format!("nc6: bad port '{port}'\n");
    };
    ws.nc6(id, target, port, if udp { "udp" } else { "tcp" }, udp)
}

fn ping6(ws: &mut Workspace, id: &str, args: &[&str]) -> String {
    let Some(target) = args.iter().find(|a| !a.starts_with('-')) else {
        return "Usage: ping6 <address>\n".into();
    };
    ws.ping6(id, target)
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

/// `telnet HOST` — any reachable device with a console hands back a CLI session.
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
    if !crate::model::has_console(dst.1.as_str()) {
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

#[cfg(test)]
mod tests;

#[cfg(test)]
mod tests_ufw;
