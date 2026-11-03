'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '../..');
const topologySource = fs.readFileSync(path.join(root, 'web/js/topology.js'), 'utf8');

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
