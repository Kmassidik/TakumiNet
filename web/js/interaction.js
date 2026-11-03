function startDrag(ev, d, g) {
  ev.preventDefault();
  if (pduMode) { pduClick(d); return; }
  if (cableMode) { cableClick(d); return; }

  // pointerdown+preventDefault suppresses the native dblclick, so detect it.
  const now = performance.now();
  if (lastClick && lastClick.id === d.id && now - lastClick.t < 400) {
    lastClick = null;
    openDeviceWindow(d);
    return;
  }
  lastClick = { id: d.id, t: now };

  selectedLink = null;

  /* Shift/Ctrl/Meta toggles the device into the selection instead of dragging. */
  if (ev.shiftKey || ev.ctrlKey || ev.metaKey) {
    toggleSelection(d.id);
    renderTopology();
    const n = selectionCount();
    status(n ? `${n} device${n === 1 ? '' : 's'} selected` : 'Nothing selected');
    return;
  }

  setSelection([d.id]);
  status(`${d.name} · ${d.model}`);
  syncSelectionClasses();
  renderEvents();

  const start = toSvg(ev);
  drag = { id: d.id, start, ox: d.x, oy: d.y, moved: false };
  g.classList.add('dragging');
  hideTip();

  const onMove = (e) => {
    const p = toSvg(e);
    const dx = p.x - start.x;
    const dy = p.y - start.y;
    if (Math.abs(dx) + Math.abs(dy) > 2) drag.moved = true;
    const dev = data.devices.find((x) => x.id === drag.id);
    dev.x = drag.ox + dx;
    dev.y = drag.oy + dy;
    renderTopology();
  };

  const onUp = async () => {
    window.removeEventListener('pointermove', onMove);
    const dev = data.devices.find((x) => x.id === drag.id);
    const id = drag.id;
    const moved = drag.moved;
    const { x, y } = dev;
    drag = null;
    if (moved) await api('/api/devices/move', { id, x, y });
    // No re-render on a plain click: replacing the node would swallow the
    // second half of a double-click (IP configuration).
  };

  window.addEventListener('pointermove', onMove);
  window.addEventListener('pointerup', onUp, { once: true });
}

async function cableClick(d) {
  if (!cableFrom) {
    cableFrom = d.id;
    setSelection([d.id]);
    status(`Cable from ${d.name} — pick the far end`);
    renderTopology();
    return;
  }
  if (cableFrom === d.id) {
    cableFrom = null;
    renderTopology();
    return;
  }
  const a = cableFrom;
  cableFrom = null;
  const r = await api('/api/links', { a, b: d.id, kind: cableKind });
  if (!r.error) sfx('connect1');
}

async function pduClick(d) {
  if (!pduFrom) {
    pduFrom = d.id;
    setSelection([d.id]);
    status(`PDU source ${d.name} — pick the destination`);
    renderTopology();
    return;
  }
  if (pduFrom === d.id) {
    pduFrom = null;
    renderTopology();
    return;
  }
  const src = pduFrom;
  pduFrom = null;
  pduMode = false;
  const r = await api('/api/pdu', { src, dst: d.id });
  if (r.error) {
    const snapshot = await getJson('/api/workspace');
    if (!snapshot.events) return;
    setData(snapshot);
    const event = snapshot.events[snapshot.events.length - 1];
    if (event && event.status === 'Dropped') {
      simCursor = event.id;
      renderEvents();
      animatePath(event.path);
    }
    return;
  }
  const event = data.events[data.events.length - 1];
  if (!event) return;
  sfx('addPacketDevice');
  simCursor = event.id;
  renderEvents();
  animatePath(event.path);
  status(`PDU delivered ${event.last} → ${event.at}`);
}

const tipEl = document.getElementById('tip');
function showTip(e, text) {
  tipEl.textContent = text;
  tipEl.hidden = false;
  tipEl.style.left = e.clientX + 12 + 'px';
  tipEl.style.top = e.clientY + 12 + 'px';
}
function hideTip() { tipEl.hidden = true; }

function animatePath(ids) {
  const pts = ids
    .map((id) => data.devices.find((d) => d.id === id))
    .filter(Boolean)
    .map((d) => ({ x: d.x, y: d.y }));
  if (pts.length < 2) return;

  const dot = node('circle', { r: 7, class: 'packet', cx: pts[0].x, cy: pts[0].y });
  svg().appendChild(dot);

  const SEG = 420;
  const t0 = performance.now();
  const step = (now) => {
    const t = Math.max(0, now - t0);
    const idx = Math.floor(t / SEG);
    if (idx >= pts.length - 1) { dot.remove(); return; }
    const f = (t % SEG) / SEG;
    const a = pts[idx];
    const b = pts[idx + 1];
    dot.setAttribute('cx', a.x + (b.x - a.x) * f);
    dot.setAttribute('cy', a.y + (b.y - a.y) * f);
    requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}
