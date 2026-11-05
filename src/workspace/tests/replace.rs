use super::super::*;

fn hub_lab() -> (Workspace, String) {
    let mut ws = Workspace::empty();
    let hub = ws.add("Hub", 300.0, 200.0).unwrap();
    ws.add("PC", 100.0, 400.0).unwrap();
    ws.add("PC", 300.0, 400.0).unwrap();
    ws.add("PC", 500.0, 400.0).unwrap();
    ws.link_ports(&hub, "pc0", "eCopper", Some("FastEthernet0"), None).unwrap();
    ws.link_ports(&hub, "pc1", "eCopper", Some("FastEthernet1"), None).unwrap();
    ws.link_ports(&hub, "pc2", "eCopper", Some("FastEthernet2"), None).unwrap();
    (ws, hub)
}

#[test]
fn replacing_a_hub_with_a_switch_keeps_id_name_and_every_cable() {
    let (mut ws, hub) = hub_lab();
    let report = ws.replace(&hub, "Switch 24").unwrap();
    assert_eq!(report.kept, 3);
    assert!(report.dropped.is_empty());
    let dev = ws.devices.iter().find(|d| d.id == hub).unwrap();
    assert_eq!(dev.kind, "switch");
    assert_eq!(dev.model, "Switch 24");
    assert_eq!(dev.name, "Hub0");
    assert_eq!(ws.links.len(), 3);
    assert!(ws.links.iter().any(|l| l.a_port == "FastEthernet0/1" || l.b_port == "FastEthernet0/1"));
}

#[test]
fn an_incompatible_model_is_refused_with_a_plain_reason() {
    let (mut ws, hub) = hub_lab();
    let err = ws.replace(&hub, "Router 300").unwrap_err();
    assert!(err.contains("choose another switch"), "{err}");
    let err = ws.replace("pc0", "Hub").unwrap_err();
    assert!(err.contains("host") || err.contains("choose"), "{err}");
    assert!(ws.replace("nobody", "Switch 24").is_err());
}

#[test]
fn a_link_whose_port_does_not_exist_is_dropped_and_reported() {
    let mut ws = Workspace::empty();
    let l3 = ws.add("Switch L3", 300.0, 200.0).unwrap();
    ws.add("PC", 100.0, 400.0).unwrap();
    ws.link_ports(&l3, "pc0", "eCopper", Some("GigabitEthernet0/12"), None).unwrap();
    let report = ws.replace(&l3, "Hub").unwrap();
    assert_eq!(report.kept, 0);
    assert_eq!(report.dropped, vec!["GigabitEthernet0/12"]);
    assert!(ws.links.is_empty());
}

#[test]
fn a_replaced_device_survives_a_save_and_open_round_trip() {
    let (mut ws, hub) = hub_lab();
    ws.replace(&hub, "Switch 24").unwrap();
    let back = Workspace::from_tnet(&ws.to_tnet()).unwrap();
    let dev = back.devices.iter().find(|d| d.id == hub).unwrap();
    assert_eq!(dev.model, "Switch 24");
    assert_eq!(back.links.len(), 3);
}

#[test]
fn replace_options_match_the_family() {
    let (ws, hub) = hub_lab();
    let options = ws.replace_options(&hub);
    assert!(options.contains(&"Switch 24".to_string()));
    assert!(!options.contains(&"Router 300".to_string()));
}

#[test]
fn a_router_swap_keeps_routes_and_reports_nothing_cleared() {
    let mut ws = Workspace::empty();
    let r = ws.add("Router 300", 200.0, 100.0).unwrap();
    ws.set_port_ip(&r, "GigabitEthernet0/0", "10.77.0.1", 24).unwrap();
    ws.add_route(&r, "10.78.0.0", "255.255.255.0", "10.77.0.2", 1).unwrap();
    let clears = ws.replace_clears(&r, "Router 500");
    assert!(clears.is_empty(), "router routes are kept: {clears:?}");
    let report = ws.replace(&r, "Router 500").unwrap();
    assert!(report.cleared.is_empty());
    assert_eq!(ws.devices.iter().find(|d| d.id == r).unwrap().routes.len(), 1, "the route must survive the model swap");
}

#[test]
fn a_switch_to_hub_swap_reports_the_guard_settings_it_removes() {
    let mut ws = Workspace::empty();
    let sw = ws.add("Switch 24", 200.0, 100.0).unwrap();
    ws.set_portfast(&sw, "FastEthernet0/1", true);
    ws.set_storm_level(&sw, "FastEthernet0/1", 40);
    let clears = ws.replace_clears(&sw, "Hub");
    assert!(clears.iter().any(|c| c.contains("guard")), "{clears:?}");
    let report = ws.replace(&sw, "Hub").unwrap();
    assert!(report.cleared.iter().any(|c| c.contains("guard")));
    assert!(!ws.portfast(&sw, "FastEthernet0/1"));
    assert_eq!(ws.storm_level(&sw, "FastEthernet0/1"), None);
}

#[test]
fn workspace_json_lists_what_a_swap_would_clear() {
    let mut ws = Workspace::empty();
    let sw = ws.add("Switch 24", 200.0, 100.0).unwrap();
    ws.set_portfast(&sw, "FastEthernet0/1", true);
    let json = ws.json();
    assert!(json.contains("replaceClears"), "{json}");
    assert!(json.contains("Layer-2 guard settings"), "{json}");
}
