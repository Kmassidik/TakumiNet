use super::super::*;

const RING: &str = include_str!("../../../web/templates/tpl-l9-backbone-ring.xml");
const NATIONAL: &str = include_str!("../../../web/templates/tpl-l10-national.xml");
const WORLD: &str = include_str!("../../../web/templates/tpl-l11-world.xml");

fn passes(ws: &mut Workspace) -> Vec<bool> {
    ws.run_checks().into_iter().map(|r| r.passed).collect()
}

#[test]
fn the_backbone_ring_routes_from_the_far_pop_to_the_content_server() {
    let mut ws = Workspace::from_tnet(RING).unwrap();
    assert!(ws.send_pdu("pop3", "server0").is_ok());
    assert!(ws.send_pdu("pop4", "server0").is_ok());
}

#[test]
fn the_backbone_ring_survives_any_single_cut() {
    let cuts = [
        ("pop1", "GigabitEthernet0/0"),
        ("pop2", "GigabitEthernet0/1"),
        ("pop3", "GigabitEthernet0/1"),
        ("pop4", "GigabitEthernet0/1"),
        ("pop5", "GigabitEthernet0/1"),
    ];
    for (device, port) in cuts {
        let mut ws = Workspace::from_tnet(RING).unwrap();
        assert!(ws.set_port_up(device, port, false));
        assert!(ws.send_pdu("pop3", "server0").is_ok(), "cut {device} {port}");
    }
}

#[test]
fn the_backbone_ring_stays_under_its_latency_band() {
    let ws = Workspace::from_tnet(RING).unwrap();
    let ms = ws.path_latency_ms("pop3", "server0").unwrap();
    assert!(ms < 30.0, "{ms} ms");
}

#[test]
fn the_ring_lesson_fails_open_and_passes_once_the_ring_closes() {
    let text = include_str!("../../../web/templates/les-l9-01-ring-cut.xml");
    let mut ws = Workspace::from_tnet(text).unwrap();
    let before = passes(&mut ws);
    assert_eq!(before[0], false, "an open ring cannot heal the Makassar cut");
    assert_eq!(before[1], false, "an open ring cannot heal the Parepare cut");
    ws.set_port_up("pop5", "GigabitEthernet0/1", true);
    ws.set_port_up("pop1", "GigabitEthernet0/1", true);
    assert_eq!(passes(&mut ws), vec![true, true, true, true]);
}

#[test]
fn the_national_template_serves_the_overseas_page() {
    let mut ws = Workspace::from_tnet(NATIONAL).unwrap();
    let page = crate::webapp::fetch(&mut ws, "laptop0", "http://www.world.lab/").unwrap();
    assert_eq!(page.title, "OverseasServer");
    let ms = ws.path_latency_ms("laptop0", "server0").unwrap();
    assert!((50.0..120.0).contains(&ms), "{ms} ms: the submarine cable must dominate the delay");
}

#[test]
fn the_two_provinces_survive_a_gateway_adjacent_cut() {
    for port in ["GigabitEthernet0/0", "GigabitEthernet0/1"] {
        let mut ws = Workspace::from_tnet(NATIONAL).unwrap();
        assert!(ws.set_port_up("gw0", port, false));
        assert!(ws.send_pdu("laptop0", "pcjawa").is_ok(), "cut gw0 {port}");
    }
}

#[test]
fn the_gateway_lesson_fails_without_the_inland_backup_and_passes_with_it() {
    let text = include_str!("../../../web/templates/les-l10-01-gateway-down.xml");
    let mut ws = Workspace::from_tnet(text).unwrap();
    let before = passes(&mut ws);
    assert_eq!(&before[..2], &[false, false], "without the backup every inland packet dies with the gateway");
    ws.set_port_up("popsul", "GigabitEthernet0/2", true);
    ws.set_port_up("popjawa", "GigabitEthernet0/2", true);
    assert_eq!(passes(&mut ws), vec![true, true, true]);
}

#[test]
fn the_world_triangle_pings_across_a_submarine_cable() {
    let mut ws = Workspace::from_tnet(WORLD).unwrap();
    assert!(ws.send_pdu("laptopc", "server0").is_ok());
    assert!(ws.send_pdu("laptopb", "laptopc").is_ok());
}

#[test]
fn the_world_triangle_survives_the_loss_of_any_one_cable() {
    let crossings = [
        ("cab", "laptopb", "server0"),
        ("cbc", "laptopb", "laptopc"),
        ("cca", "laptopc", "server0"),
    ];
    for (cable, from, to) in crossings {
        let mut ws = Workspace::from_tnet(WORLD).unwrap();
        assert!(ws.set_port_up(cable, "FastEthernet0", false));
        assert!(ws.send_pdu(from, to).is_ok(), "cut {cable}");
    }
}

#[test]
fn the_world_triangle_stays_under_its_latency_band() {
    let ws = Workspace::from_tnet(WORLD).unwrap();
    let ms = ws.path_latency_ms("laptopc", "server0").unwrap();
    assert!((100.0..200.0).contains(&ms), "{ms} ms: one intercontinental crossing");
}

#[test]
fn the_cable_lesson_fails_dark_and_passes_once_the_triangle_closes() {
    let text = include_str!("../../../web/templates/les-l11-01-cable-cut.xml");
    let mut ws = Workspace::from_tnet(text).unwrap();
    let before = passes(&mut ws);
    assert_eq!(&before[..2], &[false, false], "two cables are a line, not a triangle");
    ws.set_port_up("cbc", "FastEthernet0", true);
    ws.set_port_up("cbc", "FastEthernet1", true);
    assert_eq!(passes(&mut ws), vec![true, true, true, true]);
}

#[test]
fn the_three_templates_survive_a_save_and_open_round_trip() {
    for text in [RING, NATIONAL, WORLD] {
        let ws = Workspace::from_tnet(text).unwrap();
        let again = Workspace::from_tnet(&ws.to_tnet()).unwrap();
        assert_eq!(ws.demo, again.demo);
        assert_eq!(ws.devices.len(), again.devices.len());
        let kinds: Vec<&str> = ws.devices.iter().map(|d| d.kind.as_str()).collect();
        let back: Vec<&str> = again.devices.iter().map(|d| d.kind.as_str()).collect();
        assert_eq!(kinds, back);
    }
}
