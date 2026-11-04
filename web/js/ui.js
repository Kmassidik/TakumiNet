(() => {
  // web/ts/ui/dialogs.ts
  var zTop = 80;
  function bringToFront(win) {
    if (!win)
      return;
    win.style.zIndex = String(++zTop);
  }
  function makeWindowMovable(win) {
    const box = win?.querySelector(".preview");
    const title = box?.querySelector(".devwin-title");
    if (!win || !box || !title)
      return;
    let drag = null;
    title.addEventListener("pointerdown", (ev) => {
      if (ev.target.closest("button"))
        return;
      bringToFront(win);
      const r = box.getBoundingClientRect();
      drag = { x: ev.clientX, y: ev.clientY, ox: r.left, oy: r.top };
      title.setPointerCapture(ev.pointerId);
      ev.preventDefault();
    });
    title.addEventListener("pointermove", (ev) => {
      if (!drag)
        return;
      const x = Math.max(0, Math.min(window.innerWidth - 80, drag.ox + ev.clientX - drag.x));
      const y = Math.max(0, Math.min(window.innerHeight - 40, drag.oy + ev.clientY - drag.y));
      box.style.position = "fixed";
      box.style.margin = "0";
      box.style.left = `${x}px`;
      box.style.top = `${y}px`;
    });
    const stop = (ev) => {
      drag = null;
      try {
        title.releasePointerCapture(ev.pointerId);
      } catch {}
    };
    title.addEventListener("pointerup", stop);
    title.addEventListener("pointercancel", stop);
    box.addEventListener("pointerdown", () => bringToFront(win), true);
  }
  function watchOverlays(stack) {
    const observer = new MutationObserver((records) => {
      for (const record of records) {
        const el = record.target;
        if (el.hidden) {
          stack.forget(el.id);
          el.dispatchEvent(new Event("dialog-closed"));
        } else if (!stack.has(el.id)) {
          const opener = document.activeElement instanceof HTMLElement ? document.activeElement : undefined;
          stack.push({ id: el.id, opener, onClose: () => {
            el.hidden = true;
          } });
        }
      }
    });
    for (const el of document.querySelectorAll(".overlay")) {
      observer.observe(el, { attributes: true, attributeFilter: ["hidden"] });
    }
  }

  // web/ts/canvas/camera.ts
  var MIN_ZOOM = 0.1;
  var MAX_ZOOM = 4;
  var clampZoom = (zoom) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, zoom));

  class Camera {
    x;
    y;
    zoom;
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

  // web/ts/canvas/hit.ts
  function hitDevice(scene, p) {
    for (let i = scene.devices.length - 1;i >= 0; i--) {
      const d = scene.devices[i];
      const { x, y, w, h } = d.box;
      if (p.x >= x && p.x <= x + w && p.y >= y && p.y <= y + h)
        return d;
    }
    return null;
  }
  function distanceToSegment(p, a, b) {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const lengthSquared = dx * dx + dy * dy;
    const t = lengthSquared === 0 ? 0 : Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / lengthSquared));
    return Math.hypot(p.x - (a.x + t * dx), p.y - (a.y + t * dy));
  }
  function hitLink(scene, p, tolerance) {
    let best = null;
    let bestDistance = tolerance;
    for (const link of scene.links) {
      const d = distanceToSegment(p, link.from, link.to);
      if (d <= bestDistance) {
        best = link;
        bestDistance = d;
      }
    }
    return best;
  }

  // web/ts/canvas/notes.ts
  var NOTE_WIDTH = 180;
  var NOTE_CHARS_PER_LINE = 26;
  var LINE_HEIGHT = 16;
  var PADDING = 10;
  function wrapText(text, width) {
    const lines = [];
    for (const paragraph of text.split(`
`)) {
      let line = "";
      for (const word of paragraph.split(" ").filter((w) => w.length > 0)) {
        let piece = word;
        while (piece.length > width) {
          if (line) {
            lines.push(line);
            line = "";
          }
          lines.push(piece.slice(0, width));
          piece = piece.slice(width);
        }
        const candidate = line ? `${line} ${piece}` : piece;
        if (candidate.length > width && line) {
          lines.push(line);
          line = piece;
        } else {
          line = candidate;
        }
      }
      lines.push(line);
    }
    return lines;
  }
  function noteBox(note) {
    const lines = wrapText(note.text, NOTE_CHARS_PER_LINE);
    return {
      x: note.x,
      y: note.y,
      w: NOTE_WIDTH,
      h: PADDING * 2 + LINE_HEIGHT * lines.length,
      lines
    };
  }
  function hitNote(notes, p) {
    for (let i = notes.length - 1;i >= 0; i--) {
      const box = noteBox(notes[i]);
      if (p.x >= box.x && p.x <= box.x + box.w && p.y >= box.y && p.y <= box.y + box.h)
        return notes[i];
    }
    return null;
  }

  // web/ts/canvas/draw.ts
  var LED_COLORS = { green: "#0a7a3d", amber: "#c98a00", red: "#c62828" };
  var GRID_WORLD = 25;
  var SELECT = "#2b6cb0";
  function drawScene(ctx, scene, camera, options) {
    const { width, height } = options;
    ctx.clearRect(0, 0, width, height);
    if (options.grid)
      drawGrid(ctx, camera, width, height);
    if (!scene.devices.length && options.empty)
      drawEmpty(ctx, options, width, height);
    for (const link of scene.links)
      drawLink(ctx, link, camera, options);
    for (const device of scene.devices)
      drawDevice(ctx, device, camera, options);
    for (const packet of options.packets ?? [])
      drawPacket(ctx, packet, camera);
    for (const note of options.notes ?? [])
      drawNote(ctx, note, camera, options.selectedNote ?? null);
  }
  function drawNote(ctx, note, camera, selected) {
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
  function drawGrid(ctx, camera, width, height) {
    ctx.strokeStyle = "#e3e8ee";
    ctx.lineWidth = 1;
    const topLeft = camera.toWorld({ x: 0, y: 0 });
    const bottomRight = camera.toWorld({ x: width, y: height });
    for (let x = Math.floor(topLeft.x / GRID_WORLD) * GRID_WORLD;x <= bottomRight.x; x += GRID_WORLD) {
      const sx = camera.toScreen({ x, y: 0 }).x;
      ctx.beginPath();
      ctx.moveTo(sx, 0);
      ctx.lineTo(sx, height);
      ctx.stroke();
    }
    for (let y = Math.floor(topLeft.y / GRID_WORLD) * GRID_WORLD;y <= bottomRight.y; y += GRID_WORLD) {
      const sy = camera.toScreen({ x: 0, y }).y;
      ctx.beginPath();
      ctx.moveTo(0, sy);
      ctx.lineTo(width, sy);
      ctx.stroke();
    }
  }
  function drawEmpty(ctx, options, width, height) {
    const empty = options.empty;
    const image = empty.mascot ? options.image?.(empty.mascot) : undefined;
    if (image)
      ctx.drawImage(image, width / 2 - 48, height / 2 - 84, 96, 96);
    ctx.fillStyle = "#667085";
    ctx.font = "14px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(empty.message, width / 2, height / 2 + 36);
  }
  function drawLink(ctx, link, camera, options) {
    const a = camera.toScreen(link.from);
    const b = camera.toScreen(link.to);
    const selected = options.linked?.a === link.a && options.linked?.b === link.b;
    ctx.strokeStyle = selected ? SELECT : link.kind === "eConsole" ? "#667085" : "#1b1f23";
    ctx.lineWidth = selected ? 3 : 2;
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
    for (const [t, state] of [[0.08, link.aState], [0.92, link.bState]]) {
      ctx.fillStyle = LED_COLORS[state ?? "red"] ?? LED_COLORS.red;
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
  function drawDevice(ctx, device, camera, options) {
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
    if (device.ip)
      ctx.fillText(`${device.ip}/${device.prefix}`, cx, origin.y + 98 * camera.zoom);
  }
  function drawPacket(ctx, packet, camera) {
    const p = camera.toScreen(packet.at);
    ctx.fillStyle = packet.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, 7, 0, Math.PI * 2);
    ctx.fill();
  }

  // web/ts/canvas/packets.ts
  function packetAt(points, elapsedMs, segmentMs) {
    const segments = points.length - 1;
    if (segments < 1 || elapsedMs >= segments * segmentMs)
      return null;
    const index = Math.floor(elapsedMs / segmentMs);
    const f = elapsedMs % segmentMs / segmentMs;
    const a = points[index];
    const b = points[index + 1];
    return { x: a.x + (b.x - a.x) * f, y: a.y + (b.y - a.y) * f };
  }

  // web/ts/canvas/rack_draw.ts
  function drawRacks(ctx, layout, camera, options) {
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

  // web/ts/canvas/print_view.ts
  function boundsOf(rects) {
    if (!rects.length)
      return null;
    const x = Math.min(...rects.map((r) => r.x));
    const y = Math.min(...rects.map((r) => r.y));
    const right = Math.max(...rects.map((r) => r.x + r.w));
    const bottom = Math.max(...rects.map((r) => r.y + r.h));
    return { x, y, w: right - x, h: bottom - y };
  }
  function fitCamera(bounds, width, height, margin = 40, maxZoom = 2) {
    const w = Math.max(1, bounds.w + margin * 2);
    const h = Math.max(1, bounds.h + margin * 2);
    const zoom = Math.max(0.01, Math.min(width / w, height / h, maxZoom));
    return {
      zoom,
      x: bounds.x - margin - (width / zoom - w) / 2,
      y: bounds.y - margin - (height / zoom - h) / 2
    };
  }

  // web/ts/canvas/view_size.ts
  function bufferSize(css, ratio) {
    if (!(css.w > 0) || !(css.h > 0))
      return null;
    const r = ratio > 0 ? ratio : 1;
    return { w: Math.round(css.w * r), h: Math.round(css.h * r) };
  }
  function recenterShift(zoom, from, to) {
    return { dx: (from.w - to.w) / (2 * zoom), dy: (from.h - to.h) / (2 * zoom) };
  }

  // web/ts/canvas/rack_layout.ts
  var KIND_ORDER = [
    "router",
    "switch",
    "hub",
    "server",
    "pc",
    "laptop",
    "ap",
    "homerouter",
    "asa",
    "wlc",
    "phone",
    "printer",
    "cloud",
    "thing"
  ];
  var KIND_LABEL = {
    router: "Routers",
    switch: "Switches",
    hub: "Hubs",
    server: "Servers",
    pc: "Workstations",
    laptop: "Laptops",
    ap: "Access Points",
    homerouter: "Wireless Routers",
    asa: "Firewalls",
    wlc: "Wireless LAN Controllers",
    phone: "IP Phones",
    printer: "Printers",
    cloud: "Clouds",
    thing: "IoT Devices"
  };
  var BOX = { w: 168, h: 72, gap: 12, perRow: 2, title: 28, rackGap: 28 };
  var rank = (kind) => {
    const index = KIND_ORDER.indexOf(kind);
    return index < 0 ? KIND_ORDER.length : index;
  };
  function layoutRacks(devices) {
    const groups = new Map;
    for (const device of devices) {
      const list = groups.get(device.kind) ?? [];
      list.push(device);
      groups.set(device.kind, list);
    }
    const kinds = [...groups.keys()].sort((a, b) => rank(a) - rank(b) || a.localeCompare(b));
    let x = 0;
    const racks = kinds.map((kind) => {
      const members = groups.get(kind);
      const rows = Math.ceil(members.length / BOX.perRow);
      const width = BOX.perRow * BOX.w + (BOX.perRow + 1) * BOX.gap;
      const height = BOX.title + rows * (BOX.h + BOX.gap) + BOX.gap;
      const boxes = members.map((device, i) => {
        const column = i % BOX.perRow;
        const row = Math.floor(i / BOX.perRow);
        return {
          device,
          rect: {
            x: x + BOX.gap + column * (BOX.w + BOX.gap),
            y: BOX.title + row * (BOX.h + BOX.gap),
            w: BOX.w,
            h: BOX.h
          }
        };
      });
      const rack = {
        kind,
        label: `${KIND_LABEL[kind] ?? kind.charAt(0).toUpperCase() + kind.slice(1)} (${members.length})`,
        rect: { x, y: 0, w: width, h: height },
        boxes
      };
      x += width + BOX.rackGap;
      return rack;
    });
    return { racks };
  }
  function hitRackBox(layout, p) {
    for (const rack of layout.racks) {
      for (const box of rack.boxes) {
        const { x, y, w, h } = box.rect;
        if (p.x >= x && p.x <= x + w && p.y >= y && p.y <= y + h)
          return box.device;
      }
    }
    return null;
  }

  // web/ts/canvas/scene.ts
  var BOX2 = { left: 36, top: 34, size: 72 };
  function buildScene(workspace) {
    const devices = workspace.devices.map((d) => ({
      ...d,
      box: { x: d.x - BOX2.left, y: d.y - BOX2.top, w: BOX2.size, h: BOX2.size }
    }));
    const byId = new Map(devices.map((d) => [d.id, d]));
    const links = [];
    for (const link of workspace.links) {
      const from = byId.get(link.a);
      const to = byId.get(link.b);
      if (from && to)
        links.push({ ...link, from, to });
    }
    return { devices, links };
  }

  // web/ts/canvas/workspace_canvas.ts
  var LINK_TOLERANCE_PX = 6;

  class WorkspaceCanvas {
    canvas;
    camera = new Camera({ x: 0, y: 0, zoom: 1 });
    handlers = {};
    scene = { devices: [], links: [] };
    racks = { racks: [] };
    state = null;
    ctx;
    images = new Map;
    loading = new Set;
    packets = [];
    frame = 0;
    panFrom = null;
    spaceDown = false;
    wasPhysical = false;
    constructor(canvas) {
      this.canvas = canvas;
      const ctx = canvas.getContext("2d");
      if (!ctx)
        throw new Error("canvas 2d context unavailable");
      this.ctx = ctx;
      this.resize();
      window.addEventListener("resize", () => this.resize());
      if (typeof ResizeObserver !== "undefined")
        new ResizeObserver(() => this.resize()).observe(canvas);
      canvas.addEventListener("pointerdown", (ev) => this.onPointerDown(ev));
      canvas.addEventListener("pointermove", (ev) => this.onPointerMove(ev));
      canvas.addEventListener("pointerup", () => {
        this.panFrom = null;
      });
      canvas.addEventListener("wheel", (ev) => this.onWheel(ev), { passive: false });
      window.addEventListener("keydown", (ev) => {
        if (ev.code === "Space")
          this.spaceDown = true;
      });
      window.addEventListener("keyup", (ev) => {
        if (ev.code === "Space")
          this.spaceDown = false;
      });
    }
    fitRacks() {
      const rects = this.racks.racks.map((r) => r.rect);
      const right = Math.max(0, ...rects.map((r) => r.x + r.w));
      const bottom = Math.max(0, ...rects.map((r) => r.y + r.h));
      this.camera.zoom = Math.max(0.1, Math.min(1, this.cssWidth / (right + 32), this.cssHeight / (bottom + 32)));
      this.camera.x = -16;
      this.camera.y = -16;
    }
    renderForPrint(width, height) {
      const state = this.state;
      const physical = !!state?.physical;
      const rects = physical ? this.racks.racks.map((r) => r.rect) : [...this.scene.devices.map((d) => d.box), ...(state?.notes ?? []).map((n) => noteBox(n))];
      const bounds = boundsOf(rects);
      if (!bounds)
        return null;
      const page = document.createElement("canvas");
      page.width = width;
      page.height = height;
      const ctx = page.getContext("2d");
      if (!ctx)
        return null;
      const camera = Object.assign(new Camera({ x: 0, y: 0, zoom: 1 }), fitCamera(bounds, width, height));
      if (physical) {
        drawRacks(ctx, this.racks, camera, { selected: new Set });
      } else {
        drawScene(ctx, this.scene, camera, {
          width,
          height,
          grid: false,
          image: (src) => this.image(src),
          notes: state?.notes
        });
      }
      ctx.globalCompositeOperation = "destination-over";
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, width, height);
      return page;
    }
    worldCenter() {
      return this.camera.toWorld({ x: this.cssWidth / 2, y: this.cssHeight / 2 });
    }
    fit() {
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
      if (enteringPhysical)
        this.fitRacks();
      this.requestDraw();
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
    lastBox = null;
    resize() {
      const box = { w: this.cssWidth, h: this.cssHeight };
      const buffer = bufferSize(box, window.devicePixelRatio || 1);
      if (!buffer)
        return;
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
      if (this.frame)
        return;
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
        if (this.packets.length)
          this.requestDraw();
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
        selectedNote: state?.selectedNote
      });
      if (this.packets.length)
        this.requestDraw();
    }
    livePackets() {
      const now = performance.now();
      const live = [];
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
    image(src) {
      const cached = this.images.get(src);
      if (cached)
        return cached;
      if (this.loading.has(src))
        return;
      this.loading.add(src);
      const img = new Image;
      img.onload = () => this.requestDraw();
      img.src = src;
      this.images.set(src, img);
      return;
    }
    onPointerDown(ev) {
      if (ev.button === 1 || this.spaceDown) {
        this.panFrom = this.screenAt(ev);
        this.canvas.setPointerCapture(ev.pointerId);
        ev.preventDefault();
        return;
      }
      const world = this.worldAt(ev);
      const note = hitNote(this.state?.notes ?? [], world);
      if (note)
        return this.handlers.onNoteDown?.(note, ev);
      if (this.state?.physical) {
        const device = hitRackBox(this.racks, world);
        if (device)
          return this.handlers.onDeviceDown?.(device, ev);
        return this.handlers.onBackgroundDown?.(ev);
      }
      const device = hitDevice(this.scene, world);
      if (device)
        return this.handlers.onDeviceDown?.(device, ev);
      const link = hitLink(this.scene, world, LINK_TOLERANCE_PX / this.camera.zoom);
      if (link)
        return this.handlers.onLinkDown?.(link, ev);
      this.panFrom = this.screenAt(ev);
      this.canvas.setPointerCapture(ev.pointerId);
      this.handlers.onBackgroundDown?.(ev);
    }
    onPointerMove(ev) {
      if (!this.panFrom) {
        if (this.state?.physical)
          return;
        this.handlers.onHover?.(hitDevice(this.scene, this.worldAt(ev)), ev);
        return;
      }
      const here = this.screenAt(ev);
      this.camera.pan(here.x - this.panFrom.x, here.y - this.panFrom.y);
      this.panFrom = here;
      this.requestDraw();
    }
    onWheel(ev) {
      ev.preventDefault();
      this.camera.zoomAt(this.screenAt(ev), ev.deltaY < 0 ? 1.1 : 1 / 1.1);
      this.requestDraw();
    }
  }

  // web/ts/ui/collapse.ts
  var COLLAPSE_KEY = "pt-web:collapsed";
  function readCollapsed(store) {
    try {
      const raw = store?.getItem(COLLAPSE_KEY);
      if (!raw)
        return {};
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed))
        return {};
      const result = {};
      for (const [id, value] of Object.entries(parsed))
        if (value === true)
          result[id] = true;
      return result;
    } catch {
      return {};
    }
  }
  function writeCollapsed(store, id, collapsed) {
    try {
      const all = readCollapsed(store);
      if (collapsed)
        all[id] = true;
      else
        delete all[id];
      store?.setItem(COLLAPSE_KEY, JSON.stringify(all));
    } catch {}
  }
  function handleText(label, collapsed) {
    return collapsed ? { text: `+ ${label}`, title: `Show ${label.toLowerCase()}` } : { text: "−", title: `Minimize ${label.toLowerCase()}` };
  }
  function applyCollapsed(bar, handle, collapsed) {
    const label = handle.dataset.label ?? "bar";
    const { text, title } = handleText(label, collapsed);
    bar.classList.toggle("collapsed", collapsed);
    handle.textContent = text;
    handle.title = title;
    handle.setAttribute("aria-label", title);
    handle.setAttribute("aria-expanded", String(!collapsed));
  }
  function wireCollapsibles(root, store) {
    for (const bar of root.querySelectorAll("[data-collapsible]")) {
      const id = bar.dataset.collapsible ?? "";
      const handle = root.querySelector(`[data-collapse-for="${id}"]`);
      if (!id || !handle)
        continue;
      applyCollapsed(bar, handle, readCollapsed(store)[id] === true);
      handle.addEventListener("click", () => {
        const next = !bar.classList.contains("collapsed");
        applyCollapsed(bar, handle, next);
        writeCollapsed(store, id, next);
      });
    }
  }

  // web/ts/ui/sidebar.ts
  var SIDEBAR_DEFAULT_WIDTH = 330;
  var MIN_WIDTH = 240;
  var MAX_SHARE = 0.6;
  var WIDTH_KEY = "pt-web:sidebar-width";
  function clampSidebarWidth(width, viewport) {
    const max = Math.max(MIN_WIDTH, viewport * MAX_SHARE);
    return Math.min(max, Math.max(MIN_WIDTH, width));
  }
  function readSavedWidth() {
    try {
      const saved = Number(localStorage.getItem(WIDTH_KEY));
      return Number.isFinite(saved) && saved > 0 ? saved : SIDEBAR_DEFAULT_WIDTH;
    } catch {
      return SIDEBAR_DEFAULT_WIDTH;
    }
  }
  function saveWidth(width) {
    try {
      localStorage.setItem(WIDTH_KEY, String(Math.round(width)));
    } catch {}
  }
  function wireSidebar() {
    const main = document.querySelector(".main");
    if (!main)
      return;
    const sidebar = document.getElementById("sidebar");
    const splitter = document.getElementById("sidebar-splitter");
    const hide = document.querySelector('[data-collapse-for="sidebar"]');
    const restore = document.getElementById("sidebar-restore");
    if (!sidebar || !splitter || !hide || !restore)
      return;
    const setWidth = (px) => main.style.setProperty("--sidebar-width", `${px}px`);
    setWidth(clampSidebarWidth(readSavedWidth(), window.innerWidth));
    const store = (() => {
      try {
        return localStorage;
      } catch {
        return null;
      }
    })();
    const setHidden = (hidden) => {
      main.classList.toggle("sidebar-hidden", hidden);
      restore.hidden = !hidden;
      writeCollapsed(store, "sidebar", hidden);
    };
    main.classList.toggle("sidebar-hidden", readCollapsed(store).sidebar === true);
    restore.hidden = !main.classList.contains("sidebar-hidden");
    hide.addEventListener("click", () => setHidden(true));
    restore.addEventListener("click", () => setHidden(false));
    document.addEventListener("keydown", (ev) => {
      if (ev.key !== "\\" || ev.target instanceof HTMLInputElement || ev.target instanceof HTMLTextAreaElement)
        return;
      setHidden(!main.classList.contains("sidebar-hidden"));
    });
    splitter.addEventListener("pointerdown", (down) => {
      down.preventDefault();
      splitter.setPointerCapture(down.pointerId);
      const move = (ev) => {
        const width = clampSidebarWidth(window.innerWidth - ev.clientX, window.innerWidth);
        setWidth(width);
      };
      const up = () => {
        splitter.removeEventListener("pointermove", move);
        const width = parseFloat(main.style.getPropertyValue("--sidebar-width")) || SIDEBAR_DEFAULT_WIDTH;
        saveWidth(width);
      };
      splitter.addEventListener("pointermove", move);
      splitter.addEventListener("pointerup", up, { once: true });
    });
    splitter.addEventListener("dblclick", () => {
      setWidth(SIDEBAR_DEFAULT_WIDTH);
      saveWidth(SIDEBAR_DEFAULT_WIDTH);
    });
    const tabs = sidebar.querySelectorAll("[data-side-tab]");
    const selectTab = (name) => {
      tabs.forEach((tab) => tab.classList.toggle("active", tab.dataset.sideTab === name));
      sidebar.querySelectorAll("[data-panel]").forEach((panel) => {
        panel.hidden = panel.dataset.panel !== name;
      });
    };
    tabs.forEach((tab) => tab.addEventListener("click", () => selectTab(tab.dataset.sideTab ?? "events")));
    globalThis.selectSidebarTab = selectTab;
  }

  // web/ts/ui/menu_nav.ts
  function stepItem(enabled, from, dir) {
    const n = enabled.length;
    if (!enabled.some(Boolean))
      return null;
    let i = from === null ? dir === 1 ? -1 : 0 : from;
    for (let k = 0;k < n; k++) {
      i = (i + dir + n) % n;
      if (enabled[i])
        return i;
    }
    return null;
  }
  var firstItem = (enabled) => stepItem(enabled, null, 1);
  var lastItem = (enabled) => stepItem(enabled, null, -1);

  class AltTracker {
    alone = false;
    down() {
      this.alone = true;
    }
    other() {
      this.alone = false;
    }
    up() {
      const was = this.alone;
      this.alone = false;
      return was;
    }
  }

  class MenuController {
    view;
    open = null;
    active = null;
    bar = null;
    constructor(view) {
      this.view = view;
    }
    get engaged() {
      return this.open !== null || this.bar !== null;
    }
    show(menu, active = null) {
      this.open = menu;
      this.active = active;
      this.view.setOpen(menu);
      if (menu !== null) {
        this.bar = menu;
        this.view.setActive(menu, active);
      }
    }
    clickHead(menu) {
      if (this.open === menu)
        this.closeAll();
      else
        this.show(menu);
    }
    hoverHead(menu) {
      if (this.open !== null && this.open !== menu)
        this.show(menu);
    }
    hoverItem(menu, item) {
      if (this.open !== menu || !this.view.enabled(menu)[item])
        return;
      this.active = item;
      this.view.setActive(menu, item);
    }
    closeAll() {
      const had = this.engaged;
      this.show(null);
      this.bar = null;
      if (had)
        this.view.focusHead(null);
    }
    toggleBar() {
      if (this.engaged)
        this.closeAll();
      else {
        this.bar = 0;
        this.view.focusHead(0);
      }
    }
    key(key) {
      if (!this.engaged)
        return false;
      const n = this.view.count();
      const current = this.open ?? this.bar ?? 0;
      switch (key) {
        case "ArrowRight":
        case "ArrowLeft": {
          const next = (current + (key === "ArrowRight" ? 1 : n - 1)) % n;
          if (this.open !== null)
            this.show(next, firstItem(this.view.enabled(next)));
          else {
            this.bar = next;
            this.view.focusHead(next);
          }
          return true;
        }
        case "ArrowDown":
        case "ArrowUp": {
          const dir = key === "ArrowDown" ? 1 : -1;
          if (this.open === null) {
            this.show(current, dir === 1 ? firstItem(this.view.enabled(current)) : lastItem(this.view.enabled(current)));
          } else {
            this.active = stepItem(this.view.enabled(this.open), this.active, dir);
            this.view.setActive(this.open, this.active);
          }
          return true;
        }
        case "Home":
        case "End": {
          if (this.open === null)
            return true;
          const list = this.view.enabled(this.open);
          this.active = key === "Home" ? firstItem(list) : lastItem(list);
          this.view.setActive(this.open, this.active);
          return true;
        }
        case "Enter":
        case " ": {
          if (this.open === null)
            this.show(current, firstItem(this.view.enabled(current)));
          else if (this.active !== null) {
            const menu = this.open;
            const item = this.active;
            this.closeAll();
            this.view.choose(menu, item);
          }
          return true;
        }
        case "Escape": {
          if (this.open !== null) {
            const menu = this.open;
            this.show(null);
            this.bar = menu;
            this.view.focusHead(menu);
          } else
            this.closeAll();
          return true;
        }
        default:
          return false;
      }
    }
  }

  // web/ts/ui/menubar.ts
  function wireMenuBar(root) {
    const menus = [...root.querySelectorAll("#menus > .menu")];
    if (!menus.length)
      return;
    const bar = root.getElementById("menus");
    bar?.setAttribute("role", "menubar");
    const head = (m) => menus[m].querySelector(":scope > button");
    const items = (m) => [...menus[m].querySelectorAll(":scope > .drop > button, :scope > .drop > a")];
    menus.forEach((menu, m) => {
      const h = head(m);
      h.setAttribute("aria-haspopup", "menu");
      h.setAttribute("aria-expanded", "false");
      menu.querySelector(":scope > .drop")?.setAttribute("role", "menu");
      menu.querySelector(":scope > .drop")?.querySelectorAll(".sep").forEach((s) => s.setAttribute("role", "separator"));
      items(m).forEach((el) => {
        el.setAttribute("role", "menuitem");
        el.setAttribute("tabindex", "-1");
      });
    });
    const view = {
      count: () => menus.length,
      enabled: (m) => items(m).map((el) => !el.disabled),
      setOpen(m) {
        menus.forEach((menu, i) => {
          const on = i === m;
          menu.classList.toggle("open", on);
          head(i).setAttribute("aria-expanded", String(on));
          if (!on)
            items(i).forEach((el) => el.classList.remove("active"));
        });
      },
      setActive(m, item) {
        items(m).forEach((el, i) => el.classList.toggle("active", i === item));
        if (item !== null)
          items(m)[item]?.focus();
      },
      choose(m, item) {
        items(m)[item]?.click();
      },
      focusHead(m) {
        if (m === null)
          root.activeElement?.blur?.();
        else
          head(m).focus();
      }
    };
    const controller = new MenuController(view);
    menus.forEach((menu, m) => {
      head(m).addEventListener("click", (ev) => {
        ev.stopPropagation();
        controller.clickHead(m);
      });
      head(m).addEventListener("mouseenter", () => controller.hoverHead(m));
      items(m).forEach((el, i) => {
        el.addEventListener("mouseenter", () => controller.hoverItem(m, i));
      });
      menu.querySelector(":scope > .drop")?.addEventListener("click", () => controller.closeAll());
    });
    root.addEventListener("click", (ev) => {
      if (controller.engaged && !ev.target.closest?.("#menus"))
        controller.closeAll();
    });
    window.addEventListener("blur", () => controller.closeAll());
    const dialogOpen = () => !!root.querySelector(".overlay:not([hidden])");
    const alt = new AltTracker;
    root.addEventListener("mousedown", () => alt.other(), true);
    root.addEventListener("keydown", (ev) => {
      if (dialogOpen()) {
        alt.other();
        if (controller.engaged)
          controller.closeAll();
        return;
      }
      if (ev.key === "Alt") {
        alt.down();
        return;
      }
      alt.other();
      if (ev.key === "F10" && !ev.shiftKey) {
        ev.preventDefault();
        controller.toggleBar();
        return;
      }
      if (controller.key(ev.key))
        ev.preventDefault();
    }, true);
    root.addEventListener("keyup", (ev) => {
      if (ev.key === "Alt" && alt.up() && !dialogOpen())
        controller.toggleBar();
    });
  }

  // web/ts/ui/tooltip_rules.ts
  var GAP = 6;
  var EDGE = 4;
  function placeTip(anchor, tip, viewport) {
    const below = anchor.y + anchor.h + GAP;
    const above = below + tip.h > viewport.h - EDGE && anchor.y - GAP - tip.h >= EDGE;
    const y = above ? anchor.y - GAP - tip.h : below;
    const centred = anchor.x + anchor.w / 2 - tip.w / 2;
    const x = Math.max(EDGE, Math.min(centred, viewport.w - tip.w - EDGE));
    return { x, y: Math.max(EDGE, y), above };
  }
  var SHORTCUTS = {
    save: "Ctrl+S",
    undo: "Ctrl+Z",
    redo: "Ctrl+Y",
    copy: "Ctrl+C",
    paste: "Ctrl+V",
    delete: "Del",
    play: "Space",
    play2: "Space",
    step: "→",
    forward: "→",
    back: "←"
  };
  function shortcutFor(data) {
    if (data.collapseFor === "sidebar")
      return "\\";
    return SHORTCUTS[data.action ?? data.sim ?? ""] ?? "";
  }
  function tipText(label, ownText) {
    const text = (label ?? "").trim();
    if (!text)
      return "";
    return text === (ownText ?? "").trim() ? "" : text;
  }
  var SHOW_DELAY_MS = 300;
  var GRACE_MS = 500;

  class TipController {
    deps;
    pending = null;
    shownFor = null;
    lastHidden = -Infinity;
    constructor(deps) {
      this.deps = deps;
    }
    get visible() {
      return this.shownFor !== null;
    }
    enter(anchor, text, shortcut = "") {
      if (!text)
        return;
      if (this.shownFor === anchor)
        return;
      this.cancel();
      const quick = this.visible || this.deps.now() - this.lastHidden < GRACE_MS;
      const run = () => {
        this.pending = null;
        if (!this.deps.connected(anchor))
          return;
        this.shownFor = anchor;
        this.deps.show(anchor, text, shortcut);
      };
      if (quick)
        run();
      else
        this.pending = this.deps.setTimer(run, SHOW_DELAY_MS);
    }
    check() {
      if (this.shownFor !== null && !this.deps.connected(this.shownFor))
        this.leave();
    }
    leave() {
      this.cancel();
      if (this.visible) {
        this.shownFor = null;
        this.lastHidden = this.deps.now();
        this.deps.hide();
      }
    }
    cancel() {
      if (this.pending !== null)
        this.deps.clearTimer(this.pending);
      this.pending = null;
    }
  }

  // web/ts/ui/tooltip.ts
  function wireTooltips(doc) {
    if (!doc.body)
      return;
    const tip = doc.createElement("div");
    tip.id = "tooltip";
    tip.className = "tooltip";
    tip.setAttribute("role", "tooltip");
    tip.hidden = true;
    doc.body.appendChild(tip);
    let current = null;
    const watcher = new MutationObserver(() => controller.check());
    const controller = new TipController({
      show(anchor, text, shortcut) {
        const el = anchor;
        tip.replaceChildren(doc.createTextNode(text));
        if (shortcut) {
          const key = doc.createElement("span");
          key.className = "tooltip-key";
          key.textContent = shortcut;
          tip.appendChild(key);
        }
        tip.hidden = false;
        const a = el.getBoundingClientRect();
        const t = tip.getBoundingClientRect();
        const place = placeTip({ x: a.left, y: a.top, w: a.width, h: a.height }, { w: t.width, h: t.height }, { w: window.innerWidth, h: window.innerHeight });
        tip.style.left = `${Math.round(place.x)}px`;
        tip.style.top = `${Math.round(place.y)}px`;
        current = el;
        el.setAttribute("aria-describedby", "tooltip");
        watcher.observe(doc.body, { childList: true, subtree: true });
      },
      hide() {
        tip.hidden = true;
        watcher.disconnect();
        current?.removeAttribute("aria-describedby");
        current = null;
      },
      setTimer: (fn, ms) => window.setTimeout(fn, ms),
      clearTimer: (h) => window.clearTimeout(h),
      now: () => performance.now(),
      connected: (anchor) => anchor.isConnected
    });
    const anchorOf = (target) => {
      const el = target?.closest?.("[title], [data-tip]") ?? null;
      if (!el || el.id === "tooltip")
        return null;
      if (el.hasAttribute("title")) {
        const title = el.getAttribute("title") ?? "";
        el.removeAttribute("title");
        el.dataset.tip = title;
        if (!el.getAttribute("aria-label") && !(el.textContent ?? "").trim())
          el.setAttribute("aria-label", title);
      }
      return el;
    };
    const enter = (target) => {
      const el = anchorOf(target);
      if (!el)
        return;
      const text = tipText(el.dataset.tip, el.textContent);
      controller.enter(el, text, shortcutFor({ action: el.dataset.action, sim: el.dataset.sim, collapseFor: el.dataset.collapseFor }));
    };
    doc.addEventListener("mouseover", (ev) => {
      const el = anchorOf(ev.target);
      if (!el)
        controller.leave();
      else
        enter(ev.target);
    });
    doc.addEventListener("mouseout", (ev) => {
      const to = ev.relatedTarget;
      if (!to?.closest?.("[data-tip], [title]"))
        controller.leave();
    });
    doc.addEventListener("focusin", (ev) => enter(ev.target));
    doc.addEventListener("focusout", () => controller.leave());
    doc.addEventListener("pointerdown", () => controller.leave(), true);
    doc.addEventListener("keydown", (ev) => {
      if (ev.key === "Escape")
        controller.leave();
    }, true);
    doc.addEventListener("scroll", () => controller.leave(), true);
    window.addEventListener("blur", () => controller.leave());
  }

  // web/ts/ui/unsaved.ts
  function fingerprint(ws) {
    if (!ws)
      return "";
    const pick = (list, keys) => (list ?? []).map((item) => keys.map((key) => item[key] ?? null));
    return JSON.stringify({
      d: pick(ws.devices, ["id", "name", "model", "x", "y", "ip", "prefix", "gw"]),
      l: pick(ws.links, ["a", "aPort", "b", "bPort", "kind"]),
      n: pick(ws.notes, ["id", "x", "y", "color", "text"])
    });
  }
  function isEmpty(ws) {
    return !ws || (ws.devices?.length ?? 0) === 0 && (ws.notes?.length ?? 0) === 0;
  }
  function hasUnsaved(ws, clean) {
    if (clean === null || isEmpty(ws))
      return false;
    return fingerprint(ws) !== clean;
  }

  // web/ts/ui/protocol_groups.ts
  var PROTOCOL_GROUPS = [
    ["Link", ["ARP", "LACP", "PAgP", "STP", "VTP", "PPP", "PAP", "PRP", "IEEE802.1X", "CDP", "LLDP"]],
    ["Network", ["ICMP", "ICMPv6", "NDP", "IPSEC", "ISAKMP", "OSPF", "EIGRP", "RIP", "BGP", "IS-IS", "LISP"]],
    ["Transport", ["TCP", "UDP", "SCTP"]],
    ["Application", ["DHCP", "DHCPv6", "DNS", "HTTP", "HTTPS", "E-mail", "SMTP", "POP3", "FTP", "TFTP", "Telnet", "SSH", "NTP", "SNMP", "SYSLOG", "NETCONF"]],
    ["Voice and media", ["SIP", "RTP", "SCCP", "H.323"]],
    ["Access and security", ["ACL", "AAA", "RADIUS", "TACACS", "NAC"]],
    ["Industrial and IoT", ["MODBUS", "MQTT", "PROFINET", "PTP", "BT", "AEP", "Cellular"]]
  ];
  var OTHER_GROUP = "Other";
  function groupProtocols(labels) {
    const seen = [...new Set(labels)];
    const groups = PROTOCOL_GROUPS.map(([name, members]) => ({
      name,
      labels: seen.filter((label) => members.includes(label))
    }));
    const known = new Set(PROTOCOL_GROUPS.flatMap(([, members]) => members));
    groups.push({ name: OTHER_GROUP, labels: seen.filter((label) => !known.has(label)) });
    return groups.filter((group) => group.labels.length > 0);
  }

  // web/ts/ui/palette_groups.ts
  var CONNECTIONS = "Connections";
  var DEFAULT_GROUP = "End devices";
  var GROUP_KINDS = {
    Routers: [
      "router",
      "rtrw-gateway",
      "backbone-pop",
      "internet-exchange",
      "national-gateway"
    ],
    Switches: ["switch", "switch-l3"],
    Hubs: ["hub", "patchpanel"],
    Wireless: ["ap", "wlc", "hotspot-ap", "sector-radio", "client-radio", "celltower"],
    Security: ["asa"],
    WAN: [
      "cloud",
      "provider-link",
      "homerouter",
      "cablemodem",
      "dsl",
      "submarine-cable"
    ],
    "End devices": ["pc", "laptop", "server", "load-balancer", "printer", "phone", "analogphone", "tv", "tablet", "sniffer"],
    [CONNECTIONS]: [],
    IoE: ["ioe", "thing", "plc"]
  };
  function tilesFor(group, palette) {
    const kinds = GROUP_KINDS[group];
    if (!kinds)
      return [];
    return palette.filter((device) => kinds.includes(device.kind));
  }
  function keepsCableMode(group) {
    return group === CONNECTIONS;
  }
  function startGroup(saved, groups) {
    if (saved && groups.includes(saved))
      return saved;
    return groups.includes(DEFAULT_GROUP) ? DEFAULT_GROUP : groups[0] ?? DEFAULT_GROUP;
  }

  // web/ts/ui/engine_loading.ts
  var MEGABYTE = 1024 * 1024;
  var megabytes = (bytes) => (bytes / MEGABYTE).toFixed(1);
  function engineLoadingMessage(progress) {
    const prefix = "Loading the Takumi engine…";
    if (!progress)
      return prefix;
    if (progress.total > 0)
      return `${prefix} ${megabytes(progress.loaded)} of ${megabytes(progress.total)} MB`;
    return `${prefix} ${megabytes(progress.loaded)} MB`;
  }

  // web/ts/ui/gallery_once.ts
  var SEEN_KEY = "pt-web:gallery-seen";
  function shouldAutoShowGallery(store) {
    try {
      if (store.getItem(SEEN_KEY))
        return false;
      store.setItem(SEEN_KEY, "1");
      return true;
    } catch {
      return true;
    }
  }

  // web/ts/ui/button.ts
  function createButton(doc, options) {
    const button = doc.createElement("button");
    button.className = options.className ? `ui-button ${options.className}` : "ui-button";
    if (options.icon) {
      const img = doc.createElement("img");
      img.setAttribute("src", options.icon);
      img.setAttribute("alt", options.label);
      button.appendChild(img);
    } else {
      button.textContent = options.label;
    }
    if (options.action)
      button.dataset.action = options.action;
    button.title = options.title ?? options.label;
    button.setAttribute("type", "button");
    if (options.toggled !== undefined)
      button.setAttribute("aria-pressed", String(options.toggled));
    button.disabled = options.disabled ?? false;
    button.addEventListener("click", () => {
      if (!button.disabled)
        options.onClick?.();
    });
    return button;
  }

  // web/ts/ui/device_list.ts
  function deviceLabel(device) {
    return device.ip ? `${device.name}, ${device.model}, ${device.ip}/${device.prefix}` : `${device.name}, ${device.model}`;
  }
  function renderDeviceList(doc, list, devices, onSelect) {
    list.replaceChildren();
    for (const device of devices) {
      const item = doc.createElement("li");
      const label = deviceLabel(device);
      const button = createButton(doc, { label: device.name, title: label, onClick: () => onSelect(device.id) });
      button.setAttribute("aria-label", label);
      item.appendChild(button);
      list.appendChild(item);
    }
  }

  // web/ts/ui/toolbar.ts
  function renderToolbar(doc, bar, items, iconSrc) {
    bar.replaceChildren();
    for (const item of items) {
      if (!item) {
        const separator = doc.createElement("span");
        separator.className = "sep";
        bar.appendChild(separator);
        continue;
      }
      const [icon, title, action] = item;
      bar.appendChild(createButton(doc, { label: title, icon: iconSrc(icon), action }));
    }
  }

  // web/ts/ui/run_log.ts
  function buildRunLog(events, commands, query) {
    const fromEvents = events.map((e) => ({
      id: e.id,
      time: e.time,
      device: e.at,
      action: `${e.type} from ${e.last}`,
      result: e.path.length ? e.path.join(" > ") : `at ${e.at}`
    }));
    const needle = query.trim().toLowerCase();
    return [...fromEvents, ...commands].filter((e) => !needle || `${e.device} ${e.action} ${e.result}`.toLowerCase().includes(needle)).sort((a, b) => a.time - b.time);
  }
  function formatLogLine(entry) {
    return `${entry.time.toFixed(3)}  ${entry.device}  ${entry.action}  ${entry.result}`;
  }

  // web/ts/ui/modal.ts
  function openModal(doc, stack, options) {
    return new Promise((resolve) => {
      const opener = doc.activeElement ?? undefined;
      const backdrop = doc.createElement("div");
      backdrop.className = "modal-backdrop";
      const box = doc.createElement("div");
      box.className = "modal";
      box.setAttribute("role", "dialog");
      box.setAttribute("aria-modal", "true");
      backdrop.appendChild(box);
      const message = doc.createElement("p");
      message.className = "modal-message";
      message.textContent = options.message;
      box.appendChild(message);
      let field = null;
      if (options.input !== undefined) {
        field = doc.createElement("input");
        field.className = "modal-input";
        field.setAttribute("type", "text");
        field.setAttribute("autocomplete", "off");
        field.value = options.input;
        box.appendChild(field);
      }
      const accept = () => {
        resolve(field ? field.value : true);
        stack.close();
      };
      const row = doc.createElement("div");
      row.className = "modal-buttons";
      row.appendChild(createButton(doc, { label: options.cancelText ?? "Cancel", className: "modal-cancel", onClick: () => stack.close() }));
      const ok = createButton(doc, { label: options.okText ?? "OK", className: "modal-ok", onClick: accept });
      row.appendChild(ok);
      box.appendChild(row);
      box.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
          event.preventDefault();
          stack.escape();
        } else if (event.key === "Enter" && event.target?.tagName !== "BUTTON") {
          event.preventDefault();
          accept();
        }
      });
      backdrop.addEventListener("click", (event) => {
        if (event.target === backdrop)
          stack.close();
      });
      stack.push({
        id: "modal",
        opener,
        onClose: () => {
          backdrop.remove();
          resolve(field ? null : false);
        }
      });
      doc.body.appendChild(backdrop);
      setTimeout(() => {
        if (field) {
          field.focus();
          field.select();
        } else {
          ok.focus();
        }
      }, 0);
    });
  }

  // web/ts/ui/modal_stack.ts
  class ModalStack {
    entries = [];
    get size() {
      return this.entries.length;
    }
    push(entry) {
      this.entries.push(entry);
    }
    has(id) {
      return this.entries.some((entry) => entry.id === id);
    }
    forget(id) {
      const index = this.entries.findIndex((entry) => entry.id === id);
      if (index < 0)
        return false;
      this.entries.splice(index, 1);
      return true;
    }
    escape() {
      return this.close();
    }
    closeById(id) {
      const index = this.entries.findIndex((entry) => entry.id === id);
      if (index < 0)
        return false;
      const [entry] = this.entries.splice(index, 1);
      entry.onClose();
      entry.opener?.focus();
      return true;
    }
    close() {
      const top = this.entries.pop();
      if (!top)
        return false;
      top.onClose();
      top.opener?.focus();
      return true;
    }
  }

  // web/ts/ui/dialog_close.ts
  function overlayToClose(target) {
    if (!target)
      return null;
    if (target.classList.contains("overlay"))
      return target;
    if (target.closest("[data-dialog-close]"))
      return target.closest(".overlay");
    return null;
  }
  function closeOverlay(overlay, stack) {
    if (!stack.closeById(overlay.id))
      overlay.hidden = true;
  }
  function wireDialogClose(source, stack) {
    let pressed = null;
    source.addEventListener("mousedown", (event) => {
      pressed = event.target;
    });
    source.addEventListener("click", (event) => {
      const overlay = overlayToClose(event.target);
      if (!overlay)
        return;
      const fromBackdrop = event.target.classList.contains("overlay");
      if (fromBackdrop && pressed !== event.target)
        return;
      closeOverlay(overlay, stack);
    });
    source.addEventListener("keydown", (event) => {
      if (event.key !== "Escape" || event.defaultPrevented)
        return;
      if (stack.escape())
        event.preventDefault();
    });
  }

  // web/ts/ui/kind_parts.ts
  function el(doc, tag, className, text) {
    const node = doc.createElement(tag);
    node.className = className;
    if (text !== undefined)
      node.textContent = text;
    return node;
  }
  function note(doc, state, text) {
    const p = el(doc, "p", `kw-note kw-${state}`, text);
    p.setAttribute("role", state === "error" ? "alert" : "status");
    return p;
  }
  function rowList(doc, items) {
    const list = el(doc, "ul", "kw-list");
    for (const item of items)
      list.appendChild(el(doc, "li", "kw-row", item));
    return list;
  }
  function section(doc, root, title) {
    const wrap = el(doc, "section", "kw-section");
    wrap.appendChild(el(doc, "h3", "kw-heading", title));
    const body = el(doc, "div", "kw-section-body");
    wrap.appendChild(body);
    root.appendChild(wrap);
    return body;
  }
  function asyncSection(doc, root, title, errorText, fill) {
    const box = section(doc, root, title);
    const run = async () => {
      box.replaceChildren();
      box.appendChild(note(doc, "loading", "Loading…"));
      try {
        await fill(box);
      } catch {
        box.replaceChildren();
        box.appendChild(note(doc, "error", errorText));
        box.appendChild(createButton(doc, { label: "Try again", className: "kw-retry", onClick: () => void run() }));
      }
    };
    return run();
  }
  function field(doc, form, labelText, type = "text") {
    const label = el(doc, "label", "kw-field", labelText);
    const input = el(doc, "input", "kw-input");
    input.setAttribute("type", type);
    if (type === "number")
      input.setAttribute("min", "1");
    input.setAttribute("autocomplete", "off");
    input.setAttribute("spellcheck", "false");
    label.appendChild(input);
    form.appendChild(label);
    return input;
  }
  function onEnter(input, action) {
    input.addEventListener("keydown", (event) => {
      if (event.key === "Enter")
        action();
    });
  }
  function showOutcome(doc, target, state, text) {
    target.replaceChildren();
    target.appendChild(note(doc, state, text));
  }
  function records(res, key) {
    const value = res[key];
    return Array.isArray(value) ? value : [];
  }
  function asText(value) {
    return typeof value === "string" ? value : value == null ? "" : String(value);
  }
  function errorOf(res) {
    return typeof res["error"] === "string" && res["error"] ? res["error"] : null;
  }
  function linkEnds(workspace, id) {
    const name = (deviceId) => workspace.devices?.find((d) => d.id === deviceId)?.name ?? deviceId;
    const ends = [];
    for (const link of workspace.links ?? []) {
      if (link.a === id)
        ends.push(`${link.aPort} to ${name(link.b)} ${link.bPort}`);
      else if (link.b === id)
        ends.push(`${link.bPort} to ${name(link.a)} ${link.aPort}`);
    }
    return ends;
  }

  // web/ts/ui/gateway_window.ts
  var enc = encodeURIComponent;
  function wholeNumber(value) {
    const n = Number(value);
    return Number.isInteger(n) && n > 0 ? n : null;
  }
  function mbitText(value) {
    const n = Number(value);
    return Number.isFinite(n) ? (Math.round(n * 10) / 10).toString() : asText(value);
  }
  function sessionsSection(doc, root, device, post) {
    return asyncSection(doc, root, "Customer sessions", "Could not load the sessions.", async (box) => {
      const res = await post(`/api/pppoe/sessions?id=${enc(device.id)}`);
      const err = errorOf(res);
      if (err)
        throw new Error(err);
      const rows = records(res, "sessions");
      box.replaceChildren();
      if (rows.length === 0)
        box.appendChild(note(doc, "empty", "No customer is connected yet."));
      else
        box.appendChild(rowList(doc, rows.map((r) => `${asText(r["user"])} on ${asText(r["client"])}`)));
    });
  }
  function fillQueues(doc, box, device, post) {
    return (async () => {
      const res = await post(`/api/queues/list?id=${enc(device.id)}&port=Ether1`);
      const err = errorOf(res);
      if (err)
        throw new Error(err);
      const rows = records(res, "sessions");
      const load = res["load"];
      box.replaceChildren();
      if (rows.length === 0)
        box.appendChild(note(doc, "empty", "No customer is connected yet."));
      else
        box.appendChild(rowList(doc, rows.map((r) => `${asText(r["user"])} on ${asText(r["client"])}: ${mbitText(r["mbit"])} Mbit/s measured`)));
      const loadText = typeof load === "number" ? `Line load: ${Math.round(load)}%` : "The line load is not measured yet.";
      box.appendChild(note(doc, "plain", loadText));
    })();
  }
  function queuesSection(doc, root, device, post) {
    let listBox = null;
    const done = asyncSection(doc, root, "Speed limits", "Could not load the speed limits.", (box) => {
      listBox = box;
      return fillQueues(doc, box, device, post);
    });
    const refresh = () => {
      if (listBox)
        fillQueues(doc, listBox, device, post).catch(() => {
          return;
        });
    };
    limitForm(doc, root, device, post, refresh);
    parentForm(doc, root, device, post, refresh);
    return done;
  }
  function limitForm(doc, root, device, post, refresh) {
    const form = el(doc, "div", "kw-form");
    const user = field(doc, form, "Customer");
    const mbit = field(doc, form, "Limit in Mbit/s", "number");
    const outcome = el(doc, "div", "kw-outcome");
    const submit = () => void save();
    const save = async () => {
      const name = user.value.trim();
      const limit = wholeNumber(mbit.value);
      if (!name || limit === null) {
        showOutcome(doc, outcome, "error", "Type a customer name and a whole number of Mbit/s.");
        return;
      }
      try {
        const res = await post(`/api/devices/queue?id=${enc(device.id)}&user=${enc(name)}&mbit=${limit}`);
        const err = errorOf(res);
        if (err)
          showOutcome(doc, outcome, "error", err);
        else {
          showOutcome(doc, outcome, "ok", `Limit saved: ${name} at ${limit} Mbit/s.`);
          refresh();
        }
      } catch {
        showOutcome(doc, outcome, "error", "The request failed. Check the connection and try again.");
      }
    };
    onEnter(user, submit);
    onEnter(mbit, submit);
    form.appendChild(createButton(doc, { label: "Set limit", className: "kw-submit", onClick: submit }));
    form.appendChild(outcome);
    root.appendChild(form);
  }
  function parentForm(doc, root, device, post, refresh) {
    const form = el(doc, "div", "kw-form");
    const mbit = field(doc, form, "Whole line in Mbit/s", "number");
    const outcome = el(doc, "div", "kw-outcome");
    const submit = () => void save();
    const save = async () => {
      const limit = wholeNumber(mbit.value);
      if (limit === null) {
        showOutcome(doc, outcome, "error", "Type a whole number of Mbit/s.");
        return;
      }
      try {
        const res = await post(`/api/devices/queue?id=${enc(device.id)}&mbit=${limit}&parent=1`);
        const err = errorOf(res);
        if (err)
          showOutcome(doc, outcome, "error", err);
        else {
          showOutcome(doc, outcome, "ok", `Line limit saved: ${limit} Mbit/s.`);
          refresh();
        }
      } catch {
        showOutcome(doc, outcome, "error", "The request failed. Check the connection and try again.");
      }
    };
    onEnter(mbit, submit);
    form.appendChild(createButton(doc, { label: "Set line limit", className: "kw-submit", onClick: submit }));
    form.appendChild(outcome);
    root.appendChild(form);
  }
  function vouchersSection(doc, root, device, post) {
    const box = section(doc, root, "Vouchers");
    const form = el(doc, "div", "kw-form");
    const code = field(doc, form, "Code");
    const minutes = field(doc, form, "Minutes", "number");
    const outcome = el(doc, "div", "kw-outcome");
    const submit = () => void save();
    const save = async () => {
      const codeText = code.value.trim();
      const time = wholeNumber(minutes.value);
      if (!codeText || time === null) {
        showOutcome(doc, outcome, "error", "Type a code and a whole number of minutes.");
        return;
      }
      try {
        const res = await post(`/api/voucher?id=${enc(device.id)}&code=${enc(codeText)}&minutes=${time}`);
        const err = errorOf(res);
        if (err)
          showOutcome(doc, outcome, "error", err);
        else
          showOutcome(doc, outcome, "ok", `Voucher ${codeText} is ready for ${time} minutes.`);
      } catch {
        showOutcome(doc, outcome, "error", "The request failed. Check the connection and try again.");
      }
    };
    onEnter(code, submit);
    onEnter(minutes, submit);
    form.appendChild(createButton(doc, { label: "Create voucher", className: "kw-submit", onClick: submit }));
    form.appendChild(outcome);
    box.appendChild(form);
  }
  function accountsSection(doc, root, device, post) {
    let listBox = null;
    const fill = async (box) => {
      listBox = box;
      const res = await post(`/api/aaa/list?id=${enc(device.id)}`);
      const err = errorOf(res);
      if (err)
        throw new Error(err);
      const users = Array.isArray(res["users"]) ? res["users"].map(asText) : [];
      box.replaceChildren();
      if (users.length === 0)
        box.appendChild(note(doc, "empty", "No customer account exists yet."));
      else
        box.appendChild(rowList(doc, users));
    };
    const done = asyncSection(doc, root, "Customer accounts", "Could not load the accounts.", fill);
    const form = el(doc, "div", "kw-form");
    const user = field(doc, form, "User");
    const pass = field(doc, form, "Password", "password");
    const outcome = el(doc, "div", "kw-outcome");
    const submit = () => void save();
    const save = async () => {
      const name = user.value.trim();
      if (!name || !pass.value) {
        showOutcome(doc, outcome, "error", "Type a user name and a password.");
        return;
      }
      try {
        const res = await post(`/api/devices/aaa?id=${enc(device.id)}&user=${enc(name)}&pass=${enc(pass.value)}`);
        const err = errorOf(res);
        if (err)
          showOutcome(doc, outcome, "error", err);
        else {
          showOutcome(doc, outcome, "ok", `Account ${name} added.`);
          if (listBox)
            await fill(listBox).catch(() => {
              return;
            });
        }
      } catch {
        showOutcome(doc, outcome, "error", "The request failed. Check the connection and try again.");
      }
    };
    onEnter(user, submit);
    onEnter(pass, submit);
    form.appendChild(createButton(doc, { label: "Add account", className: "kw-submit", onClick: submit }));
    form.appendChild(outcome);
    root.appendChild(form);
    return done;
  }
  function renderGatewayWindow(doc, body, device, post) {
    body.replaceChildren();
    const loads = [
      sessionsSection(doc, body, device, post),
      queuesSection(doc, body, device, post)
    ];
    vouchersSection(doc, body, device, post);
    loads.push(accountsSection(doc, body, device, post));
    return Promise.all(loads).then(() => {
      return;
    });
  }

  // web/ts/ui/hotspot_window.ts
  function renderHotspotWindow(doc, body, device, post) {
    body.replaceChildren();
    const done = asyncSection(doc, body, "Wireless networks", "Could not load the wireless networks.", async (box) => {
      const res = await post(`/api/wifi/wlans?id=${encodeURIComponent(device.id)}`);
      const err = errorOf(res);
      if (err)
        throw new Error(err);
      const rows = records(res, "wlans");
      box.replaceChildren();
      if (rows.length === 0)
        box.appendChild(note(doc, "empty", "No wireless network is set up yet."));
      else
        box.appendChild(rowList(doc, rows.map((r) => `${asText(r["ssid"])} (${asText(r["security"])})`)));
    });
    body.appendChild(note(doc, "plain", "Visitors sign in with a voucher on the gateway."));
    return done;
  }

  // web/ts/ui/provider_window.ts
  function renderProviderWindow(doc, body, device, workspace) {
    body.replaceChildren();
    body.appendChild(note(doc, "plain", "The other end is the provider."));
    const box = section(doc, body, "Cable ends");
    const ends = linkEnds(workspace, device.id);
    if (ends.length === 0)
      box.appendChild(note(doc, "empty", "No cable is connected yet."));
    else
      box.appendChild(rowList(doc, ends));
  }

  // web/ts/ui/radio_window.ts
  function portDelayMs(saved, deviceId) {
    let max = 100;
    for (const match of saved.matchAll(/<port id="([^"]+)"[^>]*delay_us="(\d+)"/g)) {
      if (match[1] === deviceId)
        max = Math.max(max, Number(match[2]));
    }
    const ms = max / 1000;
    return Number.isInteger(ms) ? String(ms) : String(Math.round(ms * 10) / 10);
  }
  function cableSection(doc, body, device, workspace) {
    const box = section(doc, body, "Cabled links");
    const ends = linkEnds(workspace, device.id);
    if (ends.length === 0)
      box.appendChild(note(doc, "empty", "No cable is connected yet."));
    else
      box.appendChild(rowList(doc, ends));
  }
  function renderRadioWindow(doc, body, device, workspace, getText) {
    body.replaceChildren();
    cableSection(doc, body, device, workspace);
    if (device.kind !== "client-radio")
      return Promise.resolve();
    return asyncSection(doc, body, "Radio delay", "Could not read the radio delay.", async (box) => {
      const saved = await getText("/api/export");
      const ms = portDelayMs(saved, device.id);
      box.replaceChildren();
      box.appendChild(note(doc, "plain", `This radio link adds ${ms} ms.`));
    });
  }

  // web/ts/ui/kind_windows.ts
  var WINDOW_IDS = {
    "rtrw-gateway": "gateway-window",
    "client-radio": "radio-window",
    "sector-radio": "radio-window",
    "provider-link": "provider-window",
    "hotspot-ap": "hotspot-window"
  };
  function windowIdForKind(kind) {
    return WINDOW_IDS[kind] ?? null;
  }
  function renderKindWindow(doc, body, device, workspace, deps) {
    switch (device.kind) {
      case "rtrw-gateway":
        return renderGatewayWindow(doc, body, device, deps.post);
      case "client-radio":
      case "sector-radio":
        return renderRadioWindow(doc, body, device, workspace, deps.getText);
      case "provider-link":
        renderProviderWindow(doc, body, device, workspace);
        return Promise.resolve();
      case "hotspot-ap":
        return renderHotspotWindow(doc, body, device, deps.post);
      default:
        return Promise.resolve();
    }
  }

  // web/ts/main.ts
  var doc = document;
  var stack = new ModalStack;
  globalThis.askConfirm = async (message, okText = "OK") => await openModal(doc, stack, { message, okText }) === true;
  globalThis.askText = async (message, value = "") => await openModal(doc, stack, { message, input: value });
  globalThis.bringToFront = bringToFront;
  globalThis.engineLoadingMessage = engineLoadingMessage;
  globalThis.shouldAutoShowGallery = () => shouldAutoShowGallery(localStorage);
  globalThis.renderDeviceList = (list, devices, onSelect) => renderDeviceList(doc, list, devices, onSelect);
  globalThis.WorkspaceCanvas = WorkspaceCanvas;
  globalThis.wireMenus = () => wireMenuBar(document);
  globalThis.workspaceFingerprint = fingerprint;
  globalThis.workspaceHasUnsaved = hasUnsaved;
  globalThis.paletteTiles = tilesFor;
  globalThis.paletteKeepsCableMode = keepsCableMode;
  globalThis.groupProtocols = groupProtocols;
  globalThis.paletteStartGroup = startGroup;
  globalThis.PALETTE_CONNECTIONS = CONNECTIONS;
  globalThis.buildRunLog = buildRunLog;
  globalThis.formatLogLine = formatLogLine;
  globalThis.renderToolbar = (bar, items) => renderToolbar(doc, bar, items, (key) => icon3d(key));
  globalThis.makeWindowMovable = makeWindowMovable;
  var postJson = async (path) => await (await fetch(path, { method: "POST" })).json();
  var getText = async (path) => {
    const res = await fetch(path);
    if (!res.ok)
      throw new Error(`request failed (${res.status})`);
    return res.text();
  };
  globalThis.openWindowForKind = (device, workspace) => {
    const winId = windowIdForKind(device?.kind ?? "");
    const win = winId ? document.getElementById(winId) : null;
    const name = win?.querySelector(".kindwin-name");
    const body = win?.querySelector(".kindwin-body");
    if (!win || !name || !body)
      return false;
    name.textContent = device.name;
    win.hidden = false;
    bringToFront(win);
    renderKindWindow(doc, body, device, workspace ?? {}, { post: postJson, getText });
    return true;
  };
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => watchOverlays(stack));
  } else {
    watchOverlays(stack);
  }
  wireDialogClose(document, stack);
  var store = (() => {
    try {
      return localStorage;
    } catch {
      return null;
    }
  })();
  var wireBars = () => {
    wireTooltips(document);
    wireSidebar();
    wireCollapsibles(document, store);
  };
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", wireBars);
  } else {
    wireBars();
  }
})();
