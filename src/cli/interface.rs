use super::*;

type Handler = fn(&mut Workspace, &str, &mut Session, &str, &str) -> String;

/// Tried in order; the first entry whose test matches the typed line runs.
/// IOS accepts any unambiguous prefix for `shutdown`, so `shut` and `no sh` match.
const COMMANDS: &[(fn(&str) -> bool, Handler)] = &[
    (|l| iface_arg(l).is_some(), switch_interface),
    (|l| l.starts_with("ip address "), ip_address),
    (|l| l.starts_with("bandwidth ") || l == "no bandwidth", bandwidth),
    (|l| l.starts_with("delay ") || l == "no delay", delay),
    (|l| l.starts_with("speed ") || l == "no speed" || l.starts_with("duplex ") || l == "no duplex", speed_duplex),
    (|l| l.starts_with("encapsulation dot1q "), encapsulation_dot1q),
    (|l| l.starts_with("ip helper-address "), ip_helper_address),
    (|l| l.starts_with("no ip helper-address"), no_ip_helper_address),
    (|l| l.starts_with("switchport mode "), switchport_mode),
    (|l| l.starts_with("switchport access vlan "), switchport_access_vlan),
    (|l| l.starts_with("dot1x port-control ") || l.starts_with("no dot1x port-control"), dot1x_port_control),
    (|l| l.starts_with("ip nat ") || l.starts_with("no ip nat "), ip_nat),
    (|l| l.starts_with("ip access-group ") || l.starts_with("no ip access-group "), ip_access_group),
    (|l| l.starts_with("switchport port-security"), port_security),
    (|l| l.starts_with("no switchport port-security"), no_port_security),
    (|l| l.starts_with("channel-group "), channel_group),
    (|l| l.starts_with("switchport trunk encapsulation dot1q") || l.starts_with("switchport nonegotiate"), ignored_switchport_options),
    (|l| l.strip_prefix("no ").is_some_and(|rest| is_prefix(rest.trim(), "shutdown")), no_shutdown),
    (|l| is_prefix(l, "shutdown"), shutdown),
];

pub(super) fn iface_mode(ws: &mut Workspace, id: &str, s: &mut Session, line: &str, lower: &str) -> String {
    for (matches, run) in COMMANDS {
        if matches(lower) {
            return run(ws, id, s, line, lower);
        }
    }
    keyword_command(s, line, lower)
}

fn switch_interface(ws: &mut Workspace, id: &str, s: &mut Session, line: &str, lower: &str) -> String {
    // IOS allows switching interfaces straight from config-if.
    let Some(rest) = iface_arg(&lower) else { return invalid(line, Mode::Iface) };
    let ports = ports_of(ws, id);
    let resolved = if rest.trim().contains('.') {
        ws.ensure_subinterface(id, rest.trim()).ok()
    } else {
        expand_iface(rest.trim(), &ports)
    };
    match resolved {
        Some(name) => {
            s.iface = Some(name);
            String::new()
        }
        None => format!("% Invalid interface name: {}\n", rest.trim()),
    }
}

fn ip_address(ws: &mut Workspace, id: &str, s: &mut Session, line: &str, _lower: &str) -> String {
    let iface = s.iface.clone().unwrap_or_default();
    let rest = line[11..].trim().to_string();
    let mut parts = rest.split_whitespace();
    let (Some(addr), Some(mask)) = (parts.next(), parts.next()) else {
        return "% Incomplete command.\n".into();
    };
    let Some(prefix) = parse_mask(mask) else {
        return format!("% Invalid mask: {mask}\n");
    };
    match ws.set_port_ip(id, &iface, addr, prefix) {
        Ok(()) => String::new(),
        Err(e) => format!("% {e}\n"),
    }
}

fn bandwidth(ws: &mut Workspace, id: &str, s: &mut Session, line: &str, lower: &str) -> String {
    let iface = s.iface.clone().unwrap_or_default();
    let kbps = if lower == "no bandwidth" {
        default_port_metrics(&iface).0
    } else {
        let value = line["bandwidth ".len()..].trim();
        if value.split_whitespace().count() != 1 {
            return invalid(line, Mode::Iface);
        }
        match value.parse::<u32>() {
            Ok(kbps) if kbps > 0 => kbps,
            _ => return format!("% Invalid bandwidth: {value}\n"),
        }
    };
    match ws.set_port_bandwidth(id, &iface, kbps) {
        Ok(()) => String::new(),
        Err(e) => format!("% {e}\n"),
    }
}

