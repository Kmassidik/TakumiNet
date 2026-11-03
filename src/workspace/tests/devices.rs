use super::super::*;

#[test]
fn json_is_balanced_and_complete() {
    let ws = Workspace::new();
    let j = ws.json();
    assert_eq!(j.matches('{').count(), j.matches('}').count());
    assert_eq!(j.matches("\"id\":").count(), ws.devices.len());
    assert_eq!(j.matches("\"aPort\":").count(), ws.links.len());
    assert!(j.contains("\"label\":\"2911\""));
    assert!(j.contains("\"kind\":\"router\""));
}

#[test]
fn link_json_exposes_green_amber_and_red_endpoint_states() {
    let ws = Workspace::new();
    let json = ws.json();
    let router_link = json.split("\"links\":[").nth(1).and_then(|tail| tail.split('}').next()).unwrap();
    assert!(router_link.contains("\"aState\":\"green\",\"bState\":\"green\""), "{router_link}");

    let mut ws = Workspace::new();
    assert!(ws.set_port_up("router0", "GigabitEthernet0/0", false));
    let json = ws.json();
    let router_link = json.split("\"links\":[").nth(1).and_then(|tail| tail.split('}').next()).unwrap();
    assert!(router_link.contains("\"aState\":\"red\",\"bState\":\"amber\""), "{router_link}");
}

#[test]
fn add_names_and_counts_by_kind() {
    let mut ws = Workspace::new();
    let before = ws.devices.len();
    let id = ws.add("PC-PT", 100.0, 100.0).unwrap();
    assert_eq!(ws.devices.len(), before + 1);
    let dev = ws.devices.iter().find(|d| d.id == id).unwrap();
    assert_eq!(dev.name, "PC3");
    assert_eq!(dev.kind, "pc");
    assert_eq!(dev.icon, "/art3d/devices/pc.png");
}

#[test]
fn add_unknown_model_is_rejected() {
    let mut ws = Workspace::new();
    assert!(ws.add("not-a-device", 10.0, 10.0).is_none());
}

#[test]
fn move_and_remove() {
    let mut ws = Workspace::new();
    assert!(ws.mv("pc0", 500.0, 300.0));
    let d = ws.devices.iter().find(|d| d.id == "pc0").unwrap();
    assert_eq!((d.x, d.y), (500.0, 300.0));

    // clamped to the canvas
    assert!(ws.mv("pc0", -500.0, 9999.0));
    let d = ws.devices.iter().find(|d| d.id == "pc0").unwrap();
    assert_eq!((d.x, d.y), (40.0, 500.0));

    let links_before = ws.links.len();
    assert!(ws.remove("pc0"));
    assert!(ws.links.len() < links_before);
    assert!(!ws.remove("pc0"));
}

#[test]
fn linking_assigns_ports_and_rejects_duplicates() {
    let mut ws = Workspace::new();
    let pc = ws.add("PC-PT", 700.0, 450.0).unwrap();

    assert!(ws.link(&pc, "switch0").is_ok());
    let link = ws.links.iter().find(|l| l.a == pc).unwrap();
    assert_eq!(link.a_port, "Fa0");
    assert_eq!(link.b_port, "Fa0/4"); // switch already has 3 links

    assert!(ws.link(&pc, "switch0").is_err(), "duplicate accepted");
    assert!(ws.link(&pc, &pc).is_err(), "self link accepted");
    assert!(ws.link(&pc, "nope").is_err(), "unknown device accepted");

    assert!(ws.unlink(&pc, "switch0"));
    assert!(!ws.unlink(&pc, "switch0"));
}

#[test]
fn router_ports_increment_by_link_count() {
    let mut ws = Workspace::new();
    assert_eq!(ws.next_port("router0"), "Gig0/2"); // already has 2 links
    let pc = ws.add("PC-PT", 700.0, 450.0).unwrap();
    ws.link(&pc, "router0").unwrap();
    assert_eq!(ws.next_port("router0"), "Gig0/3");
}

#[test]
fn every_link_endpoint_exists() {
    let ws = Workspace::new();
    for l in &ws.links {
        assert!(ws.devices.iter().any(|d| d.id == l.a), "missing {}", l.a);
        assert!(ws.devices.iter().any(|d| d.id == l.b), "missing {}", l.b);
    }
}

