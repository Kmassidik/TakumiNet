//! Port mirroring (Cisco SPAN, a vendor feature with no IEEE name).
//!
//! A session copies frames seen on its source port to a destination port where
//! a Sniffer records them. Up to four sessions per switch, and copies happen
//! for every frame that reaches the switch, including frames dropped later.

use super::*;
use crate::cli::expand_iface;
use crate::net::packet::{IpProto, Mac, Packet};
use std::collections::HashMap;

#[derive(Clone, Debug, PartialEq, Eq)]
pub struct MirrorSession {
    pub source: Option<(String, String)>,
    pub dest: Option<String>,
}

impl MirrorSession {
    fn empty() -> Self {
        Self { source: None, dest: None }
    }
}

#[derive(Clone, Default)]
pub struct MirrorConfig {
    pub(super) sessions: HashMap<String, HashMap<u8, MirrorSession>>,
}

impl Workspace {
    fn session_mut(&mut self, device: &str, id: u8) -> &mut MirrorSession {
        self.mirror
            .sessions
            .entry(device.to_string())
            .or_default()
            .entry(id)
            .or_insert_with(MirrorSession::empty)
    }

    pub fn mirror_source(&self, device: &str) -> Option<(&str, &str)> {
        self.mirror
            .sessions
            .get(device)
            .and_then(|m| m.get(&1))
            .and_then(|s| s.source.as_ref())
            .map(|(port, dir)| (port.as_str(), dir.as_str()))
    }

    pub fn mirror_dest(&self, device: &str) -> Option<&str> {
        self.mirror
            .sessions
            .get(device)
            .and_then(|m| m.get(&1))
            .and_then(|s| s.dest.as_deref())
    }

    pub fn set_mirror_source(&mut self, device: &str, port: &str, dir: &str) {
        self.set_mirror_source_in(device, 1, port, dir);
    }

    pub fn set_mirror_source_in(&mut self, device: &str, id: u8, port: &str, dir: &str) {
        let dir = match dir {
            "rx" | "tx" | "both" => dir,
            _ => "both",
        };
        self.session_mut(device, id).source = Some((port.to_string(), dir.to_string()));
    }

    pub fn set_mirror_dest(&mut self, device: &str, port: &str) {
        self.set_mirror_dest_in(device, 1, port);
    }

    pub fn set_mirror_dest_in(&mut self, device: &str, id: u8, port: &str) {
        self.session_mut(device, id).dest = Some(port.to_string());
    }

    pub fn clear_mirror(&mut self, device: &str) {
        self.mirror.sessions.remove(device);
    }

    pub fn clear_mirror_session(&mut self, device: &str, id: u8) {
        if let Some(sessions) = self.mirror.sessions.get_mut(device) {
            sessions.remove(&id);
            if sessions.is_empty() {
                self.mirror.sessions.remove(device);
            }
        }
    }

    /// Copy one frame while it crosses a switch. Called for every switch hop,
    /// so frames dropped later in the walk are still mirrored.
    pub(crate) fn mirror_hop(
        &mut self,
        device: &str,
        ingress: Option<&str>,
        egress: Option<&str>,
        src_mac: Mac,
        dst_mac: Mac,
        packet: &Packet,
        t: f64,
    ) {
        let Some(sessions) = self.mirror.sessions.get(device) else {
            return;
        };
        let copies: Vec<(String, String)> = sessions
            .values()
            .filter_map(|s| {
                let (port, dir) = s.source.clone()?;
                let dest = s.dest.clone()?;
                let seen = (dir != "tx" && ingress == Some(port.as_str()))
                    || (dir != "rx" && egress == Some(port.as_str()));
                seen.then_some((dest, port))
            })
            .collect();
        for (dest, port) in copies {
            let Some((sniffer, _)) = self.peer_port(device, &dest) else {
                continue;
            };
            if self.devices.iter().find(|d| d.id == sniffer).map(|d| d.kind.as_str()) != Some("sniffer") {
                continue;
            }
            let proto = match packet.proto {
                IpProto::Icmp => "icmp",
                IpProto::Tcp => "tcp",
                IpProto::Udp => "udp",
            };
            self.tables.sniff(
                &sniffer,
                SnifferRow {
                    t,
                    src_mac: src_mac.to_string(),
                    dst_mac: dst_mac.to_string(),
                    ethertype: "0x0800".into(),
                    src_ip: crate::model::ipv4_string(packet.src),
                    dst_ip: crate::model::ipv4_string(packet.dst),
                    proto: proto.to_string(),
                    length: 14 + 20 + packet.payload_len(),
                    info: format!("mirrored from {port}"),
                },
            );
        }
    }

