import { expect, test } from "bun:test";
import { placeMenu, placeSubmenu } from "../../web/ts/ui/menu_place";

const view = { w: 800, h: 600 };

test("a menu with room opens exactly at the pointer", () => {
  expect(placeMenu({ x: 100, y: 120 }, { w: 180, h: 200 }, view)).toEqual({ x: 100, y: 120 });
});

test("a menu near the right or bottom edge is pulled back inside the viewport", () => {
  expect(placeMenu({ x: 790, y: 300 }, { w: 180, h: 200 }, view)).toEqual({ x: 616, y: 300 });
  expect(placeMenu({ x: 300, y: 590 }, { w: 180, h: 200 }, view)).toEqual({ x: 300, y: 396 });
});

test("a menu never leaves the top-left margin, even in a tiny viewport", () => {
  expect(placeMenu({ x: -20, y: -20 }, { w: 180, h: 200 }, view)).toEqual({ x: 4, y: 4 });
  expect(placeMenu({ x: 50, y: 50 }, { w: 180, h: 200 }, { w: 100, h: 100 })).toEqual({ x: 4, y: 4 });
});

test("a submenu opens to the right of its parent item", () => {
  const spot = placeSubmenu({ x: 100, y: 200, w: 170, h: 24 }, { w: 150, h: 120 }, view);
  expect(spot).toEqual({ x: 268, y: 196 });
});

test("a submenu flips to the left when the right side has no room", () => {
  const spot = placeSubmenu({ x: 620, y: 200, w: 170, h: 24 }, { w: 150, h: 120 }, view);
  expect(spot).toEqual({ x: 472, y: 196 });
});

test("a submenu near the bottom edge stays inside the viewport", () => {
  const spot = placeSubmenu({ x: 100, y: 560, w: 170, h: 24 }, { w: 150, h: 120 }, view);
  expect(spot.y).toBe(476);
});
