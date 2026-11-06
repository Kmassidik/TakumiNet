//! ssh login: users, a host key, and client keys trusted per user.
//!
//! This is a lab model, not cryptography. A device with no users still accepts
//! ssh as before, so old labs keep working. Once `username` is set, ssh needs
//! either a trusted client key or the matching password.

use super::*;
use std::collections::HashMap;

#[derive(Clone, Debug, PartialEq, Eq)]
pub struct SshUser {
    pub name: String,
    pub password: String,
}

#[derive(Clone, Debug)]
pub struct SshDevice {
    pub enabled: bool,
    pub users: Vec<SshUser>,
    pub authorized: Vec<(String, String)>,
    pub host_key: Option<String>,
}

impl Default for SshDevice {
    fn default() -> Self {
        Self { enabled: true, users: Vec::new(), authorized: Vec::new(), host_key: None }
    }
}

#[derive(Clone, Default)]
pub struct SshConfig {
    pub(super) devices: HashMap<String, SshDevice>,
    pub(super) clients: HashMap<String, String>,
}

fn fingerprint(seed: &str) -> String {
    let mut hash: u64 = 0xcbf2_9ce4_8422_2325;
    for byte in seed.bytes().chain([0x54, 0x41, 0x4b, 0x55, 0x4d, 0x49]) {
        hash ^= u64::from(byte);
        hash = hash.wrapping_mul(0x100_0000_01b3);
    }
    format!("SHA256:{hash:016x}")
}

impl Workspace {
    fn ssh_device_mut(&mut self, id: &str) -> &mut SshDevice {
        self.ssh.devices.entry(id.to_string()).or_default()
    }

    pub fn ssh_settings(&self, id: &str) -> SshDevice {
        self.ssh.devices.get(id).cloned().unwrap_or_default()
    }

    pub fn ssh_enabled(&self, id: &str) -> bool {
        self.ssh.devices.get(id).map_or(true, |d| d.enabled)
    }

    pub fn set_ssh_enabled(&mut self, id: &str, on: bool) {
        self.ssh_device_mut(id).enabled = on;
    }

    pub fn set_ssh_user(&mut self, id: &str, name: &str, password: &str) {
        let device = self.ssh_device_mut(id);
        if let Some(user) = device.users.iter_mut().find(|u| u.name == name) {
            user.password = password.to_string();
        } else {
            device.users.push(SshUser { name: name.to_string(), password: password.to_string() });
        }
    }

    pub fn remove_ssh_user(&mut self, id: &str, name: &str) {
        let device = self.ssh_device_mut(id);
        device.users.retain(|u| u.name != name);
        device.authorized.retain(|(user, _)| user != name);
    }

    /// `crypto key generate rsa`: a deterministic host identity for the lab.
    pub fn generate_host_key(&mut self, id: &str) -> String {
        let seed = format!("{id}:host");
        let key = fingerprint(&seed);
        self.ssh_device_mut(id).host_key = Some(key.clone());
        key
    }

    pub fn host_key(&self, id: &str) -> Option<String> {
        self.ssh.devices.get(id).and_then(|d| d.host_key.clone())
    }

    /// `ssh-keygen` on a PC: one key pair per device.
    pub fn generate_client_key(&mut self, id: &str) -> String {
        let key = fingerprint(&format!("{id}:client"));
        self.ssh.clients.insert(id.to_string(), key.clone());
        key
    }

    pub fn client_key(&self, id: &str) -> Option<String> {
        self.ssh.clients.get(id).cloned()
    }

    pub fn ssh_copy_id(&mut self, client: &str, host: &str, user: &str) -> Result<String, String> {
        let key = self.client_key(client).ok_or("no key: run ssh-keygen first")?;
        let device = self.ssh_device_mut(host);
        if !device.enabled {
            return Err("sshd is off on the target".into());
        }
        if !device.users.iter().any(|u| u.name == user) {
            return Err(format!("no such user '{user}' on the target"));
        }
        if device.host_key.is_none() {
            return Err("no host key: run crypto key generate rsa on the target".into());
        }
        device.authorized.retain(|(name, k)| !(name == user && *k == key));
        device.authorized.push((user.to_string(), key));
        Ok(format!("Number of key(s) added: 1 (user {user})\n"))
    }

    /// `None` on success; a plain reason otherwise. A device with users
    /// configured rejects a login that has neither a trusted key nor a password.
    pub fn ssh_authenticate(&self, client: &str, host: &str, user: &str, password: Option<&str>) -> Result<(), String> {
        let Some(settings) = self.ssh.devices.get(host) else {
            return Ok(());
        };
        if !settings.enabled {
            return Err("sshd is off on the target".into());
        }
        if settings.users.is_empty() {
            return Ok(());
        }
        if settings.host_key.is_none() {
            return Err("no host key: generate one on the target".into());
        }
        let Some(account) = settings.users.iter().find(|u| u.name == user) else {
            return Err("Permission denied (publickey,password).".into());
        };
        if let Some(key) = self.client_key(client) {
            if settings.authorized.iter().any(|(name, k)| name == user && *k == key) {
                return Ok(());
            }
        }
        if password == Some(account.password.as_str()) {
            return Ok(());
        }
        Err("Permission denied (publickey,password).".into())
    }

    pub(super) fn ssh_records(&self) -> String {
        let mut ids: Vec<_> = self.ssh.devices.keys().collect();
        ids.sort();
        let mut out = String::new();
        for id in ids {
            let device = &self.ssh.devices[id];
            out.push_str(&format!("sshenable\t{id}\t{}\n", u8::from(device.enabled)));
            if let Some(key) = &device.host_key {
                out.push_str(&format!("sshhost\t{id}\t{key}\n"));
            }
            for user in &device.users {
                out.push_str(&format!("sshuser\t{id}\t{}\t{}\n", user.name, user.password));
            }
            for (user, key) in &device.authorized {
                out.push_str(&format!("sshauth\t{id}\t{user}\t{key}\n"));
            }
        }
        let mut clients: Vec<_> = self.ssh.clients.iter().collect();
        clients.sort_by_key(|(id, _)| id.as_str());
        for (id, key) in clients {
            out.push_str(&format!("sshclient\t{id}\t{key}\n"));
        }
        out
    }

    pub(super) fn ssh_load(&mut self, fields: &[&str]) {
        match fields {
            ["sshenable", id, on] => self.set_ssh_enabled(id, *on == "1"),
            ["sshhost", id, key] => {
                self.ssh_device_mut(id).host_key = Some((*key).to_string());
            }
            ["sshuser", id, name, password] => self.set_ssh_user(id, name, password),
            ["sshauth", id, name, key] => {
                self.ssh_device_mut(id).authorized.push(((*name).to_string(), (*key).to_string()));
            }
            ["sshclient", id, key] => {
                self.ssh.clients.insert((*id).to_string(), (*key).to_string());
            }
            _ => {}
        }
    }
}
