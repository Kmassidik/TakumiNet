use super::*;

#[test]
fn e2e_save_and_load_round_trips_configuration() {
    let s = spawn(38_194);
    s.post("/api/reset");

    for line in [
        "en",
        "conf%20t",
        "banner%20motd%20%23authorised%20access%20only%23",
        "line%20con%200",
        "password%20lab",
        "end",
    ] {
        let (status, _, body) = s.post(&format!("/api/cli?id=router0&line={line}"));
        assert_eq!(status, 200, "{body}");
        assert!(!body.contains("\"error\""), "{line}: {body}");
    }

    let (status, _, _) = s.post("/api/save?name=e2e");
    assert_eq!(status, 200);
    let saved = std::fs::read_to_string(repo_root().join("topologies/e2e.xml")).unwrap();
    assert!(saved.starts_with("<takumi version=\"1\">"));
    let (_, _, saves) = s.get("/api/saves");
    assert!(saves.contains("\"e2e\""), "{saves}");
    let (status, _, _) = s.post("/api/reset");
    assert_eq!(status, 200);

    // The reset wiped the config; loading the save brings it back.
    let (status, _, _) = s.post("/api/load?name=e2e");
    assert_eq!(status, 200);
    let (status, _, body) = s.post("/api/cli?id=router0&line=show%20run");
    assert_eq!(status, 200);
    assert!(body.contains("banner motd ^authorised access only^"), "{body}");
    assert!(body.contains("password lab"), "{body}");
}

#[test]
fn l22_exported_text_import_restores_identical_http_workspace() {
    let s = spawn(38_226);
    s.post("/api/reset");
    let (_, _, before) = s.get("/api/workspace");
    let (status, head, exported) = s.get_raw("/api/export");
    assert_eq!(status, 200);
    assert!(head.contains("application/xml"), "{head}");
    let text = String::from_utf8(exported).unwrap();
    assert!(text.starts_with("<takumi version=\"1\">"));
    s.post("/api/devices/delete?id=pc0");
    let (status, _, imported) = s.post_body("/api/import", text.as_bytes());
    assert_eq!(status, 200, "{imported}");
    assert!(!imported.contains("\"error\""), "{imported}");
    let (_, _, after) = s.get("/api/workspace");
    assert_eq!(after, before, "GET workspace must match after exported-text import");
    let (_, _, again) = s.get_raw("/api/export");
    assert_eq!(again, text.as_bytes());
}

#[test]
fn l23_invalid_http_import_never_changes_the_workspace() {
    let s = spawn(38_227);
    s.post("/api/reset");
    s.post("/api/devices?model=PC-PT&x=700&y=450");
    let (_, _, before) = s.get("/api/workspace");

    for invalid in [
        &b"<takumi version=\"1\"><device id=\"pc9\" kind=\"pc\">"[..],
        &b"<takumi version=\"1\"><device id=\"pc0\" kind=\"pc\"/><device id=\"pc0\" kind=\"pc\"/></takumi>"[..],
        &[0xff, 0xfe, 0x00, 0x9c][..],
    ] {
        let (_, _, response) = s.post_body("/api/import", invalid);
        assert!(response.contains("\"error\""), "{response}");
        let (_, _, after) = s.get("/api/workspace");
        assert_eq!(after, before, "invalid import partially changed workspace");
    }
}

