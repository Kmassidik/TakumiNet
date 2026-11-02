/* ---------------- MIB browser ---------------- */
/* There is no SNMP agent to query, so the browser labels itself as the local
   device table: devices come from /api/workspace and the selected row's
   interface count comes from /api/devices/ports. No OIDs are invented. */
let mibSelected = null;

function openMib(d) {
  const win = document.getElementById('mib-dialog');
  const tbody = document.querySelector('#mib-table tbody');
  const detail = document.getElementById('mib-detail');
  const devices = (data && data.devices) || [];

  document.getElementById('mib-title').textContent = `MIB Browser — ${d.name}`;
  tbody.replaceChildren();
  detail.textContent = 'Select a row to read its interface table.';
  mibSelected = null;

  const rows = new Map();
  const readPorts = async (dev) => {
    mibSelected = dev.id;
    for (const [id, tr] of rows) {
      tr.classList.toggle('selected', id === dev.id);
      if (id !== dev.id) tr.querySelector('.mib-ports').textContent = '—';
    }
    detail.textContent = `Reading /api/devices/ports for ${dev.name}…`;
    const r = await getJson(`/api/devices/ports?id=${encodeURIComponent(dev.id)}`);
    if (mibSelected !== dev.id) return;
    const ports = Array.isArray(r.ports) ? r.ports : [];
    const row = rows.get(dev.id);
    if (row) row.querySelector('.mib-ports').textContent = String(ports.length);
    if (!ports.length) {
      detail.textContent = `${dev.name} — no interfaces reported`;
      return;
    }
    const head = document.createElement('div');
    head.className = 'mib-detail-head';
    head.textContent = `${dev.name} — ${ports.length} interface${ports.length === 1 ? '' : 's'}`;
    const list = document.createElement('ul');
    list.className = 'mib-port-list';
    for (const p of ports) {
      const li = document.createElement('li');
      const addr = p.ip ? ` · ${p.ip}/${p.prefix}` : '';
      li.textContent = `${p.name} · ${p.up ? 'up' : 'down'}${addr}`;
      list.appendChild(li);
    }
    detail.replaceChildren(head, list);
  };

  for (const dev of devices) {
    const tr = document.createElement('tr');
    for (const text of [dev.name, dev.model, dev.kind, dev.ip || '—']) {
      const td = document.createElement('td');
      td.textContent = text;
      tr.appendChild(td);
    }
    const ports = document.createElement('td');
    ports.className = 'mib-ports';
    ports.textContent = '—';
    tr.appendChild(ports);
    tr.title = `Read interfaces for ${dev.name}`;
    tr.onclick = () => readPorts(dev);
    tbody.appendChild(tr);
    rows.set(dev.id, tr);
  }

  document.getElementById('mib-close').onclick = () => { win.hidden = true; };
  win.onclick = (e) => { if (e.target === win) win.hidden = true; };
  win.hidden = false;
  bringToFront(win);

  const initial = rows.has(d.id) ? d : devices[0];
  if (initial) readPorts(initial);
}
