//! Congestion behavior: the demand beat must show the saturation the busy
//! WISP promises — drops and queue delay on the crowded homes, plain sailing
//! for the small ones.

use super::super::*;

const BUSY: &str = include_str!("../../../web/templates/tpl-l2-rtrw-busy.xml");

fn busy() -> Workspace {
    let mut ws = Workspace::from_tnet(BUSY).unwrap();
    ws.run_demo().unwrap();
    ws
}

/// 95 + 5 + 5 + 5 Mbit/s of demand over a 100 Mbit/s parent: the big home is
/// squeezed to its fair share and the engine says so per session.
#[test]
fn the_busy_home_is_squeezed_while_small_homes_ride_through() {
    let ws = Workspace::from_tnet(BUSY).unwrap();
    let rows = ws.congestion_rows("gw0");
    assert_eq!(rows.len(), 4, "one row per PPPoE session");
    let big = rows.iter().find(|r| r.client == "home0").unwrap();
    let small = rows.iter().find(|r| r.client == "home1").unwrap();
    assert!((big.granted_mbit - 85.0).abs() < 1e-9, "home0 granted {}", big.granted_mbit);
    assert!((small.granted_mbit - 5.0).abs() < 1e-9);
    assert!(big.loss_percent > 10.0, "home0 loses {:.1} %", big.loss_percent);
    assert_eq!(small.loss_percent, 0.0, "small home loses nothing");
    assert_eq!(big.wanted_mbit, 95.0);
}

/// No parent cap means no congestion: full demand flows and the beat would
/// have nothing to show — the demo kind must refuse to play a lie.
#[test]
fn without_a_parent_cap_the_rows_show_no_loss() {
    let mut ws = Workspace::from_tnet(BUSY).unwrap();
    ws.set_queue_parent("gw0", 0);
    for row in ws.congestion_rows("gw0") {
        assert_eq!(row.loss_percent, 0.0, "{} loses without a cap", row.client);
        assert_eq!(row.queue_delay_ms, 0.0);
    }
}

/// The beat plays on the shipped template: every home gets a capture row in
/// order, the squeezed one is recorded as Dropped with the uplink named in
/// the reason, the comfortable ones as Successful.
#[test]
fn the_play_captures_the_evening_rush_row_per_home() {
    let mut ws = Workspace::from_tnet(BUSY).unwrap();
    ws.run_demo().unwrap();
    let before = ws.events.len();
    ws.demo_congestion_beat("gw0", "Ether1").unwrap();
    let beat: Vec<_> = ws.events[before..].iter().filter(|e| e.kind == "Demand").collect();
    assert_eq!(beat.len(), 4, "one Demand row per home");
    for (index, home) in ["home0", "home1", "home2", "home3"].iter().enumerate() {
        assert_eq!(beat[index].last, ws.name_of(home), "row {index} is {home}");
    }
    let dropped = beat.iter().find(|e| e.status == "Dropped").expect("the squeezed home drops");
    let reason = dropped.reason.as_deref().unwrap();
    assert!(reason.contains("Ether1 full"), "reason names the uplink: {reason}");
    assert!(reason.contains("drop"), "reason says drop: {reason}");
    for e in beat.iter().filter(|e| e.status == "Successful") {
        assert!(e.reason.is_none());
    }
    // Every row walks the wire path home0..3 -> gw0, not a made-up shortcut.
    for e in &beat {
        assert!(e.path.first().is_some(), "path recorded");
        assert_eq!(*e.path.last().unwrap(), "gw0");
    }
}

/// A demand row must name the queue delay while the line runs full, and the
/// numbers must be honest: granted sums to the parent, never above it.
#[test]
fn crowded_rows_carry_queue_delay_and_respect_the_cap() {
    let ws = Workspace::from_tnet(BUSY).unwrap();
    let rows = ws.congestion_rows("gw0");
    let total: f64 = rows.iter().map(|r| r.granted_mbit).sum();
    assert!(total <= 100.0 + 1e-9, "granted {total} exceeds the parent cap");
    for row in &rows {
        assert!(row.queue_delay_ms >= 0.0);
        assert!(row.queue_delay_ms < 100.0, "delay {:.1} ms is absurd", row.queue_delay_ms);
    }
    let big = rows.iter().find(|r| r.client == "home0").unwrap();
    assert!(big.queue_delay_ms > 0.0, "the full line queues: {:.2} ms", big.queue_delay_ms);
}

/// The shipped template plays end to end: the congestion step is the finale
/// and leaves the beat's Demand rows in the capture.
#[test]
fn the_shipped_busy_template_ends_its_play_in_congestion() {
    let ws = busy();
    let demand: Vec<_> = ws.events.iter().filter(|e| e.kind == "Demand").collect();
    assert_eq!(demand.len(), 4, "the finale captured the rush");
    assert!(ws.events.iter().any(|e| e.status == "Dropped"), "the play shows the drop");
}

/// Two plays must tell the same story: the beat's login redials and Demand
/// rows come out in session order, never in HashMap order.
#[test]
fn two_runs_of_the_beat_record_the_identical_story() {
    let mut ws = Workspace::from_tnet(BUSY).unwrap();
    ws.run_demo().unwrap();
    ws.demo_congestion_beat("gw0", "Ether1").unwrap();
    let first: Vec<String> = ws.events.iter()
        .filter(|e| e.kind == "Demand")
        .map(|e| format!("{} {} {}", e.last, e.status, e.reason.clone().unwrap_or_default()))
        .collect();
    let mut ws = Workspace::from_tnet(BUSY).unwrap();
    ws.run_demo().unwrap();
    ws.demo_congestion_beat("gw0", "Ether1").unwrap();
    let second: Vec<String> = ws.events.iter()
        .filter(|e| e.kind == "Demand")
        .map(|e| format!("{} {} {}", e.last, e.status, e.reason.clone().unwrap_or_default()))
        .collect();
    assert_eq!(first, second, "the beat must replay identically");
    let order: Vec<&str> = first.iter().map(|row| row.split(' ').next().unwrap()).collect();
    assert_eq!(order, ["Home0", "Home1", "Home2", "Home3", "Home0", "Home1", "Home2", "Home3"],
        "each play walks the sessions in order");
}
