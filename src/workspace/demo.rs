use super::*;

impl Workspace {
    /// Sends the template's own traffic so the capture has something to play.
    /// Every step runs the same captured path the user would trigger by hand.
    /// A step that names a missing device or fails stops the run with a plain
    /// message; steps before it stay captured.
    pub fn run_demo(&mut self) -> Result<usize, String> {
        if self.demo.is_empty() {
            return Err("This network has no built-in traffic. Send a PDU to capture something.".into());
        }
        let steps = self.demo.clone();
        let mut wave: Vec<(String, String)> = Vec::new();
        for (index, step) in steps.iter().enumerate() {
            let flush = |ws: &mut Workspace, wave: &mut Vec<(String, String)>| -> Result<(), String> {
                if wave.is_empty() {
                    return Ok(());
                }
                let sends: Vec<(&str, &str)> =
                    wave.iter().map(|(a, b)| (a.as_str(), b.as_str())).collect();
                for result in ws.send_concurrent(&sends) {
                    if let Err(error) = result {
                        if !error.starts_with("collision on") {
                            return Err(format!("Built-in ping failed: {error}"));
                        }
                    }
                }
                wave.clear();
                Ok(())
            };
            let from_known = self.devices.iter().any(|device| device.id == step.from);
            let to_known = self.devices.iter().any(|device| device.id == step.to);
            if !from_known || (step.kind == "ping" && !to_known) {
                flush(self, &mut wave)?;
                let missing = if from_known { &step.to } else { &step.from };
                return Err(format!("Built-in traffic step {} names a device that is not here: {missing}", index + 1));
            }
            match step.kind.as_str() {
                "ping" => {
                    if !self.devices.iter().find(|d| d.id == step.from).is_some_and(|d| d.ip.is_some() || d.ports.iter().any(|p| p.ip.is_some()))
                        || !self.devices.iter().find(|d| d.id == step.to).is_some_and(|d| d.ip.is_some() || d.ports.iter().any(|p| p.ip.is_some()))
                    {
                        flush(self, &mut wave)?;
                        return Err(format!("Built-in ping from {} failed: source and destination must have IPv4 addresses", self.name_of(&step.from)));
                    }
                    wave.push((step.from.clone(), step.to.clone()));
                }
                "http" => {
                    flush(self, &mut wave)?;
                    crate::webapp::fetch(self, &step.from, &step.url)
                        .map_err(|error| format!("Built-in page request from {} failed: {error}", self.name_of(&step.from)))?;
                }
                "dns" => {
                    flush(self, &mut wave)?;
                    let name = step.url.trim().trim_start_matches("http://").trim_end_matches('/').to_string();
                    self.resolve_name_captured(&step.from, &name)
                        .ok_or_else(|| format!("Built-in lookup from {} failed: no DNS record answers {name}", self.name_of(&step.from)))?;
                }
                "dhcp" => {
                    flush(self, &mut wave)?;
                    self.acquire_dhcp(&step.from)
                        .map_err(|error| format!("Built-in lease from {} failed: {error}", self.name_of(&step.from)))?;
                }
                "expect" => {
                    flush(self, &mut wave)?;
                    // A deliberate negative demo: run the wrapped step and keep the
                    // failure as the capture, not as an abort.
                    let inner = Demo { kind: step.to.clone(), from: step.from.clone(), to: step.url.clone(), url: step.url.clone() };
                    let before = self.events.len();
                    let outcome = match inner.kind.as_str() {
                        "ping" => self.send_pdu(&inner.from, &inner.to).err(),
                        "http" => crate::webapp::fetch(self, &inner.from, &inner.url).err(),
                        "dns" => if self.resolve_name_captured(&inner.from, &inner.url.trim().trim_start_matches("http://")).is_some() { None } else { Some("no DNS record answers".to_string()) },
                        other => Some(format!("unknown wrapped kind '{other}'")),
                    };
                    match outcome {
                        Some(reason) => {
                            if self.events.len() == before {
                                let _ = self.record_drop(&inner.from, &inner.to, "Blocked", crate::net::fwd::DeliveryError {
                                    reason: reason.clone(),
                                    path: vec![inner.from.clone(), inner.to.clone()],
                                    hops: Vec::new(),
                                    frame: None,
                                    arp: None,
                                    size: 0,
                                    finished_at: self.sim_time as f64,
                                });
                            }
                        }
                        None => {
                            return Err(format!("Built-in step {} expected failure, but {} → {} succeeded", index + 1, self.name_of(&inner.from), self.name_of(&inner.to)));
                        }
                    }
                }
                "pppoe" => {
                    flush(self, &mut wave)?;
                    self.demo_pppoe_login(&step.from)?;
                }
                "congestion" => {
                    flush(self, &mut wave)?;
                    let port = if step.to.is_empty() { "Ether1" } else { step.to.as_str() };
                    self.demo_congestion_beat(&step.from, port)
                        .map_err(|e| format!("Built-in congestion step {} failed: {e}", index + 1))?;
                }
                "wifi" => {
                    flush(self, &mut wave)?;
                    self.demo_wifi_association(&step.from)?;
                }
                "voucher" => {
                    flush(self, &mut wave)?;
                    self.demo_voucher_portal(&step.from)?;
                }
                "call" => {
                    flush(self, &mut wave)?;
                    let (from_ext, to_ext) = step
                        .url
                        .split_once(':')
                        .and_then(|(a, b)| Some((a.parse::<u16>().ok()?, b.parse::<u16>().ok()?)))
                        .ok_or_else(|| format!("Built-in call step {} needs extensions as 'from:to' in the url, like 2001:2002", index + 1))?;
                    self.call(from_ext, to_ext).map_err(|e| format!("Built-in call step {} failed: {e}", index + 1))?;
                }
                "modbus" => {
                    flush(self, &mut wave)?;
                    let (dev, addr) = step
                        .url
                        .split_once(':')
                        .and_then(|(d, a)| Some((d.to_string(), a.parse::<u16>().ok()?)))
                        .ok_or_else(|| format!("Built-in modbus step {} needs 'device:register' in the url, like thing0:2", index + 1))?;
                    self.demo_modbus_read(&step.from, &dev, addr)
                        .map_err(|e| format!("Built-in modbus step {} failed: {e}", index + 1))?;
                }
                other => {
                    flush(self, &mut wave)?;
                    return Err(format!("Built-in traffic step {} has an unknown kind '{other}'", index + 1));
                }
            }
        }
        {
            let sends: Vec<(&str, &str)> =
                wave.iter().map(|(a, b)| (a.as_str(), b.as_str())).collect();
            for result in self.send_concurrent(&sends) {
                if let Err(error) = result {
                    if !error.starts_with("collision on") {
                        return Err(format!("Built-in ping failed: {error}"));
                    }
                }
            }
        }
        Ok(steps.len())
    }

