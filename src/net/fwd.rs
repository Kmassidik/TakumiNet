//! Frame-level delivery: the part that makes a "ping" a real packet.
//!
//! A walk starts at the source host, crosses L2 segments whose switches learn
//! MAC addresses, is re-encapsulated by each router with a decremented TTL, and
//! ends at the destination. Interfaces that are administratively down break the
//! path, exactly as they do on the wire.

use std::collections::VecDeque;

use crate::cli::expand_iface;
use crate::model::ipv4_string;
use crate::net::packet::{Frame, IpProto, Mac, Packet, Payload, Transit};
use crate::workspace::{Device, Layer, Workspace};

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
    /// IPv4 header after this device's forwarding decisions (including NAT).
    pub src_ip: u32,
    pub dst_ip: u32,
    /// Decoded from the packet at this point, after NAT and TTL forwarding.
    pub layers: Vec<Layer>,
    /// Human-readable reason: learning, flooding, routing, ARP.
    pub note: String,
}

#[derive(Clone, Debug)]
pub struct ArpEvent {
    pub src: String,
    pub dst: String,
    pub path: Vec<String>,
    pub hops: Vec<Hop>,
    pub bytes: Vec<u8>,
    pub note: String,
    pub finished_at: f64,
}

#[derive(Clone, Debug)]
pub struct ArpExchange {
    pub request: ArpEvent,
    pub reply: ArpEvent,
}

#[derive(Clone, Debug)]
pub struct Delivery {
    pub path: Vec<String>,
    pub hops: Vec<Hop>,
    pub frame: Frame,
    pub arp: Option<ArpExchange>,
    /// One-way time in seconds, PT's 1 ms per hop tick.
    pub time: f32,
    /// Absolute simulated time of the last arrival.
    pub finished_at: f64,
}

/// An unsuccessful delivery retains every device hop captured before the drop.
#[derive(Clone, Debug)]
pub struct DeliveryError {
    pub reason: String,
    pub path: Vec<String>,
    pub hops: Vec<Hop>,
    pub frame: Option<Frame>,
    pub arp: Option<ArpExchange>,
    pub size: usize,
    pub finished_at: f64,
}

#[derive(Default)]
struct Capture {
    path: Vec<String>,
    hops: Vec<Hop>,
    frame: Option<Frame>,
    arp: Option<ArpExchange>,
    size: usize,
}

#[derive(Clone, Debug)]
struct DataPath {
    devices: Vec<String>,
    /// Exact cable indices, including the selected member of an EtherChannel.
    links: Vec<usize>,
}

/// Deliver one ICMP echo request from `src` to `dst`.
pub fn deliver(ws: &mut Workspace, src: &str, dst: &str) -> Result<Delivery, DeliveryError> {
    deliver_with(ws, src, dst, |sip, dip| Packet::echo_request(sip, dip, 0x0a01, 1))
}

/// Deliver one actual TCP segment carrying an HTTP GET.
pub fn deliver_http(
    ws: &mut Workspace,
    src: &str,
    dst: &str,
    host: &str,
) -> Result<Delivery, DeliveryError> {
    deliver_with(ws, src, dst, |sip, dip| Packet::http_request(sip, dip, host))
}

fn deliver_with<F>(
    ws: &mut Workspace,
    src: &str,
    dst: &str,
    make_packet: F,
) -> Result<Delivery, DeliveryError>
where
    F: FnOnce(u32, u32) -> Packet,
{
    let started_at = ws.sim_time as f64;
    let mut capture = Capture::default();
    deliver_inner(ws, src, dst, &mut capture, make_packet).map_err(|reason| DeliveryError {
        reason,
        path: capture.path,
        size: capture.size,
        finished_at: capture.arp.as_ref().map_or(started_at, |arp| arp.reply.finished_at)
            + capture.hops.len() as f64 * 0.001,
        hops: capture.hops,
        frame: capture.frame,
        arp: capture.arp,
    })
}

