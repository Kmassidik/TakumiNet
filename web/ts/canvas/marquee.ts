import type { Point } from "./camera";
import type { Rect } from "./print_view";

/* Marquee selection math, pure so it can be tested without a canvas. */

export function normalizedRect(a: Point, b: Point): Rect {
  return {
    x: Math.min(a.x, b.x),
    y: Math.min(a.y, b.y),
    w: Math.abs(a.x - b.x),
    h: Math.abs(a.y - b.y),
  };
}

export function rectsIntersect(a: Rect, b: Rect): boolean {
  return a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;
}

export function idsInRect(items: readonly { id: string; box: Rect }[], rect: Rect): string[] {
  return items.filter((item) => rectsIntersect(item.box, rect)).map((item) => item.id);
}
