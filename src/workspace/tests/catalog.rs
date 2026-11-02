use super::super::*;

#[test]
fn catalog_icons_exist_in_extracted_tree() {
    let art = std::path::Path::new(env!("CARGO_MANIFEST_DIR"))
        .join("intake/20261101-102334/appimage/opt/pt/art");
    if !art.is_dir() {
        return; // extracted asset tree absent: nothing to verify against
    }
    for (label, tile, kind) in CATALOG {
        let p = art.join("ComponentBox").join(tile);
        assert!(p.is_file(), "{label}: missing tile {}", p.display());
        let icon = logical_icon(kind);
        if let Some(name) = icon.strip_prefix("/art/") {
            let p = std::path::Path::new(env!("CARGO_MANIFEST_DIR"))
                .join("web/art")
                .join(name);
            assert!(p.is_file(), "{label}: missing own icon {}", p.display());
        } else {
            let rel = icon.strip_prefix("art/").unwrap_or(icon);
            let p = art.join(rel);
            assert!(p.is_file(), "{label}: missing icon {}", p.display());
        }
    }
}

#[test]
fn palette_and_canvas_share_the_asset_tree_with_svg_fallback() {
    let ws = Workspace::new();
    let json = ws.json();
    for (label, tile, kind) in CATALOG {
        let _ = tile;
        let icon = logical_icon(kind);
        let art = logical_art(kind);
        let needle = format!("\"label\":\"{label}\",\"icon\":\"{icon}\",\"art\":\"{art}\"");
        assert!(json.contains(&needle), "{label}: palette entry mismatch");
    }
    for d in &ws.devices {
        let needle = format!("\"icon\":\"{}\",\"art\":\"{}\"", d.icon, logical_art(&d.kind));
        assert!(json.contains(&needle), "{}: device icon mismatch", d.name);
    }
}

#[test]
fn every_catalog_kind_is_named_and_drawn() {
    // `pc` deliberately shares the generic workstation artwork.
    let fallback = logical_icon("__unknown_kind__");
    for (label, _, kind) in CATALOG {
        assert_ne!(name_prefix(kind), "Device", "{label} lacks a name prefix");
        if *kind != "pc" {
            assert_ne!(logical_icon(kind), fallback, "{label} falls back to the generic icon");
        }
    }
}
