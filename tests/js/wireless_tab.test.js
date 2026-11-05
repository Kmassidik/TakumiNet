'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '../..');
const source = fs.readFileSync(path.join(root, 'web/js/wireless_tab.js'), 'utf8');

class Element {
  constructor(tag) {
    this.tag = tag;
    this.children = [];
    this.className = '';
    this.textContent = '';
    this.value = '';
    this.checked = false;
  }

  appendChild(child) { this.children.push(child); return child; }
  replaceChildren(...children) { this.children = children; }
}

function walk(el, out = []) {
  out.push(el);
  for (const c of el.children || []) walk(c, out);
  return out;
}

const byText = (box, text) => walk(box).find((e) => e.textContent === text);
const byClass = (box, cls) => walk(box).filter((e) => (e.className || '').includes(cls));

function harness({ device, wlans = [], controller = '', devices = [], radios = [], fetchFails = false, apiResult = {} } = {}) {
  const calls = { json: [], api: [] };
  const context = vm.createContext({
    console,
    document: {
      createElement: (tag) => new Element(tag),
      createTextNode: (text) => ({ textContent: text, children: [] }),
    },
    data: { devices },
    sfx() {},
    jsonRequest: async (p, params) => {
      calls.json.push({ p, params });
      if (fetchFails) throw new Error('down');
      if (p === '/api/wifi/wlans') return { wlans };
      if (p === '/api/capwap/status') return { wlc: controller };
      return {};
    },
    api: async (p, params) => { calls.api.push({ p, params }); return apiResult; },
    getJson: async () => ({ devices: radios }),
  });
  vm.runInContext(source, context);
  return { context, calls };
}

const plain = (v) => JSON.parse(JSON.stringify(v));
const settle = () => new Promise((resolve) => setImmediate(resolve));

async function openTab(app, device) {
  const pane = new Element('div');
  app.context.tabWireless(pane, device);
  await settle();
  return pane.children[0];
}

const homerouter = { id: 'homerouter0', name: 'Router', kind: 'homerouter' };
const ap = { id: 'ap0', name: 'AP0', kind: 'ap' };

test('the tab lists each network with security and a guest badge', async () => {
  const app = harness({
    wlans: [
      { ssid: 'Home', security: 'WPA2-PSK', guest: false },
      { ssid: 'Visitors', security: 'Open', guest: true },
    ],
  });
  const box = await openTab(app, homerouter);
  assert.deepEqual(plain(app.calls.json), [{ p: '/api/wifi/wlans', params: { id: 'homerouter0' } }]);
  assert.ok(byText(box, 'Home'));
  assert.ok(byText(box, 'WPA2-PSK'));
  assert.ok(byText(box, 'Open'));
  const badges = byClass(box, 'guest').filter((e) => e.textContent === 'guest');
  assert.equal(badges.length, 1);
});

test('no networks yet shows the empty state and the add form stays usable', async () => {
  const app = harness({ wlans: [] });
  const box = await openTab(app, homerouter);
  assert.ok(byText(box, 'No wireless network is set up yet.'));
  assert.ok(byText(box, 'Add network'));
});

test('adding a network posts name and password; an empty password means open', async () => {
  const app = harness({ wlans: [] });
  const box = await openTab(app, homerouter);
  const inputs = walk(box).filter((e) => e.tag === 'input');
  inputs[0].value = ' Cafe ';
  inputs[1].value = '';
  await byText(box, 'Add network').onclick();
  assert.deepEqual(plain(app.calls.api), [
    { p: '/api/wifi/wlan', params: { id: 'homerouter0', ssid: 'Cafe', pass: '' } },
  ]);
});

test('Remove posts the SSID, and a server error lands verbatim in the note', async () => {
  const app = harness({
    wlans: [{ ssid: 'Home', security: 'WPA2-PSK', guest: false }],
    apiResult: { error: 'WLAN Home not found' },
  });
  const box = await openTab(app, homerouter);
  await byText(box, 'Remove').onclick();
  assert.deepEqual(plain(app.calls.api), [
    { p: '/api/wifi/remove', params: { id: 'homerouter0', ssid: 'Home' } },
  ]);
  assert.ok(byText(box, 'WLAN Home not found'));
});

test('the guest toggle posts on and off, and reverts when the server refuses', async () => {
  const on = harness({ wlans: [{ ssid: 'Home', security: 'WPA2-PSK', guest: false }] });
  let box = await openTab(on, homerouter);
  let tick = walk(box).find((e) => e.type === 'checkbox');
  tick.checked = true;
  await tick.onchange();
  assert.deepEqual(plain(on.calls.api), [
    { p: '/api/wifi/guest', params: { id: 'homerouter0', ssid: 'Home', on: '1' } },
  ]);

  const off = harness({
    wlans: [{ ssid: 'Home', security: 'WPA2-PSK', guest: true }],
    apiResult: { error: 'WLAN Home not found' },
  });
  box = await openTab(off, homerouter);
  tick = walk(box).find((e) => e.type === 'checkbox');
  tick.checked = false;
  await tick.onchange();
  assert.equal(off.calls.api[0].params.on, '0');
  assert.equal(tick.checked, true);
});

test('an access point shows its controller and joins a picked WLC over CAPWAP', async () => {
  const app = harness({
    controller: '',
    devices: [
      { id: 'ap0', name: 'AP0', kind: 'ap' },
      { id: 'wlc0', name: 'WLC0', kind: 'wlc' },
      { id: 'wlc1', name: 'WLC1', kind: 'wlc' },
    ],
  });
  const box = await openTab(app, ap);
  assert.equal(app.calls.json.length, 2);
  assert.deepEqual(plain(app.calls.json)[1], { p: '/api/capwap/status', params: { id: 'ap0' } });
  assert.ok(byText(box, 'Controller: none'));
  const select = walk(box).find((e) => e.tag === 'select');
  select.value = 'wlc1';
  await byText(box, 'Join controller').onclick();
  assert.deepEqual(plain(app.calls.api), [
    { p: '/api/wifi/capwap', params: { id: 'ap0', wlc: 'wlc1' } },
  ]);
});

test('an adopted access point names its controller; other kinds never ask CAPWAP', async () => {
  const adopted = harness({
    controller: 'wlc0',
    devices: [{ id: 'wlc0', name: 'WLC0', kind: 'wlc' }],
  });
  const box = await openTab(adopted, ap);
  assert.ok(byText(box, 'Controller: WLC0'));

  const router = harness({ wlans: [] });
  await openTab(router, homerouter);
  assert.equal(router.calls.json.some((c) => c.p === '/api/capwap/status'), false);
});

test('a failed load shows the error state and Try again reloads', async () => {
  const app = harness({ fetchFails: true });
  const box = await openTab(app, homerouter);
  assert.ok(byText(box, 'Could not load the wireless networks.'));
  app.context.jsonRequest = async (p) => { app.calls.json.push({ p }); return { wlans: [] }; };
  byText(box, 'Try again').onclick();
  await settle();
  assert.ok(byText(box, 'No wireless network is set up yet.'));
});

test('an access point shows its channel, band and the overlap warning', async () => {
  const app = harness({
    wlans: [],
    radios: [{ id: 'ap0', channel: 1, band: '2.4', overlaps_with: ['AP1'] }],
  });
  const box = await openTab(app, ap);
  await settle();
  assert.ok(walk(box).some((e) => e.textContent === '2.4 GHz'));
  assert.ok(walk(box).some((e) => e.textContent === 'Channel'));
  assert.ok(walk(box).some((e) => (e.textContent || '').includes('Channel overlap with AP1')));
});
