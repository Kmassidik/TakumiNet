use pt_web::engine::Engine;

fn request(method: &str, target: &str, body: &[u8]) -> Vec<u8> {
    let mut bytes = Vec::new();
    bytes.extend_from_slice(&(method.len() as u16).to_le_bytes());
    bytes.extend_from_slice(&(target.len() as u16).to_le_bytes());
    bytes.extend_from_slice(&(body.len() as u32).to_le_bytes());
    bytes.extend_from_slice(method.as_bytes());
    bytes.extend_from_slice(target.as_bytes());
    bytes.extend_from_slice(body);
    bytes
}

#[test]
fn raw_engine_preserves_method_target_and_body_contracts() {
    let engine = Engine::new();
    let initial = engine.handle_bytes(&request("GET", "/api/workspace", b""));
    assert_eq!(initial.status, 200);
    assert_eq!(initial.content_type, "application/json");

    let added = engine.handle_bytes(&request("POST", "/api/devices?model=PC-PT&x=700&y=450", b""));
    assert!(String::from_utf8(added.body).unwrap().contains("\"name\":\"PC3\""));

    let imported = Engine::new().handle_bytes(&request(
        "POST",
        "/api/import?openAnyway=true",
        br#"<takuminet version="1"><device id="pc9" kind="pc" model="PC-PT" x="1" y="2" name="PC9" ip="192.168.1.9" prefix="24"/></takuminet>"#,
    ));
    assert!(String::from_utf8(imported.body).unwrap().contains("\"id\":\"pc9\""));

    let malformed = engine.handle_bytes(&[255, 255]);
    assert_eq!(malformed.status, 400);
}

#[test]
fn release_wasm_is_valid_and_within_the_three_megabyte_budget() {
    let bytes = std::fs::read(concat!(env!("CARGO_MANIFEST_DIR"), "/web/engine.wasm")).unwrap();
    assert!(bytes.starts_with(b"\0asm"));
    assert!(bytes.len() <= 3_000_000, "engine.wasm is {} bytes", bytes.len());
}

#[test]
fn raw_engine_instances_and_embedded_templates_are_independent() {
    let a = Engine::new();
    let b = Engine::new();
    a.handle_bytes(&request("POST", "/api/new", b""));
    a.handle_bytes(&request("POST", "/api/devices?model=PC-PT&x=10&y=20", b""));
    let other = b.handle_bytes(&request("GET", "/api/workspace", b""));
    assert_eq!(String::from_utf8(other.body).unwrap().matches("\"id\":\"").count(), 7);

    for id in ["t1", "t2", "t3", "t4", "t5"] {
        let opened = Engine::new().handle_bytes(&request("POST", &format!("/api/templates/open?id={id}"), b""));
        assert_eq!(opened.status, 200, "{id}");
        assert!(!String::from_utf8(opened.body).unwrap().contains("\"error\""), "{id}");
    }
}
