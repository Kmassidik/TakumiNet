'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '../..');
const source = ['web/js/cable_feedback.js', 'web/js/palette.js', 'web/js/interaction.js']
  .map((f) => fs.readFileSync(path.join(root, f), 'utf8'))
  .join('\n');

class Element {
  constructor(tag = 'div') {
    this.tag = tag; this.children = []; this.dataset = {}; this.className = ''; this.textContent = '';
    this.attrs = {}; this.hidden = false;
    this.classes = new Set(); this.classList = {
      add: (...c) => c.forEach((x) => this.classes.add(x)),
      remove: (...c) => c.forEach((x) => this.classes.delete(x)),
      toggle: (c, on) => { if (on) this.classes.add(c); else this.classes.delete(c); },
    };
  }
  appendChild(c) { this.children.push(c); return c; }
  replaceChildren() { this.children = []; }
  setAttribute(name, value) { this.attrs[name] = value; }
  addEventListener() {}
}

function harness({ linkError = null } = {}) {
  const els = {
    groups: new Element(), palette: new Element(), wrap: new Element(), tip: new Element(),
    'cable-chip': new Element(), 'link-toast': new Element(),
  };
  els['cable-chip'].hidden = true;
  els['link-toast'].hidden = true;
  const statuses = [];
  const apiCalls = [];
  const context = vm.createContext({
    console,
    setTimeout: () => 0,
    clearTimeout: () => {},
    document: {
      createElement: (t) => new Element(t),
      getElementById: (id) => els[id],
      querySelector: (sel) => (sel === '.canvas-wrap' ? els.wrap : null),
    },
    data: {
      paletteGroups: [{ label: 'End devices', icon: 'a' }, { label: 'Connections', icon: 'b' }],
      palette: [
        { label: 'PC-PT', icon: 'p', kind: 'pc', blurb: 'A desktop computer with a terminal.' },
        { label: 'Mystery', icon: 'm', kind: 'pc' },
      ],
      devices: [{ id: 'd1', name: 'PC0' }, { id: 'd2', name: 'Phone0' }],
    },
    CABLE_TYPES: [['eCopper', 'Copper', 'straight', 'Copper']],
    cableMode: false, cableKind: 'eCopper', cableFrom: null, pduMode: false, noteMode: false,
    status: (m) => statuses.push(m),
    icon3d: (n) => n, renderTopology() {}, ACTIONS: {},
    setSelection() {}, sfx() {},
    api: async (p, params) => { apiCalls.push({ p, params }); return linkError ? { error: linkError } : {}; },
    paletteStartGroup: (saved, labels) => (saved && labels.includes(saved) ? saved : labels[0]),
    paletteTiles: (group, palette) => (group === 'End devices' ? palette : []),
    paletteKeepsCableMode: (group) => group === 'Connections',
    PALETTE_CONNECTIONS: 'Connections',
  });
  vm.runInContext(source, context);
  vm.runInContext(
    "ACTIONS['add-note'] = () => { noteMode = true; status('Click the canvas to place a note'); };",
    context,
  );
  return { context, els, statuses, apiCalls };
}

const tab = (els, label) => els.groups.children.find((b) => b.children[1].textContent === label);
const cableTile = (els) => els.palette.children.find((c) => c.className.includes('cable-tool'));

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
  assert.equal(els['cable-chip'].hidden, true);
});

