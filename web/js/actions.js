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
  // .xml is the one file type. A .tnet file from an earlier version still opens.
  if (!/\.(xml|tnet)$/i.test(file.name || '')) {
    fileActionError(`“${file.name || 'This file'}” is not a Takumi file. Choose an .xml file.`);
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
    currentName = file.name.replace(/\.(xml|tnet)$/i, '');
    markClean();
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
      markClean();
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
      markClean();
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
    if (!r.error) { currentName = name; markClean(); status(`Saved ${name}.xml`); sfx('newScenarioButton'); }
  },
  async import() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.xml,.tnet'; // .tnet: legacy files, read only
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
      a.download = `${currentName || 'topology'}.xml`;
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
  /* Prints only the workspace: a page-sized picture of the diagram, built apart
     from the screen, so menus, panels and zoom never reach the paper. */
  async print() {
    const page = workspaceCanvas.renderForPrint(1754, 1240); // A4 landscape at about 150 dpi
    if (!page) {
      status('Nothing to print yet. Add a device first.', true);
      sfx('errorMsg');
      return;
    }
    const image = document.createElement('img');
    image.alt = 'Network diagram';
    image.src = page.toDataURL('image/png');
    const caption = document.createElement('figcaption');
    caption.textContent = `${currentName || 'Untitled'} · ${new Date().toLocaleDateString()}`;
    document.getElementById('print-sheet').replaceChildren(image, caption);
    try { await image.decode(); } catch { /* print anyway; the browser shows what it has */ }
    status('Printing…');
    window.print();
  },

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
    const ids = [...selection];
    const link = selectedLink;
    if (!ids.length && !link) { status('Nothing selected'); return; }
    if (link) {
      selectedLink = null;
      if (!(await api('/api/links/delete', { a: link.a, b: link.b })).error) sfx('removeLink');
    }
    if (ids.length) {
      setSelection([]);
      let removed = 0;
      for (const id of ids) {
        if (!(await api('/api/devices/delete', { id })).error) removed += 1;
      }
      if (removed) {
        sfx('removeDevice');
        if (removed > 1) status(`Deleted ${removed} devices`);
      }
    }
  },

  'add-note'() {
    noteMode = true;
    status('Click the canvas to place a note');
  },
  'zoom-in'() { zoom(1.25); },
  'zoom-out'() { zoom(0.8); },
  'zoom-fit'() {
    workspaceCanvas.fit();
    status('Zoomed to fit');
  },
  'zoom-reset'() {
    workspaceCanvas.fit();
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
    leaveCableMode();
    pduFrom = null;
    document.querySelector('.canvas-wrap').classList.toggle('crosshair', pduMode);
    status(pduMode ? 'PDU: click source, then destination' : 'Selection mode');
    renderPalette();
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
  async 'collapse-group'() {
    if (selectionCount() < 2) {
      status('Select two or more devices first (shift-click adds to the selection)');
      sfx('errorMsg');
      return;
    }
    const name = await askText('Group name', 'Group');
    if (!name || !name.trim()) return;
    const members = [...selection].join(',');
    const r = await api('/api/groups/collapse', { name: name.trim(), members });
    if (!r.error) {
      setSelection([]);
      status(`Collapsed into ${name.trim()}`);
      sfx('connect1');
    }
  },
  flows() {
    openFlowsWindow(data);
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

/* A template carries its own traffic. Play on a quiet workspace sends it first, so
   "ready to run" means press Play. Your own networks have none: send a PDU. */
async function sendBuiltInTraffic() {
  if (typeof data === 'undefined' || !data || !data.hasDemo) {
    status('Nothing to play yet. Send a PDU first');
    return false;
  }
  const response = await api('/api/demo');
  if (response.error) return false; // api() already showed the message
  if (!visibleEvents().length) {
    status('The traffic was sent, but the protocol filters hide it. Press Show All.');
    return false;
  }
  return true;
}

/* True while Play waits for the built-in traffic. A second press in that moment
   must not send it again or start a second timer that Pause cannot stop. */
let playStarting = false;

async function togglePlay() {
  if (playTimer) {
    clearInterval(playTimer);
    playTimer = null;
    document.querySelector('#play-btn img').src = icon3d('sim/play');
    status('Paused');
    return;
  }
  if (playStarting) return;
  playStarting = true;
  try {
    if (!visibleEvents().length && !(await sendBuiltInTraffic())) return;
  } finally {
    playStarting = false;
  }
  if (playTimer) return; // started by another path while waiting
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
