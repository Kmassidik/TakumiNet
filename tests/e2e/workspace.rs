use super::*;

#[test]
fn e2e_workspace_editing_and_simulation() {
    let s = spawn(38_171);

    // UI shell (the workspace; "/" is the landing page)
    let (status, head, body) = s.get("/workspace");
    assert_eq!(status, 200);
    assert!(head.contains("text/html"), "{head}");
    assert!(body.contains("Simulation Panel"), "ui shell missing");

    // static assets for the front end
    for chunk in body.split("<script src=\"").skip(1) {
        let src = chunk.split('"').next().unwrap_or("");
        let (status, head, _) = s.get(src);
        assert_eq!(status, 200, "{src}");
        assert!(head.contains("javascript"), "{src}: {head}");
    }

    // generated UI sounds
    for name in ["devicePlacement", "errorMsg", "popUp", "removeLink"] {
        let (status, head, _) = s.get(&format!("/sounds/{name}.wav"));
        assert_eq!(status, 200, "{name}");
        assert!(head.contains("audio/wav"), "{name}: {head}");
    }

    // our own 3D icons; anything outside group/name.webp is refused
    let (status, head, body) = s.get("/art3d/toolbar/new.webp");
    assert_eq!(status, 200);
    assert!(head.contains("image/webp"), "{head}");
    assert!(body.starts_with("RIFF"), "not a webp");
    let (_, _, body) = s.get("/art3d/..%2f..%2fCargo.toml");
    assert!(body.contains("not found"), "{body}");

    // initial topology
    let (status, _, body) = s.get("/api/workspace");
    assert_eq!(status, 200);
    assert_eq!(count(&body, "\"id\":\""), 7, "{body}");
    assert_eq!(count(&body, "\"aPort\":"), 6, "{body}");

    // add a device
    let (_, _, body) = s.post("/api/devices?model=PC-PT&x=700&y=450");
    assert_eq!(count(&body, "\"id\":\""), 8);
    assert!(body.contains("\"name\":\"PC3\""), "{body}");

    // undo restores
    let (_, _, body) = s.post("/api/undo");
    assert_eq!(count(&body, "\"id\":\""), 7);
    let (_, _, body) = s.post("/api/redo");
    assert_eq!(count(&body, "\"id\":\""), 8);

    // link the new device to a switch
    let (_, _, body) = s.post("/api/links?a=pc3&b=switch1");
    assert_eq!(count(&body, "\"aPort\":"), 7, "{body}");
    assert!(body.contains("\"aPort\":\"Fa0\""), "{body}");

    // Duplicate host links are rejected; parallel switch links use new ports.
    let (_, _, body) = s.post("/api/links?a=switch1&b=pc3");
    assert!(body.contains("already linked"), "{body}");

    // PDU follows the graph and records an event
    let (_, _, body) = s.post("/api/pdu?src=pc3&dst=pc2");
    assert!(body.contains("\"proto\":\"ICMP\""), "{body}");
    assert!(body.contains("\"at\":\"PC2\""), "{body}");

    // filters / reset
    let (_, _, body) = s.post("/api/sim/reset");
    assert!(body.contains("\"events\":[]"), "{body}");

    // delete the extra device, then restore the demo state
    let (_, _, body) = s.post("/api/devices/delete?id=pc3");
    assert_eq!(count(&body, "\"id\":\""), 7);
    let (_, _, body) = s.post("/api/reset");
    assert_eq!(count(&body, "\"id\":\""), 7);
}

