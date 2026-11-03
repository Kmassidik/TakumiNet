/* ---------------- command prompt ---------------- */
let cmdDevice = null;
/* Set while the prompt is inside a telnet session to a router/switch. */
let telnetPeer = null;
let telnetPrompt = '';

/* Every command runs server-side against the same topology the packet engine
   forwards through, so `ping` and `tracert` produce real PDU events. */
async function cmdRequest(id, line) {
  const q = new URLSearchParams({ id, line }).toString();
  const res = await fetch(`/api/cmd?${q}`, { method: 'POST' });
  return res.json();
}

function openCmd(d) {
  cmdDevice = d;
  telnetPeer = null;
  telnetPrompt = '';
  const win = document.getElementById('cmd-window');
  const out = document.getElementById('cmd-out');
  const input = document.getElementById('cmd-in');
  out.textContent = 'Microsoft Windows XP [Version 5.1.2600]\n(C) Copyright 1985-2001 Microsoft Corp.\n\n';
  input.value = '';
  win.hidden = false;
  bringToFront(win);
  input.focus();
  document.getElementById('cmd-close').onclick = () => { win.hidden = true; };
  win.onclick = (e) => { if (e.target === win) win.hidden = true; };

  input.onkeydown = async (e) => {
    if (e.key !== 'Enter') return;
    const line = input.value;
    input.value = '';
    const verb = (line.trim().split(/\s+/)[0] || '').toLowerCase();

    if (verb === 'cls') { out.textContent = ''; return; }
    if (verb === 'exit') {
      if (telnetPeer) {
        const peer = telnetPeer;
        telnetPeer = null;
        telnetPrompt = '';
        cliRequest('/api/cli/reset', { id: peer }).catch(() => {});
        out.textContent += '\n';
        out.scrollTop = out.scrollHeight;
        return;
      }
      win.hidden = true;
      return;
    }

    /* Inside telnet every line is router CLI, like the real prompt. */
    if (telnetPeer) {
      out.textContent += `${line}\n`;
      out.scrollTop = out.scrollHeight;
      input.disabled = true;
      try {
        const r = await cliRequest('/api/cli', { id: telnetPeer, line });
        if (r.output) out.textContent += r.output.endsWith('\n') ? r.output : `${r.output}\n`;
        if (r.prompt) telnetPrompt = r.prompt;
        out.textContent += telnetPrompt;
      } catch {
        out.textContent += '% connection closed\n';
      }
      input.disabled = false;
      out.scrollTop = out.scrollHeight;
      input.focus();
      return;
    }

    out.textContent += `C:\\> ${line}\n`;
    out.scrollTop = out.scrollHeight;
    input.disabled = true;
    try {
      const r = await cmdRequest(d.id, line);
      out.textContent += r.output || '';
      if (r.peer) {
        telnetPeer = r.peer;
        const p = await cliRequest('/api/cli', { id: r.peer, line: '' });
        telnetPrompt = p.prompt || '>';
        out.textContent += telnetPrompt;
      }
      getJson('/api/workspace').then((snapshot) => {
        if (!Array.isArray(snapshot.devices)) return;
        setData(snapshot);
        if (verb !== 'ping' && verb !== 'tracert') return;
        const event = snapshot.events && snapshot.events[snapshot.events.length - 1];
        if (!event) return;
        simCursor = event.id;
        renderEvents();
        animatePath(event.path);
      });
    } catch {
      out.textContent += 'The system cannot find the path specified.\n\n';
    }
    input.disabled = false;
    out.scrollTop = out.scrollHeight;
    input.focus();
  };
}
