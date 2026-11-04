import { expect, test } from "bun:test";
import { cursorFor, wheelAction } from "../../web/ts/canvas/pointer_rules";

const wheel = (over: Partial<Parameters<typeof wheelAction>[0]>) =>
  wheelAction({ deltaX: 0, deltaY: 0, deltaMode: 0, ctrlKey: false, ...over });

test("a pinch (ctrl wheel) zooms in proportion to the gesture", () => {
  const small = wheel({ ctrlKey: true, deltaY: -10 });
  const big = wheel({ ctrlKey: true, deltaY: -50 });
  if (small.kind !== "zoom" || big.kind !== "zoom") throw new Error("expected zoom");
  expect(small.factor).toBeGreaterThan(1);
  expect(big.factor).toBeGreaterThan(small.factor);
  const out = wheel({ ctrlKey: true, deltaY: 50 });
  if (out.kind !== "zoom") throw new Error("expected zoom");
  expect(out.factor).toBeCloseTo(1 / big.factor, 9);
});

test("two-finger scrolling pans by the wheel deltas", () => {
  expect(wheel({ deltaX: 12, deltaY: -4 })).toEqual({ kind: "pan", dx: 12, dy: -4 });
  expect(wheel({ deltaY: 7.5 })).toEqual({ kind: "pan", dx: 0, dy: 7.5 });
  expect(wheel({ deltaX: 3, deltaY: 120 })).toEqual({ kind: "pan", dx: 3, dy: 120 });
});

test("a notched mouse wheel keeps the stepped zoom", () => {
  expect(wheel({ deltaMode: 1, deltaY: -3 })).toEqual({ kind: "zoom", factor: 1.1 });
  expect(wheel({ deltaMode: 1, deltaY: 3 })).toEqual({ kind: "zoom", factor: 1 / 1.1 });
  expect(wheel({ deltaY: -100 })).toEqual({ kind: "zoom", factor: 1.1 });
  expect(wheel({ deltaY: 120 })).toEqual({ kind: "zoom", factor: 1 / 1.1 });
});

test("cursorFor: grab over things, pointer over cables, grabbing while held", () => {
  expect(cursorFor("device", "select", false)).toBe("grab");
  expect(cursorFor("group", "select", false)).toBe("grab");
  expect(cursorFor("note", "select", false)).toBe("grab");
  expect(cursorFor("link", "select", false)).toBe("pointer");
  expect(cursorFor(null, "select", false)).toBe("default");
  expect(cursorFor("device", "select", true)).toBe("grabbing");
  expect(cursorFor(null, "select", true)).toBe("grabbing");
  expect(cursorFor("link", "select", true)).toBe("pointer");
});

test("cursorFor: cable and PDU modes keep the crosshair everywhere", () => {
  expect(cursorFor("device", "crosshair", false)).toBe("crosshair");
  expect(cursorFor("link", "crosshair", false)).toBe("crosshair");
  expect(cursorFor(null, "crosshair", true)).toBe("crosshair");
});