    /// One PPPoE login in the play: the client redials its configured session
    /// with the account the gateway knows, and the exchange is captured so the
    /// login is visible in the capture instead of being silent config.
    pub(super) fn demo_pppoe_login(&mut self, client: &str) -> Result<(), String> {
        let (server, user) = self.pppoe.get(client).cloned().ok_or_else(|| {
            format!("Built-in PPPoE from {} failed: the client has no provider configured", self.name_of(client))
        })?;
        let owner = self
            .devices
            .iter()
            .find(|d| d.ip == crate::model::parse_ipv4(&server) || d.ports.iter().any(|p| p.ip == crate::model::parse_ipv4(&server)))
            .map(|d| d.id.clone())
            .ok_or_else(|| format!("Built-in PPPoE from {} failed: no device at {server}", self.name_of(client)))?;
        let pass = self
            .aaa_users
            .get(&owner)
            .and_then(|users| users.iter().find(|(u, _)| u == &user).map(|(_, p)| p.clone()))
            .ok_or_else(|| format!("Built-in PPPoE from {} failed: the gateway holds no account for {user}", self.name_of(client)))?;
        let path = self.path(client, &owner).unwrap_or_else(|| vec![client.to_string(), owner.clone()]);
        self.pppoe_connect(client, &server, &user, &pass)?;
        self.next_event += 1;
        self.sim_time += 0.001;
        self.push_event(Event {
            id: self.next_event,
            time: self.sim_time,
            last: self.name_of(client),
            at: self.name_of(&owner),
            kind: "PPPoE".into(),
            proto: "PPPoE".into(),
            path,
            hops: Vec::new(),
            layers: vec![Layer::new(
                "PPPoE",
                vec![
                    ("Capture".into(), "Session login".into()),
                    ("User".into(), user.clone()),
                    ("Gateway".into(), server.clone()),
                    ("Result".into(), "Session established".into()),
                ],
            )],
            status: "Successful".into(),
            reason: None,
            note: format!(
                "{} logs in to {} as {user}; the provider grants the session",
                self.name_of(client),
                self.name_of(&owner)
            ),
            bytes: Vec::new(),
            size: 76,
        });
        Ok(())
    }

