//! Frame-level delivery: the part that makes a "ping" a real packet.
//!
//! A walk starts at the source host, crosses L2 segments whose switches learn
//! MAC addresses, is re-encapsulated by each router with a decremented TTL, and
//! ends at the destination. Interfaces that are administratively down break the
//! path, exactly as they do on the wire.

use std::collections::VecDeque;

use crate::cli::expand_iface;
use crate::model::ipv4_string;
use crate::net::packet::{Frame, Mac, Packet, Transit};
use crate::workspace::{Device, Link, Workspace};

/// What happened at one device during a delivery.
#[derive(Clone, Debug)]
pub struct Hop {
    pub id: String,
    pub name: String,
    /// Interface the frame arrived on (`None` at the source).
    pub ingress: Option<String>,
    /// Interface it left on (`None` at the destination).
    pub egress: Option<String>,
    /// Simulated arrival time in seconds (1 ms per hop).
    pub t: f64,
    pub ttl: u8,
    pub src_mac: Mac,
    pub dst_mac: Mac,
    /// Human-readable reason: learning, flooding, routing, ARP.
    pub note: String,
}

#[derive(Clone, Debug)]
pub struct Delivery {
    pub path: Vec<String>,
    pub hops: Vec<Hop>,
    pub frame: Frame,
    /// One-way time in seconds, PT's 1 ms per hop tick.
    pub time: f32,
    /// Absolute simulated time of the last arrival.
    pub finished_at: f64,
}

impl Delivery {
    pub fn size(&self) -> usize {
        self.frame.to_bytes().len()
    }
}

