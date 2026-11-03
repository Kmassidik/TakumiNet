use super::*;
use crate::storage::xml::{self, Element};
use std::collections::{HashMap, HashSet};

const CURRENT_TNET_VERSION: u32 = 1;
const MAX_DEVICES: usize = 2_000;

const RECORDS: &[(&str, &[&str])] = &[
    ("device", &["id", "kind", "model", "x", "y", "name", "ip", "prefix"]),
    ("link", &["a", "a_port", "b", "b_port", "kind"]),
    ("net", &["id", "gw", "dns"]),
    ("route", &["id", "net", "prefix", "via", "admin_distance"]),
    ("lesson", &["id", "title", "level", "minutes", "goal"]),
    ("step", &["n", "text"]),
    ("check", &["id", "kind", "from", "to", "url", "expect", "label"]),
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

        let mut used = HashSet::new();
        for element in &mut elements {
            let key = record_key(element);
            if let Some((index, extra)) = self.record_extras.iter().enumerate()
                .find(|(index, extra)| !used.contains(index) && extra.element == element.name && extra.key == key)
            {
                element.attributes.extend(extra.attributes.iter().cloned());
                used.insert(index);
            }
        }
        elements.extend(self.unknown_elements.iter().cloned());
        xml::write("1", &elements)
    }

    /// Strict native load: either a complete valid workspace or all problems.
    pub fn from_tnet(text: &str) -> Result<Workspace, Vec<Problem>> {
        Self::load_tnet(text, false)
    }

    /// Recover a semantically damaged document by omitting only bad records.
    /// XML syntax, version and resource-limit failures remain unrecoverable.
    pub fn from_tnet_open_anyway(text: &str) -> Result<Workspace, Vec<Problem>> {
        Self::load_tnet(text, true)
    }

    fn load_tnet(text: &str, recover: bool) -> Result<Workspace, Vec<Problem>> {
        let (version, mut elements) = xml::read(text).map_err(|error| {
            vec![Problem::fatal(error.line, &error.element, &error.attribute, error.message)]
        })?;
        let mut version = version.parse::<u32>().map_err(|_| {
            vec![Problem::fatal(1, "takuminet", "version", "schema version must be a non-negative integer")]
        })?;
        if version > CURRENT_TNET_VERSION {
            return Err(vec![Problem::fatal(
                1,
                "takuminet",
                "version",
                format!("version {version} was made by a newer TakumiNet (current version is {CURRENT_TNET_VERSION})"),
            )]);
        }
        while version < CURRENT_TNET_VERSION {
            elements = match version {
                0 => migrate_0_to_1(elements),
                _ => unreachable!("all older versions have an ordered migration"),
            };
            version += 1;
        }

        let mut valid = vec![true; elements.len()];
        let mut problems = Vec::new();
        let mut device_records = HashMap::new();
        let mut device_count = 0usize;
        for (index, element) in elements.iter().enumerate() {
            if element.name != "device" {
                continue;
            }
            device_count += 1;
            if device_count > MAX_DEVICES {
                return Err(vec![Problem::fatal(element.line, "device", "id", "file exceeds the 2,000 device limit")]);
            }
            validate_device(&mut valid, &mut problems, index, element, &mut device_records);
        }

        // Reuse the real module/model loader to determine which interfaces a
        // link may legally name, including installed expansion modules.
        let mut port_ws = Workspace::empty();
        for (index, element) in elements.iter().enumerate() {
            if valid[index] && element.name == "device" {
                let fields = record_fields(element);
                let _ = port_ws.load_record(&fields);
            }
        }
        for element in elements.iter().filter(|element| element.name == "module") {
            if port_ws.devices.iter().any(|d| d.id == element.get("id").unwrap_or("")) {
                let fields = record_fields(element);
                let _ = port_ws.load_record(&fields);
            }
        }

        let mut used_ports = HashMap::<String, HashSet<String>>::new();
        for (index, element) in elements.iter().enumerate() {
            if !valid[index] {
                continue;
            }
            match element.name.as_str() {
                "device" => {}
                "link" => validate_link(&mut valid, &mut problems, index, element, &port_ws, &mut used_ports),
                _ => validate_record(&mut valid, &mut problems, index, element, &mut port_ws),
            }
        }

        if !problems.is_empty() && !recover {
            return Err(problems);
        }

        validate_lesson_records(&elements, &mut valid, &mut problems, &port_ws);
        if !problems.is_empty() && !recover {
            return Err(problems);
        }

        let warnings = duplicate_ip_warnings(&elements, &valid);
        let mut ws = Workspace::empty();
        for (index, element) in elements.into_iter().enumerate() {
            let Some((_, names)) = RECORDS.iter().find(|(name, _)| *name == element.name) else {
                ws.unknown_elements.push(element);
                continue;
            };
            if !valid[index] {
                continue;
            }
            let extra = record_extras(&element, names);
            let fields = record_fields(&element);
            if ws.load_record(&fields).is_none() {
                // Validation above covers all loader failures. Keep this guard
                // transactional rather than ever exposing a half-loaded record.
                let problem = Problem::error(element.line, &element.name, "record", "record could not be loaded");
                if recover {
                    ws.load_problems.push(problem);
                    continue;
                }
                return Err(vec![problem]);
            }
            if !extra.attributes.is_empty() {
                ws.record_extras.push(extra);
            }
        }
        ws.finish_record_load();
        if recover {
            ws.load_problems.extend(problems);
        }
        ws.load_problems.extend(warnings);
        Ok(ws)
    }
}

