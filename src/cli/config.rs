use super::*;
use super::ssh::{crypto, ip_ssh, username};
pub(super) use crate::workspace::mirror::command as mirror_session;

type Handler = fn(&mut Workspace, &str, &mut Session, &str, &str) -> String;

/// Tried in order; the first entry whose test matches the typed line runs.
const COMMANDS: &[(fn(&str) -> bool, Handler)] = &[
    (|l| l.starts_with("inspect icmp") || l.starts_with("no inspect icmp"), inspect_icmp),
    (|l| l.starts_with("ips signature ") || l.starts_with("no ips signature "), ips_signature),
    (|l| l == "no monitor session 1" || l.starts_with("monitor session "), mirror_session),
    (|l| l.starts_with("spanning-tree mode "), spanning_tree_mode),
    (|l| l.starts_with("spanning-tree vlan "), spanning_tree_priority),
    (|l| l.starts_with("router "), config_bgp::router_protocol),
    (|l| l.starts_with("ip nat inside source list "), nat_source_list),
    (|l| l.starts_with("no ip nat inside source"), nat_clear),
    (|l| l.starts_with("access-list "), access_list),
    (|l| l.starts_with("hostname "), hostname),
    (|l| l.starts_with("username ") || l.starts_with("no username "), username),
    (|l| l.starts_with("crypto key generate rsa"), crypto),
    (|l| l.starts_with("ip ssh ") || l.starts_with("no ip ssh"), ip_ssh),
    (|l| l.starts_with("radius-server host ") || l == "no radius-server", radius_server),
    (|l| iface_arg(l).is_some(), enter_interface),
    (|l| l == "ip dhcp snooping" || l == "no ip dhcp snooping" || l.starts_with("ip dhcp snooping vlan "), dhcp_snooping),
    (|l| l.starts_with("ip arp inspection vlan "), arp_inspection_vlan),
    (|l| l.starts_with("ip route "), ip_route),
    (|l| l.starts_with("no vlan "), no_vlan),
    (|l| l.starts_with("no "), no_command),
    (|l| l.starts_with("banner "), banner),
    (|l| l.starts_with("line "), line_config),
    (|l| l.starts_with("vlan "), vlan),
];

/// True when the line opens with configuration-mode vocabulary (see COMMANDS).
pub(super) fn vocabulary(lower: &str) -> bool {
    COMMANDS.iter().any(|(matches, _)| matches(lower))
}

pub(super) fn config_mode(ws: &mut Workspace, id: &str, s: &mut Session, line: &str, lower: &str) -> String {
    for (matches, run) in COMMANDS {
        if matches(lower) {
            return run(ws, id, s, line, lower);
        }
    }
    keyword_command(ws, id, s, line, lower)
}

fn inspect_icmp(ws: &mut Workspace, id: &str, _s: &mut Session, _line: &str, lower: &str) -> String {
    let on = !lower.starts_with("no ");
    match ws.set_inspection(id, on) {
        Ok(()) => String::new(),
        Err(e) => format!("% {e}\n"),
    }
}

fn ips_signature(ws: &mut Workspace, id: &str, _s: &mut Session, line: &str, lower: &str) -> String {
    let on = !lower.starts_with("no ");
    let rest = if lower.starts_with("no ") {
        &line["no ips signature ".len()..]
    } else {
        &line["ips signature ".len()..]
    };
    // `SIG action drop PROTO`
    let mut words = rest.split_whitespace();
    let (Some(_id), Some(action), Some(drop_kw), Some(proto)) =
        (words.next(), words.next(), words.next(), words.next())
    else {
        return "% Incomplete command.\n".into();
    };
    if !action.eq_ignore_ascii_case("action") || !drop_kw.eq_ignore_ascii_case("drop") {
        return "% Only action drop is supported\n".into();
    }
    match ws.set_ips(id, proto, on) {
        Ok(()) => String::new(),
        Err(e) => format!("% {e}\n"),
    }
}

