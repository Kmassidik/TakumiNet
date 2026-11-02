const NS = 'http://www.w3.org/2000/svg';
const asset = (p) => (p.startsWith('/') ? p : '/assets/' + p.split('/').map(encodeURIComponent).join('/'));

let data = null;
/* Packed templates the shipped build carries (`/api/catalog`); empty when the
   asset tree is not unpacked, in which case the palette looks as it always did. */
let catalog = [];
let selected = null;
let selection = new Set();
let selectedLink = null;
let drag = null;
let lastClick = null;
let cableMode = false;
let cableFrom = null;
/* Cable the palette is currently drawing; sent with every /api/links call. */
let cableKind = 'eCopper';
const CABLE_TYPES = [
  ['eCopper', 'Copper', 'SpecificCopperStraight_40x40.png', 'Copper Straight-Through'],
  ['eCross', 'Cross', 'SpecificArtificialCable_40x40.png', 'Copper Cross-Over'],
  ['eSerial', 'Serial', 'SpecificSerialDTE_40x40.png', 'Serial DTE'],
  ['eFiber', 'Fiber', 'SpecificFiber_40x40.png', 'Optical Fiber'],
  ['eConsole', 'Console', 'SpecificConsole_40x40.png', 'Console (PC to router/switch)'],
  ['ePhone', 'Phone', 'SpecificPhone_40x40.png', 'Phone (analog phone to router/switch)'],
  ['eCoax', 'Coax', 'SpecificCoaxial_40x40.png', 'Coaxial (cable modem or cloud)'],
  ['eIoT', 'IoT', 'SpecificIoECustomCable_40x40.png', 'IoT custom cable'],
];
let pduMode = false;
let pduFrom = null;
let clipboard = null;
const PREFS_KEY = 'pt-web:prefs';
const prefs = (() => {
  try { return { grid: false, sound: true, confirm: true, ...JSON.parse(localStorage.getItem(PREFS_KEY) || '{}') }; }
  catch (_) { return { grid: false, sound: true, confirm: true }; }
})();
const savePrefs = () => { try { localStorage.setItem(PREFS_KEY, JSON.stringify(prefs)); } catch (_) {} };
let showGrid = !!prefs.grid;
/* Which workspace view is on screen: the logical canvas or the physical rack. */
let viewMode = 'logical';
/* Devices whose Syslog collection this page enabled. The workspace JSON does
   not carry the flag, so the checkbox state lives here for the session. */
const syslogOn = new Set();
let vb = { x: 0, y: 0, w: 1000, h: 540 };
let simCursor = -1;
/* Re-rendering replaces the row, so a native dblclick never fires: detect two
   clicks on the same event within 400 ms, like the canvas does for devices. */
let lastRowClick = { i: -1, t: 0 };
let playTimer = null;
let currentName = 'lab1';

const svg = () => document.getElementById('topology');
const statusEl = () => document.getElementById('status-msg');

const sounds = new Map();
function sfx(name) {
  if (!prefs.sound) return;
  try {
    let a = sounds.get(name);
    if (!a) { a = new Audio(asset('Sounds/' + name + '.wav')); sounds.set(name, a); }
    a.currentTime = 0;
    a.play().catch(() => {});
  } catch (_) { /* decorative */ }
}

function status(msg) { statusEl().textContent = msg; }

function node(name, attrs) {
  const el = document.createElementNS(NS, name);
  for (const k in attrs) el.setAttribute(k, attrs[k]);
  return el;
}

function toSvg(ev) {
  const s = svg();
  const pt = s.createSVGPoint();
  pt.x = ev.clientX;
  pt.y = ev.clientY;
  return pt.matrixTransform(s.getScreenCTM().inverse());
}

async function api(path, params = {}) {
  const q = new URLSearchParams(params).toString();
  let res;
  try {
    res = await (await fetch(`${path}?${q}`, { method: 'POST' })).json();
  } catch (e) {
    status('request failed');
    return { error: 'request failed' };
  }
  if (res.error) {
    status(res.error);
    sfx('errorMsg');
    return res;
  }
  setData(res);
  return res;
}

async function getJson(path) {
  try { return await (await fetch(path)).json(); }
  catch { return {}; }
}

/* Selection is a set of device ids; `selected` mirrors the most recent member so
   single-device actions (copy, delete, cable source) keep their old behaviour. */
function setSelection(ids) {
  selection = new Set(ids);
  selected = ids.length ? ids[ids.length - 1] : null;
}

function toggleSelection(id) {
  if (selection.has(id)) {
    selection.delete(id);
    if (selected === id) selected = [...selection].pop() || null;
  } else {
    selection.add(id);
    selected = id;
  }
}

function syncSelectionClasses() {
  for (const el of document.querySelectorAll('.dev')) {
    el.classList.toggle('selected', selection.has(el.dataset.id));
  }
}

function selectionCount() { return [...selection].length; }

function setData(json) {
  data = json;
  const known = new Set(data.devices.map((d) => d.id));
  setSelection([...selection].filter((id) => known.has(id)));
  renderAll();
}

/* ---------------- toolbars ---------------- */
const PRIMARY = [
  ['iTBNew.png', 'New', 'new'], ['iTBOpen.png', 'Open', 'open'],
  ['iTBSave.png', 'Save', 'save'], ['iTBPrint.png', 'Print', 'print'], null,
  ['iTBUndo.png', 'Undo', 'undo'], ['iTBRedo.png', 'Redo', 'redo'], null,
  ['iTBCopy.png', 'Copy', 'copy'], ['iTBPaste.png', 'Paste', 'paste'],
  ['delete.svg', 'Delete', 'delete'], null,
  ['iTBZoomIn.png', 'Zoom in', 'zoom-in'], ['iTBZoomOut.png', 'Zoom out', 'zoom-out'],
  ['iTBZoomReset.png', 'Reset zoom', 'zoom-reset'], null,
  ['iTBPalette.png', 'Palette', 'toggle-palette'],
  ['iTBCustomDevice.png', 'Custom device', 'custom-device'], null,
  ['iTBClusterAssociations.png', 'Clusters', ''], ['iTBActivityWizard.png', 'Activity wizard', ''],
  ['iTBChallengeMode.png', 'Challenge mode', ''], null,
  ['iTBHelp.png', 'Help', 'help'],
];

const SECONDARY = [
  ['add-simple-pdu.svg', 'Simple PDU', 'pdu'], ['add-complex-pdu.svg', 'Complex PDU', 'pdu'], null,
  ['drawing-palette.svg', 'Drawing palette', ''], ['ellipse.svg', 'Ellipse', ''], null,
  ['4-way-nav.svg', 'Navigate', ''], ['grid-view.svg', 'Grid', 'toggle-grid'],
  ['compass.svg', 'Compass', ''], null,
  ['environment.svg', 'Environment', ''], ['home.svg', 'Home', 'zoom-reset'],
];

function renderToolbar(el, items) {
  el.replaceChildren();
  for (const item of items) {
    if (!item) {
      const sep = document.createElement('span');
      sep.className = 'sep';
      el.appendChild(sep);
      continue;
    }
    const [file, title, action] = item;
    const b = document.createElement('button');
    b.title = action ? title : `${title} (not implemented)`;
    if (!action) b.disabled = true;
    if (action) b.dataset.action = action;
    const img = document.createElement('img');
    img.src = asset('art/Toolbar/' + file);
    img.alt = title;
    b.appendChild(img);
    el.appendChild(b);
  }
}

/* ---------------- topology ---------------- */
function renderTopology() {
  const s = svg();
  s.setAttribute('viewBox', `${vb.x} ${vb.y} ${vb.w} ${vb.h}`);
  s.replaceChildren();

  if (showGrid) {
    const defs = node('defs', {});
    const pat = node('pattern', { id: 'grid', width: 25, height: 25, patternUnits: 'userSpaceOnUse' });
    pat.appendChild(node('path', { d: 'M 25 0 L 0 0 0 25', fill: 'none', stroke: '#e3e8ee', 'stroke-width': 1 }));
    defs.appendChild(pat);
    s.appendChild(defs);
    s.appendChild(node('rect', { x: vb.x, y: vb.y, width: vb.w, height: vb.h, fill: 'url(#grid)' }));
  }

  const byId = new Map(data.devices.map((d) => [d.id, d]));

  for (const l of data.links) {
    const a = byId.get(l.a);
    const b = byId.get(l.b);
    if (!a || !b) continue;

    const isSel = selectedLink && selectedLink.a === l.a && selectedLink.b === l.b;
    const isConsole = l.kind === 'eConsole';
    s.appendChild(node('line', {
      x1: a.x, y1: a.y, x2: b.x, y2: b.y,
      class: ['link', isSel ? 'selected' : '', isConsole ? 'console' : ''].filter(Boolean).join(' '),
    }));

    const hit = node('line', { x1: a.x, y1: a.y, x2: b.x, y2: b.y, class: 'link-hit' });
    hit.addEventListener('pointerdown', (ev) => {
      ev.stopPropagation();
      selectedLink = { a: l.a, b: l.b };
      setSelection([]);
      status(`${isConsole ? 'Console cable' : 'Link'}: ${a.name} ${l.aPort} ↔ ${b.name} ${l.bPort}`);
      renderTopology();
    });
    s.appendChild(hit);

    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const len = Math.hypot(dx, dy) || 1;
    const nx = (-dy / len) * 11;
    const ny = (dx / len) * 11;
    for (const [t, sign, port] of [[0.46, 1, l.aPort], [0.54, -1, l.bPort]]) {
      const label = node('text', {
        x: a.x + dx * t + nx * sign,
        y: a.y + dy * t + ny * sign,
        class: 'port',
        'text-anchor': 'middle',
      });
      label.textContent = port;
      s.appendChild(label);
    }
  }

  for (const d of data.devices) {
    const g = node('g', { class: 'dev', 'data-id': d.id });
    if (selection.has(d.id)) g.classList.add('selected');
    if (d.id === cableFrom || d.id === pduFrom) g.classList.add('cable-src');
    g.appendChild(node('rect', {
      class: 'sel', x: d.x - 36, y: d.y - 34, width: 72, height: 72, rx: 6,
      fill: 'transparent', stroke: 'transparent',
    }));
    const iconImg = node('image', {
      href: asset(d.icon), x: d.x - 27, y: d.y - 30, width: 54, height: 54,
      preserveAspectRatio: 'xMidYMid meet',
    });
    /* Mounted PT art is preferred; fall back to the shipped SVG when the
       asset tree is not mounted. */
    iconImg.onerror = () => {
      if (d.art) iconImg.setAttribute('href', asset(d.art));
    };
    g.appendChild(iconImg);
    const name = node('text', { x: d.x, y: d.y + 40, class: 'dev-name' });
    name.textContent = d.name;
    const model = node('text', { x: d.x, y: d.y + 52, class: 'dev-model' });
    model.textContent = d.model;
    g.appendChild(name);
    g.appendChild(model);

    if (d.ip) {
      const ip = node('text', { x: d.x, y: d.y + 64, class: 'dev-ip' });
      ip.textContent = `${d.ip}/${d.prefix}`;
      g.appendChild(ip);
    }

    g.addEventListener('pointerdown', (ev) => startDrag(ev, d, g));
    g.addEventListener('mousemove', (ev) => showTip(ev, `${d.name} · ${d.model}`));
    g.addEventListener('mouseleave', hideTip);
    s.appendChild(g);
  }
}

/* ---------------- physical (rack) view ----------------
   The rack is an HTML overlay above the untouched logical SVG, so switching
   back never re-renders or loses the canvas. Everything shown is derived from
   the current workspace JSON: device identity and the links that touch it. */

const KIND_ORDER = ['router', 'switch', 'hub', 'server', 'pc', 'laptop', 'ap',
  'homerouter', 'asa', 'wlc', 'phone', 'printer', 'cloud', 'thing'];
const KIND_LABEL = {
  router: 'Routers', switch: 'Switches', hub: 'Hubs', server: 'Servers',
  pc: 'Workstations', laptop: 'Laptops', ap: 'Access Points',
  homerouter: 'Wireless Routers', asa: 'Firewalls', wlc: 'Wireless LAN Controllers',
  phone: 'IP Phones', printer: 'Printers', cloud: 'Clouds', thing: 'IoT Devices',
};

/* Cabled ports and cables for one device, straight from the link list. */
function cableStats(id) {
  const ports = new Set();
  let cables = 0;
  for (const l of data.links || []) {
    if (l.a === id) { ports.add(l.aPort); cables++; }
    else if (l.b === id) { ports.add(l.bPort); cables++; }
  }
  return { ports: [...ports].filter(Boolean), cables };
}

function physicalBox(d) {
  const box = document.createElement('button');
  box.type = 'button';
  box.className = 'pv-dev';
  box.dataset.id = d.id;
  if (selection.has(d.id)) box.classList.add('selected');
  box.title = `${d.name} · ${d.model}`;

  const name = document.createElement('span');
  name.className = 'pv-name';
  name.textContent = d.name;
  const model = document.createElement('span');
  model.className = 'pv-model';
  model.textContent = d.model;

  const stats = cableStats(d.id);
  const count = document.createElement('span');
  count.className = 'pv-count';
  count.textContent = stats.cables
    ? `${stats.cables} cable${stats.cables === 1 ? '' : 's'} · ${stats.ports.length} cabled port${stats.ports.length === 1 ? '' : 's'}`
    : 'No cables';

  box.appendChild(name);
  box.appendChild(model);
  box.appendChild(count);
  if (stats.ports.length) {
    const list = document.createElement('span');
    list.className = 'pv-portlist';
    list.textContent = stats.ports.join(', ');
    box.appendChild(list);
  }
  box.onclick = () => selectPhysical(d);
  return box;
}

function renderPhysical() {
  const host = document.getElementById('physical-view');
  if (!host) return;
  host.replaceChildren();
  const racks = document.createElement('div');
  racks.className = 'pv-racks';

  const groups = new Map();
  for (const d of data.devices || []) {
    const kind = d.kind || 'other';
    if (!groups.has(kind)) groups.set(kind, []);
    groups.get(kind).push(d);
  }
  const rank = (k) => {
    const i = KIND_ORDER.indexOf(k);
    return i < 0 ? KIND_ORDER.length : i;
  };
  const kinds = [...groups.keys()].sort((a, b) => rank(a) - rank(b) || a.localeCompare(b));
  for (const kind of kinds) {
    const devices = groups.get(kind);
    const rack = document.createElement('section');
    rack.className = 'pv-rack';
    const title = document.createElement('h3');
    title.className = 'pv-rack-title';
    const label = KIND_LABEL[kind] || kind.charAt(0).toUpperCase() + kind.slice(1);
    title.textContent = `${label} (${devices.length})`;
    rack.appendChild(title);
    const boxes = document.createElement('div');
    boxes.className = 'pv-boxes';
    for (const d of devices) boxes.appendChild(physicalBox(d));
    rack.appendChild(boxes);
    racks.appendChild(rack);
  }
  if (!kinds.length) {
    const empty = document.createElement('div');
    empty.className = 'meta';
    empty.textContent = 'No devices in this workspace';
    racks.appendChild(empty);
  }
  host.appendChild(racks);
}

