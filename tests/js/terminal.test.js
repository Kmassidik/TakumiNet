'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const source = fs.readFileSync(path.resolve(__dirname, '../../web/js/terminal.js'), 'utf8');

class Element {
  constructor() {
    this.hidden = false;
    this.disabled = false;
    this.value = '';
    this.textContent = '';
    this.scrollTop = 0;
    this.scrollHeight = 100;
  }
  focus() {}
  addEventListener() {}
}

test('terminal output returns immediately while live port state refreshes behind it', async () => {
  const ids = ['term-window', 'term-out', 'term-in', 'term-prompt', 'term-title'];
  const elements = Object.fromEntries(ids.map((id) => [id, new Element()]));
  const refreshes = [];
  const snapshots = [];
  const context = vm.createContext({
    document: {
      getElementById: (id) => elements[id],
      addEventListener() {}, removeEventListener() {},
    },
    data: { devices: [{ id: 'router0', name: 'Router0', kind: 'router' }] },
    URLSearchParams,
    bringToFront() {},
    jsonRequest: async () => ({}),
    fetch: async (path) => ({
      json: async () => ({ output: path.includes('line=shutdown') ? '%LINK-5-CHANGED\n' : '', prompt: 'Router0(config-if)#' }),
    }),
    getJson: (path) => new Promise((resolve) => refreshes.push({ path, resolve })),
    setData: (snapshot) => snapshots.push(snapshot),
  });
  vm.runInContext(source, context);
  await context.openTerm(context.data.devices[0]);
  for (let i = 0; i < 5; i++) await Promise.resolve();

  elements['term-in'].value = 'shutdown';
  await elements['term-in'].onkeydown({ key: 'Enter' });
  assert.match(elements['term-out'].textContent, /%LINK-5-CHANGED/);
  assert.equal(elements['term-in'].disabled, false);
  assert.equal(refreshes.length, 1);
  assert.equal(refreshes[0].path, '/api/workspace');
  assert.equal(snapshots.length, 0, 'terminal output must not wait for the refresh');

  const snapshot = { devices: [], links: [], events: [] };
  refreshes[0].resolve(snapshot);
  await Promise.resolve();
  assert.deepEqual(snapshots, [snapshot]);
});
