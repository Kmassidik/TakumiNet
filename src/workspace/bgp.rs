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

    pub fn bgp_neighbor(&mut self, device: &str, peer_ip: &str, peer_as: u32) -> Result<(), String> {
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
                config.neighbors.push(BgpNeighbor { peer_ip: ip, peer_as });
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
        self.bgp.get(device).map(|c| c.networks.clone()).unwrap_or_default()
    }

    fn addresses_of(&self, id: &str) -> Vec<u32> {
        self.devices
            .iter()
            .find(|d| d.id == id)
            .map(|d| d.ip.into_iter().chain(d.ports.iter().filter_map(|p| p.ip)).collect())
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
        let mirrored = peer_config
            .neighbors
            .iter()
            .any(|n| n.peer_as == config.local_as && addresses.contains(&n.peer_ip));
        mirrored
            && self.live_port_toward(device, neighbor.peer_ip)
            && crate::net::fwd::reachable(self, device, &peer_id)
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
                (crate::model::ipv4_string(neighbor.peer_ip), neighbor.peer_as, state.to_string())
            })
            .collect()
    }

    /// Established sessions import the peer's announced networks with
    /// administrative distance 20 via the peer address.
    pub(super) fn recompute_bgp(&mut self) {
        let mut ids: Vec<String> = self.bgp.keys().cloned().collect();
        ids.sort();
        let mut learned = Vec::new();
        for id in &ids {
            let Some(config) = self.bgp.get(id) else { continue };
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
                    learned.push((
                        id.clone(),
                        InstalledRoute {
                            network,
                            prefix,
                            next_hop: neighbor.peer_ip,
                            source: RouteSource::Bgp,
                            metric: 0,
                        },
                    ));
                }
            }
        }
        for (id, route) in learned {
            self.install_route(&id, route);
        }
    }
}