fn spanning_tree_mode(ws: &mut Workspace, id: &str, _s: &mut Session, line: &str, _lower: &str) -> String {
    let mode = line["spanning-tree mode ".len()..].trim().to_ascii_lowercase();
    match ws.set_stp_mode(id, &mode) {
        Ok(()) => String::new(),
        Err(e) => format!("% {e}\n"),
    }
}

fn spanning_tree_priority(ws: &mut Workspace, id: &str, _s: &mut Session, line: &str, _lower: &str) -> String {
    let mut words = line["spanning-tree vlan ".len()..].split_whitespace();
    let (Some(vlan), Some(keyword), Some(priority)) = (words.next(), words.next(), words.next()) else {
        return "% Incomplete command.\n".into();
    };
    if !keyword.eq_ignore_ascii_case("priority") {
        return "% Only spanning-tree vlan ... priority is supported\n".into();
    }
    let parsed = match (vlan.parse::<u16>(), priority.parse::<u16>()) {
        (Ok(vlan), Ok(priority)) => (vlan, priority),
        _ => return "% Invalid VLAN or priority\n".into(),
    };
    match ws.set_stp_priority(id, parsed.0, parsed.1) {
        Ok(()) => String::new(),
        Err(e) => format!("% {e}\n"),
    }
}

fn nat_source_list(ws: &mut Workspace, id: &str, _s: &mut Session, line: &str, _lower: &str) -> String {
    let rest = &line["ip nat inside source list ".len()..];
    let mut words = rest.split_whitespace();
    let (Some(num), Some(kw), Some(iface), Some(overload)) =
        (words.next(), words.next(), words.next(), words.next())
    else {
        return "% Incomplete command.\n".into();
    };
    if !kw.eq_ignore_ascii_case("interface")
        || !overload.eq_ignore_ascii_case("overload")
    {
        return "% Only list ... interface ... overload is supported\n".into();
    }
    match num.parse::<u16>() {
        Ok(n) => match ws.add_nat_rule(id, n, iface) {
            Ok(()) => String::new(),
            Err(e) => format!("% {e}\n"),
        },
        Err(_) => format!("% Invalid access-list: {num}\n"),
    }
}

fn nat_clear(ws: &mut Workspace, id: &str, _s: &mut Session, _line: &str, _lower: &str) -> String {
    ws.clear_nat_rules(id);
    String::new()
}

fn access_list(ws: &mut Workspace, id: &str, _s: &mut Session, line: &str, lower: &str) -> String {
    let Some(rest) = lower.strip_prefix("access-list ") else { return invalid(line, Mode::Config) };
    let original = &line["access-list ".len()..];
    let _ = rest;
    acl_config(ws, id, original)
}

fn hostname(ws: &mut Workspace, id: &str, _s: &mut Session, line: &str, _lower: &str) -> String {
    let name = line[9..].trim().to_string();
    if ws.rename(id, &name) {
        return String::new();
    }
    "% Invalid hostname\n".into()
}

fn enter_interface(ws: &mut Workspace, id: &str, s: &mut Session, line: &str, lower: &str) -> String {
    let Some(rest) = iface_arg(&lower) else { return invalid(line, Mode::Config) };
    let ports = ports_of(ws, id);
    let resolved = if rest.trim().contains('.') {
        ws.ensure_subinterface(id, rest.trim()).ok()
    } else {
        expand_iface(rest.trim(), &ports)
    };
    match resolved {
        Some(name) => {
            s.mode = Mode::Iface;
            s.iface = Some(name);
            String::new()
        }
        None => format!("% Invalid interface name: {}\n", rest.trim()),
    }
}

fn ip_route(ws: &mut Workspace, id: &str, _s: &mut Session, line: &str, _lower: &str) -> String {
    add_route_cmd(ws, id, &line[9..])
}

fn no_command(ws: &mut Workspace, id: &str, _s: &mut Session, line: &str, lower: &str) -> String {
    let Some(rest) = lower.strip_prefix("no ") else { return invalid(line, Mode::Config) };
    config_no(ws, id, &line, rest.trim())
}

