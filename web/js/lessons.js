/* ---------------- native lesson gallery and guided-work panel ---------------- */
let lessonResults = [];
let lessonRunning = false;
let completedSteps = new Set();
let currentTemplate = null;

const LESSON_MASCOTS = Object.freeze({
  wave: '/art3d/mascot/wave.webp',
  think: '/art3d/mascot/think.webp',
  happy: '/art3d/mascot/happy.webp',
  error: '/art3d/mascot/error.webp',
});

function setLessonMascot(name) {
  const img = document.getElementById('lesson-mascot');
  if (img) img.src = LESSON_MASCOTS[name] || LESSON_MASCOTS.wave;
}

function setGalleryMascot(name) {
  const img = document.getElementById('gallery-mascot');
  if (img) img.src = LESSON_MASCOTS[name] || LESSON_MASCOTS.wave;
}

function hideGallery() {
  const gallery = document.getElementById('lesson-gallery');
  if (gallery) gallery.hidden = true;
}

function galleryCard(kind, item) {
  const card = document.createElement('button');
  card.type = 'button';
  card.className = kind === 'template' ? 'lesson-card template-card' : 'lesson-card';
  card.dataset.template = item.id;
  card.onclick = () => openTemplate(item.id);

  const icon = document.createElement('img');
  icon.src = '/art3d/misc/network.webp';
  icon.alt = '';
  icon.width = 72;
  icon.height = 72;
  card.appendChild(icon);

  const title = document.createElement('strong');
  title.textContent = item.title;
  card.appendChild(title);
  const goal = document.createElement('span');
  goal.className = 'lesson-card-goal';
  goal.textContent = item.goal;
  card.appendChild(goal);
  const meta = document.createElement('span');
  meta.className = 'lesson-card-meta';
  meta.textContent = kind === 'template'
    ? 'Ready to run · press Play to watch it'
    : `Level ${item.level} · ${item.minutes} min · ${item.stepCount} steps`;
  card.appendChild(meta);
  const action = document.createElement('span');
  action.className = 'lesson-card-action';
  action.textContent = kind === 'template' ? 'Open network →' : 'Start lesson →';
  card.appendChild(action);
  return card;
}

function gallerySection(heading, cards) {
  const section = document.createElement('section');
  section.className = 'gallery-section';
  const title = document.createElement('h3');
  title.textContent = heading;
  section.appendChild(title);
  const grid = document.createElement('div');
  grid.className = 'gallery-grid';
  for (const card of cards) grid.appendChild(card);
  section.appendChild(grid);
  return section;
}

/* `kind` is 'all' (first visit), 'lessons' or 'templates': the Examples menu opens
   this same window with just the one list. */
function renderGallery(payload = {}, kind = 'all') {
  const gallery = document.getElementById('lesson-gallery');
  const cards = document.getElementById('gallery-cards');
  const note = document.getElementById('gallery-note');
  if (!gallery || !cards) return;
  gallery.hidden = false;
  setGalleryMascot(payload.error ? 'error' : 'wave');
  const lessons = [...(payload.lessons || [])];
  const templates = [...(payload.templates || [])];
  const sections = [];
  if (kind !== 'lessons') sections.push(gallerySection('Example templates: ready to run', templates.map((item) => galleryCard('template', item))));
  if (kind !== 'templates') {
    for (const group of groupLessonsByLevel(lessons)) {
      sections.push(gallerySection(group.heading, group.lessons.map((item) => galleryCard('lesson', item))));
    }
  }
  cards.replaceChildren(...sections);
  if (note) {
    const shown = kind === 'lessons' ? lessons : kind === 'templates' ? templates : [...lessons, ...templates];
    const hint = kind === 'lessons' ? 'Start a lesson and do each step yourself.'
      : kind === 'templates' ? 'Open a template, then press Play to watch it run.'
      : 'Open a template to run it, or start a lesson and do each step yourself.';
    note.textContent = payload.error || (shown.length ? hint
      : 'Nothing here yet. You can start a blank workspace or open an .xml file now.');
  }
}

