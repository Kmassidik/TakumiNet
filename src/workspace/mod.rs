//! Mutable logical workspace: devices, links, palette catalogue.
//!
//! The server owns this state, so a device dropped in the browser exists on the
//! server too and survives a reload.

use std::collections::HashMap;

mod aaa;
mod acl;
mod addressing;
mod apps;
mod checks;
mod dhcp;
mod dns;
mod hardware;
mod iot;
mod ipv6;
mod lesson;
mod notes;
mod links;
mod nat;
mod palette;
mod records_load;
mod records_save;
mod tnet;
mod routing;
mod security;
mod startup;
mod switching;
mod traffic;
mod types;
mod util;
mod wan;
mod wireless;

pub use types::*;
use palette::*;
use util::*;

#[cfg(test)]
mod tests;

impl Workspace {
    /// A workspace with no devices and no configuration.
    pub fn empty() -> Self {
        Workspace {
                devices: Vec::new(),
                links: Vec::new(),
                lesson: None,
                counters: HashMap::new(),
                events: Vec::new(),
                next_event: 0,
                sim_time: 0.0,
                tables: Tables::default(),
                dhcp_pools: HashMap::new(),
                dhcp_leases: HashMap::new(),
                dhcp_clients: std::collections::HashSet::new(),
                startup: None,
                banners: HashMap::new(),
                notes: Vec::new(),
                line_passwords: HashMap::new(),
                powered_off: std::collections::HashSet::new(),
                slots: HashMap::new(),
                dns_records: HashMap::new(),
                http_pages: HashMap::new(),
                dhcp_reservations: HashMap::new(),
                dhcp_helpers: HashMap::new(),
                vlans: HashMap::new(),
                mail_users: HashMap::new(),
                mail: HashMap::new(),
                tftp: HashMap::new(),
                ftp: HashMap::new(),
                ntp: HashMap::new(),
                syslog_on: std::collections::HashSet::new(),
                syslog: HashMap::new(),
                aaa_users: HashMap::new(),
                port_security: HashMap::new(),
                channels: HashMap::new(),
                channel_modes: HashMap::new(),
                acls: HashMap::new(),
                acl_bindings: HashMap::new(),
                nat_roles: HashMap::new(),
                nat_rules: HashMap::new(),
                nat_translations: HashMap::new(),
                routing: HashMap::new(),
                dyn_routes: HashMap::new(),
                stp_modes: HashMap::new(),
                stp_priorities: HashMap::new(),
                wlans: HashMap::new(),
                capwap: HashMap::new(),
                iot_regs: HashMap::new(),
                ptp: HashMap::new(),
                prp_on: std::collections::HashSet::new(),
                prp_seen: HashMap::new(),
                cell_links: HashMap::new(),
                inspect: HashMap::new(),
                ips: HashMap::new(),
                v6_networks: HashMap::new(),
                wifi: HashMap::new(),
                vpn: HashMap::new(),
                pppoe: HashMap::new(),
                phones: HashMap::new(),
                unknown_elements: Vec::new(),
                record_extras: Vec::new(),
                load_problems: Vec::new(),
        }
    }