/* Selecting in the rack mirrors the logical selection and reports the device's
   ports on the status line, fetched from the same port inventory the CLI uses. */
async function selectPhysical(d) {
  selectedLink = null;
  setSelection([d.id]);
  renderTopology();
  for (const el of document.querySelectorAll('.pv-dev')) {
    el.classList.toggle('selected', el.dataset.id === d.id);
  }
  const stats = cableStats(d.id);
  const r = await getJson(`/api/devices/ports?id=${encodeURIComponent(d.id)}`);
  const ports = Array.isArray(r.ports) ? r.ports : [];
  if (ports.length) {
    const names = ports.map((p) => (p.ip ? `${p.name} (${p.ip}/${p.prefix})` : p.name));
    status(`${d.name} · ${d.model} — ${ports.length} port${ports.length === 1 ? '' : 's'}: ${names.join(', ')}`);
  } else {
    status(`${d.name} · ${d.model} — ${stats.cables} cable${stats.cables === 1 ? '' : 's'}${stats.ports.length ? ` on ${stats.ports.join(', ')}` : ''}`);
  }
}

function setView(mode) {
  viewMode = mode === 'physical' ? 'physical' : 'logical';
  const physical = viewMode === 'physical';
  const host = document.getElementById('physical-view');
  if (host) host.hidden = !physical;
  if (physical) renderPhysical();
  document.querySelector('.canvas-wrap').classList.toggle('physical-mode', physical);
  document.querySelectorAll('.tabs .tab[data-view]').forEach((b) => {
    b.classList.toggle('active', b.dataset.view === viewMode);
  });
  const toggle = document.getElementById('physical-toggle');
  if (toggle) {
    toggle.classList.toggle('active', physical);
    toggle.setAttribute('aria-pressed', physical ? 'true' : 'false');
  }
  status(physical ? 'Physical view' : 'Logical view');
}

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
  if (!r.error) {
    sfx('addPacketDevice');
    simCursor = data.events.length - 1;
    renderEvents();
    animatePath(data.events[simCursor].path);
    status(`PDU delivered ${data.events[simCursor].last} → ${data.events[simCursor].at}`);
  }
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

  const dot = node('circle', { r: 7, class: 'packet' });
  svg().appendChild(dot);

  const SEG = 420;
  const t0 = performance.now();
  const step = (now) => {
    const t = now - t0;
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

/* ---------------- palette ---------------- */
/* First catalogue entry per case-folded label; the shipped templates repeat a
   model once per OS image, and the palette shows a model once. */
function catalogByLabel() {
  const by = new Map();
  for (const m of catalog) {
    const key = String(m.label || '').toLowerCase();
    if (key && !by.has(key)) by.set(key, m);
  }
  return by;
}

/* Templates the palette has no tile for: shown muted so the shipped catalogue
   is visible, but instantiating one is not wired up yet. */
function renderTemplateTiles(pal) {
  const used = new Set(data.palette.map((p) => String(p.label || '').toLowerCase()));
  const pending = catalog.filter((m) => m.label && !used.has(m.label.toLowerCase()));
  if (!pending.length) return;

  const section = document.createElement('div');
  section.className = 'tpl-section';
  section.id = 'palette-templates';
  const heading = document.createElement('span');
  heading.className = 'tpl-heading';
  heading.textContent = 'Templates';
  section.appendChild(heading);

  const groups = new Map();
  for (const m of pending) {
    const key = m.group || 'Other';
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(m);
  }

  /* Most of the shipped catalogue is IoT widgets (kind `thing`); keep the
     twelve slots for the groups that can become real devices, in the order the
     catalogue lists them. */
  const deviceGroup = (models) => (models.some((m) => m.kind && m.kind !== 'thing') ? 0 : 1);
  const ordered = [...groups].sort((a, b) => deviceGroup(a[1]) - deviceGroup(b[1]));

  for (const [name, models] of ordered.slice(0, 12)) {
    const group = document.createElement('div');
    group.className = 'tpl-group';
    const label = document.createElement('span');
    label.className = 'tpl-group-label';
    label.textContent = name;
    group.appendChild(label);
    const row = document.createElement('div');
    row.className = 'tpl-tiles';
    for (const m of models) row.appendChild(templateTile(m));
    group.appendChild(row);
    section.appendChild(group);
  }
  pal.appendChild(section);
}

function templateTile(m) {
  const tile = document.createElement('button');
  tile.type = 'button';
  tile.className = 'tpl-tile';
  tile.disabled = true;
  tile.title = m.description
    ? `${m.description} — template present, not yet instantiable`
    : 'template present, not yet instantiable';
  tile.dataset.label = m.label;
  tile.dataset.group = m.group || '';
  tile.textContent = m.name || m.label;
  return tile;
}

function renderPalette() {
  const groups = document.getElementById('groups');
  groups.replaceChildren();
  data.groups.forEach((g, i) => {
    const b = document.createElement('button');
    b.title = g.label;
    if (i === 0) b.classList.add('active');
    const img = document.createElement('img');
    img.src = asset(g.icon);
    img.alt = g.label;
    b.appendChild(img);
    b.onclick = () => {
      groups.querySelectorAll('button').forEach((x) => x.classList.remove('active'));
      b.classList.add('active');
      status(g.label);
    };
    groups.appendChild(b);
  });

  const pal = document.getElementById('palette');
  pal.replaceChildren();

  for (const [kind, label, icon, tip] of CABLE_TYPES) {
    const cable = document.createElement('button');
    const active = cableMode && cableKind === kind;
    cable.className = 'dev-tile cable-tool' + (active ? ' active' : '');
    cable.title = tip + ' — click two devices';
    cable.dataset.kind = kind;
    const cimg = document.createElement('img');
    cimg.src = asset('art/ComponentBox/' + icon);
    const clabel = document.createElement('span');
    clabel.textContent = label;
    cable.appendChild(cimg);
    cable.appendChild(clabel);
    cable.onclick = () => {
      cableMode = !(cableMode && cableKind === kind);
      cableKind = kind;
      pduMode = false;
      cableFrom = null;
      document.querySelector('.canvas-wrap').classList.toggle('cable-mode', cableMode);
      status(cableMode ? `${tip}: click two devices` : 'Selection mode');
      renderPalette();
      renderTopology();
    };
    pal.appendChild(cable);
  }

  const bus = document.createElement('button');
  bus.className = 'dev-tile';
  bus.title = 'Build a bus segment: hub + N computers with addresses';
  bus.id = 'bus-tool';
  const bimg = document.createElement('img');
  bimg.src = asset('art/ComponentBox/SpecificCoaxial_40x40.png');
  bimg.alt = 'Bus';
  const blabel = document.createElement('span');
  blabel.textContent = 'Bus';
  bus.appendChild(bimg);
  bus.appendChild(blabel);
  bus.onclick = () => ACTIONS['build-bus']();
  pal.appendChild(bus);

  const meshTool = document.createElement('button');
  meshTool.id = 'mesh-tool';
  meshTool.className = 'dev-tile mesh-tool';
  meshTool.title = 'Create Full Mesh — link every device';
  const mimg = document.createElement('img');
  mimg.src = asset('art/ComponentBox/SpecificMultiuser.png');
  const mlabel = document.createElement('span');
  mlabel.textContent = 'Mesh';
  meshTool.appendChild(mimg);
  meshTool.appendChild(mlabel);
  meshTool.onclick = () => ACTIONS.mesh(true);
  pal.appendChild(meshTool);

  const cat = catalogByLabel();

  for (const p of data.palette) {
    const tile = document.createElement('button');
    tile.className = 'dev-tile';
    tile.title = `Drag ${p.label} onto the canvas`;
    const model = cat.get(p.label.toLowerCase());
    if (model && model.description) tile.title += ` — ${model.description}`;
    tile.draggable = true;
    const img = document.createElement('img');
    img.src = asset(p.icon);
    img.alt = p.label;
    img.draggable = false;
    img.onerror = () => {
      if (p.art && img.src !== asset(p.art)) img.src = asset(p.art);
    };
    const span = document.createElement('span');
    span.textContent = p.label;
    tile.appendChild(img);
    tile.appendChild(span);
    tile.addEventListener('dragstart', (e) => {
      e.dataTransfer.setData('text/plain', p.label);
      e.dataTransfer.effectAllowed = 'copy';
      tile.classList.add('dragging');
    });
    tile.addEventListener('dragend', () => tile.classList.remove('dragging'));
    pal.appendChild(tile);
  }

  renderTemplateTiles(pal);
}

/* ---------------- actions ---------------- */
const ACTIONS = {
  async new() {
    if (!confirm('Discard the current topology?')) return;
    const r = await api('/api/reset');
    if (!r.error) { currentName = 'lab1'; simCursor = -1; status('New workspace'); }
  },
  async open() {
    await openPktDialog();
  },
  async 'open-ptw'() {
    const { names = [] } = await getJson('/api/saves');
    if (!names.length) { status('No saved topologies'); sfx('errorMsg'); return; }
    const name = prompt(`Open topology (${names.join(', ')})`, names[0]);
    if (!name) return;
    const r = await api('/api/load', { name });
    if (!r.error) { currentName = name; simCursor = -1; status(`Opened ${name}`); sfx('newScenarioButton'); }
  },
  async save() {
    const name = prompt('Save topology as', currentName);
    if (!name) return;
    const r = await api('/api/save', { name });
    if (!r.error) { currentName = name; status(`Saved ${name}.ptw`); sfx('newScenarioButton'); }
  },
  print() { status('Printing…'); window.print(); },

  async undo() { const r = await api('/api/undo'); if (!r.error) status('Undo'); },
  async redo() { const r = await api('/api/redo'); if (!r.error) status('Redo'); },

  copy() {
    if (!selected) { status('Select a device first'); sfx('errorMsg'); return; }
    clipboard = selected;
    status(`Copied ${data.devices.find((d) => d.id === clipboard)?.name}`);
  },
  async paste() {
    if (!clipboard) { status('Nothing to paste'); sfx('errorMsg'); return; }
    const r = await api('/api/devices/duplicate', { id: clipboard });
    if (!r.error) { status('Pasted'); sfx('devicePlacement'); }
  },
  async delete() {
    if (selectedLink) {
      const { a, b } = selectedLink;
      selectedLink = null;
      if (!(await api('/api/links/delete', { a, b })).error) sfx('removeLink');
      return;
    }
    if (selected) {
      const id = selected;
      setSelection([...selection].filter((x) => x !== id));
      if (!(await api('/api/devices/delete', { id })).error) sfx('removeDevice');
      return;
    }
    status('Nothing selected');
  },

  'zoom-in'() { zoom(0.8); },
  'zoom-out'() { zoom(1.25); },
  'zoom-reset'() {
    vb = { x: 0, y: 0, w: 1000, h: 540 };
    renderTopology();
    status('Zoom reset');
  },
  'toggle-palette'() {
    const bar = document.getElementById('palette-bar');
    bar.hidden = !bar.hidden;
    status(bar.hidden ? 'Palette hidden' : 'Palette shown');
  },
  'toggle-grid'() {
    showGrid = !showGrid;
    prefs.grid = showGrid;
    savePrefs();
    renderTopology();
    status(showGrid ? 'Grid on' : 'Grid off');
  },
  async 'build-bus'() {
    const raw = prompt('How many computers on the bus?', '4');
    if (raw === null) return; // cancelled
    const count = parseInt(raw || '4', 10);
    if (!count || count < 2 || count > 24) {
      status('bus needs 2 to 24 stations');
      sfx('errorMsg');
      return;
    }
    const r = await api('/api/bus', { count });
    if (!r.error) {
      simCursor = -1;
      sfx('connect1');
      status(`Bus built: ${count} computers on 192.168.1.0/24`);
    }
  },
  async 'custom-device'() {
    const name = prompt('Custom device name', 'MyDevice');
    if (!name) return;
    const cx = vb.x + vb.w / 2 - 50;
    const cy = vb.y + vb.h / 2 - 20;
    const r = await api('/api/devices', { model: 'PC-PT', x: cx, y: cy, name });
    if (!r.error) { status(`Added ${name}`); sfx('devicePlacement'); }
  },
  pdu() {
    pduMode = !pduMode;
    cableMode = false;
    pduFrom = null;
    document.querySelector('.canvas-wrap').classList.toggle('crosshair', pduMode);
    status(pduMode ? 'PDU: click source, then destination' : 'Selection mode');
    renderTopology();
  },
  /* Create a full mesh. The menu item meshes the current selection, falling back
     to every device when fewer than two are selected; the palette button always
     meshes every device by passing `all`. */
  async mesh(all = false) {
    const devices = (data && data.devices) || [];
    const chosen = !all && selectionCount() >= 2 ? [...selection] : devices.map((d) => d.id);
    if (chosen.length < 2) {
      status('Mesh needs at least two devices');
      sfx('errorMsg');
      return;
    }
    const r = await api('/api/mesh', { ids: chosen.join(',') });
    if (r.error) return;
    status(`Meshed ${chosen.length} devices — ${data.links.length} links`);
    sfx('connect1');
  },
  async 'reset-sim'() {
    const r = await api('/api/sim/reset');
    if (!r.error) { simCursor = -1; renderEvents(); status('Simulation reset'); }
  },
  help() { window.open('/browser', '_blank'); },
  assets() { window.open('/browser', '_blank'); },
  dialogs() { openDialogs(); },
  preferences() {
    const dlg = document.getElementById('prefs-dialog');
    document.getElementById('pref-grid').checked = prefs.grid;
    document.getElementById('pref-sound').checked = prefs.sound;
    document.getElementById('pref-confirm').checked = prefs.confirm;
    dlg.hidden = false;
    document.getElementById('pref-grid').onchange = (e) => {
      prefs.grid = e.target.checked; showGrid = prefs.grid; savePrefs(); renderTopology();
    };
    document.getElementById('pref-sound').onchange = (e) => {
      prefs.sound = e.target.checked; savePrefs();
      document.getElementById('prefs-note').textContent = prefs.sound ? 'Sound enabled' : 'Sound muted';
    };
    document.getElementById('pref-confirm').onchange = (e) => {
      prefs.confirm = e.target.checked; savePrefs();
    };
    document.getElementById('prefs-close').onclick = () => { dlg.hidden = true; };
  },
  about() {
    const dlg = document.getElementById('about-dialog');
    dlg.hidden = false;
    document.getElementById('about-close').onclick = () => { dlg.hidden = true; };
  },
};

function zoom(factor) {
  const cx = vb.x + vb.w / 2;
  const cy = vb.y + vb.h / 2;
  const w = Math.min(2400, Math.max(300, vb.w * factor));
  const h = w * 0.54;
  vb = { x: cx - w / 2, y: cy - h / 2, w, h };
  renderTopology();
  status(`Zoom ${(1000 / w * 100).toFixed(0)}%`);
}

/* ---------------- simulation transport ---------------- */
function stepSim(dir) {
  const events = visibleEvents();
  if (!events.length) { status('No events'); return; }
  simCursor = Math.min(events.length - 1, Math.max(0, simCursor + dir));
  renderEvents();
  animatePath(events[simCursor].path);
  sfx('movieControlButton');
}

function togglePlay() {
  if (playTimer) {
    clearInterval(playTimer);
    playTimer = null;
    document.querySelector('#play-btn img').src = asset('art/Simulation/play.svg');
    status('Paused');
    return;
  }
  document.querySelector('#play-btn img').src = asset('art/Simulation/pause.svg');
  status('Playing events');
  playTimer = setInterval(() => {
    const events = visibleEvents();
    if (simCursor >= events.length - 1) { togglePlay(); return; }
    stepSim(1);
  }, 900);
}

/* ---------------- chrome ---------------- */
function renderAll() {
  renderTopology();
  renderEvents();
  if (viewMode === 'physical') renderPhysical();
}

function wireMenus() {
  document.querySelectorAll('.menu').forEach((menu) => {
    const head = menu.querySelector(':scope > button');
    head.addEventListener('click', (e) => {
      e.stopPropagation();
      const open = menu.classList.contains('open');
      document.querySelectorAll('.menu').forEach((m) => m.classList.remove('open'));
      if (!open) menu.classList.add('open');
    });
  });
  document.addEventListener('click', () => {
    document.querySelectorAll('.menu').forEach((m) => m.classList.remove('open'));
  });
}

function wireActions() {
  document.addEventListener('click', (e) => {
    const el = e.target.closest('[data-action]');
    if (!el) return;
    const fn = ACTIONS[el.dataset.action];
    if (fn) { e.preventDefault(); fn(); }
  });
  document.querySelectorAll('[data-sfx]').forEach((b) => {
    b.addEventListener('click', () => sfx(b.dataset.sfx));
  });
  document.querySelectorAll('[data-sim]').forEach((b) => {
    b.addEventListener('click', () => {
      const what = b.dataset.sim;
      if (what === 'reset') ACTIONS['reset-sim']();
      else if (what === 'play' || what === 'play2') togglePlay();
      else if (what === 'step' || what === 'forward') stepSim(1);
      else if (what === 'back') stepSim(-1);
      else if (what === 'ffw') {
        const events = visibleEvents();
        if (events.length) {
          simCursor = events.length - 1;
          renderEvents();
          animatePath(events[simCursor].path);
        }
      }
    });
  });
  document.getElementById('show-all').onclick = () => setAllFilters(true);
  document.getElementById('show-none').onclick = () => setAllFilters(false);
  document.querySelectorAll('.modes .mode').forEach((b) => {
    b.onclick = () => {
      document.querySelectorAll('.modes .mode').forEach((x) => x.classList.remove('active'));
      b.classList.add('active');
      document.getElementById('status-mode').textContent = b.textContent;
      status(`${b.textContent} mode`);
    };
  });
}

function wireKeyboard() {
  document.addEventListener('keydown', async (e) => {
    if (document.activeElement && document.activeElement.tagName === 'INPUT') return;
    const meta = e.ctrlKey || e.metaKey;
    if (meta && e.key.toLowerCase() === 'z') { e.preventDefault(); ACTIONS.undo(); }
    else if (meta && e.key.toLowerCase() === 'y') { e.preventDefault(); ACTIONS.redo(); }
    else if (meta && e.key.toLowerCase() === 'c') { e.preventDefault(); ACTIONS.copy(); }
    else if (meta && e.key.toLowerCase() === 'v') { e.preventDefault(); ACTIONS.paste(); }
    else if (meta && e.key.toLowerCase() === 's') { e.preventDefault(); ACTIONS.save(); }
    else if (e.key === 'Delete' || e.key === 'Backspace') { e.preventDefault(); ACTIONS.delete(); }
    else if (e.key === 'Escape') {
      pduMode = false; cableMode = false; pduFrom = null; cableFrom = null;
      setSelection([]);
      document.querySelector('.canvas-wrap').classList.remove('cable-mode', 'crosshair');
      renderTopology();
    }
  });
}

/* Clicking empty canvas clears the selection. */
function wireCanvasSelection() {
  svg().addEventListener('pointerdown', (ev) => {
    if (ev.target.closest('.dev, .link-hit')) return;
    if (!selection.size && !selectedLink) return;
    setSelection([]);
    selectedLink = null;
    renderTopology();
  });
}

function wireCanvasDrop() {
  const wrap = document.querySelector('.canvas-wrap');
  wrap.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    wrap.classList.add('drop-target');
  });
  wrap.addEventListener('dragleave', (e) => {
    if (e.target === wrap) wrap.classList.remove('drop-target');
  });
  wrap.addEventListener('drop', async (e) => {
    e.preventDefault();
    wrap.classList.remove('drop-target');
    const model = e.dataTransfer.getData('text/plain');
    if (!model) return;
    const p = toSvg(e);
    const r = await api('/api/devices', { model, x: p.x, y: p.y });
    if (!r.error) sfx('devicePlacement');
  });
}

