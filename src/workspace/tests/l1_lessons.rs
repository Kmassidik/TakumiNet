use super::super::*;

const FAULT: &str = include_str!("../../../web/templates/les-l1-07-find-the-fault.xml");

fn results(ws: &mut Workspace) -> Vec<bool> {
    ws.run_checks().into_iter().map(|r| r.passed).collect()
}

#[test]
fn find_the_fault_fails_before_the_fix_and_passes_after() {
    let mut ws = Workspace::from_tnet(FAULT).unwrap();
    assert_eq!(results(&mut ws), vec![false, false]);
    ws.set_ip("laptop0", "192.168.1.20", 24).unwrap();
    assert_eq!(results(&mut ws), vec![true, true]);
}

#[test]
fn find_the_fault_is_not_fixed_by_a_wrong_address() {
    let mut ws = Workspace::from_tnet(FAULT).unwrap();
    ws.set_ip("laptop0", "192.168.1.99", 24).unwrap();
    let r = results(&mut ws);
    assert!(!r[0], "the address check wants the exact address");
}

fn login_check(user_pass: &str, expect: &str) -> Check {
    Check {
        id: "c".into(), kind: "login".into(), from: "laptop0".into(), to: "192.168.1.1".into(),
        url: user_pass.into(), expect: expect.into(), label: "login".into(),
    }
}

fn graded(ws: &mut Workspace, check: Check) -> CheckResult {
    ws.lesson = Some(Lesson {
        id: "l".into(), title: "t".into(), level: 1, minutes: 1, goal: "g".into(),
        steps: vec![LessonStep { n: 1, text: "s".into(), check: String::new() }], checks: vec![check],
    });
    ws.run_checks().remove(0)
}

#[test]
fn the_login_check_requires_a_real_sign_in_and_a_real_refusal() {
    let mut ws = Workspace::from_tnet(include_str!("../../../web/templates/tpl-home.xml")).unwrap();
    // Nothing happened yet: the grader never signs in by itself, so both fail.
    let r = graded(&mut ws, login_check("admin:admin", "ok"));
    assert!(!r.passed && r.actual.contains("has not signed in"), "{}", r.actual);
    assert!(!graded(&mut ws, login_check("admin:letmein", "refused")).passed);

    // A refused attempt from the browser satisfies only the refusal check.
    assert!(ws.router_login("laptop0", "192.168.1.1", "admin", "letmein").is_err());
    assert!(graded(&mut ws, login_check("admin:letmein", "refused")).passed);
    assert!(!graded(&mut ws, login_check("admin:admin", "ok")).passed);

    // A real sign-in satisfies the login check.
    ws.router_login("laptop0", "192.168.1.1", "admin", "admin").unwrap();
    assert!(graded(&mut ws, login_check("admin:admin", "ok")).passed);

    // Another device's sign-in does not count for this one.
    let r = graded_from(&mut ws, "pc0", "ok");
    assert!(!r.passed, "{}", r.actual);
}

fn graded_from(ws: &mut Workspace, from: &str, expect: &str) -> CheckResult {
    let mut check = login_check("admin:admin", expect);
    check.from = from.into();
    graded(ws, check)
}

#[test]
fn router_login_follows_the_cable_and_the_target() {
    let mut ws = Workspace::from_tnet(include_str!("../../../web/templates/tpl-home.xml")).unwrap();
    ws.set_port_up("homerouter0", "FastEthernet0", false);
    assert!(ws.router_login("laptop0", "192.168.1.1", "admin", "admin").unwrap_err().contains("timed out"));
    let r = graded(&mut ws, login_check("admin:admin", "ok"));
    assert!(!r.passed, "a failed delivery is not a sign-in: {}", r.actual);
    assert!(ws.router_login("pc0", "192.168.1.2", "admin", "admin").unwrap_err().contains("no router page"));
    assert!(ws.router_login("pc0", "10.9.9.9", "admin", "admin").unwrap_err().contains("timed out"));
}

#[test]
fn changing_the_admin_password_has_limits() {
    let mut ws = Workspace::from_tnet(include_str!("../../../web/templates/tpl-home.xml")).unwrap();
    assert!(ws.set_router_admin("homerouter0", "admin", "short").is_err());
    assert!(ws.set_router_admin("homerouter0", "admin", "admin").is_err());
    assert!(ws.set_router_admin("homerouter0", "ad min", "longenough").is_err());
    assert!(ws.set_router_admin("pc0", "admin", "longenough").is_err());
    ws.set_router_admin("homerouter0", "admin", "family-secret").unwrap();
    assert!(ws.router_login("pc0", "192.168.1.1", "admin", "admin").is_err());
    assert!(ws.router_login("pc0", "192.168.1.1", "admin", "family-secret").is_ok());
}

