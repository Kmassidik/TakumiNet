'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '../..');
const source = fs.readFileSync(path.join(root, 'web/js/recovery.js'), 'utf8');

class MemoryStorage {
  constructor() { this.values = new Map(); }
  getItem(key) { return this.values.has(key) ? this.values.get(key) : null; }
  setItem(key, value) { this.values.set(key, String(value)); }
  removeItem(key) { this.values.delete(key); }
}

function workspace(step) {
  return {
    tabs: { logical: 'Logical', physical: 'Physical' },
    devices: [{ id: `pc${step}`, name: `PC${step}` }],
    links: [], filters: [], events: [],
  };
}

function plain(value) { return JSON.parse(JSON.stringify(value)); }

function moduleHarness(storage = new MemoryStorage()) {
  const context = vm.createContext({ console });
  vm.runInContext(source, context, { filename: 'web/js/recovery.js' });
  return { context, storage };
}

function applicationHarness(serverWorkspace, fetchedWorkspace = workspace(50)) {
  const localStorage = new MemoryStorage();
  const sessionStorage = new MemoryStorage();
  const listeners = {};
  const calls = [];
  const notices = [];
  const timers = new Map();
  let nextTimer = 1;
  const window = {
    localStorage,
    sessionStorage,
    setTimeout(fn, delay) { const id = nextTimer++; timers.set(id, { fn, delay }); return id; },
    clearTimeout(id) { timers.delete(id); },
    addEventListener(name, fn) { listeners[name] = fn; },
    fetch: async () => ({ ok: true, json: async () => fetchedWorkspace }),
  };
  const context = vm.createContext({
    console,
    window,
    URLSearchParams,
    status(message, failed) { notices.push({ message, failed }); },
  });
  vm.runInContext(`
    let data = null;
    const server = ${JSON.stringify(serverWorkspace)};
    async function getJson(path) { return server; }
    async function boot() { data = await getJson('/api/workspace'); status('Ready'); }
    function setData(json) { data = json; }
    async function api(path) {
      calls.push(path);
      const match = /api\\/(undo|redo)/.exec(path);
      const response = match && match[1] === 'undo' ? server : data;
      setData(response);
      return response;
    }
  `, context);
  context.calls = calls;
  vm.runInContext(source, context, { filename: 'web/js/recovery.js' });
  const flushTimers = () => {
    const pending = [...timers.values()];
    timers.clear();
    pending.forEach(({ fn }) => fn());
  };
  return { context, window, localStorage, sessionStorage, listeners, calls, notices, timers, flushTimers };
}

test('autosave rotates current and previous without replacing last-known-good', () => {
  const storage = new MemoryStorage();
  const { context } = moduleHarness(storage);
  const Store = vm.runInContext('BrowserSnapshotStore', context);
  const keys = vm.runInContext('RECOVERY_KEYS', context);
  const store = new Store(storage);

  store.save(workspace(1));
  store.markKnownGood(workspace(1));
  store.save(workspace(2));
  store.save(workspace(3));

  assert.equal(JSON.parse(storage.getItem(keys.current)).devices[0].id, 'pc3');
  assert.equal(JSON.parse(storage.getItem(keys.previous)).devices[0].id, 'pc2');
  assert.equal(JSON.parse(storage.getItem(keys.good)).devices[0].id, 'pc1');
});

test('a corrupt current snapshot falls back to previous with a visible notice', () => {
  const storage = new MemoryStorage();
  const { context } = moduleHarness(storage);
  const Store = vm.runInContext('BrowserSnapshotStore', context);
  const keys = vm.runInContext('RECOVERY_KEYS', context);
  const store = new Store(storage);
  store.markKnownGood(workspace(1));
  store.save(workspace(1));
  store.save(workspace(2));
  storage.setItem(keys.current, '{broken');

  const recovered = store.recover();
  assert.equal(recovered.source, 'previous');
  assert.equal(recovered.workspace.devices[0].id, 'pc1');
  assert.match(recovered.notice, /Recovered previous snapshot/);
  assert.equal(JSON.parse(storage.getItem(keys.current)).devices[0].id, 'pc1');
});