let ipTarget = null;

function prefixToMask(p) {
  const n = Number(p ?? 24);
  const m = n === 0 ? 0 : (0xffffffff << (32 - n)) >>> 0;
  return [24, 16, 8, 0].map((s) => (m >>> s) & 255).join('.');
}

function openIpDialog(d) {
  const $ = (id) => document.getElementById(id);
  ipTarget = d.id;
  $('ip-title').textContent = 'IP Configuration';
  $('ip-addr').value = d.ip || '';
  $('ip-mask').value = prefixToMask(d.prefix);
  $('ip-gw').value = d.gateway || '';
  $('ip-dns').value = d.dns || '';
  $('ip-v6auto').checked = !!d.ipv6Auto;
  $('ip-v6static').checked = !d.ipv6Auto;
  $('ip-v6addr').value = d.ipv6 || '';
  $('ip-v6prefix').value = d.ipv6Prefix ?? 64;
  $('ip-v6ll').value = `FE80::${(d.id || '0000').slice(-4).toUpperCase()}`;
  $('ip-v6gw').value = d.ipv6Gateway || '';
  $('ip-v6dns').value = d.ipv6Dns || '';
  $('ip-8021x').checked = !!d.dot1x;
  $('ip-8021x-user').value = d.dot1xUser || '';
  $('ip-8021x-pass').value = '';
  $('ip-note').textContent = `${d.name} · ${d.model}`;

  const dialog = $('ip-dialog');
  dialog.hidden = false;

  const setV4Mode = (dhcp) => {
    $('ip-dhcp').checked = dhcp;
    $('ip-static').checked = !dhcp;
    for (const id of ['ip-addr', 'ip-mask', 'ip-gw', 'ip-dns']) $(id).disabled = dhcp;
  };
  $('ip-dhcp').onchange = () => setV4Mode(true);
  $('ip-static').onchange = () => setV4Mode(false);
  setV4Mode(!!d.dhcp);

  /* Servers also own a DHCP pool, which is what hands the addresses out. */
  const poolGroup = $('ip-pool-group');
  poolGroup.hidden = d.kind !== 'server';
  if (d.pool) {
    $('ip-pool-net').value = d.pool.network || '';
    $('ip-pool-mask').value = prefixToMask(d.pool.prefix ?? 24);
    $('ip-pool-gw').value = d.pool.gateway || '';
    $('ip-pool-dns').value = d.pool.dns || '';
  }
  $('ip-pool-save').onclick = async () => {
    const note = $('ip-pool-note');
    const r = await api('/api/devices/dhcp', {
      id: ipTarget,
      network: $('ip-pool-net').value.trim(),
      mask: $('ip-pool-mask').value.trim() || '255.255.255.0',
      gateway: $('ip-pool-gw').value.trim(),
      dns: $('ip-pool-dns').value.trim(),
    });
    note.textContent = r.error || 'Pool saved';
  };

  const setV6Mode = (auto) => {
    $('ip-v6auto').checked = auto;
    $('ip-v6static').checked = !auto;
    for (const id of ['ip-v6addr', 'ip-v6prefix', 'ip-v6gw', 'ip-v6dns']) $(id).disabled = auto;
  };
  $('ip-v6auto').onchange = () => setV6Mode(true);
  $('ip-v6static').onchange = () => setV6Mode(false);

  $('ip-close').onclick = () => { dialog.hidden = true; };
  dialog.onclick = (e) => { if (e.target === dialog) dialog.hidden = true; };

  $('ip-save').onclick = async () => {
    const note = $('ip-note');
    if ($('ip-dhcp').checked) {
      const r = await api('/api/dhcp/acquire', { id: ipTarget });
      if (r.error) { note.textContent = r.error; return; }
      const dev = (r.devices || []).find((x) => x.id === ipTarget);
      if (dev) {
        $('ip-addr').value = dev.ip || '';
        $('ip-mask').value = prefixToMask(dev.prefix ?? 24);
        $('ip-gw').value = dev.gateway || '';
        $('ip-dns').value = dev.dns || '';
        note.textContent = `Lease ${dev.ip}/${dev.prefix}`;
        status(`DHCP lease ${dev.ip}/${dev.prefix}`);
        sfx('popUp');
      }
      return;
    }
    const v4 = await api('/api/devices/ip', {
      id: ipTarget,
      ip: $('ip-addr').value.trim(),
      mask: $('ip-mask').value.trim() || '255.255.255.0',
      gateway: $('ip-gw').value.trim(),
      dns: $('ip-dns').value.trim(),
    });
    if (v4.error) { note.textContent = v4.error; return; }

    const v6 = await api('/api/devices/ipv6', {
      id: ipTarget,
      auto: $('ip-v6auto').checked ? '1' : '0',
      addr: $('ip-v6addr').value.trim(),
      prefix: $('ip-v6prefix').value.trim() || '64',
      gateway: $('ip-v6gw').value.trim(),
      dns: $('ip-v6dns').value.trim(),
    });
    if (v6.error) { note.textContent = v6.error; return; }

    const x = await api('/api/devices/dot1x', {
      id: ipTarget,
      enabled: $('ip-8021x').checked ? '1' : '0',
      user: $('ip-8021x-user').value.trim(),
      pass: $('ip-8021x-pass').value.trim(),
    });
    if (x.error) { note.textContent = x.error; return; }

    dialog.hidden = true;
    status(`IP configuration saved: ${$('ip-addr').value.trim()} ${$('ip-mask').value.trim()}`);
    sfx('popUp');
  };
}

let pktFiles = [];

async function openPktDialog() {
  const dialog = document.getElementById('pkt-dialog');
  const list = document.getElementById('pkt-list');
  const filter = document.getElementById('pkt-filter');
  list.replaceChildren();
  dialog.hidden = false;
  filter.value = '';

  const { files = [] } = await getJson('/api/pkt/list');
  pktFiles = files;

  const render = () => {
    const q = filter.value.trim().toLowerCase();
    list.replaceChildren();
    const shown = pktFiles.filter((f) => !q || f.toLowerCase().includes(q)).slice(0, 400);
    if (!shown.length) {
      const li = document.createElement('li');
      li.textContent = pktFiles.length ? 'no match' : 'no .pkt files found';
      li.style.padding = '8px';
      list.appendChild(li);
    }
    for (const f of shown) {
      const li = document.createElement('li');
      const b = document.createElement('button');
      b.textContent = f;
      b.onclick = async () => {
        const r = await api('/api/pkt/open', { path: f });
        if (!r.error) {
          dialog.hidden = true;
          simCursor = -1;
          currentName = f.split('/').pop();
          sfx('newScenarioButton');
          status(`Opened ${currentName} — ${data.devices.length} devices, ${data.links.length} links`);
        }
      };
      li.appendChild(b);
      list.appendChild(li);
    }
  };

  filter.oninput = render;
  document.getElementById('pkt-close').onclick = () => { dialog.hidden = true; };
  dialog.onclick = (e) => { if (e.target === dialog) dialog.hidden = true; };
  render();
}


/* ---------------- device window (PC0 style) ---------------- */
const DESKTOP_APPS = [
  ['ipconfig.png', 'IP Configuration', 'ipconfig'],
  ['dialup.png', 'Dialup', ''],
  ['terminal.png', 'Terminal', 'term'],
  ['cmdprompt.png', 'Command Prompt', 'cmd'],
  ['browser.png', 'Web Browser', 'browser'],
  ['PCWirelessInactive.png', 'PC Wireless', 'wifi'],
  ['VPNdialup.png', 'VPN', 'vpn'],
  ['trafficGenerator.png', 'Traffic Generator', 'traffic'],
  ['mibbrowser.png', 'MIB Browser', 'mib'],
  ['IPCommunicator.png', 'Cisco IP Communicator', 'phone'],
  ['EmailClient.png', 'Email', 'email'],
  ['PPPoEDialer.png', 'PPPoE Dialer', 'pppoe'],
  ['TextEditor.png', 'Text Editor', 'editor'],
  ['IPv4Firewall.png', 'Firewall', 'firewall'],
  ['IPv6Firewall.png', 'IPv6 Firewall', 'firewall'],
];

let dwDevice = null;

function openDeviceWindow(d) {
  dwDevice = d;
  const win = document.getElementById('device-window');
  document.getElementById('dw-name').textContent = d.name;
  document.getElementById('dw-icon').src = asset(d.icon);
  win.hidden = false;
  bringToFront(win);
  selectTab('desktop');
  document.getElementById('dw-close').onclick = () => { win.hidden = true; };
  document.getElementById('dw-min').onclick = () => { win.hidden = true; };
  document.getElementById('dw-max').onclick = () => {
    const box = win.querySelector('.preview');
    if (box) box.classList.toggle('maxed');
  };
  win.onclick = (e) => { if (e.target === win) win.hidden = true; };
  document.querySelectorAll('#dw-tabs button').forEach((b) => {
    b.onclick = () => selectTab(b.dataset.tab);
  });
}

/* ---------------- services tab sections ---------------- */
/* FTP repository on a server: the file list is served by /api/ftp/list, while
   adds/removes go through the workspace endpoint (empty content removes). */
