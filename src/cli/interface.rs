use super::*;

pub(super) fn iface_mode(ws: &mut Workspace, id: &str, s: &mut Session, line: &str, lower: &str) -> String {
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
