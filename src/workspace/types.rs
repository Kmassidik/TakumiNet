use super::*;

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
    /// Interface bandwidth in Kbit/s, used by OSPF and EIGRP.
    pub bandwidth_kbps: u32,
    /// Interface delay in microseconds, used by EIGRP.
    pub delay_us: u32,
    /// Access VLAN (1 = default) on a switch port.
    pub vlan: u16,
    /// 802.1Q trunk: carries every VLAN, tagged.
    pub trunk: bool,
    /// Router subinterface's 802.1Q VLAN; physical interfaces use `None`.
    pub dot1q: Option<u16>,
}

/// State a live network keeps between deliveries: switch MAC learning and ARP
/// caches. Both age on the simulated clock.
#[derive(Clone, Default)]
pub struct Tables {
    pub(super) macs: HashMap<String, crate::net::packet::MacTable>,
    pub(super) arps: HashMap<String, crate::net::packet::ArpTable>,
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
    /// Configured static routes, including their administrative distances.
    pub routes: Vec<StaticRoute>,
    /// 802.1X block from the same dialog.
    pub dot1x: bool,
    pub dot1x_user: Option<String>,
    pub dot1x_pass: Option<String>,
}

#[derive(Clone, Default)]
pub struct SwitchingConfig {
    pub vlans: Vec<(u16, String)>,
    pub channels: HashMap<String, u16>,
    pub channel_modes: HashMap<String, String>,
    pub stp_mode: Option<String>,
    pub stp_priorities: HashMap<u16, u16>,
}

#[derive(Clone)]
pub struct StartupConfig {
    pub device: Device,
    pub banner: Option<String>,
    pub line_password: Option<String>,
    pub routing: Option<RoutingConfig>,
    pub switching: SwitchingConfig,
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

/// One decoded layer in a captured frame or an explicit service-plane exchange.
#[derive(Clone, Debug)]
pub struct Layer {
    pub name: String,
    pub fields: Vec<(String, String)>,
}

impl Layer {
    pub fn new(name: impl Into<String>, fields: Vec<(String, String)>) -> Self {
        Self { name: name.into(), fields }
    }
}

/// One captured simulation event (a PDU delivered or dropped along a path).
#[derive(Clone)]
pub struct Event {
    pub id: u32,
    pub time: f32,
    pub last: String,
    pub at: String,
    pub kind: String,
    pub proto: String,
    pub path: Vec<String>,
    /// Per-device detail: ingress/egress ports, decoded layers and decision.
    pub hops: Vec<crate::net::fwd::Hop>,
    /// Service-plane detail for exchanges which have no frame-level capture.
    pub layers: Vec<Layer>,
    pub status: String,
    pub reason: Option<String>,
    /// Plain-English summary of the decisions made along the captured path.
    pub note: String,
    /// Final Ethernet frame exactly as it appeared on the wire.
    pub bytes: Vec<u8>,
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

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum ProblemSeverity {
    Error,
    Warning,
}

#[derive(Clone, Debug, PartialEq, Eq)]
pub struct Problem {
    pub line: usize,
    pub element: String,
    pub attribute: String,
    pub message: String,
    pub severity: ProblemSeverity,
    pub recoverable: bool,
}

impl Problem {
    pub(crate) fn error(line: usize, element: &str, attribute: &str, message: impl Into<String>) -> Self {
        Self { line, element: element.into(), attribute: attribute.into(), message: message.into(), severity: ProblemSeverity::Error, recoverable: true }
    }

    pub(crate) fn fatal(line: usize, element: &str, attribute: &str, message: impl Into<String>) -> Self {
        Self { line, element: element.into(), attribute: attribute.into(), message: message.into(), severity: ProblemSeverity::Error, recoverable: false }
    }

    pub(crate) fn warning(line: usize, element: &str, attribute: &str, message: impl Into<String>) -> Self {
        Self { line, element: element.into(), attribute: attribute.into(), message: message.into(), severity: ProblemSeverity::Warning, recoverable: false }
    }
}

impl std::fmt::Display for Problem {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "line {}: <{}> attribute '{}': {}", self.line, self.element, self.attribute, self.message)
    }
}

#[derive(Clone, Debug)]
pub(super) struct RecordExtras {
    pub element: String,
    pub key: Vec<(String, String)>,
    pub attributes: Vec<(String, String)>,
}

#[derive(Clone, Debug, PartialEq, Eq)]
pub struct Lesson {
    pub id: String,
    pub title: String,
    pub level: u8,
    pub minutes: u16,
    pub goal: String,
    pub steps: Vec<LessonStep>,
    pub checks: Vec<Check>,
}

#[derive(Clone, Debug, PartialEq, Eq)]
pub struct LessonStep {
    pub n: u16,
    pub text: String,
    /// Id of the check that proves this step; empty means the user ticks it by hand.
    pub check: String,
}

