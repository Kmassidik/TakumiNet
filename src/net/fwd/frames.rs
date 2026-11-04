use super::*;

pub(super) fn resolve_arp(
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
                !crate::model::l2_transparent(&dev.kind)
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
pub(super) fn arp_event(
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
            "patchpanel" => {
                hop_note = format!("{} passes the frame through, port to port", dev.name);
            }
            "sniffer" => {
                hop_note = format!("{} records the frame and passes it on", dev.name);
                let info = if request {
                    format!("ARP request: who has {}?", ipv4_string(target_ip))
                } else {
                    format!("ARP reply: {} is at {}", ipv4_string(sender_ip), src_mac)
                };
                ws.tables.sniff(dev_id, crate::workspace::SnifferRow {
                    t: started_at + i as f64 * 0.001,
                    src_mac: src_mac.to_string(),
                    dst_mac: dst_mac.to_string(),
                    ethertype: "0x0806".into(),
                    src_ip: ipv4_string(sender_ip),
                    dst_ip: ipv4_string(target_ip),
                    proto: "arp".into(),
                    length: bytes.len(),
                    info,
                });
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

pub(super) fn arp_frame(request: bool, src: Mac, dst: Mac, sender_ip: u32, target_ip: u32) -> Vec<u8> {
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

pub(super) fn arp_layers(request: bool, src: Mac, dst: Mac, sender_ip: u32, target_ip: u32) -> Vec<Layer> {
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

pub(super) fn decode_layers(src_mac: Mac, dst_mac: Mac, packet: &Packet) -> Vec<Layer> {
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

/// One line for the Capture app: what kind of traffic this packet carries.
fn packet_info(packet: &Packet) -> (&'static str, String) {
    match (&packet.proto, &packet.payload) {
        (IpProto::Icmp, Payload::EchoRequest { seq, .. }) => ("icmp", format!("Echo request, seq {seq}")),
        (IpProto::Icmp, Payload::EchoReply { seq, .. }) => ("icmp", format!("Echo reply, seq {seq}")),
        (IpProto::Icmp, _) => ("icmp", "ICMP message".into()),
        (IpProto::Tcp, Payload::Bytes(bytes)) if bytes.len() >= 4 => {
            let src = u16::from_be_bytes([bytes[0], bytes[1]]);
            let dst = u16::from_be_bytes([bytes[2], bytes[3]]);
            ("tcp", format!("TCP {src} to {dst}"))
        }
        (IpProto::Tcp, _) => ("tcp", "TCP segment".into()),
        (IpProto::Udp, Payload::Bytes(bytes)) if bytes.len() >= 4 => {
            let src = u16::from_be_bytes([bytes[0], bytes[1]]);
            let dst = u16::from_be_bytes([bytes[2], bytes[3]]);
            ("udp", format!("UDP {src} to {dst}"))
        }
        (IpProto::Udp, _) => ("udp", "UDP datagram".into()),
    }
}

/// Record one IPv4 frame crossing an in-path sniffer.
pub(super) fn sniff_packet(
    ws: &mut Workspace,
    dev_id: &str,
    t: f64,
    src_mac: Mac,
    dst_mac: Mac,
    packet: &Packet,
) {
    let (proto, info) = packet_info(packet);
    ws.tables.sniff(dev_id, crate::workspace::SnifferRow {
        t,
        src_mac: src_mac.to_string(),
        dst_mac: dst_mac.to_string(),
        ethertype: "0x0800".into(),
        src_ip: ipv4_string(packet.src),
        dst_ip: ipv4_string(packet.dst),
        proto: proto.into(),
        length: 14 + 20 + packet.payload_len(),
        info,
    });
}

/// A frame that arrives tagged on a trunk is received by the matching
/// subinterface, so that is where inbound lists and counters apply.
pub(super) fn tagged_port(dev: &crate::workspace::Device, physical: &str, vlan: Option<u16>) -> String {
    let Some(tag) = vlan else { return physical.to_string() };
    dev.ports
        .iter()
        .find(|p| p.dot1q == Some(tag) && p.name.strip_suffix(&format!(".{tag}")) == Some(physical))
        .map_or_else(|| physical.to_string(), |p| p.name.clone())
}

/// Why no path exists, naming the first down interface on the link-only path.
pub(super) fn blocked_reason(ws: &Workspace, src: &str, dst: &str) -> String {
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

/// True while live cabling (every port up) joins the two devices.
pub fn reachable(ws: &Workspace, src: &str, dst: &str) -> bool {
    usable_path(ws, src, dst).is_some()
}

pub(super) fn usable_path(ws: &Workspace, src: &str, dst: &str) -> Option<DataPath> {
    bfs(ws, src, dst, true, None)
}

pub(super) fn usable_path_vlan(ws: &Workspace, src: &str, dst: &str, vlan: Option<u16>) -> Option<DataPath> {
    bfs(ws, src, dst, true, vlan)
}

pub(super) fn any_path(ws: &Workspace, src: &str, dst: &str) -> Option<DataPath> {
    bfs(ws, src, dst, false, None)
}
