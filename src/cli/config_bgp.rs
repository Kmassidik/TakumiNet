//! `router ...` from configuration mode, and the BGP flavour of router mode.
//! The IGPs (rip/ospf/eigrp) keep their shared mode in `router.rs`; BGP has
//! its own vocabulary (neighbor, network, deny) and lands here.

use super::*;

/// `router PROTO [ID]` in configuration mode: enters router mode bound to the
/// protocol. BGP takes the local autonomous system as its argument.
pub(super) fn router_protocol(ws: &mut Workspace, id: &str, s: &mut Session, line: &str, _lower: &str) -> String {
    let rest = &line["router ".len()..];
    let mut words = rest.split_whitespace();
    let (Some(proto), pid) = (words.next(), words.next()) else {
        return "% Incomplete command.\n".into();
    };
    let proto = proto.to_ascii_lowercase();
    if !matches!(proto.as_str(), "rip" | "ospf" | "eigrp" | "ospfv3" | "bgp") {
        return format!("% Invalid routing protocol: {proto}\n");
    }
    let process_id = if proto == "rip" {
        if pid.is_some() {
            return invalid(line, Mode::Config);
        }
        0
    } else {
        let Some(pid) = pid else {
            return "% Incomplete command.\n".into();
        };
        match pid.parse::<u32>() {
            Ok(pid) => pid,
            Err(_) => return format!("% Invalid process id: {pid}\n"),
        }
    };
    if words.next().is_some() {
        return invalid(line, Mode::Config);
    }
    let entered = if proto == "bgp" {
        ws.bgp_config(id, process_id)
    } else {
        ws.set_routing_protocol(id, &proto, process_id)
    };
    match entered {
        Ok(()) => {
            s.mode = Mode::Router;
            s.router = Some(proto);
            String::new()
        }
        Err(e) => format!("% {e}\n"),
    }
}

/// Router mode while bound to BGP.
pub(super) fn bgp_mode(ws: &mut Workspace, id: &str, s: &mut Session, line: &str, lower: &str) -> String {
    if lower.starts_with("neighbor ") {
        return neighbor(ws, id, &line["neighbor ".len()..]);
    }
    if lower.starts_with("no neighbor ") {
        let peer = line["no neighbor ".len()..].trim();
        return if ws.bgp_remove_neighbor(id, peer) {
            String::new()
        } else {
            format!("% No such neighbor: {peer}\n")
        };
    }
    if let Some(rest) = strip_net_prefix(line, lower, "network ") {
        return announce(ws, id, rest, false, lower.starts_with("no "));
    }
    if let Some(rest) = strip_net_prefix(line, lower, "deny ") {
        return announce(ws, id, rest, true, lower.starts_with("no "));
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

fn strip_net_prefix<'a>(line: &'a str, lower: &str, keyword: &str) -> Option<&'a str> {
    if lower.starts_with(keyword) {
        return Some(&line[keyword.len()..]);
    }
    let no = format!("no {keyword}");
    lower.starts_with(&no).then(|| &line[no.len()..])
}

/// `neighbor IP remote-as AS`.
fn neighbor(ws: &mut Workspace, id: &str, rest: &str) -> String {
    let mut words = rest.split_whitespace();
    let (Some(peer), Some(kw), Some(asn)) = (words.next(), words.next(), words.next()) else {
        return "% Incomplete command.\n".into();
    };
    if !kw.eq_ignore_ascii_case("remote-as") || words.next().is_some() {
        return "% Only neighbor IP remote-as AS is supported\n".into();
    }
    let Ok(peer_as) = asn.parse::<u32>() else {
        return format!("% Invalid autonomous system: {asn}\n");
    };
    match ws.bgp_neighbor(id, peer, peer_as) {
        Ok(()) => String::new(),
        Err(e) => format!("% {e}\n"),
    }
}

/// `network NET mask MASK`, `network NET/LEN`, `deny NET/LEN` and their
/// no-forms. `deny` is the plain-worded refuse list: the prefix is never
/// imported from any peer.
fn announce(ws: &mut Workspace, id: &str, rest: &str, deny: bool, remove: bool) -> String {
    let (net, prefix) = match parse_prefix(rest) {
        Ok(parsed) => parsed,
        Err(e) => return e,
    };
    let done = match (deny, remove) {
        (false, false) => ws.bgp_network(id, net, prefix).map(|()| true),
        (false, true) => Ok(ws.bgp_remove_network(id, net, prefix)),
        (true, false) => ws.bgp_deny(id, net, prefix).map(|()| true),
        (true, true) => Ok(ws.bgp_remove_deny(id, net, prefix)),
    };
    match done {
        Ok(true) => String::new(),
        Ok(false) => format!(
            "% No such {}: {}/{}\n",
            if deny { "denied prefix" } else { "network" },
            ipv4_string(net),
            prefix
        ),
        Err(e) => format!("% {e}\n"),
    }
}

/// `A.B.C.D/LEN` or `A.B.C.D mask M` or `A.B.C.D M`.
fn parse_prefix(rest: &str) -> Result<(u32, u8), String> {
    let rest = rest.trim();
    if let Some((addr, len)) = rest.split_once('/') {
        let Some(net) = parse_ipv4(addr.trim()) else {
            return Err(format!("% Invalid network: {addr}\n"));
        };
        let Some(prefix) = len.trim().parse::<u8>().ok().filter(|p| *p <= 32) else {
            return Err(format!("% Invalid prefix length: {len}\n"));
        };
        return Ok((net & mask_of(prefix), prefix));
    }
    let mut words = rest.split_whitespace();
    let Some(addr) = words.next() else {
        return Err("% Incomplete command.\n".into());
    };
    let Some(net) = parse_ipv4(addr) else {
        return Err(format!("% Invalid network: {addr}\n"));
    };
    let mask = match words.next() {
        Some(kw) if kw.eq_ignore_ascii_case("mask") => words.next(),
        other => other,
    };
    let Some(mask) = mask else {
        return Err("% Incomplete command.\n".into());
    };
    if words.next().is_some() {
        return Err("% Only network NET mask MASK or NET/LEN is supported\n".into());
    }
    let Some(prefix) = parse_mask(mask) else {
        return Err(format!("% Invalid mask: {mask}\n"));
    };
    Ok((net & mask_of(prefix), prefix))
}