#[test]
fn e2e_lesson_templates_blank_new_and_checks() {
    struct Fixture(std::path::PathBuf);
    impl Drop for Fixture {
        fn drop(&mut self) { let _ = std::fs::remove_file(&self.0); }
    }

    let s = spawn(38_225);
    let (status, _, exported) = s.get("/api/export");
    assert_eq!(status, 200);
    let lesson = "<lesson id=\"p1-e2e\" title=\"API lesson\" level=\"1\" minutes=\"5\" goal=\"Ping a peer\"/><step n=\"2\" text=\"Check the result\"/><step n=\"1\" text=\"Ping PC1\"/><check id=\"c1\" kind=\"ping\" from=\"pc0\" to=\"pc1\" url=\"\" expect=\"ok\" label=\"PC0 reaches PC1\"/>";
    let template = exported.replace("</takumi>", &format!("{lesson}</takumi>"));
    let directory = repo_root().join("web/templates");
    std::fs::create_dir_all(&directory).unwrap();
    let path = directory.join("p1-e2e.xml");
    std::fs::write(&path, template).unwrap();
    let _fixture = Fixture(path);

    let (status, _, body) = s.get("/api/templates");
    assert_eq!(status, 200, "{body}");
    assert!(body.contains("\"lessons\":["), "{body}");
    assert!(body.contains("\"templates\":["), "{body}");
    assert!(body.contains("\"id\":\"p1-e2e\""), "{body}");
    assert!(body.contains("\"title\":\"API lesson\""), "{body}");
    assert!(body.contains("\"stepCount\":2"), "{body}");
    assert!(body.contains("\"id\":\"tpl-connect\""), "{body}");

    let (status, _, body) = s.post("/api/new");
    assert_eq!(status, 200, "{body}");
    assert!(body.contains("\"devices\":[]"), "{body}");
    assert!(body.contains("\"lesson\":null"), "{body}");

    let (status, _, body) = s.post("/api/templates/open?id=p1-e2e");
    assert_eq!(status, 200, "{body}");
    assert!(body.contains("\"title\":\"API lesson\""), "{body}");
    assert!(body.find("\"n\":1").unwrap() < body.find("\"n\":2").unwrap(), "steps sorted: {body}");
    assert!(!body.contains("\"proto\":\"ICMP\""), "template opens pristine: {body}");

    let (status, _, body) = s.get("/api/checks");
    assert_eq!(status, 200, "{body}");
    assert!(body.contains("\"allPassed\":true"), "{body}");
    assert!(body.contains("\"id\":\"c1\",\"label\":\"PC0 reaches PC1\",\"passed\":true"), "{body}");
    let (_, _, workspace) = s.get("/api/workspace");
    assert!(workspace.contains("\"proto\":\"ICMP\""), "checks refresh real captures: {workspace}");

    let (_, _, first) = s.get("/api/export");
    s.post("/api/templates/open?id=p1-e2e");
    let (_, _, second) = s.get("/api/export");
    assert_eq!(first, second, "opening the same template twice is deterministic");

    let (_, _, body) = s.post("/api/templates/open?id=..%2fp1-e2e");
    assert!(body.contains("invalid template id"), "{body}");
    let (_, _, body) = s.post("/api/templates/open?id=missing");
    assert!(body.contains("no such template"), "{body}");
}

#[test]
fn e2e_capture_bytes_and_pcap_export_reparse_real_frames() {
    let s = spawn(39_431);
    let (status, _, body) = s.post("/api/pdu?src=pc0&dst=pc2");
    assert_eq!(status, 200, "{body}");
    assert!(!body.contains("\"error\""), "{body}");
    let (_, _, workspace) = s.get("/api/workspace");
    let icmp = workspace.rfind("\"proto\":\"ICMP\"").expect("ICMP capture");
    let prefix = &workspace[..icmp];
    let id_at = prefix.rfind("\"id\":").expect("event id") + 5;
    let id_end = workspace[id_at..].find(',').expect("id delimiter") + id_at;
    let id: u32 = workspace[id_at..id_end].parse().expect("numeric event id");

    let (status, _, bytes) = s.get(&format!("/api/capture/bytes?id={id}"));
    assert_eq!(status, 200);
    assert!(bytes.contains("\"length\":74"), "{bytes}");
    assert!(bytes.contains("\"hex\":\""), "{bytes}");
    assert!(!bytes.contains("error"), "{bytes}");

    let (status, head, pcap) = s.get_raw("/api/capture/export");
    assert_eq!(status, 200, "{head}");
    assert!(head.contains("application/vnd.tcpdump.pcap"), "{head}");
    assert_eq!(&pcap[..4], &[0xd4, 0xc3, 0xb2, 0xa1]);
    assert_eq!(u32::from_le_bytes(pcap[20..24].try_into().unwrap()), 1);
    let mut at = 24;
    let mut records = Vec::new();
    while at < pcap.len() {
        let captured = u32::from_le_bytes(pcap[at + 8..at + 12].try_into().unwrap()) as usize;
        let original = u32::from_le_bytes(pcap[at + 12..at + 16].try_into().unwrap()) as usize;
        assert_eq!(captured, original);
        at += 16;
        assert!(at + captured <= pcap.len(), "truncated pcap record");
        records.push(pcap[at..at + captured].to_vec());
        at += captured;
    }
    assert_eq!(records.len(), 3, "two ARP frames and one ICMP frame");
    assert_eq!(&records[0][12..14], &[0x08, 0x06]);
    assert_eq!(&records[1][12..14], &[0x08, 0x06]);
    assert_eq!(&records[2][12..14], &[0x08, 0x00]);
    assert_eq!(records[2].len(), 74);
    let hex = records[2].iter().map(|byte| format!("{byte:02x}")).collect::<String>();
    assert!(bytes.contains(&hex), "bytes endpoint and pcap contain different ICMP wire frames");
}

#[test]
fn e2e_missing_or_refused_static_files_are_404() {
    let s = spawn(38_241);
    for path in [
        "/js/modal.js",
        "/js/../index.html",
        "/art3d/toolbar/missing.webp",
        "/art3d/..%2f..%2fCargo.toml",
        "/sounds/none.wav",
    ] {
        let (status, _, _) = s.get(path);
        assert_eq!(status, 404, "{path} must be a 404, not a 200");
    }
}

