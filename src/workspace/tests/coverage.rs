//! Every palette kind and every cable kind must appear in at least one
//! shipped template, unless it is on the explicit not-yet-covered list.

use super::super::*;

/// Device kinds no template uses yet. Remove a line when a template adopts
/// the kind; the guard fails on stale entries.
const ALLOW_UNUSED_KINDS: &[&str] = &[
    "analogphone",
    "dsl",
    "patchpanel",
    "phone",
    "sniffer",
];

/// Cable kinds no template uses yet. Same rule: shrink-only.
const ALLOW_UNUSED_CABLES: &[&str] = &[
    "eCoax",
    "eConsole",
    "ePhone",
];

fn attribute<'a>(element: &'a str, name: &str) -> Option<&'a str> {
    let marker = format!("{name}=\"");
    let start = element.find(&marker)? + marker.len();
    let rest = &element[start..];
    Some(&rest[..rest.find('"')?])
}

fn template_usage() -> (Vec<String>, Vec<String>) {
    let directory = std::path::Path::new(env!("CARGO_MANIFEST_DIR")).join("web/templates");
    let mut device_kinds: Vec<String> = Vec::new();
    let mut cable_kinds: Vec<String> = Vec::new();
    let mut files = 0;
    for entry in std::fs::read_dir(&directory).expect("template directory").flatten() {
        let path = entry.path();
        if path.extension().and_then(|e| e.to_str()) != Some("xml") {
            continue;
        }
        files += 1;
        let text = std::fs::read_to_string(&path).unwrap();
        for element in text.split('<') {
            let (tag, kind) = match element.split_whitespace().next() {
                Some("device") => ("device", attribute(element, "kind")),
                Some("link") => ("link", attribute(element, "kind")),
                _ => continue,
            };
            let Some(kind) = kind else { continue };
            let list = if tag == "device" { &mut device_kinds } else { &mut cable_kinds };
            if !list.iter().any(|k| k == kind) {
                list.push(kind.to_string());
            }
        }
    }
    assert!(files > 80, "only {files} templates found — wrong directory?");
    (device_kinds, cable_kinds)
}

#[test]
fn every_catalog_kind_appears_in_a_template_or_is_declared_unused() {
    let (used, _) = template_usage();
    let mut catalog: Vec<&str> = CATALOG.iter().map(|(_, _, kind)| *kind).collect();
    catalog.sort_unstable();
    catalog.dedup();
    assert_eq!(catalog.len(), 41, "the palette changed — update this count knowingly");
    for kind in &catalog {
        let covered = used.iter().any(|k| k == kind);
        let allowed = ALLOW_UNUSED_KINDS.contains(kind);
        assert!(
            covered || allowed,
            "device kind '{kind}' appears in no template and is not on ALLOW_UNUSED_KINDS"
        );
        assert!(
            !(covered && allowed),
            "device kind '{kind}' is covered now — remove it from ALLOW_UNUSED_KINDS"
        );
    }
}

#[test]
fn every_cable_kind_appears_in_a_template_or_is_declared_unused() {
    let (_, used) = template_usage();
    for kind in CABLE_KINDS {
        let covered = used.iter().any(|k| k == kind);
        let allowed = ALLOW_UNUSED_CABLES.contains(kind);
        assert!(
            covered || allowed,
            "cable kind '{kind}' appears in no template and is not on ALLOW_UNUSED_CABLES"
        );
        assert!(
            !(covered && allowed),
            "cable kind '{kind}' is covered now — remove it from ALLOW_UNUSED_CABLES"
        );
    }
}
