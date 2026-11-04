/* ---------------- device window (PC0 style) ---------------- */
const DESKTOP_APPS = [
  ['apps/nic', 'IP Configuration', 'ipconfig'],
  ['apps/terminal', 'Terminal', 'term'],
  ['apps/cmd', 'Command Prompt', 'cmd'],
  ['apps/browser', 'Web Browser', 'browser'],
  ['apps/wireless', 'Wireless', 'wifi'],
  ['groups/notes', 'Text Editor', 'editor'],
  ['apps/traffic', 'Capture', 'capture'],
  ['groups/firewall', 'Firewall', 'firewall'],
  ['groups/firewall6', 'IPv6 Firewall', 'firewall'],
];

let dwDevice = null;

/* Which tabs a kind earns: hosts get a desktop, network gear gets a CLI,
   only a server runs services. */
const DESKTOP_KINDS = new Set(['pc', 'laptop', 'server', 'tablet', 'pda', 'sniffer', 'tv', 'phone']);
const WIRELESS_KINDS = new Set(['homerouter', 'ap', 'wlc', 'hotspot-ap']);
const WIFI_APP_KINDS = new Set(['pc', 'laptop', 'tablet', 'phone', 'tv']);

function deviceTabs(kind) {
  const tabs = ['physical', 'config'];
  if (WIRELESS_KINDS.has(kind)) tabs.push('wireless');
  if (DESKTOP_KINDS.has(kind)) tabs.push('desktop');
  if (CONSOLE_KINDS.has(kind)) tabs.push('cli');
  if (kind === 'server') tabs.push('services');
  return tabs;
}

/* The one-line description the palette carries for this device's model. */
function modelBlurb(model) {
  const entry = (data.palette || []).find((p) => p.label === model);
  return entry && entry.blurb ? `${model} — ${entry.blurb}` : '';
}

function openDeviceWindow(d) {
  dwDevice = d;
  const win = document.getElementById('device-window');
  document.getElementById('dw-name').textContent = d.name;
  document.getElementById('dw-icon').src = d.icon;
  const blurb = document.getElementById('dw-blurb');
  blurb.textContent = modelBlurb(d.model);
  blurb.hidden = !blurb.textContent;
  win.hidden = false;
  bringToFront(win);
  const tabs = deviceTabs(d.kind);
  document.querySelectorAll('#dw-tabs button').forEach((b) => {
    b.hidden = !tabs.includes(b.dataset.tab);
  });
  selectTab(['desktop', 'cli', 'wireless'].find((t) => tabs.includes(t)) || 'config');
  document.getElementById('dw-min').onclick = () => { win.hidden = true; };
  document.getElementById('dw-max').onclick = () => {
    const box = win.querySelector('.preview');
    if (box) box.classList.toggle('maxed');
  };
  document.querySelectorAll('#dw-tabs button').forEach((b) => {
    b.onclick = () => selectTab(b.dataset.tab);
  });
}
