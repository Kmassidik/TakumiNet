'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '../..');
const read = (name) => fs.readFileSync(path.join(root, name), 'utf8');

test('the IP dialog shows the warning the engine sends and keeps the dialog open', () => {
  const source = read('web/js/ip_dialog.js');
  assert.match(source, /ip-warning/);
  assert.match(source, /d\.warning/);
  assert.match(source, /const warn = saved && saved\.warning/);
});

test('the device window config tab shows the duplicate warning', () => {
  const source = read('web/js/device_tabs.js');
  assert.match(source, /if \(d\.warning\)/);
  assert.match(source, /ip-warning/);
});
