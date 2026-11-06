use super::*;

/// Show commands are shared by privileged and configuration mode.
pub(super) const SHOW_COMMANDS: &[(&str, &str)] = &[
    ("show arp", "ARP cache"),
    ("show interfaces NAME", "Interface details"),
    ("show ip bgp", "BGP sessions, announced and denied prefixes"),
    ("show ip interface brief", "Interface summary"),
    ("show ip route", "Routing table"),
    ("show lldp neighbors", "Neighbours seen over IEEE 802.1AB LLDP"),
    ("show cdp neighbors", "Neighbours seen over Cisco Discovery Protocol (Cisco proprietary)"),
    ("show mac address-table", "MAC address table"),
    ("show power inline", "PoE budget and the ports supplying power (IEEE 802.3af/at)"),
    ("show errdisable", "Ports shut by a guard, and the reason"),
    ("show monitor session 1", "Port mirroring sessions on this switch"),
    ("show vrrp brief", "Virtual gateway groups, priority and state"),
    ("show ip dhcp snooping binding", "Learned DHCP bindings per switch"),
    ("show ip arp inspection", "ARP inspection state and drop count"),
    ("show running-config", "Current configuration"),
    ("show startup-config", "Saved configuration"),
    ("show version", "Image information"),
];

/// Every command the CLI accepts in `mode`, as syntax plus a short description.
/// Help and completion both read this table so they cannot drift from `run`.
pub(super) fn commands(mode: Mode) -> Vec<(&'static str, &'static str)> {
    let mut cmds: Vec<(&'static str, &'static str)> = match mode {
        Mode::User => vec![
            ("enable", "Turn on privileged commands"),
            ("exit", "Close this session"),
            ("help", "List the commands for this mode"),
            ("ping HOST", "Send ICMP echoes to HOST"),
        ],
        Mode::Priv => vec![
            ("clock", "Display the system clock"),
            ("configure terminal", "Enter configuration mode"),
            ("disable", "Return to user mode"),
            ("exit", "Return to user mode"),
            ("help", "List the commands for this mode"),
            ("ping HOST", "Send ICMP echoes to HOST"),
            ("reload", "Reload the saved configuration"),
            ("write memory", "Save the running configuration"),
        ],
        Mode::Config => vec![
            ("ip dhcp snooping", "Turn on DHCP snooping on this switch"),
            ("monitor session 1 source interface PORT [rx|tx|both]", "Copy a port to a Sniffer (Cisco SPAN)"),
            ("monitor session 1 destination interface PORT", "Port that receives the mirrored copy"),
            ("ip dhcp snooping vlan N", "Apply snooping to one VLAN"),
            ("ip arp inspection vlan N", "Inspect ARP replies on one VLAN"),
            ("banner motd DELIM TEXT DELIM", "Set the login banner"),
            ("clock", "Display the system clock"),
            ("end", "Return to privileged mode"),
            ("exit", "Return to privileged mode"),
            ("help", "List the commands for this mode"),
            ("hostname NAME", "Set the device name"),
            ("interface NAME", "Enter interface configuration"),
            ("ip route DEST MASK NH [AD]", "Add a static route"),
            ("line NAME", "Enter con or vty line configuration"),
            ("no banner motd", "Remove the login banner"),
            ("no hostname", "Reset the device name"),
            ("no ip route DEST MASK NH [AD]", "Remove a static route"),
            ("router bgp AS", "Configure BGP with this local autonomous system"),
            ("router eigrp AS", "Configure EIGRP routing"),
            ("router ospf PID", "Configure OSPF routing"),
            ("router ospfv3 PID", "Configure OSPFv3 routing"),
            ("router rip", "Configure RIPv2 routing"),
            ("write memory", "Save the running configuration"),
        ],
        Mode::Iface => vec![
            ("bandwidth KBPS", "Set the interface bandwidth"),
            ("duplex half|full|auto", "Set the duplex (IEEE 802.3)"),
            ("power inline auto|never", "Supply PoE power to the device on this port"),
            ("speed 10|100|1000|auto", "Set the speed in Mb/s (IEEE 802.3)"),
            ("delay USEC", "Set the interface delay"),
            ("end", "Return to privileged mode"),
            ("exit", "Back to configuration mode"),
            ("help", "List the commands for this mode"),
            ("interface NAME", "Switch to another interface"),
            ("ip address ADDR MASK", "Set the interface address"),
            ("no bandwidth", "Restore the default bandwidth"),
            ("no delay", "Restore the default delay"),
            ("no shutdown", "Bring the interface up"),
            ("ip dhcp snooping trust", "Trust the port that faces the real DHCP server"),
            ("spanning-tree portfast", "Skip the listening delay on an access port"),
            ("spanning-tree bpduguard enable|disable", "Err-disable a port that receives a BPDU (Cisco feature around IEEE 802.1D)"),
            ("storm-control broadcast level N", "Drop broadcast traffic above N percent"),
            ("vrrp GROUP ip ADDRESS [priority N]", "Share a virtual gateway (IETF RFC 5798)"),
            ("vrrp GROUP timers advertise MS", "Advertisement interval; backup takes over after three"),
            ("vrrp GROUP authentication text WORD", "Simple-text authentication; mismatched peers never take over"),
            ("standby GROUP ip ADDRESS [priority N]", "HSRP-compatible alias for vrrp"),
            ("shutdown", "Administratively disable the interface"),
        ],
        Mode::Router => vec![
            ("deny NETWORK/LEN", "bgp deny: refuse this prefix from every peer"),
            ("end", "Return to privileged mode"),
            ("exit", "Return to configuration mode"),
            ("help", "List the commands for this mode"),
            ("neighbor IP remote-as AS", "Add a BGP neighbor"),
            ("network NETWORK MASK", "Advertise a connected network"),
            ("network NETWORK/LEN", "Announce a BGP network"),
            ("no deny NETWORK/LEN", "bgp deny removal: accept the prefix again"),
            ("no neighbor IP", "Remove a BGP neighbor"),
            ("network NETWORK WILDCARD area AREA", "Advertise an OSPF network"),
            ("no network NETWORK MASK", "Stop advertising a network"),
            ("no network NETWORK WILDCARD area AREA", "Withdraw an OSPF network"),
            ("version 2", "Select RIP version 2"),
        ],
        Mode::Line => vec![
            ("end", "Return to privileged mode"),
            ("exit", "Back to configuration mode"),
            ("help", "List the commands for this mode"),
            ("login", "Require the password at connect"),
            ("no password", "Remove the line password"),
            ("password PASSWORD", "Set the line password"),
        ],
    };
    if matches!(mode, Mode::Priv | Mode::Config | Mode::Router) {
        cmds.extend_from_slice(SHOW_COMMANDS);
    }
    cmds
}

