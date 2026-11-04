use super::super::*;

fn rtrw() -> Workspace {
    Workspace::from_tnet(include_str!("../../../web/templates/tpl-l2-rtrw-small.xml")).unwrap()
}

fn homes() -> Vec<String> {
    ["sector0", "radio0", "radio1", "radio2", "home0", "home1", "home2", "laptop0"]
        .iter().map(|s| s.to_string()).collect()
}

#[test]
fn collapse_then_expand_returns_exactly_the_same_network() {
    let mut ws = rtrw();
    let before = ws.to_tnet();
    let group = ws.collapse("RT/RW Mawar", &homes()).unwrap();
    assert_ne!(ws.to_tnet(), before, "the group is part of the saved file");
    assert!(ws.send_pdu("laptop0", "server0").is_ok(), "traffic still flows while collapsed");
    assert!(ws.expand(&group));
    assert_eq!(ws.to_tnet(), before);
    assert!(!ws.expand(&group));
}

#[test]
fn the_node_card_is_computed_from_live_state() {
    let mut ws = rtrw();
    let group = ws.collapse("RT/RW Mawar", &homes()).unwrap();
    let card = ws.node_card(&group).unwrap();
    assert_eq!(card.name, "RT/RW Mawar");
    assert_eq!(card.devices, 8);
    assert_eq!(card.boundary_links, 1, "one uplink to the gateway");
    assert_eq!(card.capacity_mbit, 100.0, "the slowest boundary port");
    assert_eq!(card.status, "up");
    assert!(card.kinds.iter().any(|(kind, n)| kind == "homerouter" && *n == 3));

    ws.set_port_up("gw0", "Ether2", false);
    assert_eq!(ws.node_card(&group).unwrap().status, "down", "a dead uplink shows on the card");
    ws.set_port_up("gw0", "Ether2", true);
    ws.set_port_up("home1", "FastEthernet0", false);
    assert_eq!(ws.node_card(&group).unwrap().status, "degraded");
}

#[test]
fn groups_survive_save_and_open_and_validate_their_members() {
    let mut ws = rtrw();
    ws.collapse("RT/RW Mawar", &homes()).unwrap();
    let back = Workspace::from_tnet(&ws.to_tnet()).unwrap();
    assert_eq!(back.group_rows().len(), 1);
    assert_eq!(back.node_card("group0").unwrap().devices, 8);

    let mut ws = rtrw();
    assert!(ws.collapse("", &homes()).is_err());
    assert!(ws.collapse("X", &["home0".into()]).is_err());
    assert!(ws.collapse("X", &["home0".into(), "ghost".into()]).is_err());
    assert!(ws.collapse("X", &["home0".into(), "home0".into()]).is_err());
    ws.collapse("A", &homes()).unwrap();
    assert!(ws.collapse("B", &["home0".into(), "server0".into()]).unwrap_err().contains("already inside"));
    assert!(ws.node_card("nope").is_none());
}

#[test]
fn an_isolated_group_says_so() {
    let mut ws = rtrw();
    let group = ws.collapse("Island", &["home0".into(), "laptop0".into(), "radio0".into()]).unwrap();
    assert_eq!(ws.node_card(&group).unwrap().boundary_links, 1);
    ws.unlink("sector0", "radio0");
    let card = ws.node_card(&group).unwrap();
    assert_eq!(card.boundary_links, 0);
    assert_eq!(card.status, "isolated");
}

#[test]
fn the_log_check_reads_the_device_syslog() {
    let mut ws = rtrw();
    ws.lesson = Some(Lesson {
        id: "l".into(), title: "t".into(), level: 2, minutes: 1, goal: "g".into(),
        steps: vec![LessonStep { n: 1, text: "s".into(), check: String::new() }],
        checks: vec![Check {
            id: "c".into(), kind: "log".into(), from: "gw0".into(), to: String::new(),
            url: String::new(), expect: "login refused".into(), label: "log".into(),
        }],
    });
    assert!(!ws.run_checks().remove(0).passed);
    ws.syslog_enable("gw0", true).unwrap();
    ws.syslog_record("gw0", "warning", "login refused for rumah9");
    assert!(ws.run_checks().remove(0).passed);
}
