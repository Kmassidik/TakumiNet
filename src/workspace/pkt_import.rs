use super::*;

impl Workspace {
    /// Build a workspace from a decoded `.pkt` topology, fitting PT's logical
    /// coordinates onto our canvas.
    pub fn from_pkt(pkt: &crate::storage::ptxml::PktTopology) -> Workspace {
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
        };

        // Ignore coordinates outside the logical canvas when fitting: PT stores
        // offsets for non-visual devices (power supplies etc.) that would
        // otherwise collapse every real device into one corner.
        let in_range = |d: &crate::storage::ptxml::PktDevice| {
            d.x >= -100.0 && d.x <= 2000.0 && d.y >= -100.0 && d.y <= 2000.0
        };
        let (mut minx, mut maxx, mut miny, mut maxy) =
            (f32::MAX, f32::MIN, f32::MAX, f32::MIN);
        for d in pkt.devices.iter().filter(|d| in_range(d)) {
            minx = minx.min(d.x);
            maxx = maxx.max(d.x);
            miny = miny.min(d.y);
            maxy = maxy.max(d.y);
        }
        if minx > maxx {
            let (minx2, maxx2, miny2, maxy2) =
                (f32::MAX, f32::MIN, f32::MAX, f32::MIN);
            let _ = (minx2, maxx2, miny2, maxy2);
            minx = 0.0;
            maxx = 1000.0;
            miny = 0.0;
            maxy = 600.0;
        }
        let span_x = (maxx - minx).max(1.0);
        let span_y = (maxy - miny).max(1.0);
        let scale = (860.0 / span_x).min(430.0 / span_y).min(1.4);

        let mut by_ref: HashMap<String, String> = HashMap::new();
        for d in &pkt.devices {
            let n = {
                let c = ws.counters.entry(d.kind.clone()).or_insert(0);
                let v = *c;
                *c += 1;
                v
            };
            let id = format!("{}{}", d.kind, n);
            let x = 70.0 + (d.x - minx) * scale;
            let y = 60.0 + (d.y - miny) * scale;
            ws.devices.push(Device {
                id: id.clone(),
                name: d.name.clone(),
                model: d.model.clone(),
                icon: logical_icon(&d.model, &d.kind),
                kind: d.kind.clone(),
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
                ports: default_ports(&d.kind),
                routes: Vec::new(),
                dot1x: false,
                dot1x_user: None,
                dot1x_pass: None,
            });
            if !d.ref_id.is_empty() {
                by_ref.insert(d.ref_id.clone(), id);
            }
        }

        for l in &pkt.links {
            let (Some(a), Some(b)) = (by_ref.get(&l.from), by_ref.get(&l.to)) else {
                continue;
            };
            if ws
                .links
                .iter()
                .any(|x| (x.a == *a && x.b == *b) || (x.a == *b && x.b == *a))
            {
                continue;
            }
            ws.links.push(Link {
                a: a.clone(),
                a_port: crate::storage::ptxml::abbrev_port(&l.from_port),
                b: b.clone(),
                b_port: crate::storage::ptxml::abbrev_port(&l.to_port),
                kind: "eCopper".into(),
            });
        }
        ws
    }
}
