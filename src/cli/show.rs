use super::*;
use crate::workspace::{RoutingConfig, RoutingProtocol};

pub(super) fn show(ws: &Workspace, id: &str, what: &str) -> String {
    match what {
        "?" => show_help(),
        _ if command_matches(what, "running-config") => running_config(ws, id),
        _ if what.len() >= 4 && command_matches(what, "startup-config") => startup_config(ws, id),
        _ if command_matches(what, "ip interface brief") => ip_brief(ws, id),
        _ if command_matches(what, "ip route") => ws.show_routes(id),
        "version" | "ver" => version(ws, id),
        "mac address-table" | "mac-address-table" | "mac addr" => mac_table(ws, id),
        "arp" => arp_table(ws, id),
        "ip helper-address" => helper_list(ws, id),
        "vlan brief" | "vlan" => vlan_table(ws, id),
        "spanning-tree" => stp_table(ws, id),
        "interfaces switchport" => switchport_table(ws, id),
        "port-security" => port_security_table(ws, id),
        "access-lists" | "ip access-lists" => acl_table(ws, id),
        "ip nat translations" => nat_table(ws, id),
        "ipv6 route" | "ipv6 ro" => ws.show_ipv6_routes(id),
        "ips" => {
            let list = ws.ips.get(id).cloned().unwrap_or_default();
            if list.is_empty() {
                "% no IPS signatures\n".into()
            } else {
                format!("IPS drop: {}\n", list.join(" "))
            }
        }
        "authentication sessions" => {
            let list = ws.devices.iter().find(|d| d.id == id).map(|d| d.dot1x).unwrap_or(false);
            if list {
                format!("{id}  Interface  Status\nFa0/1  Authorized\n")
            } else {
                "% no authenticated sessions\n".into()
            }
        }
        "etherchannel summary" => etherchannel_summary(ws, id),
        "interfaces trunk" => trunk_table(ws, id),
        other => {
            if let Some(arg) = other.strip_prefix("interfaces ") {
                return show_interfaces(ws, id, arg.trim());
            }
            if let Some(arg) = other.strip_prefix("ip interface ") {
                return show_ip_interface(ws, id, arg.trim());
            }
            invalid(&format!("show {other}"), Mode::Priv)
        }
    }
}

/// `show mac address-table` from what the switches actually learned.
pub(super) fn mac_table(ws: &Workspace, id: &str) -> String {
    let Some(dev) = ws.devices.iter().find(|d| d.id == id) else {
        return String::new();
    };
    let rows = ws.tables.mac_rows(id);
    let mut out = String::from(
        "\n          Mac Address Table\n-------------------------------------------\n\nVlan    Mac Address       Type        Ports\n----    -----------       --------    -----\n",
    );
    for e in &rows {
        let port = dev
            .ports
            .get(e.port)
            .map(|p| p.name.as_str())
            .unwrap_or("-");
        out.push_str(&format!(
            "   1    {:<17} {:<11} {}\n",
            e.mac.to_string(),
            if e.static_entry { "STATIC" } else { "DYNAMIC" },
            port
        ));
    }
    out.push_str(&format!(
        "\nTotal Mac Addresses for this criterion: {}\n",
        rows.len()
    ));
    out
}

/// `show arp` from the device's cache.
pub(super) fn arp_table(ws: &Workspace, id: &str) -> String {
    let Some(dev) = ws.devices.iter().find(|d| d.id == id) else {
        return String::new();
    };
    let rows = ws.tables.arp_rows(id);
    let iface = dev
        .ports
        .first()
        .map(|p| p.name.as_str())
        .unwrap_or("-");
    let mut out =
        String::from("Protocol  Address          Age (min)  Hardware Addr   Type   Interface\n");
    for e in &rows {
        out.push_str(&format!(
            "Internet  {:<15} {:>10}  {:<15} ARPA   {}\n",
            ipv4_string(e.ip),
            0,
            e.mac.to_string(),
            iface
        ));
    }
    if rows.is_empty() {
        out.push_str("% No entries\n");
    }
    out
}