#[test]
fn console_cable_joins_only_a_host_to_a_network_device() {
    let mut ws = Workspace::new();
    ws.link_kind("pc0", "router0", "eConsole").unwrap();
    assert_eq!(ws.console_peer("pc0"), Some("router0"));
    assert_eq!(ws.console_peer("router0"), None, "only the host drives it");

    // two switches cannot be joined by a console cable
    let sw = ws.add("2960", 700.0, 120.0).unwrap();
    let err = ws.link_kind("switch0", &sw, "eConsole").unwrap_err();
    assert!(err.contains("console cable joins a PC"), "{err}");
    // unknown cable types are refused, not silently typed as copper
    let err = ws.link_kind("pc1", &sw, "eBanana").unwrap_err();
    assert!(err.contains("unknown cable type"), "{err}");

    // a console cable is out of band: it never becomes a data path, and it
    // lands on the console port instead of consuming a Gigabit interface
    assert_eq!(ws.links.iter().filter(|l| l.carries_data()).count(), 6);
    let console = ws.links.iter().find(|l| !l.carries_data()).unwrap();
    assert_eq!(console.a_port, "RS-232");
    assert_eq!(console.b_port, "Console");
}

#[test]
fn cables_only_join_devices_that_support_them() {
    let mut ws = Workspace::empty();
    let r1 = ws.add("2911", 200.0, 100.0).unwrap();
    let r2 = ws.add("2911", 700.0, 100.0).unwrap();
    let pc = ws.add("PC-PT", 200.0, 400.0).unwrap();
    let pc2 = ws.add("PC-PT", 700.0, 400.0).unwrap();
    let sw = ws.add("2960", 450.0, 100.0).unwrap();

    // Serial needs serial ports on both ends and picks one of them.
    assert!(ws.link_kind(&r1, &r2, "eSerial").is_ok());
    let serial = ws.links.last().unwrap();
    assert_eq!(serial.a_port, "Serial0/0/0", "{}", serial.a_port);
    assert!(ws.link_kind(&pc, &pc2, "eSerial").is_err());

    // Fiber joins network devices only.
    assert!(ws.link_kind(&sw, &r1, "eFiber").is_ok());
    assert!(ws.link_kind(&pc, &pc2, "eFiber").is_err());

    // Copper joins Ethernet endpoints.
    assert!(ws.link_kind(&pc, &sw, "eCopper").is_ok());

    // Phone and coax have their own endpoints.
    let phone = ws.add("Analog Phone", 900.0, 400.0).unwrap();
    assert!(ws.link_kind(&phone, &r2, "ePhone").is_ok());
    assert!(ws.link_kind(&phone, &pc, "ePhone").is_err());
    let home = ws.add("Home Router", 900.0, 100.0).unwrap();
    assert!(ws.link_kind(&home, &r1, "eCoax").is_ok());
    assert!(ws.link_kind(&r1, &r2, "eCoax").is_err());

    // IoT cable joins IoT endpoints (directly or through a switch).
    let t1 = ws.add("Thing", 600.0, 300.0).unwrap();
    let t2 = ws.add("Thing", 800.0, 300.0).unwrap();
    assert!(ws.link_kind(&t1, &t2, "eIoT").is_ok());
    assert!(ws.link_kind(&t1, &pc, "eIoT").is_err());
}

#[test]
fn duplicate_copies_model_and_offsets() {
    let mut ws = Workspace::new();
    let n = ws.devices.len();
    let id = ws.duplicate("pc0").unwrap();
    assert_eq!(ws.devices.len(), n + 1);
    let d = ws.devices.iter().find(|d| d.id == id).unwrap();
    assert_eq!(d.model, "PC-PT");
    assert!(d.x > 105.0);
}

#[test]
fn bus_builds_star_with_addresses() {
    let mut ws = Workspace::new();
    assert_eq!(ws.bus(4).unwrap(), 4);
    // An untouched demo is replaced, so the bus is the whole topology.
    assert_eq!(ws.devices.len(), 5); // hub + 4 PCs
    assert_eq!(ws.links.len(), 4);

    let mut addrs: Vec<String> = ws
        .devices
        .iter()
        .filter_map(|d| d.ip.map(crate::model::ipv4_string))
        .collect();
    addrs.sort();
    assert_eq!(
        addrs,
        vec!["192.168.1.10", "192.168.1.11", "192.168.1.12", "192.168.1.13"]
    );
    assert!(ws.bus(1).is_err());
    assert!(ws.bus(99).is_err());
}