fn delay(ws: &mut Workspace, id: &str, s: &mut Session, line: &str, lower: &str) -> String {
    let iface = s.iface.clone().unwrap_or_default();
    let usec = if lower == "no delay" {
        default_port_metrics(&iface).1
    } else {
        let value = line["delay ".len()..].trim();
        if value.split_whitespace().count() != 1 {
            return invalid(line, Mode::Iface);
        }
        match value.parse::<u32>() {
            Ok(usec) => usec,
            Err(_) => return format!("% Invalid delay: {value}\n"),
        }
    };
    match ws.set_port_delay(id, &iface, usec) {
        Ok(()) => String::new(),
        Err(e) => format!("% {e}\n"),
    }
}

pub(super) fn default_port_metrics(iface: &str) -> (u32, u32) {
    if iface.starts_with("GigabitEthernet") || iface.starts_with("Gig") {
        (1_000_000, 10)
    } else if iface.starts_with("Serial") {
        (1_544, 20_000)
    } else {
        (100_000, 100)
    }
}

fn encapsulation_dot1q(ws: &mut Workspace, id: &str, s: &mut Session, line: &str, _lower: &str) -> String {
    let iface = s.iface.clone().unwrap_or_default();
    let vlan = line["encapsulation dot1q ".len()..].trim();
    let Ok(vlan) = vlan.parse::<u16>() else {
        return format!("% Invalid VLAN id: {vlan}\n");
    };
    match ws.set_port_dot1q(id, &iface, vlan) {
        Ok(()) => String::new(),
        Err(e) => format!("% {e}\n"),
    }
}

fn ip_helper_address(ws: &mut Workspace, id: &str, s: &mut Session, line: &str, _lower: &str) -> String {
    let iface = s.iface.clone().unwrap_or_default();
    let helper = line[18..].trim().to_string();
    match ws.set_dhcp_helper(id, &iface, &helper) {
        Ok(()) => String::new(),
        Err(e) => format!("% {e}\n"),
    }
}

fn no_ip_helper_address(ws: &mut Workspace, id: &str, s: &mut Session, _line: &str, _lower: &str) -> String {
    let iface = s.iface.clone().unwrap_or_default();
    if ws.remove_dhcp_helper(id, &iface) {
        String::new()
    } else {
        "% no helper address configured\n".into()
    }
}

fn switchport_mode(ws: &mut Workspace, id: &str, s: &mut Session, line: &str, _lower: &str) -> String {
    let iface = s.iface.clone().unwrap_or_default();
    let mode = line[16..].trim().to_ascii_lowercase();
    let trunk = match mode.as_str() {
        "access" => Some(false),
        "trunk" => Some(true),
        _ => None,
    };
    match trunk {
        Some(t) => match ws.set_trunk(id, &iface, t) {
            Ok(()) => String::new(),
            Err(e) => format!("% {e}\n"),
        },
        None => format!("% Invalid switchport mode: {mode}\n"),
    }
}

fn switchport_access_vlan(ws: &mut Workspace, id: &str, s: &mut Session, line: &str, _lower: &str) -> String {
    let iface = s.iface.clone().unwrap_or_default();
    let num = line[23..].trim();
    let Ok(vlan) = num.parse::<u16>() else {
        return format!("% Invalid VLAN id: {num}\n");
    };
    match ws.set_access_vlan(id, &iface, vlan) {
        Ok(()) => String::new(),
        Err(e) => format!("% {e}\n"),
    }
}

fn dot1x_port_control(ws: &mut Workspace, id: &str, _s: &mut Session, _line: &str, lower: &str) -> String {
    let on = !lower.starts_with("no ");
    match ws.set_dot1x(id, on, "", "") {
        Ok(()) => String::new(),
        Err(e) => format!("% {e}\n"),
    }
}

fn ip_nat(ws: &mut Workspace, id: &str, s: &mut Session, line: &str, lower: &str) -> String {
    let iface = s.iface.clone().unwrap_or_default();
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
    match ws.set_nat_role(id, &iface, inside) {
        Ok(()) => String::new(),
        Err(e) => format!("% {e}\n"),
    }
}

