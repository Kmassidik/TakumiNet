use super::super::*;

#[test]
fn wireless_vpn_pppoe_and_phones_work_and_persist() {
    let mut ws = Workspace::new();
    let wlc = ws.add("WLC", 800.0, 100.0).unwrap();
    ws.wlan_add(&wlc, "LAB-WIFI", "supersecret").unwrap();
    assert_eq!(ws.wifi_scan().len(), 1);
    let err = ws.wifi_join("pc0", "LAB-WIFI", "wrongpass").unwrap_err();
    assert_eq!(err, "authentication failed");
    assert_eq!(ws.wifi_join("pc0", "LAB-WIFI", "supersecret").unwrap(), wlc);
    assert_eq!(ws.wifi_status("pc0").unwrap().0, "LAB-WIFI");

    ws.vpn_config("pc0", "192.168.2.20", "vpnuser").unwrap();
    assert_eq!(ws.vpn_status("pc0").unwrap().1, "vpnuser");
    ws.pppoe_config("pc0", "192.168.2.20", "dsluser").unwrap();
    assert!(ws.pppoe_status("pc0").is_some());
    ws.phone_register("pc0", "192.168.2.20", 1001).unwrap();
    assert_eq!(ws.phone_status("pc0").unwrap().1, 1001);

    let back = Workspace::from_tnet(&ws.to_tnet()).unwrap();
    assert_eq!(back.wlan_list(&wlc).len(), 1);
    assert_eq!(back.wifi_status("pc0").unwrap().0, "LAB-WIFI");
    assert!(back.vpn_status("pc0").is_some());
    assert!(back.pppoe_status("pc0").is_some());
    assert_eq!(back.phone_status("pc0").unwrap().1, 1001);
}

#[test]
fn wireless_enterprise_roaming_and_capwap() {
    let mut ws = Workspace::new();
    let wlc1 = ws.add("WLC", 800.0, 100.0).unwrap();
    let wlc2 = ws.add("WLC", 900.0, 100.0).unwrap();
    let ap = ws.add("Access Point", 850.0, 200.0).unwrap();
    ws.wlan_add(&wlc1, "LAB-WIFI", "supersecret").unwrap();
    ws.wlan_add(&wlc2, "LAB-WIFI", "supersecret").unwrap();
    ws.wlan_add_with(&wlc1, "CORP", "", "WPA2-Enterprise".into())
        .unwrap();
    ws.aaa_add_user("server0", "alice", "pw1234").unwrap();

    ws.capwap_join(&ap, &wlc1).unwrap();
    assert_eq!(ws.capwap_status(&ap).as_deref(), Some(wlc1.as_str()));
    assert!(ws.capwap_join("pc0", &wlc1).is_err());

    let first = ws.wifi_join("pc0", "LAB-WIFI", "supersecret").unwrap();
    assert!(first == wlc1 || first == wlc2, "{first}");
    ws.wifi_roam("pc0", &wlc2).unwrap();
    assert_eq!(ws.wifi_status("pc0").unwrap().1, wlc2);

    let err = ws.wifi_join_auth("pc0", "CORP", "wrong", "alice").unwrap_err();
    assert_eq!(err, "authentication failed");
    assert!(ws.wifi_join_auth("pc0", "CORP", "pw1234", "alice").is_ok());

    let back = Workspace::from_tnet(&ws.to_tnet()).unwrap();
    assert_eq!(back.wlan_list(&wlc1).len(), 2);
    assert_eq!(back.wifi_status("pc0").unwrap().0, "CORP");
    assert_eq!(back.capwap_status(&ap).as_deref(), Some(wlc1.as_str()));
}

