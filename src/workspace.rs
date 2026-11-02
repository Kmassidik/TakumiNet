//! Mutable logical workspace: devices, links, palette catalogue.
//!
//! The server owns this state, so a device dropped in the browser exists on the
//! server too and survives a reload.

use std::collections::HashMap;

fn s(v: &str) -> String {
    let mut o = String::with_capacity(v.len() + 2);
    o.push('"');
    for c in v.chars() {
        match c {
            '"' => o.push_str("\\\""),
            '\\' => o.push_str("\\\\"),
            c if (c as u32) < 0x20 => o.push_str(&format!("\\u{:04x}", c as u32)),
            c => o.push(c),
        }
    }
    o.push('"');
    o
}

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub struct PortState {
    /// `no shutdown` state.
    pub admin_up: bool,
    /// A cable is plugged into the interface.
    pub linked: bool,
    /// Both ends are enabled, so the line protocol is up.
    pub line_up: bool,
}

#[derive(Clone, Debug)]
pub struct PortCfg {
    pub name: String,
    pub ip: Option<u32>,
    pub prefix: u8,
    pub up: bool,
    /// Access VLAN (1 = default) on a switch port.
    pub vlan: u16,
    /// 802.1Q trunk: carries every VLAN, tagged.
    pub trunk: bool,
}

/// State a live network keeps between deliveries: switch MAC learning and ARP
/// caches. Both age on the simulated clock.
#[derive(Clone, Default)]
pub struct Tables {
    macs: HashMap<String, crate::net::packet::MacTable>,
    arps: HashMap<String, crate::net::packet::ArpTable>,
}

impl Tables {
    pub fn macs(&mut self, id: &str) -> &mut crate::net::packet::MacTable {
        self.macs
            .entry(id.to_string())
            .or_insert_with(|| crate::net::packet::MacTable::new(300.0))
    }

    pub fn arps(&mut self, id: &str) -> &mut crate::net::packet::ArpTable {
        self.arps
            .entry(id.to_string())
            .or_insert_with(|| crate::net::packet::ArpTable::new(120.0))
    }

    /// Drop everything learned for a device that no longer exists.
    pub fn forget(&mut self, id: &str) {
        self.macs.remove(id);
        self.arps.remove(id);
    }

    /// `show mac address-table` rows for one switch.
    pub fn mac_rows(&self, id: &str) -> Vec<crate::net::packet::MacEntry> {
        self.macs.get(id).map(|t| t.rows()).unwrap_or_default()
    }

    /// `show arp` rows for one device.
    pub fn arp_rows(&self, id: &str) -> Vec<crate::net::packet::ArpEntry> {
        self.arps.get(id).map(|t| t.rows()).unwrap_or_default()
    }
}

#[derive(Clone)]
pub struct Device {
    pub id: String,
    pub name: String,
    pub model: String,
    pub icon: String,
    pub kind: String,
    pub x: f32,
    pub y: f32,
    /// IPv4 address, host byte order. `None` = not configured yet.
    pub ip: Option<u32>,
    pub prefix: u8,
    pub gateway: Option<u32>,
    pub dns: Option<u32>,
    /// IPv6 as text (not simulated); mirrors the dialog's IPv6 section.
    pub ipv6: Option<String>,
    pub ipv6_prefix: u8,
    pub ipv6_gateway: Option<String>,
    pub ipv6_dns: Option<String>,
    pub ipv6_auto: bool,
    /// Interfaces shown by the CLI (`show ip interface brief`).
    pub ports: Vec<PortCfg>,
    /// Static routes: (destination network, prefix, next hop).
    pub routes: Vec<(u32, u8, u32)>,
    /// 802.1X block from the same dialog.
    pub dot1x: bool,
    pub dot1x_user: Option<String>,
    pub dot1x_pass: Option<String>,
}

#[derive(Clone)]
pub struct Link {
    pub a: String,
    pub a_port: String,
    pub b: String,
    pub b_port: String,
    /// Physical cable: `eCopper`, `eCross`, `eSerial`, `eFiber`, `eConsole`.
    pub kind: String,
}

/// Cable types the palette can draw, in the order PT lists them.
pub const CABLE_KINDS: &[&str] = &[
    "eCopper", "eCross", "eSerial", "eFiber", "eConsole", "ePhone", "eCoax", "eIoT",
];

impl Link {
    /// A console cable is out-of-band: it never carries user traffic.
    pub fn carries_data(&self) -> bool {
        self.kind != "eConsole"
    }
}

/// (palette label, tile icon, device kind)
const CATALOG: &[(&str, &str, &str)] = &[
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

const GROUPS: &[(&str, &str)] = &[
    ("Routers", "Router25x25.png"),
    ("Switches", "Switch25x25.png"),
    ("Hubs", "Hub25x25.png"),
    ("Wireless", "Wireless25x25.png"),
    ("Security", "SpecificASA5505.png"),
    ("WAN", "WANEmulation25x25.png"),
    ("End devices", "EndTypes25x25.png"),
    ("Connections", "Connections25x25.png"),
    ("IoE", "IoE25x25.png"),
];

const FILTERS: &[&str] = &[
    "ACL", "AAA", "AEP", "BGP", "BT", "DHCP", "DHCPv6", "DNS", "EIGRP", "E-mail", "FTP", "H.323",
    "HTTP", "HTTPS", "ICMP", "ICMPv6", "IEEE802.1X", "IPSEC", "ISAKMP", "IS-IS", "LACP", "LISP",
    "MQTT", "NAC", "NDP", "NETCONF", "NTP", "OSPF", "PAgP", "PAP", "POP3", "PPP", "RADIUS", "RIP",
    "RTP", "SCCP", "SCTP", "SIP", "SMTP", "SNMP", "SSH", "STP", "SYSLOG", "TACACS", "TCP", "TFTP",
    "Telnet", "UDP", "VTP",
];


fn default_ports(kind: &str) -> Vec<PortCfg> {
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
        .map(|name| PortCfg { name, ip: None, prefix: 24, up: true, vlan: 1, trunk: false })
        .collect()
}

/// The out-of-band port a console cable terminates on: `RS-232` on a host,
/// `Console` on the router or switch.
fn console_port(ws: &Workspace, id: &str) -> String {
    if ws.console_capable(id) {
        "RS-232".to_string()
    } else {
        "Console".to_string()
    }
}

/// The port a phone cable terminates on: `Phone0` on an analog phone,
/// `Voice0` on the router or switch that serves it.
fn phone_port(kind: &str) -> String {
    if kind == "analogphone" {
        "Phone0".to_string()
    } else {
        "Voice0".to_string()
    }
}

fn logical_icon(kind: &str) -> &'static str {
    // Mounted reference tree (never shipped in the image); used when present.
    match kind {
        "router" => "art/Workspace/Logical/iRouter@2x.png",
        "switch" => "art/Workspace/Logical/iSwitch@2x.png",
        "pc" => "art/Workspace/Logical/iWorkstation@2x.png",
        "laptop" => "art/Workspace/Logical/iLaptop@2x.png",
        "server" => "art/Workspace/Logical/iServer@2x.png",
        "printer" => "art/Workspace/Logical/iPrinter@2x.png",
        "cloud" => "art/Workspace/Logical/iCloud@2x.png",
        "hub" => "art/Workspace/Logical/iHub@2x.png",
        "ap" => "art/Workspace/Logical/iAccessPoint@2x.png",
        "asa" => "art/Workspace/Logical/iASA@2x.png",
        "phone" => "art/Workspace/Logical/iIPPhone@2x.png",
        "tv" => "art/Workspace/Logical/iTV@2x.png",
        "pda" => "art/Workspace/Logical/iPda@2x.png",
        "tablet" => "art/Workspace/Logical/iTabletPC@2x.png",
        "sniffer" => "art/Workspace/Logical/iSniffer@2x.png",
        "wlc" => "art/Workspace/Logical/iWLC@2x.png",
        "plc" => "art/Workspace/Logical/iPLC@2x.png",
        "thing" => "art/Workspace/Logical/iThing@2x.png",
        "ioe" => "art/Workspace/Logical/iIoE@2x.png",
        "analogphone" => "art/Workspace/Logical/iAnalogPhone@2x.png",
        "homerouter" => "art/Workspace/Logical/iHomeRouter@2x.png",
        "linksys" => "art/Workspace/Logical/iLinksys@2x.png",
        "cablemodem" => "art/Workspace/Logical/iModem@2x.png",
        "dsl" => "art/Workspace/Logical/iDSL.png",
        "multiuser" => "art/Workspace/Logical/iCluster@2x.png",
        "celltower" => "art/Workspace/Logical/iCellTower@2x.png",
        "ie2000" => "art/Workspace/Logical/iIE2000@2x.png",
        "netcontroller" => "art/Workspace/Logical/iNetworkController@2x.png",
        "meraki" => "art/Workspace/Logical/LogicalMerakiServer@2x.png",
        "historian" => "art/Workspace/Logical/DataHistorianLogical.png",
        "patchpanel" => "art/Workspace/Logical/iPatchPanel.png",
        _ => "art/Workspace/Logical/iWorkstation@2x.png",
    }
}

/// Original fallback artwork shipped in `web/art/<kind>.svg`.
fn logical_art(kind: &str) -> &'static str {
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

fn name_prefix(kind: &str) -> &'static str {
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

/// One captured simulation event (a PDU delivered along a path).
#[derive(Clone)]
pub struct Event {
    pub id: u32,
    pub time: f32,
    pub last: String,
    pub at: String,
    pub kind: String,
    pub proto: String,
    pub path: Vec<String>,
    /// Per-device detail: ingress/egress ports, TTL, MACs, decision.
    pub hops: Vec<crate::net::fwd::Hop>,
    /// Frame size in bytes on the wire.
    pub size: usize,
}

/// One WLAN on a controller.
#[derive(Clone, Debug)]
pub struct Wlan {
    pub ssid: String,
    pub secret: String,
    pub security: String,
}

/// `ip nat inside source list N interface IFACE overload`.
#[derive(Clone, Debug)]
pub struct NatRule {
    pub acl: u16,
    pub iface: String,
}

/// One ACE: standard (source only) or extended (source + destination) match.
#[derive(Clone, Debug)]
pub struct AclRule {
    pub permit: bool,
    pub src: u32,
    pub src_wc: u32,
    pub dst: Option<(u32, u32)>,
}

/// Port-security policy on one switch port: a MAC limit plus the learned set.
#[derive(Clone, Debug, Default)]
pub struct PortSecurity {
    pub max: u16,
    pub macs: Vec<String>,
}

#[derive(Clone)]
pub struct Workspace {
    pub devices: Vec<Device>,
    pub links: Vec<Link>,
    counters: HashMap<String, u32>,
    pub events: Vec<Event>,
    next_event: u32,
    pub sim_time: f32,
    /// MAC and ARP state learned by the running simulation.
    pub tables: Tables,
    /// DHCP pools configured on servers, by device id.
    pub dhcp_pools: HashMap<String, Pool>,
    /// Addresses already handed out, by server id.
    pub dhcp_leases: HashMap<String, Vec<u32>>,
    /// Devices whose address came from DHCP rather than static config.
    pub dhcp_clients: std::collections::HashSet<String>,
    /// Configuration written by `write memory`; `reload` restores it.
    pub startup: Option<Vec<Device>>,
    /// `banner motd` text per device.
    pub banners: HashMap<String, String>,
    /// `line con 0` password per device.
    pub line_passwords: HashMap<String, String>,
    /// Devices whose power switch is off (absent = powered on).
    pub powered_off: std::collections::HashSet<String>,
    /// Installed module per slot, by device id.
    pub slots: HashMap<String, Vec<Option<String>>>,
    /// DNS records per server: lower-case name -> address.
    pub dns_records: HashMap<String, Vec<(String, u32)>>,
    /// Custom HTTP page body per server.
    pub http_pages: HashMap<String, String>,
    /// Static DHCP reservations per server: (client id, address).
    pub dhcp_reservations: HashMap<String, Vec<(String, u32)>>,
    /// `ip helper-address` per router: (interface, server address).
    pub dhcp_helpers: HashMap<String, Vec<(String, u32)>>,
    /// Named VLANs per switch: (vlan id, name). VLAN 1 is implicit.
    pub vlans: HashMap<String, Vec<(u16, String)>>,
    /// Mail users per server: (user, password).
    pub mail_users: HashMap<String, Vec<(String, String)>>,
    /// Delivered messages per server.
    pub mail: HashMap<String, Vec<Mail>>,
    /// TFTP files per server: (name, content).
    pub tftp: HashMap<String, Vec<(String, String)>>,
    /// FTP files per server: (name, content).
    pub ftp: HashMap<String, Vec<(String, String)>>,
    /// NTP client state: device -> (server address, offset ms).
    pub ntp: HashMap<String, (String, f64)>,
    /// Devices collecting syslog entries.
    pub syslog_on: std::collections::HashSet<String>,
    /// Syslog entries per device: (time, severity, text).
    pub syslog: HashMap<String, Vec<(f32, String, String)>>,
    /// AAA users per server: (user, password).
    pub aaa_users: HashMap<String, Vec<(String, String)>>,
    /// Port security per switch: interface -> policy.
    pub port_security: HashMap<String, HashMap<String, PortSecurity>>,
    /// EtherChannel membership per switch: interface -> group number.
    pub channels: HashMap<String, HashMap<String, u16>>,
    /// ACLs per device: list number -> ordered rules.
    pub acls: HashMap<String, HashMap<u16, Vec<AclRule>>>,
    /// ACL bindings per device: interface -> (list number, inbound).
    pub acl_bindings: HashMap<String, HashMap<String, (u16, bool)>>,
    /// NAT interface roles: device -> interface -> inside (true) / outside (false).
    pub nat_roles: HashMap<String, HashMap<String, bool>>,
    /// NAT overload rules per device.
    pub nat_rules: HashMap<String, Vec<NatRule>>,
    /// Observed translations: device -> (inside local, inside global).
    pub nat_translations: HashMap<String, Vec<(u32, u32)>>,
    /// Dynamic routing config: router -> (protocol, advertised networks).
    pub routing: HashMap<String, (String, Vec<(u32, u8)>)>,
    /// Installed dynamic routes: router -> (network, prefix, via, proto, metric).
    pub dyn_routes: HashMap<String, Vec<(u32, u8, u32, String, u8)>>,
    /// Spanning-tree mode per switch (`pvst` or `rapid-pvst`).
    pub stp_modes: HashMap<String, String>,
    /// WLANs per wireless LAN controller: (SSID, PSK).
    pub wlans: HashMap<String, Vec<Wlan>>,
    /// Wireless association: client -> (SSID, controller id).
    pub wifi: HashMap<String, (String, String)>,
    /// VPN client config: device -> (server address, user).
    pub vpn: HashMap<String, (String, String)>,
    /// PPPoE client config: device -> (server address, user).
    pub pppoe: HashMap<String, (String, String)>,
    /// AP -> controller registrations (CAPWAP join).
    pub capwap: HashMap<String, String>,
    /// Modbus holding registers per industrial device (256 words).
    pub iot_regs: HashMap<String, Vec<u16>>,
    /// PTP slaves: device -> (master address, offset ms).
    pub ptp: HashMap<String, (String, f64)>,
    /// Devices running PRP.
    pub prp_on: std::collections::HashSet<String>,
    /// PRP duplicate suppression window per receiver: sequence numbers seen.
    pub prp_seen: HashMap<String, Vec<u32>>,
    /// Cellular clients associated with a cell tower.
    pub cell_links: HashMap<String, String>,
    /// Stateful inspection enabled per ASA.
    pub inspect: HashMap<String, bool>,
    /// IPS signature actions per device: protocol names to drop.
    pub ips: HashMap<String, Vec<String>>,
    /// OSPFv3 advertised IPv6 prefixes per router.
    pub v6_networks: HashMap<String, Vec<String>>,
    /// IP phones: device -> (call-manager address, extension).
    pub phones: HashMap<String, (String, u16)>,
}

#[derive(Clone, Debug, PartialEq, Eq)]
pub struct Mail {
    pub from: String,
    pub to: String,
    pub subject: String,
    pub body: String,
    pub read: bool,
}

/// A DHCP pool: one subnet, its gateway and DNS, handed out from .100 up.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub struct Pool {
    pub network: u32,
    pub prefix: u8,
    pub gateway: Option<u32>,
    pub dns: Option<u32>,
}

#[derive(Clone, Debug, PartialEq, Eq)]
pub struct Lease {
    pub ip: u32,
    pub prefix: u8,
    pub gateway: Option<u32>,
    pub dns: Option<u32>,
    pub server: String,
}

impl Workspace {
    pub fn new() -> Self {
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

        let demo = [
            ("router0", "Router0", "2911", "router", 350.0, 88.0),
            ("switch0", "Switch0", "2960-24TT", "switch", 200.0, 210.0),
            ("switch1", "Switch1", "2960-24TT", "switch", 505.0, 210.0),
            ("pc0", "PC0", "PC-PT", "pc", 105.0, 400.0),
            ("pc1", "PC1", "PC-PT", "pc", 265.0, 400.0),
            ("server0", "Server0", "Server-PT", "server", 395.0, 420.0),
            ("pc2", "PC2", "PC-PT", "pc", 520.0, 400.0),
        ];
        for (id, name, model, kind, x, y) in demo {
            ws.devices.push(Device {
                id: id.to_string(),
                name: name.to_string(),
                model: model.to_string(),
                icon: logical_icon(kind).to_string(),
                kind: kind.to_string(),
                x,
                y,
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
            });
        }

        ws.links = vec![
            Link { a: "router0".into(), a_port: "Gig0/0".into(), b: "switch0".into(), b_port: "Fa0/1".into(), kind: "eCopper".into() },
            Link { a: "switch0".into(), a_port: "Fa0/2".into(), b: "pc0".into(), b_port: "Fa0".into(), kind: "eCopper".into() },
            Link { a: "switch0".into(), a_port: "Fa0/3".into(), b: "pc1".into(), b_port: "Fa0".into(), kind: "eCopper".into() },
            Link { a: "router0".into(), a_port: "Gig0/1".into(), b: "switch1".into(), b_port: "Fa0/1".into(), kind: "eCopper".into() },
            Link { a: "switch1".into(), a_port: "Fa0/2".into(), b: "server0".into(), b_port: "Fa0".into(), kind: "eCopper".into() },
            Link { a: "switch1".into(), a_port: "Fa0/3".into(), b: "pc2".into(), b_port: "Fa0".into(), kind: "eCopper".into() },
        ];

        // The demo ships configured: two LANs joined by router0, matching the
        // topology the README documents.
        let cfg = [
            ("pc0", "192.168.1.10", "192.168.1.1"),
            ("pc1", "192.168.1.11", "192.168.1.1"),
            ("pc2", "192.168.2.10", "192.168.2.1"),
            ("server0", "192.168.2.20", "192.168.2.1"),
        ];
        for (id, addr, gw) in cfg {
            let _ = ws.set_config(id, addr, "255.255.255.0", gw, "");
        }
        let _ = ws.set_port_ip("router0", "GigabitEthernet0/0", "192.168.1.1", 24);
        let _ = ws.set_port_ip("router0", "GigabitEthernet0/1", "192.168.2.1", 24);

        for d in &ws.devices {
            let c = ws.counters.entry(d.kind.clone()).or_insert(0);
            *c += 1;
        }
        ws
    }

    /// Create a device from a palette label at canvas coordinates.
    pub fn add(&mut self, model: &str, x: f32, y: f32) -> Option<String> {
        let (_, _, kind) = CATALOG.iter().find(|(label, _, _)| *label == model)?;
        let n = {
            let c = self.counters.entry(kind.to_string()).or_insert(0);
            let current = *c;
            *c += 1;
            current
        };
        let id = format!("{}{}", kind, n);
        let device = Device {
            id: id.clone(),
            name: format!("{}{}", name_prefix(kind), n),
            model: model.to_string(),
            icon: logical_icon(kind).to_string(),
            kind: kind.to_string(),
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
            ports: default_ports(kind),
            routes: Vec::new(),
            dot1x: false,
            dot1x_user: None,
            dot1x_pass: None,
        };
        self.devices.push(device);
        Some(id)
    }

    pub fn mv(&mut self, id: &str, x: f32, y: f32) -> bool {
        match self.devices.iter_mut().find(|d| d.id == id) {
            Some(d) => {
                d.x = clamp_x(x);
                d.y = clamp_y(y);
                true
            }
            None => false,
        }
    }

    pub fn remove(&mut self, id: &str) -> bool {
        let before = self.devices.len();
        self.devices.retain(|d| d.id != id);
        if self.devices.len() == before {
            return false;
        }
        self.links.retain(|l| l.a != id && l.b != id);
        self.tables.forget(id);
        true
    }

    pub fn link(&mut self, a: &str, b: &str) -> Result<(), String> {
        self.link_kind(a, b, "eCopper")
    }

    /// Link two devices with an explicit cable type.
    pub fn link_kind(&mut self, a: &str, b: &str, kind: &str) -> Result<(), String> {
        if !CABLE_KINDS.contains(&kind) {
            return Err(format!("unknown cable type {kind}"));
        }
        if a == b {
            return Err("cannot link a device to itself".into());
        }
        if self.devices.iter().all(|d| d.id != a) {
            return Err(format!("unknown device {a}"));
        }
        if self.devices.iter().all(|d| d.id != b) {
            return Err(format!("unknown device {b}"));
        }
        if self
            .links
            .iter()
            .any(|l| (l.a == a && l.b == b) || (l.a == b && l.b == a))
        {
            return Err("already linked".into());
        }
        self.media_check(a, b, kind)?;
        let (a_port, b_port) = self.assign_ports(a, b, kind);
        self.links.push(Link {
            a: a.to_string(),
            a_port,
            b: b.to_string(),
            b_port,
            kind: kind.to_string(),
        });
        Ok(())
    }

