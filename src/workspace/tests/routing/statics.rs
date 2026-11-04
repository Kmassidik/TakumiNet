use super::*;

struct StaticFixture {
    ws: Workspace,
    source: String,
    destination: String,
    r0: String,
    r1: String,
    r2: String,
    r0_r1: (String, String),
    r1_lan: String,
}

fn static_fixture() -> StaticFixture {
    let mut ws = Workspace::empty();
    let source = ws.add("PC-PT", 40.0, 200.0).unwrap();
    let r0 = ws.add("2911", 120.0, 200.0).unwrap();
    let r1 = ws.add("2911", 220.0, 120.0).unwrap();
    let r2 = ws.add("2911", 220.0, 280.0).unwrap();
    let switch = ws.add("2960", 340.0, 200.0).unwrap();
    let destination = ws.add("PC-PT", 440.0, 200.0).unwrap();

    let source_r0 = cable_ports(&mut ws, &source, &r0, "eCopper");
    ws.set_config(&source, "172.16.0.10", "24", "172.16.0.1", "")
        .unwrap();
    ws.set_port_ip(&r0, &source_r0.1, "172.16.0.1", 24)
        .unwrap();

    let r0_r1 = cable_ports(&mut ws, &r0, &r1, "eCopper");
    ws.set_port_ip(&r0, &r0_r1.0, "172.16.1.1", 30)
        .unwrap();
    ws.set_port_ip(&r1, &r0_r1.1, "172.16.1.2", 30)
        .unwrap();
    let r0_r2 = cable_ports(&mut ws, &r0, &r2, "eCopper");
    ws.set_port_ip(&r0, &r0_r2.0, "172.16.2.1", 30)
        .unwrap();
    ws.set_port_ip(&r2, &r0_r2.1, "172.16.2.2", 30)
        .unwrap();

    let r1_switch = cable_ports(&mut ws, &r1, &switch, "eCopper");
    ws.set_port_ip(&r1, &r1_switch.0, "10.1.0.1", 24)
        .unwrap();
    let r2_switch = cable_ports(&mut ws, &r2, &switch, "eCopper");
    ws.set_port_ip(&r2, &r2_switch.0, "10.1.0.2", 24)
        .unwrap();
    cable_ports(&mut ws, &destination, &switch, "eCopper");
    ws.set_config(&destination, "10.1.0.20", "24", "10.1.0.1", "")
        .unwrap();

    StaticFixture {
        ws,
        source,
        destination,
        r0,
        r1,
        r2,
        r0_r1,
        r1_lan: r1_switch.0,
    }
}

fn assert_forwarding_uses(fixture: &mut StaticFixture, expected: &str) {
    fixture
        .ws
        .send_pdu(&fixture.source, &fixture.destination)
        .unwrap();
    let path = &fixture.ws.events.last().unwrap().path;
    assert!(
        path.windows(2)
            .any(|hop| hop[0] == fixture.r0 && hop[1] == expected),
        "expected {} after {}, got {path:?}",
        expected,
        fixture.r0
    );
}

#[test]
fn static_longest_prefix_wins_before_administrative_distance() {
    let mut fixture = static_fixture();
    fixture
        .ws
        .add_route(&fixture.r0, "10.0.0.0", "8", "172.16.2.2", 1)
        .unwrap();
    fixture
        .ws
        .add_route(&fixture.r0, "10.1.0.0", "16", "172.16.1.2", 200)
        .unwrap();
    let expected = fixture.r1.clone();
    assert_forwarding_uses(&mut fixture, &expected);
}

#[test]
fn static_administrative_distance_controls_selection_and_floating_failover() {
    let mut fixture = static_fixture();
    fixture
        .ws
        .add_route(&fixture.r0, "10.1.0.0", "16", "172.16.2.2", 20)
        .unwrap();
    fixture
        .ws
        .add_route(&fixture.r0, "10.1.0.0", "16", "172.16.1.2", 5)
        .unwrap();
    let expected = fixture.r1.clone();
    assert_forwarding_uses(&mut fixture, &expected);

    assert!(fixture.ws.set_port_up(
        &fixture.r0,
        &fixture.r0_r1.0,
        false
    ));
    let expected = fixture.r2.clone();
    assert_forwarding_uses(&mut fixture, &expected);
    assert!(fixture.ws.set_port_up(&fixture.r0, &fixture.r0_r1.0, true));
    let expected = fixture.r1.clone();
    assert_forwarding_uses(&mut fixture, &expected);
}

#[test]
fn administrative_distance_orders_static_and_dynamic_sources_before_metric() {
    let mut fixture = static_fixture();
    fixture
        .ws
        .set_port_bandwidth(&fixture.r0, &fixture.r0_r1.0, 1_544)
        .unwrap();
    fixture
        .ws
        .set_port_bandwidth(&fixture.r1, &fixture.r0_r1.1, 1_544)
        .unwrap();
    fixture
        .ws
        .set_routing_protocol(&fixture.r0, "ospf", 1)
        .unwrap();
    fixture
        .ws
        .set_routing_protocol(&fixture.r1, "ospf", 1)
        .unwrap();
    advertise_port(&mut fixture.ws, &fixture.r0, &fixture.r0_r1.0, 0);
    advertise_port(&mut fixture.ws, &fixture.r1, &fixture.r0_r1.1, 0);
    advertise_port(&mut fixture.ws, &fixture.r1, &fixture.r1_lan, 0);
    assert_eq!(
        installed(&fixture.ws, &fixture.r0, ip("10.1.0.0"), 24)
            .unwrap_or_else(|| panic!("missing OSPF route: {:?}", fixture.ws.dyn_routes))
            .metric,
        65
    );

    // The static metric is zero, but AD 200 still loses to OSPF's AD 110.
    fixture
        .ws
        .add_route(&fixture.r0, "10.1.0.0", "24", "172.16.2.2", 200)
        .unwrap();
    let expected = fixture.r1.clone();
    assert_forwarding_uses(&mut fixture, &expected);

    // Lowering static AD below OSPF reverses that source selection.
    fixture
        .ws
        .add_route(&fixture.r0, "10.1.0.0", "24", "172.16.2.2", 80)
        .unwrap();
    let expected = fixture.r2.clone();
    assert_forwarding_uses(&mut fixture, &expected);
}
