#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub struct StaticRoute {
    pub network: u32,
    pub prefix: u8,
    pub next_hop: u32,
    pub admin_distance: u8,
}

#[derive(Clone, Debug, PartialEq, Eq)]
pub enum RoutingProtocol {
    RipV2,
    Ospf { process_id: u32 },
    Eigrp { as_number: u32 },
    Ospfv3 { process_id: u32 },
}

impl Default for RoutingProtocol {
    fn default() -> Self {
        Self::RipV2
    }
}

#[derive(Clone, Copy, Debug, Default, PartialEq, Eq)]
pub struct NetworkStatement {
    pub network: u32,
    pub prefix: u8,
    pub area: u32,
}

#[derive(Clone, Debug, Default, PartialEq, Eq)]
pub struct RoutingConfig {
    pub protocol: RoutingProtocol,
    pub networks: Vec<NetworkStatement>,
}

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum RouteSource {
    Connected,
    Static,
    Rip,
    Ospf,
    OspfInterArea,
    Eigrp,
}

impl RouteSource {
    pub fn admin_distance(self) -> u8 {
        match self {
            Self::Connected => 0,
            Self::Static => 1,
            Self::Eigrp => 90,
            Self::Ospf | Self::OspfInterArea => 110,
            Self::Rip => 120,
        }
    }

    pub fn code(self) -> &'static str {
        match self {
            Self::Connected => "C",
            Self::Static => "S",
            Self::Rip => "R",
            Self::Ospf => "O",
            Self::OspfInterArea => "O IA",
            Self::Eigrp => "D",
        }
    }
}

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub struct InstalledRoute {
    pub network: u32,
    pub prefix: u8,
    pub next_hop: u32,
    pub source: RouteSource,
    pub metric: u64,
}

/// A route selected by the common RIB rules. `next_hop == None` is connected.
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct RouteCandidate {
    pub network: u32,
    pub prefix: u8,
    pub next_hop: Option<u32>,
    pub source: RouteSource,
    pub admin_distance: u8,
    pub metric: u64,
    pub interface: Option<String>,
    pub dot1q: Option<u16>,
}
