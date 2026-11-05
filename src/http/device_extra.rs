use super::*;

pub(super) fn handle_devices_replace(ctx: &Ctx, query: &str) -> (&'static str, Vec<u8>) {
    let json = "application/json";
    let id = query_value(query, "id").unwrap_or_default();
    let model = query_value(query, "model").unwrap_or_default();
    let mut report = None;
    let (out, ok) = apply(ctx, |ws| {
        report = Some(ws.replace(&id, &model)?);
        Ok(())
    });
    if !ok {
        return (json, out.into_bytes());
    }
    let dropped = report
        .map(|r| {
            let list = r.dropped.iter().map(|p| json_str(p)).collect::<Vec<_>>().join(",");
            let cleared = r.cleared.iter().map(|c| json_str(c)).collect::<Vec<_>>().join(",");
            format!("{{\"kept\":{},\"dropped\":[{list}],\"cleared\":[{cleared}]}}", r.kept)
        })
        .unwrap_or_else(|| "{\"kept\":0,\"dropped\":[],\"cleared\":[]}".into());
    let body = out.trim_end_matches('}').to_string() + ",\"replace\":" + &dropped + "}";
    (json, body.into_bytes())
}

pub(super) fn handle_sim_step(ctx: &Ctx) -> (&'static str, Vec<u8>) {
    let json = "application/json";
    let (out, _) = apply_capture(ctx, |ws| {
        ws.flush_pending();
        Ok(())
    });
    (json, out.into_bytes())
}