#[test]
fn industrial_protocols_and_cell_tower_work() {
    let mut ws = Workspace::new();
    let plc = ws.add("PLC", 100.0, 500.0).unwrap();
    let ioe = ws.add("IoE", 300.0, 500.0).unwrap();
    let tower = ws.add("Cell Tower", 600.0, 500.0).unwrap();
    let phone = ws.add("Tablet", 700.0, 500.0).unwrap();
    ws.link_kind(&plc, &ioe, "eIoT").unwrap();

    assert_eq!(ws.iot_write(&plc, 5, 42).unwrap(), 0);
    assert_eq!(ws.iot_read(&plc, 5).unwrap(), 42);
    assert!(ws.iot_write(&plc, 300, 1).is_err());

    ws.prp_enable(&plc, true).unwrap();
    ws.prp_enable(&ioe, true).unwrap();
    assert_eq!(ws.send_iot(&plc, &ioe, "prp", 7).unwrap(), "PRP delivered");
    let dup = ws.send_iot(&plc, &ioe, "prp", 7).unwrap();
    assert!(dup.contains("duplicate seq 7"), "{dup}");

    assert_eq!(ws.ptp_sync(&plc, &ioe).unwrap(), 0.0);
    assert_eq!(ws.ptp_status(&ioe).unwrap().0, plc);

    ws.cell_join(&phone, &tower).unwrap();
    assert_eq!(ws.cell_status(&phone).as_deref(), Some(tower.as_str()));
    let err = ws.send_iot(&phone, &plc, "cellular", 0).unwrap_err();
    assert!(err.contains("same cell tower"), "{err}");

    let mut back = Workspace::from_tnet(&ws.to_tnet()).unwrap();
    assert_eq!(back.iot_read(&plc, 5).unwrap(), 42);
    assert!(back.prp_on.contains(&plc));
    assert_eq!(back.ptp_status(&ioe).unwrap().0, plc);
    assert_eq!(back.cell_status(&phone).as_deref(), Some(tower.as_str()));
}

#[test]
fn wpa3_sae_needs_eight_characters_and_the_right_passphrase() {
    let mut ws = Workspace::new();
    let wlc = ws.add("WLC", 800.0, 100.0).unwrap();
    assert!(ws.wlan_add_with(&wlc, "SAFE", "short", "WPA3-SAE".into()).is_err());
    ws.wlan_add_with(&wlc, "SAFE", "longenough", "WPA3-SAE".into()).unwrap();
    assert_eq!(ws.wlan_list(&wlc)[0].1, "WPA3-SAE");
    assert!(ws.wifi_join("pc0", "SAFE", "wrongpass").is_err());
    assert_eq!(ws.wifi_join("pc0", "SAFE", "longenough").unwrap(), wlc);
}

#[test]
fn signal_strength_uses_the_nearest_access_point() {
    let mut ws = Workspace::new();
    let wlc = ws.add("WLC", 0.0, 0.0).unwrap();
    let ap = ws.add("Access Point", 900.0, 0.0).unwrap();
    let tablet = ws.add("Tablet", 850.0, 0.0).unwrap();
    ws.wlan_add(&wlc, "LAB-WIFI", "supersecret").unwrap();
    ws.wifi_join(&tablet, "LAB-WIFI", "supersecret").unwrap();
    assert_eq!(ws.wifi_signal(&tablet), Some(0), "far from the controller, no AP yet");
    ws.capwap_join(&ap, &wlc).unwrap();
    assert_eq!(ws.wifi_signal(&tablet), Some(4), "the nearby AP carries the signal");
}

#[test]
fn auto_roaming_moves_to_the_nearer_controller_and_reports_fast_transition() {
    let mut ws = Workspace::new();
    let wlc1 = ws.add("WLC", 0.0, 0.0).unwrap();
    let wlc2 = ws.add("WLC", 900.0, 0.0).unwrap();
    let tablet = ws.add("Tablet", 850.0, 0.0).unwrap();
    ws.wlan_add(&wlc1, "LAB-WIFI", "supersecret").unwrap();
    ws.wlan_add(&wlc2, "LAB-WIFI", "supersecret").unwrap();
    ws.wifi_join(&tablet, "LAB-WIFI", "supersecret").unwrap();
    ws.wifi_roam(&tablet, &wlc1).unwrap();
    ws.set_roam_features(&wlc1, false, true, true);
    ws.set_roam_features(&wlc2, true, true, true);
    let note = ws.wifi_roam_auto(&tablet).unwrap();
    assert!(note.contains(&wlc2) && note.contains("802.11r"), "{note}");
    assert_eq!(ws.wifi_status(&tablet).unwrap().1, wlc2);
    assert_eq!(ws.roam_features(&wlc2), (true, true, true));
    assert!(ws.wifi_roam_auto(&tablet).is_err(), "already best");
}

#[test]
fn roaming_features_survive_a_round_trip() {
    let mut ws = Workspace::new();
    let wlc = ws.add("WLC", 800.0, 100.0).unwrap();
    ws.set_roam_features(&wlc, true, false, true);
    let back = Workspace::from_tnet(&ws.to_tnet()).unwrap();
    assert_eq!(back.roam_features(&wlc), (true, false, true));
}
