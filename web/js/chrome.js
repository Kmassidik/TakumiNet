/* ---------------- chrome ---------------- */
function renderAll() {
  renderTopology();
  renderEvents();
  renderLesson();
  if (viewMode === 'physical') renderTopology();
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
          const event = events[events.length - 1];
          if (typeof selectCaptureEvent === 'function') selectCaptureEvent(event.id);
          else {
            simCursor = event.id;
            renderEvents();
            animatePath(event.path, event.proto);
          }
        }
      }
    });
  });
  document.getElementById('show-all').onclick = () => setAllFilters(true);
  document.getElementById('show-none').onclick = () => setAllFilters(false);
  const speed = document.getElementById('playback-speed');
  if (speed) speed.addEventListener('input', () => setPlaybackSpeed(speed.value));
  if (typeof wireEngineerView === 'function') wireEngineerView();
  document.querySelectorAll('.modes .mode').forEach((b) => {
    b.onclick = () => {
      document.querySelectorAll('.modes .mode').forEach((x) => x.classList.remove('active'));
      b.classList.add('active');
      document.getElementById('status-mode').textContent = b.textContent;
      status(`${b.textContent} mode`);
    };
  });
}

const NUDGE_ARROWS = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] };
let nudgeSaveTimer = null;

/* Moves every selected device at once; the positions reach the server in one
   debounced burst when the key settles. */
function nudgeSelection(dx, dy) {
  const chosen = data.devices.filter((d) => selection.has(d.id));
  if (!chosen.length) return;
  for (const d of chosen) { d.x += dx; d.y += dy; }
  renderTopology();
  if (nudgeSaveTimer) clearTimeout(nudgeSaveTimer);
  nudgeSaveTimer = setTimeout(async () => {
    nudgeSaveTimer = null;
    const targets = data.devices
      .filter((d) => selection.has(d.id))
      .map((d) => ({ id: d.id, x: d.x, y: d.y }));
    for (const t of targets) await api('/api/devices/move', { id: t.id, x: t.x, y: t.y });
  }, 400);
}

function wireKeyboard() {
  document.addEventListener('keydown', async (e) => {
    if (e.defaultPrevented) return; // the menu bar already used this key
    const active = document.activeElement;
    if (active && (['INPUT', 'TEXTAREA', 'SELECT'].includes(active.tagName) || active.isContentEditable)) return;
    const plain = !e.ctrlKey && !e.metaKey && !e.altKey;
    const arrow = NUDGE_ARROWS[e.key];
    /* With a selection the arrows nudge it (10 px, Shift for 1 px) and may
       auto-repeat; without one the left/right arrows still step the simulation. */
    if (plain && arrow && typeof selectionCount === 'function' && selectionCount()) {
      e.preventDefault();
      const step = e.shiftKey ? 1 : 10;
      nudgeSelection(arrow[0] * step, arrow[1] * step);
      return;
    }
    if (e.repeat) return; // holding a key must not replay its action
    // Space is the canvas pan modifier, so playback lives on P.
    if (plain && e.key.toLowerCase() === 'p') {
      e.preventDefault(); togglePlay(); return;
    }
    if (plain && e.key.toLowerCase() === 'f') {
      e.preventDefault(); ACTIONS['zoom-fit'](); return;
    }
    if (plain && e.key === 'ArrowRight') {
      e.preventDefault(); stepSim(1); return;
    }
    if (plain && e.key === 'ArrowLeft') {
      e.preventDefault(); stepSim(-1); return;
    }
    const meta = e.ctrlKey || e.metaKey;
    if (meta && e.key.toLowerCase() === 'a') {
      e.preventDefault();
      const ids = (typeof data !== 'undefined' && data && data.devices ? data.devices : []).map((d) => d.id);
      setSelection(ids);
      renderTopology();
      status(ids.length ? `${ids.length} device${ids.length === 1 ? '' : 's'} selected` : 'Nothing to select');
    }
    else if (meta && e.key.toLowerCase() === 'z') { e.preventDefault(); (e.shiftKey ? ACTIONS.redo : ACTIONS.undo)(); }
    else if (meta && e.key.toLowerCase() === 'y') { e.preventDefault(); ACTIONS.redo(); }
    else if (meta && e.key.toLowerCase() === 'c') { e.preventDefault(); ACTIONS.copy(); }
    else if (meta && e.key.toLowerCase() === 'v') { e.preventDefault(); ACTIONS.paste(); }
    else if (meta && e.key.toLowerCase() === 's') { e.preventDefault(); ACTIONS.save(); }
    else if (e.key === 'Delete' || e.key === 'Backspace') { e.preventDefault(); ACTIONS.delete(); }
    else if (e.key === 'Escape') {
      if (document.querySelector('.overlay:not([hidden])')) return;
      pduMode = false; pduFrom = null;
      noteMode = false;
      selectedLink = null;
      leaveCableMode();
      setSelection([]);
      renderPalette();
      renderTopology();
    }
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
    const files = e.dataTransfer.files;
    if (files && files.length) {
      if (files.length === 1) await importTnetFile(files[0]);
      else fileActionError('Drop one .xml file at a time.');
      return;
    }
    const model = e.dataTransfer.getData('text/plain');
    if (!model) return;
    const p = toSvg(e);
    const r = await api('/api/devices', { model, x: p.x, y: p.y });
    if (!r.error) sfx('devicePlacement');
  });
}
