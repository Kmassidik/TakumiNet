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

function shell(responses) {
  const ids = ['cmd-window', 'cmd-out', 'cmd-in', 'cmd-prompt', 'cmd-title', 'cmd-help'];
  const elements = Object.fromEntries(ids.map((id) => [id, new Element()]));
  const sent = [];
  const context = vm.createContext({
    document: { getElementById: (id) => elements[id] },
    data: { devices: [], events: [] },
    URLSearchParams,
    bringToFront() {},
    fetch: async (url) => {
      const line = new URLSearchParams(url.split('?')[1]).get('line');
      sent.push(line);
      return { json: async () => (responses[line] || { output: '' }) };
    },
    getJson: () => new Promise(() => {}),
    setData() {},
  });
  vm.runInContext(fs.readFileSync(path.resolve(__dirname, '../../web/js/terminal.js'), 'utf8'), context);
  vm.runInContext(source, context);
  context.openCmd({ id: 'pc0', name: 'PC0', ip: '10.0.0.2' });
  return { elements, sent, context };
}

async function type(elements, line) {
  elements['cmd-in'].value = line;
  await elements['cmd-in'].onkeydown({ key: 'Enter' });
}

test('terminal shows name@address, follows the server prompt, and clears', async () => {
  const { elements } = shell({ hostname: { output: 'PC0\n', prompt: 'PC0@10.0.0.9:~$' } });
  assert.equal(elements['cmd-prompt'].textContent, 'PC0@10.0.0.2:~$');
  assert.match(elements['cmd-title'].textContent, /^Terminal/);
  assert.match(elements['cmd-out'].textContent, /--help/);
  await type(elements, 'hostname');
  assert.match(elements['cmd-out'].textContent, /PC0@10\.0\.0\.2:~\$ hostname\nPC0\n/);
  assert.equal(elements['cmd-prompt'].textContent, 'PC0@10.0.0.9:~$');
  await type(elements, 'clear');
  assert.equal(elements['cmd-out'].textContent, '');
});

test('terminal arrow keys walk back through earlier commands', async () => {
  const { elements } = shell({});
  await type(elements, 'ping 10.0.0.1');
  await type(elements, 'ip addr');
  const key = (k) => elements['cmd-in'].onkeydown({ key: k, preventDefault() {} });
  await key('ArrowUp');
  assert.equal(elements['cmd-in'].value, 'ip addr');
  await key('ArrowUp');
  assert.equal(elements['cmd-in'].value, 'ping 10.0.0.1');
  await key('ArrowDown');
  assert.equal(elements['cmd-in'].value, 'ip addr');
});

test('the Help button runs help, and ssh moves the prompt into the router session', async () => {
  const { elements, sent } = shell({
    'ssh admin@10.0.0.1': { output: 'Connected to 10.0.0.1.\n\n', peer: 'router0' },
    '': { output: '', prompt: 'Router>' },
  });
  await elements['cmd-help'].onclick();
  assert.deepEqual(sent, ['help']);
  await type(elements, 'ssh admin@10.0.0.1');
  assert.equal(elements['cmd-prompt'].textContent, 'Router>');
  await type(elements, 'exit');
  assert.equal(elements['cmd-prompt'].textContent, 'PC0@10.0.0.2:~$');
});
