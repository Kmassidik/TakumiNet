import { expect, test } from "bun:test";
import { Camera } from "../../web/ts/canvas/camera";
import { boundsOf, fitCamera, type Rect } from "../../web/ts/canvas/print_view";

test("an empty workspace has no bounds, so nothing is printed", () => {
  expect(boundsOf([])).toBeNull();
});

test("bounds hold every box", () => {
  expect(boundsOf([{ x: 10, y: 20, w: 30, h: 40 }, { x: 100, y: 5, w: 10, h: 10 }])).toEqual({ x: 10, y: 5, w: 100, h: 55 });
});

function contains(camera: Camera, rect: Rect, width: number, height: number): boolean {
  const a = camera.toScreen({ x: rect.x, y: rect.y });
  const b = camera.toScreen({ x: rect.x + rect.w, y: rect.y + rect.h });
  return a.x >= 0 && a.y >= 0 && b.x <= width && b.y <= height;
}

test("every device stays inside the page, for wide, tall, tiny and huge networks", () => {
  const cases: Rect[] = [
    { x: 0, y: 0, w: 4000, h: 300 },
    { x: -500, y: -500, w: 200, h: 3000 },
    { x: 100, y: 100, w: 1, h: 1 },
    { x: 0, y: 0, w: 20000, h: 20000 },
    { x: -9000, y: 7000, w: 640, h: 480 },
  ];
  for (const bounds of cases) {
    const camera = Object.assign(new Camera({ x: 0, y: 0, zoom: 1 }), fitCamera(bounds, 1754, 1240));
    expect(contains(camera, bounds, 1754, 1240), JSON.stringify(bounds)).toBe(true);
  }
});

test("one small device does not fill the page", () => {
  expect(fitCamera({ x: 0, y: 0, w: 60, h: 60 }, 1754, 1240).zoom).toBe(2);
});

test("the picture is centred on the page", () => {
  const bounds = { x: 0, y: 0, w: 400, h: 100 };
  const camera = Object.assign(new Camera({ x: 0, y: 0, zoom: 1 }), fitCamera(bounds, 1000, 1000));
  const centre = camera.toScreen({ x: 200, y: 50 });
  expect(Math.round(centre.x)).toBe(500);
  expect(Math.round(centre.y)).toBe(500);
});
