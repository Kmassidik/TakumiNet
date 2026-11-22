use super::*;

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub struct BgpNeighbor {
    pub peer_ip: u32,
    pub peer_as: u32,
}

#[derive(Clone, Debug, Default, PartialEq, Eq)]
pub struct BgpConfig {
    pub local_as: u32,
    pub neighbors: Vec<BgpNeighbor>,
    pub networks: Vec<(u32, u8)>,
    pub denied: Vec<(u32, u8)>,
    /// Real ISPs choose not to sell transit: a speaker with this set exports
    /// only its own networks, never routes it learned from other speakers.
    pub no_transit: bool,
}

impl Workspace {
    /// `router bgp <as>`: turn on BGP with this local autonomous system.
    pub fn bgp_config(&mut self, device: &str, local_as: u32) -> Result<(), String> {
        let Some(dev) = self.devices.iter().find(|d| d.id == device) else {
            return Err("no such device".into());
        };
        if !crate::model::routes_packets(&dev.kind) {
            return Err("only routing devices speak BGP".into());
        }
        if local_as == 0 {
            return Err("autonomous system must be 1 to 4294967295".into());
        }
        self.bgp.entry(device.to_string()).or_default().local_as = local_as;
        self.recompute_routing();
        Ok(())
    }

    pub fn bgp_neighbor(
        &mut self,
        device: &str,
        peer_ip: &str,
        peer_as: u32,
    ) -> Result<(), String> {
        let ip = crate::model::parse_ipv4(peer_ip.trim())
            .ok_or_else(|| format!("invalid neighbor address: {peer_ip}"))?;
        if peer_as == 0 {
            return Err("autonomous system must be 1 to 4294967295".into());
        }
        let Some(config) = self.bgp.get_mut(device) else {
            return Err("set the local autonomous system first".into());
        };
        match config.neighbors.iter_mut().find(|n| n.peer_ip == ip) {
            Some(neighbor) => neighbor.peer_as = peer_as,
            None => {
                config.neighbors.push(BgpNeighbor {
                    peer_ip: ip,
                    peer_as,
                });
                config.neighbors.sort_by_key(|n| n.peer_ip);
            }
        }
        self.recompute_routing();
        Ok(())
    }

    pub fn bgp_remove_neighbor(&mut self, device: &str, peer_ip: &str) -> bool {
        let Some(ip) = crate::model::parse_ipv4(peer_ip.trim()) else {
            return false;
        };
        let Some(config) = self.bgp.get_mut(device) else {
            return false;
        };
        let before = config.neighbors.len();
        config.neighbors.retain(|n| n.peer_ip != ip);
        let removed = config.neighbors.len() != before;
        if removed {
            self.recompute_routing();
        }
        removed
    }

    /// `network <net> mask <mask>`: announce one prefix to established peers.
    /// `no transit`: export only local networks. Real ISPs set this toward
    /// peers they do not sell transit to.
    pub fn bgp_set_transit(&mut self, device: &str, on: bool) -> Result<(), String> {
        let Some(config) = self.bgp.get_mut(device) else {
            return Err("set the local autonomous system first".into());
        };
        config.no_transit = on;
        self.recompute_routing();
        Ok(())
    }

    pub fn bgp_network(&mut self, device: &str, net: u32, prefix: u8) -> Result<(), String> {
        if prefix > 32 {
            return Err("prefix must be 0 to 32".into());
        }
        let Some(config) = self.bgp.get_mut(device) else {
            return Err("set the local autonomous system first".into());
        };
        let net = net & crate::model::mask_of(prefix);
        if !config.networks.contains(&(net, prefix)) {
            config.networks.push((net, prefix));
            config.networks.sort_unstable();
        }
        self.recompute_routing();
        Ok(())
    }

    pub fn bgp_remove_network(&mut self, device: &str, net: u32, prefix: u8) -> bool {
        let Some(config) = self.bgp.get_mut(device) else {
            return false;
        };
        let net = net & crate::model::mask_of(prefix.min(32));
        let before = config.networks.len();
        config.networks.retain(|entry| *entry != (net, prefix));
        let removed = config.networks.len() != before;
        if removed {
            self.recompute_routing();
        }
        removed
    }

    pub fn bgp_networks(&self, device: &str) -> Vec<(u32, u8)> {
        self.bgp
            .get(device)
            .map(|c| c.networks.clone())
            .unwrap_or_default()
    }

    /// Refuse one prefix from every peer: `recompute_bgp` never imports it.
    pub fn bgp_deny(&mut self, device: &str, net: u32, prefix: u8) -> Result<(), String> {
        if prefix > 32 {
            return Err("prefix must be 0 to 32".into());
        }
        let Some(config) = self.bgp.get_mut(device) else {
            return Err("set the local autonomous system first".into());
        };
        let net = net & crate::model::mask_of(prefix);
        if !config.denied.contains(&(net, prefix)) {
            config.denied.push((net, prefix));
            config.denied.sort_unstable();
        }
        self.recompute_routing();
        Ok(())
    }