fn ip_access_group(ws: &mut Workspace, id: &str, s: &mut Session, line: &str, lower: &str) -> String {
    let iface = s.iface.clone().unwrap_or_default();
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
    match number.parse::<u16>() {
        Ok(n) => match ws.acl_bind(id, &iface, n, inbound) {
            Ok(()) => String::new(),
            Err(e) => format!("% {e}\n"),
        },
        Err(_) => format!("% Invalid access-list: {number}\n"),
    }
}

fn port_security(ws: &mut Workspace, id: &str, s: &mut Session, line: &str, _lower: &str) -> String {
    let iface = s.iface.clone().unwrap_or_default();
    let rest = line["switchport port-security".len()..].trim();
    let max = match rest.strip_prefix("maximum ") {
        Some(n) => match n.trim().parse::<u16>() {
            Ok(n) if n > 0 => n,
            _ => return "% Invalid maximum: 1-1024\n".into(),
        },
        None => 1,
    };
    match ws.set_port_security(id, &iface, max) {
        Ok(()) => String::new(),
        Err(e) => format!("% {e}\n"),
    }
}

fn no_port_security(ws: &mut Workspace, id: &str, s: &mut Session, _line: &str, _lower: &str) -> String {
    let iface = s.iface.clone().unwrap_or_default();
    match ws.set_port_security(id, &iface, 0) {
        Ok(()) => String::new(),
        Err(e) => format!("% {e}\n"),
    }
}

fn channel_group(ws: &mut Workspace, id: &str, s: &mut Session, line: &str, _lower: &str) -> String {
    let iface = s.iface.clone().unwrap_or_default();
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
    match group.parse::<u16>() {
        Ok(g) => match ws.set_channel_group_mode(id, &iface, g, &mode.to_ascii_lowercase()) {
            Ok(()) => String::new(),
            Err(e) => format!("% {e}\n"),
        },
        Err(_) => format!("% Invalid channel-group: {group}\n"),
    }
}

fn ignored_switchport_options(_ws: &mut Workspace, _id: &str, _s: &mut Session, _line: &str, _lower: &str) -> String {
    String::new()
}

fn no_shutdown(ws: &mut Workspace, id: &str, s: &mut Session, _line: &str, _lower: &str) -> String {
    let iface = s.iface.clone().unwrap_or_default();
    // IOS accepts any unambiguous prefix here, so `shut`, `no shut` and
    // `no sh` must resolve to `shutdown` / `no shutdown`.
    let _ = ws.set_port_up(id, &iface, true);
    "%LINK-5-CHANGED: Interface {}, changed state to up\n"
        .replace("{}", &iface)
}

fn shutdown(ws: &mut Workspace, id: &str, s: &mut Session, _line: &str, _lower: &str) -> String {
    let iface = s.iface.clone().unwrap_or_default();
    let _ = ws.set_port_up(id, &iface, false);
    "%LINK-5-CHANGED: Interface {}, changed state to administratively down\n"
        .replace("{}", &iface)
}

/// Whole-word commands: leaving the interface and `help`.
fn keyword_command(s: &mut Session, line: &str, lower: &str) -> String {
    match lower {
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

/// `speed 10|100|1000|auto` and `duplex half|full|auto`; `no` goes back to auto.
fn speed_duplex(ws: &mut Workspace, id: &str, s: &mut Session, line: &str, lower: &str) -> String {
    let iface = s.iface.clone().unwrap_or_default();
    let words: Vec<&str> = lower.split_whitespace().collect();
    let (kind, value) = match words.as_slice() {
        ["no", kind] => (*kind, "auto"),
        [kind, value] => (*kind, *value),
        _ => return invalid(line, Mode::Iface),
    };
    let result = if kind == "speed" {
        match value {
            "auto" => ws.set_link_speed(id, &iface, None),
            _ => match value.parse::<u32>() {
                Ok(speed) => ws.set_link_speed(id, &iface, Some(speed)),
                Err(_) => return invalid(line, Mode::Iface),
            },
        }
    } else {
        match value {
            "auto" => ws.set_link_duplex(id, &iface, None),
            "full" => ws.set_link_duplex(id, &iface, Some(true)),
            "half" => ws.set_link_duplex(id, &iface, Some(false)),
            _ => return invalid(line, Mode::Iface),
        }
    };
    match result {
        Ok(()) => String::new(),
        Err(e) => format!("% {e}\n"),
    }
}
