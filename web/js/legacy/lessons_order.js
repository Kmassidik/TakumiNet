const LESSON_LEVEL_NAMES = Object.freeze({
  1: "Home",
  2: "Neighbourhood",
  3: "Office",
  4: "Campus",
  5: "Data center",
  6: "ISP",
  7: "City",
  8: "Regency",
  9: "Province",
  10: "Nation",
  11: "World"
});
function lessonLevel(item) {
  const level = Number(item && item.level);
  if (Number.isInteger(level) && level > 0)
    return level;
  const fromId = /^les-l(\d+)-/.exec(item && item.id || "");
  return fromId ? Number(fromId[1]) : 0;
}
function lessonLevelHeading(level) {
  const name = LESSON_LEVEL_NAMES[level];
  if (name)
    return `Level ${level} — ${name}`;
  return level > 0 ? `Level ${level}` : "Lessons";
}
function lessonOrderKey(id) {
  const text = String(id || "");
  const starter = /^t(\d+)$/.exec(text);
  if (starter)
    return { family: 0, number: Number(starter[1]), text };
  const lesson = /^les-l\d+-(\d+)/.exec(text);
  if (lesson)
    return { family: 1, number: Number(lesson[1]), text };
  return { family: 2, number: 0, text };
}
function compareLessons(a, b) {
  const byLevel = lessonLevel(a) - lessonLevel(b);
  if (byLevel)
    return byLevel;
  const ka = lessonOrderKey(a && a.id);
  const kb = lessonOrderKey(b && b.id);
  return ka.family - kb.family || ka.number - kb.number || ka.text.localeCompare(kb.text);
}
function groupLessonsByLevel(lessons) {
  const sorted = [...lessons || []].sort(compareLessons);
  const groups = [];
  for (const item of sorted) {
    const level = lessonLevel(item);
    const last = groups[groups.length - 1];
    if (last && last.level === level)
      last.lessons.push(item);
    else
      groups.push({ level, heading: lessonLevelHeading(level), lessons: [item] });
  }
  return groups;
}
function firstSentence(text) {
  const clean = String(text || "").trim();
  const match = /^[^.!?]*[.!?]/.exec(clean);
  return (match ? match[0] : clean).trim();
}