/// Deliver one ICMP echo request from `src` to `dst`.
pub fn deliver(ws: &mut Workspace, src: &str, dst: &str) -> Result<Delivery, String> {
    let sdev = find(ws, src)?.clone();
    let ddev = find(ws, dst)?.clone();
    if src == dst {
        return Err("source and destination are the same".into());
    }
    if !ws.is_powered(src) {
        return Err(format!("{} is powered off", sdev.name));
    }
    if !ws.is_powered(dst) {
        return Err(format!("{} is powered off", ddev.name));
    }

    let src_ip = addr_of(&sdev);
    let dst_ip = addr_of(&ddev);

    // With addresses, the control plane decides: source → next hop → … →
    // destination, then each leg becomes an L2 path. Without addresses the
    // packet is a bare L2 walk, which is what an unaddressed lab looks like.
    let path = match (src_ip, dst_ip) {
        (Some(_), Some(dip)) => routed_path(ws, &sdev, &ddev, dip)?,
        _ => match usable_path(ws, src, dst) {
            Some(p) => p,
            None => return Err(blocked_reason(ws, src, dst)),
        },
    };

    let mut packet = match (src_ip, dst_ip) {
        (Some(sip), Some(dip)) => Packet::echo_request(sip, dip, 0x0a01, 1),
        _ => Packet::echo_request(0, 0, 0x0a01, 1),
    };

    let mut hops: Vec<Hop> = Vec::new();
    let last = path.len() - 1;
    // The frame's source MAC is whoever put it on this L2 segment: the host at
    // first, then each router that re-encapsulates.
    let mut cur_src = Mac::for_device(src);
    // 802.1Q state: `None` until a switch access port pins the frame to a VLAN.
    let mut vlan: Option<u16> = None;

    for (i, dev_id) in path.iter().enumerate() {
        let dev = find(ws, dev_id)?.clone();
        let ingress = if i == 0 {
            None
        } else {
            link_between(ws, &path[i - 1], dev_id).map(|l| port_on(&dev, if l.a == *dev_id { &l.a_port } else { &l.b_port }))
        };
        let egress = if i == last {
            None
        } else {
            link_between(ws, dev_id, &path[i + 1])
                .map(|l| port_on(&dev, if l.a == *dev_id { &l.a_port } else { &l.b_port }))
        };

        // Every L2 boundary is a new Ethernet header: the next L3 device along
        // the path is the destination of this frame.
        let next_l3 = next_l3_id(ws, &path, i, dst);
        let src_mac = cur_src;
        let dst_mac = Mac::for_device(&next_l3);

        let mut note = String::new();

        match dev.kind.as_str() {
            "router" | "asa" => {
                let proto = match packet.proto {
                    crate::net::packet::IpProto::Icmp => "icmp",
                    crate::net::packet::IpProto::Tcp => "tcp",
                    crate::net::packet::IpProto::Udp => "udp",
                };
                if ws.ips_drops(dev_id, proto) {
                    return Err(format!("IPS dropped {proto} at {}", dev.name));
                }
                if dev.kind == "asa" {
                    if proto == "icmp" && ws.inspection_on(dev_id) {
                        let in_side = ingress
                            .as_ref()
                            .and_then(|p| ws.nat_role(dev_id, p));
                        let out_side = egress
                            .as_ref()
                            .and_then(|p| ws.nat_role(dev_id, p));
                        if in_side == Some(false) && out_side == Some(true) {
                            return Err(format!(
                                "inspection denied icmp entering {} from outside",
                                dev.name
                            ));
                        }
                    }
                }
                if let Some(p) = ingress.as_ref() {
                    if !ws.acl_allows(dev_id, p, true, packet.src, packet.dst) {
                        return Err(format!("ACL denied on {} {}", dev.name, p));
                    }
                }
                if let Some(p) = egress.as_ref() {
                    if !ws.acl_allows(dev_id, p, false, packet.src, packet.dst) {
                        return Err(format!("ACL denied on {} {}", dev.name, p));
                    }
                }
                let mut nat_note: Option<String> = None;
                if let (Some(inp), Some(outp)) = (ingress.as_ref(), egress.as_ref()) {
                    if let Some(new_src) =
                        ws.nat_translate(dev_id, inp, outp, packet.src, packet.dst)
                    {
                        nat_note = Some(format!(
                            "NAT: {} -> {}",
                            ipv4_string(packet.src),
                            ipv4_string(new_src)
                        ));
                        packet.src = new_src;
                    }
                }
                if i > 0 && i < last {
                    match packet.transit() {
                        Transit::Forward(next) => {
                            note = format!("routed: TTL {} -> {}", packet.ttl, next.ttl);
                            packet = next;
                            cur_src = Mac::for_device(dev_id);
                            vlan = None; // routed boundary: untagged again
                        }
                        Transit::TimeExceeded(_) => {
                            return Err(format!(
                                "TTL expired at {} — destination unreachable",
                                dev.name
                            ));
                        }
                    }
                }
                if let Some(n) = nat_note {
                    note = if note.is_empty() { n } else { format!("{note}; {n}") };
                }
            }
            "switch" => {
                // An access port pins the frame to its VLAN; a trunk carries it
                // tagged, so only an access-to-access mismatch drops the frame.
                for port_name in [ingress.as_ref(), egress.as_ref()].into_iter().flatten() {
                    let Some(p) = dev.ports.iter().find(|p| &p.name == port_name) else {
                        continue;
                    };
                    if p.trunk {
                        continue;
                    }
                    match vlan {
                        None => vlan = Some(p.vlan),
                        Some(v) if v != p.vlan => {
                            return Err(format!(
                                "VLAN mismatch: {} {} is VLAN {}",
                                dev.name, p.name, p.vlan
                            ));
                        }
                        _ => {}
                    }
                }
                if let Some(p) = ingress.as_ref() {
                    if !ws.port_security_allowed(dev_id, p, &format!("{src_mac}")) {
                        return Err(format!(
                            "port-security violation on {} {}",
                            dev.name, p
                        ));
                    }
                }
                if let Some(idx) = ingress.as_ref().and_then(|p| port_index(&dev, p)) {
                    let now = ws.sim_time as f64 + i as f64 * 0.001;
                    let table = ws.tables.macs(dev_id);
                    table.learn(src_mac, idx, now);
                    match table.lookup(dst_mac, now) {
                        Some(e) if e.port != idx => {
                            note = format!("MAC table hit {} on port {}", dst_mac, e.port);
                        }
                        _ => note = format!("flooding (unknown {})", dst_mac),
                    }
                }
            }
            "hub" => note = "repeated to every port".into(),
            _ => {}
        }

        hops.push(Hop {
            id: dev_id.clone(),
            name: dev.name.clone(),
            ingress,
            egress,
            t: 0.0,
            ttl: packet.ttl,
            src_mac,
            dst_mac,
            note,
        });
    }

    // The scheduler owns time: one arrival per device, 1 ms apart. `finished_at`
    // is when the last device saw the frame.
    let mut scheduler = crate::net::sched::Scheduler::new();
    let times = scheduler.schedule(ws.sim_time as f64, &path);
    for (hop, t) in hops.iter_mut().zip(times.iter()) {
        hop.t = *t;
    }
    let finished_at = times.last().copied().unwrap_or(ws.sim_time as f64);

    // ARP: the first frame to a neighbour needs its MAC, which the cache
    // answers after the exchange. Routed traffic resolves the gateway instead.
    if let (Some(sip), Some(dip)) = (src_ip, dst_ip) {
        let now = ws.sim_time as f64;
        if same_subnet(sdev.prefix, sip, ddev.prefix, dip) {
            ws.tables.arps(src).insert(dip, Mac::for_device(dst), now);
            if let Some(h) = hops.get_mut(1) {
                if h.note.is_empty() {
                    h.note = format!("ARP: {} is at {}", ipv4_string(dip), Mac::for_device(dst));
                }
            }
        } else if let Some(gw) = sdev.gateway {
            let gw_id = ws.router_with_addr(gw).map(|d| d.id.clone());
            if let Some(gw_id) = gw_id {
                ws.tables.arps(src).insert(gw, Mac::for_device(&gw_id), now);
            }
        }
    }

    // The frame as it arrives: last segment's header, final TTL in the packet.
    let (last_src, last_dst) = match hops.last() {
        Some(h) => (h.src_mac, h.dst_mac),
        None => (cur_src, Mac::BROADCAST),
    };
    let frame = Frame::ipv4(last_dst, last_src, packet);
    let time = 0.001 * hops.len() as f32;

    Ok(Delivery {
        path,
        hops,
        frame,
        time,
        finished_at,
    })
}

