use super::super::*;

const TEMPLATES: [(&str, &str); 10] = [
    ("tpl-connect", include_str!("../../../web/templates/tpl-connect.xml")),
    ("tpl-star", include_str!("../../../web/templates/tpl-star.xml")),
    ("tpl-home", include_str!("../../../web/templates/tpl-home.xml")),
    ("tpl-routed", include_str!("../../../web/templates/tpl-routed.xml")),
    ("tpl-web", include_str!("../../../web/templates/tpl-web.xml")),
    ("tpl-l1-wifi-home", include_str!("../../../web/templates/tpl-l1-wifi-home.xml")),
    ("tpl-l1-two-rooms", include_str!("../../../web/templates/tpl-l1-two-rooms.xml")),
    ("tpl-l1-broken-wifi", include_str!("../../../web/templates/tpl-l1-broken-wifi.xml")),
    ("tpl-l4-campus-ospf", include_str!("../../../web/templates/tpl-l4-campus-ospf.xml")),
    ("tpl-l3-office-vlans", include_str!("../../../web/templates/tpl-l3-office-vlans.xml")),
];

#[test]
fn every_example_template_plays_its_own_traffic() {
    for (name, text) in TEMPLATES {
        let mut ws = Workspace::from_tnet(text).unwrap_or_else(|p| panic!("{name}: {p:?}"));
        assert!(!ws.demo.is_empty(), "{name} must carry built-in traffic");
        assert!(ws.events.is_empty(), "{name} opens quiet");
        let steps = ws.run_demo().unwrap_or_else(|e| panic!("{name}: {e}"));
        assert_eq!(steps, ws.demo.len());
        assert!(!ws.events.is_empty(), "{name} must capture something to play");
        assert!(ws.json().contains("\"hasDemo\":true"));
    }
}

#[test]
fn lessons_and_blank_workspaces_have_no_built_in_traffic() {
    let mut blank = Workspace::new();
    assert!(blank.demo.is_empty());
    assert!(blank.json().contains("\"hasDemo\":false"));
    let error = blank.run_demo().unwrap_err();
    assert!(error.contains("no built-in traffic"), "{error}");
    let lesson = Workspace::from_tnet(include_str!("../../../web/templates/t1.xml")).unwrap();
    assert!(lesson.demo.is_empty(), "lessons ask the learner to send traffic themselves");
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
    let broken = TEMPLATES[0].1.replace("from=\"pc0\" to=\"pc1\"", "from=\"pc0\" to=\"pc9\"");
    let mut ws = Workspace::from_tnet(&broken).expect("the file itself still opens");
    assert_eq!(ws.devices.len(), 2);
    let error = ws.run_demo().unwrap_err();
    assert!(error.contains("pc9"), "{error}");
    assert!(ws.events.is_empty(), "nothing is captured for a step that cannot run");
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
