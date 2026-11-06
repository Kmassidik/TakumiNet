use super::*;

impl Workspace {
    pub(super) fn wlan_security(psk: &str) -> &'static str {
        if psk.is_empty() {
            "Open"
        } else {
            "WPA2-PSK"
        }
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
        if matches!(security.as_str(), "WPA2-PSK" | "WPA3-SAE") && psk.len() < 8 {
            return Err(format!("{security} needs at least 8 characters"));
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

    /// Remove a network and disconnect every client that was joined to it.
    pub fn wlan_remove(&mut self, wlc: &str, ssid: &str) -> Result<(), String> {
        let list = self.wlans.get_mut(wlc).ok_or_else(|| format!("{wlc} has no wireless networks"))?;
        let before = list.len();
        list.retain(|w| w.ssid != ssid);
        if list.len() == before {
            return Err(format!("WLAN {ssid} not found"));
        }
        self.wifi.retain(|_, (joined, on)| !(joined == ssid && on == wlc));
        self.wlan_guest.remove(&(wlc.to_string(), ssid.to_string()));
        Ok(())
    }

    /// Mark a network as a guest network: its clients cannot reach the home devices.
    pub fn wlan_set_guest(&mut self, wlc: &str, ssid: &str, on: bool) -> Result<(), String> {
        let exists = self.wlans.get(wlc).is_some_and(|l| l.iter().any(|w| w.ssid == ssid));
        if !exists {
            return Err(format!("WLAN {ssid} not found"));
        }
        let key = (wlc.to_string(), ssid.to_string());
        if on { self.wlan_guest.insert(key); } else { self.wlan_guest.remove(&key); }
        Ok(())
    }

    /// A guest client may reach only the controller it joined, in either direction.
    pub(super) fn guest_blocked(&self, src: &str, dst: &str) -> Option<String> {
        let guest_of = |id: &str| {
            self.wifi.get(id).filter(|(ssid, wlc)| self.wlan_guest.contains(&(wlc.clone(), ssid.clone())))
        };
        for (client, other) in [(src, dst), (dst, src)] {
            if let Some((ssid, wlc)) = guest_of(client) {
                if other != wlc {
                    return Some(format!("blocked: {ssid} is a guest network and can only reach {}", self.name_of(wlc)));
                }
            }
        }
        None
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
            "WPA3-SAE" => {
                if wlan.secret != secret {
                    return Err("authentication failed (SAE)".into());
                }
            }
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

    /// A controller's fast-roaming (802.11r), neighbour report (802.11k) and
    /// BSS transition (802.11v) switches.
    pub fn set_roam_features(&mut self, wlc: &str, fast: bool, neighbor: bool, transition: bool) {
        self.wifi_features.insert(wlc.to_string(), (fast, neighbor, transition));
    }

    pub fn roam_features(&self, wlc: &str) -> (bool, bool, bool) {
        self.wifi_features.get(wlc).copied().unwrap_or((false, false, false))
    }

    /// Nearest access point that belongs to the controller, falling back to the
    /// controller itself when no AP has joined it.
    fn wifi_anchor_distance(&self, client: &str) -> Option<f32> {
        let (_, wlc) = self.wifi.get(client)?;
        let place = |id: &str| self.devices.iter().find(|d| d.id == id).map(|d| (d.x, d.y));
        let (cx, cy) = place(client)?;
        let mut anchors: Vec<&str> = self
            .capwap
            .iter()
            .filter(|(_, controller)| *controller == wlc)
            .map(|(ap, _)| ap.as_str())
            .collect();
        anchors.push(wlc);
        anchors
            .into_iter()
            .filter_map(place)
            .map(|(x, y)| (cx - x).hypot(cy - y))
            .min_by(|a, b| a.total_cmp(b))
    }

    /// Signal bars, 0 to 4, from the canvas distance to the nearest AP or the
    /// controller. A teaching model, not radio physics.
    pub fn wifi_signal(&self, client: &str) -> Option<u8> {
        let distance = self.wifi_anchor_distance(client)?;
        Some(match distance {
            d if d <= 150.0 => 4,
            d if d <= 250.0 => 3,
            d if d <= 350.0 => 2,
            d if d <= 450.0 => 1,
            _ => 0,
        })
    }
}

impl Workspace {
    /// Automatic roaming: move to a nearer controller that advertises the same
    /// SSID. 802.11k gives the neighbour list and 802.11v lets the controller
    /// steer; without either, a client still roams on a weak signal.
    pub fn wifi_roam_auto(&mut self, client: &str) -> Result<String, String> {
        let (ssid, current) = self.wifi.get(client).cloned().ok_or("not associated")?;
        let place = |id: &str| self.devices.iter().find(|d| d.id == id).map(|d| (d.x, d.y));
        let (cx, cy) = place(client).ok_or("unknown client")?;
        let here = place(&current).map_or(f32::MAX, |(x, y)| (cx - x).hypot(cy - y));
        let mut best: Option<(String, f32)> = None;
        for (wlc, list) in &self.wlans {
            if *wlc == current || !list.iter().any(|w| w.ssid == ssid) {
                continue;
            }
            let Some((wx, wy)) = place(wlc) else { continue };
            let distance = (cx - wx).hypot(cy - wy);
            if distance < here && best.as_ref().map_or(true, |(_, d)| distance < *d) {
                best = Some((wlc.clone(), distance));
            }
        }
        let Some((target, _)) = best else {
            return Err("already on the best controller".into());
        };
        let (_, _, transition) = self.roam_features(&current);
        let (fast, neighbor, _) = self.roam_features(&target);
        if !neighbor && self.wifi_signal(client).unwrap_or(0) > 2 && !transition {
            return Err("signal is still good and no 802.11k/v report points elsewhere".into());
        }
        let note = if fast { " (fast transition, 802.11r)" } else { "" };
        self.wifi.insert(client.to_string(), (ssid, target.clone()));
        Ok(format!("Roamed to {target}{note}"))
    }
}

impl Workspace {
    pub(super) fn wifi_feature_records(&self) -> String {
        let mut ids: Vec<_> = self.wifi_features.keys().collect();
        ids.sort();
        let mut out = String::new();
        for id in ids {
            let (r, k, v) = self.wifi_features[id];
            out.push_str(&format!("wififeat\t{id}\t{}\t{}\t{}\n", u8::from(r), u8::from(k), u8::from(v)));
        }
        out
    }
}
