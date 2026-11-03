import type { Camera } from "./camera";
import type { Scene } from "./scene";

export interface Canvas2D {
  canvas: { width: number; height: number };
  fillStyle: string;
  strokeStyle: string;
  lineWidth: number;
  font: string;
  textAlign: string;
  clearRect(x: number, y: number, w: number, h: number): void;
  fillRect(x: number, y: number, w: number, h: number): void;
  strokeRect(x: number, y: number, w: number, h: number): void;
  fillText(text: string, x: number, y: number): void;
  beginPath(): void;
  moveTo(x: number, y: number): void;
  lineTo(x: number, y: number): void;
  stroke(): void;
  arc(x: number, y: number, r: number, start: number, end: number): void;
  fill(): void;
  drawImage(image: unknown, x: number, y: number, w: number, h: number): void;
}

export interface DrawOptions {
  grid: boolean;
  image?: (src: string) => unknown;
}

const LED_COLORS: Record<string, string> = { green: "#0a7a3d", amber: "#c98a00", red: "#c62828" };
const GRID_WORLD = 25;

export function drawScene(ctx: Canvas2D, scene: Scene, camera: Camera, options: DrawOptions): void {
  const { width, height } = ctx.canvas;
  ctx.clearRect(0, 0, width, height);
  if (options.grid) drawGrid(ctx, camera, width, height);
  for (const link of scene.links) drawLink(ctx, link, camera);
  for (const device of scene.devices) drawDevice(ctx, device, camera, options);
}

function drawGrid(ctx: Canvas2D, camera: Camera, width: number, height: number): void {
  ctx.strokeStyle = "#e3e8ee";
  ctx.lineWidth = 1;
  const topLeft = camera.toWorld({ x: 0, y: 0 });
  const bottomRight = camera.toWorld({ x: width, y: height });
  for (let x = Math.floor(topLeft.x / GRID_WORLD) * GRID_WORLD; x <= bottomRight.x; x += GRID_WORLD) {
    const sx = camera.toScreen({ x, y: 0 }).x;
    ctx.beginPath();
    ctx.moveTo(sx, 0);
    ctx.lineTo(sx, height);
    ctx.stroke();
  }
  for (let y = Math.floor(topLeft.y / GRID_WORLD) * GRID_WORLD; y <= bottomRight.y; y += GRID_WORLD) {
    const sy = camera.toScreen({ x: 0, y }).y;
    ctx.beginPath();
    ctx.moveTo(0, sy);
    ctx.lineTo(width, sy);
    ctx.stroke();
  }
}

function drawLink(ctx: Canvas2D, link: Scene["links"][number], camera: Camera): void {
  const a = camera.toScreen(link.from);
  const b = camera.toScreen(link.to);
  ctx.strokeStyle = link.kind === "eConsole" ? "#667085" : "#1b1f23";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(a.x, a.y);
  ctx.lineTo(b.x, b.y);
  ctx.stroke();
  for (const [t, state] of [[0.08, link.aState], [0.92, link.bState]] as const) {
    ctx.fillStyle = LED_COLORS[state ?? "red"] ?? LED_COLORS.red!;
    ctx.beginPath();
    ctx.arc(a.x + (b.x - a.x) * t, a.y + (b.y - a.y) * t, 4, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = "#1b1f23";
  ctx.font = "10px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(link.aPort, a.x + (b.x - a.x) * 0.46, a.y + (b.y - a.y) * 0.46);
  ctx.fillText(link.bPort, a.x + (b.x - a.x) * 0.54, a.y + (b.y - a.y) * 0.54);
}

function drawDevice(ctx: Canvas2D, device: Scene["devices"][number], camera: Camera, options: DrawOptions): void {
  const origin = camera.toScreen({ x: device.box.x, y: device.box.y });
  const size = device.box.w * camera.zoom;
  const image = options.image?.(device.icon);
  if (image) {
    ctx.drawImage(image, origin.x + 9 * camera.zoom, origin.y + 4 * camera.zoom, 54 * camera.zoom, 54 * camera.zoom);
  }
  ctx.fillStyle = "#1b1f23";
  ctx.font = "12px sans-serif";
  ctx.textAlign = "center";
  const cx = origin.x + size / 2;
  ctx.fillText(device.name, cx, origin.y + 74 * camera.zoom);
  ctx.fillStyle = "#667085";
  ctx.fillText(device.model, cx, origin.y + 86 * camera.zoom);
  if (device.ip) ctx.fillText(`${device.ip}/${device.prefix}`, cx, origin.y + 98 * camera.zoom);
}
