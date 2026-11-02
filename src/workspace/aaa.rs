use super::*;

impl Workspace {
    pub fn aaa_add_user(&mut self, server: &str, user: &str, pass: &str) -> Result<(), String> {
        if !self.devices.iter().any(|d| d.id == server) {
            return Err("no such device".into());
        }
        let user = user.trim();
        if user.is_empty() || user.contains(' ') {
            return Err("invalid user name".into());
        }
        if pass.is_empty() {
            return Err("password required".into());
        }
        let list = self.aaa_users.entry(server.to_string()).or_default();
        if list.iter().any(|(u, _)| u == user) {
            return Err(format!("user {user} already exists"));
        }
        list.push((user.to_string(), pass.to_string()));
        list.sort_by(|a, b| a.0.cmp(&b.0));
        Ok(())
    }

    pub fn aaa_list(&self, server: &str) -> Vec<String> {
        self.aaa_users
            .get(server)
            .map(|l| l.iter().map(|(u, _)| u.clone()).collect())
            .unwrap_or_default()
    }

    /// 802.1X block: stored only (no EAP exchange is simulated).
    pub fn set_dot1x(&mut self, id: &str, enabled: bool, user: &str, password: &str) -> Result<(), String> {
        match self.devices.iter_mut().find(|d| d.id == id) {
            Some(d) => {
                d.dot1x = enabled;
                d.dot1x_user = (!user.trim().is_empty()).then(|| user.trim().to_string());
                d.dot1x_pass = (!password.trim().is_empty()).then(|| password.trim().to_string());
                Ok(())
            }
            None => Err("no such device".into()),
        }
    }
}
