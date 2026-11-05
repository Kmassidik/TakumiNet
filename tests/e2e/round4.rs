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
