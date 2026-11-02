//! A small IOS-like CLI for routers and switches.
//!
//! Interfaces, addressing and admin state live in the workspace; this module
//! only parses commands and renders output, so `show run` reflects real state.

use crate::model::{ipv4_string, mask_of, parse_ipv4, parse_mask};
use crate::workspace::{Device, Workspace};

#[derive(Clone, Copy, PartialEq, Eq, Debug)]
pub enum Mode {
    User,
    Priv,
    Config,
    Iface,
    Line,
    Router,
}

#[derive(Clone, Debug)]
pub struct Session {
    pub mode: Mode,
    pub iface: Option<String>,
    pub router: Option<String>,
}

impl Default for Session {
    fn default() -> Self {
        Session { mode: Mode::User, iface: None, router: None }
    }
}

pub fn prompt(ws: &Workspace, id: &str, s: &Session) -> String {
    let host = ws
        .devices
        .iter()
        .find(|d| d.id == id)
        .map(|d| d.name.clone())
        .unwrap_or_else(|| "Router".into());
    match s.mode {
        Mode::User => format!("{host}>"),
        Mode::Priv => format!("{host}#"),
        Mode::Config => format!("{host}(config)#"),
        Mode::Iface => format!("{host}(config-if)#"),
        Mode::Line => format!("{host}(config-line)#"),
        Mode::Router => format!("{host}(config-router)#"),
    }
}

/// Expand an interface family abbreviation (`g`, `fa`, `se`, ...) to its full
/// name; `None` when the letters name no family.
fn iface_family(prefix: &str) -> Option<&'static str> {
    match prefix {
        "g" | "gi" | "gig" | "giga" | "gigabitethernet" => Some("GigabitEthernet"),
        "f" | "fa" | "fast" | "fastethernet" => Some("FastEthernet"),
        "e" | "et" | "ethernet" => Some("Ethernet"),
        "s" | "se" | "serial" => Some("Serial"),
        _ => None,
    }
}

pub(crate) fn expand_iface(raw: &str, ports: &[String]) -> Option<String> {
    let lower = raw.to_ascii_lowercase();
    let idx = lower.find(|c: char| c.is_ascii_digit())?;
    let (prefix, rest) = lower.split_at(idx);
    let full = iface_family(prefix)?;
    let target = format!("{full}{rest}");
    ports
        .iter()
        .find(|p| p.eq_ignore_ascii_case(&target))
        .cloned()
}

