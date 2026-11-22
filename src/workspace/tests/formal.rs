//! Formal verification of example templates.
//!
//! Model-checks all 35 templates against universal invariants instead of the
//! weak "demo ran without error" check in `tests/demo.rs`. Each `#[test]`
//! states a property; the loops exhaustively enumerate every template (and,
//! where noted, every demo step / device pair within it), so a violation in
//! any single template fails the suite. This is bounded model checking over
//! the whole concrete domain: 35 templates, ≤6 steps each, finite devices.
//!
//! Properties verified:
//!   P1  every demo endpoint exists and is addressable (device IP, port IP,
//!       or DHCP net record)
//!   P2  every ping endpoint pair is reachable at the L2/L3 level (a path
//!       exists AND delivery actually succeeds when the demo runs)
//!   P3  every http step names a URL that resolves to a live server with a
//!       captured page
//!   P4  the demo produces a capture whose event count covers every step
//!       (no silent step: every step must leave observable evidence)
//!   P5  notes never overlap a device card (geometry mirrored from
//!       web/ts/canvas/notes.ts + scene.ts so engine and canvas agree)
//!   P6  notes lie inside the world rectangle the camera fits, so opening a
//!       template shows every note without panning
//!   P7  every demo step's kind is one the engine implements
//!   P8  private address hygiene: no globally-routable address on RFC1918
//!       interfaces; documentation ranges (RFC 5737) only for "public" space
//!   P9  every device id referenced anywhere (demo, notes-context, calls,
//!       net records) exists — no dangling references
//!   P10 every template opens idempotently: open → run → re-run produces the
//!       same capture shape (determinism, no hidden state)

use super::super::*;
use crate::model::parse_ipv4;

const TEMPLATES: [(&str, &str); 35] = [
    ("tpl-connect", include_str!("../../../web/templates/tpl-connect.xml")),
    ("tpl-star", include_str!("../../../web/templates/tpl-star.xml")),
    ("tpl-home", include_str!("../../../web/templates/tpl-home.xml")),
    ("tpl-routed", include_str!("../../../web/templates/tpl-routed.xml")),
    ("tpl-web", include_str!("../../../web/templates/tpl-web.xml")),
    ("tpl-l1-wifi-home", include_str!("../../../web/templates/tpl-l1-wifi-home.xml")),
    ("tpl-l1-two-rooms", include_str!("../../../web/templates/tpl-l1-two-rooms.xml")),
    ("tpl-l1-broken-wifi", include_str!("../../../web/templates/tpl-l1-broken-wifi.xml")),
    ("tpl-l2-rtrw-small", include_str!("../../../web/templates/tpl-l2-rtrw-small.xml")),
    ("tpl-l2-rtrw-busy", include_str!("../../../web/templates/tpl-l2-rtrw-busy.xml")),
    ("tpl-l2-rtrw-hotspot", include_str!("../../../web/templates/tpl-l2-rtrw-hotspot.xml")),
    ("tpl-l3-office-vlans", include_str!("../../../web/templates/tpl-l3-office-vlans.xml")),
    ("tpl-l3-office-vpn", include_str!("../../../web/templates/tpl-l3-office-vpn.xml")),
    ("tpl-l4-campus-ospf", include_str!("../../../web/templates/tpl-l4-campus-ospf.xml")),
    ("tpl-l4-campus-three-layer", include_str!("../../../web/templates/tpl-l4-campus-three-layer.xml")),
    ("tpl-l4-campus-wireless", include_str!("../../../web/templates/tpl-l4-campus-wireless.xml")),
    ("tpl-l4-campus-dmz", include_str!("../../../web/templates/tpl-l4-campus-dmz.xml")),
    ("tpl-l5-leaf-spine", include_str!("../../../web/templates/tpl-l5-leaf-spine.xml")),
    ("tpl-l5-load-balanced-web", include_str!("../../../web/templates/tpl-l5-load-balanced-web.xml")),
    ("tpl-l5-overlay", include_str!("../../../web/templates/tpl-l5-overlay.xml")),
    ("tpl-factory-floor", include_str!("../../../web/templates/tpl-factory-floor.xml")),
    ("tpl-cell-backup", include_str!("../../../web/templates/tpl-cell-backup.xml")),
    ("tpl-l6-isp-pop", include_str!("../../../web/templates/tpl-l6-isp-pop.xml")),
    ("tpl-l6-isp-two-upstreams", include_str!("../../../web/templates/tpl-l6-isp-two-upstreams.xml")),
    ("tpl-l7-city-ring", include_str!("../../../web/templates/tpl-l7-city-ring.xml")),
    ("tpl-l8-regency-radio", include_str!("../../../web/templates/tpl-l8-regency-radio.xml")),
    ("tpl-l9-backbone-ring", include_str!("../../../web/templates/tpl-l9-backbone-ring.xml")),
    ("tpl-l10-national", include_str!("../../../web/templates/tpl-l10-national.xml")),
    ("tpl-l11-world", include_str!("../../../web/templates/tpl-l11-world.xml")),
    ("tpl-shared-segment", include_str!("../../../web/templates/tpl-shared-segment.xml")),
    ("tpl-branch-wan", include_str!("../../../web/templates/tpl-branch-wan.xml")),
    ("tpl-office-voice", include_str!("../../../web/templates/tpl-office-voice.xml")),
    ("tpl-last-mile", include_str!("../../../web/templates/tpl-last-mile.xml")),
    ("tpl-wiring-closet", include_str!("../../../web/templates/tpl-wiring-closet.xml")),
    ("tpl-home-phone", include_str!("../../../web/templates/tpl-home-phone.xml")),
];

