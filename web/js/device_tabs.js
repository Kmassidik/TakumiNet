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

  if (name === 'services') return tabServices(pane, d);

  const msg = document.createElement('div');
  msg.className = 'dw-muted';
  msg.textContent = name === 'programming'
    ? 'Programming is not available for this device model.'
    : 'No attributes to configure for this device model.';
  pane.appendChild(msg);
}


function tabDesktop(pane, d) {
  const desk = document.createElement('div');
  desk.className = 'dw-desktop';
  for (const [icon, label, action] of DESKTOP_APPS) {
    const app = document.createElement('button');
    app.className = 'dw-app';
    app.title = label;
    const img = document.createElement('img');
    img.src = asset('art/Workstation/' + icon);
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
      else if (action === 'editor') openEditor(d);
      else if (action === 'traffic') openTraffic(d);
      else if (action === 'mib') openMib(d);
      else if (action === 'email') openMail(d);
      else if (action === 'wifi') openWifi(d);
      else if (action === 'vpn') openVpn(d);
      else if (action === 'pppoe') openPppoe(d);
      else if (action === 'phone') openPhone(d);
      else if (action === 'firewall') openFirewall(d);
      else status(`${label} — not implemented yet`);
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
  const phys = off
    ? (d.kind === 'server' ? 'PowerOffISRG2.png'
      : d.kind === 'laptop' ? 'PowerOffLaptop.png' : 'PowerOffPC.png')
    : (d.kind === 'server' ? 'PowerOnServer.png' : 'PowerOnPC.png');
  img.src = asset('art/PhysicalView/Devices/' + phys);
  img.alt = d.name;
  img.onerror = () => { img.src = asset(d.icon); };

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