#[test]
fn power_off_drops_traffic_until_switched_back_on() {
    let mut ws = Workspace::new();
    assert!(ws.is_powered("pc1"));
    assert!(ws.set_power("pc1", false));
    assert!(!ws.is_powered("pc1"));
    let err = ws.send_pdu("pc0", "pc1").unwrap_err();
    assert!(err.contains("powered off"), "{err}");
    assert_eq!(ws.events.len(), 1);
    assert_eq!(ws.events[0].status, "Dropped");
    assert_eq!(ws.events[0].reason.as_deref(), Some(err.as_str()));

    assert!(ws.set_power("pc1", true));
    ws.send_pdu("pc0", "pc1").unwrap();
    assert_eq!(ws.events.len(), 2);
}

#[test]
fn module_slots_add_ports_and_refuse_removal_while_cabled() {
    let mut ws = Workspace::new();
    let before = ws
        .devices
        .iter()
        .find(|d| d.id == "router0")
        .unwrap()
        .ports
        .len();
    ws.set_module("router0", 0, "HWIC-2T").unwrap();
    let dev = ws.devices.iter().find(|d| d.id == "router0").unwrap();
    assert_eq!(dev.ports.len(), before + 2);
    assert!(dev.ports.iter().any(|p| p.name == "Serial0/3/0"));
    assert_eq!(ws.modules("router0")[0].as_deref(), Some("HWIC-2T"));

    // Unknown models, out-of-range slots and slot-less devices are refused.
    assert!(ws.set_module("router0", 0, "NOPE").is_err());
    assert!(ws.set_module("router0", 5, "").is_err());
    assert!(ws.set_module("pc0", 0, "").is_err());

    // Cable the module's own port: removal must then be refused.
    let r1 = ws.add("2911", 700.0, 100.0).unwrap();
    ws.links.push(Link {
        a: "router0".into(),
        a_port: "Serial0/3/0".into(),
        b: r1.clone(),
        b_port: "Serial0/0/0".into(),
        kind: "eSerial".into(),
    });
    let err = ws.set_module("router0", 0, "").unwrap_err();
    assert!(err.contains("cabled"), "{err}");

    ws.unlink("router0", &r1);
    ws.set_module("router0", 0, "").unwrap();
    assert_eq!(ws.modules("router0")[0], None);
}

#[test]
fn mesh_links_every_pair_once_and_is_idempotent() {
    let mut ws = Workspace::new();
    let a = ws.add("PC-PT", 100.0, 100.0).unwrap();
    let b = ws.add("Laptop", 200.0, 100.0).unwrap();
    let c = ws.add("Server", 300.0, 100.0).unwrap();
    let ids = vec![a.clone(), b.clone(), c.clone(), c.clone()];

    assert_eq!(ws.mesh(&ids).unwrap(), 3);
    for (x, y) in [(&a, &b), (&a, &c), (&b, &c)] {
        assert!(
            ws.links
                .iter()
                .any(|l| (&l.a == x && &l.b == y) || (&l.a == y && &l.b == x)),
            "missing {x}-{y}"
        );
    }
    assert_eq!(ws.mesh(&ids).unwrap(), 0, "second mesh added links");
    assert_eq!(
        ws.links
            .iter()
            .filter(|l| [&a, &b, &c].iter().any(|d| l.a == **d || l.b == **d))
            .count(),
        3
    );
}

#[test]
fn mesh_of_four_devices_creates_six_links() {
    let mut ws = Workspace::new();
    let mut ids = Vec::new();
    for i in 0..4 {
        ids.push(ws.add("PC-PT", 100.0 + 40.0 * i as f32, 100.0).unwrap());
    }
    let before = ws.links.len();
    assert_eq!(ws.mesh(&ids).unwrap(), 6);
    assert_eq!(ws.links.len(), before + 6);
    assert_eq!(ws.mesh(&ids).unwrap(), 0);
}

#[test]
fn mesh_rejects_fewer_than_two_known_devices() {
    let mut ws = Workspace::new();
    assert!(ws.mesh(&[]).is_err());
    assert!(ws.mesh(&["pc0".to_string()]).is_err());
    assert!(ws.mesh(&["pc0".to_string(), "ghost".to_string()]).is_err());
    assert!(ws.mesh(&["ghost".to_string(), "phantom".to_string()]).is_err());
    // A failed mesh must not have touched the topology.
    assert_eq!(ws.links.len(), 6);
}

#[test]
fn mesh_skips_pairs_that_are_already_linked() {
    let mut ws = Workspace::new();
    let pc = ws.add("PC-PT", 700.0, 450.0).unwrap();
    ws.link(&pc, "switch0").unwrap();
    assert_eq!(ws.mesh(&[pc.clone(), "switch0".to_string()]).unwrap(), 0);
    assert_eq!(ws.mesh(&[pc.clone(), "switch0".to_string()]).unwrap(), 0);
}