fn banner(ws: &mut Workspace, id: &str, _s: &mut Session, line: &str, _lower: &str) -> String {
    let rest = line[7..].trim();
    // IOS accepts any delimiter: banner motd #text# / ^text^
    let body = match rest.find(|c: char| c == '#' || c == '^') {
        Some(i) => rest[i + 1..]
            .trim_end_matches(|c| c == '#' || c == '^')
            .trim()
            .to_string(),
        None => String::new(),
    };
    if body.is_empty() {
        return "% Incomplete command.\n".into();
    }
    ws.banners.insert(id.to_string(), body);
    String::new()
}

fn line_config(_ws: &mut Workspace, _id: &str, s: &mut Session, _line: &str, lower: &str) -> String {
    let target = lower[5..].trim().to_string();
    if !(target.starts_with("con") || target.starts_with("vty")) {
        return format!("% Invalid line: {target}\n");
    }
    s.mode = Mode::Line;
    s.iface = Some(target);
    String::new()
}

fn vlan(ws: &mut Workspace, id: &str, _s: &mut Session, line: &str, _lower: &str) -> String {
    let rest = line[5..].trim();
    let mut parts = rest.split_whitespace();
    let Some(num) = parts.next() else {
        return "% Incomplete command.\n".into();
    };
    let Ok(vlan) = num.parse::<u16>() else {
        return format!("% Invalid VLAN id: {num}\n");
    };
    let name = parts.next().unwrap_or("");
    match ws.vlan_create(id, vlan, name) {
        Ok(()) => String::new(),
        Err(e) => format!("% {e}\n"),
    }
}

fn no_vlan(ws: &mut Workspace, id: &str, _s: &mut Session, line: &str, _lower: &str) -> String {
    let num = line[8..].trim();
    let Ok(vlan) = num.parse::<u16>() else {
        return format!("% Invalid VLAN id: {num}\n");
    };
    match ws.vlan_delete(id, vlan) {
        Ok(()) => String::new(),
        Err(e) => format!("% {e}\n"),
    }
}

/// Commands that are a whole word or phrase rather than a prefix.
fn keyword_command(ws: &mut Workspace, id: &str, s: &mut Session, line: &str, lower: &str) -> String {
    match lower {
        "exit" | "end" => {
            s.mode = Mode::Priv;
            s.iface = None;
            String::new()
        }
        "write memory" | "wr" | "copy running-config startup-config" | "copy run start" => {
            ws.write_memory(id);
            "Building configuration...\n[OK]\n".into()
        }
        "show startup-config" | "sh start" => startup_config(ws, id),
        "clock" => "*0:00:00.0 UTC Mon Mar 1 1993\n".into(),
        "help" | "?" => help(Mode::Config),
        "show running-config" | "sh run" => running_config(ws, id),
        "show ip interface brief" | "sh ip int br" => ip_brief(ws, id),
        "show ip route" | "sh ip ro" => ws.show_routes(id),
        _ if lower.starts_with("show ") => show(ws, id, &lower[5..]),
        _ if lower.starts_with("sh ") => show(ws, id, &lower[3..]),
        _ => invalid(&line, Mode::Config),
    }
}

/// `no ...` in configuration mode. IOS keeps the same `% Invalid input` text
/// for anything it does not know, so unknown no-forms end there too.
pub(super) fn config_no(ws: &mut Workspace, id: &str, line: &str, rest: &str) -> String {
    if rest == "ip route" || rest.starts_with("ip route ") {
        let args = rest.strip_prefix("ip route").unwrap_or(rest);
        return remove_route_cmd(ws, id, args);
    }
    if rest == "hostname" {
        if let Some(d) = ws.devices.iter().find(|d| d.id == id) {
            let name = default_name(d);
            ws.rename(id, &name);
        }
        return String::new();
    }
    if rest == "banner motd" || rest == "banner" {
        ws.banners.remove(id);
        return String::new();
    }
    invalid(line, Mode::Config)
}

/// Reset a renamed device to its factory-style name, keeping its number.
pub(super) fn default_name(d: &Device) -> String {
    let digits = trailing_digits(&d.name)
        .or_else(|| trailing_digits(&d.id))
        .unwrap_or_default();
    format!("{}{digits}", kind_prefix(&d.kind))
}

