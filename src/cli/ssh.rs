//! Configuration commands for ssh: users, host key and the sshd switch.

use super::*;

pub(crate) fn username(ws: &mut Workspace, id: &str, _s: &mut Session, line: &str, lower: &str) -> String {
    let words: Vec<&str> = line.split_whitespace().collect();
    if lower.starts_with("no username ") {
        let Some(name) = words.get(2) else {
            return "ERROR: need a user name\n".into();
        };
        ws.remove_ssh_user(id, name);
        return String::new();
    }
    let Some(name) = words.get(1) else {
        return "ERROR: need a user name\n".into();
    };
    let Some(pos) = words.iter().position(|w| *w == "password" || *w == "secret") else {
        return "ERROR: need 'username NAME password WORD'\n".into();
    };
    let Some(password) = words.get(pos + 1) else {
        return "ERROR: need a password\n".into();
    };
    ws.set_ssh_user(id, name, password);
    String::new()
}

pub(crate) fn crypto(ws: &mut Workspace, id: &str, _s: &mut Session, _line: &str, lower: &str) -> String {
    if lower != "crypto key generate rsa" {
        return "ERROR: only 'crypto key generate rsa' is modelled\n".into();
    }
    let name = ws.devices.iter().find(|d| d.id == id).map(|d| d.name.clone()).unwrap_or_default();
    let key = ws.generate_host_key(id);
    format!("The key name will be: {name}.takumi\nThe keys were generated:\n  Host key fingerprint: {key}\n")
}

pub(crate) fn ip_ssh(ws: &mut Workspace, id: &str, _s: &mut Session, _line: &str, lower: &str) -> String {
    if lower.starts_with("no ip ssh") {
        ws.set_ssh_enabled(id, false);
        return String::new();
    }
    if lower == "ip ssh version 2" {
        ws.set_ssh_enabled(id, true);
        return String::new();
    }
    "ERROR: only 'ip ssh version 2' is modelled\n".into()
}
