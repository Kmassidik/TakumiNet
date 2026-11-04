'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '../..');
const source = fs.readFileSync(path.join(root, 'web/js/actions.js'), 'utf8');
const css = fs.readFileSync(path.join(root, 'web/workspace.css'), 'utf8');
const html = fs.readFileSync(path.join(root, 'web/index.html'), 'utf8');

function printContext(page) {
  const log = { prints: 0, statuses: [], sounds: [], renders: [], shown: [] };
  const element = (tag) => ({ tag, src: '', alt: '', textContent: '', async decode() { log.decoded = true; } });
  const sheet = { replaceChildren: (...children) => { log.shown = children; } };
  const context = vm.createContext({
    console,
    Date,
    currentName: 'my lab',
    status: (message, failed) => log.statuses.push({ message, failed }),
    sfx: (name) => log.sounds.push(name),
    workspaceCanvas: { renderForPrint: (w, h) => { log.renders.push([w, h]); return page; } },
    document: { createElement: element, getElementById: (id) => (id === 'print-sheet' ? sheet : null) },
    window: { print: () => { log.prints += 1; } },
  });
  vm.runInContext(source, context);
  return { context, log };
}

test('Print renders the workspace alone, names it, then prints', async () => {
  const { context, log } = printContext({ toDataURL: () => 'data:image/png;base64,AAAA' });
  await vm.runInContext('ACTIONS.print()', context);
  assert.equal(log.prints, 1);
  assert.deepEqual(log.renders, [[1754, 1240]]);
  const [image, caption] = log.shown;
  assert.equal(image.src, 'data:image/png;base64,AAAA');
  assert.match(caption.textContent, /^my lab · /);
  assert.equal(log.decoded, true);
});

test('Print on an empty workspace says so and does not open the print dialog', async () => {
  const { context, log } = printContext(null);
  await vm.runInContext('ACTIONS.print()', context);
  assert.equal(log.prints, 0);
  assert.equal(log.statuses.at(-1).failed, true);
  assert.match(log.statuses.at(-1).message, /Nothing to print/);
  assert.deepEqual(log.sounds, ['errorMsg']);
});

test('the print rules hide everything except the sheet and set a landscape page', () => {
  const block = css.slice(css.indexOf('@media print'));
  assert.match(block, /body > \*:not\(\.print-sheet\) \{ display: none !important; \}/);
  assert.match(block, /@page \{ size: A4 landscape/);
  assert.match(css, /\.print-sheet \{ display: none;/);
});

test('the print sheet sits outside the app, so hiding the app cannot hide it', () => {
  const appEnd = html.lastIndexOf('</div>', html.indexOf('id="print-sheet"'));
  assert.ok(appEnd > html.indexOf('class="app"'));
  assert.ok(html.indexOf('id="print-sheet"') > html.indexOf('data-action="print"'));
  assert.match(html, /<figure id="print-sheet" class="print-sheet"/);
  assert.doesNotMatch(html, /<figure id="print-sheet"[^>]*><img/);
});
