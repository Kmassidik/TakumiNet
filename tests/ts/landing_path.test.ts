import { expect, test } from "bun:test";
import { FrameGuard, cameraAt, clamp01, loopDistance, routeAt, routeLength, scrollProgress, type CameraKey, type V3 } from "../../web/ts/landing/path";

const route: V3[] = [{ x: 0, y: 0, z: 0 }, { x: 3, y: 0, z: 4 }, { x: 3, y: 0, z: 14 }];

test("the route length is the sum of its legs", () => {
  expect(routeLength(route)).toBeCloseTo(5 + 10, 9);
  expect(routeLength([])).toBe(0);
  expect(routeLength([route[0]!])).toBe(0);
});

test("the packet stays on the cables, from the first point to the last", () => {
  expect(routeAt(route, 0)).toEqual(route[0]!);
  expect(routeAt(route, 5)).toEqual(route[1]!);
  expect(routeAt(route, 15)).toEqual(route[2]!);
  const mid = routeAt(route, 2.5);
  expect(mid.x).toBeCloseTo(1.5, 9);
  expect(mid.z).toBeCloseTo(2, 9);
});

test("before the start, past the end, and on bad numbers it stays at an end", () => {
  expect(routeAt(route, -4)).toEqual(route[0]!);
  expect(routeAt(route, 1e9)).toEqual(route[2]!);
  expect(routeAt(route, NaN)).toEqual(route[0]!);
  expect(routeAt([], 3)).toEqual({ x: 0, y: 0, z: 0 });
  expect(routeAt([route[1]!], 3)).toEqual(route[1]!);
});

test("a packet never moves backwards while it travels, then waits, then restarts", () => {
  let last = -1;
  for (let t = 0; t < 6; t += 0.1) {
    const d = loopDistance(t, 3, 15, 2);
    expect(d).toBeGreaterThanOrEqual(last);
    last = d;
  }
  expect(loopDistance(5, 3, 15, 2)).toBe(15); // arrived
  expect(loopDistance(6, 3, 15, 2)).toBe(15); // waiting
  expect(loopDistance(7.01, 3, 15, 2)).toBeCloseTo(0.03, 1); // started again
  expect(loopDistance(-1, 3, 15, 2)).toBeGreaterThanOrEqual(0);
  expect(loopDistance(3, 0, 15, 2)).toBe(0);
  expect(loopDistance(3, 3, 0, 2)).toBe(0);
});

const keys: CameraKey[] = [
  { at: 0, position: { x: 0, y: 10, z: 20 }, look: { x: 0, y: 0, z: 0 } },
  { at: 0.5, position: { x: 5, y: 4, z: 8 }, look: { x: 2, y: 0, z: 0 } },
  { at: 1, position: { x: 0, y: 12, z: 18 }, look: { x: 0, y: 0, z: -2 } },
];

test("the camera is exactly on each key at its scroll position", () => {
  for (const k of keys) {
    const c = cameraAt(keys, k.at);
    expect(c.position.x).toBeCloseTo(k.position.x, 9);
    expect(c.position.y).toBeCloseTo(k.position.y, 9);
    expect(c.look.z).toBeCloseTo(k.look.z, 9);
  }
});

test("scrolling past either end, or on a bad value, holds the first or last key", () => {
  expect(cameraAt(keys, -3).position).toEqual(keys[0]!.position);
  expect(cameraAt(keys, 9).position).toEqual(keys[2]!.position);
  expect(cameraAt(keys, NaN).position).toEqual(keys[0]!.position);
  expect(cameraAt([], 0.5).position.z).toBe(10);
});

test("between two keys the camera stays between them and never jumps", () => {
  let prev = cameraAt(keys, 0).position;
  for (let p = 0.01; p <= 1; p += 0.01) {
    const c = cameraAt(keys, p).position;
    expect(Math.hypot(c.x - prev.x, c.y - prev.y, c.z - prev.z)).toBeLessThan(1.2);
    prev = c;
  }
  const leg = cameraAt(keys, 0.25).position;
  expect(leg.y).toBeLessThanOrEqual(10);
  expect(leg.y).toBeGreaterThanOrEqual(4);
});

test("scroll progress runs from 0 to 1 and a page that fits does not scroll", () => {
  expect(scrollProgress(0, 3000, 800)).toBe(0);
  expect(scrollProgress(2200, 3000, 800)).toBe(1);
  expect(scrollProgress(1100, 3000, 800)).toBe(0.5);
  expect(scrollProgress(500, 700, 800)).toBe(0);
  expect(scrollProgress(-50, 3000, 800)).toBe(0);
  expect(clamp01(2)).toBe(1);
  expect(clamp01(NaN)).toBe(0);
});

test("the frame guard trips only after a full window of slow frames", () => {
  const g = new FrameGuard(33, 5);
  for (let i = 0; i < 4; i++) expect(g.add(60)).toBe(false);
  expect(g.add(60)).toBe(true);
  const fast = new FrameGuard(33, 5);
  for (let i = 0; i < 10; i++) expect(fast.add(16)).toBe(false);
  const mixed = new FrameGuard(33, 4);
  [16, 16, 16].forEach((t) => mixed.add(t));
  expect(mixed.add(70)).toBe(false); // average 29.5
  expect(fast.add(NaN)).toBe(false);
  expect(fast.add(-4)).toBe(false);
});
