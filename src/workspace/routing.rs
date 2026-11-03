use super::*;
use std::cmp::Ordering;
use std::collections::{BTreeMap, BTreeSet, HashMap, HashSet, VecDeque};

#[derive(Clone, Debug)]
struct Adjacency {
    neighbor: String,
    next_hop: u32,
    outgoing: String,
    peer_port: String,
    bandwidth_kbps: u32,
    delay_us: u32,
}

#[derive(Clone, Debug)]
struct RouterLsa {
    router: String,
    area: u32,
    links: Vec<OspfLink>,
    prefixes: Vec<(u32, u8, u64)>,
}

#[derive(Clone, Debug)]
struct OspfLink {
    neighbor: String,
    next_hop: u32,
    cost: u64,
}

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
struct PathLabel {
    cost: u64,
    first: usize,
}

#[derive(Clone, Copy, Debug)]
struct OspfPath {
    cost: u64,
    next_hop: u32,
}

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
struct RipLabel {
    metric: u8,
    next_hop: u32,
}

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
struct EigrpLabel {
    min_bandwidth: u32,
    delay_us: u64,
    next_hop: u32,
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

fn dijkstra_paths(
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

fn statement_matches(port: &PortCfg, statement: &NetworkStatement) -> bool {
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

fn route_order(a: &RouteCandidate, b: &RouteCandidate) -> Ordering {
    b.prefix
        .cmp(&a.prefix)
        .then_with(|| a.admin_distance.cmp(&b.admin_distance))
        .then_with(|| a.metric.cmp(&b.metric))
        .then_with(|| a.next_hop.unwrap_or(0).cmp(&b.next_hop.unwrap_or(0)))
        .then_with(|| a.interface.cmp(&b.interface))
}

impl Workspace {
    /// The router that answers on `ip`, if any.
    pub(crate) fn router_with_addr(&self, ip: u32) -> Option<&Device> {
        self.devices.iter().find(|d| {
            matches!(d.kind.as_str(), "router" | "asa")
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
    fn router_neighbors(&self, id: &str) -> Vec<Adjacency> {
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
                    "switch" | "hub" => {
                        queue.push_back((peer.id.clone(), local_port));
                    }
                    "router" | "asa" => {
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

    fn routing_port_enabled(&self, id: &str, port: &str) -> bool {
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

    fn advertised_ports(&self, id: &str, area: Option<u32>) -> Vec<&PortCfg> {
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

    fn advertised_prefixes(&self, id: &str, area: Option<u32>) -> Vec<(u32, u8)> {
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

    fn install_route(&mut self, id: &str, route: InstalledRoute) {
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
        for routes in self.dyn_routes.values_mut() {
            routes.sort_by_key(|route| (route.network, route.prefix, route.metric, route.next_hop));
        }
    }

    fn recompute_rip(&mut self) {
        let mut ids: Vec<String> = self
            .routing
            .iter()
            .filter(|(id, config)| {
                config.protocol == RoutingProtocol::RipV2
                    && !config.networks.is_empty()
                    && self.is_powered(id)
            })
            .map(|(id, _)| id.clone())
            .collect();
        ids.sort();
        let index: HashMap<String, usize> = ids.iter().cloned().zip(0..).collect();
        let adjacency: HashMap<String, Vec<Adjacency>> = ids
            .iter()
            .map(|id| {
                let neighbors = self
                    .router_neighbors(id)
                    .into_iter()
                    .filter(|adj| {
                        self.routing_port_enabled(id, &adj.outgoing)
                            && self.routing_port_enabled(&adj.neighbor, &adj.peer_port)
                            && self.routing.get(&adj.neighbor).is_some_and(|config| {
                                config.protocol == RoutingProtocol::RipV2 && !config.networks.is_empty()
                            })
                    })
                    .collect();
                (id.clone(), neighbors)
            })
            .collect();
        for source in &ids {
            let source_index = index[source];
            let mut labels = vec![None; ids.len()];
            labels[source_index] = Some(RipLabel { metric: 0, next_hop: 0 });
            // Synchronous Bellman-Ford: round N reads only round N-1.
            for _ in 0..ids.len().saturating_sub(1) {
                let previous = labels.clone();
                let mut next = previous.clone();
                for (current, label) in previous.iter().enumerate() {
                    let Some(label) = label.filter(|label| label.metric < 15) else {
                        continue;
                    };
                    for adj in &adjacency[&ids[current]] {
                        let peer = index[&adj.neighbor];
                        let candidate = RipLabel {
                            metric: label.metric + 1,
                            next_hop: if current == source_index { adj.next_hop } else { label.next_hop },
                        };
                        let replace = next[peer].is_none_or(|old| {
                            (candidate.metric, candidate.next_hop) < (old.metric, old.next_hop)
                        });
                        if replace {
                            next[peer] = Some(candidate);
                        }
                    }
                }
                let changed = next != labels;
                labels = next;
                if !changed {
                    break;
                }
            }
            for (destination, label) in labels.into_iter().enumerate() {
                let Some(label) = label.filter(|label| label.metric > 0 && label.metric <= 15) else {
                    continue;
                };
                for (network, prefix) in self.advertised_prefixes(&ids[destination], None) {
                    self.install_route(
                        source,
                        InstalledRoute {
                            network,
                            prefix,
                            next_hop: label.next_hop,
                            source: RouteSource::Rip,
                            metric: u64::from(label.metric),
                        },
                    );
                }
            }
        }
    }

    fn ospf_area_for(&self, id: &str, port: &str, process_id: u32) -> BTreeSet<u32> {
        let Some(dev) = self.devices.iter().find(|d| d.id == id) else {
            return BTreeSet::new();
        };
        let Some(config) = self.routing.get(id) else {
            return BTreeSet::new();
        };
        if config.protocol != (RoutingProtocol::Ospf { process_id }) {
            return BTreeSet::new();
        }
        dev.ports
            .iter()
            .filter(|p| &p.name == port)
            .flat_map(|p| config.networks.iter().filter(move |s| statement_matches(p, s)))
            .map(|s| s.area)
            .collect()
    }

    fn ospf_lsdb(&self, process_id: u32, area: u32) -> HashMap<String, RouterLsa> {
        let mut routers: Vec<String> = self
            .routing
            .iter()
            .filter(|(id, config)| {
                config.protocol == (RoutingProtocol::Ospf { process_id })
                    && config.networks.iter().any(|s| s.area == area)
                    && self.is_powered(id)
            })
            .map(|(id, _)| id.clone())
            .collect();
        routers.sort();
        routers
            .into_iter()
            .map(|id| {
                let mut links = Vec::new();
                for adj in self.router_neighbors(&id) {
                    if !self.ospf_area_for(&id, &adj.outgoing, process_id).contains(&area)
                        || !self.ospf_area_for(&adj.neighbor, &adj.peer_port, process_id).contains(&area)
                    {
                        continue;
                    }
                    links.push(OspfLink {
                        neighbor: adj.neighbor,
                        next_hop: adj.next_hop,
                        cost: ospf_cost(adj.bandwidth_kbps),
                    });
                }
                links.sort_by_key(|link| (link.neighbor.clone(), link.cost, link.next_hop));
                let mut prefixes: Vec<_> = self
                    .advertised_ports(&id, Some(area))
                    .into_iter()
                    .map(|port| {
                        (
                            port.ip.expect("addressed") & crate::model::mask_of(port.prefix),
                            port.prefix,
                            ospf_cost(port.bandwidth_kbps),
                        )
                    })
                    .collect();
                prefixes.sort_unstable();
                prefixes.dedup_by(|a, b| a.0 == b.0 && a.1 == b.1);
                (
                    id.clone(),
                    RouterLsa {
                        router: id.clone(),
                        area,
                        links,
                        prefixes,
                    },
                )
            })
            .collect()
    }

    fn ospf_spf(lsdb: &HashMap<String, RouterLsa>, source: &str) -> HashMap<String, OspfPath> {
        let mut ids: Vec<String> = lsdb.keys().cloned().collect();
        ids.sort();
        let index: HashMap<String, usize> = ids.iter().cloned().zip(0..).collect();
        let mut edges = Vec::new();
        for lsa in lsdb.values() {
            for link in &lsa.links {
                if let (Some(&from), Some(&to)) = (index.get(&lsa.router), index.get(&link.neighbor)) {
                    edges.push((from, to, link.cost));
                }
            }
        }
        let Some(&source_index) = index.get(source) else {
            return HashMap::new();
        };
        let labels = dijkstra_paths(ids.len(), &edges, source_index);
        let mut paths = HashMap::new();
        for (i, label) in labels.into_iter().enumerate() {
            let Some(label) = label else { continue };
            let next_hop = if i == source_index {
                0
            } else {
                lsdb[source]
                    .links
                    .iter()
                    .filter(|link| index.get(&link.neighbor) == Some(&label.first))
                    .map(|link| (link.cost, link.next_hop))
                    .min()
                    .map(|(_, next_hop)| next_hop)
                    .unwrap_or(0)
            };
            if next_hop != 0 || i == source_index {
                paths.insert(ids[i].clone(), OspfPath { cost: label.cost, next_hop });
            }
        }
        paths
    }

    fn recompute_ospf(&mut self) {
        let processes: BTreeSet<u32> = self
            .routing
            .values()
            .filter_map(|config| match config.protocol {
                RoutingProtocol::Ospf { process_id } => Some(process_id),
                _ => None,
            })
            .collect();
        for process in processes {
            let areas: BTreeSet<u32> = self
                .routing
                .values()
                .filter(|config| config.protocol == (RoutingProtocol::Ospf { process_id: process }))
                .flat_map(|config| config.networks.iter().map(|s| s.area))
                .collect();
            let lsdbs: HashMap<u32, HashMap<String, RouterLsa>> = areas
                .iter()
                .map(|&area| (area, self.ospf_lsdb(process, area)))
                .collect();
            let spfs: HashMap<(u32, String), HashMap<String, OspfPath>> = lsdbs
                .iter()
                .flat_map(|(&area, lsdb)| {
                    lsdb.keys().map(move |id| ((area, id.clone()), Self::ospf_spf(lsdb, id)))
                })
                .collect();
            let abrs: BTreeSet<String> = lsdbs
                .get(&0)
                .into_iter()
                .flat_map(|lsdb| lsdb.keys())
                .filter(|id| areas.iter().any(|area| *area != 0 && lsdbs[area].contains_key(*id)))
                .cloned()
                .collect();

            // Intra-area routes come only from this area's shared LSDB.
            for (&area, lsdb) in &lsdbs {
                for source in lsdb.keys() {
                    for (destination, lsa) in lsdb {
                        if destination == source {
                            continue;
                        }
                        let Some(path) = spfs[&(area, source.clone())].get(destination) else {
                            continue;
                        };
                        for &(network, prefix, prefix_cost) in &lsa.prefixes {
                            self.install_route(
                                source,
                                InstalledRoute {
                                    network,
                                    prefix,
                                    next_hop: path.next_hop,
                                    source: RouteSource::Ospf,
                                    metric: path.cost.saturating_add(prefix_cost),
                                },
                            );
                        }
                    }
                }
            }

            // ABRs originate summaries into each attached area. Non-backbone
            // destinations are reached through area 0, never a global SPF.
            for (&source_area, lsdb) in &lsdbs {
                for source in lsdb.keys() {
                    let source_spf = &spfs[&(source_area, source.clone())];
                    for abr in &abrs {
                        if !lsdb.contains_key(abr) {
                            continue;
                        }
                        let Some(to_abr) = source_spf.get(abr).copied() else {
                            continue;
                        };
                        for &origin_area in &areas {
                            if origin_area == source_area {
                                continue;
                            }
                            for (advertiser, lsa) in &lsdbs[&origin_area] {
                                if advertiser == source {
                                    continue;
                                }
                                // Cost and first hop from this ABR toward the
                                // origin, either directly or through area 0.
                                let abr_path = if lsdbs[&origin_area].contains_key(abr) {
                                    spfs[&(origin_area, abr.clone())]
                                        .get(advertiser)
                                        .copied()
                                } else {
                                    let mut best: Option<OspfPath> = None;
                                    for remote in &abrs {
                                        if !lsdbs[&origin_area].contains_key(remote) {
                                            continue;
                                        }
                                        let Some(backbone) = spfs
                                            .get(&(0, abr.clone()))
                                            .and_then(|paths| paths.get(remote))
                                        else {
                                            continue;
                                        };
                                        let Some(remote_path) = spfs
                                            .get(&(origin_area, remote.clone()))
                                            .and_then(|paths| paths.get(advertiser))
                                        else {
                                            continue;
                                        };
                                        let candidate = OspfPath {
                                            cost: backbone.cost.saturating_add(remote_path.cost),
                                            next_hop: backbone.next_hop,
                                        };
                                        if best.is_none_or(|old| {
                                            (candidate.cost, candidate.next_hop)
                                                < (old.cost, old.next_hop)
                                        }) {
                                            best = Some(candidate);
                                        }
                                    }
                                    best
                                };
                                let Some(abr_path) = abr_path else { continue };
                                let next_hop = if source == abr {
                                    abr_path.next_hop
                                } else {
                                    to_abr.next_hop
                                };
                                if next_hop == 0 {
                                    continue;
                                }
                                for &(network, prefix, prefix_cost) in &lsa.prefixes {
                                    self.install_route(
                                        source,
                                        InstalledRoute {
                                            network,
                                            prefix,
                                            next_hop,
                                            source: RouteSource::OspfInterArea,
                                            metric: to_abr
                                                .cost
                                                .saturating_add(abr_path.cost)
                                                .saturating_add(prefix_cost),
                                        },
                                    );
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    fn eigrp_insert(labels: &mut Vec<EigrpLabel>, candidate: EigrpLabel) -> bool {
        let dominates = |a: &EigrpLabel, b: &EigrpLabel| {
            a.min_bandwidth >= b.min_bandwidth
                && a.delay_us <= b.delay_us
                && ((a.min_bandwidth > b.min_bandwidth || a.delay_us < b.delay_us)
                    || a.next_hop <= b.next_hop)
        };
        if labels.iter().any(|old| dominates(old, &candidate)) {
            return false;
        }
        labels.retain(|old| !dominates(&candidate, old));
        labels.push(candidate);
        labels.sort_by_key(|label| {
            (
                eigrp_metric(label.min_bandwidth, label.delay_us),
                label.delay_us,
                label.next_hop,
            )
        });
        true
    }

    fn recompute_eigrp(&mut self) {
        let systems: BTreeSet<u32> = self
            .routing
            .values()
            .filter_map(|config| match config.protocol {
                RoutingProtocol::Eigrp { as_number } => Some(as_number),
                _ => None,
            })
            .collect();
        for as_number in systems {
            let mut ids: Vec<String> = self
                .routing
                .iter()
                .filter(|(id, config)| {
                    config.protocol == (RoutingProtocol::Eigrp { as_number })
                        && !config.networks.is_empty()
                        && self.is_powered(id)
                })
                .map(|(id, _)| id.clone())
                .collect();
            ids.sort();
            let index: HashMap<String, usize> = ids.iter().cloned().zip(0..).collect();
            let adjacency: HashMap<String, Vec<Adjacency>> = ids
                .iter()
                .map(|id| {
                    let neighbors = self
                        .router_neighbors(id)
                        .into_iter()
                        .filter(|adj| {
                            self.routing_port_enabled(id, &adj.outgoing)
                                && self.routing_port_enabled(&adj.neighbor, &adj.peer_port)
                                && self.routing.get(&adj.neighbor).is_some_and(|config| {
                                    config.protocol == (RoutingProtocol::Eigrp { as_number })
                                        && !config.networks.is_empty()
                                })
                        })
                        .collect();
                    (id.clone(), neighbors)
                })
                .collect();
            for source in &ids {
                let source_index = index[source];
                let mut labels: Vec<Vec<EigrpLabel>> = vec![Vec::new(); ids.len()];
                let mut queue = VecDeque::new();
                for adj in &adjacency[source] {
                    let label = EigrpLabel {
                        min_bandwidth: adj.bandwidth_kbps,
                        delay_us: u64::from(adj.delay_us),
                        next_hop: adj.next_hop,
                    };
                    if Self::eigrp_insert(&mut labels[index[&adj.neighbor]], label) {
                        queue.push_back((index[&adj.neighbor], label));
                    }
                }
                while let Some((current, label)) = queue.pop_front() {
                    if !labels[current].contains(&label) {
                        continue;
                    }
                    for adj in &adjacency[&ids[current]] {
                        let peer = index[&adj.neighbor];
                        if peer == source_index {
                            continue;
                        }
                        let candidate = EigrpLabel {
                            min_bandwidth: label.min_bandwidth.min(adj.bandwidth_kbps),
                            delay_us: label.delay_us.saturating_add(u64::from(adj.delay_us)),
                            next_hop: label.next_hop,
                        };
                        if Self::eigrp_insert(&mut labels[peer], candidate) {
                            queue.push_back((peer, candidate));
                        }
                    }
                }
                for (destination, paths) in labels.into_iter().enumerate() {
                    let advertised: Vec<_> = self
                        .advertised_ports(&ids[destination], None)
                        .into_iter()
                        .map(|port| {
                            (
                                port.ip.expect("addressed") & crate::model::mask_of(port.prefix),
                                port.prefix,
                                port.bandwidth_kbps,
                                port.delay_us,
                            )
                        })
                        .collect();
                    for (network, prefix, bandwidth, port_delay) in advertised {
                        let Some(best) = paths.iter().min_by_key(|label| {
                            let delay = label.delay_us.saturating_add(u64::from(port_delay));
                            (
                                eigrp_metric(label.min_bandwidth.min(bandwidth), delay),
                                delay,
                                label.next_hop,
                            )
                        }) else {
                            continue;
                        };
                        let delay = best.delay_us.saturating_add(u64::from(port_delay));
                        self.install_route(
                            source,
                            InstalledRoute {
                                network,
                                prefix,
                                next_hop: best.next_hop,
                                source: RouteSource::Eigrp,
                                metric: eigrp_metric(best.min_bandwidth.min(bandwidth), delay),
                            },
                        );
                    }
                }
            }
        }
    }

    fn outgoing_for<'a>(&self, dev: &'a Device, next_hop: u32) -> Option<&'a PortCfg> {
        dev.ports
            .iter()
            .filter(|port| {
                port.ip.is_some_and(|ip| {
                    self.port_state(&dev.id, &port.name).line_up
                        && crate::model::contains(next_hop, ip, port.prefix)
                })
            })
            .max_by_key(|port| port.prefix)
    }

    fn route_candidates(&self, id: &str) -> Vec<RouteCandidate> {
        let Some(dev) = self.devices.iter().find(|d| d.id == id) else {
            return Vec::new();
        };
        if !self.is_powered(id) {
            return Vec::new();
        }
        let mut candidates = Vec::new();
        for port in &dev.ports {
            let Some(ip) = port.ip else { continue };
            if !self.port_state(id, &port.name).line_up {
                continue;
            }
            candidates.push(RouteCandidate {
                network: ip & crate::model::mask_of(port.prefix),
                prefix: port.prefix,
                next_hop: None,
                source: RouteSource::Connected,
                admin_distance: 0,
                metric: 0,
                interface: Some(port.name.clone()),
                dot1q: port.dot1q,
            });
        }
        for route in &dev.routes {
            if route.admin_distance == 255 {
                continue;
            }
            let Some(outgoing) = self.outgoing_for(dev, route.next_hop) else {
                continue;
            };
            candidates.push(RouteCandidate {
                network: route.network,
                prefix: route.prefix,
                next_hop: Some(route.next_hop),
                source: RouteSource::Static,
                admin_distance: route.admin_distance,
                metric: 0,
                interface: Some(outgoing.name.clone()),
                dot1q: outgoing.dot1q,
            });
        }
        for route in self.dyn_routes.get(id).into_iter().flatten() {
            let Some(outgoing) = self.outgoing_for(dev, route.next_hop) else {
                continue;
            };
            candidates.push(RouteCandidate {
                network: route.network,
                prefix: route.prefix,
                next_hop: Some(route.next_hop),
                source: route.source,
                admin_distance: route.source.admin_distance(),
                metric: route.metric,
                interface: Some(outgoing.name.clone()),
                dot1q: outgoing.dot1q,
            });
        }
        candidates
    }

    /// Shared longest-prefix -> administrative-distance -> metric lookup.
    pub fn best_route(&self, device: &str, destination: u32) -> Option<RouteCandidate> {
        self.route_candidates(device)
            .into_iter()
            .filter(|route| crate::model::contains(destination, route.network, route.prefix))
            .min_by(route_order)
    }

    fn selected_routes(&self, id: &str) -> Vec<RouteCandidate> {
        let mut selected: BTreeMap<(u32, u8), RouteCandidate> = BTreeMap::new();
        for route in self.route_candidates(id) {
            let key = (route.network, route.prefix);
            match selected.get(&key) {
                Some(old) if route_order(&route, old) != Ordering::Less => {}
                _ => {
                    selected.insert(key, route);
                }
            }
        }
        selected.into_values().collect()
    }

    /// IOS-style `show ip route`, rendered from the same selected RIB used by
    /// forwarding. Dynamic fields are `[administrative-distance/metric]`.
    pub fn show_routes(&self, id: &str) -> String {
        if !self.devices.iter().any(|d| d.id == id) {
            return "% Unknown device\n".to_string();
        }
        let mut out = String::from(
            "Codes: C - connected, S - static, R - RIP, O - OSPF, O IA - OSPF inter area, D - EIGRP\n",
        );
        for route in self.selected_routes(id) {
            let prefix = format!(
                "{}  {}/{}",
                route.source.code(),
                crate::model::ipv4_string(route.network),
                route.prefix
            );
            match route.next_hop {
                None => out.push_str(&format!(
                    "{prefix} is directly connected, {}\n",
                    route.interface.unwrap_or_default()
                )),
                Some(next_hop) => out.push_str(&format!(
                    "{prefix} [{}/{}] via {}\n",
                    route.admin_distance,
                    route.metric,
                    crate::model::ipv4_string(next_hop)
                )),
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
