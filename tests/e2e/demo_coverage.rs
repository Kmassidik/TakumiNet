//! Demo coverage e2e: every example template opens over real HTTP, plays its
//! built-in traffic through the real engine, and leaves observable capture —
//! or, for `expect` steps, a captured drop. The same JSON the browser consumes.

use super::*;

const TEMPLATES: [&str; 35] = [
    "tpl-connect",
    "tpl-star",
    "tpl-home",
    "tpl-routed",
    "tpl-web",
    "tpl-l1-wifi-home",
    "tpl-l1-two-rooms",
    "tpl-l1-broken-wifi",
    "tpl-l2-rtrw-small",
    "tpl-l2-rtrw-busy",
    "tpl-l2-rtrw-hotspot",
    "tpl-l3-office-vlans",
    "tpl-l3-office-vpn",
    "tpl-l4-campus-ospf",
    "tpl-l4-campus-three-layer",
    "tpl-l4-campus-wireless",
    "tpl-l4-campus-dmz",
    "tpl-l5-leaf-spine",
    "tpl-l5-load-balanced-web",
    "tpl-l5-overlay",
    "tpl-factory-floor",
    "tpl-cell-backup",
    "tpl-l6-isp-pop",
    "tpl-l6-isp-two-upstreams",
    "tpl-l7-city-ring",
    "tpl-l8-regency-radio",
    "tpl-l9-backbone-ring",
    "tpl-l10-national",
    "tpl-l11-world",
    "tpl-shared-segment",
    "tpl-branch-wan",
    "tpl-office-voice",
    "tpl-last-mile",
    "tpl-wiring-closet",
    "tpl-home-phone",
];

#[test]
fn every_example_opens_plays_and_captures_over_http() {
    let s = spawn(38_291);
    for id in TEMPLATES {
        let (status, _, body) = s.post(&format!("/api/templates/open?id={id}"));
        assert_eq!(status, 200, "{id}: open status");
        assert!(!body.contains("\"error\""), "{id}: open error: {body}");
        assert!(body.contains("\"devices\""), "{id}: open returned no workspace");

        let events_before = event_count(&s);
        let (status, _, play) = s.post("/api/demo");
        assert_eq!(status, 200, "{id}: play status");
        assert!(!play.contains("\"error\""), "{id}: play failed: {play}");
        let events_after = event_count(&s);
        assert!(
            events_after > events_before,
            "{id}: play captured nothing ({events_before} -> {events_after})"
        );
    }
}

fn event_count(s: &Server) -> usize {
    let (_, _, body) = s.get("/api/workspace");
    body.matches("\"proto\":").count()
}
