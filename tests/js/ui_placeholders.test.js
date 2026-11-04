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
  const context = vm.createContext({
    document: {
      createElement: (tag) => new Element(tag),
      readyState: 'complete',
      querySelector: () => null,
      querySelectorAll: () => [],
      addEventListener() {},
    },
    MutationObserver: class { observe() {} },
    icon3d: (name) => name,
  });
  vm.runInContext(source('web/js/actions.js'), context);
  vm.runInContext(source('web/js/toolbars.js'), context);
  vm.runInContext(source('web/js/ui.js'), context);
  const { primary, secondary, actions } = vm.runInContext(
    '({ primary: PRIMARY, secondary: SECONDARY, actions: ACTIONS })', context,
  );
  const removed = new Set([
    'Clusters', 'Activity wizard', 'Challenge mode', 'Drawing palette',
    'Ellipse', 'Navigate', 'Compass', 'Environment',
  ]);

  for (const items of [primary, secondary]) {
    assert.ok(items[0], 'toolbar must not start with a separator');
    assert.ok(items.at(-1), 'toolbar must not end with a separator');
    const toolbar = new Element();
    context.renderToolbar(toolbar, items);
    const buttons = toolbar.children.filter((child) => child.tagName === 'BUTTON');
    assert.equal(buttons.length, items.filter(Boolean).length);

    let buttonIndex = 0;
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (!item) {
        assert.ok(items[i - 1] && items[i + 1], 'separators must divide two action groups');
        continue;
      }
      const [, title, action] = item;
      assert.ok(action, `${title} needs an action`);
      assert.equal(typeof actions[action], 'function', `${title} action must exist`);
      assert.equal(removed.has(title), false, `${title} must stay hidden until implemented`);
      const button = buttons[buttonIndex++];
      assert.equal(button.title, title);
      assert.equal(button.dataset.action, action);
      assert.doesNotMatch(button.title, /not implemented/i);
    }
  }
});

test('every Desktop app dispatches to its real handler', () => {
  const calls = [];
  const handlers = {
    ipconfig: 'openIpDialog',
    term: 'openTerm',
    cmd: 'openCmd',
    browser: 'openBrowser',
    wifi: 'openWifiApp',
    editor: 'openEditor',
    firewall: 'openFirewall',
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
  vm.runInContext(source('web/js/device_window.js'), context);
  vm.runInContext(source('web/js/device_tabs.js'), context);

  const apps = vm.runInContext('DESKTOP_APPS', context);
  const device = { id: 'pc0', name: 'PC0', kind: 'pc' };
  const pane = new Element();
  context.tabDesktop(pane, device);
  const buttons = pane.children[0].children;
  assert.equal(apps.length, 9);
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

  const windowSource = source('web/js/device_window.js');
  assert.match(windowSource, /getElementById\('dw-blurb'\)/);
  const fn = windowSource.match(/function modelBlurb[\s\S]*?\n}/)[0];
  const blurb = 'The everyday branch router: routing, NAT, access lists, OSPF.';
  const context = vm.createContext({ data: { palette: [{ label: 'Router 300', blurb }] } });
  vm.runInContext(fn + '\nglobalThis.modelBlurbTest = modelBlurb;', context);
  assert.equal(context.modelBlurbTest('Router 300'), `Router 300 — ${blurb}`);
  assert.equal(context.modelBlurbTest('Mystery Box'), '');
});

test('the device window shows only the tabs a kind earns', () => {
  const windowSource = fs.readFileSync(path.join(root, 'web/js/device_window.js'), 'utf8');
  const terminal = fs.readFileSync(path.join(root, 'web/js/terminal.js'), 'utf8');
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
