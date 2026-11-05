/* ---------------- wireless manager (homerouter, ap, wlc, hotspot-ap) ---------------- */
function tabWireless(pane, d) {
  const box = document.createElement('div');
  box.className = 'dw-wireless';
  pane.appendChild(box);
  renderWirelessManager(box, d);
}

function renderWirelessManager(box, d) {
  box.replaceChildren();
  const loading = document.createElement('p');
  loading.className = 'meta';
  loading.textContent = 'Loading wireless networks…';
  box.appendChild(loading);
  loadWireless(box, d);
}

async function loadWireless(box, d) {
  let wlans;
  let controller = null;
  try {
    const res = await jsonRequest('/api/wifi/wlans', { id: d.id });
    if (res.error) throw new Error(res.error);
    wlans = res.wlans || [];
    if (d.kind === 'ap') {
      controller = (await jsonRequest('/api/capwap/status', { id: d.id })).wlc || '';
    }
  } catch {
    box.replaceChildren();
    const p = document.createElement('p');
    p.className = 'err';
    p.textContent = 'Could not load the wireless networks.';
    const again = document.createElement('button');
    again.className = 'btn';
    again.textContent = 'Try again';
    again.onclick = () => renderWirelessManager(box, d);
    box.appendChild(p);
    box.appendChild(again);
    return;
  }

  box.replaceChildren();
  const note = document.createElement('p');
  note.className = 'meta';
  const redraw = () => renderWirelessManager(box, d);

  if (!wlans.length) {
    const empty = document.createElement('p');
    empty.className = 'meta';
    empty.textContent = 'No wireless network is set up yet.';
    box.appendChild(empty);
  } else {
    const list = document.createElement('div');
    list.className = 'wifi-list';
    for (const w of wlans) list.appendChild(wlanRow(d, w, note, redraw));
    box.appendChild(list);
  }
  box.appendChild(wlanAddForm(d, note, redraw));
  if (controller !== null) box.appendChild(controllerRow(d, controller, note, redraw));
  if (d.kind === 'ap' || d.kind === 'hotspot-ap') box.appendChild(channelSection(d, redraw, note));
  box.appendChild(note);
}

function wlanRow(d, w, note, redraw) {
  const row = document.createElement('div');
  row.className = 'wifi-row';
  const name = document.createElement('span');
  name.textContent = w.ssid;
  row.appendChild(name);
  if (w.guest) {
    const badge = document.createElement('span');
    badge.className = 'guest';
    badge.textContent = 'guest';
    row.appendChild(badge);
  }
  const sec = document.createElement('span');
  sec.className = 'sec';
  sec.textContent = w.security;
  row.appendChild(sec);

  const guest = document.createElement('label');
  guest.className = 'wifi-guest';
  const tick = document.createElement('input');
  tick.type = 'checkbox';
  tick.checked = !!w.guest;
  tick.onchange = async () => {
    const r = await api('/api/wifi/guest', { id: d.id, ssid: w.ssid, on: tick.checked ? '1' : '0' });
    if (r.error) { note.textContent = r.error; tick.checked = !!w.guest; return; }
    redraw();
  };
  guest.appendChild(tick);
  guest.appendChild(document.createTextNode(' Guest'));
  row.appendChild(guest);

  const del = document.createElement('button');
  del.className = 'btn';
  del.textContent = 'Remove';
  del.onclick = async () => {
    const r = await api('/api/wifi/remove', { id: d.id, ssid: w.ssid });
    if (r.error) { note.textContent = r.error; return; }
    redraw();
  };
  row.appendChild(del);
  return row;
}

function wlanAddForm(d, note, redraw) {
  const form = document.createElement('div');
  form.className = 'kw-form wifi-add';
  const field = (labelText, type) => {
    const label = document.createElement('label');
    label.className = 'kw-field';
    label.textContent = labelText;
    const input = document.createElement('input');
    input.className = 'kw-input';
    input.type = type;
    input.autocomplete = 'off';
    label.appendChild(input);
    form.appendChild(label);
    return input;
  };
  const ssid = field('Network name', 'text');
  const pass = field('Password (empty for open)', 'password');
  const add = document.createElement('button');
  add.className = 'btn';
  add.textContent = 'Add network';
  add.onclick = async () => {
    const r = await api('/api/wifi/wlan', { id: d.id, ssid: ssid.value.trim(), pass: pass.value });
    if (r.error) { note.textContent = r.error; return; }
    redraw();
  };
  form.appendChild(add);
  return form;
}