    /// Only end devices drive a console session; routers and switches answer one.
    pub fn console_capable(&self, id: &str) -> bool {
        self.devices
            .iter()
            .find(|d| d.id == id)
            .map(|d| matches!(d.kind.as_str(), "pc" | "laptop" | "server" | "tablet" | "pda"))
            .unwrap_or(false)
    }

    /// The router or switch a console cable connects `id` to.
    pub fn console_peer(&self, id: &str) -> Option<&str> {
        let l = self
            .links
            .iter()
            .find(|l| l.kind == "eConsole" && (l.a == id || l.b == id))?;
        let peer = if l.a == id { &l.b } else { &l.a };
        self.devices
            .iter()
            .find(|d| d.id == *peer && matches!(d.kind.as_str(), "router" | "switch"))
            .map(|d| d.id.as_str())
    }

    /// The device and interface on the far end of a cable, if any.
    pub fn peer_port(&self, id: &str, port: &str) -> Option<(String, String)> {
        let dev = self.devices.iter().find(|d| d.id == id)?;
        let names: Vec<String> = dev.ports.iter().map(|p| p.name.clone()).collect();
        for l in &self.links {
            let (mine, theirs, other) = if l.a == id {
                (&l.a_port, &l.b_port, &l.b)
            } else if l.b == id {
                (&l.b_port, &l.a_port, &l.a)
            } else {
                continue;
            };
            if crate::cli::expand_iface(mine, &names).as_deref() == Some(port) {
                let peer = self.devices.iter().find(|d| d.id == *other)?;
                let peer_names: Vec<String> = peer.ports.iter().map(|p| p.name.clone()).collect();
                let peer_port = crate::cli::expand_iface(theirs, &peer_names)
                    .unwrap_or_else(|| theirs.to_string());
                return Some((other.clone(), peer_port));
            }
        }
        None
    }

    /// Admin, cable and line-protocol state of one interface.
    pub fn port_state(&self, id: &str, port: &str) -> PortState {
        let admin_up = self.port_admin(id, port);
        let peer = self.peer_port(id, port);
        let linked = peer.is_some();
        let line_up = admin_up && linked && peer.map(|(pid, pp)| self.port_admin(&pid, &pp)).unwrap_or(false);
        PortState {
            admin_up,
            linked,
            line_up,
        }
    }

    fn port_admin(&self, id: &str, port: &str) -> bool {
        self.devices
            .iter()
            .find(|d| d.id == id)
            .and_then(|d| d.ports.iter().find(|p| p.name == port))
            .map(|p| p.up)
            // Single-port hosts are administratively up by definition.
            .unwrap_or(true)
    }

    fn kind_of(&self, id: &str) -> String {
        self.devices
            .iter()
            .find(|d| d.id == id)
            .map(|d| d.kind.clone())
            .unwrap_or_default()
    }

    /// Which cables may join these two devices.
    fn media_check(&self, a: &str, b: &str, kind: &str) -> Result<(), String> {
        let ka = self.kind_of(a);
        let kb = self.kind_of(b);
        let ethernet = |k: &str| {
            matches!(
                k,
                "pc" | "laptop" | "server" | "printer" | "tv" | "sniffer" | "tablet" | "pda"
                    | "phone" | "asa" | "wlc" | "ap" | "hub" | "switch" | "router"
                    | "homerouter" | "cloud"
            )
        };
        let network = |k: &str| matches!(k, "switch" | "router");
        let iot = |k: &str| matches!(k, "thing" | "plc" | "ioe" | "mcucomponent");
        match kind {
            "eConsole" => {
                if !(self.console_capable(a) ^ self.console_capable(b)) {
                    return Err("a console cable joins a PC to a router or switch".into());
                }
            }
            "eSerial" => {
                if !network(&ka) || !network(&kb) {
                    return Err("a serial cable needs serial ports on both ends".into());
                }
                if self.free_serial(a).is_none() || self.free_serial(b).is_none() {
                    return Err("no free serial port on this device".into());
                }
            }
            "eFiber" => {
                if !network(&ka) || !network(&kb) {
                    return Err("a fiber cable joins switches or routers".into());
                }
            }
            "ePhone" => {
                let ok = (ka == "analogphone" && network(&kb))
                    || (kb == "analogphone" && network(&ka));
                if !ok {
                    return Err(
                        "a phone cable joins an analog phone to a router or switch".into(),
                    );
                }
            }
            "eCoax" => {
                let endpoint = |k: &str| matches!(k, "homerouter" | "cloud");
                if !endpoint(&ka) && !endpoint(&kb) {
                    return Err("a coaxial cable needs a cable modem or cloud".into());
                }
            }
            "eIoT" => {
                if !((iot(&ka) || network(&ka)) && (iot(&kb) || network(&kb))) {
                    return Err(
                        "an IoT cable joins IoT devices (optionally through a switch)".into(),
                    );
                }
            }
            _ => {
                if !ethernet(&ka) || !ethernet(&kb) {
                    return Err("an Ethernet cable needs network interfaces on both ends".into());
                }
            }
        }
        Ok(())
    }

    /// Ports a cable terminates on; dedicated media get their own names.
    fn assign_ports(&self, a: &str, b: &str, kind: &str) -> (String, String) {
        match kind {
            "eConsole" => (console_port(self, a), console_port(self, b)),
            "eSerial" => (
                self.free_serial(a).unwrap_or_else(|| "Serial0/0/0".into()),
                self.free_serial(b).unwrap_or_else(|| "Serial0/0/0".into()),
            ),
            "ePhone" => (
                phone_port(&self.kind_of(a)),
                phone_port(&self.kind_of(b)),
            ),
            "eCoax" => ("Coax0".into(), "Coax0".into()),
            "eIoT" => ("IoT0".into(), "IoT0".into()),
            _ => (self.next_port(a), self.next_port(b)),
        }
    }

    fn free_serial(&self, id: &str) -> Option<String> {
        let dev = self.devices.iter().find(|d| d.id == id)?;
        dev.ports
            .iter()
            .map(|p| p.name.clone())
            .find(|name| name.starts_with("Serial") && !self.port_used(id, name))
    }

    fn port_used(&self, id: &str, port: &str) -> bool {
        let Some(dev) = self.devices.iter().find(|d| d.id == id) else {
            return false;
        };
        let names: Vec<String> = dev.ports.iter().map(|p| p.name.clone()).collect();
        self.links.iter().any(|l| {
            (l.a == id && crate::cli::expand_iface(&l.a_port, &names).as_deref() == Some(port))
                || (l.b == id && crate::cli::expand_iface(&l.b_port, &names).as_deref() == Some(port))
        })
    }

    /// Next free interface name for a device, derived from its kind and how
    /// many links it already has.
    fn next_port(&self, id: &str) -> String {
        let used = self.links.iter().filter(|l| l.a == id || l.b == id).count();
        let kind = self
            .devices
            .iter()
            .find(|d| d.id == id)
            .map(|d| d.kind.as_str())
            .unwrap_or("pc");
        match kind {
            "router" => format!("Gig0/{used}"),
            "switch" => format!("Fa0/{}", used + 1),
            _ => "Fa0".to_string(),
        }
    }

    pub fn unlink(&mut self, a: &str, b: &str) -> bool {
        let before = self.links.len();
        self.links
            .retain(|l| !((l.a == a && l.b == b) || (l.a == b && l.b == a)));
        self.links.len() != before
    }

    /// Link every unordered pair among `ids`, forming a full mesh.
    ///
    /// Unknown and repeated ids are ignored; pairs that are already linked are
    /// skipped. Returns how many new links were created. Fewer than two known
    /// devices is an error.
    pub fn mesh(&mut self, ids: &[String]) -> Result<usize, String> {
        let mut peers: Vec<String> = Vec::new();
        for id in ids {
            let known = self.devices.iter().any(|d| d.id == *id);
            if known && !peers.contains(id) {
                peers.push(id.clone());
            }
        }
        if peers.len() < 2 {
            return Err("mesh needs at least two known devices".into());
        }

        let mut created = 0;
        for i in 0..peers.len() {
            for j in (i + 1)..peers.len() {
                // `link` rejects an existing pair, which is exactly the skip we want.
                if self.link(&peers[i], &peers[j]).is_ok() {
                    created += 1;
                }
            }
        }
        Ok(created)
    }


    fn name_of(&self, id: &str) -> String {
        self.devices
            .iter()
            .find(|d| d.id == id)
            .map(|d| d.name.clone())
            .unwrap_or_else(|| id.to_string())
    }

    /// Shortest device path over existing links.
    pub fn path(&self, src: &str, dst: &str) -> Option<Vec<String>> {
        use std::collections::{HashMap as Map, VecDeque};
        let mut adj: Map<&str, Vec<&str>> = Map::new();
        for l in &self.links {
            adj.entry(&l.a).or_default().push(&l.b);
            adj.entry(&l.b).or_default().push(&l.a);
        }
        let mut seen = vec![src.to_string()];
        let mut q = VecDeque::new();
        q.push_back(vec![src.to_string()]);
        while let Some(path) = q.pop_front() {
            let last = path.last()?.clone();
            if last == dst {
                return Some(path);
            }
            if path.len() > 64 {
                continue;
            }
            for next in adj.get(last.as_str()).cloned().unwrap_or_default() {
                if seen.iter().any(|s| s == next) {
                    continue;
                }
                seen.push(next.to_string());
                let mut p = path.clone();
                p.push(next.to_string());
                q.push_back(p);
            }
        }
        None
    }

    /// Send one ICMP echo request through the frame-level engine and record it.
    pub fn send_pdu(&mut self, src: &str, dst: &str) -> Result<(), String> {
        let delivery = crate::net::fwd::deliver(self, src, dst)?;
        let size = delivery.size();
        self.next_event += 1;
        self.sim_time = delivery.finished_at as f32;
        self.events.push(Event {
            id: self.next_event,
            time: self.sim_time,
            last: self.name_of(src),
            at: self.name_of(dst),
            kind: "ICMP".into(),
            proto: "ICMP".into(),
            path: delivery.path,
            hops: delivery.hops,
            size,
        });
        let line = format!("{} -> {} ICMP", self.name_of(src), self.name_of(dst));
        self.syslog_record(src, "info", &line);
        self.syslog_record(dst, "info", &line);
        Ok(())
    }

    /// The router that answers on `ip`, if any.
    pub(crate) fn router_with_addr(&self, ip: u32) -> Option<&Device> {
        self.devices.iter().find(|d| {
            matches!(d.kind.as_str(), "router" | "asa")
                && (d.ip == Some(ip) || d.ports.iter().any(|p| p.ip == Some(ip)))
        })
    }