function ftpSection(d) {
  const box = document.createElement('fieldset');
  box.className = 'ip-group';
  const legend = document.createElement('legend');
  legend.textContent = 'FTP Files';
  box.appendChild(legend);

  const list = document.createElement('div');
  list.className = 'dns-list';
  box.appendChild(list);
  const note = document.createElement('div');
  note.className = 'meta';
  box.appendChild(note);

  const load = async () => {
    note.textContent = 'Loading…';
    let r;
    try {
      r = await jsonRequest('/api/ftp/list', { id: d.id });
    } catch {
      r = { error: 'request failed' };
    }
    list.replaceChildren();
    if (r.error) {
      note.textContent = r.error;
      return;
    }
    const files = r.files || [];
    for (const name of files) {
      const row = document.createElement('div');
      row.className = 'dns-row';
      const label = document.createElement('span');
      label.textContent = name;
      const del = document.createElement('button');
      del.className = 'btn';
      del.textContent = 'Remove';
      del.onclick = async () => {
        const res = await api('/api/devices/ftp', { id: d.id, name, content: '' });
        if (res.error) {
          note.textContent = res.error;
          return;
        }
        await load();
      };
      row.appendChild(label);
      row.appendChild(del);
      list.appendChild(row);
    }
    if (!files.length) {
      const empty = document.createElement('div');
      empty.className = 'meta';
      empty.textContent = 'No files';
      list.appendChild(empty);
    }
    note.textContent = files.length
      ? `${files.length} file${files.length === 1 ? '' : 's'}`
      : 'No files';
  };

  const form = document.createElement('div');
  form.className = 'tftp-form';
  const nameInput = document.createElement('input');
  nameInput.placeholder = 'notes.txt';
  nameInput.spellcheck = false;
  const contentInput = document.createElement('textarea');
  contentInput.className = 'http-page';
  contentInput.rows = 3;
  contentInput.spellcheck = false;
  contentInput.placeholder = 'File contents';
  const add = document.createElement('button');
  add.className = 'btn';
  add.textContent = 'Add File';
  add.onclick = async () => {
    const name = nameInput.value.trim();
    if (!name) {
      note.textContent = 'File name is required';
      return;
    }
    if (!contentInput.value) {
      note.textContent = 'File contents are required (empty content removes a file)';
      return;
    }
    const r = await api('/api/devices/ftp', {
      id: d.id,
      name,
      content: contentInput.value,
    });
    if (r.error) {
      note.textContent = r.error;
      return;
    }
    nameInput.value = '';
    contentInput.value = '';
    await load();
  };
  form.appendChild(nameInput);
  form.appendChild(contentInput);
  form.appendChild(add);
  box.appendChild(form);
  load();
  return box;
}

/* AAA user database on a server: names are listed, passwords never are. */
function aaaSection(d) {
  const box = document.createElement('fieldset');
  box.className = 'ip-group';
  const legend = document.createElement('legend');
  legend.textContent = 'AAA Users';
  box.appendChild(legend);

  const list = document.createElement('div');
  list.className = 'dns-list';
  box.appendChild(list);
  const note = document.createElement('div');
  note.className = 'meta';
  box.appendChild(note);

  const load = async () => {
    note.textContent = 'Loading…';
    let r;
    try {
      r = await jsonRequest('/api/aaa/list', { id: d.id });
    } catch {
      r = { error: 'request failed' };
    }
    list.replaceChildren();
    if (r.error) {
      note.textContent = r.error;
      return;
    }
    const users = r.users || [];
    for (const user of users) {
      const row = document.createElement('div');
      row.className = 'dns-row';
      const label = document.createElement('span');
      label.textContent = user;
      row.appendChild(label);
      list.appendChild(row);
    }
    if (!users.length) {
      const empty = document.createElement('div');
      empty.className = 'meta';
      empty.textContent = 'No users';
      list.appendChild(empty);
    }
    note.textContent = users.length
      ? `${users.length} user${users.length === 1 ? '' : 's'}`
      : 'No users';
  };

  const add = document.createElement('div');
  add.className = 'dns-row';
  const userInput = document.createElement('input');
  userInput.placeholder = 'alice';
  userInput.spellcheck = false;
  const passInput = document.createElement('input');
  passInput.type = 'password';
  passInput.placeholder = 'password';
  passInput.autocomplete = 'off';
  const addBtn = document.createElement('button');
  addBtn.className = 'btn';
  addBtn.textContent = 'Add User';
  const refreshBtn = document.createElement('button');
  refreshBtn.className = 'btn';
  refreshBtn.textContent = 'Refresh';
  refreshBtn.onclick = () => load();
  addBtn.onclick = async () => {
    const user = userInput.value.trim();
    const pass = passInput.value;
    if (!user || !pass) {
      note.textContent = 'User and password are required';
      return;
    }
    const r = await api('/api/devices/aaa', { id: d.id, user, pass });
    if (r.error) {
      note.textContent = r.error;
      return;
    }
    userInput.value = '';
    passInput.value = '';
    await load();
  };
  add.appendChild(userInput);
  add.appendChild(passInput);
  add.appendChild(addBtn);
  add.appendChild(refreshBtn);
  box.appendChild(add);
  load();
  return box;
}

/* Syslog collection switch plus the entries the server has recorded. */
function syslogSection(d) {
  const box = document.createElement('fieldset');
  box.className = 'ip-group';
  const legend = document.createElement('legend');
  legend.textContent = 'Syslog';
  box.appendChild(legend);

  const head = document.createElement('div');
  head.className = 'syslog-head';
  const label = document.createElement('label');
  label.className = 'sys-check';
  const check = document.createElement('input');
  check.type = 'checkbox';
  check.checked = syslogOn.has(d.id) || d.syslogOn === true;
  const text = document.createElement('span');
  text.textContent = 'Enable collection';
  label.appendChild(check);
  label.appendChild(text);
  const refreshBtn = document.createElement('button');
  refreshBtn.className = 'btn';
  refreshBtn.textContent = 'Refresh';
  head.appendChild(label);
  head.appendChild(refreshBtn);
  box.appendChild(head);

  const list = document.createElement('div');
  list.className = 'syslog-list';
  box.appendChild(list);
  const note = document.createElement('div');
  note.className = 'meta';
  box.appendChild(note);

  const load = async () => {
    note.textContent = 'Loading…';
    let r;
    try {
      r = await jsonRequest('/api/syslog/list', { id: d.id });
    } catch {
      r = { error: 'request failed' };
    }
    list.replaceChildren();
    if (r.error) {
      note.textContent = r.error;
      return;
    }
    const entries = r.entries || [];
    for (const e of entries) {
      const row = document.createElement('div');
      row.className = 'syslog-row';
      const time = document.createElement('span');
      time.className = 'syslog-time';
      time.textContent = `${(Number(e.time) || 0).toFixed(1)}s`;
      const sevText = String(e.severity || 'info').toLowerCase();
      const sev = document.createElement('span');
      sev.className = `syslog-sev sev-${sevText.replace(/[^a-z]/g, '') || 'info'}`;
      sev.textContent = sevText;
      const msg = document.createElement('span');
      msg.className = 'syslog-text';
      msg.textContent = e.text || '';
      row.appendChild(time);
      row.appendChild(sev);
      row.appendChild(msg);
      list.appendChild(row);
    }
    if (!entries.length) {
      const empty = document.createElement('div');
      empty.className = 'meta';
      empty.textContent = check.checked ? 'No entries yet' : 'Collection is off';
      list.appendChild(empty);
    }
    /* Recorded entries can only exist while collection is on. */
    if (entries.length && !check.checked) {
      syslogOn.add(d.id);
      check.checked = true;
    }
    note.textContent = `${entries.length} entr${entries.length === 1 ? 'y' : 'ies'}`;
  };

  check.onchange = async () => {
    const on = check.checked;
    const r = await api('/api/devices/syslog', { id: d.id, on: on ? '1' : '0' });
    if (r.error) {
      check.checked = !on;
      note.textContent = r.error;
      return;
    }
    if (on) syslogOn.add(d.id);
    else syslogOn.delete(d.id);
    await load();
  };
  refreshBtn.onclick = () => load();
  load();
  return box;
}

/* NTP client: point this device at an address and report the sync state. */
function ntpSection(d) {
  const box = document.createElement('fieldset');
  box.className = 'ip-group';
  const legend = document.createElement('legend');
  legend.textContent = 'NTP';
  box.appendChild(legend);

  const row = document.createElement('div');
  row.className = 'dns-row';
  const input = document.createElement('input');
  input.placeholder = '192.168.2.20';
  input.spellcheck = false;
  const syncBtn = document.createElement('button');
  syncBtn.className = 'btn';
  syncBtn.textContent = 'Sync';
  row.appendChild(input);
  row.appendChild(syncBtn);
  box.appendChild(row);
  const note = document.createElement('div');
  note.className = 'meta';
  note.textContent = 'Checking…';
  box.appendChild(note);

  const load = async () => {
    let r;
    try {
      r = await jsonRequest('/api/ntp/status', { id: d.id });
    } catch {
      r = { error: 'request failed' };
    }
    if (r.error) {
      note.textContent = r.error;
      note.classList.remove('ok');
      return;
    }
    if (r.synced) {
      const ms = Number(r.offsetMs) || 0;
      note.textContent = `Synced to ${r.server} (offset ${ms} ms)`;
      note.classList.add('ok');
      if (r.server) input.value = r.server;
    } else {
      note.textContent = 'Not synchronised';
      note.classList.remove('ok');
    }
  };

  syncBtn.onclick = async () => {
    const server = input.value.trim();
    if (!server) {
      note.textContent = 'Server address is required';
      return;
    }
    const r = await api('/api/devices/ntp', { id: d.id, server });
    if (r.error) {
      note.textContent = r.error;
      return;
    }
    await load();
  };
  load();
  return box;
}

