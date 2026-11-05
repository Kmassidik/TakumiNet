use super::*;

#[test]
fn e2e_wireless_route_reports_channel_bands_and_overlaps() {
    let s = spawn(38_283);
    s.post("/api/reset");
    s.post("/api/devices?model=Access%20Point&x=100&y=100");
    s.post("/api/devices?model=Access%20Point&x=400&y=100");
    s.post("/api/devices/wireless?id=ap0&channel=1&band=2.4");
    s.post("/api/devices/wireless?id=ap1&channel=3&band=2.4");
    let (status, _, body) = s.get("/api/devices/wireless");
    assert_eq!(status, 200, "{body}");
    assert!(body.contains("\"channel\":1"), "{body}");
    assert!(body.contains("\"band\":\"2.4\""), "{body}");
    assert!(body.contains("\"overlaps_with\""), "{body}");
    s.post("/api/devices/wireless?id=ap1&channel=6&band=2.4");
    let (_, _, body) = s.get("/api/devices/wireless");
    assert!(!body.contains("\"overlaps_with\":[\"AccessPoint0\"]"), "{body}");
}

#[test]
fn e2e_hub_ports_expose_the_collision_counter() {
    let s = spawn(38_284);
    s.post("/api/reset");
    s.post("/api/devices?model=Hub&x=100&y=100");
    let (status, _, body) = s.get("/api/devices/ports?id=hub0");
    assert_eq!(status, 200, "{body}");
    assert!(body.contains("\"collisions\":0"), "{body}");
}

#[test]
fn e2e_ping6_reaches_a_host_on_the_same_segment() {
    let s = spawn(38_285);
    s.post("/api/reset");
    s.post("/api/devices?model=PC&x=200&y=100");
    s.post("/api/devices?model=PC&x=500&y=100");
    s.post("/api/links?a=pc3&b=pc4&kind=eCopper");
    s.post("/api/devices/ipv6?id=pc3&auto=0&addr=2001:db8::1&prefix=64");
    s.post("/api/devices/ipv6?id=pc4&auto=0&addr=2001:db8::2&prefix=64");
    let (status, _, body) = s.post("/api/cmd?id=pc3&line=ping6%202001:db8::2");
    assert_eq!(status, 200, "{body}");
    assert!(body.contains("Reply from 2001:db8::2"), "{body}");
}
