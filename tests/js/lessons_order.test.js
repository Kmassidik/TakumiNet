'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '../..');
const source = fs.readFileSync(path.join(root, 'web/js/lessons_order.js'), 'utf8');

function load() {
  const context = vm.createContext({});
  vm.runInContext(source, context);
  return context;
}

test('lessonLevel reads the metadata and falls back to the id prefix', () => {
  const { lessonLevel } = load();
  assert.equal(lessonLevel({ id: 't1', level: 1 }), 1);
  assert.equal(lessonLevel({ id: 'les-l10-01-gateway-down', level: 10 }), 10);
  assert.equal(lessonLevel({ id: 'les-l7-02-two-cuts' }), 7, 'level parsed from the id');
  assert.equal(lessonLevel({ id: 'les-l3-01', level: 'bad' }), 3);
  assert.equal(lessonLevel({ id: 'mystery' }), 0);
  assert.equal(lessonLevel(null), 0);
});

test('lessonLevelHeading names every rung of the ladder', () => {
  const { lessonLevelHeading } = load();
  assert.equal(lessonLevelHeading(1), 'Level 1 — Home');
  assert.equal(lessonLevelHeading(2), 'Level 2 — Neighbourhood');
  assert.equal(lessonLevelHeading(5), 'Level 5 — Data center');
  assert.equal(lessonLevelHeading(11), 'Level 11 — World');
  assert.equal(lessonLevelHeading(12), 'Level 12', 'an unknown level still reads as a level');
  assert.equal(lessonLevelHeading(0), 'Lessons');
});

test('within a level, starter ids come first and les ids sort numerically', () => {
  const { compareLessons } = load();
  const ids = [
    'les-l1-11-made-up', 'les-l1-02-wifi-name', 't2', 'les-l1-01-router-login', 't1',
  ].map((id) => ({ id, level: 1 }));
  ids.sort(compareLessons);
  assert.deepEqual(Array.from(ids, (item) => item.id),
    ['t1', 't2', 'les-l1-01-router-login', 'les-l1-02-wifi-name', 'les-l1-11-made-up']);
});

test('levels order numerically, not lexically: 2 before 10 and 11', () => {
  const { groupLessonsByLevel } = load();
  const groups = groupLessonsByLevel([
    { id: 'les-l11-01-cable-cut', level: 11 },
    { id: 'les-l2-01-first-gateway', level: 2 },
    { id: 'les-l10-01-gateway-down', level: 10 },
    { id: 't5', level: 2 },
  ]);
  assert.deepEqual(Array.from(groups, (group) => group.level), [2, 10, 11]);
  assert.deepEqual(Array.from(groups[0].lessons, (item) => item.id), ['t5', 'les-l2-01-first-gateway']);
  assert.deepEqual(Array.from(groups, (group) => group.heading),
    ['Level 2 — Neighbourhood', 'Level 10 — Nation', 'Level 11 — World']);
});

test('groupLessonsByLevel survives an empty or missing catalog', () => {
  const { groupLessonsByLevel } = load();
  assert.equal(groupLessonsByLevel([]).length, 0);
  assert.equal(groupLessonsByLevel(undefined).length, 0);
  const unknown = groupLessonsByLevel([{ id: 'odd-one' }]);
  assert.equal(unknown[0].heading, 'Lessons');
});

test('firstSentence keeps one line and never throws on odd input', () => {
  const { firstSentence } = load();
  assert.equal(firstSentence('Set the gateway on PC0. Then ping PC1.'), 'Set the gateway on PC0.');
  assert.equal(firstSentence('Does it ping? Try again.'), 'Does it ping?');
  assert.equal(firstSentence('No full stop here'), 'No full stop here');
  assert.equal(firstSentence('   padded.   extra'), 'padded.');
  assert.equal(firstSentence(''), '');
  assert.equal(firstSentence(null), '');
});
