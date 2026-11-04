import { expect, test } from "bun:test";
import { Camera } from "../../web/ts/canvas/camera";

function rng(seed: number) {
  let state = seed;
  return () => {
    state = (state * 1103515245 + 12345) & 0x7fffffff;
    return state / 0x7fffffff;
  };
}

test("L37 camera round trip: toWorld(toScreen(p)) equals p for random zoom and pan", () => {
  const next = rng(7);
  for (let i = 0; i < 2000; i++) {
    const camera = new Camera({ x: next() * 2000 - 1000, y: next() * 2000 - 1000, zoom: 0.1 + next() * 3.9 });
    const p = { x: next() * 4000 - 2000, y: next() * 4000 - 2000 };
    const back = camera.toWorld(camera.toScreen(p));
    expect(Math.abs(back.x - p.x)).toBeLessThan(1e-6);
    expect(Math.abs(back.y - p.y)).toBeLessThan(1e-6);
  }
});

test("zoom keeps the point under the cursor fixed and stays within 10% to 400%", () => {
  const camera = new Camera({ x: 0, y: 0, zoom: 1 });
  const cursor = { x: 300, y: 200 };
  const before = camera.toWorld(cursor);
  camera.zoomAt(cursor, 2);
  const after = camera.toWorld(cursor);
  expect(Math.abs(after.x - before.x)).toBeLessThan(1e-9);
  expect(Math.abs(after.y - before.y)).toBeLessThan(1e-9);
  for (let i = 0; i < 50; i++) camera.zoomAt(cursor, 2);
  expect(camera.zoom).toBe(4);
  for (let i = 0; i < 80; i++) camera.zoomAt(cursor, 0.5);
  expect(camera.zoom).toBe(0.1);
});

test("panning moves the view with the cursor: a point follows the pointer", () => {
  const camera = new Camera({ x: 0, y: 0, zoom: 2 });
  const point = { x: 50, y: 40 };
  const before = camera.toScreen(point);
  camera.pan(30, -20);
  const after = camera.toScreen(point);
  expect(after.x - before.x).toBeCloseTo(30, 9);
  expect(after.y - before.y).toBeCloseTo(-20, 9);
});
