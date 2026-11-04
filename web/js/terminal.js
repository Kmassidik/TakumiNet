/* ---------------- terminal (console into routers and switches) ---------------- */
const CONSOLE_KINDS = new Set(['router', 'switch']);

let termDevice = null;
/* Router/switch id the session is bound to; differs from termDevice when the
   window was opened from a PC's Desktop across a console cable. */
let termTarget = null;

/* `/api/cli` answers with `{output, prompt}` only, so it must bypass `api()`
   (which treats every response as a workspace snapshot). */
async function cliRequest(path, params) {
  const q = new URLSearchParams(params).toString();
  const res = await fetch(`${path}?${q}`, { method: 'POST' });
  return res.json();
}

async function openTerm(d) {
  const win = document.getElementById('term-window');
  const out = document.getElementById('term-out');
  const input = document.getElementById('term-in');
  const promptEl = document.getElementById('term-prompt');
  const titleEl = document.getElementById('term-title');
  const close = () => closeTerm();

  termDevice = d;
  termTarget = null;
  out.textContent = '';
  input.value = '';
  win.hidden = false;
  bringToFront(win);
  titleEl.textContent = 'Terminal';
  win.addEventListener('dialog-closed', close, { once: true });

  /* A router or switch is its own console; anything else needs a console cable
     to one, exactly like the real Desktop → Terminal icon. */
  let target = d;
  if (!CONSOLE_KINDS.has(d.kind)) {
    let peer = null;
    try {
      peer = await cliRequest('/api/console', { id: d.id });
    } catch { peer = null; }
    if (!peer || !peer.peer) {
      out.textContent = '% No console cable to a router or switch.\n' +
        '% Pick the Console cable in the palette, then click this device and the router.\n';
      promptEl.textContent = '>';
      input.disabled = true;
      input.onkeydown = null;
      return;
    }
    target = data.devices.find((x) => x.id === peer.peer) || { id: peer.peer, name: peer.name };
    titleEl.textContent = `Terminal — ${d.name} → ${target.name}`;
  }
  termTarget = target;
  if (termDevice !== d) return; // closed while resolving

  input.disabled = true;
  input.onkeydown = async (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      try {
        const r = await jsonRequest('/api/complete', { id: target.id, line: input.value });
        const list = r.candidates || [];
        if (list.length === 1) {
          input.value = `${list[0]} `;
        } else if (list.length > 1) {
          out.textContent += `${list.join('   ')}\n`;
          out.scrollTop = out.scrollHeight;
        }
      } catch { /* completion is best-effort */ }
      return;
    }
    if (e.key !== 'Enter' || input.disabled) return;
    const line = input.value;
    input.value = '';
    out.textContent += `${promptEl.textContent} ${line}\n`;
    out.scrollTop = out.scrollHeight;
    input.disabled = true;
    try {
      const r = await cliRequest('/api/cli', { id: target.id, line });
      if (r.output) out.textContent += r.output.endsWith('\n') ? r.output : `${r.output}\n`;
      if (r.prompt) promptEl.textContent = r.prompt;
      getJson('/api/workspace').then((snapshot) => {
        if (Array.isArray(snapshot.devices)) setData(snapshot);
      });
    } catch {
      out.textContent += '% console session lost\n';
    }
    input.disabled = false;
    out.scrollTop = out.scrollHeight;
    input.focus();
  };

  promptEl.textContent = `${target.name}>`;
  input.focus();
  cliRequest('/api/cli', { id: target.id, line: '' }).then((r) => {
    if (termDevice !== d || win.hidden) return;
    if (r.output) out.textContent += r.output;
    if (r.prompt) promptEl.textContent = r.prompt;
    out.scrollTop = out.scrollHeight;
    input.disabled = false;
    input.focus();
  }).catch(() => {
    if (termDevice !== d) return;
    out.textContent += '% console session unavailable\n';
    input.disabled = false;
  });
}

function closeTerm() {
  const win = document.getElementById('term-window');
  const input = document.getElementById('term-in');
  const target = termTarget;
  win.hidden = true;
  input.disabled = false;
  input.value = '';
  input.onkeydown = null;
  termDevice = null;
  termTarget = null;
  if (!target) return;
  cliRequest('/api/cli/reset', { id: target.id }).catch(() => {});
}
