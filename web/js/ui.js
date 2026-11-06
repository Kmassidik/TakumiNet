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

  // web/ts/canvas/pointer_rules.ts
  var STEP = 1.1;
  var PINCH_SCALE = 0.01;
  function wheelAction(ev) {
    if (ev.ctrlKey)
      return { kind: "zoom", factor: Math.exp(-ev.deltaY * PINCH_SCALE) };
    const stepped = ev.deltaY < 0 ? STEP : 1 / STEP;
    if (ev.deltaMode !== 0)
      return { kind: "zoom", factor: stepped };
    const notch = ev.deltaX === 0 && Math.abs(ev.deltaY) >= 100 && Number.isInteger(ev.deltaY);
    if (notch)
      return { kind: "zoom", factor: stepped };
    return { kind: "pan", dx: ev.deltaX, dy: ev.deltaY };
  }
  function cursorFor(hit, mode, held) {
    if (mode === "crosshair")
      return "crosshair";
    if (held)
      return hit === "link" ? "pointer" : "grabbing";
    if (hit === "link")
      return "pointer";
    if (hit)
      return "grab";
    return "default";
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
  function hitGroup(scene, p) {
    for (let i = scene.groups.length - 1;i >= 0; i--) {
      const g = scene.groups[i];
      const { x, y, w, h } = g.box;
      if (p.x >= x && p.x <= x + w && p.y >= y && p.y <= y + h)
        return g;
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

  // web/ts/canvas/cable_style.ts
  var CABLE_STYLES = {
    eCopper: { color: "#1b1f23", width: 2, dash: [], name: "Copper straight-through" },
    eCross: { color: "#1b1f23", width: 2, dash: [10, 6], name: "Copper cross-over" },
    eFiber: { color: "#c2570c", width: 2.5, dash: [], name: "Optical fibre" },
    eSerial: { color: "#b42318", width: 2, dash: [12, 4, 2, 4], name: "Serial" },
    eConsole: { color: "#0f766e", width: 2, dash: [6, 4], name: "Console" },
    ePhone: { color: "#7c3aed", width: 2, dash: [2, 4], name: "Phone line" },
    eCoax: { color: "#8a5a14", width: 3.5, dash: [], name: "Coaxial" },
    eIoT: { color: "#be185d", width: 2, dash: [5, 3, 1, 3], name: "IoT" }
  };
  var FALLBACK = CABLE_STYLES["eCopper"];
  function cableStyle(kind) {
    return kind && CABLE_STYLES[kind] || FALLBACK;
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
  var STATUS_COLORS = { up: "#0a7a3d", degraded: "#e6a23c", down: "#b42318", isolated: "#667085" };
  var GRID_WORLD = 25;
  var SELECT = "#2b6cb0";
  var INK = "#1b1f23";
  var MUTED = "#667085";
  var HALO = "#ffffff";
  var ICON_CLEAR = 27;
  var STACK_CLEAR = 72;
  var DOWNWARD = 0.3;
  var PORT_ALONG = 22;
  var PORT_ASIDE = 10;
  function portLabelAt(end, other, clear = 0, deepClear = clear) {
    const dx = other.x - end.x;
    const dy = other.y - end.y;
    const len = Math.hypot(dx, dy);
    if (len === 0)
      return { x: end.x, y: end.y - clear - PORT_ALONG };
    const ux = dx / len;
    const uy = dy / len;
    const along = (uy > DOWNWARD ? deepClear : clear) + PORT_ALONG;
    return { x: end.x + ux * along - uy * PORT_ASIDE, y: end.y + uy * along + ux * PORT_ASIDE };
  }
  function haloText(ctx, text, x, y, color = INK) {
    ctx.strokeStyle = HALO;
    ctx.lineWidth = 3;
    ctx.strokeText(text, x, y);
    ctx.fillStyle = color;
    ctx.fillText(text, x, y);
  }
  function drawScene(ctx, scene, camera, options) {
    const { width, height } = options;
    ctx.clearRect(0, 0, width, height);
    if (options.grid)
      drawGrid(ctx, camera, width, height);
    if (!scene.devices.length && options.empty)
      drawEmpty(ctx, options, width, height);
    for (const link of scene.links)
      drawCable(ctx, link, camera, options);
    for (const device of scene.devices)
      drawDeviceBody(ctx, device, camera, options);
    for (const group of scene.groups)
      drawGroupBody(ctx, group, camera, options);
    for (const link of scene.links)
      drawPortLabels(ctx, link, camera);
    for (const device of scene.devices)
      drawDeviceLabels(ctx, device, camera);
    for (const group of scene.groups)
      drawGroupLabels(ctx, group, camera);
    for (const packet of options.packets ?? [])
      drawPacket(ctx, packet, camera);
    for (const note of options.notes ?? [])
      drawNote(ctx, note, camera, options.selectedNote ?? null);
    if (options.pending)
      drawPendingCable(ctx, options.pending, camera);
    if (options.marquee)
      drawMarquee(ctx, options.marquee, camera);
  }
  function drawPendingCable(ctx, pending, camera) {
    const a = camera.toScreen(pending.from);
    const b = camera.toScreen(pending.to);
    ctx.strokeStyle = SELECT;
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 5]);
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
    ctx.setLineDash([]);
  }
  function drawMarquee(ctx, rect, camera) {
    const at = camera.toScreen({ x: rect.x, y: rect.y });
    ctx.strokeStyle = SELECT;
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 4]);
    ctx.strokeRect(at.x, at.y, rect.w * camera.zoom, rect.h * camera.zoom);
    ctx.setLineDash([]);
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
    ctx.fillStyle = INK;
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
    ctx.fillStyle = MUTED;
    ctx.font = "14px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(empty.message, width / 2, height / 2 + 36);
  }
  function drawCable(ctx, link, camera, options) {
    const a = camera.toScreen(link.from);
    const b = camera.toScreen(link.to);
    const selected = options.linked?.a === link.a && options.linked?.b === link.b;
    const style = cableStyle(link.kind);
    ctx.strokeStyle = selected ? SELECT : style.color;
    ctx.lineWidth = selected ? style.width + 1 : style.width;
    if (style.dash.length > 0)
      ctx.setLineDash(style.dash);
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
    if (style.dash.length > 0)
      ctx.setLineDash([]);
    for (const [t, state] of [[0.08, link.aState], [0.92, link.bState]]) {
      ctx.fillStyle = LED_COLORS[state ?? "red"] ?? LED_COLORS.red;
      ctx.beginPath();
      ctx.arc(a.x + (b.x - a.x) * t, a.y + (b.y - a.y) * t, 4, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  function drawPortLabels(ctx, link, camera) {
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
  function drawDeviceBody(ctx, device, camera, options) {
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
  function drawDeviceLabels(ctx, device, camera) {
    const origin = camera.toScreen({ x: device.box.x, y: device.box.y });
    const cx = origin.x + device.box.w * camera.zoom / 2;
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
  function drawGroupBody(ctx, group, camera, options) {
    const origin = camera.toScreen({ x: group.box.x, y: group.box.y });
    const size = group.box.w * camera.zoom;
    const selected = options.selected?.has(group.id) ?? false;
    ctx.fillStyle = "#eef3fb";
    ctx.fillRect(origin.x, origin.y, size, size);
    ctx.strokeStyle = selected ? SELECT : MUTED;
    ctx.lineWidth = selected ? 2 : 1.5;
    ctx.strokeRect(origin.x, origin.y, size, size);
    ctx.fillStyle = STATUS_COLORS[group.status] ?? STATUS_COLORS.isolated;
    ctx.beginPath();
    ctx.arc(origin.x + size - 10 * camera.zoom, origin.y + 10 * camera.zoom, 5, 0, Math.PI * 2);
    ctx.fill();
  }
  function drawGroupLabels(ctx, group, camera) {
    const origin = camera.toScreen({ x: group.box.x, y: group.box.y });
    const cx = origin.x + group.box.w * camera.zoom / 2;
    ctx.textAlign = "center";
    ctx.font = "600 12px sans-serif";
    haloText(ctx, group.name, cx, origin.y + 74 * camera.zoom);
    ctx.font = "10px sans-serif";
    haloText(ctx, `${group.devices} device${group.devices === 1 ? "" : "s"}`, cx, origin.y + 86 * camera.zoom, MUTED);
  }
  function drawPacket(ctx, packet, camera) {
    const p = camera.toScreen(packet.at);
    if (packet.from) {
      const tail = camera.toScreen(packet.from);
      if (Math.hypot(p.x - tail.x, p.y - tail.y) > 0.5) {
        ctx.strokeStyle = packet.color;
        ctx.lineWidth = 2;
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.moveTo(tail.x, tail.y);
        ctx.lineTo(p.x, p.y);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }
    const w = 18;
    const h = 11;
    const r = 3;
    const x = p.x - w / 2;
    const y = p.y - h / 2;
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.arc(x + w - r, y + r, r, -Math.PI / 2, 0);
    ctx.lineTo(x + w, y + h - r);
    ctx.arc(x + w - r, y + h - r, r, 0, Math.PI / 2);
    ctx.lineTo(x + r, y + h);
    ctx.arc(x + r, y + h - r, r, Math.PI / 2, Math.PI);
    ctx.lineTo(x, y + r);
    ctx.arc(x + r, y + r, r, Math.PI, Math.PI * 1.5);
    ctx.fillStyle = packet.color;
    ctx.fill();
    ctx.strokeStyle = INK;
    ctx.lineWidth = 1.2;
    ctx.stroke();
    ctx.fillStyle = HALO;
    ctx.fillRect(x + 5, y + 3, 8, 1.5);
    ctx.fillRect(x + 5, y + 6.5, 5, 1.5);
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

  // web/ts/canvas/group_scene.ts
  function planGroups(devices, links, groups) {
    const owner = new Map;
    const nodes = [];
    for (const group of groups) {
      const members = devices.filter((d) => group.members.includes(d.id));
      if (!members.length)
        continue;
      nodes.push({
        id: group.id,
        name: group.name,
        devices: group.devices,
        status: group.status,
        x: members.reduce((sum, d) => sum + d.x, 0) / members.length,
        y: members.reduce((sum, d) => sum + d.y, 0) / members.length
      });
      for (const member of members)
        owner.set(member.id, group.id);
    }
    const visible = devices.filter((d) => !owner.has(d.id));
    const drawn = [];
    for (const link of links) {
      const a = owner.get(link.a) ?? link.a;
      const b = owner.get(link.b) ?? link.b;
      if (a === b && (owner.has(link.a) || owner.has(link.b)))
        continue;
      drawn.push(a === link.a && b === link.b ? link : { ...link, a, b });
    }
    return { devices: visible, links: drawn, groups: nodes };
  }

  // web/ts/canvas/scene.ts
  var BOX2 = { left: 36, top: 34, size: 72 };
  function boxAt(x, y) {
    return { x: x - BOX2.left, y: y - BOX2.top, w: BOX2.size, h: BOX2.size };
  }
  function buildScene(workspace) {
    const plan = planGroups(workspace.devices, workspace.links, workspace.groups ?? []);
    const devices = plan.devices.map((d) => ({ ...d, box: boxAt(d.x, d.y) }));
    const groups = plan.groups.map((g) => ({ ...g, box: boxAt(g.x, g.y) }));
    const byId = new Map(devices.map((d) => [d.id, d]));
    for (const g of groups) {
      byId.set(g.id, {
        id: g.id,
        kind: "group",
        name: g.name,
        model: "",
        icon: "",
        x: g.x,
        y: g.y,
        ip: "",
        prefix: 0,
        box: g.box
      });
    }
    const links = [];
    for (const link of plan.links) {
      const from = byId.get(link.a);
      const to = byId.get(link.b);
      if (from && to)
        links.push({ ...link, from, to });
    }
    return { devices, links, groups };
  }

  // web/ts/canvas/marquee.ts
  function normalizedRect(a, b) {
    return {
      x: Math.min(a.x, b.x),
      y: Math.min(a.y, b.y),
      w: Math.abs(a.x - b.x),
      h: Math.abs(a.y - b.y)
    };
  }
  function rectsIntersect(a, b) {
    return a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;
  }
  function idsInRect(items, rect) {
    return items.filter((item) => rectsIntersect(item.box, rect)).map((item) => item.id);
  }

  // web/ts/canvas/workspace_canvas.ts
  var LINK_TOLERANCE_PX = 6;

  class WorkspaceCanvas {
    canvas;
    camera = new Camera({ x: 0, y: 0, zoom: 1 });
    handlers = {};
    scene = { devices: [], links: [], groups: [] };
    racks = { racks: [] };
    state = null;
    ctx;
    images = new Map;
    loading = new Set;
    packets = [];
    frame = 0;
    panFrom = null;
    marquee = null;
    pointerWorld = null;
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
      canvas.addEventListener("pointerup", (ev) => this.onPointerUp(ev));
      canvas.addEventListener("wheel", (ev) => this.onWheel(ev), { passive: false });
      canvas.addEventListener("contextmenu", (ev) => this.onContextMenu(ev));
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
      const rects = physical ? this.racks.racks.map((r) => r.rect) : [
        ...this.scene.devices.map((d) => d.box),
        ...this.scene.groups.map((g) => g.box),
        ...(state?.notes ?? []).map((n) => noteBox(n))
      ];
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
      const boxes = [
        ...[...this.scene.devices, ...this.scene.groups].map((d) => d.box),
        ...(this.state?.notes ?? []).map((note) => {
          const box = noteBox(note);
          return { x: box.x, y: box.y, w: box.w, h: box.h };
        })
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
      if (enteringPhysical)
        this.fitRacks();
      this.requestDraw();
    }
    deviceAt(ev) {
      if (this.state?.physical)
        return null;
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
        selectedNote: state?.selectedNote,
        marquee: this.marquee ? normalizedRect(this.marquee.from, this.marquee.to) : null,
        pending: state?.pending && this.pointerWorld ? { from: state.pending, to: this.pointerWorld } : null
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
        const elapsed = now - start;
        const from = packetAt(run.points, Math.max(0, elapsed - 60), run.segmentMs) ?? at;
        live.push({ at, from, color: run.color });
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
      if (note)
        return this.handlers.onNoteDown?.(note, ev);
      if (this.state?.physical) {
        const device = hitRackBox(this.racks, world);
        if (device)
          return this.handlers.onDeviceDown?.(device, ev);
        return this.handlers.onBackgroundDown?.(ev);
      }
      const group = hitGroup(this.scene, world);
      if (group)
        return this.handlers.onGroupDown?.(group, ev);
      const device = hitDevice(this.scene, world);
      if (device)
        return this.handlers.onDeviceDown?.(device, ev);
      const link = hitLink(this.scene, world, LINK_TOLERANCE_PX / this.camera.zoom);
      if (link)
        return this.handlers.onLinkDown?.(link, ev);
      if (ev.button === 0 && this.mode() === "select") {
        this.marquee = { from: world, to: world, additive: ev.shiftKey, down: ev };
        this.canvas.setPointerCapture(ev.pointerId);
        return;
      }
      this.startPan(ev);
      this.handlers.onBackgroundDown?.(ev);
    }
    onContextMenu(ev) {
      ev.preventDefault();
      if (!this.handlers.onContextMenu)
        return;
      if (this.state?.physical)
        return this.handlers.onContextMenu({}, ev);
      const world = this.worldAt(ev);
      const group = hitGroup(this.scene, world);
      if (group)
        return this.handlers.onContextMenu({ group }, ev);
      const device = hitDevice(this.scene, world);
      if (device)
        return this.handlers.onContextMenu({ device }, ev);
      const link = hitLink(this.scene, world, LINK_TOLERANCE_PX / this.camera.zoom);
      if (link)
        return this.handlers.onContextMenu({ link }, ev);
      this.handlers.onContextMenu({}, ev);
    }
    onPointerUp(ev) {
      if (this.marquee) {
        const { from, to, additive, down } = this.marquee;
        this.marquee = null;
        const rect = normalizedRect(from, to);
        if ((rect.w + rect.h) * this.camera.zoom < 4)
          this.handlers.onBackgroundDown?.(down);
        else
          this.handlers.onMarquee?.(idsInRect(this.scene.devices, rect), additive);
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
        if (this.state?.pending)
          this.requestDraw();
        const group = hitGroup(this.scene, world);
        const device = group ? null : hitDevice(this.scene, world);
        const link = group || device ? null : hitLink(this.scene, world, LINK_TOLERANCE_PX / this.camera.zoom);
        const note = group || device || link ? null : hitNote(this.state?.notes ?? [], world);
        const hit = group ? "group" : device ? "device" : link ? "link" : note ? "note" : null;
        const dragging = (ev.buttons & 1) !== 0 && hit !== null;
        this.canvas.style.cursor = cursorFor(hit, this.mode(), dragging);
        const over = group ? { name: group.name, model: `${group.devices} device${group.devices === 1 ? "" : "s"}` } : device;
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
      if (action.kind === "zoom")
        this.camera.zoomAt(this.screenAt(ev), action.factor);
      else
        this.camera.pan(-action.dx, -action.dy);
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
    "zoom-fit": "F",
    play: "P",
    play2: "P",
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
    Routers: ["router", "rtrw-gateway"],
    Switches: ["switch", "switch-l3", "hub", "patchpanel"],
    Wireless: ["ap", "wlc", "hotspot-ap", "sector-radio", "client-radio", "celltower", "microwave-link", "satellite-terminal"],
    "Home and internet": ["homerouter", "cablemodem", "dsl", "cloud", "provider-link", "submarine-cable"],
    Backbone: ["district-hub", "city-exchange", "regency-hub", "village-pop", "backbone-pop", "internet-exchange", "national-gateway"],
    "Security and servers": ["asa", "load-balancer"],
    "End devices": ["pc", "laptop", "server", "printer", "phone", "analogphone", "tv", "tablet", "sniffer"],
    [CONNECTIONS]: [],
    IoT: ["ioe", "thing", "plc"]
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
  function deviceField(res, id, key) {
    const devices = Array.isArray(res["devices"]) ? res["devices"] : [];
    return devices.find((d) => d["id"] === id)?.[key];
  }
  function modelBlurbLine(workspace, device) {
    const blurb = workspace.palette?.find((p) => p.label === device.model)?.blurb;
    return blurb && device.model ? `${device.model} — ${blurb}` : "";
  }
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

  // web/ts/ui/balancer_window.ts
  var enc = encodeURIComponent;
  function deviceName(workspace, id) {
    return workspace.devices?.find((d) => d.id === id)?.name ?? id;
  }
  function memberId(workspace, typed) {
    return workspace.devices?.find((d) => d.name === typed)?.id ?? typed;
  }
  async function fillPool(doc, box, device, workspace, post, outcome) {
    const res = await post(`/api/lb/list?id=${enc(device.id)}`);
    const err = errorOf(res);
    if (err)
      throw new Error(err);
    const rows = records(res, "pool");
    box.replaceChildren();
    if (rows.length === 0) {
      box.appendChild(note(doc, "empty", "The pool is empty: add servers."));
      return;
    }
    const list = el(doc, "ul", "kw-list");
    for (const row of rows) {
      const member = asText(row["member"]);
      const served = Number(row["served"]) || 0;
      const item = el(doc, "li", "kw-row", `${deviceName(workspace, member)}: ${served} served`);
      item.appendChild(createButton(doc, {
        label: "Remove",
        className: "kw-remove",
        onClick: () => void (async () => {
          try {
            const out = await post(`/api/devices/lbpool?id=${enc(device.id)}&member=${enc(member)}&remove=1`);
            const removeErr = errorOf(out);
            if (removeErr)
              showOutcome(doc, outcome, "error", removeErr);
            else {
              showOutcome(doc, outcome, "ok", `${deviceName(workspace, member)} removed from the pool.`);
              await fillPool(doc, box, device, workspace, post, outcome).catch(() => {
                return;
              });
            }
          } catch {
            showOutcome(doc, outcome, "error", "The request failed. Check the connection and try again.");
          }
        })()
      }));
      list.appendChild(item);
    }
    box.appendChild(list);
  }
  function renderBalancerWindow(doc, body, device, workspace, post) {
    body.replaceChildren();
    const outcome = el(doc, "div", "kw-outcome");
    let listBox = null;
    const done = asyncSection(doc, body, "Server pool", "Could not load the pool.", (box) => {
      listBox = box;
      return fillPool(doc, box, device, workspace, post, outcome);
    });
    const form = el(doc, "div", "kw-form");
    const server = field(doc, form, "Server");
    const submit = () => void add();
    const add = async () => {
      const typed = server.value.trim();
      if (!typed) {
        showOutcome(doc, outcome, "error", "Type a server name.");
        return;
      }
      try {
        const res = await post(`/api/devices/lbpool?id=${enc(device.id)}&member=${enc(memberId(workspace, typed))}`);
        const err = errorOf(res);
        if (err)
          showOutcome(doc, outcome, "error", err);
        else {
          showOutcome(doc, outcome, "ok", `${typed} added to the pool.`);
          server.value = "";
          if (listBox)
            await fillPool(doc, listBox, device, workspace, post, outcome).catch(() => {
              return;
            });
        }
      } catch {
        showOutcome(doc, outcome, "error", "The request failed. Check the connection and try again.");
      }
    };
    onEnter(server, submit);
    form.appendChild(createButton(doc, { label: "Add server", className: "kw-submit", onClick: submit }));
    form.appendChild(outcome);
    body.appendChild(form);
    return done;
  }

  // web/ts/ui/firewall_window.ts
  function parsePortRows(text) {
    const parsed = JSON.parse(text);
    if (typeof parsed["error"] === "string" && parsed["error"])
      throw new Error(parsed["error"]);
    const raw = Array.isArray(parsed["ports"]) ? parsed["ports"] : [];
    return raw.map((p) => ({
      name: asText(p["name"]),
      ip: typeof p["ip"] === "string" ? p["ip"] : null,
      prefix: Number(p["prefix"]) || 0
    }));
  }
  function portText(port) {
    return port.ip ? `${port.name} — ${port.ip}/${port.prefix}` : `${port.name} — no address yet`;
  }
  function aclRules(saved, deviceId) {
    const pattern = /<acl dev="([^"]*)" num="([^"]*)" action="([^"]*)" src="([^"]*)" swc="([^"]*)" dip="([^"]*)" dwc="([^"]*)"/g;
    const rules = [];
    for (const m of saved.matchAll(pattern)) {
      if (m[1] !== deviceId)
        continue;
      const target = m[6] === "-" ? "any" : `${m[6]} ${m[7]}`;
      rules.push({
        num: m[2] ?? "",
        permit: m[3] === "permit",
        text: `${m[2]} ${m[3]} ${m[4]} ${m[5]} to ${target}`
      });
    }
    return rules;
  }
  function zonesSection(doc, root, device, getText) {
    return asyncSection(doc, root, "Zones", "Could not load the ports.", async (box) => {
      const ports = parsePortRows(await getText(`/api/devices/ports?id=${encodeURIComponent(device.id)}`));
      box.replaceChildren();
      if (ports.length === 0)
        box.appendChild(note(doc, "empty", "This firewall has no ports."));
      else
        box.appendChild(rowList(doc, ports.map(portText)));
    });
  }
  function rulesSection(doc, root, device, getText) {
    return asyncSection(doc, root, "Rules", "Could not load the rules.", async (box) => {
      const rules = aclRules(await getText("/api/export"), device.id);
      box.replaceChildren();
      if (rules.length === 0) {
        box.appendChild(note(doc, "empty", "No rules yet. Everything passes."));
        return;
      }
      const list = el(doc, "ul", "kw-list");
      for (const rule of rules) {
        list.appendChild(el(doc, "li", rule.permit ? "kw-row kw-permit" : "kw-row kw-deny", rule.text));
      }
      box.appendChild(list);
    });
  }
  function renderFirewallWindow(doc, body, device, getText) {
    body.replaceChildren();
    return Promise.all([
      zonesSection(doc, body, device, getText),
      rulesSection(doc, body, device, getText)
    ]).then(() => {
      return;
    });
  }

  // web/ts/ui/gateway_window.ts
  var enc2 = encodeURIComponent;
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
      const res = await post(`/api/pppoe/sessions?id=${enc2(device.id)}`);
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
      const res = await post(`/api/queues/list?id=${enc2(device.id)}&port=Ether1`);
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
        const res = await post(`/api/devices/queue?id=${enc2(device.id)}&user=${enc2(name)}&mbit=${limit}`);
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
        const res = await post(`/api/devices/queue?id=${enc2(device.id)}&mbit=${limit}&parent=1`);
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
        const res = await post(`/api/voucher?id=${enc2(device.id)}&code=${enc2(codeText)}&minutes=${time}`);
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
      const res = await post(`/api/aaa/list?id=${enc2(device.id)}`);
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
        const res = await post(`/api/devices/aaa?id=${enc2(device.id)}&user=${enc2(name)}&pass=${enc2(pass.value)}`);
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
  function poolLine(p) {
    return `${p.network}/${p.prefix} · gateway ${p.gateway || "none"} · DNS ${p.dns || "none"}`;
  }
  function poolsSection(doc, root, device, post) {
    const box = section(doc, root, "DHCP pools");
    const list = el(doc, "div", "kw-pool-list");
    const outcome = el(doc, "div", "kw-outcome");
    const render = (pools) => {
      list.replaceChildren();
      if (pools.length === 0) {
        list.appendChild(note(doc, "empty", "No pools yet."));
        return;
      }
      for (const p of pools) {
        const row = el(doc, "div", "kw-row");
        row.appendChild(el(doc, "span", "kw-row-text", poolLine(p)));
        row.appendChild(createButton(doc, {
          label: "Remove",
          className: "kw-retry",
          onClick: () => void remove(p)
        }));
        list.appendChild(row);
      }
    };
    const applied = (res) => {
      const pools = deviceField(res, device.id, "pools");
      render(Array.isArray(pools) ? pools : []);
    };
    const remove = async (p) => {
      try {
        const res = await post(`/api/devices/dhcp?id=${enc2(device.id)}&network=${enc2(p.network)}&prefix=${p.prefix}&remove=1`);
        const err = errorOf(res);
        if (err)
          showOutcome(doc, outcome, "error", err);
        else {
          showOutcome(doc, outcome, "ok", `Pool ${p.network}/${p.prefix} removed.`);
          applied(res);
        }
      } catch {
        showOutcome(doc, outcome, "error", "The request failed. Check the connection and try again.");
      }
    };
    render(device.pools ?? []);
    box.appendChild(list);
    const form = el(doc, "div", "kw-form");
    const network = field(doc, form, "Network");
    const prefix = field(doc, form, "Prefix", "number");
    const gateway = field(doc, form, "Gateway");
    const dns = field(doc, form, "DNS");
    const submit = () => void add();
    const add = async () => {
      const net = network.value.trim();
      const len = wholeNumber(prefix.value);
      if (!net || len === null) {
        showOutcome(doc, outcome, "error", "Type a network and a prefix length.");
        return;
      }
      try {
        const res = await post(`/api/devices/dhcp?id=${enc2(device.id)}&network=${enc2(net)}&prefix=${len}` + `&gateway=${enc2(gateway.value.trim())}&dns=${enc2(dns.value.trim())}&more=1`);
        const err = errorOf(res);
        if (err)
          showOutcome(doc, outcome, "error", err);
        else {
          showOutcome(doc, outcome, "ok", `Pool ${net}/${len} saved.`);
          applied(res);
        }
      } catch {
        showOutcome(doc, outcome, "error", "The request failed. Check the connection and try again.");
      }
    };
    onEnter(network, submit);
    onEnter(prefix, submit);
    onEnter(gateway, submit);
    onEnter(dns, submit);
    form.appendChild(createButton(doc, { label: "Add pool", className: "kw-submit", onClick: submit }));
    form.appendChild(outcome);
    box.appendChild(form);
  }
  function renderGatewayWindow(doc, body, device, post) {
    body.replaceChildren();
    const loads = [
      sessionsSection(doc, body, device, post),
      queuesSection(doc, body, device, post)
    ];
    vouchersSection(doc, body, device, post);
    poolsSection(doc, body, device, post);
    loads.push(accountsSection(doc, body, device, post));
    return Promise.all(loads).then(() => {
      return;
    });
  }

  // web/ts/ui/ports_panel.ts
  function parsePortsInfo(text) {
    const parsed = JSON.parse(text);
    const err = errorOf(parsed);
    if (err)
      throw new Error(err);
    const raw = Array.isArray(parsed["ports"]) ? parsed["ports"] : [];
    return raw.map((p) => {
      const peer = p["peer"];
      const poeRaw = p["poe"];
      return {
        name: asText(p["name"]),
        ip: typeof p["ip"] === "string" ? p["ip"] : null,
        prefix: Number(p["prefix"]) || 0,
        up: p["up"] !== false,
        peer: peer ? { id: asText(peer["id"]), name: asText(peer["name"]), port: asText(peer["port"]) } : null,
        eth: p["eth"] === true,
        speed: asText(p["speed"]) || "auto",
        duplex: asText(p["duplex"]) || "auto",
        link: asText(p["link"]),
        fault: asText(p["fault"]),
        errdisabled: asText(p["errdisabled"]) || undefined,
        errors: Number(p["errors"]) || 0,
        media: ["rj45", "sfp", "serial", "console", "other"].includes(asText(p["media"])) ? asText(p["media"]) : undefined,
        cable: typeof p["cable"] === "string" ? p["cable"] : null,
        linkUp: "linkUp" in p ? p["linkUp"] === true : undefined,
        mdi: p["mdi"] === "mdi" || p["mdi"] === "mdi-x" ? p["mdi"] : undefined,
        autoMdix: "autoMdix" in p ? p["autoMdix"] === true : undefined,
        poe: poeRaw ? {
          capable: poeRaw["capable"] === true,
          on: poeRaw["on"] === true,
          powered: poeRaw["powered"] === true,
          watts: Number(poeRaw["watts"]) || 0,
          reason: asText(poeRaw["reason"])
        } : undefined
      };
    });
  }
  function portDotClass(port) {
    if (!port.up || port.errdisabled)
      return "port-dot is-down";
    if (port.fault === "speed" || port.peer && port.linkUp === false)
      return "port-dot is-warn";
    return port.peer ? "port-dot is-up" : "port-dot is-idle";
  }
  function portPeerText(port) {
    return port.peer ? `connected to ${port.peer.name} ${port.peer.port}` : "free";
  }
  var SPEEDS = ["auto", "10", "100", "1000"];
  var DUPLEXES = ["auto", "half", "full"];
  function faultText(port) {
    if (port.errdisabled)
      return `errdisabled: ${port.errdisabled}`;
    if (port.fault === "speed")
      return "Speed mismatch: no link";
    if (port.fault === "duplex")
      return "Duplex mismatch: expect errors";
    return "";
  }
  function poeText(port) {
    const poe = port.poe;
    if (!poe || !poe.capable)
      return "";
    if (poe.powered)
      return `${poe.watts.toFixed(1)} W`;
    return `off: ${poe.reason || "not supplied"}`;
  }
  function choice(doc, label, values, current, onPick) {
    const wrap = el(doc, "label", "port-choice", label);
    const select = el(doc, "select", "kw-input");
    select.setAttribute("aria-label", label);
    for (const value of values) {
      const option = el(doc, "option", "", value === "auto" ? "auto" : value);
      option.setAttribute("value", value);
      select.appendChild(option);
    }
    select.value = current;
    select.addEventListener("change", () => onPick(select.value));
    wrap.appendChild(select);
    return wrap;
  }
  function linkControls(doc, row, port, deps, post) {
    const state = { speed: port.speed ?? "auto", duplex: port.duplex ?? "auto" };
    const send = () => {
      const enc = encodeURIComponent;
      post(`/api/devices/linkspeed?id=${enc(deps.deviceId)}&port=${enc(port.name)}&speed=${state.speed}&duplex=${state.duplex}`).then(() => deps.refresh?.()).catch(() => {
        return;
      });
    };
    row.appendChild(choice(doc, "Speed", SPEEDS, state.speed, (v) => {
      state.speed = v;
      send();
    }));
    row.appendChild(choice(doc, "Duplex", DUPLEXES, state.duplex, (v) => {
      state.duplex = v;
      send();
    }));
    if (port.link)
      row.appendChild(el(doc, "span", "port-link", port.link));
    const fault = faultText(port);
    if (fault) {
      const flag = el(doc, "span", "port-fault", fault);
      flag.setAttribute("role", "status");
      row.appendChild(flag);
    }
  }
  function portRow(doc, port, deps) {
    const row = el(doc, "li", "kw-row port-row");
    const dot = el(doc, "span", portDotClass(port));
    dot.setAttribute("aria-hidden", "true");
    row.appendChild(dot);
    row.appendChild(el(doc, "span", "port-name", port.name));
    if (port.ip)
      row.appendChild(el(doc, "span", "port-addr", `${port.ip}/${port.prefix}`));
    const tag = deps.extra?.(port.name);
    if (tag)
      row.appendChild(el(doc, "span", "port-extra", tag));
    row.appendChild(el(doc, "span", port.peer ? "port-peer" : "port-peer is-free", portPeerText(port)));
    const post = deps.post;
    if (post && port.eth)
      linkControls(doc, row, port, deps, post);
    const poe = poeText(port);
    if (poe)
      row.appendChild(el(doc, "span", "port-poe", poe));
    if (port.errors)
      row.appendChild(el(doc, "span", "port-errors", `${port.errors} input errors`));
    if (post) {
      row.appendChild(createButton(doc, {
        label: port.up ? "Shut down" : "Bring up",
        title: port.up ? `Shut down ${port.name}` : `Bring up ${port.name}`,
        className: "port-toggle",
        onClick: () => {
          const enc = encodeURIComponent;
          post(`/api/devices/port?id=${enc(deps.deviceId)}&port=${enc(port.name)}&up=${port.up ? "0" : "1"}`).then((res) => {
            if (typeof res["error"] !== "string")
              deps.refresh?.();
          }).catch(() => {
            return;
          });
        }
      }));
    }
    return row;
  }
  function renderPortsPanel(doc, box, ports, deps) {
    const list = el(doc, "ul", "kw-list port-list");
    for (const port of ports)
      list.appendChild(portRow(doc, port, deps));
    box.appendChild(list);
  }

  // web/ts/ui/l3switch_window.ts
  var enc3 = encodeURIComponent;
  function vlanTags(saved, deviceId) {
    const pattern = /<port id="([^"]*)" name="([^"]*)" up="[^"]*" ip="[^"]*" prefix="[^"]*" vlan="([^"]*)" trunk="([^"]*)"/g;
    const tags = new Map;
    for (const m of saved.matchAll(pattern)) {
      if (m[1] === deviceId)
        tags.set(m[2] ?? "", { vlan: m[3] ?? "1", trunk: m[4] === "1" });
    }
    return tags;
  }
  function portTagText(tag) {
    if (tag?.trunk)
      return "trunk";
    return `VLAN ${tag?.vlan ?? "1"}`;
  }
  function portsSection(doc, root, device, getText, post) {
    return asyncSection(doc, root, "Ports", "Could not load the ports.", async function fill(box) {
      const [portsText, saved] = await Promise.all([
        getText(`/api/devices/ports?id=${enc3(device.id)}`),
        getText("/api/export")
      ]);
      const ports = parsePortsInfo(portsText);
      const tags = vlanTags(saved, device.id);
      box.replaceChildren();
      if (ports.length === 0)
        box.appendChild(note(doc, "empty", "This switch has no ports."));
      else {
        renderPortsPanel(doc, box, ports, {
          deviceId: device.id,
          post,
          refresh: () => void fill(box),
          extra: (name) => portTagText(tags.get(name))
        });
      }
    });
  }
  function routesSection(doc, root, device, post) {
    return asyncSection(doc, root, "Routes", "Could not load the routes.", async (box) => {
      const en = await post(`/api/cli?id=${enc3(device.id)}&line=en`);
      const enErr = errorOf(en);
      if (enErr)
        throw new Error(enErr);
      const res = await post(`/api/cli?id=${enc3(device.id)}&line=${enc3("show ip route")}`);
      const err = errorOf(res);
      if (err)
        throw new Error(err);
      const output = asText(res["output"]).trim();
      box.replaceChildren();
      if (!output)
        box.appendChild(note(doc, "empty", "No routes yet."));
      else
        box.appendChild(el(doc, "pre", "kw-mono", output));
    });
  }
  function sharedGwLine(g) {
    return `${g.vip} · priority ${g.priority}${g.owner ? " · answering now" : ""}`;
  }
  function sharedGatewaySection(doc, root, device, post) {
    const box = section(doc, root, "Shared gateway");
    const list = el(doc, "div", "kw-gw-list");
    const outcome = el(doc, "div", "kw-outcome");
    const render = (rows) => {
      list.replaceChildren();
      if (rows.length === 0) {
        list.appendChild(note(doc, "empty", "Not sharing any address."));
        return;
      }
      for (const g of rows) {
        const row = el(doc, "div", "kw-row");
        row.appendChild(el(doc, "span", "kw-row-text", sharedGwLine(g)));
        row.appendChild(createButton(doc, {
          label: "Leave",
          className: "kw-retry",
          onClick: () => void leave(g)
        }));
        list.appendChild(row);
      }
    };
    const applied = (res) => {
      const rows = deviceField(res, device.id, "sharedGws");
      render(Array.isArray(rows) ? rows : []);
    };
    const leave = async (g) => {
      try {
        const res = await post(`/api/devices/sharedgw?id=${enc3(device.id)}&vip=${enc3(g.vip)}&remove=1`);
        const err = errorOf(res);
        if (err)
          showOutcome(doc, outcome, "error", err);
        else {
          showOutcome(doc, outcome, "ok", `Left the shared address ${g.vip}.`);
          applied(res);
        }
      } catch {
        showOutcome(doc, outcome, "error", "The request failed. Check the connection and try again.");
      }
    };
    render(device.sharedGws ?? []);
    box.appendChild(list);
    const form = el(doc, "div", "kw-form");
    const vip = field(doc, form, "Shared address");
    const priority = field(doc, form, "Priority", "number");
    const submit = () => void share();
    const share = async () => {
      const address = vip.value.trim();
      if (!address || !priority.value.trim()) {
        showOutcome(doc, outcome, "error", "Type the shared address and a priority.");
        return;
      }
      try {
        const res = await post(`/api/devices/sharedgw?id=${enc3(device.id)}&vip=${enc3(address)}&priority=${enc3(priority.value.trim())}`);
        const err = errorOf(res);
        if (err)
          showOutcome(doc, outcome, "error", err);
        else {
          showOutcome(doc, outcome, "ok", `Sharing ${address}.`);
          applied(res);
        }
      } catch {
        showOutcome(doc, outcome, "error", "The request failed. Check the connection and try again.");
      }
    };
    onEnter(vip, submit);
    onEnter(priority, submit);
    form.appendChild(createButton(doc, { label: "Share", className: "kw-submit", onClick: submit }));
    form.appendChild(outcome);
    box.appendChild(form);
  }
  function renderL3SwitchWindow(doc, body, device, getText, post) {
    body.replaceChildren();
    const loads = [
      portsSection(doc, body, device, getText, post),
      routesSection(doc, body, device, post)
    ];
    sharedGatewaySection(doc, body, device, post);
    return Promise.all(loads).then(() => {
      return;
    });
  }

  // web/ts/ui/hotspot_window.ts
  function renderHotspotWindow(doc, body, device, post) {
    body.replaceChildren();
    const manage = globalThis.renderWirelessManager;
    let done = Promise.resolve();
    if (typeof manage === "function") {
      const box = el(doc, "div", "dw-wireless");
      body.appendChild(box);
      manage(box, device);
    } else {
      done = asyncSection(doc, body, "Wireless networks", "Could not load the wireless networks.", async (box) => {
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
    }
    body.appendChild(note(doc, "plain", "Visitors sign in with a voucher on the gateway."));
    return done;
  }

  // web/ts/ui/iot_window.ts
  var enc4 = encodeURIComponent;
  var SHOWN_REGISTERS = 16;
  function towerRows(saved) {
    const towers = [];
    for (const m of saved.matchAll(/<device id="([^"]+)" kind="celltower"[^>]*name="([^"]*)"/g)) {
      towers.push({ id: m[1] ?? "", name: m[2] ?? "" });
    }
    return towers;
  }
  function wholeIn(value, most) {
    const n = Number(value.trim());
    return Number.isInteger(n) && n >= 0 && n <= most ? n : null;
  }
  function registersSection(doc, root, device, post) {
    let listBox = null;
    const fill = async (box) => {
      listBox = box;
      const reads = await Promise.all(Array.from({ length: SHOWN_REGISTERS }, (_, addr) => post(`/api/iot/read?id=${enc4(device.id)}&addr=${addr}`)));
      box.replaceChildren();
      const err = errorOf(reads[0] ?? {});
      if (err) {
        box.appendChild(note(doc, "error", err));
        return;
      }
      box.appendChild(rowList(doc, reads.map((r, addr) => `Register ${addr} · ${asText(r["value"]) || "0"}`)));
    };
    const done = asyncSection(doc, root, "Registers", "Could not read the registers.", fill);
    const form = el(doc, "div", "kw-form");
    const register = field(doc, form, "Register");
    const value = field(doc, form, "Value");
    const outcome = el(doc, "div", "kw-outcome");
    const submit = () => void write();
    const write = async () => {
      const addr = wholeIn(register.value, 255);
      const wanted = wholeIn(value.value, 65535);
      if (addr === null || wanted === null) {
        showOutcome(doc, outcome, "error", "Type a register from 0 to 255 and a value from 0 to 65535.");
        return;
      }
      try {
        const res = await post(`/api/iot/write?id=${enc4(device.id)}&addr=${addr}&value=${wanted}`);
        const err = errorOf(res);
        if (err)
          showOutcome(doc, outcome, "error", err);
        else {
          showOutcome(doc, outcome, "ok", `Register ${addr} is now ${wanted} (was ${asText(res["old"]) || "0"}).`);
          if (listBox)
            await fill(listBox).catch(() => {
              return;
            });
        }
      } catch {
        showOutcome(doc, outcome, "error", "The request failed. Check the connection and try again.");
      }
    };
    onEnter(register, submit);
    onEnter(value, submit);
    form.appendChild(createButton(doc, { label: "Write", className: "kw-submit", onClick: submit }));
    form.appendChild(outcome);
    root.appendChild(form);
    return done;
  }
  function fillTowers(doc, box, device, post, getText, outcome) {
    return (async () => {
      const [saved, status] = await Promise.all([getText("/api/export"), post(`/api/cell/status?id=${enc4(device.id)}`)]);
      const towers = towerRows(saved);
      const joined = status["associated"] === true ? asText(status["tower"]) : "";
      box.replaceChildren();
      const joinedName = towers.find((t) => t.id === joined)?.name ?? joined;
      box.appendChild(note(doc, "plain", joined ? `Joined to ${joinedName}.` : "Not joined to a tower."));
      if (towers.length === 0) {
        box.appendChild(note(doc, "empty", "There is no cell tower in this workspace."));
        return;
      }
      for (const tower of towers) {
        const row = el(doc, "div", "kw-row");
        row.appendChild(el(doc, "span", "kw-tower-name", tower.name));
        row.appendChild(createButton(doc, {
          label: "Join",
          className: "kw-submit",
          onClick: () => void (async () => {
            try {
              const res = await post(`/api/cell/join?id=${enc4(device.id)}&tower=${enc4(tower.id)}`);
              const err = errorOf(res);
              if (err)
                showOutcome(doc, outcome, "error", err);
              else {
                showOutcome(doc, outcome, "ok", `Joined to ${tower.name}.`);
                await fillTowers(doc, box, device, post, getText, outcome).catch(() => {
                  return;
                });
              }
            } catch {
              showOutcome(doc, outcome, "error", "The request failed. Check the connection and try again.");
            }
          })()
        }));
        box.appendChild(row);
      }
    })();
  }
  function towerSection(doc, root, device, workspace, post, getText) {
    const outcome = el(doc, "div", "kw-outcome");
    const done = asyncSection(doc, root, "Cell tower", "Could not read the cell towers.", (box) => fillTowers(doc, box, device, post, getText, outcome));
    const form = el(doc, "div", "kw-form");
    const target = field(doc, form, "Send to");
    const sendOutcome = el(doc, "div", "kw-outcome");
    const submit = () => void send();
    const send = async () => {
      const name = target.value.trim();
      const peer = workspace.devices?.find((d) => d.name === name || d.id === name);
      if (!peer) {
        showOutcome(doc, sendOutcome, "error", name ? `No device is named ${name}.` : "Type the name of the device to reach.");
        return;
      }
      try {
        const res = await post(`/api/iot/send?src=${enc4(device.id)}&dst=${enc4(peer.id)}&proto=cellular&seq=0`);
        const err = errorOf(res);
        if (err)
          showOutcome(doc, sendOutcome, "error", err);
        else
          showOutcome(doc, sendOutcome, "ok", `${asText(res["status"])} to ${peer.name}.`);
      } catch {
        showOutcome(doc, sendOutcome, "error", "The request failed. Check the connection and try again.");
      }
    };
    onEnter(target, submit);
    form.appendChild(createButton(doc, { label: "Send over the tower", className: "kw-submit", onClick: submit }));
    form.appendChild(sendOutcome);
    form.appendChild(outcome);
    root.appendChild(form);
    return done;
  }
  function renderIotWindow(doc, body, device, workspace, post, getText) {
    body.replaceChildren();
    return Promise.all([
      registersSection(doc, body, device, post),
      towerSection(doc, body, device, workspace, post, getText)
    ]).then(() => {
      return;
    });
  }
  function joinedClients(saved, towerId, workspace) {
    const clients = [];
    for (const m of saved.matchAll(/<cell client="([^"]+)" tower="([^"]+)"/g)) {
      if (m[2] !== towerId)
        continue;
      const id = m[1] ?? "";
      clients.push(workspace.devices?.find((d) => d.id === id)?.name ?? id);
    }
    return clients;
  }
  function renderCellTowerWindow(doc, body, device, workspace, getText) {
    body.replaceChildren();
    const about = section(doc, body, "Coverage");
    about.appendChild(note(doc, "plain", "Devices join this tower over the air; no cable terminates here."));
    return asyncSection(doc, body, "Joined clients", "Could not read the joined clients.", async (box) => {
      const saved = await getText("/api/export");
      const clients = joinedClients(saved, device.id, workspace);
      box.replaceChildren();
      if (clients.length === 0)
        box.appendChild(note(doc, "empty", "No device has joined this tower yet."));
      else
        box.appendChild(rowList(doc, clients));
    });
  }

  // web/ts/ui/phone_window.ts
  var enc5 = encodeURIComponent;
  function callManagers(workspace) {
    return (workspace.devices ?? []).filter((d) => d.kind === "server" && typeof d.ip === "string" && d.ip !== "").map((d) => ({ label: `${d.name} (${d.ip})`, address: d.ip }));
  }
  function renderPhoneWindow(doc, body, device, workspace, post) {
    body.replaceChildren();
    let extension = 0;
    let statusBox = null;
    const fillStatus = async (box) => {
      const res = await post(`/api/phone/status?id=${enc5(device.id)}`);
      const err = errorOf(res);
      if (err)
        throw new Error(err);
      box.replaceChildren();
      extension = typeof res["extension"] === "number" ? res["extension"] : 0;
      if (res["registered"] !== true) {
        box.appendChild(note(doc, "empty", "Not registered at any call manager yet."));
        return;
      }
      box.appendChild(note(doc, "ok", `Registered at ${asText(res["cm"])} as extension ${extension}.`));
      const call = res["call"];
      if (call && typeof call === "object") {
        const line = call.from === extension ? `In a call to extension ${call.to} (${asText(call.state)}).` : `In a call from extension ${call.from} (${asText(call.state)}).`;
        box.appendChild(note(doc, "plain", line));
      }
    };
    const done = asyncSection(doc, body, "Line status", "Could not read the phone status.", (box) => {
      statusBox = box;
      return fillStatus(box);
    });
    const refresh = () => {
      if (statusBox)
        fillStatus(statusBox).catch(() => {
          return;
        });
    };
    registerForm(doc, body, device, workspace, post, refresh);
    dialPad(doc, body, post, () => extension, refresh);
    if (device.kind === "analogphone") {
      body.appendChild(note(doc, "plain", "An analog phone talks through its phone cable; the router carries its calls."));
    }
    return done;
  }
  function registerForm(doc, root, device, workspace, post, refresh) {
    const box = section(doc, root, "Register");
    const managers = callManagers(workspace);
    if (managers.length === 0) {
      box.appendChild(note(doc, "empty", "No addressed server to register at. Give a server an address first."));
      return;
    }
    const form = el(doc, "div", "kw-form");
    const label = el(doc, "label", "kw-field", "Call manager");
    const picker = el(doc, "select", "kw-input");
    for (const manager of managers) {
      const option = el(doc, "option", "", manager.label);
      option.setAttribute("value", manager.address);
      picker.appendChild(option);
    }
    picker.value = managers[0].address;
    label.appendChild(picker);
    form.appendChild(label);
    const ext = field(doc, form, "Extension", "number");
    const outcome = el(doc, "div", "kw-outcome");
    const submit = () => void save();
    const save = async () => {
      const number = wholeNumber2(ext.value);
      if (number === null) {
        showOutcome(doc, outcome, "error", "Type a whole extension number.");
        return;
      }
      try {
        const res = await post(`/api/phone/register?id=${enc5(device.id)}&cm=${enc5(picker.value)}&ext=${number}`);
        const err = errorOf(res);
        if (err)
          showOutcome(doc, outcome, "error", err);
        else {
          showOutcome(doc, outcome, "ok", `Registered as extension ${number}.`);
          refresh();
        }
      } catch {
        showOutcome(doc, outcome, "error", "The request failed. Check the connection and try again.");
      }
    };
    onEnter(ext, submit);
    form.appendChild(createButton(doc, { label: "Register", className: "kw-submit", onClick: submit }));
    form.appendChild(outcome);
    box.appendChild(form);
  }
  function dialPad(doc, root, post, ownExtension, refresh) {
    const box = section(doc, root, "Dial");
    const form = el(doc, "div", "kw-form");
    const target = field(doc, form, "Extension to call", "number");
    const outcome = el(doc, "div", "kw-outcome");
    const submit = () => void dial();
    const dial = async () => {
      const to = wholeNumber2(target.value);
      if (to === null) {
        showOutcome(doc, outcome, "error", "Type the extension to call.");
        return;
      }
      const from = ownExtension();
      if (from === 0) {
        showOutcome(doc, outcome, "error", "Register this phone first.");
        return;
      }
      try {
        const res = await post(`/api/phone/call?from=${from}&to=${to}`);
        const err = errorOf(res);
        if (err)
          showOutcome(doc, outcome, "error", err);
        else {
          showOutcome(doc, outcome, "ok", `Call to extension ${to} established.`);
          refresh();
        }
      } catch {
        showOutcome(doc, outcome, "error", "The request failed. Check the connection and try again.");
      }
    };
    onEnter(target, submit);
    form.appendChild(createButton(doc, { label: "Call", className: "kw-submit", onClick: submit }));
    form.appendChild(outcome);
    box.appendChild(form);
  }
  function wholeNumber2(raw) {
    const text = raw.trim();
    if (!/^\d+$/.test(text))
      return null;
    const value = Number(text);
    return value > 0 && value <= 65535 ? value : null;
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
  function portsSection2(doc, body, device, getText, post) {
    return asyncSection(doc, body, "Ports", "Could not load the ports.", async function fill(box) {
      const ports = parsePortsInfo(await getText(`/api/devices/ports?id=${encodeURIComponent(device.id)}`));
      box.replaceChildren();
      if (ports.length === 0)
        box.appendChild(note(doc, "empty", "This radio has no ports."));
      else
        renderPortsPanel(doc, box, ports, { deviceId: device.id, post, refresh: () => void fill(box) });
    });
  }
  function renderRadioWindow(doc, body, device, getText, post) {
    body.replaceChildren();
    const sections = [portsSection2(doc, body, device, getText, post)];
    if (device.kind === "client-radio") {
      sections.push(asyncSection(doc, body, "Radio delay", "Could not read the radio delay.", async (box) => {
        const saved = await getText("/api/export");
        const ms = portDelayMs(saved, device.id);
        box.replaceChildren();
        box.appendChild(note(doc, "plain", `This radio link adds ${ms} ms.`));
      }));
    }
    return Promise.all(sections).then(() => {
      return;
    });
  }

  // web/ts/ui/kind_windows.ts
  var WINDOW_IDS = {
    "rtrw-gateway": "gateway-window",
    "client-radio": "radio-window",
    "sector-radio": "radio-window",
    "provider-link": "provider-window",
    "hotspot-ap": "hotspot-window",
    asa: "firewall-window",
    "load-balancer": "balancer-window",
    "switch-l3": "l3switch-window",
    plc: "iot-window",
    thing: "iot-window",
    ioe: "iot-window",
    celltower: "celltower-window",
    phone: "phone-window",
    analogphone: "phone-window"
  };
  function windowIdForKind(kind) {
    return WINDOW_IDS[kind] ?? null;
  }
  function renderKindWindow(doc, body, device, workspace, deps) {
    body.replaceChildren();
    const blurb = modelBlurbLine(workspace, device);
    if (blurb)
      body.appendChild(el(doc, "p", "kw-blurb", blurb));
    const pane = body.appendChild(el(doc, "div", "kw-pane"));
    switch (device.kind) {
      case "rtrw-gateway":
        return renderGatewayWindow(doc, pane, device, deps.post);
      case "client-radio":
      case "sector-radio":
        return renderRadioWindow(doc, pane, device, deps.getText, deps.post);
      case "provider-link":
        renderProviderWindow(doc, pane, device, workspace);
        return Promise.resolve();
      case "hotspot-ap":
        return renderHotspotWindow(doc, pane, device, deps.post);
      case "asa":
        return renderFirewallWindow(doc, pane, device, deps.getText);
      case "load-balancer":
        return renderBalancerWindow(doc, pane, device, workspace, deps.post);
      case "switch-l3":
        return renderL3SwitchWindow(doc, pane, device, deps.getText, deps.post);
      case "plc":
      case "thing":
      case "ioe":
        return renderIotWindow(doc, pane, device, workspace, deps.post, deps.getText);
      case "celltower":
        return renderCellTowerWindow(doc, pane, device, workspace, deps.getText);
      case "phone":
      case "analogphone":
        return renderPhoneWindow(doc, pane, device, workspace, deps.post);
      default:
        return Promise.resolve();
    }
  }

  // web/ts/ui/group_card.ts
  var STATUS_TEXT = {
    up: "Up: every boundary cable is live",
    degraded: "Degraded: a device inside has a port down",
    down: "Down: a boundary cable is down",
    isolated: "Isolated: no cable crosses the boundary"
  };
  function renderGroupCard(doc, body, group) {
    body.replaceChildren();
    const box = section(doc, body, group.name);
    const list = el(doc, "ul", "kw-list");
    list.appendChild(el(doc, "li", "kw-row", `${group.devices} device${group.devices === 1 ? "" : "s"} inside`));
    list.appendChild(el(doc, "li", `kw-row kw-status-${group.status}`, STATUS_TEXT[group.status] ?? group.status));
    box.appendChild(list);
    body.appendChild(el(doc, "p", "kw-note", "Double-click the node on the canvas to expand it."));
  }
  var DOUBLE_MS = 400;
  function makeGroupPress(deps) {
    let last = null;
    return (group) => {
      const t = deps.now();
      if (last && last.id === group.id && t - last.t < DOUBLE_MS) {
        last = null;
        (async () => {
          try {
            const res = await deps.post(`/api/groups/expand?id=${encodeURIComponent(group.id)}`);
            if (!errorOf(res))
              deps.applied(res);
          } catch {}
        })();
        return;
      }
      last = { id: group.id, t };
      deps.card(group);
    };
  }

  // web/ts/ui/menu_place.ts
  var MARGIN = 4;
  var clamp = (value, low, high) => Math.min(Math.max(value, low), Math.max(low, high));
  function placeMenu(at, menu, view) {
    return {
      x: clamp(at.x, MARGIN, view.w - menu.w - MARGIN),
      y: clamp(at.y, MARGIN, view.h - menu.h - MARGIN)
    };
  }
  function placeSubmenu(parent, menu, view) {
    const right = parent.x + parent.w - 2;
    const x = right + menu.w + MARGIN <= view.w ? right : parent.x - menu.w + 2;
    return {
      x: clamp(x, MARGIN, view.w - menu.w - MARGIN),
      y: clamp(parent.y - MARGIN, MARGIN, view.h - menu.h - MARGIN)
    };
  }

  // web/ts/ui/flows_window.ts
  var enc6 = encodeURIComponent;
  function parseFlows(xml) {
    const flows = [];
    for (const m of xml.matchAll(/<flow\s+dev="([^"]*)"\s+to="([^"]*)"\s+mbit="([^"]*)"/g)) {
      flows.push({ from: m[1], to: m[2], mbit: Number(m[3]) || 0 });
    }
    return { flows, spread: /<flowspread\s+on="(1|true)"/.test(xml) };
  }
  function loadClass(percent) {
    return percent >= 100 ? "kw-load-danger" : percent >= 70 ? "kw-load-warn" : "kw-load-ok";
  }
  function deviceName2(workspace, id) {
    return workspace.devices?.find((d) => d.id === id)?.name ?? id;
  }
  function deviceId(workspace, typed) {
    return workspace.devices?.find((d) => d.name === typed)?.id ?? typed;
  }
  function renderFlowsWindow(doc, body, workspace, deps) {
    body.replaceChildren();
    const outcome = el(doc, "div", "kw-outcome");
    let loadsBox = null;
    let flowsBox = null;
    const fillLoads = async (box) => {
      const res = await deps.post("/api/flows/list");
      const err = errorOf(res);
      if (err)
        throw new Error(err);
      const rows = records(res, "links");
      box.replaceChildren();
      if (!rows.length) {
        box.appendChild(note(doc, "empty", "No cables yet. Connect two devices first."));
        return;
      }
      const table = el(doc, "table", "kw-table");
      const head = el(doc, "tr", "");
      for (const title of ["Cable", "Mbit/s", "Capacity", "Load"])
        head.appendChild(el(doc, "th", "", title));
      table.appendChild(head);
      for (const row of rows) {
        const tr = el(doc, "tr", "");
        tr.appendChild(el(doc, "td", "", `${asText(row["a"])} ${asText(row["aPort"])} ↔ ${asText(row["b"])} ${asText(row["bPort"])}`));
        tr.appendChild(el(doc, "td", "", `${Number(row["mbit"]) || 0}`));
        tr.appendChild(el(doc, "td", "", `${Number(row["capacity"]) || 0}`));
        const percent = Number(row["percent"]) || 0;
        tr.appendChild(el(doc, "td", loadClass(percent), `${percent}%`));
        table.appendChild(tr);
      }
      box.appendChild(table);
    };
    const refresh = async () => {
      if (loadsBox)
        await fillLoads(loadsBox).catch(() => {
          return;
        });
      if (flowsBox)
        await fillFlows(flowsBox).catch(() => {
          return;
        });
    };
    const setFlow = async (from, to, mbit) => {
      try {
        const res = await deps.post(`/api/flows/set?from=${enc6(from)}&to=${enc6(to)}&mbit=${mbit}`);
        const err = errorOf(res);
        if (err) {
          showOutcome(doc, outcome, "error", err);
          return;
        }
        showOutcome(doc, outcome, "ok", mbit === 0 ? `Flow removed: ${deviceName2(workspace, from)} → ${deviceName2(workspace, to)}.` : `Flow set: ${deviceName2(workspace, from)} → ${deviceName2(workspace, to)} at ${mbit} Mbit/s.`);
        await refresh();
      } catch {
        showOutcome(doc, outcome, "error", "The request failed. Check the connection and try again.");
      }
    };
    const setSpread = async (on) => {
      try {
        const res = await deps.post(`/api/flows/set?spread=${on ? "1" : "0"}`);
        const err = errorOf(res);
        if (err)
          showOutcome(doc, outcome, "error", err);
        else {
          showOutcome(doc, outcome, "ok", on ? "Flows now spread over spare paths." : "Flows now take one path each.");
          await refresh();
        }
      } catch {
        showOutcome(doc, outcome, "error", "The request failed. Check the connection and try again.");
      }
    };
    const fillFlows = async (box) => {
      const { flows, spread } = parseFlows(await deps.getText("/api/export"));
      box.replaceChildren();
      if (!flows.length) {
        box.appendChild(note(doc, "empty", "No flows yet. Add one to light up the cables."));
      } else {
        const list = el(doc, "ul", "kw-list");
        for (const flow of flows) {
          const item = el(doc, "li", "kw-row", `${deviceName2(workspace, flow.from)} → ${deviceName2(workspace, flow.to)} · ${flow.mbit} Mbit/s`);
          item.appendChild(createButton(doc, {
            label: "Remove",
            className: "kw-remove",
            onClick: () => void setFlow(flow.from, flow.to, 0)
          }));
          list.appendChild(item);
        }
        box.appendChild(list);
      }
      box.appendChild(createButton(doc, {
        label: "Spread over spare paths",
        className: "kw-spread",
        toggled: spread,
        onClick: () => void setSpread(!spread)
      }));
    };
    const done = Promise.all([
      asyncSection(doc, body, "Cable loads", "Could not load the cable loads.", (box) => {
        loadsBox = box;
        return fillLoads(box);
      }),
      asyncSection(doc, body, "Flows", "Could not load the flows.", (box) => {
        flowsBox = box;
        return fillFlows(box);
      })
    ]).then(() => {
      return;
    });
    const form = el(doc, "div", "kw-form");
    const from = field(doc, form, "From device");
    const to = field(doc, form, "To device");
    const mbit = field(doc, form, "Mbit/s", "number");
    const add = async () => {
      const fromTyped = from.value.trim();
      const toTyped = to.value.trim();
      const rate = Number(mbit.value.trim());
      if (!fromTyped || !toTyped) {
        showOutcome(doc, outcome, "error", "Name both ends of the flow.");
        return;
      }
      if (!Number.isInteger(rate) || rate < 0) {
        showOutcome(doc, outcome, "error", "Mbit/s must be a whole number; 0 removes the flow.");
        return;
      }
      await setFlow(deviceId(workspace, fromTyped), deviceId(workspace, toTyped), rate);
    };
    const submit = () => void add();
    onEnter(mbit, submit);
    form.appendChild(createButton(doc, { label: "Add flow", className: "kw-submit", onClick: submit }));
    form.appendChild(outcome);
    body.appendChild(form);
    return done;
  }

  // web/ts/ui/port_faceplate.ts
  function portLight(port) {
    if (!port.up || port.errdisabled)
      return "shut";
    if (port.fault === "speed" || port.peer && port.linkUp === false)
      return "no-link";
    return port.peer ? "up" : "free";
  }
  function portStateText(port) {
    const light = portLight(port);
    if (light === "shut")
      return port.errdisabled ? `shut down · ${port.errdisabled}` : "shut down";
    if (light === "no-link")
      return "no link";
    if (light === "free")
      return "free";
    const parts = ["connected"];
    if (port.cable === "eFiber")
      parts.push("optical fibre");
    else if (port.cable === "eSerial")
      parts.push("serial");
    if (port.eth && port.link)
      parts.push(port.link);
    if (port.fault === "duplex")
      parts.push("duplex mismatch");
    parts.push(`to ${port.peer.name} ${port.peer.port}`);
    return parts.join(" · ");
  }
  function portCardText(port) {
    const light = portLight(port);
    if (light === "shut")
      return "shut down";
    if (light === "no-link")
      return "no link";
    if (light === "free")
      return "free";
    if (port.fault === "duplex")
      return "connected · duplex mismatch";
    const parts = ["connected"];
    if (port.cable === "eFiber")
      parts.push("fibre");
    else if (port.cable === "eSerial")
      parts.push("serial");
    if (port.eth && port.link)
      parts.push(port.link.split(",")[0].trim());
    return parts.join(" · ");
  }
  function portMedia(port) {
    return port.media ?? "rj45";
  }
  var CABLES = {
    eCopper: "copper",
    eCross: "copper",
    eFiber: "fiber",
    eSerial: "serial",
    eConsole: "console",
    ePhone: "phone",
    eCoax: "coax",
    eIoT: "iot"
  };
  function svgNode(doc, tag) {
    if (doc.createElementNS) {
      return doc.createElementNS("http://www.w3.org/2000/svg", tag);
    }
    return doc.createElement(tag);
  }
  function shape(doc, tag, attrs) {
    const node = svgNode(doc, tag);
    for (const [name, value] of Object.entries(attrs))
      node.setAttribute(name, String(value));
    return node;
  }
  function led(doc, light) {
    const circle = shape(doc, "circle", { cx: 45, cy: 9, r: 3.2, class: `port-led led-${light}` });
    return circle;
  }
  function rj45(doc, light, kind) {
    const body = shape(doc, "rect", { x: 5, y: 6, width: 34, height: 25, rx: 3, class: `port-body ${kind}` });
    const cavity = shape(doc, "rect", { x: 10, y: 11, width: 24, height: 12, rx: 1, class: "port-cavity" });
    const pins = shape(doc, "path", {
      d: "M12 12v10M15 12v10M18 12v10M21 12v10M24 12v10M27 12v10M30 12v10",
      class: "port-pin"
    });
    return group(doc, [body, cavity, pins, led(doc, light)]);
  }
  function sfp(doc, light, kind) {
    const cage = shape(doc, "rect", { x: 4, y: 7, width: 34, height: 24, rx: 2, class: `port-body ${kind}` });
    const slot = shape(doc, "rect", { x: 9, y: 12, width: 24, height: 8, rx: 1, class: "port-cavity" });
    const latch = shape(doc, "path", { d: "M9 20h24M16 20v7M32 20v7", class: "port-pin" });
    return group(doc, [cage, slot, latch, led(doc, light)]);
  }
  function serial(doc, light, kind) {
    const shell = shape(doc, "path", { d: "M6 9h40l-4 18H10z", class: `port-body ${kind}` });
    const pins = [];
    for (let row = 0;row < 2; row += 1) {
      for (let col = 0;col < 5; col += 1) {
        pins.push(shape(doc, "circle", { cx: 15 + col * 6, cy: 15 + row * 6, r: 1.4, class: "port-pin-fill" }));
      }
    }
    return group(doc, [shell, ...pins, led(doc, light)]);
  }
  function group(doc, children) {
    const g = shape(doc, "g", { class: "port-icon" });
    for (const child of children)
      g.appendChild(child);
    return g;
  }
  function icon(doc, port, light, kind) {
    const media = portMedia(port);
    if (media === "sfp")
      return sfp(doc, light, kind);
    if (media === "serial")
      return serial(doc, light, kind);
    if (media === "console")
      return rj45(doc, light, `${kind} console`);
    if (media === "other")
      return serial(doc, light, kind);
    return rj45(doc, light, kind);
  }
  function renderPortFaceplate(doc, box, ports) {
    const wrap = el(doc, "div", "port-faceplate");
    const head = el(doc, "div", "port-faceplate-head");
    head.appendChild(el(doc, "strong", "", "Ports"));
    const legend = el(doc, "div", "port-legend");
    for (const [light, label] of [["up", "Up"], ["free", "Free"], ["no-link", "No link"], ["shut", "Shut down"]]) {
      const item = el(doc, "span", "port-legend-item");
      const dot = el(doc, "span", `port-led led-${light}`);
      dot.setAttribute("aria-hidden", "true");
      item.appendChild(dot);
      item.appendChild(el(doc, "span", "", label));
      legend.appendChild(item);
    }
    head.appendChild(legend);
    wrap.appendChild(head);
    const copper = ports.filter((port) => port.media === "rj45");
    if (copper.length) {
      const note = copper.some((port) => port.autoMdix) ? "Auto-MDI-X: either copper cable works." : "Fixed MDI-X: use a crossover cable between two fixed ports.";
      wrap.appendChild(el(doc, "p", "port-faceplate-note", note));
    }
    const grid = el(doc, "div", "port-jack-grid");
    for (const port of ports) {
      const light = portLight(port);
      const cable = CABLES[port.cable ?? ""] ?? "none";
      const card = el(doc, "div", `port-jack cable-${cable}`);
      card.setAttribute("data-media", portMedia(port));
      card.setAttribute("data-state", light);
      const pair = port.media === "rj45" ? port.autoMdix ? "auto-MDI-X" : port.mdi === "mdi" ? "fixed MDI" : "fixed MDI-X" : "";
      card.title = `${port.name}: ${portStateText(port)}${pair ? ` · ${pair}` : ""}`;
      const svg = svgNode(doc, "svg");
      svg.setAttribute("viewBox", "0 0 54 38");
      svg.setAttribute("aria-hidden", "true");
      svg.setAttribute("focusable", "false");
      svg.appendChild(icon(doc, port, light, "port-shape"));
      card.appendChild(svg);
      card.appendChild(el(doc, "span", "port-jack-name", port.name));
      card.appendChild(el(doc, "span", `port-jack-state state-${light}`, portCardText(port)));
      grid.appendChild(card);
    }
    wrap.appendChild(grid);
    box.appendChild(wrap);
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
  var kindOverlay = (id, title) => {
    const win = id ? document.getElementById(id) : null;
    const name = win?.querySelector(".kindwin-name");
    const body = win?.querySelector(".kindwin-body");
    if (!win || !name || !body)
      return null;
    name.textContent = title;
    win.hidden = false;
    bringToFront(win);
    return body;
  };
  globalThis.openWindowForKind = (device, workspace) => {
    const body = kindOverlay(windowIdForKind(device?.kind ?? ""), device.name);
    if (!body)
      return false;
    renderKindWindow(doc, body, device, workspace ?? {}, { post: postJson, getText });
    return true;
  };
  globalThis.openGroupCard = (group) => {
    const body = kindOverlay("group-window", group.name);
    if (!body)
      return false;
    renderGroupCard(doc, body, group);
    return true;
  };
  globalThis.openFlowsWindow = (workspace) => {
    const body = kindOverlay("flows-window", "Flows");
    if (!body)
      return false;
    renderFlowsWindow(doc, body, workspace ?? {}, { post: postJson, getText });
    return true;
  };
  globalThis.makeGroupPress = makeGroupPress;
  globalThis.placeMenu = placeMenu;
  globalThis.placeSubmenu = placeSubmenu;
  globalThis.cableStyle = cableStyle;
  globalThis.renderPortsPanel = (box, ports, deps) => renderPortsPanel(doc, box, ports, deps);
  globalThis.renderPortFaceplate = (box, ports) => renderPortFaceplate(doc, box, ports);
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
