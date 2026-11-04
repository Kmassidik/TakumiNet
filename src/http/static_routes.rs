use super::*;

/// Returns `None` when this group does not own the route.
pub(super) fn route(ctx: &Ctx, method: &str, path: &str, _query: &str) -> Option<(&'static str, Vec<u8>)> {
    let html = "text/html; charset=utf-8";
    let reply = match (method, path) {
        ("GET", "/") => (html, page(ctx, "landing.html")?),
        ("GET", "/id") => (html, page(ctx, "landing.id.html")?),
        ("GET", "/workspace") => (html, file_bytes(&ctx.web_root, "index.html")?),
        ("GET", "/robots.txt") => ("text/plain; charset=utf-8", robots(ctx).into_bytes()),
        ("GET", "/sitemap.xml") => ("application/xml; charset=utf-8", sitemap(ctx).into_bytes()),
        ("GET", "/landing/og-en.png") => ("image/png", file_bytes(&ctx.web_root, "landing/og-en.png")?),
        ("GET", "/landing/og-id.png") => ("image/png", file_bytes(&ctx.web_root, "landing/og-id.png")?),
        ("GET", p) if p.starts_with("/landing/takumi-") => {
            let name = &p["/landing/".len()..];
            let known = ["takumi-idle.webp", "takumi-wave.webp", "takumi-think.webp", "takumi-happy.webp"];
            if known.contains(&name) {
                ("image/webp", file_bytes(&ctx.web_root, &format!("landing/{name}"))?)
            } else {
                return None
            }
        }
        ("GET", "/landing.css") => ("text/css; charset=utf-8", file_bytes(&ctx.web_root, "landing.css")?),
        ("GET", "/about") => (html, page(ctx, "about.html")?),
        ("GET", "/id/about") => (html, page(ctx, "about.id.html")?),
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

/// A public page with `{{SITE_URL}}` filled in, so canonical links and social cards are absolute.
fn page(ctx: &Ctx, name: &str) -> Option<Vec<u8>> {
    let bytes = file_bytes(&ctx.web_root, name)?;
    Some(String::from_utf8_lossy(&bytes).replace("{{SITE_URL}}", &ctx.site_url).into_bytes())
}

/// Search engines may read the public pages. The app itself and its API are not for them.
fn robots(ctx: &Ctx) -> String {
    format!("User-agent: *\nAllow: /\nDisallow: /api/\nDisallow: /workspace\n\nSitemap: {}/sitemap.xml\n", ctx.site_url)
}

/// The four public pages, each listing both language versions of itself.
fn sitemap(ctx: &Ctx) -> String {
    let site = &ctx.site_url;
    let pairs = [("/", "/id"), ("/about", "/id/about")];
    let mut out = String::from("<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\" xmlns:xhtml=\"http://www.w3.org/1999/xhtml\">\n");
    for (en, id) in pairs {
        for loc in [en, id] {
            out.push_str(&format!(
                "  <url>\n    <loc>{site}{loc}</loc>\n    <xhtml:link rel=\"alternate\" hreflang=\"en\" href=\"{site}{en}\"/>\n    <xhtml:link rel=\"alternate\" hreflang=\"id\" href=\"{site}{id}\"/>\n    <xhtml:link rel=\"alternate\" hreflang=\"x-default\" href=\"{site}{en}\"/>\n  </url>\n"
            ));
        }
    }
    out.push_str("</urlset>\n");
    out
}
