use super::super::*;

fn passes(ws: &mut Workspace) -> Vec<bool> {
    ws.run_checks().into_iter().map(|r| r.passed).collect()
}

#[test]
fn the_n_minus_one_lesson_runs_hot_until_the_flows_spread() {
    let text = include_str!("../../../web/templates/les-l9-02-n-minus-one.xml");
    let mut ws = Workspace::from_tnet(text).unwrap();
    assert!(ws.hottest_link_percent() > 70.0, "both flows must ride one arc");
    let before = passes(&mut ws);
    assert_eq!(before, vec![false, true, true], "only the load check is red while the ring itself heals");
    ws.set_flow_spread(true);
    assert!(ws.hottest_link_percent() <= 70.0);
    assert_eq!(passes(&mut ws), vec![true, true, true]);
}

#[test]
fn the_transit_lesson_passes_once_the_buyer_configures_its_side() {
    let text = include_str!("../../../web/templates/les-l9-04-sell-transit.xml");
    let mut ws = Workspace::from_tnet(text).unwrap();
    assert_eq!(passes(&mut ws), vec![false, false, false]);
    ws.bgp_config("tetangga", 64702).unwrap();
    ws.bgp_neighbor("tetangga", "10.9.61.1", 64701).unwrap();
    let net = crate::model::parse_ipv4("10.60.1.0").unwrap();
    ws.bgp_network("tetangga", net, 24).unwrap();
    assert_eq!(passes(&mut ws), vec![true, true, true]);
}

#[test]
fn the_exchange_lesson_counts_established_sessions_per_member() {
    let text = include_str!("../../../web/templates/les-l9-05-exchange-members.xml");
    let mut ws = Workspace::from_tnet(text).unwrap();
    let before = passes(&mut ws);
    assert_eq!(before, vec![false, false, true], "sessions need both ends");
    ws.bgp_neighbor("ib", "172.19.0.1", 64711).unwrap();
    ws.bgp_neighbor("ib", "172.19.0.3", 64713).unwrap();
    ws.bgp_neighbor("ic", "172.19.0.1", 64711).unwrap();
    ws.bgp_neighbor("ic", "172.19.0.2", 64712).unwrap();
    assert_eq!(passes(&mut ws), vec![true, true, true]);
    let ia: Vec<_> = ws.bgp_sessions("ia").into_iter().filter(|(_, _, s)| s == "established").collect();
    assert_eq!(ia.len(), 2, "the preconfigured member also sees both sessions up");
}

#[test]
fn the_cache_lesson_serves_the_page_locally_once_its_port_is_up() {
    let text = include_str!("../../../web/templates/les-l10-02-cache-saves-cables.xml");
    let mut ws = Workspace::from_tnet(text).unwrap();
    let before = passes(&mut ws);
    assert_eq!(before, vec![false, false, true], "the overseas original works even with the cache dark");
    ws.link_kind("pop0", "cache0", "eCross").unwrap();
    assert_eq!(passes(&mut ws), vec![true, true, true]);
    let page = crate::webapp::fetch(&mut ws, "laptop0", "http://cache.content.lab/").unwrap();
    assert_eq!(page.title, "ContentCache");
    let near = ws.path_latency_ms("laptop0", "cache0").unwrap();
    let far = ws.path_latency_ms("laptop0", "origin0").unwrap();
    assert!(near < 5.0 && far > 100.0, "{near} ms vs {far} ms: the cache must be far closer");
}

#[test]
fn the_two_carriers_lesson_survives_either_carrier_once_both_are_lit() {
    let text = include_str!("../../../web/templates/les-l10-04-two-carriers.xml");
    let mut ws = Workspace::from_tnet(text).unwrap();
    let before = passes(&mut ws);
    assert_eq!(before, vec![false, true, true], "one carrier means one line to lose");
    ws.set_port_up("kota", "GigabitEthernet0/1", true);
    ws.set_port_up("carb", "GigabitEthernet0/0", true);
    assert_eq!(passes(&mut ws), vec![true, true, true]);
}

#[test]
fn the_world_cache_lesson_beats_the_sea_crossing_once_the_caches_join() {
    let text = include_str!("../../../web/templates/les-l11-03-caches-near-users.xml");
    let mut ws = Workspace::from_tnet(text).unwrap();
    let before = passes(&mut ws);
    assert_eq!(before, vec![false, false, false, true], "only the far origin answers while the caches sleep");
    ws.link_kind("gwb", "cacheb", "eCross").unwrap();
    ws.link_kind("gwc", "cachec", "eCross").unwrap();
    assert_eq!(passes(&mut ws), vec![true, true, true, true]);
    let near = ws.path_latency_ms("laptopb", "cacheb").unwrap();
    let far = ws.path_latency_ms("laptopb", "server0").unwrap();
    assert!(near < 50.0 && far > 120.0, "{near} ms vs {far} ms: the origin pays the crossing");
}

#[test]
fn the_name_service_lesson_passes_once_the_root_knows_the_name() {
    let text = include_str!("../../../web/templates/les-l11-04-name-service.xml");
    let mut ws = Workspace::from_tnet(text).unwrap();
    let before = passes(&mut ws);
    assert_eq!(before, vec![false, false, true], "the page is reachable, only its name is missing");
    ws.set_dns_record("root0", "www.world.lab", "10.30.13.10").unwrap();
    assert_eq!(passes(&mut ws), vec![true, true, true]);
    let page = crate::webapp::fetch(&mut ws, "laptopb", "http://www.world.lab/").unwrap();
    assert_eq!(page.title, "WorldSite");
}

#[test]
fn the_new_lessons_survive_a_save_and_open_round_trip() {
    let texts = [
        include_str!("../../../web/templates/les-l9-02-n-minus-one.xml"),
        include_str!("../../../web/templates/les-l9-04-sell-transit.xml"),
        include_str!("../../../web/templates/les-l9-05-exchange-members.xml"),
        include_str!("../../../web/templates/les-l10-02-cache-saves-cables.xml"),
        include_str!("../../../web/templates/les-l10-04-two-carriers.xml"),
        include_str!("../../../web/templates/les-l11-03-caches-near-users.xml"),
        include_str!("../../../web/templates/les-l11-04-name-service.xml"),
    ];
    for text in texts {
        let ws = Workspace::from_tnet(text).unwrap();
        let again = Workspace::from_tnet(&ws.to_tnet()).unwrap();
        assert_eq!(ws.devices.len(), again.devices.len());
        assert_eq!(ws.lesson.as_ref().map(|l| l.checks.len()), again.lesson.as_ref().map(|l| l.checks.len()));
        assert_eq!(ws.bgp, again.bgp);
        assert_eq!(ws.flows, again.flows);
    }
}
