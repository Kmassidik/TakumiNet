/* ---------------- context menu ---------------- */
/* Right-click on the canvas: each thing offers what can be done to it, in the
   same dress as the menubar dropdowns. One menu at a time; Escape, an outside
   press or choosing an item closes it. */

/* The cables a device offers from its own menu; the palette keeps the rest. */
const CONTEXT_CABLE_KINDS = ['eCopper', 'eCross', 'eSerial', 'eFiber', 'eConsole'];

/* Arming from the menu goes through the same port chooser as a canvas click:
   it opens where the menu stood, and Escape leaves nothing armed. */
async function armCableFrom(d, kind) {
  const at = ctxMenuAt || { x: window.innerWidth / 2, y: window.innerHeight / 2 };
  const pick = await choosePort(d, kind, at);
  if (pick.cancelled) return;
  cableMode = true;
  cableKind = kind;
  pduMode = false;
  cableFrom = d.id;
  cableFromPort = pick.port;
  setSelection([d.id]);
  document.querySelector('.canvas-wrap').classList.add('cable-mode');
  updateCableChip();
  status(cableStatusText());
  renderPalette();
  renderTopology();
}

function deviceContextItems(d) {
  const items = [{
    label: 'Open',
    run: () => {
      if (!(typeof openWindowForKind === 'function' && openWindowForKind(d, data))) openDeviceWindow(d);
    },
  }];
  if (CONSOLE_KINDS.has(d.kind)) items.push({ label: 'Open CLI', run: () => openTerm(d) });
  items.push({
    label: 'Connect cable',
    children: CABLE_TYPES
      .filter(([kind]) => CONTEXT_CABLE_KINDS.includes(kind))
      .map(([kind, label]) => ({ label, run: () => armCableFrom(d, kind) })),
  });
  const replace = Array.isArray(d.replaceModels) ? d.replaceModels : [];
  if (replace.length) {
    items.push({
      label: 'Replace with…',
      children: replace.map((model) => ({
        label: model,
        run: async () => {
          const r = await api('/api/devices/replace', { id: d.id, model });
          if (r.error) { status(r.error, true); return; }
          const info = r.replace || { kept: 0, dropped: [] };
          const dropped = info.dropped.length ? `, dropped ${info.dropped.length} (${info.dropped.join(', ')})` : ', dropped 0';
          status(`Replaced ${d.name} with ${model}. Kept ${info.kept} cables${dropped}.`);
          sfx('devicePlacement');
        },
      })),
    });
  }
  items.push({
    label: 'Rename…',
    run: async () => {
      const name = await askText('Rename device', d.name);
      if (!name || !name.trim() || name.trim() === d.name) return;
      const r = await api('/api/devices/rename', { id: d.id, name: name.trim() });
      if (!r.error) status(`Renamed to ${name.trim()}`);
    },
  });
  items.push({
    label: 'Duplicate',
    run: async () => {
      const r = await api('/api/devices/duplicate', { id: d.id });
      if (!r.error) { status(`Duplicated ${d.name}`); sfx('devicePlacement'); }
    },
  });
  items.push({
    label: 'Delete',
    run: () => { setSelection([d.id]); selectedLink = null; ACTIONS.delete(); },
  });
  return items;
}

function selectionContextItems(count) {
  return [
    { label: 'Collapse into one node', run: () => ACTIONS['collapse-group']() },
    { label: `Delete ${count} devices`, run: () => { selectedLink = null; ACTIONS.delete(); } },
  ];
}

function linkContextItems(link) {
  return [{
    label: 'Delete cable',
    run: () => { selectedLink = { a: link.a, b: link.b }; setSelection([]); ACTIONS.delete(); },
  }];
}

function groupContextItems(group) {
  return [
    {
      label: 'Expand',
      run: async () => {
        const r = await api('/api/groups/expand', { id: group.id });
        if (!r.error) status('Group expanded');
      },
    },
    { label: 'Node card', run: () => openGroupCard(group) },
  ];
}

function canvasContextItems() {
  return [
    { label: 'Paste', disabled: !clipboard, run: () => ACTIONS.paste() },
    { label: 'Zoom to fit', run: () => ACTIONS['zoom-fit']() },
    {
      label: 'Select all',
      run: () => {
        const ids = (data && data.devices ? data.devices : []).map((d) => d.id);
        setSelection(ids);
        renderTopology();
        status(ids.length ? `${ids.length} device${ids.length === 1 ? '' : 's'} selected` : 'Nothing to select');
      },
    },
  ];
}

/* What the right-clicked thing offers. A device inside a multi-selection
   speaks for the whole selection. */
function contextMenuFor(hit) {
  if (hit.device) {
    if (selection.has(hit.device.id) && selectionCount() >= 2) return selectionContextItems(selectionCount());
    return deviceContextItems(hit.device);
  }
  if (hit.group) return groupContextItems(hit.group);
  if (hit.link) return linkContextItems(hit.link);
  return canvasContextItems();
}

