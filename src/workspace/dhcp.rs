use super::*;

impl Workspace {
    /// Pin a client to a fixed address on a server's pool.
    pub fn set_dhcp_reservation(
        &mut self,
        server: &str,
        client: &str,
        ip: &str,
    ) -> Result<(), String> {
        if !self.dhcp_pools.contains_key(server) {
            return Err("no DHCP pool on that server".into());
        }
        if !self.devices.iter().any(|d| d.id == client) {
            return Err("no such client".into());
        }
        let addr = crate::model::parse_ipv4(ip.trim())
            .ok_or_else(|| format!("invalid address: {ip}"))?;
        let list = self
            .dhcp_reservations
            .entry(server.to_string())
            .or_default();
        match list.iter_mut().find(|(c, _)| c == client) {
            Some(entry) => entry.1 = addr,
            None => list.push((client.to_string(), addr)),
        }
        list.sort_by(|a, b| a.0.cmp(&b.0));
        Ok(())
    }

    pub fn remove_dhcp_reservation(&mut self, server: &str, client: &str) -> bool {
        let removed = self.dhcp_reservations.get_mut(server).and_then(|list| {
            let index = list.iter().position(|(c, _)| c == client)?;
            Some(list.remove(index).1)
        });
        let Some(reserved) = removed else {
            return false;
        };
        let active = self
            .devices
            .iter()
            .find(|d| d.id == client)
            .and_then(|d| d.ip);
        if self.dhcp_clients.contains(client) && active == Some(reserved) {
            self.release_dhcp(client);
        }
        true
    }

    /// `ip helper-address` on a router interface.
    pub fn set_dhcp_helper(
        &mut self,
        router: &str,
        iface: &str,
        helper: &str,
    ) -> Result<(), String> {
        let dev = self
            .devices
            .iter()
            .find(|d| d.id == router)
            .ok_or_else(|| "no such device".to_string())?;
        let names: Vec<String> = dev.ports.iter().map(|p| p.name.clone()).collect();
        let name = crate::cli::expand_iface(iface, &names)
            .ok_or_else(|| format!("invalid interface: {iface}"))?;
        let addr = crate::model::parse_ipv4(helper.trim())
            .ok_or_else(|| format!("invalid helper address: {helper}"))?;
        let list = self.dhcp_helpers.entry(router.to_string()).or_default();
        list.retain(|(i, _)| i != &name);
        list.push((name, addr));
        list.sort_by(|a, b| a.0.cmp(&b.0));
        Ok(())
    }

    pub fn remove_dhcp_helper(&mut self, router: &str, iface: &str) -> bool {
        let Some(dev) = self.devices.iter().find(|d| d.id == router) else {
            return false;
        };
        let names: Vec<String> = dev.ports.iter().map(|p| p.name.clone()).collect();
        let Some(name) = crate::cli::expand_iface(iface, &names) else {
            return false;
        };
        match self.dhcp_helpers.get_mut(router) {
            Some(list) => {
                let before = list.len();
                list.retain(|(i, _)| i != &name);
                list.len() != before
            }
            None => false,
        }
    }

    /// Configure a DHCP pool on a device (normally a server).
    pub fn set_dhcp_pool(
        &mut self,
        id: &str,
        network: &str,
        prefix: u8,
        gateway: &str,
        dns: &str,
    ) -> Result<(), String> {
        if !self.devices.iter().any(|d| d.id == id) {
            return Err("no such device".into());
        }
        if !(1..=30).contains(&prefix) {
            return Err("pool prefix must be between 1 and 30".into());
        }
        let mask = crate::model::mask_of(prefix);
        let net = crate::model::parse_ipv4(network.trim())
            .ok_or_else(|| format!("invalid network: {network}"))?;
        let gw = match gateway.trim() {
            "" => None,
            g => Some(
                crate::model::parse_ipv4(g)
                    .ok_or_else(|| format!("invalid default gateway: {gateway}"))?,
            ),
        };
        let dns_ip = match dns.trim() {
            "" => None,
            d => Some(
                crate::model::parse_ipv4(d)
                    .ok_or_else(|| format!("invalid DNS server: {dns}"))?,
            ),
        };
        self.dhcp_pools.insert(
            id.to_string(),
            Pool {
                network: net & mask,
                prefix,
                gateway: gw,
                dns: dns_ip,
            },
        );
        self.dhcp_leases.entry(id.to_string()).or_default();
        Ok(())
    }

