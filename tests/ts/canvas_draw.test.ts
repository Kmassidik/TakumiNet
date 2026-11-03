import { expect, test } from "bun:test";
import { drawScene, type Canvas2D } from "../../web/ts/canvas/draw";
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
