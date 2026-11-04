'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '../..');
const realtime = fs.readFileSync(path.join(root, 'web/js/realtime.js'), 'utf8');
const chrome = fs.readFileSync(path.join(root, 'web/js/chrome.js'), 'utf8');

function modeButton(label) {
  return {
    textContent: label,
    classList: {
      classes: new Set(label === 'Realtime' ? ['active'] : []),
      add(c) { this.classes.add(c); },
      remove(c) { this.classes.delete(c); },
    },
    onclick: null,
  };
}

function realtimeContext() {
  const timers = { started: [], cleared: [], next: 1 };
  const apiCalls = [];
  const statuses = [];
  const buttons = [modeButton('Realtime'), modeButton('Simulation')];
  const context = vm.createContext({
    console,
    setInterval: (fn, ms) => {
      const id = timers.next++;
      timers.started.push({ id, fn, ms });
      return id;
    },
    clearInterval: (id) => timers.cleared.push(id),
    api: async (apiPath, params) => {
      apiCalls.push({ path: apiPath, params });
      return { devices: [] };
    },
    status: (msg) => statuses.push(msg),
    document: {
      activeElement: null,
      addEventListener() {},
      querySelector: (sel) => (sel === '.modes .mode.active'
        ? buttons.find((b) => b.classList.classes.has('active')) || null
        : null),
      querySelectorAll: (sel) => (sel === '.modes .mode' ? buttons : []),
      getElementById: (id) => (['show-all', 'show-none', 'status-mode'].includes(id)
        ? { textContent: '', onclick: null, hidden: false }
        : null),
    },
  });
  vm.runInContext(realtime, context);
  vm.runInContext(chrome, context);
  vm.runInContext('wireActions()', context);
  const live = () => timers.started.filter((t) => !timers.cleared.includes(t.id));
  return { context, timers, apiCalls, statuses, buttons, live };
}

test('realtime mode starts exactly one interval at boot', () => {
  const { live, statuses } = realtimeContext();
  assert.equal(live().length, 1);
  assert.equal(live()[0].ms, 2000);
  assert.ok(statuses.includes('Realtime: the network is breathing'));
});

test('switching to simulation stops the interval; back restarts one', () => {
  const { buttons, live } = realtimeContext();
  const [realtimeBtn, simulationBtn] = buttons;
  simulationBtn.onclick();
  assert.equal(live().length, 0, 'simulation mode is quiet');
  realtimeBtn.onclick();
  assert.equal(live().length, 1, 'realtime breathes again');
});

test('repeated toggles never stack intervals', () => {
  const { buttons, live, timers } = realtimeContext();
  const [realtimeBtn, simulationBtn] = buttons;
  for (let i = 0; i < 5; i++) realtimeBtn.onclick();
  assert.equal(live().length, 1, 'start is idempotent');
  for (let i = 0; i < 5; i++) simulationBtn.onclick();
  assert.equal(live().length, 0, 'stop is idempotent');
  assert.equal(timers.started.length, 1, 'only one interval was ever created');
});

test('each tick posts /api/sim/tick and applies the reply through api()', async () => {
  const { live, apiCalls } = realtimeContext();
  await live()[0].fn();
  await live()[0].fn();
  assert.equal(apiCalls.length, 2);
  for (const call of apiCalls) {
    assert.equal(call.path, '/api/sim/tick');
    assert.equal(call.params.seconds, 2);
    assert.equal(Object.keys(call.params).length, 1);
  }
});