/// `show vlan brief` from the switch's VLAN table and access ports.
pub(super) fn vlan_table(ws: &Workspace, id: &str) -> String {
    let Some(dev) = ws.devices.iter().find(|d| d.id == id) else {
        return String::new();
    };
    if dev.kind != "switch" {
        return "% VLANs are configured on switches\n".into();
    }
    let mut ids: Vec<u16> = vec![1];
    if let Some(list) = ws.vlans.get(id) {
        ids.extend(list.iter().map(|(v, _)| *v));
    }
    ids.sort_unstable();
    ids.dedup();
    let mut out = String::from(
        "VLAN Name                             Status    Ports\n---- -------------------------------- --------- -------------------------------\n",
    );
    for vlan in ids {
        let name = ws.vlan_name(id, vlan);
        let ports: Vec<String> = dev
            .ports
            .iter()
            .filter(|p| !p.trunk && p.vlan == vlan)
            .map(|p| p.name.clone())
            .collect();
        out.push_str(&format!(
            "{:<5}{:<33}{:<10}{}\n",
            vlan,
            name,
            "active",
            ports.join(", ")
        ));
    }
    out
}

/// `show spanning-tree`: IEEE root election and per-port roles for VLAN 1.
pub(super) fn stp_table(ws: &Workspace, id: &str) -> String {
    let Some(dev) = ws.devices.iter().find(|d| d.id == id) else {
        return String::new();
    };
    if dev.kind != "switch" {
        return "% spanning-tree is only shown on switches\n".into();
    }
    let (root_priority, root_mac, root_ports, blocked) = ws.stp_device_state(id);
    let protocol = if ws.stp_mode(id) == "rapid-pvst" { "rstp" } else { "ieee" };
    let mut out = format!("VLAN0001\n  Spanning tree enabled protocol {protocol}\n");
    out.push_str(&format!(
        "  Root ID    Priority    {root_priority}\n    Address     {root_mac}\n"
    ));
    out.push_str(&format!(
        "  Bridge ID  Priority    {}\n    Address     {}\n",
        ws.stp_priority(id, 1) + 1,
        crate::net::packet::Mac::for_device(id)
    ));
    out.push_str("Interface        Role Sts\n---------------- ---- ---\n");
    let mut shown = 0;
    for p in &dev.ports {
        if ws.peer_port(id, &p.name).is_none() {
            continue;
        }
        shown += 1;
        if !ws.port_state(id, &p.name).line_up {
            out.push_str(&format!("{:<16} Disabled DIS\n", p.name));
            continue;
        }
        let down = blocked.contains(&p.name);
        let role = if down {
            "Altn"
        } else if root_ports.contains(&p.name) {
            "Root"
        } else {
            "Desig"
        };
        out.push_str(&format!(
            "{:<16} {:<4} {}\n",
            p.name,
            role,
            if down { "BLK" } else { "FWD" }
        ));
    }
    if shown == 0 {
        out.push_str("% no cabled ports\n");
    }
    out
}

/// `show ip nat translations`: the observed inside-local -> global pairs.
pub(super) fn nat_table(ws: &Workspace, id: &str) -> String {
    let rules = ws.nat_binding_lines(id);
    let rows = ws.nat_translation_lines(id);
    if rules.is_empty() && rows.is_empty() {
        return "% no NAT configured\n".into();
    }
    let mut out = String::new();
    for r in &rules {
        out.push_str(&format!("ip nat {r}\n"));
    }
    for r in &rows {
        out.push_str(&format!("{r}\n"));
    }
    out
}

