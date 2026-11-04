import { Camera, type Point } from "./camera";
import { hitDevice, hitLink } from "./hit";
import { drawScene, type Canvas2D, type Packet } from "./draw";
import { packetAt } from "./packets";
import { drawRacks } from "./rack_draw";
import { hitNote, noteBox, type NoteInput } from "./notes";
import { boundsOf, fitCamera, type Rect } from "./print_view";
import { hitRackBox, layoutRacks, type RackLayout } from "./rack_layout";
import { buildScene, type Scene, type SceneDevice, type SceneLink, type WorkspaceInput } from "./scene";

export interface CanvasState {
  workspace: WorkspaceInput;
  selected: ReadonlySet<string>;
  marked: ReadonlySet<string>;
  linked: { a: string; b: string } | null;
  grid: boolean;
  empty?: { message: string; mascot?: string };
  physical?: boolean;
  notes?: readonly NoteInput[];
  selectedNote?: string | null;
}

export interface PacketRun {
  points: Point[];
  color: string;
  segmentMs: number;
  onDone?: () => void;
}

export interface PointerHandlers {
  onDeviceDown?: (device: { id: string; name: string }, ev: PointerEvent) => void;
  onLinkDown?: (link: SceneLink, ev: PointerEvent) => void;
  onBackgroundDown?: (ev: PointerEvent) => void;
  onNoteDown?: (note: NoteInput, ev: PointerEvent) => void;
  onHover?: (device: { name: string; model: string } | null, ev: PointerEvent) => void;
}

const LINK_TOLERANCE_PX = 6;

export class WorkspaceCanvas {
  readonly camera = new Camera({ x: 0, y: 0, zoom: 1 });
  handlers: PointerHandlers = {};
  private scene: Scene = { devices: [], links: [] };
  private racks: RackLayout = { racks: [] };
  private state: CanvasState | null = null;
  private readonly ctx: CanvasRenderingContext2D;
  private readonly images = new Map<string, HTMLImageElement>();
  private readonly loading = new Set<string>();
  private packets: { run: PacketRun; start: number }[] = [];
  private frame = 0;
  private panFrom: Point | null = null;
  private spaceDown = false;
  private wasPhysical = false;

  constructor(private readonly canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("canvas 2d context unavailable");
    this.ctx = ctx;
    this.resize();
    window.addEventListener("resize", () => this.resize());
    canvas.addEventListener("pointerdown", (ev) => this.onPointerDown(ev));
    canvas.addEventListener("pointermove", (ev) => this.onPointerMove(ev));
    canvas.addEventListener("pointerup", () => { this.panFrom = null; });
    canvas.addEventListener("wheel", (ev) => this.onWheel(ev), { passive: false });
    window.addEventListener("keydown", (ev) => { if (ev.code === "Space") this.spaceDown = true; });
    window.addEventListener("keyup", (ev) => { if (ev.code === "Space") this.spaceDown = false; });
  }

  private fitRacks(): void {
    const rects = this.racks.racks.map((r) => r.rect);
    const right = Math.max(0, ...rects.map((r) => r.x + r.w));
    const bottom = Math.max(0, ...rects.map((r) => r.y + r.h));
    this.camera.zoom = Math.max(0.1, Math.min(1, this.cssWidth / (right + 32), this.cssHeight / (bottom + 32)));
    this.camera.x = -16;
    this.camera.y = -16;
  }