#[test]
fn the_admin_password_survives_save_and_open() {
    let mut ws = Workspace::from_tnet(include_str!("../../../web/templates/tpl-home.xml")).unwrap();
    ws.set_router_admin("homerouter0", "owner", "family-secret").unwrap();
    let mut back = Workspace::from_tnet(&ws.to_tnet()).unwrap();
    assert!(back.router_login("pc0", "192.168.1.1", "owner", "family-secret").is_ok());
    assert!(back.router_login("pc0", "192.168.1.1", "admin", "admin").is_err());
}

#[test]
fn the_sign_in_lesson_grades_what_the_learner_really_did() {
    let mut ws = Workspace::from_tnet(include_str!("../../../web/templates/les-l1-01-router-login.xml")).unwrap();
    assert_eq!(results(&mut ws), vec![false, false], "nothing passes before the learner acts");

    assert!(ws.router_login("laptop0", "192.168.1.1", "admin", "letmein").is_err());
    assert_eq!(results(&mut ws), vec![false, true], "a real refusal satisfies only the refusal step");

    ws.router_login("laptop0", "192.168.1.1", "admin", "admin").unwrap();
    assert_eq!(results(&mut ws), vec![true, true]);
}

const WIFI: &str = include_str!("../../../web/templates/les-l1-02-wifi-name.xml");

#[test]
fn wifi_name_lesson_needs_the_new_network_and_a_correct_join() {
    let mut ws = Workspace::from_tnet(WIFI).unwrap();
    assert_eq!(results(&mut ws), vec![false]);
    assert_eq!(ws.wifi_join("phone0", "HomeWifi4821", "welcome123").unwrap(), "homerouter0");
    assert_eq!(results(&mut ws), vec![false], "the old network is the wrong one");
    ws.wlan_remove("homerouter0", "HomeWifi4821").unwrap();
    assert!(ws.wifi_status("phone0").is_none(), "removing a network disconnects its clients");
    assert!(ws.wlan_add("homerouter0", "FamilyNet", "short").is_err());
    ws.wlan_add("homerouter0", "FamilyNet", "family-2024").unwrap();
    assert!(ws.wifi_join("phone0", "FamilyNet", "wrong-pass1").is_err());
    ws.wifi_join("phone0", "FamilyNet", "family-2024").unwrap();
    assert_eq!(results(&mut ws), vec![true]);
}

#[test]
fn removing_a_missing_network_is_an_error() {
    let mut ws = Workspace::from_tnet(WIFI).unwrap();
    assert!(ws.wlan_remove("homerouter0", "Nope").is_err());
    assert!(ws.wlan_remove("laptop0", "HomeWifi4821").is_err());
}

#[test]
fn guest_lesson_fences_visitors_in_both_directions_and_survives_save() {
    let mut ws = Workspace::from_tnet(include_str!("../../../web/templates/les-l1-03-guest-wifi.xml")).unwrap();
    assert_eq!(results(&mut ws), vec![false, false, true]);
    ws.wlan_add("homerouter0", "GuestWifi", "guest-pass1").unwrap();
    ws.wifi_join("laptop0", "GuestWifi", "guest-pass1").unwrap();
    assert!(ws.send_pdu("laptop0", "printer0").is_ok(), "not a guest network yet");
    ws.wlan_set_guest("homerouter0", "GuestWifi", true).unwrap();
    assert_eq!(results(&mut ws), vec![true, true, true]);
    assert!(ws.send_pdu("printer0", "laptop0").unwrap_err().contains("guest network"));
    assert!(ws.send_pdu("laptop0", "homerouter0").is_ok(), "the router itself stays reachable");
    let mut back = Workspace::from_tnet(&ws.to_tnet()).unwrap();
    assert!(back.send_pdu("laptop0", "printer0").is_err());
    ws.wlan_set_guest("homerouter0", "GuestWifi", false).unwrap();
    assert!(ws.send_pdu("laptop0", "printer0").is_ok());
    assert!(ws.wlan_set_guest("homerouter0", "Nope", true).is_err());
}

