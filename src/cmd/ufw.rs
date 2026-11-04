//! `ufw`: the uncomplicated firewall on Linux-style end devices.

use crate::workspace::{HostFirewall, UfwRule, Workspace};

const USAGE: &str = "Usage: ufw COMMAND\n\nCommands:\n  enable | disable | reset\n  default allow|deny incoming\n  allow|deny RULE\n  delete RULE|NUMBER\n  status [verbose|numbered]\n\nRun ufw --help for examples.\n";

fn service(name: &str) -> Option<(u16, &'static str)> {
    Some(match name {
        "ssh" => (22, "tcp"),
        "telnet" => (23, "tcp"),
        "smtp" => (25, "tcp"),
        "domain" | "dns" => (53, "udp"),
        "http" | "www" => (80, "tcp"),
        "https" => (443, "tcp"),
        _ => return None,
    })
}

fn parse_from(text: &str) -> Result<Option<(u32, u8)>, String> {
    if text == "any" {
        return Ok(None);
    }
    let (ip, prefix) = text.split_once('/').unwrap_or((text, "32"));
    let ip = crate::model::parse_ipv4(ip).ok_or_else(|| format!("ERROR: Bad source address '{text}'"))?;
    let prefix: u8 = prefix.parse().ok().filter(|p| *p <= 32).ok_or("ERROR: Bad prefix length")?;
    Ok(Some((ip, prefix)))
}

fn parse_proto(text: &str) -> Result<Option<String>, String> {
    match text {
        "tcp" | "udp" | "icmp" => Ok(Some(text.to_string())),
        "any" => Ok(None),
        _ => Err(format!("ERROR: Unsupported protocol '{text}'")),
    }
}

fn parse_rule(allow: bool, words: &[&str]) -> Result<UfwRule, String> {
    let mut rule = UfwRule { allow, proto: None, port: None, from: None };
    if words.is_empty() {
        return Err("ERROR: Need a rule, for example: ufw allow 22/tcp".into());
    }
    if let [single] = words {
        if let Some((port, proto)) = service(single) {
            rule.port = Some(port);
            rule.proto = Some(proto.to_string());
            return Ok(rule);
        }
        let (port, proto) = single.split_once('/').unwrap_or((single, ""));
        rule.port = Some(port.parse().map_err(|_| format!("ERROR: Bad port '{single}'"))?);
        if !proto.is_empty() {
            rule.proto = parse_proto(proto)?;
        }
        return Ok(rule);
    }
    let mut i = 0;
    while i < words.len() {
        let value = words.get(i + 1).copied();
        match (words[i], value) {
            ("from", Some(v)) => rule.from = parse_from(v)?,
            ("proto", Some(v)) => rule.proto = parse_proto(v)?,
            ("port", Some(v)) => {
                rule.port = Some(v.parse().map_err(|_| format!("ERROR: Bad port '{v}'"))?);
            }
            ("to", Some("any")) => {}
            _ => return Err("ERROR: Invalid syntax".into()),
        }
        i += 2;
    }
    Ok(rule)
}

fn describe_to(rule: &UfwRule) -> String {
    match (rule.port, rule.proto.as_deref()) {
        (Some(p), Some(proto)) => format!("{p}/{proto}"),
        (Some(p), None) => p.to_string(),
        (None, Some(proto)) => format!("Anywhere/{proto}"),
        (None, None) => "Anywhere".into(),
    }
}

fn describe_from(rule: &UfwRule) -> String {
    match rule.from {
        None => "Anywhere".into(),
        Some((ip, 32)) => crate::model::ipv4_string(ip),
        Some((ip, prefix)) => format!("{}/{}", crate::model::ipv4_string(ip), prefix),
    }
}

