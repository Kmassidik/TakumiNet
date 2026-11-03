'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '../..');

class Element {
  constructor(tagName = 'div') {
    this.tagName = tagName.toUpperCase();
    this.children = [];
    this.parent = null;
    this.className = '';
    this.checked = false;
    this.value = '';
    this.dataset = {};
    this.hidden = false;
    this._text = '';
    this.listeners = {};
  }

  appendChild(child) {
    child.parent = this;
    this.children.push(child);
    return child;
  }

  replaceChildren(...children) {
    for (const child of children) child.parent = this;
    this.children = children;
  }

  addEventListener(name, fn) {
    (this.listeners[name] ||= []).push(fn);
  }

  querySelector(selector) {
    if (selector === 'input') return this.children.find((c) => c.tagName === 'INPUT') || null;
    if (selector === 'tr.current') return this.children.find((c) => c.className === 'current') || null;
    return null;
  }

  scrollIntoView() {}

  set textContent(value) {
    this._text = String(value);
    this.children = [];
  }

  get textContent() {
    return this.children.length ? this.children.map((c) => c.textContent).join('') : this._text;
  }
}

function harness(events = []) {
  const elements = new Map();
  const byId = (id) => {
    if (!elements.has(id)) elements.set(id, new Element(id === 'events' ? 'tbody' : 'div'));
    return elements.get(id);
  };
  const document = {
    createElement: (tag) => new Element(tag),
    createTextNode: (text) => {
      const node = new Element('#text');
      node.textContent = text;
      return node;
    },
    getElementById: byId,
    querySelectorAll(selector) {
      if (selector === '#filters label') return byId('filters').children;
      if (selector === '#filters input') {
        return byId('filters').children.flatMap((label) => label.children.filter((c) => c.tagName === 'INPUT'));
      }
      return [];
    },
    querySelector(selector) {
      if (selector === '#play-btn img') return byId('play-image');
      return null;
    },
  };
  const context = vm.createContext({
    console,
    document,
    data: { events, filters: ['ICMP', 'HTTP'] },
    performance: { now: () => 1000 },
    animatePath() {},
    sfx() {},
    status() {},
    bringToFront() {},
    renderTopology() {},
    setSelection() {},
    setInterval: () => 1,
    clearInterval() {},
    playTimer: null,
    icon3d: (name) => name,
    URLSearchParams,
  });
  vm.runInContext('let simCursor = -1; let lastRowClick = { id: -1, t: 0 };', context);
  for (const file of ['web/js/simulation.js', 'web/js/actions.js', 'web/js/interaction.js']) {
    vm.runInContext(fs.readFileSync(path.join(root, file), 'utf8'), context, { filename: file });
  }
  context.animatePath = () => {};
  return { context, elements, byId };
}

function event(id, proto, extra = {}) {
  return { id, time: id / 1000, last: 'PC0', at: 'Server0', type: proto, proto, path: ['pc0', 'server0'], hops: [], ...extra };
}

test('Hide All shows no events and a zero visible capture count', () => {
  const h = harness([event(10, 'ICMP'), event(20, 'HTTP')]);
  h.context.renderFilters();
  h.context.setAllFilters(false);
  assert.deepEqual(Array.from(h.context.visibleEvents(), (e) => e.id), []);
  assert.equal(h.byId('captured').textContent, 'Captured: 0/0');
  assert.match(h.byId('events').textContent, /No events/);
});

test('selection and playback retain stable event IDs across filter changes', () => {
  const h = harness([event(10, 'ICMP'), event(20, 'HTTP'), event(30, 'ICMP')]);
  h.context.renderFilters();
  h.context.renderEvents();
  h.byId('events').children[1].onclick();
  assert.equal(vm.runInContext('simCursor', h.context), 20);

  const http = h.byId('filters').children[1].querySelector('input');
  http.checked = false;
  http.listeners.change[0]();
  assert.equal(vm.runInContext('simCursor', h.context), 20);
  assert.equal(h.byId('captured').textContent, 'Captured: 0/2');
  assert.equal(h.byId('events').querySelector('tr.current'), null);

  h.context.stepSim(1);
  assert.equal(vm.runInContext('simCursor', h.context), 10);
  assert.equal(h.byId('captured').textContent, 'Captured: 1/2');
  h.context.stepSim(1);
  assert.equal(vm.runInContext('simCursor', h.context), 30);
  assert.equal(h.byId('captured').textContent, 'Captured: 2/2');
  h.context.stepSim(-1);
  assert.equal(vm.runInContext('simCursor', h.context), 10);
});