pub fn run(ws: &mut Workspace, id: &str, s: &mut Session, line: &str) -> String {
    let line = line.trim().to_string();
    if line.is_empty() {
        return String::new();
    }
    let lower = line.to_ascii_lowercase();

    // `do` escapes config mode.
    if let Some(rest) = lower.strip_prefix("do ") {
        if matches!(s.mode, Mode::Config | Mode::Iface | Mode::Router) {
            let what = rest.trim();
            let what = what.strip_prefix("show ").unwrap_or(what);
            return show(ws, id, what);
        }
    }

    match s.mode {
        Mode::User => match lower.as_str() {
            "enable" | "en" => {
                s.mode = Mode::Priv;
                String::new()
            }
            "exit" | "quit" => "".into(),
            "help" | "?" => help(Mode::User),
            _ if lower.starts_with("ping ") => ping(ws, id, &line[5..]),
            _ => invalid(&line, Mode::User),
        },
        Mode::Priv => match lower.as_str() {
            "disable" => {
                s.mode = Mode::User;
                String::new()
            }
            "exit" | "quit" => {
                s.mode = Mode::User;
                String::new()
            }
            "configure terminal" | "conf t" | "config t" | "configure t" => {
                s.mode = Mode::Config;
                "Enter configuration commands, one per line.  End with CNTL/Z.\n".into()
            }
            "show running-config" | "sh run" => running_config(ws, id),
            "show ip interface brief" | "sh ip int br" => ip_brief(ws, id),
            "show ip route" | "sh ip ro" => ws.show_routes(id),
            "show version" | "sh ver" => version(ws, id),
            "write memory" | "copy running-config startup-config" | "copy run start" => {
                ws.write_memory();
                "Building configuration...\n[OK]\n".into()
            }
            "show startup-config" | "sh start" => startup_config(ws, id),
            "reload" => {
                if ws.reload() {
                    "System configuration has been modified. Reloading...\n[OK]\n".into()
                } else {
                    "% Startup configuration is empty\n".into()
                }
            }
            "clock" => "*0:00:00.0 UTC Mon Mar 1 1993\n".into(),
            "help" | "?" => help(Mode::Priv),
            _ if lower.starts_with("show ") => show(ws, id, &lower[5..]),
            _ if lower.starts_with("ping ") => ping(ws, id, &line[5..]),
            _ => invalid(&line, Mode::Priv),
        },
        Mode::Config => {
            if lower.starts_with("inspect icmp") || lower.starts_with("no inspect icmp") {
                let on = !lower.starts_with("no ");
                return match ws.set_inspection(id, on) {
                    Ok(()) => String::new(),
                    Err(e) => format!("% {e}\n"),
                };
            }
            if lower.starts_with("ips signature ") || lower.starts_with("no ips signature ") {
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
                return match ws.set_ips(id, proto, on) {
                    Ok(()) => String::new(),
                    Err(e) => format!("% {e}\n"),
                };
            }
            if lower.starts_with("spanning-tree mode ") {
                let mode = line["spanning-tree mode ".len()..].trim().to_ascii_lowercase();
                return match ws.set_stp_mode(id, &mode) {
                    Ok(()) => String::new(),
                    Err(e) => format!("% {e}\n"),
                };
            }
            if lower.starts_with("router ") {
                let rest = &line["router ".len()..];
                let mut words = rest.split_whitespace();
                let (Some(proto), pid) = (words.next(), words.next()) else {
                    return "% Incomplete command.\n".into();
                };
                let proto = proto.to_ascii_lowercase();
                if !matches!(proto.as_str(), "rip" | "ospf" | "eigrp" | "ospfv3") {
                    return format!("% Invalid routing protocol: {proto}\n");
                }
                if proto != "rip" && pid.is_none() {
                    return "% Incomplete command.\n".into();
                }
                return match ws.set_routing_protocol(id, &proto) {
                    Ok(()) => {
                        s.mode = Mode::Router;
                        s.router = Some(proto);
                        String::new()
                    }
                    Err(e) => format!("% {e}\n"),
                };
            } else if lower.starts_with("ip nat inside source list ") {
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
                return match num.parse::<u16>() {
                    Ok(n) => match ws.add_nat_rule(id, n, iface) {
                        Ok(()) => String::new(),
                        Err(e) => format!("% {e}\n"),
                    },
                    Err(_) => format!("% Invalid access-list: {num}\n"),
                };
            }
            if lower.starts_with("no ip nat inside source") {
                ws.clear_nat_rules(id);
                return String::new();
            }
            if let Some(rest) = lower.strip_prefix("access-list ") {
                let original = &line["access-list ".len()..];
                let _ = rest;
                return acl_config(ws, id, original);
            }
            if lower.starts_with("hostname ") {
                let name = line[9..].trim().to_string();
                if ws.rename(id, &name) {
                    return String::new();
                }
                return "% Invalid hostname\n".into();
            }
            if let Some(rest) = iface_arg(&lower) {
                let ports = ports_of(ws, id);
                return match expand_iface(rest.trim(), &ports) {
                    Some(name) => {
                        s.mode = Mode::Iface;
                        s.iface = Some(name);
                        String::new()
                    }
                    None => format!("% Invalid interface name: {}\n", rest.trim()),
                };
            }
            if lower.starts_with("ip route ") {
                return add_route_cmd(ws, id, &line[9..]);
            }
            if let Some(rest) = lower.strip_prefix("no ") {
                return config_no(ws, id, &line, rest.trim());
            }
            if lower.starts_with("banner ") {
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
                return String::new();
            }
            if lower.starts_with("line ") {
                let target = lower[5..].trim().to_string();
                if !(target.starts_with("con") || target.starts_with("vty")) {
                    return format!("% Invalid line: {target}\n");
                }
                s.mode = Mode::Line;
                s.iface = Some(target);
                return String::new();
            }
            if lower.starts_with("vlan ") {
                let rest = line[5..].trim();
                let mut parts = rest.split_whitespace();
                let Some(num) = parts.next() else {
                    return "% Incomplete command.\n".into();
                };
                let Ok(vlan) = num.parse::<u16>() else {
                    return format!("% Invalid VLAN id: {num}\n");
                };
                let name = parts.next().unwrap_or("");
                return match ws.vlan_create(id, vlan, name) {
                    Ok(()) => String::new(),
                    Err(e) => format!("% {e}\n"),
                };
            }
            if lower.starts_with("no vlan ") {
                let num = line[8..].trim();
                let Ok(vlan) = num.parse::<u16>() else {
                    return format!("% Invalid VLAN id: {num}\n");
                };
                return match ws.vlan_delete(id, vlan) {
                    Ok(()) => String::new(),
                    Err(e) => format!("% {e}\n"),
                };
            }
            match lower.as_str() {
                "exit" | "end" => {
                    s.mode = Mode::Priv;
                    s.iface = None;
                    String::new()
                }
                "write memory" | "copy running-config startup-config" | "copy run start" => {
                    ws.write_memory();
                    "Building configuration...\n[OK]\n".into()
                }
                "show startup-config" | "sh start" => startup_config(ws, id),
                "clock" => "*0:00:00.0 UTC Mon Mar 1 1993\n".into(),
                "help" | "?" => help(Mode::Config),
                "show running-config" | "sh run" => running_config(ws, id),
                "show ip interface brief" | "sh ip int br" => ip_brief(ws, id),
                "show ip route" | "sh ip ro" => ws.show_routes(id),
                _ if lower.starts_with("show ") => show(ws, id, &lower[5..]),
                _ => invalid(&line, Mode::Config),
            }
        }
        Mode::Iface => {
            let iface = s.iface.clone().unwrap_or_default();
            // IOS allows switching interfaces straight from config-if.
            if let Some(rest) = iface_arg(&lower) {
                let ports = ports_of(ws, id);
                return match expand_iface(rest.trim(), &ports) {
                    Some(name) => {
                        s.iface = Some(name);
                        String::new()
                    }
                    None => format!("% Invalid interface name: {}\n", rest.trim()),
                };
            }
            if lower.starts_with("ip address ") {
                let rest = line[11..].trim().to_string();
                let mut parts = rest.split_whitespace();
                let (Some(addr), Some(mask)) = (parts.next(), parts.next()) else {
                    return "% Incomplete command.\n".into();
                };
                let Some(prefix) = parse_mask(mask) else {
                    return format!("% Invalid mask: {mask}\n");
                };
                return match ws.set_port_ip(id, &iface, addr, prefix) {
                    Ok(()) => String::new(),
                    Err(e) => format!("% {e}\n"),
                };
            }
            if lower.starts_with("ip helper-address ") {
                let helper = line[18..].trim().to_string();
                return match ws.set_dhcp_helper(id, &iface, &helper) {
                    Ok(()) => String::new(),
                    Err(e) => format!("% {e}\n"),
                };
            }
            if lower.starts_with("no ip helper-address") {
                return if ws.remove_dhcp_helper(id, &iface) {
                    String::new()
                } else {
                    "% no helper address configured\n".into()
                };
            }
            if lower.starts_with("switchport mode ") {
                let mode = line[16..].trim().to_ascii_lowercase();
                let trunk = match mode.as_str() {
                    "access" => Some(false),
                    "trunk" => Some(true),
                    _ => None,
                };
                return match trunk {
                    Some(t) => match ws.set_trunk(id, &iface, t) {
                        Ok(()) => String::new(),
                        Err(e) => format!("% {e}\n"),
                    },
                    None => format!("% Invalid switchport mode: {mode}\n"),
                };
            }
            if lower.starts_with("switchport access vlan ") {
                let num = line[23..].trim();
                let Ok(vlan) = num.parse::<u16>() else {
                    return format!("% Invalid VLAN id: {num}\n");
                };
                return match ws.set_access_vlan(id, &iface, vlan) {
                    Ok(()) => String::new(),
                    Err(e) => format!("% {e}\n"),
                };
            }
            if lower.starts_with("dot1x port-control ") || lower.starts_with("no dot1x port-control") {
                let on = !lower.starts_with("no ");
                return match ws.set_dot1x(id, on, "", "") {
                    Ok(()) => String::new(),
                    Err(e) => format!("% {e}\n"),
                };
            }
            if lower.starts_with("ip nat ") || lower.starts_with("no ip nat ") {
                let remove = lower.starts_with("no ");
                let rest = if remove {
                    &line["no ip nat ".len()..]
                } else {
                    &line["ip nat ".len()..]
                };
                let dir = rest.trim().to_ascii_lowercase();
                let inside = match dir.as_str() {
                    "inside" => true,
                    "outside" => false,
                    _ => return "% Invalid NAT role\n".into(),
                };
                if remove {
                    return match ws.clear_nat_role(id, &iface) {
                        Ok(()) => String::new(),
                        Err(e) => format!("% {e}\n"),
                    };
                }
                return match ws.set_nat_role(id, &iface, inside) {
                    Ok(()) => String::new(),
                    Err(e) => format!("% {e}\n"),
                };
            }
            if lower.starts_with("ip access-group ") || lower.starts_with("no ip access-group ") {
                let remove = lower.starts_with("no ");
                let rest = if remove {
                    &line["no ip access-group ".len()..]
                } else {
                    &line["ip access-group ".len()..]
                };
                let mut parts = rest.split_whitespace();
                let Some(number) = parts.next() else {
                    return "% Incomplete command.\n".into();
                };
                let dir = parts.next().unwrap_or("in").to_ascii_lowercase();
                let inbound = match dir.as_str() {
                    "in" | "inbound" => true,
                    "out" | "outbound" => false,
                    _ => return format!("% Invalid direction: {dir}\n"),
                };
                if remove {
                    return match ws.acl_unbind(id, &iface) {
                        Ok(()) => String::new(),
                        Err(e) => format!("% {e}\n"),
                    };
                }
                return match number.parse::<u16>() {
                    Ok(n) => match ws.acl_bind(id, &iface, n, inbound) {
                        Ok(()) => String::new(),
                        Err(e) => format!("% {e}\n"),
                    },
                    Err(_) => format!("% Invalid access-list: {number}\n"),
                };
            }
            if lower.starts_with("switchport port-security") {
                let rest = line["switchport port-security".len()..].trim();
                let max = match rest.strip_prefix("maximum ") {
                    Some(n) => match n.trim().parse::<u16>() {
                        Ok(n) if n > 0 => n,
                        _ => return "% Invalid maximum: 1-1024\n".into(),
                    },
                    None => 1,
                };
                return match ws.set_port_security(id, &iface, max) {
                    Ok(()) => String::new(),
                    Err(e) => format!("% {e}\n"),
                };
            }
            if lower.starts_with("no switchport port-security") {
                return match ws.set_port_security(id, &iface, 0) {
                    Ok(()) => String::new(),
                    Err(e) => format!("% {e}\n"),
                };
            }
            if lower.starts_with("channel-group ") {
                let rest = line["channel-group ".len()..].trim();
                let mut parts = rest.split_whitespace();
                let (Some(group), Some(mode_kw), Some(mode)) =
                    (parts.next(), parts.next(), parts.next())
                else {
                    return "% Incomplete command.\n".into();
                };
                if !mode_kw.eq_ignore_ascii_case("mode")
                    || !matches!(mode.to_ascii_lowercase().as_str(), "on" | "active" | "passive" | "auto" | "desirable")
                {
                    return "% Invalid channel-group mode\n".into();
                }
                return match group.parse::<u16>() {
                    Ok(g) => match ws.set_channel_group(id, &iface, g) {
                        Ok(()) => String::new(),
                        Err(e) => format!("% {e}\n"),
                    },
                    Err(_) => format!("% Invalid channel-group: {group}\n"),
                };
            }
            if lower.starts_with("switchport trunk encapsulation dot1q")
                || lower.starts_with("switchport nonegotiate")
            {
                return String::new();
            }
            // IOS accepts any unambiguous prefix here, so `shut`, `no shut` and
            // `no sh` must resolve to `shutdown` / `no shutdown`.
            if let Some(rest) = lower.strip_prefix("no ") {
                if is_prefix(rest.trim(), "shutdown") {
                    let _ = ws.set_port_up(id, &iface, true);
                    return "%LINK-5-CHANGED: Interface {}, changed state to up\n"
                        .replace("{}", &iface);
                }
            }
            if is_prefix(&lower, "shutdown") {
                let _ = ws.set_port_up(id, &iface, false);
                return "%LINK-5-CHANGED: Interface {}, changed state to administratively down\n"
                    .replace("{}", &iface);
            }
            match lower.as_str() {
                "exit" => {
                    s.mode = Mode::Config;
                    s.iface = None;
                    String::new()
                }
                "end" => {
                    s.mode = Mode::Priv;
                    s.iface = None;
                    String::new()
                }
                "help" | "?" => help(Mode::Iface),
                _ => invalid(&line, Mode::Iface),
            }
        }
        Mode::Router => {
            if let Some(rest) = lower.strip_prefix("network ") {
                let raw = &line["network ".len()..];
                let _ = rest;
                let mut words = raw.split_whitespace();
                let Some(addr) = words.next() else {
                    return "% Incomplete command.\n".into();
                };
                if s.router.as_deref() == Some("ospfv3") || addr.contains(':') {
                    let token = if words.next().is_some() {
                        format!("{} {}", addr, words.next().unwrap_or(""))
                    } else {
                        addr.to_string()
                    };
                    let token = token.trim().to_string();
                    return match ws.add_v6_network(id, &token) {
                        Ok(()) => String::new(),
                        Err(e) => format!("% {e}\n"),
                    };
                }
                let Some(ip) = parse_ipv4(addr) else {
                    return format!("% Invalid network: {addr}\n");
                };
                let prefix = match words.next() {
                    Some(mask) => match parse_mask(mask) {
                        Some(p) => p,
                        None => return format!("% Invalid mask: {mask}\n"),
                    },
                    None => match ip >> 24 {
                        0..=127 => 8,
                        128..=191 => 16,
                        _ => 24,
                    },
                };
                let net = ip & crate::model::mask_of(prefix);
                return match ws.add_routing_network(id, net, prefix) {
                    Ok(()) => String::new(),
                    Err(e) => format!("% {e}\n"),
                };
            }
            if lower.starts_with("no network ") {
                let raw = &line["no network ".len()..];
                let mut words = raw.split_whitespace();
                if let Some(addr) = words.next().and_then(parse_ipv4) {
                    let prefix = match words.next() {
                        Some(mask) => parse_mask(mask).unwrap_or(24),
                        None => match addr >> 24 {
                            0..=127 => 8,
                            128..=191 => 16,
                            _ => 24,
                        },
                    };
                    ws.remove_routing_network(id, addr & crate::model::mask_of(prefix), prefix);
                    return String::new();
                }
                return "% Invalid network\n".into();
            }
            match lower.as_str() {
                "exit" => {
                    s.mode = Mode::Config;
                    s.router = None;
                    String::new()
                }
                "end" => {
                    s.mode = Mode::Priv;
                    s.router = None;
                    String::new()
                }
                "help" | "?" => help(Mode::Router),
                _ => invalid(&line, Mode::Router),
            }
        }
        Mode::Line => match lower.as_str() {
            "exit" => {
                s.mode = Mode::Config;
                s.iface = None;
                String::new()
            }
            "end" => {
                s.mode = Mode::Priv;
                s.iface = None;
                String::new()
            }
            "login" => String::new(),
            "no password" => {
                ws.line_passwords.remove(id);
                String::new()
            }
            "help" | "?" => help(Mode::Line),
            _ if lower.starts_with("password ") => {
                let pw = line[9..].trim().to_string();
                if pw.is_empty() {
                    "% Incomplete command.\n".into()
                } else {
                    ws.line_passwords.insert(id.to_string(), pw);
                    String::new()
                }
            }
            _ => invalid(&line, Mode::Line),
        },
    }
}

