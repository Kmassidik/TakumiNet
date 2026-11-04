use super::*;

/// `/api/sniffer/{id}` returns the capture rows; `/api/sniffer/{id}/clear`
/// (POST) empties the buffer. Returns `None` when this group does not own
/// the route.
pub(super) fn route(ctx: &Ctx, method: &str, path: &str, _query: &str) -> Option<(&'static str, Vec<u8>)> {
    let rest = path.strip_prefix("/api/sniffer/")?;
    let json = "application/json";
    match (method, rest.strip_suffix("/clear")) {
        ("POST", Some(id)) if !id.is_empty() && !id.contains('/') => {
            let mut ws = ctx.ws.lock().unwrap_or_else(|e| e.into_inner());
            if ws.devices.iter().all(|d| d.id != id) {
                return Some((json, json_error(&format!("unknown device {id}")).into_bytes()));
            }
            ws.tables.sniffer_clear(id);
            Some((json, rows_json(&ws, id).into_bytes()))
        }
        ("GET", None) if !rest.is_empty() && !rest.contains('/') => {
            let ws = ctx.ws.lock().unwrap_or_else(|e| e.into_inner());
            let Some(dev) = ws.devices.iter().find(|d| d.id == rest) else {
                return Some((json, json_error(&format!("unknown device {rest}")).into_bytes()));
            };
            if dev.kind != "sniffer" {
                return Some((json, json_error(&format!("{} is not a sniffer", dev.name)).into_bytes()));
            }
            Some((json, rows_json(&ws, rest).into_bytes()))
        }
        _ => None,
    }
}

fn rows_json(ws: &Workspace, id: &str) -> String {
    let mut out = format!("{{\"id\":{},\"frames\":[", json_str(id));
    for (index, row) in ws.tables.sniffer_rows(id).iter().enumerate() {
        if index > 0 {
            out.push(',');
        }
        out.push_str(&format!(
            "{{\"t\":{:.3},\"srcMac\":{},\"dstMac\":{},\"ethertype\":{},\"srcIp\":{},\"dstIp\":{},\"proto\":{},\"length\":{},\"info\":{}}}",
            row.t,
            json_str(&row.src_mac),
            json_str(&row.dst_mac),
            json_str(&row.ethertype),
            json_str(&row.src_ip),
            json_str(&row.dst_ip),
            json_str(&row.proto),
            row.length,
            json_str(&row.info),
        ));
    }
    out.push_str("]}");
    out
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn the_sniffer_api_lists_recorded_frames_and_clears_them() {
        let ctx = Ctx::new("");
        let sniffer = {
            let mut ws = ctx.ws.lock().unwrap();
            *ws = Workspace::empty();
            let a = ws.add("PC", 0.0, 0.0).unwrap();
            let sniffer = ws.add("Sniffer", 100.0, 0.0).unwrap();
            let b = ws.add("PC", 200.0, 0.0).unwrap();
            ws.link(&a, &sniffer).unwrap();
            ws.link(&sniffer, &b).unwrap();
            ws.set_ip(&a, "10.0.0.1", 24).unwrap();
            ws.set_ip(&b, "10.0.0.2", 24).unwrap();
            ws.send_pdu(&a, &b).unwrap();
            sniffer
        };
        let path = format!("/api/sniffer/{sniffer}");
        let (ctype, body) = route(&ctx, "GET", &path, "").unwrap();
        assert_eq!(ctype, "application/json");
        let body = String::from_utf8(body).unwrap();
        assert!(body.contains("\"proto\":\"icmp\"") && body.contains("\"dstIp\":\"10.0.0.2\""), "{body}");
        assert!(body.contains("\"ethertype\":\"0x0806\""), "the ARP exchange is recorded too: {body}");

        let (_, missing) = route(&ctx, "GET", "/api/sniffer/nosuch", "").unwrap();
        assert!(String::from_utf8(missing).unwrap().contains("unknown device"));

        let (_, cleared) = route(&ctx, "POST", &format!("{path}/clear"), "").unwrap();
        assert!(String::from_utf8(cleared).unwrap().contains("\"frames\":[]"));
        let (_, after) = route(&ctx, "GET", &path, "").unwrap();
        assert!(String::from_utf8(after).unwrap().contains("\"frames\":[]"));
    }
}