fn find<'a>(ws: &'a Workspace, id: &str) -> Result<&'a Device, String> {
    ws.devices
        .iter()
        .find(|d| d.id == id)
        .ok_or_else(|| format!("unknown device {id}"))
}

/// Shortest path whose every interface is administratively up.
fn usable_path(ws: &Workspace, src: &str, dst: &str) -> Option<Vec<String>> {
    bfs(ws, src, dst, true)
}

/// Shortest data path ignoring interface state, used only to explain a failure.
fn any_path(ws: &Workspace, src: &str, dst: &str) -> Option<Vec<String>> {
    bfs(ws, src, dst, false)
}

fn bfs(ws: &Workspace, src: &str, dst: &str, require_up: bool) -> Option<Vec<String>> {
    let mut adj: Vec<(&str, &str, &str, &str)> = Vec::new();
    for l in &ws.links {
        if !l.carries_data() {
            continue;
        }
        adj.push((&l.a, &l.a_port, &l.b, &l.b_port));
    }
    // Ports the spanning tree puts in blocking state never forward traffic.
    let blocked = if require_up {
        ws.stp_blocked_ports()
    } else {
        Vec::new()
    };
    let mut q: VecDeque<Vec<String>> = VecDeque::new();
    let mut seen: Vec<String> = vec![src.to_string()];
    q.push_back(vec![src.to_string()]);
    while let Some(path) = q.pop_front() {
        let last = path.last()?.clone();
        if last == dst {
            return Some(path);
        }
        if path.len() > 64 {
            continue;
        }
        for (a, a_port, b, b_port) in &adj {
            let (next, from_port, to_port) = if *a == last {
                (*b, *a_port, *b_port)
            } else if *b == last {
                (*a, *b_port, *a_port)
            } else {
                continue;
            };
            if seen.iter().any(|s| s == next) {
                continue;
            }
            if require_up {
                let Some(cur) = ws.devices.iter().find(|d| d.id == last) else {
                    continue;
                };
                let Some(dev) = ws.devices.iter().find(|d| d.id == next) else {
                    continue;
                };
                // A cable is only usable when both ends are administratively up.
                if !port_is_up(cur, from_port) || !port_is_up(dev, to_port) {
                    continue;
                }
                let from_full = port_on(cur, from_port);
                let to_full = port_on(dev, to_port);
                if blocked
                    .iter()
                    .any(|(d, p)| *d == last && *p == from_full)
                {
                    continue;
                }
                if blocked
                    .iter()
                    .any(|(d, p)| *d == *next && *p == to_full)
                {
                    continue;
                }
            }
            seen.push(next.to_string());
            let mut p = path.clone();
            p.push(next.to_string());
            q.push_back(p);
        }
    }
    None
}

