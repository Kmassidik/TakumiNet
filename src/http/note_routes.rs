use super::*;

/// Returns `None` when this group does not own the route.
pub(super) fn route(ctx: &Ctx, method: &str, path: &str, query: &str) -> Option<(&'static str, Vec<u8>)> {
    match (method, path) {
        ("POST", "/api/notes/add") => Some(handle_add(ctx, query)),
        ("POST", "/api/notes/edit") => Some(handle_edit(ctx, query)),
        ("POST", "/api/notes/move") => Some(handle_move(ctx, query)),
        ("POST", "/api/notes/delete") => Some(handle_delete(ctx, query)),
        _ => None,
    }
}

fn number(query: &str, key: &str) -> Option<f32> {
    query_value(query, key).and_then(|v| v.parse::<f32>().ok()).filter(|v| v.is_finite())
}

fn handle_add(ctx: &Ctx, query: &str) -> (&'static str, Vec<u8>) {
    let json = "application/json";
    let text = query_value(query, "text").unwrap_or_default();
    let color = query_value(query, "color").unwrap_or_else(|| "#fff3b0".into());
    let (Some(x), Some(y)) = (number(query, "x"), number(query, "y")) else {
        return (json, json_error("missing x or y").into_bytes());
    };
    let (out, _) = apply(ctx, |ws| {
        if ws.add_note(x, y, &color, &text).is_empty() { Err("note text is empty".into()) } else { Ok(()) }
    });
    (json, out.into_bytes())
}

fn handle_edit(ctx: &Ctx, query: &str) -> (&'static str, Vec<u8>) {
    let json = "application/json";
    let id = query_value(query, "id").unwrap_or_default();
    let text = query_value(query, "text").unwrap_or_default();
    let color = query_value(query, "color").unwrap_or_else(|| "#fff3b0".into());
    let (out, _) = apply(ctx, |ws| {
        if ws.edit_note(&id, &text, &color) { Ok(()) } else { Err("note not found or empty".into()) }
    });
    (json, out.into_bytes())
}

fn handle_move(ctx: &Ctx, query: &str) -> (&'static str, Vec<u8>) {
    let json = "application/json";
    let id = query_value(query, "id").unwrap_or_default();
    let (Some(x), Some(y)) = (number(query, "x"), number(query, "y")) else {
        return (json, json_error("missing x or y").into_bytes());
    };
    let (out, _) = apply(ctx, |ws| {
        if ws.move_note(&id, x, y) { Ok(()) } else { Err("note not found".into()) }
    });
    (json, out.into_bytes())
}

fn handle_delete(ctx: &Ctx, query: &str) -> (&'static str, Vec<u8>) {
    let json = "application/json";
    let id = query_value(query, "id").unwrap_or_default();
    let (out, _) = apply(ctx, |ws| {
        if ws.delete_note(&id) { Ok(()) } else { Err("note not found".into()) }
    });
    (json, out.into_bytes())
}
