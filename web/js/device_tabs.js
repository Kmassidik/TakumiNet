function selectTab(name) {
  document.querySelectorAll('#dw-tabs button').forEach((b) => {
    b.classList.toggle('active', b.dataset.tab === name);
  });
  const pane = document.getElementById('dw-pane');
  pane.replaceChildren();
  const d = dwDevice;
  if (!d) return;

  if (name === 'desktop') return tabDesktop(pane, d);

  if (name === 'physical') return tabPhysical(pane, d);

  if (name === 'config') return tabConfig(pane, d);

  if (name === 'wireless') return tabWireless(pane, d);

  if (name === 'cli') return tabCli(pane, d);

  if (name === 'services') return tabServices(pane, d);
}


function tabDesktop(pane, d) {
  const desk = document.createElement('div');
  desk.className = 'dw-desktop';
  for (const [icon, label, action] of DESKTOP_APPS) {
    if (action === 'wifi' && !WIFI_APP_KINDS.has(d.kind)) continue;
    if (action === 'capture' && d.kind !== 'sniffer') continue;
    const app = document.createElement('button');
    app.className = 'dw-app';
    app.title = label;
    const img = document.createElement('img');
    img.src = icon3d(icon);
    img.alt = label;
    const span = document.createElement('span');
    span.textContent = label;
    app.appendChild(img);
    app.appendChild(span);
    app.onclick = () => {
      if (action === 'ipconfig') openIpDialog(d);
      else if (action === 'cmd') openCmd(d);
      else if (action === 'term') openTerm(d);
      else if (action === 'browser') openBrowser(d);
      else if (action === 'wifi') openWifiApp(d);
      else if (action === 'editor') openEditor(d);
      else if (action === 'firewall') openFirewall(d);
      else if (action === 'capture') openCapture(d);
    };
    desk.appendChild(app);
  }
  pane.appendChild(desk);
  return;
}

function tabPhysical(pane, d) {
  const box = document.createElement('div');
  box.className = 'dw-physical';
  const off = d.powered === false;
  const img = document.createElement('img');
  img.src = d.icon;
  img.alt = d.name;
  img.classList.toggle('off', off);

  const cap = document.createElement('div');
  cap.className = 'meta';
  cap.textContent = `${d.name} · ${d.model}${off ? ' · powered off' : ''}`;

  const refresh = async () => {
    dwDevice = (data.devices || []).find((x) => x.id === d.id) || d;
    selectTab('physical');
  };

  const power = document.createElement('button');
  power.className = 'btn';
  power.textContent = off ? 'Power On' : 'Power Off';
  power.onclick = async () => {
    await api('/api/devices/power', { id: d.id, on: off ? '1' : '0' });
    await refresh();
  };

  box.appendChild(img);
  box.appendChild(cap);
  box.appendChild(power);

  /* Modules are dragged from the tray into a slot; clicking a filled slot
     removes it (the server refuses while its ports are cabled). */
  const slots = d.slots || [];
  if (slots.length) {
    const list = document.createElement('div');
    list.className = 'dw-slots';
    slots.forEach((mod, i) => {
      const row = document.createElement('div');
      row.className = 'slot' + (mod ? ' filled' : '');
      row.textContent = mod ? `Slot ${i}: ${mod} (click to remove)` : `Slot ${i}: empty`;
      row.title = mod ? 'Remove module' : 'Drop a module here';
      if (mod) {
        row.onclick = async () => {
          const r = await api('/api/devices/module', { id: d.id, slot: i, model: '' });
          if (!r.error) await refresh();
        };
      }
      row.addEventListener('dragover', (e) => { e.preventDefault(); row.classList.add('over'); });
      row.addEventListener('dragleave', () => row.classList.remove('over'));
      row.addEventListener('drop', async (e) => {
        e.preventDefault();
        row.classList.remove('over');
        const model = e.dataTransfer.getData('text/plain');
        if (!model) return;
        const r = await api('/api/devices/module', { id: d.id, slot: i, model });
        if (!r.error) await refresh();
      });
      list.appendChild(row);
    });

    const tray = document.createElement('div');
    tray.className = 'dw-tray';
    for (const model of ['HWIC-2T', 'NM-2FE2W']) {
      const card = document.createElement('div');
      card.className = 'mod';
      card.textContent = model;
      card.draggable = true;
      card.title = 'Drag into a slot';
      card.addEventListener('dragstart', (e) => e.dataTransfer.setData('text/plain', model));
      tray.appendChild(card);
    }
    box.appendChild(list);
    box.appendChild(tray);
  }

  pane.appendChild(box);
  return;
}

