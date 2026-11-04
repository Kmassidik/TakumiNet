'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '../..');
const source = fs.readFileSync(path.join(root, 'web/js/actions.js'), 'utf8');
const stateSource = fs.readFileSync(path.join(root, 'web/js/state.js'), 'utf8');
const html = fs.readFileSync(path.join(root, 'web/index.html'), 'utf8');

/* The fake interval is controllable: tick() runs every pending callback once,
   so the auto-pause and rewind paths actually execute in the tests. */
function playContext(events, extra = {}) {
  const statuses = [];
  const sounds = [];
  const intervals = new Map();
  let nextTimer = 1;
  const context = vm.createContext({
    console,
    icon3d: (key) => key,
    status: (msg) => statuses.push(msg),
    sfx: (name) => sounds.push(name),
    visibleEvents: () => events,
    renderEvents() {},
    animatePath() {},
    simCursor: -1,
    playbackSpeed: 1,
    playTimer: null,
    document: { querySelector: () => ({ src: '' }), getElementById: () => null },
    setInterval: (fn) => { const id = nextTimer; nextTimer += 1; intervals.set(id, fn); return id; },
    clearInterval: (id) => { intervals.delete(id); },
    ...extra,
  });
  vm.runInContext(source, context);
  const tick = () => { for (const fn of [...intervals.values()]) fn(); };
  return { context, statuses, sounds, tick };
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

test('Play mid-capture resumes from the cursor without rewinding or resending', async () => {
  const calls = [];
  const { context, tick } = playContext([{ id: 1 }, { id: 2 }, { id: 3 }], {
    simCursor: 1,
    data: { hasDemo: true },
    api: async (path) => { calls.push(path); return {}; },
  });
  await vm.runInContext('togglePlay()', context);
  assert.deepEqual(calls, []);
  assert.equal(vm.runInContext('simCursor', context), 1);
  tick();
  assert.equal(vm.runInContext('simCursor', context), 2);
});

test('Play at the end of the capture rewinds and replays without resending', async () => {
  const calls = [];
  const { context, tick } = playContext([{ id: 1 }, { id: 2 }], {
    simCursor: 2,
    data: { hasDemo: true },
    api: async (path) => { calls.push(path); return {}; },
  });
  await vm.runInContext('togglePlay()', context);
  assert.deepEqual(calls, [], 'the capture is already here; nothing is sent again');
  assert.equal(vm.runInContext('simCursor', context), -1, 'the cursor rewinds to the start');
  assert.notEqual(vm.runInContext('playTimer', context), null);
  tick();
  assert.equal(vm.runInContext('simCursor', context), 1, 'replay begins at the first event');
});

test('the auto-pause at the end still fires, and the next Play starts over', async () => {
  const { context, statuses, tick } = playContext([{ id: 1 }, { id: 2 }], {
    data: { hasDemo: true },
    api: async () => { throw new Error('must not call'); },
  });
  await vm.runInContext('togglePlay()', context);
  tick();
  tick();
  assert.equal(vm.runInContext('simCursor', context), 2);
  tick();
  assert.equal(vm.runInContext('playTimer', context), null, 'reaching the last event pauses');
  assert.equal(statuses.at(-1), 'Paused');
  await vm.runInContext('togglePlay()', context);
  assert.equal(vm.runInContext('simCursor', context), -1);
  assert.notEqual(vm.runInContext('playTimer', context), null);
});

test('Reset then Play sends the built-in traffic again', async () => {
  const events = [{ id: 1 }];
  const calls = [];
  const { context } = playContext(events, {
    simCursor: 1,
    data: { hasDemo: true },
    api: async (path) => {
      calls.push(path);
      if (path === '/api/sim/reset') events.length = 0;
      if (path === '/api/demo') events.push({ id: 2 });
      return {};
    },
  });
  await vm.runInContext("ACTIONS['reset-sim']()", context);
  assert.equal(vm.runInContext('simCursor', context), -1);
  await vm.runInContext('togglePlay()', context);
  assert.deepEqual(calls, ['/api/sim/reset', '/api/demo']);
  assert.notEqual(vm.runInContext('playTimer', context), null);
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

test('a half-failed demo renders the events it captured and shows the error', async () => {
  const rendered = [];
  const statusBar = { textContent: '' };
  const statusIcon = { hidden: true };
  const reply = { error: 'Built-in ping from WargaTerpencil failed', devices: [{ id: 'pc0' }], events: [{ id: 1 }] };
  const context = vm.createContext({
    console,
    URLSearchParams,
    fetch: async () => ({ json: async () => reply }),
    localStorage: { getItem: () => null, setItem() {} },
    document: {
      getElementById: (id) => (id === 'status-msg' ? statusBar : statusIcon),
      querySelectorAll: () => [],
    },
    Audio: function Audio() { return { currentTime: 0, play: () => Promise.resolve() }; },
    renderFilters: () => rendered.push('filters'),
    renderAll: () => rendered.push('all'),
  });
  vm.runInContext(stateSource, context);
  const res = await vm.runInContext("api('/api/demo')", context);
  assert.equal(res.error, reply.error);
  assert.equal(statusBar.textContent, reply.error, 'the error is shown');
  assert.equal(statusIcon.hidden, false);
  assert.ok(rendered.includes('all'), 'the captured-so-far events are rendered');
  assert.equal(vm.runInContext('data', context).events.length, 1);
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

test('pressing Play twice while the built-in traffic is on its way sends it once and starts one timer', async () => {
  const events = [];
  const calls = [];
  let release;
  const gate = new Promise((resolve) => { release = resolve; });
  const timers = [];
  const { context, sounds } = playContext(events, {
    data: { hasDemo: true },
    api: async (path) => { calls.push(path); await gate; events.push({ id: 1 }); return {}; },
    setInterval: () => { timers.push(1); return timers.length; },
  });
  const first = vm.runInContext('togglePlay()', context);
  const second = vm.runInContext('togglePlay()', context);
  release();
  await Promise.all([first, second]);
  assert.deepEqual(calls, ['/api/demo']);
  assert.equal(timers.length, 1);
  assert.deepEqual(sounds, ['movieControlButton']);
});

test('a failed built-in traffic run lets the next Play press try again', async () => {
  let attempts = 0;
  const events = [];
  const { context } = playContext(events, {
    data: { hasDemo: true },
    api: async () => { attempts += 1; if (attempts === 1) return { error: 'x' }; events.push({ id: 1 }); return {}; },
  });
  await vm.runInContext('togglePlay()', context);
  assert.equal(vm.runInContext('playTimer', context), null);
  await vm.runInContext('togglePlay()', context);
  assert.notEqual(vm.runInContext('playTimer', context), null);
  assert.equal(attempts, 2);
});
