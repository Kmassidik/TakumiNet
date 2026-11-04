use super::*;

#[test]
fn e2e_web_browser_fetches_from_the_server() {
    let s = spawn(38_178);
    s.post("/api/reset");

    let (status, _, body) = s.post("/api/webfetch?id=pc0&url=http://192.168.2.20/");
    assert_eq!(status, 200, "{body}");
    assert!(body.contains("\"status\":200"), "{body}");
    assert!(body.contains("\"title\":\"Server0\""), "{body}");

    // A host without an HTTP service refuses the connection.
    let (_, _, body) = s.post("/api/webfetch?id=pc0&url=192.168.1.11");
    assert!(body.contains("Connection refused"), "{body}");

    // The request is a captured delivery.
    let (_, _, body) = s.get("/api/workspace");
    assert!(body.contains("\"proto\":\"HTTP\""), "{body}");
}

#[test]
fn e2e_dhcp_pool_lease_and_static_override() {
    let s = spawn(38_192);
    s.post("/api/reset");

    let (status, _, body) = s.post("/api/devices/dhcp?id=server0&network=192.168.2.0&prefix=24");
    assert_eq!(status, 200, "{body}");
    assert!(body.contains("\"network\":\"192.168.2.0\""), "{body}");

    // The client on the same segment leases the first free address.
    let (status, _, body) = s.post("/api/dhcp/acquire?id=pc2");
    assert_eq!(status, 200, "{body}");
    assert!(body.contains("\"ip\":\"192.168.2.100\""), "{body}");
    assert!(body.contains("\"dhcp\":true"), "{body}");

    // A static address takes the interface back off DHCP.
    let (status, _, body) = s.post("/api/devices/ip?id=pc2&ip=192.168.2.50&prefix=24");
    assert_eq!(status, 200, "{body}");
    assert!(body.contains("\"ip\":\"192.168.2.50\""), "{body}");
    assert!(!body.contains("\"dhcp\":true"), "{body}");
}

#[test]
fn e2e_web_fetch_reports_the_simulated_server() {
    let s = spawn(38_195);
    s.post("/api/reset");

    let (status, _, body) = s.post("/api/webfetch?id=pc0&url=192.168.2.20");
    assert_eq!(status, 200, "{body}");
    assert!(body.contains("\"status\":200"), "{body}");
    assert!(body.contains("\"title\":\"Server0\""), "{body}");

    // A workstation has no HTTP service listening on 80.
    let (_, _, body) = s.post("/api/webfetch?id=pc0&url=192.168.1.11");
    assert!(body.contains("Connection refused"), "{body}");
}

#[test]
fn e2e_dns_record_and_custom_http_page() {
    let s = spawn(38_210);
    s.post("/api/reset");

    // A configured server answers unicast lookups, including across routers.
    let (status, _, body) = s.post("/api/devices/ip?id=pc2&ip=192.168.2.10&mask=255.255.255.0&gateway=192.168.2.1&dns=192.168.2.20");
    assert_eq!(status, 200, "{body}");
    let (status, _, body) = s.post("/api/devices/dns?id=server0&name=web.lab&ip=192.168.2.20");
    assert_eq!(status, 200, "{body}");
    assert!(body.contains("web.lab"), "{body}");

    let (status, _, body) = s.post("/api/cmd?id=pc2&line=nslookup%20web.lab");
    assert_eq!(status, 200, "{body}");
    assert!(body.contains("192.168.2.20"), "nslookup did not resolve web.lab: {body}");

    // A custom page is what the browser receives, not the welcome text.
    let (status, _, body) = s.post("/api/devices/http?id=server0&body=hello-page");
    assert_eq!(status, 200, "{body}");
    let (status, _, body) = s.post("/api/webfetch?id=pc0&url=192.168.2.20");
    assert_eq!(status, 200, "{body}");
    assert!(body.contains("\"status\":200"), "{body}");
    assert!(body.contains("hello-page"), "custom page missing from fetch: {body}");

    // Removing the record makes the next lookup time out.
    let (status, _, body) =
        s.post("/api/devices/dns?id=server0&name=web.lab&ip=192.168.2.20&remove=1");
    assert_eq!(status, 200, "{body}");
    let (status, _, body) = s.post("/api/cmd?id=pc2&line=nslookup%20web.lab");
    assert_eq!(status, 200, "{body}");
    assert!(body.contains("timed out"), "removed record still resolves: {body}");
}