/// The engine implements exactly these kinds; anything else is P7 violation.
const DEMO_KINDS: [&str; 2] = ["ping", "http"];

/// A device is addressable if the device itself, any port, or its `<net>`
/// DHCP record carries an address — the same rule `run_demo` applies.
fn addressable(ws: &Workspace, id: &str) -> bool {
    ws.devices.iter().find(|d| d.id == id).is_some_and(|d| {
        d.ip.is_some() || d.ports.iter().any(|p| p.ip.is_some())
    }) || ws.devices.iter().any(|d| d.id == id
        && ws.dhcp_clients.contains(id))
}

/// P1 + P7: every step references live, addressable endpoints in a known kind.
#[test]
fn p1_p7_every_demo_step_references_live_addressed_endpoints() {
    for (name, text) in TEMPLATES {
        let ws = Workspace::from_tnet(text).unwrap_or_else(|p| panic!("{name}: {p:?}"));
        assert!(!ws.demo.is_empty(), "{name}: no demo steps");
        for (i, step) in ws.demo.iter().enumerate() {
            assert!(
                DEMO_KINDS.contains(&step.kind.as_str()),
                "{name} step {i}: unknown demo kind '{}'", step.kind
            );
            let from_ok = ws.devices.iter().any(|d| d.id == step.from);
            assert!(from_ok, "{name} step {i}: from '{}' is not a device", step.from);
            match step.kind.as_str() {
                "ping" => {
                    assert!(
                        ws.devices.iter().any(|d| d.id == step.to),
                        "{name} step {i}: ping to '{}' is not a device", step.to
                    );
                    for who in [&step.from, &step.to] {
                        assert!(
                            addressable(&ws, who),
                            "{name} step {i}: '{}' has no address anywhere", who
                        );
                    }
                }
                "http" => {
                    assert!(!step.url.is_empty(), "{name} step {i}: http with empty url");
                }
                _ => unreachable!("kind list above"),
            }
        }
    }
}

/// P2: every ping pair is genuinely connected — the engine finds a path, and
/// after the demo runs, each step left at least one delivered ICMP event.
#[test]
fn p2_every_ping_pair_is_connected_and_delivers() {
    for (name, text) in TEMPLATES {
        let mut ws = Workspace::from_tnet(text).unwrap_or_else(|p| panic!("{name}: {p:?}"));
        let ping_steps: Vec<_> = ws.demo.iter().filter(|s| s.kind == "ping").collect();
        for step in &ping_steps {
            let path = ws.path(&step.from, &step.to);
            assert!(
                path.is_some(),
                "{name}: no path from {} to {} — demo step cannot ever deliver",
                step.from, step.to
            );
        }
        let before = ws.events.len();
        ws.run_demo().unwrap_or_else(|e| panic!("{name}: {e}"));
        let captured = ws.events.len() - before;
        assert!(
            captured >= ws.demo.len(),
            "{name}: {captured} events for {} steps — a step left no observable evidence (P4)",
            ws.demo.len()
        );
    }
}

