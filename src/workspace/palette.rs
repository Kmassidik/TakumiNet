use super::*;

/// (palette label, one-line plain-language description, device kind)
pub(super) const CATALOG: &[(&str, &str, &str)] = &[
    ("Router 100", "A small router for a home office: routes between a few networks.", "router"),
    ("Router 300", "The everyday branch router: routing, NAT, access lists, OSPF.", "router"),
    ("Router 500", "A heavy router for big sites and providers: same features, more capacity.", "router"),
    ("Switch 24", "A 24-port switch: joins devices in one building and learns their addresses.", "switch"),
    ("Switch L3", "A switch that also routes: VLAN gateways and OSPF without a separate router.", "switch-l3"),
    ("Hub", "Repeats every frame to every port. Old, noisy, great for watching traffic.", "hub"),
    ("Patch Panel", "A passive panel where wall cables end. No electronics inside.", "patchpanel"),
    ("Access Point", "Carries Wi-Fi for one room and bridges it onto the cabled network.", "ap"),
    ("Wireless Controller", "Manages many access points and their Wi-Fi networks from one place.", "wlc"),
    ("Hotspot AP", "An open hotspot for visitors who sign in with a voucher.", "hotspot-ap"),
    ("Sector Radio", "A pole-top radio that serves many houses in one direction.", "sector-radio"),
    ("Client Radio", "The small radio at a house that points back at the pole.", "client-radio"),
    ("Cell Tower", "Carries mobile devices over cellular radio.", "celltower"),
    ("Firewall 100", "Separates zones and filters what may pass between them.", "asa"),
    ("Cloud", "Stands for a network you do not model: the internet or a provider.", "cloud"),
    ("Provider Link", "The line from a bigger provider; private addresses stop here without NAT.", "provider-link"),
    ("Gateway RT/RW", "A neighbourhood internet gateway: customer logins, speed limits, vouchers, NAT.", "rtrw-gateway"),
    ("Backbone POP", "A province backbone site on the long-distance ring.", "backbone-pop"),
    ("Internet Exchange", "Where many networks peer in one room.", "internet-exchange"),
    ("National Gateway", "A country's door to the undersea cables.", "national-gateway"),
    ("Submarine Cable", "An undersea fibre between countries; its delay is the distance.", "submarine-cable"),
    ("Home Router", "The family router: Wi-Fi, DHCP, a guest network, port forwards.", "homerouter"),
    ("Cable Modem", "Turns the TV cable into a network line.", "cablemodem"),
    ("DSL Modem", "Turns the phone line into a network line.", "dsl"),
    ("PC", "A desktop computer with a terminal, a browser and network settings.", "pc"),
    ("Laptop", "A portable computer; joins Wi-Fi or a cable.", "laptop"),
    ("Server", "Serves web pages, names, addresses, mail and files to the network.", "server"),
    ("Printer", "A network printer with an address.", "printer"),
    ("Tablet", "A handheld device; joins Wi-Fi.", "tablet"),
    ("IP Phone", "A desk phone that calls over the network.", "phone"),
    ("Analog Phone", "An old phone; needs a voice port on a router.", "analogphone"),
    ("TV", "A smart TV on the network.", "tv"),
    ("Sniffer", "Captures and shows the frames that pass through it.", "sniffer"),
    ("PLC", "An industrial controller speaking Modbus-style registers.", "plc"),
    ("Thing", "A small IoT device with sensors and registers.", "thing"),
    ("IoE", "An IoT board you can wire to things.", "ioe"),
    ("Load Balancer", "One address in front of many servers; hands each request to the next healthy one.", "load-balancer"),
    ("District Hub", "A city district's hub on the fibre ring.", "district-hub"),
    ("City Exchange", "Where a city's providers meet and trade traffic.", "city-exchange"),
    ("Regency Hub", "The regency's central hub; villages hang off it over radio.", "regency-hub"),
    ("Village POP", "The small point of presence that serves one village.", "village-pop"),
    ("Microwave Link", "A point-to-point radio hop; fast but needs line of sight.", "microwave-link"),
    ("Satellite Terminal", "Reaches anywhere, with half a second of delay.", "satellite-terminal"),
];

/// Vendor-flavoured labels from older files, mapped to the tiered own names.
pub(super) const LEGACY_MODELS: &[(&str, &str)] = &[
    ("1941", "Router 100"), ("2811", "Router 100"), ("2621XM", "Router 100"),
    ("1841", "Router 100"), ("2620XM", "Router 100"), ("819", "Router 100"), ("829", "Router 100"),
    ("2911", "Router 300"), ("2901", "Router 300"),
    ("4331", "Router 500"), ("4321", "Router 500"), ("8200", "Router 500"),
    ("2960", "Switch 24"), ("2950-24", "Switch 24"), ("2950T", "Switch 24"),
    ("3560", "Switch 24"), ("3650", "Switch 24"),
    ("PC-PT", "PC"), ("Tablet PC", "Tablet"),
    ("ASA 5505", "Firewall 100"), ("ASA 5506", "Firewall 100"),
    ("WLC", "Wireless Controller"),
];

