use super::*;
use std::collections::{HashSet, VecDeque};

#[derive(Clone, Debug)]
pub(super) struct Adjacency {
    pub(super) neighbor: String,
    pub(super) next_hop: u32,
    pub(super) outgoing: String,
    pub(super) peer_port: String,
    pub(super) bandwidth_kbps: u32,
    pub(super) delay_us: u32,
}

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub(super) struct PathLabel {
    pub(super) cost: u64,
    pub(super) first: usize,
}

/// OSPF's reference bandwidth is 100 Mbit/s; input is in Kbit/s.
pub(crate) fn ospf_cost(bandwidth_kbps: u32) -> u64 {
    if bandwidth_kbps == 0 {
        return u64::MAX;
    }
    (100_000u64 / u64::from(bandwidth_kbps)).max(1)
}

/// EIGRP classic composite metric with K1 and K3 enabled.
pub(crate) fn eigrp_metric(min_bandwidth_kbps: u32, delay_us: u64) -> u64 {
    if min_bandwidth_kbps == 0 {
        return u64::MAX;
    }
    let bandwidth = 10_000_000u64 / u64::from(min_bandwidth_kbps);
    bandwidth
        .saturating_add(delay_us / 10)
        .saturating_mul(256)
}

/// Directed Dijkstra over a compact graph. Unreachable nodes are `None`.
pub(crate) fn dijkstra(
    node_count: usize,
    edges: &[(usize, usize, u64)],
    source: usize,
) -> Vec<Option<u64>> {
    dijkstra_paths(node_count, edges, source)
        .into_iter()
        .map(|label| label.map(|l| l.cost))
        .collect()
}

pub(super) fn dijkstra_paths(
    node_count: usize,
    edges: &[(usize, usize, u64)],
    source: usize,
) -> Vec<Option<PathLabel>> {
    let mut adjacency = vec![Vec::new(); node_count];
    for &(from, to, cost) in edges {
        if from < node_count && to < node_count {
            adjacency[from].push((to, cost));
        }
    }
    for links in &mut adjacency {
        links.sort_unstable();
    }
    let mut labels = vec![None; node_count];
    if source >= node_count {
        return labels;
    }
    labels[source] = Some(PathLabel { cost: 0, first: source });
    let mut queue = std::collections::BinaryHeap::new();
    queue.push(std::cmp::Reverse((0u64, source)));
    while let Some(std::cmp::Reverse((cost, node))) = queue.pop() {
        if labels[node].map(|label| label.cost) != Some(cost) {
            continue;
        }
        let label = labels[node].expect("queued label");
        for &(peer, link_cost) in &adjacency[node] {
            let candidate = PathLabel {
                cost: cost.saturating_add(link_cost),
                first: if node == source { peer } else { label.first },
            };
            let replace = match labels[peer] {
                None => true,
                Some(old) => {
                    candidate.cost < old.cost
                        || (candidate.cost == old.cost && candidate.first < old.first)
                }
            };
            if replace {
                labels[peer] = Some(candidate);
                queue.push(std::cmp::Reverse((candidate.cost, peer)));
            }
        }
    }
    labels
}

pub(super) fn statement_matches(port: &PortCfg, statement: &NetworkStatement) -> bool {
    port.ip.is_some_and(|ip| {
        statement.prefix <= port.prefix
            && (ip & crate::model::mask_of(statement.prefix)) == statement.network
    })
}

fn same_subnet(a: &PortCfg, b: &PortCfg) -> bool {
    match (a.ip, b.ip) {
        (Some(a_ip), Some(b_ip)) => {
            crate::model::contains(a_ip, b_ip, a.prefix)
                && crate::model::contains(b_ip, a_ip, b.prefix)
        }
        _ => false,
    }
}

impl Workspace {
    /// The router that answers on `ip`, if any.
    pub(crate) fn router_with_addr(&self, ip: u32) -> Option<&Device> {
        self.devices.iter().find(|d| {
            crate::model::routes_packets(&d.kind)
                && (d.ip == Some(ip) || d.ports.iter().any(|p| p.ip == Some(ip)))
        })
    }

    /// CLI: `ip route <network> <mask> <next-hop> [admin-distance]`.
    pub fn add_route(
        &mut self,
        id: &str,
        dest: &str,
        mask: &str,
        next_hop: &str,
        admin_distance: u8,
    ) -> Result<(), String> {
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
        dev.routes.push(StaticRoute {
            network: net & crate::model::mask_of(prefix),
            prefix,
            next_hop: via,
            admin_distance,
        });
        Ok(())
    }

