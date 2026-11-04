/* The maths behind Takumi on the landing page, kept free of three.js so it can be
   tested without a browser: which spot he stands in, how big he is there, what
   pose he strikes, when he blinks, and when the live scene should give up. */

export const clamp01 = (t: number) => (Number.isFinite(t) ? Math.min(1, Math.max(0, t)) : 0);
export const smooth = (t: number) => t * t * (3 - 2 * t);

/* Moves `from` toward `to` the same distance per second whatever the frame rate. */
export function damp(from: number, to: number, rate: number, dt: number): number {
  if (!Number.isFinite(from)) return Number.isFinite(to) ? to : 0;
  if (!Number.isFinite(to) || !(dt > 0)) return from;
  return to + (from - to) * Math.exp(-Math.max(0, rate) * dt);
}

export interface Box {
  left: number;
  top: number;
  width: number;
  height: number;
}

export interface Slot extends Box {
  pose: string;
  side: "left" | "right" | "center";
}

/* The slot Takumi should stand in: the visible one whose middle is nearest the
   middle of the window. Slots with no size, or fully off screen, never win. */
export function pickSlot(slots: readonly Slot[], viewHeight: number): number {
  let best = -1;
  let bestDistance = Infinity;
  slots.forEach((slot, i) => {
    if (!(slot.width > 0) || !(slot.height > 0)) return;
    if (slot.top + slot.height < 0 || slot.top > viewHeight) return;
    const distance = Math.abs(slot.top + slot.height / 2 - viewHeight / 2);
    if (distance < bestDistance) {
      best = i;
      bestDistance = distance;
    }
  });
  return best;
}

/* Where Takumi stands, in window pixels measured from the middle of the window
   (y up), and how many times larger than the model's own height he is drawn.
   His feet rest on the bottom of the slot. */
export function stand(slot: Box, viewWidth: number, viewHeight: number, modelHeight: number): { x: number; y: number; scale: number } {
  const scale = modelHeight > 0 && slot.height > 0 ? slot.height / modelHeight : 1;
  return {
    x: slot.left + slot.width / 2 - viewWidth / 2,
    y: viewHeight / 2 - (slot.top + slot.height),
    scale,
  };
}

export interface Pose {
  armL: number; // rotation around the shoulder, radians (positive lifts the arm out and up)
  armR: number;
  headTilt: number;
  headNod: number;
  bob: number; // how much he bobs, as a fraction of his height
  lean: number; // turn toward the text
}

export const POSES = ["idle", "wave", "think", "happy"] as const;
export type PoseName = (typeof POSES)[number];

const REST = 0.12;

/* The target pose at time `t` seconds. Every angle stays inside a safe range, so a
   bad pose name or time can never twist him into something broken. */
export function poseAt(name: string, t: number): Pose {
  const s = Number.isFinite(t) ? t : 0;
  switch (name) {
    case "wave":
      return { armL: REST, armR: 2.5 + Math.sin(s * 7) * 0.32, headTilt: 0.08 + Math.sin(s * 2) * 0.03, headNod: 0, bob: 0.012, lean: 0 };
    case "think":
      return { armL: REST, armR: 1.25, headTilt: -0.14, headNod: 0.05, bob: 0.006, lean: 0 };
    case "happy":
      return { armL: 2.6 + Math.sin(s * 8) * 0.15, armR: 2.6 + Math.sin(s * 8 + 1) * 0.15, headTilt: Math.sin(s * 4) * 0.06, headNod: -0.05, bob: 0.03 + Math.abs(Math.sin(s * 5)) * 0.02, lean: 0 };
    default:
      return { armL: REST + Math.sin(s * 1.2) * 0.04, armR: REST + Math.sin(s * 1.2 + 2) * 0.04, headTilt: Math.sin(s * 0.9) * 0.04, headNod: 0, bob: 0.01, lean: 0 };
  }
}

/* Eye height as a fraction of full: 1 open, dipping to 0.08 for a blink about every four seconds. */
export function blinkScale(t: number, period = 4.2, length = 0.14): number {
  if (!Number.isFinite(t) || !(period > length) || !(length > 0)) return 1;
  const phase = ((t % period) + period) % period;
  if (phase > length) return 1;
  const k = Math.sin((phase / length) * Math.PI);
  return 1 - 0.92 * k;
}

/* How far, from -1 to 1, the eyes turn toward the pointer. */
export function gaze(pointer: number): number {
  return Math.max(-1, Math.min(1, Number.isFinite(pointer) ? pointer : 0));
}

/* Keeps the live scene from hurting a slow machine: true once the average frame
   time over `window` frames is above the limit. */
export class FrameGuard {
  private times: number[] = [];

  constructor(private readonly limitMs: number, private readonly window: number) {}

  add(frameMs: number): boolean {
    if (!Number.isFinite(frameMs) || frameMs <= 0) return false;
    this.times.push(frameMs);
    if (this.times.length > this.window) this.times.shift();
    if (this.times.length < this.window) return false;
    return this.times.reduce((a, b) => a + b, 0) / this.times.length > this.limitMs;
  }
}
