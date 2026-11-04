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

fn busy() -> Workspace {
    let mut ws = Workspace::from_tnet(SMALL).unwrap();
    ws.set_demand("home0", 95).unwrap();
    ws.set_demand("home1", 8).unwrap();
    ws.set_demand("home2", 8).unwrap();
    ws
}

#[test]
fn rates_follow_demand_then_the_customer_limit_then_the_fair_share() {
    let mut ws = busy();
    let rate = |ws: &Workspace, user: &str| ws.measured_rates("gw0").into_iter().find(|(_, u, _)| u == user).unwrap().2;
    assert_eq!(rate(&ws, "rumah0"), 95.0);
    assert!(ws.line_load("gw0", "Ether1").unwrap() > 100.0, "the hog pushes the line past full");
    ws.set_queue("gw0", "rumah0", 10).unwrap();
    assert_eq!(rate(&ws, "rumah0"), 10.0);
    assert_eq!(rate(&ws, "rumah1"), 8.0, "a limit above the demand changes nothing");
    ws.set_queue_parent("gw0", 12).unwrap();
    assert_eq!(rate(&ws, "rumah1"), 4.0, "a fair share of 12 across three is 4");
    assert_eq!(rate(&ws, "rumah0"), 4.0);
    ws.set_queue_parent("gw0", 24).unwrap();
    assert_eq!(rate(&ws, "rumah1"), 8.0, "whoever wants less hands the rest back");
    assert_eq!(rate(&ws, "rumah0"), 8.0);
}

#[test]
fn queue_input_is_validated_at_the_edges() {
    let mut ws = busy();
    assert!(ws.set_queue("gw0", "nobody", 10).is_err());
    assert!(ws.set_queue("gw0", "rumah0", 100_001).is_err());
    assert!(ws.set_demand("ghost", 5).is_err());
    assert!(ws.set_demand("home0", 100_001).is_err());
    ws.set_queue("gw0", "rumah0", 10).unwrap();
    ws.set_queue("gw0", "rumah0", 0).unwrap();
    assert_eq!(ws.queues.get("gw0").map(Vec::len), Some(0));
    assert_eq!(ws.line_load("gw0", "NoSuchPort"), None);
    let mut back = Workspace::from_tnet(&busy().to_tnet()).unwrap();
    assert_eq!(back.measured_rates("gw0").len(), 3, "demands survive save and open");
    back.set_queue("gw0", "rumah0", 10).unwrap();
    let again = Workspace::from_tnet(&back.to_tnet()).unwrap();
    assert!(again.queues.get("gw0").is_some_and(|l| l.len() == 1), "queues survive save and open");
}

#[test]
fn speed_limit_lesson_fails_while_the_hog_runs_free() {
    let mut ws = Workspace::from_tnet(include_str!("../../../web/templates/les-l2-03-speed-limits.xml")).unwrap();
    assert_eq!(passes(&mut ws), vec![false, false]);
    for user in ["rumah0", "rumah1", "rumah2", "rumah3"] {
        ws.set_queue("gw0", user, 10).unwrap();
    }
    ws.set_queue_parent("gw0", 100).unwrap();
    assert_eq!(passes(&mut ws), vec![true, true]);
}

#[test]
fn find_the_hog_lesson_wants_every_customer_limited() {
    let mut ws = Workspace::from_tnet(include_str!("../../../web/templates/les-l2-06-find-the-hog.xml")).unwrap();
    assert_eq!(passes(&mut ws), vec![false, true]);
    for user in ["rumah0", "rumah1", "rumah2"] {
        ws.set_queue("gw0", user, 10).unwrap();
    }
    assert_eq!(passes(&mut ws), vec![false, true], "three limits are not four");
    ws.set_queue("gw0", "rumah3", 10).unwrap();
    assert_eq!(passes(&mut ws), vec![true, true]);
}

#[test]
fn voucher_lesson_accepts_the_first_phone_and_refuses_the_second() {
    let mut ws = Workspace::from_tnet(include_str!("../../../web/templates/les-l2-04-voucher-hotspot.xml")).unwrap();
    assert_eq!(passes(&mut ws), vec![false, false], "an unknown voucher is refused for both");
    ws.voucher_create("gw0", "MAKAN-4821", 60).unwrap();
    assert_eq!(passes(&mut ws), vec![false, false], "a fresh voucher is not yet a login");
    ws.voucher_redeem("gw0", "phone0", "MAKAN-4821").unwrap();
    assert_eq!(passes(&mut ws), vec![true, true]);
    assert_eq!(ws.voucher_redeem("gw0", "phone1", "MAKAN-4821").unwrap_err(), "Voucher already used");
    ws.voucher_redeem("gw0", "phone0", "MAKAN-4821").unwrap();
    let back = Workspace::from_tnet(&ws.to_tnet()).unwrap();
    assert_eq!(back.voucher_rows("gw0")[0].2.as_deref(), Some("phone0"), "the used voucher survives save and open");
}

#[test]
fn voucher_input_is_validated() {
    let mut ws = Workspace::from_tnet(include_str!("../../../web/templates/tpl-l2-rtrw-hotspot.xml")).unwrap();
    assert!(ws.voucher_create("hotspot0", "ABCD", 60).is_err(), "vouchers live on the gateway");
    assert!(ws.voucher_create("gw0", "AB", 60).is_err());
    assert!(ws.voucher_create("gw0", "HAS SPACE", 60).is_err());
    assert!(ws.voucher_create("gw0", "ABCD", 0).is_err());
    assert!(ws.voucher_create("gw0", "ABCD", 10_081).is_err());
    assert!(ws.voucher_create("gw0", "MAKAN-4821", 60).is_err(), "no duplicate codes");
    assert!(ws.voucher_redeem("gw0", "ghost", "MAKAN-4821").is_err());
    assert!(ws.voucher_redeem("gw0", "phone0", "WRONG").unwrap_err().contains("unknown voucher"));
}

#[test]
fn far_house_lesson_swaps_one_long_shot_for_two_short_hops() {
    let mut ws = Workspace::from_tnet(include_str!("../../../web/templates/les-l2-05-far-house.xml")).unwrap();
    assert_eq!(passes(&mut ws), vec![false, true], "reachable, but far too slow");
    assert!(ws.path_latency_ms("home9", "gw0").unwrap() > 40.0);
    assert!(ws.unlink("sector0", "radio9"));
    assert_eq!(ws.path_latency_ms("home9", "gw0"), None, "no path while recabling");
    ws.link("sector0", "relay0").unwrap();
    ws.link("relay0", "radio9").unwrap();
    ws.set_port_delay("relay0", "FastEthernet0", 12_000).unwrap();
    ws.set_port_delay("radio9", "FastEthernet0", 12_000).unwrap();
    let ms = ws.path_latency_ms("home9", "gw0").unwrap();
    assert!(ms > 20.0 && ms <= 40.0, "{ms}");
    assert_eq!(passes(&mut ws), vec![true, true]);
}
