//! IEEE 802.1X port-based access control with an EAP exchange.
//!
//! A switch port in `auto` mode starts unauthorized. The first frame from the
//! supplicant runs identity and challenge exchange against a RADIUS server (or
//! the switch's own user list when no server is configured), then the port
//! carries data only after the credentials match.

use super::*;
use std::collections::HashMap;

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum Dot1xMode {
    Auto,
    ForceAuthorized,
    ForceUnauthorized,
}

impl Dot1xMode {
    fn key(self) -> &'static str {
        match self {
            Dot1xMode::Auto => "auto",
            Dot1xMode::ForceAuthorized => "force-authorized",
            Dot1xMode::ForceUnauthorized => "force-unauthorized",
        }
    }

    pub fn parse(text: &str) -> Option<Self> {
        match text {
            "auto" => Some(Dot1xMode::Auto),
            "force-authorized" => Some(Dot1xMode::ForceAuthorized),
            "force-unauthorized" => Some(Dot1xMode::ForceUnauthorized),
            _ => None,
        }
    }
}

#[derive(Clone, Debug, PartialEq, Eq)]
pub struct Dot1xPort {
    pub mode: Dot1xMode,
    pub authenticated: bool,
    pub user: Option<String>,
}

impl Default for Dot1xPort {
    fn default() -> Self {
        Self { mode: Dot1xMode::ForceAuthorized, authenticated: false, user: None }
    }
}

#[derive(Clone, Default)]
pub struct Dot1xConfig {
    pub(super) ports: HashMap<String, HashMap<String, Dot1xPort>>,
    pub(super) radius: HashMap<String, u32>,
}

impl Workspace {
    pub fn set_dot1x_port(&mut self, switch: &str, port: &str, mode: Dot1xMode) -> Result<(), String> {
        if !self.devices.iter().any(|d| d.id == switch) {
            return Err("no such device".into());
        }
        self.dot1x
            .ports
            .entry(switch.to_string())
            .or_default()
            .entry(port.to_string())
            .or_default()
            .mode = mode;
        Ok(())
    }

    pub fn dot1x_port(&self, switch: &str, port: &str) -> Dot1xPort {
        self.dot1x
            .ports
            .get(switch)
            .and_then(|m| m.get(port))
            .cloned()
            .unwrap_or_default()
    }

    pub fn set_radius_server(&mut self, switch: &str, address: u32) {
        if address == 0 {
            self.dot1x.radius.remove(switch);
        } else {
            self.dot1x.radius.insert(switch.to_string(), address);
        }
    }

    pub fn radius_server(&self, switch: &str) -> Option<u32> {
        self.dot1x.radius.get(switch).copied()
    }

    fn radius_accepts(&self, switch: &str, user: &str, pass: &str) -> bool {
        let list = self
            .dot1x
            .radius
            .get(switch)
            .and_then(|ip| {
                self.devices.iter().find(|d| {
                    d.ip == Some(*ip) || d.ports.iter().any(|p| p.ip == Some(*ip))
                })
            })
            .or_else(|| self.devices.iter().find(|d| d.id == switch))
            .and_then(|d| self.aaa_users.get(&d.id));
        list.is_some_and(|users| users.iter().any(|(u, p)| u == user && p == pass))
    }

    /// Data from the supplicant on `port` is allowed only after a successful
    /// exchange. `Ok` also runs the exchange the first time.
    pub(crate) fn dot1x_allow(&mut self, switch: &str, port: &str) -> Result<(), String> {
        let state = self.dot1x_port(switch, port);
        match state.mode {
            Dot1xMode::ForceAuthorized => return Ok(()),
            Dot1xMode::ForceUnauthorized => return Err(format!("802.1X on {port} is force-unauthorized")),
            Dot1xMode::Auto => {}
        }
        if state.authenticated {
            return Ok(());
        }
        let Some((peer, _)) = self.peer_port(switch, port) else {
            return Err(format!("802.1X on {port}: no supplicant"));
        };
        let (Some(user), Some(pass)) = self
            .devices
            .iter()
            .find(|d| d.id == peer)
            .map(|d| (d.dot1x_user.clone(), d.dot1x_pass.clone()))
            .unwrap_or((None, None))
        else {
            return Err(format!("802.1X on {port}: supplicant has no identity"));
        };
        if !self.radius_accepts(switch, &user, &pass) {
            return Err(format!("802.1X on {port}: EAP authentication failed for {user}"));
        }
        if let Some(state) = self
            .dot1x
            .ports
            .get_mut(switch)
            .and_then(|m| m.get_mut(port))
        {
            state.authenticated = true;
            state.user = Some(user);
        }
        Ok(())
    }

    pub fn show_dot1x(&self, switch: &str) -> String {
        let Some(ports) = self.dot1x.ports.get(switch) else {
            return "% 802.1X is not configured\n".into();
        };
        let mut names: Vec<_> = ports.keys().cloned().collect();
        names.sort();
        let mut out = String::from("Interface        Port control      Status         User\n");
        for name in names {
            let state = &ports[&name];
            let status = if state.authenticated { "Authorized" } else { "Unauthorized" };
            out.push_str(&format!(
                "{:<17}{:<18}{:<15}{}\n",
                name,
                state.mode.key(),
                status,
                state.user.as_deref().unwrap_or("-")
            ));
        }
        out
    }

    pub(super) fn dot1x_records(&self) -> String {
        let mut switches: Vec<_> = self.dot1x.ports.iter().collect();
        switches.sort_by_key(|(id, _)| id.as_str());
        let mut out = String::new();
        for (id, ports) in switches {
            let mut names: Vec<_> = ports.keys().collect();
            names.sort();
            for port in names {
                let state = &ports[port];
                out.push_str(&format!(
                    "dot1xport\t{id}\t{port}\t{}\t{}\t{}\n",
                    state.mode.key(),
                    u8::from(state.authenticated),
                    state.user.as_deref().unwrap_or("-")
                ));
            }
        }
        let mut radius: Vec<_> = self.dot1x.radius.iter().collect();
        radius.sort_by_key(|(id, _)| id.as_str());
        for (id, ip) in radius {
            out.push_str(&format!("radius\t{id}\t{}\n", crate::model::ipv4_string(*ip)));
        }
        out
    }

    pub(super) fn dot1x_load(&mut self, row: &[&str]) {
        match row {
            ["dot1xport", switch, port, mode, auth, user] => {
                if let Some(mode) = Dot1xMode::parse(mode) {
                    let _ = self.set_dot1x_port(switch, port, mode);
                }
                if let Some(state) = self.dot1x.ports.get_mut(*switch).and_then(|m| m.get_mut(*port)) {
                    state.authenticated = *auth == "1";
                    state.user = (*user != "-").then(|| (*user).to_string());
                }
            }
            ["radius", switch, ip] => {
                if let Some(address) = crate::model::parse_ipv4(ip) {
                    self.set_radius_server(switch, address);
                }
            }
            _ => {}
        }
    }
}
