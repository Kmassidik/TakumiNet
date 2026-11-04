use super::super::*;
use crate::model::parse_ipv4 as ip;

fn passes(ws: &mut Workspace) -> Vec<bool> {
    ws.run_checks().into_iter().map(|r| r.passed).collect()
}

#[test]
fn the_city_ring_template_routes_and_plays_its_demo() {
    let mut ws = Workspace::from_tnet(include_str!("../../../web/templates/tpl-l7-city-ring.xml")).unwrap();
    assert!(ws.send_pdu("pc0", "server0").is_ok(), "across the ring to the exchange");
    assert!(ws.send_pdu("pc0", "cx0").is_ok());
    assert_eq!(ws.run_demo().unwrap(), ws.demo.len());
}

#[test]
fn the_city_ring_survives_any_single_fibre_cut() {
    let ws = Workspace::from_tnet(include_str!("../../../web/templates/tpl-l7-city-ring.xml")).unwrap();
    let ring = [
        ("utara", "GigabitEthernet0/1"),
        ("timur", "GigabitEthernet0/2"),
        ("selatan", "GigabitEthernet0/2"),
        ("barat", "GigabitEthernet0/2"),
    ];
    for (device, port) in ring {
        let mut copy = ws.clone();
        assert!(copy.set_port_up(device, port, false));
        assert!(copy.send_pdu("pc0", "server0").is_ok(), "cut at {device} {port}");
    }
}

#[test]
fn ring_heals_lesson_fails_open_and_passes_once_the_ring_is_closed() {
    let mut ws = Workspace::from_tnet(include_str!("../../../web/templates/les-l7-01-ring-heals.xml")).unwrap();
    assert_eq!(passes(&mut ws), vec![false, false], "the Barat to Utara segment ships switched off");
    assert!(ws.set_port_up("barat", "GigabitEthernet0/2", true));
    assert!(ws.set_port_up("utara", "GigabitEthernet0/2", true));
    assert_eq!(passes(&mut ws), vec![true, true]);
}

#[test]
fn city_services_lesson_fences_the_cameras_and_keeps_the_hospital_online() {
    let mut ws = Workspace::from_tnet(include_str!("../../../web/templates/les-l7-02-city-services.xml")).unwrap();
    assert_eq!(passes(&mut ws), vec![false, true, true], "open: the public district still reaches the cameras");
    let wild = ip("0.0.0.255").unwrap();
    let (none, all) = (ip("0.0.0.0").unwrap(), ip("255.255.255.255").unwrap());
    ws.acl_add("barat", 170, false, ip("192.168.73.0").unwrap(), wild, Some((ip("192.168.74.0").unwrap(), wild))).unwrap();
    ws.acl_add("barat", 170, true, none, all, Some((none, all))).unwrap();
    ws.acl_bind("barat", "GigabitEthernet0/0", 170, false).unwrap();
    assert_eq!(passes(&mut ws), vec![true, true, true]);
    let refusal = ws.send_pdu("pc0", "cam0").unwrap_err();
    assert!(refusal.contains("ACL denied"), "{refusal}");
    assert!(ws.send_pdu("pc1", "cam0").is_ok(), "the hospital may watch the cameras");
}

#[test]
fn the_regency_template_routes_both_villages_and_plays_its_demo() {
    let mut ws = Workspace::from_tnet(include_str!("../../../web/templates/tpl-l8-regency-radio.xml")).unwrap();
    assert!(ws.send_pdu("pc0", "server0").is_ok(), "over the microwave pair");
    assert!(ws.send_pdu("pc1", "server0").is_ok(), "over the satellite terminal");
    assert_eq!(ws.run_demo().unwrap(), ws.demo.len());
}

#[test]
fn the_long_links_land_in_their_latency_bands() {
    let ws = Workspace::from_tnet(include_str!("../../../web/templates/tpl-l8-regency-radio.xml")).unwrap();
    let microwave = ws.path_latency_ms("pc0", "server0").unwrap();
    assert!(microwave > 2.0 && microwave < 20.0, "microwave village at {microwave} ms");
    let satellite = ws.path_latency_ms("pc1", "server0").unwrap();
    assert!(satellite > 400.0 && satellite < 600.0, "satellite village at {satellite} ms");
}