/// `show access-lists`: ACEs plus the interfaces they are bound to.
pub(super) fn acl_table(ws: &Workspace, id: &str) -> String {
    let lines = ws.acl_lines(id);
    let binds = ws.acl_binding_lines(id);
    if lines.is_empty() {
        return "% no access lists configured\n".into();
    }
    let mut out = String::new();
    for line in &lines {
        out.push_str(&format!("{line}\n"));
    }
    for bind in &binds {
        out.push_str(&format!("{bind}\n"));
    }
    out
}

/// `show port-security`: MAC limit and learned count per secured port.
pub(super) fn port_security_table(ws: &Workspace, id: &str) -> String {
    let rows = ws.port_security_rows(id);
    if rows.is_empty() {
        return "% no port-security configured\n".into();
    }
    let mut out = String::from("Port      MaxMAC  CurrentMAC  Status\n");
    for (iface, max, current) in rows {
        let status = if current as u16 >= max { "secure-up" } else { "secure-up" };
        out.push_str(&format!("{iface:<12}{max:<8}{current:<12}{status}\n"));
    }
    out
}

/// `show etherchannel summary`: group, member ports, and the bundle state.
pub(super) fn etherchannel_summary(ws: &Workspace, id: &str) -> String {
    let groups = ws.channel_groups(id);
    if groups.is_empty() {
        return "% no channel-groups configured\n".into();
    }
    let mut out = String::from("Group  Ports                     Protocol  Status\n");
    for (group, ports) in groups {
        let members = ports
            .iter()
            .map(|port| {
                let state = if ws.channel_member_active(id, port) { "P" } else { "D" };
                format!("{port}({state})")
            })
            .collect::<Vec<_>>()
            .join(" ");
        let mode = ports.first().map(|port| ws.channel_mode(id, port)).unwrap_or("on");
        let protocol = match mode {
            "active" | "passive" => "LACP",
            "auto" | "desirable" => "PAgP",
            _ => "-",
        };
        let state = if ws.channel_group_active(id, group) { "SU" } else { "SD" };
        out.push_str(&format!(
            "{group:<7}{members:<35}{protocol:<10}Po{group}({state})\n"
        ));
    }
    out
}

/// `show interfaces switchport`: mode and VLAN per cabled port.
pub(super) fn switchport_table(ws: &Workspace, id: &str) -> String {
    let Some(dev) = ws.devices.iter().find(|d| d.id == id) else {
        return String::new();
    };
    let mut out = String::new();
    for p in &dev.ports {
        if ws.peer_port(id, &p.name).is_none() {
            continue;
        }
        out.push_str(&format!("Name: {}\nSwitchport: Enabled\n", p.name));
        if p.trunk {
            out.push_str(
                "Administrative Mode: trunk\nTrunking Native Mode VLAN: 1 (default)\n",
            );
        } else {
            out.push_str(&format!(
                "Administrative Mode: static access\nAccess Mode VLAN: {} ({})\n",
                p.vlan,
                ws.vlan_name(id, p.vlan)
            ));
        }
        out.push('\n');
    }
    if out.is_empty() {
        out.push_str("% no switchports are cabled\n");
    }
    out
}

pub(super) fn trunk_table(ws: &Workspace, id: &str) -> String {
    let Some(dev) = ws.devices.iter().find(|d| d.id == id) else {
        return String::new();
    };
    let trunks: Vec<&str> = dev
        .ports
        .iter()
        .filter(|p| p.trunk && ws.peer_port(id, &p.name).is_some())
        .map(|p| p.name.as_str())
        .collect();
    if trunks.is_empty() {
        return "% no trunk ports\n".into();
    }
    let mut out = String::from(
        "Port        Mode         Encapsulation  Status        Native vlan\n",
    );
    for name in trunks {
        out.push_str(&format!(
            "{:<11} on           802.1q         trunking      1\n",
            name
        ));
    }
    out.push_str("\nPort        Vlans allowed on trunk\n");
    for name in dev.ports.iter().filter(|p| p.trunk).map(|p| p.name.as_str()) {
        out.push_str(&format!("{:<11} 1-4094\n", name));
    }
    out
}

