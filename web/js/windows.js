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
  data = await getJson('/api/workspace');
  if (!data || !data.tabs || !Array.isArray(data.devices) || !Array.isArray(data.links)) {
    status('Workspace could not be loaded', true);
    sfx('errorMsg');
    renderGallery({ error: 'Workspace could not be loaded. Start a blank workspace or open a native .tnet file.' });
    wireMenus();
    wireActions();
    return;
  }
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
    'firewall-dialog']) {
    makeWindowMovable(document.getElementById(id));
  }
  status('Ready');
  await showGallery();
}

