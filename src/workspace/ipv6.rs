use super::*;

impl Workspace {
    /// SLAAC: adopt the prefix of a router reachable across switch/hub links.
    pub fn slaac(&mut self, id: &str) -> Result<String, String> {
        if !self.devices.iter().any(|d| d.id == id) {
            return Err("no such device".into());
        }
        let mut frontier = vec![id.to_string()];
        let mut seen: std::collections::HashSet<String> =
            std::iter::once(id.to_string()).collect();
        let mut router_v6: Option<String> = None;
        'search: while let Some(cur) = frontier.pop() {
            for link in &self.links {
                let peer = if link.a == cur {
                    link.b.clone()
                } else if link.b == cur {
                    link.a.clone()
                } else {
                    continue;
                };
                if !seen.insert(peer.clone()) {
                    continue;
                }
                let Some(dev) = self.devices.iter().find(|d| d.id == peer) else {
                    continue;
                };
                match dev.kind.as_str() {
                    "switch" | "hub" => frontier.push(peer),
                    "router" | "asa" => {
                        if let Some(v6) = &dev.ipv6 {
                            if !v6.is_empty() {
                                router_v6 = Some(v6.clone());
                                break 'search;
                            }
                        }
                    }
                    _ => {}
                }
            }
        }
        let Some(router) = router_v6 else {
            return Err("no IPv6 router advertising on this segment".into());
        };
        let base = match router.rfind(':') {
            Some(i) => router[..=i].to_string(),
            None => return Err("router address has no prefix".into()),
        };
        let host: u32 = 0x100
            + (id.bytes().fold(0u32, |a, b| a.wrapping_mul(31).wrapping_add(b as u32))
                % 0xfe00);
        let addr = format!("{base}{host:x}");
        let d = self.devices.iter_mut().find(|d| d.id == id).unwrap();
        d.ipv6 = Some(addr.clone());
        d.ipv6_gateway = Some(router);
        d.ipv6_auto = true;
        d.ipv6_prefix = 64;
        Ok(addr)
    }

    /// IPv6 section of the workstation dialog (stored, not simulated).
    pub fn set_ipv6(
        &mut self,
        id: &str,
        auto_config: bool,
        address: &str,
        prefix: u8,
        gateway: &str,
        dns: &str,
    ) -> Result<(), String> {
        if prefix > 128 {
            return Err("IPv6 prefix must be 0-128".into());
        }
        let addr = address.trim();
        if !addr.is_empty() && !addr.contains(':') {
            return Err(format!("invalid IPv6 address: {addr}"));
        }
        match self.devices.iter_mut().find(|d| d.id == id) {
            Some(d) => {
                d.ipv6_auto = auto_config;
                d.ipv6 = (!addr.is_empty()).then(|| addr.to_string());
                d.ipv6_prefix = prefix;
                d.ipv6_gateway = (!gateway.trim().is_empty()).then(|| gateway.trim().to_string());
                d.ipv6_dns = (!dns.trim().is_empty()).then(|| dns.trim().to_string());
            }
            None => return Err("no such device".into()),
        }
        if auto_config && addr.is_empty() {
            self.slaac(id)?;
        }
        Ok(())
    }

    /// DHCPv6: the server hands out an address inside its own prefix.
    pub fn dhcpv6(&mut self, client: &str, server: &str) -> Result<String, String> {
        let s = self
            .devices
            .iter()
            .find(|d| d.id == server)
            .ok_or_else(|| "no such server".to_string())?;
        let Some(base6) = s.ipv6.clone() else {
            return Err(format!("{} has no IPv6 address", s.name));
        };
        if !self.devices.iter().any(|d| d.id == client) {
            return Err("no such client".into());
        }
        let base = match base6.rfind(':') {
            Some(i) => base6[..=i].to_string(),
            None => return Err("server IPv6 address has no prefix".into()),
        };
        let host: u32 = 0x200
            + (client.bytes().fold(0u32, |a, b| a.wrapping_mul(31).wrapping_add(b as u32))
                % 0xfd00);
        let addr = format!("{base}{host:x}");
        let d = self.devices.iter_mut().find(|d| d.id == client).unwrap();
        d.ipv6 = Some(addr.clone());
        d.ipv6_gateway = Some(base6.clone());
        d.ipv6_prefix = 64;
        d.ipv6_auto = false;
        Ok(addr)
    }

    pub fn add_v6_network(&mut self, device: &str, prefix: &str) -> Result<(), String> {
        let Some((addr, len)) = prefix.split_once('/') else {
            return Err("expected PREFIX/LEN".into());
        };
        if !addr.contains(':') {
            return Err("not an IPv6 prefix".into());
        }
        let Ok(len) = len.parse::<u16>() else {
            return Err("invalid prefix length".into());
        };
        if len > 128 {
            return Err("prefix length must be 0-128".into());
        }
        if !self.devices.iter().any(|d| d.id == device) {
            return Err("no such device".into());
        }
        let list = self.v6_networks.entry(device.to_string()).or_default();
        let text = format!("{addr}/{len}");
        if !list.contains(&text) {
            list.push(text);
        }
        Ok(())
    }

    /// `show ipv6 route`: connected IPv6 addresses plus OSPFv3 advertisements.
    pub fn show_ipv6_routes(&self, id: &str) -> String {
        let Some(dev) = self.devices.iter().find(|d| d.id == id) else {
            return "% Unknown device\n".into();
        };
        let mut out = String::from("IPv6 Routing Table - Codes: C - connected, O - OSPFv3\n");
        if let Some(addr) = &dev.ipv6 {
            out.push_str(&format!(
                "C  {addr}/{} via :: , {}\n",
                dev.ipv6_prefix,
                dev.name
            ));
        }
        if let Some(gw) = &dev.ipv6_gateway {
            out.push_str(&format!("C  default via {gw}\n"));
        }
        for net in self.v6_networks.get(id).into_iter().flatten() {
            out.push_str(&format!("O  {net} [110/1]\n"));
        }
        out
    }
}