fn status(firewall: Option<&HostFirewall>, mode: &str) -> String {
    let Some(firewall) = firewall.filter(|f| f.enabled) else {
        return "Status: inactive\n".into();
    };
    let numbered = mode == "numbered";
    let mut out = String::from("Status: active\n");
    if mode == "verbose" {
        let policy = if firewall.default_allow { "allow" } else { "deny" };
        out.push_str(&format!("Logging: off\nDefault: {policy} (incoming), allow (outgoing), disabled (routed)\nNew profiles: skip\n"));
    }
    if firewall.rules.is_empty() {
        return out;
    }
    out.push_str(&format!("\n{}{:<27}{:<12}From\n", if numbered { "     " } else { "" }, "To", "Action"));
    out.push_str(&format!("{}{:<27}{:<12}----\n", if numbered { "     " } else { "" }, "--", "------"));
    for (index, rule) in firewall.rules.iter().enumerate() {
        let tag = if numbered { format!("[{:>2}] ", index + 1) } else { String::new() };
        let action = if rule.allow { "ALLOW IN" } else { "DENY IN" };
        out.push_str(&format!("{tag}{:<27}{:<12}{}\n", describe_to(rule), action, describe_from(rule)));
    }
    out
}

pub(super) fn run(ws: &mut Workspace, id: &str, root: bool, args: &[&str]) -> String {
    let Some(kind) = ws.devices.iter().find(|d| d.id == id).map(|d| d.kind.as_str()) else {
        return String::new();
    };
    if !matches!(kind, "pc" | "laptop" | "server") {
        return "ufw: command not found\n".into();
    }
    if !root {
        return "ERROR: You need to be root to run this script. Try: sudo ufw ...\n".into();
    }
    let Some((&verb, rest)) = args.split_first() else {
        return USAGE.into();
    };
    match verb {
        "status" => status(ws.ufw(id), rest.first().copied().unwrap_or("")),
        "enable" => {
            ws.ufw_mut(id).enabled = true;
            "Firewall is active and enabled on system startup\n".into()
        }
        "disable" => {
            ws.ufw_mut(id).enabled = false;
            "Firewall stopped and disabled on system startup\n".into()
        }
        "reset" => {
            ws.host_firewalls.remove(id);
            "Resetting all rules to installed defaults.\n".into()
        }
        "default" => match rest {
            [policy @ ("allow" | "deny" | "reject"), "incoming"] | [policy @ ("allow" | "deny" | "reject")] => {
                let allow = *policy == "allow";
                ws.ufw_mut(id).default_allow = allow;
                let shown = if allow { "allow" } else { policy };
                format!("Default incoming policy changed to '{shown}'\n(be sure to update your rules accordingly)\n")
            }
            [_, "outgoing" | "routed"] => "ERROR: only the incoming policy is modelled here\n".into(),
            _ => USAGE.into(),
        },
        "allow" | "deny" | "reject" | "limit" => match parse_rule(verb == "allow" || verb == "limit", rest) {
            Ok(rule) => {
                let firewall = ws.ufw_mut(id);
                if firewall.rules.contains(&rule) {
                    "Skipping adding existing rule\n".into()
                } else {
                    firewall.rules.push(rule);
                    "Rules updated\n".into()
                }
            }
            Err(message) => format!("{message}\n"),
        },
        "delete" => delete(ws, id, rest),
        _ => USAGE.into(),
    }
}

fn delete(ws: &mut Workspace, id: &str, rest: &[&str]) -> String {
    let firewall = ws.ufw_mut(id);
    if let [number] = rest {
        if let Ok(n) = number.parse::<usize>() {
            return if n >= 1 && n <= firewall.rules.len() {
                firewall.rules.remove(n - 1);
                "Rule deleted\n".into()
            } else {
                "ERROR: Could not find rule number\n".into()
            };
        }
    }
    let Some((&action, words)) = rest.split_first() else {
        return USAGE.into();
    };
    match parse_rule(action == "allow", words) {
        Ok(rule) => match firewall.rules.iter().position(|r| *r == rule) {
            Some(index) => {
                firewall.rules.remove(index);
                "Rule deleted\n".into()
            }
            None => "Could not delete non-existent rule\n".into(),
        },
        Err(message) => format!("{message}\n"),
    }
}
