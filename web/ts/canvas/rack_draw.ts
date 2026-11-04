import type { Camera } from "./camera";
import type { RackLayout } from "./rack_layout";
import type { Canvas2D } from "./draw";

export interface RackDrawOptions {
  selected?: ReadonlySet<string>;
}

export function drawRacks(ctx: Canvas2D, layout: RackLayout, camera: Camera, options: RackDrawOptions): void {
  for (const rack of layout.racks) {
    const origin = camera.toScreen({ x: rack.rect.x, y: rack.rect.y });
    const zoom = camera.zoom;
    ctx.strokeStyle = "#b9c0c7";
    ctx.lineWidth = 1;
    ctx.strokeRect(origin.x, origin.y, rack.rect.w * zoom, rack.rect.h * zoom);
    ctx.fillStyle = "#1b1f23";
    ctx.font = `${Math.max(9, 13 * zoom)}px sans-serif`;
    ctx.textAlign = "left";
    ctx.fillText(rack.label, origin.x + 8 * zoom, origin.y + 18 * zoom);

    for (const box of rack.boxes) {
      const at = camera.toScreen({ x: box.rect.x, y: box.rect.y + rack.rect.y });
      const x = at.x;
      const y = at.y;
      const w = box.rect.w * zoom;
      const h = box.rect.h * zoom;
      const selected = options.selected?.has(box.device.id) ?? false;
      ctx.fillStyle = selected ? "#e8f0fd" : "#f7f8fa";
      ctx.fillRect(x, y, w, h);
      ctx.strokeStyle = selected ? "#0a5ed7" : "#b9c0c7";
      ctx.strokeRect(x, y, w, h);
      ctx.fillStyle = "#1b1f23";
      ctx.font = `${Math.max(9, 12 * zoom)}px sans-serif`;
      ctx.fillText(box.device.name, x + 8 * zoom, y + 22 * zoom);
      ctx.fillStyle = "#667085";
      ctx.font = `${Math.max(8, 10 * zoom)}px sans-serif`;
      ctx.fillText(box.device.model, x + 8 * zoom, y + 40 * zoom);
    }
  }
}
