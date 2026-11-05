/* ---------------- power over Ethernet, on the Physical tab ---------------- */
/* Access points and phones can run on the cable alone (IEEE 802.3af/at). With
   the box ticked the device only has power while its switch port supplies it. */
async function poeControl(box, d, refresh) {
  let state = null;
  try {
    state = await getJson(`/api/devices/poe?id=${encodeURIComponent(d.id)}`);
  } catch {
    return;
  }
  if (!state || !state.capable) return;

  const row = document.createElement('label');
  row.className = 'poe-row';
  const check = document.createElement('input');
  check.type = 'checkbox';
  check.checked = !!state.on;
  const text = document.createElement('span');
  text.textContent = 'Powered over Ethernet (no wall adapter)';
  const status = document.createElement('span');
  status.className = state.on && !state.powered ? 'poe-status is-bad' : 'poe-status';
  status.setAttribute('role', 'status');
  if (!state.on) status.textContent = `Would draw ${state.watts} W from a switch port`;
  else if (state.powered) status.textContent = `Receiving ${state.watts} W from its switch`;
  else status.textContent = `No power: ${state.reason}`;
  row.append(check, text, status);
  check.onchange = async () => {
    await api('/api/devices/poe', { id: d.id, on: check.checked ? '1' : '0' });
    await refresh();
  };
  box.appendChild(row);
}
