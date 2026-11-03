//! The 3D icon set in web/art/3d must match what the front end uses and what MANIFEST.json says.

use std::collections::BTreeSet;
use std::fs;
use std::path::Path;

const ROOT: &str = env!("CARGO_MANIFEST_DIR");

fn on_disk() -> BTreeSet<String> {
    let base = Path::new(ROOT).join("web/art/3d");
    let mut out = BTreeSet::new();
    for group in fs::read_dir(&base).unwrap().flatten().filter(|g| g.path().is_dir()) {
        for icon in fs::read_dir(group.path()).unwrap().flatten() {
            let name = icon.path().file_stem().unwrap().to_string_lossy().to_string();
            out.insert(format!("{}/{}", group.file_name().to_string_lossy(), name));
        }
    }
    out
}

/// Every `group/name` the manifest lists, read without a JSON library:
/// each sheet has `"group": "g"` followed by `"icons": ["a", "b"]`.
fn in_manifest() -> BTreeSet<String> {
    let text = fs::read_to_string(Path::new(ROOT).join("web/art/3d/MANIFEST.json")).unwrap();
    let mut out = BTreeSet::new();
    let mut group = String::new();
    let mut lines = text.lines();
    while let Some(line) = lines.next() {
        if let Some(g) = line.trim().strip_prefix("\"group\": \"") {
            group = g.trim_end_matches(&['"', ','][..]).to_string();
        } else if line.trim().starts_with("\"icons\": [") {
            for l in lines.by_ref().take_while(|l| !l.trim().starts_with(']')) {
                out.insert(format!("{group}/{}", l.trim().trim_matches(&['"', ','][..])));
            }
        }
    }
    out
}

/// Icons named in the front end: `/art3d/x/y.webp` URLs and `'x/y'` toolbar keys.
fn used_by_front_end() -> BTreeSet<String> {
    let groups: BTreeSet<String> = on_disk().iter().map(|k| k.split('/').next().unwrap().to_string()).collect();
    let mut files = vec![Path::new(ROOT).join("web/index.html")];
    files.extend(fs::read_dir(Path::new(ROOT).join("web/js")).unwrap().flatten().map(|e| e.path()));
    let mut out = BTreeSet::new();
    for f in files.into_iter().filter(|f| !f.ends_with("icons.js")) {
        let text = fs::read_to_string(&f).unwrap();
        for part in text.split("/art3d/").skip(1) {
            out.insert(part.split(".webp").next().unwrap().to_string());
        }
        if f.ends_with("toolbars.js") {
            for quoted in text.split('\'').skip(1).step_by(2) {
                if quoted.split_once('/').is_some_and(|(g, _)| groups.contains(g)) {
                    out.insert(quoted.to_string());
                }
            }
        }
    }
    out
}

#[test]
fn every_icon_on_disk_is_in_the_manifest_and_back() {
    assert_eq!(on_disk(), in_manifest());
}

#[test]
fn every_icon_the_front_end_uses_exists() {
    let have = on_disk();
    let missing: Vec<_> = used_by_front_end().into_iter().filter(|k| !have.contains(k)).collect();
    assert!(missing.is_empty(), "front end uses icons that do not exist: {missing:?}");
}

#[test]
fn every_icon_is_a_square_webp() {
    for key in on_disk() {
        let bytes = fs::read(Path::new(ROOT).join(format!("web/art/3d/{key}.webp"))).unwrap();
        assert_eq!(&bytes[..4], b"RIFF", "{key}");
        assert_eq!(&bytes[8..12], b"WEBP", "{key}");
        assert_eq!(&bytes[12..16], b"VP8X", "{key}: needs the extended header so it can carry alpha");
        let dim = |at: usize| u32::from_le_bytes([bytes[at], bytes[at + 1], bytes[at + 2], 0]) + 1;
        assert_eq!((dim(24), dim(27)), (256, 256), "{key}");
    }
}

#[test]
fn the_front_end_actually_uses_some_icons() {
    assert!(used_by_front_end().len() >= 25, "scan found too few icons");
}
