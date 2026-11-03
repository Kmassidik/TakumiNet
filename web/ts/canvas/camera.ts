export interface Point {
  x: number;
  y: number;
}

export interface CameraState extends Point {
  zoom: number;
}

const MIN_ZOOM = 0.1;
const MAX_ZOOM = 4;

const clampZoom = (zoom: number) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, zoom));

export class Camera {
  x: number;
  y: number;
  zoom: number;

  constructor(state: CameraState) {
    this.x = state.x;
    this.y = state.y;
    this.zoom = clampZoom(state.zoom);
  }

  toScreen(p: Point): Point {
    return { x: (p.x - this.x) * this.zoom, y: (p.y - this.y) * this.zoom };
  }

  toWorld(s: Point): Point {
    return { x: s.x / this.zoom + this.x, y: s.y / this.zoom + this.y };
  }

  zoomAt(screen: Point, factor: number): void {
    const before = this.toWorld(screen);
    this.zoom = clampZoom(this.zoom * factor);
    const after = this.toWorld(screen);
    this.x += before.x - after.x;
    this.y += before.y - after.y;
  }

  pan(dx: number, dy: number): void {
    this.x -= dx / this.zoom;
    this.y -= dy / this.zoom;
  }
}
