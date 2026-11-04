'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '../..');
const source = fs.readFileSync(path.join(root, 'web/js/palette.js'), 'utf8');

class Element {
  constructor(tag = 'div') {
    this.tag = tag; this.children = []; this.dataset = {}; this.className = ''; this.textContent = '';
    this.classes = new Set(); this.classList = {
      add: (...c) => c.forEach((x) => this.classes.add(x)),
      remove: (...c) => c.forEach((x) => this.classes.delete(x)),
      toggle: (c, on) => { if (on) this.classes.add(c); else this.classes.delete(c); },
    };
  }
  appendChild(c) { this.children.push(c); return c; }
  replaceChildren() { this.children = []; }
  setAttribute() {}
  addEventListener() {}
}

function harness() {
  const els = { groups: new Element(), palette: new Element(), wrap: new Element() };
  const statuses = [];
  const context = vm.createContext({
    console,
    document: {
      createElement: (t) => new Element(t),
      getElementById: (id) => els[id],
      querySelector: (sel) => (sel === '.canvas-wrap' ? els.wrap : null),
    },
    data: {
      paletteGroups: [{ label: 'End devices', icon: 'a' }, { label: 'Connections', icon: 'b' }],
      palette: [{ label: 'PC-PT', icon: 'p', kind: 'pc' }],
    },
    CABLE_TYPES: [['eCopper', 'Copper', 'straight', 'Copper']],
    cableMode: false, cableKind: 'eCopper', cableFrom: null, pduMode: false,
    status: (m) => statuses.push(m),
    icon3d: (n) => n, renderTopology() {}, ACTIONS: {},
    paletteStartGroup: (saved, labels) => (saved && labels.includes(saved) ? saved : labels[0]),
    paletteTiles: (group, palette) => (group === 'End devices' ? palette : []),
    paletteKeepsCableMode: (group) => group === 'Connections',
    PALETTE_CONNECTIONS: 'Connections',
  });
  vm.runInContext(source, context);
  return { context, els, statuses };
}

const tab = (els, label) => els.groups.children.find((b) => b.children[1].textContent === label);

test('leaving Connections turns cable mode off and clears the crosshair', () => {
  const { context, els } = harness();
  context.renderPalette();
  tab(els, 'Connections').onclick();
  vm.runInContext("cableMode = true; cableFrom = 'pc0';", context);
  els.wrap.classes.add('cable-mode');
  els.wrap.classes.add('crosshair');
  tab(els, 'End devices').onclick();
  assert.equal(vm.runInContext('cableMode', context), false);
  assert.equal(vm.runInContext('cableFrom', context), null);
  assert.equal(els.wrap.classes.has('cable-mode'), false);
  assert.equal(els.wrap.classes.has('crosshair'), false);
});

test('switching category with no cable chosen changes nothing else', () => {
  const { context, els } = harness();
  context.renderPalette();
  vm.runInContext("cableFrom = 'keep';", context);
  tab(els, 'Connections').onclick();
  assert.equal(vm.runInContext('cableFrom', context), 'keep');
  assert.equal(vm.runInContext('cableMode', context), false);
});

test('staying in Connections keeps cable mode', () => {
  const { context, els } = harness();
  context.renderPalette();
  tab(els, 'Connections').onclick();
  vm.runInContext('cableMode = true;', context);
  tab(els, 'Connections').onclick();
  assert.equal(vm.runInContext('cableMode', context), true);
});