function selectTab(name) {
  document.querySelectorAll('#dw-tabs button').forEach((b) => {
    b.classList.toggle('active', b.dataset.tab === name);
  });
  const pane = document.getElementById('dw-pane');
  pane.replaceChildren();
  const d = dwDevice;
  if (!d) return;

  if (name === 'desktop') {
    const desk = document.createElement('div');
    desk.className = 'dw-desktop';
    for (const [icon, label, action] of DESKTOP_APPS) {
      const app = document.createElement('button');
      app.className = 'dw-app';
      app.title = label;
      const img = document.createElement('img');
      img.src = asset('art/Workstation/' + icon);
      img.alt = label;
      const span = document.createElement('span');
      span.textContent = label;
      app.appendChild(img);
      app.appendChild(span);
      app.onclick = () => {
        if (action === 'ipconfig') openIpDialog(d);
        else if (action === 'cmd') openCmd(d);
        else if (action === 'term') openTerm(d);
        else if (action === 'browser') openBrowser(d);
        else if (action === 'editor') openEditor(d);
        else if (action === 'traffic') openTraffic(d);
        else if (action === 'mib') openMib(d);
        else if (action === 'email') openMail(d);
        else if (action === 'wifi') openWifi(d);
        else if (action === 'vpn') openVpn(d);
        else if (action === 'pppoe') openPppoe(d);
        else if (action === 'phone') openPhone(d);
        else if (action === 'firewall') openFirewall(d);
        else status(`${label} — not implemented yet`);
      };
      desk.appendChild(app);
    }
    pane.appendChild(desk);
    return;
  }

  if (name === 'physical') {
    const box = document.createElement('div');
    box.className = 'dw-physical';
    const off = d.powered === false;
    const img = document.createElement('img');
    const phys = off
      ? (d.kind === 'server' ? 'PowerOffISRG2.png'
        : d.kind === 'laptop' ? 'PowerOffLaptop.png' : 'PowerOffPC.png')
      : (d.kind === 'server' ? 'PowerOnServer.png' : 'PowerOnPC.png');
    img.src = asset('art/PhysicalView/Devices/' + phys);
    img.alt = d.name;
    img.onerror = () => { img.src = asset(d.icon); };

    const cap = document.createElement('div');
    cap.className = 'meta';
    cap.textContent = `${d.name} · ${d.model}${off ? ' · powered off' : ''}`;

    const refresh = async () => {
      dwDevice = (data.devices || []).find((x) => x.id === d.id) || d;
      selectTab('physical');
    };

    const power = document.createElement('button');
    power.className = 'btn';
    power.textContent = off ? 'Power On' : 'Power Off';
    power.onclick = async () => {
      await api('/api/devices/power', { id: d.id, on: off ? '1' : '0' });
      await refresh();
    };

    box.appendChild(img);
    box.appendChild(cap);
    box.appendChild(power);

    /* Modules are dragged from the tray into a slot; clicking a filled slot
       removes it (the server refuses while its ports are cabled). */
    const slots = d.slots || [];
    if (slots.length) {
      const list = document.createElement('div');
      list.className = 'dw-slots';
      slots.forEach((mod, i) => {
        const row = document.createElement('div');
        row.className = 'slot' + (mod ? ' filled' : '');
        row.textContent = mod ? `Slot ${i}: ${mod} (click to remove)` : `Slot ${i}: empty`;
        row.title = mod ? 'Remove module' : 'Drop a module here';
        if (mod) {
          row.onclick = async () => {
            const r = await api('/api/devices/module', { id: d.id, slot: i, model: '' });
            if (!r.error) await refresh();
          };
        }
        row.addEventListener('dragover', (e) => { e.preventDefault(); row.classList.add('over'); });
        row.addEventListener('dragleave', () => row.classList.remove('over'));
        row.addEventListener('drop', async (e) => {
          e.preventDefault();
          row.classList.remove('over');
          const model = e.dataTransfer.getData('text/plain');
          if (!model) return;
          const r = await api('/api/devices/module', { id: d.id, slot: i, model });
          if (!r.error) await refresh();
        });
        list.appendChild(row);
      });

      const tray = document.createElement('div');
      tray.className = 'dw-tray';
      for (const model of ['HWIC-2T', 'NM-2FE2W']) {
        const card = document.createElement('div');
        card.className = 'mod';
        card.textContent = model;
        card.draggable = true;
        card.title = 'Drag into a slot';
        card.addEventListener('dragstart', (e) => e.dataTransfer.setData('text/plain', model));
        tray.appendChild(card);
      }
      box.appendChild(list);
      box.appendChild(tray);
    }

    pane.appendChild(box);
    return;
  }

  if (name === 'config') {
    const box = document.createElement('div');
    box.className = 'dw-config';
    box.innerHTML = `
      <fieldset class="ip-group"><legend>Global Settings</legend>
        <label class="ipfield"><span>Display Name</span><input id="cfg-name" value=""></label>
        <label class="ipfield"><span>Default Gateway</span><input id="cfg-gw" value="" readonly></label>
        <label class="ipfield"><span>DNS Server</span><input id="cfg-dns" value="" readonly></label>
        <div class="ip-actions"><button class="btn" id="cfg-apply">Apply</button>
        <span id="cfg-note" class="meta"></span></div>
      </fieldset>`;
    pane.appendChild(box);
    document.getElementById('cfg-name').value = d.name;
    document.getElementById('cfg-gw').value = d.gateway || '0.0.0.0';
    document.getElementById('cfg-dns').value = d.dns || '0.0.0.0';
    document.getElementById('cfg-apply').onclick = async () => {
      const name = document.getElementById('cfg-name').value.trim();
      if (!name) return;
      const r = await api('/api/devices/rename', { id: d.id, name });
      if (!r.error) {
        document.getElementById('cfg-note').textContent = 'Saved';
        document.getElementById('dw-name').textContent = name;
        dwDevice = data.devices.find((x) => x.id === d.id) || d;
      } else {
        document.getElementById('cfg-note').textContent = r.error;
      }
    };
    return;
  }

  if (name === 'services') {
    const box = document.createElement('div');
    box.className = 'dw-services';
    const refresh = async () => {
      dwDevice = (data.devices || []).find((x) => x.id === d.id) || d;
      selectTab('services');
    };

    /* Routers own the DHCP relay configuration. */
    if (d.kind === 'router') {
      const relayBox = document.createElement('fieldset');
      relayBox.className = 'ip-group';
      const legend = document.createElement('legend');
      legend.textContent = 'DHCP Relay (ip helper-address)';
      relayBox.appendChild(legend);

      const list = document.createElement('div');
      list.className = 'dns-list';
      for (const h of d.helpers || []) {
        const row = document.createElement('div');
        row.className = 'dns-row';
        const label = document.createElement('span');
        label.textContent = `${h.iface} → ${h.address}`;
        const del = document.createElement('button');
        del.className = 'btn';
        del.textContent = 'Remove';
        del.onclick = async () => {
          const r = await api('/api/devices/dhcp/helper', {
            id: d.id,
            iface: h.iface,
            helper: '',
          });
          if (!r.error) await refresh();
        };
        row.appendChild(label);
        row.appendChild(del);
        list.appendChild(row);
      }
      if (!(d.helpers || []).length) {
        const empty = document.createElement('div');
        empty.className = 'meta';
        empty.textContent = 'No helper addresses';
        list.appendChild(empty);
      }
      relayBox.appendChild(list);

      const add = document.createElement('div');
      add.className = 'dns-row';
      const ifaceInput = document.createElement('input');
      ifaceInput.placeholder = 'GigabitEthernet0/0';
      ifaceInput.spellcheck = false;
      const helperInput = document.createElement('input');
      helperInput.placeholder = '192.168.2.20';
      helperInput.spellcheck = false;
      const addBtn = document.createElement('button');
      addBtn.className = 'btn';
      addBtn.textContent = 'Add';
      addBtn.onclick = async () => {
        const r = await api('/api/devices/dhcp/helper', {
          id: d.id,
          iface: ifaceInput.value.trim(),
          helper: helperInput.value.trim(),
        });
        if (!r.error) await refresh();
      };
      add.appendChild(ifaceInput);
      add.appendChild(helperInput);
      add.appendChild(addBtn);
      relayBox.appendChild(add);
      box.appendChild(relayBox);
      /* Syslog and NTP are client features every device carries. */
      box.appendChild(syslogSection(d));
      box.appendChild(ntpSection(d));
      pane.appendChild(box);
      return;
    }

    if (d.kind !== 'server') {
      box.appendChild(syslogSection(d));
      box.appendChild(ntpSection(d));
      pane.appendChild(box);
      return;
    }

    const dnsBox = document.createElement('fieldset');
    dnsBox.className = 'ip-group';
    const dnsLegend = document.createElement('legend');
    dnsLegend.textContent = 'DNS Records';
    dnsBox.appendChild(dnsLegend);
    const rows = document.createElement('div');
    rows.className = 'dns-list';
    for (const rec of d.dnsRecords || []) {
      const row = document.createElement('div');
      row.className = 'dns-row';
      const label = document.createElement('span');
      label.textContent = `${rec.name} → ${rec.address}`;
      const del = document.createElement('button');
      del.className = 'btn';
      del.textContent = 'Remove';
      del.onclick = async () => {
        const r = await api('/api/devices/dns', { id: d.id, name: rec.name, remove: '1' });
        if (!r.error) await refresh();
      };
      row.appendChild(label);
      row.appendChild(del);
      rows.appendChild(row);
    }
    if (!(d.dnsRecords || []).length) {
      const empty = document.createElement('div');
      empty.className = 'meta';
      empty.textContent = 'No records';
      rows.appendChild(empty);
    }
    dnsBox.appendChild(rows);

    const add = document.createElement('div');
    add.className = 'dns-row';
    const nameInput = document.createElement('input');
    nameInput.placeholder = 'web.lab';
    nameInput.spellcheck = false;
    const ipInput = document.createElement('input');
    ipInput.placeholder = '192.168.2.20';
    ipInput.spellcheck = false;
    const addBtn = document.createElement('button');
    addBtn.className = 'btn';
    addBtn.textContent = 'Add';
    addBtn.onclick = async () => {
      const r = await api('/api/devices/dns', {
        id: d.id,
        name: nameInput.value.trim(),
        ip: ipInput.value.trim(),
      });
      if (!r.error) await refresh();
    };
    add.appendChild(nameInput);
    add.appendChild(ipInput);
    add.appendChild(addBtn);
    dnsBox.appendChild(add);

    const httpBox = document.createElement('fieldset');
    httpBox.className = 'ip-group';
    const httpLegend = document.createElement('legend');
    httpLegend.textContent = 'HTTP Page';
    httpBox.appendChild(httpLegend);
    const area = document.createElement('textarea');
    area.className = 'http-page';
    area.rows = 5;
    area.value = d.httpPage || '';
    area.placeholder = 'Leave empty for the default welcome page';
    const save = document.createElement('button');
    save.className = 'btn';
    save.textContent = 'Save Page';
    save.onclick = async () => {
      const r = await api('/api/devices/http', { id: d.id, body: area.value });
      if (!r.error) {
        const note = document.createElement('span');
        note.className = 'meta';
        note.textContent = ' Saved';
        httpBox.appendChild(note);
      }
    };
    httpBox.appendChild(area);
    httpBox.appendChild(save);

    /* Static leases: a client always receives the address pinned here. */
    const resBox = document.createElement('fieldset');
    resBox.className = 'ip-group';
    const resLegend = document.createElement('legend');
    resLegend.textContent = 'DHCP Reservations';
    resBox.appendChild(resLegend);
    const resList = document.createElement('div');
    resList.className = 'dns-list';
    const nameOf = (id) => (data.devices.find((x) => x.id === id) || {}).name || id;
    for (const r of d.reservations || []) {
      const row = document.createElement('div');
      row.className = 'dns-row';
      const label = document.createElement('span');
      label.textContent = `${nameOf(r.client)} → ${r.address}`;
      const del = document.createElement('button');
      del.className = 'btn';
      del.textContent = 'Remove';
      del.onclick = async () => {
        const res = await api('/api/devices/dhcp/reserve', {
          id: d.id,
          client: r.client,
          ip: '',
        });
        if (!res.error) await refresh();
      };
      row.appendChild(label);
      row.appendChild(del);
      resList.appendChild(row);
    }
    if (!(d.reservations || []).length) {
      const empty = document.createElement('div');
      empty.className = 'meta';
      empty.textContent = 'No reservations';
      resList.appendChild(empty);
    }
    resBox.appendChild(resList);

    const resAdd = document.createElement('div');
    resAdd.className = 'dns-row';
    const clientSel = document.createElement('select');
    for (const dev of data.devices.filter(
      (x) => x.id !== d.id && x.kind !== 'switch' && x.kind !== 'hub' && x.kind !== 'router',
    )) {
      const opt = document.createElement('option');
      opt.value = dev.id;
      opt.textContent = dev.name;
      clientSel.appendChild(opt);
    }
    const resIp = document.createElement('input');
    resIp.placeholder = '192.168.2.150';
    resIp.spellcheck = false;
    const resBtn = document.createElement('button');
    resBtn.className = 'btn';
    resBtn.textContent = 'Reserve';
    resBtn.onclick = async () => {
      const res = await api('/api/devices/dhcp/reserve', {
        id: d.id,
        client: clientSel.value,
        ip: resIp.value.trim(),
      });
      if (!res.error) await refresh();
    };
    resAdd.appendChild(clientSel);
    resAdd.appendChild(resIp);
    resAdd.appendChild(resBtn);
    resBox.appendChild(resAdd);

    /* Mailbox accounts live on the server; the workspace JSON never lists
       them, so this section only adds users. */
    const mailBox = document.createElement('fieldset');
    mailBox.className = 'ip-group';
    const mailLegend = document.createElement('legend');
    mailLegend.textContent = 'Mail Users';
    mailBox.appendChild(mailLegend);
    const mailNote = document.createElement('div');
    mailNote.className = 'meta';
    mailNote.textContent = 'Accounts are stored on this server. Existing users are not listed here.';
    mailBox.appendChild(mailNote);
    const mailStatus = document.createElement('div');
    mailStatus.className = 'meta';
    mailBox.appendChild(mailStatus);

    const mailAdd = document.createElement('div');
    mailAdd.className = 'dns-row';
    const mailUserInput = document.createElement('input');
    mailUserInput.placeholder = 'alice';
    mailUserInput.spellcheck = false;
    const mailPassInput = document.createElement('input');
    mailPassInput.type = 'password';
    mailPassInput.placeholder = 'password';
    mailPassInput.autocomplete = 'off';
    const mailAddBtn = document.createElement('button');
    mailAddBtn.className = 'btn';
    mailAddBtn.textContent = 'Add User';
    mailAddBtn.onclick = async () => {
      const user = mailUserInput.value.trim();
      const pass = mailPassInput.value;
      if (!user || !pass) {
        mailStatus.textContent = 'User and password are required';
        return;
      }
      const r = await api('/api/devices/mailuser', { id: d.id, user, pass });
      if (r.error) {
        mailStatus.textContent = r.error;
        return;
      }
      mailStatus.textContent = `Added user ${user}`;
      mailUserInput.value = '';
      mailPassInput.value = '';
    };
    mailAdd.appendChild(mailUserInput);
    mailAdd.appendChild(mailPassInput);
    mailAdd.appendChild(mailAddBtn);
    mailBox.appendChild(mailAdd);

    /* TFTP contents are not part of the workspace snapshot either; the list
       is fetched from the server each time this section is drawn. */
    const tftpBox = document.createElement('fieldset');
    tftpBox.className = 'ip-group';
    const tftpLegend = document.createElement('legend');
    tftpLegend.textContent = 'TFTP Files';
    tftpBox.appendChild(tftpLegend);

    const tftpList = document.createElement('div');
    tftpList.className = 'dns-list';
    tftpBox.appendChild(tftpList);
    const tftpNote = document.createElement('div');
    tftpNote.className = 'meta';
    tftpBox.appendChild(tftpNote);

    const loadFiles = async () => {
      tftpNote.textContent = 'Loading…';
      let r;
      try {
        r = await jsonRequest('/api/tftp/list', { id: d.id });
      } catch {
        r = { error: 'request failed' };
      }
      tftpList.replaceChildren();
      if (r.error) {
        tftpNote.textContent = r.error;
        return;
      }
      const files = r.files || [];
      for (const name of files) {
        const row = document.createElement('div');
        row.className = 'dns-row';
        const label = document.createElement('span');
        label.textContent = name;
        const del = document.createElement('button');
        del.className = 'btn';
        del.textContent = 'Remove';
        del.onclick = async () => {
          const res = await api('/api/devices/tftp', { id: d.id, name, content: '' });
          if (res.error) {
            tftpNote.textContent = res.error;
            return;
          }
          await loadFiles();
        };
        row.appendChild(label);
        row.appendChild(del);
        tftpList.appendChild(row);
      }
      if (!files.length) {
        const empty = document.createElement('div');
        empty.className = 'meta';
        empty.textContent = 'No files';
        tftpList.appendChild(empty);
      }
      tftpNote.textContent = files.length
        ? `${files.length} file${files.length === 1 ? '' : 's'}`
        : 'No files';
    };

    const tftpForm = document.createElement('div');
    tftpForm.className = 'tftp-form';
    const tftpName = document.createElement('input');
    tftpName.placeholder = 'config.txt';
    tftpName.spellcheck = false;
    const tftpContent = document.createElement('textarea');
    tftpContent.className = 'http-page';
    tftpContent.rows = 3;
    tftpContent.spellcheck = false;
    tftpContent.placeholder = 'File contents';
    const tftpAdd = document.createElement('button');
    tftpAdd.className = 'btn';
    tftpAdd.textContent = 'Add File';
    tftpAdd.onclick = async () => {
      const name = tftpName.value.trim();
      if (!name) {
        tftpNote.textContent = 'File name is required';
        return;
      }
      if (!tftpContent.value) {
        tftpNote.textContent = 'File contents are required';
        return;
      }
      const r = await api('/api/devices/tftp', {
        id: d.id,
        name,
        content: tftpContent.value,
      });
      if (r.error) {
        tftpNote.textContent = r.error;
        return;
      }
      tftpName.value = '';
      tftpContent.value = '';
      await loadFiles();
    };
    tftpForm.appendChild(tftpName);
    tftpForm.appendChild(tftpContent);
    tftpForm.appendChild(tftpAdd);
    tftpBox.appendChild(tftpForm);

    box.appendChild(resBox);
    box.appendChild(dnsBox);
    box.appendChild(httpBox);
    box.appendChild(mailBox);
    box.appendChild(tftpBox);
    box.appendChild(ftpSection(d));
    box.appendChild(aaaSection(d));
    box.appendChild(syslogSection(d));
    box.appendChild(ntpSection(d));
    pane.appendChild(box);
    loadFiles();
    return;
  }

  const msg = document.createElement('div');
  msg.className = 'dw-muted';
  msg.textContent = name === 'programming'
    ? 'Programming is not available for this device model.'
    : 'No attributes to configure for this device model.';
  pane.appendChild(msg);
}

/* ---------------- command prompt ---------------- */
let cmdDevice = null;
/* Set while the prompt is inside a telnet session to a router/switch. */
let telnetPeer = null;
let telnetPrompt = '';

/* Every command runs server-side against the same topology the packet engine
   forwards through, so `ping` and `tracert` produce real PDU events. */
async function cmdRequest(id, line) {
  const q = new URLSearchParams({ id, line }).toString();
  const res = await fetch(`/api/cmd?${q}`, { method: 'POST' });
  return res.json();
}