/// Show commands are shared by privileged and configuration mode.
const SHOW_COMMANDS: &[(&str, &str)] = &[
    ("show arp", "ARP cache"),
    ("show interfaces NAME", "Interface details"),
    ("show ip interface brief", "Interface summary"),
    ("show ip route", "Routing table"),
    ("show mac address-table", "MAC address table"),
    ("show running-config", "Current configuration"),
    ("show startup-config", "Saved configuration"),
    ("show version", "Image information"),
];

/// Every command the CLI accepts in `mode`, as syntax plus a short description.
/// Help and completion both read this table so they cannot drift from `run`.
fn commands(mode: Mode) -> Vec<(&'static str, &'static str)> {
    let mut cmds: Vec<(&'static str, &'static str)> = match mode {
        Mode::User => vec![
            ("enable", "Turn on privileged commands"),
            ("exit", "Close this session"),
            ("help", "List the commands for this mode"),
            ("ping HOST", "Send ICMP echoes to HOST"),
        ],
        Mode::Priv => vec![
            ("clock", "Display the system clock"),
            ("configure terminal", "Enter configuration mode"),
            ("disable", "Return to user mode"),
            ("exit", "Return to user mode"),
            ("help", "List the commands for this mode"),
            ("ping HOST", "Send ICMP echoes to HOST"),
            ("reload", "Reload the saved configuration"),
            ("write memory", "Save the running configuration"),
        ],
        Mode::Config => vec![
            ("banner motd DELIM TEXT DELIM", "Set the login banner"),
            ("clock", "Display the system clock"),
            ("end", "Return to privileged mode"),
            ("exit", "Return to privileged mode"),
            ("help", "List the commands for this mode"),
            ("hostname NAME", "Set the device name"),
            ("interface NAME", "Enter interface configuration"),
            ("ip route DEST MASK NH", "Add a static route"),
            ("line NAME", "Enter con or vty line configuration"),
            ("no banner motd", "Remove the login banner"),
            ("no hostname", "Reset the device name"),
            ("no ip route DEST MASK NH", "Remove a static route"),
            ("write memory", "Save the running configuration"),
        ],
        Mode::Iface => vec![
            ("end", "Return to privileged mode"),
            ("exit", "Back to configuration mode"),
            ("help", "List the commands for this mode"),
            ("interface NAME", "Switch to another interface"),
            ("ip address ADDR MASK", "Set the interface address"),
            ("no shutdown", "Bring the interface up"),
            ("shutdown", "Administratively disable the interface"),
        ],
        Mode::Router => vec![
            ("end", "Return to privileged mode"),
            ("exit", "Return to configuration mode"),
            ("help", "List the commands for this mode"),
            ("network NETWORK MASK", "Advertise a connected network"),
            ("no network NETWORK", "Stop advertising a network"),
        ],
        Mode::Line => vec![
            ("end", "Return to privileged mode"),
            ("exit", "Back to configuration mode"),
            ("help", "List the commands for this mode"),
            ("login", "Require the password at connect"),
            ("no password", "Remove the line password"),
            ("password PASSWORD", "Set the line password"),
        ],
    };
    if matches!(mode, Mode::Priv | Mode::Config | Mode::Router) {
        cmds.extend_from_slice(SHOW_COMMANDS);
    }
    cmds
}

fn help(mode: Mode) -> String {
    let mut cmds = commands(mode);
    cmds.sort_by(|a, b| a.0.cmp(b.0));
    let width = cmds.iter().map(|(syntax, _)| syntax.len()).max().unwrap_or(0) + 2;
    let mut out = String::new();
    for (syntax, desc) in cmds {
        out.push_str(&format!("  {syntax:<width$}{desc}\n"));
    }
    out
}

/// True for argument placeholders such as `NAME` or `DEST` in a command syntax.
fn is_placeholder(token: &str) -> bool {
    token.chars().next().is_some_and(|c| c.is_ascii_uppercase())
}

/// `interface`, `intf` and their abbreviations open interface configuration.
fn is_iface_keyword(word: &str) -> bool {
    word.len() >= 3 && ("interface".starts_with(word) || "intf".starts_with(word))
}

fn ports_of(ws: &Workspace, id: &str) -> Vec<String> {
    ws.devices
        .iter()
        .find(|d| d.id == id)
        .map(|d| d.ports.iter().map(|p| p.name.clone()).collect())
        .unwrap_or_default()
}

/// Whether a partially typed interface name could become `port`.
fn iface_prefix_matches(partial: &str, port: &str) -> bool {
    let port = port.to_ascii_lowercase();
    if port.starts_with(partial) {
        return true;
    }
    let Some(idx) = partial.find(|c: char| c.is_ascii_digit()) else {
        return iface_family(partial).is_some_and(|full| port.starts_with(&full.to_ascii_lowercase()));
    };
    let (letters, rest) = partial.split_at(idx);
    match iface_family(letters) {
        Some(full) => port.starts_with(&format!("{}{rest}", full.to_ascii_lowercase())),
        None => false,
    }
}

/// Word completions for the line being typed in the current mode. Command
/// entries stop before their first argument; after `interface` the device's
/// port names are offered instead.
pub fn complete(ws: &Workspace, id: &str, s: &Session, line: &str) -> Vec<String> {
    let ends_space = line
        .chars()
        .last()
        .is_none_or(char::is_whitespace);
    let mut words: Vec<&str> = line.split_whitespace().collect();
    let partial = if ends_space {
        ""
    } else {
        words.pop().unwrap_or("")
    };
    let partial = partial.to_ascii_lowercase();
    let typed: Vec<String> = words.iter().map(|w| w.to_ascii_lowercase()).collect();

    let mut out: Vec<String> = Vec::new();
    if typed.len() == 1 && is_iface_keyword(&typed[0]) {
        for port in ports_of(ws, id) {
            if iface_prefix_matches(&partial, &port) {
                out.push(port);
            }
        }
    } else {
        for (syntax, _) in commands(s.mode) {
            let literals: Vec<&str> = syntax
                .split_whitespace()
                .take_while(|t| !is_placeholder(t))
                .collect();
            if literals.len() <= typed.len() {
                continue;
            }
            if !typed
                .iter()
                .zip(&literals)
                .all(|(w, literal)| literal.eq_ignore_ascii_case(w))
            {
                continue;
            }
            if literals[typed.len()].to_ascii_lowercase().starts_with(&partial) {
                out.push(literals.join(" "));
            }
        }
    }
    out.sort();
    out.dedup();
    out
}

