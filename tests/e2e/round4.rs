use super::*;

#[test]
fn e2e_replace_a_hub_keeps_cables_and_undo_restores_it() {
    let s = spawn(38_287);
    s.post("/api/templates/open?id=les-l2-10-noisy-hub");
    let (status, _, body) = s.post("/api/devices/replace?id=hub0&model=Switch%2024");
    assert_eq!(status, 200, "{body}");
    assert!(body.contains("\"replace\":{\"kept\":3,\"dropped\":[]}"), "{body}");
    assert!(body.contains("\"model\":\"Switch 24\""), "{body}");
    let (_, _, body) = s.get("/api/workspace");
    assert_eq!(body.matches("\"kind\":\"eCopper\"").count(), 3, "{body}");
    let (_, _, body) = s.post("/api/undo");
    assert!(body.contains("\"model\":\"Hub\""), "{body}");
}

#[test]
fn e2e_two_queued_pdus_collide_on_one_step() {
    let s = spawn(38_288);
    s.post("/api/templates/open?id=tpl-shared-segment");
    s.post("/api/pdu?src=pc0&dst=pc1&queue=1");
    s.post("/api/pdu?src=pc2&dst=pc3&queue=1");
    s.post("/api/sim/step");
    let (_, _, body) = s.get("/api/devices/ports?id=hub0");
    assert!(!body.contains("\"collisions\":0"), "the hub must count a collision: {body}");
}
