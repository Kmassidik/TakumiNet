'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '../..');
const chrome = fs.readFileSync(path.join(root, 'web/js/chrome.js'), 'utf8');
const actions = fs.readFileSync(path.join(root, 'web/js/actions.js'), 'utf8');

function keyboardContext(extra = {}) {
  const calls = [];
  let handler = null;
  const context = vm.createContext({
    console,
    document: {
      activeElement: null,
      querySelector: () => null,
      querySelectorAll: () => [],
      getElementById: () => null,
      addEventListener: (type, fn) => { if (type === 'keydown') handler = fn; },
    },
    togglePlay: () => calls.push('play'),
    stepSim: (dir) => calls.push(`step ${dir}`),
    ACTIONS: {
      undo: () => calls.push('undo'),
      redo: () => calls.push('redo'),
      copy: () => calls.push('copy'),
      paste: () => calls.push('paste'),
      save: () => calls.push('save'),
      delete: () => calls.push('delete'),
      'zoom-fit': () => calls.push('fit'),
    },
    leaveCableMode: () => calls.push('leave-cable'),
    setSelection: () => calls.push('clear-selection'),
    renderPalette() {},
    renderTopology() {},
    pduMode: true,
    pduFrom: 'pc1',
    noteMode: true,
    selectedLink: { a: 'pc1', b: 'sw1' },
    ...extra,
  });
  vm.runInContext(chrome, context);
  vm.runInContext('wireKeyboard()', context);
  return { context, calls, press: (key, mods = {}) => handler({
    key,
    ctrlKey: false,
    metaKey: false,
    altKey: false,
    shiftKey: false,
    repeat: false,
    defaultPrevented: false,
    preventDefault() {},
    ...mods,
  }) };
}

test('Space no longer toggles playback; P does', () => {
  const { calls, press } = keyboardContext();
  press(' ');
  assert.deepEqual(calls, []);
  press('p');
  assert.deepEqual(calls, ['play']);
});

test('a held key auto-repeating does nothing', () => {
  const { calls, press } = keyboardContext();
  press('p', { repeat: true });
  press('ArrowRight', { repeat: true });
  press('z', { metaKey: true, repeat: true });
  assert.deepEqual(calls, []);
});

test('Cmd+Shift+Z redoes, Cmd+Z undoes, Ctrl+Y still redoes', () => {
  const { calls, press } = keyboardContext();
  press('z', { metaKey: true, shiftKey: true });
  press('Z', { metaKey: true, shiftKey: true });
  press('z', { metaKey: true });
  press('y', { ctrlKey: true });
  assert.deepEqual(calls, ['redo', 'redo', 'undo', 'redo']);
});

test('F zooms to fit', () => {
  const { calls, press } = keyboardContext();
  press('f');
  assert.deepEqual(calls, ['fit']);
});

test('Escape clears the selected cable and cancels note placing', () => {
  const { context, press } = keyboardContext();
  press('Escape');
  assert.equal(vm.runInContext('selectedLink', context), null);
  assert.equal(vm.runInContext('noteMode', context), false);
  assert.equal(vm.runInContext('pduMode', context), false);
  assert.equal(vm.runInContext('pduFrom', context), null);
});

test('Ctrl/Cmd+A selects every device', () => {
  const selections = [];
  const { press } = keyboardContext({
    data: { devices: [{ id: 'a' }, { id: 'b' }, { id: 'c' }] },
    setSelection: (ids) => selections.push(ids),
    status() {},
  });
  press('a', { metaKey: true });
  press('A', { ctrlKey: true });
  assert.deepEqual(selections, [['a', 'b', 'c'], ['a', 'b', 'c']]);
});

function nudgeContext(selectedIds) {
  const sel = new Set(selectedIds);
  const apiCalls = [];
  let flush = null;
  const base = keyboardContext({
    data: { devices: [{ id: 'a', x: 10, y: 20 }, { id: 'b', x: 100, y: 200 }] },
    selection: sel,
    selectionCount: () => sel.size,
    api: async (p, params) => { apiCalls.push({ p, params }); return {}; },
    setTimeout: (fn) => { flush = fn; return 1; },
    clearTimeout: () => {},
    status() {},
  });
  return { ...base, apiCalls, flush: () => flush && flush() };
}

test('arrows nudge the selection by 10px, Shift+arrow by 1px, saved once', async () => {
  const ctx = nudgeContext(['a', 'b']);
  ctx.press('ArrowRight');
  ctx.press('ArrowDown');
  ctx.press('ArrowLeft', { shiftKey: true });
  const [a, b] = vm.runInContext('data.devices', ctx.context);
  assert.deepEqual([a.x, a.y], [19, 30]);
  assert.deepEqual([b.x, b.y], [109, 210]);
  assert.deepEqual(ctx.calls, []);
  assert.deepEqual(ctx.apiCalls, []);
  await ctx.flush();
  /* Objects born inside the vm carry another realm's prototypes. */
  assert.deepEqual(JSON.parse(JSON.stringify(ctx.apiCalls)), [
    { p: '/api/devices/move', params: { id: 'a', x: 19, y: 30 } },
    { p: '/api/devices/move', params: { id: 'b', x: 109, y: 210 } },
  ]);
});

test('a held arrow keeps nudging: auto-repeat is allowed for the nudge', () => {
  const ctx = nudgeContext(['a']);
  ctx.press('ArrowRight');
  ctx.press('ArrowRight', { repeat: true });
  assert.equal(vm.runInContext('data.devices[0].x', ctx.context), 30);
});

test('with nothing selected the arrows still step the simulation', () => {
  const ctx = nudgeContext([]);
  ctx.press('ArrowRight');
  ctx.press('ArrowLeft');
  assert.deepEqual(ctx.calls, ['step 1', 'step -1']);
  assert.deepEqual(ctx.apiCalls, []);
});

test('the fit and reset actions both fit the whole network into view', () => {
  const fits = [];
  const statuses = [];
  const context = vm.createContext({
    console,
    status: (msg) => statuses.push(msg),
    sfx() {},
    workspaceCanvas: { fit: () => fits.push(1) },
  });
  vm.runInContext(actions, context);
  vm.runInContext("ACTIONS['zoom-fit']()", context);
  vm.runInContext("ACTIONS['zoom-reset']()", context);
  assert.equal(fits.length, 2);
  assert.deepEqual(statuses, ['Zoomed to fit', 'Zoom reset']);
});
