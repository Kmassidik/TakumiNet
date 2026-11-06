import { Camera, type Point } from "./camera";
import { cursorFor, wheelAction, type CanvasMode, type HoverHit } from "./pointer_rules";
import { hitDevice, hitGroup, hitLink } from "./hit";
import { drawScene, type Canvas2D, type Packet } from "./draw";
import { packetAt } from "./packets";
import { drawRacks } from "./rack_draw";
import { hitNote, noteBox, type NoteInput } from "./notes";
import { boundsOf, fitCamera, type Rect } from "./print_view";
import { bufferSize, recenterShift, type Size } from "./view_size";
import { hitRackBox, layoutRacks, type RackLayout } from "./rack_layout";
import { buildScene, type Scene, type SceneDevice, type SceneGroup, type SceneLink, type WorkspaceInput } from "./scene";
import { idsInRect, normalizedRect } from "./marquee";

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
  pending?: Point | null;
}

export interface PacketRun {
  points: Point[];
  color: string;
  segmentMs: number;
  onDone?: () => void;
}

export interface CanvasHit {
  device?: SceneDevice;
  group?: SceneGroup;
  link?: SceneLink;
}

export interface PointerHandlers {
  onDeviceDown?: (device: { id: string; name: string }, ev: PointerEvent) => void;
  onGroupDown?: (group: SceneGroup, ev: PointerEvent) => void;
  onLinkDown?: (link: SceneLink, ev: PointerEvent) => void;
  onBackgroundDown?: (ev: PointerEvent) => void;
  onMarquee?: (ids: string[], additive: boolean) => void;
  onNoteDown?: (note: NoteInput, ev: PointerEvent) => void;
  onHover?: (device: { name: string; model: string } | null, ev: PointerEvent) => void;
  onContextMenu?: (hit: CanvasHit, ev: MouseEvent) => void;
}

const LINK_TOLERANCE_PX = 6;

export class WorkspaceCanvas {
  readonly camera = new Camera({ x: 0, y: 0, zoom: 1 });
  handlers: PointerHandlers = {};
  private scene: Scene = { devices: [], links: [], groups: [] };
  private racks: RackLayout = { racks: [] };
  private state: CanvasState | null = null;
  private readonly ctx: CanvasRenderingContext2D;
  private readonly images = new Map<string, HTMLImageElement>();
  private readonly loading = new Set<string>();
  private packets: { run: PacketRun; start: number }[] = [];
  private frame = 0;
  private panFrom: Point | null = null;
  private marquee: { from: Point; to: Point; additive: boolean; down: PointerEvent } | null = null;
  private pointerWorld: Point | null = null;
  private spaceDown = false;
  private wasPhysical = false;

