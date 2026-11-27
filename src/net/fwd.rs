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
pub(crate) struct DataPath {
    pub(crate) devices: Vec<String>,
    /// Exact cable indices, including the selected member of an EtherChannel.
    pub(crate) links: Vec<usize>,
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
        (Some(_), Some(dip)) => routed_path(ws, &sdev, &ddev, dip).map_err(|(reason, partial)| {
            // Keep the hops so far: the drop dies at the last reachable device.
            capture.path = partial;
            reason
        })?,
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
    // VXLAN state: when both ends sit in the same tenant network the routed
    // fabric tunnels the inner packet between the leaf VTEPs, and every hop
    // between them sees the outer headers, not the tenant packet.
    let encap = crate::net::vxlan::overlay_plan(ws, path, src, dst);
    // IPSec state: when the path crosses the internet between routers holding
    // an up site-to-site tunnel, the gateways encapsulate the private packet
    // in ESP, and every WAN hop sees the outer headers, not the private ones.
    let esp = crate::net::ipsec::tunnel_plan(ws, path, src, dst);

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
        let src_mac = cur_src;
        let dst_mac = mac::frame_mac(ws, &path, i, dip);
        capture.size = 14 + 20 + packet.payload_len();
        capture.frame = Some(Frame::ipv4(dst_mac, src_mac, packet.clone()));
        // A hop inside the tunnel captures the encapsulated frame: the size
        // and the recorded layers show the outer headers, not the tenant's.
        let tunneled = encap.as_ref().is_some_and(|e| e.ingress_idx < i && i < e.egress_idx);
        // Inside the ESP tunnel the capture shows the tunnel, not the payload.
        let esp_tunneled = esp.as_ref().is_some_and(|e| e.ingress_idx < i && i < e.egress_idx);
        if let Some(e) = encap.as_ref().filter(|_| tunneled) {
            capture.size = e.wire_size(&packet);
            // On the wire the frame points at the egress VTEP: the underlay
            // routes to the remote leaf, which strips the headers.
            capture.frame = Some(Frame::ipv4(Mac::for_device(&path[e.egress_idx]), src_mac, packet.clone()));
        }
        if let Some(e) = esp.as_ref().filter(|_| esp_tunneled) {
            capture.size = e.wire_size(&packet);
            // On the wire the frame points at the egress gateway: the internet
            // routes to the remote VPN box, which strips the tunnel.
            capture.frame = Some(Frame::ipv4(Mac::for_device(&path[e.egress_idx]), src_mac, packet.clone()));
        }

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
                    layers: if let Some(e) = esp.as_ref().filter(|_| esp_tunneled) {
                        crate::net::ipsec::decap_layers(src_mac, dst_mac, e, decode_layers(src_mac, dst_mac, &packet))
                    } else if let Some(e) = encap.as_ref().filter(|_| tunneled) {
                        crate::net::vxlan::decap_layers(src_mac, dst_mac, e, decode_layers(src_mac, dst_mac, &packet))
                    } else {
                        decode_layers(src_mac, dst_mac, &packet)
                    },
                    note: reason.clone(),
                });
                return Err(reason);
            }};
        }
        if i > 0 { if let Some(r) = ws.check_duplex_mismatch(&dev, ingress.as_deref().unwrap_or_default()) { drop_here!(r); } }
        match dev.kind.as_str() {
            k if crate::model::routes_packets(k) => {
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
                    let bound = tagged_port(&dev, p, vlan);
                    if !ws.acl_allows(dev_id, &bound, true, packet.src, packet.dst) {
                        drop_here!(format!("ACL denied on {} {}", dev.name, bound));
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
                    // The ingress VTEP wraps the tenant packet for the
                    // underlay; the egress VTEP strips the tunnel headers.
                    if let Some(e) = encap.as_ref() {
                        if i == e.ingress_idx {
                            note = format!(
                                "{} encapsulates for VXLAN VNI {} — outer {} → {} (UDP {}), then routes the underlay",
                                dev.name, e.vni, ipv4_string(e.vtep_src), ipv4_string(e.vtep_dst),
                                crate::net::vxlan::UDP_PORT
                            );
                        } else if i == e.egress_idx {
                            note = format!(
                                "{} decapsulates VXLAN VNI {} from {} and delivers the inner packet to {}",
                                dev.name, e.vni, ipv4_string(e.vtep_src), ipv4_string(packet.dst)
                            );
                        }
                    }
                    if let Some(e) = esp.as_ref() {
                        if i == e.ingress_idx {
                            note = format!(
                                "{} encapsulates for ESP SPI 0x{:08x} — outer {} → {} (IP protocol 50), then the internet carries the tunnel",
                                dev.name, e.spi, ipv4_string(e.gw_src), ipv4_string(e.gw_dst)
                            );
                        } else if i == e.egress_idx {
                            note = format!(
                                "{} decapsulates ESP SPI 0x{:08x} from {} and delivers the protected packet to {}",
                                dev.name, e.spi, ipv4_string(e.gw_src), ipv4_string(packet.dst)
                            );
                        }
                    }
                    match packet.transit() {
                        Transit::Forward(next) => {
                            let transit_note = format!(
                                "{} decrements TTL {} to {} and forwards",
                                dev.name, packet.ttl, next.ttl
                            );
                            note = if note.is_empty() { transit_note } else { format!("{note}; {transit_note}") };
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
                if let Err(reason) = ws.dot1x_allow(dev_id, ingress.as_deref().unwrap_or_default()) { drop_here!(reason); } let hop_t = ws.sim_time as f64; ws.mirror_hop(dev_id, ingress.as_deref(), egress.as_deref(), src_mac, dst_mac, &packet, hop_t); if ws.storm_drop(dev_id, ingress.as_deref().unwrap_or_default(), dst_mac == Mac::BROADCAST) { drop_here!(format!("storm control on {} {}", dev.name, ingress.as_deref().unwrap_or_default())); }
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
            "patchpanel" => note = format!("{} passes the frame through, port to port", dev.name),
            "sniffer" => {
                note = format!("{} records the frame and passes it on", dev.name);
                if let Some(e) = esp.as_ref().filter(|_| esp_tunneled) {
                    crate::net::ipsec::sniff_encapsulated(
                        ws, dev_id, data_started_at + i as f64 * 0.001, src_mac, dst_mac, e, &packet,
                    );
                } else if let Some(e) = encap.as_ref().filter(|_| tunneled) {
                    crate::net::vxlan::sniff_encapsulated(
                        ws, dev_id, data_started_at + i as f64 * 0.001, src_mac, dst_mac, e, &packet,
                    );
                } else {
                    sniff_packet(ws, dev_id, data_started_at + i as f64 * 0.001, src_mac, dst_mac, &packet);
                }
            }
            _ if i == last && i > 0 => {
                if let Some(label) = ws.ufw_blocks(dev_id, &packet) {
                    drop_here!(format!("ufw on {} denied {}", dev.name, label));
                }
            }
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
            layers: if let Some(e) = esp.as_ref().filter(|_| esp_tunneled) {
                crate::net::ipsec::decap_layers(src_mac, dst_mac, e, decode_layers(src_mac, dst_mac, &packet))
            } else if let Some(e) = encap.as_ref().filter(|_| tunneled) {
                crate::net::vxlan::decap_layers(src_mac, dst_mac, e, decode_layers(src_mac, dst_mac, &packet))
            } else {
                decode_layers(src_mac, dst_mac, &packet)
            },
            note,
        });
    }

    // The scheduler owns time: one arrival per device, 1 ms apart. `finished_at`
    // is when the last device saw the frame.
    let mut scheduler = crate::net::sched::Scheduler::new(); let times = scheduler.schedule(data_started_at, &path);
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

fn find<'a>(ws: &'a Workspace, id: &str) -> Result<&'a Device, String> {
    ws.devices
        .iter()
        .find(|d| d.id == id)
        .ok_or_else(|| format!("unknown device {id}"))
}

pub(super) fn bfs(ws: &Workspace, src: &str, dst: &str, require_up: bool, vlan: Option<u16>) -> Option<DataPath> {
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
            if !crate::model::l2_transparent(&d.kind) {
                return d.id.clone();
            }
        }
    }
    dst.to_string()
}


mod frames; mod mac; mod route;
use frames::*;
pub use frames::reachable;
pub(crate) use route::{next_hop, routed_path, NextHop};