pub(super) fn trailing_digits(s: &str) -> Option<String> {
    let start = s
        .char_indices()
        .rev()
        .take_while(|(_, c)| c.is_ascii_digit())
        .last()
        .map(|(i, _)| i)
        .unwrap_or(s.len());
    let digits = &s[start..];
    (!digits.is_empty()).then(|| digits.to_string())
}

/// Mirrors `workspace::name_prefix`; the workspace keeps that table private.
pub(super) fn kind_prefix(kind: &str) -> &'static str {
    match kind {
        "router" => "Router",
        "switch" => "Switch",
        "pc" => "PC",
        "laptop" => "Laptop",
        "server" => "Server",
        "printer" => "Printer",
        "cloud" => "Cloud",
        "hub" => "Hub",
        "ap" => "AccessPoint",
        "asa" => "ASA",
        "phone" => "IPPhone",
        _ => "Device",
    }
}

/// Parse `DEST MASK NEXT_HOP [AD]` for `ip route` / `no ip route`.
pub(super) fn parse_route_args(rest: &str) -> Result<(u32, u8, u32, Option<u8>), String> {
    let mut parts = rest.split_whitespace();
    let (Some(dest), Some(mask), Some(next_hop)) = (parts.next(), parts.next(), parts.next())
    else {
        return Err("% Incomplete command.\n".into());
    };
    let admin_distance = match parts.next() {
        Some(ad) => match ad.parse::<u8>() {
            Ok(ad) => Some(ad),
            Err(_) => return Err(format!("% Invalid administrative distance: {ad}\n")),
        },
        None => None,
    };
    if parts.next().is_some() {
        return Err(format!(
            "% Invalid input detected at '^' marker.\n{}\n",
            rest.trim()
        ));
    }
    let Some(dest_ip) = parse_ipv4(dest) else {
        return Err(format!("% Invalid address: {dest}\n"));
    };
    let Some(prefix) = parse_mask(mask) else {
        return Err(format!("% Invalid mask: {mask}\n"));
    };
    let Some(hop_ip) = parse_ipv4(next_hop) else {
        return Err(format!("% Invalid next hop: {next_hop}\n"));
    };
    Ok((dest_ip & mask_of(prefix), prefix, hop_ip, admin_distance))
}

/// Parse `access-list NUM permit|deny [ip] SRC WC [DST WC]` (or `any`).
pub(super) fn acl_config(ws: &mut Workspace, id: &str, rest: &str) -> String {
    let mut words = rest.split_whitespace();
    let (Some(num), Some(action), Some(first)) = (words.next(), words.next(), words.next())
    else {
        return "% Incomplete command.\n".into();
    };
    let Ok(number) = num.parse::<u16>() else {
        return format!("% Invalid access-list: {num}\n");
    };
    let permit = match action.to_ascii_lowercase().as_str() {
        "permit" => true,
        "deny" => false,
        other => return format!("% Invalid action: {other}\n"),
    };
    let addr = |word: Option<&str>, wc: Option<&str>| -> Option<(u32, u32)> {
        match word? {
            "any" | "ANY" | "Any" => Some((0, u32::MAX)),
            host if host.eq_ignore_ascii_case("host") => {
                parse_ipv4(wc?).map(|a| (a, 0))
            }
            ip => {
                let mask = wc?;
                match (parse_ipv4(ip), parse_ipv4(mask)) {
                    (Some(a), Some(m)) => Some((a, m)),
                    _ => None,
                }
            }
        }
    };
    let extended = first.eq_ignore_ascii_case("ip") || number >= 100;
    let src = if first.eq_ignore_ascii_case("ip") {
        let ip = words.next();
        let wc = if ip == Some("host") {
            words.next()
        } else if ip == Some("any") {
            None
        } else {
            words.next()
        };
        addr(ip, wc)
    } else {
        let wc = if first.eq_ignore_ascii_case("host") {
            words.next()
        } else if first.eq_ignore_ascii_case("any") {
            None
        } else {
            words.next()
        };
        addr(Some(first), wc)
    };
    let Some((sip, swc)) = src else {
        return "% Invalid source address\n".into();
    };
    let dst = if extended {
        let ip = words.next();
        let wc = if ip == Some("host") {
            words.next()
        } else if ip == Some("any") {
            None
        } else {
            words.next()
        };
        match addr(ip, wc) {
            Some(d) => Some(d),
            None => return "% Invalid destination address\n".into(),
        }
    } else {
        None
    };
    match ws.acl_add(id, number, permit, sip, swc, dst) {
        Ok(()) => String::new(),
        Err(e) => format!("% {e}\n"),
    }
}