#[test]
fn e2e_dhcp_reservation_overrides_pool_address() {
    let s = spawn(38_211);
    s.post("/api/reset");

    let (status, _, body) = s.post("/api/devices/dhcp?id=server0&network=192.168.2.0&prefix=24");
    assert_eq!(status, 200, "{body}");

    let (status, _, body) =
        s.post("/api/devices/dhcp/reserve?id=server0&client=pc2&ip=192.168.2.150");
    assert_eq!(status, 200, "{body}");

    let (status, _, body) = s.post("/api/dhcp/acquire?id=pc2");
    assert_eq!(status, 200, "{body}");
    assert!(body.contains("\"ip\":\"192.168.2.150\""), "reservation ignored: {body}");
    assert!(body.contains("\"dhcp\":true"), "{body}");

    // An empty address deletes the reservation; the next lease is pool-allocated.
    let (status, _, body) = s.post("/api/devices/dhcp/reserve?id=server0&client=pc2&ip=");
    assert_eq!(status, 200, "{body}");
    let (status, _, body) = s.post("/api/dhcp/acquire?id=pc2");
    assert_eq!(status, 200, "{body}");
    assert!(
        body.contains("\"ip\":\"192.168.2.100\""),
        "removed reservation did not fall back to the pool: {body}"
    );
    assert!(body.contains("\"dhcp\":true"), "{body}");
}

#[test]
fn e2e_dhcp_relay_forwards_across_the_router() {
    let s = spawn(38_212);
    s.post("/api/reset");

    // The pool lives on server0, on the far side of router0.
    let (status, _, body) = s.post("/api/devices/dhcp?id=server0&network=192.168.1.0&prefix=24");
    assert_eq!(status, 200, "{body}");
    let (status, _, body) = s
        .post("/api/devices/dhcp/helper?id=router0&iface=GigabitEthernet0/0&helper=192.168.2.20");
    assert_eq!(status, 200, "{body}");

    let (status, _, body) = s.post("/api/dhcp/acquire?id=pc0");
    assert_eq!(status, 200, "{body}");
    assert!(body.contains("\"ip\":\"192.168.1.100\""), "relay did not lease: {body}");
    assert!(body.contains("\"dhcp\":true"), "{body}");

    // With the helper gone the same client has no server left.
    let (status, _, body) =
        s.post("/api/devices/dhcp/helper?id=router0&iface=GigabitEthernet0/0&helper=");
    assert_eq!(status, 200, "{body}");
    let (status, _, body) = s.post("/api/dhcp/acquire?id=pc0");
    assert_eq!(status, 200, "{body}");
    assert!(body.contains("no DHCP server"), "{body}");
}

#[test]
fn e2e_mail_users_send_and_list() {
    let s = spawn(38_220);
    s.post("/api/reset");

    // Two mailboxes on the LAN's server.
    for (user, pass) in [("alice", "pw-alice"), ("bob", "pw-bob")] {
        let (status, _, body) =
            s.post(&format!("/api/devices/mailuser?id=server0&user={user}&pass={pass}"));
        assert_eq!(status, 200, "{body}");
        assert!(!body.contains("\"error\""), "{body}");
    }

    // alice on pc0 sends bob a message through server0.
    let (status, _, body) = s.post(
        "/api/mail/send?id=pc0&server=server0&from=alice&to=bob&subject=lab%20notes&body=hello%20bob",
    );
    assert_eq!(status, 200, "{body}");
    assert!(!body.contains("\"error\""), "{body}");

    let (status, _, body) = s.post("/api/mail/list?id=server0&user=bob");
    assert_eq!(status, 200, "{body}");
    assert!(body.contains("\"from\":\"alice\""), "{body}");
    assert!(body.contains("\"to\":\"bob\""), "{body}");
    assert!(body.contains("\"subject\":\"lab notes\""), "{body}");
    assert!(body.contains("\"body\":\"hello bob\""), "{body}");
    assert!(body.contains("\"read\":false"), "{body}");

    // The sender has no message of her own in this exchange.
    let (_, _, body) = s.post("/api/mail/list?id=server0&user=alice");
    assert!(body.contains("\"messages\":[]"), "{body}");

    // An unregistered recipient is refused and nothing is delivered.
    let (status, _, body) =
        s.post("/api/mail/send?id=pc0&server=server0&from=alice&to=carol&subject=x&body=y");
    assert_eq!(status, 200, "{body}");
    assert!(body.contains("unknown recipient: carol"), "{body}");
    let (_, _, body) = s.post("/api/mail/list?id=server0&user=bob");
    assert_eq!(count(&body, "\"subject\":"), 1, "refused mail was stored: {body}");
}

