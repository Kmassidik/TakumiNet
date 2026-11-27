/* Marquee selection math, pure so it can be tested without a canvas. */

export function normalizedRect(a, b) {
  return {
    x: Math.min(a.x, b.x),
    y: Math.min(a.y, b.y),
    w: Math.abs(a.x - b.x),
    h: Math.abs(a.y - b.y),
  };
}

export function rectsIntersect(a, b) {
  return a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;
}

export function idsInRect(items, rect) {
  return items.filter((item) => rectsIntersect(item.box, rect)).map((item) => item.id);
}