  /* A page-sized picture of the whole workspace (or the racks in Physical view),
     independent of what is on screen: panel sizes, zoom, selection and playing
     packets do not matter. Returns null when there is nothing to print. */
  renderForPrint(width: number, height: number): HTMLCanvasElement | null {
    const state = this.state;
    const physical = !!state?.physical;
    const rects: Rect[] = physical
      ? this.racks.racks.map((r) => r.rect)
      : [...this.scene.devices.map((d) => d.box), ...(state?.notes ?? []).map((n) => noteBox(n))];
    const bounds = boundsOf(rects);
    if (!bounds) return null;
    const page = document.createElement("canvas");
    page.width = width;
    page.height = height;
    const ctx = page.getContext("2d");
    if (!ctx) return null;
    // Not clamped like the on-screen camera: a very large network must still fit the page.
    const camera = Object.assign(new Camera({ x: 0, y: 0, zoom: 1 }), fitCamera(bounds, width, height));
    if (physical) {
      drawRacks(ctx as unknown as Canvas2D, this.racks, camera, { selected: new Set() });
    } else {
      drawScene(ctx as unknown as Canvas2D, this.scene, camera, {
        width,
        height,
        grid: false,
        image: (src) => this.image(src),
        notes: state?.notes,
      });
    }
    // drawScene clears its canvas first, so paper white goes behind what was drawn.
    ctx.globalCompositeOperation = "destination-over";
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);
    return page;
  }

  worldCenter(): Point {
    return this.camera.toWorld({ x: this.cssWidth / 2, y: this.cssHeight / 2 });
  }

  fit(): void {
    const devices = this.scene.devices;
    if (!devices.length) {
      this.camera.zoom = 1;
      this.camera.x = 0;
      this.camera.y = 0;
      this.requestDraw();
      return;
    }
    const xs = devices.map((d) => d.box.x);
    const ys = devices.map((d) => d.box.y);
    const xe = devices.map((d) => d.box.x + d.box.w);
    const ye = devices.map((d) => d.box.y + d.box.h);
    const minX = Math.min(...xs) - 40;
    const minY = Math.min(...ys) - 40;
    const width = Math.max(...xe) + 40 - minX;
    const height = Math.max(...ye) + 40 - minY;
    const zoom = Math.min(this.cssWidth / width, this.cssHeight / height, 2);
    this.camera.zoom = Math.max(0.1, zoom);
    this.camera.x = minX - (this.cssWidth / this.camera.zoom - width) / 2;
    this.camera.y = minY - (this.cssHeight / this.camera.zoom - height) / 2;
    this.requestDraw();
  }

  get cssWidth(): number {
    return this.canvas.clientWidth;
  }

  get cssHeight(): number {
    return this.canvas.clientHeight;
  }

  setState(state: CanvasState): void {
    this.state = state;
    this.scene = buildScene(state.workspace);
    const enteringPhysical = !!state.physical && !this.wasPhysical;
    this.wasPhysical = !!state.physical;
    this.racks = layoutRacks(state.workspace.devices.map((d) => ({ id: d.id, name: d.name, model: d.model, kind: d.kind ?? "other" })));
    if (enteringPhysical) this.fitRacks();
    this.requestDraw();
  }

  worldAt(ev: { clientX: number; clientY: number }): Point {
    const rect = this.canvas.getBoundingClientRect();
    return this.camera.toWorld({ x: ev.clientX - rect.left, y: ev.clientY - rect.top });
  }

  screenAt(ev: { clientX: number; clientY: number }): Point {
    const rect = this.canvas.getBoundingClientRect();
    return { x: ev.clientX - rect.left, y: ev.clientY - rect.top };
  }

  runPacket(run: PacketRun): void {
    this.packets.push({ run, start: performance.now() });
    this.requestDraw();
  }

  resize(): void {
    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = Math.round(this.cssWidth * dpr);
    this.canvas.height = Math.round(this.cssHeight * dpr);
    this.requestDraw();
  }

  requestDraw(): void {
    if (this.frame) return;
    this.frame = requestAnimationFrame(() => this.paint());
  }

  private paint(): void {
    this.frame = 0;
    const dpr = window.devicePixelRatio || 1;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const state = this.state;
    const packets = this.livePackets();
    if (state?.physical) {
      this.ctx.clearRect(0, 0, this.cssWidth, this.cssHeight);
      drawRacks(this.ctx as unknown as Canvas2D, this.racks, this.camera, { selected: state.selected });
      if (this.packets.length) this.requestDraw();
      return;
    }
    drawScene(this.ctx as unknown as Canvas2D, this.scene, this.camera, {
      width: this.cssWidth,
      height: this.cssHeight,
      grid: state?.grid ?? false,
      image: (src) => this.image(src),
      selected: state?.selected,
      marked: state?.marked,
      linked: state?.linked,
      packets,
      empty: state?.empty,
      notes: state?.notes,
      selectedNote: state?.selectedNote,
    });
    if (this.packets.length) this.requestDraw();
  }

  private livePackets(): Packet[] {
    const now = performance.now();
    const live: Packet[] = [];
    this.packets = this.packets.filter(({ run, start }) => {
      const at = packetAt(run.points, now - start, run.segmentMs);
      if (!at) {
        run.onDone?.();
        return false;
      }
      live.push({ at, color: run.color });
      return true;
    });
    return live;
  }

  private image(src: string): HTMLImageElement | undefined {
    const cached = this.images.get(src);
    if (cached) return cached;
    if (this.loading.has(src)) return undefined;
    this.loading.add(src);
    const img = new Image();
    img.onload = () => this.requestDraw();
    img.src = src;
    this.images.set(src, img);
    return undefined;
  }

  private onPointerDown(ev: PointerEvent): void {
    if (ev.button === 1 || this.spaceDown) {
      this.panFrom = this.screenAt(ev);
      this.canvas.setPointerCapture(ev.pointerId);
      ev.preventDefault();
      return;
    }
    const world = this.worldAt(ev);
    const note = hitNote(this.state?.notes ?? [], world);
    if (note) return this.handlers.onNoteDown?.(note, ev);
    if (this.state?.physical) {
      const device = hitRackBox(this.racks, world);
      if (device) return this.handlers.onDeviceDown?.(device, ev);
      return this.handlers.onBackgroundDown?.(ev);
    }
    const device = hitDevice(this.scene, world);
    if (device) return this.handlers.onDeviceDown?.(device, ev);
    const link = hitLink(this.scene, world, LINK_TOLERANCE_PX / this.camera.zoom);
    if (link) return this.handlers.onLinkDown?.(link, ev);
    this.panFrom = this.screenAt(ev);
    this.canvas.setPointerCapture(ev.pointerId);
    this.handlers.onBackgroundDown?.(ev);
  }

  private onPointerMove(ev: PointerEvent): void {
    if (!this.panFrom) {
      if (this.state?.physical) return;
      this.handlers.onHover?.(hitDevice(this.scene, this.worldAt(ev)), ev);
      return;
    }
    const here = this.screenAt(ev);
    this.camera.pan(here.x - this.panFrom.x, here.y - this.panFrom.y);
    this.panFrom = here;
    this.requestDraw();
  }

  private onWheel(ev: WheelEvent): void {
    ev.preventDefault();
    this.camera.zoomAt(this.screenAt(ev), ev.deltaY < 0 ? 1.1 : 1 / 1.1);
    this.requestDraw();
  }
}