    pub fn mirror_table(&self, device: &str) -> String {
        let Some(sessions) = self.mirror.sessions.get(device) else {
            return "% no monitor session\n".into();
        };
        let mut ids: Vec<_> = sessions.keys().copied().collect();
        ids.sort();
        let mut out = String::new();
        for id in ids {
            let session = &sessions[&id];
            out.push_str(&format!("Session {id}\n"));
            if let Some((port, dir)) = &session.source {
                out.push_str(&format!("  source interface {port} ({dir})\n"));
            }
            if let Some(dest) = &session.dest {
                out.push_str(&format!("  destination interface {dest}\n"));
            }
        }
        out
    }

    pub(super) fn mirror_records(&self) -> String {
        let mut devices: Vec<_> = self.mirror.sessions.iter().collect();
        devices.sort_by_key(|(id, _)| id.as_str());
        let mut out = String::new();
        for (device, sessions) in devices {
            let mut ids: Vec<_> = sessions.keys().copied().collect();
            ids.sort();
            for id in ids {
                let session = &sessions[&id];
                let source = session
                    .source
                    .as_ref()
                    .map_or("-".to_string(), |(port, dir)| format!("{port}:{dir}"));
                let dest = session.dest.clone().unwrap_or_else(|| "-".into());
                out.push_str(&format!("mirror\t{device}\t{id}\t{source}\t{dest}\n"));
            }
        }
        out
    }

    /// Old files hold `mirror dev source dest`; new files add the session id.
    pub(super) fn mirror_load(&mut self, fields: &[&str]) {
        let (device, id, source, dest) = match fields {
            [device, source, dest] => (*device, 1, *source, *dest),
            [device, id, source, dest] => (*device, id.parse().unwrap_or(1), *source, *dest),
            _ => return,
        };
        if source != "-" {
            if let Some((port, dir)) = source.split_once(':') {
                self.set_mirror_source_in(device, id, port, dir);
            }
        }
        if dest != "-" {
            self.set_mirror_dest_in(device, id, dest);
        }
    }
}

/// `monitor session N source|destination interface ...` from config mode.
pub(crate) fn command(ws: &mut Workspace, id: &str, _s: &mut crate::cli::Session, _line: &str, lower: &str) -> String {
    if let Some(rest) = lower.strip_prefix("no monitor session ") {
        match rest.trim().parse::<u8>() {
            Ok(session) => { ws.clear_mirror_session(id, session); String::new() }
            Err(_) => "ERROR: session must be 1-4\n".into(),
        }
    } else {
        let words: Vec<&str> = lower.split_whitespace().collect();
        let Some(session) = words.get(2).and_then(|v| v.parse::<u8>().ok()).filter(|n| (1..=4).contains(n)) else {
            return "ERROR: only sessions 1-4 are modelled\n".into();
        };
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
                ws.set_mirror_source_in(id, session, &resolve(port), dir);
                String::new()
            }
            Some("destination") => {
                let Some(pos) = words.iter().position(|w| *w == "interface") else {
                    return "ERROR: need 'destination interface PORT'\n".into();
                };
                let Some(port) = words.get(pos + 1) else {
                    return "ERROR: need a destination port\n".into();
                };
                ws.set_mirror_dest_in(id, session, &resolve(port));
                String::new()
            }
            _ => "ERROR: need source or destination\n".into(),
        }
    }
}
