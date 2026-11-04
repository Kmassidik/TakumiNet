use super::*;

impl Workspace {
    /// The one phone registered as `ext`, as (device id, call-manager address).
    fn phone_of(&self, ext: u16) -> Result<(String, String), String> {
        let mut hits = self.phones.iter().filter(|(_, (_, e))| *e == ext);
        match (hits.next(), hits.next()) {
            (Some((id, (cm, _))), None) => Ok((id.clone(), cm.clone())),
            (None, _) => Err(format!("no phone is registered as extension {ext}")),
            _ => Err(format!("extension {ext} is registered more than once")),
        }
    }

    /// The device that carries a phone's traffic: the phone itself when it is
    /// addressed, or the router its phone cable hangs on for an analog phone.
    fn call_leg(&self, phone: &str) -> Result<String, String> {
        let device = self
            .devices
            .iter()
            .find(|d| d.id == phone)
            .ok_or_else(|| format!("no such phone: {phone}"))?;
        if device.ip.is_some() || device.ports.iter().any(|p| p.ip.is_some()) {
            return Ok(device.id.clone());
        }
        if device.kind == "analogphone" {
            return self
                .links
                .iter()
                .find_map(|l| {
                    if l.kind != "ePhone" {
                        None
                    } else if l.a == phone {
                        Some(l.b.clone())
                    } else if l.b == phone {
                        Some(l.a.clone())
                    } else {
                        None
                    }
                })
                .ok_or_else(|| {
                    format!("{} needs a phone cable to a router", self.name_of(phone))
                });
        }
        Err(format!("{} has no IPv4 address", self.name_of(phone)))
    }

    /// Place a call: both extensions must sit at the same call manager and
    /// both legs must reach it over IP. Reachability is probed on a copy, so
    /// only the call itself lands in the capture.
    pub fn call(&mut self, from_ext: u16, to_ext: u16) -> Result<String, String> {
        if from_ext == 0 || to_ext == 0 {
            return Err("invalid extension".into());
        }
        if from_ext == to_ext {
            return Err("a phone cannot call its own extension".into());
        }
        let (from_phone, from_cm) = self.phone_of(from_ext)?;
        let (to_phone, to_cm) = self.phone_of(to_ext)?;
        if from_cm != to_cm {
            return Err(format!(
                "extensions {from_ext} and {to_ext} are registered to different call managers"
            ));
        }
        let cm_addr = crate::model::parse_ipv4(&from_cm);
        let cm = self
            .devices
            .iter()
            .find(|d| cm_addr.is_some() && d.ip == cm_addr)
            .map(|d| d.id.clone())
            .ok_or_else(|| format!("no call manager at {from_cm}"))?;
        let from_leg = self.call_leg(&from_phone)?;
        let to_leg = self.call_leg(&to_phone)?;
        self.clone()
            .send_addressed_pdu(&from_leg, &cm)
            .map_err(|e| format!("{} cannot reach the call manager: {e}", self.name_of(&from_phone)))?;
        self.clone()
            .send_addressed_pdu(&cm, &to_leg)
            .map_err(|e| format!("the call manager cannot reach {}: {e}", self.name_of(&to_phone)))?;
        self.calls.insert(from_ext, (to_ext, "established".into()));
        self.record_call_event(&from_phone, &to_phone, &cm, from_ext, to_ext);
        Ok(format!("call from {from_ext} to {to_ext} established"))
    }

    /// The call an extension takes part in, as (caller, callee, state).
    pub fn call_of(&self, ext: u16) -> Option<(u16, u16, String)> {
        self.calls
            .iter()
            .find(|(from, (to, _))| **from == ext || *to == ext)
            .map(|(from, (to, state))| (*from, *to, state.clone()))
    }

    fn record_call_event(&mut self, from: &str, to: &str, cm: &str, from_ext: u16, to_ext: u16) {
        let path = self
            .path(from, to)
            .unwrap_or_else(|| vec![from.to_string(), to.to_string()]);
        self.next_event += 1;
        self.sim_time += 0.001;
        let note = format!(
            "{} calls extension {to_ext} on {} through {}",
            self.name_of(from),
            self.name_of(to),
            self.name_of(cm)
        );
        self.push_event(Event {
            id: self.next_event,
            time: self.sim_time,
            last: self.name_of(from),
            at: self.name_of(to),
            kind: "SIP".into(),
            proto: "SIP".into(),
            path,
            hops: Vec::new(),
            layers: vec![Layer::new(
                "SIP",
                vec![
                    ("Capture".into(), "Control-plane service exchange".into()),
                    ("Caller".into(), from_ext.to_string()),
                    ("Callee".into(), to_ext.to_string()),
                    ("State".into(), "established".into()),
                ],
            )],
            status: "Successful".into(),
            reason: None,
            note,
            bytes: Vec::new(),
            size: 480,
        });
        let line = format!("call {from_ext} -> {to_ext} established");
        self.syslog_record(from, "info", &line);
        self.syslog_record(to, "info", &line);
    }

    /// One `call` record per live call, in extension order.
    pub(super) fn write_calls(&self, out: &mut String) {
        let mut calls: Vec<_> = self.calls.iter().collect();
        calls.sort();
        for (from, (to, state)) in calls {
            out.push_str(&format!("call\t{from}\t{to}\t{state}\n"));
        }
    }
}
