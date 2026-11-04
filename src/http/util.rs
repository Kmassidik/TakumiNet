use super::*;

pub(super) fn sanitize(name: &str) -> String {
    let cleaned: String = name
        .chars()
        .map(|c| if c.is_ascii_alphanumeric() || c == '-' || c == '_' { c } else { '_' })
        .collect();
    if cleaned.is_empty() {
        "untitled".into()
    } else {
        cleaned
    }
}

/// Content type that marks a reply as a permanent redirect; the body is the new path.
pub(super) const REDIRECT: &str = "text/x-redirect";

#[cfg(not(target_arch = "wasm32"))]
pub(super) fn respond_redirect(stream: &mut TcpStream, location: &str) -> io::Result<()> {
    write!(
        stream,
        "HTTP/1.1 301 Moved Permanently\r\nLocation: {location}\r\nContent-Length: 0\r\n\
         Cache-Control: no-store\r\nConnection: close\r\n\r\n"
    )?;
    stream.flush()
}

#[cfg(not(target_arch = "wasm32"))]
pub(super) fn respond(stream: &mut TcpStream, status: &str, ctype: &str, body: &[u8]) -> io::Result<()> {
    write!(
        stream,
        "HTTP/1.1 {status}\r\nContent-Type: {ctype}\r\nContent-Length: {}\r\n\
         Cache-Control: no-store\r\nConnection: close\r\n\r\n",
        body.len()
    )?;
    stream.write_all(body)?;
    stream.flush()
}

#[cfg(not(target_arch = "wasm32"))]
pub(super) fn file_bytes(root: &str, name: &str) -> Option<Vec<u8>> {
    std::fs::read(format!("{root}/{name}")).ok()
}

pub(super) fn query_value(query: &str, key: &str) -> Option<String> {
    for pair in query.split('&') {
        if let Some((k, v)) = pair.split_once('=') {
            if k == key {
                return Some(pct_decode(v));
            }
        }
    }
    None
}

pub(super) fn pct_decode(s: &str) -> String {
    let bytes = s.as_bytes();
    let mut out = Vec::with_capacity(bytes.len());
    let mut i = 0;
    while i < bytes.len() {
        match bytes[i] {
            b'%' if i + 2 < bytes.len() => {
                let hex = std::str::from_utf8(&bytes[i + 1..i + 3]).ok();
                match hex.and_then(|h| u8::from_str_radix(h, 16).ok()) {
                    Some(b) => {
                        out.push(b);
                        i += 3;
                        continue;
                    }
                    None => out.push(b'%'),
                }
            }
            b'+' => out.push(b' '),
            b => out.push(b),
        }
        i += 1;
    }
    String::from_utf8_lossy(&out).into_owned()
}

pub(super) fn json_str(s: &str) -> String {
    let mut o = String::with_capacity(s.len() + 2);
    o.push('"');
    for c in s.chars() {
        match c {
            '"' => o.push_str("\\\""),
            '\\' => o.push_str("\\\\"),
            '\n' => o.push_str("\\n"),
            '\r' => o.push_str("\\r"),
            '\t' => o.push_str("\\t"),
            c if (c as u32) < 0x20 => o.push_str(&format!("\\u{:04x}", c as u32)),
            c => o.push(c),
        }
    }
    o.push('"');
    o
}

pub(super) fn json_error(msg: &str) -> String {
    format!("{{\"error\":{}}}", json_str(msg))
}

pub(super) fn ping_json(path: &[String], err: Option<&str>) -> String {
    let mut s = String::from("{\"ok\":");
    s.push_str(if err.is_none() { "true" } else { "false" });
    s.push_str(",\"path\":[");
    for (i, hop) in path.iter().enumerate() {
        if i > 0 {
            s.push(',');
        }
        s.push_str(&json_str(hop));
    }
    s.push_str("],\"reason\":");
    match err {
        Some(e) => s.push_str(&json_str(e)),
        None => s.push_str("null"),
    }
    s.push('}');
    s
}

#[allow(dead_code)]
pub(super) fn _read_all(mut r: impl Read) -> io::Result<Vec<u8>> {
    let mut v = Vec::new();
    r.read_to_end(&mut v)?;
    Ok(v)
}

/// Maps `group/name.webp` to `art/3d/group/name.webp`. Both parts must be lowercase
/// letters and digits, so nothing can climb out of the art folder.
#[cfg(not(target_arch = "wasm32"))]
pub(super) fn art3d_file(request: &str) -> Option<String> {
    let (group, file) = request.split_once('/')?;
    let name = file.strip_suffix(".webp")?;
    let plain = |s: &str| !s.is_empty() && s.bytes().all(|b| b.is_ascii_lowercase() || b.is_ascii_digit());
    (plain(group) && plain(name)).then(|| format!("art/3d/{group}/{name}.webp"))
}

#[cfg(test)]
mod tests {
    use super::art3d_file;

    #[test]
    fn accepts_group_slash_name_webp() {
        assert_eq!(art3d_file("toolbar/new.webp").as_deref(), Some("art/3d/toolbar/new.webp"));
    }

    #[test]
    fn rejects_anything_that_could_leave_the_folder() {
        for bad in ["../x.webp", "toolbar/../x.webp", "toolbar/new.png", "toolbar/New.webp", "new.webp", "a/b/c.webp", "/a.webp", "toolbar/.webp", ""] {
            assert_eq!(art3d_file(bad), None, "{bad}");
        }
    }
}
