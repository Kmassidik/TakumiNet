'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '../..');
const source = (file) => fs.readFileSync(path.join(root, file), 'utf8');

class Element {
  constructor(tagName = 'div') {
    this.tagName = tagName.toUpperCase();
    this.children = [];
    this.dataset = {};
    this.className = '';
  }

  appendChild(child) {
    this.children.push(child);
    return child;
  }

  setAttribute(name, value) {
    this[name] = value;
  }

  addEventListener() {}

  replaceChildren(...children) {
    this.children = children;
  }

  set textContent(value) {
    this._text = String(value);
    this.children = [];
  }

  get textContent() {
    return this.children.length ? this.children.map((c) => c.textContent).join('') : (this._text || '');
  }
}

test('toolbars contain only implemented actions and tidy separators', () => {
  /* The toolbar data are consts inside two classic scripts; a small regex read
     keeps this test free of a DOM while the render side is covered by
     tests/ts/toolbar.test.ts against the same module code. */
  const toolbars = source('web/js/legacy/toolbars.js');
  const actions = source('web/js/legacy/actions.js');
  const list = (name) => {
    const m = toolbars.match(new RegExp(`const ${name} = \\[([\\s\\S]*?)\\];`));
    assert.ok(m, `${name} exists in toolbars.js`);
    return [...m[1].matchAll(/\['?"?([^,'"?]+)'?"?,\s*['"]([^'"]+)['"],\s*['"]([^'"]+)['"]\]/g)].map((x) => ({ title: x[2], action: x[3] }));
  };
  const implemented = (name) => {
    const m = actions.match(new RegExp(`const ${name} = \\{([\\s\\S]*?)\\n\\};`));
    assert.ok(m, `${name} exists in actions.js`);
    return new Set([...m[1].matchAll(/^\s{2}(\w+):/gm)].map((x) => x[1]));
  };
  const removed = new Set([
    'Clusters', 'Activity wizard', 'Challenge mode', 'Drawing palette',
    'Ellipse', 'Navigate', 'Compass', 'Environment',
  ]);

  for (const [listName, actionsName] of [['PRIMARY', 'ACTIONS'], ['SECONDARY', 'ACTIONS']]) {
    const items = list(listName);
    const implementedActions = implemented(actionsName);
    assert.ok(items.length > 0, `${listName} is not empty`);
    assert.ok(items[0], 'toolbar must not start with a separator');
    for (const { title, action } of items) {
      assert.ok(action, `${title} needs an action`);
      assert.equal(typeof implementedActions.has(action) ? 'function' : 'undefined', 'function', `${title} action must exist`);
      assert.equal(removed.has(title), false, `${title} must stay hidden until implemented`);
      assert.doesNotMatch(title, /not implemented/i);
    }
  }
});

test('every Desktop app dispatches to its real handler', () => {
  const calls = [];
  const handlers = {
    ipconfig: 'openIpDialog',
    term: 'openTerm',
    browser: 'openBrowser',
    wifi: 'openWifiApp',
    editor: 'openEditor',
    capture: 'openCapture',
  };
  const context = vm.createContext({
    document: { createElement: (tag) => new Element(tag) },
    icon3d: (name) => name,
    status: () => { throw new Error('Desktop app fell through to a placeholder'); },
  });
  for (const name of new Set(Object.values(handlers))) {
    context[name] = (device) => calls.push({ name, device });
  }
  vm.runInContext(source('web/js/legacy/device_window.js'), context);
  vm.runInContext(source('web/js/legacy/device_tabs.js'), context);

  const apps = vm.runInContext('DESKTOP_APPS', context);
  const device = { id: 'pc0', name: 'PC0', kind: 'pc' };
  const pane = new Element();
  context.tabDesktop(pane, device);
  const buttons = pane.children[0].children;
  assert.equal(apps.length, 6);
  /* Capture is the sniffer's app: a PC desktop never shows it. */
  const shown = apps.filter(([, , action]) => action !== 'capture');
  assert.equal(buttons.length, shown.length);
  assert.equal(apps.some(([, label]) => label === 'Dialup'), false);

  for (let i = 0; i < shown.length; i++) {
    const [, label, action] = shown[i];
    const handler = handlers[action];
    assert.ok(handler, `${label} needs a real handler`);
    buttons[i].onclick();
    assert.deepEqual(calls.at(-1), { name: handler, device });
  }
  assert.equal(calls.length, shown.length);

  const sniffer = { id: 'sniffer0', name: 'Sniffer0', kind: 'sniffer' };
  const snifferPane = new Element();
  context.tabDesktop(snifferPane, sniffer);
  const snifferButtons = snifferPane.children[0].children;
  const snifferShown = apps.filter(([, , action]) => action !== 'wifi');
  assert.equal(snifferButtons.length, snifferShown.length);
  snifferButtons[snifferShown.findIndex(([, , action]) => action === 'capture')].onclick();
  assert.deepEqual(calls.at(-1), { name: 'openCapture', device: sniffer });
});

