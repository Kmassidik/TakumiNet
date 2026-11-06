use super::super::*;
use crate::workspace::Dot1xMode;

fn lab() -> (Workspace, String, String, String) {
    let mut ws = Workspace::empty();
    let sw = ws.add("Switch 24", 200.0, 100.0).unwrap();
    let pc = ws.add("PC", 0.0, 0.0).unwrap();
    let peer = ws.add("PC", 100.0, 0.0).unwrap();
    ws.link_ports(&sw, &pc, "eCopper", Some("FastEthernet0/1"), None).unwrap();
    ws.link_ports(&sw, &peer, "eCopper", Some("FastEthernet0/2"), None).unwrap();
    ws.set_port_ip(&pc, "FastEthernet0", "10.80.0.2", 24).unwrap();
    ws.set_port_ip(&peer, "FastEthernet0", "10.80.0.3", 24).unwrap();
    (ws, sw, pc, peer)
}

#[test]
fn auto_port_blocks_data_until_the_eap_exchange_succeeds() {
    let (mut ws, sw, pc, peer) = lab();
    ws.aaa_add_user(&sw, "student", "letmein").unwrap();
    ws.set_dot1x_port(&sw, "FastEthernet0/1", Dot1xMode::Auto).unwrap();
    let err = ws.send_pdu(&pc, &peer).unwrap_err();
    assert!(err.contains("no identity") || err.contains("802.1X"), "{err}");
    ws.set_dot1x(&pc, true, "student", "letmein").unwrap();
    ws.send_pdu(&pc, &peer).unwrap();
    let port = ws.dot1x_port(&sw, "FastEthernet0/1");
    assert!(port.authenticated);
    assert_eq!(port.user.as_deref(), Some("student"));
    assert!(ws.show_dot1x(&sw).contains("Authorized"));
}

#[test]
fn a_wrong_password_leaves_the_port_unauthorized() {
    let (mut ws, sw, pc, peer) = lab();
    ws.aaa_add_user(&sw, "student", "letmein").unwrap();
    ws.set_dot1x_port(&sw, "FastEthernet0/1", Dot1xMode::Auto).unwrap();
    ws.set_dot1x(&pc, true, "student", "wrong").unwrap();
    let err = ws.send_pdu(&pc, &peer).unwrap_err();
    assert!(err.contains("EAP authentication failed"), "{err}");
    assert!(!ws.dot1x_port(&sw, "FastEthernet0/1").authenticated);
}

#[test]
fn a_radius_server_can_hold_the_credentials_instead_of_the_switch() {
    let (mut ws, sw, pc, peer) = lab();
    let server = ws.add("Server", 200.0, 300.0).unwrap();
    ws.set_port_ip(&server, "FastEthernet0", "10.80.0.10", 24).unwrap();
    ws.aaa_add_user(&server, "student", "letmein").unwrap();
    ws.set_radius_server(&sw, crate::model::parse_ipv4("10.80.0.10").unwrap());
    ws.set_dot1x_port(&sw, "FastEthernet0/1", Dot1xMode::Auto).unwrap();
    ws.set_dot1x(&pc, true, "student", "letmein").unwrap();
    ws.send_pdu(&pc, &peer).unwrap();
    assert!(ws.dot1x_port(&sw, "FastEthernet0/1").authenticated);
}

#[test]
fn force_modes_do_not_run_an_exchange() {
    let (mut ws, sw, pc, peer) = lab();
    ws.set_dot1x_port(&sw, "FastEthernet0/1", Dot1xMode::ForceUnauthorized).unwrap();
    let err = ws.send_pdu(&pc, &peer).unwrap_err();
    assert!(err.contains("force-unauthorized"), "{err}");
    ws.set_dot1x_port(&sw, "FastEthernet0/1", Dot1xMode::ForceAuthorized).unwrap();
    ws.send_pdu(&pc, &peer).unwrap();
}

#[test]
fn port_state_and_radius_survive_a_round_trip() {
    let (mut ws, sw, _pc, _peer) = lab();
    ws.set_radius_server(&sw, crate::model::parse_ipv4("10.80.0.10").unwrap());
    ws.set_dot1x_port(&sw, "FastEthernet0/1", Dot1xMode::Auto).unwrap();
    ws.set_dot1x_port(&sw, "FastEthernet0/2", Dot1xMode::ForceUnauthorized).unwrap();
    let back = Workspace::from_tnet(&ws.to_tnet()).unwrap();
    assert_eq!(back.dot1x_port(&sw, "FastEthernet0/1").mode, Dot1xMode::Auto);
    assert_eq!(back.dot1x_port(&sw, "FastEthernet0/2").mode, Dot1xMode::ForceUnauthorized);
    assert_eq!(back.radius_server(&sw), crate::model::parse_ipv4("10.80.0.10"));
}
