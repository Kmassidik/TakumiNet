'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '../..');
const topologySource = fs.readFileSync(path.join(root, 'web/js/topology.js'), 'utf8');
const interactionSource = fs.readFileSync(path.join(root, 'web/js/interaction.js'), 'utf8');

class SvgElement {
  constructor(tagName) {
    this.tagName = tagName;
    this.attributes = {};
    this.children = [];
    this.classList = { add: () => {} };
  }
  setAttribute(name, value) { this.attributes[name] = String(value); }
  appendChild(child) { this.children.push(child); return child; }
  replaceChildren(...children) { this.children = children; }
  addEventListener() {}
  remove() { this.removed = true; }
}

function renderLink(aState, bState) {
  const svg = new SvgElement('svg');
  const context = vm.createContext({
    data: {
      devices: [
        { id: 'a', name: 'A', model: 'PC', x: 100, y: 100, icon: '/a.png' },
        { id: 'b', name: 'B', model: 'PC', x: 300, y: 100, icon: '/b.png' },
      ],
      links: [{ a: 'a', aPort: 'Fa0', b: 'b', bPort: 'Fa0', kind: 'eCopper', aState, bState }],
    },
    document: { getElementById: () => svg },
    svg: () => svg,
    node: (name, attrs) => {
      const element = new SvgElement(name);
      for (const [key, value] of Object.entries(attrs)) element.setAttribute(key, value);
      return element;
    },
    vb: { x: 0, y: 0, w: 1000, h: 540 },
    showGrid: false,
    selectedLink: null,
    selection: new Set(),
    cableFrom: null,
    pduFrom: null,
    setSelection() {}, status() {}, startDrag() {}, showTip() {}, hideTip() {},
  });
  vm.runInContext(topologySource, context);
  context.renderTopology();
  return svg.children.filter((element) => element.attributes.class === 'link-led');
}

test('link endpoints render LEDs directly from green amber and red port states', () => {
  for (const [aState, bState] of [['green', 'green'], ['red', 'amber'], ['amber', 'red']]) {
    const leds = renderLink(aState, bState);
    assert.equal(leds.length, 2);
    assert.deepEqual(leds.map((led) => led.attributes['data-state']), [aState, bState]);
  }
});

test('realtime animation starts at the source and crosses each real hop at 1x', () => {
  const svg = new SvgElement('svg');
  const frames = [];
  const context = vm.createContext({
    data: { devices: [
      { id: 'a', x: 100, y: 100 },
      { id: 'b', x: 300, y: 100 },
      { id: 'c', x: 300, y: 300 },
    ] },
    document: { getElementById: (id) => id === 'topology' ? svg : new SvgElement('div') },
    svg: () => svg,
    node: (name, attrs) => {
      const element = new SvgElement(name);
      for (const [key, value] of Object.entries(attrs)) element.setAttribute(key, value);
      return element;
    },
    performance: { now: () => 1000 },
    requestAnimationFrame: (callback) => frames.push(callback),
  });
  vm.runInContext(interactionSource, context);
  context.animatePath(['a', 'b', 'c']);

  const dot = svg.children[0];
  assert.equal(dot.attributes.cx, '100', 'the packet must never appear at SVG origin before its first frame');
  assert.equal(dot.attributes.cy, '100');
  assert.equal(frames.length, 1);

  frames.shift()(999);
  assert.equal(dot.attributes.cx, '100', 'an RAF timestamp from the current frame must not select hop -1');
  assert.equal(dot.attributes.cy, '100');
  frames.shift()(1210);
  assert.equal(dot.attributes.cx, '200');
  assert.equal(dot.attributes.cy, '100');
  frames.shift()(1420);
  assert.equal(dot.attributes.cx, '300');
  assert.equal(dot.attributes.cy, '100');
  frames.shift()(1630);
  assert.equal(dot.attributes.cx, '300');
  assert.equal(dot.attributes.cy, '200');
  frames.shift()(1840);
  assert.equal(dot.removed, true, 'two 420 ms segments complete at 840 ms');
});

test('an empty logical workspace shows the sleeping mascot and a useful next step', () => {
  const svg = new SvgElement('svg');
  const context = vm.createContext({
    data: { devices: [], links: [] },
    document: { getElementById: () => svg },
    svg: () => svg,
    node: (name, attrs) => {
      const element = new SvgElement(name);
      for (const [key, value] of Object.entries(attrs)) element.setAttribute(key, value);
      return element;
    },
    vb: { x: 0, y: 0, w: 1000, h: 540 },
    showGrid: false,
    selectedLink: null,
    selection: new Set(),
    cableFrom: null,
    pduFrom: null,
  });
  vm.runInContext(topologySource, context);
  context.renderTopology();
  const mascot = svg.children.find((element) => element.attributes.class === 'empty-mascot');
  assert.equal(mascot?.attributes.href, '/art3d/mascot/sleep.png');
  const message = svg.children.find((element) => element.attributes.class === 'empty-state');
  assert.match(message?.textContent || '', /No devices yet.*Drop a device here to begin/);
});
