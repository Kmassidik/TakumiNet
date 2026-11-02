const gridEl = document.getElementById('grid');
const dirsEl = document.getElementById('dirs');
const crumbEl = document.getElementById('crumb');
const statsEl = document.getElementById('stats');
const emptyEl = document.getElementById('empty');
const searchEl = document.getElementById('search');
const overlay = document.getElementById('overlay');

let state = { dir: '', files: [] };

const enc = (p) => p.split('/').map(encodeURIComponent).join('/');
const assetUrl = (p) => '/assets/' + enc(p);

function humanSize(n) {
  if (n < 1024) return n + ' B';
  const units = ['KB', 'MB', 'GB'];
  let v = n / 1024;
  let i = 0;
  while (v >= 1024 && i < units.length - 1) { v /= 1024; i++; }
  return v.toFixed(v < 10 ? 1 : 0) + ' ' + units[i];
}

function ext(name) {
  const i = name.lastIndexOf('.');
  return i > 0 ? name.slice(i + 1).toUpperCase() : '—';
}

async function boot() {
  const status = await (await fetch('/api/status')).json();
  if (!status.exists) {
    statsEl.textContent = 'no asset root';
    gridEl.innerHTML =
      '<p class="empty">No Packet Tracer tree found. Run <code>./scripts/intake.sh</code> ' +
      'or set <code>ASSET_ROOT</code> to the extracted <code>opt/pt</code>.</p>';
    return;
  }
  statsEl.textContent = `${status.files.toLocaleString()} files · ${humanSize(status.bytes)} · ${status.root}`;
  searchEl.addEventListener('input', () => renderGrid());
  load('');
}

async function load(dir) {
  const res = await (await fetch('/api/assets?dir=' + encodeURIComponent(dir))).json();
  if (res.error) {
    state = { dir: '', files: [] };
    renderDirs([]);
    renderGrid();
    return;
  }
  state.dir = res.path;
  state.files = res.files;
  renderCrumb(res.path);
  renderDirs(res.dirs);
  renderGrid();
}

function renderCrumb(path) {
  crumbEl.replaceChildren();
  const rootBtn = document.createElement('button');
  rootBtn.className = 'crumb-link';
  rootBtn.textContent = 'opt/pt';
  rootBtn.onclick = () => load('');
  crumbEl.appendChild(rootBtn);

  let acc = '';
  for (const part of path.split('/').filter(Boolean)) {
    acc = acc ? `${acc}/${part}` : part;
    const target = acc;
    const sep = document.createElement('span');
    sep.className = 'sep';
    sep.textContent = '/';
    crumbEl.appendChild(sep);
    const b = document.createElement('button');
    b.className = 'crumb-link';
    b.textContent = part;
    b.onclick = () => load(target);
    crumbEl.appendChild(b);
  }
}

function renderDirs(dirs) {
  dirsEl.replaceChildren();
  if (state.dir) {
    const up = document.createElement('li');
    const b = document.createElement('button');
    b.className = 'dir';
    b.textContent = '..';
    const parent = state.dir.includes('/') ? state.dir.split('/').slice(0, -1).join('/') : '';
    b.onclick = () => load(parent);
    up.appendChild(b);
    dirsEl.appendChild(up);
  }
  for (const d of dirs) {
    const li = document.createElement('li');
    const b = document.createElement('button');
    b.className = 'dir';
    b.textContent = d.name;
    b.onclick = () => load(d.path);
    li.appendChild(b);
    dirsEl.appendChild(li);
  }
}

function renderGrid() {
  const q = searchEl.value.trim().toLowerCase();
  const files = state.files.filter((f) => !q || f.name.toLowerCase().includes(q));
  gridEl.replaceChildren();
  emptyEl.hidden = files.length > 0;

  for (const f of files) {
    const tile = document.createElement('button');
    tile.className = `tile ${f.kind}`;
    tile.title = `${f.path}\n${humanSize(f.size)}`;

    if (f.kind === 'image') {
      const img = document.createElement('img');
      img.loading = 'lazy';
      img.src = assetUrl(f.path);
      img.alt = f.name;
      tile.appendChild(img);
    } else {
      const badge = document.createElement('div');
      badge.className = 'badge';
      badge.textContent = ext(f.name);
      tile.appendChild(badge);
    }

    const label = document.createElement('span');
    label.className = 'label';
    label.textContent = f.name;
    tile.appendChild(label);

    tile.onclick = () => preview(f);
    gridEl.appendChild(tile);
  }
}

async function preview(f) {
  document.getElementById('pv-title').textContent = f.name;
  document.getElementById('pv-meta').textContent = `${f.path} · ${humanSize(f.size)} · ${f.kind}`;
  const body = document.getElementById('pv-body');
  body.replaceChildren();
  overlay.hidden = false;

  if (f.kind === 'image') {
    const img = document.createElement('img');
    img.className = 'fulll';
    img.src = assetUrl(f.path);
    body.appendChild(img);
    return;
  }

  if (f.kind === 'audio') {
    const audio = document.createElement('audio');
    audio.controls = true;
    audio.autoplay = true;
    audio.src = assetUrl(f.path);
    body.appendChild(audio);
    return;
  }

  if (f.kind === 'text' && f.size < 512 * 1024) {
    const text = await (await fetch(assetUrl(f.path))).text();
    const pre = document.createElement('pre');
    pre.className = 'text';
    pre.textContent = text.slice(0, 200000);
    body.appendChild(pre);
    return;
  }

  const p = document.createElement('p');
  p.className = 'note';
  p.textContent = f.kind === 'text'
    ? 'File too large to preview inline.'
    : 'Binary asset — no inline preview.';
  body.appendChild(p);
  const a = document.createElement('a');
  a.href = assetUrl(f.path);
  a.textContent = 'open raw';
  a.target = '_blank';
  a.rel = 'noopener';
  body.appendChild(a);
}

function closePreview() { overlay.hidden = true; document.getElementById('pv-body').replaceChildren(); }
document.getElementById('close').onclick = closePreview;
overlay.onclick = (e) => { if (e.target === overlay) closePreview(); };
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closePreview(); });

boot();