fn deliver_inner<F>(
    ws: &mut Workspace,
    src: &str,
    dst: &str,
    capture: &mut Capture,
    make_packet: F,
) -> Result<Delivery, String>
where
    F: FnOnce(u32, u32) -> Packet,
{
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
    let data_path = match (src_ip, dst_ip) {
        (Some(_), Some(dip)) => routed_path(ws, &sdev, &ddev, dip)?,
        _ => match usable_path(ws, src, dst) {
            Some(p) => p,
            None => return Err(blocked_reason(ws, src, dst)),
        },
    };
    if let (Some(sip), Some(dip)) = (src_ip, dst_ip) {
        capture.arp = resolve_arp(ws, &sdev, dst, dip, sip, &data_path);
    }
    let data_started_at = capture
        .arp
        .as_ref()
        .map_or(ws.sim_time as f64, |arp| arp.reply.finished_at);
    capture.path = data_path.devices;
    let path = &capture.path;

    let (sip, dip) = match (src_ip, dst_ip) {
        (Some(sip), Some(dip)) => (sip, dip),
        _ => (0, 0),
    };
    let mut packet = make_packet(sip, dip);

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
            let l = &ws.links[data_path.links[i - 1]];
            Some(port_on(&dev, if l.a == *dev_id { &l.a_port } else { &l.b_port }))
        };
        let egress = if i == last {
            None
        } else {
            let l = &ws.links[data_path.links[i]];
            Some(port_on(&dev, if l.a == *dev_id { &l.a_port } else { &l.b_port }))
        };

        // Every L2 boundary is a new Ethernet header: the next L3 device along
        // the path is the destination of this frame.
        let next_l3 = next_l3_id(ws, &path, i, dst);
        let src_mac = cur_src;
        let dst_mac = Mac::for_device(&next_l3);
        capture.size = 14 + 20 + packet.payload_len();
        capture.frame = Some(Frame::ipv4(dst_mac, src_mac, packet.clone()));

        let mut note = String::new();

        macro_rules! drop_here {
            ($reason:expr) => {{
                let reason = $reason;
                capture.hops.push(Hop {
                    id: dev_id.clone(),
                    name: dev.name.clone(),
                    ingress: ingress.clone(),
                    egress: egress.clone(),
                    t: ws.sim_time as f64 + capture.hops.len() as f64 * 0.001,
                    ttl: packet.ttl,
                    src_mac,
                    dst_mac,
                    src_ip: packet.src,
                    dst_ip: packet.dst,
                    layers: decode_layers(src_mac, dst_mac, &packet),
                    note: reason.clone(),
                });
                return Err(reason);
            }};
        }

        match dev.kind.as_str() {
            "router" | "asa" => {
                if let Some(expected) = ingress.as_ref().and_then(|name| {
                    dev.ports.iter().find(|p| &p.name == name).and_then(|p| p.dot1q)
                }) {
                    match vlan {
                        None => vlan = Some(expected),
                        Some(actual) if actual != expected => {
                            drop_here!(format!(
                                "802.1Q VLAN mismatch: {} {} expects VLAN {}",
                                dev.name, ingress.as_ref().unwrap(), expected
                            ));
                        }
                        _ => {}
                    }
                }
                let proto = match packet.proto {
                    crate::net::packet::IpProto::Icmp => "icmp",
                    crate::net::packet::IpProto::Tcp => "tcp",
                    crate::net::packet::IpProto::Udp => "udp",
                };
                if ws.ips_drops(dev_id, proto) {
                    drop_here!(format!("IPS dropped {proto} at {}", dev.name));
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
                            drop_here!(format!(
                                "inspection denied icmp entering {} from outside",
                                dev.name
                            ));
                        }
                    }
                }
                if let Some(p) = ingress.as_ref() {
                    if !ws.acl_allows(dev_id, p, true, packet.src, packet.dst) {
                        drop_here!(format!("ACL denied on {} {}", dev.name, p));
                    }
                }
                if let Some(p) = egress.as_ref() {
                    if !ws.acl_allows(dev_id, p, false, packet.src, packet.dst) {
                        drop_here!(format!("ACL denied on {} {}", dev.name, p));
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
                            note = format!(
                                "{} decrements TTL {} to {} and forwards",
                                dev.name, packet.ttl, next.ttl
                            );
                            packet = next;
                            cur_src = Mac::for_device(dev_id);
                            vlan = None; // the egress interface selects the next L2 VLAN
                        }
                        Transit::TimeExceeded(_) => {
                            drop_here!(format!(
                                "TTL expired at {} — destination unreachable",
                                dev.name
                            ));
                        }
                    }
                }
                if let Some(tag) = egress.as_ref().and_then(|name| {
                    dev.ports.iter().find(|p| &p.name == name).and_then(|p| p.dot1q)
                }) {
                    vlan = Some(tag);
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
                            drop_here!(format!(
                                "VLAN mismatch: {} {} is VLAN {}",
                                dev.name, p.name, p.vlan
                            ));
                        }
                        _ => {}
                    }
                }
                if let Some(p) = ingress.as_ref() {
                    if !ws.port_security_allowed(dev_id, p, &format!("{src_mac}")) {
                        drop_here!(format!(
                            "port-security violation on {} {}",
                            dev.name, p
                        ));
                    }
                }
                if let Some((idx, ingress_name)) = ingress
                    .as_ref()
                    .and_then(|p| port_index(&dev, p).map(|idx| (idx, p)))
                {
                    let now = data_started_at + i as f64 * 0.001;
                    let learning = format!(
                        "{} learns source MAC {} on {}",
                        dev.name, src_mac, ingress_name
                    );
                    let table = ws.tables.macs(dev_id);
                    table.learn(src_mac, idx, now);
                    note = match table.lookup(dst_mac, now) {
                        Some(e) if e.port != idx => format!(
                            "{learning}; MAC table hit {} on port {}, so it forwards there",
                            dst_mac, e.port
                        ),
                        Some(e) => format!(
                            "{learning}; destination {} is already on the ingress port {}, so it does not flood",
                            dst_mac, e.port
                        ),
                        None => format!(
                            "{learning}; destination MAC {} is unknown, so it floods the frame",
                            dst_mac
                        ),
                    };
                }
            }
            "hub" => note = "repeated to every port".into(),
            _ => {}
        }

        capture.hops.push(Hop {
            id: dev_id.clone(),
            name: dev.name.clone(),
            ingress,
            egress,
            t: 0.0,
            ttl: packet.ttl,
            src_mac,
            dst_mac,
            src_ip: packet.src,
            dst_ip: packet.dst,
            layers: decode_layers(src_mac, dst_mac, &packet),
            note,
        });
    }

    // The scheduler owns time: one arrival per device, 1 ms apart. `finished_at`
    // is when the last device saw the frame.
    let mut scheduler = crate::net::sched::Scheduler::new();
    let times = scheduler.schedule(data_started_at, &path);
    for (hop, t) in capture.hops.iter_mut().zip(times.iter()) {
        hop.t = *t;
    }
    let finished_at = times.last().copied().unwrap_or(data_started_at);

    // The frame as it arrives: last segment's header, final TTL in the packet.
    let (last_src, last_dst) = match capture.hops.last() {
        Some(h) => (h.src_mac, h.dst_mac),
        None => (cur_src, Mac::BROADCAST),
    };
    let frame = Frame::ipv4(last_dst, last_src, packet);
    let time = 0.001 * capture.hops.len() as f32;

    Ok(Delivery {
        path: std::mem::take(&mut capture.path),
        hops: std::mem::take(&mut capture.hops),
        frame,
        arp: capture.arp.take(),
        time,
        finished_at,
    })
}

