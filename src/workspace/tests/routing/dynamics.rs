use super::*;

struct Diamond {
    ws: Workspace,
    routers: Vec<String>,
    // direct r0-r3, then r0-r1, r1-r2, r2-r3
    links: Vec<(String, String)>,
    lans: Vec<u32>,
}

fn diamond() -> Diamond {
    let mut ws = Workspace::empty();
    let routers: Vec<String> = (0..4)
        .map(|index| ws.add("2911", 80.0 + index as f32 * 80.0, 160.0).unwrap())
        .collect();
    let mut lans = Vec::new();
    for (index, router) in routers.iter().enumerate() {
        let network = lan_network(index);
        let switch = ws.add("2960", 80.0 + index as f32 * 80.0, 220.0).unwrap();
        ws.link_kind(router, &switch, "eCopper").unwrap();
        ws.set_port_ip(router, "GigabitEthernet0/0", &ipv4_string(network + 1), 24)
            .unwrap();
        lans.push(network);
    }
    let links = vec![
        connect_serial(&mut ws, &routers[0], &routers[3], 0),
        connect_serial(&mut ws, &routers[0], &routers[1], 1),
        connect_serial(&mut ws, &routers[1], &routers[2], 2),
        connect_serial(&mut ws, &routers[2], &routers[3], 3),
    ];
    Diamond {
        ws,
        routers,
        links,
        lans,
    }
}

fn set_link_characteristics(
    ws: &mut Workspace,
    routers: &[String],
    endpoints: (usize, usize),
    ports: &(String, String),
    bandwidth_kbps: u32,
    delay_us: u32,
) {
    ws.set_port_bandwidth(&routers[endpoints.0], &ports.0, bandwidth_kbps)
        .unwrap();
    ws.set_port_delay(&routers[endpoints.0], &ports.0, delay_us)
        .unwrap();
    ws.set_port_bandwidth(&routers[endpoints.1], &ports.1, bandwidth_kbps)
        .unwrap();
    ws.set_port_delay(&routers[endpoints.1], &ports.1, delay_us)
        .unwrap();
}

fn configure_diamond(topology: &mut Diamond, protocol: &str, process_id: u32) {
    for router in &topology.routers {
        topology
            .ws
            .set_routing_protocol(router, protocol, process_id)
            .unwrap();
    }
    for router in &topology.routers {
        advertise_all(&mut topology.ws, router, 0);
    }
}

#[test]
fn ospf_uses_total_cost_and_recomputes_around_a_failed_preferred_link() {
    let mut topology = diamond();
    set_link_characteristics(
        &mut topology.ws,
        &topology.routers,
        (0, 3),
        &topology.links[0],
        10_000,
        100,
    );
    for (index, endpoints) in [(1, (0, 1)), (2, (1, 2)), (3, (2, 3))] {
        set_link_characteristics(
            &mut topology.ws,
            &topology.routers,
            endpoints,
            &topology.links[index],
            1_000_000,
            10,
        );
    }
    configure_diamond(&mut topology, "ospf", 9);

    let route = installed(&topology.ws, &topology.routers[0], topology.lans[3], 24)
        .unwrap();
    assert_eq!(route.source, RouteSource::Ospf);
    assert_eq!(route.metric, 4);
    assert_eq!(
        route.next_hop,
        port_ip(&topology.ws, &topology.routers[1], &topology.links[1].1)
    );

    assert!(topology.ws.set_port_up(
        &topology.routers[0],
        &topology.links[1].0,
        false
    ));
    let route = installed(&topology.ws, &topology.routers[0], topology.lans[3], 24)
        .unwrap();
    assert_eq!(route.metric, 11);
    assert_eq!(
        route.next_hop,
        port_ip(&topology.ws, &topology.routers[3], &topology.links[0].1)
    );
}

#[test]
fn ospf_forwarding_repeatedly_follows_the_lowest_cost_path() {
    let mut topology = diamond();
    set_link_characteristics(
        &mut topology.ws,
        &topology.routers,
        (0, 3),
        &topology.links[0],
        10_000,
        100,
    );
    for (index, endpoints) in [(1, (0, 1)), (2, (1, 2)), (3, (2, 3))] {
        set_link_characteristics(
            &mut topology.ws,
            &topology.routers,
            endpoints,
            &topology.links[index],
            1_000_000,
            10,
        );
    }
    configure_diamond(&mut topology, "ospf", 9);
    let source = topology.ws.add("PC-PT", 20.0, 300.0).unwrap();
    let destination = topology.ws.add("PC-PT", 400.0, 300.0).unwrap();
    topology.ws.link_kind(&source, "switch0", "eCopper").unwrap();
    topology.ws.link_kind(&destination, "switch3", "eCopper").unwrap();
    topology.ws.set_config(&source, "192.168.1.10", "24", "192.168.1.1", "").unwrap();
    topology.ws.set_config(&destination, "192.168.4.10", "24", "192.168.4.1", "").unwrap();
    for _ in 0..4 {
        topology.ws.send_pdu(&source, &destination).unwrap();
        let path = &topology.ws.events.last().unwrap().path;
        let routers: Vec<_> = path
            .iter()
            .filter(|id| topology.routers.contains(id))
            .cloned()
            .collect();
        assert_eq!(routers, topology.routers, "unexpected forwarding path {path:?}");
    }
}

