export const NOTE_WIDTH = 180;
export const NOTE_CHARS_PER_LINE = 26;
const LINE_HEIGHT = 16;
const PADDING = 10;

/* Splits text into lines no longer than `width`, breaking at spaces where it
   can, and honouring explicit line breaks. */
export function wrapText(text, width) {
  const lines = [];
  for (const paragraph of text.split("\n")) {
    let line = "";
    for (const word of paragraph.split(" ").filter((w) => w.length > 0)) {
      let piece = word;
      while (piece.length > width) {
        if (line) {
          lines.push(line);
          line = "";
        }
        lines.push(piece.slice(0, width));
        piece = piece.slice(width);
      }
      const candidate = line ? `${line} ${piece}` : piece;
      if (candidate.length > width && line) {
        lines.push(line);
        line = piece;
      } else {
        line = candidate;
      }
    }
    lines.push(line);
  }
  return lines;
}

export function noteBox(note) {
  const lines = wrapText(note.text, NOTE_CHARS_PER_LINE);
  return {
    x: note.x,
    y: note.y,
    w: NOTE_WIDTH,
    h: PADDING * 2 + LINE_HEIGHT * lines.length,
    lines,
  };
}

/* The last note in the list is drawn on top, so it is tested first. */
export function hitNote(notes, p) {
  for (let i = notes.length - 1; i >= 0; i--) {
    const box = noteBox(notes[i]);
    if (p.x >= box.x && p.x <= box.x + box.w && p.y >= box.y && p.y <= box.y + box.h) return notes[i];
  }
  return null;
}