    pub fn new() -> Self {
        let mut ws = Workspace::empty();

        let demo = [
            ("router0", "Router0", "2911", "router", 350.0, 88.0),
            ("switch0", "Switch0", "2960-24TT", "switch", 200.0, 210.0),
            ("switch1", "Switch1", "2960-24TT", "switch", 505.0, 210.0),
            ("pc0", "PC0", "PC-PT", "pc", 105.0, 400.0),
            ("pc1", "PC1", "PC-PT", "pc", 265.0, 400.0),
            ("server0", "Server0", "Server-PT", "server", 395.0, 420.0),
            ("pc2", "PC2", "PC-PT", "pc", 520.0, 400.0),
        ];
        for (id, name, model, kind, x, y) in demo {
            ws.devices.push(Device {
                id: id.to_string(),
                name: name.to_string(),
                model: model.to_string(),
                icon: logical_icon(model, kind),
                kind: kind.to_string(),
                x,
                y,
                ip: None,
                prefix: 24,
                gateway: None,
                dns: None,
                ipv6: None,
                ipv6_prefix: 64,
                ipv6_gateway: None,
                ipv6_dns: None,
                ipv6_auto: false,
                ports: default_ports(kind),
                routes: Vec::new(),
                dot1x: false,
                dot1x_user: None,
                dot1x_pass: None,
            });
        }

        ws.links = vec![
            Link { a: "router0".into(), a_port: "Gig0/0".into(), b: "switch0".into(), b_port: "Fa0/1".into(), kind: "eCopper".into() },
            Link { a: "switch0".into(), a_port: "Fa0/2".into(), b: "pc0".into(), b_port: "Fa0".into(), kind: "eCopper".into() },
            Link { a: "switch0".into(), a_port: "Fa0/3".into(), b: "pc1".into(), b_port: "Fa0".into(), kind: "eCopper".into() },
            Link { a: "router0".into(), a_port: "Gig0/1".into(), b: "switch1".into(), b_port: "Fa0/1".into(), kind: "eCopper".into() },
            Link { a: "switch1".into(), a_port: "Fa0/2".into(), b: "server0".into(), b_port: "Fa0".into(), kind: "eCopper".into() },
            Link { a: "switch1".into(), a_port: "Fa0/3".into(), b: "pc2".into(), b_port: "Fa0".into(), kind: "eCopper".into() },
        ];

        // The demo ships configured: two LANs joined by router0, matching the
        // topology the README documents.
        let cfg = [
            ("pc0", "192.168.1.10", "192.168.1.1"),
            ("pc1", "192.168.1.11", "192.168.1.1"),
            ("pc2", "192.168.2.10", "192.168.2.1"),
            ("server0", "192.168.2.20", "192.168.2.1"),
        ];
        for (id, addr, gw) in cfg {
            let _ = ws.set_config(id, addr, "255.255.255.0", gw, "");
        }
        let _ = ws.set_port_ip("router0", "GigabitEthernet0/0", "192.168.1.1", 24);
        let _ = ws.set_port_ip("router0", "GigabitEthernet0/1", "192.168.2.1", 24);

        for d in &ws.devices {
            let c = ws.counters.entry(d.kind.clone()).or_insert(0);
            *c += 1;
        }
        ws
    }

    /// Create a device from a palette label at canvas coordinates.
    pub fn add(&mut self, model: &str, x: f32, y: f32) -> Option<String> {
        let (_, _, kind) = CATALOG.iter().find(|(label, _, _)| *label == model)?;
        let n = {
            let c = self.counters.entry(kind.to_string()).or_insert(0);
            let current = *c;
            *c += 1;
            current
        };
        let id = format!("{}{}", kind, n);
        let device = Device {
            id: id.clone(),
            name: format!("{}{}", name_prefix(kind), n),
            model: model.to_string(),
            icon: logical_icon(model, kind),
            kind: kind.to_string(),
            x: clamp_x(x),
            y: clamp_y(y),
            ip: None,
            prefix: 24,
            gateway: None,
            dns: None,
            ipv6: None,
            ipv6_prefix: 64,
            ipv6_gateway: None,
            ipv6_dns: None,
            ipv6_auto: false,
            ports: default_ports(kind),
            routes: Vec::new(),
            dot1x: false,
            dot1x_user: None,
            dot1x_pass: None,
        };
        self.devices.push(device);
        Some(id)
    }

    pub fn mv(&mut self, id: &str, x: f32, y: f32) -> bool {
        match self.devices.iter_mut().find(|d| d.id == id) {
            Some(d) => {
                d.x = clamp_x(x);
                d.y = clamp_y(y);
                true
            }
            None => false,
        }
    }

    pub fn remove(&mut self, id: &str) -> bool {
        let before = self.devices.len();
        self.devices.retain(|d| d.id != id);
        if self.devices.len() == before {
            return false;
        }
        self.links.retain(|l| l.a != id && l.b != id);
        self.tables.forget(id);
        self.routing.remove(id);
        self.recompute_routing();
        true
    }