    /// Models the two module slots accept.
    pub const MODULE_MODELS: &'static [&'static str] = &["HWIC-2T", "NM-2FE2W"];

    fn slot_count(kind: &str) -> usize {
        match kind {
            "router" | "switch" => 2,
            _ => 0,
        }
    }

    pub fn is_powered(&self, id: &str) -> bool {
        !self.powered_off.contains(id)
    }

    /// Physical power switch; a device that is off drops all traffic.
    pub fn set_power(&mut self, id: &str, on: bool) -> bool {
        if !self.devices.iter().any(|d| d.id == id) {
            return false;
        }
        if on {
            self.powered_off.remove(id);
        } else {
            self.powered_off.insert(id.to_string());
        }
        true
    }

    pub fn modules(&self, id: &str) -> Vec<Option<String>> {
        let n = Self::slot_count(&self.kind_of(id));
        let mut out = self.slots.get(id).cloned().unwrap_or_else(|| vec![None; n]);
        out.resize(n, None);
        out
    }

    /// Register a mailbox user on a server.
    pub fn add_mail_user(&mut self, server: &str, user: &str, pass: &str) -> Result<(), String> {
        if !self.devices.iter().any(|d| d.id == server) {
            return Err("no such device".into());
        }
        let user = user.trim();
        let pass = pass.trim();
        if user.is_empty() || pass.is_empty() {
            return Err("user and password are required".into());
        }
        let list = self.mail_users.entry(server.to_string()).or_default();
        if list.iter().any(|(u, _)| u == user) {
            return Err(format!("user {user} already exists"));
        }
        list.push((user.to_string(), pass.to_string()));
        list.sort_by(|a, b| a.0.cmp(&b.0));
        Ok(())
    }

    /// Deliver a message and capture an SMTP event.
    pub fn send_mail(
        &mut self,
        client: &str,
        server: &str,
        from: &str,
        to: &str,
        subject: &str,
        body: &str,
    ) -> Result<(), String> {
        let users = self.mail_users.get(server).cloned().unwrap_or_default();
        if !users.iter().any(|(u, _)| u == from) {
            return Err(format!("unknown sender: {from}"));
        }
        if !users.iter().any(|(u, _)| u == to) {
            return Err(format!("unknown recipient: {to}"));
        }
        self.mail.entry(server.to_string()).or_default().push(Mail {
            from: from.to_string(),
            to: to.to_string(),
            subject: subject.to_string(),
            body: body.to_string(),
            read: false,
        });
        let path = self
            .path(client, server)
            .unwrap_or_else(|| vec![client.to_string(), server.to_string()]);
        self.next_event += 1;
        self.sim_time += 0.001;
        self.events.push(Event {
            id: self.next_event,
            time: self.sim_time,
            last: self.name_of(client),
            at: self.name_of(server),
            kind: "SMTP".into(),
            proto: "SMTP".into(),
            path,
            hops: Vec::new(),
            size: 900,
        });
        Ok(())
    }

    pub fn mail_list(&self, server: &str, user: &str) -> Vec<Mail> {
        self.mail
            .get(server)
            .map(|l| l.iter().filter(|m| m.to == user).cloned().collect())
            .unwrap_or_default()
    }

    /// TFTP put; an empty body removes the file.
    pub fn tftp_put(&mut self, server: &str, name: &str, content: &str) -> Result<(), String> {
        if !self.devices.iter().any(|d| d.id == server) {
            return Err("no such device".into());
        }
        let name = name.trim();
        if name.is_empty() || name.contains('/') || name.contains('\\') {
            return Err("invalid file name".into());
        }
        let list = self.tftp.entry(server.to_string()).or_default();
        if content.is_empty() {
            let before = list.len();
            list.retain(|(n, _)| n != name);
            if list.len() == before {
                return Err(format!("no such file: {name}"));
            }
        } else {
            list.retain(|(n, _)| n != name);
            list.push((name.to_string(), content.to_string()));
            list.sort_by(|a, b| a.0.cmp(&b.0));
        }
        Ok(())
    }

    pub fn tftp_list(&self, server: &str) -> Vec<String> {
        self.tftp
            .get(server)
            .map(|l| l.iter().map(|(n, _)| n.clone()).collect())
            .unwrap_or_default()
    }

    pub fn tftp_get(&self, server: &str, name: &str) -> Option<String> {
        self.tftp
            .get(server)
            .and_then(|l| l.iter().find(|(n, _)| n == name).map(|(_, c)| c.clone()))
    }

    /// FTP put; an empty body removes the file.
    pub fn ftp_put(&mut self, server: &str, name: &str, content: &str) -> Result<(), String> {
        if !self.devices.iter().any(|d| d.id == server) {
            return Err("no such device".into());
        }
        let name = name.trim();
        if name.is_empty() || name.contains('/') || name.contains('\\') {
            return Err("invalid file name".into());
        }
        let list = self.ftp.entry(server.to_string()).or_default();
        if content.is_empty() {
            let before = list.len();
            list.retain(|(n, _)| n != name);
            if list.len() == before {
                return Err(format!("no such file: {name}"));
            }
        } else {
            list.retain(|(n, _)| n != name);
            list.push((name.to_string(), content.to_string()));
            list.sort_by(|a, b| a.0.cmp(&b.0));
        }
        Ok(())
    }

    pub fn ftp_list(&self, server: &str) -> Vec<String> {
        self.ftp
            .get(server)
            .map(|l| l.iter().map(|(n, _)| n.clone()).collect())
            .unwrap_or_default()
    }

    /// Point a device at an NTP server: the server must exist and have an address.
    /// The offset is deterministic (the simulator has one clock) and reported
    /// so `show ntp` can render it.
    pub fn ntp_sync(&mut self, client: &str, server_ip: &str) -> Result<f64, String> {
        if !self.devices.iter().any(|d| d.id == client) {
            return Err("no such device".into());
        }
        if crate::model::parse_ipv4(server_ip).is_none() {
            return Err("invalid server address".into());
        }
        let addr = crate::model::parse_ipv4(server_ip);
        if !self.devices.iter().any(|d| {
            d.ip == addr || d.ports.iter().any(|p| p.ip == addr)
        }) {
            return Err(format!("no device at {server_ip}"));
        }
        let offset = 0.0;
        self.ntp
            .insert(client.to_string(), (server_ip.to_string(), offset));
        Ok(offset)
    }

    pub fn ntp_status(&self, client: &str) -> Option<(String, f64)> {
        self.ntp.get(client).cloned()
    }

    pub fn syslog_enable(&mut self, device: &str, on: bool) -> Result<(), String> {
        if !self.devices.iter().any(|d| d.id == device) {
            return Err("no such device".into());
        }
        if on {
            self.syslog_on.insert(device.to_string());
        } else {
            self.syslog_on.remove(device);
            self.syslog.remove(device);
        }
        Ok(())
    }

    pub fn syslog_record(&mut self, device: &str, severity: &str, text: &str) {
        if !self.syslog_on.contains(device) {
            return;
        }
        let entry = (self.sim_time, severity.to_string(), text.to_string());
        let list = self.syslog.entry(device.to_string()).or_default();
        list.push(entry);
        if list.len() > 200 {
            list.remove(0);
        }
    }

    pub fn syslog_list(&self, device: &str) -> Vec<(f32, String, String)> {
        self.syslog.get(device).cloned().unwrap_or_default()
    }

    pub fn aaa_add_user(&mut self, server: &str, user: &str, pass: &str) -> Result<(), String> {
        if !self.devices.iter().any(|d| d.id == server) {
            return Err("no such device".into());
        }
        let user = user.trim();
        if user.is_empty() || user.contains(' ') {
            return Err("invalid user name".into());
        }
        if pass.is_empty() {
            return Err("password required".into());
        }
        let list = self.aaa_users.entry(server.to_string()).or_default();
        if list.iter().any(|(u, _)| u == user) {
            return Err(format!("user {user} already exists"));
        }
        list.push((user.to_string(), pass.to_string()));
        list.sort_by(|a, b| a.0.cmp(&b.0));
        Ok(())
    }

    pub fn aaa_list(&self, server: &str) -> Vec<String> {
        self.aaa_users
            .get(server)
            .map(|l| l.iter().map(|(u, _)| u.clone()).collect())
            .unwrap_or_default()
    }

    fn canonical_iface(&self, device: &str, raw: &str) -> Result<String, String> {
        let d = self
            .devices
            .iter()
            .find(|d| d.id == device)
            .ok_or_else(|| "no such device".to_string())?;
        let names: Vec<String> = d.ports.iter().map(|p| p.name.clone()).collect();
        crate::cli::expand_iface(raw, &names)
            .ok_or_else(|| format!("no such interface: {raw}"))
    }

    /// Enable port security on a switch port; `max` is the MAC limit.
    pub fn set_port_security(&mut self, device: &str, iface: &str, max: u16) -> Result<(), String> {
        let name = self.canonical_iface(device, iface)?;
        let table = self.port_security.entry(device.to_string()).or_default();
        if max == 0 {
            table.remove(&name);
        } else {
            let macs = table.get(&name).map(|p| p.macs.clone()).unwrap_or_default();
            table.insert(name, PortSecurity { max, macs });
        }
        Ok(())
    }

    /// Learn or reject a source MAC on a secured port.
    pub fn port_security_allowed(&mut self, device: &str, iface: &str, mac: &str) -> bool {
        let Some(table) = self.port_security.get_mut(device) else {
            return true;
        };
        let Some(policy) = table.get_mut(iface) else {
            return true;
        };
        if policy.macs.iter().any(|m| m == mac) {
            return true;
        }
        if policy.macs.len() < policy.max as usize {
            policy.macs.push(mac.to_string());
            return true;
        }
        false
    }

    pub fn port_security_rows(&self, device: &str) -> Vec<(String, u16, usize)> {
        let mut rows: Vec<_> = self
            .port_security
            .get(device)
            .map(|t| {
                t.iter()
                    .map(|(iface, p)| (iface.clone(), p.max, p.macs.len()))
                    .collect::<Vec<_>>()
            })
            .unwrap_or_default();
        rows.sort_by(|a, b| a.0.cmp(&b.0));
        rows
    }

    pub fn set_channel_group(
        &mut self,
        device: &str,
        iface: &str,
        group: u16,
    ) -> Result<(), String> {
        let name = self.canonical_iface(device, iface)?;
        if group == 0 || group > 48 {
            return Err("channel-group must be 1-48".into());
        }
        self.channels
            .entry(device.to_string())
            .or_default()
            .insert(name, group);
        Ok(())
    }

    pub fn acl_add(
        &mut self,
        device: &str,
        number: u16,
        permit: bool,
        src: u32,
        src_wc: u32,
        dst: Option<(u32, u32)>,
    ) -> Result<(), String> {
        if !self.devices.iter().any(|d| d.id == device) {
            return Err("no such device".into());
        }
        if number == 0 {
            return Err("invalid access list number".into());
        }
        if number < 100 && dst.is_some() {
            return Err("standard access lists match the source only".into());
        }
        if number >= 100 && dst.is_none() {
            return Err("extended access lists need a destination".into());
        }
        self.acls
            .entry(device.to_string())
            .or_default()
            .entry(number)
            .or_default()
            .push(AclRule {
                permit,
                src,
                src_wc,
                dst,
            });
        Ok(())
    }

    fn list_allows(&self, device: &str, number: u16, src: u32, dst: u32) -> bool {
        let Some(rules) = self.acls.get(device).and_then(|m| m.get(&number)) else {
            return true;
        };
        for rule in rules {
            if (rule.src & !rule.src_wc) != (src & !rule.src_wc) {
                continue;
            }
            if let Some((dip, dwc)) = rule.dst {
                if (dip & !dwc) != (dst & !dwc) {
                    continue;
                }
            }
            return rule.permit;
        }
        false
    }

    pub fn set_nat_role(&mut self, device: &str, iface: &str, inside: bool) -> Result<(), String> {
        let name = self.canonical_iface(device, iface)?;
        self.nat_roles
            .entry(device.to_string())
            .or_default()
            .insert(name, inside);
        Ok(())
    }

    pub fn clear_nat_role(&mut self, device: &str, iface: &str) -> Result<(), String> {
        let name = self.canonical_iface(device, iface)?;
        if let Some(t) = self.nat_roles.get_mut(device) {
            t.remove(&name);
        }
        Ok(())
    }

    /// `ip nat inside source list N interface IFACE overload`.
    pub fn add_nat_rule(&mut self, device: &str, acl: u16, iface: &str) -> Result<(), String> {
        let name = self.canonical_iface(device, iface)?;
        if acl == 0 {
            return Err("invalid access-list".into());
        }
        let rules = self.nat_rules.entry(device.to_string()).or_default();
        if rules.iter().any(|r| r.acl == acl && r.iface == name) {
            return Err("rule already present".into());
        }
        rules.push(NatRule { acl, iface: name });
        Ok(())
    }

    pub fn clear_nat_rules(&mut self, device: &str) {
        self.nat_rules.remove(device);
        self.nat_translations.remove(device);
    }

    /// Translate an inside source leaving an outside interface. Returns the new
    /// source address and records the binding.
    pub fn nat_translate(
        &mut self,
        device: &str,
        ingress: &str,
        egress: &str,
        src: u32,
        dst: u32,
    ) -> Option<u32> {
        let roles = self.nat_roles.get(device)?;
        if roles.get(ingress) != Some(&true) || roles.get(egress) != Some(&false) {
            return None;
        }
        let matching = self
            .nat_rules
            .get(device)?
            .iter()
            .find(|r| r.iface == egress && self.list_allows(device, r.acl, src, dst))?
            .clone();
        let _ = matching.acl;
        let global = self.devices.iter().find(|d| d.id == device).and_then(|d| {
            d.ports
                .iter()
                .find(|p| p.name == egress)
                .and_then(|p| p.ip)
                .or(d.ip)
        })?;
        let list = self.nat_translations.entry(device.to_string()).or_default();
        list.retain(|(local, _)| *local != src);
        list.push((src, global));
        Some(global)
    }

    pub fn nat_binding_lines(&self, device: &str) -> Vec<String> {
        let mut rows: Vec<_> = self.nat_rules.get(device).cloned().unwrap_or_default();
        rows.sort_by_key(|r| r.acl);
        rows.into_iter()
            .map(|r| format!("inside source list {} interface {} overload", r.acl, r.iface))
            .collect()
    }

    pub fn nat_translation_lines(&self, device: &str) -> Vec<String> {
        self.nat_translations
            .get(device)
            .map(|l| {
                l.iter()
                    .map(|(local, global)| {
                        format!(
                            "{} -> {}",
                            crate::model::ipv4_string(*local),
                            crate::model::ipv4_string(*global)
                        )
                    })
                    .collect()
            })
            .unwrap_or_default()
    }

    pub fn acl_bind(
        &mut self,
        device: &str,
        iface: &str,
        number: u16,
        inbound: bool,
    ) -> Result<(), String> {
        let name = self.canonical_iface(device, iface)?;
        self.acl_bindings
            .entry(device.to_string())
            .or_default()
            .insert(name, (number, inbound));
        Ok(())
    }

    pub fn acl_unbind(&mut self, device: &str, iface: &str) -> Result<(), String> {
        let name = self.canonical_iface(device, iface)?;
        if let Some(table) = self.acl_bindings.get_mut(device) {
            table.remove(&name);
        }
        Ok(())
    }

    /// Evaluate the bound list on one interface direction. No binding, or a
    /// binding to an undefined list, permits the packet.
    pub fn acl_allows(&self, device: &str, iface: &str, inbound: bool, src: u32, dst: u32) -> bool {
        let Some(table) = self.acl_bindings.get(device) else {
            return true;
        };
        let Some((number, bound_in)) = table.get(iface) else {
            return true;
        };
        if *bound_in != inbound {
            return true;
        }
        self.list_allows(device, *number, src, dst)
    }

    /// Rendered ACEs: `number permit|deny src wc [dst wc]`.
    pub fn acl_lines(&self, device: &str) -> Vec<String> {
        let mut out = Vec::new();
        if let Some(lists) = self.acls.get(device) {
            let mut nums: Vec<_> = lists.keys().copied().collect();
            nums.sort();
            for n in nums {
                for rule in &lists[&n] {
                    let action = if rule.permit { "permit" } else { "deny" };
                    let src = crate::model::ipv4_string(rule.src);
                    let mut line = format!("{n} {action} {src} {}", crate::model::ipv4_string(rule.src_wc));
                    if let Some((d, wc)) = rule.dst {
                        line.push_str(&format!(
                            " {} {}",
                            crate::model::ipv4_string(d),
                            crate::model::ipv4_string(wc)
                        ));
                    }
                    out.push(line);
                }
            }
        }
        out
    }

    pub fn acl_binding_lines(&self, device: &str) -> Vec<String> {
        let mut out = Vec::new();
        if let Some(table) = self.acl_bindings.get(device) {
            let mut rows: Vec<_> = table.iter().collect();
            rows.sort_by_key(|(iface, _)| iface.as_str());
            for (iface, (number, inbound)) in rows {
                out.push(format!(
                    "{iface} {number} {}",
                    if *inbound { "in" } else { "out" }
                ));
            }
        }
        out
    }

    pub fn channel_groups(&self, device: &str) -> Vec<(u16, Vec<String>)> {
        let mut groups: std::collections::BTreeMap<u16, Vec<String>> = Default::default();
        if let Some(m) = self.channels.get(device) {
            for (iface, g) in m {
                groups.entry(*g).or_default().push(iface.clone());
            }
        }
        groups
            .into_iter()
            .map(|(g, mut ports)| {
                ports.sort();
                (g, ports)
            })
            .collect()
    }

    /// Create (or rename) a VLAN on a switch.
    pub fn vlan_create(&mut self, id: &str, vlan: u16, name: &str) -> Result<(), String> {
        if !self.devices.iter().any(|d| d.id == id) {
            return Err("no such device".into());
        }
        if vlan == 0 || vlan > 4094 {
            return Err("VLAN id must be 1-4094".into());
        }
        if vlan == 1 {
            return Ok(());
        }
        let name = if name.trim().is_empty() {
            format!("VLAN{vlan:04}")
        } else {
            name.trim().to_string()
        };
        let list = self.vlans.entry(id.to_string()).or_default();
        match list.iter_mut().find(|(v, _)| *v == vlan) {
            Some(entry) => entry.1 = name,
            None => list.push((vlan, name)),
        }
        list.sort_by_key(|(v, _)| *v);
        Ok(())
    }

    pub fn vlan_delete(&mut self, id: &str, vlan: u16) -> Result<(), String> {
        if vlan == 1 {
            return Err("default VLAN cannot be deleted".into());
        }
        let in_use = self
            .devices
            .iter()
            .find(|d| d.id == id)
            .map(|d| d.ports.iter().any(|p| !p.trunk && p.vlan == vlan))
            .unwrap_or(false);
        if in_use {
            return Err(format!("VLAN {vlan} is in use by an access port"));
        }
        match self.vlans.get_mut(id) {
            Some(list) => {
                let before = list.len();
                list.retain(|(v, _)| *v != vlan);
                if list.len() == before {
                    return Err(format!("VLAN {vlan} does not exist"));
                }
                Ok(())
            }
            None => Err(format!("VLAN {vlan} does not exist")),
        }
    }

    pub fn vlan_exists(&self, id: &str, vlan: u16) -> bool {
        vlan == 1
            || self
                .vlans
                .get(id)
                .map(|l| l.iter().any(|(v, _)| *v == vlan))
                .unwrap_or(false)
    }

    pub fn vlan_name(&self, id: &str, vlan: u16) -> String {
        if vlan == 1 {
            return "default".into();
        }
        self.vlans
            .get(id)
            .and_then(|l| l.iter().find(|(v, _)| *v == vlan))
            .map(|(_, n)| n.clone())
            .unwrap_or_else(|| format!("VLAN{vlan:04}"))
    }

    pub fn set_access_vlan(&mut self, id: &str, iface: &str, vlan: u16) -> Result<(), String> {
        if !self.vlan_exists(id, vlan) {
            return Err(format!("VLAN {vlan} does not exist"));
        }
        let dev = self
            .devices
            .iter_mut()
            .find(|d| d.id == id)
            .ok_or_else(|| "no such device".to_string())?;
        let port = dev
            .ports
            .iter_mut()
            .find(|p| p.name == iface)
            .ok_or_else(|| format!("invalid interface: {iface}"))?;
        if port.trunk {
            return Err(format!("{iface} is a trunk port"));
        }
        port.vlan = vlan;
        Ok(())
    }

    pub fn set_trunk(&mut self, id: &str, iface: &str, trunk: bool) -> Result<(), String> {
        let dev = self
            .devices
            .iter_mut()
            .find(|d| d.id == id)
            .ok_or_else(|| "no such device".to_string())?;
        let port = dev
            .ports
            .iter_mut()
            .find(|p| p.name == iface)
            .ok_or_else(|| format!("invalid interface: {iface}"))?;
        port.trunk = trunk;
        Ok(())
    }

    /// Ports the spanning tree blocks, as (device id, full port name).
    pub fn stp_blocked_ports(&self) -> Vec<(String, String)> {
        use std::collections::VecDeque;
        let mut switches: Vec<&Device> = self.devices.iter().filter(|d| d.kind == "switch").collect();
        switches.sort_by(|a, b| a.id.cmp(&b.id));
        if switches.len() < 2 {
            return Vec::new();
        }
        let root = switches[0].id.clone();
        let mut tree: Vec<(String, String)> = Vec::new();
        let mut seen = vec![root.clone()];
        let mut q: VecDeque<String> = VecDeque::new();
        q.push_back(root.clone());
        while let Some(cur) = q.pop_front() {
            for l in &self.links {
                if !l.carries_data() {
                    continue;
                }
                let (mine, other, other_port) = if l.a == cur {
                    (&l.a_port, &l.b, &l.b_port)
                } else if l.b == cur {
                    (&l.b_port, &l.a, &l.a_port)
                } else {
                    continue;
                };
                let Some(other_dev) = self.devices.iter().find(|d| d.id == *other) else {
                    continue;
                };
                if other_dev.kind != "switch" || seen.iter().any(|s| *s == *other) {
                    continue;
                }
                tree.push((cur.clone(), mine.clone()));
                tree.push((other.clone(), other_port.clone()));
                seen.push(other.clone());
                q.push_back(other.clone());
            }
        }

        let mut blocked = Vec::new();
        for sw in &switches {
            for l in &self.links {
                if !l.carries_data() {
                    continue;
                }
                let port = if l.a == sw.id {
                    Some(&l.a_port)
                } else if l.b == sw.id {
                    Some(&l.b_port)
                } else {
                    None
                };
                let Some(port) = port else { continue };
                let peer_is_switch = if l.a == sw.id {
                    self.devices.iter().any(|d| d.id == l.b && d.kind == "switch")
                } else {
                    self.devices.iter().any(|d| d.id == l.a && d.kind == "switch")
                };
                if !peer_is_switch {
                    continue;
                }
                let full = self.port_full_name(sw, port);
                let in_tree = tree
                    .iter()
                    .any(|(d, p)| *d == sw.id && self.port_full_name(sw, p) == full);
                if !in_tree {
                    blocked.push((sw.id.clone(), full));
                }
            }
        }
        blocked
    }

    fn port_full_name(&self, dev: &Device, raw: &str) -> String {
        let names: Vec<String> = dev.ports.iter().map(|p| p.name.clone()).collect();
        crate::cli::expand_iface(raw, &names).unwrap_or_else(|| raw.to_string())
    }

    /// Insert (`model` non-empty) or remove (`""`) a module in `slot`.
    pub fn set_module(&mut self, id: &str, slot: usize, model: &str) -> Result<(), String> {
        let name = self
            .devices
            .iter()
            .find(|d| d.id == id)
            .map(|d| d.name.clone())
            .ok_or_else(|| "no such device".to_string())?;
        let n = Self::slot_count(&self.kind_of(id));
        if slot >= n {
            return Err(if n == 0 {
                format!("{name} has no module slots")
            } else {
                format!("{name} has slots 0-{}", n - 1)
            });
        }
        if !model.is_empty() && !Self::MODULE_MODELS.contains(&model) {
            return Err(format!("unknown module: {model}"));
        }
        let ports_for = |m: &str| -> Vec<String> {
            match m {
                "HWIC-2T" => vec!["Serial0/3/0".to_string(), "Serial0/3/1".to_string()],
                "NM-2FE2W" => vec!["FastEthernet0/0".to_string(), "FastEthernet0/1".to_string()],
                _ => Vec::new(),
            }
        };
        let current = self.modules(id).get(slot).cloned().flatten().unwrap_or_default();
        if current == model {
            return Ok(());
        }
        for port in ports_for(&current) {
            if self.port_used(id, &port) {
                return Err(format!(
                    "{port} is cabled; unplug it before removing the module"
                ));
            }
        }
        if let Some(dev) = self.devices.iter_mut().find(|d| d.id == id) {
            for port in ports_for(&current) {
                dev.ports.retain(|p| p.name != port);
            }
            for port in ports_for(model) {
                if !dev.ports.iter().any(|p| p.name == port) {
                    dev.ports.push(PortCfg {
                        name: port,
                        ip: None,
                        prefix: 24,
                        up: true,
                        vlan: 1,
                        trunk: false,
                    });
                }
            }
        }
        let entry = self
            .slots
            .entry(id.to_string())
            .or_insert_with(|| vec![None; n]);
        entry.resize(n, None);
        entry[slot] = (!model.is_empty()).then(|| model.to_string());
        Ok(())
    }

    /// Add or replace a DNS A record on a server.
    pub fn set_dns_record(&mut self, id: &str, name: &str, ip: &str) -> Result<(), String> {
        if !self.devices.iter().any(|d| d.id == id) {
            return Err("no such device".into());
        }
        let name = name.trim().to_ascii_lowercase();
        if name.is_empty() || name.chars().any(|c| c.is_whitespace()) {
            return Err("invalid record name".into());
        }
        let addr = crate::model::parse_ipv4(ip.trim())
            .ok_or_else(|| format!("invalid address: {ip}"))?;
        let list = self.dns_records.entry(id.to_string()).or_default();
        match list.iter_mut().find(|(n, _)| *n == name) {
            Some(entry) => entry.1 = addr,
            None => list.push((name, addr)),
        }
        list.sort_by(|a, b| a.0.cmp(&b.0));
        Ok(())
    }

    pub fn remove_dns_record(&mut self, id: &str, name: &str) -> bool {
        let name = name.trim().to_ascii_lowercase();
        match self.dns_records.get_mut(id) {
            Some(list) => {
                let before = list.len();
                list.retain(|(n, _)| *n != name);
                list.len() != before
            }
            None => false,
        }
    }

    /// Resolve `name` through a DNS server on the client's L2 segment.
    pub fn resolve_name(&self, client: &str, name: &str) -> Option<u32> {
        use std::collections::VecDeque;
        let name = name.trim().to_ascii_lowercase();
        if name.is_empty() {
            return None;
        }
        let mut seen = vec![client.to_string()];
        let mut q: VecDeque<String> = VecDeque::new();
        q.push_back(client.to_string());
        while let Some(cur) = q.pop_front() {
            for l in &self.links {
                if !l.carries_data() {
                    continue;
                }
                let next = if l.a == cur {
                    &l.b
                } else if l.b == cur {
                    &l.a
                } else {
                    continue;
                };
                if seen.iter().any(|s| s == next) {
                    continue;
                }
                let Some(dev) = self.devices.iter().find(|d| d.id == *next) else {
                    continue;
                };
                if dev.kind == "router" {
                    continue;
                }
                if let Some(list) = self.dns_records.get(&dev.id) {
                    if let Some((_, ip)) = list.iter().find(|(n, _)| *n == name) {
                        return Some(*ip);
                    }
                }
                seen.push(dev.id.clone());
                q.push_back(dev.id.clone());
            }
        }
        None
    }

    /// Pin a client to a fixed address on a server's pool.
    pub fn set_dhcp_reservation(
        &mut self,
        server: &str,
        client: &str,
        ip: &str,
    ) -> Result<(), String> {
        if !self.dhcp_pools.contains_key(server) {
            return Err("no DHCP pool on that server".into());
        }
        if !self.devices.iter().any(|d| d.id == client) {
            return Err("no such client".into());
        }
        let addr = crate::model::parse_ipv4(ip.trim())
            .ok_or_else(|| format!("invalid address: {ip}"))?;
        let list = self
            .dhcp_reservations
            .entry(server.to_string())
            .or_default();
        match list.iter_mut().find(|(c, _)| c == client) {
            Some(entry) => entry.1 = addr,
            None => list.push((client.to_string(), addr)),
        }
        list.sort_by(|a, b| a.0.cmp(&b.0));
        Ok(())
    }

    pub fn remove_dhcp_reservation(&mut self, server: &str, client: &str) -> bool {
        match self.dhcp_reservations.get_mut(server) {
            Some(list) => {
                let before = list.len();
                list.retain(|(c, _)| c != client);
                list.len() != before
            }
            None => false,
        }
    }

    /// `ip helper-address` on a router interface.
    pub fn set_dhcp_helper(
        &mut self,
        router: &str,
        iface: &str,
        helper: &str,
    ) -> Result<(), String> {
        let dev = self
            .devices
            .iter()
            .find(|d| d.id == router)
            .ok_or_else(|| "no such device".to_string())?;
        let names: Vec<String> = dev.ports.iter().map(|p| p.name.clone()).collect();
        let name = crate::cli::expand_iface(iface, &names)
            .ok_or_else(|| format!("invalid interface: {iface}"))?;
        let addr = crate::model::parse_ipv4(helper.trim())
            .ok_or_else(|| format!("invalid helper address: {helper}"))?;
        let list = self.dhcp_helpers.entry(router.to_string()).or_default();
        list.retain(|(i, _)| i != &name);
        list.push((name, addr));
        list.sort_by(|a, b| a.0.cmp(&b.0));
        Ok(())
    }

    pub fn remove_dhcp_helper(&mut self, router: &str, iface: &str) -> bool {
        let Some(dev) = self.devices.iter().find(|d| d.id == router) else {
            return false;
        };
        let names: Vec<String> = dev.ports.iter().map(|p| p.name.clone()).collect();
        let Some(name) = crate::cli::expand_iface(iface, &names) else {
            return false;
        };
        match self.dhcp_helpers.get_mut(router) {
            Some(list) => {
                let before = list.len();
                list.retain(|(i, _)| i != &name);
                list.len() != before
            }
            None => false,
        }
    }

    pub fn set_http_page(&mut self, id: &str, body: &str) -> bool {
        if !self.devices.iter().any(|d| d.id == id) {
            return false;
        }
        if body.trim().is_empty() {
            self.http_pages.remove(id);
        } else {
            self.http_pages.insert(id.to_string(), body.to_string());
        }
        true
    }

    /// `write memory` / `copy run start`: snapshot the device configuration.
    pub fn write_memory(&mut self) {
        self.startup = Some(self.devices.clone());
    }

    /// `show startup-config` for one device.
    pub fn startup_config(&self, id: &str) -> Option<String> {
        let d = self.startup.as_ref()?.iter().find(|d| d.id == id)?;
        Some(crate::cli::config_for(
            d,
            self.banners.get(id).map(String::as_str),
            self.line_passwords.get(id).map(String::as_str),
        ))
    }

    /// `reload`: restore the saved configuration and reboot the simulation.
    pub fn reload(&mut self) -> bool {
        let Some(saved) = self.startup.clone() else {
            return false;
        };
        for s in saved {
            if let Some(d) = self.devices.iter_mut().find(|d| d.id == s.id) {
                *d = s;
            }
        }
        self.events.clear();
        self.next_event = 0;
        self.sim_time = 0.0;
        self.tables = Tables::default();
        true
    }

    pub fn reset_sim(&mut self) {
        self.events.clear();
        self.next_event = 0;
        self.sim_time = 0.0;
        self.tables = Tables::default();
    }

    pub fn duplicate(&mut self, id: &str) -> Option<String> {
        let d = self.devices.iter().find(|d| d.id == id)?.clone();
        self.add(&d.model, d.x + 34.0, d.y + 34.0)
    }

    pub fn rename(&mut self, id: &str, name: &str) -> bool {
        match self.devices.iter_mut().find(|d| d.id == id) {
            Some(d) => {
                d.name = name.to_string();
                true
            }
            None => false,
        }
    }

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
                icon: logical_icon(&d.kind).to_string(),
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


    /// Configure an interface address. `ip` is dotted-quad text.
    pub fn set_ip(&mut self, id: &str, ip: &str, prefix: u8) -> Result<(), String> {
        let parsed = crate::model::parse_ipv4(ip.trim())
            .ok_or_else(|| format!("invalid IPv4 address: {ip}"))?;
        if prefix > 32 {
            return Err("prefix must be between 0 and 32".into());
        }
        let res = match self.devices.iter_mut().find(|d| d.id == id) {
            Some(d) => {
                d.ip = Some(parsed);
                d.prefix = prefix;
                Ok(())
            }
            None => Err("no such device".into()),
        };
        if res.is_ok() {
            self.dhcp_clients.remove(id);
        }
        res
    }

    /// True while the topology is still the shipped demo (no user edits).
    fn is_pristine_demo(&self) -> bool {
        const DEMO: [&str; 7] = [
            "router0", "switch0", "switch1", "pc0", "pc1", "server0", "pc2",
        ];
        self.devices.len() == 7
            && self.links.len() == 6
            && self.events.is_empty()
            && DEMO.iter().all(|id| self.devices.iter().any(|d| d.id == *id))
    }

    /// Full static configuration, matching the fields of Packet Tracer's
    /// Desktop → IP Configuration utility.
    pub fn set_config(
        &mut self,
        id: &str,
        ip: &str,
        mask: &str,
        gateway: &str,
        dns: &str,
    ) -> Result<(), String> {
        let addr = crate::model::parse_ipv4(ip.trim())
            .ok_or_else(|| format!("invalid IP address: {ip}"))?;
        let prefix = crate::model::parse_mask(mask.trim())
            .ok_or_else(|| format!("invalid subnet mask: {mask}"))?;
        let gw = if gateway.trim().is_empty() {
            None
        } else {
            Some(
                crate::model::parse_ipv4(gateway.trim())
                    .ok_or_else(|| format!("invalid default gateway: {gateway}"))?,
            )
        };
        let dns_ip = if dns.trim().is_empty() {
            None
        } else {
            Some(
                crate::model::parse_ipv4(dns.trim())
                    .ok_or_else(|| format!("invalid DNS server: {dns}"))?,
            )
        };
        let res = match self.devices.iter_mut().find(|d| d.id == id) {
            Some(d) => {
                d.ip = Some(addr);
                d.prefix = prefix;
                d.gateway = gw;
                d.dns = dns_ip;
                Ok(())
            }
            None => Err("no such device".into()),
        };
        if res.is_ok() {
            self.dhcp_clients.remove(id);
        }
        res
    }

    /// Configure a DHCP pool on a device (normally a server).
    pub fn set_dhcp_pool(
        &mut self,
        id: &str,
        network: &str,
        prefix: u8,
        gateway: &str,
        dns: &str,
    ) -> Result<(), String> {
        if !self.devices.iter().any(|d| d.id == id) {
            return Err("no such device".into());
        }
        if !(1..=30).contains(&prefix) {
            return Err("pool prefix must be between 1 and 30".into());
        }
        let mask = crate::model::mask_of(prefix);
        let net = crate::model::parse_ipv4(network.trim())
            .ok_or_else(|| format!("invalid network: {network}"))?;
        let gw = match gateway.trim() {
            "" => None,
            g => Some(
                crate::model::parse_ipv4(g)
                    .ok_or_else(|| format!("invalid default gateway: {gateway}"))?,
            ),
        };
        let dns_ip = match dns.trim() {
            "" => None,
            d => Some(
                crate::model::parse_ipv4(d)
                    .ok_or_else(|| format!("invalid DNS server: {dns}"))?,
            ),
        };
        self.dhcp_pools.insert(
            id.to_string(),
            Pool {
                network: net & mask,
                prefix,
                gateway: gw,
                dns: dns_ip,
            },
        );
        self.dhcp_leases.entry(id.to_string()).or_default();
        Ok(())
    }

    /// The server that answers this client's broadcast: same L2 segment, never
    /// across a router.
    fn dhcp_server_for(&self, id: &str) -> Option<String> {
        use std::collections::VecDeque;
        let mut seen = vec![id.to_string()];
        let mut q: VecDeque<String> = VecDeque::new();
        q.push_back(id.to_string());
        while let Some(cur) = q.pop_front() {
            for l in &self.links {
                if !l.carries_data() {
                    continue;
                }
                let next = if l.a == cur {
                    &l.b
                } else if l.b == cur {
                    &l.a
                } else {
                    continue;
                };
                if seen.iter().any(|s| s == next) {
                    continue;
                }
                let Some(dev) = self.devices.iter().find(|d| d.id == *next) else {
                    continue;
                };
                if dev.kind == "router" {
                    continue;
                }
                if self.dhcp_pools.contains_key(&dev.id) {
                    return Some(dev.id.clone());
                }
                seen.push(dev.id.clone());
                q.push_back(dev.id.clone());
            }
        }
        None
    }

    /// A router with `ip helper-address` on the client's subnet forwards the
    /// request to that server.
    fn relayed_server_for(&self, client: &str) -> Option<String> {
        let dev = self.devices.iter().find(|d| d.id == client)?;
        let ip = dev.ip?;
        let prefix = dev.prefix;
        for (router, list) in &self.dhcp_helpers {
            let Some(rdev) = self.devices.iter().find(|d| d.id == *router) else {
                continue;
            };
            for (iface, helper) in list {
                let Some(port) = rdev.ports.iter().find(|p| &p.name == iface) else {
                    continue;
                };
                let Some(pip) = port.ip else { continue };
                if !crate::model::contains(ip, pip, prefix) {
                    continue;
                }
                let server = self.devices.iter().find(|d| {
                    d.ip == Some(*helper) || d.ports.iter().any(|p| p.ip == Some(*helper))
                });
                if let Some(server) = server {
                    if self.dhcp_pools.contains_key(&server.id) {
                        return Some(server.id.clone());
                    }
                }
            }
        }
        None
    }

    /// DHCP DISCOVER/OFFER/REQUEST/ACK, condensed into the lease it produces.
    pub fn acquire_dhcp(&mut self, id: &str) -> Result<Lease, String> {
        if !self.devices.iter().any(|d| d.id == id) {
            return Err("no such device".into());
        }
        let server = match self.dhcp_server_for(id) {
            Some(s) => s,
            None => self
                .relayed_server_for(id)
                .ok_or_else(|| "no DHCP server on this segment".to_string())?,
        };
        let pool = self.dhcp_pools[&server];
        let mask = crate::model::mask_of(pool.prefix);
        let base = pool.network & mask;
        let last = base | !mask;

        let mut used: Vec<u32> = Vec::new();
        for d in &self.devices {
            used.extend(d.ip);
            used.extend(d.ports.iter().filter_map(|p| p.ip));
        }
        used.extend(self.dhcp_leases.values().flatten().copied());

        let reserved = self
            .dhcp_reservations
            .get(&server)
            .and_then(|list| list.iter().find(|(c, _)| c == id))
            .map(|(_, ip)| *ip);
        let ip = match reserved {
            Some(addr) => {
                let own = self.devices.iter().find(|d| d.id == id).and_then(|d| d.ip);
                if used.contains(&addr) && own != Some(addr) {
                    return Err(format!(
                        "reservation {} is already in use",
                        crate::model::ipv4_string(addr)
                    ));
                }
                addr
            }
            None => {
                let mut chosen = None;
                for offset in 100.. {
                    let Some(cand) = base.checked_add(offset) else {
                        break;
                    };
                    if cand >= last {
                        break;
                    }
                    if pool.gateway == Some(cand) || used.contains(&cand) {
                        continue;
                    }
                    chosen = Some(cand);
                    break;
                }
                chosen.ok_or_else(|| "DHCP pool exhausted".to_string())?
            }
        };

        if let Some(d) = self.devices.iter_mut().find(|d| d.id == id) {
            d.ip = Some(ip);
            d.prefix = pool.prefix;
            d.gateway = pool.gateway;
            d.dns = pool.dns;
        }
        self.dhcp_clients.insert(id.to_string());
        self.dhcp_leases.entry(server.clone()).or_default().push(ip);

        // Capture the exchange so the simulation panel shows it.
        let path = self
            .path(id, &server)
            .unwrap_or_else(|| vec![id.to_string(), server.clone()]);
        self.next_event += 1;
        self.sim_time += 0.001;
        self.events.push(Event {
            id: self.next_event,
            time: self.sim_time,
            last: self.name_of(id),
            at: self.name_of(&server),
            kind: "DHCP".into(),
            proto: "DHCP".into(),
            path,
            hops: Vec::new(),
            size: 342,
        });

        Ok(Lease {
            ip,
            prefix: pool.prefix,
            gateway: pool.gateway,
            dns: pool.dns,
            server,
        })
    }

    /// SLAAC: adopt the prefix of a router reachable across switch/hub links.
    pub fn slaac(&mut self, id: &str) -> Result<String, String> {
        if !self.devices.iter().any(|d| d.id == id) {
            return Err("no such device".into());
        }
        let mut frontier = vec![id.to_string()];
        let mut seen: std::collections::HashSet<String> =
            std::iter::once(id.to_string()).collect();
        let mut router_v6: Option<String> = None;
        'search: while let Some(cur) = frontier.pop() {
            for link in &self.links {
                let peer = if link.a == cur {
                    link.b.clone()
                } else if link.b == cur {
                    link.a.clone()
                } else {
                    continue;
                };
                if !seen.insert(peer.clone()) {
                    continue;
                }
                let Some(dev) = self.devices.iter().find(|d| d.id == peer) else {
                    continue;
                };
                match dev.kind.as_str() {
                    "switch" | "hub" => frontier.push(peer),
                    "router" | "asa" => {
                        if let Some(v6) = &dev.ipv6 {
                            if !v6.is_empty() {
                                router_v6 = Some(v6.clone());
                                break 'search;
                            }
                        }
                    }
                    _ => {}
                }
            }
        }
        let Some(router) = router_v6 else {
            return Err("no IPv6 router advertising on this segment".into());
        };
        let base = match router.rfind(':') {
            Some(i) => router[..=i].to_string(),
            None => return Err("router address has no prefix".into()),
        };
        let host: u32 = 0x100
            + (id.bytes().fold(0u32, |a, b| a.wrapping_mul(31).wrapping_add(b as u32))
                % 0xfe00);
        let addr = format!("{base}{host:x}");
        let d = self.devices.iter_mut().find(|d| d.id == id).unwrap();
        d.ipv6 = Some(addr.clone());
        d.ipv6_gateway = Some(router);
        d.ipv6_auto = true;
        d.ipv6_prefix = 64;
        Ok(addr)
    }

    /// IPv6 section of the workstation dialog (stored, not simulated).
    pub fn set_ipv6(
        &mut self,
        id: &str,
        auto_config: bool,
        address: &str,
        prefix: u8,
        gateway: &str,
        dns: &str,
    ) -> Result<(), String> {
        if prefix > 128 {
            return Err("IPv6 prefix must be 0-128".into());
        }
        let addr = address.trim();
        if !addr.is_empty() && !addr.contains(':') {
            return Err(format!("invalid IPv6 address: {addr}"));
        }
        match self.devices.iter_mut().find(|d| d.id == id) {
            Some(d) => {
                d.ipv6_auto = auto_config;
                d.ipv6 = (!addr.is_empty()).then(|| addr.to_string());
                d.ipv6_prefix = prefix;
                d.ipv6_gateway = (!gateway.trim().is_empty()).then(|| gateway.trim().to_string());
                d.ipv6_dns = (!dns.trim().is_empty()).then(|| dns.trim().to_string());
            }
            None => return Err("no such device".into()),
        }
        if auto_config && addr.is_empty() {
            self.slaac(id)?;
        }
        Ok(())
    }

    /// 802.1X block: stored only (no EAP exchange is simulated).
    pub fn set_dot1x(&mut self, id: &str, enabled: bool, user: &str, password: &str) -> Result<(), String> {
        match self.devices.iter_mut().find(|d| d.id == id) {
            Some(d) => {
                d.dot1x = enabled;
                d.dot1x_user = (!user.trim().is_empty()).then(|| user.trim().to_string());
                d.dot1x_pass = (!password.trim().is_empty()).then(|| password.trim().to_string());
                Ok(())
            }
            None => Err("no such device".into()),
        }
    }

    /// CLI: set an interface address.
    pub fn set_port_ip(&mut self, id: &str, iface: &str, addr: &str, prefix: u8) -> Result<(), String> {
        let ip = crate::model::parse_ipv4(addr.trim())
            .ok_or_else(|| format!("invalid address: {addr}"))?;
        let dev = self
            .devices
            .iter_mut()
            .find(|d| d.id == id)
            .ok_or_else(|| "no such device".to_string())?;
        let port = dev
            .ports
            .iter_mut()
            .find(|p| p.name == iface)
            .ok_or_else(|| format!("no such interface: {iface}"))?;
        port.ip = Some(ip);
        port.prefix = prefix;
        Ok(())
    }

    /// CLI: administratively enable/disable an interface.
    pub fn set_port_up(&mut self, id: &str, iface: &str, up: bool) -> bool {
        let Some(dev) = self.devices.iter_mut().find(|d| d.id == id) else {
            return false;
        };
        match dev.ports.iter_mut().find(|p| p.name == iface) {
            Some(p) => {
                p.up = up;
                true
            }
            None => false,
        }
    }

    /// CLI: `ip route <network> <mask> <next-hop>`.
    pub fn add_route(&mut self, id: &str, dest: &str, mask: &str, next_hop: &str) -> Result<(), String> {
        let net = crate::model::parse_ipv4(dest.trim())
            .ok_or_else(|| format!("invalid destination network: {dest}"))?;
        let prefix = crate::model::parse_mask(mask.trim())
            .ok_or_else(|| format!("invalid subnet mask: {mask}"))?;
        let via = crate::model::parse_ipv4(next_hop.trim())
            .ok_or_else(|| format!("invalid next hop: {next_hop}"))?;
        let dev = self
            .devices
            .iter_mut()
            .find(|d| d.id == id)
            .ok_or_else(|| "no such device".to_string())?;
        // IOS stores the network address, not the raw address the user typed.
        dev.routes.push((net & crate::model::mask_of(prefix), prefix, via));
        Ok(())
    }

    fn wlan_security(psk: &str) -> &'static str {
        if psk.is_empty() {
            "Open"
        } else {
            "WPA2-PSK"
        }
    }

    /// DHCPv6: the server hands out an address inside its own prefix.
    pub fn dhcpv6(&mut self, client: &str, server: &str) -> Result<String, String> {
        let s = self
            .devices
            .iter()
            .find(|d| d.id == server)
            .ok_or_else(|| "no such server".to_string())?;
        let Some(base6) = s.ipv6.clone() else {
            return Err(format!("{} has no IPv6 address", s.name));
        };
        if !self.devices.iter().any(|d| d.id == client) {
            return Err("no such client".into());
        }
        let base = match base6.rfind(':') {
            Some(i) => base6[..=i].to_string(),
            None => return Err("server IPv6 address has no prefix".into()),
        };
        let host: u32 = 0x200
            + (client.bytes().fold(0u32, |a, b| a.wrapping_mul(31).wrapping_add(b as u32))
                % 0xfd00);
        let addr = format!("{base}{host:x}");
        let d = self.devices.iter_mut().find(|d| d.id == client).unwrap();
        d.ipv6 = Some(addr.clone());
        d.ipv6_gateway = Some(base6.clone());
        d.ipv6_prefix = 64;
        d.ipv6_auto = false;
        Ok(addr)
    }

    pub fn set_inspection(&mut self, device: &str, on: bool) -> Result<(), String> {
        if !self.devices.iter().any(|d| d.id == device) {
            return Err("no such device".into());
        }
        if on {
            self.inspect.insert(device.to_string(), true);
        } else {
            self.inspect.remove(device);
        }
        Ok(())
    }

    pub fn inspection_on(&self, device: &str) -> bool {
        self.inspect.get(device).copied().unwrap_or(false)
    }

    pub fn set_ips(&mut self, device: &str, proto: &str, on: bool) -> Result<(), String> {
        if !self.devices.iter().any(|d| d.id == device) {
            return Err("no such device".into());
        }
        let list = self.ips.entry(device.to_string()).or_default();
        let proto = proto.to_ascii_lowercase();
        list.retain(|p| p != &proto);
        if on {
            list.push(proto);
        }
        Ok(())
    }

    pub fn ips_drops(&self, device: &str, proto: &str) -> bool {
        self.ips
            .get(device)
            .map(|l| l.iter().any(|p| p == proto))
            .unwrap_or(false)
    }

    /// Which side of an ASA an interface is on, if NAT roles are configured.
    pub fn nat_role(&self, device: &str, iface: &str) -> Option<bool> {
        self.nat_roles
            .get(device)
            .and_then(|t| t.get(iface))
            .copied()
    }

    fn iot_kind(kind: &str) -> bool {
        matches!(kind, "plc" | "thing" | "ioe" | "server" | "pc" | "laptop")
    }

    pub fn iot_write(&mut self, id: &str, addr: u16, value: u16) -> Result<u16, String> {
        let dev = self
            .devices
            .iter()
            .find(|d| d.id == id)
            .ok_or_else(|| "no such device".to_string())?;
        if !Self::iot_kind(&dev.kind) {
            return Err(format!("{} has no Modbus registers", dev.name));
        }
        let regs = self.iot_regs.entry(id.to_string()).or_insert_with(|| vec![0; 256]);
        let slot = regs.get_mut(addr as usize).ok_or("register out of range (0-255)")?;
        let old = *slot;
        *slot = value;
        Ok(old)
    }

    pub fn iot_read(&mut self, id: &str, addr: u16) -> Result<u16, String> {
        let dev = self
            .devices
            .iter()
            .find(|d| d.id == id)
            .ok_or_else(|| "no such device".to_string())?;
        if !Self::iot_kind(&dev.kind) {
            return Err(format!("{} has no Modbus registers", dev.name));
        }
        let regs = self.iot_regs.entry(id.to_string()).or_insert_with(|| vec![0; 256]);
        regs.get(addr as usize)
            .copied()
            .ok_or_else(|| "register out of range (0-255)".to_string())
    }

    pub fn ptp_sync(&mut self, master: &str, slave: &str) -> Result<f64, String> {
        if !self.devices.iter().any(|d| d.id == master)
            || !self.devices.iter().any(|d| d.id == slave)
        {
            return Err("no such device".into());
        }
        if master == slave {
            return Err("master and slave are the same device".into());
        }
        let offset = 0.0;
        self.ptp.insert(slave.to_string(), (master.to_string(), offset));
        Ok(offset)
    }

    pub fn ptp_status(&self, slave: &str) -> Option<(String, f64)> {
        self.ptp.get(slave).cloned()
    }

    pub fn prp_enable(&mut self, id: &str, on: bool) -> Result<(), String> {
        if !self.devices.iter().any(|d| d.id == id) {
            return Err("no such device".into());
        }
        if on {
            self.prp_on.insert(id.to_string());
        } else {
            self.prp_on.remove(id);
            self.prp_seen.remove(id);
        }
        Ok(())
    }

    pub fn cell_join(&mut self, client: &str, tower: &str) -> Result<(), String> {
        let cdev = self
            .devices
            .iter()
            .find(|d| d.id == client)
            .ok_or_else(|| "no such device".to_string())?;
        if matches!(cdev.kind.as_str(), "celltower" | "router" | "switch") {
            return Err("only client devices associate with a cell tower".into());
        }
        if !self
            .devices
            .iter()
            .any(|d| d.id == tower && d.kind == "celltower")
        {
            return Err("no such cell tower".into());
        }
        self.cell_links.insert(client.to_string(), tower.to_string());
        Ok(())
    }

    pub fn cell_status(&self, client: &str) -> Option<String> {
        self.cell_links.get(client).cloned()
    }

    /// Send one industrial protocol PDU. The frame path is the normal routed
    /// path, except for cellular traffic, which goes client -> tower -> client.
    /// Modbus also performs the register read on the destination.
    pub fn send_iot(&mut self, src: &str, dst: &str, proto: &str, seq: u32) -> Result<String, String> {
        let proto = proto.to_ascii_lowercase();
        let (label, size) = match proto.as_str() {
            "modbus" => ("MODBUS", 12usize),
            "profinet" => ("PROFINET", 64),
            "prp" => ("PRP", 98),
            "ptp" => ("PTP", 44),
            "cellular" => ("Cellular", 60),
            _ => return Err("unknown protocol".into()),
        };
        let sdev = self
            .devices
            .iter()
            .find(|d| d.id == src)
            .ok_or_else(|| "no such source".to_string())?;
        let ddev = self
            .devices
            .iter()
            .find(|d| d.id == dst)
            .ok_or_else(|| "no such destination".to_string())?;
        match proto.as_str() {
            "modbus" | "profinet" => {
                if !Self::iot_kind(&sdev.kind) || !Self::iot_kind(&ddev.kind) {
                    return Err(format!("{label} needs industrial endpoints"));
                }
            }
            "prp" => {
                if !self.prp_on.contains(src) || !self.prp_on.contains(dst) {
                    return Err("both ends must have PRP enabled".into());
                }
                let seen = self.prp_seen.entry(dst.to_string()).or_default();
                if seen.contains(&seq) {
                    return Ok(format!("{label} duplicate seq {seq} suppressed at {}", ddev.name));
                }
                seen.push(seq);
                if seen.len() > 64 {
                    seen.remove(0);
                }
            }
            "ptp" => {
                self.ptp_sync(src, dst)?;
            }
            "cellular" => {
                let a = self.cell_links.get(src);
                let b = self.cell_links.get(dst);
                if a.is_none() || a != b {
                    return Err("both devices must be associated with the same cell tower".into());
                }
            }
            _ => {}
        }

        let (path, hops) = if proto == "cellular" {
            let tower = self.cell_links[src].clone();
            (vec![src.to_string(), tower, dst.to_string()], Vec::new())
        } else {
            let delivery = crate::net::fwd::deliver(self, src, dst)?;
            (delivery.path, delivery.hops)
        };
        self.next_event += 1;
        self.events.push(Event {
            id: self.next_event,
            time: self.sim_time,
            last: self.name_of(src),
            at: self.name_of(dst),
            kind: label.into(),
            proto: label.into(),
            path,
            hops,
            size,
        });
        let line = format!("{} -> {} {label}", self.name_of(src), self.name_of(dst));
        self.syslog_record(src, "info", &line);
        self.syslog_record(dst, "info", &line);
        Ok(format!("{label} delivered"))
    }

    pub fn wlan_add(&mut self, wlc: &str, ssid: &str, psk: &str) -> Result<(), String> {
        self.wlan_add_with(wlc, ssid, psk, Self::wlan_security(psk).to_string())
    }

    pub fn wlan_add_with(
        &mut self,
        wlc: &str,
        ssid: &str,
        psk: &str,
        security: String,
    ) -> Result<(), String> {
        if !self.devices.iter().any(|d| d.id == wlc) {
            return Err("no such device".into());
        }
        let ssid = ssid.trim();
        if ssid.is_empty() || ssid.contains(' ') {
            return Err("invalid SSID".into());
        }
        if security == "WPA2-PSK" && psk.len() < 8 {
            return Err("WPA2-PSK needs at least 8 characters".into());
        }
        let list = self.wlans.entry(wlc.to_string()).or_default();
        if list.iter().any(|w| w.ssid == ssid) {
            return Err(format!("WLAN {ssid} already exists"));
        }
        list.push(Wlan {
            ssid: ssid.to_string(),
            secret: psk.to_string(),
            security,
        });
        Ok(())
    }

    pub fn wlan_list(&self, wlc: &str) -> Vec<(String, String)> {
        self.wlans
            .get(wlc)
            .map(|l| {
                l.iter()
                    .map(|w| (w.ssid.clone(), w.security.clone()))
                    .collect()
            })
            .unwrap_or_default()
    }

    /// Every SSID advertised by a controller in this workspace.
    pub fn wifi_scan(&self) -> Vec<(String, String, String)> {
        let mut out: Vec<(String, String, String)> = self
            .wlans
            .iter()
            .flat_map(|(wlc, list)| {
                list.iter()
                    .map(move |w| (w.ssid.clone(), w.security.clone(), wlc.clone()))
            })
            .collect();
        out.sort_by(|a, b| a.0.cmp(&b.0));
        out
    }

    /// Associate with a WLAN. Enterprise WLANs authenticate the user against
    /// the AAA table of any server in the workspace.
    pub fn wifi_join_auth(
        &mut self,
        client: &str,
        ssid: &str,
        secret: &str,
        user: &str,
    ) -> Result<String, String> {
        if !self.devices.iter().any(|d| d.id == client) {
            return Err("no such device".into());
        }
        let found = self
            .wlans
            .iter()
            .find_map(|(wlc, list)| {
                list.iter()
                    .find(|w| w.ssid == ssid)
                    .map(|w| (wlc.clone(), w.clone()))
            })
            .ok_or_else(|| format!("SSID {ssid} not found"))?;
        let (wlc, wlan) = found;
        match wlan.security.as_str() {
            "WPA2-Enterprise" => {
                let ok = self.aaa_users.values().any(|users| {
                    users.iter().any(|(u, p)| u == user && p == secret)
                });
                if user.is_empty() || !ok {
                    return Err("authentication failed".into());
                }
            }
            "Open" => {}
            _ => {
                if wlan.secret != secret {
                    return Err("authentication failed".into());
                }
            }
        }
        self.wifi
            .insert(client.to_string(), (ssid.to_string(), wlc.clone()));
        Ok(wlc)
    }

    pub fn wifi_join(&mut self, client: &str, ssid: &str, psk: &str) -> Result<String, String> {
        self.wifi_join_auth(client, ssid, psk, "")
    }

    /// Roam to another controller that advertises the same SSID.
    pub fn wifi_roam(&mut self, client: &str, wlc: &str) -> Result<(), String> {
        let Some((ssid, _)) = self.wifi.get(client).cloned() else {
            return Err("not associated".into());
        };
        let target = self
            .wlans
            .get(wlc)
            .ok_or_else(|| "no such controller".to_string())?
            .iter()
            .find(|w| w.ssid == ssid)
            .ok_or_else(|| format!("{wlc} does not advertise {ssid}"))?;
        let _ = target;
        self.wifi.insert(client.to_string(), (ssid, wlc.to_string()));
        Ok(())
    }

    /// CAPWAP join: an access point registers with a controller.
    pub fn capwap_join(&mut self, ap: &str, wlc: &str) -> Result<(), String> {
        let ap_dev = self
            .devices
            .iter()
            .find(|d| d.id == ap)
            .ok_or_else(|| "no such device".to_string())?;
        if ap_dev.kind != "ap" {
            return Err("only access points join a controller".into());
        }
        if !self.devices.iter().any(|d| d.id == wlc && d.kind == "wlc") {
            return Err("no such controller".into());
        }
        self.capwap.insert(ap.to_string(), wlc.to_string());
        Ok(())
    }

    pub fn capwap_status(&self, ap: &str) -> Option<String> {
        self.capwap.get(ap).cloned()
    }

    pub fn wifi_leave(&mut self, client: &str) -> bool {
        self.wifi.remove(client).is_some()
    }

    pub fn wifi_status(&self, client: &str) -> Option<(String, String)> {
        self.wifi.get(client).cloned()
    }

    pub fn vpn_config(
        &mut self,
        client: &str,
        server: &str,
        user: &str,
    ) -> Result<(), String> {
        if !self.devices.iter().any(|d| d.id == client) {
            return Err("no such device".into());
        }
        if crate::model::parse_ipv4(server).is_none() {
            return Err("invalid VPN server address".into());
        }
        if !self.devices.iter().any(|d| d.ip == crate::model::parse_ipv4(server)) {
            return Err(format!("no device at {server}"));
        }
        if user.trim().is_empty() {
            return Err("user name required".into());
        }
        self.vpn
            .insert(client.to_string(), (server.to_string(), user.to_string()));
        Ok(())
    }

    pub fn vpn_status(&self, client: &str) -> Option<(String, String)> {
        self.vpn.get(client).cloned()
    }

    pub fn pppoe_config(
        &mut self,
        client: &str,
        server: &str,
        user: &str,
    ) -> Result<(), String> {
        if !self.devices.iter().any(|d| d.id == client) {
            return Err("no such device".into());
        }
        if !self.devices.iter().any(|d| d.ip == crate::model::parse_ipv4(server)) {
            return Err(format!("no device at {server}"));
        }
        if user.trim().is_empty() {
            return Err("user name required".into());
        }
        self.pppoe
            .insert(client.to_string(), (server.to_string(), user.to_string()));
        Ok(())
    }

    pub fn pppoe_status(&self, client: &str) -> Option<(String, String)> {
        self.pppoe.get(client).cloned()
    }

    pub fn phone_register(&mut self, phone: &str, cm: &str, ext: u16) -> Result<(), String> {
        if !self.devices.iter().any(|d| d.id == phone) {
            return Err("no such device".into());
        }
        if !self.devices.iter().any(|d| d.ip == crate::model::parse_ipv4(cm)) {
            return Err(format!("no call manager at {cm}"));
        }
        if ext == 0 {
            return Err("invalid extension".into());
        }
        self.phones.insert(phone.to_string(), (cm.to_string(), ext));
        Ok(())
    }

    pub fn phone_status(&self, phone: &str) -> Option<(String, u16)> {
        self.phones.get(phone).cloned()
    }

    pub fn set_stp_mode(&mut self, device: &str, mode: &str) -> Result<(), String> {
        if !self.devices.iter().any(|d| d.id == device) {
            return Err("no such device".into());
        }
        if !matches!(mode, "pvst" | "rapid-pvst") {
            return Err(format!("invalid mode: {mode}"));
        }
        self.stp_modes.insert(device.to_string(), mode.to_string());
        Ok(())
    }

    pub fn stp_mode(&self, device: &str) -> &str {
        self.stp_modes.get(device).map(String::as_str).unwrap_or("pvst")
    }

    pub fn add_v6_network(&mut self, device: &str, prefix: &str) -> Result<(), String> {
        let Some((addr, len)) = prefix.split_once('/') else {
            return Err("expected PREFIX/LEN".into());
        };
        if !addr.contains(':') {
            return Err("not an IPv6 prefix".into());
        }
        let Ok(len) = len.parse::<u16>() else {
            return Err("invalid prefix length".into());
        };
        if len > 128 {
            return Err("prefix length must be 0-128".into());
        }
        if !self.devices.iter().any(|d| d.id == device) {
            return Err("no such device".into());
        }
        let list = self.v6_networks.entry(device.to_string()).or_default();
        let text = format!("{addr}/{len}");
        if !list.contains(&text) {
            list.push(text);
        }
        Ok(())
    }

    /// `show ipv6 route`: connected IPv6 addresses plus OSPFv3 advertisements.
    pub fn show_ipv6_routes(&self, id: &str) -> String {
        let Some(dev) = self.devices.iter().find(|d| d.id == id) else {
            return "% Unknown device\n".into();
        };
        let mut out = String::from("IPv6 Routing Table - Codes: C - connected, O - OSPFv3\n");
        if let Some(addr) = &dev.ipv6 {
            out.push_str(&format!(
                "C  {addr}/{} via :: , {}\n",
                dev.ipv6_prefix,
                dev.name
            ));
        }
        if let Some(gw) = &dev.ipv6_gateway {
            out.push_str(&format!("C  default via {gw}\n"));
        }
        for net in self.v6_networks.get(id).into_iter().flatten() {
            out.push_str(&format!("O  {net} [110/1]\n"));
        }
        out
    }

    pub fn set_routing_protocol(&mut self, device: &str, proto: &str) -> Result<(), String> {
        if !self.devices.iter().any(|d| d.id == device) {
            return Err("no such device".into());
        }
        let entry = self.routing.entry(device.to_string()).or_default();
        entry.0 = proto.to_string();
        self.recompute_routing();
        Ok(())
    }

    pub fn add_routing_network(
        &mut self,
        device: &str,
        net: u32,
        prefix: u8,
    ) -> Result<(), String> {
        let Some(entry) = self.routing.get_mut(device) else {
            return Err("no routing protocol configured".into());
        };
        if !entry.1.iter().any(|(n, p)| *n == net && *p == prefix) {
            entry.1.push((net, prefix));
        }
        self.recompute_routing();
        Ok(())
    }

    pub fn remove_routing_network(&mut self, device: &str, net: u32, prefix: u8) {
        if let Some(entry) = self.routing.get_mut(device) {
            entry.1.retain(|(n, p)| !(*n == net && *p == prefix));
        }
        self.recompute_routing();
    }

    /// Distance-vector pass: every router learns the networks advertised by
    /// routers it can reach, with the peer's address as next hop.
    pub fn recompute_routing(&mut self) {
        use std::collections::VecDeque;
        self.dyn_routes.clear();
        let ids: Vec<String> = self
            .routing
            .iter()
            .filter(|(_, (proto, nets))| !proto.is_empty() && !nets.is_empty())
            .map(|(id, _)| id.clone())
            .collect();
        for src in ids {
            let Some((proto, _)) = self.routing.get(&src).cloned() else {
                continue;
            };
            let mut queue = VecDeque::new();
            let mut seen = std::collections::HashSet::new();
            seen.insert(src.clone());
            queue.push_back((src.clone(), 0u8));
            let mut found: Vec<(u32, u8, u32, String, u8)> = Vec::new();
            while let Some((cur, hops)) = queue.pop_front() {
                let edges: Vec<(String, u32)> = self
                    .links
                    .iter()
                    .filter_map(|l| {
                        let (peer, peer_port) = if l.a == cur {
                            (l.b.clone(), l.b_port.clone())
                        } else if l.b == cur {
                            (l.a.clone(), l.a_port.clone())
                        } else {
                            return None;
                        };
                        let peer_dev = self.devices.iter().find(|d| d.id == peer)?;
                        if peer_dev.kind != "router" {
                            return None;
                        }
                        let ip = peer_dev
                            .ports
                            .iter()
                            .find(|p| p.name == peer_port)
                            .and_then(|p| p.ip)?;
                        Some((peer, ip))
                    })
                    .collect();
                for (peer, via) in edges {
                    if let Some((_, nets)) = self.routing.get(&peer) {
                        for (net, prefix) in nets {
                            let local = self.devices.iter().find(|d| d.id == src).map_or(false, |d| {
                                d.ports.iter().any(|p| {
                                    p.ip.is_some()
                                        && p.prefix == *prefix
                                        && (p.ip.unwrap() & crate::model::mask_of(*prefix))
                                            == (*net & crate::model::mask_of(*prefix))
                                })
                            });
                            if local {
                                continue;
                            }
                            let metric = hops.saturating_add(1);
                            found.retain(|(n, p, _, _, _)| !(n == net && p == prefix));
                            found.push((*net, *prefix, via, proto.clone(), metric));
                        }
                    }
                    if seen.insert(peer.clone()) {
                        queue.push_back((peer, hops.saturating_add(1)));
                    }
                }
            }
            found.sort_by(|a, b| b.1.cmp(&a.1).then(a.0.cmp(&b.0)));
            self.dyn_routes.insert(src, found);
        }
    }

    pub fn dynamic_route(&self, device: &str, dst: u32) -> Option<u32> {
        self.dyn_routes.get(device).and_then(|list| {
            list.iter()
                .filter(|(net, prefix, _, _, _)| crate::model::contains(dst, *net, *prefix))
                .max_by_key(|(_, prefix, _, _, _)| *prefix)
                .map(|(_, _, via, _, _)| *via)
        })
    }

    /// IOS-style `show ip route` text: connected interfaces, then statics.
    pub fn show_routes(&self, id: &str) -> String {
        let Some(dev) = self.devices.iter().find(|d| d.id == id) else {
            return "% Unknown device\n".to_string();
        };
        let mut out = String::from("Codes: C - connected, S - static\n");
        for p in &dev.ports {
            if let Some(ip) = p.ip {
                out.push_str(&format!(
                    "C  {}/{} is directly connected, {}\n",
                    crate::model::ipv4_string(ip & crate::model::mask_of(p.prefix)),
                    p.prefix,
                    p.name
                ));
            }
        }
        for &(net, prefix, via) in &dev.routes {
            out.push_str(&format!(
                "S  {}/{} [1/0] via {}\n",
                crate::model::ipv4_string(net),
                prefix,
                crate::model::ipv4_string(via)
            ));
        }
        if let Some(list) = self.dyn_routes.get(id) {
            for (net, prefix, via, proto, metric) in list {
                let code = match proto.as_str() {
                    "ospf" => "O",
                    "eigrp" => "D",
                    _ => "R",
                };
                out.push_str(&format!(
                    "{code}  {}/{} [{metric}/0] via {}\n",
                    crate::model::ipv4_string(*net),
                    prefix,
                    crate::model::ipv4_string(*via)
                ));
            }
        }
        out
    }

    /// Default gateway of a host; routers and switches route instead.
    pub fn gateway_of(&self, id: &str) -> Option<u32> {
        let dev = self.devices.iter().find(|d| d.id == id)?;
        if matches!(dev.kind.as_str(), "router" | "switch") {
            return None;
        }
        dev.gateway
    }

    /// Build a classic bus segment: one hub plus `count` workstations wired to
    /// it, each with an address on 192.168.1.0/24.
    pub fn bus(&mut self, count: usize) -> Result<usize, String> {
        if !(2..=24).contains(&count) {
            return Err("bus needs 2 to 24 stations".into());
        }
        // Starting from the untouched demo would stack the bus on top of it.
        if self.is_pristine_demo() {
            *self = Workspace {
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
        }
        let hub = self
            .add("Hub", 500.0, 110.0)
            .ok_or_else(|| "hub model missing from catalogue".to_string())?;

        let mut made = 0;
        let span = 760.0;
        for i in 0..count {
            let t = if count == 1 { 0.5 } else { i as f32 / (count - 1) as f32 };
            let x = 120.0 + span * t;
            let Some(pc) = self.add("PC-PT", x, 385.0) else {
                continue;
            };
            let _ = self.link(&pc, &hub);
            let addr = format!("192.168.1.{}", 10 + i);
            let _ = self.set_ip(&pc, &addr, 24);
            made += 1;
        }
        Ok(made)
    }

    pub fn json(&self) -> String {
        let mut o = String::from("{\"tabs\":{\"logical\":\"Logical\",\"physical\":");
        o.push_str(&s("Physical · BS: 3, 2/2"));
        o.push_str("},\"devices\":[");

        for (i, d) in self.devices.iter().enumerate() {
            if i > 0 {
                o.push(',');
            }
            let dhcp = self.dhcp_clients.contains(&d.id);
            let pool = match self.dhcp_pools.get(&d.id) {
                Some(p) => format!(
                    "{{\"network\":{},\"prefix\":{},\"gateway\":{},\"dns\":{}}}",
                    s(&crate::model::ipv4_string(p.network)),
                    p.prefix,
                    opt_ip(p.gateway),
                    opt_ip(p.dns)
                ),
                None => "null".to_string(),
            };
            let powered = self.is_powered(&d.id);
            let slots = format!(
                "[{}]",
                self.modules(&d.id)
                    .iter()
                    .map(|m| match m {
                        Some(name) => s(name),
                        None => "null".to_string(),
                    })
                    .collect::<Vec<_>>()
                    .join(",")
            );
            let dns_records = match self.dns_records.get(&d.id) {
                Some(list) => format!(
                    "[{}]",
                    list.iter()
                        .map(|(name, ip)| format!(
                            "{{\"name\":{},\"address\":{}}}",
                            s(name),
                            s(&crate::model::ipv4_string(*ip))
                        ))
                        .collect::<Vec<_>>()
                        .join(",")
                ),
                None => "[]".to_string(),
            };
            let http_page = opt_str(self.http_pages.get(&d.id).map(String::as_str));
            let reservations = match self.dhcp_reservations.get(&d.id) {
                Some(list) => format!(
                    "[{}]",
                    list.iter()
                        .map(|(client, ip)| format!(
                            "{{\"client\":{},\"address\":{}}}",
                            s(client),
                            s(&crate::model::ipv4_string(*ip))
                        ))
                        .collect::<Vec<_>>()
                        .join(",")
                ),
                None => "[]".to_string(),
            };
            let helpers = match self.dhcp_helpers.get(&d.id) {
                Some(list) => format!(
                    "[{}]",
                    list.iter()
                        .map(|(iface, ip)| format!(
                            "{{\"iface\":{},\"address\":{}}}",
                            s(iface),
                            s(&crate::model::ipv4_string(*ip))
                        ))
                        .collect::<Vec<_>>()
                        .join(",")
                ),
                None => "[]".to_string(),
            };
            o.push_str(&format!(
                "{{\"id\":{},\"name\":{},\"model\":{},\"icon\":{},\"art\":{},\"kind\":{},\"x\":{},\"y\":{},\"ip\":{},\"prefix\":{},\"gateway\":{},\"dns\":{},\"ipv6\":{},\"ipv6Prefix\":{},\"ipv6Gateway\":{},\"ipv6Dns\":{},\"ipv6Auto\":{},\"dot1x\":{},\"dot1xUser\":{},\"dhcp\":{},\"pool\":{},\"powered\":{},\"slots\":{},\"dnsRecords\":{},\"httpPage\":{},\"reservations\":{},\"helpers\":{}}}",
                s(&d.id),
                s(&d.name),
                s(&d.model),
                s(&d.icon),
                s(logical_art(&d.kind)),
                s(&d.kind),
                d.x,
                d.y,
                opt_ip(d.ip),
                d.prefix,
                opt_ip(d.gateway),
                opt_ip(d.dns),
                opt_str(d.ipv6.as_deref()),
                d.ipv6_prefix,
                opt_str(d.ipv6_gateway.as_deref()),
                opt_str(d.ipv6_dns.as_deref()),
                d.ipv6_auto,
                d.dot1x,
                opt_str(d.dot1x_user.as_deref()),
                dhcp,
                pool,
                powered,
                slots,
                dns_records,
                http_page,
                reservations,
                helpers
            ));
        }

        o.push_str("],\"links\":[");
        for (i, l) in self.links.iter().enumerate() {
            if i > 0 {
                o.push(',');
            }
            o.push_str(&format!(
                "{{\"a\":{},\"aPort\":{},\"b\":{},\"bPort\":{},\"kind\":{}}}",
                s(&l.a),
                s(&l.a_port),
                s(&l.b),
                s(&l.b_port),
                s(&l.kind)
            ));
        }

        o.push_str("],\"filters\":[");
        for (i, f) in FILTERS.iter().enumerate() {
            if i > 0 {
                o.push(',');
            }
            o.push_str(&s(f));
        }

        o.push_str("],\"groups\":[");
        for (i, (name, icon)) in GROUPS.iter().enumerate() {
            if i > 0 {
                o.push(',');
            }
            o.push_str(&format!(
                "{{\"label\":{},\"icon\":{}}}",
                s(name),
                s(&format!("art/ComponentBox/{icon}"))
            ));
        }

        o.push_str("],\"palette\":[");
        for (i, (label, icon, kind)) in CATALOG.iter().enumerate() {
            if i > 0 {
                o.push(',');
            }
            let _ = icon;
            o.push_str(&format!(
                "{{\"label\":{},\"icon\":{},\"art\":{},\"kind\":{}}}",
                s(label),
                s(logical_icon(kind)),
                s(logical_art(kind)),
                s(kind)
            ));
        }

        o.push_str("],\"events\":[");
        for (i, e) in self.events.iter().enumerate() {
            if i > 0 {
                o.push(',');
            }
            o.push_str(&format!(
                "{{\"id\":{},\"time\":{},\"last\":{},\"at\":{},\"type\":{},\"proto\":{},\"size\":{},\"path\":[",
                e.id,
                e.time,
                s(&e.last),
                s(&e.at),
                s(&e.kind),
                s(&e.proto),
                e.size
            ));
            for (j, hop) in e.path.iter().enumerate() {
                if j > 0 {
                    o.push(',');
                }
                o.push_str(&s(hop));
            }
            o.push_str("],\"hops\":[");
            for (j, h) in e.hops.iter().enumerate() {
                if j > 0 {
                    o.push(',');
                }
                o.push_str(&format!(
                    "{{\"id\":{},\"name\":{},\"in\":{},\"out\":{},\"t\":{},\"ttl\":{},\"srcMac\":{},\"dstMac\":{},\"note\":{}}}",
                    s(&h.id),
                    s(&h.name),
                    opt_str(h.ingress.as_deref()),
                    opt_str(h.egress.as_deref()),
                    h.t,
                    h.ttl,
                    s(&h.src_mac.to_string()),
                    s(&h.dst_mac.to_string()),
                    s(&h.note)
                ));
            }
            o.push_str("]}");
        }

        o.push_str("]}");
        o
    }
}