fn resolve_arp(
    ws: &mut Workspace,
    source: &Device,
    dst: &str,
    dst_ip: u32,
    src_ip: u32,
    data_path: &DataPath,
) -> Option<ArpExchange> {
    let target_ip = match next_hop(ws, source, dst_ip) {
        NextHop::Direct(_) => dst_ip,
        NextHop::Via(ip, _) => ip,
        NextHop::NoRoute(_) => return None,
    };
    let now = ws.sim_time as f64;
    if ws.tables.arps(&source.id).lookup(target_ip, now).is_some() {
        return None;
    }

    let target_idx = data_path.devices.iter().enumerate().skip(1).find_map(|(idx, id)| {
        let is_target = id == dst
            || ws.devices.iter().find(|dev| &dev.id == id).is_some_and(|dev| {
                dev.kind != "switch" && dev.kind != "hub"
            });
        is_target.then_some(idx)
    })?;
    let target_id = data_path.devices[target_idx].clone();
    let target = find(ws, &target_id).ok()?.clone();
    let request_path = DataPath {
        devices: data_path.devices[..=target_idx].to_vec(),
        links: data_path.links[..target_idx].to_vec(),
    };
    let reply_path = DataPath {
        devices: request_path.devices.iter().rev().cloned().collect(),
        links: request_path.links.iter().rev().copied().collect(),
    };

    let source_mac = Mac::for_device(&source.id);
    let target_mac = Mac::for_device(&target.id);
    let request_note = format!(
        "{} has no ARP entry for {}, so it asks first",
        source.name,
        ipv4_string(target_ip)
    );
    let request = arp_event(
        ws,
        source,
        &target,
        src_ip,
        target_ip,
        &request_path,
        true,
        request_note,
        now,
    );
    let reply_note = format!(
        "{} answers {}: {} is at {}",
        target.name,
        source.name,
        ipv4_string(target_ip),
        target_mac
    );
    let reply = arp_event(
        ws,
        &target,
        source,
        target_ip,
        src_ip,
        &reply_path,
        false,
        reply_note,
        request.finished_at,
    );

    // Both ends learn from the exchange, just as real ARP implementations do.
    ws.tables.arps(&source.id).insert(target_ip, target_mac, now);
    ws.tables.arps(&target.id).insert(src_ip, source_mac, now);
    Some(ArpExchange { request, reply })
}

