'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '../..');
const source = fs.readFileSync(path.join(root, 'web/js/config_sections.js'), 'utf8');

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

function load({ responses = {}, requests = [], devices = [], ports = {} } = {}) {
  const context = vm.createContext({
    document: { createElement: (tag) => new Element(tag) },
    api: async (p, params) => {
      requests.push(JSON.parse(JSON.stringify({ path: p, params })));
      return responses[p] ?? {};
    },
    getJson: async (p) => {
      const id = decodeURIComponent(p.split('id=')[1] || '');
      return { ports: ports[id] || [] };
    },
    sfx: () => {},
    selectTab: () => {},
    prefixToMask: (p) => (p === 16 ? '255.255.0.0' : '255.255.255.0'),
    data: { devices },
  });
  vm.runInContext(source, context);
  return context;
}

const tick = () => new Promise((resolve) => setImmediate(resolve));

test('only the kinds that earn a section get one', () => {
  const context = load();
  const legends = (d) => {
    const box = new Element();
    context.configSections(box, d);
    return findAll(box, (c) => c.tagName === 'LEGEND').map((l) => l.textContent);
  };
  assert.deepEqual(legends({ id: 'pc0', kind: 'pc' }), []);
  assert.deepEqual(legends({ id: 'printer0', kind: 'printer' }), ['Addressing']);
  assert.deepEqual(legends({ id: 'home0', kind: 'homerouter' }), ['Provider connection (PPPoE)', 'Tunnel']);
  assert.deepEqual(legends({ id: 'router0', kind: 'router' }), ['Tunnel', 'Shared gateway']);
  assert.deepEqual(legends({ id: 'server0', kind: 'server' }), ['Virtual network']);
  // rtrw-gateway and switch-l3 open their own kind windows, which hold
  // the DHCP pools and shared gateway controls instead.
  assert.deepEqual(legends({ id: 'gw0', kind: 'rtrw-gateway' }), []);
  assert.deepEqual(legends({ id: 'd1', kind: 'switch-l3' }), []);
});

test('the printer addressing section applies a static address and renews a lease', async () => {
  const requests = [];
  const context = load({ requests });
  const box = context.addressingSection({ id: 'printer0', kind: 'printer', ip: '192.168.1.22', prefix: 24, gateway: '192.168.1.1', dns: '192.168.1.2', dhcp: false });

  const [ip, mask, gw, dns] = inputs(box);
  assert.equal(ip.value, '192.168.1.22');
  ip.value = '192.168.1.50';
  await button(box, 'Apply').onclick();
  assert.deepEqual(requests[0], {
    path: '/api/devices/ip',
    params: { id: 'printer0', ip: '192.168.1.50', mask: '255.255.255.0', gateway: '192.168.1.1', dns: '192.168.1.2' },
  });
  assert.ok(mask && gw && dns, 'all four fields are rendered');

  await button(box, 'Renew DHCP lease').onclick();
  assert.deepEqual(requests[1], { path: '/api/dhcp/acquire', params: { id: 'printer0' } });
});

test('the provider section connects and disconnects a PPPoE session', async () => {
  const requests = [];
  const refusal = 'Login refused: name or password is wrong';
  const context = load({ requests, responses: { '/api/pppoe/connect': { error: refusal } } });

  const box = context.pppoeSection({ id: 'home0', kind: 'homerouter', pppoe: null });
  assert.ok(box.textContent.includes('Not connected'));
  const [server, user, pass] = inputs(box);
  server.value = '10.10.0.1';
  user.value = 'home0';
  pass.value = 'wrong-pass';
  await button(box, 'Connect').onclick();
  assert.deepEqual(requests[0], {
    path: '/api/pppoe/connect',
    params: { id: 'home0', server: '10.10.0.1', user: 'home0', pass: 'wrong-pass' },
  });
  assert.ok(box.textContent.includes(refusal), 'the refusal is shown word for word');

  const up = context.pppoeSection({ id: 'home0', kind: 'homerouter', pppoe: { server: '10.10.0.1', user: 'home0' } });
  assert.ok(up.textContent.includes('Connected to 10.10.0.1 as home0'));
  await button(up, 'Disconnect').onclick();
  assert.deepEqual(requests[1], { path: '/api/pppoe/disconnect', params: { id: 'home0' } });
});

