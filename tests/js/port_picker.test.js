'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '../..');
const source = ['web/js/cable_feedback.js', 'web/js/context_menu.js', 'web/js/port_picker.js', 'web/js/interaction.js']
  .map((f) => fs.readFileSync(path.join(root, f), 'utf8'))
  .join('\n');

/* Just enough DOM for the context-menu renderer the picker reuses. */
function fakeEl(doc, tag) {
  const el = {
    tagName: tag.toUpperCase(),
    children: [],
    parentEl: null,
    className: '',
    textContent: '',
    disabled: false,
    hidden: false,
    style: {},
    attrs: {},
    listeners: {},
    offsetWidth: 120,
    offsetHeight: 90,
    setAttribute(k, v) { el.attrs[k] = v; },
    addEventListener(t, fn) { (el.listeners[t] = el.listeners[t] || []).push(fn); },
    appendChild(c) { c.remove(); c.parentEl = el; el.children.push(c); return c; },
    remove() {
      if (el.parentEl) el.parentEl.children = el.parentEl.children.filter((x) => x !== el);
      el.parentEl = null;
    },
    contains(t) { return t === el || el.children.some((c) => c.contains(t)); },
    focus() { doc.activeElement = el; },
    all() { return el.children.flatMap((c) => [c, ...c.all()]); },
    querySelectorAll(sel) {
      const buttons = el.all().filter((c) => c.tagName === 'BUTTON');
      return sel.includes(':not(:disabled)') ? buttons.filter((b) => !b.disabled) : buttons;
    },
    querySelector(sel) { return el.querySelectorAll(sel)[0] || null; },
    classList: { add() {}, remove() {}, toggle() {} },
  };
  return el;
}

function harness({ portsById = {}, linkError = null } = {}) {
  const els = { tip: { hidden: true, style: {} }, 'cable-chip': { hidden: true }, 'link-toast': { hidden: true } };
  const apiCalls = [];
  const doc = {
    activeElement: null,
    listeners: {},
    getElementById: (id) => els[id],
    querySelector: () => ({ classList: { add() {}, remove() {}, toggle() {} } }),
    addEventListener(t, fn) { (doc.listeners[t] = doc.listeners[t] || []).push(fn); },
    removeEventListener(t, fn) { if (doc.listeners[t]) doc.listeners[t] = doc.listeners[t].filter((f) => f !== fn); },
  };
  doc.body = fakeEl(doc, 'body');
  doc.createElement = (tag) => fakeEl(doc, tag);
  const context = vm.createContext({
    console,
    setTimeout: () => 0,
    clearTimeout: () => {},
    performance: { now: () => 0 },
    document: doc,
    window: { innerWidth: 1200, innerHeight: 800, addEventListener() {}, removeEventListener() {} },
    data: { devices: [{ id: 'd1', name: 'Router0' }, { id: 'd2', name: 'PC0' }] },
    CABLE_TYPES: [['eCopper', 'Copper', 'straight', 'Copper Straight-Through']],
    CONSOLE_KINDS: new Set(),
    cableMode: true, cableKind: 'eCopper', cableFrom: null, cableFromPort: null, pduMode: false,
    selection: new Set(), selectionCount: () => 0, selectedLink: null, clipboard: null, ACTIONS: {},
    workspaceCanvas: { deviceAt: () => null },
    toSvg: (ev) => ({ x: ev.x, y: ev.y }),
    status() {}, setSelection() {}, renderTopology() {}, renderPalette() {}, sfx() {},
    placeMenu: (at) => ({ x: at.x, y: at.y }),
    placeSubmenu: (parent) => ({ x: parent.x, y: parent.y }),
    getJson: async (p) => {
      const id = decodeURIComponent(p.split('id=')[1]);
      return { ports: portsById[id] || [] };
    },
    api: async (p, params) => { apiCalls.push({ p, params }); return linkError ? { error: linkError } : {}; },
  });
  vm.runInContext(source, context);
  const flush = () => new Promise((resolve) => setImmediate(resolve));
  /* Fires the click and settles the microtasks; the cableClick promise itself
     stays pending while a picker is open, so it is never awaited here. */
  const click = async (id, ev = { clientX: 40, clientY: 40 }) => {
    const device = context.data.devices.find((d) => d.id === id);
    context.cableClick(device, ev);
    await flush();
  };
  const menuArm = async (id, kind) => {
    const device = context.data.devices.find((d) => d.id === id);
    context.armCableFrom(device, kind);
    await flush();
  };
  const picker = () => doc.body.children.find((c) => c.className.includes('port-picker')) || null;
  const pickerButtons = () => (picker() ? picker().querySelectorAll('button') : []);
  const pressKey = (key) => {
    for (const fn of [...(doc.listeners.keydown || [])]) {
      fn({ key, target: null, preventDefault() {}, stopPropagation() {} });
    }
  };
  return { context, els, doc, apiCalls, flush, click, menuArm, picker, pickerButtons, pressKey };
}