#[test]
fn reservation_lesson_keeps_the_printer_on_one_address() {
    let mut ws = Workspace::from_tnet(include_str!("../../../web/templates/les-l1-04-reserve-address.xml")).unwrap();
    assert_eq!(results(&mut ws), vec![false, false, false]);
    assert!(ws.set_dhcp_reservation("server0", "printer0", "10.9.9.9").is_err(), "outside every pool");
    assert!(ws.set_dhcp_reservation("server0", "printer0", "nonsense").is_err());
    ws.set_dhcp_reservation("server0", "printer0", "192.168.1.50").unwrap();
    ws.acquire_dhcp("printer0").unwrap();
    assert_eq!(results(&mut ws), vec![true, true, true]);
    ws.release_dhcp("printer0");
    ws.acquire_dhcp("printer0").unwrap();
    let ip = ws.devices.iter().find(|d| d.id == "printer0").and_then(|d| d.ip);
    assert_eq!(ip, crate::model::parse_ipv4("192.168.1.50"), "the address survives a restart");
}

#[test]
fn port_forward_lesson_refuses_until_the_forward_exists_and_validates_input() {
    let mut ws = Workspace::from_tnet(include_str!("../../../web/templates/les-l1-05-port-forward.xml")).unwrap();
    assert_eq!(results(&mut ws), vec![false, false]);
    let page = crate::webapp::fetch(&mut ws, "outside0", "http://192.168.1.1:8080/").unwrap_err();
    assert!(page.contains("no forward"), "{page}");
    assert!(ws.add_port_forward("homerouter0", 0, "server0", 80).is_err());
    assert!(ws.add_port_forward("homerouter0", 80, "server0", 80).is_err());
    assert!(ws.add_port_forward("homerouter0", 8080, "nobody", 80).is_err());
    assert!(ws.add_port_forward("laptop0", 8080, "server0", 80).is_err());
    ws.add_port_forward("homerouter0", 8080, "server0", 8081).unwrap();
    assert!(crate::webapp::fetch(&mut ws, "outside0", "http://192.168.1.1:8080/").unwrap_err().contains("nothing listens"));
    assert!(ws.remove_port_forward("homerouter0", 8080));
    assert!(!ws.remove_port_forward("homerouter0", 8080));
    ws.add_port_forward("homerouter0", 8080, "server0", 80).unwrap();
    assert!(ws.add_port_forward("homerouter0", 8080, "server0", 80).is_err(), "no duplicates");
    assert_eq!(results(&mut ws), vec![true, true]);
    let mut back = Workspace::from_tnet(&ws.to_tnet()).unwrap();
    assert!(crate::webapp::fetch(&mut back, "outside0", "http://192.168.1.1:8080/").is_ok());
    assert!(crate::webapp::fetch(&mut back, "outside0", "http://192.168.1.1/").is_ok(), "the router page is still there");
}

#[test]
fn far_room_lesson_needs_a_roam_to_the_closer_access_point() {
    let mut ws = Workspace::from_tnet(include_str!("../../../web/templates/les-l1-06-far-room.xml")).unwrap();
    assert_eq!(ws.wifi_signal("phone0"), Some(1), "the router is far from the phone");
    assert_eq!(results(&mut ws), vec![false, true]);
    ws.wlan_add("ap0", "FamilyNet", "family-2024").unwrap();
    ws.wifi_roam("phone0", "ap0").unwrap();
    assert_eq!(ws.wifi_signal("phone0"), Some(3));
    assert_eq!(results(&mut ws), vec![true, true]);
}

#[test]
fn signal_bars_follow_distance_and_need_a_join() {
    let mut ws = Workspace::from_tnet(include_str!("../../../web/templates/les-l1-06-far-room.xml")).unwrap();
    assert_eq!(ws.wifi_signal("laptop0"), None, "not joined");
    for (x, bars) in [(200.0, 4), (420.0, 3), (520.0, 2), (620.0, 1), (700.0, 0)] {
        assert!(ws.mv("phone0", x, 200.0));
        assert_eq!(ws.wifi_signal("phone0"), Some(bars), "at x {x}");
    }
}

const PHONE_DEAD: &str = include_str!("../../../web/templates/les-l1-10-phone-dead.xml");

#[test]
fn the_phone_lesson_fails_dark_and_passes_after_power_is_allowed() {
    let mut ws = Workspace::from_tnet(PHONE_DEAD).unwrap();
    assert_eq!(results(&mut ws), vec![false], "a dark phone must not answer");
    use crate::cli::{run as cli_run, Session};
    let mut s = Session::default();
    for line in [
        "enable",
        "configure terminal",
        "interface FastEthernet0/2",
        "power inline auto",
        "end",
    ] {
        cli_run(&mut ws, "switch0", &mut s, line);
    }
    assert_eq!(results(&mut ws), vec![true], "power inline auto must revive the phone");
}
