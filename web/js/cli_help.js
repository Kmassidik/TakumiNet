/* ---------------- command line help ---------------- */
const CLI_MODES = [
  ['Router>', 'User mode. You can look but not change anything. Type enable to go up.'],
  ['Router#', 'Privileged mode. Every show command works. Type configure terminal to start changing things.'],
  ['Router(config)#', 'Global configuration. Type interface <name> or router ospf 1 to go deeper; exit steps back.'],
  ['Router(config-if)#', 'One interface. Set ip address, no shutdown, switchport mode.'],
];

const CLI_STARTERS = [
  ['enable', 'go to privileged mode'],
  ['show ip interface brief', 'every interface, its address and whether it is up'],
  ['show running-config', 'the settings the device is using now'],
  ['show ip route', 'where packets go'],
  ['configure terminal', 'start changing settings'],
  ['copy running-config startup-config', 'save, so a reboot keeps the settings'],
];

function cliHelpSection(title, rows, pick) {
  const section = document.createElement('section');
  section.className = 'kw-section';
  const heading = document.createElement('h3');
  heading.className = 'kw-heading';
  heading.textContent = title;
  section.appendChild(heading);
  for (const [code, text] of rows) {
    const row = document.createElement(pick ? 'button' : 'div');
    row.className = pick ? 'btn cli-help-row' : 'cli-help-row';
    const name = document.createElement('code');
    name.textContent = code;
    const note = document.createElement('span');
    note.textContent = text;
    row.append(name, note);
    if (pick) row.onclick = () => pick(code);
    section.appendChild(row);
  }
  return section;
}

/* `pick(command)` is called when the learner taps a starter command, and
   should put it in the console's input box. */
function openCliHelp(pick) {
  const win = document.getElementById('cli-help-dialog');
  const body = document.getElementById('cli-help-body');
  body.replaceChildren();
  const tips = document.createElement('p');
  tips.className = 'kw-note';
  tips.textContent = 'Type ? to list what is allowed here. Press Tab to finish a word. Tap a command below to put it in the box.';
  body.appendChild(tips);
  body.appendChild(cliHelpSection('Where you are', CLI_MODES, null));
  body.appendChild(cliHelpSection('Commands to start with', CLI_STARTERS, (code) => {
    pick(code);
    win.hidden = true;
  }));
  win.hidden = false;
  bringToFront(win);
}
