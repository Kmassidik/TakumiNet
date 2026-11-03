import type { Point } from "./camera";
import type { Scene, SceneDevice } from "./scene";

/* Top-most device under the point: later devices are drawn on top. */
export function hitDevice(scene: Scene, p: Point): SceneDevice | null {
  for (let i = scene.devices.length - 1; i >= 0; i--) {
    const d = scene.devices[i]!;
    const { x, y, w, h } = d.box;
    if (p.x >= x && p.x <= x + w && p.y >= y && p.y <= y + h) return d;
  }
  return null;
}
