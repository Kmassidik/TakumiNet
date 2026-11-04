/* Pure decisions for wheel and cursor behaviour, kept apart from the canvas so
   they can be tested without a browser. */

export interface WheelLike {
  deltaX: number;
  deltaY: number;
  deltaMode: number;
  ctrlKey: boolean;
}

export type WheelAction =
  | { kind: "zoom"; factor: number }
  | { kind: "pan"; dx: number; dy: number };

const STEP = 1.1;
const PINCH_SCALE = 0.01;

/* Browsers report a trackpad pinch as a ctrlKey wheel, so that zooms in
   proportion to the gesture. A wheel in lines or pages is a real mouse wheel
   and keeps the stepped zoom, as does the pixel-mode shape Chromium gives a
   notched wheel: vertical only, whole numbers, 100 pixels or more per notch.
   Everything else is two-finger scrolling and pans. The pixel-mode test is a
   heuristic: a very fast trackpad flick can look like a notch and zoom once. */
export function wheelAction(ev: WheelLike): WheelAction {
  if (ev.ctrlKey) return { kind: "zoom", factor: Math.exp(-ev.deltaY * PINCH_SCALE) };
  const stepped = ev.deltaY < 0 ? STEP : 1 / STEP;
  if (ev.deltaMode !== 0) return { kind: "zoom", factor: stepped };
  const notch = ev.deltaX === 0 && Math.abs(ev.deltaY) >= 100 && Number.isInteger(ev.deltaY);
  if (notch) return { kind: "zoom", factor: stepped };
  return { kind: "pan", dx: ev.deltaX, dy: ev.deltaY };
}

export type HoverHit = "device" | "group" | "link" | "note" | null;
export type CanvasMode = "select" | "crosshair";

/* `held` is true while the pointer drags something or pans the view. */
export function cursorFor(hit: HoverHit, mode: CanvasMode, held: boolean): string {
  if (mode === "crosshair") return "crosshair";
  if (held) return hit === "link" ? "pointer" : "grabbing";
  if (hit === "link") return "pointer";
  if (hit) return "grab";
  return "default";
}
