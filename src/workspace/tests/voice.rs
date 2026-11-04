use super::super::*;

const OFFICE: &str = include_str!("../../../web/templates/tpl-office-voice.xml");
const LESSON: &str = include_str!("../../../web/templates/les-l4-07-two-phones.xml");
const LAST_MILE: &str = include_str!("../../../web/templates/tpl-last-mile.xml");
const L1_LESSON: &str = include_str!("../../../web/templates/les-l1-08-last-mile.xml");

fn passes(ws: &mut Workspace) -> Vec<bool> {
    ws.run_checks().into_iter().map(|r| r.passed).collect()
}

#[test]
fn the_office_template_opens_with_both_phones_registered_and_a_live_call() {
    let ws = Workspace::from_tnet(OFFICE).unwrap();
    assert_eq!(ws.phone_status("phone1").unwrap(), ("10.20.0.5".into(), 2001));
    assert_eq!(ws.phone_status("phone2").unwrap(), ("10.20.0.5".into(), 2002));
    assert_eq!(ws.call_of(2001).unwrap(), (2001, 2002, "established".into()));
    assert_eq!(ws.call_of(2002).unwrap(), (2001, 2002, "established".into()));
    let back = Workspace::from_tnet(&ws.to_tnet()).unwrap();
    assert_eq!(back.call_of(2001).unwrap(), (2001, 2002, "established".into()));
}

#[test]
fn register_dial_and_check_follow_the_lesson() {
    let mut ws = Workspace::from_tnet(LESSON).unwrap();
    assert_eq!(passes(&mut ws)[0], false, "the call check fails before anyone registers");
    ws.phone_register("phone1", "10.20.0.5", 2001).unwrap();
    ws.phone_register("phone2", "10.20.0.5", 2002).unwrap();
    assert_eq!(passes(&mut ws)[0], false, "registered is not yet called");
    let before = ws.events.len();
    ws.call(2001, 2002).unwrap();
    assert_eq!(ws.events.len(), before + 1, "a call records exactly one SIP event");
    assert_eq!(ws.events.last().unwrap().proto, "SIP");
    assert_eq!(passes(&mut ws), vec![true, true]);
}

#[test]
fn a_call_needs_registration_a_peer_and_one_call_manager() {
    let mut ws = Workspace::from_tnet(LESSON).unwrap();
    assert!(ws.call(2001, 2002).unwrap_err().contains("no phone is registered as extension 2001"));
    ws.phone_register("phone1", "10.20.0.5", 2001).unwrap();
    assert!(ws.call(2001, 2001).unwrap_err().contains("own extension"));
    assert!(ws.call(2001, 2002).unwrap_err().contains("no phone is registered as extension 2002"));
    let second = ws.add("Server", 900.0, 100.0).unwrap();
    ws.set_ip(&second, "10.20.0.6", 24).unwrap();
    ws.link(&second, "switch0").unwrap();
    ws.phone_register("phone2", "10.20.0.6", 2002).unwrap();
    assert!(ws.call(2001, 2002).unwrap_err().contains("different call managers"));
    assert!(ws.calls.is_empty(), "no failed attempt leaves a call behind");
}

#[test]
fn a_broken_path_blocks_the_call_and_leaves_the_capture_clean() {
    let mut ws = Workspace::from_tnet(LESSON).unwrap();
    ws.phone_register("phone1", "10.20.0.5", 2001).unwrap();
    ws.phone_register("phone2", "10.20.0.5", 2002).unwrap();
    assert!(ws.set_port_up("switch0", "FastEthernet0/4", false));
    let err = ws.call(2001, 2002).unwrap_err();
    assert!(err.contains("cannot reach"), "{err}");
    assert!(ws.calls.is_empty());
    assert!(ws.set_port_up("switch0", "FastEthernet0/4", true));
    ws.call(2001, 2002).unwrap();
    assert_eq!(ws.call_of(2002).unwrap().2, "established");
}

#[test]
fn an_analog_phone_rides_its_routers_connection() {
    let mut ws = Workspace::empty();
    let switch = ws.add("Switch 24", 100.0, 100.0).unwrap();
    let server = ws.add("Server", 200.0, 100.0).unwrap();
    let router = ws.add("Router 300", 300.0, 100.0).unwrap();
    let ip_phone = ws.add("IP Phone", 400.0, 100.0).unwrap();
    let analog = ws.add("Analog Phone", 500.0, 100.0).unwrap();
    ws.set_ip(&server, "10.9.0.5", 24).unwrap();
    ws.set_ip(&router, "10.9.0.1", 24).unwrap();
    ws.set_ip(&ip_phone, "10.9.0.7", 24).unwrap();
    ws.link(&server, &switch).unwrap();
    ws.link(&router, &switch).unwrap();
    ws.link(&ip_phone, &switch).unwrap();
    ws.phone_register(&ip_phone, "10.9.0.5", 3001).unwrap();
    ws.phone_register(&analog, "10.9.0.5", 3002).unwrap();
    let err = ws.call(3001, 3002).unwrap_err();
    assert!(err.contains("needs a phone cable"), "{err}");
    ws.link_kind(&analog, &router, "ePhone").unwrap();
    ws.call(3001, 3002).unwrap();
    assert_eq!(ws.call_of(3002).unwrap(), (3001, 3002, "established".into()));
}

#[test]
fn the_last_mile_template_carries_both_homes_to_the_isp() {
    let mut ws = Workspace::from_tnet(LAST_MILE).unwrap();
    ws.send_pdu("pc0", "server0").unwrap();
    ws.send_pdu("pc1", "server0").unwrap();
    ws.send_pdu("pc0", "pc1").unwrap();
}

#[test]
fn the_last_mile_lesson_is_cabled_and_addressed_by_hand() {
    let mut ws = Workspace::from_tnet(L1_LESSON).unwrap();
    assert_eq!(passes(&mut ws), vec![false, false]);
    ws.link("homerouter0", "cablemodem0").unwrap();
    ws.link_kind("cablemodem0", "cloud0", "eCoax").unwrap();
    ws.set_ip("pc0", "203.0.113.10", 24).unwrap();
    let results = ws.run_checks();
    assert!(results[0].passed, "{}", results[0].actual);
    assert!(results[1].passed, "{}", results[1].actual);
}

#[test]
fn the_access_modems_take_ordinary_cables_and_coax_stays_on_the_street_side() {
    let mut ws = Workspace::empty();
    let modem = ws.add("Cable Modem", 100.0, 100.0).unwrap();
    let dsl = ws.add("DSL Modem", 200.0, 100.0).unwrap();
    let home = ws.add("Home Router", 300.0, 100.0).unwrap();
    let cloud = ws.add("Cloud", 400.0, 100.0).unwrap();
    let pc = ws.add("PC", 500.0, 100.0).unwrap();
    ws.link(&home, &modem).unwrap();
    ws.link_kind(&modem, &cloud, "eCoax").unwrap();
    ws.link(&dsl, &cloud).unwrap();
    let err = ws.link_kind(&pc, &dsl, "eCoax").unwrap_err();
    assert!(err.contains("coaxial"), "{err}");
    ws.link(&pc, &dsl).unwrap();
}