    pub fn bgp_remove_deny(&mut self, device: &str, net: u32, prefix: u8) -> bool {
        let Some(config) = self.bgp.get_mut(device) else {
            return false;
        };
        let net = net & crate::model::mask_of(prefix.min(32));
        let before = config.denied.len();
        config.denied.retain(|entry| *entry != (net, prefix));
        let removed = config.denied.len() != before;
        if removed {
            self.recompute_routing();
        }
        removed
    }

    pub fn bgp_denied(&self, device: &str) -> Vec<(u32, u8)> {
        self.bgp
            .get(device)
            .map(|c| c.denied.clone())
            .unwrap_or_default()
    }

    fn addresses_of(&self, id: &str) -> Vec<u32> {
        self.devices
            .iter()
            .find(|d| d.id == id)
            .map(|d| {
                d.ip.into_iter()
                    .chain(d.ports.iter().filter_map(|p| p.ip))
                    .collect()
            })
            .unwrap_or_default()
    }

    fn live_port_toward(&self, id: &str, next_hop: u32) -> bool {
        self.devices.iter().find(|d| d.id == id).is_some_and(|dev| {
            dev.ports.iter().any(|port| {
                port.ip.is_some_and(|ip| {
                    self.port_state(id, &port.name).line_up
                        && crate::model::contains(next_hop, ip, port.prefix)
                })
            })
        })
    }

    /// Both routers must name each other with the right AS numbers, share a
    /// live subnet toward the peer address, and have a working cable path.
    fn bgp_established(&self, device: &str, config: &BgpConfig, neighbor: BgpNeighbor) -> bool {
        if config.local_as == 0 || !self.is_powered(device) {
            return false;
        }
        let Some(peer) = self.router_with_addr(neighbor.peer_ip) else {
            return false;
        };
        let peer_id = peer.id.clone();
        if !self.is_powered(&peer_id) {
            return false;
        }
        let Some(peer_config) = self.bgp.get(&peer_id) else {
            return false;
        };
        if peer_config.local_as != neighbor.peer_as {
            return false;
        }
        let addresses = self.addresses_of(device);
        let speaker_addr = addresses
            .iter()
            .copied()
            .find(|a| {
                peer.ports.iter().any(|p| {
                    p.ip.is_some_and(|pip| crate::model::contains(*a, pip, p.prefix))
                })
            })
            .unwrap_or(neighbor.peer_ip);
        let mirrored = peer_config
            .neighbors
            .iter()
            .any(|n| n.peer_as == config.local_as && addresses.contains(&n.peer_ip));
        mirrored
            && self.live_port_toward(device, neighbor.peer_ip)
            // eBGP peers over a shared link: the session lives or dies with
            // that one link, not with any detour through other speakers.
            && self.live_port_toward(device, neighbor.peer_ip)
            && self.live_port_toward(&peer_id, speaker_addr)
    }