    pub fn set_routing_protocol(
        &mut self,
        device: &str,
        proto: &str,
        process_id: u32,
    ) -> Result<(), String> {
        if !self.devices.iter().any(|d| d.id == device) {
            return Err("no such device".into());
        }
        let protocol = match proto.to_ascii_lowercase().as_str() {
            "rip" => RoutingProtocol::RipV2,
            "ospf" if (1..=65_535).contains(&process_id) => RoutingProtocol::Ospf { process_id },
            "eigrp" if (1..=65_535).contains(&process_id) => RoutingProtocol::Eigrp { as_number: process_id },
            "ospfv3" if (1..=65_535).contains(&process_id) => RoutingProtocol::Ospfv3 { process_id },
            "ospf" | "eigrp" | "ospfv3" => return Err("process/autonomous-system number must be 1-65535".into()),
            _ => return Err(format!("invalid routing protocol: {proto}")),
        };
        self.routing.entry(device.to_string()).or_default().protocol = protocol;
        self.recompute_routing();
        Ok(())
    }

    pub fn add_routing_network(
        &mut self,
        device: &str,
        net: u32,
        prefix: u8,
        area: u32,
    ) -> Result<(), String> {
        let Some(entry) = self.routing.get_mut(device) else {
            return Err("no routing protocol configured".into());
        };
        if area != 0 && !matches!(entry.protocol, RoutingProtocol::Ospf { .. }) {
            return Err("areas are only valid for OSPF".into());
        }
        let statement = NetworkStatement { network: net, prefix, area };
        if !entry.networks.contains(&statement) {
            entry.networks.push(statement);
            entry.networks.sort_by_key(|s| (s.network, s.prefix, s.area));
        }
        self.recompute_routing();
        Ok(())
    }

    pub fn remove_routing_network(&mut self, device: &str, net: u32, prefix: u8, area: u32) {
        if let Some(entry) = self.routing.get_mut(device) {
            entry.networks.retain(|s| {
                !(s.network == net && s.prefix == prefix && (area == u32::MAX || s.area == area))
            });
        }
        self.recompute_routing();
    }

    fn addressed_port(&self, id: &str, raw: &str) -> Option<String> {
        let dev = self.devices.iter().find(|d| d.id == id)?;
        let names: Vec<String> = dev.ports.iter().map(|p| p.name.clone()).collect();
        crate::cli::expand_iface(raw, &names).or_else(|| {
            dev.ports.iter().find(|p| p.name == raw).map(|p| p.name.clone())
        })
    }

    fn ports_on_physical<'a>(&'a self, dev: &'a Device, raw: &str) -> Vec<&'a PortCfg> {
        let resolved = self.addressed_port(&dev.id, raw).unwrap_or_else(|| raw.to_string());
        let parent = resolved.split('.').next().unwrap_or(&resolved);
        dev.ports
            .iter()
            .filter(|p| p.name == parent || p.name.split('.').next() == Some(parent))
            .collect()
    }

    /// Discover routed adjacencies, traversing switches and hubs but never
    /// another router. Each result retains the outgoing interface metrics.
    pub(super) fn router_neighbors(&self, id: &str) -> Vec<Adjacency> {
        let Some(source) = self.devices.iter().find(|d| d.id == id) else {
            return Vec::new();
        };
        if !self.is_powered(id) {
            return Vec::new();
        }
        let mut queue = VecDeque::new();
        let mut seen = HashSet::new();
        queue.push_back((id.to_string(), String::new()));
        let mut result = Vec::new();
        while let Some((current, root)) = queue.pop_front() {
            if !seen.insert((current.clone(), root.clone())) {
                continue;
            }
            for link in self.links.iter().filter(|l| l.a == current || l.b == current) {
                if !link.carries_data() {
                    continue;
                }
                let (raw_local, raw_peer, peer_id) = if link.a == current {
                    (&link.a_port, &link.b_port, &link.b)
                } else {
                    (&link.b_port, &link.a_port, &link.a)
                };
                let current_port = self
                    .addressed_port(&current, raw_local)
                    .unwrap_or_else(|| raw_local.clone());
                if !self.is_powered(peer_id) || !self.port_state(&current, &current_port).line_up {
                    continue;
                }
                let local_port = if current == id { current_port } else { root.clone() };
                let Some(peer) = self.devices.iter().find(|d| &d.id == peer_id) else {
                    continue;
                };
                match peer.kind.as_str() {
                    "switch" | "hub" | "submarine-cable" => {
                        queue.push_back((peer.id.clone(), local_port));
                    }
                    k if crate::model::routes_packets(k) => {
                        let local_ports = self.ports_on_physical(source, &local_port);
                        let peer_ports = self.ports_on_physical(peer, raw_peer);
                        let mut pair = local_ports
                            .iter()
                            .flat_map(|local| peer_ports.iter().map(move |remote| (*local, *remote)))
                            .filter(|(local, remote)| {
                                local.ip.is_some() && remote.ip.is_some() && same_subnet(local, remote)
                            })
                            .min_by_key(|(local, remote)| (local.name.as_str(), remote.name.as_str()));
                        if let Some((local, remote)) = pair.take() {
                            result.push(Adjacency {
                                neighbor: peer.id.clone(),
                                next_hop: remote.ip.expect("addressed peer"),
                                outgoing: local.name.clone(),
                                peer_port: remote.name.clone(),
                                bandwidth_kbps: local.bandwidth_kbps,
                                delay_us: local.delay_us,
                            });
                        }
                    }
                    _ => {}
                }
            }
        }
        result.sort_by(|a, b| {
            a.neighbor
                .cmp(&b.neighbor)
                .then(a.next_hop.cmp(&b.next_hop))
                .then(a.outgoing.cmp(&b.outgoing))
        });
        result.dedup_by(|a, b| a.neighbor == b.neighbor && a.next_hop == b.next_hop && a.outgoing == b.outgoing);
        result
    }

