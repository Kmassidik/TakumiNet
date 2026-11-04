use super::*;

impl Workspace {
    pub fn link(&mut self, a: &str, b: &str) -> Result<(), String> {
        self.link_kind(a, b, "eCopper")
    }

    /// Link two devices with an explicit cable type, auto-picking the ports.
    pub fn link_kind(&mut self, a: &str, b: &str, kind: &str) -> Result<(), String> {
        self.link_ports(a, b, kind, None, None)
    }

    /// Link two devices, terminating on the named ports where one is given.
    pub fn link_ports(
        &mut self,
        a: &str,
        b: &str,
        kind: &str,
        a_port: Option<&str>,
        b_port: Option<&str>,
    ) -> Result<(), String> {
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
        let duplicate = self
            .links
            .iter()
            .any(|l| (l.a == a && l.b == b) || (l.a == b && l.b == a));
        if duplicate && !(self.kind_of(a) == "switch" && self.kind_of(b) == "switch") {
            return Err("already linked".into());
        }
        self.media_check(a, b, kind)?;
        let (auto_a, auto_b) = self.assign_ports(a, b, kind);
        let a_port = match a_port {
            Some(raw) => self.claim_port(a, raw, kind)?,
            None => auto_a,
        };
        let b_port = match b_port {
            Some(raw) => self.claim_port(b, raw, kind)?,
            None => auto_b,
        };
        if duplicate && (self.port_used(a, &a_port) || self.port_used(b, &b_port)) {
            return Err("no free interface for another link".into());
        }
        self.links.push(Link {
            a: a.to_string(),
            a_port,
            b: b.to_string(),
            b_port,
            kind: kind.to_string(),
        });
        self.recompute_routing();
        Ok(())
    }

    /// Validate a port the user named: it must exist, be free, and belong to
    /// the family this cable terminates on.
    fn claim_port(&self, id: &str, raw: &str, kind: &str) -> Result<String, String> {
        let name = self.canonical_iface(id, raw)?;
        if !port_takes_cable(&name, kind) {
            return Err(format!("this cable cannot plug into {name}"));
        }
        if self.port_used(id, &name) {
            return Err(format!("{name} is already connected"));
        }
        Ok(name)
    }

    /// Only end devices drive a console session; routers and switches answer one.
    pub fn console_capable(&self, id: &str) -> bool {
        self.devices
            .iter()
            .find(|d| d.id == id)
            .map(|d| matches!(d.kind.as_str(), "pc" | "laptop" | "server" | "tablet" | "pda"))
            .unwrap_or(false)
    }

    /// The console-bearing device a console cable connects `id` to.
    pub fn console_peer(&self, id: &str) -> Option<&str> {
        let l = self
            .links
            .iter()
            .find(|l| l.kind == "eConsole" && (l.a == id || l.b == id))?;
        let peer = if l.a == id { &l.b } else { &l.a };
        self.devices
            .iter()
            .find(|d| d.id == *peer && crate::model::has_console(&d.kind))
            .map(|d| d.id.as_str())
    }

    /// The device and interface on the far end of a cable, if any.
    pub fn peer_port(&self, id: &str, port: &str) -> Option<(String, String)> {
        // Router subinterfaces share their parent's cable and line state.
        let port = port.split_once('.').map(|(parent, _)| parent).unwrap_or(port);
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
        let parent = port.split_once('.').map(|(parent, _)| parent).unwrap_or(port);
        let admin_up = self.port_admin(id, port) && self.port_admin(id, parent);
        let peer = self.peer_port(id, parent);
        let linked = peer.is_some();
        let line_up = admin_up && linked && peer.map(|(pid, pp)| self.port_admin(&pid, &pp)).unwrap_or(false);
        PortState {
            admin_up,
            linked,
            line_up,
        }
    }

    pub(super) fn port_admin(&self, id: &str, port: &str) -> bool {
        self.devices
            .iter()
            .find(|d| d.id == id)
            .and_then(|d| d.ports.iter().find(|p| p.name == port))
            .map(|p| p.up)
            // Single-port hosts are administratively up by definition.
            .unwrap_or(true)
    }

    pub(super) fn kind_of(&self, id: &str) -> String {
        self.devices
            .iter()
            .find(|d| d.id == id)
            .map(|d| d.kind.clone())
            .unwrap_or_default()
    }

