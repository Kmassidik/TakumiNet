import { Camera } from "./camera";
import { cursorFor, wheelAction } from "./pointer_rules";
import { hitDevice, hitGroup, hitLink } from "./hit";
import { drawScene } from "./draw";
import { packetAt } from "./packets";
import { drawRacks } from "./rack_draw";
import { hitNote, noteBox } from "./notes";
import { boundsOf, fitCamera } from "./print_view";
import { bufferSize, recenterShift } from "./view_size";
import { hitRackBox, layoutRacks } from "./rack_layout";
import { buildScene } from "./scene";
import { idsInRect, normalizedRect } from "./marquee";

const LINK_TOLERANCE_PX = 6;

export class WorkspaceCanvas {
  camera = new Camera({ x: 0, y: 0, zoom: 1 });
  handlers = {};
  scene = { devices: [], links: [], groups: [] };
  racks = { racks: [] };
  state = null;
  ctx;
  images = new Map();
  loading = new Set();
  packets = [];
  frame = 0;
  panFrom = null;
  marquee = null;
  pointerWorld = null;
  spaceDown = false;
  wasPhysical = false;
  lastBox = null;

  constructor(canvas) {
    this.canvas = canvas;
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

  fitRacks() {
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
  renderForPrint(width, height) {
    const state = this.state;
    const physical = !!state?.physical;
    const rects = physical
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
      drawRacks(ctx, this.racks, camera, { selected: new Set() });
    } else {
      drawScene(ctx, this.scene, camera, {
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

  worldCenter() {
    return this.camera.toWorld({ x: this.cssWidth / 2, y: this.cssHeight / 2 });
  }

  fit() {
    const boxes = [
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

  get cssWidth() {
    return this.canvas.clientWidth;
  }

  get cssHeight() {
    return this.canvas.clientHeight;
  }

  setState(state) {
    this.state = state;
    this.scene = buildScene(state.workspace);
    const enteringPhysical = !!state.physical && !this.wasPhysical;
    this.wasPhysical = !!state.physical;
    this.racks = layoutRacks(state.workspace.devices.map((d) => ({ id: d.id, name: d.name, model: d.model, kind: d.kind ?? "other" })));
    if (enteringPhysical) this.fitRacks();
    this.requestDraw();
  }

  /* Device under the pointer, for a cable drag released over its far end. */
  deviceAt(ev) {
    if (this.state?.physical) return null;
    return hitDevice(this.scene, this.worldAt(ev));
  }

  worldAt(ev) {
    const rect = this.canvas.getBoundingClientRect();
    return this.camera.toWorld({ x: ev.clientX - rect.left, y: ev.clientY - rect.top });
  }

  screenAt(ev) {
    const rect = this.canvas.getBoundingClientRect();
    return { x: ev.clientX - rect.left, y: ev.clientY - rect.top };
  }

  runPacket(run) {
    this.packets.push({ run, start: performance.now() });
    this.requestDraw();
  }

  resize() {
    const box = { w: this.cssWidth, h: this.cssHeight };
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

  requestDraw() {
    if (this.frame) return;
    this.frame = requestAnimationFrame(() => this.paint());
  }

  paint() {
    this.frame = 0;
    const dpr = window.devicePixelRatio || 1;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const state = this.state;
    const packets = this.livePackets();
    if (state?.physical) {
      this.ctx.clearRect(0, 0, this.cssWidth, this.cssHeight);
      drawRacks(this.ctx, this.racks, this.camera, { selected: state.selected });
      if (this.packets.length) this.requestDraw();
      return;
    }
    drawScene(this.ctx, this.scene, this.camera, {
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

  livePackets() {
    const now = performance.now();
    const live = [];
    this.packets = this.packets.filter(({ run, start }) => {
      const at = packetAt(run.points, now - start, run.segmentMs);
      if (!at) {
        if (run.dropped) {
          /* The token dies at the last hop: hold the burst for half a second. */
          const end = run.points[run.points.length - 1];
          const since = now - start - (run.points.length - 1) * run.segmentMs;
          if (since < 500) {
            live.push({ at: end, color: run.color, burst: 1 - since / 500 });
            return true;
          }
        }
        run.onDone?.();
        return false;
      }
      const elapsed = now - start;
      const from = packetAt(run.points, Math.max(0, elapsed - 60), run.segmentMs) ?? at;
      live.push({ at, from, color: run.color });
      return true;
    });
    return live;
  }

  image(src) {
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

  mode() {
    const wrap = this.canvas.parentElement;
    const crosshair = !!wrap && (wrap.classList.contains("cable-mode") || wrap.classList.contains("crosshair"));
    return crosshair ? "crosshair" : "select";
  }

  startPan(ev) {
    this.panFrom = this.screenAt(ev);
    this.canvas.setPointerCapture(ev.pointerId);
    this.canvas.style.cursor = cursorFor(null, this.mode(), true);
  }

  onPointerDown(ev) {
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
  onContextMenu(ev) {
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

  onPointerUp(ev) {
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

  onPointerMove(ev) {
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
      const hit = group ? "group" : device ? "device" : link ? "link" : note ? "note" : null;
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

  onWheel(ev) {
    ev.preventDefault();
    const action = wheelAction(ev);
    if (action.kind === "zoom") this.camera.zoomAt(this.screenAt(ev), action.factor);
    else this.camera.pan(-action.dx, -action.dy);
    this.requestDraw();
  }
}