/// `show ip helper-address` from the router's configuration.
pub(super) fn helper_list(ws: &Workspace, id: &str) -> String {
    let mut out = String::new();
    if let Some(list) = ws.dhcp_helpers.get(id) {
        for (iface, ip) in list {
            out.push_str(&format!(
                "Helper address {} on {}\n",
                ipv4_string(*ip),
                iface
            ));
        }
    }
    if out.is_empty() {
        out.push_str("% No helper addresses configured\n");
    }
    out
}

/// Resolve an interface name to its configured state: name, address, prefix, up.
pub(super) fn port_view(ws: &Workspace, id: &str, iface: &str) -> Option<(String, Option<u32>, u8, bool)> {
    let d = ws.devices.iter().find(|d| d.id == id)?;
    let names: Vec<String> = d.ports.iter().map(|p| p.name.clone()).collect();
    let name = expand_iface(iface, &names)?;
    let p = d.ports.iter().find(|p| p.name == name)?;
    let mut view = (p.name.clone(), p.ip, p.prefix, p.up);
    // Hosts keep a single address on the device itself (see `show ip interface brief`).
    if d.ports.len() == 1 && view.1.is_none() && d.ip.is_some() {
        view.1 = d.ip;
        view.2 = d.prefix;
        view.3 = true;
    }
    Some(view)
}

pub(super) fn show_interfaces(ws: &Workspace, id: &str, iface: &str) -> String {
    let Some((name, ip, prefix, _up)) = port_view(ws, id, iface) else {
        return format!("% Invalid interface name: {iface}\n");
    };
    let st = ws.port_state(id, &name);
    let state = if !st.admin_up {
        "administratively down, line protocol is down"
    } else if !st.linked {
        "down, line protocol is down"
    } else if !st.line_up {
        "up, line protocol is down"
    } else {
        "up, line protocol is up"
    };
    let mut out = format!("{name} is {state}\n");
    match ip {
        Some(ip) => out.push_str(&format!(
            "  Internet address is {}/{}\n",
            ipv4_string(ip),
            prefix
        )),
        None => out.push_str("  Internet protocol processing disabled\n"),
    }
    let port = ws
        .devices
        .iter()
        .find(|d| d.id == id)
        .and_then(|d| d.ports.iter().find(|p| p.name == name));
    let Some(port) = port else {
        return format!("% Invalid interface name: {iface}\n");
    };
    out.push_str(&format!(
        "  MTU 1500 bytes, BW {} Kbit/sec, DLY {} usec,\n",
        port.bandwidth_kbps, port.delay_us
    ));
    out.push_str("     reliability 255/255, txload 1/255, rxload 1/255\n");
    out.push_str("  Encapsulation ARPA, loopback not set\n");
    out.push_str("  Full-duplex, 1000Mb/s, media type is RJ45\n");
    out
}

pub(super) fn show_ip_interface(ws: &Workspace, id: &str, iface: &str) -> String {
    let Some((name, ip, prefix, _up)) = port_view(ws, id, iface) else {
        return format!("% Invalid interface name: {iface}\n");
    };
    let st = ws.port_state(id, &name);
    let state = if !st.admin_up {
        "administratively down, line protocol is down"
    } else if !st.linked {
        "down, line protocol is down"
    } else if !st.line_up {
        "up, line protocol is down"
    } else {
        "up, line protocol is up"
    };
    let mut out = format!("{name} is {state}\n");
    match ip {
        Some(ip) => {
            out.push_str(&format!(
                "  Internet address is {}/{}\n",
                ipv4_string(ip),
                prefix
            ));
            out.push_str(&format!(
                "  Broadcast address is {}\n",
                ipv4_string(ip | !mask_of(prefix))
            ));
            out.push_str("  Address determined by setup command\n");
        }
        None => out.push_str("  Internet protocol processing disabled\n"),
    }
    out.push_str("  MTU is 1500 bytes\n");
    out.push_str("  Helper address is not set\n");
    out.push_str("  Directed broadcast forwarding is disabled\n");
    out.push_str("  Outgoing access list is not set\n");
    out.push_str("  Inbound  access list is not set\n");
    out.push_str("  Proxy ARP is enabled\n");
    out
}

