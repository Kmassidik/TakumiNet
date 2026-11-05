//! Port mirroring (Cisco SPAN, a vendor feature with no IEEE name).
//!
//! Frames that cross the source port are copied to the destination port, where
//! a Sniffer can record them. One session per switch is enough for the lab.

use super::*;
use crate::cli::expand_iface;
use std::collections::HashMap;

#[derive(Clone, Debug, PartialEq, Eq)]
pub struct MirrorSession {
    pub source: Option<(String, String)>,
    pub dest: Option<String>,
}

#[derive(Clone, Default)]
pub struct MirrorConfig {
    pub(super) sessions: HashMap<String, MirrorSession>,
}

impl Workspace {
    fn session_mut(&mut self, device: &str) -> &mut MirrorSession {
        self.mirror.sessions.entry(device.to_string()).or_insert_with(|| MirrorSession {
            source: None,
            dest: None,
        })
    }

    pub fn mirror_source(&self, device: &str) -> Option<(&str, &str)> {
        self.mirror
            .sessions
            .get(device)
            .and_then(|s| s.source.as_ref())
            .map(|(port, dir)| (port.as_str(), dir.as_str()))
    }

    pub fn mirror_dest(&self, device: &str) -> Option<&str> {
        self.mirror.sessions.get(device).and_then(|s| s.dest.as_deref())
    }

    pub fn set_mirror_source(&mut self, device: &str, port: &str, dir: &str) {
        let dir = match dir {
            "rx" | "tx" | "both" => dir,
            _ => "both",
        };
        self.session_mut(device).source = Some((port.to_string(), dir.to_string()));
    }

    pub fn set_mirror_dest(&mut self, device: &str, port: &str) {
        self.session_mut(device).dest = Some(port.to_string());
    }

    pub fn clear_mirror(&mut self, device: &str) {
        self.mirror.sessions.remove(device);
    }

    /// Copy delivered frames to the destination Sniffer when the session's
    /// source port saw them, honouring rx/tx/both.
    pub(super) fn mirror_delivery(&mut self, proto: &str, delivery: &crate::net::fwd::Delivery) {
        let sessions: Vec<(String, String, String, String)> = self
            .mirror
            .sessions
            .iter()
            .filter_map(|(device, s)| {
                let (port, dir) = s.source.clone()?;
                let dest = s.dest.clone()?;
                Some((device.clone(), port, dir, dest))
            })
            .collect();
        for (device, port, dir, dest) in sessions {
            let seen = delivery.hops.iter().any(|hop| {
                hop.id == device
                    && ((dir != "tx" && hop.ingress.as_deref() == Some(port.as_str()))
                        || (dir != "rx" && hop.egress.as_deref() == Some(port.as_str())))
            });
            if !seen {
                continue;
            }
            let Some((sniffer, _)) = self.peer_port(&device, &dest) else {
                continue;
            };
            if self.devices.iter().find(|d| d.id == sniffer).map(|d| d.kind.as_str()) != Some("sniffer") {
                continue;
            }
            let Some(hop) = delivery.hops.iter().find(|h| h.id == device) else {
                continue;
            };
            let proto = match proto {
                "ICMP" => "icmp",
                "HTTP" => "tcp",
                "ARP" => "arp",
                other => &other.to_ascii_lowercase(),
            };
            self.tables.sniff(
                &sniffer,
                SnifferRow {
                    t: hop.t,
                    src_mac: hop.src_mac.to_string(),
                    dst_mac: hop.dst_mac.to_string(),
                    ethertype: "0x0800".into(),
                    src_ip: crate::model::ipv4_string(hop.src_ip),
                    dst_ip: crate::model::ipv4_string(hop.dst_ip),
                    proto: proto.to_string(),
                    length: 54,
                    info: format!("mirrored from {port}"),
                },
            );
        }
    }

    pub fn mirror_table(&self, device: &str) -> String {
        let Some(session) = self.mirror.sessions.get(device) else {
            return "% no monitor session\n".into();
        };
        let mut out = String::from("Session 1\n");
        if let Some((port, dir)) = &session.source {
            out.push_str(&format!("  source interface {port} ({dir})\n"));
        }
        if let Some(dest) = &session.dest {
            out.push_str(&format!("  destination interface {dest}\n"));
        }
        out
    }

    pub(super) fn mirror_records(&self) -> String {
        let mut ids: Vec<_> = self.mirror.sessions.iter().collect();
        ids.sort_by_key(|(id, _)| id.as_str());
        let mut out = String::new();
        for (device, session) in ids {
            let source = session
                .source
                .as_ref()
                .map_or("-".to_string(), |(port, dir)| format!("{port}:{dir}"));
            let dest = session.dest.clone().unwrap_or_else(|| "-".into());
            out.push_str(&format!("mirror\t{device}\t{source}\t{dest}\n"));
        }
        out
    }

    pub(super) fn mirror_load(&mut self, device: &str, source: &str, dest: &str) {
        if source != "-" {
            if let Some((port, dir)) = source.split_once(':') {
                self.set_mirror_source(device, port, dir);
            }
        }
        if dest != "-" {
            self.set_mirror_dest(device, dest);
        }
    }
}

/// `monitor session 1 source|destination interface ...` from config mode.
pub(crate) fn command(ws: &mut Workspace, id: &str, _s: &mut crate::cli::Session, _line: &str, lower: &str) -> String {
    if lower == "no monitor session 1" {
        ws.clear_mirror(id);
        return String::new();
    }
    let words: Vec<&str> = lower.split_whitespace().collect();
    if words.get(2) != Some(&"1") {
        return "ERROR: only session 1 is modelled\n".into();
    }
    let names: Vec<String> = ws
        .devices
        .iter()
        .find(|d| d.id == id)
        .map(|d| d.ports.iter().map(|p| p.name.clone()).collect())
        .unwrap_or_default();
    let resolve = |raw: &str| expand_iface(raw, &names).unwrap_or_else(|| raw.to_string());
    match words.get(3).copied() {
        Some("source") => {
            let Some(pos) = words.iter().position(|w| *w == "interface") else {
                return "ERROR: need 'source interface PORT'\n".into();
            };
            let Some(port) = words.get(pos + 1) else {
                return "ERROR: need a source port\n".into();
            };
            let dir = words.get(pos + 2).copied().unwrap_or("both");
            ws.set_mirror_source(id, &resolve(port), dir);
            String::new()
        }
        Some("destination") => {
            let Some(pos) = words.iter().position(|w| *w == "interface") else {
                return "ERROR: need 'destination interface PORT'\n".into();
            };
            let Some(port) = words.get(pos + 1) else {
                return "ERROR: need a destination port\n".into();
            };
            ws.set_mirror_dest(id, &resolve(port));
            String::new()
        }
        _ => "ERROR: need source or destination\n".into(),
    }
}
