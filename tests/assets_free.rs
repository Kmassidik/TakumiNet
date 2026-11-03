//! Strict guardrail for the "no vendor art" goal (task.md, goal G2).
//!
//! `web/browser.*` is the raw asset explorer, which exists to browse that tree,
//! so it is not scanned.

use std::fs;
use std::path::{Path, PathBuf};

fn count(haystack: &str, needle: &str) -> usize {
    haystack.matches(needle).count()
}

/// `/assets/` URLs plus `asset(` calls, ignoring the helper's own definition.
fn vendor_references(text: &str) -> usize {
    let calls: usize = text
        .lines()
        .filter(|l| !l.contains("const asset ="))
        .map(|l| count(l, "asset("))
        .sum();
    count(text, "/assets/") + calls
}

fn scanned_files(root: &Path) -> Vec<PathBuf> {
    let mut out = vec![root.join("web/index.html")];
    for dir in ["web", "web/js"] {
        let Ok(entries) = fs::read_dir(root.join(dir)) else { continue };
        for e in entries.flatten() {
            let p = e.path();
            let name = p.file_name().and_then(|n| n.to_str()).unwrap_or("");
            let ext = p.extension().and_then(|x| x.to_str()).unwrap_or("");
            if matches!(ext, "js" | "css") && !name.starts_with("browser.") {
                out.push(p);
            }
        }
    }
    out
}

#[test]
fn frontend_has_no_vendor_art_references() {
    let root = Path::new(env!("CARGO_MANIFEST_DIR"));
    let problems: Vec<String> = scanned_files(root)
        .into_iter()
        .filter_map(|path| {
            let now = vendor_references(&fs::read_to_string(&path).unwrap());
            (now > 0).then(|| format!("{}: {now} vendor references", path.display()))
        })
        .collect();
    assert!(problems.is_empty(), "{}", problems.join("\n"));
}

#[test]
fn server_does_not_send_more_vendor_icons() {
    let root = Path::new(env!("CARGO_MANIFEST_DIR"));
    let src = fs::read_to_string(root.join("src/workspace/palette.rs")).unwrap();
    let now = count(&src, "art/Workspace/Logical");
    assert_eq!(now, 0, "palette.rs still has vendor logical-icon paths");
}