function openCmd(d) {
  cmdDevice = d;
  telnetPeer = null;
  telnetPrompt = '';
  const win = document.getElementById('cmd-window');
  const out = document.getElementById('cmd-out');
  const input = document.getElementById('cmd-in');
  out.textContent = 'Microsoft Windows XP [Version 5.1.2600]\n(C) Copyright 1985-2001 Microsoft Corp.\n\n';
  input.value = '';
  win.hidden = false;
  bringToFront(win);
  input.focus();
  document.getElementById('cmd-close').onclick = () => { win.hidden = true; };
  win.onclick = (e) => { if (e.target === win) win.hidden = true; };

  input.onkeydown = async (e) => {
    if (e.key !== 'Enter') return;
    const line = input.value;
    input.value = '';
    const verb = (line.trim().split(/\s+/)[0] || '').toLowerCase();

    if (verb === 'cls') { out.textContent = ''; return; }
    if (verb === 'exit') {
      if (telnetPeer) {
        const peer = telnetPeer;
        telnetPeer = null;
        telnetPrompt = '';
        cliRequest('/api/cli/reset', { id: peer }).catch(() => {});
        out.textContent += '\n';
        out.scrollTop = out.scrollHeight;
        return;
      }
      win.hidden = true;
      return;
    }

    /* Inside telnet every line is router CLI, like the real prompt. */
    if (telnetPeer) {
      out.textContent += `${line}\n`;
      out.scrollTop = out.scrollHeight;
      input.disabled = true;
      try {
        const r = await cliRequest('/api/cli', { id: telnetPeer, line });
        if (r.output) out.textContent += r.output.endsWith('\n') ? r.output : `${r.output}\n`;
        if (r.prompt) telnetPrompt = r.prompt;
        out.textContent += telnetPrompt;
      } catch {
        out.textContent += '% connection closed\n';
      }
      input.disabled = false;
      out.scrollTop = out.scrollHeight;
      input.focus();
      return;
    }

    out.textContent += `C:\\> ${line}\n`;
    out.scrollTop = out.scrollHeight;
    input.disabled = true;
    try {
      const r = await cmdRequest(d.id, line);
      out.textContent += r.output || '';
      if (r.peer) {
        telnetPeer = r.peer;
        const p = await cliRequest('/api/cli', { id: r.peer, line: '' });
        telnetPrompt = p.prompt || '>';
        out.textContent += telnetPrompt;
      }
    } catch {
      out.textContent += 'The system cannot find the path specified.\n\n';
    }
    input.disabled = false;
    out.scrollTop = out.scrollHeight;
    input.focus();
  };
}



/* ---------------- web browser ---------------- */
/* `/api/webfetch` answers with a page, not a workspace snapshot, so it must
   bypass `api()` (which would try to re-render the topology from it). */
async function jsonRequest(path, params) {
  const q = new URLSearchParams(params).toString();
  const res = await fetch(`${path}?${q}`, { method: 'POST' });
  return res.json();
}

function openBrowser(d) {
  const win = document.getElementById('web-dialog');
  const url = document.getElementById('web-url');
  const body = document.getElementById('web-body');
  const statusEl = document.getElementById('web-status');

  win.hidden = false;
  bringToFront(win);
  url.value = '';
  body.replaceChildren();
  statusEl.textContent = `${d.name} — type a server address`;
  document.getElementById('web-close').onclick = () => { win.hidden = true; };
  win.onclick = (e) => { if (e.target === win) win.hidden = true; };

  const renderError = (text) => {
    const p = document.createElement('p');
    p.className = 'err';
    p.textContent = text;
    body.replaceChildren(p);
  };

  const go = async () => {
    const target = url.value.trim();
    if (!target) return;
    statusEl.textContent = `Connecting to ${target}…`;
    const r = await jsonRequest('/api/webfetch', { id: d.id, url: target });
    if (r.error) {
      statusEl.textContent = `${d.name} → ${target}`;
      renderError(r.error);
      return;
    }
    statusEl.textContent = `${r.status} ${r.reason} — ${r.host}`;
    body.replaceChildren();
    const h = document.createElement('h2');
    h.textContent = r.title;
    const p = document.createElement('p');
    p.textContent = r.text;
    body.appendChild(h);
    body.appendChild(p);
    sfx('popUp');
  };

  document.getElementById('web-go').onclick = go;
  url.onkeydown = (e) => { if (e.key === 'Enter') go(); };
  url.focus();
}

/* ---------------- text editor ---------------- */
/* Notes are per device and live in this browser only: the key is exactly
   `pt-web:editor:<device id>`, written on Save and read again on open. */
function editorKey(id) { return `pt-web:editor:${id}`; }

function openEditor(d) {
  const win = document.getElementById('editor-dialog');
  const area = document.getElementById('editor-text');
  const note = document.getElementById('editor-status');
  document.getElementById('editor-title').textContent = `Text Editor — ${d.name}`;

  let saved = '';
  try { saved = localStorage.getItem(editorKey(d.id)) || ''; } catch { /* storage blocked */ }
  area.value = saved;
  note.textContent = saved
    ? `Restored ${saved.length} characters for ${d.name}`
    : 'No saved text yet';

  document.getElementById('editor-save').onclick = () => {
    try {
      localStorage.setItem(editorKey(d.id), area.value);
      note.textContent = `Saved ${area.value.length} characters for ${d.name}`;
      sfx('popUp');
    } catch {
      note.textContent = 'Local storage is unavailable — the text was not saved';
    }
  };
  document.getElementById('editor-close').onclick = () => { win.hidden = true; };
  win.onclick = (e) => { if (e.target === win) win.hidden = true; };

  win.hidden = false;
  bringToFront(win);
  area.focus();
}

/* ---------------- email ---------------- */
/* The server field takes an address; the endpoints address servers by device
   id, so the typed value is resolved against the workspace first. */
function mailConfigKey(id) { return `pt-web:mail:${id}`; }

function openMail(d) {
  const win = document.getElementById('mail-dialog');
  const serverInput = document.getElementById('mail-server');
  const userInput = document.getElementById('mail-user');
  const passInput = document.getElementById('mail-pass');
  const accountNote = document.getElementById('mail-account-note');
  const inbox = document.getElementById('mail-inbox');
  const inboxNote = document.getElementById('mail-inbox-note');
  const toInput = document.getElementById('mail-to');
  const subjectInput = document.getElementById('mail-subject');
  const textInput = document.getElementById('mail-text');
  const mailNote = document.getElementById('mail-note');
  const fromNote = document.getElementById('mail-from');

  document.getElementById('mail-title').textContent = `Email — ${d.name}`;

  let saved = {};
  try { saved = JSON.parse(localStorage.getItem(mailConfigKey(d.id)) || '{}') || {}; } catch { /* storage blocked */ }
  serverInput.value = saved.server || (d.kind === 'server' ? d.ip || '' : '');
  userInput.value = saved.user || '';
  passInput.value = '';
  toInput.value = '';
  subjectInput.value = '';
  textInput.value = '';
  accountNote.textContent = '';
  inboxNote.textContent = '';
  mailNote.textContent = '';
  inbox.replaceChildren();
  const showFrom = () => { fromNote.textContent = userInput.value.trim() || '—'; };
  showFrom();

  const remember = () => {
    try {
      localStorage.setItem(mailConfigKey(d.id), JSON.stringify({
        server: serverInput.value.trim(),
        user: userInput.value.trim(),
      }));
    } catch { /* storage blocked */ }
  };

  /* Only server devices host a mailbox, so a typo cannot silently point the
     account at a PC. */
  const serverFor = (typed) => {
    const q = typed.trim().toLowerCase();
    if (!q) return null;
    const list = ((data && data.devices) || []).filter((x) => x.kind === 'server');
    return list.find((x) => (x.ip || '').toLowerCase() === q)
      || list.find((x) => x.name.toLowerCase() === q)
      || list.find((x) => x.id === q)
      || null;
  };

  const refreshInbox = async () => {
    const server = serverFor(serverInput.value);
    const user = userInput.value.trim();
    if (!server) {
      inboxNote.textContent = serverInput.value.trim()
        ? 'No server matches that address'
        : 'Enter the mail server address';
      return;
    }
    if (!user) {
      inboxNote.textContent = 'Enter a user name';
      return;
    }
    inboxNote.textContent = 'Loading…';
    let r;
    try {
      r = await jsonRequest('/api/mail/list', { id: server.id, user });
    } catch {
      r = { error: 'request failed' };
    }
    if (r.error) {
      inboxNote.textContent = r.error;
      return;
    }
    const messages = r.messages || [];
    inbox.replaceChildren();
    for (const m of messages) {
      const msg = document.createElement('details');
      msg.className = 'mail-msg';
      const head = document.createElement('summary');
      const subject = document.createElement('span');
      subject.className = 'mail-msg-subject';
      subject.textContent = m.read ? m.subject : `● ${m.subject}`;
      const meta = document.createElement('span');
      meta.className = 'mail-msg-meta';
      meta.textContent = `${m.from} → ${m.to}`;
      head.appendChild(subject);
      head.appendChild(meta);
      const body = document.createElement('pre');
      body.className = 'mail-msg-body';
      body.textContent = m.body;
      msg.appendChild(head);
      msg.appendChild(body);
      inbox.appendChild(msg);
    }
    if (!messages.length) {
      const empty = document.createElement('div');
      empty.className = 'meta';
      empty.textContent = 'Inbox empty';
      inbox.appendChild(empty);
    }
    inboxNote.textContent = `${messages.length} message${messages.length === 1 ? '' : 's'} for ${user}`;
  };

  document.getElementById('mail-create').onclick = async () => {
    const server = serverFor(serverInput.value);
    const user = userInput.value.trim();
    const pass = passInput.value;
    if (!server) {
      accountNote.textContent = serverInput.value.trim()
        ? 'No server matches that address'
        : 'Enter the mail server address';
      return;
    }
    if (!user || !pass) {
      accountNote.textContent = 'User and password are required';
      return;
    }
    accountNote.textContent = 'Creating…';
    const r = await api('/api/devices/mailuser', { id: server.id, user, pass });
    if (r.error) {
      accountNote.textContent = r.error;
      return;
    }
    remember();
    accountNote.textContent = `Mailbox ${user} created on ${server.name}`;
    passInput.value = '';
    sfx('popUp');
  };

  document.getElementById('mail-refresh').onclick = refreshInbox;

  document.getElementById('mail-send').onclick = async () => {
    const server = serverFor(serverInput.value);
    const user = userInput.value.trim();
    const to = toInput.value.trim();
    if (!server) {
      mailNote.textContent = serverInput.value.trim()
        ? 'No server matches that address'
        : 'Enter the mail server address';
      return;
    }
    if (!user) {
      mailNote.textContent = 'Enter a user name';
      return;
    }
    if (!to) {
      mailNote.textContent = 'Recipient is required';
      return;
    }
    mailNote.textContent = 'Sending…';
    const r = await api('/api/mail/send', {
      id: d.id,
      server: server.id,
      from: user,
      to,
      subject: subjectInput.value,
      body: textInput.value,
    });
    if (r.error) {
      mailNote.textContent = r.error;
      return;
    }
    remember();
    sfx('popUp');
    mailNote.textContent = `Sent to ${to}`;
    subjectInput.value = '';
    textInput.value = '';
    await refreshInbox();
  };

  /* The list belongs to the account it was fetched for. */
  const resetInbox = () => { inbox.replaceChildren(); inboxNote.textContent = ''; };
  serverInput.oninput = () => { remember(); resetInbox(); };
  userInput.oninput = () => { remember(); showFrom(); resetInbox(); };

  document.getElementById('mail-close').onclick = () => { win.hidden = true; };
  win.onclick = (e) => { if (e.target === win) win.hidden = true; };

  win.hidden = false;
  bringToFront(win);
  serverInput.focus();
  if (userInput.value.trim() && serverFor(serverInput.value)) refreshInbox();
}

/* ---------------- traffic generator ---------------- */
const HOST_KINDS = new Set(['pc', 'laptop', 'server', 'tablet', 'pda']);

/* The form starts on the first host address in the workspace, preferring one
   that is not the device the window was opened from. */
function defaultTrafficIp(source) {
  const devices = (data && data.devices) || [];
  const hosts = devices.filter((d) => HOST_KINDS.has(d.kind) && d.ip);
  const host = hosts.find((d) => d.id !== (source && source.id)) || hosts[0];
  const any = devices.find((d) => d.ip);
  return (host || any || {}).ip || '';
}

function deviceByIp(ip) {
  return ((data && data.devices) || []).find((d) => d.ip === ip) || null;
}

/* Every Start invalidates the previous run, including one left behind by a
   window that was closed or reopened mid-run. */
let trafficGen = 0;

function openTraffic(d) {
  const win = document.getElementById('traffic-dialog');
  const ipInput = document.getElementById('traffic-ip');
  const countInput = document.getElementById('traffic-count');
  const intervalInput = document.getElementById('traffic-interval');
  const startBtn = document.getElementById('traffic-start');
  const stopBtn = document.getElementById('traffic-stop');
  const sentEl = document.getElementById('traffic-sent');
  const receivedEl = document.getElementById('traffic-received');
  const lostEl = document.getElementById('traffic-lost');
  const note = document.getElementById('traffic-note');
  const log = document.getElementById('traffic-log');

  document.getElementById('traffic-title').textContent = `Traffic Generator — ${d.name}`;
  /* A run left behind by an earlier window must not keep writing to the
     shared controls. */
  trafficGen += 1;
  ipInput.value = defaultTrafficIp(d);
  countInput.value = '4';
  intervalInput.value = '200';
  log.textContent = '';
  let sent = 0;
  let received = 0;
  let running = false;

  const showCounters = () => {
    sentEl.textContent = String(sent);
    receivedEl.textContent = String(received);
    lostEl.textContent = String(sent - received);
  };
  const showRoute = () => {
    const ip = ipInput.value.trim();
    const target = deviceByIp(ip);
    note.textContent = target
      ? `${d.name} → ${target.name} (${ip}) — one /api/pdu delivery per packet`
      : `${d.name} → ${ip || '(no address)'} — one ping through /api/cmd per packet`;
  };
  const setRunning = (on) => {
    running = on;
    startBtn.disabled = on;
    stopBtn.disabled = !on;
    ipInput.disabled = on;
    countInput.disabled = on;
    intervalInput.disabled = on;
  };

  /* One packet through the same engine the canvas forwards with. An address
     that belongs to a device is delivered by id; anything else runs the
     command prompt's real ping so the engine resolves and records it. */
  const sendOne = async (ip) => {
    const target = deviceByIp(ip);
    if (target && target.id !== d.id) {
      let r;
      try { r = await jsonRequest('/api/pdu', { src: d.id, dst: target.id }); }
      catch { return false; }
      if (r.error) return false;
      setData(r);
      return true;
    }
    try {
      const r = await cmdRequest(d.id, `ping ${ip}`);
      const m = /Received = (\d+)/.exec(r.output || '');
      const fresh = await getJson('/api/workspace');
      if (fresh && fresh.devices) setData(fresh);
      return !!(m && Number(m[1]) > 0);
    } catch {
      return false;
    }
  };

  const start = async () => {
    if (running) return;
    const ip = ipInput.value.trim();
    if (!/^\d{1,3}(\.\d{1,3}){3}$/.test(ip)) {
      note.textContent = `Enter a valid IPv4 address, not "${ip}"`;
      return;
    }
    const total = Math.max(1, Math.min(200, Math.floor(Number(countInput.value) || 1)));
    const gap = Math.max(0, Math.min(60000, Math.floor(Number(intervalInput.value) || 0)));
    countInput.value = String(total);
    intervalInput.value = String(gap);
    sent = 0;
    received = 0;
    showCounters();
    log.textContent = '';
    setRunning(true);
    const run = ++trafficGen;
    for (let i = 0; i < total; i++) {
      if (run !== trafficGen) break;
      const ok = await sendOne(ip);
      if (run !== trafficGen) break;
      sent += 1;
      if (ok) received += 1;
      showCounters();
      log.textContent += `#${sent} ping ${ip} — ${ok ? 'reply' : 'timeout'}\n`;
      log.scrollTop = log.scrollHeight;
      if (i < total - 1 && gap > 0) {
        await new Promise((resolve) => setTimeout(resolve, gap));
      }
    }
    if (run === trafficGen) {
      setRunning(false);
      note.textContent = `Finished — ${sent} sent, ${received} received, ${sent - received} lost`;
    }
  };

  const close = () => {
    if (running) {
      trafficGen += 1;
      setRunning(false);
    }
    win.hidden = true;
  };

  ipInput.oninput = showRoute;
  startBtn.onclick = start;
  stopBtn.onclick = () => {
    if (!running) return;
    trafficGen += 1;
    setRunning(false);
    note.textContent = `Stopped — ${sent} of ${countInput.value} packets sent`;
  };
  document.getElementById('traffic-close').onclick = close;
  win.onclick = (e) => { if (e.target === win) close(); };

  showCounters();
  showRoute();
  setRunning(false);
  win.hidden = false;
  bringToFront(win);
  ipInput.focus();
}

