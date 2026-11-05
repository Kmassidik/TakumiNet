'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '../..');
const source = fs.readFileSync(path.join(root, 'web/js/context_menu.js'), 'utf8');

function harness({ selectionIds = [], clipboard = null, pick = { port: null } } = {}) {
  const calls = { actions: [], api: [], status: [], opened: [], selections: [], portAsks: [] };
  const wrap = { classes: new Set() };
  wrap.classList = { add: (c) => wrap.classes.add(c), remove: (c) => wrap.classes.delete(c) };
  let chipUpdates = 0;
  const context = vm.createContext({
    console,
    document: { querySelector: (sel) => (sel === '.canvas-wrap' ? wrap : null) },
    window: { innerWidth: 1200, innerHeight: 800 },
    choosePort: async (d, kind, at) => { calls.portAsks.push({ id: d.id, kind, at }); return pick; },
    data: {
      devices: [
        { id: 'd1', name: 'PC0', kind: 'pc' },
        { id: 'd2', name: 'Router0', kind: 'router' },
      ],
    },
    CONSOLE_KINDS: new Set(['router', 'switch']),
    CABLE_TYPES: [
      ['eCopper', 'Copper'], ['eCross', 'Cross'], ['eSerial', 'Serial'],
      ['eFiber', 'Fiber'], ['eConsole', 'Console'], ['ePhone', 'Phone'], ['eCoax', 'Coax'],
    ],
    cableMode: false, cableKind: 'eCopper', cableFrom: null, cableFromPort: null, pduMode: true,
    selection: new Set(selectionIds),
    selectionCount: () => selectionIds.length,
    selectedLink: null,
    clipboard,
    setSelection: (ids) => calls.selections.push(ids),
    status: (m) => calls.status.push(m),
    updateCableChip: () => { chipUpdates += 1; },
    cableStatusText: () => 'armed text',
    renderPalette() {}, renderTopology() {}, sfx() {},
    api: async (p, params) => { calls.api.push({ p, params }); return {}; },
    ACTIONS: {
      delete: () => calls.actions.push('delete'),
      'collapse-group': () => calls.actions.push('collapse-group'),
      paste: () => calls.actions.push('paste'),
      'zoom-fit': () => calls.actions.push('zoom-fit'),
    },
    openTerm: (d) => calls.opened.push(`cli:${d.id}`),
    openDeviceWindow: (d) => calls.opened.push(`window:${d.id}`),
    openGroupCard: (g) => calls.opened.push(`card:${g.id}`),
    askText: async () => null,
  });
  vm.runInContext(source, context);
  context.chipUpdates = () => chipUpdates;
  return { context, calls, wrap };
}

/* Host-side copies: structures born inside the vm context carry its own
   prototypes, which deep equality would reject. */
const labels = (items) => Array.from(items, (i) => i.label);
const joined = (list) => Array.from(list, (ids) => Array.from(ids).join(','));

test('a plain device offers open, cables, rename, duplicate and delete — no CLI', () => {
  const { context } = harness();
  const items = context.contextMenuFor({ device: context.data.devices[0] });
  assert.deepEqual(labels(items), ['Open', 'Connect cable', 'Rename…', 'Duplicate', 'Delete']);
});

test('a console-capable device also offers Open CLI, wired to the terminal', () => {
  const { context, calls } = harness();
  const items = context.contextMenuFor({ device: context.data.devices[1] });
  assert.deepEqual(labels(items), ['Open', 'Open CLI', 'Connect cable', 'Rename…', 'Duplicate', 'Delete']);
  items.find((i) => i.label === 'Open CLI').run();
  assert.deepEqual(calls.opened, ['cli:d2']);
});

test('the cable submenu lists five cables and arms one with the pressed device as first end', async () => {
  const { context, calls, wrap } = harness({ pick: { port: 'GigabitEthernet0/1' } });
  const items = context.contextMenuFor({ device: context.data.devices[0] });
  const cables = items.find((i) => i.label === 'Connect cable').children;
  assert.deepEqual(labels(cables), ['Copper', 'Cross', 'Serial', 'Fiber', 'Console']);
  await cables.find((c) => c.label === 'Cross').run();
  assert.equal(calls.portAsks.length, 1);
  assert.equal(calls.portAsks[0].id, 'd1');
  assert.equal(calls.portAsks[0].kind, 'eCross');
  assert.deepEqual({ ...calls.portAsks[0].at }, { x: 600, y: 400 });
  assert.equal(vm.runInContext('cableMode', context), true);
  assert.equal(vm.runInContext('cableKind', context), 'eCross');
  assert.equal(vm.runInContext('cableFrom', context), 'd1');
  assert.equal(vm.runInContext('cableFromPort', context), 'GigabitEthernet0/1');
  assert.equal(vm.runInContext('pduMode', context), false);
  assert.equal(context.chipUpdates(), 1);
  assert.equal(wrap.classes.has('cable-mode'), true);
  assert.deepEqual(calls.status, ['armed text']);
});

