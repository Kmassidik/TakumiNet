use super::*;
use crate::model::{ipv4_string, mask_of, parse_ipv4, parse_mask};

type Verdict = (bool, String, String);

impl Workspace {
    pub(super) fn run_extra_check(&mut self, check: &Check) -> Option<Verdict> {
        Some(match check.kind.as_str() {
            "noreach" => self.check_noreach(check),
            "config" => self.check_config(check),
            "pool" => self.check_pool(check),
            "vlan" => self.check_vlan(check),
            "count" => self.check_count(check),
            "login" => self.check_login(check),
            "outage" => self.check_outage(check),
            "wifi" => self.check_wifi(check),
            _ => return None,
        })
    }

    fn check_noreach(&mut self, check: &Check) -> Verdict {
        let hint = "Block the path first (a firewall rule, an unplugged cable or a different VLAN), then check again.".to_string();
        match self.send_addressed_pdu(&check.from, &check.to) {
            Ok(()) => (false, "ping delivered, but it should be blocked".into(), hint),
            Err(error) => (true, format!("blocked: {error}"), hint),
        }
    }

    fn check_config(&self, check: &Check) -> Verdict {
        let hint = "Open the device settings and change the field named in the check.".to_string();
        let Some(device) = self.devices.iter().find(|d| d.id == check.from) else {
            return (false, format!("unknown device {}", check.from), "Fix the lesson device reference.".into());
        };
        if let Some(iface) = check.to.strip_prefix("portsec:") {
            let max = self.port_security_rows(&check.from).into_iter().find(|(name, _, _)| name == iface).map(|(_, max, _)| max);
            let actual = max.map_or_else(|| "off".to_string(), |m| m.to_string());
            return (actual == check.expect, format!("port security on {iface} is {actual}"), "Turn on port security for the port and set the allowed number of addresses.".into());
        }
        let address = |value: Option<u32>| value.map(ipv4_string).unwrap_or_else(|| "none".into());
        let actual = match check.to.as_str() {
            "name" => device.name.clone(),
            "ip" => address(device.ip),
            "prefix" => device.prefix.to_string(),
            "gateway" => address(device.gateway),
            "dns" => address(device.dns),
            other => return (false, format!("unknown setting '{other}'"), "Use name, ip, prefix, gateway or dns.".into()),
        };
        (actual == check.expect, format!("{} is {actual}", check.to), hint)
    }

    fn check_pool(&self, check: &Check) -> Verdict {
        let hint = "Create the DHCP pool on the server with the network named in the check.".to_string();
        let Some((network, prefix)) = check.expect.split_once('/').and_then(|(n, p)| Some((parse_ipv4(n)?, parse_mask(p)?))) else {
            return (false, format!("invalid pool expectation '{}'", check.expect), "Use network/prefix, for example 192.168.1.0/24.".into());
        };
        let pools = self.dhcp_pool_list(&check.from);
        if pools.is_empty() {
            return (false, "no DHCP pool on this device".into(), hint);
        }
        let wanted = network & mask_of(prefix);
        if pools.iter().any(|p| p.network == wanted && p.prefix == prefix) {
            return (true, format!("pool {}/{}", ipv4_string(wanted), prefix), hint);
        }
        let seen: Vec<String> = pools.iter().map(|p| format!("{}/{}", ipv4_string(p.network), p.prefix)).collect();
        (false, format!("pools are {}", seen.join(", ")), hint)
    }

    fn check_vlan(&self, check: &Check) -> Verdict {
        let hint = "Set the port to the VLAN, or make it a trunk, in the switch port settings.".to_string();
        let port = self.devices.iter().find(|d| d.id == check.from)
            .and_then(|d| d.ports.iter().find(|p| p.name == check.to));
        let Some(port) = port else {
            return (false, format!("no port {} on {}", check.to, check.from), hint);
        };
        if check.expect == "trunk" {
            return (port.trunk, if port.trunk { "port is a trunk".into() } else { format!("access VLAN {}", port.vlan) }, hint);
        }
        match check.expect.parse::<u16>() {
            Ok(vlan) => (!port.trunk && port.vlan == vlan, format!("access VLAN {}", port.vlan), hint),
            Err(_) => (false, format!("invalid VLAN '{}'", check.expect), "Use a VLAN number or the word trunk.".into()),
        }
    }

    fn check_login(&mut self, check: &Check) -> Verdict {
        let hint = "Use the user name and password from the sticker, or the ones you set.".to_string();
        let (user, pass) = check.url.split_once(':').unwrap_or((check.url.as_str(), ""));
        let outcome = self.router_login(&check.from, &check.to, user, pass);
        let want_ok = check.expect != "refused";
        match (&outcome, want_ok) {
            (Ok(()), true) => (true, "login accepted".into(), hint),
            (Err(e), false) if e.starts_with("401") => (true, "login refused".into(), hint),
            (Ok(()), false) => (false, "login accepted, but it should be refused".into(), hint),
            (Err(e), _) => (false, e.clone(), hint),
        }
    }

    /// Cut one port on a copy of the network and ask whether `from` still reaches `to`.
    /// The live network is never touched.
    fn check_outage(&mut self, check: &Check) -> Verdict {
        let hint = "Add a second path (another link and routing on it) so one cut does not isolate anyone.".to_string();
        let Some((device, port)) = check.url.split_once(':') else {
            return (false, format!("invalid cut '{}'", check.url), "Write the cut as device:port.".into());
        };
        let mut copy = self.clone();
        if !copy.set_port_up(device, port, false) {
            return (false, format!("no port {port} on {device}"), "Fix the lesson cut.".into());
        }
        match copy.send_addressed_pdu(&check.from, &check.to) {
            Ok(()) => (true, format!("still reachable with {port} on {device} cut"), hint),
            Err(error) => (false, format!("unreachable with {port} on {device} cut: {error}"), hint),
        }
    }

    /// `to` is the network name the client must be joined to; `expect` the security
    /// it must use (empty means any).
    fn check_wifi(&self, check: &Check) -> Verdict {
        let hint = "Join the network from the device, with the password saved on the router.".to_string();
        let Some((ssid, wlc)) = self.wifi_status(&check.from) else {
            return (false, "not joined to any wireless network".into(), hint);
        };
        if ssid != check.to {
            return (false, format!("joined to {ssid}, not {}", check.to), hint);
        }
        let security = self.wlans.get(&wlc).and_then(|l| l.iter().find(|w| w.ssid == ssid)).map(|w| w.security.clone()).unwrap_or_default();
        if !check.expect.is_empty() && security != check.expect {
            return (false, format!("{ssid} uses {security}, not {}", check.expect), "Change the security setting of the network.".into());
        }
        (true, format!("joined to {ssid} ({security})"), hint)
    }

    fn check_count(&self, check: &Check) -> Verdict {
        let hint = "Add more of them, then check again.".to_string();
        let Ok(least) = check.expect.parse::<usize>() else {
            return (false, format!("invalid count '{}'", check.expect), "Use a whole number.".into());
        };
        let found = match check.from.as_str() {
            "devices" => self.devices.iter().filter(|d| check.to.is_empty() || d.kind == check.to).count(),
            "leases" => self.dhcp_leases.get(&check.to).map_or(0, Vec::len),
            "routes" => self.selected_routes(&check.to).len(),
            "reservations" => self.dhcp_reservations.get(&check.to).map_or(0, Vec::len),
            other => return (false, format!("unknown count scope '{other}'"), "Use devices, leases, routes or reservations.".into()),
        };
        (found >= least, format!("{found} found, {least} needed"), hint)
    }
}
