import { expect, test } from "bun:test";
import { FrameGuard, POSES, blinkScale, clamp01, damp, gaze, pickSlot, poseAt, smooth, stand, type Slot } from "../../web/ts/landing/motion";

const slot = (top: number, height = 300, extra: Partial<Slot> = {}): Slot => ({ left: 100, top, width: 280, height, pose: "idle", side: "right", ...extra });

test("Takumi stands in the slot nearest the middle of the window", () => {
  const slots = [slot(-100), slot(500), slot(1400)];
  expect(pickSlot(slots, 800)).toBe(1); // centres are at 50, 650 and 1550; the window middle is 400
  expect(pickSlot([slot(100), slot(600)], 800)).toBe(0); // centres 250 and 750: 250 is nearer to 400
  expect(pickSlot([slot(300), slot(600)], 800)).toBe(0);
  expect(pickSlot([slot(900), slot(400)], 800)).toBe(1);
});

test("a slot with no size, or entirely off screen, is never chosen", () => {
  expect(pickSlot([slot(100, 0), { ...slot(100), width: 0 }], 800)).toBe(-1);
  expect(pickSlot([slot(-500), slot(2000)], 800)).toBe(-1);
  expect(pickSlot([], 800)).toBe(-1);
  expect(pickSlot([slot(-500), slot(300)], 800)).toBe(1);
});

test("he rests his feet on the bottom of the slot and is drawn as big as the slot is tall", () => {
  const p = stand({ left: 100, top: 200, width: 300, height: 280 }, 1000, 800, 2.8);
  expect(p.scale).toBeCloseTo(100, 9);
  expect(p.x).toBe(100 + 150 - 500); // slot middle, measured from the window middle
  expect(p.y).toBe(400 - (200 + 280)); // slot bottom, measured upward from the window middle
});

test("a slot or model with no height gives a harmless scale of 1", () => {
  expect(stand({ left: 0, top: 0, width: 10, height: 0 }, 100, 100, 2.8).scale).toBe(1);
  expect(stand({ left: 0, top: 0, width: 10, height: 10 }, 100, 100, 0).scale).toBe(1);
});

test("damping reaches its target and never overshoots, at any frame rate", () => {
  for (const dt of [1 / 240, 1 / 60, 1 / 10, 5]) {
    let x = 0;
    for (let i = 0; i < 2000; i++) {
      x = damp(x, 10, 6, dt);
      expect(x).toBeLessThanOrEqual(10.0000001);
    }
    expect(x).toBeCloseTo(10, 3);
  }
  // the same time passing in one step or many steps gives the same place
  let many = 0;
  for (let i = 0; i < 60; i++) many = damp(many, 10, 6, 1 / 60);
  expect(many).toBeCloseTo(damp(0, 10, 6, 1), 6);
});

test("damping ignores bad numbers instead of spreading them", () => {
  expect(damp(NaN, 5, 6, 0.1)).toBe(5);
  expect(damp(NaN, NaN, 6, 0.1)).toBe(0);
  expect(damp(3, NaN, 6, 0.1)).toBe(3);
  expect(damp(3, 9, 6, 0)).toBe(3);
  expect(damp(3, 9, 6, -1)).toBe(3);
});

test("every pose keeps all its angles inside a safe range, at any time", () => {
  for (const name of [...POSES, "unknown", ""]) {
    for (let t = -3; t < 30; t += 0.37) {
      const p = poseAt(name, t);
      for (const angle of [p.armL, p.armR]) {
        expect(angle).toBeGreaterThanOrEqual(0);
        expect(angle).toBeLessThanOrEqual(3.0);
      }
      expect(Math.abs(p.headTilt)).toBeLessThan(0.3);
      expect(Math.abs(p.headNod)).toBeLessThan(0.3);
      expect(p.bob).toBeGreaterThanOrEqual(0);
      expect(p.bob).toBeLessThan(0.08);
    }
  }
  expect(poseAt("wave", NaN).armR).toBeGreaterThan(2);
});

test("the poses are different from each other, and an unknown name falls back to resting", () => {
  expect(poseAt("wave", 0).armR).toBeGreaterThan(poseAt("idle", 0).armR + 1);
  expect(poseAt("happy", 0).armL).toBeGreaterThan(poseAt("idle", 0).armL + 1);
  expect(poseAt("think", 0).armR).toBeGreaterThan(poseAt("idle", 0).armR);
  expect(poseAt("nonsense", 1)).toEqual(poseAt("idle", 1));
});

test("he blinks briefly, about every four seconds, and the eyes are open the rest of the time", () => {
  expect(blinkScale(1)).toBe(1);
  expect(blinkScale(4.2 + 0.07)).toBeLessThan(0.2);
  let shut = 0;
  for (let t = 0; t < 4.2; t += 0.01) if (blinkScale(t) < 1) shut++;
  expect(shut).toBeLessThan(20);
  expect(blinkScale(NaN)).toBe(1);
  expect(blinkScale(1, 0.1, 0.5)).toBe(1);
  expect(blinkScale(-0.5)).toBe(1);
});

test("gaze stays between -1 and 1 and survives bad input", () => {
  expect(gaze(5)).toBe(1);
  expect(gaze(-5)).toBe(-1);
  expect(gaze(0.25)).toBe(0.25);
  expect(gaze(NaN)).toBe(0);
});

test("easing helpers stay inside 0 to 1", () => {
  expect(clamp01(2)).toBe(1);
  expect(clamp01(-1)).toBe(0);
  expect(clamp01(NaN)).toBe(0);
  expect(smooth(0)).toBe(0);
  expect(smooth(1)).toBe(1);
  expect(smooth(0.5)).toBe(0.5);
});

test("the frame guard trips only after a full window of slow frames", () => {
  const g = new FrameGuard(33, 5);
  for (let i = 0; i < 4; i++) expect(g.add(60)).toBe(false);
  expect(g.add(60)).toBe(true);
  const fast = new FrameGuard(33, 5);
  for (let i = 0; i < 10; i++) expect(fast.add(16)).toBe(false);
  const mixed = new FrameGuard(33, 4);
  [16, 16, 16].forEach((t) => mixed.add(t));
  expect(mixed.add(70)).toBe(false);
  expect(fast.add(NaN)).toBe(false);
  expect(fast.add(-4)).toBe(false);
});
