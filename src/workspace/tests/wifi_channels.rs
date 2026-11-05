use super::super::*;

fn aps() -> (Workspace, String, String) {
    let mut ws = Workspace::new();
    let a = ws.add("Access Point", 100.0, 100.0).unwrap();
    let b = ws.add("Access Point", 400.0, 100.0).unwrap();
    (ws, a, b)
}

#[test]
fn an_access_point_defaults_to_channel_one_on_24_ghz() {
    let (ws, a, _) = aps();
    let radio = ws.wifi_radio(&a);
    assert_eq!(radio.channel, 1);
    assert_eq!(radio.band, "2.4");
}

#[test]
fn channels_one_and_three_overlap_but_one_and_six_do_not() {
    let (mut ws, a, b) = aps();
    ws.set_wifi_channel(&a, 1, "2.4").unwrap();
    ws.set_wifi_channel(&b, 3, "2.4").unwrap();
    let overlaps = ws.wifi_overlaps();
    assert_eq!(overlaps.len(), 1, "{overlaps:?}");
    ws.set_wifi_channel(&b, 6, "2.4").unwrap();
    assert!(ws.wifi_overlaps().is_empty());
}

#[test]
fn a_bad_channel_or_band_is_refused() {
    let (mut ws, a, _) = aps();
    assert!(ws.set_wifi_channel(&a, 12, "2.4").is_err());
    assert!(ws.set_wifi_channel(&a, 1, "6").is_err());
    let pc = ws.devices.iter().find(|d| d.kind == "pc").unwrap().id.clone();
    assert!(ws.set_wifi_channel(&pc, 1, "2.4").is_err());
}

#[test]
fn channels_survive_a_save_and_open_round_trip() {
    let (mut ws, a, b) = aps();
    ws.set_wifi_channel(&a, 11, "2.4").unwrap();
    ws.set_wifi_channel(&b, 36, "5").unwrap();
    let back = Workspace::from_tnet(&ws.to_tnet()).unwrap();
    assert_eq!(back.wifi_radio(&a).channel, 11);
    assert_eq!(back.wifi_radio(&b).band, "5");
    assert_eq!(back.wifi_radio(&b).channel, 36);
}

#[test]
fn old_files_without_a_radio_record_still_load_as_channel_one() {
    let (ws, a, _) = aps();
    let saved = ws.to_tnet();
    let old = saved.replace(&format!("wifiradio\t{a}\t1\t2.4\n"), "");
    let back = Workspace::from_tnet(&old).unwrap();
    assert_eq!(back.wifi_radio(&a).channel, 1);
}

#[test]
fn show_wireless_names_the_overlap() {
    let (mut ws, a, b) = aps();
    ws.set_wifi_channel(&a, 1, "2.4").unwrap();
    ws.set_wifi_channel(&b, 3, "2.4").unwrap();
    let out = ws.wireless_table(&a);
    assert!(out.contains("channel 1"), "{out}");
    assert!(out.contains("Channel overlap with:"), "{out}");
    ws.set_wifi_channel(&b, 6, "2.4").unwrap();
    assert!(ws.wireless_table(&a).contains("No channel overlap"), "{}", ws.wireless_table(&a));
}
