import type { CameraState } from "./camera";

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

/* The smallest rectangle that holds every box, or null when there is nothing
   to print. Empty workspaces must not produce a blank page. */
export function boundsOf(rects: readonly Rect[]): Rect | null {
  if (!rects.length) return null;
  const x = Math.min(...rects.map((r) => r.x));
  const y = Math.min(...rects.map((r) => r.y));
  const right = Math.max(...rects.map((r) => r.x + r.w));
  const bottom = Math.max(...rects.map((r) => r.y + r.h));
  return { x, y, w: right - x, h: bottom - y };
}

/* A camera that shows all of `bounds` centred on a page of width x height,
   with a margin around it. The zoom never exceeds maxZoom, so one small device
   does not fill the page. */
export function fitCamera(bounds: Rect, width: number, height: number, margin = 40, maxZoom = 2): CameraState {
  const w = Math.max(1, bounds.w + margin * 2);
  const h = Math.max(1, bounds.h + margin * 2);
  const zoom = Math.max(0.01, Math.min(width / w, height / h, maxZoom));
  return {
    zoom,
    x: bounds.x - margin - (width / zoom - w) / 2,
    y: bounds.y - margin - (height / zoom - h) / 2,
  };
}
