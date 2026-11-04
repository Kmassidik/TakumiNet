const NS = 'http://www.w3.org/2000/svg';
let data = null;
let selected = null;
let selection = new Set();
let selectedLink = null;
let noteMode = false;
let selectedNoteId = null;
let drag = null;
let lastClick = null;
let cableMode = false;
let cableFrom = null;
/* Cable the palette is currently drawing; sent with every /api/links call. */
let cableKind = 'eCopper';
const CABLE_TYPES = [
  ['eCopper', 'Copper', 'straight', 'Copper Straight-Through'],
  ['eCross', 'Cross', 'cross', 'Copper Cross-Over'],
  ['eSerial', 'Serial', 'coiled', 'Serial DTE'],
  ['eFiber', 'Fiber', 'fiber', 'Optical Fiber'],
  ['eConsole', 'Console', 'console', 'Console (PC to router/switch)'],
  ['ePhone', 'Phone', 'phone', 'Phone (analog phone to router/switch)'],
  ['eCoax', 'Coax', 'coax', 'Coaxial (cable modem or cloud)'],
  ['eIoT', 'IoT', 'usb', 'IoT custom cable'],
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
// Stable captured Event.id, never an index into a filtered event array.
let simCursor = -1;
/* Re-rendering replaces the row, so a native dblclick never fires: detect two
   clicks on the same event within 400 ms, like the canvas does for devices. */
let lastRowClick = { id: -1, t: 0 };
let playTimer = null;
const PLAYBACK_SPEEDS = [0.25, 0.5, 1, 2];
let playbackSpeed = 1;
let currentName = 'lab1';

const svg = () => document.getElementById('topology');
const statusEl = () => document.getElementById('status-msg');

const sounds = new Map();
function sfx(name) {
  if (!prefs.sound) return;
  try {
    let a = sounds.get(name);
    if (!a) { a = new Audio('/sounds/' + name + '.wav'); sounds.set(name, a); }
    a.currentTime = 0;
    a.play().catch(() => {});
  } catch (_) { /* decorative */ }
}

function status(msg, failed = false) {
  statusEl().textContent = msg;
  document.getElementById('status-icon').hidden = !failed;
}

function node(name, attrs) {
  const el = document.createElementNS(NS, name);
  for (const k in attrs) el.setAttribute(k, attrs[k]);
  return el;
}

function toSvg(ev) {
  return workspaceCanvas.worldAt(ev);
}

async function api(path, params = {}) {
  const q = new URLSearchParams(params).toString();
  let res;
  try {
    res = await (await fetch(`${path}?${q}`, { method: 'POST' })).json();
  } catch (e) {
    status('request failed', true);
    return { error: 'request failed' };
  }
  if (res.error) {
    status(res.error, true);
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

/* The workspace as it was when last blank, opened, imported or saved. */
let cleanPrint = null;
function markClean() {
  cleanPrint = typeof workspaceFingerprint === 'function' ? workspaceFingerprint(data) : null;
}
function hasUnsavedWork() {
  return typeof workspaceHasUnsaved === 'function' && workspaceHasUnsaved(data, cleanPrint);
}

function setData(json) {
  data = json;
  const known = new Set(data.devices.map((d) => d.id));
  setSelection([...selection].filter((id) => known.has(id)));
  renderFilters();
  renderAll();
}
