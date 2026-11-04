use super::*;

impl Workspace {
    /// Internal tab-separated record stream used by the proven state loader.
    pub(crate) fn to_records(&self) -> String {
        let mut out = String::from("# pt-web topology 1\n");
        self.write_devices(&mut out);
        self.write_links(&mut out);
        self.write_device_settings(&mut out);
        self.write_app_services(&mut out);
        self.write_switching_security(&mut out);
        self.write_iot_and_wireless(&mut out);
        self.write_routing_and_names(&mut out);
        self.write_lesson(&mut out);
        out
    }

    /// One `device` line per device, followed by its addressing and port lines.
    fn write_devices(&self, out: &mut String) {
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
            for route in &d.routes {
                out.push_str(&format!(
                    "route\t{}\t{}\t{}\t{}\t{}\n",
                    d.id,
                    crate::model::ipv4_string(route.network),
                    route.prefix,
                    crate::model::ipv4_string(route.next_hop),
                    route.admin_distance
                ));
            }
            for p in &d.ports {
                let (default_bandwidth, default_delay) = default_port_metrics(&p.name);
                if p.ip.is_some()
                    || !p.up
                    || p.vlan != 1
                    || p.trunk
                    || p.dot1q.is_some()
                    || p.bandwidth_kbps != default_bandwidth
                    || p.delay_us != default_delay
                {
                    out.push_str(&format!(
                        "port\t{}\t{}\t{}\t{}\t{}\t{}\t{}\t{}\t{}\t{}\n",
                        d.id,
                        p.name,
                        u8::from(p.up),
                        p.ip.map(crate::model::ipv4_string).unwrap_or_default(),
                        p.prefix,
                        p.vlan,
                        u8::from(p.trunk),
                        p.dot1q.map(|v| v.to_string()).unwrap_or_default(),
                        p.bandwidth_kbps,
                        p.delay_us
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
    }

    /// One `link` line per cable.
    fn write_links(&self, out: &mut String) {
        for l in &self.links {
            out.push_str(&format!(
                "link\t{}\t{}\t{}\t{}\t{}\n",
                l.a, l.a_port, l.b, l.b_port, l.kind
            ));
        }
    }

    /// DHCP pools, banners, passwords, power state, modules and VLAN names.
    fn write_device_settings(&self, out: &mut String) {
        let mut servers: Vec<&String> = self.dhcp_pools.keys().collect();
        servers.sort();
        let pools = servers.into_iter().flat_map(|id| self.dhcp_pool_list(id).into_iter().map(move |p| (id, p)));
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
        let mut notes: Vec<_> = self.notes.iter().collect();
        notes.sort_by(|a, b| a.id.cmp(&b.id));
        for note in notes {
            out.push_str(&format!("note\t{}\t{}\t{}\t{}\t{}\n", note.id, note.x, note.y, escape_field(&note.color), escape_field(&note.text)));
        }
        for demo in &self.demo {
            out.push_str(&format!("demo\t{}\t{}\t{}\t{}\n", escape_field(&demo.kind), demo.from, demo.to, escape_field(&demo.url)));
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
    }

    /// Mail, TFTP, FTP, NTP, syslog and AAA state.
    fn write_app_services(&self, out: &mut String) {
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
    }

    /// Port security, channel groups, ACLs, IPv6 networks and firewall features.
    fn write_switching_security(&self, out: &mut String) {
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
                out.push_str(&format!(
                    "channel\t{}\t{}\t{}\t{}\n",
                    dev,
                    iface,
                    group,
                    self.channel_mode(dev, iface)
                ));
            }
        }
        let mut stp_modes: Vec<_> = self.stp_modes.iter().collect();
        stp_modes.sort_by_key(|(id, _)| id.as_str());
        for (dev, mode) in stp_modes {
            out.push_str(&format!("stpmode\t{dev}\t{mode}\n"));
        }
        let mut stp_priorities: Vec<_> = self.stp_priorities.iter().collect();
        stp_priorities.sort_by_key(|(id, _)| id.as_str());
        for (dev, priorities) in stp_priorities {
            let mut rows: Vec<_> = priorities.iter().collect();
            rows.sort_by_key(|(vlan, _)| **vlan);
            for (vlan, priority) in rows {
                out.push_str(&format!("stppriority\t{dev}\t{vlan}\t{priority}\n"));
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
    }

    /// IoT registers, cell links, Wi-Fi, VPN, PPPoE and phones.
    fn write_iot_and_wireless(&self, out: &mut String) {
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
        let mut guests: Vec<_> = self.wlan_guest.iter().collect();
        guests.sort();
        for (wlc, ssid) in guests {
            out.push_str(&format!("guestnet\t{}\t{}\n", wlc, escape_field(ssid)));
        }
        let mut forwards: Vec<_> = self.port_forwards.iter().collect();
        forwards.sort_by_key(|(id, _)| id.as_str());
        for (router, list) in forwards {
            for (outside, target, inside) in list {
                out.push_str(&format!("portfwd\t{}\t{}\t{}\t{}\n", router, outside, target, inside));
            }
        }
        out.push_str(&self.ufw_records());
        let mut tunnels: Vec<_> = self.tunnels.iter().collect();
        tunnels.sort_by_key(|(id, _)| id.as_str());
        for (device, (peer, key)) in tunnels {
            out.push_str(&format!("tunnel\t{}\t{}\t{}\n", device, crate::model::ipv4_string(*peer), escape_field(key)));
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
        for (from, to, mbit) in &self.flows {
            out.push_str(&format!("flow\t{}\t{}\t{}\n", from, to, mbit));
        }
        if self.flow_spread {
            out.push_str("flowspread\t1\n");
        }
        let mut vnets: Vec<_> = self.vnets.iter().collect();
        vnets.sort();
        for (device, vni) in vnets {
            out.push_str(&format!("vnet2\t{}\t{}\n", device, vni));
        }
        for (gid, name, members) in self.group_rows() {
            out.push_str(&format!("group\t{}\t{}\t{}\n", gid, escape_field(&name), members.join(",")));
        }
        let mut vouchers: Vec<_> = self.vouchers.iter().collect();
        vouchers.sort_by_key(|(id, _)| id.as_str());
        for (gateway, list) in vouchers {
            for v in list {
                out.push_str(&format!(
                    "voucher\t{}\t{}\t{}\t{}\n",
                    gateway, escape_field(&v.code), v.minutes, v.used_by.as_deref().unwrap_or("-")
                ));
            }
        }
        let mut demands: Vec<_> = self.demands.iter().collect();
        demands.sort();
        for (client, mbit) in demands {
            out.push_str(&format!("demand\t{}\t{}\n", client, mbit));
        }
        let mut queues: Vec<_> = self.queues.iter().collect();
        queues.sort_by_key(|(id, _)| id.as_str());
        for (gateway, list) in queues {
            for (user, mbit) in list {
                out.push_str(&format!("queue\t{}\t{}\t{}\n", gateway, user, mbit));
            }
        }
        let mut parents: Vec<_> = self.queue_parent.iter().collect();
        parents.sort();
        for (gateway, mbit) in parents {
            out.push_str(&format!("qparent\t{}\t{}\n", gateway, mbit));
        }
        let mut phones: Vec<_> = self.phones.iter().collect();
        phones.sort_by_key(|(id, _)| id.as_str());
        for (phone, (cm, ext)) in phones {
            out.push_str(&format!("phone\t{}\t{}\t{}\n", phone, cm, ext));
        }
        self.write_calls(out);
    }
}