#[allow(clippy::too_many_arguments)]
fn arp_event(
    ws: &mut Workspace,
    sender: &Device,
    target: &Device,
    sender_ip: u32,
    target_ip: u32,
    path: &DataPath,
    request: bool,
    note: String,
    started_at: f64,
) -> ArpEvent {
    let src_mac = Mac::for_device(&sender.id);
    let dst_mac = if request { Mac::BROADCAST } else { Mac::for_device(&target.id) };
    let bytes = arp_frame(request, src_mac, dst_mac, sender_ip, target_ip);
    let layers = arp_layers(request, src_mac, dst_mac, sender_ip, target_ip);
    let last = path.devices.len() - 1;
    let mut hops = Vec::with_capacity(path.devices.len());

    for (i, dev_id) in path.devices.iter().enumerate() {
        let dev = find(ws, dev_id).cloned().unwrap_or_else(|_| sender.clone());
        let ingress = if i == 0 {
            None
        } else {
            let link = &ws.links[path.links[i - 1]];
            Some(port_on(&dev, if link.a == *dev_id { &link.a_port } else { &link.b_port }))
        };
        let egress = if i == last {
            None
        } else {
            let link = &ws.links[path.links[i]];
            Some(port_on(&dev, if link.a == *dev_id { &link.a_port } else { &link.b_port }))
        };
        let mut hop_note = if i == 0 {
            note.clone()
        } else if i == last {
            if request {
                format!("{} receives the ARP request for {}", dev.name, ipv4_string(target_ip))
            } else {
                format!(
                    "{} learns that {} is at {} from the ARP reply",
                    dev.name,
                    ipv4_string(sender_ip),
                    src_mac
                )
            }
        } else {
            String::new()
        };

        match dev.kind.as_str() {
            "switch" => {
                if let Some((idx, ingress_name)) = ingress
                    .as_ref()
                    .and_then(|port| port_index(&dev, port).map(|idx| (idx, port)))
                {
                    let now = started_at + i as f64 * 0.001;
                    let table = ws.tables.macs(dev_id);
                    table.learn(src_mac, idx, now);
                    let forwarding = if dst_mac.is_broadcast() {
                        "the destination is broadcast, so it floods the ARP request".to_string()
                    } else {
                        match table.lookup(dst_mac, now) {
                            Some(entry) if entry.port != idx => format!(
                                "its MAC table has {} on port {}, so it forwards the ARP reply there",
                                dst_mac, entry.port
                            ),
                            _ => "the destination is unknown, so it floods the ARP reply".to_string(),
                        }
                    };
                    hop_note = format!(
                        "{} learns source MAC {} on {}; {}",
                        dev.name, src_mac, ingress_name, forwarding
                    );
                }
            }
            "hub" => {
                hop_note = format!("{} repeats the ARP frame to every other port", dev.name);
            }
            _ => {}
        }

        hops.push(Hop {
            id: dev_id.clone(),
            name: dev.name,
            ingress,
            egress,
            t: 0.0,
            ttl: 0,
            src_mac,
            dst_mac,
            src_ip: sender_ip,
            dst_ip: target_ip,
            layers: layers.clone(),
            note: hop_note,
        });
    }

    let mut scheduler = crate::net::sched::Scheduler::new();
    let times = scheduler.schedule(started_at, &path.devices);
    for (hop, time) in hops.iter_mut().zip(times.iter()) {
        hop.t = *time;
    }
    let finished_at = times.last().copied().unwrap_or(started_at);
    ArpEvent {
        src: sender.id.clone(),
        dst: target.id.clone(),
        path: path.devices.clone(),
        hops,
        bytes,
        note,
        finished_at,
    }
}

