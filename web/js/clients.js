/* ---------------- VPN client ---------------- */
function openVpn(d) {
  const $ = (id) => document.getElementById(id);
  const win = $('vpn-dialog');
  const statusLine = $('vpn-status');
  const note = $('vpn-note');
  let last = { server: '', user: '' };

  $('vpn-title').textContent = `VPN — ${d.name}`;
  $('vpn-server').value = '';
  $('vpn-user').value = '';
  note.textContent = '';
  win.hidden = false;
  bringToFront(win);
  $('vpn-close').onclick = () => { win.hidden = true; };
  win.onclick = (e) => { if (e.target === win) win.hidden = true; };

  const refresh = async () => {
    let r;
    try { r = await jsonRequest('/api/vpn/status', { id: d.id }); }
    catch { r = { error: 'request failed' }; }
    if (r.error) { statusLine.textContent = 'Status unavailable'; return; }
    if (r.connected) {
      last = { server: r.server || '', user: r.user || '' };
      statusLine.textContent = `Connected to ${last.server} as ${last.user}`;
      statusLine.classList.add('ok');
      if (!$('vpn-server').value) $('vpn-server').value = last.server;
      if (!$('vpn-user').value) $('vpn-user').value = last.user;
    } else {
      statusLine.textContent = 'Not connected';
      statusLine.classList.remove('ok');
    }
  };

  $('vpn-connect').onclick = async () => {
    const server = $('vpn-server').value.trim();
    const user = $('vpn-user').value.trim();
    if (!server || !user) {
      note.textContent = 'Server and user name are required';
      return;
    }
    note.textContent = `Connecting to ${server}…`;
    const r = await api('/api/vpn/config', { id: d.id, server, user });
    if (r.error) { note.textContent = r.error; return; }
    last = { server, user };
    note.textContent = '';
    await refresh();
  };

  $('vpn-disconnect').onclick = () => {
    /* No delete endpoint exists: clear the form, keep the last configuration
       in the status line, and mark the client disconnected. */
    $('vpn-server').value = '';
    $('vpn-user').value = '';
    statusLine.textContent = last.server
      ? `Disconnected — last configuration ${last.server} / ${last.user}`
      : 'Disconnected';
    statusLine.classList.remove('ok');
    note.textContent = 'No delete endpoint: the workspace keeps the last VPN configuration.';
  };

  refresh();
}

/* ---------------- PPPoE dialer ---------------- */
function openPppoe(d) {
  const $ = (id) => document.getElementById(id);
  const win = $('pppoe-dialog');
  const statusLine = $('pppoe-status');
  const note = $('pppoe-note');

  $('pppoe-title').textContent = `PPPoE Dialer — ${d.name}`;
  $('pppoe-server').value = '';
  $('pppoe-user').value = '';
  note.textContent = '';
  win.hidden = false;
  bringToFront(win);
  $('pppoe-close').onclick = () => { win.hidden = true; };
  win.onclick = (e) => { if (e.target === win) win.hidden = true; };

  const refresh = async () => {
    let r;
    try { r = await jsonRequest('/api/pppoe/status', { id: d.id }); }
    catch { r = { error: 'request failed' }; }
    if (r.error) { statusLine.textContent = 'Status unavailable'; return; }
    if (r.connected) {
      statusLine.textContent = `Connected to ${r.server} as ${r.user}`;
      statusLine.classList.add('ok');
      if (!$('pppoe-server').value) $('pppoe-server').value = r.server || '';
      if (!$('pppoe-user').value) $('pppoe-user').value = r.user || '';
    } else {
      statusLine.textContent = 'Not connected';
      statusLine.classList.remove('ok');
    }
  };

  $('pppoe-dial').onclick = async () => {
    const server = $('pppoe-server').value.trim();
    const user = $('pppoe-user').value.trim();
    if (!server || !user) {
      note.textContent = 'Server and user name are required';
      return;
    }
    note.textContent = `Dialing ${server}…`;
    const r = await api('/api/pppoe/config', { id: d.id, server, user });
    if (r.error) { note.textContent = r.error; return; }
    note.textContent = '';
    await refresh();
  };

  refresh();
}

/* ---------------- IP Phone ---------------- */
function openPhone(d) {
  const $ = (id) => document.getElementById(id);
  const win = $('phone-dialog');
  const state = $('phone-status');
  const note = $('phone-note');

  $('phone-title').textContent = `IP Phone — ${d.name}`;
  $('phone-label').textContent = d.name;
  $('phone-cm').value = '';
  $('phone-ext').value = '';
  note.textContent = '';
  win.hidden = false;
  bringToFront(win);
  $('phone-close').onclick = () => { win.hidden = true; };
  win.onclick = (e) => { if (e.target === win) win.hidden = true; };

  const refresh = async () => {
    let r;
    try { r = await jsonRequest('/api/phone/status', { id: d.id }); }
    catch { r = { error: 'request failed' }; }
    if (r.error) { state.textContent = 'Status unavailable'; return; }
    if (r.registered) {
      state.textContent = `Registered · CM ${r.cm} · extension ${r.extension}`;
      state.classList.add('ok');
      if (!$('phone-cm').value) $('phone-cm').value = r.cm || '';
      if (!$('phone-ext').value && r.extension) $('phone-ext').value = String(r.extension);
    } else {
      state.textContent = 'Not registered';
      state.classList.remove('ok');
    }
  };

  $('phone-register').onclick = async () => {
    const cm = $('phone-cm').value.trim();
    const ext = Number($('phone-ext').value);
    if (!cm) { note.textContent = 'Call Manager address is required'; return; }
    if (!Number.isInteger(ext) || ext < 1 || ext > 65535) {
      note.textContent = 'Extension must be 1–65535';
      return;
    }
    note.textContent = `Registering with ${cm}…`;
    const r = await api('/api/phone/register', { id: d.id, cm, ext });
    if (r.error) { note.textContent = r.error; return; }
    note.textContent = '';
    await refresh();
  };

  refresh();
}

/* ---------------- firewall (read-only ACL view) ---------------- */
/* NAT rules have no HTTP surface yet, so the window shows the device's ACLs
   from `show access-lists`. `en` first: the show command lives in privileged
   mode, and a fresh /api/cli session starts in user mode. */
function openFirewall(d) {
  const $ = (id) => document.getElementById(id);
  const win = $('firewall-dialog');
  const out = $('firewall-out');
  const note = $('firewall-note');

  $('firewall-title').textContent = `Firewalls — ${d.name}`;
  note.textContent = 'Read-only. ACLs are read from show access-lists over the device console; NAT rules are not available over HTTP.';
  out.textContent = 'Reading access lists…';
  win.hidden = false;
  bringToFront(win);
  $('firewall-close').onclick = () => { win.hidden = true; };
  win.onclick = (e) => { if (e.target === win) win.hidden = true; };

  (async () => {
    try {
      const en = await cliRequest('/api/cli', { id: d.id, line: 'en' });
      if (en.error) throw new Error(en.error);
      const r = await cliRequest('/api/cli', { id: d.id, line: 'show access-lists' });
      if (r.error) throw new Error(r.error);
      out.textContent = r.output ? r.output : '(no access-list output)';
    } catch {
      out.textContent = 'Serial console not available';
    }
  })();
}
