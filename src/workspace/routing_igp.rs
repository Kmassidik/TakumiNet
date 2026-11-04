use super::*;
use super::routing::{eigrp_metric, Adjacency};
use std::collections::{BTreeSet, HashMap, VecDeque};

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

impl Workspace {
    pub(super) fn recompute_rip(&mut self) {
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
                if next == labels {
                    break;
                }
                labels = next;
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

    pub(super) fn recompute_eigrp(&mut self) {
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
}