/// Tabs and newlines separate fields, so banner/password text is escaped.
fn escape_field(s: &str) -> String {
    s.replace('\\', "\\\\")
        .replace('\t', "\\t")
        .replace('\n', "\\n")
}

fn unescape_field(s: &str) -> String {
    let mut out = String::with_capacity(s.len());
    let mut chars = s.chars();
    while let Some(c) = chars.next() {
        if c != '\\' {
            out.push(c);
            continue;
        }
        match chars.next() {
            Some('t') => out.push('\t'),
            Some('n') => out.push('\n'),
            Some('\\') => out.push('\\'),
            Some(other) => {
                out.push('\\');
                out.push(other);
            }
            None => out.push('\\'),
        }
    }
    out
}

fn opt_str(v: Option<&str>) -> String {
    match v {
        Some(s) if !s.is_empty() => format!("{:?}", s),
        _ => "null".to_string(),
    }
}

fn opt_ip(v: Option<u32>) -> String {
    match v {
        Some(ip) => format!("\"{}\"", crate::model::ipv4_string(ip)),
        None => "null".to_string(),
    }
}

fn clamp_x(x: f32) -> f32 {
    x.clamp(40.0, 960.0)
}

fn clamp_y(y: f32) -> f32 {
    y.clamp(40.0, 500.0)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn json_is_balanced_and_complete() {
        let ws = Workspace::new();
        let j = ws.json();
        assert_eq!(j.matches('{').count(), j.matches('}').count());
        assert_eq!(j.matches("\"id\":").count(), ws.devices.len());
        assert_eq!(j.matches("\"aPort\":").count(), ws.links.len());
        assert!(j.contains("\"label\":\"2911\""));
        assert!(j.contains("\"kind\":\"router\""));
    }

    #[test]
    fn add_names_and_counts_by_kind() {
        let mut ws = Workspace::new();
        let before = ws.devices.len();
        let id = ws.add("PC-PT", 100.0, 100.0).unwrap();
        assert_eq!(ws.devices.len(), before + 1);
        let dev = ws.devices.iter().find(|d| d.id == id).unwrap();
        assert_eq!(dev.name, "PC3");
        assert_eq!(dev.kind, "pc");
        assert!(
            dev.icon.ends_with("pc.svg") || dev.icon.contains("iWorkstation"),
            "{}",
            dev.icon
        );
    }

    #[test]
    fn add_unknown_model_is_rejected() {
        let mut ws = Workspace::new();
        assert!(ws.add("not-a-device", 10.0, 10.0).is_none());
    }

    #[test]
    fn move_and_remove() {
        let mut ws = Workspace::new();
        assert!(ws.mv("pc0", 500.0, 300.0));
        let d = ws.devices.iter().find(|d| d.id == "pc0").unwrap();
        assert_eq!((d.x, d.y), (500.0, 300.0));

        // clamped to the canvas
        assert!(ws.mv("pc0", -500.0, 9999.0));
        let d = ws.devices.iter().find(|d| d.id == "pc0").unwrap();
        assert_eq!((d.x, d.y), (40.0, 500.0));

        let links_before = ws.links.len();
        assert!(ws.remove("pc0"));
        assert!(ws.links.len() < links_before);
        assert!(!ws.remove("pc0"));
    }

    #[test]
    fn linking_assigns_ports_and_rejects_duplicates() {
        let mut ws = Workspace::new();
        let pc = ws.add("PC-PT", 700.0, 450.0).unwrap();

        assert!(ws.link(&pc, "switch0").is_ok());
        let link = ws.links.iter().find(|l| l.a == pc).unwrap();
        assert_eq!(link.a_port, "Fa0");
        assert_eq!(link.b_port, "Fa0/4"); // switch already has 3 links

        assert!(ws.link(&pc, "switch0").is_err(), "duplicate accepted");
        assert!(ws.link(&pc, &pc).is_err(), "self link accepted");
        assert!(ws.link(&pc, "nope").is_err(), "unknown device accepted");

        assert!(ws.unlink(&pc, "switch0"));
        assert!(!ws.unlink(&pc, "switch0"));
    }

    #[test]
    fn router_ports_increment_by_link_count() {
        let mut ws = Workspace::new();
        assert_eq!(ws.next_port("router0"), "Gig0/2"); // already has 2 links
        let pc = ws.add("PC-PT", 700.0, 450.0).unwrap();
        ws.link(&pc, "router0").unwrap();
        assert_eq!(ws.next_port("router0"), "Gig0/3");
    }

    #[test]
    fn every_link_endpoint_exists() {
        let ws = Workspace::new();
        for l in &ws.links {
            assert!(ws.devices.iter().any(|d| d.id == l.a), "missing {}", l.a);
            assert!(ws.devices.iter().any(|d| d.id == l.b), "missing {}", l.b);
        }
    }

    #[test]
    fn console_cable_joins_only_a_host_to_a_network_device() {
        let mut ws = Workspace::new();
        ws.link_kind("pc0", "router0", "eConsole").unwrap();
        assert_eq!(ws.console_peer("pc0"), Some("router0"));
        assert_eq!(ws.console_peer("router0"), None, "only the host drives it");

        // two switches cannot be joined by a console cable
        let sw = ws.add("2960", 700.0, 120.0).unwrap();
        let err = ws.link_kind("switch0", &sw, "eConsole").unwrap_err();
        assert!(err.contains("console cable joins a PC"), "{err}");
        // unknown cable types are refused, not silently typed as copper
        let err = ws.link_kind("pc1", &sw, "eBanana").unwrap_err();
        assert!(err.contains("unknown cable type"), "{err}");

        // a console cable is out of band: it never becomes a data path, and it
        // lands on the console port instead of consuming a Gigabit interface
        assert_eq!(ws.links.iter().filter(|l| l.carries_data()).count(), 6);
        let console = ws.links.iter().find(|l| !l.carries_data()).unwrap();
        assert_eq!(console.a_port, "RS-232");
        assert_eq!(console.b_port, "Console");
    }

    #[test]
    fn console_link_does_not_carry_traffic() {
        let mut ws = Workspace::from_ptw("# console only\n").unwrap();
        let pc = ws.add("PC-PT", 100.0, 300.0).unwrap();
        let r = ws.add("2911", 500.0, 100.0).unwrap();
        ws.link_kind(&pc, &r, "eConsole").unwrap();
        ws.set_ip(&pc, "10.0.0.1", 24).unwrap();
        let other = ws.add("PC-PT", 800.0, 300.0).unwrap();
        ws.set_ip(&other, "10.0.0.2", 24).unwrap();

        let err = ws.send_pdu(&pc, &other).unwrap_err();
        assert!(err.contains("not connected"), "{err}");
    }

    #[test]
    fn pdu_is_a_real_frame_across_the_router() {
        use crate::net::packet::Mac;
        let mut ws = Workspace::new();
        ws.send_pdu("pc0", "pc2").unwrap();
        let e = &ws.events[0];
        assert_eq!(
            e.path,
            vec!["pc0", "switch0", "router0", "switch1", "pc2"],
            "cross-subnet path"
        );
        assert!(e.size > 60, "frame size {} looks truncated", e.size);
        assert_eq!(e.hops.len(), e.path.len());

        // The scheduler stamps one arrival per device and the event lands on
        // the last one.
        assert!(e.hops.windows(2).all(|w| w[1].t > w[0].t), "times must increase");
        let last = e.hops.last().unwrap().t;
        assert!((last - e.time as f64).abs() < 1e-6, "{} vs {}", last, e.time);
        assert!(ws.events[0].time > 0.0);

        let router = e.hops.iter().find(|h| h.id == "router0").unwrap();
        assert_eq!(router.note, "routed: TTL 128 -> 127", "{}", router.note);
        assert_eq!(router.ttl, 127);
        assert_eq!(router.ingress.as_deref(), Some("GigabitEthernet0/0"));
        assert_eq!(router.egress.as_deref(), Some("GigabitEthernet0/1"));

        // L2 boundaries: into the router the frame is addressed to the router,
        // and the last segment carries router0 as sender, pc2 as receiver.
        assert_eq!(e.hops[0].src_mac, Mac::for_device("pc0"));
        assert_eq!(e.hops[0].dst_mac, Mac::for_device("router0"));
        assert_eq!(e.hops[4].src_mac, Mac::for_device("router0"));
        assert_eq!(e.hops[4].dst_mac, Mac::for_device("pc2"));

        // ARP resolution is recorded for the on-link neighbour.
        let reply = ws.tables.arps("pc0");
        assert_eq!(reply.lookup(
            crate::model::parse_ipv4("192.168.2.10").unwrap(),
            ws.sim_time as f64
        ), None, "cross-subnet destination is not an ARP neighbour");
    }

    #[test]
    fn switch_learns_source_macs_and_then_hits() {
        use crate::net::packet::Mac;
        let mut ws = Workspace::new();
        ws.send_pdu("pc1", "pc0").unwrap();
        let rows = ws.tables.mac_rows("switch0");
        assert!(
            rows.iter().any(|r| r.mac == Mac::for_device("pc1")),
            "switch0 learned pc1: {rows:?}"
        );

        ws.send_pdu("pc0", "pc1").unwrap();
        let hop = ws.events[1]
            .hops
            .iter()
            .find(|h| h.id == "switch0")
            .unwrap();
        assert!(hop.note.contains("MAC table hit"), "{}", hop.note);
    }

    #[test]
    fn dhcp_hands_out_sequential_leases_on_the_segment() {
        let mut ws = Workspace::new();
        ws.set_dhcp_pool("server0", "192.168.2.0", 24, "192.168.2.1", "8.8.8.8")
            .unwrap();

        let pc = ws.add("PC-PT", 600.0, 200.0).unwrap();
        ws.link(&pc, "switch1").unwrap();
        let lease = ws.acquire_dhcp(&pc).unwrap();
        assert_eq!(
            crate::model::ipv4_string(lease.ip),
            "192.168.2.100",
            "first lease"
        );
        assert_eq!(lease.prefix, 24);
        assert_eq!(lease.server, "server0");
        let d = ws.devices.iter().find(|d| d.id == pc).unwrap();
        assert_eq!(d.ip, Some(lease.ip));
        assert_eq!(d.gateway, crate::model::parse_ipv4("192.168.2.1"));
        assert!(ws.dhcp_clients.contains(&pc));
        assert!(ws.events.iter().any(|e| e.kind == "DHCP"));

        let pc2 = ws.add("PC-PT", 700.0, 200.0).unwrap();
        ws.link(&pc2, "switch1").unwrap();
        let second = ws.acquire_dhcp(&pc2).unwrap();
        assert_eq!(crate::model::ipv4_string(second.ip), "192.168.2.101");

        // Static configuration takes the host off DHCP again.
        ws.set_config(&pc2, "192.168.2.50", "255.255.255.0", "", "")
            .unwrap();
        assert!(!ws.dhcp_clients.contains(&pc2));
    }

    #[test]
    fn dhcp_needs_a_server_on_the_same_segment() {
        let mut ws = Workspace::new();
        // pc0 sits behind router0, so the server pool is not on its segment.
        ws.set_dhcp_pool("server0", "192.168.2.0", 24, "192.168.2.1", "")
            .unwrap();
        let err = ws.acquire_dhcp("pc0").unwrap_err();
        assert!(err.contains("no DHCP server"), "{err}");
    }

    #[test]
    fn cables_only_join_devices_that_support_them() {
        let mut ws = Workspace::from_ptw("# cable rules\n").unwrap();
        let r1 = ws.add("2911", 200.0, 100.0).unwrap();
        let r2 = ws.add("2911", 700.0, 100.0).unwrap();
        let pc = ws.add("PC-PT", 200.0, 400.0).unwrap();
        let pc2 = ws.add("PC-PT", 700.0, 400.0).unwrap();
        let sw = ws.add("2960", 450.0, 100.0).unwrap();

        // Serial needs serial ports on both ends and picks one of them.
        assert!(ws.link_kind(&r1, &r2, "eSerial").is_ok());
        let serial = ws.links.last().unwrap();
        assert_eq!(serial.a_port, "Serial0/0/0", "{}", serial.a_port);
        assert!(ws.link_kind(&pc, &pc2, "eSerial").is_err());

        // Fiber joins network devices only.
        assert!(ws.link_kind(&sw, &r1, "eFiber").is_ok());
        assert!(ws.link_kind(&pc, &pc2, "eFiber").is_err());

        // Copper joins Ethernet endpoints.
        assert!(ws.link_kind(&pc, &sw, "eCopper").is_ok());

        // Phone and coax have their own endpoints.
        let phone = ws.add("Analog Phone", 900.0, 400.0).unwrap();
        assert!(ws.link_kind(&phone, &r2, "ePhone").is_ok());
        assert!(ws.link_kind(&phone, &pc, "ePhone").is_err());
        let home = ws.add("Home Router", 900.0, 100.0).unwrap();
        assert!(ws.link_kind(&home, &r1, "eCoax").is_ok());
        assert!(ws.link_kind(&r1, &r2, "eCoax").is_err());

        // IoT cable joins IoT endpoints (directly or through a switch).
        let t1 = ws.add("Thing", 600.0, 300.0).unwrap();
        let t2 = ws.add("Thing", 800.0, 300.0).unwrap();
        assert!(ws.link_kind(&t1, &t2, "eIoT").is_ok());
        assert!(ws.link_kind(&t1, &pc, "eIoT").is_err());
    }

    #[test]
    fn shutting_an_interface_breaks_the_path() {
        let mut ws = Workspace::new();
        assert!(ws.set_port_up("router0", "GigabitEthernet0/0", false));
        let err = ws.send_pdu("pc0", "pc2").unwrap_err();
        assert!(
            err.contains("Router0 GigabitEthernet0/0 is administratively down"),
            "{err}"
        );
        assert!(ws.events.is_empty());

        assert!(ws.set_port_up("router0", "GigabitEthernet0/0", true));
        ws.send_pdu("pc0", "pc2").unwrap();
        assert_eq!(ws.events.len(), 1);
    }

    #[test]
    fn pdu_follows_links_and_records_event() {
        let mut ws = Workspace::new();
        ws.send_pdu("pc0", "pc2").unwrap();
        assert_eq!(ws.events.len(), 1);
        let e = &ws.events[0];
        assert_eq!(e.last, "PC0");
        assert_eq!(e.at, "PC2");
        assert_eq!(e.path.first().unwrap(), "pc0");
        assert_eq!(e.path.last().unwrap(), "pc2");
        assert!(e.time > 0.0);

        ws.reset_sim();
        assert!(ws.events.is_empty());
        assert_eq!(ws.sim_time, 0.0);
    }

    #[test]
    fn pdu_rejects_unknown_and_disconnected() {
        let mut ws = Workspace::new();
        assert!(ws.send_pdu("pc0", "nope").is_err());
        assert!(ws.send_pdu("pc0", "pc0").is_err());

        let laptop = ws.add("Laptop", 800.0, 120.0).unwrap();
        let err = ws.send_pdu("pc0", &laptop).unwrap_err();
        assert!(err.contains("no path"), "{err}");
        assert!(ws.events.is_empty());
    }

    #[test]
    fn duplicate_copies_model_and_offsets() {
        let mut ws = Workspace::new();
        let n = ws.devices.len();
        let id = ws.duplicate("pc0").unwrap();
        assert_eq!(ws.devices.len(), n + 1);
        let d = ws.devices.iter().find(|d| d.id == id).unwrap();
        assert_eq!(d.model, "PC-PT");
        assert!(d.x > 105.0);
    }


    #[test]
    fn from_pkt_builds_typed_topology() {
        let xml = r#"<PACKETTRACER5><VERSION>7.3</VERSION><NETWORK>
        <DEVICE><TYPE model="1941">Router</TYPE><NAME>R1</NAME>
          <SAVE_REF_ID>r1</SAVE_REF_ID>
          <WORKSPACE><LOGICAL><X>10</X><Y>10</Y></LOGICAL></WORKSPACE></DEVICE>
        <DEVICE><TYPE model="2960">Switch</TYPE><NAME>SW1</NAME>
          <SAVE_REF_ID>s1</SAVE_REF_ID>
          <WORKSPACE><LOGICAL><X>300</X><Y>200</Y></LOGICAL></WORKSPACE></DEVICE>
        <LINK><TYPE>eCopper</TYPE><FROM>r1</FROM><PORT>GigabitEthernet0/0</PORT>
          <TO>s1</TO><PORT>FastEthernet0/1</PORT></LINK>
        </NETWORK></PACKETTRACER5>"#;
        let pkt = crate::storage::ptxml::parse(xml);
        let ws = Workspace::from_pkt(&pkt);
        assert_eq!(ws.devices.len(), 2);
        assert_eq!(ws.links.len(), 1);
        assert_eq!(ws.devices[0].name, "R1");
        assert_eq!(ws.devices[0].kind, "router");
        assert_eq!(ws.links[0].a_port, "Gig0/0");
        assert_eq!(ws.links[0].b_port, "Fa0/1");
        assert!(ws.devices[0].x >= 40.0 && ws.devices[1].x >= 40.0);
    }


    #[test]
    fn bus_builds_star_with_addresses() {
        let mut ws = Workspace::new();
        assert_eq!(ws.bus(4).unwrap(), 4);
        // An untouched demo is replaced, so the bus is the whole topology.
        assert_eq!(ws.devices.len(), 5); // hub + 4 PCs
        assert_eq!(ws.links.len(), 4);

        let mut addrs: Vec<String> = ws
            .devices
            .iter()
            .filter_map(|d| d.ip.map(crate::model::ipv4_string))
            .collect();
        addrs.sort();
        assert_eq!(
            addrs,
            vec!["192.168.1.10", "192.168.1.11", "192.168.1.12", "192.168.1.13"]
        );
        assert!(ws.bus(1).is_err());
        assert!(ws.bus(99).is_err());
    }

    #[test]
    fn set_ip_validates_and_stores() {
        let mut ws = Workspace::new();
        assert!(ws.set_ip("pc0", "192.168.1.10", 24).is_ok());
        let pc = ws.devices.iter().find(|d| d.id == "pc0").unwrap();
        assert_eq!(pc.ip, crate::model::parse_ipv4("192.168.1.10"));

        assert!(ws.set_ip("pc0", "999.1.1.1", 24).is_err());
        assert!(ws.set_ip("pc0", "192.168.1.10", 33).is_err());
        assert!(ws.set_ip("nope", "192.168.1.10", 24).is_err());
    }

    #[test]
    fn set_config_stores_mask_gateway_and_dns() {
        let mut ws = Workspace::new();
        ws.set_config("pc0", "192.168.1.10", "255.255.255.0", "192.168.1.1", "8.8.8.8")
            .unwrap();
        let d = ws.devices.iter().find(|d| d.id == "pc0").unwrap();
        assert_eq!(d.prefix, 24);
        assert_eq!(d.gateway, crate::model::parse_ipv4("192.168.1.1"));
        assert_eq!(d.dns, crate::model::parse_ipv4("8.8.8.8"));

        // empty gateway/dns are allowed (Packet Tracer leaves them 0.0.0.0)
        ws.set_config("pc1", "192.168.1.11", "255.255.255.0", "", "").unwrap();
        let d = ws.devices.iter().find(|d| d.id == "pc1").unwrap();
        assert_eq!(d.gateway, None);
        assert_eq!(d.dns, None);

        assert!(ws.set_config("pc0", "192.168.1.10", "255.0.255.0", "", "").is_err());
        assert!(ws.set_config("pc0", "192.168.1.10", "24", "bad", "").is_err());
        assert!(ws.set_config("nope", "192.168.1.10", "24", "", "").is_err());
    }

    #[test]
    fn ipv6_section_stores_and_validates() {
        let mut ws = Workspace::new();
        ws.set_ipv6("pc0", false, "2001:db8::1", 64, "2001:db8::ff", "2001:db8::53")
            .unwrap();
        let d = ws.devices.iter().find(|d| d.id == "pc0").unwrap();
        assert_eq!(d.ipv6.as_deref(), Some("2001:db8::1"));
        assert_eq!(d.ipv6_prefix, 64);
        assert_eq!(d.ipv6_gateway.as_deref(), Some("2001:db8::ff"));
        assert_eq!(d.ipv6_dns.as_deref(), Some("2001:db8::53"));

        assert!(ws.set_ipv6("pc0", false, "192.168.1.1", 64, "", "").is_err());
        assert!(ws.set_ipv6("pc0", false, "2001:db8::1", 129, "", "").is_err());
        assert!(ws.set_ipv6("nope", false, "2001:db8::1", 64, "", "").is_err());
    }

    #[test]
    fn pdu_checks_subnet_when_addresses_exist() {
        let mut ws = Workspace::new();
        ws.bus(2).unwrap();
        let pcs: Vec<String> = ws
            .devices
            .iter()
            .filter(|d| d.kind == "pc" && d.ip.is_some())
            .map(|d| d.id.clone())
            .collect();
        assert_eq!(pcs.len(), 2);

        ws.send_pdu(&pcs[0], &pcs[1]).unwrap();
        assert_eq!(ws.events.len(), 1);

        // Move one host to a foreign subnet: the PDU must refuse.
        ws.set_ip(&pcs[1], "10.0.0.5", 24).unwrap();
        let err = ws.send_pdu(&pcs[0], &pcs[1]).unwrap_err();
        assert!(err.contains("no route to 10.0.0.5"), "{err}");
        assert!(err.contains("no default gateway"), "{err}");
        assert_eq!(ws.events.len(), 1);
    }

    #[test]
    fn static_routes_are_stored_and_shown() {
        let mut ws = Workspace::new();
        ws.set_port_ip("router0", "GigabitEthernet0/0", "192.168.1.1", 24)
            .unwrap();
        ws.add_route("router0", "10.0.0.0", "255.0.0.0", "192.168.1.254")
            .unwrap();
        // Prefix-length masks are accepted too, and 24-bit prefixes normalise.
        ws.add_route("router0", "172.16.5.130", "24", "192.168.1.254")
            .unwrap();

        let dev = ws.devices.iter().find(|d| d.id == "router0").unwrap();
        assert_eq!(dev.routes.len(), 2);
        assert_eq!(
            dev.routes[1],
            (
                crate::model::parse_ipv4("172.16.5.0").unwrap(),
                24,
                crate::model::parse_ipv4("192.168.1.254").unwrap()
            )
        );

        let out = ws.show_routes("router0");
        assert!(out.contains("Codes: C - connected, S - static"), "{out}");
        assert!(
            out.contains("C  192.168.1.0/24 is directly connected, GigabitEthernet0/0"),
            "{out}"
        );
        assert!(out.contains("S  10.0.0.0/8 [1/0] via 192.168.1.254"), "{out}");
        assert!(
            out.contains("S  172.16.5.0/24 [1/0] via 192.168.1.254"),
            "{out}"
        );

        assert!(ws.add_route("router0", "bad", "24", "192.168.1.254").is_err());
        assert!(ws.add_route("router0", "10.0.0.0", "255.0.255.0", "192.168.1.254").is_err());
        assert!(ws.add_route("router0", "10.0.0.0", "24", "nope").is_err());
        assert!(ws.add_route("nope", "10.0.0.0", "24", "192.168.1.254").is_err());
        assert!(ws.show_routes("nope").contains("Unknown"));
    }

    #[test]
    fn same_subnet_delivery_uses_links() {
        let mut ws = Workspace::from_ptw("# lan\n").unwrap();
        let hub = ws.add("Hub", 400.0, 100.0).unwrap();
        let a = ws.add("PC-PT", 100.0, 300.0).unwrap();
        let b = ws.add("PC-PT", 700.0, 300.0).unwrap();
        ws.link(&a, &hub).unwrap();
        ws.link(&b, &hub).unwrap();
        ws.set_ip(&a, "192.168.1.10", 24).unwrap();
        ws.set_ip(&b, "192.168.1.20", 24).unwrap();

        ws.send_pdu(&a, &b).unwrap();
        assert_eq!(ws.events.len(), 1);
        assert_eq!(ws.events[0].path, vec![a.clone(), hub.clone(), b.clone()]);
    }

    #[test]
    fn cross_subnet_delivery_follows_gateways() {
        let mut ws = Workspace::from_ptw("# routed lan\n").unwrap();
        let a = ws.add("PC-PT", 80.0, 380.0).unwrap();
        let b = ws.add("PC-PT", 820.0, 380.0).unwrap();
        let r = ws.add("2911", 450.0, 90.0).unwrap();
        ws.link(&a, &r).unwrap();
        ws.link(&r, &b).unwrap();

        ws.set_config(&a, "192.168.1.10", "255.255.255.0", "192.168.1.1", "")
            .unwrap();
        ws.set_config(&b, "10.0.0.10", "255.255.255.0", "10.0.0.1", "")
            .unwrap();
        ws.set_port_ip(&r, "GigabitEthernet0/0", "192.168.1.1", 24)
            .unwrap();
        ws.set_port_ip(&r, "GigabitEthernet0/1", "10.0.0.1", 24)
            .unwrap();

        assert_eq!(ws.gateway_of(&a), crate::model::parse_ipv4("192.168.1.1"));
        assert_eq!(ws.gateway_of(&b), crate::model::parse_ipv4("10.0.0.1"));
        assert_eq!(ws.gateway_of(&r), None, "routers do not have a default gateway");

        ws.send_pdu(&a, &b).unwrap();
        ws.send_pdu(&b, &a).unwrap();
        assert_eq!(ws.events.len(), 2);
        assert_eq!(ws.events[0].last, "PC0");
        assert_eq!(ws.events[0].at, "PC1");
        assert_eq!(ws.events[1].last, "PC1");
        assert_eq!(ws.events[1].at, "PC0");
        for e in &ws.events {
            assert_eq!(e.path.len(), 3, "{:?}", e.path);
        }

        // Removing the gateway makes the same PDU unroutable.
        ws.set_config(&a, "192.168.1.10", "255.255.255.0", "", "")
            .unwrap();
        let err = ws.send_pdu(&a, &b).unwrap_err();
        assert!(err.contains("no route"), "{err}");
        assert!(err.contains("no default gateway"), "{err}");
        assert_eq!(ws.events.len(), 2);
    }

    #[test]
    fn cross_subnet_without_gateway_is_refused() {
        let mut ws = Workspace::new();
        ws.bus(2).unwrap();
        let pcs: Vec<String> = ws
            .devices
            .iter()
            .filter(|d| d.kind == "pc")
            .map(|d| d.id.clone())
            .collect();
        ws.set_ip(&pcs[1], "10.0.0.5", 24).unwrap();

        let err = ws.send_pdu(&pcs[0], &pcs[1]).unwrap_err();
        assert!(err.contains("no route to 10.0.0.5"), "{err}");
        assert!(err.contains("no default gateway"), "{err}");
        assert!(ws.events.is_empty());
    }

    #[test]
    fn ptw_round_trip_preserves_topology() {
        let mut ws = Workspace::new();
        ws.send_pdu("pc0", "pc1").unwrap();
        let text = ws.to_ptw();
        let back = Workspace::from_ptw(&text).unwrap();
        assert_eq!(back.devices.len(), ws.devices.len());
        assert_eq!(back.links.len(), ws.links.len());
        assert_eq!(back.devices[0].name, ws.devices[0].name);
        assert_eq!(back.links[0].b_port, ws.links[0].b_port);
    }

    #[test]
    fn power_off_drops_traffic_until_switched_back_on() {
        let mut ws = Workspace::new();
        assert!(ws.is_powered("pc1"));
        assert!(ws.set_power("pc1", false));
        assert!(!ws.is_powered("pc1"));
        let err = ws.send_pdu("pc0", "pc1").unwrap_err();
        assert!(err.contains("powered off"), "{err}");
        assert!(ws.events.is_empty());

        assert!(ws.set_power("pc1", true));
        ws.send_pdu("pc0", "pc1").unwrap();
        assert_eq!(ws.events.len(), 1);
    }

    #[test]
    fn module_slots_add_ports_and_refuse_removal_while_cabled() {
        let mut ws = Workspace::new();
        let before = ws
            .devices
            .iter()
            .find(|d| d.id == "router0")
            .unwrap()
            .ports
            .len();
        ws.set_module("router0", 0, "HWIC-2T").unwrap();
        let dev = ws.devices.iter().find(|d| d.id == "router0").unwrap();
        assert_eq!(dev.ports.len(), before + 2);
        assert!(dev.ports.iter().any(|p| p.name == "Serial0/3/0"));
        assert_eq!(ws.modules("router0")[0].as_deref(), Some("HWIC-2T"));

        // Unknown models, out-of-range slots and slot-less devices are refused.
        assert!(ws.set_module("router0", 0, "NOPE").is_err());
        assert!(ws.set_module("router0", 5, "").is_err());
        assert!(ws.set_module("pc0", 0, "").is_err());

        // Cable the module's own port: removal must then be refused.
        let r1 = ws.add("2911", 700.0, 100.0).unwrap();
        ws.links.push(Link {
            a: "router0".into(),
            a_port: "Serial0/3/0".into(),
            b: r1.clone(),
            b_port: "Serial0/0/0".into(),
            kind: "eSerial".into(),
        });
        let err = ws.set_module("router0", 0, "").unwrap_err();
        assert!(err.contains("cabled"), "{err}");

        ws.unlink("router0", &r1);
        ws.set_module("router0", 0, "").unwrap();
        assert_eq!(ws.modules("router0")[0], None);
    }

    #[test]
    fn dhcp_reservation_wins_over_pool_order() {
        let mut ws = Workspace::new();
        ws.set_dhcp_pool("server0", "192.168.2.0", 24, "192.168.2.1", "")
            .unwrap();
        ws.set_dhcp_reservation("server0", "pc2", "192.168.2.150")
            .unwrap();
        let lease = ws.acquire_dhcp("pc2").unwrap();
        assert_eq!(
            crate::model::ipv4_string(lease.ip),
            "192.168.2.150",
            "reservation beats the .100 walk"
        );
        assert!(ws.set_dhcp_reservation("nope", "pc2", "1.1.1.1").is_err());
        assert!(ws.set_dhcp_reservation("server0", "nope", "1.1.1.1").is_err());
        assert!(ws.set_dhcp_reservation("server0", "pc2", "bad").is_err());
    }

    #[test]
    fn dhcp_relay_reaches_a_server_on_another_subnet() {
        let mut ws = Workspace::new();
        // Server answers for the client's subnet but sits across Router0.
        ws.set_dhcp_pool("server0", "192.168.1.0", 24, "192.168.1.1", "")
            .unwrap();
        let err = ws.acquire_dhcp("pc0").unwrap_err();
        assert!(err.contains("no DHCP server"), "{err}");

        ws.set_dhcp_helper("router0", "GigabitEthernet0/0", "192.168.2.20")
            .unwrap();
        let lease = ws.acquire_dhcp("pc0").unwrap();
        assert_eq!(crate::model::ipv4_string(lease.ip), "192.168.1.100");
        assert_eq!(lease.server, "server0");

        let out = run_show_helper(&ws);
        assert!(out.contains("192.168.2.20"), "{out}");

        let mut ws2 = Workspace::new();
        ws2.set_dhcp_pool("server0", "192.168.1.0", 24, "192.168.1.1", "")
            .unwrap();
        ws2.set_dhcp_helper("router0", "GigabitEthernet0/0", "192.168.2.20")
            .unwrap();
        assert!(ws2.remove_dhcp_helper("router0", "GigabitEthernet0/0"));
        let err = ws2.acquire_dhcp("pc0").unwrap_err();
        assert!(err.contains("no DHCP server"), "{err}");
    }

    /// Small helper so the workspace test does not need a CLI session.
    fn run_show_helper(ws: &Workspace) -> String {
        match ws.dhcp_helpers.get("router0") {
            Some(list) => list
                .iter()
                .map(|(iface, ip)| format!("{} {iface}", crate::model::ipv4_string(*ip)))
                .collect::<Vec<_>>()
                .join("\n"),
            None => String::new(),
        }
    }

    #[test]
    fn ftp_ntp_syslog_and_aaa_work_and_persist() {
        let mut ws = Workspace::new();
        ws.ftp_put("server0", "a.txt", "hello").unwrap();
        assert_eq!(ws.ftp_list("server0"), vec!["a.txt"]);
        assert!(ws.ftp_put("server0", "../x", "y").is_err());
        ws.ftp_put("server0", "a.txt", "").unwrap();
        assert!(ws.ftp_list("server0").is_empty());

        assert_eq!(ws.ntp_sync("pc0", "192.168.2.20").unwrap(), 0.0);
        assert_eq!(ws.ntp_status("pc0").unwrap().0, "192.168.2.20");
        assert!(ws.ntp_sync("pc0", "192.168.2.99").is_err());

        ws.syslog_enable("pc0", true).unwrap();
        ws.send_pdu("pc0", "server0").unwrap();
        let entries = ws.syslog_list("pc0");
        assert_eq!(entries.len(), 1);
        assert!(entries[0].2.contains("PC0"), "{:?}", entries);

        ws.aaa_add_user("server0", "alice", "pw").unwrap();
        assert_eq!(ws.aaa_list("server0"), vec!["alice"]);
        assert!(ws.aaa_add_user("server0", "alice", "pw").is_err());
        assert!(ws.aaa_add_user("server0", "bob", "").is_err());

        ws.ftp_put("server0", "b.txt", "x").unwrap();
        let back = Workspace::from_ptw(&ws.to_ptw()).unwrap();
        assert_eq!(back.ftp_list("server0"), vec!["b.txt"]);
        assert_eq!(back.ntp_status("pc0").unwrap().0, "192.168.2.20");
        assert_eq!(back.syslog_list("pc0").len(), 1);
        assert_eq!(back.aaa_list("server0"), vec!["alice"]);
    }

    #[test]
    fn port_security_limits_macs_and_channel_groups_persist() {
        let mut ws = Workspace::new();
        ws.set_port_security("switch0", "fa0/3", 1).unwrap();
        assert!(ws.port_security_allowed("switch0", "FastEthernet0/3", "aa:bb"));
        assert!(ws.port_security_allowed("switch0", "FastEthernet0/3", "aa:bb"));
        assert!(!ws.port_security_allowed("switch0", "FastEthernet0/3", "cc:dd"));
        assert_eq!(ws.port_security_rows("switch0")[0].1, 1);
        assert_eq!(ws.port_security_rows("switch0")[0].2, 1);

        ws.set_channel_group("switch0", "fa0/2", 1).unwrap();
        ws.set_channel_group("switch0", "fa0/3", 1).unwrap();
        let groups = ws.channel_groups("switch0");
        assert_eq!(groups[0].0, 1);
        assert_eq!(groups[0].1.len(), 2);

        let back = Workspace::from_ptw(&ws.to_ptw()).unwrap();
        assert_eq!(back.port_security_rows("switch0")[0].2, 1);
        assert_eq!(back.channel_groups("switch0")[0].1.len(), 2);
    }

    #[test]
    fn acl_binding_denies_and_persists() {
        use crate::model::parse_ipv4;
        let mut ws = Workspace::new();
        ws.acl_add(
            "router0",
            10,
            false,
            parse_ipv4("192.168.1.0").unwrap(),
            parse_ipv4("0.0.0.255").unwrap(),
            None,
        )
        .unwrap();
        ws.acl_bind("router0", "g0/0", 10, true).unwrap();
        let err = ws.send_pdu("pc0", "server0").unwrap_err();
        assert!(err.contains("ACL denied"), "{err}");
        ws.acl_unbind("router0", "g0/0").unwrap();
        ws.send_pdu("pc0", "server0").unwrap();

        ws.acl_bind("router0", "g0/0", 10, true).unwrap();
        let mut back = Workspace::from_ptw(&ws.to_ptw()).unwrap();
        assert!(back
            .send_pdu("pc0", "server0")
            .unwrap_err()
            .contains("ACL denied"));
        assert!(back.acl_lines("router0")[0].contains("deny 192.168.1.0"));
    }

    #[test]
    fn nat_overload_translates_and_persists() {
        use crate::model::parse_ipv4;
        let mut ws = Workspace::new();
        ws.acl_add(
            "router0",
            10,
            true,
            parse_ipv4("192.168.1.0").unwrap(),
            parse_ipv4("0.0.0.255").unwrap(),
            None,
        )
        .unwrap();
        ws.set_nat_role("router0", "g0/0", true).unwrap();
        ws.set_nat_role("router0", "g0/1", false).unwrap();
        ws.add_nat_rule("router0", 10, "g0/1").unwrap();
        ws.send_pdu("pc0", "server0").unwrap();
        let rows = ws.nat_translation_lines("router0");
        assert_eq!(rows, vec!["192.168.1.10 -> 192.168.2.1"]);
        let note = ws
            .events
            .last()
            .unwrap()
            .hops
            .iter()
            .map(|h| h.note.clone())
            .collect::<Vec<_>>()
            .join("|");
        assert!(note.contains("NAT"), "{note}");

        let back = Workspace::from_ptw(&ws.to_ptw()).unwrap();
        assert_eq!(back.nat_binding_lines("router0").len(), 1);
        assert_eq!(back.nat_roles["router0"]["GigabitEthernet0/0"], true);
    }

    #[test]
    fn rip_propagates_remote_networks_and_persists() {
        use crate::model::parse_ipv4;
        let mut ws = Workspace::new();
        let r1 = ws.add("2911", 300.0, 400.0).unwrap();
        let r2 = ws.add("2911", 600.0, 400.0).unwrap();
        ws.link_kind(&r1, &r2, "eSerial").unwrap();
        ws.set_port_ip(&r1, "Serial0/0/0", "10.0.0.1", 30).unwrap();
        ws.set_port_ip(&r2, "Serial0/0/0", "10.0.0.2", 30).unwrap();
        ws.set_port_ip(&r2, "Serial0/1/0", "10.1.0.1", 24).unwrap();
        ws.set_routing_protocol(&r1, "rip").unwrap();
        ws.add_routing_network(&r1, parse_ipv4("10.0.0.0").unwrap(), 30).unwrap();
        ws.set_routing_protocol(&r2, "ospf").unwrap();
        ws.add_routing_network(&r2, parse_ipv4("10.1.0.0").unwrap(), 24).unwrap();
        assert!(
            ws.dyn_routes[&r1]
                .iter()
                .any(|(n, p, _, _, _)| *n == parse_ipv4("10.1.0.0").unwrap() && *p == 24),
            "{:?}",
            ws.dyn_routes
        );
        assert!(ws.show_routes(&r1).contains("R  10.1.0.0/24"));
        let back = Workspace::from_ptw(&ws.to_ptw()).unwrap();
        assert!(back.routing.contains_key(&r1));
        assert!(back
            .dyn_routes
            .get(&r1)
            .map(|l| !l.is_empty())
            .unwrap_or(false));
    }

    #[test]
    fn wireless_vpn_pppoe_and_phones_work_and_persist() {
        let mut ws = Workspace::new();
        let wlc = ws.add("WLC", 800.0, 100.0).unwrap();
        ws.wlan_add(&wlc, "LAB-WIFI", "supersecret").unwrap();
        assert_eq!(ws.wifi_scan().len(), 1);
        let err = ws.wifi_join("pc0", "LAB-WIFI", "wrongpass").unwrap_err();
        assert_eq!(err, "authentication failed");
        assert_eq!(ws.wifi_join("pc0", "LAB-WIFI", "supersecret").unwrap(), wlc);
        assert_eq!(ws.wifi_status("pc0").unwrap().0, "LAB-WIFI");

        ws.vpn_config("pc0", "192.168.2.20", "vpnuser").unwrap();
        assert_eq!(ws.vpn_status("pc0").unwrap().1, "vpnuser");
        ws.pppoe_config("pc0", "192.168.2.20", "dsluser").unwrap();
        assert!(ws.pppoe_status("pc0").is_some());
        ws.phone_register("pc0", "192.168.2.20", 1001).unwrap();
        assert_eq!(ws.phone_status("pc0").unwrap().1, 1001);

        let back = Workspace::from_ptw(&ws.to_ptw()).unwrap();
        assert_eq!(back.wlan_list(&wlc).len(), 1);
        assert_eq!(back.wifi_status("pc0").unwrap().0, "LAB-WIFI");
        assert!(back.vpn_status("pc0").is_some());
        assert!(back.pppoe_status("pc0").is_some());
        assert_eq!(back.phone_status("pc0").unwrap().1, 1001);
    }

    #[test]
    fn slaac_derives_an_address_from_the_router_prefix() {
        let mut ws = Workspace::new();
        ws.set_ipv6("router0", false, "2001:db8:1::1", 64, "", "").unwrap();
        ws.set_ipv6("pc0", true, "", 64, "", "").unwrap();
        let pc = ws.devices.iter().find(|d| d.id == "pc0").unwrap();
        let addr = pc.ipv6.clone().unwrap();
        assert!(addr.starts_with("2001:db8:1::"), "{addr}");
        assert_eq!(pc.ipv6_gateway.as_deref(), Some("2001:db8:1::1"));
        assert!(pc.ipv6_auto);
        assert!(ws.slaac("server0").is_ok());
    }

    #[test]
    fn wireless_enterprise_roaming_and_capwap() {
        let mut ws = Workspace::new();
        let wlc1 = ws.add("WLC", 800.0, 100.0).unwrap();
        let wlc2 = ws.add("WLC", 900.0, 100.0).unwrap();
        let ap = ws.add("Access Point", 850.0, 200.0).unwrap();
        ws.wlan_add(&wlc1, "LAB-WIFI", "supersecret").unwrap();
        ws.wlan_add(&wlc2, "LAB-WIFI", "supersecret").unwrap();
        ws.wlan_add_with(&wlc1, "CORP", "", "WPA2-Enterprise".into())
            .unwrap();
        ws.aaa_add_user("server0", "alice", "pw1234").unwrap();

        ws.capwap_join(&ap, &wlc1).unwrap();
        assert_eq!(ws.capwap_status(&ap).as_deref(), Some(wlc1.as_str()));
        assert!(ws.capwap_join("pc0", &wlc1).is_err());

        let first = ws.wifi_join("pc0", "LAB-WIFI", "supersecret").unwrap();
        assert!(first == wlc1 || first == wlc2, "{first}");
        ws.wifi_roam("pc0", &wlc2).unwrap();
        assert_eq!(ws.wifi_status("pc0").unwrap().1, wlc2);

        let err = ws.wifi_join_auth("pc0", "CORP", "wrong", "alice").unwrap_err();
        assert_eq!(err, "authentication failed");
        assert!(ws.wifi_join_auth("pc0", "CORP", "pw1234", "alice").is_ok());

        let back = Workspace::from_ptw(&ws.to_ptw()).unwrap();
        assert_eq!(back.wlan_list(&wlc1).len(), 2);
        assert_eq!(back.wifi_status("pc0").unwrap().0, "CORP");
        assert_eq!(back.capwap_status(&ap).as_deref(), Some(wlc1.as_str()));
    }

    #[test]
    fn industrial_protocols_and_cell_tower_work() {
        let mut ws = Workspace::new();
        let plc = ws.add("PLC", 100.0, 500.0).unwrap();
        let ioe = ws.add("IoE", 300.0, 500.0).unwrap();
        let tower = ws.add("Cell Tower", 600.0, 500.0).unwrap();
        let phone = ws.add("PDA", 700.0, 500.0).unwrap();
        ws.link_kind(&plc, &ioe, "eIoT").unwrap();

        assert_eq!(ws.iot_write(&plc, 5, 42).unwrap(), 0);
        assert_eq!(ws.iot_read(&plc, 5).unwrap(), 42);
        assert!(ws.iot_write(&plc, 300, 1).is_err());

        ws.prp_enable(&plc, true).unwrap();
        ws.prp_enable(&ioe, true).unwrap();
        assert_eq!(ws.send_iot(&plc, &ioe, "prp", 7).unwrap(), "PRP delivered");
        let dup = ws.send_iot(&plc, &ioe, "prp", 7).unwrap();
        assert!(dup.contains("duplicate seq 7"), "{dup}");

        assert_eq!(ws.ptp_sync(&plc, &ioe).unwrap(), 0.0);
        assert_eq!(ws.ptp_status(&ioe).unwrap().0, plc);

        ws.cell_join(&phone, &tower).unwrap();
        assert_eq!(ws.cell_status(&phone).as_deref(), Some(tower.as_str()));
        let err = ws.send_iot(&phone, &plc, "cellular", 0).unwrap_err();
        assert!(err.contains("same cell tower"), "{err}");

        let mut back = Workspace::from_ptw(&ws.to_ptw()).unwrap();
        assert_eq!(back.iot_read(&plc, 5).unwrap(), 42);
        assert!(back.prp_on.contains(&plc));
        assert_eq!(back.ptp_status(&ioe).unwrap().0, plc);
        assert_eq!(back.cell_status(&phone).as_deref(), Some(tower.as_str()));
    }

    #[test]
    fn dhcpv6_ips_and_inspection_are_real_state() {
        let mut ws = Workspace::new();
        ws.set_ipv6("server0", false, "2001:db8:5::1", 64, "", "").unwrap();
        let addr = ws.dhcpv6("pc0", "server0").unwrap();
        assert!(addr.starts_with("2001:db8:5::"), "{addr}");
        let pc = ws.devices.iter().find(|d| d.id == "pc0").unwrap();
        assert_eq!(pc.ipv6_gateway.as_deref(), Some("2001:db8:5::1"));
        assert!(!pc.ipv6_auto);
        assert!(ws.dhcpv6("pc0", "pc1").is_err());

        ws.set_ips("router0", "icmp", true).unwrap();
        assert!(ws.ips_drops("router0", "icmp"));
        let err = ws.send_pdu("pc0", "server0").unwrap_err();
        assert!(err.contains("IPS dropped icmp"), "{err}");
        ws.set_ips("router0", "icmp", false).unwrap();
        ws.send_pdu("pc0", "server0").unwrap();

        ws.set_inspection("router0", true).unwrap();
        assert!(ws.inspection_on("router0"));

        let back = Workspace::from_ptw(&ws.to_ptw()).unwrap();
        assert_eq!(back.devices.iter().find(|d| d.id == "pc0").unwrap().ipv6.as_deref(), Some(addr.as_str()));
        assert!(back.inspection_on("router0"));
        assert!(!back.ips_drops("router0", "icmp"));
    }

    #[test]
    fn ospfv3_stores_ipv6_prefixes_and_shows_them() {
        let mut ws = Workspace::new();
        ws.set_routing_protocol("router0", "ospfv3").unwrap();
        ws.add_v6_network("router0", "2001:db8:9::/64").unwrap();
        ws.add_v6_network("router0", "10.0.0.0/8").unwrap_err();
        ws.set_ipv6("router0", false, "2001:db8:9::1", 64, "", "").unwrap();
        let out = ws.show_ipv6_routes("router0");
        assert!(out.contains("O  2001:db8:9::/64"), "{out}");
        assert!(out.contains("2001:db8:9::1/64"), "{out}");
        let back = Workspace::from_ptw(&ws.to_ptw()).unwrap();
        assert!(back.show_ipv6_routes("router0").contains("2001:db8:9::/64"));
    }

    #[test]
    fn vlan_membership_controls_switching() {
        let mut ws = Workspace::new();
        ws.vlan_create("switch0", 20, "SALES").unwrap();
        // PC1 sits on Fa0/3: moving it to VLAN 20 breaks the default-VLAN path.
        ws.set_access_vlan("switch0", "FastEthernet0/3", 20).unwrap();
        let err = ws.send_pdu("pc0", "pc1").unwrap_err();
        assert!(err.contains("VLAN mismatch"), "{err}");
        ws.set_access_vlan("switch0", "FastEthernet0/2", 20).unwrap();
        ws.send_pdu("pc0", "pc1").unwrap();
        assert_eq!(ws.events.len(), 1);
        assert!(ws.vlan_delete("switch0", 20).is_err(), "still in use");
        assert!(ws.vlan_delete("switch0", 1).is_err(), "default VLAN");
        assert!(ws.vlan_create("switch0", 0, "").is_err());
    }

    #[test]
    fn spanning_tree_blocks_a_redundant_link() {
        let mut ws = Workspace::new();
        let s2 = ws.add("2960", 700.0, 300.0).unwrap();
        ws.link("switch0", "switch1").unwrap();
        ws.link("switch1", &s2).unwrap();
        ws.link("switch0", &s2).unwrap();
        let blocked = ws.stp_blocked_ports();
        assert_eq!(blocked.len(), 2, "one blocked link = both ends: {blocked:?}");
        // Traffic still flows over the tree.
        ws.send_pdu("pc0", "pc2").unwrap();
        assert_eq!(ws.events.len(), 1);
    }

    #[test]
    fn mailboxes_accept_and_list_messages() {
        let mut ws = Workspace::new();
        ws.add_mail_user("server0", "alice", "pw").unwrap();
        ws.add_mail_user("server0", "bob", "pw2").unwrap();
        assert!(ws.add_mail_user("server0", "alice", "x").is_err());
        assert!(ws.add_mail_user("nope", "a", "b").is_err());
        assert!(ws.add_mail_user("server0", "", "x").is_err());

        ws.send_mail("pc0", "server0", "alice", "bob", "hi", "body")
            .unwrap();
        let inbox = ws.mail_list("server0", "bob");
        assert_eq!(inbox.len(), 1);
        assert_eq!(inbox[0].subject, "hi");
        assert!(ws.mail_list("server0", "alice").is_empty());
        assert!(ws
            .send_mail("pc0", "server0", "alice", "carol", "x", "y")
            .is_err());
        assert!(ws.events.iter().any(|e| e.proto == "SMTP"));
    }

    #[test]
    fn tftp_files_can_be_put_listed_and_removed() {
        let mut ws = Workspace::new();
        ws.tftp_put("server0", "config.txt", "hello").unwrap();
        assert_eq!(ws.tftp_list("server0"), vec!["config.txt"]);
        assert_eq!(
            ws.tftp_get("server0", "config.txt").as_deref(),
            Some("hello")
        );
        ws.tftp_put("server0", "config.txt", "").unwrap();
        assert!(ws.tftp_list("server0").is_empty());
        assert!(ws.tftp_put("server0", "a/b", "x").is_err());
        assert!(ws.tftp_put("server0", "missing", "").is_err());
    }

    #[test]
    fn dns_resolves_names_on_the_local_segment() {
        let mut ws = Workspace::new();
        ws.set_dns_record("server0", "Web.LAB", "192.168.2.20").unwrap();
        let ip = crate::model::parse_ipv4("192.168.2.20").unwrap();
        assert_eq!(ws.resolve_name("pc2", "web.lab"), Some(ip));
        assert_eq!(ws.resolve_name("pc0", "web.lab"), None, "routers stop the query");
        assert!(ws.remove_dns_record("server0", "web.lab"));
        assert!(!ws.remove_dns_record("server0", "web.lab"));
        assert!(ws.set_dns_record("server0", "bad name", "1.1.1.1").is_err());
        assert!(ws.set_dns_record("server0", "x", "999.1.1.1").is_err());
    }

    #[test]
    fn ptw_round_trip_covers_every_edited_field() {
        let mut ws = Workspace::new();
        ws.set_config("pc0", "192.168.1.10", "255.255.255.0", "192.168.1.1", "8.8.8.8")
            .unwrap();
        ws.set_ipv6("pc0", false, "2001:db8::1", 64, "2001:db8::ff", "2001:db8::53")
            .unwrap();
        ws.set_dot1x("pc0", true, "student", "s3cret").unwrap();
        ws.set_port_up("router0", "GigabitEthernet0/0", false);
        ws.add_route("router0", "10.0.0.0", "255.0.0.0", "192.168.1.254")
            .unwrap();
        ws.set_dhcp_pool("server0", "192.168.2.0", 24, "192.168.2.1", "8.8.8.8")
            .unwrap();
        ws.acquire_dhcp("pc2").unwrap();
        ws.banners
            .insert("router0".into(), "authorised\naccess only".into());
        ws.line_passwords.insert("router0".into(), "cisco".into());
        ws.set_power("pc0", false);
        ws.set_module("router0", 0, "HWIC-2T").unwrap();
        ws.set_dns_record("server0", "web.lab", "192.168.2.20").unwrap();
        assert!(ws.set_http_page("server0", "custom page\nsecond line"));
        ws.set_dhcp_reservation("server0", "pc2", "192.168.2.150").unwrap();
        ws.set_dhcp_helper("router0", "GigabitEthernet0/0", "192.168.2.20").unwrap();
        ws.vlan_create("switch0", 20, "SALES").unwrap();
        ws.set_access_vlan("switch0", "FastEthernet0/3", 20).unwrap();
        ws.set_trunk("switch0", "FastEthernet0/1", true).unwrap();
        ws.add_mail_user("server0", "alice", "pw").unwrap();
        ws.add_mail_user("server0", "bob", "pw2").unwrap();
        ws.send_mail("pc0", "server0", "alice", "bob", "subject", "body\ntext")
            .unwrap();
        ws.tftp_put("server0", "config.txt", "hostname x").unwrap();
        ws.link_kind("pc0", "router0", "eConsole").unwrap();

        let text = ws.to_ptw();
        let back = Workspace::from_ptw(&text).expect("reload");
        assert_eq!(back.to_ptw(), text, "save/load is idempotent");

        let pc0 = back.devices.iter().find(|d| d.id == "pc0").unwrap();
        assert_eq!(
            pc0.gateway,
            Some(crate::model::parse_ipv4("192.168.1.1").unwrap())
        );
        assert_eq!(pc0.dns, Some(crate::model::parse_ipv4("8.8.8.8").unwrap()));
        assert_eq!(pc0.ipv6.as_deref(), Some("2001:db8::1"));
        assert_eq!(pc0.ipv6_prefix, 64);
        assert!(pc0.dot1x);
        assert_eq!(pc0.dot1x_user.as_deref(), Some("student"));
        assert_eq!(pc0.dot1x_pass.as_deref(), Some("s3cret"));

        let r0 = back.devices.iter().find(|d| d.id == "router0").unwrap();
        assert_eq!(r0.routes.len(), 1);
        assert!(
            !r0.ports
                .iter()
                .find(|p| p.name == "GigabitEthernet0/0")
                .unwrap()
                .up
        );
        assert!(back.dhcp_pools.contains_key("server0"));
        assert!(back.dhcp_clients.contains("pc2"));
        assert!(!back.is_powered("pc0"), "power switch restored");
        assert_eq!(back.modules("router0")[0].as_deref(), Some("HWIC-2T"));
        let sw = back.devices.iter().find(|d| d.id == "switch0").unwrap();
        assert_eq!(
            sw.ports
                .iter()
                .find(|p| p.name == "FastEthernet0/3")
                .unwrap()
                .vlan,
            20
        );
        assert!(
            sw.ports
                .iter()
                .find(|p| p.name == "FastEthernet0/1")
                .unwrap()
                .trunk
        );
        assert_eq!(back.vlan_name("switch0", 20), "SALES");
        let inbox = back.mail_list("server0", "bob");
        assert_eq!(inbox.len(), 1);
        assert_eq!(inbox[0].body, "body\ntext");
        assert_eq!(back.tftp_list("server0"), vec!["config.txt"]);
        assert_eq!(
            back.tftp_get("server0", "config.txt").as_deref(),
            Some("hostname x")
        );
        assert_eq!(
            back.resolve_name("pc2", "web.lab"),
            Some(crate::model::parse_ipv4("192.168.2.20").unwrap())
        );
        assert_eq!(
            back.http_pages.get("server0").map(String::as_str),
            Some("custom page\nsecond line")
        );
        assert_eq!(
            back.dhcp_reservations
                .get("server0")
                .and_then(|l| l.iter().find(|(c, _)| c == "pc2"))
                .map(|(_, ip)| *ip),
            Some(crate::model::parse_ipv4("192.168.2.150").unwrap())
        );
        assert_eq!(
            back.dhcp_helpers
                .get("router0")
                .and_then(|l| l.first())
                .map(|(i, ip)| (i.as_str(), *ip)),
            Some((
                "GigabitEthernet0/0",
                crate::model::parse_ipv4("192.168.2.20").unwrap()
            ))
        );
        assert_eq!(
            back.banners.get("router0").unwrap(),
            "authorised\naccess only"
        );
        assert_eq!(back.line_passwords.get("router0").unwrap(), "cisco");
        assert!(back
            .links
            .iter()
            .any(|l| l.kind == "eConsole" && l.a_port == "RS-232"));
    }

    #[test]
    fn mesh_links_every_pair_once_and_is_idempotent() {
        let mut ws = Workspace::new();
        let a = ws.add("PC-PT", 100.0, 100.0).unwrap();
        let b = ws.add("Laptop", 200.0, 100.0).unwrap();
        let c = ws.add("Server", 300.0, 100.0).unwrap();
        let ids = vec![a.clone(), b.clone(), c.clone(), c.clone()];

        assert_eq!(ws.mesh(&ids).unwrap(), 3);
        for (x, y) in [(&a, &b), (&a, &c), (&b, &c)] {
            assert!(
                ws.links
                    .iter()
                    .any(|l| (&l.a == x && &l.b == y) || (&l.a == y && &l.b == x)),
                "missing {x}-{y}"
            );
        }
        assert_eq!(ws.mesh(&ids).unwrap(), 0, "second mesh added links");
        assert_eq!(
            ws.links
                .iter()
                .filter(|l| [&a, &b, &c].iter().any(|d| l.a == **d || l.b == **d))
                .count(),
            3
        );
    }

    #[test]
    fn mesh_of_four_devices_creates_six_links() {
        let mut ws = Workspace::new();
        let mut ids = Vec::new();
        for i in 0..4 {
            ids.push(ws.add("PC-PT", 100.0 + 40.0 * i as f32, 100.0).unwrap());
        }
        let before = ws.links.len();
        assert_eq!(ws.mesh(&ids).unwrap(), 6);
        assert_eq!(ws.links.len(), before + 6);
        assert_eq!(ws.mesh(&ids).unwrap(), 0);
    }

    #[test]
    fn mesh_rejects_fewer_than_two_known_devices() {
        let mut ws = Workspace::new();
        assert!(ws.mesh(&[]).is_err());
        assert!(ws.mesh(&["pc0".to_string()]).is_err());
        assert!(ws.mesh(&["pc0".to_string(), "ghost".to_string()]).is_err());
        assert!(ws.mesh(&["ghost".to_string(), "phantom".to_string()]).is_err());
        // A failed mesh must not have touched the topology.
        assert_eq!(ws.links.len(), 6);
    }

    #[test]
    fn mesh_skips_pairs_that_are_already_linked() {
        let mut ws = Workspace::new();
        let pc = ws.add("PC-PT", 700.0, 450.0).unwrap();
        ws.link(&pc, "switch0").unwrap();
        assert_eq!(ws.mesh(&[pc.clone(), "switch0".to_string()]).unwrap(), 0);
        assert_eq!(ws.mesh(&[pc.clone(), "switch0".to_string()]).unwrap(), 0);
    }

    #[test]
    fn catalog_icons_exist_in_extracted_tree() {
        let art = std::path::Path::new(env!("CARGO_MANIFEST_DIR"))
            .join("intake/20261101-102334/appimage/opt/pt/art");
        if !art.is_dir() {
            return; // extracted asset tree absent: nothing to verify against
        }
        for (label, tile, kind) in CATALOG {
            let p = art.join("ComponentBox").join(tile);
            assert!(p.is_file(), "{label}: missing tile {}", p.display());
            let icon = logical_icon(kind);
            if let Some(name) = icon.strip_prefix("/art/") {
                let p = std::path::Path::new(env!("CARGO_MANIFEST_DIR"))
                    .join("web/art")
                    .join(name);
                assert!(p.is_file(), "{label}: missing own icon {}", p.display());
            } else {
                let rel = icon.strip_prefix("art/").unwrap_or(icon);
                let p = art.join(rel);
                assert!(p.is_file(), "{label}: missing icon {}", p.display());
            }
        }
    }

    #[test]
    fn palette_and_canvas_share_the_asset_tree_with_svg_fallback() {
        let ws = Workspace::new();
        let json = ws.json();
        for (label, tile, kind) in CATALOG {
            let _ = tile;
            let icon = logical_icon(kind);
            let art = logical_art(kind);
            let needle = format!("\"label\":\"{label}\",\"icon\":\"{icon}\",\"art\":\"{art}\"");
            assert!(json.contains(&needle), "{label}: palette entry mismatch");
        }
        for d in &ws.devices {
            let needle = format!("\"icon\":\"{}\",\"art\":\"{}\"", d.icon, logical_art(&d.kind));
            assert!(json.contains(&needle), "{}: device icon mismatch", d.name);
        }
    }

    #[test]
    fn every_catalog_kind_is_named_and_drawn() {
        // `pc` deliberately shares the generic workstation artwork.
        let fallback = logical_icon("__unknown_kind__");
        for (label, _, kind) in CATALOG {
            assert_ne!(name_prefix(kind), "Device", "{label} lacks a name prefix");
            if *kind != "pc" {
                assert_ne!(logical_icon(kind), fallback, "{label} falls back to the generic icon");
            }
        }
    }
}
