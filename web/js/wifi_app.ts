/* ---------------- wireless desktop app ---------------- */
const WIFI_BARS = ['no signal', '1 bar', '2 bars', '3 bars', '4 bars'];

function wifiCarrierName(id) {
  const dev = (data.devices || []).find((x) => x.id === id);
  return dev ? dev.name : id;
}

/* Returns { user, pass }, or null when the person cancels a prompt. */
async function wifiCredentials(net) {
  let user = '';
  if (net.security === 'WPA2-Enterprise') {
    user = await askText(`Username for ${net.ssid}`);
    if (user === null) return null;
  }
  if (net.security === 'Open') return { user, pass: '' };
  const pass = await askText(`Password for ${net.ssid}`);
  if (pass === null) return null;
  return { user, pass };
}

function openWifiApp(d) {
  const win = document.getElementById('wifi-dialog');
  document.getElementById('wifi-title').textContent = `Wireless — ${d.name}`;
  win.hidden = false;
  bringToFront(win);
  renderWifiApp(d);
}

async function renderWifiApp(d) {
  const line = document.getElementById('wifi-status');
  const body = document.getElementById('wifi-body');
  line.textContent = 'Looking for networks…';
  body.replaceChildren();
  let st;
  let scan;
  try {
    [st, scan] = await Promise.all([
      jsonRequest('/api/wifi/status', { id: d.id }),
      jsonRequest('/api/wifi/scan', {}),
    ]);
  } catch {
    line.textContent = '';
    const p = document.createElement('p');
    p.className = 'err';
    p.textContent = 'Could not reach the radio.';
    const again = document.createElement('button');
    again.className = 'btn';
    again.textContent = 'Try again';
    again.onclick = () => renderWifiApp(d);
    body.appendChild(p);
    body.appendChild(again);
    return;
  }
  renderWifiStatus(d, st, line, body);
  renderWifiList(d, st, scan.ssids || [], line, body);
}

function renderWifiStatus(d, st, line, body) {
  if (!st.associated) {
    line.textContent = 'Not connected';
    return;
  }
  line.textContent =
    `Connected to ${st.ssid} via ${wifiCarrierName(st.wlc)} · ${WIFI_BARS[st.bars] || WIFI_BARS[0]}`;
  const leave = document.createElement('button');
  leave.className = 'btn';
  leave.textContent = 'Leave';
  leave.onclick = async () => {
    const r = await api('/api/wifi/disconnect', { id: d.id });
    if (r.error) { line.textContent = r.error; return; }
    renderWifiApp(d);
  };
  body.appendChild(leave);
}

function renderWifiList(d, st, nets, line, body) {
  if (!nets.length) {
    const empty = document.createElement('p');
    empty.className = 'meta';
    empty.textContent = 'No wireless network is in the air.';
    body.appendChild(empty);
    return;
  }
  const list = document.createElement('div');
  list.className = 'wifi-list';
  for (const net of nets) list.appendChild(wifiNetworkRow(d, st, net, line));
  body.appendChild(list);
}

function wifiNetworkRow(d, st, net, line) {
  const row = document.createElement('div');
  row.className = 'wifi-row';
  const name = document.createElement('span');
  name.textContent = net.ssid;
  const carrier = document.createElement('span');
  carrier.className = 'wlc';
  carrier.textContent = wifiCarrierName(net.wlc);
  const sec = document.createElement('span');
  sec.className = 'sec';
  sec.textContent = net.security;
  const act = document.createElement('button');
  act.className = 'btn';

  const sameSsid = st.associated && st.ssid === net.ssid;
  if (sameSsid && st.wlc === net.wlc) {
    act.textContent = 'Connected';
    act.disabled = true;
  } else if (sameSsid) {
    act.textContent = 'Roam';
    act.onclick = async () => {
      const r = await api('/api/wifi/roam', { id: d.id, wlc: net.wlc });
      if (r.error) { line.textContent = r.error; return; }
      sfx('popUp');
      renderWifiApp(d);
    };
  } else {
    act.textContent = 'Join';
    act.onclick = async () => {
      const cred = await wifiCredentials(net);
      if (!cred) return;
      const r = await api('/api/wifi/join', { id: d.id, ssid: net.ssid, pass: cred.pass, user: cred.user });
      if (r.error) { line.textContent = r.error; return; }
      sfx('popUp');
      renderWifiApp(d);
    };
  }
  row.appendChild(name);
  row.appendChild(carrier);
  row.appendChild(sec);
  row.appendChild(act);
  return row;
}
