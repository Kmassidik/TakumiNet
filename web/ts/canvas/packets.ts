import type { Point } from "./camera";

/* Where a packet is after `elapsedMs` along its hops, or null once it has arrived. */
export function packetAt(points: readonly Point[], elapsedMs: number, segmentMs: number): Point | null {
  const segments = points.length - 1;
  if (segments < 1 || elapsedMs >= segments * segmentMs) return null;
  const index = Math.floor(elapsedMs / segmentMs);
  const f = (elapsedMs % segmentMs) / segmentMs;
  const a = points[index]!;
  const b = points[index + 1]!;
  return { x: a.x + (b.x - a.x) * f, y: a.y + (b.y - a.y) * f };
}
