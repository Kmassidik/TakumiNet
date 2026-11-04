use super::super::*;
use crate::model::parse_ipv4 as ip;

const SMALL: &str = include_str!("../../../web/templates/tpl-l2-rtrw-small.xml");
const GATEWAY: &str = include_str!("../../../web/templates/les-l2-01-first-gateway.xml");

fn passes(ws: &mut Workspace) -> Vec<bool> {
    ws.run_checks().into_iter().map(|r| r.passed).collect()
}

#[test]
fn the_small_rtrw_template_serves_a_home_laptop() {
    let mut ws = Workspace::from_tnet(SMALL).unwrap();
    let page = crate::webapp::fetch(&mut ws, "laptop0", "http://www.example.lab/").unwrap();
    assert_eq!(page.title, "ExampleSite");
    assert_eq!(ws.pppoe_status("home1").map(|(_, user)| user), Some("rumah1".into()));
}

#[test]
fn the_first_gateway_lesson_blocks_private_homes_until_nat_exists() {
    let mut ws = Workspace::from_tnet(GATEWAY).unwrap();
    assert_eq!(passes(&mut ws), vec![false, false, false]);
    ws.set_port_ip("gw0", "Ether1", "203.0.113.2", 24).unwrap();
    let refusal = ws.send_pdu("laptop0", "server0").unwrap_err();
    assert!(refusal.contains("masquerade"), "{refusal}");
    assert_eq!(passes(&mut ws), vec![true, false, false]);
    ws.acl_add("gw0", 1, true, ip("10.10.0.0").unwrap(), ip("0.0.0.255").unwrap(), None).unwrap();
    ws.set_nat_role("gw0", "Ether2", true).unwrap();
    ws.set_nat_role("gw0", "Ether1", false).unwrap();
    ws.add_nat_rule("gw0", 1, "Ether1").unwrap();
    assert_eq!(passes(&mut ws), vec![true, true, true]);
    let note = &ws.events.last().unwrap().note;
    assert!(note.contains("NAT: 10.10.0.20 -> 203.0.113.2"), "{note}");
}

#[test]
fn the_gateway_speaks_the_terminal_and_shows_its_routes() {
    let mut ws = Workspace::from_tnet(SMALL).unwrap();
    let routes = ws.show_routes("gw0");
    assert!(routes.contains("10.10.0.0/24"), "{routes}");
    assert!(routes.contains("203.0.113.0/24"), "{routes}");
}

#[test]
fn customer_login_lesson_counts_real_sessions_and_refuses_wrong_passwords() {
    let mut ws = Workspace::from_tnet(include_str!("../../../web/templates/les-l2-02-customer-login.xml")).unwrap();
    assert_eq!(passes(&mut ws), vec![false, true]);
    let refusal = ws.pppoe_connect("home0", "10.10.0.1", "rumah0", "anything").unwrap_err();
    assert!(refusal.contains("Login refused"), "{refusal}");
    ws.aaa_add_user("gw0", "rumah0", "paket10-a").unwrap();
    ws.pppoe_connect("home0", "10.10.0.1", "rumah0", "paket10-a").unwrap();
    ws.pppoe_connect("home1", "10.10.0.1", "rumah1", "paket10-b").unwrap();
    assert_eq!(passes(&mut ws), vec![false, true], "two sessions are not three");
    ws.pppoe_connect("home2", "10.10.0.1", "rumah2", "paket10-c").unwrap();
    assert_eq!(passes(&mut ws), vec![true, true]);
    assert_eq!(ws.pppoe_sessions("gw0").len(), 3);
    assert!(ws.pppoe_connect("home0", "10.10.0.9", "rumah0", "paket10-a").is_err(), "no device at that address");
    let back = Workspace::from_tnet(&ws.to_tnet()).unwrap();
    assert_eq!(back.pppoe_sessions("gw0").len(), 3, "sessions survive save and open");
}
