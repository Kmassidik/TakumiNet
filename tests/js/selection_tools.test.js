'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '../..');
/* Objects born inside the vm have another realm's prototypes; deepEqual wants plain ones. */
const plain = (v) => JSON.parse(JSON.stringify(v));
const interaction = fs.readFileSync(path.join(root, 'web/js/interaction.js'), 'utf8');
const actions = fs.readFileSync(path.join(root, 'web/js/actions.js'), 'utf8');

function dragHarness(selectedIds) {
  const sel = new Set(selectedIds);
  const apiCalls = [];
  const windowEvents = {};
  let tick = 0;
  const context = vm.createContext({
    console,
    document: { getElementById: () => ({ hidden: true, style: {}, textContent: '' }) },
    window: {
      addEventListener: (type, fn) => { windowEvents[type] = fn; },
      removeEventListener: (type) => { delete windowEvents[type]; },
    },
    performance: { now: () => (tick += 1000) },
    data: {
      devices: [
        { id: 'a', name: 'PC0', model: 'PC-PT', x: 10, y: 20 },
        { id: 'b', name: 'PC1', model: 'PC-PT', x: 100, y: 200 },
        { id: 'c', name: 'PC2', model: 'PC-PT', x: 500, y: 600 },
      ],
    },
    selection: sel,
    setSelection: (ids) => { sel.clear(); ids.forEach((id) => sel.add(id)); },
    toggleSelection: (id) => { if (sel.has(id)) sel.delete(id); else sel.add(id); },
    selectionCount: () => sel.size,
    selectedLink: null,
    pduMode: false,
    cableMode: false,
    lastClick: null,
    drag: null,
    toSvg: (ev) => ({ x: ev.x, y: ev.y }),
    api: async (p, params) => { apiCalls.push({ p, params }); return {}; },
    status() {}, syncSelectionClasses() {}, renderEvents() {}, renderTopology() {},
  });
  vm.runInContext(interaction, context);
  const press = (device) => context.startDrag({
    preventDefault() {}, shiftKey: false, ctrlKey: false, metaKey: false, x: 0, y: 0,
  }, device);
  return { context, sel, apiCalls, windowEvents, press };
}

test('dragging a device inside the selection moves every selected device', async () => {
  const h = dragHarness(['a', 'b']);
  h.press(h.context.data.devices[0]);
  assert.deepEqual([...h.sel].sort(), ['a', 'b']);
  h.windowEvents.pointermove({ x: 30, y: 5 });
  const [a, b, c] = h.context.data.devices;
  assert.deepEqual([a.x, a.y], [40, 25]);
  assert.deepEqual([b.x, b.y], [130, 205]);
  assert.deepEqual([c.x, c.y], [500, 600]);
  await h.windowEvents.pointerup();
  assert.deepEqual(plain(h.apiCalls), [
    { p: '/api/devices/move', params: { id: 'a', x: 40, y: 25 } },
    { p: '/api/devices/move', params: { id: 'b', x: 130, y: 205 } },
  ]);
});

test('pressing a device outside the selection still selects just it', async () => {
  const h = dragHarness(['b', 'c']);
  h.press(h.context.data.devices[0]);
  assert.deepEqual([...h.sel], ['a']);
  h.windowEvents.pointermove({ x: 10, y: 0 });
  await h.windowEvents.pointerup();
  assert.deepEqual(plain(h.apiCalls), [{ p: '/api/devices/move', params: { id: 'a', x: 20, y: 20 } }]);
});

test('a plain click saves nothing', async () => {
  const h = dragHarness(['a', 'b']);
  h.press(h.context.data.devices[0]);
  h.windowEvents.pointermove({ x: 1, y: 0 });
  await h.windowEvents.pointerup();
  assert.deepEqual(h.apiCalls, []);
});

function deleteHarness(selectedIds, link) {
  const sel = new Set(selectedIds);
  const apiCalls = [];
  const context = vm.createContext({
    console,
    selection: sel,
    selected: selectedIds[selectedIds.length - 1] || null,
    setSelection: (ids) => { sel.clear(); ids.forEach((id) => sel.add(id)); },
    selectedLink: link || null,
    api: async (p, params) => { apiCalls.push({ p, params }); return {}; },
    status() {}, sfx() {},
  });
  vm.runInContext(actions, context);
  const runDelete = () => vm.runInContext('ACTIONS.delete()', context);
  return { context, sel, apiCalls, runDelete };
}

test('delete removes every selected device, not just the last one', async () => {
  const h = deleteHarness(['a', 'b', 'c']);
  await h.runDelete();
  assert.deepEqual(h.apiCalls.map((c) => c.p), ['/api/devices/delete', '/api/devices/delete', '/api/devices/delete']);
  assert.deepEqual(h.apiCalls.map((c) => c.params.id).sort(), ['a', 'b', 'c']);
  assert.equal(h.sel.size, 0);
});

test('delete takes the selected cable and the selected devices together', async () => {
  const h = deleteHarness(['a'], { a: 'x', b: 'y' });
  await h.runDelete();
  assert.deepEqual(plain(h.apiCalls[0]), { p: '/api/links/delete', params: { a: 'x', b: 'y' } });
  assert.deepEqual(plain(h.apiCalls[1]), { p: '/api/devices/delete', params: { id: 'a' } });
  assert.equal(vm.runInContext('selectedLink', h.context), null);
});

test('delete with nothing selected only reports', async () => {
  const statuses = [];
  const h = deleteHarness([]);
  h.context.status = (m) => statuses.push(m);
  await h.runDelete();
  assert.deepEqual(h.apiCalls, []);
  assert.deepEqual(statuses, ['Nothing selected']);
});