#[test]
fn e2e_full_mesh() {
    let s = spawn(38_173);

    // three fresh workstations on top of the demo topology
    for (n, (x, y)) in [(700, 300), (760, 360), (820, 420)].into_iter().enumerate() {
        let (status, _, body) = s.post(&format!("/api/devices?model=PC-PT&x={x}&y={y}"));
        assert_eq!(status, 200, "{body}");
        assert_eq!(count(&body, "\"id\":\""), 8 + n, "{body}");
    }

    // full mesh over the three new devices: three unordered pairs
    let (status, _, body) = s.post("/api/mesh?ids=pc3,pc4,pc5");
    assert_eq!(status, 200, "{body}");
    // the demo keeps its six links, so exactly three new ones show up
    assert_eq!(count(&body, "\"aPort\":"), 6 + 3, "{body}");
    for id in ["pc3", "pc4", "pc5"] {
        assert!(body.contains(&format!("\"id\":\"{id}\"")), "missing {id}: {body}");
        // being an endpoint of exactly two links is what full mesh means
        let degree = count(&body, &format!("\"a\":\"{id}\""))
            + count(&body, &format!("\"b\":\"{id}\""));
        assert_eq!(degree, 2, "{id} is not fully meshed: {body}");
    }

    // meshing the same set again is idempotent: no extra links
    let (status, _, body) = s.post("/api/mesh?ids=pc3,pc4,pc5");
    assert_eq!(status, 200, "{body}");
    assert_eq!(count(&body, "\"aPort\":"), 9, "{body}");
    assert_eq!(count(&body, "\"id\":\""), 10, "{body}");

    // fewer than two known ids is refused and leaves the workspace alone
    let (_, _, body) = s.post("/api/mesh?ids=pc3,nope");
    assert!(body.contains("\"error\""), "{body}");
    let (_, _, body) = s.get("/api/workspace");
    assert_eq!(count(&body, "\"aPort\":"), 9, "{body}");

    // reset restores the demo topology
    let (status, _, body) = s.post("/api/reset");
    assert_eq!(status, 200, "{body}");
    assert_eq!(count(&body, "\"id\":\""), 7, "{body}");
    assert_eq!(count(&body, "\"aPort\":"), 6, "{body}");
}

#[test]
fn e2e_bus_and_ip_config() {
    let s = spawn(38_174);

    // start from the demo, then build a bus — it replaces the pristine demo
    let (_, _, body) = s.post("/api/reset");
    assert_eq!(count(&body, "\"id\":\""), 7);

    let (status, _, body) = s.post("/api/bus?count=4");
    assert_eq!(status, 200);
    assert_eq!(count(&body, "\"id\":\""), 5, "{body}"); // hub + 4 stations
    assert_eq!(count(&body, "\"aPort\":"), 4, "{body}");
    assert_eq!(count(&body, "\"ip\":\"192.168.1."), 4, "{body}");

    // same subnet: the PDU is delivered
    let (_, _, body) = s.post("/api/pdu?src=pc0&dst=pc1");
    assert!(body.contains("\"at\":\"PC1\""), "{body}");

    // re-address one host onto another subnet: the PDU must refuse
    let (_, _, body) = s.post("/api/devices/ip?id=pc1&ip=10.0.0.5&prefix=24");
    assert!(body.contains("\"ip\":\"10.0.0.5\""), "{body}");
    let (_, _, body) = s.post("/api/pdu?src=pc0&dst=pc1");
    assert!(body.contains("no route to 10.0.0.5"), "{body}");

    // invalid input is rejected, not stored
    let (_, _, body) = s.post("/api/devices/ip?id=pc0&ip=999.1.1.1&prefix=24");
    assert!(body.contains("invalid IP address"), "{body}");

    // The retained drop is a mutation too: undo it, then restore the address.
    s.post("/api/undo");
    let (_, _, body) = s.post("/api/undo");
    assert!(body.contains("\"ip\":\"192.168.1.11\""), "{body}");

    // and a reset goes back to the demo
    let (_, _, body) = s.post("/api/reset");
    assert_eq!(count(&body, "\"id\":\""), 7);
}