    /// Build a classic bus segment: one hub plus `count` workstations wired to
    /// it, each with an address on 192.168.1.0/24.
    pub fn bus(&mut self, count: usize) -> Result<usize, String> {
        if !(2..=24).contains(&count) {
            return Err("bus needs 2 to 24 stations".into());
        }
        // Starting from the untouched demo would stack the bus on top of it.
        if self.is_pristine_demo() {
            *self = Workspace {
                devices: Vec::new(),
                links: Vec::new(),
                lesson: None,
                counters: HashMap::new(),
                events: Vec::new(),
                next_event: 0,
                sim_time: 0.0,
                tables: Tables::default(),
                dhcp_pools: HashMap::new(),
                dhcp_leases: HashMap::new(),
                dhcp_clients: std::collections::HashSet::new(),
                startup: None,
                banners: HashMap::new(),
                notes: Vec::new(),
                line_passwords: HashMap::new(),
                powered_off: std::collections::HashSet::new(),
                slots: HashMap::new(),
                dns_records: HashMap::new(),
                http_pages: HashMap::new(),
                dhcp_reservations: HashMap::new(),
                dhcp_helpers: HashMap::new(),
                vlans: HashMap::new(),
                mail_users: HashMap::new(),
                mail: HashMap::new(),
                tftp: HashMap::new(),
                ftp: HashMap::new(),
                ntp: HashMap::new(),
                syslog_on: std::collections::HashSet::new(),
                syslog: HashMap::new(),
                aaa_users: HashMap::new(),
                port_security: HashMap::new(),
                channels: HashMap::new(),
                channel_modes: HashMap::new(),
                acls: HashMap::new(),
                acl_bindings: HashMap::new(),
                nat_roles: HashMap::new(),
                nat_rules: HashMap::new(),
                nat_translations: HashMap::new(),
                routing: HashMap::new(),
                dyn_routes: HashMap::new(),
                stp_modes: HashMap::new(),
                stp_priorities: HashMap::new(),
                wlans: HashMap::new(),
                capwap: HashMap::new(),
                iot_regs: HashMap::new(),
                ptp: HashMap::new(),
                prp_on: std::collections::HashSet::new(),
                prp_seen: HashMap::new(),
                cell_links: HashMap::new(),
                inspect: HashMap::new(),
                ips: HashMap::new(),
                v6_networks: HashMap::new(),
                wifi: HashMap::new(),
                vpn: HashMap::new(),
                pppoe: HashMap::new(),
                phones: HashMap::new(),
                unknown_elements: Vec::new(),
                record_extras: Vec::new(),
                load_problems: Vec::new(),
            };
        }
        let hub = self
            .add("Hub", 500.0, 110.0)
            .ok_or_else(|| "hub model missing from catalogue".to_string())?;

        let mut made = 0;
        let span = 760.0;
        for i in 0..count {
            let t = if count == 1 { 0.5 } else { i as f32 / (count - 1) as f32 };
            let x = 120.0 + span * t;
            let Some(pc) = self.add("PC-PT", x, 385.0) else {
                continue;
            };
            let _ = self.link(&pc, &hub);
            let addr = format!("192.168.1.{}", 10 + i);
            let _ = self.set_ip(&pc, &addr, 24);
            made += 1;
        }
        Ok(made)
    }

    pub fn json(&self) -> String {
        let mut o = String::from("{\"tabs\":{\"logical\":\"Logical\",\"physical\":");
        o.push_str(&s("Physical · BS: 3, 2/2"));
        o.push_str("},\"devices\":[");

        self.json_devices(&mut o);
        o.push_str("],\"notes\":[");
        self.json_notes(&mut o);
        o.push_str("],\"links\":[");
        self.json_links(&mut o);
        o.push_str("],\"filters\":[");
        self.json_palette(&mut o);
        o.push_str("],\"events\":[");
        self.json_events(&mut o);
        o.push_str("],\"lesson\":");
        self.lesson_json(&mut o);
        o.push('}');
        o
    }

