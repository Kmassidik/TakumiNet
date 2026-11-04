use super::*;
use super::tnet::invalidate;
use crate::storage::xml::Element;
use std::collections::HashSet;

pub(super) fn validate_lesson_records(
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
