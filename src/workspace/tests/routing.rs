use super::super::routing::{dijkstra, eigrp_metric, ospf_cost};
use super::super::*;
use crate::model::{ipv4_string, mask_of, parse_ipv4};

fn ip(text: &str) -> u32 {
    parse_ipv4(text).unwrap()
}

fn transit_ip(link: usize, host: u8) -> u32 {
    u32::from_be_bytes([10, (link / 256) as u8, (link % 256) as u8, host])
}

fn lan_network(router: usize) -> u32 {
    u32::from_be_bytes([192, 168, (router + 1) as u8, 0])
}

fn cable_ports(ws: &mut Workspace, a: &str, b: &str, kind: &str) -> (String, String) {
    ws.link_kind(a, b, kind).unwrap();
    let link = ws
        .links
        .iter()
        .rev()
        .find(|link| {
            (link.a == a && link.b == b) || (link.a == b && link.b == a)
        })
        .unwrap();
    let (a_raw, b_raw) = if link.a == a {
        (link.a_port.clone(), link.b_port.clone())
    } else {
        (link.b_port.clone(), link.a_port.clone())
    };
    let resolve = |id: &str, raw: &str| {
        let names: Vec<String> = ws
            .devices
            .iter()
            .find(|device| device.id == id)
            .unwrap()
            .ports
            .iter()
            .map(|port| port.name.clone())
            .collect();
        crate::cli::expand_iface(raw, &names).unwrap_or_else(|| raw.to_string())
    };
    (resolve(a, &a_raw), resolve(b, &b_raw))
}

fn connect_serial(
    ws: &mut Workspace,
    a: &str,
    b: &str,
    link: usize,
) -> (String, String) {
    let ports = cable_ports(ws, a, b, "eSerial");
    ws.set_port_ip(a, &ports.0, &ipv4_string(transit_ip(link, 1)), 30)
        .unwrap();
    ws.set_port_ip(b, &ports.1, &ipv4_string(transit_ip(link, 2)), 30)
        .unwrap();
    ports
}

fn port_ip(ws: &Workspace, router: &str, port: &str) -> u32 {
    ws.devices
        .iter()
        .find(|device| device.id == router)
        .unwrap()
        .ports
        .iter()
        .find(|candidate| candidate.name == port)
        .unwrap()
        .ip
        .unwrap()
}

fn port_network(ws: &Workspace, router: &str, port: &str) -> (u32, u8) {
    let port = ws
        .devices
        .iter()
        .find(|device| device.id == router)
        .unwrap()
        .ports
        .iter()
        .find(|candidate| candidate.name == port)
        .unwrap();
    (port.ip.unwrap() & mask_of(port.prefix), port.prefix)
}

fn advertise_port(ws: &mut Workspace, router: &str, port: &str, area: u32) {
    let (network, prefix) = port_network(ws, router, port);
    ws.add_routing_network(router, network, prefix, area)
        .unwrap();
}

fn advertise_all(ws: &mut Workspace, router: &str, area: u32) {
    let ports: Vec<String> = ws
        .devices
        .iter()
        .find(|device| device.id == router)
        .unwrap()
        .ports
        .iter()
        .filter(|port| port.ip.is_some())
        .map(|port| port.name.clone())
        .collect();
    for port in ports {
        advertise_port(ws, router, &port, area);
    }
}

struct Chain {
    ws: Workspace,
    routers: Vec<String>,
    links: Vec<(String, String)>,
    lans: Vec<u32>,
}

fn chain(router_count: usize) -> Chain {
    assert!(router_count >= 2 && router_count < 255);
    let mut ws = Workspace::empty();
    let routers: Vec<String> = (0..router_count)
        .map(|index| ws.add("2911", 40.0 + index as f32 * 30.0, 100.0).unwrap())
        .collect();
    let mut lans = Vec::new();
    // Live LAN links come first so every test can consistently use Gig0/0.
    for (index, router) in routers.iter().enumerate() {
        let lan = lan_network(index);
        let switch = ws.add("2960", 40.0 + index as f32 * 30.0, 160.0).unwrap();
        ws.link_kind(router, &switch, "eCopper").unwrap();
        ws.set_port_ip(router, "GigabitEthernet0/0", &ipv4_string(lan + 1), 24)
            .unwrap();
        lans.push(lan);
    }
    let mut links = Vec::new();
    for index in 0..router_count - 1 {
        links.push(connect_serial(
            &mut ws,
            &routers[index],
            &routers[index + 1],
            index,
        ));
    }
    Chain {
        ws,
        routers,
        links,
        lans,
    }
}