let ctxMenuEl = null;
let ctxSubEl = null;
let ctxMenuAt = null;

function closeContextSubmenu() {
  if (ctxSubEl) { ctxSubEl.remove(); ctxSubEl = null; }
}

function closeContextMenu() {
  closeContextSubmenu();
  if (ctxMenuEl) { ctxMenuEl.remove(); ctxMenuEl = null; }
}

function contextMenuItemButton(item) {
  const b = document.createElement('button');
  b.type = 'button';
  b.className = 'ctx-item' + (item.children ? ' has-sub' : '');
  b.setAttribute('role', 'menuitem');
  b.textContent = item.label;
  if (item.disabled) b.disabled = true;
  if (item.children) {
    b.setAttribute('aria-haspopup', 'menu');
    b.addEventListener('mouseenter', () => openContextSubmenu(b, item.children));
    b.onclick = (e) => { e.stopPropagation(); openContextSubmenu(b, item.children); };
  } else {
    b.addEventListener('mouseenter', () => { if (ctxMenuEl && b.parentElement === ctxMenuEl) closeContextSubmenu(); });
    b.onclick = (e) => { e.stopPropagation(); closeContextMenu(); item.run(); };
  }
  return b;
}

function contextMenuBox(items, cls) {
  const box = document.createElement('div');
  box.className = cls;
  box.setAttribute('role', 'menu');
  for (const item of items) box.appendChild(contextMenuItemButton(item));
  document.body.appendChild(box);
  return box;
}

function openContextSubmenu(anchor, children) {
  closeContextSubmenu();
  ctxSubEl = contextMenuBox(children, 'ctx-menu ctx-sub');
  const r = anchor.getBoundingClientRect();
  const spot = placeSubmenu(
    { x: r.left, y: r.top, w: r.width, h: r.height },
    { w: ctxSubEl.offsetWidth, h: ctxSubEl.offsetHeight },
    { w: window.innerWidth, h: window.innerHeight },
  );
  ctxSubEl.style.left = `${spot.x}px`;
  ctxSubEl.style.top = `${spot.y}px`;
}

function showContextMenu(hit, ev) {
  closeContextMenu();
  const items = contextMenuFor(hit);
  if (!items.length) return;
  ctxMenuEl = contextMenuBox(items, 'ctx-menu');
  const spot = placeMenu(
    { x: ev.clientX, y: ev.clientY },
    { w: ctxMenuEl.offsetWidth, h: ctxMenuEl.offsetHeight },
    { w: window.innerWidth, h: window.innerHeight },
  );
  ctxMenuEl.style.left = `${spot.x}px`;
  ctxMenuEl.style.top = `${spot.y}px`;
  ctxMenuAt = { x: spot.x, y: spot.y };
  const first = ctxMenuEl.querySelector('button:not(:disabled)');
  if (first) first.focus();
}

function contextMenuKeydown(e) {
  if (!ctxMenuEl) return;
  const scope = ctxSubEl && ctxSubEl.contains(document.activeElement) ? ctxSubEl : ctxMenuEl;
  const buttons = [...scope.querySelectorAll('button:not(:disabled)')];
  const at = buttons.indexOf(document.activeElement);
  if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
    e.preventDefault();
    const dir = e.key === 'ArrowDown' ? 1 : -1;
    const next = buttons[(at < 0 ? (dir === 1 ? -1 : 0) : at) + dir] || buttons[dir === 1 ? 0 : buttons.length - 1];
    if (next) next.focus();
  } else if (e.key === 'ArrowRight') {
    const b = document.activeElement;
    if (b && b.classList && b.classList.contains('has-sub')) {
      e.preventDefault();
      b.onclick(e);
      const sub = ctxSubEl && ctxSubEl.querySelector('button:not(:disabled)');
      if (sub) sub.focus();
    }
  } else if (e.key === 'ArrowLeft') {
    if (!ctxSubEl) return;
    e.preventDefault();
    const back = ctxMenuEl.querySelector('.has-sub');
    closeContextSubmenu();
    if (back) back.focus();
  } else if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    const b = document.activeElement;
    if (b && buttons.includes(b)) b.onclick(e);
  } else if (e.key === 'Escape') {
    e.preventDefault();
    closeContextMenu();
  }
}

function wireContextMenu() {
  document.addEventListener('keydown', contextMenuKeydown, true);
  document.addEventListener('pointerdown', (e) => {
    if (!ctxMenuEl) return;
    const inside = ctxMenuEl.contains(e.target) || (ctxSubEl && ctxSubEl.contains(e.target));
    if (!inside) closeContextMenu();
  }, true);
  window.addEventListener('blur', closeContextMenu);
}