pub(super) fn version(ws: &Workspace, id: &str) -> String {
    let model = ws
        .devices
        .iter()
        .find(|d| d.id == id)
        .map(|d| d.model.clone())
        .unwrap_or_default();
    format!(
        "Cisco IOS Software, C{model} Software (C{model}-UNIVERSALK9-M), Version 15.1(4)M4\n\
         Technical Support: http://www.cisco.com/techsupport\n\
         Copyright (c) 1986-2010 by Cisco Systems, Inc.\n"
    )
}

pub(super) fn ip_brief(ws: &Workspace, id: &str) -> String {
    let Some(d) = ws.devices.iter().find(|d| d.id == id) else {
        return String::new();
    };
    let mut out = String::from(
        "Interface              IP-Address      OK? Method Status                Protocol\n",
    );
    let mut rows: Vec<(String, Option<u32>, u8, bool)> = d
        .ports
        .iter()
        .map(|p| (p.name.clone(), p.ip, p.prefix, p.up))
        .collect();
    // Hosts keep a single address on the device itself.
    if rows.len() == 1 && rows[0].1.is_none() && d.ip.is_some() {
        rows[0].1 = d.ip;
        rows[0].2 = d.prefix;
        rows[0].3 = true;
    }
    for (name, ip, _prefix, _up) in rows {
        let addr = ip.map(ipv4_string).unwrap_or_else(|| "unassigned".into());
        let ok = if ip.is_some() { "YES" } else { "YES" };
        let method = if ip.is_some() { "manual" } else { "unset" };
        // A port is only up when it is enabled, cabled, and its peer is
        // enabled; the line protocol follows the same three states.
        let st = ws.port_state(id, &name);
        let status = if !st.admin_up {
            "administratively down"
        } else if !st.linked {
            "notconnect"
        } else {
            "up"
        };
        let proto = if st.line_up { "up" } else { "down" };
        out.push_str(&format!(
            "{name:<22} {addr:<15} {ok:<4} {method:<6} {status:<21} {proto}\n"
        ));
    }
    out
}

pub(super) fn running_config(ws: &Workspace, id: &str) -> String {
    let Some(d) = ws.devices.iter().find(|d| d.id == id) else {
        return String::new();
    };
    config_for(
        d,
        ws.banners.get(id).map(String::as_str),
        ws.line_passwords.get(id).map(String::as_str),
        ws.routing.get(id),
        &ws.switching_config(id),
    )
}

/// `show startup-config`: what `write memory` saved.
pub(super) fn startup_config(ws: &Workspace, id: &str) -> String {
    match ws.startup_config(id) {
        Some(text) => text,
        None => "% Startup configuration is empty\n".into(),
    }
}

