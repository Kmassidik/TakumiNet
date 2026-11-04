/* ---------------- topology: drawn on the workspace canvas ---------------- */
let workspaceCanvas = null;

function initWorkspaceCanvas() {
  workspaceCanvas = new WorkspaceCanvas(document.getElementById('topology'));
}

function renderTopology() {
  if (!data || !workspaceCanvas) return;
  renderDeviceList(document.getElementById('device-list'), data.devices, (id) => {
    setSelection([id]);
    renderTopology();
  });
  workspaceCanvas.setState({
    workspace: data,
    selected: selection,
    marked: new Set([cableFrom, pduFrom].filter(Boolean)),
    linked: selectedLink,
    grid: showGrid,
    physical: viewMode === 'physical',
    notes: data.notes || [],
    selectedNote: selectedNoteId,
    empty: data.devices.length
      ? undefined
      : { message: 'No devices yet. Drop a device here to begin', mascot: '/art3d/mascot/sleep.webp' },
  });
}

function wireWorkspaceCanvas() {
  wireNoteKeys();
  const groupPress = makeGroupPress({
    now: () => performance.now(),
    post: async (path) => (await fetch(path, { method: 'POST' })).json(),
    card: (group) => openGroupCard(group),
    applied: (res) => { setData(res); status('Group expanded'); },
  });
  workspaceCanvas.handlers = {
    onDeviceDown: (device, ev) => {
      const d = data.devices.find((x) => x.id === device.id);
      if (viewMode === 'physical') selectPhysical(d);
      else startDrag(ev, d);
    },
    onGroupDown: (group) => groupPress(group),
    onLinkDown: (link) => {
      selectedLink = { a: link.a, b: link.b };
      setSelection([]);
      const kind = link.kind === 'eConsole' ? 'Console cable' : 'Link';
      status(`${kind}: ${link.from.name} ${link.aPort} ↔ ${link.to.name} ${link.bPort}`);
      renderTopology();
    },
    onNoteDown: (note, ev) => startNoteDrag(ev, note),
    onBackgroundDown: (ev) => {
      if (noteMode) return placeNote(ev);
      selectedNoteId = null;
      if (!selection.size && !selectedLink) return;
      setSelection([]);
      selectedLink = null;
      renderTopology();
    },
    onHover: (device, ev) => {
      if (device) showTip(ev, `${device.name} · ${device.model}`);
      else hideTip();
    },
  };
}

function viewCenter() {
  return workspaceCanvas.worldCenter();
}

/* ---------------- notes: text the learner writes on the canvas ---------------- */
let lastNoteClick = { id: null, t: 0 };

async function placeNote(ev) {
  noteMode = false;
  const p = toSvg(ev);
  const text = await askText('Note text', '');
  if (!text || !text.trim()) { status('Note cancelled'); return; }
  const r = await api('/api/notes/add', { x: p.x, y: p.y, text });
  if (r.error) { status(r.error, true); return; }
  setData(r);
  status('Note added');
  renderTopology();
}

async function editNote(note) {
  const text = await askText('Edit note', note.text);
  if (!text || !text.trim() || text === note.text) return;
  const r = await api('/api/notes/edit', { id: note.id, text, color: note.color });
  if (r.error) { status(r.error, true); return; }
  setData(r);
  renderTopology();
}

function startNoteDrag(ev, note) {
  ev.preventDefault();
  const now = performance.now();
  if (lastNoteClick.id === note.id && now - lastNoteClick.t < 400) {
    lastNoteClick = { id: null, t: 0 };
    editNote(note);
    return;
  }
  lastNoteClick = { id: note.id, t: now };
  selectedNoteId = note.id;
  selectedLink = null;
  setSelection([]);
  renderTopology();

  const start = toSvg(ev);
  const origin = { x: note.x, y: note.y };
  let moved = false;
  const live = () => data.notes.find((n) => n.id === note.id);
  const onMove = (e) => {
    const p = toSvg(e);
    const dx = p.x - start.x;
    const dy = p.y - start.y;
    if (Math.abs(dx) + Math.abs(dy) > 2) moved = true;
    const n = live();
    if (n) { n.x = origin.x + dx; n.y = origin.y + dy; }
    renderTopology();
  };
  const onUp = async () => {
    window.removeEventListener('pointermove', onMove);
    if (!moved) return;
    const n = live();
    const r = await api('/api/notes/move', { id: note.id, x: n.x, y: n.y });
    if (!r.error) setData(r);
  };
  window.addEventListener('pointermove', onMove);
  window.addEventListener('pointerup', onUp, { once: true });
}

function wireNoteKeys() {
  window.addEventListener('keydown', async (e) => {
    if (!selectedNoteId || (e.key !== 'Delete' && e.key !== 'Backspace')) return;
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
    const id = selectedNoteId;
    selectedNoteId = null;
    const r = await api('/api/notes/delete', { id });
    if (!r.error) setData(r);
    renderTopology();
  });
}

