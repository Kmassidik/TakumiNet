/* ---------------- web browser ---------------- */
/* `/api/webfetch` answers with a page, not a workspace snapshot, so it must
   bypass `api()` (which would try to re-render the topology from it). */
async function jsonRequest(path, params) {
  const q = new URLSearchParams(params).toString();
  const res = await fetch(`${path}?${q}`, { method: 'POST' });
  return res.json();
}

function openBrowser(d) {
  const win = document.getElementById('web-dialog');
  const url = document.getElementById('web-url');
  const body = document.getElementById('web-body');
  const statusEl = document.getElementById('web-status');

  win.hidden = false;
  bringToFront(win);
  url.value = '';
  body.replaceChildren();
  statusEl.textContent = `${d.name} — type a server address`;

  const renderError = (text) => {
    const p = document.createElement('p');
    p.className = 'err';
    p.textContent = text;
    body.replaceChildren(p);
  };

  const go = async () => {
    const target = url.value.trim();
    if (!target) return;
    statusEl.textContent = `Connecting to ${target}…`;
    const r = await jsonRequest('/api/webfetch', { id: d.id, url: target });
    if (r.error) {
      statusEl.textContent = `${d.name} → ${target}`;
      renderError(r.error);
      return;
    }
    statusEl.textContent = `${r.status} ${r.reason} — ${r.host}`;
    body.replaceChildren();
    const h = document.createElement('h2');
    h.textContent = r.title;
    const p = document.createElement('p');
    p.textContent = r.text;
    body.appendChild(h);
    body.appendChild(p);
    sfx('popUp');
  };

  document.getElementById('web-go').onclick = go;
  url.onkeydown = (e) => { if (e.key === 'Enter') go(); };
  url.focus();
}

/* ---------------- text editor ---------------- */
/* Notes are per device and live in this browser only: the key is exactly
   `pt-web:editor:<device id>`, written on Save and read again on open. */
function editorKey(id) { return `pt-web:editor:${id}`; }

function openEditor(d) {
  const win = document.getElementById('editor-dialog');
  const area = document.getElementById('editor-text');
  const note = document.getElementById('editor-status');
  document.getElementById('editor-title').textContent = `Text Editor — ${d.name}`;

  let saved = '';
  try { saved = localStorage.getItem(editorKey(d.id)) || ''; } catch { /* storage blocked */ }
  area.value = saved;
  note.textContent = saved
    ? `Restored ${saved.length} characters for ${d.name}`
    : 'No saved text yet';

  document.getElementById('editor-save').onclick = () => {
    try {
      localStorage.setItem(editorKey(d.id), area.value);
      note.textContent = `Saved ${area.value.length} characters for ${d.name}`;
      sfx('popUp');
    } catch {
      note.textContent = 'Local storage is unavailable — the text was not saved';
    }
  };

  win.hidden = false;
  bringToFront(win);
  area.focus();
}
