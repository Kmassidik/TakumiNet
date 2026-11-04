use super::*;
use super::routing::{dijkstra_paths, ospf_cost, statement_matches};
use std::collections::{BTreeSet, HashMap};

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

#[derive(Clone, Copy, Debug)]
struct OspfPath {
    cost: u64,
    next_hop: u32,
}

impl Workspace {
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

    pub(super) fn recompute_ospf(&mut self) {
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
}
