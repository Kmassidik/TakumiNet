'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '../..');
const source = fs.readFileSync(path.join(root, 'web/js/actions.js'), 'utf8');
const html = fs.readFileSync(path.join(root, 'web/index.html'), 'utf8');

test('the Note tool arms placement and says how to place a note', () => {
  const statuses = [];
  const context = vm.createContext({
    console, icon3d: (k) => k, status: (m) => statuses.push(m), sfx() {},
    document: { querySelector: () => null, getElementById: () => null },
  });
  vm.runInContext(source, context);
  vm.runInContext('ACTIONS["add-note"]()', context);
  assert.equal(vm.runInContext('noteMode', context), true);
  assert.match(statuses.at(-1), /Click the canvas to place a note/);
});

test('the Note button is in the toolbar', () => {
  assert.match(html, /data-action="add-note"/);
});
