/* Keeping the canvas picture in step with its box. The drawing buffer must be
   the box size times the pixel ratio, or the picture stretches and clicks miss. */

export interface Size {
  w: number;
  h: number;
}

/* Buffer size for a box. A hidden or collapsed box (0 wide or high) is left
   alone: nothing can be drawn into it, and a 0-size buffer breaks drawing. */
export function bufferSize(css: Size, ratio: number): Size | null {
  if (!(css.w > 0) || !(css.h > 0)) return null;
  const r = ratio > 0 ? ratio : 1;
  return { w: Math.round(css.w * r), h: Math.round(css.h * r) };
}

/* How far the camera's top-left corner moves so the same world point stays in
   the middle of the box when the box changes size. */
export function recenterShift(zoom: number, from: Size, to: Size): { dx: number; dy: number } {
  return { dx: (from.w - to.w) / (2 * zoom), dy: (from.h - to.h) / (2 * zoom) };
}
