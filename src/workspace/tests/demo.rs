use super::super::*;

const TEMPLATES: [(&str, &str); 29] = [
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
    ("tpl-l6-isp-pop", include_str!("../../../web/templates/tpl-l6-isp-pop.xml")),
    ("tpl-l6-isp-two-upstreams", include_str!("../../../web/templates/tpl-l6-isp-two-upstreams.xml")),
    ("tpl-l7-city-ring", include_str!("../../../web/templates/tpl-l7-city-ring.xml")),
    ("tpl-l8-regency-radio", include_str!("../../../web/templates/tpl-l8-regency-radio.xml")),
    ("tpl-l9-backbone-ring", include_str!("../../../web/templates/tpl-l9-backbone-ring.xml")),
    ("tpl-l10-national", include_str!("../../../web/templates/tpl-l10-national.xml")),
    ("tpl-l11-world", include_str!("../../../web/templates/tpl-l11-world.xml")),
    ("tpl-shared-segment", include_str!("../../../web/templates/tpl-shared-segment.xml")),
    ("tpl-branch-wan", include_str!("../../../web/templates/tpl-branch-wan.xml")),
];

/// Two devices, one cable: both directions already tell the whole story.
const SHORT_STORY_OK: [&str; 1] = ["tpl-connect"];

/// Small templates where every addressed end device must take part in the story.
const EVERYONE_PLAYS: [&str; 5] = ["tpl-connect", "tpl-star", "tpl-home", "tpl-web", "tpl-routed"];

const END_KINDS: [&str; 6] = ["pc", "laptop", "server", "tablet", "tv", "printer"];

#[test]
fn every_example_template_plays_a_multi_step_story() {
    for (name, text) in TEMPLATES {
        let mut ws = Workspace::from_tnet(text).unwrap_or_else(|p| panic!("{name}: {p:?}"));
        let wanted = if SHORT_STORY_OK.contains(&name) { 2 } else { 3 };
        assert!(ws.demo.len() >= wanted, "{name} has {} demo steps, wants at least {wanted}", ws.demo.len());
        assert!(ws.demo.len() <= 6, "{name} rambles: {} demo steps", ws.demo.len());
        assert!(ws.events.is_empty(), "{name} opens quiet");
        let steps = ws.run_demo().unwrap_or_else(|e| panic!("{name}: {e}"));
        assert_eq!(steps, ws.demo.len(), "{name} must run every step");
        assert!(ws.events.len() >= steps, "{name} captured {} events for {steps} steps", ws.events.len());
        assert!(ws.json().contains("\"hasDemo\":true"));
    }
}

#[test]
fn small_templates_let_every_addressed_end_device_take_part() {
    for (name, text) in TEMPLATES.iter().filter(|(name, _)| EVERYONE_PLAYS.contains(name)) {
        let ws = Workspace::from_tnet(text).unwrap();
        for device in ws.devices.iter().filter(|d| d.ip.is_some() && END_KINDS.contains(&d.kind.as_str())) {
            let plays = ws.demo.iter().any(|step| step.from == device.id || step.to == device.id);
            assert!(plays, "{name}: {} sits out the whole demo", device.id);
        }
    }
}

#[test]
fn lessons_and_blank_workspaces_have_no_built_in_traffic() {
    let mut blank = Workspace::new();
    assert!(blank.demo.is_empty());
    assert!(blank.json().contains("\"hasDemo\":false"));
    let error = blank.run_demo().unwrap_err();
    assert!(error.contains("no built-in traffic"), "{error}");
    for text in [
        include_str!("../../../web/templates/t1.xml"),
        include_str!("../../../web/templates/t2.xml"),
        include_str!("../../../web/templates/t3.xml"),
        include_str!("../../../web/templates/t4.xml"),
        include_str!("../../../web/templates/t5.xml"),
    ] {
        let lesson = Workspace::from_tnet(text).unwrap();
        assert!(lesson.demo.is_empty(), "lessons ask the learner to send traffic themselves");
    }
}

#[test]
fn built_in_traffic_survives_save_and_open() {
    let ws = Workspace::from_tnet(TEMPLATES[2].1).unwrap();
    let again = Workspace::from_tnet(&ws.to_tnet()).unwrap();
    assert_eq!(ws.demo, again.demo);
    assert!(ws.to_tnet().contains("<demo "));
}

