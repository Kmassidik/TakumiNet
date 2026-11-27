//! The control-plane routing walk: next-hop lookups stitched into exact
//! device and cable paths. Split out of fwd.rs so the frame-level walk stays
//! small; the semantics are unchanged.

use super::*;
/// What a device does with a packet for `dst`, including the 802.1Q tag of
/// the directly connected interface used for the next L2 leg.
pub(crate) enum NextHop {
    Direct(Option<u16>),
    Via(u32, Option<u16>),
    NoRoute(String),
}

/// Longest-prefix/AD/metric lookup shared with `show ip route`.
pub(crate) fn next_hop(ws: &Workspace, dev: &Device, dst: u32) -> NextHop {
    use crate::model::{contains, ipv4_string};

    if crate::model::routes_packets(&dev.kind) {
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
pub(crate) fn routed_path(ws: &Workspace, sdev: &Device, ddev: &Device, dst_ip: u32) -> Result<DataPath, (String, Vec<String>)> {
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
            // Dead first hop: keep the chain so the drop animation dies somewhere.
            NextHop::NoRoute(msg) => return Err((msg, chain)),
        };

        let shared = ws.shared_gateway_owner(next);
        let peer = ws
            .devices
            .iter()
            .find(|d| match &shared {
                Some(owner) => d.id == *owner,
                None => d.ports.iter().any(|p| p.ip == Some(next)) || d.ip == Some(next),
            })
            .cloned()
            .ok_or_else(|| {
                (
                    format!("no route to {}: gateway {} is not a configured router interface", ipv4_string(dst_ip), ipv4_string(next)),
                    chain.clone(),
                )
            })?;
        if chain.iter().any(|id| *id == peer.id) {
            return Err((format!("routing loop at {}", peer.name), chain.clone()));
        }
        let peer_tag = peer
            .ports
            .iter()
            .find(|p| p.ip == Some(next) || p.ip.is_some_and(|ip| shared.is_some() && crate::model::contains(next, ip, p.prefix)))
            .and_then(|p| p.dot1q);
        let vlan = next_vlan.or(peer_tag);
        let from = chain.last().cloned().unwrap_or_default();
        if usable_path_vlan(ws, &from, &peer.id, vlan).is_none() {
            return Err((blocked_reason(ws, &from, &peer.id), chain.clone()));
        }
        leg_vlans.push(vlan);
        chain.push(peer.id.clone());
        current = peer;
    }
    if chain.last().map(|id| id != &ddev.id).unwrap_or(true) {
        return Err((
            format!("no route to {}: routing loop or hop limit exceeded", ipv4_string(dst_ip)),
            chain.clone(),
        ));
    }

    let mut path = DataPath { devices: vec![chain[0].clone()], links: Vec::new() };
    for (idx, pair) in chain.windows(2).enumerate() {
        let leg = usable_path_vlan(ws, &pair[0], &pair[1], leg_vlans[idx])
            .ok_or_else(|| (blocked_reason(ws, &pair[0], &pair[1]), chain.clone()))?;
        for id in leg.devices.into_iter().skip(1) {
            if path.devices.last() != Some(&id) {
                path.devices.push(id);
            }
        }
        path.links.extend(leg.links);
    }
    Ok(path)
}

