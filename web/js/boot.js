async function boot() {
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