    pub(super) fn routing_port_enabled(&self, id: &str, port: &str) -> bool {
        let Some(dev) = self.devices.iter().find(|d| d.id == id) else {
            return false;
        };
        let Some(config) = self.routing.get(id) else {
            return false;
        };
        dev.ports.iter().find(|p| p.name == port).is_some_and(|port| {
            config.networks.iter().any(|statement| statement_matches(port, statement))
        })
    }

    pub(super) fn advertised_ports(&self, id: &str, area: Option<u32>) -> Vec<&PortCfg> {
        let Some(dev) = self.devices.iter().find(|d| d.id == id) else {
            return Vec::new();
        };
        let Some(config) = self.routing.get(id) else {
            return Vec::new();
        };
        if !self.is_powered(id) {
            return Vec::new();
        }
        dev.ports
            .iter()
            .filter(|port| {
                port.ip.is_some()
                    && self.port_state(id, &port.name).line_up
                    && config.networks.iter().any(|statement| {
                        area.is_none_or(|a| statement.area == a) && statement_matches(port, statement)
                    })
            })
            .collect()
    }

    pub(super) fn advertised_prefixes(&self, id: &str, area: Option<u32>) -> Vec<(u32, u8)> {
        let mut prefixes: Vec<_> = self
            .advertised_ports(id, area)
            .into_iter()
            .map(|port| {
                (
                    port.ip.expect("addressed") & crate::model::mask_of(port.prefix),
                    port.prefix,
                )
            })
            .collect();
        prefixes.sort_unstable();
        prefixes.dedup();
        prefixes
    }

    fn is_connected(&self, id: &str, network: u32, prefix: u8) -> bool {
        self.devices.iter().find(|d| d.id == id).is_some_and(|dev| {
            dev.ports.iter().any(|port| {
                port.ip.is_some_and(|ip| {
                    self.port_state(id, &port.name).line_up
                        && port.prefix == prefix
                        && (ip & crate::model::mask_of(prefix)) == network
                })
            })
        })
    }

    pub(super) fn install_route(&mut self, id: &str, route: InstalledRoute) {
        if route.next_hop == 0 || self.is_connected(id, route.network, route.prefix) {
            return;
        }
        let routes = self.dyn_routes.entry(id.to_string()).or_default();
        if route.source == RouteSource::OspfInterArea
            && routes.iter().any(|old| {
                old.network == route.network && old.prefix == route.prefix && old.source == RouteSource::Ospf
            })
        {
            return;
        }
        if route.source == RouteSource::Ospf {
            routes.retain(|old| {
                !(old.network == route.network
                    && old.prefix == route.prefix
                    && old.source == RouteSource::OspfInterArea)
            });
        }
        match routes.iter_mut().find(|old| {
            old.network == route.network && old.prefix == route.prefix && old.source == route.source
        }) {
            Some(old) => {
                if (route.metric, route.next_hop) < (old.metric, old.next_hop) {
                    *old = route;
                }
            }
            None => routes.push(route),
        }
    }

    /// Recompute each protocol independently from configured connected
    /// prefixes and the current physical/admin/power state.
    pub fn recompute_routing(&mut self) {
        self.dyn_routes.clear();
        self.recompute_rip();
        self.recompute_ospf();
        self.recompute_eigrp();
        self.recompute_bgp();
        for routes in self.dyn_routes.values_mut() {
            routes.sort_by_key(|route| (route.network, route.prefix, route.metric, route.next_hop));
        }
    }

    /// Default gateway of a host; routers and switches route instead.
    pub fn gateway_of(&self, id: &str) -> Option<u32> {
        let dev = self.devices.iter().find(|d| d.id == id)?;
        if matches!(dev.kind.as_str(), "router" | "switch" | "rtrw-gateway" | "switch-l3") {
            return None;
        }
        dev.gateway
    }
}
