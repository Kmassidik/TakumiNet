use super::*;
use crate::workspace::{RoutingConfig, RoutingProtocol};

pub(super) fn show(ws: &Workspace, id: &str, what: &str) -> String {
    match what {
        "?" => show_help(),
        _ if command_matches(what, "running-config") => running_config(ws, id),
        _ if what.len() >= 4 && command_matches(what, "startup-config") => startup_config(ws, id),
        _ if command_matches(what, "ip interface brief") => ip_brief(ws, id),
        _ if command_matches(what, "ip route") => ws.show_routes(id),
        _ if command_matches(what, "ip bgp") => bgp_table(ws, id),
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
        "lldp neighbors" | "lldp neighbor" | "lldp" => lldp_neighbors(ws, id),
        "cdp neighbors" | "cdp neighbor" | "cdp" => cdp_neighbors(ws, id),
        "power inline" => power_inline_table(ws, id),
        "wireless" | "wlan" => ws.wireless_table(id),
        "errdisable" => ws.errdisable_table(id),
        "monitor session 1" | "monitor session" => ws.mirror_table(id),
        "vrrp brief" | "vrrp" | "standby brief" | "standby" => ws.show_fhrp(id),
        "ip dhcp snooping binding" | "ip dhcp snooping" => ws.show_dhcp_snooping(id),
        "ip arp inspection" => format!(
            "ARP inspection is {}\nDropped replies: {}\n",
            if ws.arp_inspection(id) { "on" } else { "off" },
            ws.arp_inspection_drops(id)
        ),
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

pub(crate) fn show_interfaces(ws: &Workspace, id: &str, iface: &str) -> String {
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
    let mut out = match ws.errdisabled_reason(id, &name) {
        Some(reason) => format!("{name} is err-disabled ({reason})\n"),
        None => format!("{name} is {state}\n"),
    };
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
    match ws.negotiated(id, &name) {
        Some(n) => {
            let duplex = if n.full { "Full-duplex" } else { "Half-duplex" };
            out.push_str(&format!("  {duplex}, {}Mb/s, media type is RJ45\n", n.speed));
            if n.duplex_mismatch() {
                out.push_str("  Duplex mismatch with the far end: late collisions and CRC errors are rising\n");
            }
            let crc = ws.crc_errors_for(id, &name);
            if crc > 0 {
                out.push_str(&format!("  {} input errors\n", crc));
            }
        }
        None if st.linked => out.push_str("  Speed mismatch with the far end: no link\n"),
        None => out.push_str("  Auto-duplex, Auto-speed, media type is RJ45\n"),
    }
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
    let mut out = match ws.errdisabled_reason(id, &name) {
        Some(reason) => format!("{name} is err-disabled ({reason})\n"),
        None => format!("{name} is {state}\n"),
    };
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
        "Takumi Network OS, {model} Software, Version 1.0\n\
         Copyright (c) 2026 Takumi contributors, MIT licence\n"
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
