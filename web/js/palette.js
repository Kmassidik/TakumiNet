/* ---------------- palette ---------------- */
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

  for (const p of data.palette) {
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
