//! Lesson checks for the round-2 features: duplex, LLDP, a blocked page and
//! Wi-Fi channel overlap.

use super::*;

type Verdict = (bool, String, String);

impl Workspace {
    pub(super) fn run_round2_check(&mut self, check: &Check) -> Option<Verdict> {
        Some(match check.kind.as_str() {
            "duplex" => self.check_duplex(check),
            "lldp" => self.check_lldp(check),
            "blocked-http" => self.check_blocked_http(check),
            "overlap" => self.check_overlap(check),
            "absent" => self.check_absent(check),
            "errdisabled" => self.check_errdisabled(check),
            "gateway" => self.check_gateway(check),
            _ => return None,
        })
    }

    /// `from` is the device, `to` the interface: the cable must negotiate duplex.
    fn check_duplex(&self, check: &Check) -> Verdict {
        let hint = "Set both ends of the cable to the same speed and duplex; auto on both also works.".to_string();
        match self.negotiated(&check.from, &check.to) {
            Some(n) if !n.duplex_mismatch() => (
                true,
                format!("{} Mb/s, {} duplex", n.speed, if n.full { "full" } else { "half" }),
                hint,
            ),
            Some(n) => (
                false,
                format!("duplex mismatch: this end is {} duplex", if n.full { "full" } else { "half" }),
                hint,
            ),
            None => (false, "no negotiated link on that port".into(), hint),
        }
    }

    /// `from` is the local device, `to` the neighbour it must see over LLDP.
    fn check_lldp(&self, check: &Check) -> Verdict {
        let hint = "Bring the access port up, then run show lldp neighbors on the switch.".to_string();
        let Some(peer) = self.devices.iter().find(|d| d.id == check.to) else {
            return (false, format!("unknown neighbour {}", check.to), "Fix the lesson device reference.".into());
        };
        let table = crate::cli::show_tables::lldp_neighbors(self, &check.from);
        if table.contains(&peer.name) {
            (true, format!("LLDP sees {}", peer.name), hint)
        } else {
            (false, format!("LLDP has no entry for {}", peer.name), hint)
        }
    }

    /// `url` must be refused from `from`, for example by a host firewall rule.
    fn check_blocked_http(&mut self, check: &Check) -> Verdict {
        let hint = "Deny the guest subnet on the server, keeping the office subnet allowed.".to_string();
        match crate::webapp::fetch(self, &check.from, &check.url) {
            Ok(page) => (false, format!("page still loaded: {}", page.title), hint),
            Err(error) => (true, format!("blocked: {error}"), hint),
        }
    }

    /// `from` device: its default gateway must equal the address in `expect`.
    fn check_gateway(&self, check: &Check) -> Verdict {
        let hint = "Renew the lease after fixing the DHCP path; the gateway shown by ipconfig must be the real router.".to_string();
        let want = crate::model::parse_ipv4(&check.expect);
        let Some(dev) = self.devices.iter().find(|d| d.id == check.from) else {
            return (false, format!("unknown device {}", check.from), "Fix the lesson device reference.".into());
        };
        match (dev.gateway, want) {
            (Some(got), Some(want)) if got == want => (
                true,
                format!("gateway {}", crate::model::ipv4_string(got)),
                hint,
            ),
            (Some(got), _) => (
                false,
                format!("wrong gateway {} (wanted {})", crate::model::ipv4_string(got), check.expect),
                hint,
            ),
            (None, _) => (false, "no gateway yet; renew the lease".into(), hint),
        }
    }

    /// `from` device, `to` port: the port must be err-disabled.
    fn check_errdisabled(&self, check: &Check) -> Verdict {
        let hint = "Enable BPDU guard on the access port, then shut and reopen it.".to_string();
        match self.errdisabled_reason(&check.from, &check.to) {
            Some(reason) => (true, reason.to_string(), hint),
            None => (false, format!("{} {} is not err-disabled", check.from, check.to), hint),
        }
    }

    /// No device of the kind in `to` may remain in the workspace.
    fn check_absent(&self, check: &Check) -> Verdict {
        let hint = "Remove the device the lesson asks you to replace.".to_string();
        let found = self.devices.iter().filter(|d| d.kind == check.to).count();
        if found == 0 {
            (true, format!("no {} left", check.to), hint)
        } else {
            (false, format!("{found} {} still in the lab", check.to), hint)
        }
    }

    /// `from` is an access point: no other 2.4 GHz AP may overlap it.
    fn check_overlap(&self, check: &Check) -> Verdict {
        let hint = "Move one access point to channel 1, 6 or 11.".to_string();
        let overlaps = self.overlaps_with(&check.from);
        if overlaps.is_empty() {
            (true, "no channel overlap".into(), hint)
        } else {
            (false, format!("channel overlap with {}", overlaps.join(", ")), hint)
        }
    }
}
