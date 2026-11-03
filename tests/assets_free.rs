//! Strict guardrail for the "no vendor art" goal (task.md, goal G2).

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
            let ext = p.extension().and_then(|x| x.to_str()).unwrap_or("");
            if matches!(ext, "js" | "css") {
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

#[test]
fn removed_vendor_formats_are_not_named_in_the_repo() {
    fn walk(dir: &Path, files: &mut Vec<PathBuf>) {
        for entry in fs::read_dir(dir).unwrap().flatten() {
            let path = entry.path();
            let name = path.file_name().and_then(|n| n.to_str()).unwrap_or("");
            if matches!(name, ".git" | "target") {
                continue;
            }
            if path.is_dir() {
                walk(&path, files);
            } else if !name.to_ascii_lowercase().starts_with("changelog") {
                files.push(path);
            }
        }
    }

    let root = Path::new(env!("CARGO_MANIFEST_DIR"));
    let mut files = Vec::new();
    walk(root, &mut files);
    let extensions = [format!(".{}", "pkt"), format!(".{}", "pka")];
    let problems: Vec<String> = files.into_iter().filter_map(|path| {
        let text = fs::read_to_string(&path).ok()?;
        extensions.iter().any(|extension| text.contains(extension))
            .then(|| path.display().to_string())
    }).collect();
    assert!(problems.is_empty(), "removed format names: {}", problems.join(", "));
}
