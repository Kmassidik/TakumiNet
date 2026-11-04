//! A small IOS-like CLI for routers and switches.
//!
//! Interfaces, addressing and admin state live in the workspace; this module
//! only parses commands and renders output, so `show run` reflects real state.

use crate::model::{ipv4_string, mask_of, parse_ipv4, parse_mask};
use crate::workspace::{Device, Workspace};

mod config;
mod exec;
mod help;
mod hints;
mod interface;
mod line;
mod router;
mod show;
mod show_tables;
use help::*;
use show::*;
use show_tables::*;
pub use help::complete;
pub(crate) use show::config_for;

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
        "ether" => Some("Ether"),
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

fn invalid(line: &str, _mode: Mode) -> String {
    let lower = line.to_ascii_lowercase();
    let prefix = if lower.starts_with("show ") {
        Some(5)
    } else if lower.starts_with("sh ") {
        Some(3)
    } else {
        None
    };
    let caret = prefix
        .and_then(|offset| {
            line[offset..]
                .find(|c: char| !c.is_whitespace())
                .map(|next| offset + next)
        })
        .unwrap_or(0);
    format!(
        "% Invalid input detected at '^' marker.\n{line}\n{}^\n",
        " ".repeat(caret)
    )
}

/// True when `typed` is a non-empty prefix of `keyword`, as IOS accepts.
fn is_prefix(typed: &str, keyword: &str) -> bool {
    !typed.is_empty() && keyword.starts_with(typed)
}

/// Match a complete command while allowing each keyword to be abbreviated.
fn command_matches(typed: &str, command: &str) -> bool {
    let mut typed = typed.split_whitespace();
    let mut command = command.split_whitespace();
    loop {
        match (typed.next(), command.next()) {
            (Some(typed), Some(keyword)) if is_prefix(typed, keyword) => {}
            (None, None) => return true,
            _ => return false,
        }
    }
}

/// `interface NAME`, `intf NAME` and `int NAME` all name the same command.
fn iface_arg(lower: &str) -> Option<&str> {
    ["interface ", "intf ", "int "]
        .iter()
        .find_map(|p| lower.strip_prefix(p))
}

pub fn run(ws: &mut Workspace, id: &str, s: &mut Session, line: &str) -> String {
    let line = line.trim().to_string();
    if line.is_empty() {
        return String::new();
    }
    let lower = line.to_ascii_lowercase();

    // `do` escapes config mode.
    if let Some(rest) = lower.strip_prefix("do ") {
        if matches!(s.mode, Mode::Config | Mode::Iface | Mode::Line | Mode::Router) {
            let what = rest.trim();
            let what = what
                .strip_prefix("show ")
                .or_else(|| what.strip_prefix("sh "))
                .unwrap_or(what);
            return show(ws, id, what);
        }
    }

    let mode = s.mode;
    let out = match mode {
        Mode::User => exec::user(ws, id, s, &line, &lower),
        Mode::Priv => exec::privileged(ws, id, s, &line, &lower),
        Mode::Config => config::config_mode(ws, id, s, &line, &lower),
        Mode::Iface => interface::iface_mode(ws, id, s, &line, &lower),
        Mode::Router => router::router_mode(ws, id, s, &line, &lower),
        Mode::Line => line::line_mode(ws, id, s, &line, &lower),
    };
    hints::append(ws, id, mode, &lower, out)
}

#[cfg(test)]
mod tests;

#[cfg(test)]
mod tests_complete;

#[cfg(test)]
mod tests_hints;
