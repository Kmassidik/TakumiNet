/* ---------------- config tab sections ---------------- */
/* Per-kind controls in the device Config tab: addressing for hosts without a
   desktop, the provider (PPPoE) connection on a home router, site-to-site
   tunnels, shared gateways, virtual networks and extra DHCP pools. */

/* Hosts that carry an address but have no desktop, so no IP Configuration app. */
const ADDRESSING_KINDS = new Set(['printer']);
/* Kinds whose config tab is reachable here; rtrw-gateway, switch-l3 and asa
   open their own kind windows instead, which carry their controls. */
const TUNNEL_KINDS = new Set(['router', 'homerouter']);
/* Addresses offered as tunnel peers come from these kinds' ports. */
const PEER_KINDS = new Set(['router', 'asa', 'homerouter', 'rtrw-gateway', 'switch-l3']);

function configSections(box, d) {
  if (ADDRESSING_KINDS.has(d.kind)) box.appendChild(addressingSection(d));
  if (d.kind === 'homerouter') box.appendChild(pppoeSection(d));
  if (TUNNEL_KINDS.has(d.kind)) box.appendChild(tunnelSection(d));
  if (d.kind === 'router') box.appendChild(sharedGatewaySection(d));
  if (d.kind === 'server') box.appendChild(vnetSection(d));
}

function sectionBox(title) {
  const box = document.createElement('fieldset');
  box.className = 'ip-group';
  const legend = document.createElement('legend');
  legend.textContent = title;
  box.appendChild(legend);
  return box;
}

function sectionMeta(text) {
  const el = document.createElement('div');
  el.className = 'meta';
  el.textContent = text;
  return el;
}

function sectionInput(placeholder) {
  const el = document.createElement('input');
  el.placeholder = placeholder;
  el.spellcheck = false;
  return el;
}

function sectionButton(label, onclick) {
  const el = document.createElement('button');
  el.className = 'btn';
  el.textContent = label;
  el.onclick = onclick;
  return el;
}

function reopenTab(id, tab) {
  const fresh = ((data && data.devices) || []).find((x) => x.id === id);
  if (fresh) dwDevice = fresh;
  selectTab(tab);
}

/* IP, mask and gateway for a device that has no desktop (a printer). */
function addressingSection(d) {
  const box = sectionBox('Addressing');
  const note = sectionMeta(d.dhcp ? 'Addressed by DHCP' : 'Static address');
  const ip = sectionInput('192.168.1.50');
  ip.value = d.ip || '';
  const mask = sectionInput('255.255.255.0');
  mask.value = prefixToMask(d.prefix ?? 24);
  const gw = sectionInput('192.168.1.1');
  gw.value = d.gateway || '';
  const dns = sectionInput('192.168.1.2');
  dns.value = d.dns || '';
  const rows = [['IP address', ip], ['Subnet mask', mask], ['Default gateway', gw], ['DNS server', dns]];
  for (const [label, input] of rows) {
    const row = document.createElement('label');
    row.className = 'ipfield';
    const span = document.createElement('span');
    span.textContent = label;
    row.appendChild(span);
    row.appendChild(input);
    box.appendChild(row);
  }
  const actions = document.createElement('div');
  actions.className = 'ip-actions';
  actions.appendChild(sectionButton('Apply', async () => {
    const r = await api('/api/devices/ip', {
      id: d.id,
      ip: ip.value.trim(),
      mask: mask.value.trim() || '255.255.255.0',
      gateway: gw.value.trim(),
      dns: dns.value.trim(),
    });
    if (r.error) { note.textContent = r.error; return; }
    reopenTab(d.id, 'config');
  }));
  actions.appendChild(sectionButton('Renew DHCP lease', async () => {
    const r = await api('/api/dhcp/acquire', { id: d.id });
    if (r.error) { note.textContent = r.error; return; }
    sfx('popUp');
    reopenTab(d.id, 'config');
  }));
  actions.appendChild(note);
  box.appendChild(actions);
  return box;
}

