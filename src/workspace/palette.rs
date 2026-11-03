use super::*;

/// (palette label, tile icon, device kind)
pub(super) const CATALOG: &[(&str, &str, &str)] = &[
    ("2911", "Specific2911_40x40.png", "router"),
    ("1941", "Specific1941_40x40.png", "router"),
    ("2901", "Specific2901_40x40.png", "router"),
    ("2811", "Specific2811_40x40.png", "router"),
    ("2621XM", "Specific2621XM_40x40.png", "router"),
    ("1841", "Specific1841_40x40.png", "router"),
    ("4331", "Specific4331_40x40.png", "router"),
    ("4321", "Specific4321_40x40.png", "router"),
    ("2620XM", "Specific2620XM_40x40.png", "router"),
    ("819", "Specific819_40x40.png", "router"),
    ("829", "Specific829_40x40.png", "router"),
    ("8200", "Specific8200_40x40.png", "router"),
    ("2960", "Specific2960_40x40.png", "switch"),
    ("2950-24", "Specific2950-24_40x40.png", "switch"),
    ("2950T", "Specific2950T_40x40.png", "switch"),
    ("3560", "Specific3560_24PS_40x40.png", "switch"),
    ("3650", "Specific3650.png", "switch"),
    ("PC-PT", "SpecificArtificialWorkstation_40x40.png", "pc"),
    ("Laptop", "SpecificArtificialLaptop_40x40.png", "laptop"),
    ("Server", "SpecificArtificialServer_40x40.png", "server"),
    ("Printer", "SpecificArtificialPrinter_40x40.png", "printer"),
    ("Cloud", "SpecificArtificialCloud_40x40.png", "cloud"),
    ("Hub", "SpecificArtificialHub_40x40.png", "hub"),
    ("Access Point", "AP-PT.png", "ap"),
    ("ASA 5505", "SpecificASA5505.png", "asa"),
    ("ASA 5506", "SpecificASA5506.png", "asa"),
    ("IP Phone", "SpecificIPPhone_40x40.png", "phone"),
    ("TV", "SpecificArtificialTV_40x40.png", "tv"),
    ("PDA", "SpecificArtificialPda_40x40.png", "pda"),
    ("Tablet PC", "SpecificArtificialTabletPC_40x40.png", "tablet"),
    ("Sniffer", "Sniffer_Specific40x40.png", "sniffer"),
    ("WLC", "SpecificWLC_40x40.png", "wlc"),
    ("PLC", "SpecificPLC_40x40.png", "plc"),
    ("Thing", "SpecificThing_40x40.png", "thing"),
    ("IoE", "SpecificIoE_40x40.png", "ioe"),
    ("Analog Phone", "SpecificAnalogPhone_40x40.png", "analogphone"),
    ("Home Router", "SpecificHomeRouter_40x40.png", "homerouter"),
    ("Linksys", "SpecificLinksys_40x40.png", "linksys"),
    ("Cable Modem", "SpecificCable-Modem_40x40.png", "cablemodem"),
    ("DSL Modem", "SpecificDSL-Modem_40x40.png", "dsl"),
    ("Multiuser", "SpecificMultiuser.png", "multiuser"),
    ("Cell Tower", "SpecificCellTower_40x40.png", "celltower"),
    ("IE2000", "IE2000_ComponentBox.png", "ie2000"),
    ("Network Controller", "NetworkController.png", "netcontroller"),
    ("Meraki Server", "SpecificMerakiServer.png", "meraki"),
    ("Data Historian", "DataHistorianComponentBox.png", "historian"),
    ("Patch Panel", "SpecificPatchPanel_40x40.png", "patchpanel"),
];

pub(super) const GROUPS: &[(&str, &str)] = &[
    ("Routers", "/art3d/groups/routers.png"),
    ("Switches", "/art3d/groups/switches.png"),
    ("Hubs", "/art3d/groups/hubs.png"),
    ("Wireless", "/art3d/groups/wireless.png"),
    ("Security", "/art3d/groups/security.png"),
    ("WAN", "/art3d/groups/wan.png"),
    ("End devices", "/art3d/misc/devices.png"),
    ("Connections", "/art3d/misc/cable.png"),
    ("IoE", "/art3d/groups/notes.png"),
];

pub(super) const FILTERS: &[&str] = &[
    "ACL", "AAA", "AEP", "BGP", "BT", "DHCP", "DHCPv6", "DNS", "EIGRP", "E-mail", "FTP", "H.323",
    "HTTP", "HTTPS", "ICMP", "ICMPv6", "IEEE802.1X", "IPSEC", "ISAKMP", "IS-IS", "LACP", "LISP",
    "MQTT", "NAC", "NDP", "NETCONF", "NTP", "OSPF", "PAgP", "PAP", "POP3", "PPP", "RADIUS", "RIP",
    "RTP", "SCCP", "SCTP", "SIP", "SMTP", "SNMP", "SSH", "STP", "SYSLOG", "TACACS", "TCP", "TFTP",
    "Telnet", "UDP", "VTP",
];