#[derive(Clone, Debug, PartialEq, Eq)]
pub struct Check {
    pub id: String,
    pub kind: String,
    pub from: String,
    pub to: String,
    pub url: String,
    pub expect: String,
    pub label: String,
}

#[derive(Clone, Debug, PartialEq, Eq)]
pub struct CheckResult {
    pub id: String,
    pub label: String,
    pub passed: bool,
    pub actual: String,
    pub hint: String,
}

/// A text note placed on the canvas. Notes are for learners and never affect the network. Notes are for learners and never affect the network.
#[derive(Clone, Debug, PartialEq)]
pub struct Note {
    pub id: String,
    pub x: f32,
    pub y: f32,
    pub color: String,
    pub text: String,
}

/// Traffic a template sends when the user presses Play on a quiet workspace.
/// `kind` is `ping` (from and to are device ids) or `http` (from is the client, url the page).
#[derive(Clone, Debug, PartialEq)]
pub struct Demo {
    pub kind: String,
    pub from: String,
    pub to: String,
    pub url: String,
}

#[derive(Clone)]
pub struct Workspace {
    pub devices: Vec<Device>,
    pub notes: Vec<Note>,
    pub demo: Vec<Demo>,
    pub links: Vec<Link>,
    pub lesson: Option<Lesson>,
    pub(super) counters: HashMap<String, u32>,
    pub events: Vec<Event>,
    pub(super) next_event: u32,
    pub sim_time: f32,
    /// MAC and ARP state learned by the running simulation.
    pub tables: Tables,
    /// DHCP pools configured on servers, by device id.
    pub dhcp_pools: HashMap<String, Pool>,
    /// Port forwards on a home router: (outside port, inside device, inside port).
    pub port_forwards: HashMap<String, Vec<(u16, String, u16)>>,
    /// What each home pulls, in Mbit/s, for the queue model.
    pub demands: HashMap<String, u32>,
    /// Per-customer limits on a gateway, by login name.
    pub queues: HashMap<String, Vec<(String, u32)>>,
    /// Whole-group limit per gateway.
    pub queue_parent: HashMap<String, u32>,
    /// Hotspot vouchers per gateway.
    pub vouchers: HashMap<String, Vec<Voucher>>,
    /// Shared gateway addresses: address -> (member device, priority).
    pub shared_gateways: HashMap<u32, Vec<(String, u8)>>,
    /// Further pools on the same server, one per extra network.
    pub dhcp_more: HashMap<String, Vec<Pool>>,
    /// Addresses already handed out, by server id.
    pub dhcp_leases: HashMap<String, Vec<u32>>,
    /// Devices whose address came from DHCP rather than static config.
    pub dhcp_clients: std::collections::HashSet<String>,
    /// Per-device configurations written by `write memory`; `reload` restores them.
    pub startup: Option<HashMap<String, StartupConfig>>,
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
    /// EtherChannel membership and negotiation mode per switch/interface.
    pub channels: HashMap<String, HashMap<String, u16>>,
    pub channel_modes: HashMap<String, HashMap<String, String>>,
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
    /// Dynamic routing configuration, scoped by protocol process or AS.
    pub routing: HashMap<String, RoutingConfig>,
    /// Recomputed protocol routes. Derived LSDB/path state is never persisted.
    pub dyn_routes: HashMap<String, Vec<InstalledRoute>>,
    /// Spanning-tree mode and configured priority per switch/VLAN.
    pub stp_modes: HashMap<String, String>,
    pub stp_priorities: HashMap<String, HashMap<u16, u16>>,
    /// WLANs per wireless LAN controller: (SSID, PSK).
    pub wlans: HashMap<String, Vec<Wlan>>,
    /// Guest networks as (controller, name): their clients may only talk to the controller.
    pub wlan_guest: std::collections::HashSet<(String, String)>,
    /// Wireless association: client -> (SSID, controller id).
    pub wifi: HashMap<String, (String, String)>,
    /// VPN client config: device -> (server address, user).
    pub vpn: HashMap<String, (String, String)>,
    /// Site-to-site tunnels: device -> (peer address, shared key).
    pub tunnels: HashMap<String, (u32, String)>,
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
    /// Elements outside the native record schema, retained verbatim on save.
    pub(super) unknown_elements: Vec<crate::storage::xml::Element>,
    /// Unknown attributes on known records, keyed by their stable record ids.
    pub(super) record_extras: Vec<RecordExtras>,
    /// Warnings from a valid load, or dropped-record reports from open-anyway.
    pub load_problems: Vec<Problem>,
}

#[derive(Clone, Debug, PartialEq, Eq)]
pub struct Voucher {
    pub code: String,
    pub minutes: u32,
    pub used_by: Option<String>,
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
