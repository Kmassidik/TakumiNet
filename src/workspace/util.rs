pub(super) fn s(v: &str) -> String {
    let mut o = String::with_capacity(v.len() + 2);
    o.push('"');
    for c in v.chars() {
        match c {
            '"' => o.push_str("\\\""),
            '\\' => o.push_str("\\\\"),
            c if (c as u32) < 0x20 => o.push_str(&format!("\\u{:04x}", c as u32)),
            c => o.push(c),
        }
    }
    o.push('"');
    o
}

/// Tabs and newlines separate fields, so banner/password text is escaped.
pub(super) fn escape_field(s: &str) -> String {
    s.replace('\\', "\\\\")
        .replace('\t', "\\t")
        .replace('\n', "\\n")
}

pub(super) fn unescape_field(s: &str) -> String {
    let mut out = String::with_capacity(s.len());
    let mut chars = s.chars();
    while let Some(c) = chars.next() {
        if c != '\\' {
            out.push(c);
            continue;
        }
        match chars.next() {
            Some('t') => out.push('\t'),
            Some('n') => out.push('\n'),
            Some('\\') => out.push('\\'),
            Some(other) => {
                out.push('\\');
                out.push(other);
            }
            None => out.push('\\'),
        }
    }
    out
}

pub(super) fn opt_str(v: Option<&str>) -> String {
    match v {
        Some(s) if !s.is_empty() => format!("{:?}", s),
        _ => "null".to_string(),
    }
}

pub(super) fn opt_ip(v: Option<u32>) -> String {
    match v {
        Some(ip) => format!("\"{}\"", crate::model::ipv4_string(ip)),
        None => "null".to_string(),
    }
}

pub(super) fn clamp_x(x: f32) -> f32 {
    x.clamp(40.0, 960.0)
}

pub(super) fn clamp_y(y: f32) -> f32 {
    y.clamp(40.0, 500.0)
}
