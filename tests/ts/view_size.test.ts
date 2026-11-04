import { expect, test } from "bun:test";
import { Camera } from "../../web/ts/canvas/camera";
import { bufferSize, recenterShift } from "../../web/ts/canvas/view_size";

test("the buffer is the box size times the pixel ratio", () => {
  expect(bufferSize({ w: 1176, h: 501 }, 2)).toEqual({ w: 2352, h: 1002 });
  expect(bufferSize({ w: 1512, h: 413 }, 2)).toEqual({ w: 3024, h: 826 });
  expect(bufferSize({ w: 100.4, h: 50.5 }, 1.5)).toEqual({ w: 151, h: 76 });
});

test("a hidden, collapsed or broken box gives no buffer instead of a zero-size one", () => {
  expect(bufferSize({ w: 0, h: 400 }, 2)).toBeNull();
  expect(bufferSize({ w: 400, h: 0 }, 2)).toBeNull();
  expect(bufferSize({ w: NaN, h: 400 }, 2)).toBeNull();
  expect(bufferSize({ w: -5, h: 400 }, 2)).toBeNull();
});

test("a missing or zero pixel ratio counts as 1", () => {
  expect(bufferSize({ w: 10, h: 10 }, 0)).toEqual({ w: 10, h: 10 });
  expect(bufferSize({ w: 10, h: 10 }, NaN)).toEqual({ w: 10, h: 10 });
});

test("the same world point stays in the middle when the box grows or shrinks", () => {
  for (const zoom of [0.25, 1, 2.5]) {
    for (const [from, to] of [
      [{ w: 1176, h: 413 }, { w: 1512, h: 501 }],
      [{ w: 1512, h: 501 }, { w: 800, h: 300 }],
    ] as const) {
      const camera = new Camera({ x: 120, y: -40, zoom });
      const before = camera.toWorld({ x: from.w / 2, y: from.h / 2 });
      const { dx, dy } = recenterShift(camera.zoom, from, to);
      camera.x += dx;
      camera.y += dy;
      const after = camera.toWorld({ x: to.w / 2, y: to.h / 2 });
      expect(after.x).toBeCloseTo(before.x, 6);
      expect(after.y).toBeCloseTo(before.y, 6);
    }
  }
});
