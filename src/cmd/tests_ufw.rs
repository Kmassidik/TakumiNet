use super::*;

fn ufw(ws: &mut Workspace, line: &str) -> String {
    run(ws, "pc0", line)
}

#[test]
fn ufw_needs_root_and_a_linux_style_device() {
    let mut ws = Workspace::new();
    assert!(ufw(&mut ws, "ufw status").contains("need to be root"));
    assert_eq!(ufw(&mut ws, "sudo ufw status"), "Status: inactive\n");
    let router = ws.devices.iter().find(|d| d.kind == "router").unwrap().id.clone();
    assert_eq!(run(&mut ws, &router, "sudo ufw status"), "ufw: command not found\n");
}

#[test]
fn ufw_builds_rules_and_lists_them() {
    let mut ws = Workspace::new();
    assert!(ufw(&mut ws, "sudo ufw enable").contains("active"));
    assert_eq!(ufw(&mut ws, "sudo ufw allow 22/tcp"), "Rules updated\n");
    assert_eq!(ufw(&mut ws, "sudo ufw allow ssh"), "Skipping adding existing rule\n");
    ufw(&mut ws, "sudo ufw deny from 10.0.0.5");
    ufw(&mut ws, "sudo ufw allow from 10.0.0.0/24 to any port 80 proto tcp");
    let list = ufw(&mut ws, "sudo ufw status numbered");
    assert!(list.contains("[ 1] 22/tcp"), "{list}");
    assert!(list.contains("DENY IN") && list.contains("10.0.0.5"), "{list}");
    assert!(list.contains("10.0.0.0/24"), "{list}");
    assert_eq!(ufw(&mut ws, "sudo ufw delete 2"), "Rule deleted\n");
    assert_eq!(ufw(&mut ws, "sudo ufw delete allow 22/tcp"), "Rule deleted\n");
    assert!(ufw(&mut ws, "sudo ufw delete 9").starts_with("ERROR"));
    assert!(ufw(&mut ws, "sudo ufw allow nonsense").starts_with("ERROR"));
    assert!(ufw(&mut ws, "sudo ufw default deny incoming").contains("'deny'"));
}

#[test]
fn a_default_deny_firewall_blocks_the_web_but_not_ping() {
    let mut ws = Workspace::new();
    let web = ws.devices.iter().find(|d| d.kind == "server").map(|d| d.id.clone());
    let Some(server) = web else { return };
    let target = ws.devices.iter().find(|d| d.id == server).and_then(|d| d.ip).unwrap();
    let address = crate::model::ipv4_string(target);
    assert!(run(&mut ws, &server, "sudo ufw enable").contains("active"));
    assert!(run(&mut ws, "pc0", &format!("ping -n 1 {address}")).contains("Reply from"));
    assert!(ws.send_http("pc0", &server, "server0").is_err(), "default deny must refuse port 80");
    run(&mut ws, &server, "sudo ufw allow 80/tcp");
    assert!(ws.send_http("pc0", &server, "server0").is_ok(), "an allow rule opens the port");
    run(&mut ws, &server, "sudo ufw deny proto icmp from any");
    assert!(run(&mut ws, "pc0", &format!("ping -n 1 {address}")).contains("100% loss"));
}
