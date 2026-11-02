use super::*;

impl Workspace {
    /// Portable text format: tab-separated, one device or link per line.
    pub fn to_ptw(&self) -> String {
        let mut out = String::from("# pt-web topology 1\n");
        for d in &self.devices {
            out.push_str(&format!(
                "device\t{}\t{}\t{}\t{}\t{}\t{}\t{}\t{}\n",
                d.id,
                d.kind,
                d.model,
                d.x,
                d.y,
                d.name,
                d.ip.map(crate::model::ipv4_string).unwrap_or_default(),
                d.prefix
            ));
            if d.gateway.is_some() || d.dns.is_some() {
                out.push_str(&format!(
                    "net\t{}\t{}\t{}\n",
                    d.id,
                    d.gateway.map(crate::model::ipv4_string).unwrap_or_default(),
                    d.dns.map(crate::model::ipv4_string).unwrap_or_default()
                ));
            }
            for (net, prefix, via) in &d.routes {
                out.push_str(&format!(
                    "route\t{}\t{}\t{}\t{}\n",
                    d.id,
                    crate::model::ipv4_string(*net),
                    prefix,
                    crate::model::ipv4_string(*via)
                ));
            }
            for p in &d.ports {
                if p.ip.is_some() || !p.up || p.vlan != 1 || p.trunk {
                    out.push_str(&format!(
                        "port\t{}\t{}\t{}\t{}\t{}\t{}\t{}\n",
                        d.id,
                        p.name,
                        u8::from(p.up),
                        p.ip.map(crate::model::ipv4_string).unwrap_or_default(),
                        p.prefix,
                        p.vlan,
                        u8::from(p.trunk)
                    ));
                }
            }
            if d.ipv6.is_some() || d.ipv6_auto || d.ipv6_gateway.is_some() || d.ipv6_dns.is_some()
            {
                out.push_str(&format!(
                    "v6\t{}\t{}\t{}\t{}\t{}\t{}\n",
                    d.id,
                    u8::from(d.ipv6_auto),
                    d.ipv6.clone().unwrap_or_default(),
                    d.ipv6_prefix,
                    d.ipv6_gateway.clone().unwrap_or_default(),
                    d.ipv6_dns.clone().unwrap_or_default()
                ));
            }
            if d.dot1x || d.dot1x_user.is_some() || d.dot1x_pass.is_some() {
                out.push_str(&format!(
                    "dot1x\t{}\t{}\t{}\t{}\n",
                    d.id,
                    u8::from(d.dot1x),
                    escape_field(d.dot1x_user.as_deref().unwrap_or("")),
                    escape_field(d.dot1x_pass.as_deref().unwrap_or(""))
                ));
            }
        }
        for l in &self.links {
            out.push_str(&format!(
                "link\t{}\t{}\t{}\t{}\t{}\n",
                l.a, l.a_port, l.b, l.b_port, l.kind
            ));
        }
        let mut pools: Vec<_> = self.dhcp_pools.iter().collect();
        pools.sort_by_key(|(id, _)| id.as_str());
        for (id, p) in pools {
            out.push_str(&format!(
                "pool\t{}\t{}\t{}\t{}\t{}\n",
                id,
                crate::model::ipv4_string(p.network),
                p.prefix,
                p.gateway.map(crate::model::ipv4_string).unwrap_or_default(),
                p.dns.map(crate::model::ipv4_string).unwrap_or_default()
            ));
        }
        let mut clients: Vec<_> = self.dhcp_clients.iter().collect();
        clients.sort();
        for id in clients {
            out.push_str(&format!("dhcpclient\t{id}\n"));
        }
        let mut banners: Vec<_> = self.banners.iter().collect();
        banners.sort_by_key(|(id, _)| id.as_str());
        for (id, text) in banners {
            out.push_str(&format!("banner\t{}\t{}\n", id, escape_field(text)));
        }
        let mut lines: Vec<_> = self.line_passwords.iter().collect();
        lines.sort_by_key(|(id, _)| id.as_str());
        for (id, pw) in lines {
            out.push_str(&format!("linepw\t{}\t{}\n", id, escape_field(pw)));
        }
        let mut off: Vec<_> = self.powered_off.iter().collect();
        off.sort();
        for id in off {
            out.push_str(&format!("power\t{id}\t0\n"));
        }
        let mut slots: Vec<_> = self.slots.iter().collect();
        slots.sort_by_key(|(id, _)| id.as_str());
        for (id, list) in slots {
            for (slot, module) in list.iter().enumerate() {
                if let Some(name) = module {
                    out.push_str(&format!("module\t{}\t{}\t{}\n", id, slot, name));
                }
            }
        }
        let mut vlan_defs: Vec<_> = self.vlans.iter().collect();
        vlan_defs.sort_by_key(|(id, _)| id.as_str());
        for (id, list) in vlan_defs {
            for (vlan, name) in list {
                out.push_str(&format!("vlan\t{}\t{}\t{}\n", id, vlan, escape_field(name)));
            }
        }
        let mut mail_users: Vec<_> = self.mail_users.iter().collect();
        mail_users.sort_by_key(|(id, _)| id.as_str());
        for (id, list) in mail_users {
            for (user, pass) in list {
                out.push_str(&format!(
                    "mailuser\t{}\t{}\t{}\n",
                    id,
                    escape_field(user),
                    escape_field(pass)
                ));
            }
        }
        let mut mails: Vec<_> = self.mail.iter().collect();
        mails.sort_by_key(|(id, _)| id.as_str());
        for (id, list) in mails {
            for m in list {
                out.push_str(&format!(
                    "mail\t{}\t{}\t{}\t{}\t{}\t{}\n",
                    id,
                    escape_field(&m.from),
                    escape_field(&m.to),
                    escape_field(&m.subject),
                    escape_field(&m.body),
                    u8::from(m.read)
                ));
            }
        }
        let mut tftp: Vec<_> = self.tftp.iter().collect();
        tftp.sort_by_key(|(id, _)| id.as_str());
        for (id, list) in tftp {
            for (name, content) in list {
                out.push_str(&format!(
                    "tftp\t{}\t{}\t{}\n",
                    id,
                    escape_field(name),
                    escape_field(content)
                ));
            }
        }
        let mut ftp: Vec<_> = self.ftp.iter().collect();
        ftp.sort_by_key(|(id, _)| id.as_str());
        for (id, list) in ftp {
            for (name, content) in list {
                out.push_str(&format!(
                    "ftp\t{}\t{}\t{}\n",
                    id,
                    escape_field(name),
                    escape_field(content)
                ));
            }
        }
        let mut ntp: Vec<_> = self.ntp.iter().collect();
        ntp.sort_by_key(|(id, _)| id.as_str());
        for (id, (server, offset)) in ntp {
            out.push_str(&format!("ntp\t{}\t{}\t{:.3}\n", id, server, offset));
        }
        let mut syslog_on: Vec<_> = self.syslog_on.iter().collect();
        syslog_on.sort();
        for id in syslog_on {
            out.push_str(&format!("syslogon\t{}\n", id));
        }
        let mut syslog: Vec<_> = self.syslog.iter().collect();
        syslog.sort_by_key(|(id, _)| id.as_str());
        for (id, list) in syslog {
            for (time, severity, text) in list {
                out.push_str(&format!(
                    "syslog\t{}\t{:.3}\t{}\t{}\n",
                    id,
                    time,
                    severity,
                    escape_field(text)
                ));
            }
        }
        let mut aaa: Vec<_> = self.aaa_users.iter().collect();
        aaa.sort_by_key(|(id, _)| id.as_str());
        for (id, list) in aaa {
            for (user, pass) in list {
                out.push_str(&format!(
                    "aaa\t{}\t{}\t{}\n",
                    id,
                    escape_field(user),
                    escape_field(pass)
                ));
            }
        }
        let mut ps: Vec<_> = self.port_security.iter().collect();
        ps.sort_by_key(|(id, _)| id.as_str());
        for (dev, table) in ps {
            let mut rows: Vec<_> = table.iter().collect();
            rows.sort_by_key(|(iface, _)| iface.as_str());
            for (iface, pol) in rows {
                out.push_str(&format!(
                    "portsec\t{}\t{}\t{}\t{}\n",
                    dev,
                    iface,
                    pol.max,
                    pol.macs.join(",")
                ));
            }
        }
        let mut ch: Vec<_> = self.channels.iter().collect();
        ch.sort_by_key(|(id, _)| id.as_str());
        for (dev, table) in ch {
            let mut rows: Vec<_> = table.iter().collect();
            rows.sort_by_key(|(iface, _)| iface.as_str());
            for (iface, group) in rows {
                out.push_str(&format!("channel\t{}\t{}\t{}\n", dev, iface, group));
            }
        }
        let mut acls: Vec<_> = self.acls.iter().collect();
        acls.sort_by_key(|(id, _)| id.as_str());
        for (dev, lists) in acls {
            let mut nums: Vec<_> = lists.keys().copied().collect();
            nums.sort();
            for n in nums {
                for rule in &lists[&n] {
                    let (dip, dwc) = match rule.dst {
                        Some((d, w)) => (
                            crate::model::ipv4_string(d),
                            crate::model::ipv4_string(w),
                        ),
                        None => ("-".to_string(), "-".to_string()),
                    };
                    out.push_str(&format!(
                        "acl\t{}\t{}\t{}\t{}\t{}\t{}\t{}\n",
                        dev,
                        n,
                        if rule.permit { "permit" } else { "deny" },
                        crate::model::ipv4_string(rule.src),
                        crate::model::ipv4_string(rule.src_wc),
                        dip,
                        dwc
                    ));
                }
            }
        }
        let mut v6: Vec<_> = self.v6_networks.iter().collect();
        v6.sort_by_key(|(id, _)| id.as_str());
        for (dev, nets) in v6 {
            for net in nets {
                out.push_str(&format!("v6net\t{}\t{}\n", dev, net));
            }
        }
        let mut inspect: Vec<_> = self.inspect.iter().collect();
        inspect.sort_by_key(|(id, _)| id.as_str());
        for (dev, on) in inspect {
            if *on {
                out.push_str(&format!("inspect\t{}\n", dev));
            }
        }
        let mut ips: Vec<_> = self.ips.iter().collect();
        ips.sort_by_key(|(id, _)| id.as_str());
        for (dev, protos) in ips {
            for proto in protos {
                out.push_str(&format!("ips\t{}\t{}\n", dev, proto));
            }
        }
        let mut iot: Vec<_> = self.iot_regs.iter().collect();
        iot.sort_by_key(|(id, _)| id.as_str());
        for (dev, regs) in iot {
            for (addr, value) in regs.iter().enumerate() {
                if *value != 0 {
                    out.push_str(&format!("iot\t{}\t{}\t{}\n", dev, addr, value));
                }
            }
        }
        let mut ptp: Vec<_> = self.ptp.iter().collect();
        ptp.sort_by_key(|(id, _)| id.as_str());
        for (slave, (master, offset)) in ptp {
            out.push_str(&format!("ptp\t{}\t{}\t{:.3}\n", slave, master, offset));
        }
        let mut prp_on: Vec<_> = self.prp_on.iter().collect();
        prp_on.sort();
        for dev in prp_on {
            out.push_str(&format!("prpon\t{}\n", dev));
        }
        let mut cells: Vec<_> = self.cell_links.iter().collect();
        cells.sort_by_key(|(id, _)| id.as_str());
        for (client, tower) in cells {
            out.push_str(&format!("cell\t{}\t{}\n", client, tower));
        }
        let mut wlans: Vec<_> = self.wlans.iter().collect();
        wlans.sort_by_key(|(id, _)| id.as_str());
        for (wlc, list) in wlans {
            for w in list {
                out.push_str(&format!(
                    "wlan\t{}\t{}\t{}\t{}\n",
                    wlc,
                    escape_field(&w.ssid),
                    escape_field(&w.secret),
                    w.security
                ));
            }
        }
        let mut capwap: Vec<_> = self.capwap.iter().collect();
        capwap.sort_by_key(|(id, _)| id.as_str());
        for (ap, wlc) in capwap {
            out.push_str(&format!("capwap\t{}\t{}\n", ap, wlc));
        }
        let mut wifi: Vec<_> = self.wifi.iter().collect();
        wifi.sort_by_key(|(id, _)| id.as_str());
        for (client, (ssid, wlc)) in wifi {
            out.push_str(&format!(
                "wifi\t{}\t{}\t{}\n",
                client,
                escape_field(ssid),
                wlc
            ));
        }
        let mut vpn: Vec<_> = self.vpn.iter().collect();
        vpn.sort_by_key(|(id, _)| id.as_str());
        for (client, (server, user)) in vpn {
            out.push_str(&format!(
                "vpn\t{}\t{}\t{}\n",
                client,
                server,
                escape_field(user)
            ));
        }
        let mut pppoe: Vec<_> = self.pppoe.iter().collect();
        pppoe.sort_by_key(|(id, _)| id.as_str());
        for (client, (server, user)) in pppoe {
            out.push_str(&format!(
                "pppoe\t{}\t{}\t{}\n",
                client,
                server,
                escape_field(user)
            ));
        }
        let mut phones: Vec<_> = self.phones.iter().collect();
        phones.sort_by_key(|(id, _)| id.as_str());
        for (phone, (cm, ext)) in phones {
            out.push_str(&format!("phone\t{}\t{}\t{}\n", phone, cm, ext));
        }
        let mut routing: Vec<_> = self.routing.iter().collect();
        routing.sort_by_key(|(id, _)| id.as_str());
        for (dev, (proto, nets)) in routing {
            out.push_str(&format!("routing\t{}\t{}\n", dev, proto));
            for (net, prefix) in nets {
                out.push_str(&format!(
                    "routenet\t{}\t{}\t{}\n",
                    dev,
                    crate::model::ipv4_string(*net),
                    prefix
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
        out
    }

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
