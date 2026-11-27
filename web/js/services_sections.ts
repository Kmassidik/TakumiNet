/* ---------------- services tab sections ---------------- */
/* FTP repository on a server: the file list is served by /api/ftp/list, while
   adds/removes go through the workspace endpoint (empty content removes). */
function ftpSection(d) {
  const box = document.createElement('fieldset');
  box.className = 'ip-group';
  const legend = document.createElement('legend');
  legend.textContent = 'FTP Files';
  box.appendChild(legend);

  const list = document.createElement('div');
  list.className = 'dns-list';
  box.appendChild(list);
  const note = document.createElement('div');
  note.className = 'meta';
  box.appendChild(note);

  const load = async () => {
    note.textContent = 'Loading…';
    let r;
    try {
      r = await jsonRequest('/api/ftp/list', { id: d.id });
    } catch {
      r = { error: 'request failed' };
    }
    list.replaceChildren();
    if (r.error) {
      note.textContent = r.error;
      return;
    }
    const files = r.files || [];
    for (const name of files) {
      const row = document.createElement('div');
      row.className = 'dns-row';
      const label = document.createElement('span');
      label.textContent = name;
      const del = document.createElement('button');
      del.className = 'btn';
      del.textContent = 'Remove';
      del.onclick = async () => {
        const res = await api('/api/devices/ftp', { id: d.id, name, content: '' });
        if (res.error) {
          note.textContent = res.error;
          return;
        }
        await load();
      };
      row.appendChild(label);
      row.appendChild(del);
      list.appendChild(row);
    }
    if (!files.length) {
      const empty = document.createElement('div');
      empty.className = 'meta';
      empty.textContent = 'No files';
      list.appendChild(empty);
    }
    note.textContent = files.length
      ? `${files.length} file${files.length === 1 ? '' : 's'}`
      : 'No files';
  };

  const form = document.createElement('div');
  form.className = 'tftp-form';
  const nameInput = document.createElement('input');
  nameInput.placeholder = 'notes.txt';
  nameInput.spellcheck = false;
  const contentInput = document.createElement('textarea');
  contentInput.className = 'http-page';
  contentInput.rows = 3;
  contentInput.spellcheck = false;
  contentInput.placeholder = 'File contents';
  const add = document.createElement('button');
  add.className = 'btn';
  add.textContent = 'Add File';
  add.onclick = async () => {
    const name = nameInput.value.trim();
    if (!name) {
      note.textContent = 'File name is required';
      return;
    }
    if (!contentInput.value) {
      note.textContent = 'File contents are required (empty content removes a file)';
      return;
    }
    const r = await api('/api/devices/ftp', {
      id: d.id,
      name,
      content: contentInput.value,
    });
    if (r.error) {
      note.textContent = r.error;
      return;
    }
    nameInput.value = '';
    contentInput.value = '';
    await load();
  };
  form.appendChild(nameInput);
  form.appendChild(contentInput);
  form.appendChild(add);
  box.appendChild(form);
  load();
  return box;
}

/* AAA user database on a server: names are listed, passwords never are. */
function aaaSection(d) {
  const box = document.createElement('fieldset');
  box.className = 'ip-group';
  const legend = document.createElement('legend');
  legend.textContent = 'AAA Users';
  box.appendChild(legend);

  const list = document.createElement('div');
  list.className = 'dns-list';
  box.appendChild(list);
  const note = document.createElement('div');
  note.className = 'meta';
  box.appendChild(note);

  const load = async () => {
    note.textContent = 'Loading…';
    let r;
    try {
      r = await jsonRequest('/api/aaa/list', { id: d.id });
    } catch {
      r = { error: 'request failed' };
    }
    list.replaceChildren();
    if (r.error) {
      note.textContent = r.error;
      return;
    }
    const users = r.users || [];
    for (const user of users) {
      const row = document.createElement('div');
      row.className = 'dns-row';
      const label = document.createElement('span');
      label.textContent = user;
      row.appendChild(label);
      list.appendChild(row);
    }
    if (!users.length) {
      const empty = document.createElement('div');
      empty.className = 'meta';
      empty.textContent = 'No users';
      list.appendChild(empty);
    }
    note.textContent = users.length
      ? `${users.length} user${users.length === 1 ? '' : 's'}`
      : 'No users';
  };

  const add = document.createElement('div');
  add.className = 'dns-row';
  const userInput = document.createElement('input');
  userInput.placeholder = 'alice';
  userInput.spellcheck = false;
  const passInput = document.createElement('input');
  passInput.type = 'password';
  passInput.placeholder = 'password';
  passInput.autocomplete = 'off';
  const addBtn = document.createElement('button');
  addBtn.className = 'btn';
  addBtn.textContent = 'Add User';
  const refreshBtn = document.createElement('button');
  refreshBtn.className = 'btn';
  refreshBtn.textContent = 'Refresh';
  refreshBtn.onclick = () => load();
  addBtn.onclick = async () => {
    const user = userInput.value.trim();
    const pass = passInput.value;
    if (!user || !pass) {
      note.textContent = 'User and password are required';
      return;
    }
    const r = await api('/api/devices/aaa', { id: d.id, user, pass });
    if (r.error) {
      note.textContent = r.error;
      return;
    }
    userInput.value = '';
    passInput.value = '';
    await load();
  };
  add.appendChild(userInput);
  add.appendChild(passInput);
  add.appendChild(addBtn);
  add.appendChild(refreshBtn);
  box.appendChild(add);
  load();
  return box;
}

