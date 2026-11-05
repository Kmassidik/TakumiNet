use super::*;

#[test]
fn e2e_duplex_mismatch_drops_frames_and_counts_crc_errors() {
    let s = spawn(38_281);
    s.post("/api/reset");
    s.post("/api/devices?model=PC-PT&x=200&y=100");
    s.post("/api/devices?model=PC-PT&x=400&y=100");
    let (_, _, body) = s.post("/api/links?a=pc3&b=pc4&kind=eCopper");
    assert!(!body.contains("error"), "{body}");
    s.post("/api/devices/ip?id=pc3&ip=10.9.9.1&prefix=24");
    s.post("/api/devices/ip?id=pc4&ip=10.9.9.2&prefix=24");
    let (_, _, body) = s.post("/api/devices/linkspeed?id=pc3&port=FastEthernet0&speed=100&duplex=full");
    assert!(!body.contains("error"), "{body}");

    let mut last = String::new();
    for _ in 0..4 {
        let (_, _, body) = s.post("/api/pdu?src=pc3&dst=pc4");
        last = body;
    }
    assert!(last.contains("late collisions"), "fourth frame must drop: {last}");
    assert!(last.contains("duplex mismatch on"), "{last}");
}

#[test]
fn e2e_matched_duplex_does_not_drop() {
    let s = spawn(38_282);
    s.post("/api/reset");
    s.post("/api/devices?model=PC-PT&x=200&y=100");
    s.post("/api/devices?model=PC-PT&x=400&y=100");
    s.post("/api/links?a=pc3&b=pc4&kind=eCopper");
    s.post("/api/devices/ip?id=pc3&ip=10.9.9.1&prefix=24");
    s.post("/api/devices/ip?id=pc4&ip=10.9.9.2&prefix=24");
    s.post("/api/devices/linkspeed?id=pc3&port=FastEthernet0&speed=100&duplex=full");
    s.post("/api/devices/linkspeed?id=pc4&port=FastEthernet0&speed=100&duplex=full");
    for _ in 0..10 {
        let (_, _, body) = s.post("/api/pdu?src=pc3&dst=pc4");
        assert!(!body.contains("late collisions"), "{body}");
    }
}