  constructor(private readonly canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("canvas 2d context unavailable");
    this.ctx = ctx;
    this.resize();
    window.addEventListener("resize", () => this.resize());
    // Bars, the sidebar and its splitter change this box without any window resize.
    if (typeof ResizeObserver !== "undefined") new ResizeObserver(() => this.resize()).observe(canvas);
    canvas.addEventListener("pointerdown", (ev) => this.onPointerDown(ev));
    canvas.addEventListener("pointermove", (ev) => this.onPointerMove(ev));
    canvas.addEventListener("pointerup", (ev) => this.onPointerUp(ev));
    canvas.addEventListener("wheel", (ev) => this.onWheel(ev), { passive: false });
    canvas.addEventListener("contextmenu", (ev) => this.onContextMenu(ev));
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
      : [
          ...this.scene.devices.map((d) => d.box),
          ...this.scene.groups.map((g) => g.box),
          ...(state?.notes ?? []).map((n) => noteBox(n)),
        ];
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
    const boxes: Rect[] = [
      ...[...this.scene.devices, ...this.scene.groups].map((d) => d.box),
      ...(this.state?.notes ?? []).map((note) => {
        const box = noteBox(note);
        return { x: box.x, y: box.y, w: box.w, h: box.h };
      }),
    ];
    if (!boxes.length) {
      this.camera.zoom = 1;
      this.camera.x = 0;
      this.camera.y = 0;
      this.requestDraw();
      return;
    }
    const xs = boxes.map((b) => b.x);
    const ys = boxes.map((b) => b.y);
    const xe = boxes.map((b) => b.x + b.w);
    const ye = boxes.map((b) => b.y + b.h);
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

  /* Device under the pointer, for a cable drag released over its far end. */
  deviceAt(ev: { clientX: number; clientY: number }): SceneDevice | null {
    if (this.state?.physical) return null;
    return hitDevice(this.scene, this.worldAt(ev));
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

  private lastBox: Size | null = null;

  resize(): void {
    const box: Size = { w: this.cssWidth, h: this.cssHeight };
    const buffer = bufferSize(box, window.devicePixelRatio || 1);
    if (!buffer) return; // hidden or collapsed: keep the last picture, draw nothing new
    if (this.lastBox && (this.lastBox.w !== box.w || this.lastBox.h !== box.h)) {
      const { dx, dy } = recenterShift(this.camera.zoom, this.lastBox, box);
      this.camera.x += dx;
      this.camera.y += dy;
    }
    this.lastBox = box;
    this.canvas.width = buffer.w;
    this.canvas.height = buffer.h;
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
      marquee: this.marquee ? normalizedRect(this.marquee.from, this.marquee.to) : null,
      pending: state?.pending && this.pointerWorld ? { from: state.pending, to: this.pointerWorld } : null,
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

  private mode(): CanvasMode {
    const wrap = this.canvas.parentElement;
    const crosshair = !!wrap && (wrap.classList.contains("cable-mode") || wrap.classList.contains("crosshair"));
    return crosshair ? "crosshair" : "select";
  }

  private startPan(ev: PointerEvent): void {
    this.panFrom = this.screenAt(ev);
    this.canvas.setPointerCapture(ev.pointerId);
    this.canvas.style.cursor = cursorFor(null, this.mode(), true);
  }

  private onPointerDown(ev: PointerEvent): void {
    if (ev.button === 1 || this.spaceDown) {
      this.startPan(ev);
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
    const group = hitGroup(this.scene, world);
    if (group) return this.handlers.onGroupDown?.(group, ev);
    const device = hitDevice(this.scene, world);
    if (device) return this.handlers.onDeviceDown?.(device, ev);
    const link = hitLink(this.scene, world, LINK_TOLERANCE_PX / this.camera.zoom);
    if (link) return this.handlers.onLinkDown?.(link, ev);
    /* Plain left-drag on empty canvas selects; panning lives on Space and the
       middle button. Crosshair modes keep the old pan-and-report behaviour. */
    if (ev.button === 0 && this.mode() === "select") {
      this.marquee = { from: world, to: world, additive: ev.shiftKey, down: ev };
      this.canvas.setPointerCapture(ev.pointerId);
      return;
    }
    this.startPan(ev);
    this.handlers.onBackgroundDown?.(ev);
  }

  /* The browser menu never opens over the canvas; the app's own menu does. */
  private onContextMenu(ev: MouseEvent): void {
    ev.preventDefault();
    if (!this.handlers.onContextMenu) return;
    if (this.state?.physical) return this.handlers.onContextMenu({}, ev);
    const world = this.worldAt(ev);
    const group = hitGroup(this.scene, world);
    if (group) return this.handlers.onContextMenu({ group }, ev);
    const device = hitDevice(this.scene, world);
    if (device) return this.handlers.onContextMenu({ device }, ev);
    const link = hitLink(this.scene, world, LINK_TOLERANCE_PX / this.camera.zoom);
    if (link) return this.handlers.onContextMenu({ link }, ev);
    this.handlers.onContextMenu({}, ev);
  }

  private onPointerUp(ev: PointerEvent): void {
    if (this.marquee) {
      const { from, to, additive, down } = this.marquee;
      this.marquee = null;
      const rect = normalizedRect(from, to);
      if ((rect.w + rect.h) * this.camera.zoom < 4) this.handlers.onBackgroundDown?.(down);
      else this.handlers.onMarquee?.(idsInRect(this.scene.devices, rect), additive);
      this.requestDraw();
    }
    this.panFrom = null;
    this.canvas.style.cursor = cursorFor(null, this.mode(), false);
  }

  private onPointerMove(ev: PointerEvent): void {
    if (this.marquee) {
      this.marquee.to = this.worldAt(ev);
      this.requestDraw();
      return;
    }
    if (!this.panFrom) {
      if (this.state?.physical) {
        this.canvas.style.cursor = cursorFor(null, this.mode(), false);
        return;
      }
      const world = this.worldAt(ev);
      this.pointerWorld = world;
      if (this.state?.pending) this.requestDraw();
      const group = hitGroup(this.scene, world);
      const device = group ? null : hitDevice(this.scene, world);
      const link = group || device ? null : hitLink(this.scene, world, LINK_TOLERANCE_PX / this.camera.zoom);
      const note = group || device || link ? null : hitNote(this.state?.notes ?? [], world);
      const hit: HoverHit = group ? "group" : device ? "device" : link ? "link" : note ? "note" : null;
      const dragging = (ev.buttons & 1) !== 0 && hit !== null;
      this.canvas.style.cursor = cursorFor(hit, this.mode(), dragging);
      const over = group
        ? { name: group.name, model: `${group.devices} device${group.devices === 1 ? "" : "s"}` }
        : device;
      this.handlers.onHover?.(over, ev);
      return;
    }
    const here = this.screenAt(ev);
    this.camera.pan(here.x - this.panFrom.x, here.y - this.panFrom.y);
    this.panFrom = here;
    this.requestDraw();
  }

  private onWheel(ev: WheelEvent): void {
    ev.preventDefault();
    const action = wheelAction(ev);
    if (action.kind === "zoom") this.camera.zoomAt(this.screenAt(ev), action.factor);
    else this.camera.pan(-action.dx, -action.dy);
    this.requestDraw();
  }
}
