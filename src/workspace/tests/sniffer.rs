//! Patch panels pass frames through; sniffers pass them through and record.

use super::super::*;

fn two_hosts_through(model: &str) -> (Workspace, String, String, String) {
    let mut ws = Workspace::empty();
    let a = ws.add("PC", 0.0, 0.0).unwrap();
    let middle = ws.add(model, 100.0, 0.0).unwrap();
    let b = ws.add("PC", 200.0, 0.0).unwrap();
    ws.link(&a, &middle).unwrap();
    ws.link(&middle, &b).unwrap();
    ws.set_ip(&a, "192.168.1.10", 24).unwrap();
    ws.set_ip(&b, "192.168.1.11", 24).unwrap();
    (ws, a, middle, b)
}

#[test]
fn a_ping_crosses_a_patch_panel_transparently() {
    let (mut ws, a, panel, b) = two_hosts_through("Patch Panel");
    ws.send_pdu(&a, &b).expect("ping through the patch panel");
    let event = ws.events.iter().find(|e| e.proto == "ICMP").expect("captured delivery");
    assert!(event.path.contains(&panel), "the frame walks through the panel: {:?}", event.path);
    let hop = event.hops.iter().find(|h| h.id == panel).unwrap();
    assert!(!hop.note.contains("repeated to every port"), "{}", hop.note);
    // The panel never terminates the frame: the MACs are the hosts' own.
    assert_eq!(hop.src_mac, crate::net::packet::Mac::for_device(&a));
    assert_eq!(hop.dst_mac, crate::net::packet::Mac::for_device(&b));
}

#[test]
fn a_sniffer_records_the_arp_and_the_ping_that_cross_it() {
    let (mut ws, a, sniffer, b) = two_hosts_through("Sniffer");
    ws.send_pdu(&a, &b).expect("ping through the sniffer");
    let rows = ws.tables.sniffer_rows(&sniffer);
    assert!(rows.iter().any(|r| r.proto == "arp" && r.ethertype == "0x0806"), "ARP recorded");
    let icmp = rows.iter().find(|r| r.proto == "icmp").expect("ICMP recorded");
    assert_eq!(icmp.ethertype, "0x0800");
    assert_eq!(icmp.src_ip, "192.168.1.10");
    assert_eq!(icmp.dst_ip, "192.168.1.11");
    assert!(icmp.length > 34, "frame length is on the wire: {}", icmp.length);
    assert!(icmp.info.contains("Echo request"), "{}", icmp.info);
    assert!(ws.sniffer_match_count(&sniffer, "icmp", "192.168.1.11") >= 1);
    assert_eq!(ws.sniffer_match_count(&sniffer, "icmp", "10.0.0.1"), 0);
    ws.tables.sniffer_clear(&sniffer);
    assert!(ws.tables.sniffer_rows(&sniffer).is_empty());
}

#[test]
fn the_capture_buffer_keeps_only_the_last_200_frames() {
    let mut ws = Workspace::empty();
    let id = ws.add("Sniffer", 0.0, 0.0).unwrap();
    for n in 0..205 {
        ws.tables.sniff(&id, SnifferRow {
            t: n as f64,
            src_mac: String::new(),
            dst_mac: String::new(),
            ethertype: "0x0800".into(),
            src_ip: String::new(),
            dst_ip: String::new(),
            proto: "icmp".into(),
            length: 60,
            info: format!("frame {n}"),
        });
    }
    let rows = ws.tables.sniffer_rows(&id);
    assert_eq!(rows.len(), SNIFFER_BUFFER);
    assert_eq!(rows.first().unwrap().info, "frame 5", "oldest frames fall off");
    assert_eq!(rows.last().unwrap().info, "frame 204");
}

