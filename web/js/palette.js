/* ---------------- palette ---------------- */
let paletteGroup = null;

/* Leaves cable mode: no pending first device, no crosshair. */
function leaveCableMode() {
  cableMode = false;
  cableFrom = null;
  document.querySelector('.canvas-wrap').classList.remove('cable-mode', 'crosshair');
}

function renderPalette() {
  const groups = document.getElementById('groups');
  groups.replaceChildren();
  const labels = data.paletteGroups.map((g) => g.label);
  paletteGroup = paletteStartGroup(paletteGroup, labels);
  data.paletteGroups.forEach((g) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'group-tab' + (g.label === paletteGroup ? ' active' : '');
    b.title = g.label;
    b.setAttribute('aria-pressed', String(g.label === paletteGroup));
    const img = document.createElement('img');
    img.src = g.icon;
    img.alt = '';
    b.appendChild(img);
    const text = document.createElement('span');
    text.textContent = g.label;
    b.appendChild(text);
    b.onclick = () => {
      paletteGroup = g.label;
      if (cableMode && !paletteKeepsCableMode(g.label)) leaveCableMode();
      status(g.label);
      renderPalette();
    };
    groups.appendChild(b);
  });

  const pal = document.getElementById('palette');
  pal.replaceChildren();

  const showConnections = paletteGroup === PALETTE_CONNECTIONS;
  for (const [kind, label, icon, tip] of showConnections ? CABLE_TYPES : []) {
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
  bus.hidden = !showConnections;
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
  if (showConnections) pal.appendChild(bus);

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
  if (showConnections) pal.appendChild(meshTool);

  const tiles = paletteTiles(paletteGroup, data.palette);
  if (!tiles.length && !showConnections) {
    const empty = document.createElement('p');
    empty.className = 'palette-empty';
    empty.textContent = 'Nothing in this category yet.';
    pal.appendChild(empty);
  }
  for (const p of tiles) {
    const tile = document.createElement('button');
    tile.className = 'dev-tile';
    tile.title = `Drag ${p.label} onto the canvas`;
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

}