#[test]
fn e2e_notes_add_edit_move_and_delete_over_http() {
    let s = spawn(38_242);
    let (status, _, body) = s.post("/api/notes/add?x=40&y=50&color=%23c8f7c5&text=Read%20me%20first");
    assert_eq!(status, 200, "{body}");
    assert!(body.contains("\"text\":\"Read me first\""), "{body}");
    let id = body.split("\"notes\":[{\"id\":\"").nth(1).and_then(|rest| rest.split('"').next()).unwrap().to_string();

    let (_, _, body) = s.post(&format!("/api/notes/edit?id={id}&text=Changed&color=%23fff3b0"));
    assert!(body.contains("\"text\":\"Changed\""), "{body}");
    let (_, _, body) = s.post(&format!("/api/notes/move?id={id}&x=120&y=60"));
    assert!(body.contains("\"x\":120"), "{body}");
    let (_, _, body) = s.post(&format!("/api/notes/delete?id={id}"));
    assert!(!body.contains("\"text\":\"Changed\""), "{body}");
    let (_, _, body) = s.post("/api/notes/add?x=1&y=1&text=%20%20");
    assert!(body.contains("error"), "blank note must be refused: {body}");
}

#[test]
fn e2e_xml_is_the_file_type_and_old_tnet_files_still_open() {
    struct Fixture(std::path::PathBuf);
    impl Drop for Fixture {
        fn drop(&mut self) { let _ = std::fs::remove_file(&self.0); }
    }

    let s = spawn(38_243);
    let (status, head, exported) = s.get("/api/export");
    assert_eq!(status, 200);
    assert!(head.contains("application/xml"), "{head}");
    assert!(exported.starts_with("<takumi "), "{exported}");

    // New saves are .xml and never .tnet.
    let xml = repo_root().join("topologies/fresh-e2e.xml");
    let _xml_fixture = Fixture(xml.clone());
    let _tnet_fixture = Fixture(repo_root().join("topologies/fresh-e2e.tnet"));
    assert_eq!(s.post("/api/save?name=fresh-e2e").0, 200);
    assert!(xml.exists(), "save must write .xml");
    assert!(!repo_root().join("topologies/fresh-e2e.tnet").exists(), "save must not write .tnet");

    // A .tnet file from an earlier version is listed once and opens.
    let legacy = repo_root().join("topologies/legacy-e2e.tnet");
    std::fs::write(&legacy, &exported).unwrap();
    let _legacy_fixture = Fixture(legacy);
    let (_, _, saves) = s.get("/api/saves");
    assert_eq!(saves.matches("\"legacy-e2e\"").count(), 1, "{saves}");
    assert_eq!(saves.matches("\"fresh-e2e\"").count(), 1, "{saves}");
    let (status, _, loaded) = s.post("/api/load?name=legacy-e2e");
    assert_eq!(status, 200);
    assert!(!loaded.contains("\"error\""), "{loaded}");
    let (_, _, missing) = s.post("/api/load?name=no-such-e2e");
    assert!(missing.contains("no such topology"), "{missing}");

    // Any other XML is refused with a clear message and changes nothing.
    for (body, expect) in [
        ("<other version=\"1\"></other>", "takumi"),
        ("<takumi version=\"1\"", ""),
        ("", ""),
        ("not xml at all", ""),
    ] {
        let (status, _, reply) = s.post_body("/api/import", body.as_bytes());
        assert_eq!(status, 200);
        assert!(reply.contains("\"error\""), "{body:?} -> {reply}");
        assert!(expect.is_empty() || reply.contains(expect), "{body:?} -> {reply}");
    }
}

#[test]
fn e2e_play_on_a_template_sends_its_built_in_traffic_over_http() {
    let s = spawn(38_244);
    for id in ["tpl-connect", "tpl-star", "tpl-home", "tpl-routed", "tpl-web"] {
        let (_, _, opened) = s.post(&format!("/api/templates/open?id={id}"));
        assert!(opened.contains("\"hasDemo\":true"), "{id}: {opened}");
        assert!(opened.contains("\"events\":[]"), "{id} opens quiet");
        let (status, _, played) = s.post("/api/demo");
        assert_eq!(status, 200);
        assert!(!played.contains("\"error\""), "{id}: {played}");
        assert!(!played.contains("\"events\":[]"), "{id} must capture events: {played}");
    }

    // A lesson and a blank workspace have none, and say so.
    s.post("/api/templates/open?id=t1");
    let (_, _, none) = s.post("/api/demo");
    assert!(none.contains("no built-in traffic"), "{none}");
    s.post("/api/new");
    let (_, _, blank) = s.post("/api/demo");
    assert!(blank.contains("no built-in traffic"), "{blank}");
}
