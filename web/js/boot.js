async function boot() {
  // Every page load starts blank. The last network stays on the server until
  // this reset; a refresh should never reopen the previous template.
  if (typeof api === 'function') await api('/api/new');
  data = await getJson('/api/workspace');
  if (!data || !data.tabs || !Array.isArray(data.devices) || !Array.isArray(data.links)) {
    status('Workspace could not be loaded', true);
    sfx('errorMsg');
    renderGallery({ error: 'Workspace could not be loaded. Start a blank workspace or open a native .tnet file.' });
    wireMenus();
    wireActions();
    return;
  }
  document.getElementById('physical-tab').textContent = data.tabs.physical;
  initWorkspaceCanvas();
  renderToolbar(document.getElementById('toolbar-primary'), PRIMARY);
  renderToolbar(document.getElementById('toolbar-secondary'), SECONDARY);

  /* The logical/physical switch: a toolbar button plus the two tabs. */
  const viewToggle = document.createElement('button');
  viewToggle.type = 'button';
  viewToggle.id = 'physical-toggle';
  viewToggle.className = 'view-toggle';
  viewToggle.textContent = 'Physical';
  viewToggle.title = 'Toggle the physical workspace view';
  viewToggle.setAttribute('aria-pressed', 'false');
  viewToggle.onclick = () => setView(viewMode === 'physical' ? 'logical' : 'physical');
  document.getElementById('toolbar-secondary').appendChild(viewToggle);
  const noteButton = document.createElement('button');
  noteButton.type = 'button';
  noteButton.textContent = 'Note';
  noteButton.title = 'Add a note to the canvas';
  noteButton.dataset.action = 'add-note';
  document.getElementById('toolbar-secondary').appendChild(noteButton);
  document.querySelectorAll('.tabs .tab[data-view]').forEach((b) => {
    b.addEventListener('click', () => setView(b.dataset.view));
  });
  renderPalette();
  renderFilters();
  document.getElementById('run-log-filter').addEventListener('input', renderRunLog);
  renderAll();
  wireMenus();
  wireActions();
  wireKeyboard();
  wireCanvasDrop();
  wireWorkspaceCanvas();
  workspaceCanvas.fit();
  for (const id of ['device-window', 'cmd-window', 'term-window', 'web-dialog',
    'editor-dialog', 'pdu-dialog', 'firewall-dialog']) {
    makeWindowMovable(document.getElementById(id));
  }
  status('Ready');
  if (shouldAutoShowGallery()) await showGallery();
}


/* First visit: the engine is ~1.7 MB. Show progress until it is ready. */
function showEngineLoading() {
  const box = document.getElementById('engine-loading');
  const text = document.getElementById('engine-loading-text');
  const bar = document.getElementById('engine-bar-fill');
  if (!box || !text || !window.TakumiEngine) {
    if (box) box.hidden = true;
    return;
  }
  window.addEventListener('engine-progress', (e) => {
    text.textContent = engineLoadingMessage(e.detail);
    if (e.detail.total > 0) bar.style.width = `${Math.round((e.detail.loaded / e.detail.total) * 100)}%`;
    else bar.parentElement.classList.add('indeterminate');
  });
  TakumiEngine.ready.then((ok) => {
    text.textContent = ok ? 'Engine ready' : 'Engine unavailable: working with the server';
    box.hidden = true;
  });
}
