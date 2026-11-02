use super::*;

impl Workspace {
    /// Register a mailbox user on a server.
    pub fn add_mail_user(&mut self, server: &str, user: &str, pass: &str) -> Result<(), String> {
        if !self.devices.iter().any(|d| d.id == server) {
            return Err("no such device".into());
        }
        let user = user.trim();
        let pass = pass.trim();
        if user.is_empty() || pass.is_empty() {
            return Err("user and password are required".into());
        }
        let list = self.mail_users.entry(server.to_string()).or_default();
        if list.iter().any(|(u, _)| u == user) {
            return Err(format!("user {user} already exists"));
        }
        list.push((user.to_string(), pass.to_string()));
        list.sort_by(|a, b| a.0.cmp(&b.0));
        Ok(())
    }

    /// Deliver a message and capture an SMTP event.
    pub fn send_mail(
        &mut self,
        client: &str,
        server: &str,
        from: &str,
        to: &str,
        subject: &str,
        body: &str,
    ) -> Result<(), String> {
        let users = self.mail_users.get(server).cloned().unwrap_or_default();
        if !users.iter().any(|(u, _)| u == from) {
            return Err(format!("unknown sender: {from}"));
        }
        if !users.iter().any(|(u, _)| u == to) {
            return Err(format!("unknown recipient: {to}"));
        }
        self.mail.entry(server.to_string()).or_default().push(Mail {
            from: from.to_string(),
            to: to.to_string(),
            subject: subject.to_string(),
            body: body.to_string(),
            read: false,
        });
        let path = self
            .path(client, server)
            .unwrap_or_else(|| vec![client.to_string(), server.to_string()]);
        self.next_event += 1;
        self.sim_time += 0.001;
        self.events.push(Event {
            id: self.next_event,
            time: self.sim_time,
            last: self.name_of(client),
            at: self.name_of(server),
            kind: "SMTP".into(),
            proto: "SMTP".into(),
            path,
            hops: Vec::new(),
            size: 900,
        });
        Ok(())
    }

    pub fn mail_list(&self, server: &str, user: &str) -> Vec<Mail> {
        self.mail
            .get(server)
            .map(|l| l.iter().filter(|m| m.to == user).cloned().collect())
            .unwrap_or_default()
    }

    /// TFTP put; an empty body removes the file.
    pub fn tftp_put(&mut self, server: &str, name: &str, content: &str) -> Result<(), String> {
        if !self.devices.iter().any(|d| d.id == server) {
            return Err("no such device".into());
        }
        let name = name.trim();
        if name.is_empty() || name.contains('/') || name.contains('\\') {
            return Err("invalid file name".into());
        }
        let list = self.tftp.entry(server.to_string()).or_default();
        if content.is_empty() {
            let before = list.len();
            list.retain(|(n, _)| n != name);
            if list.len() == before {
                return Err(format!("no such file: {name}"));
            }
        } else {
            list.retain(|(n, _)| n != name);
            list.push((name.to_string(), content.to_string()));
            list.sort_by(|a, b| a.0.cmp(&b.0));
        }
        Ok(())
    }

    pub fn tftp_list(&self, server: &str) -> Vec<String> {
        self.tftp
            .get(server)
            .map(|l| l.iter().map(|(n, _)| n.clone()).collect())
            .unwrap_or_default()
    }

    pub fn tftp_get(&self, server: &str, name: &str) -> Option<String> {
        self.tftp
            .get(server)
            .and_then(|l| l.iter().find(|(n, _)| n == name).map(|(_, c)| c.clone()))
    }

    /// FTP put; an empty body removes the file.
    pub fn ftp_put(&mut self, server: &str, name: &str, content: &str) -> Result<(), String> {
        if !self.devices.iter().any(|d| d.id == server) {
            return Err("no such device".into());
        }
        let name = name.trim();
        if name.is_empty() || name.contains('/') || name.contains('\\') {
            return Err("invalid file name".into());
        }
        let list = self.ftp.entry(server.to_string()).or_default();
        if content.is_empty() {
            let before = list.len();
            list.retain(|(n, _)| n != name);
            if list.len() == before {
                return Err(format!("no such file: {name}"));
            }
        } else {
            list.retain(|(n, _)| n != name);
            list.push((name.to_string(), content.to_string()));
            list.sort_by(|a, b| a.0.cmp(&b.0));
        }
        Ok(())
    }

    pub fn ftp_list(&self, server: &str) -> Vec<String> {
        self.ftp
            .get(server)
            .map(|l| l.iter().map(|(n, _)| n.clone()).collect())
            .unwrap_or_default()
    }

    /// Point a device at an NTP server: the server must exist and have an address.
    /// The offset is deterministic (the simulator has one clock) and reported
    /// so `show ntp` can render it.
    pub fn ntp_sync(&mut self, client: &str, server_ip: &str) -> Result<f64, String> {
        if !self.devices.iter().any(|d| d.id == client) {
            return Err("no such device".into());
        }
        if crate::model::parse_ipv4(server_ip).is_none() {
            return Err("invalid server address".into());
        }
        let addr = crate::model::parse_ipv4(server_ip);
        if !self.devices.iter().any(|d| {
            d.ip == addr || d.ports.iter().any(|p| p.ip == addr)
        }) {
            return Err(format!("no device at {server_ip}"));
        }
        let offset = 0.0;
        self.ntp
            .insert(client.to_string(), (server_ip.to_string(), offset));
        Ok(offset)
    }

    pub fn ntp_status(&self, client: &str) -> Option<(String, f64)> {
        self.ntp.get(client).cloned()
    }

    pub fn syslog_enable(&mut self, device: &str, on: bool) -> Result<(), String> {
        if !self.devices.iter().any(|d| d.id == device) {
            return Err("no such device".into());
        }
        if on {
            self.syslog_on.insert(device.to_string());
        } else {
            self.syslog_on.remove(device);
            self.syslog.remove(device);
        }
        Ok(())
    }

    pub fn syslog_record(&mut self, device: &str, severity: &str, text: &str) {
        if !self.syslog_on.contains(device) {
            return;
        }
        let entry = (self.sim_time, severity.to_string(), text.to_string());
        let list = self.syslog.entry(device.to_string()).or_default();
        list.push(entry);
        if list.len() > 200 {
            list.remove(0);
        }
    }

    pub fn syslog_list(&self, device: &str) -> Vec<(f32, String, String)> {
        self.syslog.get(device).cloned().unwrap_or_default()
    }

    pub fn set_http_page(&mut self, id: &str, body: &str) -> bool {
        if !self.devices.iter().any(|d| d.id == id) {
            return false;
        }
        if body.trim().is_empty() {
            self.http_pages.remove(id);
        } else {
            self.http_pages.insert(id.to_string(), body.to_string());
        }
        true
    }
}
