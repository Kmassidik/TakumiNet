use super::*;

pub(super) fn user(ws: &mut Workspace, id: &str, s: &mut Session, line: &str, lower: &str) -> String {
    match lower {
        "enable" | "en" => {
            s.mode = Mode::Priv;
            String::new()
        }
        "exit" | "quit" => "".into(),
        "help" | "?" => help(Mode::User),
        _ if lower.starts_with("ping ") => ping(ws, id, &line[5..]),
        _ => invalid(&line, Mode::User),
    }
}

pub(super) fn privileged(ws: &mut Workspace, id: &str, s: &mut Session, line: &str, lower: &str) -> String {
    match lower {
        "disable" => {
            s.mode = Mode::User;
            String::new()
        }
        "exit" | "quit" => {
            s.mode = Mode::User;
            String::new()
        }
        "configure terminal" | "conf t" | "config t" | "configure t" => {
            s.mode = Mode::Config;
            "Enter configuration commands, one per line.  End with CNTL/Z.\n".into()
        }
        "show running-config" | "sh run" => running_config(ws, id),
        "show ip interface brief" | "sh ip int br" => ip_brief(ws, id),
        "show ip route" | "sh ip ro" => ws.show_routes(id),
        "show version" | "sh ver" => version(ws, id),
        "write memory" | "wr" | "copy running-config startup-config" | "copy run start" => {
            ws.write_memory(id);
            "Building configuration...\n[OK]\n".into()
        }
        "show startup-config" | "sh start" => startup_config(ws, id),
        "reload" => {
            if ws.reload() {
                "System configuration has been modified. Reloading...\n[OK]\n".into()
            } else {
                "% Startup configuration is empty\n".into()
            }
        }
        "clock" => "*0:00:00.0 UTC Mon Mar 1 1993\n".into(),
        "help" | "?" => help(Mode::Priv),
        _ if lower.starts_with("show ") => show(ws, id, &lower[5..]),
        _ if lower.starts_with("sh ") => show(ws, id, &lower[3..]),
        _ if lower.starts_with("ping ") => ping(ws, id, &line[5..]),
        _ => invalid(&line, Mode::Priv),
    }
}

pub(super) fn ping(ws: &mut Workspace, id: &str, target: &str) -> String {
    let target = target.trim();
    let Some(dst) = ws
        .devices
        .iter()
        .find(|d| d.ip.map(ipv4_string).as_deref() == Some(target))
        .map(|d| d.id.clone())
    else {
        return format!(
            "Type escape sequence to abort.\nSending 5, 100-byte ICMP Echos to {target}, timeout is 2 seconds:\n.....\nSuccess rate is 0 percent (0/5)\n"
        );
    };
    match ws.send_pdu(id, &dst) {
        Ok(()) => format!(
            "Type escape sequence to abort.\nSending 5, 100-byte ICMP Echos to {target}, timeout is 2 seconds:\n!!!!!\nSuccess rate is 100 percent (5/5), round-trip min/avg/max = 0/0/0 ms\n"
        ),
        Err(e) => format!("% {e}\n"),
    }
}