fn arp_frame(request: bool, src: Mac, dst: Mac, sender_ip: u32, target_ip: u32) -> Vec<u8> {
    let mut bytes = Vec::with_capacity(42);
    bytes.extend(dst.0);
    bytes.extend(src.0);
    bytes.extend(0x0806u16.to_be_bytes());
    bytes.extend(1u16.to_be_bytes()); // Ethernet hardware type
    bytes.extend(0x0800u16.to_be_bytes()); // IPv4 protocol type
    bytes.extend([6, 4]);
    bytes.extend((if request { 1u16 } else { 2u16 }).to_be_bytes());
    bytes.extend(src.0);
    bytes.extend(sender_ip.to_be_bytes());
    bytes.extend(if request { [0; 6] } else { dst.0 });
    bytes.extend(target_ip.to_be_bytes());
    bytes
}

fn arp_layers(request: bool, src: Mac, dst: Mac, sender_ip: u32, target_ip: u32) -> Vec<Layer> {
    vec![
        Layer::new(
            "Ethernet II",
            vec![
                ("Destination".into(), dst.to_string()),
                ("Source".into(), src.to_string()),
                ("EtherType".into(), "ARP (0x0806)".into()),
            ],
        ),
        Layer::new(
            "ARP",
            vec![
                ("Hardware Type".into(), "Ethernet (1)".into()),
                ("Protocol Type".into(), "IPv4 (0x0800)".into()),
                ("Opcode".into(), if request { "1 (Request)".into() } else { "2 (Reply)".into() }),
                ("Sender MAC".into(), src.to_string()),
                ("Sender IP".into(), ipv4_string(sender_ip)),
                (
                    "Target MAC".into(),
                    if request { Mac([0; 6]).to_string() } else { dst.to_string() },
                ),
                ("Target IP".into(), ipv4_string(target_ip)),
            ],
        ),
    ]
}

