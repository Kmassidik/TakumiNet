'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '../..');
const source = ['web/js/cable_feedback.js', 'web/js/interaction.js']
  .map((f) => fs.readFileSync(path.join(root, f), 'utf8'))
  .join('\n');

function harness({ linkError = null } = {}) {
  const els = { tip: { hidden: true, style: {} }, 'cable-chip': { hidden: true }, 'link-toast': { hidden: true } };
  const listeners = { pointermove: [], pointerup: [] };
  const apiCalls = [];
  const statuses = [];
  let deviceUnderPointer = null;
  const context = vm.createContext({
    console,
    setTimeout: () => 0,
    clearTimeout: () => {},
    performance: { now: () => 0 },
    document: { getElementById: (id) => els[id] },
    window: {
      addEventListener: (name, fn) => listeners[name] && listeners[name].push(fn),
      removeEventListener: (name, fn) => {
        if (listeners[name]) listeners[name] = listeners[name].filter((f) => f !== fn);
      },
    },
    data: { devices: [{ id: 'd1', name: 'PC0', x: 10, y: 20 }, { id: 'd2', name: 'PC1', x: 200, y: 20 }] },
    CABLE_TYPES: [['eCross', 'Cross', 'cross', 'Copper Cross-Over']],
    cableMode: true, cableKind: 'eCross', cableFrom: null, pduMode: false,
    workspaceCanvas: { deviceAt: () => deviceUnderPointer },
    toSvg: (ev) => ({ x: ev.x, y: ev.y }),
    status: (m) => statuses.push(m),
    setSelection() {}, renderTopology() {}, sfx() {},
    api: async (p, params) => { apiCalls.push({ p, params }); return linkError ? { error: linkError } : {}; },
  });
  vm.runInContext(source, context);
  const press = (id) => context.startDrag({ preventDefault() {} }, context.data.devices.find((d) => d.id === id));
  const release = (overId) => {
    deviceUnderPointer = overId ? { id: overId } : null;
    for (const fn of listeners.pointerup.splice(0)) fn({ clientX: 0, clientY: 0 });
  };
  return { context, els, listeners, apiCalls, statuses, press, release };
}

test('pressing a device in cable mode anchors the cable and never moves the device', () => {
  const h = harness();
  h.press('d1');
  assert.equal(vm.runInContext('cableFrom', h.context), 'd1');
  // No move handler was installed, so dragging cannot change the position.
  assert.equal(h.listeners.pointermove.length, 0);
  assert.equal(h.context.data.devices[0].x, 10);
  assert.equal(h.context.data.devices[0].y, 20);
});

test('releasing the drag over another device posts the same link as click-click', async () => {
  const h = harness();
  h.press('d1');
  h.release('d2');
  await Promise.resolve();
  assert.equal(h.apiCalls.length, 1);
  assert.equal(h.apiCalls[0].p, '/api/links');
  assert.equal(h.apiCalls[0].params.a, 'd1');
  assert.equal(h.apiCalls[0].params.b, 'd2');
  assert.equal(h.apiCalls[0].params.kind, 'eCross');
  assert.equal(vm.runInContext('cableFrom', h.context), null);
});

test('releasing over empty canvas keeps the pending end, and click-click still finishes', async () => {
  const h = harness();
  h.press('d1');
  h.release(null);
  assert.equal(h.apiCalls.length, 0);
  assert.equal(vm.runInContext('cableFrom', h.context), 'd1');
  h.press('d2');
  await Promise.resolve();
  assert.equal(h.apiCalls.length, 1);
  assert.equal(h.apiCalls[0].params.a, 'd1');
  assert.equal(h.apiCalls[0].params.b, 'd2');
});

test('releasing on the pressed device itself keeps the pending end for the far click', () => {
  const h = harness();
  h.press('d1');
  h.release('d1');
  assert.equal(h.apiCalls.length, 0);
  assert.equal(vm.runInContext('cableFrom', h.context), 'd1');
});

test('a refused drag link keeps the toast behaviour', async () => {
  const refusal = 'these two cannot be joined by this cable';
  const h = harness({ linkError: refusal });
  h.press('d1');
  h.release('d2');
  await new Promise((resolve) => setImmediate(resolve));
  assert.equal(h.els['link-toast'].hidden, false);
  assert.equal(h.els['link-toast'].textContent, refusal);
});
