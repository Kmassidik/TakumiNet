use super::*;

pub(super) fn router_mode(ws: &mut Workspace, id: &str, s: &mut Session, line: &str, lower: &str) -> String {
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
        _ => invalid(&line, Mode::Router),
    }
}