/// Kinds that older files may carry although the palette no longer offers them.
pub(super) const RETIRED: &[(&str, &str)] = &[
    ("Linksys", "linksys"), ("Meraki Server", "meraki"), ("IE2000", "ie2000"),
    ("Network Controller", "netcontroller"), ("Data Historian", "historian"),
    ("PDA", "pda"), ("Multiuser", "multiuser"), ("IP Phone 7960", "phone"),
];

pub(super) fn canonical_model(model: &str) -> &str {
    LEGACY_MODELS.iter().find(|(old, _)| *old == model).map_or(model, |(_, new)| new)
}

pub(super) fn retired_kind(model: &str) -> Option<&'static str> {
    RETIRED.iter().find(|(old, _)| *old == model).map(|(_, kind)| *kind)
}

pub(super) const GROUPS: &[(&str, &str)] = &[
    ("Routers", "/art3d/groups/routers.webp"),
    ("Switches", "/art3d/groups/switches.webp"),
    ("Wireless", "/art3d/groups/wireless.webp"),
    ("Home and internet", "/art3d/groups/wan.webp"),
    ("Backbone", "/art3d/groups/hubs.webp"),
    ("Security and servers", "/art3d/groups/security.webp"),
    ("End devices", "/art3d/misc/devices.webp"),
    ("Connections", "/art3d/misc/cable.webp"),
    ("IoT", "/art3d/devices/thing.webp"),
];

pub(super) const FILTERS: &[&str] = &[
    "ACL", "AAA", "AEP", "BGP", "BT", "DHCP", "DHCPv6", "DNS", "EIGRP", "E-mail", "FTP", "H.323",
    "HTTP", "HTTPS", "ICMP", "ICMPv6", "IEEE802.1X", "IPSEC", "ISAKMP", "IS-IS", "LACP", "LISP",
    "MODBUS", "MQTT", "NAC", "NDP", "NETCONF", "NTP", "OSPF", "PAgP", "PAP", "POP3", "PPP",
    "PROFINET", "PRP", "PTP", "RADIUS", "RIP", "RTP", "SCCP", "SCTP", "SIP", "SMTP", "SNMP",
    "SSH", "STP", "SYSLOG", "TACACS", "TCP", "TFTP", "Telnet", "UDP", "VTP", "Cellular",
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
        "hub" => (0..8).map(|i| format!("FastEthernet{i}")).collect(),
        "homerouter" => (0..4).map(|i| format!("FastEthernet{i}")).collect(),
        "cloud" => (0..4).map(|i| format!("FastEthernet{i}")).collect(),
        "rtrw-gateway" => (1..=5).map(|i| format!("Ether{i}")).collect(),
        "sector-radio" => (0..6).map(|i| format!("FastEthernet{i}")).collect(),
        "provider-link" | "client-radio" => (0..2).map(|i| format!("FastEthernet{i}")).collect(),
        "hotspot-ap" => (0..4).map(|i| format!("FastEthernet{i}")).collect(),
        "asa" => (1..=3).map(|i| format!("GigabitEthernet1/{i}")).collect(),
        "switch-l3" => (1..=12).map(|i| format!("GigabitEthernet0/{i}")).collect(),
        "district-hub" | "city-exchange" | "regency-hub" => {
            (0..8).map(|i| format!("GigabitEthernet0/{i}")).collect()
        }
        "village-pop" => (0..4).map(|i| format!("GigabitEthernet0/{i}")).collect(),
        "microwave-link" | "satellite-terminal" => {
            (0..2).map(|i| format!("FastEthernet{i}")).collect()
        }
        "backbone-pop" | "internet-exchange" | "national-gateway" => (0..8).map(|i| format!("GigabitEthernet0/{i}")).collect(),
        "submarine-cable" => (0..2).map(|i| format!("FastEthernet{i}")).collect(),
        "load-balancer" => (0..4).map(|i| format!("FastEthernet{i}")).collect(),
        "cablemodem" | "dsl" => (0..2).map(|i| format!("FastEthernet{i}")).collect(),
        // Twelve jacks on the panel; the sniffer taps one cable, so two ports.
        "patchpanel" => (0..12).map(|i| format!("FastEthernet{i}")).collect(),
        "sniffer" => (0..2).map(|i| format!("FastEthernet{i}")).collect(),
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
    format!("/art3d/devices/{icon}.webp")
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
        "rtrw-gateway" => "Gateway",
        "provider-link" => "Upstream",
        "sector-radio" => "SectorRadio",
        "client-radio" => "ClientRadio",
        "hotspot-ap" => "HotspotAP",
        "switch-l3" => "L3Switch",
        "backbone-pop" => "POP",
        "internet-exchange" => "Exchange",
        "national-gateway" => "NationalGateway",
        "submarine-cable" => "SeaCable",
        "load-balancer" => "Balancer",
        "district-hub" => "DistrictHub",
        "city-exchange" => "CityExchange",
        "regency-hub" => "RegencyHub",
        "village-pop" => "VillagePop",
        "microwave-link" => "Microwave",
        "satellite-terminal" => "Satellite",
        _ => "Device",
    }
}
