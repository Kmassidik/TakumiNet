/* ---------------- topology ---------------- */
function renderTopology() {
  const s = svg();
  s.setAttribute('viewBox', `${vb.x} ${vb.y} ${vb.w} ${vb.h}`);
  s.replaceChildren();

  if (showGrid) {
    const defs = node('defs', {});
    const pat = node('pattern', { id: 'grid', width: 25, height: 25, patternUnits: 'userSpaceOnUse' });
    pat.appendChild(node('path', { d: 'M 25 0 L 0 0 0 25', fill: 'none', stroke: '#e3e8ee', 'stroke-width': 1 }));
    defs.appendChild(pat);
    s.appendChild(defs);
    s.appendChild(node('rect', { x: vb.x, y: vb.y, width: vb.w, height: vb.h, fill: 'url(#grid)' }));
  }

  const byId = new Map(data.devices.map((d) => [d.id, d]));

  if (!data.devices.length) {
    const cx = vb.x + vb.w / 2;
    const cy = vb.y + vb.h / 2;
    s.appendChild(node('image', {
      href: '/art3d/mascot/sleep.webp', x: cx - 48, y: cy - 84, width: 96, height: 96,
      class: 'empty-mascot',
    }));
    const message = node('text', { x: cx, y: cy + 36, class: 'empty-state', 'text-anchor': 'middle' });
    message.textContent = 'No devices yet — Drop a device here to begin';
    s.appendChild(message);
  }

  for (const l of data.links) {
    const a = byId.get(l.a);
    const b = byId.get(l.b);
    if (!a || !b) continue;

    const isSel = selectedLink && selectedLink.a === l.a && selectedLink.b === l.b;
    const isConsole = l.kind === 'eConsole';
    s.appendChild(node('line', {
      x1: a.x, y1: a.y, x2: b.x, y2: b.y,
      class: ['link', isSel ? 'selected' : '', isConsole ? 'console' : ''].filter(Boolean).join(' '),
    }));

    const hit = node('line', { x1: a.x, y1: a.y, x2: b.x, y2: b.y, class: 'link-hit' });
    hit.addEventListener('pointerdown', (ev) => {
      ev.stopPropagation();
      selectedLink = { a: l.a, b: l.b };
      setSelection([]);
      status(`${isConsole ? 'Console cable' : 'Link'}: ${a.name} ${l.aPort} ↔ ${b.name} ${l.bPort}`);
      renderTopology();
    });
    s.appendChild(hit);

    const dx = b.x - a.x;
    const dy = b.y - a.y;
    for (const [t, id, port, state] of [
      [0.08, l.a, l.aPort, l.aState],
      [0.92, l.b, l.bPort, l.bState],
    ]) {
      const led = node('circle', {
        cx: a.x + dx * t,
        cy: a.y + dy * t,
        r: 4,
        class: 'link-led',
        'data-state': state || 'red',
        'data-device': id,
        'data-port': port,
      });
      s.appendChild(led);
    }

    const len = Math.hypot(dx, dy) || 1;
    const nx = (-dy / len) * 11;
    const ny = (dx / len) * 11;
    for (const [t, sign, port] of [[0.46, 1, l.aPort], [0.54, -1, l.bPort]]) {
      const label = node('text', {
        x: a.x + dx * t + nx * sign,
        y: a.y + dy * t + ny * sign,
        class: 'port',
        'text-anchor': 'middle',
      });
      label.textContent = port;
      s.appendChild(label);
    }
  }

  for (const d of data.devices) {
    const g = node('g', { class: 'dev', 'data-id': d.id });
    if (selection.has(d.id)) g.classList.add('selected');
    if (d.id === cableFrom || d.id === pduFrom) g.classList.add('cable-src');
    g.appendChild(node('rect', {
      class: 'sel', x: d.x - 36, y: d.y - 34, width: 72, height: 72, rx: 6,
      fill: 'transparent', stroke: 'transparent',
    }));
    const iconImg = node('image', {
      href: d.icon, x: d.x - 27, y: d.y - 30, width: 54, height: 54,
      preserveAspectRatio: 'xMidYMid meet',
    });
    g.appendChild(iconImg);
    const name = node('text', { x: d.x, y: d.y + 40, class: 'dev-name' });
    name.textContent = d.name;
    const model = node('text', { x: d.x, y: d.y + 52, class: 'dev-model' });
    model.textContent = d.model;
    g.appendChild(name);
    g.appendChild(model);

    if (d.ip) {
      const ip = node('text', { x: d.x, y: d.y + 64, class: 'dev-ip' });
      ip.textContent = `${d.ip}/${d.prefix}`;
      g.appendChild(ip);
    }

    g.addEventListener('pointerdown', (ev) => startDrag(ev, d, g));
    g.addEventListener('mousemove', (ev) => showTip(ev, `${d.name} · ${d.model}`));
    g.addEventListener('mouseleave', hideTip);
    s.appendChild(g);
  }
}
