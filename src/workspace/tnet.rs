use super::*;
use crate::storage::xml::{self, Element};

const RECORDS: &[(&str, &[&str])] = &[
    ("device", &["id", "kind", "model", "x", "y", "name", "ip", "prefix"]),
    ("link", &["a", "a_port", "b", "b_port", "kind"]),
    ("net", &["id", "gw", "dns"]),
    ("route", &["id", "net", "prefix", "via", "admin_distance"]),
    ("port", &["id", "name", "up", "ip", "prefix", "vlan", "trunk", "dot1q", "bandwidth_kbps", "delay_us"]),
    ("vlan", &["id", "vlan", "name"]),
    ("pool", &["id", "network", "prefix", "gw", "dns"]),
    ("dhcpclient", &["id"]),
    ("banner", &["id", "text"]),
    ("linepw", &["id", "pw"]),
    ("v6", &["id", "auto", "addr", "prefix", "gw", "dns"]),
    ("dot1x", &["id", "enabled", "user", "pass"]),
    ("power", &["id", "state"]),
    ("module", &["id", "slot", "model"]),
    ("dns", &["id", "name", "ip"]),
    ("page", &["id", "body"]),
    ("reserve", &["server", "client", "ip"]),
    ("helper", &["router", "iface", "ip"]),
    ("mailuser", &["server", "user", "pass"]),
    ("mail", &["server", "from", "to", "subject", "body", "read"]),
    ("tftp", &["server", "name", "content"]),
    ("ftp", &["server", "name", "content"]),
    ("ntp", &["client", "server", "offset"]),
    ("syslogon", &["device"]),
    ("syslog", &["device", "time", "severity", "text"]),
    ("aaa", &["server", "user", "pass"]),
    ("portsec", &["dev", "iface", "max", "macs"]),
    ("channel", &["dev", "iface", "group", "mode"]),
    ("stpmode", &["dev", "mode"]),
    ("stppriority", &["dev", "vlan", "priority"]),
    ("acl", &["dev", "num", "action", "src", "swc", "dip", "dwc"]),
    ("aclbind", &["dev", "iface", "num", "dir"]),
    ("v6net", &["dev", "net"]),
    ("inspect", &["dev"]),
    ("ips", &["dev", "proto"]),
    ("iot", &["dev", "addr", "value"]),
    ("ptp", &["slave", "master", "offset"]),
    ("prpon", &["dev"]),
    ("cell", &["client", "tower"]),
    ("wlan", &["wlc", "ssid", "psk", "security"]),
    ("capwap", &["ap", "wlc"]),
    ("wifi", &["client", "ssid", "wlc"]),
    ("vpn", &["client", "server", "user"]),
    ("pppoe", &["client", "server", "user"]),
    ("phone", &["phone", "cm", "ext"]),
    ("routing", &["dev", "proto", "process_id"]),
    ("routenet", &["dev", "net", "prefix", "area"]),
    ("natrole", &["dev", "iface", "dir"]),
    ("natrule", &["dev", "num", "iface"]),
];

impl Workspace {
    pub fn to_tnet(&self) -> String {
        let mut elements = Vec::new();
        for line in self.to_records().lines() {
            if line.starts_with('#') || line.is_empty() {
                continue;
            }
            let fields: Vec<&str> = line.split('\t').collect();
            let Some((_, names)) = RECORDS.iter().find(|(name, _)| *name == fields[0]) else {
                continue;
            };
            let mut element = Element::new(fields[0]);
            for (index, value) in fields.iter().skip(1).enumerate() {
                let name = names.get(index).map(|name| name.to_string())
                    .unwrap_or_else(|| format!("v{}", index - names.len()));
                element.attributes.push((name, value.to_string()));
            }
            elements.push(element);
        }
        elements.extend(self.unknown_elements.iter().cloned());
        xml::write("1", &elements)
    }

    pub fn from_tnet(text: &str) -> Option<Workspace> {
        let (version, elements) = xml::read(text)?;
        if version != "1" {
            return None;
        }
        let mut ws = Workspace::empty();
        for element in elements {
            let Some((_, names)) = RECORDS.iter().find(|(name, _)| *name == element.name) else {
                ws.unknown_elements.push(element);
                continue;
            };
            let mut fields = Vec::with_capacity(names.len() + 1);
            fields.push(element.name.as_str());
            fields.extend(names.iter().map(|name| element.get(name).unwrap_or("")));
            let mut trailing: Vec<(usize, &str)> = element.attributes.iter()
                .filter_map(|(name, value)| {
                    name.strip_prefix('v')
                        .and_then(|number| number.parse::<usize>().ok())
                        .map(|number| (number, value.as_str()))
                })
                .collect();
            trailing.sort_by_key(|(number, _)| *number);
            fields.extend(trailing.into_iter().map(|(_, value)| value));
            ws.load_record(&fields)?;
        }
        ws.finish_record_load();
        Some(ws)
    }
}
