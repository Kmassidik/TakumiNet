use super::super::routing::{dijkstra, eigrp_metric, ospf_cost};
use super::super::*;
use crate::model::{ipv4_string, mask_of, parse_ipv4};

mod dynamics;
mod statics;

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
