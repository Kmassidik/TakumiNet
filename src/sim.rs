//! Packet forwarding: L3 next-hop selection and L2 flooding.
//!
//! The simulator answers one question: "if this host sends to that address,
//! which devices does the frame traverse?" It returns that path so the UI can
//! animate it and the tests can assert on it.

use crate::model::{contains, parse_ipv4, Device, Iface, Route, Topology};
use std::collections::{HashSet, VecDeque};

const MAX_HOPS: usize = 32;

/// Ordered device ids the packet visits, ending at the owner of `dst`.
pub fn ping(topo: &Topology, src: &str, dst: &str) -> Result<Vec<String>, String> {
    let dst_ip = parse_ipv4(dst).ok_or_else(|| format!("invalid IPv4 address: {dst}"))?;

    if topo.device(src).is_none() {
        return Err(format!("unknown source device: {src}"));
    }

    let mut queue: VecDeque<(String, Option<String>, Vec<String>)> = VecDeque::new();
    let mut seen: HashSet<String> = HashSet::new();

    queue.push_back((src.to_string(), None, vec![src.to_string()]));
    seen.insert(src.to_string());

    while let Some((dev_id, ingress, path)) = queue.pop_front() {
        let Some(dev) = topo.device(&dev_id) else {
            continue;
        };

        if dev.owns(dst_ip) {
            return Ok(path);
        }
        if path.len() > MAX_HOPS {
            continue;
        }

        for (peer, peer_if) in next_hops(topo, dev, ingress.as_deref(), dst_ip) {
            if !seen.insert(peer.clone()) {
                continue;
            }
            let mut next_path = path.clone();
            next_path.push(peer.clone());
            queue.push_back((peer, Some(peer_if), next_path));
        }
    }

    Err(format!("unreachable: no route from {src} to {dst}"))
}

fn next_hops(
    topo: &Topology,
    dev: &Device,
    ingress: Option<&str>,
    dst: u32,
) -> Vec<(String, String)> {
    let candidates: Vec<&Iface> = if dev.kind.is_l3() {
        match egress(dev, dst) {
            Some(i) => vec![i],
            None => vec![],
        }
    } else {
        // A switch floods every port except the one the frame arrived on.
        dev.ifaces
            .iter()
            .filter(|i| Some(i.name.as_str()) != ingress)
            .collect()
    };

    let mut out = Vec::new();
    for i in candidates {
        if let Some((peer, peer_if)) = topo.peer(&dev.id, &i.name) {
            out.push((peer.to_string(), peer_if.to_string()));
        }
    }
    out
}

/// Longest-prefix match, favouring a connected interface over a route.
fn egress<'a>(dev: &'a Device, dst: u32) -> Option<&'a Iface> {
    if let Some(i) = dev
        .ifaces
        .iter()
        .find(|i| i.ip.map_or(false, |ip| contains(dst, ip, i.prefix)))
    {
        return Some(i);
    }

    let mut best: Option<&Route> = None;
    for r in &dev.routes {
        if !contains(dst, r.dest, r.prefix) {
            continue;
        }
        match best {
            Some(b) if b.prefix >= r.prefix => {}
            _ => best = Some(r),
        }
    }

    let route = best?;
    let target = route.via.unwrap_or(dst);
    dev.ifaces
        .iter()
        .find(|i| i.ip.map_or(false, |ip| contains(target, ip, i.prefix)))
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::model::demo;

    #[test]
    fn same_subnet_reaches_router() {
        let t = demo();
        assert_eq!(ping(&t, "pc1", "192.168.1.1").unwrap(), vec!["pc1", "sw1", "r1"]);
    }

    #[test]
    fn routed_across_both_routers() {
        let t = demo();
        assert_eq!(
            ping(&t, "pc1", "192.168.2.10").unwrap(),
            vec!["pc1", "sw1", "r1", "r2", "sw2", "pc2"]
        );
    }

    #[test]
    fn reverse_path_is_symmetric() {
        let t = demo();
        assert_eq!(
            ping(&t, "pc2", "192.168.1.10").unwrap(),
            vec!["pc2", "sw2", "r2", "r1", "sw1", "pc1"]
        );
    }

    #[test]
    fn offnet_without_route_fails() {
        let t = demo();
        let err = ping(&t, "pc1", "8.8.8.8").unwrap_err();
        assert!(err.contains("unreachable"), "{err}");
    }

    #[test]
    fn bad_input_is_reported() {
        let t = demo();
        assert!(ping(&t, "pc1", "not-an-ip").is_err());
        assert!(ping(&t, "nope", "192.168.1.10").is_err());
    }
}