#[test]
fn a_step_that_names_a_missing_device_fails_clearly_and_the_template_still_opens() {
    let broken = TEMPLATES[0].1.replace("to=\"pc1\"", "to=\"pc9\"");
    let mut ws = Workspace::from_tnet(&broken).expect("the file itself still opens");
    assert_eq!(ws.devices.len(), 2);
    let error = ws.run_demo().unwrap_err();
    assert!(error.contains("pc9"), "{error}");
    assert!(ws.events.is_empty(), "nothing is captured for a step that cannot run");
}

/// The engine re-records whatever it is asked to run; replaying a finished
/// capture is the page's job (Play rewinds instead of asking again), so a
/// second run appends a second recording. The demo's own traffic doubles
/// exactly; ARP chatter does not repeat because the caches are warm.
#[test]
fn running_the_demo_twice_records_its_traffic_twice() {
    let mut ws = Workspace::from_tnet(TEMPLATES[0].1).unwrap();
    ws.run_demo().unwrap();
    let first = ws.events.len();
    let pings = ws.events.iter().filter(|e| e.proto == "ICMP").count();
    assert!(pings > 0);
    ws.run_demo().unwrap();
    assert_eq!(ws.events.iter().filter(|e| e.proto == "ICMP").count(), pings * 2);
    assert!(ws.events.len() > first, "the first recording is kept, not replaced");
    let mut ids: Vec<u32> = ws.events.iter().map(|e| e.id).collect();
    let count = ids.len();
    ids.dedup();
    assert_eq!(ids.len(), count, "every recording gets its own event ids");
}

/// Reset clears only the recording: events, clock and learned tables. An
/// address lease is network state the device still holds, not capture state,
/// so it survives.
#[test]
fn reset_sim_clears_the_capture_but_keeps_dhcp_leases() {
    let mut ws = Workspace::new();
    ws.set_dhcp_pool("server0", "192.168.2.0", 24, "192.168.2.1", "8.8.8.8").unwrap();
    let pc = ws.add("PC-PT", 600.0, 200.0).unwrap();
    ws.link(&pc, "switch1").unwrap();
    let lease = ws.acquire_dhcp(&pc).unwrap();
    ws.send_pdu("pc0", "pc2").unwrap();
    assert!(!ws.events.is_empty());
    assert!(!ws.tables.macs.is_empty());

    ws.reset_sim();
    assert!(ws.events.is_empty());
    assert_eq!(ws.next_event, 0);
    assert_eq!(ws.sim_time, 0.0);
    assert!(ws.tables.macs.is_empty() && ws.tables.arps.is_empty());
    assert_eq!(ws.dhcp_leases.get("server0"), Some(&vec![lease.ip]));
    let d = ws.devices.iter().find(|d| d.id == pc).unwrap();
    assert_eq!(d.ip, Some(lease.ip), "the client keeps its leased address");
}

#[test]
fn the_regency_demo_captures_every_step_in_template_order() {
    let (_, text) = TEMPLATES.iter().find(|(name, _)| *name == "tpl-l8-regency-radio").unwrap();
    let mut ws = Workspace::from_tnet(text).unwrap();
    let steps = ws.demo.clone();
    assert_eq!(ws.run_demo().unwrap(), steps.len());
    let mut last_position = 0;
    for step in steps.iter().filter(|step| step.kind == "ping") {
        let position = ws.events.iter().position(|e| {
            e.proto == "ICMP"
                && e.path.first().map(String::as_str) == Some(step.from.as_str())
                && e.path.last().map(String::as_str) == Some(step.to.as_str())
        }).unwrap_or_else(|| panic!("{} -> {} not captured", step.from, step.to));
        assert!(position >= last_position, "steps are captured in template order");
        last_position = position;
    }
}

#[test]
fn an_unknown_kind_and_a_failing_request_are_reported_not_swallowed() {
    let unknown = TEMPLATES[0].1.replace("kind=\"ping\"", "kind=\"telepathy\"");
    let mut ws = Workspace::from_tnet(&unknown).unwrap();
    assert!(ws.run_demo().unwrap_err().contains("telepathy"));

    let dead_page = TEMPLATES[2].1.replace("http://192.168.1.2/", "http://192.168.1.99/");
    let mut ws = Workspace::from_tnet(&dead_page).unwrap();
    assert!(ws.run_demo().unwrap_err().contains("failed"));
}