test('device window exposes only the supported tabs', () => {
  const html = source('web/index.html');
  const markup = html.match(/<div class="devwin-tabs" id="dw-tabs">([\s\S]*?)<\/div>/);
  assert.ok(markup);
  const tabs = Array.from(markup[1].matchAll(/data-tab="([^"]+)"/g), (match) => match[1]);
  assert.deepEqual(tabs, ['physical', 'config', 'wireless', 'desktop', 'cli', 'services']);
});

test('every static image has a real source before its window opens', () => {
  const html = source('web/index.html');
  const images = Array.from(html.matchAll(/<img\b[^>]*>/g), (match) => match[0]);
  const missing = images.filter((image) => !/\bsrc="[^"]+"/.test(image));
  assert.deepEqual(missing, []);
});

test('loading mascot is preloaded before the gallery can replace it', () => {
  const html = source('web/index.html');
  assert.match(html, /<link rel="preload" as="image" href="\/art3d\/mascot\/think\.webp">/);
});

test('the protocol filter explains itself under a plain title', () => {
  const html = source('web/index.html');
  assert.doesNotMatch(html, /Event List Filters/);
  assert.match(html, /<span>Show these protocols<\/span>/);
  assert.match(html, /<p class="filter-blurb">Captured events stay in the list above; untick a protocol to hide its rows\.<\/p>/);
  assert.match(html, /id="show-all" title="[^"]+"/);
  assert.match(html, /id="show-none" title="[^"]+"/);
});

test('the device window explains the model in one muted line under its title', () => {
  const html = source('web/index.html');
  assert.match(html, /<p class="dw-blurb" id="dw-blurb" hidden><\/p>\n\s*<div class="devwin-tabs"/);

  const windowSource = source('web/js/legacy/device_window.js');
  assert.match(windowSource, /getElementById\(["']dw-blurb["']\)/);
  const fn = windowSource.match(/function modelBlurb[\s\S]*?\n}/)[0];
  const blurb = 'The everyday branch router: routing, NAT, access lists, OSPF.';
  const context = vm.createContext({ data: { palette: [{ label: 'Router 300', blurb }] } });
  vm.runInContext(fn + '\nglobalThis.modelBlurbTest = modelBlurb;', context);
  assert.equal(context.modelBlurbTest('Router 300'), `Router 300 — ${blurb}`);
  assert.equal(context.modelBlurbTest('Mystery Box'), '');
});

test('the device window shows only the tabs a kind earns', () => {
  const windowSource = fs.readFileSync(path.join(root, 'web/js/legacy/device_window.js'), 'utf8');
  const terminal = fs.readFileSync(path.join(root, 'web/js/legacy/terminal.js'), 'utf8');
  const context = vm.createContext({});
  const consoleKinds = terminal.match(/const CONSOLE_KINDS = new Set\(\[[\s\S]*?\]\);/)[0];
  const kinds = windowSource.match(/const DESKTOP_KINDS[\s\S]*?\n/)[0]
    + windowSource.match(/const WIRELESS_KINDS[\s\S]*?\n/)[0];
  const fn = windowSource.match(/function deviceTabs[\s\S]*?\n}/)[0];
  vm.runInContext(consoleKinds + kinds + fn + '\nglobalThis.deviceTabsTest = deviceTabs;', context);
  const tabs = context.deviceTabsTest;
  assert.deepStrictEqual([...tabs('pc')], ['physical', 'config', 'desktop']);
  assert.deepStrictEqual([...tabs('switch')], ['physical', 'config', 'cli']);
  assert.deepStrictEqual([...tabs('router')], ['physical', 'config', 'cli']);
  assert.deepStrictEqual([...tabs('server')], ['physical', 'config', 'desktop', 'services']);
  assert.deepStrictEqual([...tabs('printer')], ['physical', 'config']);
  for (const kind of ['homerouter', 'ap', 'wlc', 'hotspot-ap']) {
    assert.deepStrictEqual([...tabs(kind)], ['physical', 'config', 'wireless'], kind);
  }
  for (const kind of ['asa', 'district-hub', 'city-exchange', 'regency-hub', 'village-pop',
    'backbone-pop', 'internet-exchange', 'national-gateway']) {
    assert.deepStrictEqual([...tabs(kind)], ['physical', 'config', 'cli'], kind);
  }
});
