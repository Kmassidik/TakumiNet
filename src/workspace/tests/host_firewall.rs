use super::super::*;

#[test]
fn the_ufw_rules_survive_a_save_and_open_round_trip() {
    let mut ws = Workspace::new();
    crate::cmd::run(&mut ws, "pc0", "sudo ufw default deny incoming");
    crate::cmd::run(&mut ws, "pc0", "sudo ufw allow 22/tcp");
    crate::cmd::run(&mut ws, "pc0", "sudo ufw deny from 10.0.0.0/24");
    crate::cmd::run(&mut ws, "pc0", "sudo ufw deny proto icmp from any");
    crate::cmd::run(&mut ws, "pc0", "sudo ufw enable");
    let back = Workspace::from_tnet(&ws.to_tnet()).unwrap();
    let (before, after) = (ws.ufw("pc0").unwrap(), back.ufw("pc0").unwrap());
    assert!(after.enabled && !after.default_allow);
    assert_eq!(before.rules, after.rules);
    assert_eq!(after.rules.len(), 3);
}

#[test]
fn removing_a_device_forgets_its_firewall() {
    let mut ws = Workspace::new();
    crate::cmd::run(&mut ws, "pc0", "sudo ufw enable");
    assert!(ws.remove("pc0"));
    assert!(ws.ufw("pc0").is_none());
}