function controllerRow(d, controller, note, redraw) {
  const row = document.createElement('div');
  row.className = 'wifi-row wifi-controller';
  const current = document.createElement('span');
  const named = (id) => ((data.devices || []).find((x) => x.id === id) || { name: id }).name;
  current.textContent = controller ? `Controller: ${named(controller)}` : 'Controller: none';
  row.appendChild(current);

  const wlcs = (data.devices || []).filter((x) => x.kind === 'wlc');
  if (!wlcs.length) {
    const hint = document.createElement('span');
    hint.className = 'wlc';
    hint.textContent = 'Add a wireless controller to adopt this access point';
    row.appendChild(hint);
    return row;
  }
  const sel = document.createElement('select');
  sel.className = 'kw-input';
  for (const w of wlcs) {
    const opt = document.createElement('option');
    opt.value = w.id;
    opt.textContent = w.name;
    sel.appendChild(opt);
  }
  sel.value = wlcs[0].id;
  row.appendChild(sel);

  const join = document.createElement('button');
  join.className = 'btn';
  join.textContent = 'Join controller';
  join.onclick = async () => {
    const r = await api('/api/wifi/capwap', { id: d.id, wlc: sel.value });
    if (r.error) { note.textContent = r.error; return; }
    sfx('popUp');
    redraw();
  };
  row.appendChild(join);
  return row;
}

/* Access points expose their 2.4/5 GHz channel and an overlap warning. */
function channelSection(d, redraw, note) {
  const wrap = document.createElement('fieldset');
  wrap.className = 'ip-group';
  const legend = document.createElement('legend');
  legend.textContent = 'Radio';
  wrap.appendChild(legend);
  const row = document.createElement('div');
  row.className = 'ipfield';
  const bandLabel = document.createElement('span');
  bandLabel.textContent = 'Band';
  const band = document.createElement('select');
  band.className = 'kw-input';
  for (const value of ['2.4', '5']) {
    const opt = document.createElement('option');
    opt.value = value;
    opt.textContent = `${value} GHz`;
    band.appendChild(opt);
  }
  const chanLabel = document.createElement('span');
  chanLabel.textContent = 'Channel';
  const chan = document.createElement('select');
  chan.className = 'kw-input';
  const fill = () => {
    chan.replaceChildren();
    const values = band.value === '5'
      ? [36, 40, 44, 48, 149, 153, 157, 161, 165]
      : [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
    for (const n of values) {
      const opt = document.createElement('option');
      opt.value = String(n);
      opt.textContent = String(n);
      chan.appendChild(opt);
    }
  };
  fill();
  row.appendChild(bandLabel);
  row.appendChild(band);
  row.appendChild(chanLabel);
  row.appendChild(chan);
  wrap.appendChild(row);
  const warn = document.createElement('p');
  warn.className = 'meta';
  wrap.appendChild(warn);
  const save = async () => {
    const r = await api('/api/devices/wireless', { id: d.id, channel: chan.value, band: band.value });
    if (r.error) { note.textContent = r.error; return; }
    redraw();
  };
  band.onchange = () => { fill(); save(); };
  chan.onchange = save;
  if (typeof getJson !== 'function') return wrap;
  getJson('/api/devices/wireless').then((res) => {
    const mine = (res.devices || []).find((x) => x.id === d.id);
    if (!mine) return;
    band.value = mine.band;
    fill();
    chan.value = String(mine.channel);
    const others = mine.overlaps_with || [];
    warn.textContent = others.length
      ? `Channel overlap with ${others.join(', ')}. Move one access point to 1, 6 or 11.`
      : '';
  }).catch(() => undefined);
  return wrap;
}