    /// Device array body: addressing, ports and every per-device setting.
    fn json_devices(&self, o: &mut String) {
        for (i, d) in self.devices.iter().enumerate() {
            if i > 0 {
                o.push(',');
            }
            let dhcp = self.dhcp_clients.contains(&d.id);
            let pool = match self.dhcp_pools.get(&d.id) {
                Some(p) => format!(
                    "{{\"network\":{},\"prefix\":{},\"gateway\":{},\"dns\":{}}}",
                    s(&crate::model::ipv4_string(p.network)),
                    p.prefix,
                    opt_ip(p.gateway),
                    opt_ip(p.dns)
                ),
                None => "null".to_string(),
            };
            let powered = self.is_powered(&d.id);
            let slots = format!(
                "[{}]",
                self.modules(&d.id)
                    .iter()
                    .map(|m| match m {
                        Some(name) => s(name),
                        None => "null".to_string(),
                    })
                    .collect::<Vec<_>>()
                    .join(",")
            );
            let dns_records = match self.dns_records.get(&d.id) {
                Some(list) => format!(
                    "[{}]",
                    list.iter()
                        .map(|(name, ip)| format!(
                            "{{\"name\":{},\"address\":{}}}",
                            s(name),
                            s(&crate::model::ipv4_string(*ip))
                        ))
                        .collect::<Vec<_>>()
                        .join(",")
                ),
                None => "[]".to_string(),
            };
            let http_page = opt_str(self.http_pages.get(&d.id).map(String::as_str));
            let reservations = match self.dhcp_reservations.get(&d.id) {
                Some(list) => format!(
                    "[{}]",
                    list.iter()
                        .map(|(client, ip)| format!(
                            "{{\"client\":{},\"address\":{}}}",
                            s(client),
                            s(&crate::model::ipv4_string(*ip))
                        ))
                        .collect::<Vec<_>>()
                        .join(",")
                ),
                None => "[]".to_string(),
            };
            let helpers = match self.dhcp_helpers.get(&d.id) {
                Some(list) => format!(
                    "[{}]",
                    list.iter()
                        .map(|(iface, ip)| format!(
                            "{{\"iface\":{},\"address\":{}}}",
                            s(iface),
                            s(&crate::model::ipv4_string(*ip))
                        ))
                        .collect::<Vec<_>>()
                        .join(",")
                ),
                None => "[]".to_string(),
            };
            o.push_str(&format!(
                "{{\"id\":{},\"name\":{},\"model\":{},\"icon\":{},\"kind\":{},\"x\":{},\"y\":{},\"ip\":{},\"prefix\":{},\"gateway\":{},\"dns\":{},\"ipv6\":{},\"ipv6Prefix\":{},\"ipv6Gateway\":{},\"ipv6Dns\":{},\"ipv6Auto\":{},\"dot1x\":{},\"dot1xUser\":{},\"dhcp\":{},\"pool\":{},\"powered\":{},\"slots\":{},\"dnsRecords\":{},\"httpPage\":{},\"reservations\":{},\"helpers\":{}}}",
                s(&d.id),
                s(&d.name),
                s(&d.model),
                s(&d.icon),
                s(&d.kind),
                d.x,
                d.y,
                opt_ip(d.ip),
                d.prefix,
                opt_ip(d.gateway),
                opt_ip(d.dns),
                opt_str(d.ipv6.as_deref()),
                d.ipv6_prefix,
                opt_str(d.ipv6_gateway.as_deref()),
                opt_str(d.ipv6_dns.as_deref()),
                d.ipv6_auto,
                d.dot1x,
                opt_str(d.dot1x_user.as_deref()),
                dhcp,
                pool,
                powered,
                slots,
                dns_records,
                http_page,
                reservations,
                helpers
            ));
        }
    }

