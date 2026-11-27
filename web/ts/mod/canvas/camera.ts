export const MIN_ZOOM = 0.1;
export const MAX_ZOOM = 4;

export const clampZoom = (zoom) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, zoom));

export class Camera {
  constructor(state) {
    this.x = state.x;
    this.y = state.y;
    this.zoom = clampZoom(state.zoom);
  }

  toScreen(p) {
    return { x: (p.x - this.x) * this.zoom, y: (p.y - this.y) * this.zoom };
  }

  toWorld(s) {
    return { x: s.x / this.zoom + this.x, y: s.y / this.zoom + this.y };
  }

  zoomAt(screen, factor) {
    const before = this.toWorld(screen);
    this.zoom = clampZoom(this.zoom * factor);
    const after = this.toWorld(screen);
    this.x += before.x - after.x;
    this.y += before.y - after.y;
  }

  pan(dx, dy) {
    this.x -= dx / this.zoom;
    this.y -= dy / this.zoom;
  }
}