    /// The server that answers this client's broadcast: same L2 segment, never
    /// across a router.
    pub(super) fn dhcp_server_for(&self, id: &str) -> Option<String> {
        use std::collections::VecDeque;
        let mut seen = vec![id.to_string()];
        let mut q: VecDeque<String> = VecDeque::new();
        q.push_back(id.to_string());
        while let Some(cur) = q.pop_front() {
            for l in &self.links {
                if !l.carries_data() {
                    continue;
                }
                let next = if l.a == cur {
                    &l.b
                } else if l.b == cur {
                    &l.a
                } else {
                    continue;
                };
                if seen.iter().any(|s| s == next) {
                    continue;
                }
                let Some(dev) = self.devices.iter().find(|d| d.id == *next) else {
                    continue;
                };
                if dev.kind == "router" {
                    continue;
                }
                if self.dhcp_pools.contains_key(&dev.id) {
                    return Some(dev.id.clone());
                }
                seen.push(dev.id.clone());
                q.push_back(dev.id.clone());
            }
        }
        None
    }

    /// A router with `ip helper-address` on the client's subnet forwards the
    /// request to that server.
    pub(super) fn relayed_server_for(&self, client: &str) -> Option<String> {
        let dev = self.devices.iter().find(|d| d.id == client)?;
        let server_with_pool = |helper: u32| {
            self.devices
                .iter()
                .find(|d| {
                    (d.ip == Some(helper) || d.ports.iter().any(|p| p.ip == Some(helper)))
                        && self.dhcp_pools.contains_key(&d.id)
                })
                .map(|d| d.id.clone())
        };
        for (router, list) in &self.dhcp_helpers {
            let Some(rdev) = self.devices.iter().find(|d| d.id == *router) else {
                continue;
            };
            let port_names = rdev.ports.iter().map(|p| p.name.clone()).collect::<Vec<_>>();
            for (iface, helper) in list {
                let matches_subnet = dev.ip.is_some_and(|ip| {
                    rdev.ports
                        .iter()
                        .find(|p| &p.name == iface)
                        .and_then(|p| p.ip)
                        .is_some_and(|router_ip| {
                            crate::model::contains(ip, router_ip, dev.prefix)
                        })
                });
                let matches_segment = if dev.ip.is_none() {
                    let Some(path) = self.path(client, router) else {
                        continue;
                    };
                    if path.len() < 2 {
                        continue;
                    }
                    if path[..path.len() - 1].iter().any(|id| {
                        self.devices
                            .iter()
                            .find(|d| &d.id == id)
                            .is_some_and(|d| d.kind == "router")
                    }) {
                        continue;
                    }
                    let previous = &path[path.len() - 2];
                    self.links.iter().any(|link| {
                        let router_port = if link.a == *router && link.b == *previous {
                            Some(&link.a_port)
                        } else if link.b == *router && link.a == *previous {
                            Some(&link.b_port)
                        } else {
                            None
                        };
                        router_port.is_some_and(|port| {
                            crate::cli::expand_iface(port, &port_names).as_ref() == Some(iface)
                        })
                    })
                } else {
                    false
                };
                if matches_subnet || matches_segment {
                    if let Some(server) = server_with_pool(*helper) {
                        return Some(server);
                    }
                }
            }
        }
        None
    }

    pub(super) fn remove_dhcp_lease(&mut self, id: &str, ip: Option<u32>) {
        self.dhcp_clients.remove(id);
        if let Some(ip) = ip {
            for leases in self.dhcp_leases.values_mut() {
                leases.retain(|leased| *leased != ip);
            }
        }
    }

