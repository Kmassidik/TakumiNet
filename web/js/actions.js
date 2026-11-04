/* ---------------- actions ---------------- */
async function confirmOpenAnyway(response) {
  if (!response.error || !response.canOpenAnyway) return false;
  const problems = (response.problems || []).map((p) => p.text || p.message).join('\n');
  return askConfirm(`${problems || response.error}\n\nOpen anyway without the broken parts?`, 'Open anyway');
}

function reportLoadProblems(response) {
  const problems = response.problems || [];
  const dropped = response.dropped || problems.filter((p) => p.severity === 'error').length;
  const warnings = problems.filter((p) => p.severity === 'warning').length;
  if (dropped) return `Opened without ${dropped} broken record${dropped === 1 ? '' : 's'}`;
  if (warnings) return `Opened with ${warnings} warning${warnings === 1 ? '' : 's'}`;
  return '';
}

function fileActionError(message) {
  status(message || 'Import failed', true);
  if (typeof setLessonMascot === 'function') setLessonMascot('error');
  sfx('errorMsg');
}

function importProblemMessage(response, fallback = 'Import failed') {
  const problems = (response && response.problems || [])
    .map((problem) => problem.text || problem.message)
    .filter(Boolean);
  return problems.join('\n') || (response && response.error) || fallback;
}

/* Shared by the picker and workspace drop. The server parses the whole file
   before replacing its workspace; the client likewise waits for success before
   touching the rendered snapshot or its current filename. */