// v0 used the same flat record representation but did not declare a current
// schema marker. Keeping this migration explicit makes every future step
// ordered and testable without changing old fixtures.
fn migrate_0_to_1(elements: Vec<Element>) -> Vec<Element> {
    elements
}

fn record_fields(element: &Element) -> Vec<&str> {
    let Some((_, names)) = RECORDS.iter().find(|(name, _)| *name == element.name) else {
        return Vec::new();
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
    fields
}

fn invalidate(valid: &mut [bool], problems: &mut Vec<Problem>, index: usize, element: &Element, attribute: &str, message: impl Into<String>) {
    valid[index] = false;
    problems.push(Problem::error(element.line, &element.name, attribute, message));
}

fn validate_device(
    valid: &mut [bool],
    problems: &mut Vec<Problem>,
    index: usize,
    element: &Element,
    seen: &mut HashMap<String, usize>,
) {
    let id = element.get("id").unwrap_or("");
    if id.is_empty() {
        invalidate(valid, problems, index, element, "id", "device id must not be empty");
    } else if seen.insert(id.to_string(), index).is_some() {
        invalidate(valid, problems, index, element, "id", format!("duplicate device id '{id}'"));
    }
    let kind = element.get("kind").unwrap_or("");
    let model = element.get("model").unwrap_or("");
    if !valid_model(model, kind) {
        invalidate(valid, problems, index, element, "model", format!("model '{model}' is not valid for device kind '{kind}'"));
    }
    for attribute in ["x", "y"] {
        let value = element.get(attribute).unwrap_or("");
        if !value.parse::<f32>().is_ok_and(|number| number.is_finite()) {
            invalidate(valid, problems, index, element, attribute, format!("'{value}' is not a finite coordinate"));
        }
    }
    validate_optional_ipv4(valid, problems, index, element, "ip");
    validate_prefix(valid, problems, index, element, false);
}

fn valid_model(model: &str, kind: &str) -> bool {
    CATALOG.iter().any(|(catalog_model, _, catalog_kind)| *catalog_model == model && *catalog_kind == kind)
        || matches!((model, kind), ("2960-24TT", "switch") | ("Server-PT", "server"))
}

fn validate_optional_ipv4(valid: &mut [bool], problems: &mut Vec<Problem>, index: usize, element: &Element, attribute: &str) {
    let value = element.get(attribute).unwrap_or("");
    if !value.is_empty() && crate::model::parse_ipv4(value).is_none() {
        invalidate(valid, problems, index, element, attribute, format!("invalid IPv4 address '{value}'"));
    }
}

fn validate_required_ipv4(valid: &mut [bool], problems: &mut Vec<Problem>, index: usize, element: &Element, attribute: &str) {
    let value = element.get(attribute).unwrap_or("");
    if crate::model::parse_ipv4(value).is_none() {
        invalidate(valid, problems, index, element, attribute, format!("invalid IPv4 address '{value}'"));
    }
}

fn validate_prefix(valid: &mut [bool], problems: &mut Vec<Problem>, index: usize, element: &Element, ipv6: bool) {
    let value = element.get("prefix").unwrap_or("");
    let ok = if ipv6 {
        value.parse::<u8>().is_ok_and(|prefix| prefix <= 128)
    } else {
        crate::model::parse_mask(value).is_some()
    };
    if !ok {
        invalidate(valid, problems, index, element, "prefix", format!("invalid {} prefix or mask '{value}'", if ipv6 { "IPv6" } else { "IPv4" }));
    }
}

fn validate_vlan(valid: &mut [bool], problems: &mut Vec<Problem>, index: usize, element: &Element, attribute: &str, optional: bool) {
    let value = element.get(attribute).unwrap_or("");
    if optional && value.is_empty() {
        return;
    }
    if !value.parse::<u16>().is_ok_and(|vlan| (1..=4094).contains(&vlan)) {
        invalidate(valid, problems, index, element, attribute, format!("VLAN '{value}' is outside 1..4094"));
    }
}

fn validate_link(
    valid: &mut [bool],
    problems: &mut Vec<Problem>,
    index: usize,
    element: &Element,
    port_ws: &Workspace,
    used: &mut HashMap<String, HashSet<String>>,
) {
    let kind = element.get("kind").unwrap_or("");
    if !CABLE_KINDS.contains(&kind) {
        invalidate(valid, problems, index, element, "kind", format!("unknown cable type '{kind}'"));
    }
    let a = element.get("a").unwrap_or("");
    let b = element.get("b").unwrap_or("");
    if a == b {
        invalidate(valid, problems, index, element, "a", "a link must join two different devices");
    }
    let a_port = link_port(port_ws, a, element.get("a_port").unwrap_or(""), kind);
    let b_port = link_port(port_ws, b, element.get("b_port").unwrap_or(""), kind);
    if port_ws.devices.iter().all(|d| d.id != a) {
        invalidate(valid, problems, index, element, "a", format!("refers to device '{a}' that does not exist"));
    } else if a_port.is_none() {
        invalidate(valid, problems, index, element, "a_port", format!("port '{}' is not valid for device '{a}'", element.get("a_port").unwrap_or("")));
    }
    if port_ws.devices.iter().all(|d| d.id != b) {
        invalidate(valid, problems, index, element, "b", format!("refers to device '{b}' that does not exist"));
    } else if b_port.is_none() {
        invalidate(valid, problems, index, element, "b_port", format!("port '{}' is not valid for device '{b}'", element.get("b_port").unwrap_or("")));
    }
    if !valid[index] {
        return;
    }
    let endpoints = [(a, a_port.expect("validated"), "a_port"), (b, b_port.expect("validated"), "b_port")];
    for (device, port, attribute) in &endpoints {
        if used.get(*device).is_some_and(|ports| ports.contains(port)) {
            invalidate(valid, problems, index, element, attribute, format!("port is already used by another link on '{device}'"));
        }
    }
    if valid[index] {
        for (device, port, _) in endpoints {
            used.entry(device.to_string()).or_default().insert(port);
        }
    }
}

fn link_port(ws: &Workspace, id: &str, raw: &str, cable: &str) -> Option<String> {
    let device = ws.devices.iter().find(|d| d.id == id)?;
    let special = match cable {
        "eConsole" => matches!(raw, "Console" | "RS-232"),
        "ePhone" => matches!(raw, "Phone0" | "Voice0"),
        "eCoax" => raw == "Coax0",
        "eIoT" => raw == "IoT0",
        _ => false,
    };
    if special {
        return Some(raw.to_string());
    }
    let names: Vec<String> = device.ports.iter().map(|p| p.name.clone()).collect();
    crate::cli::expand_iface(raw, &names).filter(|expanded| names.contains(expanded))
}

fn validate_record(
    valid: &mut [bool],
    problems: &mut Vec<Problem>,
    index: usize,
    element: &Element,
    port_ws: &mut Workspace,
) {
    let Some((_, names)) = RECORDS.iter().find(|(name, _)| *name == element.name) else {
        return;
    };
    if !matches!(element.name.as_str(), "lesson" | "check") {
        if let Some(reference) = names.first().filter(|name| matches!(**name, "id" | "dev" | "server" | "client" | "router" | "device" | "slave" | "phone" | "ap" | "wlc")) {
            let id = element.get(reference).unwrap_or("");
            if port_ws.devices.iter().all(|d| d.id != id) {
                invalidate(valid, problems, index, element, reference, format!("refers to device '{id}' that does not exist"));
            }
        }
    }
    for (reference, attribute) in [("reserve", "client"), ("cell", "tower"), ("capwap", "wlc"), ("wifi", "wlc")] {
        if element.name == reference {
            let id = element.get(attribute).unwrap_or("");
            if port_ws.devices.iter().all(|d| d.id != id) {
                invalidate(valid, problems, index, element, attribute, format!("refers to device '{id}' that does not exist"));
            }
        }
    }

    match element.name.as_str() {
        "net" => {
            validate_optional_ipv4(valid, problems, index, element, "gw");
            validate_optional_ipv4(valid, problems, index, element, "dns");
        }
        "route" => {
            validate_required_ipv4(valid, problems, index, element, "net");
            validate_required_ipv4(valid, problems, index, element, "via");
            validate_prefix(valid, problems, index, element, false);
        }
        "routenet" => {
            validate_required_ipv4(valid, problems, index, element, "net");
            validate_prefix(valid, problems, index, element, false);
        }
        "pool" => {
            validate_required_ipv4(valid, problems, index, element, "network");
            validate_optional_ipv4(valid, problems, index, element, "gw");
            validate_optional_ipv4(valid, problems, index, element, "dns");
            validate_prefix(valid, problems, index, element, false);
        }
        "port" => {
            let id = element.get("id").unwrap_or("");
            let raw = element.get("name").unwrap_or("");
            if port_ws.devices.iter().any(|d| d.id == id) && link_port(port_ws, id, raw, "eCopper").is_none() {
                let is_subinterface = raw.split_once('.').is_some_and(|(parent, sub)| {
                    !sub.is_empty() && sub.parse::<u32>().is_ok() && link_port(port_ws, id, parent, "eCopper").is_some()
                });
                if !is_subinterface {
                    invalidate(valid, problems, index, element, "name", format!("port '{raw}' is not valid for device '{id}'"));
                }
            }
            validate_optional_ipv4(valid, problems, index, element, "ip");
            validate_prefix(valid, problems, index, element, false);
            validate_vlan(valid, problems, index, element, "vlan", false);
            validate_vlan(valid, problems, index, element, "dot1q", true);
            for attribute in ["bandwidth_kbps", "delay_us"] {
                if element.get(attribute).unwrap_or("").parse::<u32>().is_err() {
                    invalidate(valid, problems, index, element, attribute, "interface metric must be an unsigned integer");
                }
            }
        }
        "vlan" | "stppriority" => validate_vlan(valid, problems, index, element, "vlan", false),
        "v6" => {
            validate_prefix(valid, problems, index, element, true);
            for attribute in ["addr", "gw", "dns"] {
                let value = element.get(attribute).unwrap_or("");
                if !value.is_empty() && value.parse::<std::net::Ipv6Addr>().is_err() {
                    invalidate(valid, problems, index, element, attribute, format!("invalid IPv6 address '{value}'"));
                }
            }
        }
        "dns" | "reserve" | "helper" => validate_required_ipv4(valid, problems, index, element, "ip"),
        "vpn" | "pppoe" | "ntp" => validate_required_ipv4(valid, problems, index, element, "server"),
        "phone" => validate_required_ipv4(valid, problems, index, element, "cm"),
        "acl" => {
            validate_required_ipv4(valid, problems, index, element, "src");
            validate_required_ipv4(valid, problems, index, element, "swc");
            for attribute in ["dip", "dwc"] {
                if element.get(attribute).unwrap_or("") != "-" {
                    validate_required_ipv4(valid, problems, index, element, attribute);
                }
            }
        }
        "module" => {
            if element.get("slot").unwrap_or("").parse::<usize>().is_err() {
                invalidate(valid, problems, index, element, "slot", "module slot must be a non-negative integer");
            } else if valid[index] {
                if port_ws.set_module(element.get("id").unwrap_or(""), element.get("slot").unwrap_or("").parse().unwrap_or(0), element.get("model").unwrap_or("")).is_err() {
                    invalidate(valid, problems, index, element, "model", "module is not valid in this slot or device");
                }
            }
        }
        _ => {}
    }
}

fn validate_lesson_records(
    elements: &[Element],
    valid: &mut [bool],
    problems: &mut Vec<Problem>,
    port_ws: &Workspace,
) {
    let lessons: Vec<usize> = elements.iter().enumerate()
        .filter_map(|(index, element)| (element.name == "lesson").then_some(index))
        .collect();
    for index in lessons.iter().skip(1) {
        invalidate(valid, problems, *index, &elements[*index], "id", "a workspace may contain only one lesson");
    }
    let has_lesson = lessons.first().is_some_and(|index| valid[*index]);
    let device_exists = |id: &str| port_ws.devices.iter().any(|device| device.id == id);
    let mut steps = HashSet::new();
    let mut checks = HashSet::new();

    for (index, element) in elements.iter().enumerate() {
        if !valid[index] || !matches!(element.name.as_str(), "lesson" | "step" | "check") {
            continue;
        }
        if element.name != "lesson" && !has_lesson {
            invalidate(valid, problems, index, element, "record", "lesson metadata requires one valid lesson record");
            continue;
        }
        match element.name.as_str() {
            "lesson" => {
                if element.get("id").unwrap_or("").is_empty() {
                    invalidate(valid, problems, index, element, "id", "lesson id must not be empty");
                }
                for (attribute, kind) in [("level", "level"), ("minutes", "minutes")] {
                    let value = element.get(attribute).unwrap_or("");
                    let numeric = if kind == "level" {
                        value.parse::<u8>().is_ok()
                    } else {
                        value.parse::<u16>().is_ok()
                    };
                    if !numeric {
                        invalidate(valid, problems, index, element, attribute, format!("lesson {attribute} must be an unsigned integer"));
                    }
                }
            }
            "step" => {
                let raw = element.get("n").unwrap_or("");
                match raw.parse::<u16>() {
                    Ok(0) | Err(_) => invalidate(valid, problems, index, element, "n", "step number must be a positive integer"),
                    Ok(n) if !steps.insert(n) => invalidate(valid, problems, index, element, "n", format!("duplicate step number '{raw}'")),
                    Ok(_) => {}
                }
            }
            "check" => {
                let id = element.get("id").unwrap_or("");
                if id.is_empty() {
                    invalidate(valid, problems, index, element, "id", "check id must not be empty");
                } else if !checks.insert(id.to_string()) {
                    invalidate(valid, problems, index, element, "id", format!("duplicate check id '{id}'"));
                }
                let kind = element.get("kind").unwrap_or("");
                if !super::lesson::CHECK_KINDS.contains(&kind) {
                    invalidate(valid, problems, index, element, "kind", format!("unknown check kind '{kind}'"));
                }
                let from = element.get("from").unwrap_or("");
                if !device_exists(from) {
                    invalidate(valid, problems, index, element, "from", format!("refers to device '{from}' that does not exist"));
                }
                let to = element.get("to").unwrap_or("");
                if matches!(kind, "ping" | "ttl") && !device_exists(to) {
                    invalidate(valid, problems, index, element, "to", format!("refers to device '{to}' that does not exist"));
                }
                if kind == "arp" && crate::model::parse_ipv4(to).is_none() && !device_exists(to) {
                    invalidate(valid, problems, index, element, "to", format!("'{to}' is neither an IPv4 address nor a device id"));
                }
                match kind {
                    "ping" if !matches!(element.get("expect").unwrap_or(""), "ok" | "fail") => {
                        invalidate(valid, problems, index, element, "expect", "ping expectation must be 'ok' or 'fail'");
                    }
                    "ttl" if element.get("expect").unwrap_or("").parse::<u8>().is_err() => {
                        invalidate(valid, problems, index, element, "expect", "TTL expectation must be an unsigned integer");
                    }
                    "http" if element.get("url").unwrap_or("").is_empty() => {
                        invalidate(valid, problems, index, element, "url", "HTTP check requires a URL");
                    }
                    "mac-table" if element.get("expect").unwrap_or("").parse::<usize>().is_err() => {
                        invalidate(valid, problems, index, element, "expect", "MAC-table expectation must be an unsigned integer");
                    }
                    "nslookup" => {
                        let name = element.get("to").unwrap_or("");
                        if name.is_empty() || name.chars().any(|c| c.is_whitespace()) {
                            invalidate(valid, problems, index, element, "to", "nslookup check requires one DNS name");
                        }
                        if crate::model::parse_ipv4(element.get("expect").unwrap_or("")).is_none() {
                            invalidate(valid, problems, index, element, "expect", "nslookup expectation must be an IPv4 address");
                        }
                    }
                    "route" => {
                        let expect = element.get("expect").unwrap_or("");
                        let valid_route = expect.split_once('/').is_some_and(|(network, prefix)| {
                            crate::model::parse_ipv4(network).is_some() && crate::model::parse_mask(prefix).is_some()
                        });
                        if !valid_route {
                            invalidate(valid, problems, index, element, "expect", "route expectation must be network/prefix");
                        }
                    }
                    _ => {}
                }
            }
            _ => {}
        }
    }
}

fn duplicate_ip_warnings(elements: &[Element], valid: &[bool]) -> Vec<Problem> {
    let mut seen = HashMap::<(u32, u8, u32), String>::new();
    let mut warnings = Vec::new();
    for (index, element) in elements.iter().enumerate() {
        if !valid[index] || !matches!(element.name.as_str(), "device" | "port") {
            continue;
        }
        let ip = element.get("ip").unwrap_or("");
        let Some(ip) = crate::model::parse_ipv4(ip) else { continue };
        let Some(prefix) = crate::model::parse_mask(element.get("prefix").unwrap_or("")) else { continue };
        let key = (ip & crate::model::mask_of(prefix), prefix, ip);
        let owner = element.get("id").unwrap_or("");
        if let Some(first) = seen.get(&key) {
            warnings.push(Problem::warning(
                element.line,
                &element.name,
                "ip",
                format!("duplicate IP {} on subnet {}/{}; already used by '{}'", crate::model::ipv4_string(ip), crate::model::ipv4_string(key.0), prefix, first),
            ));
        } else {
            seen.insert(key, owner.to_string());
        }
    }
    warnings
}

fn record_extras(element: &Element, names: &[&str]) -> RecordExtras {
    let mut attributes: Vec<_> = element.attributes.iter()
        .filter(|(name, _)| {
            !names.contains(&name.as_str()) &&
                name.strip_prefix('v').and_then(|number| number.parse::<usize>().ok()).is_none()
        })
        .cloned()
        .collect();
    attributes.sort_by(|a, b| a.0.cmp(&b.0));
    RecordExtras { element: element.name.clone(), key: record_key(element), attributes }
}

fn record_key(element: &Element) -> Vec<(String, String)> {
    let Some((_, names)) = RECORDS.iter().find(|(name, _)| *name == element.name) else {
        return Vec::new();
    };
    let key_names: &[&str] = match element.name.as_str() {
        "link" => &["a", "a_port", "b", "b_port"],
        "route" => &["id", "net", "prefix", "via"],
        "port" => &["id", "name"],
        "vlan" => &["id", "vlan"],
        "reserve" => &["server", "client", "ip"],
        "mail" => &["server", "from", "to", "subject"],
        "tftp" | "ftp" => &["server", "name"],
        "routenet" => &["dev", "net", "prefix", "area"],
        _ => &names[..names.len().min(1)],
    };
    key_names.iter().map(|name| (name.to_string(), element.get(name).unwrap_or("").to_string())).collect()
}
