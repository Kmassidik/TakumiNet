use super::*;

impl Workspace {
    pub(super) fn iot_kind(kind: &str) -> bool {
        matches!(kind, "plc" | "thing" | "ioe" | "server" | "pc" | "laptop")
    }

    pub fn iot_write(&mut self, id: &str, addr: u16, value: u16) -> Result<u16, String> {
        let dev = self
            .devices
            .iter()
            .find(|d| d.id == id)
            .ok_or_else(|| "no such device".to_string())?;
        if !Self::iot_kind(&dev.kind) {
            return Err(format!("{} has no Modbus registers", dev.name));
        }
        let regs = self.iot_regs.entry(id.to_string()).or_insert_with(|| vec![0; 256]);
        let slot = regs.get_mut(addr as usize).ok_or("register out of range (0-255)")?;
        let old = *slot;
        *slot = value;
        Ok(old)
    }

    pub fn iot_read(&mut self, id: &str, addr: u16) -> Result<u16, String> {
        let dev = self
            .devices
            .iter()
            .find(|d| d.id == id)
            .ok_or_else(|| "no such device".to_string())?;
        if !Self::iot_kind(&dev.kind) {
            return Err(format!("{} has no Modbus registers", dev.name));
        }
        let regs = self.iot_regs.entry(id.to_string()).or_insert_with(|| vec![0; 256]);
        regs.get(addr as usize)
            .copied()
            .ok_or_else(|| "register out of range (0-255)".to_string())
    }

    pub fn ptp_sync(&mut self, master: &str, slave: &str) -> Result<f64, String> {
        if !self.devices.iter().any(|d| d.id == master)
            || !self.devices.iter().any(|d| d.id == slave)
        {
            return Err("no such device".into());
        }
        if master == slave {
            return Err("master and slave are the same device".into());
        }
        let offset = 0.0;
        self.ptp.insert(slave.to_string(), (master.to_string(), offset));
        Ok(offset)
    }

    pub fn ptp_status(&self, slave: &str) -> Option<(String, f64)> {
        self.ptp.get(slave).cloned()
    }

    pub fn prp_enable(&mut self, id: &str, on: bool) -> Result<(), String> {
        if !self.devices.iter().any(|d| d.id == id) {
            return Err("no such device".into());
        }
        if on {
            self.prp_on.insert(id.to_string());
        } else {
            self.prp_on.remove(id);
            self.prp_seen.remove(id);
        }
        Ok(())
    }

    pub fn cell_join(&mut self, client: &str, tower: &str) -> Result<(), String> {
        let cdev = self
            .devices
            .iter()
            .find(|d| d.id == client)
            .ok_or_else(|| "no such device".to_string())?;
        if matches!(cdev.kind.as_str(), "celltower" | "router" | "switch") {
            return Err("only client devices associate with a cell tower".into());
        }
        if !self
            .devices
            .iter()
            .any(|d| d.id == tower && d.kind == "celltower")
        {
            return Err("no such cell tower".into());
        }
        self.cell_links.insert(client.to_string(), tower.to_string());
        Ok(())
    }

    pub fn cell_status(&self, client: &str) -> Option<String> {
        self.cell_links.get(client).cloned()
    }

    /// Send one industrial protocol PDU. The frame path is the normal routed
    /// path, except for cellular traffic, which goes client -> tower -> client.
    /// Modbus also performs the register read on the destination.
    pub fn send_iot(&mut self, src: &str, dst: &str, proto: &str, seq: u32) -> Result<String, String> {
        let proto = proto.to_ascii_lowercase();
        let (label, size) = match proto.as_str() {
            "modbus" => ("MODBUS", 12usize),
            "profinet" => ("PROFINET", 64),
            "prp" => ("PRP", 98),
            "ptp" => ("PTP", 44),
            "cellular" => ("Cellular", 60),
            _ => return Err("unknown protocol".into()),
        };
        let sdev = self
            .devices
            .iter()
            .find(|d| d.id == src)
            .ok_or_else(|| "no such source".to_string())?;
        let ddev = self
            .devices
            .iter()
            .find(|d| d.id == dst)
            .ok_or_else(|| "no such destination".to_string())?;
        match proto.as_str() {
            "modbus" | "profinet" => {
                if !Self::iot_kind(&sdev.kind) || !Self::iot_kind(&ddev.kind) {
                    return Err(format!("{label} needs industrial endpoints"));
                }
            }
            "prp" => {
                if !self.prp_on.contains(src) || !self.prp_on.contains(dst) {
                    return Err("both ends must have PRP enabled".into());
                }
                let seen = self.prp_seen.entry(dst.to_string()).or_default();
                if seen.contains(&seq) {
                    return Ok(format!("{label} duplicate seq {seq} suppressed at {}", ddev.name));
                }
                seen.push(seq);
                if seen.len() > 64 {
                    seen.remove(0);
                }
            }
            "ptp" => {
                self.ptp_sync(src, dst)?;
            }
            "cellular" => {
                let a = self.cell_links.get(src);
                let b = self.cell_links.get(dst);
                if a.is_none() || a != b {
                    return Err("both devices must be associated with the same cell tower".into());
                }
            }
            _ => {}
        }

        if proto != "cellular" {
            return match crate::net::fwd::deliver(self, src, dst) {
                Ok(delivery) => {
                    self.record_delivery(src, dst, label, delivery)?;
                    Ok(format!("{label} delivered"))
                }
                Err(error) => {
                    let reason = error.reason.clone();
                    let _ = self.record_drop(src, dst, label, error);
                    Err(reason)
                }
            };
        }

        let tower = self.cell_links[src].clone();
        let path = vec![src.to_string(), tower.clone(), dst.to_string()];
        self.next_event += 1;
        self.push_event(Event {
            id: self.next_event,
            time: self.sim_time,
            last: self.name_of(src),
            at: self.name_of(dst),
            kind: label.into(),
            proto: label.into(),
            path,
            hops: Vec::new(),
            layers: vec![Layer::new(
                label,
                vec![("Capture".into(), "Control-plane service exchange".into())],
            )],
            status: "Successful".into(),
            reason: None,
            note: format!("{} sends {label} through cell tower {} to {}", self.name_of(src), tower, self.name_of(dst)),
            bytes: Vec::new(),
            size,
        });
        let line = format!("{} -> {} {label}", self.name_of(src), self.name_of(dst));
        self.syslog_record(src, "info", &line);
        self.syslog_record(dst, "info", &line);
        Ok(format!("{label} delivered"))
    }

    pub fn phone_register(&mut self, phone: &str, cm: &str, ext: u16) -> Result<(), String> {
        if !self.devices.iter().any(|d| d.id == phone) {
            return Err("no such device".into());
        }
        let addr = crate::model::parse_ipv4(cm);
        if addr.is_none() || !self.devices.iter().any(|d| d.ip == addr) {
            return Err(format!("no call manager at {cm}"));
        }
        if ext == 0 {
            return Err("invalid extension".into());
        }
        self.phones.insert(phone.to_string(), (cm.to_string(), ext));
        Ok(())
    }

    pub fn phone_status(&self, phone: &str) -> Option<(String, u16)> {
        self.phones.get(phone).cloned()
    }
}
