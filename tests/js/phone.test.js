'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '../..');
const source = fs.readFileSync(path.join(root, 'web/js/phone.js'), 'utf8');
const css = fs.readFileSync(path.join(root, 'web/workspace.css'), 'utf8');
const html = fs.readFileSync(path.join(root, 'web/index.html'), 'utf8');
const main = fs.readFileSync(path.join(root, 'web/js/main.js'), 'utf8');

function load(matchMedia, location = { reload() {} }) {
  const context = vm.createContext({ matchMedia, location });
  vm.runInContext(source, context);
  return context;
}

test('a phone-sized screen is detected', () => {
  const asked = [];
  const context = load((query) => { asked.push(query); return { matches: true }; });
  assert.equal(context.isPhoneScreen(), true);
  assert.equal(asked[0], vm.runInContext('PHONE_QUERY', context));
});

test('a computer or tablet screen is not blocked', () => {
  assert.equal(load(() => ({ matches: false })).isPhoneScreen(), false);
});

test('a browser without matchMedia, or one that throws, is treated as a normal screen', () => {
  assert.equal(load(undefined).isPhoneScreen(), false);
  assert.equal(load(() => { throw new Error('boom'); }).isPhoneScreen(), false);
});

test('the page reloads when a blocked window grows past a phone, and not before', () => {
  let reloads = 0;
  let listener;
  const query = { matches: true, addEventListener: (type, fn) => { listener = fn; } };
  const context = load(() => query, { reload: () => { reloads += 1; } });
  context.reloadWhenScreenGrows();
  query.matches = true;
  listener();
  assert.equal(reloads, 0);
  query.matches = false;
  listener();
  assert.equal(reloads, 1);
});

test('the CSS media query is the same one the script uses', () => {
  const query = vm.runInContext('PHONE_QUERY', load(() => ({ matches: false })));
  assert.ok(css.includes(`@media ${query} {`), 'workspace.css must use the PHONE_QUERY text');
});

test('on a phone the page shows only the message', () => {
  const block = css.slice(css.indexOf('@media (max-width: 599px)'));
  assert.match(block, /body > \*:not\(\.phone-block\) \{ display: none !important; \}/);
  assert.match(css, /\.phone-block \{ display: none; \}/);
  assert.match(html, /<section id="phone-block" class="phone-block" role="alert">/);
  assert.match(html, /not supported on phones/i);
});

test('the phone check loads before the engine, and the app does not start on a phone', () => {
  assert.ok(html.indexOf('/js/phone.js') > 0 && html.indexOf('/js/phone.js') < html.indexOf('/js/engine.js'));
  assert.match(main, /if \(isPhoneScreen\(\)\) \{[\s\S]*reloadWhenScreenGrows\(\);[\s\S]*\} else \{[\s\S]*boot\(\);/);
  assert.doesNotMatch(main.split('} else {')[0], /serviceWorker|boot\(\)/);
});
