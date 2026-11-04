import { expect, test } from "bun:test";
import { drawScene, type Canvas2D } from "../../web/ts/canvas/draw";
import { Camera } from "../../web/ts/canvas/camera";
import { buildScene } from "../../web/ts/canvas/scene";

const noop = new Proxy({ canvas: { width: 1200, height: 700 } } as Record<string, unknown>, {
  get: (target, name: string) => (name in target ? target[name] : () => {}),
  set: (target, name: string, value) => { target[name] = value; return true; },
}) as unknown as Canvas2D;

function largeWorkspace() {
  const devices = Array.from({ length: 200 }, (_, i) => ({
    id: `d${i}`, name: `D${i}`, model: "PC-PT", kind: "pc", icon: "", x: (i % 20) * 60, y: Math.floor(i / 20) * 70, ip: "10.0.0.1", prefix: 24,
  }));
  const links = Array.from({ length: 300 }, (_, i) => ({
    a: `d${i % 200}`, b: `d${(i * 7 + 3) % 200}`, aPort: "Fa0", bPort: "Fa1", aState: "green", bState: "red", kind: "copper",
  })).filter((l) => l.a !== l.b);
  return { devices, links };
}

test("L44 redraw cost (logic only): 200 devices and about 300 links draw in under 8 ms on average", () => {
  const scene = buildScene(largeWorkspace());
  const camera = new Camera({ x: 0, y: 0, zoom: 1 });
  const options = { grid: true, width: 1200, height: 700, selected: new Set(["d1"]) };
  drawScene(noop, scene, camera, options);
  const runs = 30;
  const start = performance.now();
  for (let i = 0; i < runs; i++) drawScene(noop, scene, camera, options);
  const average = (performance.now() - start) / runs;
  console.log(`average redraw of 200 devices / ${scene.links.length} links: ${average.toFixed(2)} ms`);
  expect(average).toBeLessThan(8);
});
