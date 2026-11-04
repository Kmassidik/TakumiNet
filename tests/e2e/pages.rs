use super::*;

#[test]
fn e2e_about_page_is_public_and_linked_from_help() {
    let s = spawn(38_170);

    let (_, _, index) = s.get("/workspace");
    assert!(index.contains(r#"href="/about""#), "Help must link to the About page");
    assert!(!index.contains(".html"), "no page address may end in .html");

    let (status, head, body) = s.get("/about");
    assert_eq!(status, 200, "{body}");
    assert!(head.contains("text/html"), "{head}");
    for required in [
        "original",
        "free",
        "No account",
        "https://github.com/Kmassidik/TakumiNet",
        "https://x.com/KMassidik",
        "pull request",
        "Open source",
        "MIT licence",
        "Who makes it",
    ] {
        assert!(body.contains(required), "About page is missing {required:?}");
    }
    // The About page is written in plain words: no file paths, hashes or tool names.
    for banned in ["ChatGPT", "tools/", "MANIFEST", "SHA-256", "provenance", "Vision helper", "—"] {
        assert!(!body.contains(banned), "About page must not contain {banned:?}");
    }
    assert!(body.contains(r#"href="/workspace""#), "About page must link back to the workspace");
    assert!(!body.contains(".html"), "About page must not link to a .html address");
    assert!(body.contains("/tokens.css"), "About page must use the shared tokens");
    let (status, head, tokens) = s.get("/tokens.css");
    assert_eq!(status, 200);
    assert!(head.contains("text/css"), "{head}");
    assert!(tokens.contains("--accent:"), "tokens.css must define the colours");

    // The old address redirects to the clean one; other spellings are not pages.
    let (status, head, _) = s.get("/about.html");
    assert_eq!(status, 301, "{head}");
    assert!(head.contains("Location: /about"), "{head}");
    assert_eq!(s.get("/about/").0, 404);
    assert_eq!(s.get("/about.xyz").0, 404);
}

#[test]
fn e2e_landing_page_sends_people_into_the_workspace() {
    let s = spawn(38_245);

    let (status, head, landing) = s.get("/");
    assert_eq!(status, 200);
    assert!(head.contains("text/html"), "{head}");
    assert!(landing.contains("Build a network and watch it work."), "headline missing");
    assert!(landing.contains("/landing/takumi-wave.webp"), "Takumi must be on the page");
    assert!(landing.contains(r#"href="/workspace""#), "the main button must open the workspace");
    assert!(!landing.contains("Simulation Panel"), "'/' must be the landing page, not the app");
    assert!(!landing.contains(".html"), "no address may end in .html");

    // Every example and lesson link on the landing page points at something that opens.
    let mut ids = Vec::new();
    for part in landing.split("/workspace?open=").skip(1) {
        let id: String = part.chars().take_while(|c| c.is_ascii_alphanumeric() || *c == '-').collect();
        if !ids.contains(&id) { ids.push(id); }
    }
    assert_eq!(ids.len(), 7, "the hero link plus three featured examples and three featured lessons: {ids:?}");
    for id in &ids {
        let (_, _, opened) = s.post(&format!("/api/templates/open?id={id}"));
        assert!(!opened.contains("\"error\""), "{id}: {opened}");
    }

    // The scene's own files are served with the right types.
    for (path, kind) in [("/landing/takumi-idle.webp", "image/webp"), ("/landing/takumi-wave.webp", "image/webp"), ("/landing/takumi-think.webp", "image/webp"), ("/landing/takumi-happy.webp", "image/webp")] {
        let (status, head, _) = s.get_raw(path);
        assert_eq!(status, 200, "{path}");
        assert!(head.contains(kind), "{path}: {head}");
    }
    assert_eq!(s.get("/landing/other.webp").0, 404);
    assert_eq!(s.get("/landing/takumi-sleep.webp").0, 404, "only the poses the page uses are served");
    assert_eq!(s.get("/landing/takumi.glb").0, 404, "the 3D model is gone");

    // The page's own files are served.
    let (status, head, _) = s.get("/landing.css");
    assert_eq!(status, 200);
    assert!(head.contains("text/css"), "{head}");
    let (status, _, workspace) = s.get("/workspace");
    assert_eq!(status, 200);
    assert!(workspace.contains("Simulation Panel"), "the workspace lives at /workspace");
    assert_eq!(s.get("/workspace/").0, 404);
}

#[test]
fn e2e_public_pages_are_ready_for_search_in_english_and_indonesian() {
    let s = spawn(38_246);

    for (path, lang, canonical_end) in [("/", "en", "/"), ("/id", "id", "/id"), ("/about", "en", "/about"), ("/id/about", "id", "/id/about")] {
        let (status, head, body) = s.get(path);
        assert_eq!(status, 200, "{path}");
        assert!(head.contains("text/html"), "{path}: {head}");
        assert!(body.contains(&format!("<html lang=\"{lang}\">")), "{path}");
        assert!(!body.contains("{{SITE_URL}}"), "{path}: the site address must be filled in before sending");
        let canonical = body.split("<link rel=\"canonical\" href=\"").nth(1).and_then(|r| r.split('"').next()).unwrap_or("");
        assert!(canonical.starts_with("http://localhost:") && canonical.ends_with(canonical_end), "{path}: {canonical}");
        assert!(body.contains("hreflang=\"x-default\""), "{path}");
        assert!(body.contains("application/ld+json"), "{path}");
        assert!(!body.contains(".html\""), "{path}: no address may end in .html");
    }
    assert_eq!(s.get("/id/").0, 404);
    assert_eq!(s.get("/id/about/").0, 404);

    // The Indonesian page is in Indonesian and the English one is not.
    assert!(s.get("/id").2.contains("Bangun jaringan dan lihat cara kerjanya."));
    assert!(s.get("/").2.contains("Build a network and watch it work."));

    // The picture used when a link is shared exists for both languages.
    for lang in ["en", "id"] {
        let (status, head, png) = s.get_raw(&format!("/landing/og-{lang}.png"));
        assert_eq!(status, 200, "og-{lang}");
        assert!(head.contains("image/png"), "{head}");
        assert!(png.starts_with(b"\x89PNG"), "og-{lang} is not a PNG");
    }

    // robots.txt keeps the app and the API out of search, and names the sitemap.
    let (status, head, robots) = s.get("/robots.txt");
    assert_eq!(status, 200);
    assert!(head.contains("text/plain"), "{head}");
    assert!(robots.contains("Disallow: /api/") && robots.contains("Disallow: /workspace"), "{robots}");
    assert!(robots.contains("Sitemap: http://localhost:") && robots.contains("/sitemap.xml"), "{robots}");

    // The sitemap lists all four pages, each pointing at both language versions.
    let (status, head, sitemap) = s.get("/sitemap.xml");
    assert_eq!(status, 200);
    assert!(head.contains("xml"), "{head}");
    assert_eq!(sitemap.matches("<loc>").count(), 4, "{sitemap}");
    for path in ["/", "/id", "/about", "/id/about"] {
        assert!(sitemap.contains(&format!("{path}</loc>")), "{path} missing from the sitemap");
    }
    assert_eq!(sitemap.matches("hreflang=\"x-default\"").count(), 4);
    assert!(!sitemap.contains("/workspace") && !sitemap.contains("/api/"));

    // The app page itself is not offered to search engines.
    assert!(s.get("/workspace").2.contains("noindex"));
}
