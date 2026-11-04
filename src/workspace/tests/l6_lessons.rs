use super::super::*;
use crate::model::parse_ipv4 as ip;

fn passes(ws: &mut Workspace) -> Vec<bool> {
    ws.run_checks().into_iter().map(|r| r.passed).collect()
}

#[test]
fn the_two_upstreams_template_ships_with_both_sessions_up() {
    let mut ws = Workspace::from_tnet(include_str!("../../../web/templates/tpl-l6-isp-two-upstreams.xml")).unwrap();
    assert_eq!(ws.bgp_session_state("border0", "10.1.1.2"), "established");
    assert_eq!(ws.bgp_session_state("border0", "10.1.2.2"), "established");
    assert_eq!(ws.bgp_session_state("upa0", "10.1.3.2"), "established");
    assert!(ws.has_route("border0", ip("203.0.113.0").unwrap(), 24));
    assert!(ws.has_route("upa0", ip("192.168.50.0").unwrap(), 24));
    assert!(ws.send_pdu("pc0", "server0").is_ok());
    let table = ws.show_routes("border0");
    assert!(table.contains("B  203.0.113.0/24 [20/0] via 10.1.1.2"), "{table}");
}

#[test]
fn the_pop_template_serves_the_far_page_by_name() {
    let mut ws = Workspace::from_tnet(include_str!("../../../web/templates/tpl-l6-isp-pop.xml")).unwrap();
    assert_eq!(ws.bgp_session_state("border0", "10.0.0.2"), "established");
    assert_eq!(ws.bgp_session_state("up0", "10.0.0.1"), "established");
    assert!(ws.has_route("border0", ip("203.0.113.0").unwrap(), 24));
    assert!(ws.has_route("up0", ip("100.64.0.0").unwrap(), 24));
    let page = crate::webapp::fetch(&mut ws, "laptop0", "http://www.berita.lab/").unwrap();
    assert_eq!(page.title, "SitusBerita");
}

#[test]
fn the_first_bgp_lesson_needs_the_border_side_of_both_sessions() {
    let mut ws = Workspace::from_tnet(include_str!("../../../web/templates/les-l6-02-first-bgp.xml")).unwrap();
    assert_eq!(passes(&mut ws), vec![false, false, false]);
    assert_eq!(ws.bgp_session_state("border0", "10.1.1.2"), "none");
    assert_eq!(ws.bgp_session_state("upa0", "10.1.1.1"), "idle");
    ws.bgp_config("border0", 64500).unwrap();
    assert_eq!(passes(&mut ws), vec![false, false, false], "a local system alone brings nothing up");
    ws.bgp_neighbor("border0", "10.1.1.2", 64601).unwrap();
    assert_eq!(passes(&mut ws)[..2], [true, false]);
    ws.bgp_neighbor("border0", "10.1.2.2", 64602).unwrap();
    ws.bgp_network("border0", ip("192.168.50.0").unwrap(), 24).unwrap();
    assert_eq!(passes(&mut ws), vec![true, true, true]);
    assert_eq!(ws.bgp_session_state("upa0", "10.1.1.1"), "established");
    assert!(ws.has_route("upa0", ip("192.168.50.0").unwrap(), 24), "the border's announcement reached the provider");
}

#[test]
fn a_wrong_autonomous_system_keeps_the_session_idle() {
    let mut ws = Workspace::from_tnet(include_str!("../../../web/templates/les-l6-02-first-bgp.xml")).unwrap();
    ws.bgp_config("border0", 64500).unwrap();
    ws.bgp_neighbor("border0", "10.1.1.2", 64999).unwrap();
    assert_eq!(ws.bgp_session_state("border0", "10.1.1.2"), "idle");
    assert!(!ws.has_route("border0", ip("203.0.113.0").unwrap(), 24));
    ws.bgp_neighbor("border0", "10.1.1.2", 64601).unwrap();
    assert_eq!(ws.bgp_session_state("border0", "10.1.1.2"), "established");
    ws.bgp_config("border0", 64501).unwrap();
    assert_eq!(ws.bgp_session_state("border0", "10.1.1.2"), "idle", "the mirror entry names 64500, not 64501");
}

#[test]
fn the_two_upstreams_lesson_survives_either_cut() {
    let mut ws = Workspace::from_tnet(include_str!("../../../web/templates/les-l6-03-two-upstreams.xml")).unwrap();
    assert_eq!(passes(&mut ws), vec![true, true]);
    ws.bgp_remove_network("upb0", ip("203.0.113.0").unwrap(), 24);
    assert_eq!(passes(&mut ws), vec![false, true], "without the southern announcement one cut isolates the customer");
}

#[test]
fn a_dead_link_drops_the_session_and_traffic_swings_over() {
    let mut ws = Workspace::from_tnet(include_str!("../../../web/templates/tpl-l6-isp-two-upstreams.xml")).unwrap();
    ws.set_port_up("border0", "GigabitEthernet0/1", false);
    assert_eq!(ws.bgp_session_state("border0", "10.1.1.2"), "idle");
    assert_eq!(ws.bgp_session_state("border0", "10.1.2.2"), "established");
    let sessions = ws.bgp_sessions("border0");
    assert_eq!(sessions.len(), 2);
    assert_eq!(sessions[0], ("10.1.1.2".to_string(), 64601, "idle".to_string()));
    assert_eq!(sessions[1], ("10.1.2.2".to_string(), 64602, "established".to_string()));
    assert!(ws.send_pdu("pc0", "server0").is_ok(), "the southern provider carries the traffic");
    ws.set_port_up("border0", "GigabitEthernet0/1", true);
    assert_eq!(ws.bgp_session_state("border0", "10.1.1.2"), "established");
}

