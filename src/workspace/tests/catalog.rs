use super::super::*;

#[test]
fn catalog_icons_exist() {
    let root = std::path::Path::new(env!("CARGO_MANIFEST_DIR"));
    for (label, _, kind) in CATALOG {
        let icon = logical_icon(label, kind);
        let name = icon.strip_prefix("/art3d/").expect("3D icon path");
        let path = root.join("web/art/3d").join(name);
        assert!(path.is_file(), "{label}: missing icon {}", path.display());
    }
}

#[test]
fn palette_and_canvas_share_3d_icons() {
    let ws = Workspace::new();
    let json = ws.json();
    for (label, blurb, kind) in CATALOG {
        let icon = logical_icon(label, kind);
        let needle =
            format!("\"label\":\"{label}\",\"icon\":\"{icon}\",\"kind\":\"{kind}\",\"blurb\":\"{blurb}\"");
        assert!(json.contains(&needle), "{label}: palette entry mismatch");
    }
    for d in &ws.devices {
        assert_eq!(d.icon, logical_icon(&d.model, &d.kind));
        let needle = format!("\"icon\":\"{}\",\"kind\":\"{}\"", d.icon, d.kind);
        assert!(json.contains(&needle), "{}: device icon mismatch", d.name);
    }
}

#[test]
fn every_device_explains_itself() {
    for (label, blurb, _) in CATALOG {
        assert!(blurb.len() > 20 && blurb.ends_with('.'), "{label}: weak description {blurb:?}");
    }
    let json = Workspace::new().json();
    assert!(json.contains(
        "\"blurb\":\"The everyday branch router: routing, NAT, access lists, OSPF.\""
    ));
}

#[test]
fn every_catalog_kind_is_named_and_drawn() {
    for (label, _, kind) in CATALOG {
        assert_ne!(name_prefix(kind), "Device", "{label} lacks a name prefix");
        assert_eq!(logical_icon(label, kind), format!("/art3d/devices/{kind}.webp"));
    }
}
