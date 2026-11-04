use super::*;

impl Workspace {
    pub fn json(&self) -> String {
        let mut o = String::from("{\"tabs\":{\"logical\":\"Logical\",\"physical\":");
        o.push_str(&s("Physical · BS: 3, 2/2"));
        o.push_str("},\"devices\":[");

        self.json_devices(&mut o);
        o.push_str("],\"notes\":[");
        self.json_notes(&mut o);
        o.push_str("],\"links\":[");
        self.json_links(&mut o);
        o.push_str("],\"groups\":[");
        self.json_groups(&mut o);
        o.push_str("],\"filters\":[");
        self.json_palette(&mut o);
        o.push_str("],\"events\":[");
        self.json_events(&mut o);
        o.push_str("],\"lesson\":");
        self.lesson_json(&mut o);
        o.push_str(if self.demo.is_empty() { ",\"hasDemo\":false}" } else { ",\"hasDemo\":true}" });
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
    fn json_groups(&self, o: &mut String) {
        for (i, (gid, name, members)) in self.group_rows().iter().enumerate() {
            if i > 0 {
                o.push(',');
            }
            let card = self.node_card(gid);
            let (status, devices) = card.as_ref().map_or(("up", 0), |c| (c.status, c.devices));
            o.push_str(&format!(
                "{{\"id\":{},\"name\":{},\"members\":[{}],\"devices\":{},\"status\":{}}}",
                s(gid), s(name),
                members.iter().map(|m| s(m)).collect::<Vec<_>>().join(","),
                devices, s(status)
            ));
        }
    }

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
