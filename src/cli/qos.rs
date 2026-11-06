//! Interface QoS commands: trust, CoS mark and a policer.

use super::*;

pub(crate) fn qos(ws: &mut Workspace, id: &str, s: &mut Session, _line: &str, lower: &str) -> String {
    let Some(iface) = s.iface.clone().filter(|i| !i.is_empty()) else {
        return "ERROR: enter an interface first\n".into();
    };
    if lower == "no qos" {
        ws.clear_qos_port(id, &iface);
        return String::new();
    }
    let words: Vec<&str> = lower.split_whitespace().collect();
    match words.get(1).copied() {
        Some("trust") => match words.get(2).copied() {
            Some("cos") => { ws.set_qos_port(id, &iface, |q| q.trust_cos = true); String::new() }
            Some("dscp") => { ws.set_qos_port(id, &iface, |q| q.trust_cos = false); String::new() }
            _ => "ERROR: use 'qos trust cos' or 'qos trust dscp'\n".into(),
        },
        Some("cos") => {
            let Some(cos) = words.get(2).and_then(|v| v.parse::<u8>().ok()).filter(|c| *c <= 7) else {
                return "ERROR: CoS must be 0-7\n".into();
            };
            ws.set_qos_port(id, &iface, |q| q.cos = cos);
            String::new()
        }
        Some("police") => {
            let value = words.iter().rev().find_map(|v| v.parse::<u32>().ok());
            let Some(rate) = value else {
                return "ERROR: need 'qos police <Mbit/s>'\n".into();
            };
            ws.set_qos_port(id, &iface, |q| q.police_mbit = Some(rate));
            String::new()
        }
        _ => "ERROR: use qos trust, qos cos or qos police\n".into(),
    }
}
