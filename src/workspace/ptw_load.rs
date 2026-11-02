use super::*;

impl Workspace {
    pub fn from_ptw(text: &str) -> Option<Workspace> {
        let mut ws = Workspace {
            devices: Vec::new(),
            links: Vec::new(),
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
            acls: HashMap::new(),
            acl_bindings: HashMap::new(),
            nat_roles: HashMap::new(),
            nat_rules: HashMap::new(),
            nat_translations: HashMap::new(),
            routing: HashMap::new(),
            dyn_routes: HashMap::new(),
            stp_modes: HashMap::new(),
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
        };
        for line in text.lines() {
            if line.starts_with('#') || line.trim().is_empty() {
                continue;
            }
            let f: Vec<&str> = line.split('\t').collect();
            match f.as_slice() {
                ["device", id, kind, model, x, y, name] => ws.devices.push(Device {
                    id: id.to_string(),
                    name: name.to_string(),
                    model: model.to_string(),
                    icon: logical_icon(kind).to_string(),
                    kind: kind.to_string(),
                    x: x.parse().ok()?,
                    y: y.parse().ok()?,
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
                }),
                ["device", id, kind, model, x, y, name, ip, prefix] => ws.devices.push(Device {
                    id: id.to_string(),
                    name: name.to_string(),
                    model: model.to_string(),
                    icon: logical_icon(kind).to_string(),
                    kind: kind.to_string(),
                    x: x.parse().ok()?,
                    y: y.parse().ok()?,
                    ip: crate::model::parse_ipv4(ip),
                    prefix: prefix.parse().unwrap_or(24),
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
                }),
                ["link", a, a_port, b, b_port] => ws.links.push(Link {
                    a: a.to_string(),
                    a_port: a_port.to_string(),
                    b: b.to_string(),
                    b_port: b_port.to_string(),
                    kind: "eCopper".into(),
                }),
                ["link", a, a_port, b, b_port, kind] => ws.links.push(Link {
                    a: a.to_string(),
                    a_port: a_port.to_string(),
                    b: b.to_string(),
                    b_port: b_port.to_string(),
                    kind: kind.to_string(),
                }),
                ["net", id, gw, dns] => {
                    if let Some(d) = ws.devices.iter_mut().find(|d| d.id == *id) {
                        d.gateway = crate::model::parse_ipv4(gw);
                        d.dns = crate::model::parse_ipv4(dns);
                    }
                }
                ["route", id, net, prefix, via] => {
                    let (Some(net), Some(via)) = (
                        crate::model::parse_ipv4(net),
                        crate::model::parse_ipv4(via),
                    ) else {
                        continue;
                    };
                    let prefix = prefix.parse::<u8>().unwrap_or(24);
                    if let Some(d) = ws.devices.iter_mut().find(|d| d.id == *id) {
                        d.routes.push((net, prefix, via));
                    }
                }
                ["port", id, name, up, ip, prefix] => {
                    if let Some(d) = ws.devices.iter_mut().find(|d| d.id == *id) {
                        if let Some(p) = d.ports.iter_mut().find(|p| p.name == *name) {
                            p.up = *up == "1";
                            p.ip = crate::model::parse_ipv4(ip);
                            p.prefix = prefix.parse().unwrap_or(24);
                        }
                    }
                }
                ["port", id, name, up, ip, prefix, vlan, trunk] => {
                    if let Some(d) = ws.devices.iter_mut().find(|d| d.id == *id) {
                        if let Some(p) = d.ports.iter_mut().find(|p| p.name == *name) {
                            p.up = *up == "1";
                            p.ip = crate::model::parse_ipv4(ip);
                            p.prefix = prefix.parse().unwrap_or(24);
                            p.vlan = vlan.parse().unwrap_or(1);
                            p.trunk = *trunk == "1";
                        }
                    }
                }
                ["vlan", id, vlan, name] => {
                    let _ = ws.vlan_create(id, vlan.parse().unwrap_or(0), &unescape_field(name));
                }
                ["pool", id, network, prefix, gw, dns] => {
                    let Some(net) = crate::model::parse_ipv4(network) else {
                        continue;
                    };
                    ws.dhcp_pools.insert(
                        id.to_string(),
                        Pool {
                            network: net,
                            prefix: prefix.parse().unwrap_or(24),
                            gateway: crate::model::parse_ipv4(gw),
                            dns: crate::model::parse_ipv4(dns),
                        },
                    );
                    ws.dhcp_leases.entry(id.to_string()).or_default();
                }
                ["dhcpclient", id] => {
                    ws.dhcp_clients.insert(id.to_string());
                }
                ["banner", id, text] => {
                    ws.banners.insert(id.to_string(), unescape_field(text));
                }
                ["linepw", id, pw] => {
                    ws.line_passwords.insert(id.to_string(), unescape_field(pw));
                }
                ["v6", id, auto, addr, prefix, gw, dns] => {
                    if let Some(d) = ws.devices.iter_mut().find(|d| d.id == *id) {
                        d.ipv6_auto = *auto == "1";
                        d.ipv6 = (!addr.is_empty()).then(|| addr.to_string());
                        d.ipv6_prefix = prefix.parse().unwrap_or(64);
                        d.ipv6_gateway = (!gw.is_empty()).then(|| gw.to_string());
                        d.ipv6_dns = (!dns.is_empty()).then(|| dns.to_string());
                    }
                }
                ["dot1x", id, enabled, user, pass] => {
                    if let Some(d) = ws.devices.iter_mut().find(|d| d.id == *id) {
                        d.dot1x = *enabled == "1";
                        d.dot1x_user =
                            (!user.is_empty()).then(|| unescape_field(user));
                        d.dot1x_pass =
                            (!pass.is_empty()).then(|| unescape_field(pass));
                    }
                }
                ["power", id, state] => {
                    if *state == "0" {
                        ws.powered_off.insert(id.to_string());
                    }
                }
                ["module", id, slot, model] => {
                    let slot = slot.parse::<usize>().unwrap_or(0);
                    // Inserting a module only adds ports, so it is safe even
                    // though links were parsed first.
                    let _ = ws.set_module(id, slot, model);
                }
                ["dns", id, name, ip] => {
                    let _ = ws.set_dns_record(id, name, ip);
                }
                ["page", id, body] => {
                    ws.set_http_page(id, &unescape_field(body));
                }
                ["reserve", server, client, ip] => {
                    let _ = ws.set_dhcp_reservation(server, client, ip);
                }
                ["helper", router, iface, ip] => {
                    let _ = ws.set_dhcp_helper(router, iface, ip);
                }
                ["mailuser", server, user, pass] => {
                    let _ = ws.add_mail_user(server, &unescape_field(user), &unescape_field(pass));
                }
                ["mail", server, from, to, subject, body, read] => {
                    ws.mail.entry(server.to_string()).or_default().push(Mail {
                        from: unescape_field(from),
                        to: unescape_field(to),
                        subject: unescape_field(subject),
                        body: unescape_field(body),
                        read: *read == "1",
                    });
                }
                ["tftp", server, name, content] => {
                    let _ = ws.tftp_put(
                        server,
                        &unescape_field(name),
                        &unescape_field(content),
                    );
                }
                ["ftp", server, name, content] => {
                    let _ = ws.ftp_put(
                        server,
                        &unescape_field(name),
                        &unescape_field(content),
                    );
                }
                ["ntp", client, server, offset] => {
                    if let Ok(off) = offset.parse::<f64>() {
                        ws.ntp.insert(client.to_string(), (server.to_string(), off));
                    }
                }
                ["syslogon", device] => {
                    ws.syslog_on.insert(device.to_string());
                }
                ["syslog", device, time, severity, text] => {
                    if let Ok(t) = time.parse::<f32>() {
                        ws.syslog
                            .entry(device.to_string())
                            .or_default()
                            .push((t, severity.to_string(), unescape_field(text)));
                    }
                }
                ["aaa", server, user, pass] => {
                    let _ = ws.aaa_add_user(
                        server,
                        &unescape_field(user),
                        &unescape_field(pass),
                    );
                }
                ["portsec", dev, iface, max, macs] => {
                    if let Ok(m) = max.parse::<u16>() {
                        let macs = if macs.is_empty() {
                            Vec::new()
                        } else {
                            macs.split(',').map(|m| m.to_string()).collect()
                        };
                        ws.port_security
                            .entry(dev.to_string())
                            .or_default()
                            .insert(iface.to_string(), PortSecurity { max: m, macs });
                    }
                }
                ["channel", dev, iface, group] => {
                    if let Ok(g) = group.parse::<u16>() {
                        ws.channels
                            .entry(dev.to_string())
                            .or_default()
                            .insert(iface.to_string(), g);
                    }
                }
                ["acl", dev, num, action, src, swc, dip, dwc] => {
                    let number = num.parse::<u16>().unwrap_or(0);
                    let permit = *action == "permit";
                    let sip = crate::model::parse_ipv4(src).unwrap_or(0);
                    let swc = crate::model::parse_ipv4(swc).unwrap_or(0);
                    let dst = if *dip == "-" {
                        None
                    } else {
                        crate::model::parse_ipv4(dip).map(|d| {
                            (d, crate::model::parse_ipv4(dwc).unwrap_or(0))
                        })
                    };
                    if number > 0 {
                        let _ = ws.acl_add(dev, number, permit, sip, swc, dst);
                    }
                }
                ["aclbind", dev, iface, num, dir] => {
                    if let Ok(n) = num.parse::<u16>() {
                        ws.acl_bindings
                            .entry(dev.to_string())
                            .or_default()
                            .insert(iface.to_string(), (n, *dir == "in"));
                    }
                }
                ["v6net", dev, net] => {
                    let _ = ws.add_v6_network(dev, net);
                }
                ["inspect", dev] => {
                    ws.inspect.insert(dev.to_string(), true);
                }
                ["ips", dev, proto] => {
                    ws.ips.entry(dev.to_string()).or_default().push(proto.to_string());
                }
                ["iot", dev, addr, value] => {
                    if let (Ok(a), Ok(v)) = (addr.parse::<u16>(), value.parse::<u16>()) {
                        let _ = ws.iot_write(dev, a, v);
                    }
                }
                ["ptp", slave, master, offset] => {
                    if let Ok(off) = offset.parse::<f64>() {
                        ws.ptp.insert(slave.to_string(), (master.to_string(), off));
                    }
                }
                ["prpon", dev] => {
                    ws.prp_on.insert(dev.to_string());
                }
                ["cell", client, tower] => {
                    ws.cell_links
                        .insert(client.to_string(), tower.to_string());
                }
                ["wlan", wlc, ssid, psk, security] => {
                    let _ = ws.wlan_add_with(
                        wlc,
                        &unescape_field(ssid),
                        &unescape_field(psk),
                        security.to_string(),
                    );
                }
                ["wlan", wlc, ssid, psk] => {
                    let _ = ws.wlan_add(wlc, &unescape_field(ssid), &unescape_field(psk));
                }
                ["capwap", ap, wlc] => {
                    let _ = ws.capwap_join(ap, wlc);
                }
                ["wifi", client, ssid, wlc] => {
                    ws.wifi
                        .insert(client.to_string(), (unescape_field(ssid), wlc.to_string()));
                }
                ["vpn", client, server, user] => {
                    ws.vpn.insert(
                        client.to_string(),
                        (server.to_string(), unescape_field(user)),
                    );
                }
                ["pppoe", client, server, user] => {
                    ws.pppoe.insert(
                        client.to_string(),
                        (server.to_string(), unescape_field(user)),
                    );
                }
                ["phone", phone, cm, ext] => {
                    if let Ok(e) = ext.parse::<u16>() {
                        ws.phones.insert(phone.to_string(), (cm.to_string(), e));
                    }
                }
                ["routing", dev, proto] => {
                    ws.routing
                        .entry(dev.to_string())
                        .or_default()
                        .0 = proto.to_string();
                }
                ["routenet", dev, net, prefix] => {
                    if let (Some(n), Ok(p)) =
                        (crate::model::parse_ipv4(net), prefix.parse::<u8>())
                    {
                        let entry = ws.routing.entry(dev.to_string()).or_default();
                        if !entry.1.iter().any(|(a, b)| *a == n && *b == p) {
                            entry.1.push((n, p));
                        }
                    }
                }
                ["natrole", dev, iface, dir] => {
                    ws.nat_roles
                        .entry(dev.to_string())
                        .or_default()
                        .insert(iface.to_string(), *dir == "in");
                }
                ["natrule", dev, num, iface] => {
                    if let Ok(n) = num.parse::<u16>() {
                        let _ = ws.add_nat_rule(dev, n, iface);
                    }
                }
                _ => continue,
            }
        }
        ws.recompute_routing();
        for d in &ws.devices {
            *ws.counters.entry(d.kind.clone()).or_insert(0) += 1;
        }
        Some(ws)
    }
}
