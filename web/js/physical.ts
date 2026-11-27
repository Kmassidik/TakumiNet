/* ---------------- physical (rack) view ----------------
   The rack view is drawn on the same workspace canvas as the logical view
   (web/ts/canvas/rack_layout.ts and rack_draw.ts). Switching views only changes
   what the canvas draws, so the camera and selection carry over. */

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

/* Selecting in the rack reports the device's ports on the status line, fetched
   from the same port inventory the CLI uses. */
async function selectPhysical(d) {
  selectedLink = null;
  setSelection([d.id]);
  renderTopology();
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
  document.querySelector('.canvas-wrap').classList.toggle('physical-mode', physical);
  document.querySelectorAll('.tabs .tab[data-view]').forEach((b) => {
    b.classList.toggle('active', b.dataset.view === viewMode);
  });
  const toggle = document.getElementById('physical-toggle');
  if (toggle) {
    toggle.classList.toggle('active', physical);
    toggle.setAttribute('aria-pressed', physical ? 'true' : 'false');
  }
  renderTopology();
  status(physical ? 'Physical view' : 'Logical view');
}
