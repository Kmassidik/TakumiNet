'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '../..');
const read = (name) => fs.readFileSync(path.join(root, name), 'utf8');

function load() {
  const chip = { textContent: '', hidden: true };
  const listeners = {};
  const messages = [];
  const storage = new Map();
  const context = vm.createContext({
    console,
    document: {
      getElementById: (id) => (id === 'pdu-queue' ? chip : null),
      addEventListener: (name, fn) => { listeners[name] = fn; },
    },
    window: { addEventListener: (name, fn) => { listeners[name] = fn; } },
    sessionStorage: {
      getItem: (k) => (storage.has(k) ? storage.get(k) : null),
      setItem: (k, v) => storage.set(k, v),
      removeItem: (k) => storage.delete(k),
    },
    status: (text) => messages.push(text),
  });
  vm.runInContext(read('web/js/simulation.js'), context);
  return { context, chip, listeners, messages, storage };
}

test('the queue chip shows one or many waiting sends', () => {
  const h = load();
  h.context.queuedPduCount = 0;
  h.context.renderPduQueue();
  assert.equal(h.chip.hidden, true);
  h.context.queuedPduCount = 1;
  h.context.renderPduQueue();
  assert.equal(h.chip.textContent, '1 send waiting');
  assert.equal(h.chip.hidden, false);
  h.context.queuedPduCount = 3;
  h.context.renderPduQueue();
  assert.equal(h.chip.textContent, '3 sends waiting');
});

test('a reload with queued sends says they were cleared', () => {
  const h = load();
  h.context.queuedPduCount = 2;
  h.listeners.beforeunload();
  assert.equal(h.storage.get('takumi:queue-cleared'), '1');
  h.context.queuedPduCount = 0;
  h.listeners.DOMContentLoaded();
  assert.match(h.messages[0], /send queue was cleared/);
  assert.equal(h.storage.has('takumi:queue-cleared'), false);
});

test('the phone screen says what to do, in plain words', () => {
  const html = read('web/index.html');
  assert.match(html, /Open Takumi on a wider screen/);
  assert.match(html, /Open this page on a computer or a tablet, or make this window wider/);
});
