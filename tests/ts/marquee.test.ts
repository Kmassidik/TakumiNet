import { expect, test } from "bun:test";
import { idsInRect, normalizedRect, rectsIntersect } from "../../web/ts/canvas/marquee";
import { drawScene, type Canvas2D } from "../../web/ts/canvas/draw";
import { buildScene } from "../../web/ts/canvas/scene";
import { Camera } from "../../web/ts/canvas/camera";

function recorder(): { ctx: Canvas2D; calls: string[] } {
  const calls: string[] = [];
  const record = (name: string) => (...args: unknown[]) => { calls.push(`${name}:${args.map(String).join(",")}`); };
  const ctx = new Proxy({}, { get: (_t, name: string) => record(name) }) as Canvas2D;
  return { ctx, calls };
}

const workspace = {
  devices: [
    { id: "a", name: "PC0", model: "PC-PT", icon: "/i.webp", x: 100, y: 100, ip: "", prefix: 0 },
    { id: "b", name: "PC1", model: "PC-PT", icon: "/i.webp", x: 400, y: 100, ip: "", prefix: 0 },
  ],
  links: [],
};

test("a drag in any direction normalizes to the same rectangle", () => {
  const down = normalizedRect({ x: 10, y: 20 }, { x: 110, y: 90 });
  const up = normalizedRect({ x: 110, y: 90 }, { x: 10, y: 20 });
  expect(down).toEqual({ x: 10, y: 20, w: 100, h: 70 });
  expect(up).toEqual(down);
});

test("boxes that merely touch an edge do not intersect", () => {
  const rect = { x: 0, y: 0, w: 50, h: 50 };
  expect(rectsIntersect(rect, { x: 49, y: 49, w: 10, h: 10 })).toBe(true);
  expect(rectsIntersect(rect, { x: 50, y: 0, w: 10, h: 10 })).toBe(false);
});

test("the marquee selects every device whose box it crosses", () => {
  const items = [
    { id: "a", box: { x: 64, y: 66, w: 72, h: 72 } },
    { id: "b", box: { x: 364, y: 66, w: 72, h: 72 } },
    { id: "c", box: { x: 664, y: 66, w: 72, h: 72 } },
  ];
  expect(idsInRect(items, { x: 0, y: 0, w: 500, h: 300 })).toEqual(["a", "b"]);
  expect(idsInRect(items, { x: 130, y: 100, w: 10, h: 10 })).toEqual(["a"]);
  expect(idsInRect(items, { x: 1000, y: 0, w: 50, h: 50 })).toEqual([]);
});

test("a live marquee draws as a dashed rectangle over everything else", () => {
  const { ctx, calls } = recorder();
  drawScene(ctx, buildScene(workspace), new Camera({ x: 0, y: 0, zoom: 1 }), {
    grid: false, width: 800, height: 600, marquee: { x: 10, y: 20, w: 100, h: 50 },
  });
  const dash = calls.indexOf("setLineDash:5,4");
  expect(dash).toBeGreaterThan(-1);
  expect(calls[dash + 1]).toBe("strokeRect:10,20,100,50");
  expect(calls[dash + 2]).toBe("setLineDash:");
});

test("a pending cable draws as a dashed line from its device to the cursor", () => {
  const { ctx, calls } = recorder();
  drawScene(ctx, buildScene(workspace), new Camera({ x: 0, y: 0, zoom: 1 }), {
    grid: false, width: 800, height: 600, pending: { from: { x: 100, y: 100 }, to: { x: 250, y: 180 } },
  });
  const dash = calls.indexOf("setLineDash:6,5");
  expect(dash).toBeGreaterThan(-1);
  expect(calls.slice(dash)).toContain("moveTo:100,100");
  expect(calls.slice(dash)).toContain("lineTo:250,180");
});

test("without a marquee or pending cable nothing dashed is drawn", () => {
  const { ctx, calls } = recorder();
  drawScene(ctx, buildScene(workspace), new Camera({ x: 0, y: 0, zoom: 1 }), { grid: false, width: 800, height: 600 });
  expect(calls.some((c) => c.startsWith("setLineDash:"))).toBe(false);
});