    /// Which cables may join these two devices.
    pub(super) fn media_check(&self, a: &str, b: &str, kind: &str) -> Result<(), String> {
        let ka = self.kind_of(a);
        let kb = self.kind_of(b);
        let ethernet = |k: &str| {
            matches!(
                k,
                "pc" | "laptop" | "server" | "printer" | "tv" | "sniffer" | "tablet" | "pda"
                    | "phone" | "asa" | "wlc" | "ap" | "hub" | "switch" | "router"
                    | "patchpanel" | "cablemodem" | "dsl" | "celltower"
                    // IEC 61158 / Modbus TCP: industrial gear also talks plain Ethernet.
                    | "plc" | "thing" | "ioe"
                    | "homerouter" | "cloud" | "rtrw-gateway" | "provider-link"
                    | "sector-radio" | "client-radio" | "hotspot-ap" | "switch-l3" | "load-balancer"
                    | "district-hub" | "city-exchange" | "regency-hub" | "village-pop"
                    | "microwave-link" | "satellite-terminal"
                    | "backbone-pop" | "internet-exchange" | "national-gateway" | "submarine-cable"
            )
        };
        let network = |k: &str| {
            matches!(
                k,
                "switch" | "router" | "switch-l3"
                    | "district-hub" | "city-exchange" | "regency-hub" | "village-pop"
                    | "backbone-pop" | "internet-exchange" | "national-gateway" | "submarine-cable"
            )
        };
        let iot = |k: &str| matches!(k, "thing" | "plc" | "ioe" | "mcucomponent");
        match kind {
            "eConsole" => {
                if !(self.console_capable(a) ^ self.console_capable(b)) {
                    return Err("a console cable joins a PC to a device with a console".into());
                }
                let gear = if self.console_capable(a) { &kb } else { &ka };
                if !crate::model::has_console(gear) {
                    return Err("a console cable joins a PC to a device with a console".into());
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
                let endpoint = |k: &str| matches!(k, "cablemodem" | "homerouter" | "cloud");
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
    pub(super) fn assign_ports(&self, a: &str, b: &str, kind: &str) -> (String, String) {
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

    pub(super) fn free_serial(&self, id: &str) -> Option<String> {
        let dev = self.devices.iter().find(|d| d.id == id)?;
        dev.ports
            .iter()
            .map(|p| p.name.clone())
            .find(|name| name.starts_with("Serial") && !self.port_used(id, name))
    }

    pub(super) fn port_used(&self, id: &str, port: &str) -> bool {
        let Some(dev) = self.devices.iter().find(|d| d.id == id) else {
            return false;
        };
        let names: Vec<String> = dev.ports.iter().map(|p| p.name.clone()).collect();
        let full = crate::cli::expand_iface(port, &names).unwrap_or_else(|| port.to_string());
        self.links.iter().any(|l| {
            (l.a == id && crate::cli::expand_iface(&l.a_port, &names).as_deref() == Some(full.as_str()))
                || (l.b == id && crate::cli::expand_iface(&l.b_port, &names).as_deref() == Some(full.as_str()))
        })
    }

    /// Next free interface name for a device, derived from its kind and how
    /// many links it already has.
    pub(super) fn next_port(&self, id: &str) -> String {
        let used = self.links.iter().filter(|l| l.a == id || l.b == id).count();
        let kind = self
            .devices
            .iter()
            .find(|d| d.id == id)
            .map(|d| d.kind.as_str())
            .unwrap_or("pc");
        match kind {
            "router" | "backbone-pop" | "internet-exchange" | "national-gateway" => format!("Gig0/{used}"),
            "switch" => format!("Fa0/{}", used + 1),
            "hub" => format!("Fa{used}"),
            "submarine-cable" => format!("Fa{used}"),
            _ => "Fa0".to_string(),
        }
    }

    pub fn unlink(&mut self, a: &str, b: &str) -> bool {
        let before = self.links.len();
        self.links
            .retain(|l| !((l.a == a && l.b == b) || (l.a == b && l.b == a)));
        let changed = self.links.len() != before;
        if changed {
            self.recompute_routing();
        }
        changed
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
                let already_linked = self.links.iter().any(|l| {
                    (l.a == peers[i] && l.b == peers[j]) || (l.a == peers[j] && l.b == peers[i])
                });
                if !already_linked && self.link(&peers[i], &peers[j]).is_ok() {
                    created += 1;
                }
            }
        }
        Ok(created)
    }

    /// Models the two module slots accept.
    pub const MODULE_MODELS: &'static [&'static str] = &["HWIC-2T", "NM-2FE2W"];
}

/// Whether a named interface belongs to the family this cable terminates on.
/// Dedicated media (console, phone, coax, IoT) always pick their own port.
fn port_takes_cable(name: &str, kind: &str) -> bool {
    let serial = name.starts_with("Serial");
    match kind {
        "eSerial" => serial,
        "eCopper" | "eCross" | "eFiber" => {
            !serial
                && ["FastEthernet", "GigabitEthernet", "Ethernet", "Ether"]
                    .iter()
                    .any(|family| name.starts_with(family))
        }
        _ => false,
    }
}