    /// One Wi-Fi association in the play: the client joins its configured
    /// SSID with the network's own secret, and the handshake is captured so
    /// going wireless is visible instead of being silent config.
    fn demo_wifi_association(&mut self, client: &str) -> Result<(), String> {
        let (ssid, current_wlc) = self.wifi.get(client).cloned().ok_or_else(|| {
            format!("Built-in Wi-Fi from {} failed: the client has no SSID configured", self.name_of(client))
        })?;
        let (secret, security) = self
            .wlans
            .values()
            .flat_map(|list| list.iter())
            .find(|w| w.ssid == ssid)
            .map(|w| (w.secret.clone(), w.security.clone()))
            .ok_or_else(|| format!("Built-in Wi-Fi from {} failed: no network advertises {ssid}", self.name_of(client)))?;
        // The association handshake travels over the air to the AP that
        // serves the controller; the capture path runs client → controller.
        let path = self.path(client, &current_wlc).unwrap_or_else(|| vec![client.to_string(), current_wlc.clone()]);
        self.wifi_join(client, &ssid, &secret)?;
        self.next_event += 1;
        self.sim_time += 0.001;
        self.push_event(Event {
            id: self.next_event,
            time: self.sim_time,
            last: self.name_of(client),
            at: self.name_of(&current_wlc),
            kind: "Wifi".into(),
            proto: "Wifi".into(),
            path,
            hops: Vec::new(),
            layers: vec![Layer::new(
                "Wifi",
                vec![
                    ("Capture".into(), "Association".into()),
                    ("SSID".into(), ssid.clone()),
                    ("Security".into(), security.clone()),
                    ("Result".into(), "Associated".into()),
                ],
            )],
            status: "Successful".into(),
            reason: None,
            note: format!(
                "{} associates with {ssid} ({security})",
                self.name_of(client)
            ),
            bytes: Vec::new(),
            size: 64,
        });
        Ok(())
    }

