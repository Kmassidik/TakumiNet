//! The demand congestion beat for the busy RT/RW template.
//!
//! The gateway's queue math (`queues.rs`) already computes, per PPPoE session,
//! a measured rate: the home's demand capped by its own speed limit, then a
//! max-min fair share of the parent limit when the group asks for more than
//! the parent allows. This module turns that math into what a customer's
//! status page would show under congestion, and captures it as a beat in the
//! Play recording — the busy WISP's story says the upstream saturates, and
//! this makes the saturation visible instead of silent.
//!
//! The representation is deliberately steady-state and honest about it: no
//! per-packet queue simulation lives in the engine, so the beat reports the
//! long-run loss rate `max(0, 1 - granted/wanted)` implied by the cap, and a
//! store-and-forward queueing delay derived from the shared uplink (each hop
//! already adds its configured delay; congestion adds a queueing term on top).

use super::*;

/// One home's view of the crowded upstream, as its status page would show it.
#[derive(Clone, Debug, PartialEq)]
pub struct CongestionRow {
    pub client: String,
    pub user: String,
    /// The rate the session actually gets, in Mbit/s.
    pub granted_mbit: f64,
    /// The rate the home was trying to pull, in Mbit/s.
    pub wanted_mbit: f64,
    /// Long-run share of packets the cap cannot carry: `1 - granted/wanted`.
    pub loss_percent: f64,
    /// Extra milliseconds the shared upstream's queue adds, on top of each
    /// hop's configured delay.
    pub queue_delay_ms: f64,
}

impl Workspace {
    /// Per-session congestion view for the sessions a gateway holds: demand,
    /// the parent-capped rate, the implied steady-state loss, and the queueing
    /// delay the shared uplink adds while it runs full.
    pub fn congestion_rows(&self, gateway: &str) -> Vec<CongestionRow> {
        let rows: Vec<CongestionRow> = self.measured_rates(gateway).iter().map(|(client, user, granted)| {
            let (client, user, granted) = (client.as_str(), user.as_str(), *granted);
            let wanted = self.demands.get(client).copied().unwrap_or(5) as f64;
            let loss = if wanted > granted { (1.0 - granted / wanted) * 100.0 } else { 0.0 };
            CongestionRow {
                client: client.to_string(),
                user: user.to_string(),
                granted_mbit: granted,
                wanted_mbit: wanted,
                loss_percent: loss,
                queue_delay_ms: self.uplink_queue_delay_ms(gateway),
            }
        }).collect();
        let congested = rows.iter().any(|r| r.loss_percent > 0.0);
        rows.into_iter().map(|mut row| { row.queue_delay_ms = if congested { row.queue_delay_ms } else { 0.0 }; row }).collect()
    }

    /// The busiest upstream port of the gateway, by current line load.
    pub fn congested_uplink(&self, gateway: &str) -> Option<(String, f64)> {
        let device = self.devices.iter().find(|d| d.id == gateway)?;
        device.ports.iter()
            .filter_map(|p| self.line_load(gateway, &p.name).map(|load| (p.name.clone(), load)))
            .max_by(|a, b| a.1.total_cmp(&b.1))
    }

    /// Extra queueing delay on the busy upstream, above each hop's configured
    /// delay. A store-and-forward queue's wait follows queueing theory's
    /// rho/(1-rho) law; at 100 Mbit/s one 1500-byte packet serializes in
    /// 0.12 ms, so a line running full holds about 99 packets' worth —
    /// roughly 12 ms, the bufferbloat a saturated home router really shows.
    /// The steady-state model caps the law at 99 % utilization: beyond that
    /// the excess is reported as drop share, not as waiting time.
    fn uplink_queue_delay_ms(&self, gateway: &str) -> f64 {
        let Some((port, load)) = self.congested_uplink(gateway) else { return 0.0 };
        let rho = (load / 100.0).clamp(0.0, 0.99);
        if rho <= 0.0 {
            return 0.0;
        }
        let speed_mbit = self.uplink_speed_mbit(gateway, &port);
        let serial_ms = 1500.0 * 8.0 / speed_mbit / 1000.0;
        serial_ms * rho / (1.0 - rho)
    }

    fn uplink_speed_mbit(&self, gateway: &str, port: &str) -> f64 {
        self.devices.iter().find(|d| d.id == gateway)
            .and_then(|d| d.ports.iter().find(|p| p.name == port))
            .map(|p| p.bandwidth_kbps as f64 / 1000.0)
            .unwrap_or(100.0)
    }

    /// One congestion beat in the play: the gateway redials every home's
    /// PPPoE session (so the logins are captured), the crowded hour's demand
    /// pile-up is applied, and each session's outcome is captured — the homes
    /// the shared upstream cannot carry show drops and queue delay, the
    /// smaller homes ride through. The demand stays applied afterwards, the
    /// way an evening rush does not clean itself up.
    pub fn demo_congestion_beat(&mut self, gateway: &str, port: &str) -> Result<(), String> {
        if !self.devices.iter().any(|d| d.id == gateway) {
            return Err(format!("no such device {gateway}"));
        }
        let clients: Vec<String> = self.pppoe.keys().cloned().collect();
        if clients.is_empty() {
            return Err(format!("{} holds no PPPoE sessions", self.name_of(gateway)));
        }
        for client in &clients {
            self.demo_pppoe_login(client)?;
        }
        for row in self.congestion_rows(gateway) {
            let path = self.path(&row.client, gateway).unwrap_or_else(|| vec![row.client.clone(), gateway.to_string()]);
            let (status, reason) = if row.loss_percent > 0.0 {
                ("Dropped".to_string(), Some(format!(
                    "uplink {port} full: the shared {} Mbit/s cannot carry {} Mbit/s, {:.0} % of the packets queue-drop",
                    self.granted_total_mbit(gateway), row.wanted_mbit, row.loss_percent)))
            } else {
                ("Successful".to_string(), None)
            };
            let delay = if row.queue_delay_ms > 0.0 {
                format!("; queue adds {:.1} ms", row.queue_delay_ms)
            } else {
                String::new()
            };
            let note = format!(
                "{} measures {:.1} of {:.1} Mbit/s{} under the evening rush",
                self.name_of(&row.client), row.granted_mbit, row.wanted_mbit, delay);
            self.next_event += 1;
            self.sim_time += 0.001;
            self.push_event(Event {
                id: self.next_event,
                time: self.sim_time,
                last: self.name_of(&row.client),
                at: self.name_of(gateway),
                kind: "Demand".into(),
                proto: "Demand".into(),
                path,
                hops: Vec::new(),
                layers: Vec::new(),
                status,
                reason,
                note,
                bytes: Vec::new(),
                size: 0,
            });
        }
        Ok(())
    }

    /// Sum of the rates the gateway's sessions are granted, in Mbit/s.
    fn granted_total_mbit(&self, gateway: &str) -> f64 {
        self.measured_rates(gateway).iter().map(|(_, _, rate)| rate).sum()
    }
}
