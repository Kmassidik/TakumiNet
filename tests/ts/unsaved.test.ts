import { expect, test } from "bun:test";
import { fingerprint, hasUnsaved, isEmpty } from "../../web/ts/ui/unsaved";

const pc = { id: "pc0", name: "PC0", model: "PC-PT", x: 10, y: 20, ip: "192.168.1.10", prefix: 24, gw: "" };
const ws = { devices: [pc], links: [], notes: [] };

test("a workspace that has not changed since it was clean has nothing unsaved", () => {
  const clean = fingerprint(ws);
  expect(hasUnsaved(structuredClone(ws), clean)).toBe(false);
});

test("moving a device, renaming it, adding a cable or a note each count as unsaved work", () => {
  const clean = fingerprint(ws);
  expect(hasUnsaved({ ...ws, devices: [{ ...pc, x: 11 }] }, clean)).toBe(true);
  expect(hasUnsaved({ ...ws, devices: [{ ...pc, name: "Desk" }] }, clean)).toBe(true);
  expect(hasUnsaved({ ...ws, links: [{ a: "pc0", aPort: "Fa0", b: "pc1", bPort: "Fa0", kind: "eCopper" }] }, clean)).toBe(true);
  expect(hasUnsaved({ ...ws, notes: [{ id: "note1", x: 0, y: 0, color: "#fff", text: "hi" }] }, clean)).toBe(true);
});

test("captured packets and playback do not count as work", () => {
  const clean = fingerprint(ws);
  expect(hasUnsaved({ ...ws, events: [{ id: 1 }], simCursor: 3 } as never, clean)).toBe(false);
});

test("an empty workspace never warns, even if it differs from the last clean one", () => {
  const clean = fingerprint(ws);
  expect(hasUnsaved({ devices: [], links: [], notes: [] }, clean)).toBe(false);
  expect(isEmpty({ devices: [], notes: [] })).toBe(true);
  expect(isEmpty(null)).toBe(true);
});

test("with no clean point taken, or no workspace at all, nothing is warned about", () => {
  expect(hasUnsaved(ws, null)).toBe(false);
  expect(hasUnsaved(null, "x")).toBe(false);
  expect(hasUnsaved(undefined, null)).toBe(false);
  expect(fingerprint(null)).toBe("");
  expect(() => fingerprint({} as never)).not.toThrow();
});
