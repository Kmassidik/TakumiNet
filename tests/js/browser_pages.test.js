'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '../..');
const source = fs.readFileSync(path.join(root, 'web/js/browser_pages.js'), 'utf8');

class Element {
  constructor(tag = 'div') {
    this.tagName = tag.toUpperCase();
    this.children = [];
    this.className = '';
    this.value = '';
  }

  appendChild(child) {
    this.children.push(child);
    return child;
  }

  replaceChildren(...children) {
    this.children = children;
  }

  focus() {}

  set textContent(value) {
    this._text = String(value);
    this.children = [];
  }

  get textContent() {
    return this.children.length
      ? this.children.map((c) => c.textContent).join(' ')
      : (this._text || '');
  }
}

function findAll(el, want, out = []) {
  for (const child of el.children || []) {
    if (want(child)) out.push(child);
    findAll(child, want, out);
  }
  return out;
}

function button(el, label) {
  const hits = findAll(el, (c) => c.tagName === 'BUTTON' && c.textContent === label);
  assert.ok(hits.length, `no button labelled ${label}`);
  return hits[0];
}

function inputs(el) {
  return findAll(el, (c) => c.tagName === 'INPUT');
}

function load(responses, requests, devices = []) {
  const context = vm.createContext({
    document: { createElement: (tag) => new Element(tag) },
    jsonRequest: async (p, params) => {
      requests.push(JSON.parse(JSON.stringify({ path: p, params })));
      return responses[p] ?? {};
    },
    sfx: () => {},
    data: { devices },
  });
  vm.runInContext(source, context);
  return context;
}

test('the router login form posts the typed credentials and shows a refusal verbatim', async () => {
  const requests = [];
  const refusal = '401 Unauthorized: wrong user name or password';
  const context = load({ '/api/router/login': { error: refusal } }, requests);

  const body = new Element();
  context.renderRouterPage({ id: 'laptop0' }, { host: '192.168.1.1', title: 'HomeRouter0' }, body);
  const [user, pass] = inputs(body);
  user.value = 'admin';
  pass.value = 'letmein';
  await button(body, 'Sign in').onclick();

  assert.deepEqual(requests, [{
    path: '/api/router/login',
    params: { from: 'laptop0', to: '192.168.1.1', user: 'admin', pass: 'letmein' },
  }]);
  assert.ok(body.textContent.includes(refusal), body.textContent);
});

const STATUS = {
  id: 'homerouter0',
  name: 'HomeRouter0',
  lan: '192.168.1.0/24',
  wan: 'connected via Modem0',
  forwards: [{ outside: 8080, target: 'server0', name: 'Server0', inside: 80 }],
};

const DEVICES = [
  { id: 'homerouter0', name: 'HomeRouter0', ip: '192.168.1.1', kind: 'homerouter' },
  { id: 'server0', name: 'Server0', ip: '192.168.1.2', kind: 'server' },
  { id: 'switch0', name: 'Switch0', ip: null, kind: 'switch' },
];

test('a successful sign-in renders the status page with WAN, LAN and the forwards', async () => {
  const requests = [];
  const context = load({ '/api/router/login': {}, '/api/router/status': STATUS }, requests, DEVICES);

  const body = new Element();
  context.renderRouterPage({ id: 'laptop0' }, { host: '192.168.1.1', title: 'HomeRouter0' }, body);
  const [user, pass] = inputs(body);
  user.value = 'admin';
  pass.value = 'admin';
  await button(body, 'Sign in').onclick();

  assert.equal(requests[1].path, '/api/router/status');
  assert.deepEqual(requests[1].params, { id: '192.168.1.1' });
  assert.ok(body.textContent.includes('WAN: connected via Modem0'), body.textContent);
  assert.ok(body.textContent.includes('LAN: 192.168.1.0/24'), body.textContent);
  assert.ok(body.textContent.includes('8080 → Server0, port 80'), body.textContent);

  const select = findAll(body, (c) => c.tagName === 'SELECT')[0];
  const options = select.children.map((o) => o.value);
  assert.deepEqual(options, ['server0'], 'only addressed inside devices are offered');
});

test('forwards are added and removed through /api/devices/portforward', async () => {
  const requests = [];
  const context = load({ '/api/router/status': STATUS }, requests, DEVICES);

  const body = new Element();
  await context.renderRouterStatus({ id: 'laptop0' }, { host: '192.168.1.1', title: 'HomeRouter0' }, body);
  requests.length = 0;

  await button(body, 'Remove').onclick();
  assert.deepEqual(requests[0], {
    path: '/api/devices/portforward',
    params: { id: 'homerouter0', outside: 8080, remove: '1' },
  });

  requests.length = 0;
  const [outside, inside] = inputs(body);
  outside.value = '9090';
  inside.value = '80';
  findAll(body, (c) => c.tagName === 'SELECT')[0].value = 'server0';
  await button(body, 'Add').onclick();
  assert.deepEqual(requests[0], {
    path: '/api/devices/portforward',
    params: { id: 'homerouter0', outside: '9090', target: 'server0', inside: '80' },
  });
});

test('a failed status fetch shows the error and offers a retry', async () => {
  const requests = [];
  const context = load({ '/api/router/status': { error: 'Request timed out while reaching 192.168.1.1' } }, requests);

  const body = new Element();
  await context.renderRouterStatus({ id: 'laptop0' }, { host: '192.168.1.1', title: 'HomeRouter0' }, body);
  assert.ok(body.textContent.includes('Request timed out while reaching 192.168.1.1'), body.textContent);
  assert.ok(button(body, 'Retry'), 'the status page offers a retry');
});

test('the portal redeems a voucher and reports the minutes granted', async () => {
  const requests = [];
  const context = load({ '/api/voucher': { minutes: 60 } }, requests);

  const body = new Element();
  context.renderPortalPage({ id: 'phone0' }, { host: '10.20.0.1', device: 'gw0' }, body);
  inputs(body)[0].value = ' LUNCH-4821 ';
  await button(body, 'Redeem').onclick();

  assert.deepEqual(requests, [{
    path: '/api/voucher',
    params: { id: 'gw0', client: 'phone0', code: 'LUNCH-4821' },
  }]);
  assert.ok(body.textContent.includes('Voucher accepted: 60 minutes'), body.textContent);
});

test('the portal shows the engine refusal verbatim and sends nothing for an empty code', async () => {
  const requests = [];
  const context = load({ '/api/voucher': { error: 'Voucher already used' } }, requests);

  const body = new Element();
  context.renderPortalPage({ id: 'phone1' }, { host: '10.20.0.1', device: 'gw0' }, body);
  await button(body, 'Redeem').onclick();
  assert.equal(requests.length, 0, 'an empty code never leaves the page');
  assert.ok(body.textContent.includes('Type the voucher code first'));

  inputs(body)[0].value = 'LUNCH-4821';
  await button(body, 'Redeem').onclick();
  assert.ok(body.textContent.includes('Voucher already used'), body.textContent);
});
