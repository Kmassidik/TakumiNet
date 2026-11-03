'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const source = fs.readFileSync(path.resolve(__dirname, '../../web/js/windows.js'), 'utf8');

test('workspace load failure shows an error mascot and leaves file actions wired', async () => {
  const galleries = [];
  const statuses = [];
  const sounds = [];
  let actionsWired = false;
  const context = vm.createContext({
    data: null,
    getJson: async () => ({}),
    status: (message, failed) => statuses.push({ message, failed }),
    sfx: (name) => sounds.push(name),
    renderGallery: (payload) => galleries.push(payload),
    wireMenus() {},
    wireActions() { actionsWired = true; },
  });
  vm.runInContext(source, context);
  await context.boot();

  assert.equal(galleries.length, 1);
  assert.match(galleries[0].error, /workspace could not be loaded/i);
  assert.deepEqual(sounds, ['errorMsg']);
  assert.deepEqual(statuses.at(-1), { message: 'Workspace could not be loaded', failed: true });
  assert.equal(actionsWired, true);
});
