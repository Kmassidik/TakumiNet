//! IPv6 echo over an L2 segment.
//!
//! IPv6 routing and neighbour discovery are not modelled. A `ping6` reaches a
//! device only when both ends sit on the same live L2 segment; the walk uses
//! the workspace links, and the destination host firewall decides the answer.

use crate::net::packet::Mac;
use crate::net::fwd::Hop;
use crate::workspace::{Layer, Workspace};
use std::collections::VecDeque;

/// Live device path from `src` to `dst` across cables, switches included.
/// `None` when no all-ports-up path exists.
pub(crate) fn l2_path(ws: &Workspace, src: &str, dst: &str) -> Option<Vec<String>> {
    let mut queue: VecDeque<Vec<String>> = VecDeque::new();
    queue.push_back(vec![src.to_string()]);
    let mut seen = vec![src.to_string()];
    while let Some(path) = queue.pop_front() {
        let last = path.last()?.clone();
        if last == dst {
            return Some(path);
        }
        for link in &ws.links {
            let next = if link.a == last {
                &link.b
            } else if link.b == last {
                &link.a
            } else {
                continue;
            };
            if seen.iter().any(|id| id == next) {
                continue;
            }
            let Some(_dev) = ws.devices.iter().find(|d| d.id == *next) else {
                continue;
            };
            let mut p = path.clone();
            p.push(next.clone());
            seen.push(next.clone());
            queue.push_back(p);
        }
    }
    None
}

/// Build one hop per device so the Capture dock can show the v6 walk.
pub(crate) fn v6_hops(ws: &Workspace, path: &[String], src: &str, dst: &str, proto: &str, port: Option<u16>) -> Vec<Hop> {
    let (next_header, transport, detail) = transport_layers(proto, port);
    let src_mac = Mac::for_device(src);
    let dst_mac = Mac::for_device(dst);
    let layers = vec![
        Layer::new("IPv6", vec![
            ("Version".into(), "6".into()),
            ("Next header".into(), next_header),
            ("Hop limit".into(), "64".into()),
        ]),
        Layer::new(transport, detail),
    ];
    path.iter()
        .enumerate()
        .map(|(i, id)| {
            let dev = ws.devices.iter().find(|d| d.id == *id);
            let name = dev.map(|d| d.name.clone()).unwrap_or_else(|| id.clone());
            let ingress = (i > 0).then(|| path[i - 1].clone());
            let egress = (i + 1 < path.len()).then(|| path[i + 1].clone());
            Hop {
                id: id.clone(),
                name,
                ingress,
                egress,
                t: 0.001 * i as f64,
                ttl: 64,
                src_mac,
                dst_mac,
                src_ip: 0,
                dst_ip: 0,
                layers: layers.clone(),
                note: format!("IPv6 {proto}"),
            }
        })
        .collect()
}

fn transport_layers(proto: &str, port: Option<u16>) -> (String, String, Vec<(String, String)>) {
    match proto {
        "tcp" => (
            "TCP".into(),
            "TCP".into(),
            vec![
                ("Source port".into(), "49152".into()),
                ("Destination port".into(), port.map_or("0".into(), |p| p.to_string())),
                ("Flags".into(), "SYN".into()),
            ],
        ),
        "udp" => (
            "UDP".into(),
            "UDP".into(),
            vec![
                ("Source port".into(), "49152".into()),
                ("Destination port".into(), port.map_or("0".into(), |p| p.to_string())),
                ("Length".into(), "8".into()),
            ],
        ),
        _ => (
            "ICMPv6".into(),
            "ICMPv6".into(),
            vec![
                ("Type".into(), "128 (echo request)".into()),
                ("Code".into(), "0".into()),
            ],
        ),
    }
}
