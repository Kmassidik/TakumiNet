use super::super::*;

const LESSON: &str = include_str!("../../../web/templates/les-l4-09-power-budget.xml");

#[test]
fn the_last_phone_starts_dark_and_pings_fail() {
    let mut ws = Workspace::from_tnet(LESSON).unwrap();
    assert_eq!(ws.poe_denied("phone2"), Some("the switch is out of PoE budget"));
    assert!(!ws.is_powered("phone2"), "the refused phone is dark");
    assert!(ws.is_powered("phone1"), "the phone inside the budget stays up");
    assert!(ws.is_powered("ap6"), "the access point that crowds the budget is still up");
    let used = ws.poe_used("switch0");
    assert!((used - 114.3).abs() < 0.01, "{used}");
    assert!(ws.send_addressed_pdu("pc0", "phone2").is_err(), "a dark phone drops traffic");
}

#[test]
fn moving_the_ap_to_the_other_switch_restores_the_phone() {
    let mut ws = Workspace::from_tnet(LESSON).unwrap();
    let passed_before: Vec<bool> = ws.run_checks().into_iter().map(|r| r.passed).collect();
    assert_eq!(passed_before, vec![false], "the lesson starts unresolved");

    ws.unlink("switch0", "ap6");
    ws.link_ports("switch1", "ap6", "eCopper", Some("FastEthernet0/1"), None).unwrap();

    assert!(ws.is_powered("phone2"), "the phone gets the freed power");
    assert_eq!(ws.poe_denied("phone2"), None);
    assert!(ws.is_powered("ap6"), "the moved access point runs from HallSwitch");
    assert!((ws.poe_used("switch0") - 105.4).abs() < 0.01);
    assert!((ws.poe_used("switch1") - 15.4).abs() < 0.01);
    assert!(ws.send_addressed_pdu("pc0", "phone2").is_ok());
    assert_eq!(ws.run_checks().into_iter().map(|r| r.passed).collect::<Vec<_>>(), vec![true]);
}

#[test]
fn swapping_the_ap_for_a_phone_draw_is_also_within_budget() {
    let mut ws = Workspace::from_tnet(LESSON).unwrap();
    ws.unlink("switch0", "ap6");
    ws.unlink("switch0", "phone2");
    ws.link_ports("switch0", "phone2", "eCopper", Some("FastEthernet0/8"), None).unwrap();
    // The unused phone takes 6.5 W instead of 15.4 W: 114.3 - 15.4 + 6.5 = 105.4 W.
    assert!(ws.is_powered("phone2"));
    assert!((ws.poe_used("switch0") - 105.4).abs() < 0.01);
}