pub(super) fn help(mode: Mode) -> String {
    command_help(commands(mode))
}

pub(super) fn show_help() -> String {
    command_help(SHOW_COMMANDS.to_vec())
}

fn command_help(mut cmds: Vec<(&'static str, &'static str)>) -> String {
    cmds.sort_by(|a, b| a.0.cmp(b.0));
    let width = cmds.iter().map(|(syntax, _)| syntax.len()).max().unwrap_or(0) + 2;
    let mut out = String::new();
    for (syntax, desc) in cmds {
        out.push_str(&format!("  {syntax:<width$}{desc}\n"));
    }
    out
}

/// True for argument placeholders such as `NAME` or `DEST` in a command syntax.
pub(super) fn is_placeholder(token: &str) -> bool {
    token.chars().next().is_some_and(|c| c.is_ascii_uppercase())
}

/// `interface`, `intf` and their abbreviations open interface configuration.
pub(super) fn is_iface_keyword(word: &str) -> bool {
    word.len() >= 3 && ("interface".starts_with(word) || "intf".starts_with(word))
}

pub(super) fn ports_of(ws: &Workspace, id: &str) -> Vec<String> {
    ws.devices
        .iter()
        .find(|d| d.id == id)
        .map(|d| d.ports.iter().map(|p| p.name.clone()).collect())
        .unwrap_or_default()
}

/// Whether a partially typed interface name could become `port`.
pub(super) fn iface_prefix_matches(partial: &str, port: &str) -> bool {
    let port = port.to_ascii_lowercase();
    if port.starts_with(partial) {
        return true;
    }
    let Some(idx) = partial.find(|c: char| c.is_ascii_digit()) else {
        return iface_family(partial).is_some_and(|full| port.starts_with(&full.to_ascii_lowercase()));
    };
    let (letters, rest) = partial.split_at(idx);
    match iface_family(letters) {
        Some(full) => port.starts_with(&format!("{}{rest}", full.to_ascii_lowercase())),
        None => false,
    }
}

/// Word completions for the line being typed in the current mode. Command
/// entries stop before their first argument; after `interface` the device's
/// port names are offered instead.
pub fn complete(ws: &Workspace, id: &str, s: &Session, line: &str) -> Vec<String> {
    let ends_space = line
        .chars()
        .last()
        .is_none_or(char::is_whitespace);
    let mut words: Vec<&str> = line.split_whitespace().collect();
    let partial = if ends_space {
        ""
    } else {
        words.pop().unwrap_or("")
    };
    let partial = partial.to_ascii_lowercase();
    let typed: Vec<String> = words.iter().map(|w| w.to_ascii_lowercase()).collect();

    let mut out: Vec<String> = Vec::new();
    if typed.len() == 1 && is_iface_keyword(&typed[0]) {
        for port in ports_of(ws, id) {
            if iface_prefix_matches(&partial, &port) {
                out.push(port);
            }
        }
    } else {
        for (syntax, _) in commands(s.mode) {
            let literals: Vec<&str> = syntax
                .split_whitespace()
                .take_while(|t| !is_placeholder(t))
                .collect();
            if literals.len() <= typed.len() {
                continue;
            }
            if !typed
                .iter()
                .zip(&literals)
                .all(|(w, literal)| literal.eq_ignore_ascii_case(w))
            {
                continue;
            }
            if literals[typed.len()].to_ascii_lowercase().starts_with(&partial) {
                out.push(literals.join(" "));
            }
        }
    }
    out.sort();
    out.dedup();
    out
}
