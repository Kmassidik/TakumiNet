import { expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const css = readFileSync(join(import.meta.dir, "../../web/workspace.css"), "utf8");
const index = readFileSync(join(import.meta.dir, "../../web/index.html"), "utf8");

function widths(selectorPattern: RegExp): number[] {
  return [...css.matchAll(selectorPattern)].map((m) => Number(m[1]));
}

test("the events table columns add up to the full width, in percent", () => {
  const cols = widths(/\.events col\.c-[a-z]+ \{ width: (\d+)%; \}/g);
  expect(cols).toHaveLength(5);
  expect(cols.reduce((a, b) => a + b, 0)).toBe(100);
});

test("the capture table keeps room for its Info column at every width", () => {
  // Info is the 7th column and must keep at least 10 percent
  const first = css.slice(css.indexOf(".capture-table th:nth-child(1) { width: 10%"), css.indexOf(".capture-table tbody tr {"));
  const pct = [...first.matchAll(/width: (\d+)%/g)].map((m) => Number(m[1]));
  // columns 1,2,3,4,5,6 (3 and 4 share one rule)
  const sum = pct[0]! + pct[1]! + pct[2]! * 2 + pct[3]! + pct[4]!;
  expect(100 - sum).toBeGreaterThanOrEqual(10);
});

test("no fixed pixel minimum in the capture layout can exceed the narrowest sidebar (240 px)", () => {
  const view = css.match(/\.capture-view \{[^}]*\}/)![0];
  expect(view).toMatch(/grid-template-columns: minmax\(0, 1fr\)/);
  expect(view).not.toMatch(/grid-template-columns:[^;]*\d{3,}px/);
});

test("each sidebar panel is declared once", () => {
  const panels = [...index.matchAll(/data-panel="([a-z]+)"/g)].map((m) => m[1]);
  expect(new Set(panels).size).toBe(panels.length);
  expect(panels.sort()).toEqual(["capture", "events", "lesson", "log"]);
});

test("the Lesson tab has an empty state for when no lesson is open", () => {
  expect(index).toMatch(/id="lesson-empty"/);
});
