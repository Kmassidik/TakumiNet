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
  strokeText(text: string, x: number, y: number): void;
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
/* --ok, --warn, --danger and --muted from tokens.css; canvas fills cannot read CSS variables. */
const STATUS_COLORS: Record<string, string> = { up: "#0a7a3d", degraded: "#e6a23c", down: "#b42318", isolated: "#667085" };
const GRID_WORLD = 25;
const SELECT = "#2b6cb0";
const INK = "#1b1f23";
const MUTED = "#667085";
const HALO = "#ffffff"; /* --panel from tokens.css: the canvas background. */
const ICON_CLEAR = 27;
const STACK_CLEAR = 72;
const DOWNWARD = 0.3;
const PORT_ALONG = 22;
const PORT_ASIDE = 10;

/* The label sits `clear + 22` px from `end` along the cable towards `other`,
 * pushed 10 px perpendicular so it never lies on the line itself. A cable
 * leaving mostly downward (unit y > 0.3) runs under the device's name, model
 * and IP lines, so `deepClear` replaces `clear` to land the label below them. */
export function portLabelAt(end: Point, other: Point, clear = 0, deepClear = clear): Point {
  const dx = other.x - end.x;
  const dy = other.y - end.y;
  const len = Math.hypot(dx, dy);
  if (len === 0) return { x: end.x, y: end.y - clear - PORT_ALONG };
  const ux = dx / len;
  const uy = dy / len;
  const along = (uy > DOWNWARD ? deepClear : clear) + PORT_ALONG;
  return { x: end.x + ux * along - uy * PORT_ASIDE, y: end.y + uy * along + ux * PORT_ASIDE };
}

function haloText(ctx: Canvas2D, text: string, x: number, y: number, color = INK): void {
  ctx.strokeStyle = HALO;
  ctx.lineWidth = 3;
  ctx.strokeText(text, x, y);
  ctx.fillStyle = color;
  ctx.fillText(text, x, y);
}

export function drawScene(ctx: Canvas2D, scene: Scene, camera: Camera, options: DrawOptions): void {
  const { width, height } = options;
  ctx.clearRect(0, 0, width, height);
  if (options.grid) drawGrid(ctx, camera, width, height);
  if (!scene.devices.length && options.empty) drawEmpty(ctx, options, width, height);
  for (const link of scene.links) drawCable(ctx, link, camera, options);
  for (const device of scene.devices) drawDeviceBody(ctx, device, camera, options);
  for (const group of scene.groups) drawGroupBody(ctx, group, camera, options);
  for (const link of scene.links) drawPortLabels(ctx, link, camera);
  for (const device of scene.devices) drawDeviceLabels(ctx, device, camera);
  for (const group of scene.groups) drawGroupLabels(ctx, group, camera);
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
  ctx.fillStyle = INK;
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
  ctx.fillStyle = MUTED;
  ctx.font = "14px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(empty.message, width / 2, height / 2 + 36);
}

function drawCable(ctx: Canvas2D, link: SceneLink, camera: Camera, options: DrawOptions): void {
  const a = camera.toScreen(link.from);
  const b = camera.toScreen(link.to);
  const selected = options.linked?.a === link.a && options.linked?.b === link.b;
  ctx.strokeStyle = selected ? SELECT : link.kind === "eConsole" ? MUTED : INK;
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
}

function drawPortLabels(ctx: Canvas2D, link: SceneLink, camera: Camera): void {
  const a = camera.toScreen(link.from);
  const b = camera.toScreen(link.to);
  const clear = ICON_CLEAR * camera.zoom;
  const deep = STACK_CLEAR * camera.zoom;
  ctx.font = "10px sans-serif";
  ctx.textAlign = "center";
  const atA = portLabelAt(a, b, clear, deep);
  haloText(ctx, link.aPort, atA.x, atA.y, MUTED);
  const atB = portLabelAt(b, a, clear, deep);
  haloText(ctx, link.bPort, atB.x, atB.y, MUTED);
}

function drawDeviceBody(ctx: Canvas2D, device: Scene["devices"][number], camera: Camera, options: DrawOptions): void {
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
}

function drawDeviceLabels(ctx: Canvas2D, device: Scene["devices"][number], camera: Camera): void {
  const origin = camera.toScreen({ x: device.box.x, y: device.box.y });
  const cx = origin.x + (device.box.w * camera.zoom) / 2;
  ctx.textAlign = "center";
  ctx.font = "600 12px sans-serif";
  haloText(ctx, device.name, cx, origin.y + 74 * camera.zoom);
  ctx.font = "10px sans-serif";
  haloText(ctx, device.model, cx, origin.y + 86 * camera.zoom, MUTED);
  if (device.ip) {
    ctx.font = "11px sans-serif";
    haloText(ctx, `${device.ip}/${device.prefix}`, cx, origin.y + 99 * camera.zoom);
  }
}

function drawGroupBody(ctx: Canvas2D, group: Scene["groups"][number], camera: Camera, options: DrawOptions): void {
  const origin = camera.toScreen({ x: group.box.x, y: group.box.y });
  const size = group.box.w * camera.zoom;
  const selected = options.selected?.has(group.id) ?? false;
  ctx.fillStyle = "#eef3fb";
  ctx.fillRect(origin.x, origin.y, size, size);
  ctx.strokeStyle = selected ? SELECT : MUTED;
  ctx.lineWidth = selected ? 2 : 1.5;
  ctx.strokeRect(origin.x, origin.y, size, size);
  ctx.fillStyle = STATUS_COLORS[group.status] ?? STATUS_COLORS.isolated!;
  ctx.beginPath();
  ctx.arc(origin.x + size - 10 * camera.zoom, origin.y + 10 * camera.zoom, 5, 0, Math.PI * 2);
  ctx.fill();
}

function drawGroupLabels(ctx: Canvas2D, group: Scene["groups"][number], camera: Camera): void {
  const origin = camera.toScreen({ x: group.box.x, y: group.box.y });
  const cx = origin.x + (group.box.w * camera.zoom) / 2;
  ctx.textAlign = "center";
  ctx.font = "600 12px sans-serif";
  haloText(ctx, group.name, cx, origin.y + 74 * camera.zoom);
  ctx.font = "10px sans-serif";
  haloText(ctx, `${group.devices} device${group.devices === 1 ? "" : "s"}`, cx, origin.y + 86 * camera.zoom, MUTED);
}

function drawPacket(ctx: Canvas2D, packet: Packet, camera: Camera): void {
  const p = camera.toScreen(packet.at);
  ctx.fillStyle = packet.color;
  ctx.beginPath();
  ctx.arc(p.x, p.y, 7, 0, Math.PI * 2);
  ctx.fill();
}
