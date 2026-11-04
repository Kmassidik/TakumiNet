/* ---------------- interactive simulated pages ---------------- */
/* Pages the simulated browser renders beyond plain text: the home router's
   sign-in and status page (with port forwarding) and the hotspot voucher
   portal. Every request is a real delivery through the simulated network,
   so it uses jsonRequest and shows the engine's errors word for word. */

function pageRequest(path, params) {
  return jsonRequest(path, params).catch(() => ({ error: 'request failed' }));
}

function pageMeta(text) {
  const el = document.createElement('div');
  el.className = 'meta';
  el.textContent = text;
  return el;
}

function pageError(text) {
  const el = document.createElement('p');
  el.className = 'err';
  el.textContent = text;
  return el;
}

/* The sign-in form a home router answers with. */
function renderRouterPage(d, page, body) {
  const form = document.createElement('div');
  form.className = 'router-login';
  const user = document.createElement('input');
  user.placeholder = 'User name';
  user.spellcheck = false;
  const pass = document.createElement('input');
  pass.type = 'password';
  pass.placeholder = 'Password';
  pass.autocomplete = 'off';
  const btn = document.createElement('button');
  btn.className = 'btn';
  btn.textContent = 'Sign in';
  const note = pageMeta('');
  btn.onclick = async () => {
    note.textContent = 'Signing in…';
    const r = await pageRequest('/api/router/login', {
      from: d.id, to: page.host, user: user.value.trim(), pass: pass.value,
    });
    if (r.error) {
      note.textContent = r.error;
      return;
    }
    sfx('popUp');
    await renderRouterStatus(d, page, body);
  };
  pass.onkeydown = (e) => { if (e.key === 'Enter') btn.onclick(); };
  form.appendChild(user);
  form.appendChild(pass);
  form.appendChild(btn);
  body.appendChild(form);
  body.appendChild(note);
  user.focus();
}

/* The tiny status page shown after a successful sign-in. */
async function renderRouterStatus(d, page, body) {
  body.replaceChildren();
  const h = document.createElement('h2');
  h.textContent = page.title;
  body.appendChild(h);
  body.appendChild(pageMeta('Loading…'));

  const r = await pageRequest('/api/router/status', { id: page.host });
  body.replaceChildren(h);
  if (r.error) {
    body.appendChild(pageError(r.error));
    const retry = document.createElement('button');
    retry.className = 'btn';
    retry.textContent = 'Retry';
    retry.onclick = () => renderRouterStatus(d, page, body);
    body.appendChild(retry);
    return;
  }
  const wan = document.createElement('p');
  wan.textContent = `WAN: ${r.wan}`;
  const lan = document.createElement('p');
  lan.textContent = `LAN: ${r.lan || 'no address'}`;
  body.appendChild(wan);
  body.appendChild(lan);
  body.appendChild(portForwardSection(d, page, r, body));
}

/* Inside devices a forward may point at: anything addressed, except the
   router itself and pure layer-2 gear. */
function forwardTargets(routerId) {
  return ((data && data.devices) || []).filter(
    (x) => x.id !== routerId && x.ip && x.kind !== 'homerouter' && x.kind !== 'switch' && x.kind !== 'hub',
  );
}

function portForwardSection(d, page, info, body) {
  const box = document.createElement('fieldset');
  box.className = 'ip-group';
  const legend = document.createElement('legend');
  legend.textContent = 'Port forwarding';
  box.appendChild(legend);
  const note = pageMeta('');

  const list = document.createElement('div');
  list.className = 'dns-list';
  for (const f of info.forwards || []) {
    const row = document.createElement('div');
    row.className = 'dns-row';
    const label = document.createElement('span');
    label.textContent = `${f.outside} → ${f.name}, port ${f.inside}`;
    const del = document.createElement('button');
    del.className = 'btn';
    del.textContent = 'Remove';
    del.onclick = async () => {
      const r = await pageRequest('/api/devices/portforward', { id: info.id, outside: f.outside, remove: '1' });
      if (r.error) {
        note.textContent = r.error;
        return;
      }
      await renderRouterStatus(d, page, body);
    };
    row.appendChild(label);
    row.appendChild(del);
    list.appendChild(row);
  }
  if (!(info.forwards || []).length) list.appendChild(pageMeta('No forwards'));
  box.appendChild(list);

  const add = document.createElement('div');
  add.className = 'dns-row';
  const outside = document.createElement('input');
  outside.placeholder = 'Outside port';
  outside.inputMode = 'numeric';
  const target = document.createElement('select');
  for (const dev of forwardTargets(info.id)) {
    const opt = document.createElement('option');
    opt.value = dev.id;
    opt.textContent = `${dev.name} (${dev.ip})`;
    target.appendChild(opt);
  }
  const inside = document.createElement('input');
  inside.placeholder = 'Inside port';
  inside.inputMode = 'numeric';
  const addBtn = document.createElement('button');
  addBtn.className = 'btn';
  addBtn.textContent = 'Add';
  addBtn.onclick = async () => {
    const r = await pageRequest('/api/devices/portforward', {
      id: info.id,
      outside: outside.value.trim(),
      target: target.value,
      inside: inside.value.trim(),
    });
    if (r.error) {
      note.textContent = r.error;
      return;
    }
    sfx('popUp');
    await renderRouterStatus(d, page, body);
  };
  add.appendChild(outside);
  add.appendChild(target);
  add.appendChild(inside);
  add.appendChild(addBtn);
  box.appendChild(add);
  box.appendChild(note);
  return box;
}

/* The hotspot portal: one voucher code, one visitor. */
function renderPortalPage(d, page, body) {
  const form = document.createElement('div');
  form.className = 'dns-row';
  const code = document.createElement('input');
  code.placeholder = 'Voucher code';
  code.spellcheck = false;
  const btn = document.createElement('button');
  btn.className = 'btn';
  btn.textContent = 'Redeem';
  const note = pageMeta('');
  btn.onclick = async () => {
    const typed = code.value.trim();
    if (!typed) {
      note.textContent = 'Type the voucher code first';
      return;
    }
    note.textContent = 'Checking…';
    const r = await pageRequest('/api/voucher', { id: page.device, client: d.id, code: typed });
    if (r.error) {
      note.textContent = r.error;
      return;
    }
    sfx('popUp');
    note.textContent = `Voucher accepted: ${r.minutes} minutes of internet.`;
  };
  code.onkeydown = (e) => { if (e.key === 'Enter') btn.onclick(); };
  form.appendChild(code);
  form.appendChild(btn);
  body.appendChild(form);
  body.appendChild(note);
  code.focus();
}
