use super::*;

const DEFAULT_ADMIN: (&str, &str) = ("admin", "admin");
const MIN_PASSWORD: usize = 6;

impl Workspace {
    pub(crate) fn home_router_id(&self, target: &str) -> Result<String, String> {
        let ip = crate::model::parse_ipv4(target);
        let found = self.devices.iter().find(|d| {
            d.id == target || (ip.is_some() && (d.ip == ip || d.ports.iter().any(|p| p.ip == ip)))
        });
        match found {
            Some(d) if d.kind == "homerouter" => Ok(d.id.clone()),
            Some(_) => Err(format!("Connection refused by {target} (no router page)")),
            None => Err(format!("Request timed out: no host answers for {target}")),
        }
    }

    fn admin_pair(&self, router: &str) -> (String, String) {
        self.aaa_users.get(router).and_then(|list| list.first().cloned())
            .unwrap_or_else(|| (DEFAULT_ADMIN.0.to_string(), DEFAULT_ADMIN.1.to_string()))
    }

    /// Open the router's admin page from `client`. The request is a real delivery,
    /// so it is captured and fails when the path is broken.
    pub fn router_login(&mut self, client: &str, target: &str, user: &str, pass: &str) -> Result<(), String> {
        let router = self.home_router_id(target)?;
        self.send_http(client, &router, target)
            .map_err(|_| format!("Request timed out while reaching {target}"))?;
        let (want_user, want_pass) = self.admin_pair(&router);
        let accepted = user == want_user && pass == want_pass;
        self.router_logins.push((client.to_string(), router, user.to_string(), accepted));
        if accepted {
            Ok(())
        } else {
            Err("401 Unauthorized: wrong user name or password".into())
        }
    }

    /// Whether `client` has really signed in against `target`'s page (`accepted`),
    /// or really been refused there (`!accepted`). The grader reads this instead
    /// of logging in by itself.
    pub fn router_login_seen(&self, client: &str, target: &str, accepted: bool) -> bool {
        let Ok(router) = self.home_router_id(target) else { return false };
        self.router_logins.iter()
            .any(|(c, r, _, ok)| c == client && *r == router && *ok == accepted)
    }

    pub fn set_router_admin(&mut self, router: &str, user: &str, pass: &str) -> Result<(), String> {
        if !self.devices.iter().any(|d| d.id == router && d.kind == "homerouter") {
            return Err("only a home router has an admin page".into());
        }
        let user = user.trim();
        if user.is_empty() || user.contains(char::is_whitespace) {
            return Err("invalid user name".into());
        }
        if pass.len() < MIN_PASSWORD {
            return Err(format!("the password needs at least {MIN_PASSWORD} characters"));
        }
        if pass == DEFAULT_ADMIN.1 {
            return Err("choose a password that is not the one on the sticker".into());
        }
        self.aaa_users.insert(router.to_string(), vec![(user.to_string(), pass.to_string())]);
        Ok(())
    }
}