#[test]
fn e2e_static_ip_configuration_fields() {
    let s = spawn(38_175);
    s.post("/api/reset");

    // full static configuration, as in Desktop -> IP Configuration
    let (_, _, body) = s.post(
        "/api/devices/ip?id=pc0&ip=192.168.1.10&mask=255.255.255.0&gateway=192.168.1.1&dns=8.8.8.8",
    );
    assert!(body.contains("\"gateway\":\"192.168.1.1\""), "{body}");
    assert!(body.contains("\"dns\":\"8.8.8.8\""), "{body}");
    assert!(body.contains("\"prefix\":24"), "{body}");

    // dotted mask is honoured, /25 is a different subnet
    let (_, _, body) = s.post("/api/devices/ip?id=pc1&ip=192.168.1.200&mask=255.255.255.128");
    assert!(body.contains("\"prefix\":25"), "{body}");

    // non-contiguous masks and bad addresses are rejected
    let (_, _, body) = s.post("/api/devices/ip?id=pc0&ip=192.168.1.10&mask=255.0.255.0");
    assert!(body.contains("invalid subnet mask"), "{body}");
    let (_, _, body) = s.post("/api/devices/ip?id=pc0&ip=192.168.1.10&mask=24&gateway=9.9.9");
    assert!(body.contains("invalid default gateway"), "{body}");

    // a /24 and a /25 host: pc0 still sees .200 as on-link and reaches it
    // directly, while pc1's /25 excludes pc0 and it has no gateway
    let (_, _, body) = s.post("/api/pdu?src=pc0&dst=pc1");
    assert!(body.contains("\"at\":\"PC1\""), "{body}");
    let (_, _, body) = s.post("/api/pdu?src=pc1&dst=pc0");
    assert!(body.contains("no route to 192.168.1.10"), "{body}");
}

#[test]
fn e2e_ipv6_section() {
    let s = spawn(38_176);
    s.post("/api/reset");

    let (status, _, body) = s.post(
        "/api/devices/ipv6?id=pc0&auto=0&addr=2001:db8::1&prefix=64&gateway=2001:db8::ff&dns=2001:db8::53",
    );
    assert_eq!(status, 200);
    assert!(body.contains("\"ipv6\":\"2001:db8::1\""), "{body}");
    assert!(body.contains("\"ipv6Prefix\":64"), "{body}");
    assert!(body.contains("\"ipv6Gateway\":\"2001:db8::ff\""), "{body}");
    assert!(body.contains("\"ipv6Dns\":\"2001:db8::53\""), "{body}");

    let (_, _, body) = s.post("/api/devices/ipv6?id=pc0&addr=192.168.1.1&prefix=64");
    assert!(body.contains("invalid IPv6 address"), "{body}");
}

#[test]
fn e2e_console_cable_drives_the_terminal() {
    let s = spawn(38_177);
    s.post("/api/reset");

    // no console cable yet
    let (_, _, body) = s.post("/api/console?id=pc0");
    assert!(body.contains("\"error\""), "{body}");

    // two network devices cannot be joined by one
    let (_, _, body) = s.post("/api/links?kind=eConsole&a=switch0&b=switch1");
    assert!(body.contains("console cable joins a PC"), "{body}");

    // a PC to a router works, and the peer is reported
    let (_, _, body) = s.post("/api/links?kind=eConsole&a=pc0&b=router0");
    assert!(!body.contains("\"error\""), "{body}");
    let (_, _, body) = s.post("/api/console?id=pc0");
    assert!(body.contains("\"peer\":\"router0\""), "{body}");
    let (_, _, body) = s.post("/api/console?id=router0");
    assert!(body.contains("\"error\""), "{body}");

    // the session behind it is the router's CLI
    let (_, _, body) = s.post("/api/cli?id=router0&line=en");
    assert!(body.contains("\"prompt\":\"Router0#\""), "{body}");

    // and the cable is out of band: the data path is unchanged
    let (_, _, body) = s.post("/api/pdu?src=pc0&dst=pc2");
    assert!(body.contains("\"at\":\"PC2\""), "{body}");
    let (_, _, body) = s.get("/api/workspace");
    assert_eq!(count(&body, "\"kind\":\"eConsole\""), 1, "{body}");
}

