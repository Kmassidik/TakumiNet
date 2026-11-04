import type { Camera, Point } from "./camera";
import type { Scene, SceneLink } from "./scene";
import { noteBox, type NoteInput } from "./notes";

export interface Canvas2D {
  fillStyle: string;
  strokeStyle: string;
  lineWidth: number;
  font: string;
  textAlign: string;
  clearRect(x: number, y: number, w: number, h: number): void;
  strokeRect(x: number, y: number, w: number, h: number): void;
  fillRect(x: number, y: number, w: number, h: number): void;
  fillText(text: string, x: number, y: number): void;
  beginPath(): void;
  moveTo(x: number, y: number): void;
  lineTo(x: number, y: number): void;
  stroke(): void;
  arc(x: number, y: number, r: number, start: number, end: number): void;
  fill(): void;
  drawImage(image: unknown, x: number, y: number, w: number, h: number): void;
}

export interface Packet {
  at: Point;
  color: string;
}

export interface DrawOptions {
  width: number;
  height: number;
  grid: boolean;
  image?: (src: string) => unknown;
  selected?: ReadonlySet<string>;
  marked?: ReadonlySet<string>;
  linked?: { a: string; b: string } | null;
  packets?: readonly Packet[];
  empty?: { message: string; mascot?: string };
  notes?: readonly NoteInput[];
  selectedNote?: string | null;
}

const LED_COLORS: Record<string, string> = { green: "#0a7a3d", amber: "#c98a00", red: "#c62828" };
const GRID_WORLD = 25;
const SELECT = "#2b6cb0";

export function drawScene(ctx: Canvas2D, scene: Scene, camera: Camera, options: DrawOptions): void {
  const { width, height } = options;
  ctx.clearRect(0, 0, width, height);
  if (options.grid) drawGrid(ctx, camera, width, height);
  if (!scene.devices.length && options.empty) drawEmpty(ctx, options, width, height);
  for (const link of scene.links) drawLink(ctx, link, camera, options);
  for (const device of scene.devices) drawDevice(ctx, device, camera, options);
  for (const packet of options.packets ?? []) drawPacket(ctx, packet, camera);
  for (const note of options.notes ?? []) drawNote(ctx, note, camera, options.selectedNote ?? null);
}

function drawNote(ctx: Canvas2D, note: NoteInput, camera: Camera, selected: string | null): void {
  const box = noteBox(note);
  const at = camera.toScreen({ x: box.x, y: box.y });
  const z = camera.zoom;
  ctx.fillStyle = note.color;
  ctx.fillRect(at.x, at.y, box.w * z, box.h * z);
  ctx.strokeStyle = selected === note.id ? SELECT : "#b9c0c7";
  ctx.lineWidth = selected === note.id ? 2 : 1;
  ctx.strokeRect(at.x, at.y, box.w * z, box.h * z);
  ctx.fillStyle = "#1b1f23";
  ctx.font = `${Math.max(8, 12 * z)}px sans-serif`;
  ctx.textAlign = "left";
  box.lines.forEach((line, i) => ctx.fillText(line, at.x + 10 * z, at.y + (22 + i * 16) * z));
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

function drawEmpty(ctx: Canvas2D, options: DrawOptions, width: number, height: number): void {
  const empty = options.empty!;
  const image = empty.mascot ? options.image?.(empty.mascot) : undefined;
  if (image) ctx.drawImage(image, width / 2 - 48, height / 2 - 84, 96, 96);
  ctx.fillStyle = "#667085";
  ctx.font = "14px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(empty.message, width / 2, height / 2 + 36);
}

function drawLink(ctx: Canvas2D, link: SceneLink, camera: Camera, options: DrawOptions): void {
  const a = camera.toScreen(link.from);
  const b = camera.toScreen(link.to);
  const selected = options.linked?.a === link.a && options.linked?.b === link.b;
  ctx.strokeStyle = selected ? SELECT : link.kind === "eConsole" ? "#667085" : "#1b1f23";
  ctx.lineWidth = selected ? 3 : 2;
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
  if (options.selected?.has(device.id) || options.marked?.has(device.id)) {
    ctx.strokeStyle = options.marked?.has(device.id) ? "#c98a00" : SELECT;
    ctx.lineWidth = 2;
    ctx.strokeRect(origin.x, origin.y, size, size);
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

function drawPacket(ctx: Canvas2D, packet: Packet, camera: Camera): void {
  const p = camera.toScreen(packet.at);
  ctx.fillStyle = packet.color;
  ctx.beginPath();
  ctx.arc(p.x, p.y, 7, 0, Math.PI * 2);
  ctx.fill();
}