impl Workspace {
    /// `ping6`: an IPv6 echo over one live L2 segment. IPv6 routing is not
    /// modelled, so a target behind a router times out.
    pub fn ping6(&mut self, src: &str, target: &str) -> String {
        let Some(sdev) = self.devices.iter().find(|d| d.id == src) else {
            return "ping6: unknown device\n".into();
        };
        let Some(src_ip) = sdev.ipv6.as_deref().and_then(|t| t.parse::<std::net::Ipv6Addr>().ok()) else {
            return format!("ping6: {} has no IPv6 address set\n", sdev.name);
        };
        let Ok(target_ip) = target.parse::<std::net::Ipv6Addr>() else {
            return format!("ping6: cannot resolve {target}\n");
        };
        let Some(dst) = self
            .devices
            .iter()
            .find(|d| d.ipv6.as_deref().and_then(|t| t.parse::<std::net::Ipv6Addr>().ok()) == Some(target_ip))
            .map(|d| d.id.clone())
        else {
            return format!("Pinging {target_ip} with 32 bytes of data:\n\nRequest timed out.\n\nPing statistics for {target_ip}:\n    Packets: Sent = 1, Received = 0, Lost = 1 (100% loss),\n\n");
        };
        let Some(path) = crate::net::v6::l2_path(self, src, &dst) else {
            return format!("Pinging {target_ip} with 32 bytes of data:\n\nRequest timed out.\n\nPing statistics for {target_ip}:\n    Packets: Sent = 1, Received = 0, Lost = 1 (100% loss),\n\n");
        };
        let dst_name = self.devices.iter().find(|d| d.id == dst).map(|d| d.name.clone()).unwrap_or_default();
        let hops = crate::net::v6::v6_hops(self, &path, src, &dst);
        self.next_event += 1;
        let blocked = self.ufw_blocks_v6(&dst, src_ip);
        let ok = blocked.is_none();
        self.push_event(Event {
            id: self.next_event,
            time: self.sim_time,
            last: sdev.name.clone(),
            at: dst_name.clone(),
            kind: "ICMPv6".into(),
            proto: "ICMPv6".into(),
            path,
            hops,
            layers: Vec::new(),
            status: if ok { "Successful" } else { "Dropped" }.into(),
            reason: blocked.clone().map(|label| format!("ufw on {dst_name} denied {label}")),
            note: if ok { format!("{} answers {}", dst_name, src_ip) } else { format!("ufw on {dst_name} refused the echo") },
            bytes: Vec::new(),
            size: 0,
        });
        if let Some(label) = blocked {
            return format!("Pinging {target_ip} with 32 bytes of data:\n\nRequest timed out. (ufw denied {label})\n\nPing statistics for {target_ip}:\n    Packets: Sent = 1, Received = 0, Lost = 1 (100% loss),\n\n");
        }
        format!("Pinging {target_ip} with 32 bytes of data:\n\nReply from {target_ip}: bytes=32 time=1ms TTL=64\n\nPing statistics for {target_ip}:\n    Packets: Sent = 1, Received = 1, Lost = 0 (0% loss),\n\n")
    }
}
