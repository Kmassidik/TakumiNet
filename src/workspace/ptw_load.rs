use super::*;

impl Workspace {
    /// Rebuilds a workspace from the text written by `to_ptw`.
    pub fn from_ptw(text: &str) -> Option<Workspace> {
        let mut ws = Workspace::empty();
        for line in text.lines() {
            if line.starts_with('#') || line.trim().is_empty() {
                continue;
            }
            let f: Vec<&str> = line.split('\t').collect();
            ws.load_topology_line(&f)?;
            ws.load_device_setting_line(&f)?;
            ws.load_app_service_line(&f)?;
            ws.load_security_line(&f)?;
            ws.load_iot_wireless_line(&f)?;
            ws.load_routing_line(&f)?;
        }
        ws.recompute_routing();
        for d in &ws.devices {
            *ws.counters.entry(d.kind.clone()).or_insert(0) += 1;
        }
        Some(ws)
    }

    /// Devices, cables, addresses, routes and ports.
    fn load_topology_line(&mut self, f: &[&str]) -> Option<()> {
        match f {
            ["device", id, kind, model, x, y, name] => self.devices.push(Device {
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
            ["device", id, kind, model, x, y, name, ip, prefix] => self.devices.push(Device {
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
                let (Some(net), Some(via)) = (
                    crate::model::parse_ipv4(net),
                    crate::model::parse_ipv4(via),
                ) else {
                    return Some(());
                };
                let prefix = prefix.parse::<u8>().unwrap_or(24);
                if let Some(d) = self.devices.iter_mut().find(|d| d.id == *id) {
                    d.routes.push((net, prefix, via));
                }
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
                self.dhcp_pools.insert(
                    id.to_string(),
                    Pool {
                        network: net,
                        prefix: prefix.parse().unwrap_or(24),
                        gateway: crate::model::parse_ipv4(gw),
                        dns: crate::model::parse_ipv4(dns),
                    },
                );
                self.dhcp_leases.entry(id.to_string()).or_default();
            }
            ["dhcpclient", id] => {
                self.dhcp_clients.insert(id.to_string());
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

    /// IoT, cell, Wi-Fi, VPN, PPPoE and phones.
    fn load_iot_wireless_line(&mut self, f: &[&str]) -> Option<()> {
        match f {
            ["iot", dev, addr, value] => {
                if let (Ok(a), Ok(v)) = (addr.parse::<u16>(), value.parse::<u16>()) {
                    let _ = self.iot_write(dev, a, v);
                }
            }
            ["ptp", slave, master, offset] => {
                if let Ok(off) = offset.parse::<f64>() {
                    self.ptp.insert(slave.to_string(), (master.to_string(), off));
                }
            }
            ["prpon", dev] => {
                self.prp_on.insert(dev.to_string());
            }
            ["cell", client, tower] => {
                self.cell_links
                    .insert(client.to_string(), tower.to_string());
            }
            ["wlan", wlc, ssid, psk, security] => {
                let _ = self.wlan_add_with(
                    wlc,
                    &unescape_field(ssid),
                    &unescape_field(psk),
                    security.to_string(),
                );
            }
            ["wlan", wlc, ssid, psk] => {
                let _ = self.wlan_add(wlc, &unescape_field(ssid), &unescape_field(psk));
            }
            ["capwap", ap, wlc] => {
                let _ = self.capwap_join(ap, wlc);
            }
            ["wifi", client, ssid, wlc] => {
                self.wifi
                    .insert(client.to_string(), (unescape_field(ssid), wlc.to_string()));
            }
            ["vpn", client, server, user] => {
                self.vpn.insert(
                    client.to_string(),
                    (server.to_string(), unescape_field(user)),
                );
            }
            ["pppoe", client, server, user] => {
                self.pppoe.insert(
                    client.to_string(),
                    (server.to_string(), unescape_field(user)),
                );
            }
            ["phone", phone, cm, ext] => {
                if let Ok(e) = ext.parse::<u16>() {
                    self.phones.insert(phone.to_string(), (cm.to_string(), e));
                }
            }
            _ => {}
        }
        Some(())
    }

    /// Routing protocols and NAT.
    fn load_routing_line(&mut self, f: &[&str]) -> Option<()> {
        match f {
            ["routing", dev, proto] => {
                self.routing
                    .entry(dev.to_string())
                    .or_default()
                    .0 = proto.to_string();
            }
            ["routenet", dev, net, prefix] => {
                if let (Some(n), Ok(p)) =
                    (crate::model::parse_ipv4(net), prefix.parse::<u8>())
                {
                    let entry = self.routing.entry(dev.to_string()).or_default();
                    if !entry.1.iter().any(|(a, b)| *a == n && *b == p) {
                        entry.1.push((n, p));
                    }
                }
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
