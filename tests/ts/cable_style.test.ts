import { expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { cableStyle, CABLE_STYLES } from "../../web/ts/canvas/cable_style";

const kinds = ["eCopper", "eCross", "eSerial", "eFiber", "eConsole", "ePhone", "eCoax", "eIoT"];

test("every cable kind the engine knows has its own look", () => {
  const rust = readFileSync(join(import.meta.dir, "../../src/workspace/types.rs"), "utf8");
  for (const kind of kinds) expect(rust, kind).toContain(`"${kind}"`);
  const looks = kinds.map((k) => {
    const s = cableStyle(k);
    return `${s.color}|${s.width}|${s.dash.join(",")}`;
  });
  expect(new Set(looks).size).toBe(kinds.length);
  expect(Object.keys(CABLE_STYLES).sort()).toEqual([...kinds].sort());
});

test("copper and cross-over differ by dash, not only by colour", () => {
  expect(cableStyle("eCopper").dash).toEqual([]);
  expect(cableStyle("eCross").dash.length).toBeGreaterThan(0);
  expect(cableStyle("eCopper").color).toBe(cableStyle("eCross").color);
});

test("an unknown kind falls back to plain copper", () => {
  expect(cableStyle("eMystery")).toEqual(cableStyle("eCopper"));
  expect(cableStyle(undefined)).toEqual(cableStyle("eCopper"));
});

test("the canvas dashes a cross-over cable and restores solid lines after it", () => {
  const calls: string[] = [];
  const ctx = new Proxy({}, { get: (_t, name: string) => (...args: unknown[]) => { calls.push(`${name}:${args.join(",")}`); } }) as never;
  const link = { a: "a", b: "b", from: { x: 0, y: 0 }, to: { x: 100, y: 0 }, kind: "eCross", aPort: "", bPort: "", aState: "green", bState: "green" };
  const { drawScene } = require("../../web/ts/canvas/draw");
  const { Camera } = require("../../web/ts/canvas/camera");
  drawScene(ctx, { devices: [], links: [link], groups: [] }, new Camera({ x: 0, y: 0, zoom: 1 }), { grid: false, width: 200, height: 100 });
  const on = calls.indexOf("setLineDash:10,6");
  expect(on).toBeGreaterThan(-1);
  expect(calls.indexOf("setLineDash:", on)).toBeGreaterThan(on);
});