/* The customer login a home router holds against its provider's gateway. */
function pppoeSection(d) {
  const box = sectionBox('Provider connection (PPPoE)');
  const state = sectionMeta(d.pppoe
    ? `Connected to ${d.pppoe.server} as ${d.pppoe.user}`
    : 'Not connected');
  box.appendChild(state);
  const note = sectionMeta('');

  const row = document.createElement('div');
  row.className = 'dns-row';
  const server = sectionInput('Gateway address');
  server.value = (d.pppoe && d.pppoe.server) || '';
  const user = sectionInput('Login name');
  user.value = (d.pppoe && d.pppoe.user) || '';
  const pass = sectionInput('Password');
  pass.type = 'password';
  pass.autocomplete = 'off';
  row.appendChild(server);
  row.appendChild(user);
  row.appendChild(pass);
  row.appendChild(sectionButton('Connect', async () => {
    const r = await api('/api/pppoe/connect', {
      id: d.id, server: server.value.trim(), user: user.value.trim(), pass: pass.value,
    });
    if (r.error) { note.textContent = r.error; return; }
    sfx('popUp');
    reopenTab(d.id, 'config');
  }));
  if (d.pppoe) {
    row.appendChild(sectionButton('Disconnect', async () => {
      const r = await api('/api/pppoe/disconnect', { id: d.id });
      if (r.error) { note.textContent = r.error; return; }
      reopenTab(d.id, 'config');
    }));
  }
  box.appendChild(row);
  box.appendChild(note);
  return box;
}

/* Addresses on other routers' ports, offered as tunnel peers. */
async function fillPeerPicker(select, ownId) {
  const routers = ((data && data.devices) || []).filter(
    (x) => x.id !== ownId && PEER_KINDS.has(x.kind),
  );
  for (const dev of routers) {
    const r = await getJson(`/api/devices/ports?id=${encodeURIComponent(dev.id)}`);
    for (const p of r.ports || []) {
      if (!p.ip) continue;
      const opt = document.createElement('option');
      opt.value = p.ip;
      opt.textContent = `${dev.name} · ${p.name} (${p.ip})`;
      select.appendChild(opt);
    }
    if (dev.ip) {
      const opt = document.createElement('option');
      opt.value = dev.ip;
      opt.textContent = `${dev.name} (${dev.ip})`;
      select.appendChild(opt);
    }
  }
  if (!select.children.length) {
    const opt = document.createElement('option');
    opt.value = '';
    opt.textContent = 'No peer addresses yet';
    select.appendChild(opt);
  }
}

/* One end of a site-to-site tunnel over the internet cloud. */
function tunnelSection(d) {
  const box = sectionBox('Tunnel');
  const note = sectionMeta('');
  if (d.tunnel) {
    const row = document.createElement('div');
    row.className = 'dns-row';
    const label = document.createElement('span');
    label.textContent = `Peer ${d.tunnel.peer} — tunnel is ${d.tunnel.state}`;
    row.appendChild(label);
    row.appendChild(sectionButton('Remove', async () => {
      const r = await api('/api/devices/tunnel', { id: d.id, remove: '1' });
      if (r.error) { note.textContent = r.error; return; }
      reopenTab(d.id, 'config');
    }));
    box.appendChild(row);
  } else {
    box.appendChild(sectionMeta('No tunnel on this router'));
  }
  const row = document.createElement('div');
  row.className = 'dns-row';
  const peer = document.createElement('select');
  fillPeerPicker(peer, d.id);
  const key = sectionInput('Shared key');
  row.appendChild(peer);
  row.appendChild(key);
  row.appendChild(sectionButton('Connect', async () => {
    const r = await api('/api/devices/tunnel', { id: d.id, peer: peer.value, key: key.value.trim() });
    if (r.error) { note.textContent = r.error; return; }
    sfx('popUp');
    reopenTab(d.id, 'config');
  }));
  box.appendChild(row);
  box.appendChild(note);
  return box;
}