    /// Cable array body.
    fn json_links(&self, o: &mut String) {
        for (i, l) in self.links.iter().enumerate() {
            if i > 0 {
                o.push(',');
            }
            let state = |id: &str, port: &str| {
                let canonical = self.canonical_iface(id, port).unwrap_or_else(|_| port.to_string());
                let state = self.port_state(id, &canonical);
                if !state.admin_up {
                    "red"
                } else if state.line_up {
                    "green"
                } else {
                    "amber"
                }
            };
            o.push_str(&format!(
                "{{\"a\":{},\"aPort\":{},\"b\":{},\"bPort\":{},\"kind\":{},\"aState\":{},\"bState\":{}}}",
                s(&l.a),
                s(&l.a_port),
                s(&l.b),
                s(&l.b_port),
                s(&l.kind),
                s(state(&l.a, &l.a_port)),
                s(state(&l.b, &l.b_port))
            ));
        }
    }

    /// Event filters, palette groups and palette tiles.
    fn json_palette(&self, o: &mut String) {
        for (i, f) in FILTERS.iter().enumerate() {
            if i > 0 {
                o.push(',');
            }
            o.push_str(&s(f));
        }

        o.push_str("],\"groups\":[");
        for (i, (name, icon)) in GROUPS.iter().enumerate() {
            if i > 0 {
                o.push(',');
            }
            o.push_str(&format!(
                "{{\"label\":{},\"icon\":{}}}",
                s(name),
                s(icon)
            ));
        }

        o.push_str("],\"palette\":[");
        for (i, (label, icon, kind)) in CATALOG.iter().enumerate() {
            if i > 0 {
                o.push(',');
            }
            let _ = icon;
            o.push_str(&format!(
                "{{\"label\":{},\"icon\":{},\"kind\":{}}}",
                s(label),
                s(&logical_icon(label, kind)),
                s(kind)
            ));
        }
    }

    /// Captured simulation events with per-hop detail.
    fn json_events(&self, o: &mut String) {
        for (i, e) in self.events.iter().enumerate() {
            if i > 0 {
                o.push(',');
            }
            o.push_str(&format!(
                "{{\"id\":{},\"time\":{},\"last\":{},\"at\":{},\"type\":{},\"proto\":{},\"size\":{},\"status\":{},\"reason\":{},\"note\":{},\"path\":[",
                e.id,
                e.time,
                s(&e.last),
                s(&e.at),
                s(&e.kind),
                s(&e.proto),
                e.size,
                s(&e.status),
                opt_str(e.reason.as_deref()),
                s(&e.note)
            ));
            for (j, hop) in e.path.iter().enumerate() {
                if j > 0 {
                    o.push(',');
                }
                o.push_str(&s(hop));
            }
            o.push_str("],\"hops\":[");
            for (j, h) in e.hops.iter().enumerate() {
                if j > 0 {
                    o.push(',');
                }
                o.push_str(&format!(
                    "{{\"id\":{},\"name\":{},\"in\":{},\"out\":{},\"t\":{},\"ttl\":{},\"srcMac\":{},\"dstMac\":{},\"srcIp\":{},\"dstIp\":{},\"note\":{},\"layers\":",
                    s(&h.id),
                    s(&h.name),
                    opt_str(h.ingress.as_deref()),
                    opt_str(h.egress.as_deref()),
                    h.t,
                    h.ttl,
                    s(&h.src_mac.to_string()),
                    s(&h.dst_mac.to_string()),
                    s(&crate::model::ipv4_string(h.src_ip)),
                    s(&crate::model::ipv4_string(h.dst_ip)),
                    s(&h.note)
                ));
                json_layers(o, &h.layers);
                o.push('}');
            }
            o.push_str("],\"layers\":");
            json_layers(o, &e.layers);
            o.push('}');
        }
    }
}

fn json_layers(o: &mut String, layers: &[Layer]) {
    o.push('[');
    for (i, layer) in layers.iter().enumerate() {
        if i > 0 {
            o.push(',');
        }
        o.push_str(&format!("{{\"name\":{},\"fields\":[", s(&layer.name)));
        for (j, (name, value)) in layer.fields.iter().enumerate() {
            if j > 0 {
                o.push(',');
            }
            o.push_str(&format!("{{\"name\":{},\"value\":{}}}", s(name), s(value)));
        }
        o.push_str("]}");
    }
    o.push(']');
}