/* ---------------- MIB browser ---------------- */
/* There is no SNMP agent to query, so the browser labels itself as the local
   device table: devices come from /api/workspace and the selected row's
   interface count comes from /api/devices/ports. No OIDs are invented. */
let mibSelected = null;

function openMib(d) {
  const win = document.getElementById('mib-dialog');
  const tbody = document.querySelector('#mib-table tbody');
  const detail = document.getElementById('mib-detail');
  const devices = (data && data.devices) || [];

  document.getElementById('mib-title').textContent = `MIB Browser — ${d.name}`;
  tbody.replaceChildren();
  detail.textContent = 'Select a row to read its interface table.';
  mibSelected = null;

  const rows = new Map();
  const readPorts = async (dev) => {
    mibSelected = dev.id;
    for (const [id, tr] of rows) {
      tr.classList.toggle('selected', id === dev.id);
      if (id !== dev.id) tr.querySelector('.mib-ports').textContent = '—';
    }
    detail.textContent = `Reading /api/devices/ports for ${dev.name}…`;
    const r = await getJson(`/api/devices/ports?id=${encodeURIComponent(dev.id)}`);
    if (mibSelected !== dev.id) return;
    const ports = Array.isArray(r.ports) ? r.ports : [];
    const row = rows.get(dev.id);
    if (row) row.querySelector('.mib-ports').textContent = String(ports.length);
    if (!ports.length) {
      detail.textContent = `${dev.name} — no interfaces reported`;
      return;
    }
    const head = document.createElement('div');
    head.className = 'mib-detail-head';
    head.textContent = `${dev.name} — ${ports.length} interface${ports.length === 1 ? '' : 's'}`;
    const list = document.createElement('ul');
    list.className = 'mib-port-list';
    for (const p of ports) {
      const li = document.createElement('li');
      const addr = p.ip ? ` · ${p.ip}/${p.prefix}` : '';
      li.textContent = `${p.name} · ${p.up ? 'up' : 'down'}${addr}`;
      list.appendChild(li);
    }
    detail.replaceChildren(head, list);
  };

  for (const dev of devices) {
    const tr = document.createElement('tr');
    for (const text of [dev.name, dev.model, dev.kind, dev.ip || '—']) {
      const td = document.createElement('td');
      td.textContent = text;
      tr.appendChild(td);
    }
    const ports = document.createElement('td');
    ports.className = 'mib-ports';
    ports.textContent = '—';
    tr.appendChild(ports);
    tr.title = `Read interfaces for ${dev.name}`;
    tr.onclick = () => readPorts(dev);
    tbody.appendChild(tr);
    rows.set(dev.id, tr);
  }

  document.getElementById('mib-close').onclick = () => { win.hidden = true; };
  win.onclick = (e) => { if (e.target === win) win.hidden = true; };
  win.hidden = false;
  bringToFront(win);

  const initial = rows.has(d.id) ? d : devices[0];
  if (initial) readPorts(initial);
}

/* ---------------- PC Wireless ---------------- */
/* `/api/wifi/scan` and the status endpoints answer with their own shapes, so
   they use jsonRequest() rather than api(), which expects a workspace snapshot. */
async function wifiStatus(id) {
  try {
    return await jsonRequest('/api/wifi/status', { id });
  } catch {
    return { error: 'request failed' };
  }
}

function openWifi(d) {
  const $ = (id) => document.getElementById(id);
  const win = $('wifi-dialog');
  const isWlc = d.kind === 'wlc';
  const statusLine = $('wifi-status');
  const note = $('wifi-note');

  $('wifi-title').textContent = isWlc
    ? `Wireless LAN Controller — ${d.name}`
    : `PC Wireless — ${d.name}`;
  $('wifi-client').hidden = isWlc;
  $('wifi-wlan-group').hidden = !isWlc;
  note.textContent = '';
  $('wifi-scan-note').textContent = '';
  $('wifi-psk').value = '';
  $('wifi-wlan-note').textContent = '';
  $('wifi-wlan-ssid').value = '';
  $('wifi-wlan-psk').value = '';
  $('wifi-wlan-list').replaceChildren();

  win.hidden = false;
  bringToFront(win);
  $('wifi-close').onclick = () => { win.hidden = true; };
  win.onclick = (e) => { if (e.target === win) win.hidden = true; };

  if (isWlc) {
    /* A controller lists the WLANs it advertises and accepts new ones; the
       workspace refuses a PSK shorter than eight characters. */
    const load = async () => {
      let r;
      try { r = await jsonRequest('/api/wifi/wlans', { id: d.id }); }
      catch { r = { error: 'request failed' }; }
      const list = $('wifi-wlan-list');
      list.replaceChildren();
      if (r.error) { note.textContent = r.error; return; }
      const wlans = Array.isArray(r.wlans) ? r.wlans : [];
      for (const w of wlans) {
        const row = document.createElement('div');
        row.className = 'wifi-row';
        const name = document.createElement('span');
        name.textContent = w.ssid;
        const sec = document.createElement('span');
        sec.className = 'sec';
        sec.textContent = w.security;
        row.appendChild(name);
        row.appendChild(sec);
        list.appendChild(row);
      }
      if (!wlans.length) {
        const empty = document.createElement('div');
        empty.className = 'meta';
        empty.textContent = 'No WLANs configured';
        list.appendChild(empty);
      }
      note.textContent = `${wlans.length} WLAN${wlans.length === 1 ? '' : 's'}`;
    };

    $('wifi-wlan-add').onclick = async () => {
      const ssid = $('wifi-wlan-ssid').value.trim();
      const pass = $('wifi-wlan-psk').value;
      if (!ssid) { $('wifi-wlan-note').textContent = 'SSID is required'; return; }
      if (pass.length < 8) {
        $('wifi-wlan-note').textContent = 'WPA2-PSK needs at least 8 characters';
        return;
      }
      const r = await api('/api/wifi/wlan', { id: d.id, ssid, pass });
      if (r.error) { $('wifi-wlan-note').textContent = r.error; return; }
      $('wifi-wlan-ssid').value = '';
      $('wifi-wlan-psk').value = '';
      $('wifi-wlan-note').textContent = `Added ${ssid}`;
      await load();
    };
    load();
    return;
  }

  /* Client view: scan what the controllers advertise, join with the PSK, and
     read the association the workspace holds for this device. */
  const refreshStatus = async () => {
    const r = await wifiStatus(d.id);
    if (r.error) {
      statusLine.textContent = 'Status unavailable';
      statusLine.classList.remove('ok');
      statusLine.classList.add('off');
      return;
    }
    if (r.associated) {
      statusLine.textContent = `Associated with ${r.ssid}${r.wlc ? ` via ${r.wlc}` : ''}`;
      statusLine.classList.add('ok');
      statusLine.classList.remove('off');
    } else {
      statusLine.textContent = 'Not associated';
      statusLine.classList.remove('ok');
      statusLine.classList.add('off');
    }
  };

  const scan = async () => {
    $('wifi-scan-note').textContent = 'Scanning…';
    let r;
    try { r = await jsonRequest('/api/wifi/scan', { id: d.id }); }
    catch { r = { error: 'request failed' }; }
    const select = $('wifi-ssid');
    select.replaceChildren();
    if (r.error) {
      $('wifi-scan-note').textContent = r.error;
      return;
    }
    const ssids = Array.isArray(r.ssids) ? r.ssids : [];
    for (const s of ssids) {
      const opt = document.createElement('option');
      opt.value = s.ssid;
      opt.textContent = `${s.ssid} — ${s.security}`;
      select.appendChild(opt);
    }
    if (!ssids.length) {
      const opt = document.createElement('option');
      opt.value = '';
      opt.textContent = 'No wireless networks found';
      select.appendChild(opt);
    }
    $('wifi-scan-note').textContent =
      `${ssids.length} network${ssids.length === 1 ? '' : 's'} visible`;
  };

  $('wifi-scan').onclick = () => scan();
  $('wifi-connect').onclick = async () => {
    const ssid = $('wifi-ssid').value;
    if (!ssid) { note.textContent = 'Scan and select a network first'; return; }
    note.textContent = `Joining ${ssid}…`;
    const r = await api('/api/wifi/join', {
      id: d.id,
      ssid,
      pass: $('wifi-psk').value,
      user: $('wifi-user') ? $('wifi-user').value : '',
    });
    if (r.error) { note.textContent = r.error; return; }
    $('wifi-psk').value = '';
    if ($('wifi-user')) $('wifi-user').value = '';
    note.textContent = `Joined ${ssid}`;
    await refreshStatus();
  };

  $('wifi-disconnect').onclick = async () => {
    $('wifi-psk').value = '';
    const r = await api('/api/wifi/disconnect', { id: d.id });
    note.textContent = r.error ? r.error : 'Disconnected';
    await refreshStatus();
  };

  scan();
  refreshStatus();
}

/* ---------------- VPN client ---------------- */
function openVpn(d) {
  const $ = (id) => document.getElementById(id);
  const win = $('vpn-dialog');
  const statusLine = $('vpn-status');
  const note = $('vpn-note');
  let last = { server: '', user: '' };

  $('vpn-title').textContent = `VPN — ${d.name}`;
  $('vpn-server').value = '';
  $('vpn-user').value = '';
  note.textContent = '';
  win.hidden = false;
  bringToFront(win);
  $('vpn-close').onclick = () => { win.hidden = true; };
  win.onclick = (e) => { if (e.target === win) win.hidden = true; };

  const refresh = async () => {
    let r;
    try { r = await jsonRequest('/api/vpn/status', { id: d.id }); }
    catch { r = { error: 'request failed' }; }
    if (r.error) { statusLine.textContent = 'Status unavailable'; return; }
    if (r.connected) {
      last = { server: r.server || '', user: r.user || '' };
      statusLine.textContent = `Connected to ${last.server} as ${last.user}`;
      statusLine.classList.add('ok');
      if (!$('vpn-server').value) $('vpn-server').value = last.server;
      if (!$('vpn-user').value) $('vpn-user').value = last.user;
    } else {
      statusLine.textContent = 'Not connected';
      statusLine.classList.remove('ok');
    }
  };

  $('vpn-connect').onclick = async () => {
    const server = $('vpn-server').value.trim();
    const user = $('vpn-user').value.trim();
    if (!server || !user) {
      note.textContent = 'Server and user name are required';
      return;
    }
    note.textContent = `Connecting to ${server}…`;
    const r = await api('/api/vpn/config', { id: d.id, server, user });
    if (r.error) { note.textContent = r.error; return; }
    last = { server, user };
    note.textContent = '';
    await refresh();
  };

  $('vpn-disconnect').onclick = () => {
    /* No delete endpoint exists: clear the form, keep the last configuration
       in the status line, and mark the client disconnected. */
    $('vpn-server').value = '';
    $('vpn-user').value = '';
    statusLine.textContent = last.server
      ? `Disconnected — last configuration ${last.server} / ${last.user}`
      : 'Disconnected';
    statusLine.classList.remove('ok');
    note.textContent = 'No delete endpoint: the workspace keeps the last VPN configuration.';
  };

  refresh();
}

/* ---------------- PPPoE dialer ---------------- */
function openPppoe(d) {
  const $ = (id) => document.getElementById(id);
  const win = $('pppoe-dialog');
  const statusLine = $('pppoe-status');
  const note = $('pppoe-note');

  $('pppoe-title').textContent = `PPPoE Dialer — ${d.name}`;
  $('pppoe-server').value = '';
  $('pppoe-user').value = '';
  note.textContent = '';
  win.hidden = false;
  bringToFront(win);
  $('pppoe-close').onclick = () => { win.hidden = true; };
  win.onclick = (e) => { if (e.target === win) win.hidden = true; };

  const refresh = async () => {
    let r;
    try { r = await jsonRequest('/api/pppoe/status', { id: d.id }); }
    catch { r = { error: 'request failed' }; }
    if (r.error) { statusLine.textContent = 'Status unavailable'; return; }
    if (r.connected) {
      statusLine.textContent = `Connected to ${r.server} as ${r.user}`;
      statusLine.classList.add('ok');
      if (!$('pppoe-server').value) $('pppoe-server').value = r.server || '';
      if (!$('pppoe-user').value) $('pppoe-user').value = r.user || '';
    } else {
      statusLine.textContent = 'Not connected';
      statusLine.classList.remove('ok');
    }
  };

  $('pppoe-dial').onclick = async () => {
    const server = $('pppoe-server').value.trim();
    const user = $('pppoe-user').value.trim();
    if (!server || !user) {
      note.textContent = 'Server and user name are required';
      return;
    }
    note.textContent = `Dialing ${server}…`;
    const r = await api('/api/pppoe/config', { id: d.id, server, user });
    if (r.error) { note.textContent = r.error; return; }
    note.textContent = '';
    await refresh();
  };

  refresh();
}

