'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const source = fs.readFileSync(path.resolve(__dirname, '../../web/js/palette.js'), 'utf8');

function node(tag) {
  return { tag, attrs: {}, children: [], setAttribute(k, v) { this.attrs[k] = v; }, appendChild(c) { this.children.push(c); return c; } };
}

test('each cable tile gets a swatch drawn from the same style the canvas uses', () => {
  const context = vm.createContext({
    document: { createElementNS: (_ns, tag) => node(tag) },
    cableStyle: (kind) => (kind === 'eCross' ? { color: '#111', width: 2, dash: [10, 6] } : { color: '#222', width: 3, dash: [] }),
  });
  vm.runInContext(source, context);
  const cross = context.cableSwatch('eCross');
  assert.equal(cross.children[0].attrs.stroke, '#111');
  assert.equal(cross.children[0].attrs['stroke-dasharray'], '10 6');
  const plain = context.cableSwatch('eCopper');
  assert.equal('stroke-dasharray' in plain.children[0].attrs, false);
  assert.equal(plain.children[0].attrs['stroke-width'], '3');
});

test('without the canvas styles or SVG support the palette just has no swatch', () => {
  const bare = vm.createContext({ document: {} });
  vm.runInContext(source, bare);
  assert.equal(bare.cableSwatch('eCopper'), null);
});
