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

mod aaa;
mod acl;
mod addressing;
mod apps;
mod dhcp;
mod dns;
mod hardware;
mod iot;
mod ipv6;
mod links;
mod nat;
mod pkt_import;
mod ptw;
mod routing;
mod security;
mod startup;
mod switching;
mod traffic;
mod wan;
mod wireless;
#[cfg(test)]
mod tests;

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