fn decode_layers(src_mac: Mac, dst_mac: Mac, packet: &Packet) -> Vec<Layer> {
    let (ip_proto, proto_number) = match packet.proto {
        IpProto::Icmp => ("ICMP", 1),
        IpProto::Tcp => ("TCP", 6),
        IpProto::Udp => ("UDP", 17),
    };
    let mut layers = vec![
        Layer::new(
            "Ethernet II",
            vec![
                ("Destination".into(), dst_mac.to_string()),
                ("Source".into(), src_mac.to_string()),
                ("EtherType".into(), "IPv4 (0x0800)".into()),
            ],
        ),
        Layer::new(
            "IPv4",
            vec![
                ("Source".into(), ipv4_string(packet.src)),
                ("Destination".into(), ipv4_string(packet.dst)),
                ("TTL".into(), packet.ttl.to_string()),
                ("Protocol".into(), format!("{ip_proto} ({proto_number})")),
            ],
        ),
    ];

    match (&packet.proto, &packet.payload) {
        (IpProto::Icmp, Payload::EchoRequest { id, seq }) => {
            layers.push(Layer::new(
                "ICMP",
                vec![
                    ("Type".into(), "8 (Echo Request)".into()),
                    ("Identifier".into(), id.to_string()),
                    ("Sequence".into(), seq.to_string()),
                    ("Data Bytes".into(), "32".into()),
                ],
            ));
        }
        (IpProto::Icmp, Payload::EchoReply { id, seq }) => {
            layers.push(Layer::new(
                "ICMP",
                vec![
                    ("Type".into(), "0 (Echo Reply)".into()),
                    ("Identifier".into(), id.to_string()),
                    ("Sequence".into(), seq.to_string()),
                    ("Data Bytes".into(), "32".into()),
                ],
            ));
        }
        (IpProto::Tcp, Payload::Bytes(bytes)) => {
            if bytes.len() >= 20 {
                let src_port = u16::from_be_bytes([bytes[0], bytes[1]]);
                let dst_port = u16::from_be_bytes([bytes[2], bytes[3]]);
                let offset = ((bytes[12] >> 4) as usize) * 4;
                layers.push(Layer::new(
                    "TCP",
                    vec![
                        ("Source Port".into(), src_port.to_string()),
                        ("Destination Port".into(), dst_port.to_string()),
                        (
                            "Sequence".into(),
                            u32::from_be_bytes([bytes[4], bytes[5], bytes[6], bytes[7]]).to_string(),
                        ),
                        ("Flags".into(), format!("0x{:02x}", bytes[13])),
                    ],
                ));
                if offset >= 20 && offset <= bytes.len() && (src_port == 80 || dst_port == 80) {
                    if let Ok(text) = std::str::from_utf8(&bytes[offset..]) {
                        let request = text.lines().next().unwrap_or("");
                        if request.starts_with("GET ") || request.starts_with("HTTP/") {
                            let mut fields = vec![("Request Line".into(), request.to_string())];
                            if let Some(host) = text.lines().find_map(|line| line.strip_prefix("Host: ")) {
                                fields.push(("Host".into(), host.trim().to_string()));
                            }
                            layers.push(Layer::new("HTTP", fields));
                        }
                    }
                }
            } else {
                layers.push(Layer::new("TCP", vec![("Captured Bytes".into(), bytes.len().to_string())]));
            }
        }
        (IpProto::Udp, Payload::Bytes(bytes)) => {
            if bytes.len() >= 8 {
                layers.push(Layer::new(
                    "UDP",
                    vec![
                        ("Source Port".into(), u16::from_be_bytes([bytes[0], bytes[1]]).to_string()),
                        ("Destination Port".into(), u16::from_be_bytes([bytes[2], bytes[3]]).to_string()),
                        ("Length".into(), u16::from_be_bytes([bytes[4], bytes[5]]).to_string()),
                    ],
                ));
            }
        }
        (_, Payload::Bytes(bytes)) => {
            layers.push(Layer::new(ip_proto, vec![("Captured Bytes".into(), bytes.len().to_string())]));
        }
        _ => {}
    }
    layers
}

fn find<'a>(ws: &'a Workspace, id: &str) -> Result<&'a Device, String> {
    ws.devices
        .iter()
        .find(|d| d.id == id)
        .ok_or_else(|| format!("unknown device {id}"))
}

