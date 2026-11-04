/* The maths behind the landing scene, kept free of three.js so it can be tested
   without a browser: where the packet is on its route, and where the camera is
   for a given scroll position. */

export interface V3 {
  x: number;
  y: number;
  z: number;
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const lerp3 = (a: V3, b: V3, t: number): V3 => ({ x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t), z: lerp(a.z, b.z, t) });
const dist = (a: V3, b: V3) => Math.hypot(b.x - a.x, b.y - a.y, b.z - a.z);
export const smooth = (t: number) => t * t * (3 - 2 * t);
export const clamp01 = (t: number) => (Number.isFinite(t) ? Math.min(1, Math.max(0, t)) : 0);

export function routeLength(points: readonly V3[]): number {
  let total = 0;
  for (let i = 1; i < points.length; i++) total += dist(points[i - 1]!, points[i]!);
  return total;
}

/* The point `d` units along a polyline. Before the start it is the first point,
   past the end it is the last, so the packet can never leave its cables. */
export function routeAt(points: readonly V3[], d: number): V3 {
  if (points.length === 0) return { x: 0, y: 0, z: 0 };
  if (points.length === 1 || !(d > 0)) return points[0]!;
  let left = d;
  for (let i = 1; i < points.length; i++) {
    const a = points[i - 1]!;
    const b = points[i]!;
    const len = dist(a, b);
    if (left <= len) return len === 0 ? a : lerp3(a, b, left / len);
    left -= len;
  }
  return points[points.length - 1]!;
}

/* Distance travelled at time `seconds` for a packet that crosses the route at
   `speed` units a second, then waits `pause` seconds before starting again. */
export function loopDistance(seconds: number, speed: number, length: number, pause: number): number {
  if (!(length > 0) || !(speed > 0)) return 0;
  const travel = length / speed;
  const t = ((seconds % (travel + pause)) + (travel + pause)) % (travel + pause);
  return Math.min(length, t * speed);
}

export interface CameraKey {
  at: number; // scroll progress, 0 to 1, strictly increasing across keys
  position: V3;
  look: V3;
}

/* Camera for a scroll progress: moves from key to key, easing in and out of each
   leg. Outside 0..1 it holds the first or last key. */
export function cameraAt(keys: readonly CameraKey[], progress: number): { position: V3; look: V3 } {
  if (keys.length === 0) return { position: { x: 0, y: 0, z: 10 }, look: { x: 0, y: 0, z: 0 } };
  const p = clamp01(progress);
  const first = keys[0]!;
  if (p <= first.at) return { position: first.position, look: first.look };
  for (let i = 1; i < keys.length; i++) {
    const a = keys[i - 1]!;
    const b = keys[i]!;
    if (p <= b.at) {
      const t = smooth((p - a.at) / (b.at - a.at));
      return { position: lerp3(a.position, b.position, t), look: lerp3(a.look, b.look, t) };
    }
  }
  const last = keys[keys.length - 1]!;
  return { position: last.position, look: last.look };
}

/* Scroll progress of the page: 0 at the top, 1 at the bottom. A page that fits
   the window (nothing to scroll) is at 0. */
export function scrollProgress(scrollY: number, pageHeight: number, viewHeight: number): number {
  const room = pageHeight - viewHeight;
  return room > 0 ? clamp01(scrollY / room) : 0;
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
