use super::*;

pub(super) fn line_mode(ws: &mut Workspace, id: &str, s: &mut Session, line: &str, lower: &str) -> String {
    match lower {
        "exit" => {
            s.mode = Mode::Config;
            s.iface = None;
            String::new()
        }
        "end" => {
            s.mode = Mode::Priv;
            s.iface = None;
            String::new()
        }
        "login" => String::new(),
        "no password" => {
            ws.line_passwords.remove(id);
            String::new()
        }
        "help" | "?" => help(Mode::Line),
        _ if lower.starts_with("password ") => {
            let pw = line[9..].trim().to_string();
            if pw.is_empty() {
                "% Incomplete command.\n".into()
            } else {
                ws.line_passwords.insert(id.to_string(), pw);
                String::new()
            }
        }
        _ => invalid(&line, Mode::Line),
    }
}