#[test]
fn eigrp_uses_bottleneck_bandwidth_cumulative_delay_and_directional_paths() {
    let mut topology = diamond();
    // r0's direct outgoing interface is slower than r3's. The three-link
    // path is uniformly fast, so the two routers prefer opposite directions.
    topology
        .ws
        .set_port_bandwidth(&topology.routers[0], &topology.links[0].0, 100_000)
        .unwrap();
    topology
        .ws
        .set_port_delay(&topology.routers[0], &topology.links[0].0, 100)
        .unwrap();
    topology
        .ws
        .set_port_bandwidth(&topology.routers[3], &topology.links[0].1, 1_000_000)
        .unwrap();
    topology
        .ws
        .set_port_delay(&topology.routers[3], &topology.links[0].1, 10)
        .unwrap();
    for (index, endpoints) in [(1, (0, 1)), (2, (1, 2)), (3, (2, 3))] {
        set_link_characteristics(
            &mut topology.ws,
            &topology.routers,
            endpoints,
            &topology.links[index],
            1_000_000,
            10,
        );
    }
    configure_diamond(&mut topology, "eigrp", 23);

    let forward = installed(&topology.ws, &topology.routers[0], topology.lans[3], 24)
        .unwrap();
    assert_eq!(forward.source, RouteSource::Eigrp);
    assert_eq!(forward.metric, 3_584);
    assert_eq!(
        forward.next_hop,
        port_ip(&topology.ws, &topology.routers[1], &topology.links[1].1)
    );
    let reverse = installed(&topology.ws, &topology.routers[3], topology.lans[0], 24)
        .unwrap();
    assert_eq!(reverse.metric, 3_072);
    assert_eq!(
        reverse.next_hop,
        port_ip(&topology.ws, &topology.routers[0], &topology.links[0].0)
    );

    // One 100 Mbps/100 us link makes the entire three-link path's
    // bottleneck 100 Mbps; its delay plus the destination LAN is 130 us.
    topology
        .ws
        .set_port_bandwidth(&topology.routers[0], &topology.links[1].0, 100_000)
        .unwrap();
    topology
        .ws
        .set_port_delay(&topology.routers[0], &topology.links[1].0, 100)
        .unwrap();
    let bottlenecked = installed(&topology.ws, &topology.routers[0], topology.lans[3], 24)
        .unwrap();
    assert_eq!(bottlenecked.next_hop, port_ip(
        &topology.ws,
        &topology.routers[3],
        &topology.links[0].1
    ));
    assert_eq!(bottlenecked.metric, 28_416);
}

#[test]
fn ospf_interarea_routes_cross_backbone_and_disappear_without_it() {
    let mut topology = chain(5);
    for router in &topology.routers {
        topology
            .ws
            .set_routing_protocol(router, "ospf", 77)
            .unwrap();
    }

    // Area 1 -- ABR -- area 0 -- ABR -- area 2.
    for (index, area) in [1, 0, 0, 2].into_iter().enumerate() {
        let left = topology.routers[index].clone();
        let right = topology.routers[index + 1].clone();
        advertise_port(&mut topology.ws, &left, &topology.links[index].0, area);
        advertise_port(&mut topology.ws, &right, &topology.links[index].1, area);
    }
    for (index, area) in [1, 0, 0, 0, 2].into_iter().enumerate() {
        advertise_port(
            &mut topology.ws,
            &topology.routers[index],
            "GigabitEthernet0/0",
            area,
        );
    }

    let forward = installed(&topology.ws, &topology.routers[0], topology.lans[4], 24)
        .unwrap();
    assert_eq!(forward.source, RouteSource::OspfInterArea);
    assert_eq!(forward.metric, 4 * 64 + 1);
    assert_eq!(
        forward.next_hop,
        port_ip(&topology.ws, &topology.routers[1], &topology.links[0].1)
    );
    let reverse = installed(&topology.ws, &topology.routers[4], topology.lans[0], 24)
        .unwrap();
    assert_eq!(reverse.source, RouteSource::OspfInterArea);
    assert_eq!(reverse.metric, 4 * 64 + 1);
    let backbone = installed(&topology.ws, &topology.routers[2], topology.lans[0], 24)
        .unwrap();
    assert_eq!(backbone.source, RouteSource::OspfInterArea);

    assert!(topology.ws.set_port_up(
        &topology.routers[1],
        &topology.links[1].0,
        false
    ));
    assert!(installed(&topology.ws, &topology.routers[0], topology.lans[4], 24).is_none());
    assert!(topology.ws.set_port_up(
        &topology.routers[1],
        &topology.links[1].0,
        true
    ));
    assert_eq!(
        installed(&topology.ws, &topology.routers[0], topology.lans[4], 24)
            .unwrap()
            .source,
        RouteSource::OspfInterArea
    );
}