const routerPorts = [
  { name: 'GigabitEthernet0/0', ip: null, prefix: 24, up: true, peer: { id: 'sw0', name: 'Switch0', port: 'FastEthernet0/1' } },
  { name: 'GigabitEthernet0/1', ip: null, prefix: 24, up: true, peer: null },
  { name: 'GigabitEthernet0/2', ip: null, prefix: 24, up: true, peer: null },
];
const pcPorts = [{ name: 'FastEthernet0', ip: null, prefix: 24, up: true, peer: null }];

test('the picker opens only for a device with two or more free compatible ports', async () => {
  const h = harness({ portsById: { d1: routerPorts, d2: pcPorts } });
  await h.click('d2');
  assert.equal(h.picker(), null, 'one free port connects silently');
  assert.equal(vm.runInContext('cableFrom', h.context), 'd2');
  vm.runInContext('cableFrom = null; cableFromPort = null;', h.context);

  await h.click('d1');
  assert.notEqual(h.picker(), null, 'two free ports ask which one');
  assert.equal(vm.runInContext('cableFrom', h.context), null, 'nothing pends while the picker is open');
});

test('used ports are greyed out and name the far end', async () => {
  const h = harness({ portsById: { d1: routerPorts, d2: pcPorts } });
  await h.click('d1');
  const labels = h.pickerButtons().map((b) => [b.textContent, b.disabled]);
  assert.deepEqual(labels, [
    ['GigabitEthernet0/0 → Switch0 FastEthernet0/1', true],
    ['GigabitEthernet0/1', false],
    ['GigabitEthernet0/2', false],
  ]);
});

test('choosing a port on each end posts exactly those ports', async () => {
  const h = harness({ portsById: { d1: routerPorts, d2: pcPorts } });
  await h.click('d1');
  h.pickerButtons()[2].onclick({ stopPropagation() {} });
  await h.flush();
  assert.equal(vm.runInContext('cableFrom', h.context), 'd1');
  assert.equal(vm.runInContext('cableFromPort', h.context), 'GigabitEthernet0/2');

  await h.click('d2');
  assert.equal(h.apiCalls.length, 1);
  assert.equal(h.apiCalls[0].p, '/api/links');
  assert.deepEqual({ ...h.apiCalls[0].params }, {
    a: 'd1', b: 'd2', kind: 'eCopper',
    aport: 'GigabitEthernet0/2', bport: 'FastEthernet0',
  });
  assert.equal(vm.runInContext('cableFrom', h.context), null);
});

test('arrow keys walk the free ports and Enter chooses the focused one', async () => {
  const h = harness({ portsById: { d1: routerPorts } });
  await h.click('d1');
  const free = h.picker().querySelectorAll('button:not(:disabled)');
  assert.equal(h.doc.activeElement, free[0], 'the first free port starts focused');
  h.pressKey('ArrowDown');
  assert.equal(h.doc.activeElement, free[1]);
  h.pressKey('Enter');
  await h.flush();
  assert.equal(h.picker(), null);
  assert.equal(vm.runInContext('cableFromPort', h.context), 'GigabitEthernet0/2');
});

