function startDrag(ev, d) {
  ev.preventDefault();
  if (pduMode) { pduClick(d); return; }
  if (cableMode) { cablePress(d); return; }

  // pointerdown+preventDefault suppresses the native dblclick, so detect it.
  const now = performance.now();
  if (lastClick && lastClick.id === d.id && now - lastClick.t < 400) {
    lastClick = null;
    if (!(typeof openWindowForKind === 'function' && openWindowForKind(d, data))) openDeviceWindow(d);
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

  /* Pressing a device already in a multi-selection keeps it: the drag then
     moves the whole selection. A press outside the selection replaces it. */
  if (!selection.has(d.id)) setSelection([d.id]);
  status(`${d.name} · ${d.model}`);
  syncSelectionClasses();
  renderEvents();

  const start = toSvg(ev);
  const origins = [...selection]
    .map((id) => data.devices.find((x) => x.id === id))
    .filter(Boolean)
    .map((dev) => ({ id: dev.id, x: dev.x, y: dev.y }));
  drag = { id: d.id, start, origins, moved: false };
  hideTip();

  const onMove = (e) => {
    const p = toSvg(e);
    const dx = p.x - start.x;
    const dy = p.y - start.y;
    if (Math.abs(dx) + Math.abs(dy) > 2) drag.moved = true;
    for (const o of drag.origins) {
      const dev = data.devices.find((x) => x.id === o.id);
      if (dev) { dev.x = o.x + dx; dev.y = o.y + dy; }
    }
    renderTopology();
  };

  const onUp = async () => {
    window.removeEventListener('pointermove', onMove);
    const moved = drag.moved;
    /* Each api() call replaces `data` with the server snapshot, so read every
       final position before the first call. */
    const targets = drag.origins
      .map((o) => data.devices.find((x) => x.id === o.id))
      .filter(Boolean)
      .map((dev) => ({ id: dev.id, x: dev.x, y: dev.y }));
    drag = null;
    if (moved) {
      for (const t of targets) await api('/api/devices/move', { id: t.id, x: t.x, y: t.y });
    }
    // No re-render on a plain click: replacing the node would swallow the
    // second half of a double-click (IP configuration).
  };

  window.addEventListener('pointermove', onMove);
  window.addEventListener('pointerup', onUp, { once: true });
}

/* Drag-to-connect: the universal node-editor gesture. A press in cable mode
   anchors the cable (never moves the device); releasing over another device
   completes the link exactly like a second click would. Releasing over empty
   canvas keeps the pending end, so click-click wiring still works. */
function cablePress(d) {
  const wasPending = !!cableFrom;
  cableClick(d);
  if (wasPending) return;
  const onUp = (e) => {
    if (!cableFrom || cableFrom !== d.id) return;
    const hit = workspaceCanvas.deviceAt(e);
    if (!hit || hit.id === d.id) return;
    const far = data.devices.find((x) => x.id === hit.id);
    if (far) cableClick(far);
  };
  window.addEventListener('pointerup', onUp, { once: true });
}

async function cableClick(d) {
  if (!cableFrom) {
    cableFrom = d.id;
    setSelection([d.id]);
    status(cableStatusText());
    updateCableChip();
    renderTopology();
    return;
  }
  if (cableFrom === d.id) {
    cableFrom = null;
    status(cableStatusText());
    updateCableChip();
    renderTopology();
    return;
  }
  const a = cableFrom;
  cableFrom = null;
  updateCableChip();
  const r = await api('/api/links', { a, b: d.id, kind: cableKind });
  if (r.error) showLinkToast(r.error);
  else {
    status(cableStatusText());
    sfx('connect1');
  }
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
      if (typeof selectCaptureEvent === 'function') selectCaptureEvent(event.id);
      else {
        simCursor = event.id;
        renderEvents();
        animatePath(event.path, event.proto);
      }
    }
    return;
  }
  const event = data.events[data.events.length - 1];
  if (!event) return;
  sfx('addPacketDevice');
  if (typeof selectCaptureEvent === 'function') selectCaptureEvent(event.id);
  else {
    simCursor = event.id;
    renderEvents();
    animatePath(event.path, event.proto);
  }
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

function animatePath(ids, proto = 'ICMP', onComplete) {
  const pts = ids
    .map((id) => data.devices.find((d) => d.id === id))
    .filter(Boolean)
    .map((d) => ({ x: d.x, y: d.y }));
  if (pts.length < 2) { if (onComplete) onComplete(); return; }
  workspaceCanvas.runPacket({
    points: pts,
    color: typeof protocolColor === 'function' ? protocolColor(proto) : '#e8590c',
    segmentMs: 420 / (typeof playbackSpeed === 'number' ? playbackSpeed : 1),
    onDone: onComplete,
  });
}
