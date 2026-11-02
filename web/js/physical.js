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
