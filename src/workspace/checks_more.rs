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
            "session" => self.check_session(check),
            "limit" => self.check_limit(check),
            "load" => self.check_load(check),
            "latency" => self.check_latency(check),
            "log" => self.check_log(check),
            "nat" => self.check_forward(check),
            "bgp" => self.check_bgp(check),
            "capture" => self.check_capture(check),
            "iot" => self.check_iot(check),
            "cell" => self.check_cell(check),
            "call" => self.check_call(check),
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
        if let Some(group) = check.to.strip_prefix("channel:") {
            let active = group.parse::<u16>().is_ok_and(|g| self.channel_group_active(&check.from, g));
            let actual = if active { "up" } else { "down" };
            return (actual == check.expect, format!("bundle {group} is {actual}"), "Both cables of the bundle must carry the same group number on both switches.".into());
        }
        if check.to == "stp-root" {
            let actual = self.stp_root_of(&check.from)
                .map_or_else(|| "no spanning tree here".to_string(), |id| self.name_of(&id));
            return (actual == check.expect, format!("the root is {actual}"), "Lower the priority on the switch that should win.".into());
        }
        if let Some(iface) = check.to.strip_prefix("portsec:") {
            let max = self.port_security_rows(&check.from).into_iter().find(|(name, _, _)| name == iface).map(|(_, max, _)| max);
            let actual = max.map_or_else(|| "off".to_string(), |m| m.to_string());
            return (actual == check.expect, format!("port security on {iface} is {actual}"), "Turn on port security for the port and set the allowed number of addresses.".into());
        }
        let address = |value: Option<u32>| value.map(ipv4_string).unwrap_or_else(|| "none".into());
        if let Some(port) = check.to.strip_prefix("port:") {
            let actual = device.ports.iter().find(|p| p.name == port)
                .map_or_else(|| format!("no port {port}"), |p| p.ip.map(ipv4_string).unwrap_or_else(|| "none".into()));
            return (actual == check.expect, format!("{port} is {actual}"), "Open the port settings and give it the address.".into());
        }
        let actual = match check.to.as_str() {
            "vnet" => self.vnets.get(&check.from).map_or_else(|| "none".into(), u32::to_string),
            "tunnel" => self.tunnel_state(&check.from).to_string(),
            "masquerade" => self.nat_rules.get(&check.from)
                .and_then(|rules| rules.first())
                .map_or_else(|| "none".to_string(), |rule| rule.iface.clone()),
            "name" => device.name.clone(),
            "ip" => address(device.ip),
            "prefix" => device.prefix.to_string(),
            "gateway" => address(device.gateway),
            "dns" => address(device.dns),
            other => return (false, format!("unknown setting '{other}'"), "Use name, ip, prefix, gateway, dns or tunnel.".into()),
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
        if let Some(code) = check.url.strip_prefix("voucher:") {
            return self.check_voucher(check, code);
        }
        let target_kind = crate::model::parse_ipv4(&check.to)
            .and_then(|addr| self.devices.iter().find(|d| d.ip == Some(addr) || d.ports.iter().any(|p| p.ip == Some(addr))))
            .map(|d| d.kind.clone());
        let want_ok = check.expect != "refused";
        if target_kind.as_deref() == Some("rtrw-gateway") {
            let outcome = self.clone().pppoe_connect(&check.from, &check.to, user, pass)
                .map_err(|e| format!("401 {e}"));
            return match (&outcome, want_ok) {
                (Ok(()), true) => (true, "login accepted".into(), hint),
                (Err(e), false) if e.starts_with("401") => (true, "login refused".into(), hint),
                (Ok(()), false) => (false, "login accepted, but it should be refused".into(), hint),
                (Err(e), _) => (false, e.clone(), hint),
            };
        }
        // A home router page: the grader never signs in by itself. It asks for a
        // real sign-in (or a real refusal) recorded from the device browser.
        if let Err(e) = self.home_router_id(&check.to) {
            return (false, e, "Point the check at the home router's address.".into());
        }
        let seen = self.router_login_seen(&check.from, &check.to, want_ok);
        let from = self.name_of(&check.from);
        match (want_ok, seen) {
            (true, true) => (true, "signed in from the device browser".into(), hint),
            (true, false) => (false, format!("{from} has not signed in yet"),
                format!("Open http://{} in the browser on {from} and sign in.", check.to)),
            (false, true) => (true, "a wrong password was refused".into(), hint),
            (false, false) => (false, format!("{from} has not been refused yet"),
                format!("Try a wrong password once in the router page on {from}.")),
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
        if let Some(least) = check.url.strip_prefix("bars:").and_then(|n| n.parse::<u8>().ok()) {
            let bars = self.wifi_signal(&check.from).unwrap_or(0);
            if bars < least {
                return (false, format!("{bars} of 4 bars"), "Join a closer access point, or move one closer.".into());
            }
            return (true, format!("joined to {ssid}, {bars} of 4 bars"), hint);
        }
        (true, format!("joined to {ssid} ({security})"), hint)
    }

    /// `to` is the outside port; `expect` is `device:port` it must lead to.
    fn check_forward(&self, check: &Check) -> Verdict {
        let hint = "Create a forward from the outside port to the inside device and its port.".to_string();
        let Ok(port) = check.to.parse::<u16>() else {
            return (false, format!("invalid port '{}'", check.to), "Use a port number.".into());
        };
        match self.port_forward_for(&check.from, port) {
            Some((target, inside)) if format!("{target}:{inside}") == check.expect => (true, format!("port {port} leads to {target}:{inside}"), hint),
            Some((target, inside)) => (false, format!("port {port} leads to {target}:{inside}"), hint),
            None => (false, format!("port {port} is not forwarded"), hint),
        }
    }

    /// `from` is the gateway; `expect` the number of customer sessions it must hold.
    fn check_session(&self, check: &Check) -> Verdict {
        let hint = "Connect each home with its own login from the home router's provider page.".to_string();
        let Ok(least) = check.expect.parse::<usize>() else {
            return (false, format!("invalid session count '{}'", check.expect), "Use a whole number.".into());
        };
        let sessions = self.pppoe_sessions(&check.from);
        (sessions.len() >= least, format!("{} sessions up, {least} needed", sessions.len()), hint)
    }

    /// Every session on `from` must measure at or under `expect` Mbit/s.
    fn check_limit(&self, check: &Check) -> Verdict {
        let hint = "Put the limit on each customer queue, not on the whole group.".to_string();
        let Ok(most) = check.expect.parse::<f64>() else {
            return (false, format!("invalid limit '{}'", check.expect), "Use a number of Mbit/s.".into());
        };
        let rates = self.measured_rates(&check.from);
        if rates.is_empty() {
            return (false, "no customer sessions".into(), "Connect the homes first.".into());
        }
        match rates.iter().filter(|(_, _, rate)| *rate > most + 0.05).max_by(|a, b| a.2.total_cmp(&b.2)) {
            Some((_, user, rate)) => (false, format!("{user} measures {rate:.1} Mbit/s"), hint),
            None => (true, format!("all {} sessions at or under {most} Mbit/s", rates.len()), hint),
        }
    }

    /// The load on port `to` of `from` must stay under `expect` percent.
    fn check_load(&self, check: &Check) -> Verdict {
        let hint = "Limit the customers, or set a parent limit at the line speed.".to_string();
        let Ok(most) = check.expect.parse::<f64>() else {
            return (false, format!("invalid load '{}'", check.expect), "Use a percentage.".into());
        };
        if check.to == "links" {
            let hottest = self.hottest_link_percent();
            let actual = format!("the hottest cable carries {hottest:.0} % of its speed");
            return (hottest <= most, actual, "Spread the flows over both paths.".into());
        }
        match self.line_load(&check.from, &check.to) {
            Some(load) if load < most => (true, format!("load {load:.0} % of the line"), hint),
            Some(load) => (false, format!("load {load:.0} % of the line"), hint),
            None => (false, format!("no port {} on {}", check.to, check.from), "Name the upstream port.".into()),
        }
    }

    fn check_voucher(&self, check: &Check, code: &str) -> Verdict {
        let hint = "Type the voucher exactly as it was printed.".to_string();
        if check.expect == "refused" {
            let used_by_other = self.voucher_rows(&check.to).iter()
                .any(|(c, _, used)| c == code && used.as_deref().is_some_and(|by| by != check.from));
            let actual = if used_by_other { "the used voucher is refused" } else { "the voucher has not been used by anyone else yet" };
            return (used_by_other, actual.into(), "One-use vouchers work only once.".into());
        }
        let owner = self.voucher_rows(&check.to).into_iter()
            .find(|(c, _, _)| c == code)
            .and_then(|(_, _, used)| used);
        match owner {
            Some(by) if by == check.from => (true, format!("voucher {code} accepted"), hint),
            Some(by) => (false, format!("voucher {code} was used by {}", self.name_of(&by)), hint),
            None => (false, format!("voucher {code} has not been used"), hint),
        }
    }

    /// The delay from `from` to `to` must be at most `expect` milliseconds.
    fn check_latency(&self, check: &Check) -> Verdict {
        let hint = "Shorten the path, or use faster links; each relay adds a little delay.".to_string();
        let Ok(most) = check.expect.parse::<f64>() else {
            return (false, format!("invalid delay '{}'", check.expect), "Use a number of milliseconds.".into());
        };
        match self.path_latency_ms(&check.from, &check.to) {
            Some(ms) if ms <= most => (true, format!("{ms:.1} ms"), hint),
            Some(ms) => (false, format!("{ms:.1} ms, over {most} ms"), hint),
            None => (false, "no path between the two devices".into(), "Connect them first.".into()),
        }
    }

    /// A log line containing `expect` must exist on `from`.
    fn check_log(&self, check: &Check) -> Verdict {
        let hint = "Turn on logging for the device, then make the event happen.".to_string();
        if check.expect.trim().is_empty() {
            return (false, "the check names no text to look for".into(), "Write the words the log line must contain.".into());
        }
        let found = self.syslog_list(&check.from).into_iter()
            .find(|(_, _, text)| text.contains(check.expect.trim()));
        match found {
            Some((_, severity, text)) => (true, format!("{severity}: {text}"), hint),
            None => (false, format!("no log line contains '{}'", check.expect.trim()), hint),
        }
    }

    /// `to` is the peer address; `expect` is `established` or `idle`.
    fn check_bgp(&self, check: &Check) -> Verdict {
        let hint = "Set the autonomous system on both routers and point each neighbor entry at the other side's address.".to_string();
        if !matches!(check.expect.as_str(), "established" | "idle") {
            return (false, format!("invalid session expectation '{}'", check.expect), "Use established or idle.".into());
        }
        let state = self.bgp_session_state(&check.from, &check.to);
        let actual = match state {
            "none" => format!("no neighbor entry for {}", check.to),
            other => format!("session with {} is {other}", check.to),
        };
        (state == check.expect, actual, hint)
    }

    /// `from` is the sniffer; `to` a protocol filter (empty = any); `url` a
    /// host address filter (empty = any); `expect` the frames needed.
    fn check_capture(&self, check: &Check) -> Verdict {
        let hint = "Cable the sniffer into the path, then send the traffic across it.".to_string();
        let Ok(least) = check.expect.parse::<usize>() else {
            return (false, format!("invalid frame count '{}'", check.expect), "Use a whole number.".into());
        };
        let Some(device) = self.devices.iter().find(|d| d.id == check.from) else {
            return (false, format!("unknown device {}", check.from), "Fix the lesson device reference.".into());
        };
        if device.kind != "sniffer" {
            return (false, format!("{} is not a sniffer", device.name), "Point the check at a sniffer.".into());
        }
        let found = self.sniffer_match_count(&check.from, &check.to, &check.url);
        let what = match (check.to.is_empty(), check.url.is_empty()) {
            (true, true) => "frames".to_string(),
            (false, true) => format!("{} frames", check.to),
            (true, false) => format!("frames touching {}", check.url),
            (false, false) => format!("{} frames touching {}", check.to, check.url),
        };
        (found >= least, format!("{found} {what} captured, {least} needed"), hint)
    }

    /// `to` is the register number; `expect` the value it must hold.
    fn check_iot(&mut self, check: &Check) -> Verdict {
        let hint = "Open the device's Registers panel and write the value into the register named in the check.".to_string();
        let Ok(addr) = check.to.parse::<u16>() else {
            return (false, format!("invalid register '{}'", check.to), "Use a register number from 0 to 255.".into());
        };
        let Ok(wanted) = check.expect.parse::<u16>() else {
            return (false, format!("invalid value '{}'", check.expect), "Use a whole number from 0 to 65535.".into());
        };
        match self.iot_read(&check.from, addr) {
            Ok(value) => (value == wanted, format!("register {addr} holds {value}"), hint),
            Err(error) => (false, error, hint),
        }
    }

    /// `to` is the cell tower the client named in `from` must have joined.
    fn check_cell(&self, check: &Check) -> Verdict {
        let hint = "Open the device window and join it to the tower named in the check.".to_string();
        match self.cell_status(&check.from) {
            Some(tower) if tower == check.to => (true, format!("joined to {}", self.name_of(&tower)), hint),
            Some(tower) => (false, format!("joined to {}, not {}", self.name_of(&tower), self.name_of(&check.to)), hint),
            None => (false, "not joined to any tower".into(), hint),
        }
    }

    /// `from` and `to` are the two phones; `expect` is the call state
    /// (`established` when empty) the call between their extensions must hold.
    fn check_call(&self, check: &Check) -> Verdict {
        let hint = "Register both phones at the call manager, then dial the other extension from the phone window.".to_string();
        let ext = |id: &str| self.phones.get(id).map(|(_, e)| *e);
        let Some(from) = ext(&check.from) else {
            return (false, format!("{} is not registered", self.name_of(&check.from)), hint);
        };
        let Some(to) = ext(&check.to) else {
            return (false, format!("{} is not registered", self.name_of(&check.to)), hint);
        };
        let want = if check.expect.is_empty() { "established" } else { check.expect.as_str() };
        match self.calls.get(&from) {
            Some((callee, state)) if *callee == to => {
                (state == want, format!("call from {from} to {to} is {state}"), hint)
            }
            _ => (false, format!("no call from {from} to {to}"), hint),
        }
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
            "queues" => self.queues.get(&check.to).map_or(0, Vec::len),
            "capwap" => self.capwap.values().filter(|wlc| **wlc == check.to).count(),
            "pool-members" => self.lb_rows(&check.to).len(),
            "served" => self.lb_served_count(&check.to),
            scope => match scope.strip_prefix("bgp:") {
                Some(device) => self.bgp_sessions(device).iter().filter(|(_, _, state)| state == "established").count(),
                None => return (false, format!("unknown count scope '{scope}'"), "Use devices, leases, routes, reservations, queues, capwap, pool-members, served or bgp:<device>.".into()),
            },
        };
        (found >= least, format!("{found} found, {least} needed"), hint)
    }
}