fn invalid(line: &str, _mode: Mode) -> String {
    format!("% Invalid input detected at '^' marker.\n{}\n", line)
}

/// True when `typed` is a non-empty prefix of `keyword`, as IOS accepts.
fn is_prefix(typed: &str, keyword: &str) -> bool {
    !typed.is_empty() && keyword.starts_with(typed)
}

/// `interface NAME`, `intf NAME` and `int NAME` all name the same command.
fn iface_arg(lower: &str) -> Option<&str> {
    ["interface ", "intf ", "int "]
        .iter()
        .find_map(|p| lower.strip_prefix(p))
}

fn show(ws: &Workspace, id: &str, what: &str) -> String {
    match what {
        "running-config" | "run" => running_config(ws, id),
        "ip interface brief" | "ip int br" => ip_brief(ws, id),
        "ip route" | "ip ro" => ws.show_routes(id),
        "version" | "ver" => version(ws, id),
        "mac address-table" | "mac-address-table" | "mac addr" => mac_table(ws, id),
        "arp" => arp_table(ws, id),
        "ip helper-address" => helper_list(ws, id),
        "vlan brief" | "vlan" => vlan_table(ws, id),
        "spanning-tree" => stp_table(ws, id),
        "interfaces switchport" => switchport_table(ws, id),
        "port-security" => port_security_table(ws, id),
        "access-lists" | "ip access-lists" => acl_table(ws, id),
        "ip nat translations" => nat_table(ws, id),
        "ipv6 route" | "ipv6 ro" => ws.show_ipv6_routes(id),
        "ips" => {
            let list = ws.ips.get(id).cloned().unwrap_or_default();
            if list.is_empty() {
                "% no IPS signatures\n".into()
            } else {
                format!("IPS drop: {}\n", list.join(" "))
            }
        }
        "authentication sessions" => {
            let list = ws.devices.iter().find(|d| d.id == id).map(|d| d.dot1x).unwrap_or(false);
            if list {
                format!("{id}  Interface  Status\nFa0/1  Authorized\n")
            } else {
                "% no authenticated sessions\n".into()
            }
        }
        "etherchannel summary" => etherchannel_summary(ws, id),
        "interfaces trunk" => trunk_table(ws, id),
        other => {
            if let Some(arg) = other.strip_prefix("interfaces ") {
                return show_interfaces(ws, id, arg.trim());
            }
            if let Some(arg) = other.strip_prefix("ip interface ") {
                return show_ip_interface(ws, id, arg.trim());
            }
            format!("% 'show {other}' is not implemented yet\n")
        }
    }
}

/// `show mac address-table` from what the switches actually learned.
fn mac_table(ws: &Workspace, id: &str) -> String {
    let Some(dev) = ws.devices.iter().find(|d| d.id == id) else {
        return String::new();
    };
    let rows = ws.tables.mac_rows(id);
    let mut out = String::from(
        "\n          Mac Address Table\n-------------------------------------------\n\nVlan    Mac Address       Type        Ports\n----    -----------       --------    -----\n",
    );
    for e in &rows {
        let port = dev
            .ports
            .get(e.port)
            .map(|p| p.name.as_str())
            .unwrap_or("-");
        out.push_str(&format!(
            "   1    {:<17} {:<11} {}\n",
            e.mac.to_string(),
            if e.static_entry { "STATIC" } else { "DYNAMIC" },
            port
        ));
    }
    out.push_str(&format!(
        "\nTotal Mac Addresses for this criterion: {}\n",
        rows.len()
    ));
    out
}

/// `show arp` from the device's cache.
fn arp_table(ws: &Workspace, id: &str) -> String {
    let Some(dev) = ws.devices.iter().find(|d| d.id == id) else {
        return String::new();
    };
    let rows = ws.tables.arp_rows(id);
    let iface = dev
        .ports
        .first()
        .map(|p| p.name.as_str())
        .unwrap_or("-");
    let mut out =
        String::from("Protocol  Address          Age (min)  Hardware Addr   Type   Interface\n");
    for e in &rows {
        out.push_str(&format!(
            "Internet  {:<15} {:>10}  {:<15} ARPA   {}\n",
            ipv4_string(e.ip),
            0,
            e.mac.to_string(),
            iface
        ));
    }
    if rows.is_empty() {
        out.push_str("% No entries\n");
    }
    out
}