/* One row per interface: state dot, name, address, far end and a toggle.
   The rows come from /api/devices/ports; the panel renderer is shared with
   the per-kind windows through the ui.js bundle. */
function portsFieldset(box, d) {
  const wrap = document.createElement('fieldset');
  wrap.className = 'ip-group dw-ports';
  const legend = document.createElement('legend');
  legend.textContent = 'Ports';
  wrap.appendChild(legend);
  const holder = document.createElement('div');
  wrap.appendChild(holder);
  box.appendChild(wrap);
  const post = async (path) => {
    const [p, q] = path.split('?');
    return api(p, Object.fromEntries(new URLSearchParams(q)));
  };
  const fill = async () => {
    const res = await getJson(`/api/devices/ports?id=${encodeURIComponent(d.id)}`);
    holder.replaceChildren();
    if (!res || res.error || !Array.isArray(res.ports) || !res.ports.length) {
      const empty = document.createElement('p');
      empty.className = 'meta';
      empty.textContent = 'This device has no ports.';
      holder.appendChild(empty);
      return;
    }
    renderPortsPanel(holder, res.ports, { deviceId: d.id, post, refresh: fill });
  };
  fill();
}

function tabConfig(pane, d) {
  const box = document.createElement('div');
  box.className = 'dw-config';
  box.innerHTML = `
    <fieldset class="ip-group"><legend>Global Settings</legend>
      <label class="ipfield"><span>Display Name</span><input id="cfg-name" value=""></label>
      <label class="ipfield"><span>Default Gateway</span><input id="cfg-gw" value="" readonly></label>
      <label class="ipfield"><span>DNS Server</span><input id="cfg-dns" value="" readonly></label>
      <div class="ip-actions"><button class="btn" id="cfg-apply">Apply</button>
      <span id="cfg-note" class="meta"></span></div>
    </fieldset>`;
  portsFieldset(box, d);
  pane.appendChild(box);
  document.getElementById('cfg-name').value = d.name;
  document.getElementById('cfg-gw').value = d.gateway || '0.0.0.0';
  document.getElementById('cfg-dns').value = d.dns || '0.0.0.0';
  document.getElementById('cfg-apply').onclick = async () => {
    const name = document.getElementById('cfg-name').value.trim();
    if (!name) return;
    const r = await api('/api/devices/rename', { id: d.id, name });
    if (!r.error) {
      document.getElementById('cfg-note').textContent = 'Saved';
      document.getElementById('dw-name').textContent = name;
      dwDevice = data.devices.find((x) => x.id === d.id) || d;
    } else {
      document.getElementById('cfg-note').textContent = r.error;
    }
  };
  return;
}

/* The device's own console, inline: the same /api/cli the terminal window uses. */
function tabCli(pane, d) {
  const box = document.createElement('div');
  box.className = 'dw-cli';
  box.innerHTML = '<pre class="dw-cli-out"></pre><div class="dw-cli-line"><span class="dw-cli-prompt"></span><input class="dw-cli-in" aria-label="Console input"></div>';
  pane.appendChild(box);
  const out = box.querySelector('.dw-cli-out');
  const promptEl = box.querySelector('.dw-cli-prompt');
  const input = box.querySelector('.dw-cli-in');
  const show = (r) => {
    if (r.output) out.textContent += r.output;
    promptEl.textContent = r.prompt || '>';
    out.scrollTop = out.scrollHeight;
  };
  cliRequest('/api/cli', { id: d.id, line: '' }).then(show).catch(() => {
    out.textContent = 'The console did not answer. Close the window and try again.';
  });
  input.onkeydown = async (e) => {
    if (e.key !== 'Enter') return;
    const line = input.value;
    input.value = '';
    out.textContent += promptEl.textContent + line + '\n';
    try {
      show(await cliRequest('/api/cli', { id: d.id, line }));
    } catch {
      out.textContent += 'The console did not answer.\n';
    }
  };
  input.focus();
}
