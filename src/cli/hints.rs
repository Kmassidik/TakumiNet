//! Plain-language hints after an IOS rejection, naming the mode a command
//! lives in. The authentic `% Invalid input` text stays untouched; the hint
//! is one extra line, at most one per command.

use super::{config, show::show, Mode, Workspace};

const INVALID: &str = "% Invalid input detected";

const PRIV_HINT: &str = "Takumi: this command works in privileged mode. Type 'enable' first.\n";
const CONFIG_HINT: &str =
    "Takumi: configuration commands live in config mode. Type 'configure terminal' first.\n";
const ROUTER_HINT: &str =
    "Takumi: neighbor, network and deny live in router mode. Type 'router bgp AS' (or 'router ospf PID') first.\n";

/// Exact privileged-mode spellings, mirroring the match arms of
/// `exec::privileged` that user mode does not also accept.
const PRIV_KEYWORDS: &[&str] = &[
    "configure terminal",
    "conf t",
    "config t",
    "configure t",
    "show running-config",
    "sh run",
    "show startup-config",
    "sh start",
    "write memory",
    "wr",
    "copy running-config startup-config",
    "copy run start",
    "reload",
    "clock",
];

/// Append the one fitting hint to a rejected line's output, or return the
/// output unchanged when the command is wrong in every mode.
pub(super) fn append(ws: &Workspace, id: &str, mode: Mode, lower: &str, out: String) -> String {
    if !out.starts_with(INVALID) {
        return out;
    }
    let hint = match mode {
        Mode::User if works_in_priv(ws, id, lower) => PRIV_HINT,
        Mode::Priv if is_config_vocabulary(lower) || is_router_vocabulary(lower) => CONFIG_HINT,
        Mode::Config if is_router_vocabulary(lower) => ROUTER_HINT,
        _ => return out,
    };
    format!("{out}{hint}")
}

/// Would privileged mode accept this line? `show` lines get an honest
/// dry run against the real parser - `show` takes `&Workspace`, so the
/// probe cannot mutate anything. The remaining privileged commands are
/// exact keywords (some of which do mutate, like `write memory`), so
/// membership in `PRIV_KEYWORDS` is checked instead of executing them.
fn works_in_priv(ws: &Workspace, id: &str, lower: &str) -> bool {
    if PRIV_KEYWORDS.contains(&lower) {
        return true;
    }
    let rest = lower
        .strip_prefix("show ")
        .or_else(|| lower.strip_prefix("sh "));
    match rest {
        Some(what) => !show(ws, id, what.trim()).starts_with(INVALID),
        None => false,
    }
}

/// Does the line open with configuration-mode vocabulary? Derived from the
/// dispatch table in `config.rs` rather than a copied word list; `no ...`
/// is narrowed to the forms `config_no` actually accepts, so `no garbage`
/// earns no hint.
fn is_config_vocabulary(lower: &str) -> bool {
    if let Some(rest) = lower.strip_prefix("no ") {
        let rest = rest.trim_start();
        return [
            "ip route",
            "hostname",
            "banner",
            "vlan ",
            "ip nat inside source",
            "inspect icmp",
            "ips signature ",
        ]
        .iter()
        .any(|p| rest.starts_with(p));
    }
    config::vocabulary(lower)
}

/// Does the line open with router-mode vocabulary (the BGP commands and the
/// shared `network` statement)? Mirrors the dispatch in `config_bgp::bgp_mode`
/// and `router::router_mode`.
fn is_router_vocabulary(lower: &str) -> bool {
    let rest = lower.strip_prefix("no ").unwrap_or(lower).trim_start();
    ["neighbor ", "network ", "deny "].iter().any(|p| rest.starts_with(p))
}
