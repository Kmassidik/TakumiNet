import { expect, test } from "bun:test";
import { drawScene, portLabelAt, type Canvas2D } from "../../web/ts/canvas/draw";
import { Camera } from "../../web/ts/canvas/camera";
import { buildScene } from "../../web/ts/canvas/scene";

function recorder(): { ctx: Canvas2D; calls: string[] } {
  const calls: string[] = [];
  const record = (name: string) => (...args: unknown[]) => { calls.push(`${name}:${args.map((a) => (typeof a === "number" ? Math.round(a * 1000) / 1000 : String(a))).join(",")}`); };
  const ctx = new Proxy({}, { get: (_t, name: string) => record(name) }) as Canvas2D;
  return { ctx, calls };
}

const workspace = {
  devices: [
    { id: "a", name: "PC0", model: "PC-PT", icon: "/i.webp", x: 100, y: 100, ip: "10.0.0.2", prefix: 24 },
    { id: "b", name: "Switch0", model: "2960", icon: "/j.webp", x: 300, y: 100, ip: "", prefix: 0 },
  ],
  links: [{ a: "a", b: "b", aPort: "Fa0", bPort: "Fa0/1", aState: "green", bState: "red", kind: "copper" }],
};

test("L39 draw determinism: the same scene and camera make the same context calls", () => {
  const scene = buildScene(workspace);
  const camera = new Camera({ x: 0, y: 0, zoom: 1 });
  const one = recorder();
  const two = recorder();
  drawScene(one.ctx, scene, camera, { grid: true, width: 800, height: 600 });
  drawScene(two.ctx, scene, camera, { grid: true, width: 800, height: 600 });
  expect(one.calls.length).toBeGreaterThan(10);
  expect(two.calls).toEqual(one.calls);
});

test("paint order: every cable stroke lands before the first label", () => {
  const { ctx, calls } = recorder();
  drawScene(ctx, buildScene(workspace), new Camera({ x: 0, y: 0, zoom: 1 }), { grid: false, width: 800, height: 600 });
  const lastCable = calls.lastIndexOf("stroke:");
  const firstLabel = calls.findIndex((c) => c.startsWith("fillText:"));
  expect(lastCable).toBeGreaterThanOrEqual(0);
  expect(firstLabel).toBeGreaterThan(lastCable);
});

test("every label carries a halo: strokeText of the same text right before fillText", () => {
  const { ctx, calls } = recorder();
  drawScene(ctx, buildScene(workspace), new Camera({ x: 0, y: 0, zoom: 1 }), { grid: false, width: 800, height: 600 });
  const labels = calls.filter((c) => c.startsWith("fillText:"));
  expect(labels.length).toBeGreaterThanOrEqual(5);
  for (const label of labels) {
    const at = calls.indexOf(label);
    expect(calls[at - 1]).toBe(label.replace("fillText:", "strokeText:"));
  }
});

test("portLabelAt sits 22px along the cable from its end, 10px off the line", () => {
  expect(portLabelAt({ x: 0, y: 0 }, { x: 100, y: 0 })).toEqual({ x: 22, y: 10 });
  expect(portLabelAt({ x: 0, y: 0 }, { x: 100, y: 0 }, 27)).toEqual({ x: 49, y: 10 });
  expect(portLabelAt({ x: 0, y: 0 }, { x: 0, y: 100 })).toEqual({ x: -10, y: 22 });
  expect(portLabelAt({ x: 5, y: 5 }, { x: 5, y: 5 }, 27)).toEqual({ x: 5, y: -44 });
});

test("each port label is drawn beside its own endpoint, clear of the icon", () => {
  const { ctx, calls } = recorder();
  drawScene(ctx, buildScene(workspace), new Camera({ x: 0, y: 0, zoom: 1 }), { grid: false, width: 800, height: 600 });
  expect(calls).toContain("fillText:Fa0,149,110");
  expect(calls).toContain("fillText:Fa0/1,251,90");
});
