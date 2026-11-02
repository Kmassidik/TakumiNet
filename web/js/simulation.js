/* ---------------- simulation panel ---------------- */
function enabledFilters() {
  const on = new Set();
  document.querySelectorAll('#filters label').forEach((l) => {
    const cb = l.querySelector('input');
    if (cb && cb.checked) on.add(l.textContent.trim());
  });
  return on;
}

function visibleEvents() {
  if (!data) return [];
  const on = enabledFilters();
  return data.events.filter((e) => on.size === 0 || on.has(e.proto) || on.has(e.type));
}

function renderEvents() {
  const tbody = document.getElementById('events');
  tbody.replaceChildren();
  const events = visibleEvents();

  if (!events.length) {
    const tr = document.createElement('tr');
    tr.innerHTML = '<td colspan="5" style="color:#98a2b3">No events — send a PDU to capture</td>';
    tbody.appendChild(tr);
  } else {
    events.forEach((e, i) => {
      const tr = document.createElement('tr');
      if (i === simCursor) tr.className = 'current';
      for (const cell of ['•', e.time.toFixed(3), e.last, e.at, e.type]) {
        const td = document.createElement('td');
        td.textContent = cell;
        tr.appendChild(td);
      }
      tr.onclick = () => {
        const now = performance.now();
        if (lastRowClick.i === i && now - lastRowClick.t < 400) {
          lastRowClick = { i: -1, t: 0 };
          openPduDetail(e);
          return;
        }
        lastRowClick = { i, t: now };
        simCursor = i;
        renderEvents();
        animatePath(e.path);
        sfx('addPacketButton');
      };
      tr.title = 'Double-click for the PDU detail';
      tbody.appendChild(tr);
    });
  }

  const total = data.events.length;
  document.getElementById('captured').textContent =
    `Captured: ${simCursor + 1}/${total}`;
  const last = total ? data.events[total - 1].time : 0;
  document.getElementById('clock').textContent = `${last.toFixed(1)}s`;
  const tbodyEl = document.getElementById('events');
  const row = tbodyEl.querySelector('tr.current');
  if (row) row.scrollIntoView({ block: 'nearest' });
}

/* ---------------- PDU detail (per-hop In/Out layers) ---------------- */
const PDU_LAYERS = ['Ethernet II', 'IPv4', 'ICMP'];

function openPduDetail(e) {
  const win = document.getElementById('pdu-dialog');
  const meta = document.getElementById('pdu-meta');
  const table = document.getElementById('pdu-table');
  const hops = e.hops || [];
  document.getElementById('pdu-title').textContent = `PDU Detail — ${e.last} → ${e.at}`;
  meta.textContent = `${e.type} · ${e.size || 0} bytes · t=${Number(e.time).toFixed(3)}s · ${hops.length} devices`;
  table.replaceChildren();

  const head = document.createElement('tr');
  for (const label of ['Device', 't (s)', 'In Layers', 'Out Layers', 'In', 'Out', 'TTL', 'Src MAC', 'Dst MAC', 'Decision']) {
    const th = document.createElement('th');
    th.textContent = label;
    head.appendChild(th);
  }
  table.appendChild(head);

  hops.forEach((h, i) => {
    const inLayers = i === 0 ? '—' : PDU_LAYERS.join('\n');
    const outLayers = i === hops.length - 1 ? '—' : PDU_LAYERS.join('\n');
    const cells = [
      [h.name, ''],
      [Number(h.t || 0).toFixed(3), ''],
      [inLayers, 'in'],
      [outLayers, 'out'],
      [h.in || '—', ''],
      [h.out || '—', ''],
      [String(h.ttl), ''],
      [h.srcMac || '—', ''],
      [h.dstMac || '—', ''],
      [h.note || '', 'note'],
    ];
    const tr = document.createElement('tr');
    for (const [text, cls] of cells) {
      const td = document.createElement('td');
      if (cls) td.className = cls;
      td.textContent = text;
      tr.appendChild(td);
    }
    table.appendChild(tr);
  });

  win.hidden = false;
  bringToFront(win);
  document.getElementById('pdu-close').onclick = () => { win.hidden = true; };
  win.onclick = (ev) => { if (ev.target === win) win.hidden = true; };
  sfx('addPacketButton');
}

function renderFilters() {
  const box = document.getElementById('filters');
  box.replaceChildren();
  for (const f of data.filters) {
    const label = document.createElement('label');
    const cb = document.createElement('input');
    cb.type = 'checkbox';
    cb.checked = true;
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