    pub fn bgp_session_state(&self, device: &str, peer_ip: &str) -> &'static str {
        let Some(ip) = crate::model::parse_ipv4(peer_ip.trim()) else {
            return "none";
        };
        let Some(config) = self.bgp.get(device) else {
            return "none";
        };
        let Some(neighbor) = config.neighbors.iter().find(|n| n.peer_ip == ip) else {
            return "none";
        };
        if self.bgp_established(device, config, *neighbor) {
            "established"
        } else {
            "idle"
        }
    }

    pub fn bgp_sessions(&self, device: &str) -> Vec<(String, u32, String)> {
        let Some(config) = self.bgp.get(device) else {
            return Vec::new();
        };
        config
            .neighbors
            .iter()
            .map(|neighbor| {
                let state = if self.bgp_established(device, config, *neighbor) {
                    "established"
                } else {
                    "idle"
                };
                (
                    crate::model::ipv4_string(neighbor.peer_ip),
                    neighbor.peer_as,
                    state.to_string(),
                )
            })
            .collect()
    }

    /// Established sessions import the peer's announced networks with
    /// administrative distance 20 via the peer address.
    pub(super) fn recompute_bgp(&mut self) {
        // Real eBGP: a speaker exports everything it knows — local networks and
        // routes learned from other neighbours — so multi-hop paths form across
        // a chain of autonomous systems. Iterates to a fixpoint; the loop guard
        // is the standard one: a route whose next hop points back at the
        // advertising peer is never re-advertised to that peer's neighbour... in
        // practice we guard by (network, prefix, via-peer) tuples so a route
        // never bounces between two speakers forever.
        let mut ids: Vec<String> = self.bgp.keys().cloned().collect();
        ids.sort();
        // (speaker, network, prefix, next_hop, via_peer)
        let mut learned: Vec<(String, InstalledRoute, String)> = Vec::new();
        for id in &ids {
            let Some(config) = self.bgp.get(id) else {
                continue;
            };
            for neighbor in &config.neighbors {
                if !self.bgp_established(id, config, *neighbor) {
                    continue;
                }
                let Some(peer) = self.router_with_addr(neighbor.peer_ip) else {
                    continue;
                };
                let Some(peer_config) = self.bgp.get(&peer.id) else {
                    continue;
                };
                for &(network, prefix) in &peer_config.networks {
                    if config.denied.contains(&(network, prefix)) {
                        continue;
                    }
                    learned.push((
                        id.clone(),
                        InstalledRoute {
                            network,
                            prefix,
                            next_hop: neighbor.peer_ip,
                            source: RouteSource::Bgp,
                            metric: 0,
                        },
                        peer.id.clone(),
                    ));
                }
            }
        }
        // Transit: repeatedly let each speaker export what it knows (its own
        // networks plus accepted learned routes) to its other established
        // neighbours, until no new route appears.
        let mut known: Vec<(String, u32, u8)> = learned
            .iter()
            .map(|(id, r, _)| (id.clone(), r.network, r.prefix))
            .collect();
        for (id, route, _) in &learned {
            self.install_route(id, route.clone());
        }
        let mut rounds = 0;
        loop {
            rounds += 1;
            if rounds > 8 {
                break;
            }
            let mut grew = false;
            for id in &ids {
                let config_owned = self.bgp.get(id).cloned();
                let Some(config) = config_owned.as_ref() else {
                    continue;
                };
                let (config_networks, config_denied, config_neighbors) = (
                    config.networks.clone(),
                    config.denied.clone(),
                    config.neighbors.clone(),
                );
                // A no-transit speaker exports only its own networks.
                let mut export: Vec<(u32, u8)> = config_networks.clone();
                if !config.no_transit {
                    for r in self.dyn_routes.get(id).cloned().unwrap_or_default() {
                        if r.source == RouteSource::Bgp {
                            export.push((r.network, r.prefix));
                        }
                    }
                    for neighbor in &config_neighbors {
                        if !self.bgp_established(id, config, *neighbor) {
                            continue;
                        }
                        let peer_id_owned = self
                            .router_with_addr(neighbor.peer_ip)
                            .map(|d| d.id.clone());
                        let Some(peer_id) = peer_id_owned else {
                            continue;
                        };
                        let (peer_networks, peer_denied) = {
                            let Some(pc) = self.bgp.get(&peer_id) else {
                                continue;
                            };
                            (pc.networks.clone(), pc.denied.clone())
                        };
                        // Loop guard: never export back to the peer we learned it from.
                        let via_peer = |network: u32,
                                        prefix: u8,
                                        learned: &[(String, InstalledRoute, String)],
                                        speaker: &str,
                                        peer_id: &str|
                         -> bool {
                            learned.iter().any(|(lid, r, from)| {
                                lid == speaker
                                    && r.network == network
                                    && r.prefix == prefix
                                    && from == peer_id
                            })
                        };
                        for &(network, prefix) in &export {
                            if config_denied.contains(&(network, prefix))
                                || peer_denied.contains(&(network, prefix))
                                || peer_networks.contains(&(network, prefix))
                                || via_peer(network, prefix, &learned, id, &peer_id)
                            {
                                continue;
                            }
                            let key = (peer_id.clone(), network, prefix);
                                                if known.contains(&key) {
                                continue;
                            }
                            // The peer's route must point back at the speaker's own
                            // address on their shared link — the address in the
                            // same subnet as the peer address we dial.
                            let own_addr = self
                                .addresses_of(id)
                                .into_iter()
                                .find(|a| {
                                    self.devices.iter().any(|d| {
                                        d.id == *id
                                            && d.ports.iter().any(|p| {
                                                p.ip == Some(*a)
                                                    && crate::model::contains(
                                                        neighbor.peer_ip,
                                                        p.ip.unwrap_or(0),
                                                        p.prefix,
                                                    )
                                            })
                                    })
                                })
                                .or_else(|| self.addresses_of(id).first().copied())
                                .unwrap_or(neighbor.peer_ip);
                            known.push(key);
                            let route = InstalledRoute {
                                network,
                                prefix,
                                next_hop: own_addr,
                                source: RouteSource::Bgp,
                                metric: 0,
                            };
                            self.install_route(&peer_id, route.clone());
                            learned.push((peer_id.clone(), route, id.clone()));
                            grew = true;
                        }
                    }
                }
            }
            if !grew {
                break;
            }
        }
    }
}