test('corrupt current and previous snapshots fall back to last-known-good', () => {
  const storage = new MemoryStorage();
  const { context } = moduleHarness(storage);
  const Store = vm.runInContext('BrowserSnapshotStore', context);
  const keys = vm.runInContext('RECOVERY_KEYS', context);
  const store = new Store(storage);
  store.markKnownGood(workspace(4));
  store.save(workspace(5));
  store.save(workspace(6));
  storage.setItem(keys.current, JSON.stringify({ devices: [] }));
  storage.setItem(keys.previous, 'not json');

  const recovered = store.recover();
  assert.equal(recovered.source, 'last-known-good');
  assert.equal(recovered.workspace.devices[0].id, 'pc4');
  assert.match(recovered.notice, /Recovered last-known-good snapshot/);
});

test('an interrupted session prefers previous even when current parses', () => {
  const storage = new MemoryStorage();
  const { context } = moduleHarness(storage);
  const Store = vm.runInContext('BrowserSnapshotStore', context);
  const keys = vm.runInContext('RECOVERY_KEYS', context);
  const store = new Store(storage);
  store.save(workspace(1));
  store.save(workspace(2));
  storage.setItem(keys.active, '1');

  const recovered = store.recover();
  assert.equal(recovered.source, 'previous');
  assert.equal(recovered.workspace.devices[0].id, 'pc1');
  assert.match(recovered.notice, /interrupted session/);
});

test('only explicit validated loads replace last-known-good', () => {
  const storage = new MemoryStorage();
  const { context } = moduleHarness(storage);
  const Store = vm.runInContext('BrowserSnapshotStore', context);
  const keys = vm.runInContext('RECOVERY_KEYS', context);
  const store = new Store(storage);
  store.markKnownGood(workspace(1));
  store.save(workspace(2));
  store.save(workspace(3));
  assert.equal(JSON.parse(storage.getItem(keys.good)).devices[0].id, 'pc1');
  assert.equal(store.markKnownGood({ devices: [] }), false);
  assert.equal(JSON.parse(storage.getItem(keys.good)).devices[0].id, 'pc1');

  store.markKnownGood(workspace(7));
  assert.equal(JSON.parse(storage.getItem(keys.good)).devices[0].id, 'pc7');
});

test('session history retains exactly 100 undo steps and redoes them all', () => {
  const storage = new MemoryStorage();
  const { context } = moduleHarness(storage);
  const History = vm.runInContext('SessionWorkspaceHistory', context);
  const history = new History(storage);
  history.record(workspace(0));
  for (let step = 1; step <= 105; step++) history.record(workspace(step));
  assert.equal(history.undoStack.length, 100);

  for (let step = 104; step >= 5; step--) {
    assert.equal(history.undo().devices[0].id, `pc${step}`);
  }
  assert.equal(history.undo(), null);
  for (let step = 6; step <= 105; step++) {
    assert.equal(history.redo().devices[0].id, `pc${step}`);
  }
  assert.equal(history.redo(), null);
});

test('session history and its redo stack survive reload', () => {
  const storage = new MemoryStorage();
  const { context } = moduleHarness(storage);
  const History = vm.runInContext('SessionWorkspaceHistory', context);
  const first = new History(storage);
  first.record(workspace(0));
  first.record(workspace(1));
  first.record(workspace(2));
  assert.equal(first.undo().devices[0].id, 'pc1');

  const reloaded = new History(storage);
  assert.equal(JSON.parse(reloaded.current).devices[0].id, 'pc1');
  assert.equal(reloaded.undo().devices[0].id, 'pc0');
  assert.equal(reloaded.redo().devices[0].id, 'pc1');
});

test('a new edit after undo clears the persisted redo stack', () => {
  const storage = new MemoryStorage();
  const { context } = moduleHarness(storage);
  const History = vm.runInContext('SessionWorkspaceHistory', context);
  const history = new History(storage);
  history.record(workspace(0));
  history.record(workspace(1));
  history.undo();
  history.record(workspace(2));
  assert.equal(history.redo(), null);
  assert.equal(new History(storage).redo(), null);
});