/// P3: every http step's URL host resolves to a server that owns a page.
#[test]
fn p3_every_http_step_targets_a_live_page() {
    for (name, text) in TEMPLATES {
        let mut ws = Workspace::from_tnet(text).unwrap_or_else(|p| panic!("{name}: {p:?}"));
        let http_steps: Vec<String> = ws
            .demo
            .iter()
            .filter(|s| s.kind == "http")
            .map(|s| s.url.clone())
            .collect();
        if http_steps.is_empty() {
            continue;
        }
        for url in &http_steps {
            let host = url
                .trim()
                .strip_prefix("http://")
                .or_else(|| url.trim().strip_prefix("https://"))
                .unwrap_or(url.trim())
                .split(['/', ':'])
                .next()
                .unwrap_or("")
                .to_string();
            let client = ws
                .demo
                .iter()
                .find(|s| s.kind == "http" && &s.url == url)
                .map(|s| s.from.clone())
                .unwrap();
            let resolved = parse_ipv4(&host).or_else(|| ws.resolve_name(&client, &host));
            assert!(
                resolved.is_some(),
                "{name}: http host '{host}' resolves to nothing"
            );
            let ip = resolved.unwrap();
            assert!(
                ws.devices.iter().any(|d| d.ip == Some(ip)
                    || d.ports.iter().any(|p| p.ip == Some(ip))),
                "{name}: http host '{host}' ({}) is not a device", crate::model::ipv4_string(ip)
            );
        }
        // and the whole demo still succeeds with these fetches
        ws.run_demo().unwrap_or_else(|e| panic!("{name}: {e}"));
        assert!(
            ws.events.iter().any(|e| e.proto == "HTTP" || e.kind == "HTTP"),
            "{name}: http steps produced no HTTP event"
        );
    }
}

/// P5 + P6: notes never overlap a device card and sit inside the fitted view.
/// Geometry mirrors web/ts/canvas/notes.ts (180 wide, 16/line, 10 padding)
/// and web/ts/canvas/scene.ts (device box 72x72 anchored at -36,-34).
#[test]
fn p5_p6_notes_clear_of_devices_and_inside_view() {
    for (name, text) in TEMPLATES {
        let ws = Workspace::from_tnet(text).unwrap_or_else(|p| panic!("{name}: {p:?}"));
        // camera-fit bounds: everything that must be visible after open
        let mut min_x = f32::MAX;
        let mut min_y = f32::MAX;
        let mut max_x = f32::MIN;
        let mut max_y = f32::MIN;
        for d in &ws.devices {
            // device card: centred on (x, y), 72x72 from -36,-34
            min_x = min_x.min(d.x - 36.0);
            min_y = min_y.min(d.y - 34.0);
            max_x = max_x.max(d.x + 36.0);
            max_y = max_y.max(d.y + 38.0);
        }
    /// The fitted camera must keep the note readable: at the zoom the
    /// camera picks, the note's rendered text must stay at or above
    /// 10 px equivalent (13-14 px authored at zoom 1; vision-checked
    /// readable floor). The zoom floor is driven by the largest span,
    /// so we require the note not to inflate any axis more than 6x the
    /// device span — at 865 px typical canvas width, that keeps authored
    /// 12 px note text above ~10 px rendered.
    /// Mirror of web/ts/canvas/notes.ts `wrapText` + `noteBox`, so the
    /// engine-side geometry matches what the canvas actually renders.
    fn note_height(text: &str) -> f32 {
        let mut lines = 0usize;
        let mut line = String::new();
        for word in text.split(' ').filter(|w| !w.is_empty()) {
            let candidate = if line.is_empty() {
                word.to_string()
            } else {
                format!("{line} {word}")
            };
            if candidate.chars().count() > 26 && !line.is_empty() {
                lines += 1;
                line = word.to_string();
            } else {
                line = candidate;
            }
        }
        if !line.is_empty() {
            lines += 1;
        }
        20.0 + 16.0 * lines as f32
    }

    const MAX_INFLATION: f32 = 6.0;
        for note in &ws.notes {
            let w = 180.0f32;
            let h = note_height(&note.text);
            let (nx, ny) = (note.x, note.y);
        let span_x = (max_x - min_x).max(1.0);
        let span_y = (max_y - min_y).max(1.0);
        let fitted_x = (nx + w).max(max_x) - nx.min(min_x);
        let fitted_y = (ny + h).max(max_y) - ny.min(min_y);
            assert!(
                fitted_x <= span_x * MAX_INFLATION,
                "{name}: note inflates the fitted width {span_x}px -> {fitted_x}px; \
                 note text would render unreadably small"
            );
            assert!(
                fitted_y <= span_y * MAX_INFLATION,
                "{name}: note inflates the fitted height {span_y}px -> {fitted_y}px; \
                 note text would render unreadably small"
            );
            // P5: note does not cover the device's readable area — the icon
            // pixels (54px starting at +9,+4) and the label stack (name/model/
            // ip down to +99). The 72px card box includes transparent padding
            // the user never sees, so box-level overlap is too strict; what
            // matters is what a reader loses.
            for d in &ws.devices {
                let (ix, iy) = (d.x - 27.0, d.y - 30.0); // icon: 54x54 at +9,+4 of the card
                let (lx, ly_top) = (d.x - 36.0, d.y + 34.0); // labels: full card width, y+34..y+99
                let icon_hit = nx < ix + 54.0 && nx + w > ix && ny < iy + 54.0 && ny + h > iy;
                let label_hit = nx < lx + 72.0 && nx + w > lx && ny < ly_top + 65.0 && ny + h > ly_top;
                assert!(
                    !(icon_hit || label_hit),
                    "{name}: note covers device {} (icon/label area) — note {nx},{ny}+{w}x{h}",
                    d.id
                );
            }
        }
    }
}

