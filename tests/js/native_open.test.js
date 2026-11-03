'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '../..');
const source = fs.readFileSync(path.join(root, 'web/js/actions.js'), 'utf8');

test('open lists located problems and retries only after confirmation', async () => {
  const calls = [];
  const notices = [];
  const confirmations = [];
  const context = vm.createContext({
    console,
    async getJson() { return { names: ['broken'] }; },
    async askText() { return 'broken'; },
    async askConfirm(message) { confirmations.push(message); return true; },
    async api(path, params) {
      calls.push({ path, params });
      if (!params.openAnyway) {
        return {
          error: 'line 4: <link> broken', canOpenAnyway: true,
          problems: [{ text: 'line 4: <link> refers to missing device', severity: 'error' }],
        };
      }
      return { devices: [], problems: [{ severity: 'error', text: 'dropped link' }], dropped: 1 };
    },
    status(message) { notices.push(message); },
    sfx() {},
    currentName: 'lab1',
    simCursor: -1,
  });
  vm.runInContext(source, context);
  await vm.runInContext('ACTIONS.open()', context);
  assert.equal(calls.length, 2);
  assert.equal(calls[1].params.openAnyway, 'true');
  assert.match(confirmations[0], /line 4: <link>/);
  assert.match(confirmations[0], /Open anyway without the broken parts/);
  assert.equal(notices.at(-1), 'Opened without 1 broken record');
});

test('open leaves the workspace alone when recovery is declined', async () => {
  let calls = 0;
  const context = vm.createContext({
    console,
    async getJson() { return { names: ['broken'] }; },
    async askText() { return 'broken'; },
    async askConfirm() { return false; },
    async api() { calls++; return { error: 'bad', canOpenAnyway: true, problems: [] }; },
    status() {}, sfx() {}, currentName: 'lab1', simCursor: -1,
  });
  vm.runInContext(source, context);
  await vm.runInContext('ACTIONS.open()', context);
  assert.equal(calls, 1);
});
