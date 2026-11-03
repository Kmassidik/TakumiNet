use super::*;

impl Workspace {
    /// Grade against live device configuration and learned protocol state.
    /// Ping and HTTP intentionally use the capturing delivery paths.
    pub fn run_checks(&mut self) -> Vec<CheckResult> {
        let checks = self.lesson.as_ref().map(|lesson| lesson.checks.clone()).unwrap_or_default();
        checks.iter().map(|check| self.run_check(check)).collect()
    }

    fn send_addressed_pdu(&mut self, from: &str, to: &str) -> Result<(), String> {
        let addressed = |id: &str| self.devices.iter().find(|device| device.id == id)
            .is_some_and(|device| device.ip.is_some() || device.ports.iter().any(|port| port.ip.is_some()));
        if !addressed(from) || !addressed(to) {
            return Err("source and destination must have IPv4 addresses".into());
        }
        self.send_pdu(from, to)
    }

    fn run_check(&mut self, check: &Check) -> CheckResult {
        let (passed, actual, hint) = match check.kind.as_str() {
            "ping" => {
                let delivered = self.send_addressed_pdu(&check.from, &check.to);
                let passed = match (check.expect.as_str(), &delivered) {
                    ("ok", Ok(())) | ("fail", Err(_)) => true,
                    _ => false,
                };
                let actual = match delivered {
                    Ok(()) => "ping delivered".to_string(),
                    Err(error) => format!("ping failed: {error}"),
                };
                (passed, actual, "Compare the terminal ping; check cabling, addressing, gateways, and interface state.".to_string())
            }
            "ttl" => {
                let expected = check.expect.parse::<u8>().unwrap_or(0);
                match self.send_addressed_pdu(&check.from, &check.to) {
                    Ok(()) => {
                        let ttl = self.events.last().and_then(|event| event.hops.last()).map_or(128, |hop| hop.ttl);
                        (ttl == expected, format!("delivered TTL {ttl}"), format!("Run ping {} in the terminal and compare its delivered TTL.", self.name_of(&check.to)))
                    }
                    Err(error) => (false, format!("ping failed: {error}"), "Restore a working path before comparing TTL.".to_string()),
                }
            }
            "http" => match crate::webapp::fetch(self, &check.from, &check.url) {
                Ok(page) => {
                    let passed = page.status == 200 && page.title == check.expect;
                    (passed, format!("HTTP {}, title '{}'", page.status, page.title), format!("Open {} in the device browser and compare the page title.", check.url))
                }
                Err(error) => (false, error, "Check the server address, HTTP service, DNS, and network path.".to_string()),
            },
            "lease" => {
                let device = self.devices.iter().find(|device| device.id == check.from);
                let dhcp = self.dhcp_clients.contains(&check.from);
                match device {
                    Some(device) if dhcp && device.ip.is_some() => {
                        (true, format!("DHCP address {}", crate::model::ipv4_string(device.ip.unwrap())), String::new())
                    }
                    Some(_device) if dhcp => (false, "DHCP enabled but no address is leased".to_string(), "Renew the lease from the device IP Configuration panel.".to_string()),
                    Some(device) => (false, format!("static configuration, address {}", device.ip.map(crate::model::ipv4_string).unwrap_or_else(|| "none".into())), "Select DHCP and acquire a lease first.".to_string()),
                    None => (false, format!("unknown device {}", check.from), "Fix the lesson device reference.".to_string()),
                }
            }
            "arp" => {
                let ip = crate::model::parse_ipv4(&check.to).or_else(|| {
                    self.devices.iter().find(|device| device.id == check.to)
                        .and_then(|device| device.ip.or_else(|| device.ports.iter().find_map(|port| port.ip)))
                });
                match ip {
                    Some(ip) => {
                        let now = self.sim_time as f64;
                        let entry = self.tables.arps(&check.from).lookup(ip, now);
                        match entry {
                            Some(mac) => (true, format!("{} is at {mac}", crate::model::ipv4_string(ip)), String::new()),
                            None => (false, format!("no unexpired ARP entry for {}", crate::model::ipv4_string(ip)), "Ping the on-link neighbour, then inspect the ARP cache.".to_string()),
                        }
                    }
                    None => (false, format!("cannot resolve {} to IPv4", check.to), "Use a device with a configured IPv4 address.".to_string()),
                }
            }
            "mac-table" => {
                let expected = check.expect.parse::<usize>().unwrap_or(usize::MAX);
                let rows = self.tables.mac_rows(&check.from);
                let passed = rows.len() == expected;
                (passed, format!("{} learned MAC entries", rows.len()), format!("Ping every host, then run show mac address-table on {}.", self.name_of(&check.from)))
            }
            "route" => {
                let target = check.expect.split_once('/').and_then(|(network, prefix)| {
                    Some((crate::model::parse_ipv4(network)?, crate::model::parse_mask(prefix)?))
                });
                match target {
                    Some((network, prefix)) => {
                        let network = network & crate::model::mask_of(prefix);
                        let present = self.has_route(&check.from, network, prefix);
                        let normalized = format!("{}/{}", crate::model::ipv4_string(network), prefix);
                        (present, format!("{normalized} {}", if present { "present" } else { "missing" }), format!("Run show ip route on {} and add the exact prefix.", self.name_of(&check.from)))
                    }
                    None => (false, format!("invalid route expectation '{}'", check.expect), "Use network/prefix, for example 10.0.0.0/8.".to_string()),
                }
            }
            other => (false, format!("unsupported check kind '{other}'"), "Choose a supported lesson check.".to_string()),
        };
        CheckResult {
            id: check.id.clone(),
            label: check.label.clone(),
            passed,
            actual,
            hint,
        }
    }
}