    /// Release both the client's configuration and the server's lease state.
    pub fn release_dhcp(&mut self, id: &str) -> bool {
        if !self.dhcp_clients.contains(id) {
            return false;
        }
        let ip = self.devices.iter().find(|d| d.id == id).and_then(|d| d.ip);
        self.remove_dhcp_lease(id, ip);
        if let Some(device) = self.devices.iter_mut().find(|d| d.id == id) {
            device.ip = None;
            device.gateway = None;
            device.dns = None;
        }
        true
    }

    /// DHCP DISCOVER/OFFER/REQUEST/ACK, condensed into the lease it produces.
    pub fn acquire_dhcp(&mut self, id: &str) -> Result<Lease, String> {
        if !self.devices.iter().any(|d| d.id == id) {
            return Err("no such device".into());
        }
        let server = match self.dhcp_server_for(id) {
            Some(s) => s,
            None => self
                .relayed_server_for(id)
                .ok_or_else(|| "no DHCP server on this segment".to_string())?,
        };
        let pool = self.dhcp_pools[&server];
        let mask = crate::model::mask_of(pool.prefix);
        let base = pool.network & mask;
        let last = base | !mask;

        let previous = if self.dhcp_clients.contains(id) {
            self.devices.iter().find(|d| d.id == id).and_then(|d| d.ip)
        } else {
            None
        };

        let mut used: Vec<u32> = Vec::new();
        for d in &self.devices {
            used.extend(d.ip);
            used.extend(d.ports.iter().filter_map(|p| p.ip));
        }
        used.extend(self.dhcp_leases.values().flatten().copied());

        let reserved = self
            .dhcp_reservations
            .get(&server)
            .and_then(|list| list.iter().find(|(c, _)| c == id))
            .map(|(_, ip)| *ip);
        let ip = match reserved {
            Some(addr) => {
                let own = self.devices.iter().find(|d| d.id == id).and_then(|d| d.ip);
                if used.contains(&addr) && own != Some(addr) {
                    return Err(format!(
                        "reservation {} is already in use",
                        crate::model::ipv4_string(addr)
                    ));
                }
                addr
            }
            None => {
                if let Some(addr) = previous.filter(|addr| {
                    crate::model::contains(*addr, base, pool.prefix)
                        && *addr != last
                        && pool.gateway != Some(*addr)
                }) {
                    addr
                } else {
                    let mut chosen = None;
                    for offset in 100.. {
                        let Some(cand) = base.checked_add(offset) else {
                            break;
                        };
                        if cand >= last {
                            break;
                        }
                        if pool.gateway == Some(cand) || used.contains(&cand) {
                            continue;
                        }
                        chosen = Some(cand);
                        break;
                    }
                    chosen.ok_or_else(|| "DHCP pool exhausted".to_string())?
                }
            }
        };

        if let Some(old) = previous {
            for leases in self.dhcp_leases.values_mut() {
                leases.retain(|leased| *leased != old);
            }
        }
        if let Some(d) = self.devices.iter_mut().find(|d| d.id == id) {
            d.ip = Some(ip);
            d.prefix = pool.prefix;
            d.gateway = pool.gateway;
            d.dns = pool.dns;
        }
        self.dhcp_clients.insert(id.to_string());
        let leases = self.dhcp_leases.entry(server.clone()).or_default();
        if !leases.contains(&ip) {
            leases.push(ip);
        }

        // Capture the exchange so the simulation panel shows it.
        let path = self
            .path(id, &server)
            .unwrap_or_else(|| vec![id.to_string(), server.clone()]);
        self.next_event += 1;
        self.sim_time += 0.001;
        self.events.push(Event {
            id: self.next_event,
            time: self.sim_time,
            last: self.name_of(id),
            at: self.name_of(&server),
            kind: "DHCP".into(),
            proto: "DHCP".into(),
            path,
            hops: Vec::new(),
            size: 342,
        });

        Ok(Lease {
            ip,
            prefix: pool.prefix,
            gateway: pool.gateway,
            dns: pool.dns,
            server,
        })
    }
}
