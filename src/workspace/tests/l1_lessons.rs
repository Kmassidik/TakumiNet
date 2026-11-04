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