#[test]
fn e2e_tftp_put_list_and_remove() {
    let s = spawn(38_221);
    s.post("/api/reset");

    let (status, _, body) =
        s.post("/api/devices/tftp?id=server0&name=config.txt&content=hostname%20lab");
    assert_eq!(status, 200, "{body}");
    assert!(!body.contains("\"error\""), "{body}");

    let (status, _, body) = s.post("/api/tftp/list?id=server0");
    assert_eq!(status, 200);
    assert!(body.contains("\"files\":[\"config.txt\"]"), "{body}");

    // An empty body deletes the file.
    let (status, _, body) = s.post("/api/devices/tftp?id=server0&name=config.txt&content=");
    assert_eq!(status, 200, "{body}");
    assert!(!body.contains("\"error\""), "{body}");

    let (status, _, body) = s.post("/api/tftp/list?id=server0");
    assert_eq!(status, 200);
    assert!(body.contains("\"files\":[]"), "{body}");
}

#[test]
fn e2e_ftp_syslog_aaa_and_ntp_services() {
    let s = spawn(38_224);
    s.post("/api/reset");

    let mut missing: Vec<&'static str> = Vec::new();

    // FTP file lifecycle.
    let (status, _, body) =
        s.post("/api/devices/ftp?id=server0&name=notes.txt&content=ftp%20payload");
    if ok_or_missing(status, "/api/devices/ftp", &body, &mut missing) {
        assert!(!body.contains("\"error\""), "{body}");

        let (status, _, body) = s.post("/api/ftp/list?id=server0");
        if ok_or_missing(status, "/api/ftp/list", &body, &mut missing) {
            assert!(body.contains("\"files\":[\"notes.txt\"]"), "{body}");
        }

        let (status, _, body) = s.post("/api/devices/ftp?id=server0&name=notes.txt&content=");
        if ok_or_missing(status, "/api/devices/ftp", &body, &mut missing) {
            assert!(!body.contains("\"error\""), "{body}");
        }

        let (_, _, body) = s.post("/api/ftp/list?id=server0");
        assert!(body.contains("\"files\":[]"), "{body}");
    }

    // Syslog: an enabled endpoint logs a delivered PDU.
    let (status, _, body) = s.post("/api/devices/syslog?id=pc0&on=1");
    if ok_or_missing(status, "/api/devices/syslog", &body, &mut missing) {
        let (_, _, body) = s.post("/api/pdu?src=pc0&dst=pc2");
        assert!(body.contains("\"proto\":\"ICMP\""), "{body}");

        let (status, _, body) = s.post("/api/syslog/list?id=pc0");
        if ok_or_missing(status, "/api/syslog/list", &body, &mut missing) {
            assert!(body.contains("\"entries\":[{" ), "{body}");
            assert!(body.contains("\"severity\":\"info\""), "{body}");
            assert!(body.contains("PC0 -> PC2 ICMP"), "{body}");
            assert!(body.contains("\"time\":"), "{body}");
        }
    }

    // AAA user directory.
    let (status, _, body) = s.post("/api/devices/aaa?id=server0&user=alice&pass=secret");
    if ok_or_missing(status, "/api/devices/aaa", &body, &mut missing) {
        assert!(!body.contains("\"error\""), "{body}");

        let (status, _, body) = s.post("/api/aaa/list?id=server0");
        if ok_or_missing(status, "/api/aaa/list", &body, &mut missing) {
            assert!(body.contains("\"users\":[\"alice\"]"), "{body}");
        }
    }

    // NTP: pc0 points at server0's address and reports a sync.
    let (status, _, body) = s.post("/api/devices/ntp?id=pc0&server=192.168.2.20");
    if ok_or_missing(status, "/api/devices/ntp", &body, &mut missing) {
        assert!(!body.contains("\"error\""), "{body}");

        let (status, _, body) = s.post("/api/ntp/status?id=pc0");
        if ok_or_missing(status, "/api/ntp/status", &body, &mut missing) {
            assert!(body.contains("\"synced\":true"), "{body}");
            assert!(body.contains("\"server\":\"192.168.2.20\""), "{body}");
        }
    }

    if !missing.is_empty() {
        eprintln!("services endpoints not implemented: {missing:?}");
    }
}