/// Render one device's configuration; shared by running and startup config.
pub(crate) fn config_for(
    d: &Device,
    banner: Option<&str>,
    line_pw: Option<&str>,
    routing: Option<&RoutingConfig>,
    switching: &crate::workspace::SwitchingConfig,
) -> String {
    let mut out = String::from(
        "Building configuration...\n\nCurrent configuration : 1024 bytes\n!\nversion 15.1\n",
    );
    out.push_str(&format!("hostname {}\n!\n", d.name));
    if let Some(b) = banner {
        out.push_str(&format!("banner motd ^{b}^\n!\n"));
    }
    for (vlan, name) in &switching.vlans {
        out.push_str(&format!("vlan {vlan}\n name {name}\n!\n"));
    }
    if let Some(mode) = &switching.stp_mode {
        out.push_str(&format!("spanning-tree mode {mode}\n"));
    }
    let mut priorities: Vec<_> = switching.stp_priorities.iter().collect();
    priorities.sort_by_key(|(vlan, _)| **vlan);
    for (vlan, priority) in &priorities {
        out.push_str(&format!("spanning-tree vlan {vlan} priority {priority}\n"));
    }
    if switching.stp_mode.is_some() || !priorities.is_empty() {
        out.push_str("!\n");
    }
    for p in &d.ports {
        out.push_str(&format!("interface {}\n", p.name));
        if let Some(vlan) = p.dot1q {
            out.push_str(&format!(" encapsulation dot1Q {vlan}\n"));
        }
        if d.kind == "switch" {
            if p.trunk {
                out.push_str(" switchport mode trunk\n");
            } else if p.vlan != 1 {
                out.push_str(&format!(" switchport access vlan {}\n", p.vlan));
            }
        }
        if let Some(group) = switching.channels.get(&p.name) {
            let mode = switching.channel_modes.get(&p.name).map(String::as_str).unwrap_or("on");
            out.push_str(&format!(" channel-group {group} mode {mode}\n"));
        }
        if let Some(ip) = p.ip {
            out.push_str(&format!(
                " ip address {} {}\n",
                ipv4_string(ip),
                ipv4_string(mask_of(p.prefix))
            ));
        }
        let (default_bandwidth, default_delay) = super::interface::default_port_metrics(&p.name);
        if p.bandwidth_kbps != default_bandwidth {
            out.push_str(&format!(" bandwidth {}\n", p.bandwidth_kbps));
        }
        if p.delay_us != default_delay {
            out.push_str(&format!(" delay {}\n", p.delay_us));
        }
        if p.up {
            out.push_str(" no shutdown\n");
        } else {
            out.push_str(" shutdown\n");
        }
        out.push_str("!\n");
    }
    for route in &d.routes {
        out.push_str(&format!(
            "ip route {} {} {}",
            ipv4_string(route.network),
            ipv4_string(mask_of(route.prefix)),
            ipv4_string(route.next_hop)
        ));
        if route.admin_distance != 1 {
            out.push_str(&format!(" {}", route.admin_distance));
        }
        out.push('\n');
    }
    if !d.routes.is_empty() {
        out.push_str("!\n");
    }
    if let Some(routing) = routing {
        match &routing.protocol {
            RoutingProtocol::RipV2 => {
                out.push_str("router rip\n version 2\n");
                for network in &routing.networks {
                    out.push_str(&format!(" network {}", ipv4_string(network.network)));
                    if network.prefix != classful_prefix(network.network) {
                        out.push_str(&format!(" {}", ipv4_string(mask_of(network.prefix))));
                    }
                    out.push('\n');
                }
            }
            RoutingProtocol::Ospf { process_id } => {
                out.push_str(&format!("router ospf {process_id}\n"));
                for network in &routing.networks {
                    out.push_str(&format!(
                        " network {} {} area {}\n",
                        ipv4_string(network.network),
                        ipv4_string(!mask_of(network.prefix)),
                        network.area
                    ));
                }
            }
            RoutingProtocol::Eigrp { as_number } => {
                out.push_str(&format!("router eigrp {as_number}\n"));
                for network in &routing.networks {
                    out.push_str(&format!(
                        " network {} {}\n",
                        ipv4_string(network.network),
                        ipv4_string(!mask_of(network.prefix))
                    ));
                }
            }
            RoutingProtocol::Ospfv3 { process_id } => {
                out.push_str(&format!("router ospfv3 {process_id}\n"));
            }
        }
        out.push_str("!\n");
    }
    if let Some(pw) = line_pw {
        out.push_str(&format!("line con 0\n password {pw}\n login\n!\n"));
    }
    out.push_str("end\n");
    out
}

fn classful_prefix(ip: u32) -> u8 {
    match ip >> 24 {
        0..=127 => 8,
        128..=191 => 16,
        _ => 24,
    }
}
