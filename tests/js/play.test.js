'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '../..');
const source = fs.readFileSync(path.join(root, 'web/js/actions.js'), 'utf8');
const html = fs.readFileSync(path.join(root, 'web/index.html'), 'utf8');

function playContext(events, extra = {}) {
  const statuses = [];
  const sounds = [];
  const context = vm.createContext({
    console,
    icon3d: (key) => key,
    status: (msg) => statuses.push(msg),
    sfx: (name) => sounds.push(name),
    visibleEvents: () => events,
    stepSim() {},
    playbackSpeed: 1,
    playTimer: null,
    document: { querySelector: () => ({ src: '' }), getElementById: () => null },
    setInterval: () => 1,
    clearInterval() {},
    ...extra,
  });
  vm.runInContext(source, context);
  return { context, statuses, sounds };
}

test('Play with no recorded events says what to do and makes no sound', () => {
  const { context, statuses, sounds } = playContext([]);
  vm.runInContext('togglePlay()', context);
  assert.equal(vm.runInContext('playTimer', context), null);
  assert.deepEqual(sounds, []);
  assert.match(statuses.at(-1), /Send a PDU first/);
});

test('Play with events starts the timer and plays the transport sound once', () => {
  const { context, sounds } = playContext([{ id: 1 }]);
  vm.runInContext('togglePlay()', context);
  assert.notEqual(vm.runInContext('playTimer', context), null);
  assert.deepEqual(sounds, ['movieControlButton']);
});

test('the Play buttons do not play their sound on every click', () => {
  const buttons = html.match(/<button[^>]*data-sim="play2?"[^>]*>/g) || [];
  assert.equal(buttons.length, 2);
  for (const button of buttons) assert.doesNotMatch(button, /data-sfx=/);
});

test('Play on a template with no events sends its built-in traffic, then plays it', async () => {
  const events = [];
  const calls = [];
  const { context, sounds } = playContext(events, {
    data: { hasDemo: true },
    api: async (path) => { calls.push(path); events.push({ id: 1 }); return {}; },
  });
  await vm.runInContext('togglePlay()', context);
  assert.deepEqual(calls, ['/api/demo']);
  assert.notEqual(vm.runInContext('playTimer', context), null);
  assert.deepEqual(sounds, ['movieControlButton']);
});

test('Play with events already captured does not send the built-in traffic again', async () => {
  const calls = [];
  const { context } = playContext([{ id: 1 }], { data: { hasDemo: true }, api: async (path) => { calls.push(path); return {}; } });
  await vm.runInContext('togglePlay()', context);
  assert.deepEqual(calls, []);
});

test('a failed built-in traffic run starts nothing and plays no sound', async () => {
  const { context, sounds } = playContext([], {
    data: { hasDemo: true },
    api: async () => ({ error: 'Built-in traffic step 1 names a device that is not here: pc9' }),
  });
  await vm.runInContext('togglePlay()', context);
  assert.equal(vm.runInContext('playTimer', context), null);
  assert.deepEqual(sounds, []);
});

test('built-in traffic hidden by the filters says so instead of staying silent', async () => {
  const { context, statuses } = playContext([], { data: { hasDemo: true }, api: async () => ({}) });
  await vm.runInContext('togglePlay()', context);
  assert.equal(vm.runInContext('playTimer', context), null);
  assert.match(statuses.at(-1), /Show All/);
});

test('your own network has no built-in traffic: Play keeps the Send PDU message', async () => {
  const { context, statuses } = playContext([], { data: { hasDemo: false }, api: async () => { throw new Error('must not call'); } });
  await vm.runInContext('togglePlay()', context);
  assert.match(statuses.at(-1), /Send a PDU first/);
});