#[test]
fn the_capture_check_kind_grades_a_filtered_count() {
    let (mut ws, a, sniffer, b) = two_hosts_through("Sniffer");
    let check = |to: &str, url: &str, expect: &str| Check {
        id: "c1".into(),
        kind: "capture".into(),
        from: sniffer.clone(),
        to: to.into(),
        url: url.into(),
        expect: expect.into(),
        label: "capture".into(),
    };
    let (passed, actual, _) = ws.run_extra_check(&check("icmp", "", "1")).unwrap();
    assert!(!passed, "nothing crossed yet: {actual}");
    ws.send_pdu(&a, &b).unwrap();
    let (passed, actual, _) = ws.run_extra_check(&check("icmp", "192.168.1.11", "1")).unwrap();
    assert!(passed, "{actual}");
    let (passed, actual, _) = ws.run_extra_check(&check("tcp", "", "1")).unwrap();
    assert!(!passed, "no TCP crossed: {actual}");
    let (passed, actual, _) = ws.run_extra_check(&check("", "", "bad")).unwrap();
    assert!(!passed, "{actual}");
    let misaimed = Check { from: a.clone(), ..check("", "", "1") };
    let (passed, actual, _) = ws.run_extra_check(&misaimed).unwrap();
    assert!(!passed && actual.contains("not a sniffer"), "{actual}");
}

#[test]
fn new_parts_accept_the_cables_their_semantics_promise() {
    let mut ws = Workspace::empty();
    let modem = ws.add("Cable Modem", 0.0, 0.0).unwrap();
    let cloud = ws.add("Cloud", 100.0, 0.0).unwrap();
    let home = ws.add("Home Router", 200.0, 0.0).unwrap();
    let dsl = ws.add("DSL Modem", 300.0, 0.0).unwrap();
    let panel = ws.add("Patch Panel", 400.0, 0.0).unwrap();
    let tower = ws.add("Cell Tower", 500.0, 0.0).unwrap();
    let plc = ws.add("PLC", 600.0, 0.0).unwrap();
    let thing = ws.add("Thing", 650.0, 0.0).unwrap();
    let ioe = ws.add("IoE", 700.0, 0.0).unwrap();
    let switch = ws.add("Switch 24", 800.0, 0.0).unwrap();
    let phone = ws.add("Analog Phone", 900.0, 0.0).unwrap();

    ws.link_kind(&modem, &cloud, "eCoax").expect("coax ends on the cable modem by hand");
    ws.link_kind(&modem, &home, "eCopper").expect("the modem's LAN side is Ethernet");
    ws.link_kind(&dsl, &home, "eCopper").expect("a DSL modem takes an Ethernet cable");
    ws.link_kind(&panel, &switch, "eCopper").expect("a patch panel takes an Ethernet cable");
    ws.link_kind(&tower, &switch, "eCopper").expect("a cell tower has a wired backhaul");
    // Modbus TCP runs over Ethernet, so industrial parts also cable to a switch.
    ws.link_kind(&plc, &switch, "eCopper").expect("a PLC speaks Modbus TCP over Ethernet");
    ws.link_kind(&thing, &switch, "eCopper").expect("a thing cables to a switch");
    ws.link_kind(&ioe, &switch, "eCopper").expect("an IoE board cables to a switch");
    ws.link_kind(&plc, &thing, "eIoT").expect("the IoT bus still joins IoT devices");
    assert!(ws.link_kind(&phone, &switch, "eCopper").is_err(), "an analog phone stays phone-cable only");
    assert!(ws.link_kind(&phone, &switch, "ePhone").is_ok(), "the phone cable still works");
}

const CLOSET: &str = include_str!("../../../web/templates/tpl-wiring-closet.xml");

#[test]
fn the_wiring_closet_pings_through_the_panel_and_the_sniffer_records_the_frames() {
    let mut ws = Workspace::from_tnet(CLOSET).unwrap();
    assert_eq!(ws.console_peer("laptop0"), Some("switch0"), "the console cable manages the switch");
    ws.send_addressed_pdu("pc0", "server0").expect("ping from the desk to the server");
    let event = ws.events.iter().find(|e| e.proto == "ICMP").expect("captured delivery");
    assert!(event.path.contains(&"panel0".to_string()), "the frame crosses the panel: {:?}", event.path);
    assert!(event.path.contains(&"sniffer0".to_string()), "the frame crosses the sniffer: {:?}", event.path);
    assert!(ws.sniffer_match_count("sniffer0", "icmp", "192.168.20.5") >= 1, "the sniffer holds the ping");
    assert!(!ws.tables.sniffer_rows("sniffer0").is_empty());
}
