use super::super::*;

fn results(ws: &mut Workspace) -> Vec<bool> {
    ws.run_checks().into_iter().map(|r| r.passed).collect()
}

const SHARED: &str = include_str!("../../../web/templates/les-l1-08-one-shared-wire.xml");
const CONSOLE: &str = include_str!("../../../web/templates/les-l2-07-console-port.xml");
const SERIAL: &str = include_str!("../../../web/templates/les-l3-08-serial-line.xml");

#[test]
fn one_shared_wire_fails_before_the_switch_and_passes_after() {
    let mut ws = Workspace::from_tnet(SHARED).unwrap();
    assert_eq!(results(&mut ws), vec![true, true, true, false]);
    assert!(ws.remove("hub0") && ws.remove("hub1"));
    for (port, pc) in [("FastEthernet0/1", "pc0"), ("FastEthernet0/2", "pc1"), ("FastEthernet0/3", "pc2")] {
        ws.link_ports("switch0", pc, "eCopper", Some(port), None).unwrap();
    }
    for (a, b) in [("pc0", "pc1"), ("pc1", "pc2"), ("pc2", "pc0")] {
        ws.send_pdu(a, b).unwrap();
    }
    assert_eq!(results(&mut ws), vec![true, true, true, true]);
}

#[test]
fn console_lesson_fails_before_the_port_returns_and_passes_after() {
    let mut ws = Workspace::from_tnet(CONSOLE).unwrap();
    assert_eq!(results(&mut ws), vec![false, false, false]);
    ws.rename("switch0", "Closet1");
    ws.set_access_vlan("switch0", "FastEthernet0/1", 1).unwrap();
    assert_eq!(results(&mut ws), vec![true, true, true]);
}

#[test]
fn serial_lesson_fails_without_the_line_and_passes_after_both_routes() {
    let mut ws = Workspace::from_tnet(SERIAL).unwrap();
    assert_eq!(results(&mut ws), vec![false, false, false]);
    ws.link_ports("router0", "router1", "eSerial", Some("Serial0/0/0"), Some("Serial0/0/0")).unwrap();
    ws.set_port_ip("router0", "Serial0/0/0", "10.0.0.1", 30).unwrap();
    ws.set_port_ip("router1", "Serial0/0/0", "10.0.0.2", 30).unwrap();
    ws.add_route("router0", "192.168.2.0", "255.255.255.0", "10.0.0.2", 1).unwrap();
    ws.add_route("router1", "192.168.1.0", "255.255.255.0", "10.0.0.1", 1).unwrap();
    assert_eq!(results(&mut ws), vec![true, true, true]);
}