fn configure_chain(chain: &mut Chain, protocol: &str, process_id: u32) {
    for router in &chain.routers {
        chain
            .ws
            .set_routing_protocol(router, protocol, process_id)
            .unwrap();
    }
    for router in &chain.routers {
        advertise_all(&mut chain.ws, router, 0);
    }
}

fn installed<'a>(
    ws: &'a Workspace,
    router: &str,
    network: u32,
    prefix: u8,
) -> Option<&'a InstalledRoute> {
    ws.dyn_routes.get(router).and_then(|routes| {
        routes
            .iter()
            .find(|route| route.network == network && route.prefix == prefix)
    })
}

fn directly_linked(ws: &Workspace, a: &str, b: &str) -> bool {
    ws.links.iter().any(|link| {
        (link.a == a && link.b == b) || (link.a == b && link.b == a)
    })
}

fn assert_loop_free_next_hops(chain: &Chain) {
    for start in &chain.routers {
        for (owner_index, destination) in chain.lans.iter().enumerate() {
            let owner = &chain.routers[owner_index];
            if start == owner {
                continue;
            }
            let mut current = start.clone();
            let mut visited = std::collections::HashSet::new();
            loop {
                assert!(
                    visited.insert(current.clone()),
                    "{start} loops while following {} via {current}",
                    ipv4_string(*destination)
                );
                if current == *owner {
                    break;
                }
                let next_hop = installed(&chain.ws, &current, *destination, 24)
                    .unwrap_or_else(|| {
                        panic!(
                            "{current} has no route to {} while walking from {start}",
                            ipv4_string(*destination)
                        )
                    })
                    .next_hop;
                let next = chain
                    .ws
                    .router_with_addr(next_hop)
                    .unwrap_or_else(|| {
                        panic!("{current} uses non-router next hop {}", ipv4_string(next_hop))
                    })
                    .id
                    .clone();
                assert!(
                    directly_linked(&chain.ws, &current, &next),
                    "{current} uses {next} as a non-adjacent next hop"
                );
                current = next;
            }
        }
    }
}

struct Rng(u64);

impl Rng {
    fn next(&mut self) -> u64 {
        let mut value = self.0;
        value ^= value << 13;
        value ^= value >> 7;
        value ^= value << 17;
        self.0 = value;
        value
    }

    fn below(&mut self, limit: u64) -> u64 {
        self.next() % limit
    }
}

fn brute_force_distances(
    node_count: usize,
    edges: &[(usize, usize, u64)],
    source: usize,
) -> Vec<Option<u64>> {
    fn enumerate_simple_paths(
        node: usize,
        cost: u64,
        edges: &[(usize, usize, u64)],
        visited: &mut [bool],
        best: &mut [Option<u64>],
    ) {
        for &(from, to, weight) in edges {
            if from != node || visited[to] {
                continue;
            }
            let candidate = cost.saturating_add(weight);
            if best[to].map_or(true, |old| candidate < old) {
                best[to] = Some(candidate);
            }
            visited[to] = true;
            enumerate_simple_paths(to, candidate, edges, visited, best);
            visited[to] = false;
        }
    }

    let mut best = vec![None; node_count];
    let mut visited = vec![false; node_count];
    best[source] = Some(0);
    visited[source] = true;
    enumerate_simple_paths(source, 0, edges, &mut visited, &mut best);
    best
}

