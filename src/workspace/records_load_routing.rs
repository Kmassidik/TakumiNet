use super::*;

impl Workspace {
    /// Routing protocols and NAT.
    pub(super) fn load_routing_line(&mut self, f: &[&str]) -> Option<()> {
        match f {
            ["routing", dev, proto] => {
                load_routing_protocol(self, dev, proto, 1);
            }
            ["routing", dev, proto, process_id] => {
                load_routing_protocol(
                    self,
                    dev,
                    proto,
                    process_id.parse::<u32>().unwrap_or(1),
                );
            }
            ["routenet", dev, net, prefix] => {
                load_routing_network(self, dev, net, prefix, 0);
            }
            ["routenet", dev, net, prefix, area] => {
                load_routing_network(
                    self,
                    dev,
                    net,
                    prefix,
                    area.parse::<u32>().unwrap_or(0),
                );
            }
            ["natrole", dev, iface, dir] => {
                self.nat_roles
                    .entry(dev.to_string())
                    .or_default()
                    .insert(iface.to_string(), *dir == "in");
            }
            ["natrule", dev, num, iface] => {
                if let Ok(n) = num.parse::<u16>() {
                    let _ = self.add_nat_rule(dev, n, iface);
                }
            }
            _ => {}
        }
        Some(())
    }
}

pub(super) fn load_route(ws: &mut Workspace, id: &str, net: &str, prefix: &str, via: &str, ad: &str) {
    let (Some(network), Some(next_hop)) = (
        crate::model::parse_ipv4(net),
        crate::model::parse_ipv4(via),
    ) else {
        return;
    };
    if let Some(device) = ws.devices.iter_mut().find(|d| d.id == id) {
        device.routes.push(StaticRoute {
            network,
            prefix: prefix.parse::<u8>().unwrap_or(24),
            next_hop,
            admin_distance: ad.parse::<u8>().unwrap_or(1),
        });
    }
}

fn load_routing_protocol(ws: &mut Workspace, id: &str, protocol: &str, process_id: u32) {
    let protocol = match protocol.to_ascii_lowercase().as_str() {
        "ospf" => RoutingProtocol::Ospf { process_id },
        "eigrp" => RoutingProtocol::Eigrp { as_number: process_id },
        "ospfv3" => RoutingProtocol::Ospfv3 { process_id },
        _ => RoutingProtocol::RipV2,
    };
    let config = ws.routing.entry(id.to_string()).or_insert_with(|| RoutingConfig {
        protocol: RoutingProtocol::RipV2,
        networks: Vec::new(),
    });
    config.protocol = protocol;
}

fn load_routing_network(ws: &mut Workspace, id: &str, net: &str, prefix: &str, area: u32) {
    let (Some(network), Ok(prefix)) = (
        crate::model::parse_ipv4(net),
        prefix.parse::<u8>(),
    ) else {
        return;
    };
    let config = ws.routing.entry(id.to_string()).or_insert_with(|| RoutingConfig {
        protocol: RoutingProtocol::RipV2,
        networks: Vec::new(),
    });
    if !config
        .networks
        .iter()
        .any(|n| n.network == network && n.prefix == prefix && n.area == area)
    {
        config.networks.push(NetworkStatement { network, prefix, area });
    }
}
