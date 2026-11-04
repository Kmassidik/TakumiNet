//! Realtime mode: the clock moves, learned state ages out, and the configured
//! control planes emit their periodic chatter (OSPF hellos, STP BPDUs).

use super::*;

/// The capture never holds more than this many events; the oldest fall off.
pub(super) const EVENT_CAP: usize = 1000;

struct Hello {
    router: String,
    neighbor: String,
    outgoing: String,
}

struct Announcement {
    root: String,
    switch: String,
}

impl Workspace {
    /// Every capture entry goes through here so the buffer stays bounded.
    /// Ids are never reused: dropping the oldest events renumbers nothing.
    pub(super) fn push_event(&mut self, event: Event) {
        self.events.push(event);
        if self.events.len() > EVENT_CAP {
            let extra = self.events.len() - EVENT_CAP;
            self.events.drain(..extra);
        }
    }

    /// Advance the simulated clock by `seconds`. MAC tables and ARP caches age
    /// against the new time, and each configured control plane speaks once:
    /// one OSPF hello per adjacency, one STP announcement per switch in a tree.
    /// Returns how many events this advance emitted.
    pub fn advance(&mut self, seconds: f32) -> usize {
        let step = if seconds.is_finite() { seconds.clamp(0.0, 86_400.0) } else { 0.0 };
        self.sim_time += step;
        let now = self.sim_time as f64;
        for table in self.tables.macs.values_mut() {
            table.age(now);
        }
        for table in self.tables.arps.values_mut() {
            table.expire(now);
        }
        self.emit_ospf_hellos() + self.emit_stp_announcements()
    }

    fn ospf_enabled(&self, id: &str) -> bool {
        matches!(
            self.routing.get(id).map(|config| &config.protocol),
            Some(RoutingProtocol::Ospf { .. })
        )
    }

    fn emit_ospf_hellos(&mut self) -> usize {
        let routers: Vec<String> = self
            .devices
            .iter()
            .filter(|d| crate::model::routes_packets(&d.kind))
            .map(|d| d.id.clone())
            .collect();
        let mut hellos = Vec::new();
        for router in routers {
            if !self.ospf_enabled(&router) {
                continue;
            }
            for adjacency in self.router_neighbors(&router) {
                if self.ospf_enabled(&adjacency.neighbor)
                    && self.routing_port_enabled(&router, &adjacency.outgoing)
                {
                    hellos.push(Hello {
                        router: router.clone(),
                        neighbor: adjacency.neighbor,
                        outgoing: adjacency.outgoing,
                    });
                }
            }
        }
        let count = hellos.len();
        for hello in hellos {
            let note = format!("hello to {}", self.name_of(&hello.neighbor));
            let layer = Layer::new(
                "OSPF",
                vec![
                    ("Capture".into(), "Control-plane service exchange".into()),
                    ("Type".into(), "Hello".into()),
                    ("Router".into(), self.name_of(&hello.router)),
                    ("Neighbor".into(), self.name_of(&hello.neighbor)),
                    ("Interface".into(), hello.outgoing),
                ],
            );
            self.control_event("OSPF", &hello.router, &hello.neighbor, note, layer, 82);
        }
        count
    }

    /// A switch runs spanning tree once a live data link ties it to another switch.
    fn stp_participant(&self, id: &str) -> bool {
        self.links.iter().any(|link| {
            if !link.carries_data() {
                return false;
            }
            let (local_port, peer, peer_port) = if link.a == id {
                (&link.a_port, &link.b, &link.b_port)
            } else if link.b == id {
                (&link.b_port, &link.a, &link.a_port)
            } else {
                return false;
            };
            let local_up = |dev: &str, raw: &str| {
                self.devices
                    .iter()
                    .find(|d| d.id == dev)
                    .is_some_and(|d| self.port_state(dev, &self.port_full_name(d, raw)).line_up)
            };
            self.kind_of(peer) == "switch" && local_up(id, local_port) && local_up(peer, peer_port)
        })
    }

    fn emit_stp_announcements(&mut self) -> usize {
        let mut participants: Vec<String> = self
            .devices
            .iter()
            .filter(|d| d.kind == "switch" && self.stp_participant(&d.id))
            .map(|d| d.id.clone())
            .collect();
        participants.sort();
        let announcements: Vec<Announcement> = participants
            .into_iter()
            .filter_map(|switch| {
                let root = self.stp_root_of(&switch)?;
                Some(Announcement { root, switch })
            })
            .collect();
        let count = announcements.len();
        for Announcement { root, switch } in announcements {
            let note = format!("bridge {} announces the root", self.name_of(&root));
            let layer = Layer::new(
                "STP",
                vec![
                    ("Capture".into(), "Control-plane service exchange".into()),
                    ("Type".into(), "Configuration BPDU".into()),
                    ("Root Bridge".into(), self.name_of(&root)),
                    ("Heard At".into(), self.name_of(&switch)),
                ],
            );
            self.control_event("STP", &root, &switch, note, layer, 64);
        }
        count
    }

    fn control_event(
        &mut self,
        proto: &str,
        src: &str,
        dst: &str,
        note: String,
        layer: Layer,
        size: usize,
    ) {
        let path = if src == dst {
            vec![src.to_string()]
        } else {
            self.path(src, dst)
                .unwrap_or_else(|| vec![src.to_string(), dst.to_string()])
        };
        self.next_event += 1;
        let event = Event {
            id: self.next_event,
            time: self.sim_time,
            last: self.name_of(src),
            at: self.name_of(dst),
            kind: proto.into(),
            proto: proto.into(),
            path,
            hops: Vec::new(),
            layers: vec![layer],
            status: "Successful".into(),
            reason: None,
            note,
            bytes: Vec::new(),
            size,
        };
        self.push_event(event);
    }
}
