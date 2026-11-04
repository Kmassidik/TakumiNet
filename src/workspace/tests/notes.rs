use super::super::*;

#[test]
fn a_note_keeps_its_text_position_and_colour_through_tnet() {
    let mut ws = Workspace::new();
    let id = ws.add_note(120.0, 80.0, "#fff3b0", "Check the\ttab & <tags>\nnext line");
    let loaded = Workspace::from_tnet(&ws.to_tnet()).expect("round trip");
    let note = loaded.notes.iter().find(|n| n.id == id).expect("note survives");
    assert_eq!((note.x, note.y), (120.0, 80.0));
    assert_eq!(note.color, "#fff3b0");
    assert_eq!(note.text, "Check the\ttab & <tags>\nnext line");
}

#[test]
fn notes_can_be_moved_edited_and_deleted() {
    let mut ws = Workspace::new();
    let id = ws.add_note(0.0, 0.0, "#fff3b0", "first");
    assert!(ws.move_note(&id, 30.0, 40.0));
    assert!(ws.edit_note(&id, "second", "#c8f7c5"));
    let note = ws.notes.iter().find(|n| n.id == id).unwrap();
    assert_eq!((note.x, note.y, note.text.as_str(), note.color.as_str()), (30.0, 40.0, "second", "#c8f7c5"));
    assert!(ws.delete_note(&id));
    assert!(ws.notes.is_empty());
    assert!(!ws.move_note(&id, 1.0, 1.0));
    assert!(!ws.delete_note(&id));
}

#[test]
fn json_lists_every_note_for_the_canvas() {
    let mut ws = Workspace::new();
    ws.add_note(10.0, 20.0, "#fff3b0", "hello");
    assert!(ws.json().contains("\"notes\":[{"), "{}", ws.json());
    assert!(ws.json().contains("\"text\":\"hello\""));
}

#[test]
fn notes_with_empty_text_are_refused() {
    let mut ws = Workspace::new();
    assert_eq!(ws.add_note(0.0, 0.0, "#fff3b0", "   "), "");
    assert!(ws.notes.is_empty());
}