#[test]
fn dijkstra_matches_simple_path_enumeration_on_seeded_directed_graphs() {
    let mut rng = Rng(0x4f53_5046_524f_5554);
    for node_count in 1..=7 {
        for graph_index in 0..24 {
            let mut edges = Vec::new();
            for from in 0..node_count {
                for to in 0..node_count {
                    if from != to && rng.below(100) < 35 {
                        // Zero-cost directed cycles are intentional: the brute
                        // force still examines only simple paths.
                        edges.push((from, to, rng.below(31)));
                    }
                }
            }
            for source in 0..node_count {
                let expected = brute_force_distances(node_count, &edges, source);
                let actual = dijkstra(node_count, &edges, source);
                assert_eq!(
                    actual, expected,
                    "seeded graph {graph_index}, {node_count} nodes, source {source}, edges {edges:?}"
                );
            }
        }
    }
}

#[test]
fn route_metric_formulas_match_reference_examples() {
    assert_eq!(ospf_cost(1_000_000), 1);
    assert_eq!(ospf_cost(100_000), 1);
    assert_eq!(ospf_cost(10_000), 10);
    assert_eq!(ospf_cost(1_544), 64);
    assert_eq!(eigrp_metric(100_000, 100), 28_160);
}

#[test]
fn rip_installs_fifteen_hops_but_not_sixteen() {
    for (router_count, expected_metric) in [(16, Some(15)), (17, None)] {
        let mut topology = chain(router_count);
        configure_chain(&mut topology, "rip", 0);
        let destination = *topology.lans.last().unwrap();
        let route = installed(
            &topology.ws,
            &topology.routers[0],
            destination,
            24,
        );
        assert_eq!(
            route.map(|route| route.metric),
            expected_metric,
            "{router_count} routers: {:?}",
            topology.ws.dyn_routes
        );
        assert!(topology
            .ws
            .dyn_routes
            .values()
            .flatten()
            .all(|route| route.metric < 16));
    }
}

#[test]
fn dynamic_protocols_have_loop_free_consistent_next_hops_and_recompute_on_link_down() {
    for (protocol, admin_distance) in [("rip", 120), ("ospf", 110), ("eigrp", 90)] {
        let mut topology = chain(5);
        configure_chain(&mut topology, protocol, 17);
        assert_loop_free_next_hops(&topology);
        assert!(topology
            .ws
            .dyn_routes
            .values()
            .flatten()
            .all(|route| route.source.admin_distance() == admin_distance));

        assert!(topology.ws.set_port_up(
            &topology.routers[1],
            &topology.links[1].0,
            false
        ));
        assert!(
            installed(
                &topology.ws,
                &topology.routers[0],
                topology.lans[4],
                24
            )
            .is_none(),
            "{protocol} retained a route across a down link"
        );
        assert!(
            installed(
                &topology.ws,
                &topology.routers[4],
                topology.lans[0],
                24
            )
            .is_none(),
            "{protocol} retained a reverse route across a down link"
        );

        assert!(topology.ws.set_port_up(
            &topology.routers[1],
            &topology.links[1].0,
            true
        ));
        assert!(installed(
            &topology.ws,
            &topology.routers[0],
            topology.lans[4],
            24
        )
        .is_some());
        assert_loop_free_next_hops(&topology);
    }
}

#[test]
fn routing_protocols_and_processes_do_not_leak_routes() {
    let mut topology = chain(3);
    for (router, protocol) in topology.routers.iter().zip(["rip", "ospf", "eigrp"]) {
        topology
            .ws
            .set_routing_protocol(router, protocol, 1)
            .unwrap();
        advertise_all(&mut topology.ws, router, 0);
    }
    assert!(topology.ws.dyn_routes.values().all(|routes| routes.is_empty()));

    for protocol in ["ospf", "eigrp"] {
        let mut topology = chain(2);
        topology
            .ws
            .set_routing_protocol(&topology.routers[0], protocol, 41)
            .unwrap();
        topology
            .ws
            .set_routing_protocol(&topology.routers[1], protocol, 42)
            .unwrap();
        for router in &topology.routers {
            advertise_all(&mut topology.ws, router, 0);
        }
        assert!(
            topology.ws.dyn_routes.values().all(|routes| routes.is_empty()),
            "{protocol} crossed process/AS boundaries"
        );
    }
}

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
