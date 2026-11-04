import type { Point } from "./camera";
import type { Scene, SceneDevice, SceneGroup, SceneLink } from "./scene";

/* Top-most device under the point: later devices are drawn on top. */
export function hitDevice(scene: Scene, p: Point): SceneDevice | null {
  for (let i = scene.devices.length - 1; i >= 0; i--) {
    const d = scene.devices[i]!;
    const { x, y, w, h } = d.box;
    if (p.x >= x && p.x <= x + w && p.y >= y && p.y <= y + h) return d;
  }
  return null;
}

/* Group nodes draw on top of devices, so they are hit-tested first. */
export function hitGroup(scene: Scene, p: Point): SceneGroup | null {
  for (let i = scene.groups.length - 1; i >= 0; i--) {
    const g = scene.groups[i]!;
    const { x, y, w, h } = g.box;
    if (p.x >= x && p.x <= x + w && p.y >= y && p.y <= y + h) return g;
  }
  return null;
}

/* Distance from p to the segment ab, in the same units as the points. */
function distanceToSegment(p: Point, a: Point, b: Point): number {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const lengthSquared = dx * dx + dy * dy;
  const t = lengthSquared === 0 ? 0 : Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / lengthSquared));
  return Math.hypot(p.x - (a.x + t * dx), p.y - (a.y + t * dy));
}

/* Link under the point, within `tolerance` world units of its centre line. */
export function hitLink(scene: Scene, p: Point, tolerance: number): SceneLink | null {
  let best: SceneLink | null = null;
  let bestDistance = tolerance;
  for (const link of scene.links) {
    const d = distanceToSegment(p, link.from, link.to);
    if (d <= bestDistance) {
      best = link;
      bestDistance = d;
    }
  }
  return best;
}