#[test]
fn bgp_input_is_validated_at_the_edges() {
    let mut ws = Workspace::from_tnet(include_str!("../../../web/templates/tpl-l6-isp-two-upstreams.xml")).unwrap();
    assert!(ws.bgp_config("nowhere", 64500).is_err());
    assert!(ws.bgp_config("pc0", 64500).is_err(), "a PC does not route");
    assert!(ws.bgp_config("border0", 0).is_err());
    assert!(ws.bgp_config("border0", u32::MAX).is_ok());
    assert!(ws.bgp_neighbor("border0", "not-an-address", 64601).is_err());
    assert!(ws.bgp_neighbor("border0", "10.1.1.2", 0).is_err());
    assert!(ws.bgp_neighbor("pc0", "10.1.1.2", 64601).is_err(), "no local system was set");
    assert!(ws.bgp_network("border0", ip("192.168.50.0").unwrap(), 33).is_err());
    assert!(!ws.bgp_remove_neighbor("border0", "10.9.9.9"));
    assert!(!ws.bgp_remove_neighbor("border0", "nonsense"));
    assert!(!ws.bgp_remove_network("border0", ip("10.9.9.0").unwrap(), 24));
    assert!(ws.bgp_remove_neighbor("border0", "10.1.1.2"));
    assert_eq!(ws.bgp_session_state("border0", "10.1.1.2"), "none");
    assert_eq!(ws.bgp_session_state("nowhere", "10.1.1.2"), "none");
    assert!(ws.bgp_sessions("nowhere").is_empty());
}

#[test]
fn bgp_state_survives_a_save_and_open() {
    let ws = Workspace::from_tnet(include_str!("../../../web/templates/tpl-l6-isp-two-upstreams.xml")).unwrap();
    let saved = ws.to_tnet();
    for row in [
        "<bgprouter dev=\"border0\" as=\"64500\"/>",
        "<bgpneighbor dev=\"border0\" peer=\"10.1.1.2\" as=\"64601\"/>",
        "<bgpnet dev=\"upb0\" net=\"192.168.50.0\" prefix=\"24\"/>",
    ] {
        assert!(saved.contains(row), "{row} missing from\n{saved}");
    }
    let mut back = Workspace::from_tnet(&saved).unwrap();
    assert_eq!(back.bgp, ws.bgp);
    assert_eq!(back.bgp_session_state("border0", "10.1.2.2"), "established");
    assert!(back.send_pdu("pc0", "server0").is_ok());
}

#[test]
fn the_prefix_filter_lesson_needs_the_deny_entry() {
    let mut ws = Workspace::from_tnet(include_str!("../../../web/templates/les-l6-04-prefix-filter.xml")).unwrap();
    assert!(ws.has_route("border0", ip("192.168.0.0").unwrap(), 16), "the bogus announcement starts in the table");
    assert_eq!(passes(&mut ws), vec![false, true, true]);
    ws.bgp_deny("border0", ip("192.168.0.0").unwrap(), 16).unwrap();
    assert!(!ws.has_route("border0", ip("192.168.0.0").unwrap(), 16));
    assert_eq!(passes(&mut ws), vec![true, true, true]);
    assert!(ws.has_route("border0", ip("203.0.113.0").unwrap(), 24), "legitimate routes survive the deny entry");
    assert!(ws.send_pdu("pc0", "server0").is_ok());
    assert_eq!(ws.bgp_denied("border0"), vec![(ip("192.168.0.0").unwrap(), 16)]);
    assert!(ws.bgp_remove_deny("border0", ip("192.168.0.0").unwrap(), 16));
    assert!(ws.has_route("border0", ip("192.168.0.0").unwrap(), 16), "removing the entry lets the announcement back in");
}

#[test]
fn a_deny_entry_survives_a_save_and_open() {
    let mut ws = Workspace::from_tnet(include_str!("../../../web/templates/les-l6-04-prefix-filter.xml")).unwrap();
    ws.bgp_deny("border0", ip("192.168.0.0").unwrap(), 16).unwrap();
    assert!(ws.bgp_deny("nowhere", ip("192.168.0.0").unwrap(), 16).is_err());
    assert!(ws.bgp_deny("border0", ip("192.168.0.0").unwrap(), 33).is_err());
    assert!(!ws.bgp_remove_deny("border0", ip("10.9.9.0").unwrap(), 24));
    let saved = ws.to_tnet();
    assert!(saved.contains("<bgpdeny dev=\"border0\" net=\"192.168.0.0\" prefix=\"16\"/>"), "{saved}");
    let mut back = Workspace::from_tnet(&saved).unwrap();
    assert_eq!(back.bgp, ws.bgp);
    assert!(!back.has_route("border0", ip("192.168.0.0").unwrap(), 16));
    assert_eq!(passes(&mut back), vec![true, true, true]);
}

#[test]
fn the_address_plan_lesson_needs_the_pool_the_lease_and_the_page() {
    let mut ws = Workspace::from_tnet(include_str!("../../../web/templates/les-l6-01-address-plan.xml")).unwrap();
    assert_eq!(passes(&mut ws), vec![false, false, false]);
    ws.set_dhcp_pool("gw0", "192.168.10.0", 24, "192.168.10.1", "198.51.100.53").unwrap();
    assert_eq!(passes(&mut ws), vec![true, false, false]);
    let lease = ws.acquire_dhcp("laptop0").unwrap();
    assert!(crate::model::contains(lease.ip, ip("192.168.10.0").unwrap(), 24));
    assert_eq!(passes(&mut ws), vec![true, true, true]);
}