/// `no ...` in configuration mode. IOS keeps the same `% Invalid input` text
/// for anything it does not know, so unknown no-forms end there too.
fn config_no(ws: &mut Workspace, id: &str, line: &str, rest: &str) -> String {
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
fn default_name(d: &Device) -> String {
    let digits = trailing_digits(&d.name)
        .or_else(|| trailing_digits(&d.id))
        .unwrap_or_default();
    format!("{}{digits}", kind_prefix(&d.kind))
}

fn trailing_digits(s: &str) -> Option<String> {
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
fn kind_prefix(kind: &str) -> &'static str {
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

/// Parse `DEST MASK NEXT_HOP` for `ip route` / `no ip route`.
fn parse_route_args(rest: &str) -> Result<(u32, u8, u32), String> {
    let mut parts = rest.split_whitespace();
    let (Some(dest), Some(mask), Some(next_hop)) = (parts.next(), parts.next(), parts.next())
    else {
        return Err("% Incomplete command.\n".into());
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
    Ok((dest_ip & mask_of(prefix), prefix, hop_ip))
}

/// `show vlan brief` from the switch's VLAN table and access ports.
fn vlan_table(ws: &Workspace, id: &str) -> String {
    let Some(dev) = ws.devices.iter().find(|d| d.id == id) else {
        return String::new();
    };
    if dev.kind != "switch" {
        return "% VLANs are configured on switches\n".into();
    }
    let mut ids: Vec<u16> = vec![1];
    if let Some(list) = ws.vlans.get(id) {
        ids.extend(list.iter().map(|(v, _)| *v));
    }
    ids.sort_unstable();
    ids.dedup();
    let mut out = String::from(
        "VLAN Name                             Status    Ports\n---- -------------------------------- --------- -------------------------------\n",
    );
    for vlan in ids {
        let name = ws.vlan_name(id, vlan);
        let ports: Vec<String> = dev
            .ports
            .iter()
            .filter(|p| !p.trunk && p.vlan == vlan)
            .map(|p| p.name.clone())
            .collect();
        out.push_str(&format!(
            "{:<5}{:<33}{:<10}{}\n",
            vlan,
            name,
            "active",
            ports.join(", ")
        ));
    }
    out
}

/// `show spanning-tree`: one line per cabled port with its state.
fn stp_table(ws: &Workspace, id: &str) -> String {
    let Some(dev) = ws.devices.iter().find(|d| d.id == id) else {
        return String::new();
    };
    if dev.kind != "switch" {
        return "% spanning-tree is only shown on switches\n".into();
    }
    let blocked = ws.stp_blocked_ports();
    let root = ws
        .devices
        .iter()
        .filter(|d| d.kind == "switch")
        .map(|d| d.id.clone())
        .min()
        .unwrap_or_else(|| id.to_string());
    let mut out = String::from("VLAN0001\n  Spanning tree enabled protocol ieee\n");
    out.push_str(&format!(
        "  Root ID    Address     {}\n",
        crate::packet::Mac::for_device(&root)
    ));
    out.push_str(&format!(
        "  Bridge ID  Address     {}\n",
        crate::packet::Mac::for_device(id)
    ));
    out.push_str("Interface        Role Sts\n---------------- ---- ---\n");
    let mut shown = 0;
    for p in &dev.ports {
        if ws.peer_port(id, &p.name).is_none() {
            continue;
        }
        shown += 1;
        let down = blocked.iter().any(|(d, port)| d == id && *port == p.name);
        out.push_str(&format!(
            "{:<16} {:<4} {}\n",
            p.name,
            if down { "Altn" } else { "Desig" },
            if down { "BLK" } else { "FWD" }
        ));
    }
    if shown == 0 {
        out.push_str("% no cabled ports\n");
    }
    out
}

/// Parse `access-list NUM permit|deny [ip] SRC WC [DST WC]` (or `any`).
fn acl_config(ws: &mut Workspace, id: &str, rest: &str) -> String {
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
        let wc = if ip == Some("any") || ip == Some("host") { None } else { words.next() };
        addr(ip, wc)
    } else {
        let wc = if first.eq_ignore_ascii_case("any") || first.eq_ignore_ascii_case("host") {
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
        let wc = if ip == Some("any") || ip == Some("host") { None } else { words.next() };
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

/// `show ip nat translations`: the observed inside-local -> global pairs.
fn nat_table(ws: &Workspace, id: &str) -> String {
    let rules = ws.nat_binding_lines(id);
    let rows = ws.nat_translation_lines(id);
    if rules.is_empty() && rows.is_empty() {
        return "% no NAT configured\n".into();
    }
    let mut out = String::new();
    for r in &rules {
        out.push_str(&format!("ip nat {r}\n"));
    }
    for r in &rows {
        out.push_str(&format!("{r}\n"));
    }
    out
}

/// `show access-lists`: ACEs plus the interfaces they are bound to.
fn acl_table(ws: &Workspace, id: &str) -> String {
    let lines = ws.acl_lines(id);
    let binds = ws.acl_binding_lines(id);
    if lines.is_empty() {
        return "% no access lists configured\n".into();
    }
    let mut out = String::new();
    for line in &lines {
        out.push_str(&format!("{line}\n"));
    }
    for bind in &binds {
        out.push_str(&format!("{bind}\n"));
    }
    out
}

/// `show port-security`: MAC limit and learned count per secured port.
fn port_security_table(ws: &Workspace, id: &str) -> String {
    let rows = ws.port_security_rows(id);
    if rows.is_empty() {
        return "% no port-security configured\n".into();
    }
    let mut out = String::from("Port      MaxMAC  CurrentMAC  Status\n");
    for (iface, max, current) in rows {
        let status = if current as u16 >= max { "secure-up" } else { "secure-up" };
        out.push_str(&format!("{iface:<12}{max:<8}{current:<12}{status}\n"));
    }
    out
}

/// `show etherchannel summary`: group, member ports, and the bundle state.
fn etherchannel_summary(ws: &Workspace, id: &str) -> String {
    let groups = ws.channel_groups(id);
    if groups.is_empty() {
        return "% no channel-groups configured\n".into();
    }
    let mut out = String::from("Group  Ports                     Protocol  Status\n");
    for (group, ports) in groups {
        out.push_str(&format!(
            "{group:<7}{:<25}LACP      Po{group}(SU)\n",
            ports.join(" ")
        ));
    }
    out
}

/// `show interfaces switchport`: mode and VLAN per cabled port.
fn switchport_table(ws: &Workspace, id: &str) -> String {
    let Some(dev) = ws.devices.iter().find(|d| d.id == id) else {
        return String::new();
    };
    let mut out = String::new();
    for p in &dev.ports {
        if ws.peer_port(id, &p.name).is_none() {
            continue;
        }
        out.push_str(&format!("Name: {}\nSwitchport: Enabled\n", p.name));
        if p.trunk {
            out.push_str(
                "Administrative Mode: trunk\nTrunking Native Mode VLAN: 1 (default)\n",
            );
        } else {
            out.push_str(&format!(
                "Administrative Mode: static access\nAccess Mode VLAN: {} ({})\n",
                p.vlan,
                ws.vlan_name(id, p.vlan)
            ));
        }
        out.push('\n');
    }
    if out.is_empty() {
        out.push_str("% no switchports are cabled\n");
    }
    out
}

fn trunk_table(ws: &Workspace, id: &str) -> String {
    let Some(dev) = ws.devices.iter().find(|d| d.id == id) else {
        return String::new();
    };
    let trunks: Vec<&str> = dev
        .ports
        .iter()
        .filter(|p| p.trunk && ws.peer_port(id, &p.name).is_some())
        .map(|p| p.name.as_str())
        .collect();
    if trunks.is_empty() {
        return "% no trunk ports\n".into();
    }
    let mut out = String::from(
        "Port        Mode         Encapsulation  Status        Native vlan\n",
    );
    for name in trunks {
        out.push_str(&format!(
            "{:<11} on           802.1q         trunking      1\n",
            name
        ));
    }
    out.push_str("\nPort        Vlans allowed on trunk\n");
    for name in dev.ports.iter().filter(|p| p.trunk).map(|p| p.name.as_str()) {
        out.push_str(&format!("{:<11} 1-4094\n", name));
    }
    out
}

/// `show ip helper-address` from the router's configuration.
fn helper_list(ws: &Workspace, id: &str) -> String {
    let mut out = String::new();
    if let Some(list) = ws.dhcp_helpers.get(id) {
        for (iface, ip) in list {
            out.push_str(&format!(
                "Helper address {} on {}\n",
                ipv4_string(*ip),
                iface
            ));
        }
    }
    if out.is_empty() {
        out.push_str("% No helper addresses configured\n");
    }
    out
}

/// Add a static route from `ip route DEST MASK NEXT_HOP`.
fn add_route_cmd(ws: &mut Workspace, id: &str, rest: &str) -> String {
    let (net, prefix, hop) = match parse_route_args(rest) {
        Ok(route) => route,
        Err(e) => return e,
    };
    // Hand the workspace canonical dotted-decimal text.
    match ws.add_route(
        id,
        &ipv4_string(net),
        &ipv4_string(mask_of(prefix)),
        &ipv4_string(hop),
    ) {
        Ok(()) => String::new(),
        Err(e) => format!("% {e}\n"),
    }
}

/// Remove a static route from `no ip route DEST MASK NEXT_HOP`.
fn remove_route_cmd(ws: &mut Workspace, id: &str, rest: &str) -> String {
    let (net, prefix, hop) = match parse_route_args(rest) {
        Ok(route) => route,
        Err(e) => return e,
    };
    let Some(dev) = ws.devices.iter_mut().find(|d| d.id == id) else {
        return "% No such device\n".into();
    };
    let before = dev.routes.len();
    dev.routes.retain(|&(n, p, via)| !(n == net && p == prefix && via == hop));
    if dev.routes.len() == before {
        return format!(
            "% No matching static route {}/{} via {}\n",
            ipv4_string(net),
            prefix,
            ipv4_string(hop)
        );
    }
    format!(
        "Removed static route {}/{} via {}\n",
        ipv4_string(net),
        prefix,
        ipv4_string(hop)
    )
}

/// Resolve an interface name to its configured state: name, address, prefix, up.
fn port_view(ws: &Workspace, id: &str, iface: &str) -> Option<(String, Option<u32>, u8, bool)> {
    let d = ws.devices.iter().find(|d| d.id == id)?;
    let names: Vec<String> = d.ports.iter().map(|p| p.name.clone()).collect();
    let name = expand_iface(iface, &names)?;
    let p = d.ports.iter().find(|p| p.name == name)?;
    let mut view = (p.name.clone(), p.ip, p.prefix, p.up);
    // Hosts keep a single address on the device itself (see `show ip interface brief`).
    if d.ports.len() == 1 && view.1.is_none() && d.ip.is_some() {
        view.1 = d.ip;
        view.2 = d.prefix;
        view.3 = true;
    }
    Some(view)
}

fn show_interfaces(ws: &Workspace, id: &str, iface: &str) -> String {
    let Some((name, ip, prefix, _up)) = port_view(ws, id, iface) else {
        return format!("% Invalid interface name: {iface}\n");
    };
    let st = ws.port_state(id, &name);
    let state = if !st.admin_up {
        "administratively down, line protocol is down"
    } else if !st.linked {
        "down, line protocol is down"
    } else if !st.line_up {
        "up, line protocol is down"
    } else {
        "up, line protocol is up"
    };
    let mut out = format!("{name} is {state}\n");
    match ip {
        Some(ip) => out.push_str(&format!(
            "  Internet address is {}/{}\n",
            ipv4_string(ip),
            prefix
        )),
        None => out.push_str("  Internet protocol processing disabled\n"),
    }
    out.push_str("  MTU 1500 bytes, BW 1000000 Kbit/sec, DLY 10 usec,\n");
    out.push_str("     reliability 255/255, txload 1/255, rxload 1/255\n");
    out.push_str("  Encapsulation ARPA, loopback not set\n");
    out.push_str("  Full-duplex, 1000Mb/s, media type is RJ45\n");
    out
}

fn show_ip_interface(ws: &Workspace, id: &str, iface: &str) -> String {
    let Some((name, ip, prefix, _up)) = port_view(ws, id, iface) else {
        return format!("% Invalid interface name: {iface}\n");
    };
    let st = ws.port_state(id, &name);
    let state = if !st.admin_up {
        "administratively down, line protocol is down"
    } else if !st.linked {
        "down, line protocol is down"
    } else if !st.line_up {
        "up, line protocol is down"
    } else {
        "up, line protocol is up"
    };
    let mut out = format!("{name} is {state}\n");
    match ip {
        Some(ip) => {
            out.push_str(&format!(
                "  Internet address is {}/{}\n",
                ipv4_string(ip),
                prefix
            ));
            out.push_str(&format!(
                "  Broadcast address is {}\n",
                ipv4_string(ip | !mask_of(prefix))
            ));
            out.push_str("  Address determined by setup command\n");
        }
        None => out.push_str("  Internet protocol processing disabled\n"),
    }
    out.push_str("  MTU is 1500 bytes\n");
    out.push_str("  Helper address is not set\n");
    out.push_str("  Directed broadcast forwarding is disabled\n");
    out.push_str("  Outgoing access list is not set\n");
    out.push_str("  Inbound  access list is not set\n");
    out.push_str("  Proxy ARP is enabled\n");
    out
}

fn version(ws: &Workspace, id: &str) -> String {
    let model = ws
        .devices
        .iter()
        .find(|d| d.id == id)
        .map(|d| d.model.clone())
        .unwrap_or_default();
    format!(
        "Cisco IOS Software, C{model} Software (C{model}-UNIVERSALK9-M), Version 15.1(4)M4\n\
         Technical Support: http://www.cisco.com/techsupport\n\
         Copyright (c) 1986-2010 by Cisco Systems, Inc.\n"
    )
}

fn ip_brief(ws: &Workspace, id: &str) -> String {
    let Some(d) = ws.devices.iter().find(|d| d.id == id) else {
        return String::new();
    };
    let mut out = String::from(
        "Interface              IP-Address      OK? Method Status                Protocol\n",
    );
    let mut rows: Vec<(String, Option<u32>, u8, bool)> = d
        .ports
        .iter()
        .map(|p| (p.name.clone(), p.ip, p.prefix, p.up))
        .collect();
    // Hosts keep a single address on the device itself.
    if rows.len() == 1 && rows[0].1.is_none() && d.ip.is_some() {
        rows[0].1 = d.ip;
        rows[0].2 = d.prefix;
        rows[0].3 = true;
    }
    for (name, ip, _prefix, _up) in rows {
        let addr = ip.map(ipv4_string).unwrap_or_else(|| "unassigned".into());
        let ok = if ip.is_some() { "YES" } else { "YES" };
        let method = if ip.is_some() { "manual" } else { "unset" };
        // A port is only up when it is enabled, cabled, and its peer is
        // enabled; the line protocol follows the same three states.
        let st = ws.port_state(id, &name);
        let status = if !st.admin_up {
            "administratively down"
        } else if !st.linked {
            "notconnect"
        } else {
            "up"
        };
        let proto = if st.line_up { "up" } else { "down" };
        out.push_str(&format!(
            "{name:<22} {addr:<15} {ok:<4} {method:<6} {status:<21} {proto}\n"
        ));
    }
    out
}

fn running_config(ws: &Workspace, id: &str) -> String {
    let Some(d) = ws.devices.iter().find(|d| d.id == id) else {
        return String::new();
    };
    config_for(
        d,
        ws.banners.get(id).map(String::as_str),
        ws.line_passwords.get(id).map(String::as_str),
    )
}

/// `show startup-config`: what `write memory` saved.
fn startup_config(ws: &Workspace, id: &str) -> String {
    match ws.startup_config(id) {
        Some(text) => text,
        None => "% Startup configuration is empty\n".into(),
    }
}

/// Render one device's configuration; shared by running and startup config.
pub(crate) fn config_for(d: &Device, banner: Option<&str>, line_pw: Option<&str>) -> String {
    let mut out = String::from(
        "Building configuration...\n\nCurrent configuration : 1024 bytes\n!\nversion 15.1\n",
    );
    if let Some(b) = banner {
        out.push_str(&format!("banner motd ^{b}^\n!\n"));
    }
    out.push_str(&format!("hostname {}\n!\n", d.name));
    for p in &d.ports {
        out.push_str(&format!("interface {}\n", p.name));
        if let Some(ip) = p.ip {
            out.push_str(&format!(
                " ip address {} {}\n",
                ipv4_string(ip),
                ipv4_string(mask_of(p.prefix))
            ));
        }
        if p.up {
            out.push_str(" no shutdown\n");
        } else {
            out.push_str(" shutdown\n");
        }
        out.push_str("!\n");
    }
    if let Some(pw) = line_pw {
        out.push_str(&format!("line con 0\n password {pw}\n login\n!\n"));
    }
    out.push_str("end\n");
    out
}

fn ping(ws: &mut Workspace, id: &str, target: &str) -> String {
    let target = target.trim();
    let Some(dst) = ws
        .devices
        .iter()
        .find(|d| d.ip.map(ipv4_string).as_deref() == Some(target))
        .map(|d| d.id.clone())
    else {
        return format!(
            "Type escape sequence to abort.\nSending 5, 100-byte ICMP Echos to {target}, timeout is 2 seconds:\n.....\nSuccess rate is 0 percent (0/5)\n"
        );
    };
    match ws.send_pdu(id, &dst) {
        Ok(()) => format!(
            "Type escape sequence to abort.\nSending 5, 100-byte ICMP Echos to {target}, timeout is 2 seconds:\n!!!!!\nSuccess rate is 100 percent (5/5), round-trip min/avg/max = 0/0/0 ms\n"
        ),
        Err(e) => format!("% {e}\n"),
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::workspace::Workspace;

    fn session() -> Session {
        Session::default()
    }

    #[test]
    fn configures_an_interface_and_shows_it() {
        let mut ws = Workspace::new();
        let mut s = session();

        run(&mut ws, "router0", &mut s, "enable");
        assert_eq!(s.mode, Mode::Priv);
        run(&mut ws, "router0", &mut s, "configure terminal");
        assert_eq!(s.mode, Mode::Config);
        run(&mut ws, "router0", &mut s, "interface g0/0");
        assert_eq!(s.mode, Mode::Iface);
        run(&mut ws, "router0", &mut s, "ip address 192.168.1.1 255.255.255.0");
        run(&mut ws, "router0", &mut s, "no shutdown");

        let brief = run(&mut ws, "router0", &mut s, "end");
        assert_eq!(s.mode, Mode::Priv);
        let brief = if brief.is_empty() {
            run(&mut ws, "router0", &mut s, "show ip interface brief")
        } else {
            brief
        };
        assert!(brief.contains("GigabitEthernet0/0"), "{brief}");
        assert!(brief.contains("192.168.1.1"), "{brief}");
        assert!(brief.contains("up"), "{brief}");

        let cfg = run(&mut ws, "router0", &mut s, "show running-config");
        assert!(cfg.contains("hostname Router0"), "{cfg}");
        assert!(cfg.contains("ip address 192.168.1.1 255.255.255.0"), "{cfg}");
        assert!(cfg.contains("no shutdown"), "{cfg}");
    }

    #[test]
    fn accepts_abbreviated_shutdown_and_no_shutdown() {
        let mut ws = Workspace::new();
        let mut s = session();

        run(&mut ws, "router0", &mut s, "en");
        run(&mut ws, "router0", &mut s, "conf t");
        run(&mut ws, "router0", &mut s, "int g0/0");

        let down = |ws: &mut Workspace, s: &mut Session| {
            let brief = run(ws, "router0", s, "do show ip interface brief");
            brief
                .lines()
                .find(|l| l.starts_with("GigabitEthernet0/0"))
                .is_some_and(|l| l.contains("administratively down"))
        };
        assert!(!down(&mut ws, &mut s), "cabled interfaces ship up");

        run(&mut ws, "router0", &mut s, "shut");
        assert!(down(&mut ws, &mut s));

        run(&mut ws, "router0", &mut s, "no shut");
        assert!(!down(&mut ws, &mut s));

        run(&mut ws, "router0", &mut s, "shut");
        assert!(down(&mut ws, &mut s));

        run(&mut ws, "router0", &mut s, "no s");
        assert!(!down(&mut ws, &mut s));
    }

    #[test]
    fn unplugged_interfaces_report_notconnect() {
        let mut ws = Workspace::new();
        let mut s = session();
        run(&mut ws, "router0", &mut s, "en");
        let brief = run(&mut ws, "router0", &mut s, "show ip interface brief");
        let row0 = brief
            .lines()
            .find(|l| l.starts_with("GigabitEthernet0/0"))
            .unwrap();
        assert!(row0.contains(" up "), "cabled port is up: {row0}");
        let row2 = brief
            .lines()
            .find(|l| l.starts_with("GigabitEthernet0/2"))
            .unwrap();
        assert!(row2.contains("notconnect"), "no cable: {row2}");
        assert!(row2.trim_end().ends_with("down"), "{row2}");
    }

    #[test]
    fn show_mac_table_lists_what_the_switch_learned() {
        let mut ws = Workspace::new();
        ws.send_pdu("pc1", "pc0").unwrap();
        let mut s = session();
        run(&mut ws, "switch0", &mut s, "en");
        let out = run(&mut ws, "switch0", &mut s, "show mac address-table");
        assert!(out.contains("Mac Address Table"), "{out}");
        let mac = crate::packet::Mac::for_device("pc1").to_string();
        assert!(out.contains(&mac), "missing {mac}: {out}");
        assert!(out.contains("DYNAMIC"), "{out}");
        assert!(out.contains("Total Mac Addresses for this criterion: 1"), "{out}");
    }

    #[test]
    fn line_protocol_follows_the_peer_interface() {
        let mut ws = Workspace::new();
        let mut sw = session();
        // Shut the switch port that feeds Router0 g0/0.
        run(&mut ws, "switch0", &mut sw, "en");
        run(&mut ws, "switch0", &mut sw, "conf t");
        run(&mut ws, "switch0", &mut sw, "int fa0/1");
        run(&mut ws, "switch0", &mut sw, "shut");

        let mut r = session();
        run(&mut ws, "router0", &mut r, "en");
        let brief = run(&mut ws, "router0", &mut r, "show ip interface brief");
        let row = brief
            .lines()
            .find(|l| l.starts_with("GigabitEthernet0/0"))
            .unwrap();
        assert!(
            row.trim_end().ends_with("down"),
            "protocol follows the peer: {row}"
        );
        let detail = run(&mut ws, "router0", &mut r, "show interfaces g0/0");
        assert!(detail.contains("up, line protocol is down"), "{detail}");

        // Enabling the far end brings the protocol back.
        run(&mut ws, "switch0", &mut sw, "no shut");
        let brief = run(&mut ws, "router0", &mut r, "show ip interface brief");
        let row = brief
            .lines()
            .find(|l| l.starts_with("GigabitEthernet0/0"))
            .unwrap();
        assert!(row.trim_end().ends_with("up"), "{row}");
    }

    #[test]
    fn write_memory_and_reload_round_trip() {
        let mut ws = Workspace::new();
        let mut s = session();
        run(&mut ws, "router0", &mut s, "en");
        run(&mut ws, "router0", &mut s, "conf t");
        run(&mut ws, "router0", &mut s, "banner motd #authorised access only#");
        run(&mut ws, "router0", &mut s, "line con 0");
        assert_eq!(s.mode, Mode::Line);
        run(&mut ws, "router0", &mut s, "password cisco");
        run(&mut ws, "router0", &mut s, "login");
        run(&mut ws, "router0", &mut s, "end");

        let running = run(&mut ws, "router0", &mut s, "show run");
        assert!(
            running.contains("banner motd ^authorised access only^"),
            "{running}"
        );
        assert!(running.contains("line con 0"), "{running}");
        assert!(running.contains("password cisco"), "{running}");

        let saved = run(&mut ws, "router0", &mut s, "write memory");
        assert!(saved.contains("[OK]"), "{saved}");
        let startup = run(&mut ws, "router0", &mut s, "show startup-config");
        assert!(startup.contains("password cisco"), "{startup}");

        // Change the config, then reload: the saved configuration returns.
        run(&mut ws, "router0", &mut s, "conf t");
        run(&mut ws, "router0", &mut s, "hostname BROKEN");
        run(&mut ws, "router0", &mut s, "end");
        let out = run(&mut ws, "router0", &mut s, "reload");
        assert!(out.contains("Reloading"), "{out}");
        let d = ws.devices.iter().find(|d| d.id == "router0").unwrap();
        assert_eq!(d.name, "Router0", "reload restored the saved name");
    }

    #[test]
    fn vlan_config_and_show() {
        let mut ws = Workspace::new();
        let mut s = session();
        run(&mut ws, "switch0", &mut s, "en");
        run(&mut ws, "switch0", &mut s, "conf t");
        assert!(run(&mut ws, "switch0", &mut s, "vlan 20 SALES").is_empty());
        run(&mut ws, "switch0", &mut s, "int fa0/3");
        assert!(run(&mut ws, "switch0", &mut s, "switchport access vlan 20").is_empty());
        run(&mut ws, "switch0", &mut s, "end");

        let out = run(&mut ws, "switch0", &mut s, "show vlan brief");
        assert!(out.contains("SALES"), "{out}");
        assert!(out.contains("FastEthernet0/3"), "{out}");
        let ports = run(&mut ws, "switch0", &mut s, "show interfaces switchport");
        assert!(ports.contains("Access Mode VLAN: 20 (SALES)"), "{ports}");

        run(&mut ws, "switch0", &mut s, "conf t");
        run(&mut ws, "switch0", &mut s, "int fa0/4");
        let err = run(&mut ws, "switch0", &mut s, "switchport access vlan 99");
        assert!(err.contains("does not exist"), "{err}");
    }

    #[test]
    fn helper_address_config_and_show() {
        let mut ws = Workspace::new();
        let mut s = session();
        run(&mut ws, "router0", &mut s, "en");
        run(&mut ws, "router0", &mut s, "conf t");
        run(&mut ws, "router0", &mut s, "int g0/0");
        let out = run(&mut ws, "router0", &mut s, "ip helper-address 192.168.2.20");
        assert!(out.is_empty(), "{out}");
        run(&mut ws, "router0", &mut s, "end");
        let show = run(&mut ws, "router0", &mut s, "show ip helper-address");
        assert!(show.contains("192.168.2.20"), "{show}");

        run(&mut ws, "router0", &mut s, "conf t");
        run(&mut ws, "router0", &mut s, "int g0/0");
        run(&mut ws, "router0", &mut s, "no ip helper-address");
        let show = run(&mut ws, "router0", &mut s, "do show ip helper-address");
        assert!(show.contains("No helper"), "{show}");
    }

    #[test]
    fn rejects_bad_input_in_each_mode() {
        let mut ws = Workspace::new();
        let mut s = session();
        assert!(run(&mut ws, "pc0", &mut s, "show version").contains("Invalid input"));

        run(&mut ws, "router0", &mut s, "enable");
        run(&mut ws, "router0", &mut s, "configure terminal");
        assert!(run(&mut ws, "router0", &mut s, "interface g9/9").contains("Invalid interface"));

        run(&mut ws, "router0", &mut s, "interface g0/0");
        assert!(run(&mut ws, "router0", &mut s, "ip address 192.168.1.1 bad").contains("Invalid mask"));
    }

    #[test]
    fn configures_and_shows_static_routes() {
        let mut ws = Workspace::new();
        let mut s = session();

        run(&mut ws, "router0", &mut s, "enable");
        run(&mut ws, "router0", &mut s, "configure terminal");
        assert_eq!(s.mode, Mode::Config);
        run(&mut ws, "router0", &mut s, "interface g0/0");
        run(&mut ws, "router0", &mut s, "ip address 192.168.1.1 255.255.255.0");
        run(&mut ws, "router0", &mut s, "no shutdown");
        run(&mut ws, "router0", &mut s, "exit");
        let added = run(
            &mut ws,
            "router0",
            &mut s,
            "ip route 10.0.0.0 255.255.255.0 192.168.1.2",
        );
        assert!(added.is_empty(), "{added}");

        let routes = run(&mut ws, "router0", &mut s, "show ip route");
        assert!(routes.contains("10.0.0.0"), "{routes}");
        assert!(routes.contains("192.168.1.2"), "{routes}");

        run(&mut ws, "router0", &mut s, "end");
        let again = run(&mut ws, "router0", &mut s, "show ip route");
        assert!(again.contains("10.0.0.0"), "{again}");
    }

    #[test]
    fn rejects_malformed_static_routes() {
        let mut ws = Workspace::new();
        let mut s = session();
        run(&mut ws, "router0", &mut s, "enable");
        run(&mut ws, "router0", &mut s, "configure terminal");

        let incomplete = run(&mut ws, "router0", &mut s, "ip route 10.0.0.0");
        assert!(incomplete.contains("Incomplete"), "{incomplete}");

        let bad_mask = run(&mut ws, "router0", &mut s, "ip route 10.0.0.0 bad 192.168.1.2");
        assert!(bad_mask.contains("Invalid mask"), "{bad_mask}");

        let bad_dest = run(&mut ws, "router0", &mut s, "ip route 300.1.1.1 255.0.0.0 192.168.1.2");
        assert!(bad_dest.contains("Invalid address"), "{bad_dest}");
    }

    #[test]
    fn shows_interface_details_after_configuration() {
        let mut ws = Workspace::new();
        let mut s = session();
        run(&mut ws, "router0", &mut s, "enable");
        run(&mut ws, "router0", &mut s, "configure terminal");
        run(&mut ws, "router0", &mut s, "interface g0/0");
        run(&mut ws, "router0", &mut s, "ip address 192.168.1.1 255.255.255.0");
        run(&mut ws, "router0", &mut s, "no shutdown");
        run(&mut ws, "router0", &mut s, "end");

        let out = run(&mut ws, "router0", &mut s, "show interfaces g0/0");
        assert!(out.contains("GigabitEthernet0/0 is up, line protocol is up"), "{out}");
        assert!(out.contains("Internet address is 192.168.1.1/24"), "{out}");
        assert!(out.contains("MTU 1500 bytes"), "{out}");
        assert!(out.contains("BW 1000000 Kbit"), "{out}");
        assert!(out.contains("Full-duplex"), "{out}");

        let ip = run(&mut ws, "router0", &mut s, "show ip interface g0/0");
        assert!(ip.contains("Internet address is 192.168.1.1/24"), "{ip}");
        assert!(ip.contains("MTU is 1500 bytes"), "{ip}");
        assert!(ip.contains("Broadcast address is 192.168.1.255"), "{ip}");
    }

    #[test]
    fn saves_configuration_and_shows_clock() {
        let mut ws = Workspace::new();
        let mut s = session();
        run(&mut ws, "router0", &mut s, "enable");
        assert_eq!(
            run(&mut ws, "router0", &mut s, "write memory"),
            "Building configuration...\n[OK]\n"
        );
        assert_eq!(
            run(&mut ws, "router0", &mut s, "copy running-config startup-config"),
            "Building configuration...\n[OK]\n"
        );
        assert_eq!(
            run(&mut ws, "router0", &mut s, "clock"),
            "*0:00:00.0 UTC Mon Mar 1 1993\n"
        );
    }

    #[test]
    fn prompt_changes_with_mode() {
        let mut ws = Workspace::new();
        let mut s = session();
        assert_eq!(prompt(&ws, "router0", &s), "Router0>");
        run(&mut ws, "router0", &mut s, "enable");
        assert_eq!(prompt(&ws, "router0", &s), "Router0#");
        run(&mut ws, "router0", &mut s, "configure terminal");
        run(&mut ws, "router0", &mut s, "interface g0/0");
        assert_eq!(prompt(&ws, "router0", &s), "Router0(config-if)#");
    }

    #[test]
    fn no_ip_route_removes_the_static_route() {
        let mut ws = Workspace::new();
        let mut s = session();
        run(&mut ws, "router0", &mut s, "enable");
        run(&mut ws, "router0", &mut s, "configure terminal");
        run(
            &mut ws,
            "router0",
            &mut s,
            "ip route 10.0.0.0 255.255.255.0 192.168.1.2",
        );

        let removed = run(
            &mut ws,
            "router0",
            &mut s,
            "no ip route 10.0.0.0 255.255.255.0 192.168.1.2",
        );
        assert!(
            removed.contains("Removed static route 10.0.0.0/24 via 192.168.1.2"),
            "{removed}"
        );
        let routes = run(&mut ws, "router0", &mut s, "do show ip route");
        assert!(!routes.contains("10.0.0.0"), "route still present: {routes}");

        let again = run(
            &mut ws,
            "router0",
            &mut s,
            "no ip route 10.0.0.0 255.255.255.0 192.168.1.2",
        );
        assert!(again.contains("No matching static route"), "{again}");
    }

    #[test]
    fn no_hostname_restores_the_default_name() {
        let mut ws = Workspace::new();
        let mut s = session();
        run(&mut ws, "router0", &mut s, "enable");
        run(&mut ws, "router0", &mut s, "configure terminal");
        run(&mut ws, "router0", &mut s, "hostname EDGE");
        assert_eq!(prompt(&ws, "router0", &s), "EDGE(config)#");

        run(&mut ws, "router0", &mut s, "no hostname");
        let d = ws.devices.iter().find(|d| d.id == "router0").unwrap();
        assert_eq!(d.name, "Router0");
        assert_eq!(prompt(&ws, "router0", &s), "Router0(config)#");
    }

    #[test]
    fn no_banner_motd_removes_the_banner() {
        let mut ws = Workspace::new();
        let mut s = session();
        run(&mut ws, "router0", &mut s, "enable");
        run(&mut ws, "router0", &mut s, "configure terminal");
        run(&mut ws, "router0", &mut s, "banner motd #authorised access only#");
        assert!(run(&mut ws, "router0", &mut s, "show run").contains("banner motd"));

        run(&mut ws, "router0", &mut s, "no banner motd");
        assert!(!ws.banners.contains_key("router0"));
        let cfg = run(&mut ws, "router0", &mut s, "show run");
        assert!(!cfg.contains("banner motd"), "{cfg}");
    }

    #[test]
    fn no_password_removes_the_line_password() {
        let mut ws = Workspace::new();
        let mut s = session();
        run(&mut ws, "router0", &mut s, "enable");
        run(&mut ws, "router0", &mut s, "configure terminal");
        run(&mut ws, "router0", &mut s, "line con 0");
        assert_eq!(s.mode, Mode::Line);
        run(&mut ws, "router0", &mut s, "password cisco");
        assert_eq!(ws.line_passwords.get("router0").map(String::as_str), Some("cisco"));

        let out = run(&mut ws, "router0", &mut s, "no password");
        assert!(out.is_empty(), "{out}");
        assert!(!ws.line_passwords.contains_key("router0"));
        run(&mut ws, "router0", &mut s, "end");
        let cfg = run(&mut ws, "router0", &mut s, "show run");
        assert!(!cfg.contains("password cisco"), "{cfg}");
    }

    #[test]
    fn unknown_no_forms_keep_the_ios_error() {
        let mut ws = Workspace::new();
        let mut s = session();
        run(&mut ws, "router0", &mut s, "enable");
        run(&mut ws, "router0", &mut s, "configure terminal");

        let out = run(&mut ws, "router0", &mut s, "no ip domain-lookup");
        assert!(out.contains("% Invalid input detected at '^' marker."), "{out}");
        assert!(out.contains("no ip domain-lookup"), "{out}");

        let bare = run(&mut ws, "router0", &mut s, "no");
        assert!(bare.contains("Invalid input"), "{bare}");
    }

    #[test]
    fn help_lists_the_commands_that_exist() {
        let config = help(Mode::Config);
        for expected in [
            "ip route DEST MASK NH",
            "no ip route DEST MASK NH",
            "no hostname",
            "no banner motd",
            "hostname NAME",
        ] {
            assert!(
                config.lines().any(|l| l.trim_start().starts_with(expected)),
                "missing {expected}: {config}"
            );
        }

        let line = help(Mode::Line);
        assert!(line.contains("password PASSWORD"), "{line}");
        assert!(line.contains("no password"), "{line}");
        assert!(help(Mode::Priv).contains("show running-config"));
        assert!(help(Mode::User).contains("enable"));
        assert!(help(Mode::Iface).contains("no shutdown"));
    }

    #[test]
    fn completes_commands_and_interfaces() {
        let ws = Workspace::new();
        let priv_s = Session { mode: Mode::Priv, iface: None, router: None };

        let sh = complete(&ws, "router0", &priv_s, "sh");
        assert!(sh.contains(&"show running-config".to_string()), "{sh:?}");
        assert!(sh.contains(&"show version".to_string()), "{sh:?}");
        assert!(sh.contains(&"show ip route".to_string()), "{sh:?}");
        assert!(!sh.contains(&"write memory".to_string()), "{sh:?}");

        let show = complete(&ws, "router0", &priv_s, "show ");
        assert!(show.contains(&"show startup-config".to_string()), "{show:?}");
        assert!(!show.contains(&"write memory".to_string()), "{show:?}");

        let ip = complete(&ws, "router0", &priv_s, "show ip ");
        assert_eq!(ip, vec!["show ip interface brief", "show ip route"]);

        let cfg = Session { mode: Mode::Config, iface: None, router: None };
        let gi = complete(&ws, "router0", &cfg, "int g");
        assert!(gi.contains(&"GigabitEthernet0/0".to_string()), "{gi:?}");
        assert!(!gi.iter().any(|c| c.starts_with("Fast")), "{gi:?}");

        let ports = complete(&ws, "router0", &cfg, "interface ");
        assert!(ports.contains(&"Serial0/0/0".to_string()), "{ports:?}");
        let mut sorted = ports.clone();
        sorted.sort();
        sorted.dedup();
        assert_eq!(ports, sorted, "completions must be sorted and unique");
    }
}

#[cfg(test)]
mod expand_tests {
    use super::*;
    use crate::workspace::Workspace;

    #[test]
    fn expands_short_interface_names() {
        let ws = Workspace::new();
        let d = ws.devices.iter().find(|d| d.id == "router0").unwrap();
        let ports: Vec<String> = d.ports.iter().map(|p| p.name.clone()).collect();
        assert!(!ports.is_empty(), "router has no ports: {:?}", ws.devices.iter().map(|d| (&d.id, &d.kind)).collect::<Vec<_>>());
        assert_eq!(expand_iface("g0/0", &ports).as_deref(), Some("GigabitEthernet0/0"));
        assert_eq!(expand_iface("Gi0/1", &ports).as_deref(), Some("GigabitEthernet0/1"));
        assert_eq!(expand_iface("g9/9", &ports), None);
    }
}