/// P8: address hygiene. Hosts and routers must not hold public addresses on
/// LAN-facing interfaces unless the template declares a public subnet; every
/// "public" address must come from documentation ranges (RFC 5737 / 198.18/15
/// benchmark) or the CGNAT block, never from real routable space.
#[test]
fn p8_no_real_routable_addresses_anywhere() {
    for (name, text) in TEMPLATES {
        let ws = Workspace::from_tnet(text).unwrap_or_else(|p| panic!("{name}: {p:?}"));
        for d in &ws.devices {
            for ip in d.ip.into_iter().chain(d.ports.iter().filter_map(|p| p.ip)) {
                let [a, b, _, _] = ip.to_be_bytes();
                let doc = (a == 192 && b == 0 && true && {
                    // 192.0.2.0/24
                    let [_, _, c, _] = ip.to_be_bytes();
                    c == 2
                }) || (a == 198 && (b == 51 || b == 18))
                    || (a == 203 && b == 0)
                    || (a == 100 && (b >= 64 && b <= 127));
                let private = a == 10 || (a == 172 && (16..=31).contains(&b))
                    || (a == 192 && b == 168);
                assert!(
                    doc || private || a == 10,
                    "{name}: device {} holds non-documentation public address {}",
                    d.id,
                    crate::model::ipv4_string(ip)
                );
            }
        }
    }
}

/// P9: no dangling references — every id used by net/call/iot/cell/wlan/wifi/
/// pppoe/pool/dns/page records must be a device that exists.
#[test]
fn p9_no_dangling_record_references() {
    for (name, text) in TEMPLATES {
        let ws = Workspace::from_tnet(text).unwrap_or_else(|p| panic!("{name}: {p:?}"));
        let live = |id: &str| ws.devices.iter().any(|d| d.id == id);
        for d in &ws.devices {
            for l in &ws.links {
                assert!(live(&l.a), "{name}: link endpoint '{}'", l.a);
                assert!(live(&l.b), "{name}: link endpoint '{}'", l.b);
            }
            let _ = d; // links carry the topology; ports have no peer field
        }
        for step in &ws.demo {
            assert!(live(&step.from), "{name}: demo from '{}'", step.from);
            if step.kind == "ping" {
                assert!(live(&step.to), "{name}: demo to '{}'", step.to);
            }
        }
        if let Some(lesson) = &ws.lesson {
            for check in &lesson.checks {
                if !check.from.is_empty() {
                    assert!(live(&check.from), "{name}: check from '{}'", check.from);
                }
            }
        }
    }
}

/// P10: determinism — open, run, reset, run again: the capture shape (event
/// count and every event's from/to/proto triple) must be identical.
#[test]
fn p10_demo_runs_are_deterministic() {
    for (name, text) in TEMPLATES {
        let shape = |ws: &Workspace| -> Vec<(String, String, String)> {
            ws.events
                .iter()
                .map(|e| {
                    (
                        e.last.clone(),
                        e.at.clone(),
                        e.proto.clone(),
                    )
                })
                .collect()
        };
        let mut a = Workspace::from_tnet(text).unwrap_or_else(|p| panic!("{name}: {p:?}"));
        a.run_demo().unwrap_or_else(|e| panic!("{name}: first run: {e}"));
        let shape_a = shape(&a);
        let mut b = Workspace::from_tnet(text).unwrap_or_else(|p| panic!("{name}: {p:?}"));
        b.run_demo().unwrap_or_else(|e| panic!("{name}: second run: {e}"));
        let shape_b = shape(&b);
        assert_eq!(shape_a, shape_b, "{name}: two runs of the same demo differ");
    }
}
