'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '../..');
const source = fs.readFileSync(path.join(root, 'web/js/actions.js'), 'utf8');
const html = fs.readFileSync(path.join(root, 'web/index.html'), 'utf8');

function playContext(events) {
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