/// Why no path exists, naming the first down interface on the link-only path.
fn blocked_reason(ws: &Workspace, src: &str, dst: &str) -> String {
    let Some(path) = any_path(ws, src, dst) else {
        return "no path: devices are not connected".into();
    };
    for pair in path.windows(2) {
        let (a, b) = (&pair[0], &pair[1]);
        let Some(link) = link_between(ws, a, b) else {
            continue;
        };
        for (id, name) in [(&link.a, &link.a_port), (&link.b, &link.b_port)] {
            let Some(dev) = ws.devices.iter().find(|d| d.id == *id) else {
                continue;
            };
            if !port_is_up(dev, name) {
                return format!(
                    "{} {} is administratively down — bring it up with `no shutdown`",
                    dev.name,
                    port_on(dev, name)
                );
            }
        }
    }
    if let Some((dev_id, port)) = ws.stp_blocked_ports().first() {
        let name = ws
            .devices
            .iter()
            .find(|d| d.id == *dev_id)
            .map(|d| d.name.clone())
            .unwrap_or_else(|| dev_id.clone());
        return format!("spanning tree is blocking {name} {port} — remove the redundant link");
    }
    "no path: devices are not connected".into()
}

fn link_between<'a>(ws: &'a Workspace, a: &str, b: &str) -> Option<&'a Link> {
    ws.links
        .iter()
        .find(|l| (l.a == a && l.b == b) || (l.a == b && l.b == a))
}

fn port_on(dev: &Device, raw: &str) -> String {
    let names: Vec<String> = dev.ports.iter().map(|p| p.name.clone()).collect();
    expand_iface(raw, &names).unwrap_or_else(|| raw.to_string())
}

fn port_index(dev: &Device, resolved: &str) -> Option<usize> {
    dev.ports.iter().position(|p| p.name == resolved)
}

fn port_is_up(dev: &Device, raw: &str) -> bool {
    let name = port_on(dev, raw);
    match dev.ports.iter().find(|p| p.name == name) {
        Some(p) => p.up,
        // A port the model does not enumerate (single-port hosts) is up when
        // the device itself is addressed.
        None => true,
    }
}

fn addr_of(d: &Device) -> Option<u32> {
    d.ip.or_else(|| d.ports.iter().find_map(|p| p.ip))
}

fn same_subnet(ap: u8, a: u32, bp: u8, b: u32) -> bool {
    use crate::model::contains;
    contains(a, b, ap) && contains(b, a, bp)
}

/// The next device after `i` that terminates an L2 domain.
fn next_l3_id(ws: &Workspace, path: &[String], i: usize, dst: &str) -> String {
    for id in path.iter().skip(i + 1) {
        if id == dst {
            return dst.to_string();
        }
        if let Some(d) = ws.devices.iter().find(|d| d.id == *id) {
            if d.kind != "switch" && d.kind != "hub" {
                return d.id.clone();
            }
        }
    }
    dst.to_string()
}

/// What a device does with a packet for `dst`.
enum NextHop {
    /// The destination is on a directly connected network (or on-link).
    Direct,
    /// Hand it to this address.
    Via(u32),
    /// No route; the message is the IOS-style refusal.
    NoRoute(String),
}

