let ipTarget = null;

function prefixToMask(p) {
  const n = Number(p ?? 24);
  const m = n === 0 ? 0 : (0xffffffff << (32 - n)) >>> 0;
  return [24, 16, 8, 0].map((s) => (m >>> s) & 255).join('.');
}

function openIpDialog(d) {
  const $ = (id) => document.getElementById(id);
  ipTarget = d.id;
  $('ip-title').textContent = 'IP Configuration';
  $('ip-addr').value = d.ip || '';
  $('ip-mask').value = prefixToMask(d.prefix);
  $('ip-gw').value = d.gateway || '';
  $('ip-dns').value = d.dns || '';
  $('ip-v6auto').checked = !!d.ipv6Auto;
  $('ip-v6static').checked = !d.ipv6Auto;
  $('ip-v6addr').value = d.ipv6 || '';
  $('ip-v6prefix').value = d.ipv6Prefix ?? 64;
  $('ip-v6ll').value = `FE80::${(d.id || '0000').slice(-4).toUpperCase()}`;
  $('ip-v6gw').value = d.ipv6Gateway || '';
  $('ip-v6dns').value = d.ipv6Dns || '';
  $('ip-8021x').checked = !!d.dot1x;
  $('ip-8021x-user').value = d.dot1xUser || '';
  $('ip-8021x-pass').value = '';
  $('ip-note').textContent = `${d.name} · ${d.model}`;
  const warning = $('ip-warning');
  warning.hidden = !d.warning;
  warning.textContent = d.warning || '';

  const dialog = $('ip-dialog');
  dialog.hidden = false;
  bringToFront(dialog);

  const setV4Mode = (dhcp) => {
    $('ip-dhcp').checked = dhcp;
    $('ip-static').checked = !dhcp;
    for (const id of ['ip-addr', 'ip-mask', 'ip-gw', 'ip-dns']) $(id).disabled = dhcp;
  };
  $('ip-dhcp').onchange = () => setV4Mode(true);
  $('ip-static').onchange = () => setV4Mode(false);
  setV4Mode(!!d.dhcp);

  /* Servers also own a DHCP pool, which is what hands the addresses out. */
  const poolGroup = $('ip-pool-group');
  poolGroup.hidden = d.kind !== 'server';
  if (d.pool) {
    $('ip-pool-net').value = d.pool.network || '';
    $('ip-pool-mask').value = prefixToMask(d.pool.prefix ?? 24);
    $('ip-pool-gw').value = d.pool.gateway || '';
    $('ip-pool-dns').value = d.pool.dns || '';
  }
  $('ip-pool-save').onclick = async () => {
    const note = $('ip-pool-note');
    const r = await api('/api/devices/dhcp', {
      id: ipTarget,
      network: $('ip-pool-net').value.trim(),
      mask: $('ip-pool-mask').value.trim() || '255.255.255.0',
      gateway: $('ip-pool-gw').value.trim(),
      dns: $('ip-pool-dns').value.trim(),
    });
    note.textContent = r.error || 'Pool saved';
  };

  const setV6Mode = (auto) => {
    $('ip-v6auto').checked = auto;
    $('ip-v6static').checked = !auto;
    for (const id of ['ip-v6addr', 'ip-v6prefix', 'ip-v6gw', 'ip-v6dns']) $(id).disabled = auto;
  };
  $('ip-v6auto').onchange = () => setV6Mode(true);
  $('ip-v6static').onchange = () => setV6Mode(false);


  $('ip-save').onclick = async () => {
    const note = $('ip-note');
    if ($('ip-dhcp').checked) {
      const r = await api('/api/dhcp/acquire', { id: ipTarget });
      if (r.error) { note.textContent = r.error; return; }
      const dev = (r.devices || []).find((x) => x.id === ipTarget);
      if (dev) {
        $('ip-addr').value = dev.ip || '';
        $('ip-mask').value = prefixToMask(dev.prefix ?? 24);
        $('ip-gw').value = dev.gateway || '';
        $('ip-dns').value = dev.dns || '';
        note.textContent = `Lease ${dev.ip}/${dev.prefix}`;
        status(`DHCP lease ${dev.ip}/${dev.prefix}`);
        sfx('popUp');
      }
      return;
    }
    const v4 = await api('/api/devices/ip', {
      id: ipTarget,
      ip: $('ip-addr').value.trim(),
      mask: $('ip-mask').value.trim() || '255.255.255.0',
      gateway: $('ip-gw').value.trim(),
      dns: $('ip-dns').value.trim(),
    });
    if (v4.error) { note.textContent = v4.error; return; }

    const v6 = await api('/api/devices/ipv6', {
      id: ipTarget,
      auto: $('ip-v6auto').checked ? '1' : '0',
      addr: $('ip-v6addr').value.trim(),
      prefix: $('ip-v6prefix').value.trim() || '64',
      gateway: $('ip-v6gw').value.trim(),
      dns: $('ip-v6dns').value.trim(),
    });
    if (v6.error) { note.textContent = v6.error; return; }

    const x = await api('/api/devices/dot1x', {
      id: ipTarget,
      enabled: $('ip-8021x').checked ? '1' : '0',
      user: $('ip-8021x-user').value.trim(),
      pass: $('ip-8021x-pass').value.trim(),
    });
    if (x.error) { note.textContent = x.error; return; }

    const saved = (x.devices || []).find((item) => item.id === ipTarget);
    const warn = saved && saved.warning;
    if (warn) { note.textContent = warn; return; }
    dialog.hidden = true;
    status(`IP configuration saved: ${$('ip-addr').value.trim()} ${$('ip-mask').value.trim()}`);
    sfx('popUp');
  };
}