pub(super) fn default_port_metrics(name: &str) -> (u32, u32) {
    if name.starts_with("GigabitEthernet") || name.starts_with("Gig") {
        (1_000_000, 10)
    } else if name.starts_with("Serial") {
        (1544, 20_000)
    } else {
        (100_000, 100)
    }
}

pub(super) fn default_ports(kind: &str) -> Vec<PortCfg> {
    let names: Vec<String> = match kind {
        "router" => {
            let mut v: Vec<String> = (0..3).map(|i| format!("GigabitEthernet0/{i}")).collect();
            // The 2811's HWIC slots carry two serial interfaces.
            v.push("Serial0/0/0".to_string());
            v.push("Serial0/1/0".to_string());
            v
        }
        "switch" => (1..=24).map(|i| format!("FastEthernet0/{i}")).collect(),
        _ => vec!["FastEthernet0".to_string()],
    };
    names
        .into_iter()
        // A cabled interface is up until something shuts it down, and the demo
        // workspace ships already wired.
        .map(|name| {
            let (bandwidth_kbps, delay_us) = default_port_metrics(&name);
            PortCfg { name, ip: None, prefix: 24, up: true, bandwidth_kbps, delay_us, vlan: 1, trunk: false, dot1q: None }
        })
        .collect()
}

/// The out-of-band port a console cable terminates on: `RS-232` on a host,
/// `Console` on the router or switch.
pub(super) fn console_port(ws: &Workspace, id: &str) -> String {
    if ws.console_capable(id) {
        "RS-232".to_string()
    } else {
        "Console".to_string()
    }
}

/// The port a phone cable terminates on: `Phone0` on an analog phone,
/// `Voice0` on the router or switch that serves it.
pub(super) fn phone_port(kind: &str) -> String {
    if kind == "analogphone" {
        "Phone0".to_string()
    } else {
        "Voice0".to_string()
    }
}

pub(super) fn logical_icon(model: &str, kind: &str) -> String {
    let icon = CATALOG
        .iter()
        .find(|(label, _, _)| *label == model)
        .map_or(kind, |(_, _, kind)| kind);
    format!("/art3d/devices/{icon}.png")
}

/// Original fallback artwork shipped in `web/art/<kind>.svg`.
pub(super) fn logical_art(kind: &str) -> &'static str {
    match kind {
        "router" => "/art/router.svg",
        "switch" => "/art/switch.svg",
        "pc" => "/art/pc.svg",
        "laptop" => "/art/laptop.svg",
        "server" => "/art/server.svg",
        "printer" => "/art/printer.svg",
        "cloud" => "/art/cloud.svg",
        "hub" => "/art/hub.svg",
        "ap" => "/art/ap.svg",
        "asa" => "/art/asa.svg",
        "phone" => "/art/phone.svg",
        "tv" => "/art/tv.svg",
        "pda" => "/art/pda.svg",
        "tablet" => "/art/tablet.svg",
        "sniffer" => "/art/sniffer.svg",
        "wlc" => "/art/wlc.svg",
        "plc" => "/art/plc.svg",
        "thing" => "/art/thing.svg",
        "ioe" => "/art/ioe.svg",
        "analogphone" => "/art/analogphone.svg",
        "homerouter" => "/art/homerouter.svg",
        "linksys" => "/art/linksys.svg",
        "cablemodem" => "/art/cablemodem.svg",
        "dsl" => "/art/dsl.svg",
        "multiuser" => "/art/multiuser.svg",
        "celltower" => "/art/celltower.svg",
        "ie2000" => "/art/ie2000.svg",
        "netcontroller" => "/art/netcontroller.svg",
        "meraki" => "/art/meraki.svg",
        "historian" => "/art/historian.svg",
        "patchpanel" => "/art/patchpanel.svg",
        _ => "/art/pc.svg",
    }
}

pub(super) fn name_prefix(kind: &str) -> &'static str {
    match kind {
        "router" => "Router",
        "switch" => "Switch",
        "pc" => "PC",
        "laptop" => "Laptop",
        "server" => "Server",
        "printer" => "Printer",
        "cloud" => "Cloud",
        "hub" => "Hub",
        "ap" => "AccessPoint",
        "asa" => "ASA",
        "phone" => "IPPhone",
        "tv" => "TV",
        "pda" => "PDA",
        "tablet" => "Tablet",
        "sniffer" => "Sniffer",
        "wlc" => "WLC",
        "plc" => "PLC",
        "thing" => "Thing",
        "ioe" => "IoE",
        "analogphone" => "AnalogPhone",
        "homerouter" => "HomeRouter",
        "linksys" => "Linksys",
        "cablemodem" => "CableModem",
        "dsl" => "DSLModem",
        "multiuser" => "Multiuser",
        "celltower" => "CellTower",
        "ie2000" => "IE2000",
        "netcontroller" => "NetController",
        "meraki" => "MerakiServer",
        "historian" => "DataHistorian",
        "patchpanel" => "PatchPanel",
        _ => "Device",
    }
}