test('boot uses recovery fallback and puts the notice in the existing status UI', async () => {
  const app = applicationHarness(workspace(9));
  const keys = vm.runInContext('RECOVERY_KEYS', app.context);
  app.localStorage.setItem(keys.current, '{broken');
  app.localStorage.setItem(keys.previous, JSON.stringify(workspace(3)));

  await vm.runInContext('boot()', app.context);
  const restored = vm.runInContext('data', app.context);
  assert.equal(restored.devices[0].id, 'pc3');
  assert.equal(app.notices.at(-1).failed, true);
  assert.match(app.notices.at(-1).message, /Recovered previous snapshot/);
});

test('existing undo and redo actions navigate persisted session snapshots', async () => {
  const app = applicationHarness(workspace(0));
  await vm.runInContext('boot()', app.context);
  vm.runInContext(`setData(${JSON.stringify(workspace(1))}); setData(${JSON.stringify(workspace(2))});`, app.context);

  const undone = await vm.runInContext("api('/api/undo')", app.context);
  assert.equal(plain(undone).devices[0].id, 'pc1');
  assert.equal(vm.runInContext('data.devices[0].id', app.context), 'pc1');
  const redone = await vm.runInContext("api('/api/redo')", app.context);
  assert.equal(plain(redone).devices[0].id, 'pc2');
  assert.deepEqual(app.calls, ['/api/undo', '/api/redo']);
});

test('successful import responses update last-known-good through the existing fetch API', async () => {
  const app = applicationHarness(workspace(0));
  const keys = vm.runInContext('RECOVERY_KEYS', app.context);
  const response = await app.window.fetch('/api/import', { method: 'POST' });
  await response.json();
  assert.equal(JSON.parse(app.localStorage.getItem(keys.good)).devices[0].id, 'pc50');
});

test('open-anyway responses never replace last-known-good', async () => {
  const recovered = { ...workspace(51), problems: [{ severity: 'error', message: 'dropped' }], dropped: 1 };
  const app = applicationHarness(workspace(0), recovered);
  const keys = vm.runInContext('RECOVERY_KEYS', app.context);
  const store = new (vm.runInContext('BrowserSnapshotStore', app.context))(app.localStorage);
  store.markKnownGood(workspace(4));
  const response = await app.window.fetch('/api/import?openAnyway=true', { method: 'POST' });
  await response.json();
  assert.equal(JSON.parse(app.localStorage.getItem(keys.good)).devices[0].id, 'pc4');
});

test('workspace edits autosave only the latest snapshot after a one-second debounce', async () => {
  const app = applicationHarness(workspace(0));
  const keys = vm.runInContext('RECOVERY_KEYS', app.context);
  await vm.runInContext('boot()', app.context);
  vm.runInContext(`setData(${JSON.stringify(workspace(1))}); setData(${JSON.stringify(workspace(2))});`, app.context);

  assert.equal(JSON.parse(app.localStorage.getItem(keys.current)).devices[0].id, 'pc0');
  assert.equal(app.timers.size, 1);
  assert.equal([...app.timers.values()][0].delay, 1000);
  app.flushTimers();
  assert.equal(JSON.parse(app.localStorage.getItem(keys.current)).devices[0].id, 'pc2');
  assert.equal(JSON.parse(app.localStorage.getItem(keys.previous)).devices[0].id, 'pc0');
});

test('boot offers Restore last session and a decline keeps the server workspace', async () => {
  const app = applicationHarness(workspace(9));
  const keys = vm.runInContext('RECOVERY_KEYS', app.context);
  app.localStorage.setItem(keys.current, JSON.stringify(workspace(3)));
  const prompts = [];
  app.window.confirm = (message) => { prompts.push(message); return false; };

  await vm.runInContext('boot()', app.context);
  assert.equal(prompts.length, 1);
  assert.match(prompts[0], /Restore last session/);
  assert.equal(vm.runInContext('data.devices[0].id', app.context), 'pc9');
});

test('accepting Restore last session loads the browser snapshot', async () => {
  const app = applicationHarness(workspace(9));
  const keys = vm.runInContext('RECOVERY_KEYS', app.context);
  app.localStorage.setItem(keys.current, JSON.stringify(workspace(3)));
  app.window.confirm = () => true;

  await vm.runInContext('boot()', app.context);
  assert.equal(vm.runInContext('data.devices[0].id', app.context), 'pc3');
});
