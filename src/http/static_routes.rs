use super::*;

/// Returns `None` when this group does not own the route.
pub(super) fn route(ctx: &Ctx, method: &str, path: &str, _query: &str) -> Option<(&'static str, Vec<u8>)> {
    let html = "text/html; charset=utf-8";
    let reply = match (method, path) {
        ("GET", "/") => (html, file_bytes(&ctx.web_root, "index.html")?),
        ("GET", "/about") => (html, file_bytes(&ctx.web_root, "about.html")?),
        // The old address keeps working: it points to the clean one.
        ("GET", "/about.html") => (REDIRECT, b"/about".to_vec()),
        ("GET", p) if p.starts_with("/sounds/") => {
            let name = &p["/sounds/".len()..];
            let safe = name.ends_with(".wav") && !name.contains('/') && !name.contains("..");
            if safe {
                ("audio/wav", file_bytes(&ctx.web_root, &format!("sounds/{name}"))?)
            } else {
                return None
            }
        }
        ("GET", p) if p.starts_with("/art3d/") => match art3d_file(&p["/art3d/".len()..]) {
            Some(file) => ("image/webp", file_bytes(&ctx.web_root, &file)?),
            None => return None,
        },
        ("GET", p) if p.starts_with("/js/") => {
            let name = &p["/js/".len()..];
            let safe = name.ends_with(".js") && !name.contains('/') && !name.contains("..");
            if safe {
                ("text/javascript; charset=utf-8", file_bytes(&ctx.web_root, &format!("js/{name}"))?)
            } else {
                return None
            }
        }
        ("GET", "/tokens.css") => ("text/css; charset=utf-8", file_bytes(&ctx.web_root, "tokens.css")?),
        ("GET", "/workspace.css") => ("text/css; charset=utf-8", file_bytes(&ctx.web_root, "workspace.css")?),
        ("GET", "/engine.wasm") => ("application/wasm", file_bytes(&ctx.web_root, "engine.wasm")?),
        ("GET", "/sw.js") => ("text/javascript; charset=utf-8", file_bytes(&ctx.web_root, "sw.js")?),
        ("GET", p) if p.starts_with("/templates/") => {
            let name = &p["/templates/".len()..];
            let safe = name.ends_with(".xml") && !name.contains('/') && !name.contains("..");
            if safe {
                ("application/xml; charset=utf-8", file_bytes(&ctx.web_root, &format!("templates/{name}"))?)
            } else {
                return None
            }
        }

        _ => return None,
    };
    Some(reply)
}
