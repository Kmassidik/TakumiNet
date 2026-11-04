use super::*;

pub(super) fn router_mode(ws: &mut Workspace, id: &str, s: &mut Session, line: &str, lower: &str) -> String {
    if s.router.as_deref() == Some("bgp") {
        return config_bgp::bgp_mode(ws, id, s, line, lower);
    }
    if lower.starts_with("version") {
        if s.router.as_deref() == Some("rip") && lower == "version 2" {
            return String::new();
        }
        return "% Only RIP version 2 is supported\n".into();
    }
    if lower.starts_with("network ") || lower.starts_with("no network ") {
        let remove = lower.starts_with("no ");
        let raw = if remove {
            &line["no network ".len()..]
        } else {
            &line["network ".len()..]
        };
        let mut words = raw.split_whitespace();
        let Some(addr) = words.next() else {
            return "% Incomplete command.\n".into();
        };
        if s.router.as_deref() == Some("ospfv3") || addr.contains(':') {
            if remove {
                return invalid(line, Mode::Router);
            }
            let token = match words.next() {
                Some(prefix) => format!("{addr} {prefix}"),
                None => addr.to_string(),
            };
            if words.next().is_some() {
                return invalid(line, Mode::Router);
            }
            return match ws.add_v6_network(id, token.trim()) {
                Ok(()) => String::new(),
                Err(e) => format!("% {e}\n"),
            };
        }
        let Some(ip) = parse_ipv4(addr) else {
            return format!("% Invalid network: {addr}\n");
        };
        let protocol = s.router.as_deref().unwrap_or("rip");
        let mask = words.next();
        let (prefix, area) = match protocol {
            "ospf" => {
                let Some(mask) = mask else {
                    return "% Incomplete command.\n".into();
                };
                let Some(prefix) = wildcard_prefix(mask).or_else(|| parse_mask(mask)) else {
                    return format!("% Invalid wildcard mask: {mask}\n");
                };
                let area = match words.next() {
                    Some(keyword) if keyword.eq_ignore_ascii_case("area") => {
                        let Some(area) = words.next() else {
                            return "% Incomplete command.\n".into();
                        };
                        match area.parse::<u32>() {
                            Ok(area) => area,
                            Err(_) => return format!("% Invalid area: {area}\n"),
                        }
                    }
                    Some(_) => return invalid(line, Mode::Router),
                    None => 0,
                };
                (prefix, area)
            }
            "eigrp" => {
                let prefix = match mask {
                    Some(mask) => match wildcard_prefix(mask).or_else(|| parse_mask(mask)) {
                        Some(prefix) => prefix,
                        None => return format!("% Invalid wildcard mask: {mask}\n"),
                    },
                    None => classful_prefix(ip),
                };
                (prefix, 0)
            }
            _ => {
                let prefix = match mask {
                    Some(mask) => match parse_mask(mask) {
                        Some(prefix) => prefix,
                        None => return format!("% Invalid mask: {mask}\n"),
                    },
                    None => classful_prefix(ip),
                };
                (prefix, 0)
            }
        };
        if words.next().is_some() {
            return invalid(line, Mode::Router);
        }
        let net = ip & crate::model::mask_of(prefix);
        if remove {
            ws.remove_routing_network(id, net, prefix, area);
            return String::new();
        }
        return match ws.add_routing_network(id, net, prefix, area) {
            Ok(()) => String::new(),
            Err(e) => format!("% {e}\n"),
        };
    }
    match lower {
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
        _ => invalid(line, Mode::Router),
    }
}

fn classful_prefix(ip: u32) -> u8 {
    match ip >> 24 {
        0..=127 => 8,
        128..=191 => 16,
        _ => 24,
    }
}

fn wildcard_prefix(mask: &str) -> Option<u8> {
    let wildcard = parse_ipv4(mask)?;
    parse_mask(&ipv4_string(!wildcard))
}
