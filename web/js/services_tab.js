function tabServices(pane, d) {
  const box = document.createElement('div');
  box.className = 'dw-services';
  const refresh = async () => {
    dwDevice = (data.devices || []).find((x) => x.id === d.id) || d;
    selectTab('services');
  };

  /* Routers own the DHCP relay configuration. */
  if (d.kind === 'router') {
    const relayBox = document.createElement('fieldset');
    relayBox.className = 'ip-group';
    const legend = document.createElement('legend');
    legend.textContent = 'DHCP Relay (ip helper-address)';
    relayBox.appendChild(legend);

    const list = document.createElement('div');
    list.className = 'dns-list';
    for (const h of d.helpers || []) {
      const row = document.createElement('div');
      row.className = 'dns-row';
      const label = document.createElement('span');
      label.textContent = `${h.iface} → ${h.address}`;
      const del = document.createElement('button');
      del.className = 'btn';
      del.textContent = 'Remove';
      del.onclick = async () => {
        const r = await api('/api/devices/dhcp/helper', {
          id: d.id,
          iface: h.iface,
          helper: '',
        });
        if (!r.error) await refresh();
      };
      row.appendChild(label);
      row.appendChild(del);
      list.appendChild(row);
    }
    if (!(d.helpers || []).length) {
      const empty = document.createElement('div');
      empty.className = 'meta';
      empty.textContent = 'No helper addresses';
      list.appendChild(empty);
    }
    relayBox.appendChild(list);

    const add = document.createElement('div');
    add.className = 'dns-row';
    const ifaceInput = document.createElement('input');
    ifaceInput.placeholder = 'GigabitEthernet0/0';
    ifaceInput.spellcheck = false;
    const helperInput = document.createElement('input');
    helperInput.placeholder = '192.168.2.20';
    helperInput.spellcheck = false;
    const addBtn = document.createElement('button');
    addBtn.className = 'btn';
    addBtn.textContent = 'Add';
    addBtn.onclick = async () => {
      const r = await api('/api/devices/dhcp/helper', {
        id: d.id,
        iface: ifaceInput.value.trim(),
        helper: helperInput.value.trim(),
      });
      if (!r.error) await refresh();
    };
    add.appendChild(ifaceInput);
    add.appendChild(helperInput);
    add.appendChild(addBtn);
    relayBox.appendChild(add);
    box.appendChild(relayBox);
    /* Syslog and NTP are client features every device carries. */
    box.appendChild(syslogSection(d));
    box.appendChild(ntpSection(d));
    pane.appendChild(box);
    return;
  }

  if (d.kind !== 'server') {
    box.appendChild(syslogSection(d));
    box.appendChild(ntpSection(d));
    pane.appendChild(box);
    return;
  }

  const dnsBox = document.createElement('fieldset');
  dnsBox.className = 'ip-group';
  const dnsLegend = document.createElement('legend');
  dnsLegend.textContent = 'DNS Records';
  dnsBox.appendChild(dnsLegend);
  const rows = document.createElement('div');
  rows.className = 'dns-list';
  for (const rec of d.dnsRecords || []) {
    const row = document.createElement('div');
    row.className = 'dns-row';
    const label = document.createElement('span');
    label.textContent = `${rec.name} → ${rec.address}`;
    const del = document.createElement('button');
    del.className = 'btn';
    del.textContent = 'Remove';
    del.onclick = async () => {
      const r = await api('/api/devices/dns', { id: d.id, name: rec.name, remove: '1' });
      if (!r.error) await refresh();
    };
    row.appendChild(label);
    row.appendChild(del);
    rows.appendChild(row);
  }
  if (!(d.dnsRecords || []).length) {
    const empty = document.createElement('div');
    empty.className = 'meta';
    empty.textContent = 'No records';
    rows.appendChild(empty);
  }
  dnsBox.appendChild(rows);

  const add = document.createElement('div');
  add.className = 'dns-row';
  const nameInput = document.createElement('input');
  nameInput.placeholder = 'web.lab';
  nameInput.spellcheck = false;
  const ipInput = document.createElement('input');
  ipInput.placeholder = '192.168.2.20';
  ipInput.spellcheck = false;
  const addBtn = document.createElement('button');
  addBtn.className = 'btn';
  addBtn.textContent = 'Add';
  addBtn.onclick = async () => {
    const r = await api('/api/devices/dns', {
      id: d.id,
      name: nameInput.value.trim(),
      ip: ipInput.value.trim(),
    });
    if (!r.error) await refresh();
  };
  add.appendChild(nameInput);
  add.appendChild(ipInput);
  add.appendChild(addBtn);
  dnsBox.appendChild(add);

  const httpBox = document.createElement('fieldset');
  httpBox.className = 'ip-group';
  const httpLegend = document.createElement('legend');
  httpLegend.textContent = 'HTTP Page';
  httpBox.appendChild(httpLegend);
  const area = document.createElement('textarea');
  area.className = 'http-page';
  area.rows = 5;
  area.value = d.httpPage || '';
  area.placeholder = 'Leave empty for the default welcome page';
  const save = document.createElement('button');
  save.className = 'btn';
  save.textContent = 'Save Page';
  save.onclick = async () => {
    const r = await api('/api/devices/http', { id: d.id, body: area.value });
    if (!r.error) {
      const note = document.createElement('span');
      note.className = 'meta';
      note.textContent = ' Saved';
      httpBox.appendChild(note);
    }
  };
  httpBox.appendChild(area);
  httpBox.appendChild(save);

  /* Static leases: a client always receives the address pinned here. */
  const resBox = document.createElement('fieldset');
  resBox.className = 'ip-group';
  const resLegend = document.createElement('legend');
  resLegend.textContent = 'DHCP Reservations';
  resBox.appendChild(resLegend);
  const resList = document.createElement('div');
  resList.className = 'dns-list';
  const nameOf = (id) => (data.devices.find((x) => x.id === id) || {}).name || id;
  for (const r of d.reservations || []) {
    const row = document.createElement('div');
    row.className = 'dns-row';
    const label = document.createElement('span');
    label.textContent = `${nameOf(r.client)} → ${r.address}`;
    const del = document.createElement('button');
    del.className = 'btn';
    del.textContent = 'Remove';
    del.onclick = async () => {
      const res = await api('/api/devices/dhcp/reserve', {
        id: d.id,
        client: r.client,
        ip: '',
      });
      if (!res.error) await refresh();
    };
    row.appendChild(label);
    row.appendChild(del);
    resList.appendChild(row);
  }
  if (!(d.reservations || []).length) {
    const empty = document.createElement('div');
    empty.className = 'meta';
    empty.textContent = 'No reservations';
    resList.appendChild(empty);
  }
  resBox.appendChild(resList);

  const resAdd = document.createElement('div');
  resAdd.className = 'dns-row';
  const clientSel = document.createElement('select');
  for (const dev of data.devices.filter(
    (x) => x.id !== d.id && x.kind !== 'switch' && x.kind !== 'hub' && x.kind !== 'router',
  )) {
    const opt = document.createElement('option');
    opt.value = dev.id;
    opt.textContent = dev.name;
    clientSel.appendChild(opt);
  }
  const resIp = document.createElement('input');
  resIp.placeholder = '192.168.2.150';
  resIp.spellcheck = false;
  const resBtn = document.createElement('button');
  resBtn.className = 'btn';
  resBtn.textContent = 'Reserve';
  resBtn.onclick = async () => {
    const res = await api('/api/devices/dhcp/reserve', {
      id: d.id,
      client: clientSel.value,
      ip: resIp.value.trim(),
    });
    if (!res.error) await refresh();
  };
  resAdd.appendChild(clientSel);
  resAdd.appendChild(resIp);
  resAdd.appendChild(resBtn);
  resBox.appendChild(resAdd);

  /* Mailbox accounts live on the server; the workspace JSON never lists
     them, so this section only adds users. */
  const mailBox = document.createElement('fieldset');
  mailBox.className = 'ip-group';
  const mailLegend = document.createElement('legend');
  mailLegend.textContent = 'Mail Users';
  mailBox.appendChild(mailLegend);
  const mailNote = document.createElement('div');
  mailNote.className = 'meta';
  mailNote.textContent = 'Accounts are stored on this server. Existing users are not listed here.';
  mailBox.appendChild(mailNote);
  const mailStatus = document.createElement('div');
  mailStatus.className = 'meta';
  mailBox.appendChild(mailStatus);

  const mailAdd = document.createElement('div');
  mailAdd.className = 'dns-row';
  const mailUserInput = document.createElement('input');
  mailUserInput.placeholder = 'alice';
  mailUserInput.spellcheck = false;
  const mailPassInput = document.createElement('input');
  mailPassInput.type = 'password';
  mailPassInput.placeholder = 'password';
  mailPassInput.autocomplete = 'off';
  const mailAddBtn = document.createElement('button');
  mailAddBtn.className = 'btn';
  mailAddBtn.textContent = 'Add User';
  mailAddBtn.onclick = async () => {
    const user = mailUserInput.value.trim();
    const pass = mailPassInput.value;
    if (!user || !pass) {
      mailStatus.textContent = 'User and password are required';
      return;
    }
    const r = await api('/api/devices/mailuser', { id: d.id, user, pass });
    if (r.error) {
      mailStatus.textContent = r.error;
      return;
    }
    mailStatus.textContent = `Added user ${user}`;
    mailUserInput.value = '';
    mailPassInput.value = '';
  };
  mailAdd.appendChild(mailUserInput);
  mailAdd.appendChild(mailPassInput);
  mailAdd.appendChild(mailAddBtn);
  mailBox.appendChild(mailAdd);

  /* TFTP contents are not part of the workspace snapshot either; the list
     is fetched from the server each time this section is drawn. */
  const tftpBox = document.createElement('fieldset');
  tftpBox.className = 'ip-group';
  const tftpLegend = document.createElement('legend');
  tftpLegend.textContent = 'TFTP Files';
  tftpBox.appendChild(tftpLegend);

  const tftpList = document.createElement('div');
  tftpList.className = 'dns-list';
  tftpBox.appendChild(tftpList);
  const tftpNote = document.createElement('div');
  tftpNote.className = 'meta';
  tftpBox.appendChild(tftpNote);

  const loadFiles = async () => {
    tftpNote.textContent = 'Loading…';
    let r;
    try {
      r = await jsonRequest('/api/tftp/list', { id: d.id });
    } catch {
      r = { error: 'request failed' };
    }
    tftpList.replaceChildren();
    if (r.error) {
      tftpNote.textContent = r.error;
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
        const res = await api('/api/devices/tftp', { id: d.id, name, content: '' });
        if (res.error) {
          tftpNote.textContent = res.error;
          return;
        }
        await loadFiles();
      };
      row.appendChild(label);
      row.appendChild(del);
      tftpList.appendChild(row);
    }
    if (!files.length) {
      const empty = document.createElement('div');
      empty.className = 'meta';
      empty.textContent = 'No files';
      tftpList.appendChild(empty);
    }
    tftpNote.textContent = files.length
      ? `${files.length} file${files.length === 1 ? '' : 's'}`
      : 'No files';
  };

  const tftpForm = document.createElement('div');
  tftpForm.className = 'tftp-form';
  const tftpName = document.createElement('input');
  tftpName.placeholder = 'config.txt';
  tftpName.spellcheck = false;
  const tftpContent = document.createElement('textarea');
  tftpContent.className = 'http-page';
  tftpContent.rows = 3;
  tftpContent.spellcheck = false;
  tftpContent.placeholder = 'File contents';
  const tftpAdd = document.createElement('button');
  tftpAdd.className = 'btn';
  tftpAdd.textContent = 'Add File';
  tftpAdd.onclick = async () => {
    const name = tftpName.value.trim();
    if (!name) {
      tftpNote.textContent = 'File name is required';
      return;
    }
    if (!tftpContent.value) {
      tftpNote.textContent = 'File contents are required';
      return;
    }
    const r = await api('/api/devices/tftp', {
      id: d.id,
      name,
      content: tftpContent.value,
    });
    if (r.error) {
      tftpNote.textContent = r.error;
      return;
    }
    tftpName.value = '';
    tftpContent.value = '';
    await loadFiles();
  };
  tftpForm.appendChild(tftpName);
  tftpForm.appendChild(tftpContent);
  tftpForm.appendChild(tftpAdd);
  tftpBox.appendChild(tftpForm);

  box.appendChild(resBox);
  box.appendChild(dnsBox);
  box.appendChild(httpBox);
  box.appendChild(mailBox);
  box.appendChild(tftpBox);
  box.appendChild(ftpSection(d));
  box.appendChild(aaaSection(d));
  box.appendChild(syslogSection(d));
  box.appendChild(ntpSection(d));
  pane.appendChild(box);
  loadFiles();
  return;
}