/* ---------------- Cisco IP Communicator ---------------- */
function openPhone(d) {
  const $ = (id) => document.getElementById(id);
  const win = $('phone-dialog');
  const state = $('phone-status');
  const note = $('phone-note');

  $('phone-title').textContent = `Cisco IP Communicator — ${d.name}`;
  $('phone-label').textContent = d.name;
  $('phone-cm').value = '';
  $('phone-ext').value = '';
  note.textContent = '';
  win.hidden = false;
  bringToFront(win);
  $('phone-close').onclick = () => { win.hidden = true; };
  win.onclick = (e) => { if (e.target === win) win.hidden = true; };

  const refresh = async () => {
    let r;
    try { r = await jsonRequest('/api/phone/status', { id: d.id }); }
    catch { r = { error: 'request failed' }; }
    if (r.error) { state.textContent = 'Status unavailable'; return; }
    if (r.registered) {
      state.textContent = `Registered · CM ${r.cm} · extension ${r.extension}`;
      state.classList.add('ok');
      if (!$('phone-cm').value) $('phone-cm').value = r.cm || '';
      if (!$('phone-ext').value && r.extension) $('phone-ext').value = String(r.extension);
    } else {
      state.textContent = 'Not registered';
      state.classList.remove('ok');
    }
  };

  $('phone-register').onclick = async () => {
    const cm = $('phone-cm').value.trim();
    const ext = Number($('phone-ext').value);
    if (!cm) { note.textContent = 'Call Manager address is required'; return; }
    if (!Number.isInteger(ext) || ext < 1 || ext > 65535) {
      note.textContent = 'Extension must be 1–65535';
      return;
    }
    note.textContent = `Registering with ${cm}…`;
    const r = await api('/api/phone/register', { id: d.id, cm, ext });
    if (r.error) { note.textContent = r.error; return; }
    note.textContent = '';
    await refresh();
  };

  refresh();
}

/* ---------------- firewall (read-only ACL view) ---------------- */
/* NAT rules have no HTTP surface yet, so the window shows the device's ACLs
   from `show access-lists`. `en` first: the show command lives in privileged
   mode, and a fresh /api/cli session starts in user mode. */
function openFirewall(d) {
  const $ = (id) => document.getElementById(id);
  const win = $('firewall-dialog');
  const out = $('firewall-out');
  const note = $('firewall-note');

  $('firewall-title').textContent = `Firewalls — ${d.name}`;
  note.textContent = 'Read-only. ACLs are read from show access-lists over the device console; NAT rules are not available over HTTP.';
  out.textContent = 'Reading access lists…';
  win.hidden = false;
  bringToFront(win);
  $('firewall-close').onclick = () => { win.hidden = true; };
  win.onclick = (e) => { if (e.target === win) win.hidden = true; };

  (async () => {
    try {
      const en = await cliRequest('/api/cli', { id: d.id, line: 'en' });
      if (en.error) throw new Error(en.error);
      const r = await cliRequest('/api/cli', { id: d.id, line: 'show access-lists' });
      if (r.error) throw new Error(r.error);
      out.textContent = r.output ? r.output : '(no access-list output)';
    } catch {
      out.textContent = 'Serial console not available';
    }
  })();
}

/* ---------------- dialogs catalog browser ---------------- */
/* Reference browser over the extracted UI catalog (GET /api/dialogs). The
   endpoint only takes q and limit, so page N is read by asking for N pages
   worth of rows and dropping the earlier ones. */
const DIALOGS_PAGE = 200;
const DIALOGS_MAX = 1000;

function openDialogs() {
  const $ = (id) => document.getElementById(id);
  const win = $('dialogs-dialog');
  const search = $('dialogs-search');
  const list = $('dialogs-list');
  const note = $('dialogs-note');
  const prev = $('dialogs-prev');
  const next = $('dialogs-next');
  const pageInfo = $('dialogs-page');
  let page = 0;
  let seq = 0;
  let timer = null;

  const load = async () => {
    const run = ++seq;
    const q = search.value.trim();
    const limit = Math.min(DIALOGS_MAX, (page + 1) * DIALOGS_PAGE);
    note.textContent = 'Loading…';
    let r;
    try {
      const res = await fetch(`/api/dialogs?${new URLSearchParams({ q, limit: String(limit) })}`);
      r = await res.json();
    } catch {
      r = null;
    }
    if (run !== seq) return;
    list.replaceChildren();
    if (!r || r.available !== true) {
      note.textContent = 'catalog unavailable';
      pageInfo.textContent = '';
      prev.disabled = true;
      next.disabled = true;
      return;
    }
    const items = Array.isArray(r.items) ? r.items : [];
    const start = page * DIALOGS_PAGE;
    const pageItems = items.slice(start, start + DIALOGS_PAGE);
    for (const item of pageItems) {
      const row = document.createElement('div');
      row.className = 'dialog-row';
      const name = document.createElement('div');
      name.className = 'dialog-name';
      name.textContent = item.dialog || '(unnamed)';
      const text = document.createElement('div');
      text.className = 'dialog-text';
      text.textContent = item.text || '';
      row.appendChild(name);
      row.appendChild(text);
      const label = `${item.dialog || ''} ${item.text || ''}`.toLowerCase();
      const wired = label.includes('ip configuration') || label.includes('ipconfig')
        ? () => selected && openIpDialog(selected)
        : label.includes('wireless') || label.includes('wlan')
          ? () => selected && openWifi(selected)
          : label.includes('smtp') || label.includes('e-mail') || label.includes('email')
            ? () => selected && openMail(selected)
            : String(item.dialog || '').toLowerCase() === 'preferences'
              ? () => ACTIONS.preferences()
              : String(item.dialog || '').toLowerCase() === 'about'
                ? () => ACTIONS.about()
                : null;
      if (wired) {
        row.classList.add('dialog-wired');
        row.title = 'Open this dialog for the selected device';
        row.onclick = () => {
          if (!selected && !/preferences|about/i.test(String(item.dialog))) {
            status('Select a device first');
            sfx('errorMsg');
            return;
          }
          wired();
        };
      }
      list.appendChild(row);
    }
    if (!pageItems.length) {
      const empty = document.createElement('div');
      empty.className = 'meta';
      empty.textContent = q ? `No dialogs match "${q}"` : 'No dialogs in the catalog';
      list.appendChild(empty);
    }
    pageInfo.textContent = `Page ${page + 1}`;
    prev.disabled = page === 0;
    next.disabled = items.length < limit || limit >= DIALOGS_MAX;
    note.textContent =
      `${pageItems.length} shown · ${items.length} fetched · ${Number(r.total) || 0} rows in catalog`;
  };

  const close = () => {
    win.hidden = true;
    if (timer) { clearTimeout(timer); timer = null; }
  };

  page = 0;
  search.oninput = () => {
    clearTimeout(timer);
    timer = setTimeout(() => { page = 0; load(); }, 250);
  };
  prev.onclick = () => { if (page > 0) { page -= 1; load(); } };
  next.onclick = () => { page += 1; load(); };
  $('dialogs-close').onclick = close;
  win.onclick = (e) => { if (e.target === win) close(); };
  win.hidden = false;
  bringToFront(win);
  load();
  search.focus();
}

/* ---------------- terminal (console into routers and switches) ---------------- */
const CONSOLE_KINDS = new Set(['router', 'switch']);

let termDevice = null;
/* Router/switch id the session is bound to; differs from termDevice when the
   window was opened from a PC's Desktop across a console cable. */
let termTarget = null;
let termEsc = null;

/* `/api/cli` answers with `{output, prompt}` only, so it must bypass `api()`
   (which treats every response as a workspace snapshot). */
async function cliRequest(path, params) {
  const q = new URLSearchParams(params).toString();
  const res = await fetch(`${path}?${q}`, { method: 'POST' });
  return res.json();
}

async function openTerm(d) {
  const win = document.getElementById('term-window');
  const out = document.getElementById('term-out');
  const input = document.getElementById('term-in');
  const promptEl = document.getElementById('term-prompt');
  const titleEl = document.getElementById('term-title');
  const close = () => closeTerm();

  termDevice = d;
  termTarget = null;
  out.textContent = '';
  input.value = '';
  win.hidden = false;
  bringToFront(win);
  titleEl.textContent = 'Terminal';
  document.getElementById('term-close').onclick = close;
  win.onclick = (e) => { if (e.target === win) close(); };
  if (termEsc) document.removeEventListener('keydown', termEsc, true);
  termEsc = (e) => {
    if (e.key !== 'Escape' || win.hidden) return;
    e.preventDefault();
    e.stopPropagation();
    close();
  };
  document.addEventListener('keydown', termEsc, true);

  /* A router or switch is its own console; anything else needs a console cable
     to one, exactly like the real Desktop → Terminal icon. */
  let target = d;
  if (!CONSOLE_KINDS.has(d.kind)) {
    let peer = null;
    try {
      peer = await cliRequest('/api/console', { id: d.id });
    } catch { peer = null; }
    if (!peer || !peer.peer) {
      out.textContent = '% No console cable to a router or switch.\n' +
        '% Pick the Console cable in the palette, then click this device and the router.\n';
      promptEl.textContent = '>';
      input.disabled = true;
      input.onkeydown = null;
      return;
    }
    target = data.devices.find((x) => x.id === peer.peer) || { id: peer.peer, name: peer.name };
    titleEl.textContent = `Terminal — ${d.name} → ${target.name}`;
  }
  termTarget = target;
  if (termDevice !== d) return; // closed while resolving

  input.disabled = true;
  input.onkeydown = async (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      try {
        const r = await jsonRequest('/api/complete', { id: target.id, line: input.value });
        const list = r.candidates || [];
        if (list.length === 1) {
          input.value = `${list[0]} `;
        } else if (list.length > 1) {
          out.textContent += `${list.join('   ')}\n`;
          out.scrollTop = out.scrollHeight;
        }
      } catch { /* completion is best-effort */ }
      return;
    }
    if (e.key !== 'Enter' || input.disabled) return;
    const line = input.value;
    input.value = '';
    out.textContent += `${promptEl.textContent} ${line}\n`;
    out.scrollTop = out.scrollHeight;
    input.disabled = true;
    try {
      const r = await cliRequest('/api/cli', { id: target.id, line });
      if (r.output) out.textContent += r.output.endsWith('\n') ? r.output : `${r.output}\n`;
      if (r.prompt) promptEl.textContent = r.prompt;
    } catch {
      out.textContent += '% console session lost\n';
    }
    input.disabled = false;
    out.scrollTop = out.scrollHeight;
    input.focus();
  };

  promptEl.textContent = `${target.name}>`;
  input.focus();
  cliRequest('/api/cli', { id: target.id, line: '' }).then((r) => {
    if (termDevice !== d || win.hidden) return;
    if (r.output) out.textContent += r.output;
    if (r.prompt) promptEl.textContent = r.prompt;
    out.scrollTop = out.scrollHeight;
    input.disabled = false;
    input.focus();
  }).catch(() => {
    if (termDevice !== d) return;
    out.textContent += '% console session unavailable\n';
    input.disabled = false;
  });
}

function closeTerm() {
  const win = document.getElementById('term-window');
  const input = document.getElementById('term-in');
  const target = termTarget;
  win.hidden = true;
  input.disabled = false;
  input.value = '';
  input.onkeydown = null;
  termDevice = null;
  termTarget = null;
  if (termEsc) { document.removeEventListener('keydown', termEsc, true); termEsc = null; }
  if (!target) return;
  cliRequest('/api/cli/reset', { id: target.id }).catch(() => {});
}

/* ---------------- window management ---------------- */
let zTop = 80;

function bringToFront(win) {
  if (!win) return;
  win.style.zIndex = String(++zTop);
}

/* Drag a window by its title bar; the overlay stays full-screen so clicks
   outside still close it, and the box switches to fixed coordinates once. */
function makeWindowMovable(win) {
  if (!win) return;
  const box = win.querySelector('.preview');
  const title = box && box.querySelector('.devwin-title');
  if (!box || !title) return;
  let drag = null;

  title.addEventListener('pointerdown', (ev) => {
    if (ev.target.closest('button')) return;
    bringToFront(win);
    const r = box.getBoundingClientRect();
    drag = { x: ev.clientX, y: ev.clientY, ox: r.left, oy: r.top, w: r.width };
    title.setPointerCapture(ev.pointerId);
    ev.preventDefault();
  });
  title.addEventListener('pointermove', (ev) => {
    if (!drag) return;
    const x = Math.max(0, Math.min(window.innerWidth - 80, drag.ox + ev.clientX - drag.x));
    const y = Math.max(0, Math.min(window.innerHeight - 40, drag.oy + ev.clientY - drag.y));
    box.style.position = 'fixed';
    box.style.margin = '0';
    box.style.left = `${x}px`;
    box.style.top = `${y}px`;
  });
  const stop = (ev) => {
    drag = null;
    try { title.releasePointerCapture(ev.pointerId); } catch { /* already released */ }
  };
  title.addEventListener('pointerup', stop);
  title.addEventListener('pointercancel', stop);
  box.addEventListener('pointerdown', () => bringToFront(win), true);
}

async function boot() {
  const [fresh, cat] = await Promise.all([getJson('/api/workspace'), getJson('/api/catalog')]);
  data = fresh;
  catalog = Array.isArray(cat.models) ? cat.models : [];
  document.getElementById('physical-tab').textContent = data.tabs.physical;
  renderToolbar(document.getElementById('toolbar-primary'), PRIMARY);
  renderToolbar(document.getElementById('toolbar-secondary'), SECONDARY);

  /* The logical/physical switch: a toolbar button plus the two tabs. */
  const viewToggle = document.createElement('button');
  viewToggle.type = 'button';
  viewToggle.id = 'physical-toggle';
  viewToggle.className = 'view-toggle';
  viewToggle.textContent = 'Physical';
  viewToggle.title = 'Toggle the physical workspace view';
  viewToggle.setAttribute('aria-pressed', 'false');
  viewToggle.onclick = () => setView(viewMode === 'physical' ? 'logical' : 'physical');
  document.getElementById('toolbar-secondary').appendChild(viewToggle);
  document.querySelectorAll('.tabs .tab[data-view]').forEach((b) => {
    b.addEventListener('click', () => setView(b.dataset.view));
  });
  renderPalette();
  renderFilters();
  renderAll();
  wireMenus();
  wireActions();
  wireKeyboard();
  wireCanvasDrop();
  wireCanvasSelection();
  for (const id of ['device-window', 'cmd-window', 'term-window', 'web-dialog',
    'editor-dialog', 'traffic-dialog', 'mib-dialog', 'pdu-dialog',
    'wifi-dialog', 'vpn-dialog', 'pppoe-dialog', 'phone-dialog',
    'firewall-dialog', 'dialogs-dialog']) {
    makeWindowMovable(document.getElementById(id));
  }
  status('Ready');
}

boot();