#[test]
fn e2e_power_switch_cuts_traffic() {
    let s = spawn(38_190);
    s.post("/api/reset");

    // Powered off, the host drops every frame aimed at it.
    let (status, _, _) = s.post("/api/devices/power?id=pc1&on=0");
    assert_eq!(status, 200);
    let (_, _, body) = s.get("/api/workspace");
    assert_eq!(count(&body, "\"powered\":false"), 1, "{body}");
    assert!(body.contains("\"powered\":false"), "{body}");

    let (_, _, body) = s.post("/api/cmd?id=pc0&line=ping%20192.168.1.11");
    assert!(
        body.contains("unreachable") || body.contains("Request timed out"),
        "{body}"
    );

    // Powering it back on restores the replies.
    let (status, _, _) = s.post("/api/devices/power?id=pc1&on=1");
    assert_eq!(status, 200);
    let (_, _, body) = s.post("/api/cmd?id=pc0&line=ping%20192.168.1.11");
    assert!(body.contains("Reply from 192.168.1.11"), "{body}");
    assert!(body.contains("Received = 4"), "{body}");
    let (_, _, body) = s.get("/api/workspace");
    assert_eq!(count(&body, "\"powered\":false"), 0, "{body}");
}

#[test]
fn e2e_router_module_insert_and_remove() {
    let s = spawn(38_191);
    s.post("/api/reset");

    // Slot 0 takes an HWIC-2T and exposes its two serial ports.
    let (status, _, body) = s.post("/api/devices/module?id=router0&slot=0&model=HWIC-2T");
    assert_eq!(status, 200, "{body}");
    assert!(body.contains("\"slots\":[\"HWIC-2T\""), "{body}");

    let (status, _, body) = s.get("/api/devices/ports?id=router0");
    assert_eq!(status, 200);
    assert!(body.contains("\"Serial0/3/0\""), "{body}");
    assert!(body.contains("\"Serial0/3/1\""), "{body}");

    // An empty model pulls the module back out.
    let (status, _, body) = s.post("/api/devices/module?id=router0&slot=0&model=");
    assert_eq!(status, 200, "{body}");
    assert!(!body.contains("HWIC-2T"), "{body}");
    let (_, _, body) = s.get("/api/devices/ports?id=router0");
    assert!(!body.contains("\"Serial0/3/0\""), "{body}");
}

#[test]
fn e2e_cable_kinds_are_media_checked() {
    let s = spawn(38_193);
    s.post("/api/reset");

    // Fiber joins switches and routers, never two workstations.
    let (_, _, body) = s.post("/api/links?kind=eFiber&a=pc0&b=pc1");
    assert!(body.contains("\"error\""), "{body}");
    assert!(body.contains("fiber cable"), "{body}");
    let (_, _, body) = s.post("/api/links?kind=eFiber&a=switch0&b=switch1");
    assert!(!body.contains("\"error\""), "{body}");

    // A second router gives the serial cable two serial endpoints.
    let (status, _, body) = s.post("/api/devices?model=2911&x=700&y=150");
    assert_eq!(status, 200, "{body}");
    assert!(body.contains("\"id\":\"router1\""), "{body}");
    let (status, _, body) = s.post("/api/links?kind=eSerial&a=router0&b=router1");
    assert_eq!(status, 200, "{body}");
    assert!(!body.contains("\"error\""), "{body}");
    assert!(body.contains("\"kind\":\"eSerial\""), "{body}");
    assert!(body.contains("\"aPort\":\"Serial"), "{body}");
}

#[test]
fn e2e_cli_completion_follows_the_session_mode() {
    let s = spawn(38_213);
    s.post("/api/reset");

    // `en` turns on privileged mode; user mode only completes enable/help/ping.
    let (status, _, body) = s.post("/api/cli?id=router0&line=en");
    assert_eq!(status, 200, "{body}");
    assert!(body.contains("Router0#"), "{body}");

    let (status, _, body) = s.post("/api/complete?id=router0&line=show%20ip");
    assert_eq!(status, 200, "{body}");
    assert!(
        body.contains("\"candidates\":[\"show ip bgp\",\"show ip interface brief\",\"show ip route\"]"),
        "{body}"
    );

    let (status, _, body) = s.post("/api/complete?id=router0&line=sh");
    assert_eq!(status, 200, "{body}");
    assert!(body.contains("show running-config"), "{body}");
}