test('a cancelled port chooser from the menu leaves nothing armed', async () => {
  const { context, calls, wrap } = harness({ pick: { cancelled: true } });
  const items = context.contextMenuFor({ device: context.data.devices[0] });
  const cables = items.find((i) => i.label === 'Connect cable').children;
  await cables.find((c) => c.label === 'Copper').run();
  assert.equal(vm.runInContext('cableMode', context), false);
  assert.equal(vm.runInContext('cableFrom', context), null);
  assert.equal(context.chipUpdates(), 0);
  assert.equal(wrap.classes.has('cable-mode'), false);
  assert.deepEqual(calls.status, []);
});

test('Delete on a device selects it and fires the shared delete action', () => {
  const { context, calls } = harness();
  const items = context.contextMenuFor({ device: context.data.devices[0] });
  items.find((i) => i.label === 'Delete').run();
  assert.deepEqual(joined(calls.selections), ['d1']);
  assert.deepEqual(calls.actions, ['delete']);
});

test('a device inside a multi-selection speaks for the whole selection', () => {
  const { context, calls } = harness({ selectionIds: ['d1', 'd2'] });
  const items = context.contextMenuFor({ device: context.data.devices[0] });
  assert.deepEqual(labels(items), ['Collapse into one node', 'Delete 2 devices']);
  items[0].run();
  items[1].run();
  assert.deepEqual(calls.actions, ['collapse-group', 'delete']);
});

test('a cable offers delete only, wired through the selected link', () => {
  const { context, calls } = harness();
  const items = context.contextMenuFor({ link: { a: 'd1', b: 'd2' } });
  assert.deepEqual(labels(items), ['Delete cable']);
  items[0].run();
  assert.equal(vm.runInContext('selectedLink.a', context), 'd1');
  assert.equal(vm.runInContext('selectedLink.b', context), 'd2');
  assert.deepEqual(calls.actions, ['delete']);
});

test('a group node offers expand and its card', async () => {
  const { context, calls } = harness();
  const items = context.contextMenuFor({ group: { id: 'g1', name: 'Branch' } });
  assert.deepEqual(labels(items), ['Expand', 'Node card']);
  await items[0].run();
  items[1].run();
  assert.equal(calls.api.length, 1);
  assert.equal(calls.api[0].p, '/api/groups/expand');
  assert.equal(calls.api[0].params.id, 'g1');
  assert.deepEqual(calls.opened, ['card:g1']);
});

test('empty canvas offers paste, zoom to fit and select all; paste needs a clipboard', () => {
  const empty = harness();
  const items = empty.context.contextMenuFor({});
  assert.deepEqual(labels(items), ['Paste', 'Zoom to fit', 'Select all']);
  assert.equal(items[0].disabled, true);
  items[2].run();
  assert.deepEqual(joined(empty.calls.selections), ['d1,d2']);
  const full = harness({ clipboard: 'd1' });
  assert.equal(full.context.contextMenuFor({})[0].disabled, false);
});

test('each replace option says what it clears, once', () => {
  const h = harness();
  const device = h.context.data.devices[0];
  device.replaceModels = ['Switch 24', 'Switch L3'];
  device.replaceClears = { 'Switch 24': ['Layer-2 guard settings'], 'Switch L3': [] };
  const items = h.context.deviceContextItems(device);
  const replace = items.find((item) => item.label === 'Replace with…');
  const children = typeof replace.children === 'function' ? replace.children() : replace.children;
  const labels = Array.from(children, (item) => item.label);
  assert.deepEqual(labels, [
    'Switch 24 — clears layer-2 guard settings',
    'Switch L3 — nothing cleared',
  ]);
  assert.ok(children.every((item) => !item.disabled));
});
