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
    document.querySelector('#play-btn img').src = icon3d('sim/play');
    status('Paused');
    return;
  }
  document.querySelector('#play-btn img').src = icon3d('sim/pause');
  status('Playing events');
  playTimer = setInterval(() => {
    const events = visibleEvents();
    if (simCursor >= events.length - 1) { togglePlay(); return; }
    stepSim(1);
  }, 900);
}