/* Syslog collection switch plus the entries the server has recorded. */
function syslogSection(d) {
  const box = document.createElement('fieldset');
  box.className = 'ip-group';
  const legend = document.createElement('legend');
  legend.textContent = 'Syslog';
  box.appendChild(legend);

  const head = document.createElement('div');
  head.className = 'syslog-head';
  const label = document.createElement('label');
  label.className = 'sys-check';
  const check = document.createElement('input');
  check.type = 'checkbox';
  check.checked = syslogOn.has(d.id) || d.syslogOn === true;
  const text = document.createElement('span');
  text.textContent = 'Enable collection';
  label.appendChild(check);
  label.appendChild(text);
  const refreshBtn = document.createElement('button');
  refreshBtn.className = 'btn';
  refreshBtn.textContent = 'Refresh';
  head.appendChild(label);
  head.appendChild(refreshBtn);
  box.appendChild(head);

  const list = document.createElement('div');
  list.className = 'syslog-list';
  box.appendChild(list);
  const note = document.createElement('div');
  note.className = 'meta';
  box.appendChild(note);

  const load = async () => {
    note.textContent = 'Loading…';
    let r;
    try {
      r = await jsonRequest('/api/syslog/list', { id: d.id });
    } catch {
      r = { error: 'request failed' };
    }
    list.replaceChildren();
    if (r.error) {
      note.textContent = r.error;
      return;
    }
    const entries = r.entries || [];
    for (const e of entries) {
      const row = document.createElement('div');
      row.className = 'syslog-row';
      const time = document.createElement('span');
      time.className = 'syslog-time';
      time.textContent = `${(Number(e.time) || 0).toFixed(1)}s`;
      const sevText = String(e.severity || 'info').toLowerCase();
      const sev = document.createElement('span');
      sev.className = `syslog-sev sev-${sevText.replace(/[^a-z]/g, '') || 'info'}`;
      sev.textContent = sevText;
      const msg = document.createElement('span');
      msg.className = 'syslog-text';
      msg.textContent = e.text || '';
      row.appendChild(time);
      row.appendChild(sev);
      row.appendChild(msg);
      list.appendChild(row);
    }
    if (!entries.length) {
      const empty = document.createElement('div');
      empty.className = 'meta';
      empty.textContent = check.checked ? 'No entries yet' : 'Collection is off';
      list.appendChild(empty);
    }
    /* Recorded entries can only exist while collection is on. */
    if (entries.length && !check.checked) {
      syslogOn.add(d.id);
      check.checked = true;
    }
    note.textContent = `${entries.length} entr${entries.length === 1 ? 'y' : 'ies'}`;
  };

  check.onchange = async () => {
    const on = check.checked;
    const r = await api('/api/devices/syslog', { id: d.id, on: on ? '1' : '0' });
    if (r.error) {
      check.checked = !on;
      note.textContent = r.error;
      return;
    }
    if (on) syslogOn.add(d.id);
    else syslogOn.delete(d.id);
    await load();
  };
  refreshBtn.onclick = () => load();
  load();
  return box;
}

/* NTP client: point this device at an address and report the sync state. */
function ntpSection(d) {
  const box = document.createElement('fieldset');
  box.className = 'ip-group';
  const legend = document.createElement('legend');
  legend.textContent = 'NTP';
  box.appendChild(legend);

  const row = document.createElement('div');
  row.className = 'dns-row';
  const input = document.createElement('input');
  input.placeholder = '192.168.2.20';
  input.spellcheck = false;
  const syncBtn = document.createElement('button');
  syncBtn.className = 'btn';
  syncBtn.textContent = 'Sync';
  row.appendChild(input);
  row.appendChild(syncBtn);
  box.appendChild(row);
  const note = document.createElement('div');
  note.className = 'meta';
  note.textContent = 'Checking…';
  box.appendChild(note);

  const load = async () => {
    let r;
    try {
      r = await jsonRequest('/api/ntp/status', { id: d.id });
    } catch {
      r = { error: 'request failed' };
    }
    if (r.error) {
      note.textContent = r.error;
      note.classList.remove('ok');
      return;
    }
    if (r.synced) {
      const ms = Number(r.offsetMs) || 0;
      note.textContent = `Synced to ${r.server} (offset ${ms} ms)`;
      note.classList.add('ok');
      if (r.server) input.value = r.server;
    } else {
      note.textContent = 'Not synchronised';
      note.classList.remove('ok');
    }
  };

  syncBtn.onclick = async () => {
    const server = input.value.trim();
    if (!server) {
      note.textContent = 'Server address is required';
      return;
    }
    const r = await api('/api/devices/ntp', { id: d.id, server });
    if (r.error) {
      note.textContent = r.error;
      return;
    }
    await load();
  };
  load();
  return box;
}
