import { expect, test } from "bun:test";
import { GRACE_MS, SHOW_DELAY_MS, TipController, placeTip, shortcutFor, tipText, type TipDeps } from "../../web/ts/ui/tooltip_rules";

const vp = { w: 1000, h: 700 };
const tip = { w: 80, h: 24 };

test("the label sits below the button, centred", () => {
  const p = placeTip({ x: 100, y: 40, w: 30, h: 30 }, tip, vp);
  expect(p).toEqual({ x: 75, y: 76, above: false });
});

test("near the bottom edge it flips above the button", () => {
  const p = placeTip({ x: 100, y: 670, w: 30, h: 24 }, tip, vp);
  expect(p.above).toBe(true);
  expect(p.y + tip.h).toBeLessThanOrEqual(670);
});

test("it never leaves the window, at any corner", () => {
  for (const x of [0, 5, 500, 960, 995]) {
    for (const y of [0, 10, 350, 690, 698]) {
      const p = placeTip({ x, y, w: 30, h: 30 }, tip, vp);
      expect(p.x).toBeGreaterThanOrEqual(0);
      expect(p.x + tip.w).toBeLessThanOrEqual(vp.w);
      expect(p.y).toBeGreaterThanOrEqual(0);
    }
  }
});

test("shortcuts come from the action, and unknown actions show none", () => {
  expect(shortcutFor({ action: "save" })).toBe("Ctrl+S");
  expect(shortcutFor({ action: "undo" })).toBe("Ctrl+Z");
  expect(shortcutFor({ sim: "play" })).toBe("Space");
  expect(shortcutFor({ collapseFor: "sidebar" })).toBe("\\");
  expect(shortcutFor({ action: "nothing" })).toBe("");
  expect(shortcutFor({})).toBe("");
});

test("a label that only repeats the button's own text is not shown", () => {
  expect(tipText("Save", "")).toBe("Save");
  expect(tipText("Physical", "Physical")).toBe("");
  expect(tipText("  ", "x")).toBe("");
  expect(tipText(null, "x")).toBe("");
});

function rig() {
  let clock = 0;
  const gone = new Set<unknown>();
  const timers: Array<{ fn: () => void; at: number; id: number; live: boolean }> = [];
  const log: string[] = [];
  const deps: TipDeps = {
    show: (a, text, key) => log.push(`show:${String(a)}:${text}:${key}`),
    hide: () => log.push("hide"),
    setTimer: (fn, ms) => { const t = { fn, at: clock + ms, id: timers.length, live: true }; timers.push(t); return t.id; },
    clearTimer: (h) => { timers[h as number]!.live = false; },
    now: () => clock,
    connected: (a) => !gone.has(a),
  };
  const advance = (ms: number) => {
    clock += ms;
    for (const t of timers) if (t.live && t.at <= clock) { t.live = false; t.fn(); }
  };
  return { c: new TipController(deps), log, advance, gone };
}

test("the first label waits, and does not appear if the pointer leaves first", () => {
  const { c, log, advance } = rig();
  c.enter("new", "New");
  advance(SHOW_DELAY_MS - 1);
  expect(log).toEqual([]);
  c.leave();
  advance(1000);
  expect(log).toEqual([]);
});

test("the label appears after the delay, with its shortcut", () => {
  const { c, log, advance } = rig();
  c.enter("save", "Save", "Ctrl+S");
  advance(SHOW_DELAY_MS);
  expect(log).toEqual(["show:save:Save:Ctrl+S"]);
  expect(c.visible).toBe(true);
});

test("sliding to the neighbouring button shows its label at once", () => {
  const { c, log, advance } = rig();
  c.enter("new", "New");
  advance(SHOW_DELAY_MS);
  c.enter("open", "Open");
  expect(log.at(-1)).toBe("show:open:Open:");
  c.leave();
  advance(GRACE_MS - 10);
  c.enter("save", "Save");
  expect(log.at(-1)).toBe("show:save:Save:");
});

test("after a pause the delay applies again", () => {
  const { c, log, advance } = rig();
  c.enter("new", "New");
  advance(SHOW_DELAY_MS);
  c.leave();
  advance(GRACE_MS + 50);
  c.enter("open", "Open");
  const before = log.length;
  advance(SHOW_DELAY_MS - 1);
  expect(log.length).toBe(before);
  advance(1);
  expect(log.at(-1)).toBe("show:open:Open:");
});

test("an empty label shows nothing, and the same button is not shown twice", () => {
  const { c, log, advance } = rig();
  c.enter("x", "");
  advance(1000);
  expect(log).toEqual([]);
  c.enter("new", "New");
  advance(SHOW_DELAY_MS);
  c.enter("new", "New");
  expect(log.filter((l) => l.startsWith("show")).length).toBe(1);
});

test("a label hides when its button is replaced while it shows", () => {
  const { c, log, advance, gone } = rig();
  c.enter("save", "Save");
  advance(SHOW_DELAY_MS);
  gone.add("save");
  c.check();
  expect(log.at(-1)).toBe("hide");
  expect(c.visible).toBe(false);
  c.check(); // checking again changes nothing
  expect(log.filter((l) => l === "hide").length).toBe(1);
});

test("a button replaced while the label is still waiting never shows one", () => {
  const { c, log, advance, gone } = rig();
  c.enter("save", "Save");
  gone.add("save");
  advance(SHOW_DELAY_MS + 100);
  expect(log).toEqual([]);
  expect(c.visible).toBe(false);
});

test("checking with nothing shown does nothing", () => {
  const { c, log } = rig();
  c.check();
  expect(log).toEqual([]);
});
