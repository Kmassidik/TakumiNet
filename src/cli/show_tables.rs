use super::*;

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

/// `show ip bgp`: the local AS, every session, and what is announced and
/// denied. Rendered from the same state `recompute_bgp` reads.
pub(super) fn bgp_table(ws: &Workspace, id: &str) -> String {
    let Some(config) = ws.bgp.get(id) else {
        return "% BGP is not configured\n".into();
    };
    let mut out = format!("BGP local autonomous system {}\n", config.local_as);
    let sessions = ws.bgp_sessions(id);
    if sessions.is_empty() {
        out.push_str("No neighbors configured\n");
    } else {
        out.push_str("Neighbor         Remote-AS   State\n");
        for (peer, remote_as, state) in &sessions {
            out.push_str(&format!("{peer:<16} {remote_as:<11} {state}\n"));
        }
    }
    out.push_str("Announced networks:\n");
    let networks = ws.bgp_networks(id);
    if networks.is_empty() {
        out.push_str("  none\n");
    }
    for (net, prefix) in networks {
        out.push_str(&format!("  {}/{}\n", ipv4_string(net), prefix));
    }
    let denied = ws.bgp_denied(id);
    if !denied.is_empty() {
        out.push_str("Denied prefixes (bgp deny):\n");
        for (net, prefix) in denied {
            out.push_str(&format!("  {}/{}\n", ipv4_string(net), prefix));
        }
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

/// `show lldp neighbors`: IEEE 802.1AB. Every live cable whose far end is a
/// device that speaks LLDP shows up with its name, port and capability.
pub(crate) fn lldp_neighbors(ws: &Workspace, id: &str) -> String {
    let Some(dev) = ws.devices.iter().find(|d| d.id == id) else {
        return String::new();
    };
    let mut rows = String::new();
    let mut count = 0;
    for port in &dev.ports {
        if !ws.port_state(id, &port.name).line_up {
            continue;
        }
        let Some((peer_id, peer_port)) = ws.peer_port(id, &port.name) else { continue };
        let Some(peer) = ws.devices.iter().find(|d| d.id == peer_id) else { continue };
        let code = match peer.kind.as_str() {
            "hub" | "patchpanel" | "cloud" => continue,
            "router" | "asa" | "switch-l3" | "rtrw-gateway" | "homerouter" => "R",
            "switch" => "B",
            "ap" | "wlc" | "hotspot-ap" => "W",
            "phone" | "analogphone" => "T",
            "pc" | "laptop" | "server" | "printer" | "tv" | "tablet" => "S",
            _ => "O",
        };
        rows.push_str(&format!("{:<17}{:<15}{:<17}{}\n", peer.name, port.name, peer_port, code));
        count += 1;
    }
    if count == 0 {
        return "% no LLDP neighbors\n".into();
    }
    format!(
        "Capability codes:\n    (R) Router, (B) Bridge, (T) Telephone, (W) WLAN access point, (S) Station, (O) Other\n\n{:<17}{:<15}{:<17}Capability\n{rows}\nTotal entries displayed: {count}\n",
        "Device ID", "Local Intf", "Port ID"
    )
}

/// `show power inline`: the budget, and one row per cable that ends in a device
/// running on that cable.
pub(super) fn power_inline_table(ws: &Workspace, id: &str) -> String {
    use crate::workspace::{PoeState, POE_BUDGET_W};
    let kind = ws.devices.iter().find(|d| d.id == id).map(|d| d.kind.as_str()).unwrap_or("");
    if !matches!(kind, "switch" | "switch-l3") {
        return "% this device does not supply power over Ethernet\n".into();
    }
    let used = ws.poe_used(id);
    let mut out = format!(
        "Available:{:.1}(w)  Used:{:.1}(w)  Remaining:{:.1}(w)\n\n{:<18}{:<7}{:<7}{:<14}Device\n",
        POE_BUDGET_W, used, POE_BUDGET_W - used, "Interface", "Admin", "Oper", "Power(Watts)"
    );
    for row in ws.poe_report().iter().filter(|r| r.switch == id) {
        let admin = if ws.poe_port_on(id, &row.port) { "auto" } else { "never" };
        let (oper, watts) = match row.state {
            PoeState::Powered => ("on", row.watts),
            PoeState::Denied(_) => ("off", 0.0),
        };
        let name = ws.devices.iter().find(|d| d.id == row.device).map(|d| d.name.as_str()).unwrap_or("");
        out.push_str(&format!("{:<18}{:<7}{:<7}{:<14.1}{}\n", row.port, admin, oper, watts, name));
    }
    out
}

/// `show cdp neighbors`: Cisco's own discovery protocol. LLDP is the IEEE one.
pub(crate) fn cdp_neighbors(ws: &Workspace, id: &str) -> String {
    let table = lldp_neighbors(ws, id);
    if table.starts_with('%') {
        return "% no CDP neighbors\n".into();
    }
    format!(
        "Cisco Discovery Protocol (Cisco proprietary; LLDP is the IEEE 802.1AB standard)\n\n{table}"
    )
}
