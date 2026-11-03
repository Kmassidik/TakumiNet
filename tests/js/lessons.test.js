'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '../..');
const source = fs.readFileSync(path.join(root, 'web/js/lessons.js'), 'utf8');

class Element {
  constructor(tagName = 'div') {
    this.tagName = tagName.toUpperCase();
    this.children = [];
    this.dataset = {};
    this.attributes = {};
    this.hidden = false;
    this.disabled = false;
    this.className = '';
    this.textContent = '';
  }
  appendChild(child) { this.children.push(child); return child; }
  replaceChildren(...children) { this.children = children; }
  setAttribute(name, value) { this.attributes[name] = String(value); }
}

function harness(responses = {}) {
  const ids = ['lesson-gallery', 'gallery-cards', 'gallery-note', 'lesson-panel',
    'gallery-mascot', 'lesson-mascot', 'lesson-title', 'lesson-goal', 'lesson-meta', 'lesson-steps',
    'lesson-checks', 'lesson-hint', 'check-work'];
  const elements = Object.fromEntries(ids.map((id) => [id, new Element()]));
  const sounds = [];
  const statuses = [];
  const context = vm.createContext({
    document: {
      createElement: (tag) => new Element(tag),
      getElementById: (id) => elements[id] || null,
    },
    ACTIONS: {},
    data: null,
    currentName: 'lab1',
    currentTemplate: null,
    simCursor: -1,
    selectedLink: null,
    api: async () => ({}),
    getJson: async (path) => responses[path] || {},
    setData: (json) => { context.data = json; },
    setSelection: () => {},
    sfx: (name) => sounds.push(name),
    status: (message, failed) => statuses.push({ message, failed }),
    hideGallery: () => {},
    confirm: () => true,
  });
  vm.runInContext(source, context);
  return { context, elements, sounds, statuses };
}

test('gallery renders native lesson cards with original icons and start actions', () => {
  const { context, elements } = harness();
  context.renderGallery({ templates: [
    { id: 'b', title: 'Second', level: 2, minutes: 10, goal: 'B', stepCount: 2, checkCount: 1 },
    { id: 'a', title: 'First', level: 1, minutes: 5, goal: 'A', stepCount: 3, checkCount: 2 },
  ] });
  assert.equal(elements['lesson-gallery'].hidden, false);
  const cards = elements['gallery-cards'].children;
  assert.equal(cards.length, 2);
  assert.equal(cards[0].dataset.template, 'a', 'gallery sorted by lesson id');
  const images = [];
  const visit = (el) => { if (el.tagName === 'IMG') images.push(el.src); el.children.forEach(visit); };
  cards.forEach(visit);
  assert.ok(images.every((src) => src === '/art3d/misc/network.png'));
  assert.equal(typeof cards[0].onclick, 'function');
});

test('gallery loading and errors use distinct mascot states', async () => {
  let resolveTemplates;
  const response = new Promise((resolve) => { resolveTemplates = resolve; });
  const { context, elements } = harness({ '/api/templates': response });
  const showing = context.showGallery();
  assert.match(elements['gallery-mascot'].src || '', /think\.png$/);
  assert.equal(elements['gallery-note'].textContent, 'Loading lessons…');

  resolveTemplates({ templates: [] });
  await showing;
  assert.match(elements['gallery-mascot'].src, /wave\.png$/);

  context.renderGallery({ error: 'Lessons unavailable' });
  assert.match(elements['gallery-mascot'].src, /error\.png$/);
  assert.equal(elements['gallery-note'].textContent, 'Lessons unavailable');
});

test('blank workspaces hide the lesson panel and lessons render steps and results', () => {
  const { context, elements } = harness();
  vm.runInContext('data = { lesson: null }', context);
  context.renderLesson();
  assert.equal(elements['lesson-panel'].hidden, true);

  vm.runInContext(`data = { lesson: {
    id: 'lab', title: 'A lab', level: 1, minutes: 5, goal: 'Ping',
    steps: [{ n: 1, text: 'One' }, { n: 2, text: 'Two' }],
    checks: [{ id: 'c1', label: 'Reach PC1' }]
  } }`, context);
  context.renderLessonResults([{ id: 'c1', label: 'Reach PC1', passed: false, actual: 'timed out', hint: 'Fix the cable' }]);
  assert.equal(elements['lesson-panel'].hidden, false);
  assert.equal(elements['lesson-title'].textContent, 'A lab');
  assert.equal(elements['lesson-steps'].children.length, 2);
  assert.match(elements['lesson-checks'].children[0].className, /failed/);
  assert.equal(elements['lesson-hint'].textContent, 'Fix the cable');
});

test('check action refreshes captures and uses success and failure mascot sounds', async () => {
  const success = harness({
    '/api/checks': { allPassed: true, results: [{ id: 'c1', label: 'Check', passed: true, actual: 'ok', hint: '' }] },
    '/api/workspace': { devices: [], links: [], filters: [], events: [{ proto: 'ICMP' }], tabs: {}, lesson: { id: 'lab', title: 'Lab', level: 1, minutes: 5, goal: '', steps: [], checks: [{ id: 'c1', label: 'Check' }] } },
  });
  vm.runInContext("data = { lesson: { id: 'lab', title: 'Lab', level: 1, minutes: 5, goal: '', steps: [], checks: [{ id: 'c1', label: 'Check' }] } }", success.context);
  await success.context.checkWork();
  assert.match(success.elements['lesson-mascot'].src, /happy\.png$/);
  assert.deepEqual(success.sounds, ['popUp']);
  assert.equal(success.elements['check-work'].disabled, false);

  const failure = harness({
    '/api/checks': { allPassed: false, results: [{ id: 'c1', label: 'Check', passed: false, actual: 'no route', hint: 'Set a gateway' }] },
    '/api/workspace': { devices: [], links: [], filters: [], events: [], tabs: {}, lesson: { id: 'lab', title: 'Lab', level: 1, minutes: 5, goal: '', steps: [], checks: [{ id: 'c1', label: 'Check' }] } },
  });
  vm.runInContext("data = { lesson: { id: 'lab', title: 'Lab', level: 1, minutes: 5, goal: '', steps: [], checks: [{ id: 'c1', label: 'Check' }] } }", failure.context);
  await failure.context.checkWork();
  assert.match(failure.elements['lesson-mascot'].src, /error\.png$/);
  assert.deepEqual(failure.sounds, ['errorMsg']);
  assert.equal(failure.elements['lesson-hint'].textContent, 'Set a gateway');
});
