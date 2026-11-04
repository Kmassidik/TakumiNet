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
    'lesson-checks', 'lesson-hint', 'check-work', 'lesson-empty'];
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
    markClean() {},
    askConfirm: async () => true,
  });
  vm.runInContext(source, context);
  return { context, elements, sounds, statuses };
}

test('gallery renders native lesson cards with original icons and start actions', () => {
  const { context, elements } = harness();
  context.renderGallery({ lessons: [
    { id: 'b', title: 'Second', level: 2, minutes: 10, goal: 'B', stepCount: 2, checkCount: 1 },
    { id: 'a', title: 'First', level: 1, minutes: 5, goal: 'A', stepCount: 3, checkCount: 2 },
  ] });
  assert.equal(elements['lesson-gallery'].hidden, false);
  const collect = (el, out = []) => { if (el.dataset && el.dataset.template) out.push(el); el.children.forEach((c) => collect(c, out)); return out; };
  const cards = collect(elements['gallery-cards']);
  assert.equal(cards.length, 2);
  assert.equal(cards[0].dataset.template, 'a', 'gallery sorted by lesson id');
  const images = [];
  const visit = (el) => { if (el.tagName === 'IMG') images.push(el.src); el.children.forEach(visit); };
  cards.forEach(visit);
  assert.ok(images.every((src) => src === '/art3d/misc/network.webp'));
  assert.equal(typeof cards[0].onclick, 'function');
});

test('gallery loading and errors use distinct mascot states', async () => {
  let resolveTemplates;
  const response = new Promise((resolve) => { resolveTemplates = resolve; });
  const { context, elements } = harness({ '/api/templates': response });
  const showing = context.showGallery();
  assert.match(elements['gallery-mascot'].src || '', /think\.webp$/);
  assert.equal(elements['gallery-note'].textContent, 'Loading lessons…');

  resolveTemplates({ lessons: [], templates: [] });
  await showing;
  assert.match(elements['gallery-mascot'].src, /wave\.webp$/);

  context.renderGallery({ error: 'Lessons unavailable' });
  assert.match(elements['gallery-mascot'].src, /error\.webp$/);
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
  assert.match(success.elements['lesson-mascot'].src, /happy\.webp$/);
  assert.deepEqual(success.sounds, ['popUp']);
  assert.equal(success.elements['check-work'].disabled, false);

  const failure = harness({
    '/api/checks': { allPassed: false, results: [{ id: 'c1', label: 'Check', passed: false, actual: 'no route', hint: 'Set a gateway' }] },
    '/api/workspace': { devices: [], links: [], filters: [], events: [], tabs: {}, lesson: { id: 'lab', title: 'Lab', level: 1, minutes: 5, goal: '', steps: [], checks: [{ id: 'c1', label: 'Check' }] } },
  });
  vm.runInContext("data = { lesson: { id: 'lab', title: 'Lab', level: 1, minutes: 5, goal: '', steps: [], checks: [{ id: 'c1', label: 'Check' }] } }", failure.context);
  await failure.context.checkWork();
  assert.match(failure.elements['lesson-mascot'].src, /error\.webp$/);
  assert.deepEqual(failure.sounds, ['errorMsg']);
  assert.equal(failure.elements['lesson-hint'].textContent, 'Set a gateway');
});

test('steps unlock one at a time: a check-backed step is done when its check passes', () => {
  const { context } = harness();
  const steps = [
    { n: 1, text: 'Set PC0', check: '' },
    { n: 2, text: 'Ping PC1', check: 'c1' },
    { n: 3, text: 'Read the table', check: '' },
  ];
  const states = (results, completed) =>
    vm.runInContext('stepStates', context)(steps, results, new Set(completed)).map((s) => s.state);
  assert.deepEqual(states([], []), ['current', 'locked', 'locked']);
  assert.deepEqual(states([], [1]), ['done', 'current', 'locked']);
  assert.deepEqual(states([{ id: 'c1', passed: true }], []), ['current', 'done', 'locked']);
  assert.deepEqual(states([{ id: 'c1', passed: false }], [1]), ['done', 'current', 'locked']);
  assert.deepEqual(states([{ id: 'c1', passed: true }], [1]), ['done', 'done', 'current']);
});

const catalog = {
  lessons: [
    { id: 't2', title: 'Second', level: 2, minutes: 10, goal: 'B', stepCount: 2, checkCount: 1 },
    { id: 't1', title: 'First', level: 1, minutes: 5, goal: 'A', stepCount: 3, checkCount: 2 },
  ],
  templates: [{ id: 'tpl-star', title: 'Star network', goal: 'Many PCs on one switch' }],
};

function cardIds(elements) {
  const out = [];
  const walk = (el) => { if (el.dataset && el.dataset.template) out.push(el.dataset.template); el.children.forEach(walk); };
  walk(elements['gallery-cards']);
  return out;
}

test('Examples > Lessons opens the window with only the lessons', async () => {
  const { context, elements } = harness({ '/api/templates': catalog });
  await context.ACTIONS['show-lessons']();
  assert.equal(elements['lesson-gallery'].hidden, false);
  assert.deepEqual(cardIds(elements), ['t1', 't2']);
  assert.match(elements['gallery-note'].textContent, /Start a lesson/);
});

test('Examples > Example templates opens the window with only the templates', async () => {
  const { context, elements } = harness({ '/api/templates': catalog });
  await context.ACTIONS['show-templates']();
  assert.deepEqual(cardIds(elements), ['tpl-star']);
  assert.match(elements['gallery-note'].textContent, /press Play/);
});

test('the first-visit window still shows both lists', async () => {
  const { context, elements } = harness({ '/api/templates': catalog });
  await context.showGallery();
  assert.deepEqual(cardIds(elements), ['tpl-star', 't1', 't2']);
});

test('clicking a card opens that template or lesson', async () => {
  const opened = [];
  const { context, elements } = harness({ '/api/templates': catalog });
  context.api = async (path, body) => { opened.push([path, body.id]); return { lesson: null }; };
  await context.ACTIONS['show-templates']();
  elements['gallery-cards'].children[0].children[1].children[0].onclick();
  await new Promise((resolve) => setImmediate(resolve));
  assert.deepEqual(opened, [['/api/templates/open', 'tpl-star']]);
});

test('an empty or failed catalog shows a message in the window', async () => {
  const { context, elements } = harness({ '/api/templates': {} });
  await context.ACTIONS['show-lessons']();
  assert.match(elements['gallery-note'].textContent, /Nothing here yet/);
  context.renderGallery({ error: 'Lessons unavailable' }, 'lessons');
  assert.equal(elements['gallery-note'].textContent, 'Lessons unavailable');
});

test('the Lesson tab shows its empty message until a lesson is open', () => {
  const { context, elements } = harness();
  vm.runInContext('data = { lesson: null }', context);
  context.renderLesson();
  assert.equal(elements['lesson-empty'].hidden, false);
}) ;
