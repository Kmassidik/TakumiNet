'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const source = fs.readFileSync(path.resolve(__dirname, '../../web/js/boot.js'), 'utf8');

test('workspace load failure shows an error mascot and leaves file actions wired', async () => {
  const galleries = [];
  const statuses = [];
  const sounds = [];
  let actionsWired = false;
  const context = vm.createContext({
    data: null,
    getJson: async () => ({}),
    status: (message, failed) => statuses.push({ message, failed }),
    sfx: (name) => sounds.push(name),
    renderGallery: (payload) => galleries.push(payload),
    wireMenus() {},
    wireActions() { actionsWired = true; },
  });
  vm.runInContext(source, context);
  await context.boot();

  assert.equal(galleries.length, 1);
  assert.match(galleries[0].error, /workspace could not be loaded/i);
  assert.deepEqual(sounds, ['errorMsg']);
  assert.deepEqual(statuses.at(-1), { message: 'Workspace could not be loaded', failed: true });
  assert.equal(actionsWired, true);
});

function anyElement() {
  const el = new Proxy({ dataset: {}, classList: { add() {}, remove() {}, toggle() {}, contains: () => false }, style: {} }, {
    get: (t, k) => (k in t ? t[k] : () => el),
    set: (t, k, v) => { t[k] = v; return true; },
  });
  return { getElementById: () => el, querySelectorAll: () => [], querySelector: () => el, createElement: () => el, body: el };
}

test('every page load starts from a blank workspace, before the workspace is read', async () => {
  const calls = [];
  const context = vm.createContext({
    data: null,
    api: async (path) => { calls.push(path); return {}; },
    getJson: async (path) => { calls.push(path); return { tabs: { physical: 'P' }, devices: [], links: [] }; },
    status() {}, sfx() {}, renderGallery() {}, renderAll() {}, renderPalette() {}, renderFilters() {},
    renderToolbar() {}, initWorkspaceCanvas() {}, wireMenus() {}, wireActions() {}, wireKeyboard() {},
    wireCanvasDrop() {}, wireWorkspaceCanvas() {}, showGallery: async () => {},
    document: anyElement(),
    workspaceCanvas: { fit() {} },
    setView() {}, makeWindowMovable() {}, renderTopology() {}, renderRunLog() {}, renderEvents() {}, renderLesson() {}, PRIMARY: [], SECONDARY: [],
  });
  vm.runInContext(source, context);
  await context.boot().catch(() => {});
  assert.equal(calls[0], '/api/new');
  assert.equal(calls[1], '/api/workspace');
});

function unloadHarness(unsaved) {
  const handlers = {};
  const context = vm.createContext({
    data: null,
    api: async () => ({}),
    getJson: async () => ({ tabs: { physical: 'P' }, devices: [], links: [] }),
    status() {}, sfx() {}, renderGallery() {}, renderAll() {}, renderPalette() {}, renderFilters() {},
    renderToolbar() {}, initWorkspaceCanvas() {}, wireMenus() {}, wireActions() {}, wireKeyboard() {},
    wireCanvasDrop() {}, wireWorkspaceCanvas() {}, showGallery: async () => {},
    document: anyElement(),
    workspaceCanvas: { fit() {} },
    window: { addEventListener: (type, fn) => { handlers[type] = fn; } },
    markClean() {},
    hasUnsavedWork: () => unsaved,
    setView() {}, makeWindowMovable() {}, renderTopology() {}, renderRunLog() {}, renderEvents() {}, renderLesson() {}, PRIMARY: [], SECONDARY: [],
  });
  vm.runInContext(source, context);
  return { context, handlers };
}

test('leaving the page with unsaved work asks the browser to confirm', async () => {
  const { context, handlers } = unloadHarness(true);
  await context.boot().catch(() => {});
  let prevented = false;
  const event = { preventDefault() { prevented = true; }, returnValue: undefined };
  handlers.beforeunload(event);
  assert.equal(prevented, true);
  assert.equal(event.returnValue, '');
});

test('leaving a page with nothing unsaved is silent', async () => {
  const { context, handlers } = unloadHarness(false);
  await context.boot().catch(() => {});
  let prevented = false;
  handlers.beforeunload({ preventDefault() { prevented = true; } });
  assert.equal(prevented, false);
});

test('a fresh load is marked clean before anything else can change', async () => {
  const order = [];
  const { context } = unloadHarness(false);
  context.markClean = () => order.push('clean');
  context.renderAll = () => order.push('render');
  await context.boot().catch(() => {});
  assert.equal(order[0], 'clean');
});
