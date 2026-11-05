//! 2.4 GHz channel plan for access points: IEEE 802.11 channels 1 to 11.
//!
//! Channels closer than five apart overlap, so two nearby APs on 1 and 3
//! interfere while 1 and 6 do not. This is a teaching table, not radio physics.

use super::*;

/// What one access point's radio is set to. Missing means channel 1 on 2.4 GHz.
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct WifiRadio {
    pub channel: u8,
    pub band: String,
}

impl Default for WifiRadio {
    fn default() -> Self {
        Self { channel: 1, band: "2.4".into() }
    }
}

/// Kinds that carry a configurable Wi-Fi radio.
pub(super) fn has_radio(kind: &str) -> bool {
    matches!(kind, "ap" | "hotspot-ap")
}

impl Workspace {
    pub fn wifi_radio(&self, id: &str) -> WifiRadio {
        self.wifi_radios.get(id).cloned().unwrap_or_default()
    }

    /// Set one AP's channel. 2.4 GHz accepts 1 to 11; 5 GHz accepts 36 to 165.
    pub fn set_wifi_channel(&mut self, id: &str, channel: u8, band: &str) -> Result<(), String> {
        let Some(dev) = self.devices.iter().find(|d| d.id == id) else {
            return Err("no such device".into());
        };
        if !has_radio(&dev.kind) {
            return Err("only an access point has a radio channel".into());
        }
        match band {
            "2.4" if (1..=11).contains(&channel) => {}
            "5" if (36..=165).contains(&channel) => {}
            "2.4" | "5" => return Err(format!("channel {channel} is not valid for {band} GHz")),
            _ => return Err("band must be 2.4 or 5".into()),
        }
        self.wifi_radios.insert(id.to_string(), WifiRadio { channel, band: band.into() });
        Ok(())
    }

    /// APs whose 2.4 GHz channels are fewer than five apart.
    pub fn wifi_overlaps(&self) -> Vec<(String, String)> {
        let radios: Vec<(String, WifiRadio)> = self
            .devices
            .iter()
            .filter(|d| has_radio(&d.kind))
            .map(|d| (d.id.clone(), self.wifi_radio(&d.id)))
            .collect();
        let mut out = Vec::new();
        for (i, (a, ra)) in radios.iter().enumerate() {
            for (b, rb) in radios.iter().skip(i + 1) {
                if ra.band == "2.4" && rb.band == "2.4" && ra.channel.abs_diff(rb.channel) < 5 {
                    out.push((a.clone(), b.clone()));
                }
            }
        }
        out
    }

    /// Device names that overlap with `id`, for the API and the CLI.
    pub fn overlaps_with(&self, id: &str) -> Vec<String> {
        let name = |dev: &str| {
            self.devices
                .iter()
                .find(|d| d.id == dev)
                .map(|d| d.name.clone())
                .unwrap_or_else(|| dev.to_string())
        };
        self.wifi_overlaps()
            .into_iter()
            .filter_map(|(a, b)| {
                if a == id {
                    Some(name(&b))
                } else if b == id {
                    Some(name(&a))
                } else {
                    None
                }
            })
            .collect()
    }

    /// `show wireless`: the channel plan and a plain warning.
    pub fn wireless_table(&self, id: &str) -> String {
        let Some(dev) = self.devices.iter().find(|d| d.id == id) else {
            return "% Invalid input\n".into();
        };
        if !has_radio(&dev.kind) {
            return "% This device has no wireless radio\n".into();
        }
        let radio = self.wifi_radio(id);
        let mut out = format!("Wireless radio: {} GHz, channel {}\n", radio.band, radio.channel);
        let overlaps = self.overlaps_with(id);
        if overlaps.is_empty() {
            out.push_str("No channel overlap with another access point.\n");
        } else {
            out.push_str(&format!("Channel overlap with: {}\n", overlaps.join(", ")));
            out.push_str("Move one access point to channel 1, 6 or 11.\n");
        }
        out
    }

    pub(super) fn wifi_radio_records(&self) -> String {
        let mut rows: Vec<_> = self.wifi_radios.iter().collect();
        rows.sort_by_key(|(id, _)| id.as_str());
        let mut out = String::new();
        for (id, radio) in rows {
            out.push_str(&format!("wifiradio\t{}\t{}\t{}\n", id, radio.channel, radio.band));
        }
        out
    }

    pub(super) fn wifi_radio_load(&mut self, id: &str, channel: &str, band: &str) {
        if let Ok(channel) = channel.parse::<u8>() {
            self.wifi_radios.insert(
                id.to_string(),
                WifiRadio { channel, band: if band == "5" { "5".into() } else { "2.4".into() } },
            );
        }
    }
}
