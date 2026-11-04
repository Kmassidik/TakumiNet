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
fn router_login_accepts_the_sticker_and_refuses_anything_else() {
    let mut ws = Workspace::from_tnet(include_str!("../../../web/templates/tpl-home.xml")).unwrap();
    assert!(graded(&mut ws, login_check("admin:admin", "ok")).passed);
    assert!(!graded(&mut ws, login_check("admin:wrong", "ok")).passed);
    assert!(graded(&mut ws, login_check("admin:wrong", "refused")).passed);
    assert!(!graded(&mut ws, login_check("admin:admin", "refused")).passed);
    assert!(!graded(&mut ws, login_check("", "ok")).passed);
}

#[test]
fn router_login_follows_the_cable_and_the_target() {
    let mut ws = Workspace::from_tnet(include_str!("../../../web/templates/tpl-home.xml")).unwrap();
    ws.set_port_up("homerouter0", "FastEthernet0", false);
    let r = graded(&mut ws, login_check("admin:admin", "ok"));
    assert!(!r.passed && r.actual.contains("timed out"), "{}", r.actual);
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
fn the_sign_in_lesson_passes_with_the_sticker_and_not_before_a_cable_fault() {
    let mut ws = Workspace::from_tnet(include_str!("../../../web/templates/les-l1-01-router-login.xml")).unwrap();
    assert_eq!(results(&mut ws), vec![true, true]);
    ws.set_router_admin("homerouter0", "admin", "family-secret").unwrap();
    assert_eq!(results(&mut ws), vec![false, true], "the sticker no longer works once the password changes");
}