async function importTnetFile(file) {
  if (!file) return false;
  if (!/\.tnet$/i.test(file.name || '')) {
    fileActionError(`“${file.name || 'This file'}” is not a TakumiNet file. Choose a .tnet file.`);
    return false;
  }
  try {
    const body = await file.text();
    const send = async (openAnyway = false) => {
      const res = await fetch(`/api/import${openAnyway ? '?openAnyway=true' : ''}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/xml; charset=utf-8' },
        body,
      });
      return { res, json: await res.json() };
    };
    let { res, json: response } = await send();
    if (await confirmOpenAnyway(response)) ({ res, json: response } = await send(true));
    if (!res.ok || response.error) throw new Error(importProblemMessage(response));
    setData(response);
    currentName = file.name.replace(/\.tnet$/i, '');
    currentTemplate = null;
    simCursor = -1;
    if (typeof resetLessonState === 'function') resetLessonState();
    if (typeof renderLesson === 'function') renderLesson();
    if (typeof hideGallery === 'function') hideGallery();
    status(reportLoadProblems(response) || `Imported ${file.name}`);
    sfx('newScenarioButton');
    return true;
  } catch (error) {
    fileActionError(error.message || 'Import failed');
    return false;
  }
}

const ACTIONS = {
  async new() {
    const gallery = document.getElementById('lesson-gallery');
    const fromGallery = gallery && !gallery.hidden;
    if (!fromGallery && !(await askConfirm('Discard the current topology?', 'Discard'))) return;
    const r = await api('/api/new');
    if (!r.error) {
      currentName = 'untitled';
      currentTemplate = null;
      simCursor = -1;
      selectedLink = null;
      setSelection([]);
      if (typeof resetLessonState === 'function') resetLessonState();
      if (typeof renderLesson === 'function') renderLesson();
      if (typeof hideGallery === 'function') hideGallery();
      status('New blank workspace');
    }
  },
  async open() {
    const { names = [] } = await getJson('/api/saves');
    if (!names.length) { status('No saved topologies'); sfx('errorMsg'); return; }
    const name = await askText(`Open topology (${names.join(', ')})`, names[0]);
    if (!name) return;
    let r = await api('/api/load', { name });
    if (await confirmOpenAnyway(r)) r = await api('/api/load', { name, openAnyway: 'true' });
    if (!r.error) {
      currentName = name;
      currentTemplate = null;
      simCursor = -1;
      if (typeof resetLessonState === 'function') resetLessonState();
      if (typeof renderLesson === 'function') renderLesson();
      if (typeof hideGallery === 'function') hideGallery();
      status(reportLoadProblems(r) || `Opened ${name}`);
      sfx('newScenarioButton');
    }
  },
  async save() {
    const name = await askText('Save topology as', currentName);
    if (!name) return;
    const r = await api('/api/save', { name });
    if (!r.error) { currentName = name; status(`Saved ${name}.tnet`); sfx('newScenarioButton'); }
  },
  async import() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.tnet';
    input.onchange = () => importTnetFile(input.files[0]);
    input.click();
  },
  async export() {
    try {
      const res = await fetch('/api/export');
      if (!res.ok) throw new Error(`export failed (${res.status})`);
      const url = URL.createObjectURL(await res.blob());
      const a = document.createElement('a');
      a.href = url;
      a.download = `${currentName || 'topology'}.tnet`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      status(`Exported ${a.download}`);
      sfx('newScenarioButton');
    } catch (e) {
      status(e.message || 'export failed', true);
      sfx('errorMsg');
    }
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

  'add-note'() {
    noteMode = true;
    status('Click the canvas to place a note');
  },
  'zoom-in'() { zoom(1.25); },
  'zoom-out'() { zoom(0.8); },
  'zoom-reset'() {
    workspaceCanvas.camera.zoom = 1;
    workspaceCanvas.requestDraw();
    status('Zoom reset');
  },
  'toggle-palette'() {
    const handle = document.querySelector('[data-collapse-for="palette"]');
    if (handle) handle.click();
  },

  'toggle-grid'() {
    showGrid = !showGrid;
    prefs.grid = showGrid;
    savePrefs();
    renderTopology();
    status(showGrid ? 'Grid on' : 'Grid off');
  },
  async 'build-bus'() {
    const raw = await askText('How many computers on the bus?', '4');
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
    const name = await askText('Custom device name', 'MyDevice');
    if (!name) return;
    const center = viewCenter();
    const cx = center.x - 50;
    const cy = center.y - 20;
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
    if (!r.error) { simCursor = -1; commandLog = []; renderEvents(); status('Simulation reset'); }
  },
  help() { ACTIONS.about(); },
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
  },
};

function zoom(factor) {
  const canvas = workspaceCanvas;
  canvas.camera.zoomAt({ x: canvas.cssWidth / 2, y: canvas.cssHeight / 2 }, factor);
  canvas.requestDraw();
  status(`Zoom ${Math.round(canvas.camera.zoom * 100)}%`);
}

/* ---------------- simulation transport ---------------- */
function stepSim(dir) {
  const events = visibleEvents();
  if (!events.length) { status('No events'); return; }
  const current = events.findIndex((e) => e.id === simCursor);
  const next = current < 0
    ? (dir < 0 ? events.length - 1 : 0)
    : Math.min(events.length - 1, Math.max(0, current + dir));
  const event = events[next];
  if (typeof selectCaptureEvent === 'function') selectCaptureEvent(event.id);
  else {
    simCursor = event.id;
    renderEvents();
    animatePath(event.path, event.proto);
  }
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
  if (!visibleEvents().length) {
    status('Nothing to play yet. Send a PDU first');
    return;
  }
  sfx('movieControlButton');
  document.querySelector('#play-btn img').src = icon3d('sim/pause');
  status('Playing events');
  playTimer = setInterval(() => {
    const events = visibleEvents();
    const current = events.findIndex((e) => e.id === simCursor);
    if (!events.length || (current >= 0 && current >= events.length - 1)) {
      togglePlay();
      return;
    }
    stepSim(1);
  }, 900 / playbackSpeed);
}

function setPlaybackSpeed(index) {
  playbackSpeed = PLAYBACK_SPEEDS[Math.max(0, Math.min(PLAYBACK_SPEEDS.length - 1, Number(index) || 0))];
  const output = document.getElementById('playback-speed-value');
  if (output) output.textContent = `${playbackSpeed}×`;
  if (playTimer) {
    clearInterval(playTimer);
    playTimer = null;
    togglePlay();
  }
}
