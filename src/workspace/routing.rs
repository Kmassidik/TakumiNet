use super::*;

impl Workspace {
    /// The router that answers on `ip`, if any.
    pub(crate) fn router_with_addr(&self, ip: u32) -> Option<&Device> {
        self.devices.iter().find(|d| {
            matches!(d.kind.as_str(), "router" | "asa")
                && (d.ip == Some(ip) || d.ports.iter().any(|p| p.ip == Some(ip)))
        })
    }

    /// CLI: `ip route <network> <mask> <next-hop>`.
    pub fn add_route(&mut self, id: &str, dest: &str, mask: &str, next_hop: &str) -> Result<(), String> {
        let net = crate::model::parse_ipv4(dest.trim())
            .ok_or_else(|| format!("invalid destination network: {dest}"))?;
        let prefix = crate::model::parse_mask(mask.trim())
            .ok_or_else(|| format!("invalid subnet mask: {mask}"))?;
        let via = crate::model::parse_ipv4(next_hop.trim())
            .ok_or_else(|| format!("invalid next hop: {next_hop}"))?;
        let dev = self
            .devices
            .iter_mut()
            .find(|d| d.id == id)
            .ok_or_else(|| "no such device".to_string())?;
        // IOS stores the network address, not the raw address the user typed.
        dev.routes.push((net & crate::model::mask_of(prefix), prefix, via));
        Ok(())
    }

    pub fn set_routing_protocol(&mut self, device: &str, proto: &str) -> Result<(), String> {
        if !self.devices.iter().any(|d| d.id == device) {
            return Err("no such device".into());
        }
        let entry = self.routing.entry(device.to_string()).or_default();
        entry.0 = proto.to_string();
        self.recompute_routing();
        Ok(())
    }

    pub fn add_routing_network(
        &mut self,
        device: &str,
        net: u32,
        prefix: u8,
    ) -> Result<(), String> {
        let Some(entry) = self.routing.get_mut(device) else {
            return Err("no routing protocol configured".into());
        };
        if !entry.1.iter().any(|(n, p)| *n == net && *p == prefix) {
            entry.1.push((net, prefix));
        }
        self.recompute_routing();
        Ok(())
    }

    pub fn remove_routing_network(&mut self, device: &str, net: u32, prefix: u8) {
        if let Some(entry) = self.routing.get_mut(device) {
            entry.1.retain(|(n, p)| !(*n == net && *p == prefix));
        }
        self.recompute_routing();
    }

    /// Distance-vector pass: every router learns the networks advertised by
    /// routers it can reach, with the peer's address as next hop.
    pub fn recompute_routing(&mut self) {
        use std::collections::VecDeque;
        self.dyn_routes.clear();
        let ids: Vec<String> = self
            .routing
            .iter()
            .filter(|(_, (proto, nets))| !proto.is_empty() && !nets.is_empty())
            .map(|(id, _)| id.clone())
            .collect();
        for src in ids {
            let Some((proto, _)) = self.routing.get(&src).cloned() else {
                continue;
            };
            let mut queue = VecDeque::new();
            let mut seen = std::collections::HashSet::new();
            seen.insert(src.clone());
            queue.push_back((src.clone(), 0u8));
            let mut found: Vec<(u32, u8, u32, String, u8)> = Vec::new();
            while let Some((cur, hops)) = queue.pop_front() {
                let edges: Vec<(String, u32)> = self
                    .links
                    .iter()
                    .filter_map(|l| {
                        let (peer, peer_port) = if l.a == cur {
                            (l.b.clone(), l.b_port.clone())
                        } else if l.b == cur {
                            (l.a.clone(), l.a_port.clone())
                        } else {
                            return None;
                        };
                        let peer_dev = self.devices.iter().find(|d| d.id == peer)?;
                        if peer_dev.kind != "router" {
                            return None;
                        }
                        let ip = peer_dev
                            .ports
                            .iter()
                            .find(|p| p.name == peer_port)
                            .and_then(|p| p.ip)?;
                        Some((peer, ip))
                    })
                    .collect();
                for (peer, via) in edges {
                    if let Some((_, nets)) = self.routing.get(&peer) {
                        for (net, prefix) in nets {
                            let local = self.devices.iter().find(|d| d.id == src).map_or(false, |d| {
                                d.ports.iter().any(|p| {
                                    p.ip.is_some()
                                        && p.prefix == *prefix
                                        && (p.ip.unwrap() & crate::model::mask_of(*prefix))
                                            == (*net & crate::model::mask_of(*prefix))
                                })
                            });
                            if local {
                                continue;
                            }
                            let metric = hops.saturating_add(1);
                            found.retain(|(n, p, _, _, _)| !(n == net && p == prefix));
                            found.push((*net, *prefix, via, proto.clone(), metric));
                        }
                    }
                    if seen.insert(peer.clone()) {
                        queue.push_back((peer, hops.saturating_add(1)));
                    }
                }
            }
            found.sort_by(|a, b| b.1.cmp(&a.1).then(a.0.cmp(&b.0)));
            self.dyn_routes.insert(src, found);
        }
    }

    pub fn dynamic_route(&self, device: &str, dst: u32) -> Option<u32> {
        self.dyn_routes.get(device).and_then(|list| {
            list.iter()
                .filter(|(net, prefix, _, _, _)| crate::model::contains(dst, *net, *prefix))
                .max_by_key(|(_, prefix, _, _, _)| *prefix)
                .map(|(_, _, via, _, _)| *via)
        })
    }

    /// IOS-style `show ip route` text: connected interfaces, then statics.
    pub fn show_routes(&self, id: &str) -> String {
        let Some(dev) = self.devices.iter().find(|d| d.id == id) else {
            return "% Unknown device\n".to_string();
        };
        let mut out = String::from("Codes: C - connected, S - static\n");
        for p in &dev.ports {
            if let Some(ip) = p.ip {
                out.push_str(&format!(
                    "C  {}/{} is directly connected, {}\n",
                    crate::model::ipv4_string(ip & crate::model::mask_of(p.prefix)),
                    p.prefix,
                    p.name
                ));
            }
        }
        for &(net, prefix, via) in &dev.routes {
            out.push_str(&format!(
                "S  {}/{} [1/0] via {}\n",
                crate::model::ipv4_string(net),
                prefix,
                crate::model::ipv4_string(via)
            ));
        }
        if let Some(list) = self.dyn_routes.get(id) {
            for (net, prefix, via, proto, metric) in list {
                let code = match proto.as_str() {
                    "ospf" => "O",
                    "eigrp" => "D",
                    _ => "R",
                };
                out.push_str(&format!(
                    "{code}  {}/{} [{metric}/0] via {}\n",
                    crate::model::ipv4_string(*net),
                    prefix,
                    crate::model::ipv4_string(*via)
                ));
            }
        }
        out
    }

    /// Default gateway of a host; routers and switches route instead.
    pub fn gateway_of(&self, id: &str) -> Option<u32> {
        let dev = self.devices.iter().find(|d| d.id == id)?;
        if matches!(dev.kind.as_str(), "router" | "switch") {
            return None;
        }
        dev.gateway
    }
}