async function showGallery(kind = 'all') {
  const gallery = document.getElementById('lesson-gallery');
  const note = document.getElementById('gallery-note');
  if (gallery) gallery.hidden = false;
  setGalleryMascot('think');
  if (note) note.textContent = 'Loading lessons…';
  renderGallery(await getJson('/api/templates'), kind);
}

function resetLessonState() {
  lessonResults = [];
  lessonRunning = false;
  completedSteps = new Set();
  setLessonMascot('wave');
  const hint = document.getElementById('lesson-hint');
  if (hint) hint.textContent = '';
}

function renderLessonResults(results) {
  lessonResults = Array.isArray(results) ? results : [];
  renderLesson();
}

/* Each step is done when its check passes (check steps) or when the user ticks
   it (manual steps). The first step not yet done is the current one; the rest
   stay locked until it is done. */
function stepStates(steps, results, completed) {
  const passed = new Set(results.filter((r) => r.passed).map((r) => r.id));
  let currentFound = false;
  return steps.map((step) => {
    const done = step.check ? passed.has(step.check) : completed.has(step.n);
    if (done) return { n: step.n, state: 'done' };
    if (!currentFound) {
      currentFound = true;
      return { n: step.n, state: 'current' };
    }
    return { n: step.n, state: 'locked' };
  });
}

/* Shown under the checks once every check passes: the lesson is finished. */
function finishedBanner() {
  const banner = document.createElement('div');
  banner.className = 'lesson-check passed lesson-finished';
  const mascot = document.createElement('img');
  mascot.src = LESSON_MASCOTS.happy;
  mascot.alt = '';
  mascot.width = 40;
  mascot.height = 40;
  banner.appendChild(mascot);
  const copy = document.createElement('div');
  const label = document.createElement('strong');
  label.textContent = 'Lesson complete';
  copy.appendChild(label);
  const detail = document.createElement('small');
  detail.textContent = 'Every check passed. Pick your next lesson from Examples > Lessons.';
  copy.appendChild(detail);
  banner.appendChild(copy);
  return banner;
}

function renderLesson() {
  const panel = document.getElementById('lesson-panel');
  if (!panel) return;
  const lesson = data && data.lesson;
  panel.hidden = !lesson;
  const empty = document.getElementById('lesson-empty');
  if (empty) empty.hidden = Boolean(lesson);
  if (!lesson) return;
  if (typeof selectSidebarTab === 'function') selectSidebarTab('lesson');

  document.getElementById('lesson-title').textContent = lesson.title;
  document.getElementById('lesson-goal').textContent = lesson.goal;
  document.getElementById('lesson-meta').textContent = `Level ${lesson.level} · ${lesson.minutes} min`;
  if (!lessonRunning && !lessonResults.length) setLessonMascot('wave');

  const states = stepStates(lesson.steps || [], lessonResults, completedSteps);
  const steps = (lesson.steps || []).map((step, index) => {
    const state = states[index].state;
    const item = document.createElement('li');
    item.className = `lesson-step ${state}`;
    const label = document.createElement('label');
    const tick = document.createElement('input');
    tick.type = 'checkbox';
    tick.checked = state === 'done';
    tick.disabled = state === 'locked' || Boolean(step.check);
    tick.onchange = () => {
      if (tick.checked) completedSteps.add(step.n);
      else completedSteps.delete(step.n);
      renderLesson();
    };
    label.appendChild(tick);
    const text = document.createElement('span');
    text.textContent = state === 'locked' ? firstSentence(step.text) : step.text;
    label.appendChild(text);
    if (step.check && state !== 'locked') {
      const proof = document.createElement('small');
      const check = (lesson.checks || []).find((c) => c.id === step.check);
      proof.textContent = `Done when: ${check ? check.label : step.check}`;
      label.appendChild(proof);
    }
    item.appendChild(label);
    return item;
  });
  document.getElementById('lesson-steps').replaceChildren(...steps);

  const byId = new Map(lessonResults.map((result) => [result.id, result]));
  const checkList = lesson.checks || [];
  const checks = checkList.map((check) => {
    const result = byId.get(check.id);
    const row = document.createElement('div');
    row.className = `lesson-check ${lessonRunning ? 'running' : result ? (result.passed ? 'passed' : 'failed') : 'pending'}`;
    const symbol = document.createElement('span');
    symbol.className = 'lesson-check-icon';
    symbol.textContent = lessonRunning ? '…' : result ? (result.passed ? '✓' : '×') : '○';
    row.appendChild(symbol);
    const copy = document.createElement('div');
    const label = document.createElement('strong');
    label.textContent = check.label;
    copy.appendChild(label);
    const actual = document.createElement('small');
    actual.textContent = lessonRunning ? 'Checking live network state…' : result ? result.actual : 'Not checked yet';
    copy.appendChild(actual);
    if (!lessonRunning && result && !result.passed && result.hint) {
      const reason = document.createElement('small');
      reason.className = 'lesson-check-reason';
      reason.textContent = result.hint;
      copy.appendChild(reason);
    }
    row.appendChild(copy);
    return row;
  });
  const finished = !lessonRunning && checkList.length > 0
    && checkList.every((check) => { const result = byId.get(check.id); return result && result.passed; });
  if (finished) checks.push(finishedBanner());
  document.getElementById('lesson-checks').replaceChildren(...checks);
  const firstFailure = lessonResults.find((result) => !result.passed);
  document.getElementById('lesson-hint').textContent = lessonRunning ? '' : (firstFailure && firstFailure.hint) || '';
  document.getElementById('check-work').disabled = lessonRunning;
}