/// Shortest path whose every interface is administratively up.
fn usable_path(ws: &Workspace, src: &str, dst: &str) -> Option<DataPath> {
    bfs(ws, src, dst, true, None)
}

fn usable_path_vlan(ws: &Workspace, src: &str, dst: &str, vlan: Option<u16>) -> Option<DataPath> {
    bfs(ws, src, dst, true, vlan)
}

/// Shortest data path ignoring interface state, used only to explain a failure.
fn any_path(ws: &Workspace, src: &str, dst: &str) -> Option<DataPath> {
    bfs(ws, src, dst, false, None)
}

fn bfs(ws: &Workspace, src: &str, dst: &str, require_up: bool, vlan: Option<u16>) -> Option<DataPath> {
    // Ports the spanning tree puts in blocking state never forward traffic.
    let blocked = if require_up { ws.stp_blocked_ports() } else { Vec::new() };
    let initial = DataPath { devices: vec![src.to_string()], links: Vec::new() };
    let mut q: VecDeque<(DataPath, Option<u16>)> = VecDeque::new();
    let mut seen: Vec<(String, Option<u16>)> = vec![(src.to_string(), vlan)];
    q.push_back((initial, vlan));
    while let Some((path, path_vlan)) = q.pop_front() {
        let last = path.devices.last()?.clone();
        if last == dst {
            return Some(path);
        }
        if path.devices.len() > 64 {
            continue;
        }
        for (link_idx, l) in ws.links.iter().enumerate() {
            if !l.carries_data() {
                continue;
            }
            let (next, from_port, to_port) = if l.a == last {
                (&l.b, &l.a_port, &l.b_port)
            } else if l.b == last {
                (&l.a, &l.b_port, &l.a_port)
            } else {
                continue;
            };
            let Some(cur) = ws.devices.iter().find(|d| d.id == last) else {
                continue;
            };
            let Some(dev) = ws.devices.iter().find(|d| d.id == *next) else {
                continue;
            };
            let mut next_vlan = path_vlan;
            if require_up {
                // A cable is only usable when both ends are administratively up.
                if !port_is_up(cur, from_port) || !port_is_up(dev, to_port) {
                    continue;
                }
                let from_full = port_on(cur, from_port);
                let to_full = port_on(dev, to_port);
                if blocked.iter().any(|(d, p)| *d == last && *p == from_full)
                    || blocked.iter().any(|(d, p)| d == next && *p == to_full)
                {
                    continue;
                }
                if cur.kind == "switch" && !switch_port_vlan(cur, from_port, &mut next_vlan) {
                    continue;
                }
                if dev.kind == "switch" && !switch_port_vlan(dev, to_port, &mut next_vlan) {
                    continue;
                }
            }
            if seen.iter().any(|(id, v)| id == next && *v == next_vlan) {
                continue;
            }
            seen.push((next.clone(), next_vlan));
            let mut p = path.clone();
            p.devices.push(next.clone());
            p.links.push(link_idx);
            q.push_back((p, next_vlan));
        }
    }
    None
}

/// Apply an access or native/802.1Q port to the frame's VLAN context.
fn switch_port_vlan(dev: &Device, raw: &str, vlan: &mut Option<u16>) -> bool {
    let name = port_on(dev, raw);
    let Some(port) = dev.ports.iter().find(|p| p.name == name) else {
        return true;
    };
    let port_vlan = if port.trunk { 1 } else { port.vlan };
    match *vlan {
        None => {
            *vlan = Some(port_vlan);
            true
        }
        Some(current) if port.trunk => current > 0,
        Some(current) => current == port_vlan,
    }
}

