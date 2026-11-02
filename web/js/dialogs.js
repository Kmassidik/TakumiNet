/* ---------------- dialogs catalog browser ---------------- */
/* Reference browser over the extracted UI catalog (GET /api/dialogs). The
   endpoint only takes q and limit, so page N is read by asking for N pages
   worth of rows and dropping the earlier ones. */
const DIALOGS_PAGE = 200;
const DIALOGS_MAX = 1000;

function openDialogs() {
  const $ = (id) => document.getElementById(id);
  const win = $('dialogs-dialog');
  const search = $('dialogs-search');
  const list = $('dialogs-list');
  const note = $('dialogs-note');
  const prev = $('dialogs-prev');
  const next = $('dialogs-next');
  const pageInfo = $('dialogs-page');
  let page = 0;
  let seq = 0;
  let timer = null;

  const load = async () => {
    const run = ++seq;
    const q = search.value.trim();
    const limit = Math.min(DIALOGS_MAX, (page + 1) * DIALOGS_PAGE);
    note.textContent = 'Loading…';
    let r;
    try {
      const res = await fetch(`/api/dialogs?${new URLSearchParams({ q, limit: String(limit) })}`);
      r = await res.json();
    } catch {
      r = null;
    }
    if (run !== seq) return;
    list.replaceChildren();
    if (!r || r.available !== true) {
      note.textContent = 'catalog unavailable';
      pageInfo.textContent = '';
      prev.disabled = true;
      next.disabled = true;
      return;
    }
    const items = Array.isArray(r.items) ? r.items : [];
    const start = page * DIALOGS_PAGE;
    const pageItems = items.slice(start, start + DIALOGS_PAGE);
    for (const item of pageItems) {
      const row = document.createElement('div');
      row.className = 'dialog-row';
      const name = document.createElement('div');
      name.className = 'dialog-name';
      name.textContent = item.dialog || '(unnamed)';
      const text = document.createElement('div');
      text.className = 'dialog-text';
      text.textContent = item.text || '';
      row.appendChild(name);
      row.appendChild(text);
      const label = `${item.dialog || ''} ${item.text || ''}`.toLowerCase();
      const wired = label.includes('ip configuration') || label.includes('ipconfig')
        ? () => selected && openIpDialog(selected)
        : label.includes('wireless') || label.includes('wlan')
          ? () => selected && openWifi(selected)
          : label.includes('smtp') || label.includes('e-mail') || label.includes('email')
            ? () => selected && openMail(selected)
            : String(item.dialog || '').toLowerCase() === 'preferences'
              ? () => ACTIONS.preferences()
              : String(item.dialog || '').toLowerCase() === 'about'
                ? () => ACTIONS.about()
                : null;
      if (wired) {
        row.classList.add('dialog-wired');
        row.title = 'Open this dialog for the selected device';
        row.onclick = () => {
          if (!selected && !/preferences|about/i.test(String(item.dialog))) {
            status('Select a device first');
            sfx('errorMsg');
            return;
          }
          wired();
        };
      }
      list.appendChild(row);
    }
    if (!pageItems.length) {
      const empty = document.createElement('div');
      empty.className = 'meta';
      empty.textContent = q ? `No dialogs match "${q}"` : 'No dialogs in the catalog';
      list.appendChild(empty);
    }
    pageInfo.textContent = `Page ${page + 1}`;
    prev.disabled = page === 0;
    next.disabled = items.length < limit || limit >= DIALOGS_MAX;
    note.textContent =
      `${pageItems.length} shown · ${items.length} fetched · ${Number(r.total) || 0} rows in catalog`;
  };

  const close = () => {
    win.hidden = true;
    if (timer) { clearTimeout(timer); timer = null; }
  };

  page = 0;
  search.oninput = () => {
    clearTimeout(timer);
    timer = setTimeout(() => { page = 0; load(); }, 250);
  };
  prev.onclick = () => { if (page > 0) { page -= 1; load(); } };
  next.onclick = () => { page += 1; load(); };
  $('dialogs-close').onclick = close;
  win.onclick = (e) => { if (e.target === win) close(); };
  win.hidden = false;
  bringToFront(win);
  load();
  search.focus();
}