test('hovering a tile answers what the device is for', () => {
  const { context, els } = harness();
  context.renderPalette();
  const tiles = els.palette.children.filter((c) => c.className === 'dev-tile' && c.draggable);
  assert.equal(tiles[0].title, 'A desktop computer with a terminal.');
  assert.equal(tiles[1].title, 'Drag Mystery onto the canvas');
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

test('arming a cable presses its tile and shows the chip', () => {
  const { context, els } = harness();
  context.renderPalette();
  tab(els, 'Connections').onclick();
  assert.equal(cableTile(els).attrs['aria-pressed'], 'false');
  cableTile(els).onclick();
  assert.equal(vm.runInContext('cableMode', context), true);
  assert.equal(cableTile(els).attrs['aria-pressed'], 'true');
  assert.equal(els['cable-chip'].hidden, false);
  assert.equal(els['cable-chip'].textContent, 'Copper cable — click two devices. Esc cancels.');
});

test('clicking the armed tile again disarms it and hides the chip', () => {
  const { context, els } = harness();
  context.renderPalette();
  tab(els, 'Connections').onclick();
  cableTile(els).onclick();
  cableTile(els).onclick();
  assert.equal(vm.runInContext('cableMode', context), false);
  assert.equal(cableTile(els).attrs['aria-pressed'], 'false');
  assert.equal(els['cable-chip'].hidden, true);
});

test('picking the first end names it in the chip', async () => {
  const { context, els } = harness();
  context.renderPalette();
  tab(els, 'Connections').onclick();
  cableTile(els).onclick();
  await context.cableClick({ id: 'd1', name: 'PC0' });
  assert.equal(vm.runInContext('cableFrom', context), 'd1');
  assert.equal(els['cable-chip'].textContent, 'Copper cable from PC0 — click the far end. Esc cancels.');
});

test('a refused link shows the server text in the toast', async () => {
  const refusal = 'a phone cable joins an analog phone to a router or switch';
  const { context, els, apiCalls } = harness({ linkError: refusal });
  context.renderPalette();
  tab(els, 'Connections').onclick();
  cableTile(els).onclick();
  await context.cableClick({ id: 'd1', name: 'PC0' });
  await context.cableClick({ id: 'd2', name: 'Phone0' });
  assert.equal(apiCalls.length, 1);
  assert.equal(els['link-toast'].hidden, false);
  assert.equal(els['link-toast'].textContent, refusal);
  assert.equal(els['cable-chip'].textContent, 'Copper cable — click two devices. Esc cancels.');
});

test('while a far end is pending, the chip and the status bar say the same thing', async () => {
  const { context, els, statuses } = harness();
  context.renderPalette();
  tab(els, 'Connections').onclick();
  cableTile(els).onclick();
  await context.cableClick({ id: 'd1', name: 'PC0' });
  assert.equal(els['cable-chip'].textContent, 'Copper cable from PC0 — click the far end. Esc cancels.');
  assert.equal(statuses[statuses.length - 1], els['cable-chip'].textContent);
});

test('after a link completes, the chip and the status bar both show the armed message', async () => {
  const { context, els, statuses } = harness();
  context.renderPalette();
  tab(els, 'Connections').onclick();
  cableTile(els).onclick();
  await context.cableClick({ id: 'd1', name: 'PC0' });
  await context.cableClick({ id: 'd2', name: 'Phone0' });
  assert.equal(els['cable-chip'].textContent, 'Copper cable — click two devices. Esc cancels.');
  assert.equal(statuses[statuses.length - 1], els['cable-chip'].textContent);
});

test('Escape leaves cable mode: pending end gone, tile released, chip hidden', async () => {
  const { context, els } = harness();
  context.renderPalette();
  tab(els, 'Connections').onclick();
  cableTile(els).onclick();
  await context.cableClick({ id: 'd1', name: 'PC0' });
  context.leaveCableMode();
  context.renderPalette();
  assert.equal(vm.runInContext('cableMode', context), false);
  assert.equal(vm.runInContext('cableFrom', context), null);
  assert.equal(cableTile(els).attrs['aria-pressed'], 'false');
  assert.equal(els['cable-chip'].hidden, true);
});

const noteTile = (els) => els.palette.children.find((c) => c.className.includes('note-tool'));

test('the Note tool is the last tile in the Connections tool row', () => {
  const { context, els } = harness();
  context.renderPalette();
  tab(els, 'Connections').onclick();
  const tile = noteTile(els);
  assert.ok(tile);
  assert.equal(els.palette.children.at(-1), tile);
  assert.equal(tile.children[1].textContent, 'Note');
  assert.equal(tile.title, 'Write a text note on the canvas.');
  assert.equal(tile.attrs['aria-pressed'], 'false');
});

test('the Note tool is absent outside Connections', () => {
  const { context, els } = harness();
  context.renderPalette();
  assert.equal(noteTile(els), undefined);
});

test('clicking the Note tile arms note mode and presses the tile', () => {
  const { context, els, statuses } = harness();
  context.renderPalette();
  tab(els, 'Connections').onclick();
  noteTile(els).onclick();
  assert.equal(vm.runInContext('noteMode', context), true);
  assert.equal(noteTile(els).attrs['aria-pressed'], 'true');
  assert.ok(noteTile(els).className.includes('active'));
  assert.equal(statuses.at(-1), 'Click the canvas to place a note');
});

test('clicking the armed Note tile again releases it', () => {
  const { context, els, statuses } = harness();
  context.renderPalette();
  tab(els, 'Connections').onclick();
  noteTile(els).onclick();
  noteTile(els).onclick();
  assert.equal(vm.runInContext('noteMode', context), false);
  assert.equal(noteTile(els).attrs['aria-pressed'], 'false');
  assert.equal(statuses.at(-1), 'Selection mode');
});