/* Membership in a shared (first-hop redundant) gateway address. */
function sharedGatewaySection(d) {
  const box = sectionBox('Shared gateway');
  const note = sectionMeta('');
  const list = document.createElement('div');
  list.className = 'dns-list';
  for (const g of d.sharedGws || []) {
    const row = document.createElement('div');
    row.className = 'dns-row';
    const label = document.createElement('span');
    label.textContent = `${g.vip} · priority ${g.priority}${g.owner ? ' · answering now' : ''}`;
    row.appendChild(label);
    row.appendChild(sectionButton('Leave', async () => {
      const r = await api('/api/devices/sharedgw', { id: d.id, vip: g.vip, remove: '1' });
      if (r.error) { note.textContent = r.error; return; }
      reopenTab(d.id, 'config');
    }));
    list.appendChild(row);
  }
  if (!(d.sharedGws || []).length) list.appendChild(sectionMeta('Not sharing any address'));
  box.appendChild(list);

  const row = document.createElement('div');
  row.className = 'dns-row';
  const vip = sectionInput('Shared address');
  const priority = sectionInput('Priority');
  priority.inputMode = 'numeric';
  row.appendChild(vip);
  row.appendChild(priority);
  row.appendChild(sectionButton('Share', async () => {
    const r = await api('/api/devices/sharedgw', {
      id: d.id, vip: vip.value.trim(), priority: priority.value.trim(),
    });
    if (r.error) { note.textContent = r.error; return; }
    sfx('popUp');
    reopenTab(d.id, 'config');
  }));
  box.appendChild(row);
  box.appendChild(note);
  return box;
}

/* Membership in a virtual tenant network. */
function vnetSection(d) {
  const box = sectionBox('Virtual network');
  const note = sectionMeta('');
  const state = sectionMeta(d.vnet ? `Member of virtual network ${d.vnet}` : 'Not in a virtual network');
  box.appendChild(state);
  const row = document.createElement('div');
  row.className = 'dns-row';
  const vni = sectionInput('Network id');
  vni.inputMode = 'numeric';
  vni.value = d.vnet || '';
  row.appendChild(vni);
  row.appendChild(sectionButton('Join', async () => {
    const r = await api('/api/devices/vnet', { id: d.id, vni: vni.value.trim() });
    if (r.error) { note.textContent = r.error; return; }
    sfx('popUp');
    reopenTab(d.id, 'config');
  }));
  if (d.vnet) {
    row.appendChild(sectionButton('Leave', async () => {
      const r = await api('/api/devices/vnet', { id: d.id, remove: '1' });
      if (r.error) { note.textContent = r.error; return; }
      reopenTab(d.id, 'config');
    }));
  }
  box.appendChild(row);
  box.appendChild(note);
  return box;
}

/* Every DHCP pool on a server or gateway; the first one stays in the IP
   Configuration dialog, further networks are added here. */
function dhcpPoolsSection(d, tab) {
  const box = sectionBox('DHCP pools');
  const note = sectionMeta('');
  const list = document.createElement('div');
  list.className = 'dns-list';
  for (const p of d.pools || []) {
    const row = document.createElement('div');
    row.className = 'dns-row';
    const label = document.createElement('span');
    label.textContent = `${p.network}/${p.prefix} · gateway ${p.gateway || 'none'} · DNS ${p.dns || 'none'}`;
    row.appendChild(label);
    row.appendChild(sectionButton('Remove', async () => {
      const r = await api('/api/devices/dhcp', {
        id: d.id, network: p.network, prefix: p.prefix, remove: '1',
      });
      if (r.error) { note.textContent = r.error; return; }
      reopenTab(d.id, tab);
    }));
    list.appendChild(row);
  }
  if (!(d.pools || []).length) list.appendChild(sectionMeta('No pools'));
  box.appendChild(list);

  const row = document.createElement('div');
  row.className = 'dns-row';
  const network = sectionInput('Network');
  const mask = sectionInput('Mask');
  const gw = sectionInput('Gateway');
  const dns = sectionInput('DNS');
  row.appendChild(network);
  row.appendChild(mask);
  row.appendChild(gw);
  row.appendChild(dns);
  row.appendChild(sectionButton('Add pool', async () => {
    const r = await api('/api/devices/dhcp', {
      id: d.id,
      network: network.value.trim(),
      mask: mask.value.trim() || '255.255.255.0',
      gateway: gw.value.trim(),
      dns: dns.value.trim(),
      more: '1',
    });
    if (r.error) { note.textContent = r.error; return; }
    sfx('popUp');
    reopenTab(d.id, tab);
  }));
  box.appendChild(row);
  box.appendChild(note);
  return box;
}
