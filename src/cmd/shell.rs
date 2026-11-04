//! The parts of the terminal that are not one network tool: who and where you
//! are, `ip`, and opening a session on another device.

use super::{arp, dev, ping};
use crate::model::ipv4_string;
use crate::workspace::Workspace;

/// The prompt: `name@address:~$`, or `name@localhost:~$` before an address is set.
pub fn prompt(ws: &Workspace, id: &str) -> String {
    match dev(ws, id) {
        Some(d) => {
            let place = d.ip.map(ipv4_string).unwrap_or_else(|| "localhost".into());
            format!("{}@{}:~$", d.name, place)
        }
        None => "$".into(),
    }
}

pub(super) fn run_extra(ws: &mut Workspace, id: &str, verb: &str, args: &[&str], root: bool) -> Option<String> {
    Some(match verb {
        "hostname" => format!("{}\n", dev(ws, id)?.name),
        "whoami" => if root { "root\n".into() } else { "user\n".to_string() },
        "ip" => ip(ws, id, args),
        "ufw" => super::ufw::run(ws, id, root, args),
        "ping" if args.contains(&"-c") => {
            let swapped: Vec<&str> = args.iter().map(|a| if *a == "-c" { "-n" } else { *a }).collect();
            ping(ws, id, &swapped)
        }
        "ssh" | "console" => connect(ws, id, verb, args).0,
        _ => return None,
    })
}

fn ip(ws: &mut Workspace, id: &str, args: &[&str]) -> String {
    let Some(d) = dev(ws, id) else { return String::new() };
    match args.first().copied().unwrap_or("") {
        "addr" | "a" | "address" | "" => {
            let mac = crate::net::packet::Mac::for_device(&d.id);
            let mut out = String::from("1: lo: <LOOPBACK,UP> mtu 65536\n    inet 127.0.0.1/8\n");
            out.push_str("2: eth0: <BROADCAST,MULTICAST,UP> mtu 1500\n");
            out.push_str(&format!("    link/ether {mac}\n"));
            match d.ip {
                Some(address) => out.push_str(&format!("    inet {}/{}\n", ipv4_string(address), d.prefix)),
                None => out.push_str("    (no IPv4 address set)\n"),
            }
            out
        }
        "route" | "r" => {
            let mut out = String::new();
            if let Some(gateway) = d.gateway {
                out.push_str(&format!("default via {} dev eth0\n", ipv4_string(gateway)));
            }
            if let Some(address) = d.ip {
                let network = address & crate::model::mask_of(d.prefix);
                out.push_str(&format!(
                    "{}/{} dev eth0 proto kernel scope link src {}\n",
                    ipv4_string(network),
                    d.prefix,
                    ipv4_string(address)
                ));
            }
            if out.is_empty() { "(no routes: set an address first)\n".into() } else { out }
        }
        "neigh" | "n" | "neighbour" => arp(ws, id, "-a"),
        _ => "Usage: ip addr | ip route | ip neigh\n".into(),
    }
}

/// `telnet`, `ssh` and `console`: the text to show, and the device whose
/// command line the terminal now talks to.
pub fn connect(ws: &mut Workspace, id: &str, verb: &str, args: &[&str]) -> (String, Option<String>) {
    if verb == "console" {
        return match ws.console_peer(id).map(str::to_string) {
            Some(peer) => {
                let name = dev(ws, &peer).map(|d| d.name.clone()).unwrap_or_default();
                (format!("Connected to {name} over the console cable.\n\n"), Some(peer))
            }
            None => (
                "console: no console cable plugged into this device.\nUse the Console cable from the palette, then try again.\n".into(),
                None,
            ),
        };
    }
    let target = args.last().copied().unwrap_or("");
    let host = target.rsplit('@').next().unwrap_or(target);
    if verb == "telnet" {
        return super::telnet(ws, id, host);
    }
    if host.is_empty() {
        return ("Usage: ssh [user@]<host>\n".into(), None);
    }
    let (text, peer) = super::telnet(ws, id, host);
    match peer {
        Some(_) => (format!("Connected to {host}.\n\n"), peer),
        None if text.contains("Connection closed") => (format!("ssh: connect to host {host} port 22: No route to host\n"), None),
        None => (format!("ssh: connect to host {host} port 22: Connection refused\n"), None),
    }
}