/// Longest-prefix lookup over connected networks and static routes.
fn next_hop(ws: &Workspace, dev: &Device, dst: u32) -> NextHop {
    use crate::model::{contains, ipv4_string};

    if matches!(dev.kind.as_str(), "router" | "asa") {
        let mut best: Option<(u8, NextHop)> = None;
        for p in &dev.ports {
            if let Some(ip) = p.ip {
                if contains(dst, ip, p.prefix) && best.as_ref().map(|(l, _)| p.prefix > *l).unwrap_or(true) {
                    best = Some((p.prefix, NextHop::Direct));
                }
            }
        }
        for (net, prefix, via) in &dev.routes {
            if contains(dst, *net, *prefix) && best.as_ref().map(|(l, _)| *prefix > *l).unwrap_or(true) {
                best = Some((*prefix, NextHop::Via(*via)));
            }
        }
        if let Some(list) = ws.dyn_routes.get(&dev.id) {
            for (net, prefix, via, _, _) in list {
                if contains(dst, *net, *prefix)
                    && best.as_ref().map(|(l, _)| *prefix > *l).unwrap_or(true)
                {
                    best = Some((*prefix, NextHop::Via(*via)));
                }
            }
        }
        return match best {
            Some((_, nh)) => nh,
            None => NextHop::NoRoute(format!(
                "no route to {}: {} has no route to that network",
                ipv4_string(dst),
                dev.name
            )),
        };
    }

    let own = addr_of(dev);
    if let Some(ip) = own {
        if contains(dst, ip, dev.prefix) {
            return NextHop::Direct;
        }
    }
    match dev.gateway {
        Some(gw) => NextHop::Via(gw),
        None => NextHop::NoRoute(format!(
            "no route to {}: {} has no default gateway",
            ipv4_string(dst),
            dev.name
        )),
    }
}

/// Control-plane walk: follow next hops until the destination, then stitch the
/// L2 legs into the device path the packet actually traverses.
fn routed_path(
    ws: &Workspace,
    sdev: &Device,
    ddev: &Device,
    dst_ip: u32,
) -> Result<Vec<String>, String> {
    use crate::model::ipv4_string;

    let mut chain: Vec<String> = vec![sdev.id.clone()];
    let mut current = sdev.clone();
    for _ in 0..16 {
        let next = match next_hop(ws, &current, dst_ip) {
            NextHop::Direct => {
                chain.push(ddev.id.clone());
                break;
            }
            NextHop::Via(ip) => ip,
            NextHop::NoRoute(msg) => return Err(msg),
        };

        let peer = ws
            .devices
            .iter()
            .find(|d| {
                d.ports.iter().any(|p| p.ip == Some(next)) || d.ip == Some(next)
            })
            .cloned()
            .ok_or_else(|| {
                format!(
                    "no route to {}: gateway {} is not a configured router interface",
                    ipv4_string(dst_ip),
                    ipv4_string(next)
                )
            })?;
        if chain.iter().any(|id| *id == peer.id) {
            return Err(format!("routing loop at {}", peer.name));
        }
        let from = chain.last().cloned().unwrap_or_default();
        if usable_path(ws, &from, &peer.id).is_none() {
            return Err(blocked_reason(ws, &from, &peer.id));
        }
        chain.push(peer.id.clone());
        current = peer;
    }
    if chain.last().map(|id| id != &ddev.id).unwrap_or(true) {
        return Err(format!(
            "no route to {}: routing loop or hop limit exceeded",
            ipv4_string(dst_ip)
        ));
    }

    let mut path = vec![chain[0].clone()];
    for pair in chain.windows(2) {
        let leg = usable_path(ws, &pair[0], &pair[1])
            .ok_or_else(|| blocked_reason(ws, &pair[0], &pair[1]))?;
        for id in leg.into_iter().skip(1) {
            if path.last() != Some(&id) {
                path.push(id);
            }
        }
    }
    Ok(path)
}
