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