test('new protocol filters preserve existing filter choices', () => {
  const h = harness([event(10, 'ICMP')]);
  h.context.renderFilters();
  h.byId('filters').children[0].querySelector('input').checked = false;
  h.context.data = { events: [event(10, 'ICMP'), event(42, 'MODBUS')], filters: ['ICMP', 'HTTP'] };
  h.context.renderFilters();
  const labels = h.byId('filters').children.map((label) => [label.textContent, label.querySelector('input').checked]);
  assert.deepEqual(labels, [['ICMP', false], ['HTTP', true], ['MODBUS', true]]);
});

test('PDU inspection renders captured layer fields and control-plane details', () => {
  const h = harness([]);
  const layers = [
    { name: 'Ethernet II', fields: [{ name: 'Destination', value: '00d0.ba00.0002' }] },
    { name: 'IPv4', fields: [{ name: 'Protocol', value: 'TCP (6)' }, { name: 'TTL', value: '127' }] },
    { name: 'TCP', fields: [{ name: 'Destination Port', value: '80' }] },
    { name: 'HTTP', fields: [{ name: 'Request Line', value: 'GET / HTTP/1.1' }] },
  ];
  h.context.openPduDetail(event(20, 'HTTP', { hops: [
    { name: 'Router0', t: 0.001, ttl: 127, layers },
    { name: 'Server0', t: 0.002, ttl: 127, layers },
  ] }));
  const captured = h.byId('pdu-table').textContent;
  assert.match(captured, /Ethernet II/);
  assert.match(captured, /Destination Port: 80/);
  assert.match(captured, /Request Line: GET \/ HTTP\/1.1/);
  assert.doesNotMatch(captured, /ICMP/);

  h.context.openPduDetail(event(30, 'DNS', {
    layers: [{ name: 'DNS', fields: [
      { name: 'Capture', value: 'Control-plane service exchange' },
      { name: 'Query', value: 'web.lab A' },
    ] }],
    status: 'Successful',
  }));
  const control = h.byId('pdu-table').textContent;
  assert.match(control, /Control Plane/);
  assert.match(control, /Query: web.lab A/);
});

test('new PDU selection stores its stable ID rather than an array index', async () => {
  const h = harness([]);
  vm.runInContext("pduFrom = 'pc0'; pduMode = true;", h.context);
  h.context.api = async () => {
    h.context.data = { events: [event(42, 'ICMP')], filters: ['ICMP'], devices: [] };
    h.context.renderFilters();
    return {};
  };
  await h.context.pduClick({ id: 'server0' });
  assert.equal(vm.runInContext('simCursor', h.context), 42);
  assert.equal(h.byId('captured').textContent, 'Captured: 1/1');
});

test('a dropped PDU refreshes the list and selects its stable event', async () => {
  const h = harness([]);
  vm.runInContext("pduFrom = 'pc0'; pduMode = true;", h.context);
  h.context.api = async () => ({ error: 'ACL denied' });
  h.context.getJson = async () => ({
    events: [event(77, 'ICMP', { status: 'Dropped', reason: 'ACL denied' })],
    filters: ['ICMP'],
    devices: [],
  });
  h.context.setData = (snapshot) => {
    h.context.data = snapshot;
    h.context.renderFilters();
    h.context.renderEvents();
  };
  await h.context.pduClick({ id: 'server0' });
  assert.equal(vm.runInContext('simCursor', h.context), 77);
  assert.equal(h.byId('captured').textContent, 'Captured: 1/1');
});
