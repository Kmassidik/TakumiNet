use super::super::*;

const FIVE_GHZ: &str = include_str!("../../../web/templates/les-l4-10-five-ghz.xml");

fn results(ws: &mut Workspace) -> Vec<bool> {
    ws.run_checks().into_iter().map(|r| r.passed).collect()
}

#[test]
fn five_ghz_lesson_fails_while_both_offices_share_2_4_and_passes_after_the_move() {
    let mut ws = Workspace::from_tnet(FIVE_GHZ).unwrap();
    // Both radios load on the crowded 2.4 GHz band: channels 1 and 3 overlap.
    assert_eq!(ws.wifi_radio("ap0").band, "2.4");
    assert_eq!(ws.wifi_radio("ap0").channel, 1);
    assert_eq!(ws.wifi_radio("ap1").channel, 3);
    assert_eq!(ws.overlaps_with("ap0"), vec!["BarberAP".to_string()]);
    assert_eq!(results(&mut ws), vec![false]);

    // Staying in 2.4 GHz cannot give both shops room: the legal channels 1 to
    // 11 that avoid channel 1 are only 6 and 11, and a same-wall neighbour
    // that wants width has none. Moving to 5 GHz ends the overlap outright,
    // because no two 5 GHz radios share a channel.
    ws.set_wifi_channel("ap1", 36, "5").unwrap();
    assert_eq!(ws.wifi_radio("ap1").band, "5");
    assert!(ws.overlaps_with("ap0").is_empty());
    assert_eq!(results(&mut ws), vec![true]);
}
