/* ---------------- pure ordering helpers for the lesson gallery ---------------- */
/* Loaded before lessons.js; plain globals like the rest of web/js. */

/* One name per rung of the scale ladder, matching the landing page copy:
   homes, RT/RW neighbourhoods, offices, campuses, leaf-spine fabrics, ISPs,
   then city, regency, province, nation and world. */
const LESSON_LEVEL_NAMES = Object.freeze({
  1: 'Home',
  2: 'Neighbourhood',
  3: 'Office',
  4: 'Campus',
  5: 'Data center',
  6: 'ISP',
  7: 'City',
  8: 'Regency',
  9: 'Province',
  10: 'Nation',
  11: 'World',
});

function lessonLevel(item) {
  const level = Number(item && item.level);
  if (Number.isInteger(level) && level > 0) return level;
  const fromId = /^les-l(\d+)-/.exec((item && item.id) || '');
  return fromId ? Number(fromId[1]) : 0;
}

function lessonLevelHeading(level) {
  const name = LESSON_LEVEL_NAMES[level];
  if (name) return `Level ${level} — ${name}`;
  return level > 0 ? `Level ${level}` : 'Lessons';
}

/* Starter ids (t1…t5) come before les-lN-NN ids inside a level; anything else
   falls to the end of its level in plain text order. */
function lessonOrderKey(id) {
  const text = String(id || '');
  const starter = /^t(\d+)$/.exec(text);
  if (starter) return { family: 0, number: Number(starter[1]), text };
  const lesson = /^les-l\d+-(\d+)/.exec(text);
  if (lesson) return { family: 1, number: Number(lesson[1]), text };
  return { family: 2, number: 0, text };
}

function compareLessons(a, b) {
  const byLevel = lessonLevel(a) - lessonLevel(b);
  if (byLevel) return byLevel;
  const ka = lessonOrderKey(a && a.id);
  const kb = lessonOrderKey(b && b.id);
  return (ka.family - kb.family) || (ka.number - kb.number) || ka.text.localeCompare(kb.text);
}

function groupLessonsByLevel(lessons) {
  const sorted = [...(lessons || [])].sort(compareLessons);
  const groups = [];
  for (const item of sorted) {
    const level = lessonLevel(item);
    const last = groups[groups.length - 1];
    if (last && last.level === level) last.lessons.push(item);
    else groups.push({ level, heading: lessonLevelHeading(level), lessons: [item] });
  }
  return groups;
}

/* The dimmed teaser shown on a locked step: just its first sentence. */
function firstSentence(text) {
  const clean = String(text || '').trim();
  const match = /^[^.!?]*[.!?]/.exec(clean);
  return (match ? match[0] : clean).trim();
}
