use super::*;
use std::cmp::Ordering;
use std::collections::BTreeMap;

fn route_order(a: &RouteCandidate, b: &RouteCandidate) -> Ordering {
    b.prefix
        .cmp(&a.prefix)
        .then_with(|| a.admin_distance.cmp(&b.admin_distance))
        .then_with(|| a.metric.cmp(&b.metric))
        .then_with(|| a.next_hop.unwrap_or(0).cmp(&b.next_hop.unwrap_or(0)))
        .then_with(|| a.interface.cmp(&b.interface))
}

impl Workspace {
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

    pub(super) fn selected_routes(&self, id: &str) -> Vec<RouteCandidate> {
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

    /// Exact selected-RIB membership for lesson checks. A covering default or
    /// less-specific route deliberately does not satisfy this predicate.
    pub fn has_route(&self, id: &str, network: u32, prefix: u8) -> bool {
        let network = network & crate::model::mask_of(prefix);
        self.selected_routes(id).iter().any(|route| route.network == network && route.prefix == prefix)
    }

    /// IOS-style `show ip route`, rendered from the same selected RIB used by
    /// forwarding. Dynamic fields are `[administrative-distance/metric]`.
    pub fn show_routes(&self, id: &str) -> String {
        if !self.devices.iter().any(|d| d.id == id) {
            return "% Unknown device\n".to_string();
        }
        let mut out = String::from(
            "Codes: C - connected, S - static, R - RIP, O - OSPF, O IA - OSPF inter area, D - EIGRP, B - BGP\n",
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
}
