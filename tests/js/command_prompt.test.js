'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const source = fs.readFileSync(path.resolve(__dirname, '../../web/js/command_prompt.js'), 'utf8');

class Element {
  constructor() {
    this.hidden = false;
    this.disabled = false;
    this.value = '';
    this.textContent = '';
    this.scrollTop = 0;
    this.scrollHeight = 100;
  }
  focus() {}
}

test('command prompt ping answers immediately then captures and animates its real path', async () => {
  const ids = ['cmd-window', 'cmd-out', 'cmd-in', 'cmd-close'];
  const elements = Object.fromEntries(ids.map((id) => [id, new Element()]));
  const refreshes = [];
  const snapshots = [];
  const animations = [];
  const context = vm.createContext({
    document: { getElementById: (id) => elements[id] },
    data: { devices: [], events: [] },
    simCursor: -1,
    URLSearchParams,
    bringToFront() {},
    fetch: async () => ({ json: async () => ({ output: 'Reply from 192.168.2.10: bytes=32 TTL=127\n' }) }),
    getJson: (path) => new Promise((resolve) => refreshes.push({ path, resolve })),
    setData: (snapshot) => snapshots.push(snapshot),
    renderEvents() {},
    animatePath: (path) => animations.push(path),
  });
  vm.runInContext(source, context);
  context.openCmd({ id: 'pc0', name: 'PC0' });

  elements['cmd-in'].value = 'ping -n 1 192.168.2.10';
  await elements['cmd-in'].onkeydown({ key: 'Enter' });
  assert.match(elements['cmd-out'].textContent, /Reply from 192\.168\.2\.10/);
  assert.equal(elements['cmd-in'].disabled, false);
  assert.equal(refreshes.length, 1);
  assert.equal(snapshots.length, 0, 'command output must not wait for the capture refresh');

  const path = ['pc0', 'switch0', 'router0', 'switch1', 'pc2'];
  refreshes[0].resolve({ devices: [], links: [], events: [{ id: 7, path }] });
  for (let i = 0; i < 3; i++) await Promise.resolve();
  assert.equal(snapshots.length, 1);
  assert.deepEqual(animations, [path]);
  assert.equal(vm.runInContext('simCursor', context), 7);
});
