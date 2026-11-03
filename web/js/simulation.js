/* ---------------- simulation panel ---------------- */
function enabledFilters() {
  const on = new Set();
  document.querySelectorAll('#filters input').forEach((cb) => {
    if (cb.checked) on.add(cb.dataset.protocol);
  });
  return on;
}

function visibleEvents() {
  if (!data) return [];
  if (typeof captureVisibleEvents === 'function') return captureVisibleEvents();
  const on = enabledFilters();
  return data.events.filter((e) => on.has(e.proto) || on.has(e.type));
}

function renderEvents() {
  const tbody = document.getElementById('events');
  tbody.replaceChildren();
  const events = visibleEvents();
  const current = events.findIndex((e) => e.id === simCursor);

  if (!events.length) {
    const tr = document.createElement('tr');
    const td = document.createElement('td');
    td.textContent = 'No events — send a PDU to capture';
    tr.appendChild(td);
    tbody.appendChild(tr);
  } else {
    events.forEach((e) => {
      const tr = document.createElement('tr');
      if (e.id === simCursor) tr.className = 'current';
      for (const cell of ['•', e.time.toFixed(3), e.last, e.at, e.type]) {
        const td = document.createElement('td');
        td.textContent = cell;
        tr.appendChild(td);
      }
      tr.onclick = () => {
        const now = performance.now();
        if (lastRowClick.id === e.id && now - lastRowClick.t < 400) {
          lastRowClick = { id: -1, t: 0 };
          openPduDetail(e);
          return;
        }
        lastRowClick = { id: e.id, t: now };
        if (typeof selectCaptureEvent === 'function') selectCaptureEvent(e.id);
        else {
          simCursor = e.id;
          renderEvents();
          animatePath(e.path, e.proto);
          sfx('addPacketButton');
        }
      };
      tr.title = 'Double-click for the PDU detail';
      tbody.appendChild(tr);
    });
  }

  document.getElementById('captured').textContent =
    `Captured: ${current < 0 ? 0 : current + 1}/${events.length}`;
  const shown = current >= 0 ? events[current] : events[events.length - 1];
  document.getElementById('clock').textContent = `${(shown ? shown.time : 0).toFixed(1)}s`;
  const row = tbody.querySelector('tr.current');
  if (row) row.scrollIntoView({ block: 'nearest' });
  if (typeof renderCapture === 'function') renderCapture();
}

/* ---------------- PDU detail (per-hop In/Out layers) ---------------- */
function layerText(layers) {
  if (!layers || !layers.length) return '—';
  return layers.map((layer) => {
    const fields = (layer.fields || []).map((field) => `  ${field.name}: ${field.value}`);
    return [layer.name, ...fields].join('\n');
  }).join('\n\n');
}

function openPduDetail(e) {
  const win = document.getElementById('pdu-dialog');
  const meta = document.getElementById('pdu-meta');
  const table = document.getElementById('pdu-table');
  const hops = e.hops || [];
  document.getElementById('pdu-title').textContent = `PDU Detail — ${e.last} → ${e.at}`;
  const outcome = e.status || 'Successful';
  meta.textContent = `${e.type} · ${outcome} · ${e.size || 0} bytes · t=${Number(e.time).toFixed(3)}s · ${hops.length} devices${e.reason ? ` · ${e.reason}` : ''}`;
  table.replaceChildren();

  const head = document.createElement('tr');
  for (const label of ['Device', 't (s)', 'In Layers', 'Out Layers', 'In', 'Out', 'TTL', 'Src MAC', 'Dst MAC', 'Decision']) {
    const th = document.createElement('th');
    th.textContent = label;
    head.appendChild(th);
  }
  table.appendChild(head);

  const appendRow = (cells) => {
    const tr = document.createElement('tr');
    for (const [text, cls] of cells) {
      const td = document.createElement('td');
      if (cls) td.className = cls;
      td.textContent = text;
      tr.appendChild(td);
    }
    table.appendChild(tr);
  };

  hops.forEach((h, i) => {
    appendRow([
      [h.name, ''],
      [Number(h.t || 0).toFixed(3), ''],
      [i === 0 ? '—' : layerText(h.layers), 'in'],
      [i === hops.length - 1 ? '—' : layerText(h.layers), 'out'],
      [h.in || '—', ''],
      [h.out || '—', ''],
      [String(h.ttl), ''],
      [h.srcMac || '—', ''],
      [h.dstMac || '—', ''],
      [h.note || '', 'note'],
    ]);
  });

  if (!hops.length) {
    appendRow([
      ['Control Plane', ''],
      [Number(e.time || 0).toFixed(3), ''],
      [layerText(e.layers), 'in'],
      ['—', 'out'],
      ['—', ''], ['—', ''], ['—', ''], ['—', ''], ['—', ''],
      [e.reason || 'Service exchange; no frame-level hops captured', 'note'],
    ]);
  }

  win.hidden = false;
  bringToFront(win);
  document.getElementById('pdu-close').onclick = () => { win.hidden = true; };
  win.onclick = (ev) => { if (ev.target === win) win.hidden = true; };
  sfx('addPacketButton');
}

function renderFilters() {
  const box = document.getElementById('filters');
  const previous = new Map();
  document.querySelectorAll('#filters input').forEach((cb) => {
    previous.set(cb.dataset.protocol, cb.checked);
  });
  const labels = [...new Set([
    ...data.filters,
    ...data.events.flatMap((e) => [e.proto, e.type]),
  ])];
  box.replaceChildren();
  for (const f of labels) {
    const label = document.createElement('label');
    const cb = document.createElement('input');
    cb.type = 'checkbox';
    cb.dataset.protocol = f;
    cb.checked = previous.has(f) ? previous.get(f) : true;
    cb.addEventListener('change', renderEvents);
    label.appendChild(cb);
    label.appendChild(document.createTextNode(f));
    box.appendChild(label);
  }
}

function setAllFilters(value) {
  for (const cb of document.querySelectorAll('#filters input')) cb.checked = value;
  renderEvents();
}
