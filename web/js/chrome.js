/* ---------------- chrome ---------------- */
function renderAll() {
  renderTopology();
  renderEvents();
  renderLesson();
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
          const event = events[events.length - 1];
          simCursor = event.id;
          renderEvents();
          animatePath(event.path);
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
    const files = e.dataTransfer.files;
    if (files && files.length) {
      if (files.length === 1) await importTnetFile(files[0]);
      else fileActionError('Drop one .tnet file at a time.');
      return;
    }
    const model = e.dataTransfer.getData('text/plain');
    if (!model) return;
    const p = toSvg(e);
    const r = await api('/api/devices', { model, x: p.x, y: p.y });
    if (!r.error) sfx('devicePlacement');
  });
}
