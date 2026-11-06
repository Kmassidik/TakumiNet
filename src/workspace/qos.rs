//! QoS on switch ports: 802.1p CoS marking, DSCP trust, and a policer.
//!
//! Configuration is per port. Flow loads are capped at the policer rate, so
//! the flow view shows what the port actually forwards.

use super::*;
use std::collections::HashMap;

#[derive(Clone, Debug, PartialEq, Eq)]
pub struct QosPort {
    pub trust_cos: bool,
    pub cos: u8,
    pub dscp: u8,
    pub police_mbit: Option<u32>,
}

impl Default for QosPort {
    fn default() -> Self {
        Self { trust_cos: true, cos: 0, dscp: 0, police_mbit: None }
    }
}

pub fn cos_to_dscp(cos: u8) -> u8 {
    cos.min(7) * 8
}

#[derive(Clone, Default)]
pub struct QosConfig {
    pub(super) ports: HashMap<String, HashMap<String, QosPort>>,
}

impl Workspace {
    fn canonical_port(&self, device: &str, port: &str) -> String {
        let names: Vec<String> = self
            .devices
            .iter()
            .find(|d| d.id == device)
            .map(|d| d.ports.iter().map(|p| p.name.clone()).collect())
            .unwrap_or_default();
        crate::cli::expand_iface(port, &names).unwrap_or_else(|| port.to_string())
    }

    pub fn set_qos_port(&mut self, switch: &str, port: &str, edit: impl FnOnce(&mut QosPort)) {
        let port = self.canonical_port(switch, port);
        let entry = self
            .qos
            .ports
            .entry(switch.to_string())
            .or_default()
            .entry(port)
            .or_insert_with(QosPort::default);
        edit(entry);
        entry.dscp = cos_to_dscp(entry.cos);
    }

    pub fn qos_port(&self, switch: &str, port: &str) -> QosPort {
        let port = self.canonical_port(switch, port);
        self.qos
            .ports
            .get(switch)
            .and_then(|m| m.get(&port))
            .cloned()
            .unwrap_or_default()
    }

    pub fn clear_qos_port(&mut self, switch: &str, port: &str) {
        let port = self.canonical_port(switch, port);
        if let Some(ports) = self.qos.ports.get_mut(switch) {
            ports.remove(&port);
            if ports.is_empty() {
                self.qos.ports.remove(switch);
            }
        }
    }

    /// The police rate applied to a link on a flow path, if the link ends on a
    /// configured switch port.
    fn police_on_link(&self, link: usize) -> Option<u32> {
        let l = self.links.get(link)?;
        [(&l.a, &l.a_port), (&l.b, &l.b_port)]
            .into_iter()
            .filter_map(|(id, port)| {
                let port = self.canonical_port(id, port);
                self.qos.ports.get(id).and_then(|m| m.get(&port)).and_then(|q| q.police_mbit)
            })
            .min()
    }

    /// Rates carried by one flow after policing, and how much was dropped.
    pub fn flow_policed_mbit(&self, from: &str, to: &str, mbit: u32) -> (f64, f64) {
        let Some(path) = self.flow_route(from, to, None) else {
            return (mbit as f64, 0.0);
        };
        let cap = path.iter().filter_map(|link| self.police_on_link(*link)).min();
        match cap {
            Some(limit) => {
                let got = (mbit as f64).min(f64::from(limit));
                (got, mbit as f64 - got)
            }
            None => (mbit as f64, 0.0),
        }
    }

    pub fn qos_table(&self, switch: &str) -> String {
        let mut out = String::from("Interface        Trust      CoS  DSCP  Police\n");
        let mut rows: Vec<(&String, &QosPort)> = self
            .qos
            .ports
            .get(switch)
            .map(|m| m.iter().collect())
            .unwrap_or_default();
        rows.sort_by_key(|(port, _)| port.as_str());
        for (port, q) in rows {
            let trust = if q.trust_cos { "cos" } else { "dscp" };
            let police = q.police_mbit.map_or("-".to_string(), |p| format!("{p} Mbit/s"));
            out.push_str(&format!("{:<17}{:<11}{:<5}{:<6}{police}\n", port, trust, q.cos, q.dscp));
        }
        out
    }

    pub(super) fn qos_records(&self) -> String {
        let mut switches: Vec<_> = self.qos.ports.iter().collect();
        switches.sort_by_key(|(id, _)| id.as_str());
        let mut out = String::new();
        for (id, ports) in switches {
            let mut names: Vec<_> = ports.keys().collect();
            names.sort();
            for port in names {
                let q = &ports[port];
                out.push_str(&format!(
                    "qosport\t{id}\t{port}\t{}\t{}\t{}\n",
                    u8::from(q.trust_cos),
                    q.cos,
                    q.police_mbit.map_or("-".to_string(), |p| p.to_string())
                ));
            }
        }
        out
    }

    pub(super) fn qos_load(&mut self, row: &[&str]) {
        if let ["qosport", switch, port, trust, cos, police] = row {
            let cos = cos.parse::<u8>().unwrap_or(0).min(7);
            let police = (*police != "-").then(|| police.parse::<u32>().ok()).flatten();
            self.set_qos_port(switch, port, |q| {
                q.trust_cos = *trust == "1";
                q.cos = cos;
                q.police_mbit = police;
            });
        }
    }
}