#[test]
fn e2e_vlan_config_and_spanning_tree_blocking() {
    let s = spawn(38_223);
    s.post("/api/reset");

    for line in [
        "en",
        "conf%20t",
        "vlan%2020%20SALES",
        "int%20fa0%2F3",
        "switchport%20access%20vlan%2020",
        "end",
    ] {
        let (status, _, body) = s.post(&format!("/api/cli?id=switch0&line={line}"));
        assert_eq!(status, 200, "{line}: {body}");
        assert!(!body.contains("% Invalid"), "{line}: {body}");
        assert!(!body.contains("% Incomplete"), "{line}: {body}");
    }

    let (status, _, body) = s.post("/api/cli?id=switch0&line=show%20vlan%20brief");
    assert_eq!(status, 200, "{body}");
    assert!(body.contains("SALES"), "VLAN name missing from show vlan brief: {body}");

    // The CLI reply is JSON, so unescape its line breaks before reading rows.
    let text = body.replace("\\n", "\n");
    let sales_row = text.lines().find(|l| l.contains("SALES")).unwrap_or_default();
    assert!(sales_row.starts_with("20"), "{sales_row}");
    assert!(sales_row.contains("FastEthernet0/3"), "{sales_row}");
    assert!(!sales_row.contains("FastEthernet0/2 "), "{sales_row}");

    // A third switch wired to both existing switches closes a loop.
    let (status, _, body) = s.post("/api/devices?model=2960&x=760&y=120");
    assert_eq!(status, 200, "{body}");
    assert!(body.contains("\"id\":\"switch2\""), "{body}");
    for (a, b) in [("switch0", "switch1"), ("switch1", "switch2"), ("switch2", "switch0")] {
        let (status, _, body) = s.post(&format!("/api/links?a={a}&b={b}"));
        assert_eq!(status, 200, "{a}-{b}: {body}");
        assert!(!body.contains("\"error\""), "{a}-{b}: {body}");
    }
    let (_, _, body) = s.get("/api/workspace");
    assert_eq!(count(&body, "\"aPort\":"), 9, "loop links missing: {body}");

    // The loop must leave one port blocking somewhere in the triangle.
    let mut blocked = false;
    for sw in ["switch0", "switch1", "switch2"] {
        let (status, _, _) = s.post(&format!("/api/cli?id={sw}&line=en"));
        assert_eq!(status, 200);
        let (status, _, body) = s.post(&format!("/api/cli?id={sw}&line=show%20spanning-tree"));
        assert_eq!(status, 200, "{sw}: {body}");
        if body.contains("BLK") {
            blocked = true;
            assert!(body.contains("FWD"), "{sw} blocks every port: {body}");
        }
    }
    assert!(blocked, "no blocking port anywhere in the switch loop");
}

