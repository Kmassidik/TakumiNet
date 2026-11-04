'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const source = fs.readFileSync(path.resolve(__dirname, '../../web/js/cli_help.js'), 'utf8');

class Node {
  constructor(tag) {
    this.tag = tag;
    this.children = [];
    this.textContent = '';
    this.className = '';
    this.hidden = true;
  }
  appendChild(child) { this.children.push(child); return child; }
  append(...kids) { this.children.push(...kids); }
  replaceChildren() { this.children = []; }
}

function walk(node, found = []) {
  found.push(node);
  node.children.forEach((child) => walk(child, found));
  return found;
}

test('command line help lists the modes and puts a tapped command in the box', () => {
  const win = new Node('div');
  const body = new Node('div');
  const context = vm.createContext({
    document: {
      getElementById: (id) => (id === 'cli-help-dialog' ? win : body),
      createElement: (tag) => new Node(tag),
    },
    bringToFront() {},
  });
  vm.runInContext(source, context);
  const picked = [];
  context.openCliHelp((code) => picked.push(code));
  assert.equal(win.hidden, false);
  const text = walk(body).map((n) => n.textContent).join('|');
  for (const needle of ['Router>', 'Router#', 'show ip interface brief', 'copy running-config startup-config', 'Type ?']) {
    assert.ok(text.includes(needle), `${needle} missing`);
  }
  const buttons = walk(body).filter((n) => n.tag === 'button');
  assert.ok(buttons.length >= 5);
  buttons[1].onclick();
  assert.deepEqual(picked, ['show ip interface brief']);
  assert.equal(win.hidden, true);
});
