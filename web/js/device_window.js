/* ---------------- device window (PC0 style) ---------------- */
const DESKTOP_APPS = [
  ['ipconfig.png', 'IP Configuration', 'ipconfig'],
  ['dialup.png', 'Dialup', ''],
  ['terminal.png', 'Terminal', 'term'],
  ['cmdprompt.png', 'Command Prompt', 'cmd'],
  ['browser.png', 'Web Browser', 'browser'],
  ['PCWirelessInactive.png', 'PC Wireless', 'wifi'],
  ['VPNdialup.png', 'VPN', 'vpn'],
  ['trafficGenerator.png', 'Traffic Generator', 'traffic'],
  ['mibbrowser.png', 'MIB Browser', 'mib'],
  ['IPCommunicator.png', 'Cisco IP Communicator', 'phone'],
  ['EmailClient.png', 'Email', 'email'],
  ['PPPoEDialer.png', 'PPPoE Dialer', 'pppoe'],
  ['TextEditor.png', 'Text Editor', 'editor'],
  ['IPv4Firewall.png', 'Firewall', 'firewall'],
  ['IPv6Firewall.png', 'IPv6 Firewall', 'firewall'],
];

let dwDevice = null;

function openDeviceWindow(d) {
  dwDevice = d;
  const win = document.getElementById('device-window');
  document.getElementById('dw-name').textContent = d.name;
  document.getElementById('dw-icon').src = asset(d.icon);
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