/// Add a static route from `ip route DEST MASK NEXT_HOP [AD]`.
pub(super) fn add_route_cmd(ws: &mut Workspace, id: &str, rest: &str) -> String {
    let (net, prefix, hop, admin_distance) = match parse_route_args(rest) {
        Ok(route) => route,
        Err(e) => return e,
    };
    // Hand the workspace canonical dotted-decimal text.
    match ws.add_route(
        id,
        &ipv4_string(net),
        &ipv4_string(mask_of(prefix)),
        &ipv4_string(hop),
        admin_distance.unwrap_or(1),
    ) {
        Ok(()) => String::new(),
        Err(e) => format!("% {e}\n"),
    }
}

/// Remove a static route from `no ip route DEST MASK NEXT_HOP [AD]`.
pub(super) fn remove_route_cmd(ws: &mut Workspace, id: &str, rest: &str) -> String {
    let (net, prefix, hop, admin_distance) = match parse_route_args(rest) {
        Ok(route) => route,
        Err(e) => return e,
    };
    let Some(dev) = ws.devices.iter_mut().find(|d| d.id == id) else {
        return "% No such device\n".into();
    };
    let before = dev.routes.len();
    dev.routes.retain(|route| {
        !(route.network == net
            && route.prefix == prefix
            && route.next_hop == hop
            && admin_distance.is_none_or(|ad| route.admin_distance == ad))
    });
    if dev.routes.len() == before {
        return format!(
            "% No matching static route {}/{} via {}\n",
            ipv4_string(net),
            prefix,
            ipv4_string(hop)
        );
    }
    ws.recompute_routing();
    format!(
        "Removed static route {}/{} via {}\n",
        ipv4_string(net),
        prefix,
        ipv4_string(hop)
    )
}

fn dhcp_snooping(ws: &mut Workspace, id: &str, _s: &mut Session, _line: &str, lower: &str) -> String {
    if let Some(vlan) = lower.strip_prefix("ip dhcp snooping vlan ") {
        match vlan.trim().parse::<u16>() {
            Ok(v) if (1..=4094).contains(&v) => { ws.dhcp_snooping_vlan(id, v); String::new() }
            _ => "ERROR: VLAN must be 1-4094\n".into(),
        }
    } else {
        ws.set_dhcp_snooping(id, !lower.starts_with("no "));
        String::new()
    }
}

fn arp_inspection_vlan(ws: &mut Workspace, id: &str, _s: &mut Session, _line: &str, lower: &str) -> String {
    let Some(vlan) = lower.strip_prefix("ip arp inspection vlan ") else { return String::new() };
    match vlan.trim().parse::<u16>() {
        Ok(v) if (1..=4094).contains(&v) => { ws.set_arp_inspection(id, true); ws.arp_inspection_vlan(id, v); String::new() }
        _ => "ERROR: VLAN must be 1-4094\n".into(),
    }
}

fn radius_server(ws: &mut Workspace, id: &str, _s: &mut Session, _line: &str, lower: &str) -> String {
    if lower == "no radius-server" {
        ws.set_radius_server(id, 0);
        return String::new();
    }
    let Some(ip) = lower.split_whitespace().last().and_then(crate::model::parse_ipv4) else {
        return "ERROR: need 'radius-server host A.B.C.D'\n".into();
    };
    ws.set_radius_server(id, ip);
    String::new()
}
