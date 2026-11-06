use super::super::*;
use crate::net::packet::Mac;

#[test]
fn the_arp_cache_not_a_device_lookup_decides_the_destination_mac() {
    let mut ws = Workspace::new();
    let target = ws.devices.iter().find(|d| d.id == "pc1").and_then(|d| d.ip).expect("pc1 address");
    let fake = Mac([0x02, 0, 0, 0, 0, 0x77]);
    ws.tables.arps("pc0").insert(target, Mac::for_device("pc1"), f64::from(ws.sim_time));
    ws.send_pdu("pc0", "pc1").unwrap();
    assert_eq!(ws.events.last().unwrap().hops[0].dst_mac, Mac::for_device("pc1"));
    ws.tables.arps("pc0").insert(target, fake, f64::from(ws.sim_time));
    ws.send_pdu("pc0", "pc1").unwrap();
    let hop = &ws.events.last().unwrap().hops[0];
    assert_eq!(hop.dst_mac, fake, "the poisoned cache wins");
    assert!(hop.layers[0].fields.iter().any(|(k, v)| k == "Destination" && v == &fake.to_string()));
}

#[test]
fn an_expired_entry_is_refreshed_by_a_new_arp_exchange() {
    let mut ws = Workspace::new();
    let target = ws.devices.iter().find(|d| d.id == "pc1").and_then(|d| d.ip).expect("pc1 address");
    ws.tables.arps("pc0").insert(target, Mac([0x02, 0, 0, 0, 0, 0x88]), 0.0);
    ws.advance(4000.0);
    ws.send_pdu("pc0", "pc1").unwrap();
    let last = ws.events.last().unwrap();
    assert_eq!(last.hops.last().unwrap().dst_mac, Mac::for_device("pc1"));
}
