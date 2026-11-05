use super::super::*;

fn closet() -> (Workspace, String, String, String) {
    let mut ws = Workspace::new();
    let sw = ws.add("Switch 24", 600.0, 100.0).unwrap();
    let ap = ws.add("Access Point", 700.0, 100.0).unwrap();
    let phone = ws.add("IP Phone", 700.0, 200.0).unwrap();
    ws.link_ports(&sw, &ap, "eCopper", Some("FastEthernet0/1"), None).unwrap();
    ws.link_ports(&sw, &phone, "eCopper", Some("FastEthernet0/2"), None).unwrap();
    (ws, sw, ap, phone)
}

#[test]
fn a_device_on_its_own_adapter_ignores_poe() {
    let (ws, _, ap, _) = closet();
    assert!(ws.is_powered(&ap));
    assert!(ws.poe_report().is_empty());
}

#[test]
fn a_poe_device_runs_while_its_port_supplies_power() {
    let (mut ws, sw, ap, phone) = closet();
    ws.set_poe_device(&ap, true).unwrap();
    ws.set_poe_device(&phone, true).unwrap();
    assert!(ws.is_powered(&ap) && ws.is_powered(&phone));
    assert!((ws.poe_used(&sw) - 21.9).abs() < 0.01, "{}", ws.poe_used(&sw));
    ws.set_port_poe(&sw, "FastEthernet0/1", false).unwrap();
    assert!(!ws.is_powered(&ap));
    assert_eq!(ws.poe_denied(&ap), Some("power inline never is set on the switch port"));
    assert!(ws.is_powered(&phone), "the other port is untouched");
    ws.set_port_poe(&sw, "FastEthernet0/1", true).unwrap();
    assert!(ws.is_powered(&ap));
}

#[test]
fn a_shut_port_and_a_missing_switch_both_leave_the_device_dark() {
    let (mut ws, sw, ap, _) = closet();
    ws.set_poe_device(&ap, true).unwrap();
    assert!(ws.set_port_up(&sw, "FastEthernet0/1", false));
    assert_eq!(ws.poe_denied(&ap), Some("the switch port is shut down"));
    let lonely = ws.add("Access Point", 800.0, 300.0).unwrap();
    ws.set_poe_device(&lonely, true).unwrap();
    assert_eq!(ws.poe_denied(&lonely), Some("no PoE switch is cabled to it"));
}

#[test]
fn the_budget_runs_out_in_port_order() {
    let mut ws = Workspace::new();
    let sw = ws.add("Switch 24", 600.0, 100.0).unwrap();
    let mut aps = Vec::new();
    for i in 0..9 {
        let ap = ws.add("Access Point", 100.0 + i as f32 * 50.0, 400.0).unwrap();
        ws.link_ports(&sw, &ap, "eCopper", Some(&format!("FastEthernet0/{}", i + 1)), None).unwrap();
        ws.set_poe_device(&ap, true).unwrap();
        aps.push(ap);
    }
    assert!(aps[..7].iter().all(|ap| ws.is_powered(ap)), "7 x 15.4 W fit in 120 W");
    assert_eq!(ws.poe_denied(&aps[7]), Some("the switch is out of PoE budget"));
    assert!(!ws.is_powered(&aps[8]));
}

#[test]
fn only_aps_and_phones_take_poe_and_only_switches_supply_it() {
    let (mut ws, sw, _, _) = closet();
    let pc = ws.add("PC", 50.0, 50.0).unwrap();
    assert!(ws.set_poe_device(&pc, true).is_err());
    assert!(ws.set_port_poe(&pc, "FastEthernet0", false).is_err());
    assert!(ws.set_port_poe(&sw, "NoSuchPort", false).is_err());
}

#[test]
fn poe_settings_survive_a_save_and_open_round_trip() {
    let (mut ws, sw, ap, _) = closet();
    ws.set_poe_device(&ap, true).unwrap();
    ws.set_port_poe(&sw, "FastEthernet0/1", false).unwrap();
    let back = Workspace::from_tnet(&ws.to_tnet()).unwrap();
    assert!(back.poe.devices.contains(&ap));
    assert!(!back.poe_port_on(&sw, "FastEthernet0/1"));
    assert!(!back.is_powered(&ap));
}

#[test]
fn the_cli_sets_power_inline_and_shows_the_table() {
    use crate::cli::{run, Session};
    let (mut ws, sw, ap, _) = closet();
    ws.set_poe_device(&ap, true).unwrap();
    let mut s = Session::default();
    for line in ["enable", "configure terminal", "interface FastEthernet0/1", "power inline never"] {
        let out = run(&mut ws, &sw, &mut s, line);
        assert!(!out.contains('%'), "{line}: {out}");
    }
    run(&mut ws, &sw, &mut s, "end");
    let table = run(&mut ws, &sw, &mut s, "show power inline");
    assert!(table.contains("Available:120.0(w)"), "{table}");
    assert!(table.contains("never") && table.contains("off"), "{table}");
    run(&mut ws, &sw, &mut s, "configure terminal");
    run(&mut ws, &sw, &mut s, "interface FastEthernet0/1");
    run(&mut ws, &sw, &mut s, "power inline auto");
    run(&mut ws, &sw, &mut s, "end");
    let table = run(&mut ws, &sw, &mut s, "show power inline");
    assert!(table.contains("auto") && table.contains("15.4"), "{table}");
    assert!(table.contains("FastEthernet0/1   auto"), "columns must not run together: {table}");
}