#[test]
fn e2e_explicit_link_ports_and_the_port_toggle() {
    let s = spawn(38_247);
    s.post("/api/reset");

    // The named ports win over the auto-pick, abbreviations included.
    let (status, _, body) = s.post("/api/links?a=switch0&b=switch1&kind=eCopper&aport=Fa0/10&bport=FastEthernet0/11");
    assert_eq!(status, 200, "{body}");
    assert!(body.contains("\"aPort\":\"FastEthernet0/10\""), "{body}");
    assert!(body.contains("\"bPort\":\"FastEthernet0/11\""), "{body}");

    // The ports listing names the far end, so the UI can grey used ports.
    let (_, _, body) = s.get("/api/devices/ports?id=switch0");
    assert!(
        body.contains("\"name\":\"FastEthernet0/10\",\"ip\":null,\"prefix\":24,\"up\":true,\"peer\":{\"id\":\"switch1\",\"name\":\"Switch1\",\"port\":\"FastEthernet0/11\"}"),
        "{body}"
    );

    // An occupied port refuses plainly and leaves the wiring unchanged.
    let (_, _, body) = s.post("/api/links?a=switch0&b=switch1&kind=eCopper&aport=Fa0/10");
    assert!(body.contains("FastEthernet0/10 is already connected"), "{body}");

    // A copper cable cannot land on a serial interface.
    let (_, _, body) = s.post("/api/links?a=router0&b=pc2&kind=eCopper&aport=Serial0/0/0");
    assert!(body.contains("this cable cannot plug into Serial0/0/0"), "{body}");

    // The toggle flips the admin state the listing reports.
    let (status, _, body) = s.post("/api/devices/port?id=switch0&port=FastEthernet0/10&up=0");
    assert_eq!(status, 200, "{body}");
    let (_, _, body) = s.get("/api/devices/ports?id=switch0");
    assert!(body.contains("\"name\":\"FastEthernet0/10\",\"ip\":null,\"prefix\":24,\"up\":false"), "{body}");
    let (_, _, body) = s.post("/api/devices/port?id=switch0&port=NoSuchPort&up=1");
    assert!(body.contains("no such interface"), "{body}");
}

#[test]
fn e2e_speed_and_duplex_controls_report_the_link_and_the_mismatch() {
    let s = spawn(38_261);
    s.post("/api/reset");
    let (_, _, body) = s.post("/api/links?a=switch0&b=switch1&kind=eCopper&aport=Fa0/10&bport=Fa0/11");
    assert!(!body.contains("error"), "{body}");

    let (_, _, body) = s.get("/api/devices/ports?id=switch0");
    assert!(body.contains("\"eth\":true,\"speed\":\"auto\",\"duplex\":\"auto\",\"link\":\"100 Mb/s, full duplex\",\"fault\":\"\""), "{body}");

    let (status, _, body) = s.post("/api/devices/linkspeed?id=switch0&port=FastEthernet0/10&speed=100&duplex=full");
    assert_eq!(status, 200, "{body}");
    let (_, _, body) = s.get("/api/devices/ports?id=switch0");
    assert!(body.contains("\"speed\":\"100\",\"duplex\":\"full\"") && body.contains("\"fault\":\"duplex\""), "{body}");

    let (_, _, body) = s.post("/api/devices/linkspeed?id=switch1&port=FastEthernet0/11&speed=10&duplex=full");
    assert!(!body.contains("error"), "{body}");
    let (_, _, body) = s.get("/api/devices/ports?id=switch0");
    assert!(body.contains("\"link\":\"no link\",\"fault\":\"speed\""), "{body}");

    let (_, _, body) = s.post("/api/devices/linkspeed?id=switch0&port=FastEthernet0/10&speed=1000&duplex=auto");
    assert!(body.contains("cannot run at 1000"), "{body}");
    let (_, _, body) = s.post("/api/devices/linkspeed?id=switch0&port=FastEthernet0/10&speed=fast&duplex=auto");
    assert!(body.contains("speed must be"), "{body}");
    let (_, _, body) = s.post("/api/devices/linkspeed?id=switch0&port=FastEthernet0/10&speed=100&duplex=sideways");
    assert!(body.contains("duplex must be"), "{body}");
    let (_, _, body) = s.post("/api/devices/linkspeed?id=switch0&port=NoSuchPort&speed=auto&duplex=auto");
    assert!(body.contains("no such interface"), "{body}");
}

#[test]
fn e2e_poe_status_and_switch_over_http() {
    let s = spawn(38_271);
    s.post("/api/reset");
    let (_, _, body) = s.get("/api/devices/poe?id=pc0");
    assert!(body.contains("\"capable\":false"), "{body}");
    let (_, _, body) = s.post("/api/devices/poe?id=pc0&on=1");
    assert!(body.contains("cannot take power"), "{body}");
    let (_, _, body) = s.get("/api/devices/poe?id=nobody");
    assert!(body.contains("no such device"), "{body}");
}

