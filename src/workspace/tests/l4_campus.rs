use super::super::*;
use crate::model::parse_ipv4 as ip;

fn passes(ws: &mut Workspace) -> Vec<bool> {
    ws.run_checks().into_iter().map(|r| r.passed).collect()
}

#[test]
fn campus_wifi_lesson_joins_aps_and_fences_the_guest() {
    let mut ws = Workspace::from_tnet(include_str!("../../../web/templates/les-l4-05-campus-wifi.xml")).unwrap();
    assert_eq!(passes(&mut ws), vec![false, false, false]);
    for ap in ["ap0", "ap1", "ap2"] {
        ws.capwap_join(ap, "wlc0").unwrap();
    }
    ws.wlan_add("wlc0", "CampusGuest", "").unwrap();
    ws.wlan_set_guest("wlc0", "CampusGuest", true).unwrap();
    ws.wifi_join("phone0", "CampusGuest", "").unwrap();
    assert_eq!(passes(&mut ws), vec![true, true, true]);
    assert!(ws.send_pdu("laptop0", "server0").is_ok(), "staff still reach the file server");
}

#[test]
fn dmz_lesson_blocks_the_shelf_from_the_inside_but_not_the_public_page() {
    let mut ws = Workspace::from_tnet(include_str!("../../../web/templates/les-l4-06-dmz.xml")).unwrap();
    assert_eq!(passes(&mut ws), vec![true, false, true], "open firewall: everything passes, so the fence check fails");
    let wild = ip("0.0.0.255").unwrap();
    let (none, all) = (ip("0.0.0.0").unwrap(), ip("255.255.255.255").unwrap());
    ws.acl_add("asa0", 120, false, ip("203.0.113.0").unwrap(), wild, Some((ip("172.16.10.0").unwrap(), wild))).unwrap();
    ws.acl_add("asa0", 120, true, none, all, Some((none, all))).unwrap();
    ws.acl_bind("asa0", "GigabitEthernet1/2", 120, true).unwrap();
    assert_eq!(passes(&mut ws), vec![true, true, true]);
    let refusal = ws.send_pdu("server0", "server1").unwrap_err();
    assert!(refusal.contains("ACL denied"), "{refusal}");
}

#[test]
fn the_dmz_template_ships_with_the_fence_already_up() {
    let mut ws = Workspace::from_tnet(include_str!("../../../web/templates/tpl-l4-campus-dmz.xml")).unwrap();
    assert!(ws.send_pdu("server0", "server1").is_err());
    assert!(crate::webapp::fetch(&mut ws, "pc1", "http://203.0.113.10/").is_ok());
}