/// Why no path exists, naming the first down interface on the link-only path.
fn blocked_reason(ws: &Workspace, src: &str, dst: &str) -> String {
    let Some(path) = any_path(ws, src, dst) else {
        return "no path: devices are not connected".into();
    };
    for (idx, _) in path.devices.windows(2).enumerate() {
        let link = &ws.links[path.links[idx]];
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
    let mut vlan = None;
    for (i, id) in path.devices.iter().enumerate() {
        let Some(dev) = ws.devices.iter().find(|d| &d.id == id) else {
            continue;
        };
        if dev.kind != "switch" {
            continue;
        }
        let ingress = (i > 0).then(|| &ws.links[path.links[i - 1]]);
        let egress = (i + 1 < path.devices.len()).then(|| &ws.links[path.links[i]]);
        for raw in [
            ingress.map(|l| if l.a == *id { &l.a_port } else { &l.b_port }),
            egress.map(|l| if l.a == *id { &l.a_port } else { &l.b_port }),
        ]
        .into_iter()
        .flatten()
        {
            if !switch_port_vlan(dev, raw, &mut vlan) {
                let name = port_on(dev, raw);
                let access = dev.ports.iter().find(|p| p.name == name).map(|p| p.vlan).unwrap_or(1);
                return format!("VLAN mismatch: {} {name} is VLAN {access}", dev.name);
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

/// What a device does with a packet for `dst`, including the 802.1Q tag of
/// the directly connected interface used for the next L2 leg.
enum NextHop {
    Direct(Option<u16>),
    Via(u32, Option<u16>),
    NoRoute(String),
}

/// Longest-prefix/AD/metric lookup shared with `show ip route`.
fn next_hop(ws: &Workspace, dev: &Device, dst: u32) -> NextHop {
    use crate::model::{contains, ipv4_string};

    if matches!(dev.kind.as_str(), "router" | "asa") {
        return match ws.best_route(&dev.id, dst) {
            Some(route) => match route.next_hop {
                None => NextHop::Direct(route.dot1q),
                Some(via) => NextHop::Via(via, route.dot1q),
            },
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
            return NextHop::Direct(None);
        }
    }
    match dev.gateway {
        Some(gw) => NextHop::Via(gw, None),
        None => NextHop::NoRoute(format!(
            "no route to {}: {} has no default gateway",
            ipv4_string(dst),
            dev.name
        )),
    }
}

/// Control-plane walk: follow next hops until the destination, then stitch the
/// VLAN-constrained L2 legs into the exact device and cable path.
fn routed_path(
    ws: &Workspace,
    sdev: &Device,
    ddev: &Device,
    dst_ip: u32,
) -> Result<DataPath, String> {
    use crate::model::ipv4_string;

    let mut chain: Vec<String> = vec![sdev.id.clone()];
    let mut leg_vlans = Vec::new();
    let mut current = sdev.clone();
    loop {
        let (next, next_vlan) = match next_hop(ws, &current, dst_ip) {
            NextHop::Direct(vlan) => {
                chain.push(ddev.id.clone());
                leg_vlans.push(vlan);
                break;
            }
            NextHop::Via(ip, vlan) => (ip, vlan),
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
        let peer_tag = peer
            .ports
            .iter()
            .find(|p| p.ip == Some(next))
            .and_then(|p| p.dot1q);
        let vlan = next_vlan.or(peer_tag);
        let from = chain.last().cloned().unwrap_or_default();
        if usable_path_vlan(ws, &from, &peer.id, vlan).is_none() {
            return Err(blocked_reason(ws, &from, &peer.id));
        }
        leg_vlans.push(vlan);
        chain.push(peer.id.clone());
        current = peer;
    }
    if chain.last().map(|id| id != &ddev.id).unwrap_or(true) {
        return Err(format!(
            "no route to {}: routing loop or hop limit exceeded",
            ipv4_string(dst_ip)
        ));
    }

    let mut path = DataPath { devices: vec![chain[0].clone()], links: Vec::new() };
    for (idx, pair) in chain.windows(2).enumerate() {
        let leg = usable_path_vlan(ws, &pair[0], &pair[1], leg_vlans[idx])
            .ok_or_else(|| blocked_reason(ws, &pair[0], &pair[1]))?;
        for id in leg.devices.into_iter().skip(1) {
            if path.devices.last() != Some(&id) {
                path.devices.push(id);
            }
        }
        path.links.extend(leg.links);
    }
    Ok(path)
}
