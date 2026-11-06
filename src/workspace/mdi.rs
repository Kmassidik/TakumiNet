//! Ethernet pair roles for copper cables.
//!
//! A port is MDI (a host or router) or MDI-X (a switch or hub). Two ports of
//! the same role need a crossover cable; opposite roles need straight-through.
//! Auto-MDI-X removes the rule: the port swaps its pairs and accepts either.
//! This model treats every modern port as auto and a hub as a fixed MDI-X port.

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum MdiRole {
    Mdi,
    Mdix,
}

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub struct MdiPort {
    pub role: MdiRole,
    pub auto: bool,
}

/// Pair role and auto-negotiation for a device kind. `hub` is deliberately the
/// one fixed model, so the old hub-to-hub crossover rule stays observable.
pub fn mdi_port(kind: &str) -> MdiPort {
    if kind == "hub" {
        return MdiPort { role: MdiRole::Mdix, auto: false };
    }
    let mdi = matches!(
        kind,
        "pc" | "laptop" | "server" | "printer" | "tv" | "phone" | "tablet" | "pda"
            | "sniffer" | "plc" | "thing" | "ioe" | "analogphone"
    );
    MdiPort {
        role: if mdi { MdiRole::Mdi } else { MdiRole::Mdix },
        auto: true,
    }
}

/// Why a copper cable would not carry a link between these kinds, if it would
/// not. `None` when both ends can pair their wires or one side auto-detects.
pub fn pairing_problem(a: &str, b: &str, cable: &str) -> Option<String> {
    if !matches!(cable, "eCopper" | "eCross") {
        return None;
    }
    let (pa, pb) = (mdi_port(a), mdi_port(b));
    if pa.auto || pb.auto {
        return None;
    }
    let same = pa.role == pb.role;
    let crossover = cable == "eCross";
    if same && !crossover {
        return Some("two fixed MDI-X ports need a crossover cable".into());
    }
    if !same && crossover {
        return Some("a fixed MDI and MDI-X pair needs a straight-through cable".into());
    }
    None
}