test('the tunnel section offers peers, connects and removes', async () => {
  const requests = [];
  const context = load({
    requests,
    devices: [
      { id: 'router1', name: 'HomeEnd', kind: 'router', ip: null },
      { id: 'router0', name: 'OfficeEnd', kind: 'router', ip: null },
    ],
    ports: { router0: [{ name: 'GigabitEthernet0/0', ip: '203.0.113.2' }, { name: 'GigabitEthernet0/1', ip: null }] },
  });

  const box = context.tunnelSection({ id: 'router1', kind: 'router', tunnel: null });
  await tick();
  const select = findAll(box, (c) => c.tagName === 'SELECT')[0];
  assert.deepEqual(select.children.map((o) => o.value), ['203.0.113.2']);
  assert.ok(select.children[0].textContent.includes('OfficeEnd'));

  select.value = '203.0.113.2';
  inputs(box).at(-1).value = 'office-key';
  await button(box, 'Connect').onclick();
  assert.deepEqual(requests[0], {
    path: '/api/devices/tunnel',
    params: { id: 'router1', peer: '203.0.113.2', key: 'office-key' },
  });

  const up = context.tunnelSection({ id: 'router1', kind: 'router', tunnel: { peer: '203.0.113.2', state: 'up' } });
  assert.ok(up.textContent.includes('Peer 203.0.113.2 — tunnel is up'));
  await button(up, 'Remove').onclick();
  assert.deepEqual(requests[1], { path: '/api/devices/tunnel', params: { id: 'router1', remove: '1' } });
});

test('the shared gateway section shares, shows the active member and leaves', async () => {
  const requests = [];
  const context = load({ requests });

  const box = context.sharedGatewaySection({ id: 'd1', kind: 'switch-l3', sharedGws: [{ vip: '172.20.0.1', priority: 110, owner: true }] });
  assert.ok(box.textContent.includes('172.20.0.1 · priority 110 · answering now'));
  await button(box, 'Leave').onclick();
  assert.deepEqual(requests[0], {
    path: '/api/devices/sharedgw',
    params: { id: 'd1', vip: '172.20.0.1', remove: '1' },
  });

  const [vip, priority] = inputs(box);
  vip.value = '172.20.0.1';
  priority.value = '110';
  await button(box, 'Share').onclick();
  assert.deepEqual(requests[1], {
    path: '/api/devices/sharedgw',
    params: { id: 'd1', vip: '172.20.0.1', priority: '110' },
  });
});

test('the virtual network section joins and leaves by number', async () => {
  const requests = [];
  const context = load({ requests });

  const box = context.vnetSection({ id: 'server0', kind: 'server', vnet: null });
  assert.ok(box.textContent.includes('Not in a virtual network'));
  inputs(box)[0].value = '100';
  await button(box, 'Join').onclick();
  assert.deepEqual(requests[0], { path: '/api/devices/vnet', params: { id: 'server0', vni: '100' } });

  const joined = context.vnetSection({ id: 'server0', kind: 'server', vnet: 100 });
  assert.ok(joined.textContent.includes('Member of virtual network 100'));
  await button(joined, 'Leave').onclick();
  assert.deepEqual(requests[1], { path: '/api/devices/vnet', params: { id: 'server0', remove: '1' } });
});

test('the pools section lists, adds and removes extra DHCP pools', async () => {
  const requests = [];
  const context = load({ requests });
  const d = {
    id: 'gw0',
    kind: 'rtrw-gateway',
    pools: [{ network: '192.168.10.0', prefix: 24, gateway: '192.168.10.1', dns: null }],
  };

  const box = context.dhcpPoolsSection(d, 'config');
  assert.ok(box.textContent.includes('192.168.10.0/24 · gateway 192.168.10.1 · DNS none'));
  await button(box, 'Remove').onclick();
  assert.deepEqual(requests[0], {
    path: '/api/devices/dhcp',
    params: { id: 'gw0', network: '192.168.10.0', prefix: 24, remove: '1' },
  });

  const [network, mask, gw, dns] = inputs(box);
  network.value = '192.168.20.0';
  mask.value = '255.255.255.0';
  gw.value = '192.168.20.1';
  dns.value = '198.51.100.53';
  await button(box, 'Add pool').onclick();
  assert.deepEqual(requests[1], {
    path: '/api/devices/dhcp',
    params: { id: 'gw0', network: '192.168.20.0', mask: '255.255.255.0', gateway: '192.168.20.1', dns: '198.51.100.53', more: '1' },
  });

  const empty = context.dhcpPoolsSection({ id: 'gw0', kind: 'rtrw-gateway', pools: [] }, 'config');
  assert.ok(empty.textContent.includes('No pools'));
});

test('the sections are wired into the config tab and the services tab', () => {
  const tabs = fs.readFileSync(path.join(root, 'web/js/device_tabs.js'), 'utf8');
  assert.match(tabs, /configSections\(box, d\);/);
  const services = fs.readFileSync(path.join(root, 'web/js/services_tab.js'), 'utf8');
  assert.match(services, /dhcpPoolsSection\(d, 'services'\)/);
  const index = fs.readFileSync(path.join(root, 'web/index.html'), 'utf8');
  assert.match(index, /\/js\/config_sections\.js/);
  assert.match(index, /\/js\/browser_pages\.js/);
});
