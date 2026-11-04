use super::*;

/// Routes for lab controls that previously had no UI: virtual tenant
/// networks, PPPoE session teardown, and the home router status page.
pub(super) fn route(ctx: &Ctx, method: &str, path: &str, query: &str) -> Option<(&'static str, Vec<u8>)> {
    match (method, path) {
        ("POST", "/api/devices/vnet") => Some(handle_vnet(ctx, query)),
        ("POST", "/api/pppoe/disconnect") => Some(handle_pppoe_disconnect(ctx, query)),
        ("POST", "/api/router/status") => Some(handle_router_status(ctx, query)),
        _ => None,
    }
}

fn handle_vnet(ctx: &Ctx, query: &str) -> (&'static str, Vec<u8>) {
    let json = "application/json";
    let id = query_value(query, "id").unwrap_or_default();
    let remove = matches!(query_value(query, "remove").as_deref(), Some("1") | Some("true"));
    let (out, _) = apply(ctx, |ws| {
        if remove {
            return ws.vnet_join(&id, 0);
        }
        let Some(vni) = query_value(query, "vni").and_then(|v| v.parse::<u32>().ok()) else {
            return Err("vni must be a whole number from 1 to 16777215".to_string());
        };
        ws.vnet_join(&id, vni)
    });
    (json, out.into_bytes())
}

fn handle_pppoe_disconnect(ctx: &Ctx, query: &str) -> (&'static str, Vec<u8>) {
    let json = "application/json";
    let id = query_value(query, "id").unwrap_or_default();
    let (out, _) = apply(ctx, |ws| {
        if ws.pppoe_disconnect(&id) { Ok(()) } else { Err("no session on this device".into()) }
    });
    (json, out.into_bytes())
}

fn handle_router_status(ctx: &Ctx, query: &str) -> (&'static str, Vec<u8>) {
    let json = "application/json";
    let target = query_value(query, "id").unwrap_or_default();
    let ws = ctx.ws.lock().unwrap_or_else(|e| e.into_inner());
    let router = match ws.home_router_id(&target) {
        Ok(id) => id,
        Err(e) => return (json, json_error(&e).into_bytes()),
    };
    let device = ws.devices.iter().find(|d| d.id == router).expect("resolved above");
    let lan = device.ip.map_or("null".to_string(), |ip| {
        json_str(&format!(
            "{}/{}",
            crate::model::ipv4_string(ip & crate::model::mask_of(device.prefix)),
            device.prefix
        ))
    });
    let wan = json_str(&ws.wan_summary(&router));
    let name_of = |id: &str| ws.devices.iter().find(|d| d.id == id).map(|d| d.name.clone()).unwrap_or_else(|| id.to_string());
    let forwards = ws.port_forwards.get(&router).into_iter().flatten()
        .map(|(outside, target, inside)| format!(
            "{{\"outside\":{outside},\"target\":{},\"name\":{},\"inside\":{inside}}}",
            json_str(target), json_str(&name_of(target))
        ))
        .collect::<Vec<_>>()
        .join(",");
    let body = format!(
        "{{\"id\":{},\"name\":{},\"lan\":{lan},\"wan\":{wan},\"forwards\":[{forwards}]}}",
        json_str(&router),
        json_str(&device.name)
    );
    (json, body.into_bytes())
}

#[cfg(test)]
mod tests {
    use super::*;

    fn body(reply: (&'static str, Vec<u8>)) -> String {
        String::from_utf8(reply.1).unwrap()
    }

    #[test]
    fn a_server_joins_and_leaves_a_virtual_network_over_http() {
        let ctx = Ctx::new("");
        let out = body(route(&ctx, "POST", "/api/devices/vnet", "id=server0&vni=100").unwrap());
        assert!(!out.contains("\"error\""), "{out}");
        assert!(out.contains("\"vnet\":100"), "the workspace reply carries the membership: {out}");

        let out = body(route(&ctx, "POST", "/api/devices/vnet", "id=server0&remove=1").unwrap());
        assert!(!out.contains("\"error\""), "{out}");
        assert!(out.contains("\"vnet\":null"), "{out}");
    }

    #[test]
    fn the_vnet_route_refuses_bad_input() {
        let ctx = Ctx::new("");
        assert!(body(route(&ctx, "POST", "/api/devices/vnet", "id=pc0&vni=100").unwrap()).contains("virtual networks hold servers"));
        assert!(body(route(&ctx, "POST", "/api/devices/vnet", "id=server0").unwrap()).contains("vni must be"));
        assert!(body(route(&ctx, "POST", "/api/devices/vnet", "id=server0&vni=99999999").unwrap()).contains("network id runs"));
    }

    #[test]
    fn the_router_status_page_reports_lan_wan_and_forwards() {
        let ctx = Ctx::new("");
        let home = include_str!("../../web/templates/les-l1-05-port-forward.xml");
        *ctx.ws.lock().unwrap() = Workspace::from_tnet(home).unwrap();

        let out = body(super::super::service_routes::route(&ctx, "POST", "/api/devices/portforward", "id=homerouter0&outside=8080&target=server0&inside=80").unwrap());
        assert!(!out.contains("\"error\""), "{out}");

        let out = body(route(&ctx, "POST", "/api/router/status", "id=192.168.1.1").unwrap());
        assert!(out.contains("\"lan\":\"192.168.1.0/24\""), "{out}");
        assert!(out.contains("\"wan\":\"connected via Modem0\""), "{out}");
        assert!(out.contains("\"outside\":8080") && out.contains("\"target\":\"server0\"") && out.contains("\"inside\":80"), "{out}");

        let out = body(route(&ctx, "POST", "/api/router/status", "id=192.168.1.2").unwrap());
        assert!(out.contains("no router page"), "{out}");
    }

    #[test]
    fn a_pppoe_session_can_be_dropped_over_http() {
        let ctx = Ctx::new("");
        let rtrw = include_str!("../../web/templates/les-l2-02-customer-login.xml");
        *ctx.ws.lock().unwrap() = Workspace::from_tnet(rtrw).unwrap();
        ctx.ws.lock().unwrap().pppoe_connect("home1", "10.10.0.1", "home1", "plan10-b").unwrap();

        let out = body(route(&ctx, "POST", "/api/pppoe/disconnect", "id=home1").unwrap());
        assert!(!out.contains("\"error\""), "{out}");
        assert!(ctx.ws.lock().unwrap().pppoe_sessions("gw0").is_empty());

        let out = body(route(&ctx, "POST", "/api/pppoe/disconnect", "id=home1").unwrap());
        assert!(out.contains("no session on this device"), "{out}");
    }
}
