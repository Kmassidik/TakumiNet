/* ---------------- terminal on a computer ---------------- */
let cmdDevice = null;
/* Set while the terminal is inside a session on a router or switch. */
let telnetPeer = null;
let telnetPrompt = '';
let shellPrompt = '';
const cmdHistory = [];
let cmdHistoryAt = 0;

/* Every command runs server-side against the same topology the packet engine
   forwards through, so `ping` and `tracert` produce real PDU events. */
async function cmdRequest(id, line) {
  const q = new URLSearchParams({ id, line }).toString();
  const res = await fetch(`/api/cmd?${q}`, { method: 'POST' });
  return res.json();
}

function hostPrompt(d) {
  return `${d.name}@${d.ip || 'localhost'}:~$`;
}

function openCmd(d) {
  cmdDevice = d;
  telnetPeer = null;
  telnetPrompt = '';
  shellPrompt = hostPrompt(d);
  cmdHistory.length = 0;
  cmdHistoryAt = 0;
  const $ = (id) => document.getElementById(id);
  const win = $('cmd-window');
  const out = $('cmd-out');
  const input = $('cmd-in');
  const promptEl = $('cmd-prompt');
  const title = $('cmd-title');
  if (title) title.textContent = `Terminal — ${d.name}`;
  if (promptEl) promptEl.textContent = shellPrompt;
  out.textContent = `Takumi terminal on ${d.name}.\nType help to see the commands, or <command> --help for one command.\n\n`;
  input.value = '';
  win.hidden = false;
  bringToFront(win);
  input.focus();

  const showPrompt = () => {
    if (promptEl) promptEl.textContent = telnetPeer ? telnetPrompt : shellPrompt;
  };
  const append = (text) => {
    if (!text) return;
    out.textContent += text.endsWith('\n') ? text : `${text}\n`;
  };

  const leaveSession = () => {
    const peer = telnetPeer;
    telnetPeer = null;
    telnetPrompt = '';
    cliRequest('/api/cli/reset', { id: peer }).catch(() => {});
    out.textContent += '\n';
    showPrompt();
  };

  const runLine = async (line) => {
    const verb = (line.trim().split(/\s+/)[0] || '').toLowerCase();
    const shown = telnetPeer ? telnetPrompt : shellPrompt;
    out.textContent += `${shown} ${line}\n`;
    if (line.trim() && cmdHistory[cmdHistory.length - 1] !== line) cmdHistory.push(line);
    cmdHistoryAt = cmdHistory.length;

    if (verb === 'clear' || verb === 'cls') { out.textContent = ''; return; }
    if (verb === 'exit') {
      if (telnetPeer) leaveSession();
      else win.hidden = true;
      return;
    }

    input.disabled = true;
    try {
      if (telnetPeer) {
        const r = await cliRequest('/api/cli', { id: telnetPeer, line });
        append(r.output);
        if (r.prompt) telnetPrompt = r.prompt;
      } else {
        const r = await cmdRequest(d.id, line);
        append(r.output);
        if (r.prompt) shellPrompt = r.prompt;
        if (typeof recordCommand === 'function') recordCommand(d.name, line, r.output);
        if (r.peer) {
          telnetPeer = r.peer;
          const p = await cliRequest('/api/cli', { id: r.peer, line: '' });
          telnetPrompt = p.prompt || '>';
        }
        refreshAfter(verb);
      }
    } catch {
      append(telnetPeer ? '% connection closed' : 'The terminal lost its connection to the simulator.');
    }
    showPrompt();
    input.disabled = false;
    out.scrollTop = out.scrollHeight;
    input.focus();
  };

  const refreshAfter = (verb) => {
    getJson('/api/workspace').then((snapshot) => {
      if (!Array.isArray(snapshot.devices)) return;
      setData(snapshot);
      if (verb !== 'ping' && verb !== 'tracert' && verb !== 'traceroute') return;
      const event = snapshot.events && snapshot.events[snapshot.events.length - 1];
      if (!event) return;
      if (typeof selectCaptureEvent === 'function') selectCaptureEvent(event.id);
      else {
        simCursor = event.id;
        renderEvents();
        animatePath(event.path, event.proto);
      }
    });
  };

  input.onkeydown = async (e) => {
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      e.preventDefault();
      cmdHistoryAt = Math.max(0, Math.min(cmdHistory.length, cmdHistoryAt + (e.key === 'ArrowUp' ? -1 : 1)));
      input.value = cmdHistory[cmdHistoryAt] || '';
      return;
    }
    if (e.key !== 'Enter' || input.disabled) return;
    const line = input.value;
    input.value = '';
    await runLine(line);
  };

  const help = $('cmd-help');
  if (help) help.onclick = () => runLine('help');
}
