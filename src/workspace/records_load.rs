use super::*;

impl Workspace {
    /// Read-only compatibility with the previous text persistence format.
    pub fn from_ptw(text: &str) -> Option<Workspace> {
        Self::from_records(text)
    }

    pub(crate) fn from_records(text: &str) -> Option<Workspace> {
        let mut ws = Workspace::empty();
        for line in text.lines() {
            if line.starts_with('#') || line.trim().is_empty() {
                continue;
            }
            let f: Vec<&str> = line.split('\t').collect();
            ws.load_record(&f)?;
        }
        ws.finish_record_load();
        Some(ws)
    }

    pub(super) fn load_record(&mut self, f: &[&str]) -> Option<()> {
        self.load_topology_line(f)?;
        self.load_device_setting_line(f)?;
        self.load_app_service_line(f)?;
        self.load_security_line(f)?;
        self.load_iot_wireless_line(f)?;
        self.load_routing_line(f)?;
        self.load_lesson_line(f)?;
        Some(())
    }

    pub(super) fn finish_record_load(&mut self) {
        self.sort_lesson_steps();
        self.recompute_routing();
        for d in &self.devices {
            *self.counters.entry(d.kind.clone()).or_insert(0) += 1;
        }
    }

    /// Devices, cables, addresses, routes and ports.
    fn load_topology_line(&mut self, f: &[&str]) -> Option<()> {
        match f {
            ["device", id, kind, model, x, y, name] => self.devices.push(Device {
                id: id.to_string(),
                name: name.to_string(),
                model: model.to_string(),
                icon: logical_icon(palette::canonical_model(model), kind),
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
            ["device", id, kind, model, x, y, name, ip, prefix] => self.devices.push(Device {
                id: id.to_string(),
                name: name.to_string(),
                model: model.to_string(),
                icon: logical_icon(palette::canonical_model(model), kind),
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
            ["link", a, a_port, b, b_port] => self.links.push(Link {
                a: a.to_string(),
                a_port: a_port.to_string(),
                b: b.to_string(),
                b_port: b_port.to_string(),
                kind: "eCopper".into(),
            }),
            ["link", a, a_port, b, b_port, kind] => self.links.push(Link {
                a: a.to_string(),
                a_port: a_port.to_string(),
                b: b.to_string(),
                b_port: b_port.to_string(),
                kind: kind.to_string(),
            }),
            ["net", id, gw, dns] => {
                if let Some(d) = self.devices.iter_mut().find(|d| d.id == *id) {
                    d.gateway = crate::model::parse_ipv4(gw);
                    d.dns = crate::model::parse_ipv4(dns);
                }
            }
            ["route", id, net, prefix, via] => {
                records_load_routing::load_route(self, id, net, prefix, via, "1");
            }
            ["route", id, net, prefix, via, admin_distance] => {
                records_load_routing::load_route(self, id, net, prefix, via, admin_distance);
            }
            ["port", id, name, up, ip, prefix] => {
                if let Some(d) = self.devices.iter_mut().find(|d| d.id == *id) {
                    if let Some(p) = d.ports.iter_mut().find(|p| p.name == *name) {
                        p.up = *up == "1";
                        p.ip = crate::model::parse_ipv4(ip);
                        p.prefix = prefix.parse().unwrap_or(24);
                    }
                }
            }
            ["port", id, name, up, ip, prefix, vlan, trunk] => {
                if let Some(d) = self.devices.iter_mut().find(|d| d.id == *id) {
                    if let Some(p) = d.ports.iter_mut().find(|p| p.name == *name) {
                        p.up = *up == "1";
                        p.ip = crate::model::parse_ipv4(ip);
                        p.prefix = prefix.parse().unwrap_or(24);
                        p.vlan = vlan.parse().unwrap_or(1);
                        p.trunk = *trunk == "1";
                    }
                }
            }
            ["port", id, name, up, ip, prefix, vlan, trunk, dot1q, metrics @ ..] => {
                if let Some(d) = self.devices.iter_mut().find(|d| d.id == *id) {
                    if !d.ports.iter().any(|p| p.name == *name) && name.contains('.') {
                        d.ports.push(PortCfg {
                            name: name.to_string(),
                            ip: None,
                            prefix: 24,
                            up: true,
                            vlan: 1,
                            trunk: false,
                            dot1q: None,
                            bandwidth_kbps: default_port_metrics(name).0,
                            delay_us: default_port_metrics(name).1,
                        });
                    }
                    if let Some(p) = d.ports.iter_mut().find(|p| p.name == *name) {
                        p.up = *up == "1";
                        p.ip = crate::model::parse_ipv4(ip);
                        p.prefix = prefix.parse().unwrap_or(24);
                        p.vlan = vlan.parse().unwrap_or(1);
                        p.trunk = *trunk == "1";
                        p.dot1q = dot1q.parse::<u16>().ok();
                        if let [bandwidth, delay] = metrics {
                            p.bandwidth_kbps = bandwidth
                                .parse()
                                .unwrap_or_else(|_| default_port_metrics(name).0);
                            p.delay_us = delay
                                .parse()
                                .unwrap_or_else(|_| default_port_metrics(name).1);
                        }
                    }
                }
            }
            _ => {}
        }
        Some(())
    }

    /// VLANs, DHCP, banners, power, modules, DNS and HTTP pages.
    fn load_device_setting_line(&mut self, f: &[&str]) -> Option<()> {
        match f {
            ["vlan", id, vlan, name] => {
                let _ = self.vlan_create(id, vlan.parse().unwrap_or(0), &unescape_field(name));
            }
            ["pool", id, network, prefix, gw, dns] => {
                let Some(net) = crate::model::parse_ipv4(network) else {
                    return Some(());
                };
                let pool = Pool {
                    network: net,
                    prefix: prefix.parse().unwrap_or(24),
                    gateway: crate::model::parse_ipv4(gw),
                    dns: crate::model::parse_ipv4(dns),
                };
                if self.dhcp_pools.contains_key(*id) {
                    self.dhcp_more.entry(id.to_string()).or_default().push(pool);
                } else {
                    self.dhcp_pools.insert(id.to_string(), pool);
                }
                self.dhcp_leases.entry(id.to_string()).or_default();
            }
            ["dhcpclient", id] => {
                self.dhcp_clients.insert(id.to_string());
            }
            ["note", id, x, y, color, text] => {
                self.notes.push(Note {
                    id: id.to_string(),
                    x: x.parse().ok()?,
                    y: y.parse().ok()?,
                    color: unescape_field(color),
                    text: unescape_field(text),
                });
            }
            ["demo", kind, from, to, url] => {
                self.demo.push(Demo {
                    kind: unescape_field(kind),
                    from: from.to_string(),
                    to: to.to_string(),
                    url: unescape_field(url),
                });
            }
            ["banner", id, text] => {
                self.banners.insert(id.to_string(), unescape_field(text));
            }
            ["linepw", id, pw] => {
                self.line_passwords.insert(id.to_string(), unescape_field(pw));
            }
            ["v6", id, auto, addr, prefix, gw, dns] => {
                if let Some(d) = self.devices.iter_mut().find(|d| d.id == *id) {
                    d.ipv6_auto = *auto == "1";
                    d.ipv6 = (!addr.is_empty()).then(|| addr.to_string());
                    d.ipv6_prefix = prefix.parse().unwrap_or(64);
                    d.ipv6_gateway = (!gw.is_empty()).then(|| gw.to_string());
                    d.ipv6_dns = (!dns.is_empty()).then(|| dns.to_string());
                }
            }
            ["dot1x", id, enabled, user, pass] => {
                if let Some(d) = self.devices.iter_mut().find(|d| d.id == *id) {
                    d.dot1x = *enabled == "1";
                    d.dot1x_user =
                        (!user.is_empty()).then(|| unescape_field(user));
                    d.dot1x_pass =
                        (!pass.is_empty()).then(|| unescape_field(pass));
                }
            }
            ["power", id, state] => {
                if *state == "0" {
                    self.powered_off.insert(id.to_string());
                }
            }
            ["module", id, slot, model] => {
                let slot = slot.parse::<usize>().unwrap_or(0);
                // Inserting a module only adds ports, so it is safe even
                // though links were parsed first.
                let _ = self.set_module(id, slot, model);
            }
            ["dns", id, name, ip] => {
                let _ = self.set_dns_record(id, name, ip);
            }
            ["page", id, body] => {
                self.set_http_page(id, &unescape_field(body));
            }
            ["reserve", server, client, ip] => {
                let _ = self.set_dhcp_reservation(server, client, ip);
            }
            ["helper", router, iface, ip] => {
                let _ = self.set_dhcp_helper(router, iface, ip);
            }
            _ => {}
        }
        Some(())
    }

    /// Mail, TFTP, FTP, NTP, syslog and AAA.
    fn load_app_service_line(&mut self, f: &[&str]) -> Option<()> {
        match f {
            ["mailuser", server, user, pass] => {
                let _ = self.add_mail_user(server, &unescape_field(user), &unescape_field(pass));
            }
            ["mail", server, from, to, subject, body, read] => {
                self.mail.entry(server.to_string()).or_default().push(Mail {
                    from: unescape_field(from),
                    to: unescape_field(to),
                    subject: unescape_field(subject),
                    body: unescape_field(body),
                    read: *read == "1",
                });
            }
            ["tftp", server, name, content] => {
                let _ = self.tftp_put(
                    server,
                    &unescape_field(name),
                    &unescape_field(content),
                );
            }
            ["ftp", server, name, content] => {
                let _ = self.ftp_put(
                    server,
                    &unescape_field(name),
                    &unescape_field(content),
                );
            }
            ["ntp", client, server, offset] => {
                if let Ok(off) = offset.parse::<f64>() {
                    self.ntp.insert(client.to_string(), (server.to_string(), off));
                }
            }
            ["syslogon", device] => {
                self.syslog_on.insert(device.to_string());
            }
            ["syslog", device, time, severity, text] => {
                if let Ok(t) = time.parse::<f32>() {
                    self.syslog
                        .entry(device.to_string())
                        .or_default()
                        .push((t, severity.to_string(), unescape_field(text)));
                }
            }
            ["aaa", server, user, pass] => {
                let _ = self.aaa_add_user(
                    server,
                    &unescape_field(user),
                    &unescape_field(pass),
                );
            }
            _ => {}
        }
        Some(())
    }

    /// Port security, channels, ACLs, IPv6 networks and firewall features.
    fn load_security_line(&mut self, f: &[&str]) -> Option<()> {
        match f {
            ["portsec", dev, iface, max, macs] => {
                if let Ok(m) = max.parse::<u16>() {
                    let macs = if macs.is_empty() {
                        Vec::new()
                    } else {
                        macs.split(',').map(|m| m.to_string()).collect()
                    };
                    self.port_security
                        .entry(dev.to_string())
                        .or_default()
                        .insert(iface.to_string(), PortSecurity { max: m, macs });
                }
            }
            ["channel", dev, iface, group] => {
                if let Ok(g) = group.parse::<u16>() {
                    self.channels
                        .entry(dev.to_string())
                        .or_default()
                        .insert(iface.to_string(), g);
                }
            }
            ["channel", dev, iface, group, mode] => {
                if let Ok(g) = group.parse::<u16>() {
                    self.channels
                        .entry(dev.to_string())
                        .or_default()
                        .insert(iface.to_string(), g);
                    self.channel_modes
                        .entry(dev.to_string())
                        .or_default()
                        .insert(iface.to_string(), mode.to_string());
                }
            }
            ["stpmode", dev, mode] => {
                self.stp_modes.insert(dev.to_string(), mode.to_string());
            }
            ["stppriority", dev, vlan, priority] => {
                if let (Ok(vlan), Ok(priority)) = (vlan.parse::<u16>(), priority.parse::<u16>()) {
                    self.stp_priorities
                        .entry(dev.to_string())
                        .or_default()
                        .insert(vlan, priority);
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
                    let _ = self.acl_add(dev, number, permit, sip, swc, dst);
                }
            }
            ["aclbind", dev, iface, num, dir] => {
                if let Ok(n) = num.parse::<u16>() {
                    self.acl_bindings
                        .entry(dev.to_string())
                        .or_default()
                        .insert(iface.to_string(), (n, *dir == "in"));
                }
            }
            ["v6net", dev, net] => {
                let _ = self.add_v6_network(dev, net);
            }
            ["poe", dev] => self.load_poe_device(dev),
            ["wifiradio", id, channel, band] => self.wifi_radio_load(id, channel, band),
            ["mirror", rest @ ..] if rest.len() == 3 => self.mirror_load(rest),
            ["mirror", rest @ ..] if rest.len() == 4 => self.mirror_load(rest),
            ["pending", src, dst] => self.pending_load(src, dst),
            ["fhrp", rest @ ..] if rest.len() == 6 => self.fhrp_load(rest),
            ["wififeat", wlc, r, k, v] => self.set_roam_features(wlc, *r == "1", *k == "1", *v == "1"),
            ["qosport", rest @ ..] => {
                let mut row = vec![f[0]]; row.extend_from_slice(rest); self.qos_load(&row)
            }
            ["dot1xport" | "radius", rest @ ..] => {
                let mut row = vec![f[0]]; row.extend_from_slice(rest); self.dot1x_load(&row)
            }
            ["sshenable" | "sshhost" | "sshuser" | "sshauth" | "sshclient", rest @ ..] => {
                let mut row = vec![f[0]]; row.extend_from_slice(rest); self.ssh_load(&row)
            },
            ["fhrp", rest @ ..] if rest.len() == 8 => self.fhrp_load(rest),
            ["dhcpsnoop", dev] => self.snoop_load(&["dhcpsnoop", dev]),
            ["snoopvlan", dev, vlan] => self.snoop_load(&["snoopvlan", dev, vlan]),
            ["snooptrust", dev, port] => self.snoop_load(&["snooptrust", dev, port]),
            ["snoopbind", sw, port, mac, ip, vlan] => self.snoop_load(&["snoopbind", sw, port, mac, ip, vlan]),
            ["arpinspect", dev] => self.snoop_load(&["arpinspect", dev]),
            ["portfast", dev, port] => self.l2_guard_load("portfast", &[dev, port]),
            ["bpduguard", dev, port] => self.l2_guard_load("bpduguard", &[dev, port]),
            ["storm", dev, port, level] => self.l2_guard_load("storm", &[dev, port, level]),
            ["collisions", id, count] => {
                if let Ok(n) = count.parse::<u32>() {
                    self.collisions.insert(id.to_string(), n);
                }
            }
            ["poeport", dev, port, _mode] => self.load_poe_port(dev, port),
            ["linkset", dev, port, speed, duplex] => self.load_link_setting(dev, port, speed, duplex),
            ["ufw", dev, enabled, default] => self.ufw_load_policy(dev, enabled, default),
            ["ufwrule", dev, action, proto, port, from] => self.ufw_load_rule(dev, action, proto, port, from),
            ["inspect", dev] => {
                self.inspect.insert(dev.to_string(), true);
            }
            ["ips", dev, proto] => {
                self.ips.entry(dev.to_string()).or_default().push(proto.to_string());
            }
            _ => {}
        }
        Some(())
    }

}
