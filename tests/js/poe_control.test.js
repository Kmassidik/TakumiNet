'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const source = fs.readFileSync(path.resolve(__dirname, '../../web/js/poe_control.js'), 'utf8');

function node(tag) {
  return { tag, className: '', textContent: '', checked: false, children: [], attrs: {}, setAttribute(k, v) { this.attrs[k] = v; }, append(...k) { this.children.push(...k); }, appendChild(c) { this.children.push(c); } };
}

async function run(state) {
  const posts = [];
  let refreshed = 0;
  const context = vm.createContext({
    document: { createElement: node },
    getJson: async () => state,
    api: async (p, q) => { posts.push([p, q]); return {}; },
  });
  vm.runInContext(source, context);
  const box = node('div');
  await context.poeControl(box, { id: 'ap0' }, async () => { refreshed += 1; });
  return { box, posts, refreshed: () => refreshed };
}

test('a device that cannot take PoE gets no control', async () => {
  const { box } = await run({ capable: false });
  assert.equal(box.children.length, 0);
});

test('the control explains what the device receives or why it is dark', async () => {
  const on = await run({ capable: true, on: true, powered: true, watts: 15.4, reason: '' });
  assert.equal(on.box.children[0].children[2].textContent, 'Receiving 15.4 W from its switch');
  const dark = await run({ capable: true, on: true, powered: false, watts: 15.4, reason: 'the switch is out of PoE budget' });
  const status = dark.box.children[0].children[2];
  assert.equal(status.textContent, 'No power: the switch is out of PoE budget');
  assert.match(status.className, /is-bad/);
  const off = await run({ capable: true, on: false, powered: false, watts: 6.5, reason: '' });
  assert.equal(off.box.children[0].children[2].textContent, 'Would draw 6.5 W from a switch port');
});

test('ticking the box posts the choice and reloads the tab', async () => {
  const { box, posts, refreshed } = await run({ capable: true, on: false, watts: 6.5, reason: '' });
  const check = box.children[0].children[0];
  check.checked = true;
  await check.onchange();
  assert.equal(JSON.stringify(posts), JSON.stringify([['/api/devices/poe', { id: 'ap0', on: '1' }]]));
  assert.equal(refreshed(), 1);
});
