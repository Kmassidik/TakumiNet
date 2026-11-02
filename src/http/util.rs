use super::*;

pub(super) fn list_pkt(dir: &Path, base: &Path, depth: u32) -> Vec<String> {
    let mut out = Vec::new();
    if depth > 8 {
        return out;
    }
    let Ok(rd) = std::fs::read_dir(dir) else { return out };
    for entry in rd.flatten() {
        let path = entry.path();
        if path.is_dir() {
            out.extend(list_pkt(&path, base, depth + 1));
        } else if matches!(
            path.extension().and_then(|e| e.to_str()),
            Some("pkt") | Some("pka")
        ) {
            if let Ok(rel) = path.strip_prefix(base) {
                out.push(rel.to_string_lossy().replace('\\', "/"));
            }
        }
    }
    out.sort();
    out
}

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

pub(super) fn serve_asset(stream: &mut TcpStream, ctx: &Ctx, rel: &str) -> io::Result<()> {
    let Some(assets) = &ctx.assets else {
        return respond(stream, "503 Service Unavailable", "text/plain", b"no asset root\n");
    };
    let Some(full) = assets.resolve(rel) else {
        return respond(stream, "404 Not Found", "text/plain", b"not found\n");
    };
    let Ok(meta) = std::fs::metadata(&full) else {
        return respond(stream, "404 Not Found", "text/plain", b"not found\n");
    };
    if !meta.is_file() {
        return respond(stream, "404 Not Found", "text/plain", b"not a file\n");
    }
    let Ok(mut file) = File::open(&full) else {
        return respond(stream, "403 Forbidden", "text/plain", b"unreadable\n");
    };

    write!(
        stream,
        "HTTP/1.1 200 OK\r\nContent-Type: {}\r\nContent-Length: {}\r\n\
         Cache-Control: public, max-age=86400\r\nConnection: close\r\n\r\n",
        content_type(rel),
        meta.len()
    )?;
    io::copy(&mut file, stream)?;
    stream.flush()
}

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

pub(super) fn file_bytes(root: &str, name: &str) -> Vec<u8> {
    std::fs::read(format!("{root}/{name}"))
        .unwrap_or_else(|e| format!("cannot read {name}: {e}").into_bytes())
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

pub(super) fn content_type(name: &str) -> &'static str {
    let ext = Path::new(name)
        .extension()
        .and_then(|e| e.to_str())
        .unwrap_or("")
        .to_ascii_lowercase();
    match ext.as_str() {
        "png" => "image/png",
        "jpg" | "jpeg" => "image/jpeg",
        "gif" => "image/gif",
        "svg" => "image/svg+xml",
        "webp" => "image/webp",
        "ico" => "image/x-icon",
        "bmp" => "image/bmp",
        "wav" => "audio/wav",
        "mp3" => "audio/mpeg",
        "ogg" => "audio/ogg",
        "ttf" => "font/ttf",
        "otf" => "font/otf",
        "woff" => "font/woff",
        "woff2" => "font/woff2",
        "html" | "htm" => "text/html; charset=utf-8",
        "css" => "text/css; charset=utf-8",
        "js" => "text/javascript; charset=utf-8",
        "json" => "application/json",
        "txt" | "ts" | "ptl" | "csv" | "log" | "md" | "ptw" => "text/plain; charset=utf-8",
        "xml" => "application/xml",
        "zip" => "application/zip",
        _ => "application/octet-stream",
    }
}

pub(super) fn kind_of(name: &str) -> &'static str {
    match content_type(name) {
        "image/png" | "image/jpeg" | "image/gif" | "image/svg+xml" | "image/webp"
        | "image/x-icon" | "image/bmp" => "image",
        t if t.starts_with("audio/") => "audio",
        t if t.starts_with("font/") => "font",
        "text/html; charset=utf-8" | "text/css; charset=utf-8" | "text/plain; charset=utf-8" => "text",
        _ => "data",
    }
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

pub(super) fn status_json(ctx: &Ctx) -> String {
    match (&ctx.assets, ctx.totals) {
        (Some(a), Some((files, bytes))) => format!(
            "{{\"exists\":true,\"root\":{},\"files\":{files},\"bytes\":{bytes}}}",
            json_str(&a.root.display().to_string())
        ),
        _ => "{\"exists\":false,\"root\":null,\"files\":0,\"bytes\":0,\
              \"hint\":\"set ASSET_ROOT to the extracted opt/pt directory\"}"
            .to_string(),
    }
}

pub(super) fn list_json(dir: &str, entries: &[crate::storage::assets::Entry]) -> String {
    let dir = dir.trim_matches('/');
    let parent = match dir.rsplit_once('/') {
        Some((p, _)) => p.to_string(),
        None => String::new(),
    };

    let mut dirs = String::new();
    let mut files = String::new();
    for e in entries {
        if e.dir {
            if !dirs.is_empty() {
                dirs.push(',');
            }
            dirs.push_str(&format!(
                "{{\"name\":{},\"path\":{}}}",
                json_str(&e.name),
                json_str(&e.path)
            ));
        } else {
            if !files.is_empty() {
                files.push(',');
            }
            files.push_str(&format!(
                "{{\"name\":{},\"path\":{},\"size\":{},\"kind\":\"{}\"}}",
                json_str(&e.name),
                json_str(&e.path),
                e.size,
                kind_of(&e.name)
            ));
        }
    }

    format!(
        "{{\"path\":{},\"parent\":{},\"dirs\":[{}],\"files\":[{}]}}",
        json_str(dir),
        json_str(&parent),
        dirs,
        files
    )
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
