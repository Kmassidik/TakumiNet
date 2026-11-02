use super::*;

/// Returns `None` when this group does not own the route.
pub(super) fn route(ctx: &Ctx, method: &str, path: &str, query: &str) -> Option<(&'static str, Vec<u8>)> {
    let json = "application/json";
    let html = "text/html; charset=utf-8";
    let reply = match (method, path) {
        ("GET", "/") => (html, file_bytes(&ctx.web_root, "index.html")),
        ("GET", p) if p.starts_with("/sounds/") => {
            let name = &p["/sounds/".len()..];
            let safe = name.ends_with(".wav") && !name.contains('/') && !name.contains("..");
            if safe {
                ("audio/wav", file_bytes(&ctx.web_root, &format!("sounds/{name}")))
            } else {
                (html, b"not found".to_vec())
            }
        }
        ("GET", p) if p.starts_with("/js/") => {
            let name = &p["/js/".len()..];
            let safe = name.ends_with(".js") && !name.contains('/') && !name.contains("..");
            if safe {
                ("text/javascript; charset=utf-8", file_bytes(&ctx.web_root, &format!("js/{name}")))
            } else {
                (html, b"not found".to_vec())
            }
        }
        ("GET", "/workspace.css") => ("text/css; charset=utf-8", file_bytes(&ctx.web_root, "workspace.css")),
        ("GET", "/browser") | ("GET", "/browser.html") => (html, file_bytes(&ctx.web_root, "browser.html")),
        ("GET", "/browser.js") => ("text/javascript; charset=utf-8", file_bytes(&ctx.web_root, "browser.js")),
        ("GET", "/style.css") => ("text/css; charset=utf-8", file_bytes(&ctx.web_root, "style.css")),
        ("GET", p) if p.starts_with("/art/") => {
            let name = &p["/art/".len()..];
            let safe = !name.is_empty()
                && name.ends_with(".svg")
                && !name.contains('/')
                && !name.contains("..");
            if safe {
                (
                    "image/svg+xml",
                    file_bytes(&ctx.web_root, &format!("art/{name}")),
                )
            } else {
                (html, b"not found".to_vec())
            }
        }

        ("GET", "/api/dialogs") => {
            let q = query_value(query, "q").unwrap_or_default().to_ascii_lowercase();
            let limit = query_value(query, "limit")
                .and_then(|l| l.parse::<usize>().ok())
                .unwrap_or(200)
                .clamp(1, 1000);
            let path = std::path::Path::new("intake/ui-catalog.tsv");
            let mut rows: Vec<(String, String)> = Vec::new();
            if let Ok(text) = std::fs::read_to_string(path) {
                for line in text.lines() {
                    let mut parts = line.split('\t');
                    let (Some(dialog), Some(text)) = (parts.next(), parts.next()) else {
                        continue;
                    };
                    if q.is_empty()
                        || dialog.to_ascii_lowercase().contains(&q)
                        || text.to_ascii_lowercase().contains(&q)
                    {
                        rows.push((dialog.to_string(), text.to_string()));
                    }
                    if rows.len() >= limit {
                        break;
                    }
                }
            }
            let total = std::fs::read_to_string(path)
                .map(|t| t.lines().filter(|l| l.contains('\t')).count())
                .unwrap_or(0);
            let items = rows
                .iter()
                .map(|(dialog, text)| {
                    format!(
                        "{{\"dialog\":{},\"text\":{}}}",
                        json_str(dialog),
                        json_str(text)
                    )
                })
                .collect::<Vec<_>>()
                .join(",");
            (
                json,
                format!(
                    "{{\"available\":{},\"total\":{total},\"items\":[{items}]}}",
                    path.exists()
                )
                .into_bytes(),
            )
        }
        _ => return None,
    };
    Some(reply)
}
