import { expect, test } from "bun:test";
import { wrapText, noteBox, hitNote } from "../../web/ts/canvas/notes";

test("text wraps at word boundaries and keeps explicit line breaks", () => {
  expect(wrapText("one two three", 7)).toEqual(["one two", "three"]);
  expect(wrapText("a\nb", 20)).toEqual(["a", "b"]);
  expect(wrapText("supercalifragilistic", 8)).toEqual(["supercal", "ifragili", "stic"]);
});

test("a longer note makes a taller box and the box has a fixed width", () => {
  const short = noteBox({ id: "n1", x: 0, y: 0, color: "#fff3b0", text: "hi" });
  const long = noteBox({ id: "n2", x: 0, y: 0, color: "#fff3b0", text: "one two three four five six seven eight nine" });
  expect(long.h).toBeGreaterThan(short.h);
  expect(short.w).toBe(long.w);
});

test("a point inside a note hits it; the top-most note wins", () => {
  const notes = [
    { id: "a", x: 10, y: 10, color: "#fff3b0", text: "under" },
    { id: "b", x: 20, y: 20, color: "#fff3b0", text: "over" },
  ];
  expect(hitNote(notes, { x: 25, y: 25 })?.id).toBe("b");
  expect(hitNote(notes, { x: 12, y: 12 })?.id).toBe("a");
  expect(hitNote(notes, { x: 900, y: 900 })).toBeNull();
});
