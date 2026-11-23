use super::super::*;
use crate::model::parse_ipv4 as ip;

const CAMPUS: &str = include_str!("../../../web/templates/tpl-l4-campus-ospf.xml");
const LESSON: &str = include_str!("../../../web/templates/les-l4-03-ospf-campus.xml");

fn passes(ws: &mut Workspace) -> Vec<bool> {
    ws.run_checks().into_iter().map(|r| r.passed).collect()
}

#[test]
fn the_campus_template_routes_with_ospf() {
    let mut ws = Workspace::from_tnet(CAMPUS).unwrap();
    assert!(ws.has_route("router0", ip("192.168.2.0").unwrap(), 24));
    assert!(ws.send_pdu("pc0", "server0").is_ok());
}

#[test]
fn the_ospf_lesson_fails_untouched_and_passes_when_followed() {
    let mut ws = Workspace::from_tnet(LESSON).unwrap();
    assert_eq!(passes(&mut ws), vec![false, false, false]);
    for id in ["router0", "router1", "router2", "router3"] {
        ws.set_routing_protocol(id, "ospf", 1).unwrap();
        for n in ["192.168.1.0", "192.168.2.0", "10.0.1.0", "10.0.2.0", "10.0.3.0", "10.0.4.0"] {
            ws.add_routing_network(id, ip(n).unwrap(), 24, 0).unwrap();
        }
    }
    assert_eq!(passes(&mut ws), vec![true, true, true]);
}

#[test]
fn the_outage_check_never_changes_the_live_network() {
    let mut ws = Workspace::from_tnet(CAMPUS).unwrap();
    ws.lesson = Workspace::from_tnet(LESSON).unwrap().lesson;
    assert_eq!(passes(&mut ws).last(), Some(&true));
    let port_up = ws.devices.iter().find(|d| d.id == "router0").unwrap().ports.iter().find(|p| p.name == "GigabitEthernet0/1").unwrap().up;
    assert!(port_up, "the cut happens on a copy");
}

#[test]
fn a_single_path_does_not_survive_a_cut_and_a_bad_cut_is_reported() {
    let mut ws = Workspace::from_tnet(CAMPUS).unwrap();
    let mut lesson = Workspace::from_tnet(LESSON).unwrap().lesson.unwrap();
    lesson.checks.truncate(0);
    let outage = |url: &str| Check {
        id: "o".into(), kind: "outage".into(), from: "pc0".into(), to: "server0".into(),
        url: url.into(), expect: "ok".into(), label: "cut".into(),
    };
    lesson.checks = vec![outage("router0:GigabitEthernet0/0"), outage("router0"), outage("router0:Nope9/9")];
    ws.lesson = Some(lesson);
    let results = ws.run_checks();
    assert!(!results[0].passed && results[0].actual.contains("unreachable"), "{}", results[0].actual);
    assert!(results[1].actual.contains("invalid cut"));
    assert!(results[2].actual.contains("no port"));
}

#[test]
fn the_campus_ring_reroutes_after_any_single_link_cut() {
    // Every ring cable: cutting exactly one must leave a working path.
    let ring_cables: [(&str, &str); 4] = [
        ("router0", "GigabitEthernet0/1"), // router0–router1
        ("router0", "GigabitEthernet0/2"), // router0–router2
        ("router1", "GigabitEthernet0/1"), // router1–router3
        ("router2", "GigabitEthernet0/1"), // router2–router3
    ];
    for (dev, port) in ring_cables {
        let mut ws = Workspace::from_tnet(CAMPUS).unwrap();
        assert!(ws.set_port_up(dev, port, false), "{dev} {port}");
        assert!(
            ws.send_pdu("pc0", "server0").is_ok(),
            "one cut of {dev} {port} must reroute, not drop"
        );
    }
}

#[test]
fn the_campus_ring_drops_when_router0_loses_both_ring_links() {
    // Two cuts around router0 leave it no path out: delivery must fail.
    let mut ws = Workspace::from_tnet(CAMPUS).unwrap();
    assert!(ws.set_port_up("router0", "GigabitEthernet0/1", false));
    assert!(ws.set_port_up("router0", "GigabitEthernet0/2", false));
    assert!(
        ws.send_pdu("pc0", "server0").is_err(),
        "router0 with both ring links down is isolated"
    );
}

#[test]
fn the_campus_ring_survives_two_cuts_that_leave_a_path() {
    // Two cuts elsewhere still leave pc0 → router0 → ring → server0.
    for pair in [
        // Both cuts on the router0–router1 side: the router2 side still reaches server0.
        [("router0", "GigabitEthernet0/1"), ("router1", "GigabitEthernet0/0")],
        [("router0", "GigabitEthernet0/1"), ("router1", "GigabitEthernet0/1")],
        // Both cuts inside router1 leave the router2 path intact.
        [("router1", "GigabitEthernet0/0"), ("router1", "GigabitEthernet0/1")],
    ] {
        let mut ws = Workspace::from_tnet(CAMPUS).unwrap();
        for (dev, port) in pair {
            assert!(ws.set_port_up(dev, port, false), "{dev} {port}");
        }
        assert!(
            ws.send_pdu("pc0", "server0").is_ok(),
            "cuts {pair:?} leave a path; delivery must survive"
        );
    }
}
