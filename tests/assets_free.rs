//! Ratchet for the "no vendor art" goal (task.md, goal G2).
//!
//! The UI still loads Cisco's shipped files through `/assets/...` and the
//! `asset()` helper. This test counts those references per file and fails if
//! any count goes UP or a new file starts using them. Each art PR lowers a
//! number in `BASELINE`; the final PR makes the list empty.
//!
//! `web/browser.*` is the raw asset explorer, which exists to browse that tree,
//! so it is not scanned.

use std::fs;
use std::path::{Path, PathBuf};

/// (file, references today). Lower these as art is replaced; never raise them.
const BASELINE: &[(&str, usize)] = &[
    ("web/index.html", 1),
    ("web/js/device_tabs.js", 2),
    ("web/js/palette.js", 4),
    ("web/js/state.js", 1),
];

/// Cisco logical-icon paths still sent to the browser by the server.
const SERVER_LOGICAL_ART: usize = 0;

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
fn vendor_art_references_never_increase() {
    let root = Path::new(env!("CARGO_MANIFEST_DIR"));
    let mut problems = Vec::new();
    let mut total = 0;

    for path in scanned_files(root) {
        let rel = path.strip_prefix(root).unwrap().to_string_lossy().replace('\\', "/");
        let now = vendor_references(&fs::read_to_string(&path).unwrap());
        let allowed = BASELINE.iter().find(|(f, _)| *f == rel).map_or(0, |(_, n)| *n);
        total += now;
        if now > allowed {
            problems.push(format!("{rel}: {now} vendor references, baseline {allowed}"));
        }
    }
    assert!(problems.is_empty(), "vendor art references went up:\n{}", problems.join("\n"));
    eprintln!("vendor art references remaining in web/: {total}");
}

#[test]
fn baseline_is_not_stale() {
    // If a file dropped below its baseline, lower the baseline so it cannot creep back.
    let root = Path::new(env!("CARGO_MANIFEST_DIR"));
    let stale: Vec<String> = BASELINE
        .iter()
        .filter_map(|(f, allowed)| {
            let now = vendor_references(&fs::read_to_string(root.join(f)).ok()?);
            (now < *allowed).then(|| format!("{f}: {now} now, baseline {allowed}: lower it"))
        })
        .collect();
    assert!(stale.is_empty(), "{}", stale.join("\n"));
}

#[test]
fn server_does_not_send_more_vendor_icons() {
    let root = Path::new(env!("CARGO_MANIFEST_DIR"));
    let src = fs::read_to_string(root.join("src/workspace/palette.rs")).unwrap();
    let now = count(&src, "art/Workspace/Logical");
    assert!(
        now <= SERVER_LOGICAL_ART,
        "palette.rs has {now} vendor logical-icon paths, baseline {SERVER_LOGICAL_ART}"
    );
}