async function checkWork() {
  if (lessonRunning || !data || !data.lesson) return;
  lessonRunning = true;
  lessonResults = [];
  const previousEventIds = new Set((data.events || []).map((event) => event.id));
  setLessonMascot('think');
  renderLesson();
  const response = await getJson('/api/checks');
  if (!Array.isArray(response.results)) {
    lessonRunning = false;
    setLessonMascot('error');
    renderLesson();
    sfx('errorMsg');
    status(response.error || 'Could not run lesson checks', true);
    return;
  }
  lessonResults = response.results;
  lessonRunning = false;
  const workspace = await getJson('/api/workspace');
  if (workspace && Array.isArray(workspace.devices)) {
    setData(workspace);
    const checkedEvents = (workspace.events || []).filter((event) => !previousEventIds.has(event.id));
    const checked = checkedEvents.filter((event) => ['ICMP', 'HTTP', 'DNS'].includes(String(event.proto).toUpperCase())).pop() || checkedEvents.pop();
    if (checked && typeof selectCaptureEvent === 'function') selectCaptureEvent(checked.id);
  }
  renderLesson();
  if (response.allPassed) {
    setLessonMascot('happy');
    sfx('popUp');
    status('Lesson complete — every check passed');
  } else {
    setLessonMascot('error');
    sfx('errorMsg');
    const first = lessonResults.find((result) => !result.passed);
    status((first && first.hint) || 'Some lesson checks still need work', true);
  }
}

async function openTemplate(id, resetting = false) {
  const response = await api('/api/templates/open', { id });
  if (response.error) return response;
  currentTemplate = id;
  currentName = id;
  markClean();
  simCursor = -1;
  selectedLink = null;
  setSelection([]);
  resetLessonState();
  renderLesson();
  if (typeof workspaceCanvas !== 'undefined' && workspaceCanvas) workspaceCanvas.fit();
  hideGallery();
  const title = response.lesson ? response.lesson.title : id;
  status(resetting ? `Reset ${title}` : `Opened ${title}`);
  if (!resetting) sfx('newScenarioButton');
  return response;
}

async function resetLesson() {
  const id = currentTemplate || (data && data.lesson && data.lesson.id);
  if (!id || !(await askConfirm('Reload the pristine lesson and discard this attempt?', 'Reload'))) return;
  await openTemplate(id, true);
}

ACTIONS['check-work'] = checkWork;
ACTIONS['reset-lesson'] = resetLesson;
ACTIONS['show-lessons'] = () => showGallery('lessons');
ACTIONS['show-templates'] = () => showGallery('templates');
