use super::*;
use crate::workspace::Workspace;

#[test]
fn show_lldp_neighbors_lists_live_cables_with_capabilities() {
    let mut ws = Workspace::new();
    let mut s = Session::default();
    let router = ws.devices.iter().find(|d| d.kind == "router").unwrap().id.clone();
    run(&mut ws, &router, &mut s, "enable");
    let out = run(&mut ws, &router, &mut s, "show lldp neighbors");
    assert!(out.contains("Capability codes"), "{out}");
    assert!(out.contains("Local Intf") && out.contains("Port ID"), "{out}");
    assert!(out.contains("Total entries displayed"), "{out}");
    assert!(run(&mut ws, &router, &mut s, "show ?").contains("show lldp neighbors"));

    let lonely = Workspace::from_tnet("<?xml version=\"1.0\"?><takumi><device id=\"r1\" kind=\"router\" model=\"Router 100\" x=\"100\" y=\"100\" name=\"R1\" ip=\"\" prefix=\"24\"/></takumi>");
    if let Ok(mut lone) = lonely {
        let mut s = Session::default();
        run(&mut lone, "r1", &mut s, "enable");
        assert_eq!(run(&mut lone, "r1", &mut s, "show lldp neighbors"), "% no LLDP neighbors\n");
    }
}