test('Escape in the far-end picker keeps the first end pending', async () => {
  const h = harness({ portsById: { d1: pcPorts, d2: routerPorts } });
  await h.click('d1');
  assert.equal(vm.runInContext('cableFrom', h.context), 'd1');
  await h.click('d2');
  assert.notEqual(h.picker(), null);
  h.pressKey('Escape');
  await h.flush();
  assert.equal(h.picker(), null);
  assert.equal(h.apiCalls.length, 0, 'no link was posted');
  assert.equal(vm.runInContext('cableFrom', h.context), 'd1', 'the pending end survives');
});

test('a cable that picks its own port never opens the picker', async () => {
  const h = harness({ portsById: { d1: routerPorts } });
  vm.runInContext('cableKind = "eConsole";', h.context);
  await h.click('d1');
  assert.equal(h.picker(), null);
  assert.equal(vm.runInContext('cableFrom', h.context), 'd1');
});

test('the context-menu arm asks for a port where the menu stood', async () => {
  const h = harness({ portsById: { d1: routerPorts, d2: pcPorts } });
  vm.runInContext('cableMode = false; cableFrom = null; ctxMenuAt = { x: 300, y: 200 };', h.context);
  await h.menuArm('d1', 'eCopper');
  assert.notEqual(h.picker(), null, 'two free ports ask which one');
  assert.equal(h.picker().style.left, '300px', 'the chooser opens at the menu spot');
  assert.equal(h.picker().style.top, '200px');
  assert.equal(vm.runInContext('cableFrom', h.context), null, 'nothing arms while the chooser is open');

  h.pickerButtons()[2].onclick({ stopPropagation() {} });
  await h.flush();
  assert.equal(vm.runInContext('cableMode', h.context), true);
  assert.equal(vm.runInContext('cableFrom', h.context), 'd1');
  assert.equal(vm.runInContext('cableFromPort', h.context), 'GigabitEthernet0/2');

  await h.click('d2');
  assert.equal(h.apiCalls.length, 1);
  assert.deepEqual({ ...h.apiCalls[0].params }, {
    a: 'd1', b: 'd2', kind: 'eCopper',
    aport: 'GigabitEthernet0/2', bport: 'FastEthernet0',
  });
});

test('Escape in the context-menu chooser leaves nothing armed', async () => {
  const h = harness({ portsById: { d1: routerPorts } });
  vm.runInContext('cableMode = false; cableFrom = null;', h.context);
  await h.menuArm('d1', 'eCopper');
  assert.notEqual(h.picker(), null);
  h.pressKey('Escape');
  await h.flush();
  assert.equal(h.picker(), null);
  assert.equal(vm.runInContext('cableMode', h.context), false, 'cable mode never arms');
  assert.equal(vm.runInContext('cableFrom', h.context), null);
  assert.equal(h.apiCalls.length, 0);
});

test('the context-menu arm on a single free port arms silently with that port', async () => {
  const h = harness({ portsById: { d2: pcPorts } });
  vm.runInContext('cableMode = false; cableFrom = null;', h.context);
  await h.menuArm('d2', 'eCopper');
  assert.equal(h.picker(), null, 'one free port never opens the chooser');
  assert.equal(vm.runInContext('cableMode', h.context), true);
  assert.equal(vm.runInContext('cableFrom', h.context), 'd2');
  assert.equal(vm.runInContext('cableFromPort', h.context), 'FastEthernet0');
});

test('a dedicated-media cable from the menu keeps auto-pick', async () => {
  const h = harness({ portsById: { d1: routerPorts } });
  vm.runInContext('cableMode = false; cableFrom = null;', h.context);
  await h.menuArm('d1', 'eConsole');
  assert.equal(h.picker(), null);
  assert.equal(vm.runInContext('cableFrom', h.context), 'd1');
  assert.equal(vm.runInContext('cableFromPort', h.context), null);
});
