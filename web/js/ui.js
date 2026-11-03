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

  // web/ts/canvas/scene.ts
  var BOX = { left: 36, top: 34, size: 72 };
  function buildScene(workspace) {
    const devices = workspace.devices.map((d) => ({
      ...d,
      box: { x: d.x - BOX.left, y: d.y - BOX.top, w: BOX.size, h: BOX.size }
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
    state = null;
    ctx;
    images = new Map;
    loading = new Set;
    packets = [];
    frame = 0;
    panFrom = null;
    spaceDown = false;
    constructor(canvas) {
      this.canvas = canvas;
      const ctx = canvas.getContext("2d");
      if (!ctx)
        throw new Error("canvas 2d context unavailable");
      this.ctx = ctx;
      this.resize();
      window.addEventListener("resize", () => this.resize());
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
    resize() {
      const dpr = window.devicePixelRatio || 1;
      this.canvas.width = Math.round(this.cssWidth * dpr);
      this.canvas.height = Math.round(this.cssHeight * dpr);
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
      drawScene(this.ctx, this.scene, this.camera, {
        width: this.cssWidth,
        height: this.cssHeight,
        grid: state?.grid ?? false,
        image: (src) => this.image(src),
        selected: state?.selected,
        marked: state?.marked,
        linked: state?.linked,
        packets,
        empty: state?.empty
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
      const device = hitDevice(this.scene, world);
      if (device)
        return this.handlers.onDeviceDown?.(device, ev);
      const link = hitLink(this.scene, world, LINK_TOLERANCE_PX / this.camera.zoom);
      if (link)
        return this.handlers.onLinkDown?.(link, ev);
      this.handlers.onBackgroundDown?.(ev);
    }
    onPointerMove(ev) {
      if (!this.panFrom) {
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
      if (field) {
        field.focus();
        field.select();
      } else {
        ok.focus();
      }
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
    close() {
      const top = this.entries.pop();
      if (!top)
        return false;
      top.onClose();
      top.opener?.focus();
      return true;
    }
  }

  // web/ts/main.ts
  var doc = document;
  var stack = new ModalStack;
  globalThis.askConfirm = async (message, okText = "OK") => await openModal(doc, stack, { message, okText }) === true;
  globalThis.askText = async (message, value = "") => await openModal(doc, stack, { message, input: value });
  globalThis.bringToFront = bringToFront;
  globalThis.WorkspaceCanvas = WorkspaceCanvas;
  globalThis.buildRunLog = buildRunLog;
  globalThis.formatLogLine = formatLogLine;
  globalThis.renderToolbar = (bar, items) => renderToolbar(doc, bar, items, (key) => icon3d(key));
  globalThis.makeWindowMovable = makeWindowMovable;
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => watchOverlays(stack));
  } else {
    watchOverlays(stack);
  }
})();
