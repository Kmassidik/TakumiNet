'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '../..');
const source = fs.readFileSync(path.join(root, 'web/js/wifi_app.js'), 'utf8');

class Element {
  constructor(tag) {
    this.tag = tag;
    this.children = [];
    this.className = '';
    this.textContent = '';
    this.hidden = true;
  }

  appendChild(child) { this.children.push(child); return child; }
  replaceChildren(...children) { this.children = children; }
}

function walk(el, out = []) {
  out.push(el);
  for (const c of el.children || []) walk(c, out);
  return out;
}

const SCAN = [
  { ssid: 'Home', security: 'WPA2-PSK', wlc: 'homerouter0' },
  { ssid: 'Home', security: 'WPA2-PSK', wlc: 'ap0' },
  { ssid: 'Cafe', security: 'Open', wlc: 'hotspot0' },
];

function harness({ status = { associated: false }, ssids = SCAN, answers = [], apiResult = {}, fetchFails = false } = {}) {
  const ids = {};
  for (const id of ['wifi-dialog', 'wifi-title', 'wifi-status', 'wifi-body']) ids[id] = new Element('div');
  const calls = { api: [], asked: [] };
  const context = vm.createContext({
    console,
    document: {
      getElementById: (id) => ids[id],
      createElement: (tag) => new Element(tag),
    },
    data: {
      devices: [
        { id: 'homerouter0', name: 'Router', kind: 'homerouter' },
        { id: 'ap0', name: 'AP0', kind: 'ap' },
        { id: 'hotspot0', name: 'Cafe AP', kind: 'hotspot-ap' },
      ],
    },
    bringToFront() {},
    sfx() {},
    askText: async (message) => { calls.asked.push(message); return answers.shift() ?? null; },
    jsonRequest: async (p) => {
      if (fetchFails) throw new Error('down');
      if (p === '/api/wifi/status') return status;
      if (p === '/api/wifi/scan') return { ssids };
      return {};
    },
    api: async (p, params) => { calls.api.push({ p, params }); return apiResult; },
  });
  vm.runInContext(source, context);
  return { context, ids, calls };
}

const plain = (v) => JSON.parse(JSON.stringify(v));
const settle = () => new Promise((resolve) => setImmediate(resolve));

async function open(app, device = { id: 'pc0', name: 'PC0', kind: 'pc' }) {
  app.context.openWifiApp(device);
  await settle();
  return app.ids['wifi-body'];
}

const rows = (body) => walk(body).filter((e) => e.className === 'wifi-row');
const rowButton = (row) => row.children.find((e) => e.tag === 'button');

test('the app opens the dialog and lists every SSID with security and carrier', async () => {
  const app = harness();
  const body = await open(app);
  assert.equal(app.ids['wifi-dialog'].hidden, false);
  assert.equal(app.ids['wifi-title'].textContent, 'Wireless — PC0');
  assert.equal(app.ids['wifi-status'].textContent, 'Not connected');
  const list = rows(body);
  assert.deepEqual(list.map((r) => r.children[0].textContent), ['Home', 'Home', 'Cafe']);
  assert.deepEqual(list.map((r) => r.children[2].textContent), ['WPA2-PSK', 'WPA2-PSK', 'Open']);
  assert.deepEqual(list.map((r) => r.children[1].textContent), ['Router', 'AP0', 'Cafe AP']);
});

test('joining an open network posts at once, with no password prompt', async () => {
  const app = harness();
  const body = await open(app);
  await rowButton(rows(body)[2]).onclick();
  assert.deepEqual(plain(app.calls.asked), []);
  assert.deepEqual(plain(app.calls.api), [
    { p: '/api/wifi/join', params: { id: 'pc0', ssid: 'Cafe', pass: '', user: '' } },
  ]);
});

test('joining a WPA2 network prompts for the password and posts it', async () => {
  const app = harness({ answers: ['secret123'] });
  const body = await open(app);
  await rowButton(rows(body)[0]).onclick();
  assert.deepEqual(plain(app.calls.asked), ['Password for Home']);
  assert.deepEqual(plain(app.calls.api), [
    { p: '/api/wifi/join', params: { id: 'pc0', ssid: 'Home', pass: 'secret123', user: '' } },
  ]);
});

test('cancelling the password prompt joins nothing', async () => {
  const app = harness({ answers: [null] });
  const body = await open(app);
  await rowButton(rows(body)[0]).onclick();
  assert.deepEqual(plain(app.calls.api), []);
});

test('when connected, the status line carries SSID, carrier and bars, and Leave disconnects', async () => {
  const app = harness({ status: { associated: true, ssid: 'Home', wlc: 'homerouter0', bars: 3 } });
  const body = await open(app);
  assert.equal(app.ids['wifi-status'].textContent, 'Connected to Home via Router · 3 bars');
  const leave = walk(body).find((e) => e.textContent === 'Leave');
  await leave.onclick();
  assert.deepEqual(plain(app.calls.api), [{ p: '/api/wifi/disconnect', params: { id: 'pc0' } }]);
});

test('the current carrier reads Connected; the same SSID elsewhere offers Roam', async () => {
  const app = harness({ status: { associated: true, ssid: 'Home', wlc: 'homerouter0', bars: 4 } });
  const body = await open(app);
  const buttons = rows(body).map(rowButton);
  assert.equal(buttons[0].textContent, 'Connected');
  assert.equal(buttons[0].disabled, true);
  assert.equal(buttons[1].textContent, 'Roam');
  assert.equal(buttons[2].textContent, 'Join');
  await buttons[1].onclick();
  assert.deepEqual(plain(app.calls.api), [{ p: '/api/wifi/roam', params: { id: 'pc0', wlc: 'ap0' } }]);
});

test('a join refusal lands verbatim in the status line', async () => {
  const app = harness({ answers: ['wrong'], apiResult: { error: 'authentication failed' } });
  const body = await open(app);
  await rowButton(rows(body)[0]).onclick();
  assert.equal(app.ids['wifi-status'].textContent, 'authentication failed');
});

test('an empty air and a dead radio each show their own state', async () => {
  const empty = harness({ ssids: [] });
  const emptyBody = await open(empty);
  assert.ok(walk(emptyBody).some((e) => e.textContent === 'No wireless network is in the air.'));

  const dead = harness({ fetchFails: true });
  const deadBody = await open(dead);
  assert.ok(walk(deadBody).some((e) => e.textContent === 'Could not reach the radio.'));
  assert.ok(walk(deadBody).some((e) => e.textContent === 'Try again'));
});
