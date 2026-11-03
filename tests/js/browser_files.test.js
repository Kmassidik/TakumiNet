'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '../..');
const actionsSource = fs.readFileSync(path.join(root, 'web/js/actions.js'), 'utf8');
const chromeSource = fs.readFileSync(path.join(root, 'web/js/chrome.js'), 'utf8');

function actionsHarness() {
  const notices = [];
  const mascots = [];
  const fetches = [];
  const changes = [];
  let input;
  const document = {
    createElement(tag) {
      assert.equal(tag, 'input');
      input = { click() {}, files: [] };
      return input;
    },
  };
  const context = vm.createContext({
    console, document, URLSearchParams,
    status(message, failed) { notices.push({ message, failed }); },
    sfx() {},
    setLessonMascot(name) { mascots.push(name); },
    setData(value) { changes.push(value); },
    resetLessonState() {}, renderLesson() {}, hideGallery() {},
    currentTemplate: null, currentName: 'lab1', simCursor: -1,
    async fetch(...args) { fetches.push(args); throw new Error('unexpected fetch'); },
  });
  vm.runInContext(actionsSource, context, { filename: 'web/js/actions.js' });
  return { context, notices, mascots, fetches, changes, getInput: () => input };
}

test('import picker accepts only native .tnet files', async () => {
  const app = actionsHarness();
  await vm.runInContext('ACTIONS.import()', app.context);
  assert.equal(app.getInput().accept, '.tnet');
});

test('a non-tnet pick is rejected before reading or changing the workspace', async () => {
  const app = actionsHarness();
  await vm.runInContext('ACTIONS.import()', app.context);
  let reads = 0;
  app.getInput().files = [{ name: 'network.xml', async text() { reads++; return '<takuminet/>'; } }];
  await app.getInput().onchange();
  assert.equal(reads, 0);
  assert.equal(app.fetches.length, 0);
  assert.equal(app.changes.length, 0);
  assert.equal(app.mascots.at(-1), 'error');
  assert.equal(app.notices.at(-1).failed, true);
  assert.match(app.notices.at(-1).message, /\.tnet/);
});

test('invalid native XML reports every readable problem and preserves current data', async () => {
  const app = actionsHarness();
  await vm.runInContext('ACTIONS.import()', app.context);
  app.context.fetch = async () => ({
    ok: true,
    async json() {
      return {
        error: 'line 2: <device> id is duplicated',
        canOpenAnyway: false,
        problems: [
          { text: 'line 2: <device> id is duplicated' },
          { text: 'line 3: <link> refers to a missing device' },
        ],
      };
    },
  });
  app.getInput().files = [{ name: 'broken.tnet', async text() { return 'broken'; } }];
  await app.getInput().onchange();
  assert.equal(app.changes.length, 0);
  assert.equal(app.mascots.at(-1), 'error');
  assert.match(app.notices.at(-1).message, /line 2: <device>/);
  assert.match(app.notices.at(-1).message, /line 3: <link>/);
});

test('export downloads the current name through a Blob without a server write', async () => {
  const calls = [];
  const blob = { type: 'application/xml' };
  const anchor = {
    clicked: false, removed: false,
    click() { this.clicked = true; },
    remove() { this.removed = true; },
  };
  const context = vm.createContext({
    console,
    currentName: 'my lab',
    document: {
      body: { appendChild(value) { assert.equal(value, anchor); } },
      createElement(tag) { assert.equal(tag, 'a'); return anchor; },
    },
    URL: {
      createObjectURL(value) { assert.equal(value, blob); return 'blob:native-export'; },
      revokeObjectURL() {},
    },
    setTimeout(fn) { fn(); },
    status(message) { calls.push(['status', message]); }, sfx() {},
    async fetch(path, options) {
      calls.push(['fetch', path, options]);
      return { ok: true, async blob() { return blob; } };
    },
  });
  vm.runInContext(actionsSource, context, { filename: 'web/js/actions.js' });
  await vm.runInContext('ACTIONS.export()', context);
  assert.equal(anchor.download, 'my lab.tnet');
  assert.equal(anchor.href, 'blob:native-export');
  assert.equal(anchor.clicked, true);
  assert.equal(anchor.removed, true);
  assert.equal(calls.filter(([kind]) => kind === 'fetch').length, 1);
  assert.equal(calls.find(([kind]) => kind === 'fetch')[1], '/api/export');
  assert.equal(calls.some(([, target]) => target === '/api/save'), false);
});

test('workspace file drop imports the file instead of creating a palette device', async () => {
  const listeners = {};
  const wrap = {
    classList: { add() {}, remove() {} },
    addEventListener(name, fn) { listeners[name] = fn; },
  };
  const imports = [];
  const context = vm.createContext({
    console,
    document: { querySelector() { return wrap; } },
    async importTnetFile(file) { imports.push(file.name); },
    async api() { throw new Error('file drop must not add a device'); },
    toSvg() { throw new Error('file drop must not read canvas coordinates'); },
  });
  vm.runInContext(chromeSource, context, { filename: 'web/js/chrome.js' });
  vm.runInContext('wireCanvasDrop()', context);
  let prevented = false;
  await listeners.drop({
    preventDefault() { prevented = true; },
    dataTransfer: {
      files: [{ name: 'lesson.tnet' }],
      getData() { throw new Error('file drop must not read palette text'); },
    },
  });
  assert.equal(prevented, true);
  assert.deepEqual(imports, ['lesson.tnet']);
});