#[test]
fn far_village_lesson_survives_the_radio_cut_once_the_spare_pair_is_cabled() {
    let mut ws = Workspace::from_tnet(include_str!("../../../web/templates/les-l8-01-far-village.xml")).unwrap();
    assert_eq!(passes(&mut ws), vec![true, true, false], "no spare cable yet: a radio cut isolates ProsperVillage");
    ws.link("mw2", "mw3").unwrap();
    assert_eq!(passes(&mut ws), vec![true, true, true]);
    let mut cut = ws.clone();
    assert!(cut.set_port_up("rh0", "GigabitEthernet0/1", false));
    assert!(cut.send_pdu("pc0", "server0").is_ok(), "the spare pair carries the village");
}

#[test]
fn the_regency_template_survives_save_and_open() {
    let ws = Workspace::from_tnet(include_str!("../../../web/templates/tpl-l8-regency-radio.xml")).unwrap();
    let mut again = Workspace::from_tnet(&ws.to_tnet()).unwrap();
    for kind in ["regency-hub", "village-pop", "microwave-link", "satellite-terminal"] {
        assert_eq!(
            again.devices.iter().filter(|d| d.kind == kind).count(),
            ws.devices.iter().filter(|d| d.kind == kind).count(),
            "{kind} count changes across save and open"
        );
    }
    let delay = |w: &Workspace, id: &str, port: &str| {
        w.devices.iter().find(|d| d.id == id).unwrap()
            .ports.iter().find(|p| p.name == port).unwrap().delay_us
    };
    assert_eq!(delay(&again, "mw0", "FastEthernet1"), 3000);
    assert_eq!(delay(&again, "sat0", "FastEthernet0"), 250_000);
    assert_eq!(again.demo, ws.demo);
    assert!(again.send_pdu("pc1", "server0").is_ok());
}

#[test]
fn two_cuts_lesson_fails_on_the_line_and_passes_once_the_ring_is_rejoined() {
    let mut ws = Workspace::from_tnet(include_str!("../../../web/templates/les-l7-02-two-cuts.xml")).unwrap();
    assert_eq!(passes(&mut ws), vec![false, false, false], "a line: any second cut strands a district");
    ws.links.push(Link {
        a: "barat".into(),
        a_port: "GigabitEthernet0/1".into(),
        b: "selatan".into(),
        b_port: "GigabitEthernet0/2".into(),
        kind: "eFiber".into(),
    });
    ws.recompute_routing();
    assert_eq!(passes(&mut ws), vec![true, true, true]);
}

#[test]
fn city_exchange_lesson_passes_once_the_second_provider_peers_and_announces() {
    let mut ws = Workspace::from_tnet(include_str!("../../../web/templates/les-l7-04-city-exchange.xml")).unwrap();
    assert_eq!(passes(&mut ws), vec![true, false, false, false], "only ProviderDawn peers at the exchange");
    ws.bgp_config("isp2", 64702).unwrap();
    ws.bgp_neighbor("isp2", "10.70.8.5", 64700).unwrap();
    ws.bgp_network("isp2", ip("192.168.77.0").unwrap(), 24).unwrap();
    assert_eq!(passes(&mut ws), vec![true, true, true, true]);
    assert_eq!(ws.bgp_session_state("cx0", "10.70.8.6"), "established");
}

#[test]
fn rain_fade_lesson_recovers_once_the_hill_relay_splits_the_hop() {
    let mut ws = Workspace::from_tnet(include_str!("../../../web/templates/les-l8-02-rain-fade.xml")).unwrap();
    assert_eq!(passes(&mut ws), vec![true, false], "dry season, but no backup for the valley pair yet");
    ws.set_port_delay("mw0", "FastEthernet1", 30_000).unwrap();
    ws.set_port_delay("mw1", "FastEthernet0", 30_000).unwrap();
    assert_eq!(passes(&mut ws), vec![false, false], "heavy rain fades the valley hop");
    ws.link("rh0", "mw2").unwrap();
    ws.link("mw2", "pop0").unwrap();
    assert_eq!(passes(&mut ws), vec![true, true]);
}

#[test]
fn satellite_village_lesson_lands_in_its_band_once_the_terminal_is_cabled() {
    let mut ws = Workspace::from_tnet(include_str!("../../../web/templates/les-l8-03-satellite-village.xml")).unwrap();
    assert_eq!(passes(&mut ws), vec![false, false, true], "the terminal cable is not plugged in yet");
    ws.link("rh0", "sat0").unwrap();
    assert_eq!(passes(&mut ws), vec![true, true, true]);
    let satellite = ws.path_latency_ms("pc1", "server0").unwrap();
    assert!(satellite > 400.0 && satellite < 600.0, "satellite village at {satellite} ms");
}
