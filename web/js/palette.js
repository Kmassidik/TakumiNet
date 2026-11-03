/* ---------------- palette ---------------- */
/* First catalogue entry per case-folded label; the shipped templates repeat a
   model once per OS image, and the palette shows a model once. */
function catalogByLabel() {
  const by = new Map();
  for (const m of catalog) {
    const key = String(m.label || '').toLowerCase();
    if (key && !by.has(key)) by.set(key, m);
  }
  return by;
}

/* Templates the palette has no tile for: shown muted so the shipped catalogue
   is visible, but instantiating one is not wired up yet. */
function renderTemplateTiles(pal) {
  const used = new Set(data.palette.map((p) => String(p.label || '').toLowerCase()));
  const pending = catalog.filter((m) => m.label && !used.has(m.label.toLowerCase()));
  if (!pending.length) return;

  const section = document.createElement('div');
  section.className = 'tpl-section';
  section.id = 'palette-templates';
  const heading = document.createElement('span');
  heading.className = 'tpl-heading';
  heading.textContent = 'Templates';
  section.appendChild(heading);

  const groups = new Map();
  for (const m of pending) {
    const key = m.group || 'Other';
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(m);
  }

  /* Most of the shipped catalogue is IoT widgets (kind `thing`); keep the
     twelve slots for the groups that can become real devices, in the order the
     catalogue lists them. */
  const deviceGroup = (models) => (models.some((m) => m.kind && m.kind !== 'thing') ? 0 : 1);
  const ordered = [...groups].sort((a, b) => deviceGroup(a[1]) - deviceGroup(b[1]));

  for (const [name, models] of ordered.slice(0, 12)) {
    const group = document.createElement('div');
    group.className = 'tpl-group';
    const label = document.createElement('span');
    label.className = 'tpl-group-label';
    label.textContent = name;
    group.appendChild(label);
    const row = document.createElement('div');
    row.className = 'tpl-tiles';
    for (const m of models) row.appendChild(templateTile(m));
    group.appendChild(row);
    section.appendChild(group);
  }
  pal.appendChild(section);
}

function templateTile(m) {
  const tile = document.createElement('button');
  tile.type = 'button';
  tile.className = 'tpl-tile';
  tile.disabled = true;
  tile.title = m.description
    ? `${m.description} — template present, not yet instantiable`
    : 'template present, not yet instantiable';
  tile.dataset.label = m.label;
  tile.dataset.group = m.group || '';
  tile.textContent = m.name || m.label;
  return tile;
}

function renderPalette() {
  const groups = document.getElementById('groups');
  groups.replaceChildren();
  data.groups.forEach((g, i) => {
    const b = document.createElement('button');
    b.title = g.label;
    if (i === 0) b.classList.add('active');
    const img = document.createElement('img');
    img.src = g.icon;
    img.alt = g.label;
    b.appendChild(img);
    b.onclick = () => {
      groups.querySelectorAll('button').forEach((x) => x.classList.remove('active'));
      b.classList.add('active');
      status(g.label);
    };
    groups.appendChild(b);
  });

  const pal = document.getElementById('palette');
  pal.replaceChildren();

  for (const [kind, label, icon, tip] of CABLE_TYPES) {
    const cable = document.createElement('button');
    const active = cableMode && cableKind === kind;
    cable.className = 'dev-tile cable-tool' + (active ? ' active' : '');
    cable.title = tip + ' — click two devices';
    cable.dataset.kind = kind;
    const cimg = document.createElement('img');
    cimg.src = icon3d(`cables/${icon}`);
    const clabel = document.createElement('span');
    clabel.textContent = label;
    cable.appendChild(cimg);
    cable.appendChild(clabel);
    cable.onclick = () => {
      cableMode = !(cableMode && cableKind === kind);
      cableKind = kind;
      pduMode = false;
      cableFrom = null;
      document.querySelector('.canvas-wrap').classList.toggle('cable-mode', cableMode);
      status(cableMode ? `${tip}: click two devices` : 'Selection mode');
      renderPalette();
      renderTopology();
    };
    pal.appendChild(cable);
  }

  const bus = document.createElement('button');
  bus.className = 'dev-tile';
  bus.title = 'Build a bus segment: hub + N computers with addresses';
  bus.id = 'bus-tool';
  const bimg = document.createElement('img');
  bimg.src = icon3d('cables/coax');
  bimg.alt = 'Bus';
  const blabel = document.createElement('span');
  blabel.textContent = 'Bus';
  bus.appendChild(bimg);
  bus.appendChild(blabel);
  bus.onclick = () => ACTIONS['build-bus']();
  pal.appendChild(bus);

  const meshTool = document.createElement('button');
  meshTool.id = 'mesh-tool';
  meshTool.className = 'dev-tile mesh-tool';
  meshTool.title = 'Create Full Mesh — link every device';
  const mimg = document.createElement('img');
  mimg.src = icon3d('devices/multiuser');
  const mlabel = document.createElement('span');
  mlabel.textContent = 'Mesh';
  meshTool.appendChild(mimg);
  meshTool.appendChild(mlabel);
  meshTool.onclick = () => ACTIONS.mesh(true);
  pal.appendChild(meshTool);

  const cat = catalogByLabel();

  for (const p of data.palette) {
    const tile = document.createElement('button');
    tile.className = 'dev-tile';
    tile.title = `Drag ${p.label} onto the canvas`;
    const model = cat.get(p.label.toLowerCase());
    if (model && model.description) tile.title += ` — ${model.description}`;
    tile.draggable = true;
    const img = document.createElement('img');
    img.src = p.icon;
    img.alt = p.label;
    img.draggable = false;
    const span = document.createElement('span');
    span.textContent = p.label;
    tile.appendChild(img);
    tile.appendChild(span);
    tile.addEventListener('dragstart', (e) => {
      e.dataTransfer.setData('text/plain', p.label);
      e.dataTransfer.effectAllowed = 'copy';
      tile.classList.add('dragging');
    });
    tile.addEventListener('dragend', () => tile.classList.remove('dragging'));
    pal.appendChild(tile);
  }

  renderTemplateTiles(pal);
}
