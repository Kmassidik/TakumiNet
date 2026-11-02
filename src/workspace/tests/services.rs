use super::super::*;

#[test]
fn ftp_ntp_syslog_and_aaa_work_and_persist() {
    let mut ws = Workspace::new();
    ws.ftp_put("server0", "a.txt", "hello").unwrap();
    assert_eq!(ws.ftp_list("server0"), vec!["a.txt"]);
    assert!(ws.ftp_put("server0", "../x", "y").is_err());
    ws.ftp_put("server0", "a.txt", "").unwrap();
    assert!(ws.ftp_list("server0").is_empty());

    assert_eq!(ws.ntp_sync("pc0", "192.168.2.20").unwrap(), 0.0);
    assert_eq!(ws.ntp_status("pc0").unwrap().0, "192.168.2.20");
    assert!(ws.ntp_sync("pc0", "192.168.2.99").is_err());

    ws.syslog_enable("pc0", true).unwrap();
    ws.send_pdu("pc0", "server0").unwrap();
    let entries = ws.syslog_list("pc0");
    assert_eq!(entries.len(), 1);
    assert!(entries[0].2.contains("PC0"), "{:?}", entries);

    ws.aaa_add_user("server0", "alice", "pw").unwrap();
    assert_eq!(ws.aaa_list("server0"), vec!["alice"]);
    assert!(ws.aaa_add_user("server0", "alice", "pw").is_err());
    assert!(ws.aaa_add_user("server0", "bob", "").is_err());

    ws.ftp_put("server0", "b.txt", "x").unwrap();
    let back = Workspace::from_ptw(&ws.to_ptw()).unwrap();
    assert_eq!(back.ftp_list("server0"), vec!["b.txt"]);
    assert_eq!(back.ntp_status("pc0").unwrap().0, "192.168.2.20");
    assert_eq!(back.syslog_list("pc0").len(), 1);
    assert_eq!(back.aaa_list("server0"), vec!["alice"]);
}

#[test]
fn port_security_limits_macs_and_channel_groups_persist() {
    let mut ws = Workspace::new();
    ws.set_port_security("switch0", "fa0/3", 1).unwrap();
    assert!(ws.port_security_allowed("switch0", "FastEthernet0/3", "aa:bb"));
    assert!(ws.port_security_allowed("switch0", "FastEthernet0/3", "aa:bb"));
    assert!(!ws.port_security_allowed("switch0", "FastEthernet0/3", "cc:dd"));
    assert_eq!(ws.port_security_rows("switch0")[0].1, 1);
    assert_eq!(ws.port_security_rows("switch0")[0].2, 1);

    ws.set_channel_group("switch0", "fa0/2", 1).unwrap();
    ws.set_channel_group("switch0", "fa0/3", 1).unwrap();
    let groups = ws.channel_groups("switch0");
    assert_eq!(groups[0].0, 1);
    assert_eq!(groups[0].1.len(), 2);

    let back = Workspace::from_ptw(&ws.to_ptw()).unwrap();
    assert_eq!(back.port_security_rows("switch0")[0].2, 1);
    assert_eq!(back.channel_groups("switch0")[0].1.len(), 2);
}

#[test]
fn acl_binding_denies_and_persists() {
    use crate::model::parse_ipv4;
    let mut ws = Workspace::new();
    ws.acl_add(
        "router0",
        10,
        false,
        parse_ipv4("192.168.1.0").unwrap(),
        parse_ipv4("0.0.0.255").unwrap(),
        None,
    )
    .unwrap();
    ws.acl_bind("router0", "g0/0", 10, true).unwrap();
    let err = ws.send_pdu("pc0", "server0").unwrap_err();
    assert!(err.contains("ACL denied"), "{err}");
    ws.acl_unbind("router0", "g0/0").unwrap();
    ws.send_pdu("pc0", "server0").unwrap();

    ws.acl_bind("router0", "g0/0", 10, true).unwrap();
    let mut back = Workspace::from_ptw(&ws.to_ptw()).unwrap();
    assert!(back
        .send_pdu("pc0", "server0")
        .unwrap_err()
        .contains("ACL denied"));
    assert!(back.acl_lines("router0")[0].contains("deny 192.168.1.0"));
}

#[test]
fn nat_overload_translates_and_persists() {
    use crate::model::parse_ipv4;
    let mut ws = Workspace::new();
    ws.acl_add(
        "router0",
        10,
        true,
        parse_ipv4("192.168.1.0").unwrap(),
        parse_ipv4("0.0.0.255").unwrap(),
        None,
    )
    .unwrap();
    ws.set_nat_role("router0", "g0/0", true).unwrap();
    ws.set_nat_role("router0", "g0/1", false).unwrap();
    ws.add_nat_rule("router0", 10, "g0/1").unwrap();
    ws.send_pdu("pc0", "server0").unwrap();
    let rows = ws.nat_translation_lines("router0");
    assert_eq!(rows, vec!["192.168.1.10 -> 192.168.2.1"]);
    let note = ws
        .events
        .last()
        .unwrap()
        .hops
        .iter()
        .map(|h| h.note.clone())
        .collect::<Vec<_>>()
        .join("|");
    assert!(note.contains("NAT"), "{note}");

    let back = Workspace::from_ptw(&ws.to_ptw()).unwrap();
    assert_eq!(back.nat_binding_lines("router0").len(), 1);
    assert_eq!(back.nat_roles["router0"]["GigabitEthernet0/0"], true);
}

#[test]
fn mailboxes_accept_and_list_messages() {
    let mut ws = Workspace::new();
    ws.add_mail_user("server0", "alice", "pw").unwrap();
    ws.add_mail_user("server0", "bob", "pw2").unwrap();
    assert!(ws.add_mail_user("server0", "alice", "x").is_err());
    assert!(ws.add_mail_user("nope", "a", "b").is_err());
    assert!(ws.add_mail_user("server0", "", "x").is_err());

    ws.send_mail("pc0", "server0", "alice", "bob", "hi", "body")
        .unwrap();
    let inbox = ws.mail_list("server0", "bob");
    assert_eq!(inbox.len(), 1);
    assert_eq!(inbox[0].subject, "hi");
    assert!(ws.mail_list("server0", "alice").is_empty());
    assert!(ws
        .send_mail("pc0", "server0", "alice", "carol", "x", "y")
        .is_err());
    assert!(ws.events.iter().any(|e| e.proto == "SMTP"));
}

#[test]
fn tftp_files_can_be_put_listed_and_removed() {
    let mut ws = Workspace::new();
    ws.tftp_put("server0", "config.txt", "hello").unwrap();
    assert_eq!(ws.tftp_list("server0"), vec!["config.txt"]);
    assert_eq!(
        ws.tftp_get("server0", "config.txt").as_deref(),
        Some("hello")
    );
    ws.tftp_put("server0", "config.txt", "").unwrap();
    assert!(ws.tftp_list("server0").is_empty());
    assert!(ws.tftp_put("server0", "a/b", "x").is_err());
    assert!(ws.tftp_put("server0", "missing", "").is_err());
}
