/* ---------------- device window (PC0 style) ---------------- */
const DESKTOP_APPS = [
  ['apps/nic', 'IP Configuration', 'ipconfig'],
  ['apps/terminal', 'Terminal', 'term'],
  ['apps/cmd', 'Command Prompt', 'cmd'],
  ['apps/browser', 'Web Browser', 'browser'],
  ['apps/wireless', 'PC Wireless', 'wifi'],
  ['apps/vpn', 'VPN', 'vpn'],
  ['apps/traffic', 'Traffic Generator', 'traffic'],
  ['apps/netsearch', 'MIB Browser', 'mib'],
  ['apps/voip', 'IP Communicator', 'phone'],
  ['apps/email', 'Email', 'email'],
  ['apps/pppoe', 'PPPoE Dialer', 'pppoe'],
  ['groups/notes', 'Text Editor', 'editor'],
  ['groups/firewall', 'Firewall', 'firewall'],
  ['groups/firewall6', 'IPv6 Firewall', 'firewall'],
];

let dwDevice = null;

function openDeviceWindow(d) {
  dwDevice = d;
  const win = document.getElementById('device-window');
  document.getElementById('dw-name').textContent = d.name;
  document.getElementById('dw-icon').src = d.icon;
  win.hidden = false;
  bringToFront(win);
  selectTab('desktop');
  document.getElementById('dw-close').onclick = () => { win.hidden = true; };
  document.getElementById('dw-min').onclick = () => { win.hidden = true; };
  document.getElementById('dw-max').onclick = () => {
    const box = win.querySelector('.preview');
    if (box) box.classList.toggle('maxed');
  };
  win.onclick = (e) => { if (e.target === win) win.hidden = true; };
  document.querySelectorAll('#dw-tabs button').forEach((b) => {
    b.onclick = () => selectTab(b.dataset.tab);
  });
}
