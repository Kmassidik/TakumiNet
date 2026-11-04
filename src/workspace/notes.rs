use super::*;

const MAX_NOTE_CHARS: usize = 2000;

impl Workspace {
    /// Adds a note and returns its id, or an empty string when the text is blank.
    pub fn add_note(&mut self, x: f32, y: f32, color: &str, text: &str) -> String {
        let text = text.trim();
        if text.is_empty() {
            return String::new();
        }
        let index = self.counters.entry("note".into()).or_insert(0);
        *index += 1;
        let id = format!("note{}", *index);
        self.notes.push(Note {
            id: id.clone(),
            x,
            y,
            color: color.to_string(),
            text: text.chars().take(MAX_NOTE_CHARS).collect(),
        });
        id
    }

    pub fn move_note(&mut self, id: &str, x: f32, y: f32) -> bool {
        match self.notes.iter_mut().find(|note| note.id == id) {
            Some(note) => {
                note.x = x;
                note.y = y;
                true
            }
            None => false,
        }
    }

    pub fn edit_note(&mut self, id: &str, text: &str, color: &str) -> bool {
        let text = text.trim();
        match self.notes.iter_mut().find(|note| note.id == id) {
            Some(note) if !text.is_empty() => {
                note.text = text.chars().take(MAX_NOTE_CHARS).collect();
                note.color = color.to_string();
                true
            }
            _ => false,
        }
    }

    pub fn delete_note(&mut self, id: &str) -> bool {
        let before = self.notes.len();
        self.notes.retain(|note| note.id != id);
        self.notes.len() != before
    }

    pub(super) fn json_notes(&self, o: &mut String) {
        for (index, note) in self.notes.iter().enumerate() {
            if index > 0 {
                o.push(',');
            }
            o.push_str(&format!(
                "{{\"id\":{},\"x\":{},\"y\":{},\"color\":{},\"text\":{}}}",
                s(&note.id), note.x, note.y, s(&note.color), s(&note.text),
            ));
        }
    }
}
