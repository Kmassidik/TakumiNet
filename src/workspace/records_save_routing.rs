use super::*;

impl Workspace {
    /// Routing protocols, NAT, ACL bindings, DNS, HTTP pages and DHCP reservations.
    pub(super) fn write_routing_and_names(&self, out: &mut String) {
        let mut shared: Vec<_> = self.shared_gateways.iter().collect();
        shared.sort();
        for (vip, members) in shared {
            for (device, priority) in members {
                out.push_str(&format!("sharedgw\t{}\t{}\t{}\n", device, crate::model::ipv4_string(*vip), priority));
            }
        }
        let mut routing: Vec<_> = self.routing.iter().collect();
        routing.sort_by_key(|(id, _)| id.as_str());
        for (dev, config) in routing {
            let (protocol, process_id) = match &config.protocol {
                RoutingProtocol::RipV2 => ("rip", None),
                RoutingProtocol::Ospf { process_id } => ("ospf", Some(process_id)),
                RoutingProtocol::Eigrp { as_number } => ("eigrp", Some(as_number)),
                RoutingProtocol::Ospfv3 { process_id } => ("ospfv3", Some(process_id)),
            };
            if let Some(process_id) = process_id {
                out.push_str(&format!("routing\t{dev}\t{protocol}\t{process_id}\n"));
            } else {
                out.push_str(&format!("routing\t{dev}\t{protocol}\n"));
            }
            for network in &config.networks {
                out.push_str(&format!(
                    "routenet\t{}\t{}\t{}\t{}\n",
                    dev,
                    crate::model::ipv4_string(network.network),
                    network.prefix,
                    network.area
                ));
            }
        }
        let mut roles: Vec<_> = self.nat_roles.iter().collect();
        roles.sort_by_key(|(id, _)| id.as_str());
        for (dev, table) in roles {
            let mut rows: Vec<_> = table.iter().collect();
            rows.sort_by_key(|(iface, _)| iface.as_str());
            for (iface, inside) in rows {
                out.push_str(&format!(
                    "natrole\t{}\t{}\t{}\n",
                    dev,
                    iface,
                    if *inside { "in" } else { "out" }
                ));
            }
        }
        let mut nrules: Vec<_> = self.nat_rules.iter().collect();
        nrules.sort_by_key(|(id, _)| id.as_str());
        for (dev, list) in nrules {
            for r in list {
                out.push_str(&format!("natrule\t{}\t{}\t{}\n", dev, r.acl, r.iface));
            }
        }
        let mut binds: Vec<_> = self.acl_bindings.iter().collect();
        binds.sort_by_key(|(id, _)| id.as_str());
        for (dev, table) in binds {
            let mut rows: Vec<_> = table.iter().collect();
            rows.sort_by_key(|(iface, _)| iface.as_str());
            for (iface, (number, inbound)) in rows {
                out.push_str(&format!(
                    "aclbind\t{}\t{}\t{}\t{}\n",
                    dev,
                    iface,
                    number,
                    if *inbound { "in" } else { "out" }
                ));
            }
        }
        let mut records: Vec<_> = self.dns_records.iter().collect();
        records.sort_by_key(|(id, _)| id.as_str());
        for (id, list) in records {
            for (name, ip) in list {
                out.push_str(&format!(
                    "dns\t{}\t{}\t{}\n",
                    id,
                    name,
                    crate::model::ipv4_string(*ip)
                ));
            }
        }
        let mut pages: Vec<_> = self.http_pages.iter().collect();
        pages.sort_by_key(|(id, _)| id.as_str());
        for (id, body) in pages {
            out.push_str(&format!("page\t{}\t{}\n", id, escape_field(body)));
        }
        let mut reserves: Vec<_> = self.dhcp_reservations.iter().collect();
        reserves.sort_by_key(|(id, _)| id.as_str());
        for (id, list) in reserves {
            for (client, ip) in list {
                out.push_str(&format!(
                    "reserve\t{}\t{}\t{}\n",
                    id,
                    client,
                    crate::model::ipv4_string(*ip)
                ));
            }
        }
        let mut helpers: Vec<_> = self.dhcp_helpers.iter().collect();
        helpers.sort_by_key(|(id, _)| id.as_str());
        for (id, list) in helpers {
            for (iface, ip) in list {
                out.push_str(&format!(
                    "helper\t{}\t{}\t{}\n",
                    id,
                    iface,
                    crate::model::ipv4_string(*ip)
                ));
            }
        }
    }
}
