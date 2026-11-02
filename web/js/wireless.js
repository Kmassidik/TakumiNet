/* ---------------- PC Wireless ---------------- */
/* `/api/wifi/scan` and the status endpoints answer with their own shapes, so
   they use jsonRequest() rather than api(), which expects a workspace snapshot. */
async function wifiStatus(id) {
  try {
    return await jsonRequest('/api/wifi/status', { id });
  } catch {
    return { error: 'request failed' };
  }
}

function openWifi(d) {
  const $ = (id) => document.getElementById(id);
  const win = $('wifi-dialog');
  const isWlc = d.kind === 'wlc';
  const statusLine = $('wifi-status');
  const note = $('wifi-note');

  $('wifi-title').textContent = isWlc
    ? `Wireless LAN Controller — ${d.name}`
    : `PC Wireless — ${d.name}`;
  $('wifi-client').hidden = isWlc;
  $('wifi-wlan-group').hidden = !isWlc;
  note.textContent = '';
  $('wifi-scan-note').textContent = '';
  $('wifi-psk').value = '';
  $('wifi-wlan-note').textContent = '';
  $('wifi-wlan-ssid').value = '';
  $('wifi-wlan-psk').value = '';
  $('wifi-wlan-list').replaceChildren();

  win.hidden = false;
  bringToFront(win);
  $('wifi-close').onclick = () => { win.hidden = true; };
  win.onclick = (e) => { if (e.target === win) win.hidden = true; };

  if (isWlc) {
    /* A controller lists the WLANs it advertises and accepts new ones; the
       workspace refuses a PSK shorter than eight characters. */
    const load = async () => {
      let r;
      try { r = await jsonRequest('/api/wifi/wlans', { id: d.id }); }
      catch { r = { error: 'request failed' }; }
      const list = $('wifi-wlan-list');
      list.replaceChildren();
      if (r.error) { note.textContent = r.error; return; }
      const wlans = Array.isArray(r.wlans) ? r.wlans : [];
      for (const w of wlans) {
        const row = document.createElement('div');
        row.className = 'wifi-row';
        const name = document.createElement('span');
        name.textContent = w.ssid;
        const sec = document.createElement('span');
        sec.className = 'sec';
        sec.textContent = w.security;
        row.appendChild(name);
        row.appendChild(sec);
        list.appendChild(row);
      }
      if (!wlans.length) {
        const empty = document.createElement('div');
        empty.className = 'meta';
        empty.textContent = 'No WLANs configured';
        list.appendChild(empty);
      }
      note.textContent = `${wlans.length} WLAN${wlans.length === 1 ? '' : 's'}`;
    };

    $('wifi-wlan-add').onclick = async () => {
      const ssid = $('wifi-wlan-ssid').value.trim();
      const pass = $('wifi-wlan-psk').value;
      if (!ssid) { $('wifi-wlan-note').textContent = 'SSID is required'; return; }
      if (pass.length < 8) {
        $('wifi-wlan-note').textContent = 'WPA2-PSK needs at least 8 characters';
        return;
      }
      const r = await api('/api/wifi/wlan', { id: d.id, ssid, pass });
      if (r.error) { $('wifi-wlan-note').textContent = r.error; return; }
      $('wifi-wlan-ssid').value = '';
      $('wifi-wlan-psk').value = '';
      $('wifi-wlan-note').textContent = `Added ${ssid}`;
      await load();
    };
    load();
    return;
  }

  /* Client view: scan what the controllers advertise, join with the PSK, and
     read the association the workspace holds for this device. */
  const refreshStatus = async () => {
    const r = await wifiStatus(d.id);
    if (r.error) {
      statusLine.textContent = 'Status unavailable';
      statusLine.classList.remove('ok');
      statusLine.classList.add('off');
      return;
    }
    if (r.associated) {
      statusLine.textContent = `Associated with ${r.ssid}${r.wlc ? ` via ${r.wlc}` : ''}`;
      statusLine.classList.add('ok');
      statusLine.classList.remove('off');
    } else {
      statusLine.textContent = 'Not associated';
      statusLine.classList.remove('ok');
      statusLine.classList.add('off');
    }
  };

  const scan = async () => {
    $('wifi-scan-note').textContent = 'Scanning…';
    let r;
    try { r = await jsonRequest('/api/wifi/scan', { id: d.id }); }
    catch { r = { error: 'request failed' }; }
    const select = $('wifi-ssid');
    select.replaceChildren();
    if (r.error) {
      $('wifi-scan-note').textContent = r.error;
      return;
    }
    const ssids = Array.isArray(r.ssids) ? r.ssids : [];
    for (const s of ssids) {
      const opt = document.createElement('option');
      opt.value = s.ssid;
      opt.textContent = `${s.ssid} — ${s.security}`;
      select.appendChild(opt);
    }
    if (!ssids.length) {
      const opt = document.createElement('option');
      opt.value = '';
      opt.textContent = 'No wireless networks found';
      select.appendChild(opt);
    }
    $('wifi-scan-note').textContent =
      `${ssids.length} network${ssids.length === 1 ? '' : 's'} visible`;
  };

  $('wifi-scan').onclick = () => scan();
  $('wifi-connect').onclick = async () => {
    const ssid = $('wifi-ssid').value;
    if (!ssid) { note.textContent = 'Scan and select a network first'; return; }
    note.textContent = `Joining ${ssid}…`;
    const r = await api('/api/wifi/join', {
      id: d.id,
      ssid,
      pass: $('wifi-psk').value,
      user: $('wifi-user') ? $('wifi-user').value : '',
    });
    if (r.error) { note.textContent = r.error; return; }
    $('wifi-psk').value = '';
    if ($('wifi-user')) $('wifi-user').value = '';
    note.textContent = `Joined ${ssid}`;
    await refreshStatus();
  };

  $('wifi-disconnect').onclick = async () => {
    $('wifi-psk').value = '';
    const r = await api('/api/wifi/disconnect', { id: d.id });
    note.textContent = r.error ? r.error : 'Disconnected';
    await refreshStatus();
  };

  scan();
  refreshStatus();
}