    /// The café-portal play for one visitor: the client's first attempt at the
    /// internet is captured as the captive portal stopping it, the voucher is
    /// redeemed (the code comes from the gateway's own voucher list, first
    /// unused), and the retry succeeds — pay, then browse.
    fn demo_voucher_portal(&mut self, client: &str) -> Result<(), String> {
        let target = self
            .devices
            .iter()
            .find(|d| d.kind == "cloud")
            .map(|d| d.id.clone())
            .unwrap_or_else(|| "server0".to_string());
        // 1. The portal stops the guest.
        let (ssid, wlc) = self.wifi.get(client).cloned().ok_or_else(|| {
            format!("Built-in voucher from {} failed: the client has no SSID configured", self.name_of(client))
        })?;
        let blocked_reason = self.guest_blocked(client, &target);
        // 2. Redeem: the portal runs on the NAT gateway toward the internet,
        // which is also where the voucher list lives. First free voucher wins.
        let portal_dev = self
            .vouchers
            .iter()
            .find(|(_, list)| list.iter().any(|v| v.used_by.is_none() || v.used_by.as_deref() == Some(client)))
            .map(|(gw, _)| gw.clone())
            .unwrap_or_else(|| wlc.clone());
        let code = self
            .vouchers
            .get(&portal_dev)
            .and_then(|list| list.iter().find(|v| v.used_by.is_none() || v.used_by.as_deref() == Some(client)))
            .map(|v| v.code.clone())
            .ok_or_else(|| format!("Built-in voucher from {} failed: the hotspot holds no free voucher", self.name_of(client)))?;
        let redeemed = self.voucher_redeem(&portal_dev, client, &code).is_ok();
        self.next_event += 1;
        self.sim_time += 0.001;
        self.push_event(Event {
            id: self.next_event,
            time: self.sim_time,
            last: self.name_of(client),
            at: self.name_of(&portal_dev),
            kind: "Portal".into(),
            proto: "Portal".into(),
            path: vec![client.to_string(), wlc.clone()],
            hops: Vec::new(),
            layers: vec![Layer::new(
                "Portal",
                vec![
                    ("Capture".into(), "Captive portal".into()),
                    ("SSID".into(), ssid),
                    ("Voucher".into(), code.clone()),
                    ("Result".into(), if redeemed { "Access granted".into() } else { "Still blocked".into() }),
                ],
            )],
            status: if redeemed { "Successful".into() } else { "Dropped".into() },
            reason: blocked_reason,
            note: if redeemed {
                format!("{} redeems {code} at the portal; the hotspot opens the internet", self.name_of(client))
            } else {
                format!("{} is held at the portal; the voucher did not redeem", self.name_of(client))
            },
            bytes: Vec::new(),
            size: 72,
        });
        if redeemed {
            Ok(())
        } else {
            Err(format!("Built-in voucher from {} failed: the voucher did not redeem", self.name_of(client)))
        }
    }

    /// One Modbus TCP read in the play: the operator polls a register on the
    /// device across the OT network, and the exchange is captured — the
    /// registers stop being numbers only the device window knows.
    fn demo_modbus_read(&mut self, reader: &str, dev: &str, addr: u16) -> Result<(), String> {
        if !self.devices.iter().any(|d| d.id == reader) {
            return Err(format!("'{}' is not a device here", reader));
        }
        let value = self.iot_read(dev, addr).map_err(|e| format!("{dev}: {e}"))?;
        let path = self.path(reader, dev).unwrap_or_else(|| vec![reader.to_string(), dev.to_string()]);
        // The exchange must really traverse the OT network, not just look it up.
        self.clone()
            .send_addressed_pdu(reader, dev)
            .map_err(|e| format!("{} cannot reach {dev}: {e}", self.name_of(reader)))?;
        self.next_event += 1;
        self.sim_time += 0.001;
        self.push_event(Event {
            id: self.next_event,
            time: self.sim_time,
            last: self.name_of(reader),
            at: self.name_of(dev),
            kind: "Modbus".into(),
            proto: "Modbus".into(),
            path,
            hops: Vec::new(),
            layers: vec![Layer::new(
                "Modbus",
                vec![
                    ("Capture".into(), "Read holding register".into()),
                    ("Unit".into(), self.name_of(dev)),
                    ("Register".into(), addr.to_string()),
                    ("Value".into(), value.to_string()),
                ],
            )],
            status: "Successful".into(),
            reason: None,
            note: format!(
                "{} reads register {addr} on {} = {value}",
                self.name_of(reader),
                self.name_of(dev)
            ),
            bytes: Vec::new(),
            size: 60,
        });
        Ok(())
    }
}
