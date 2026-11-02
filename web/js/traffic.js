/* ---------------- traffic generator ---------------- */
const HOST_KINDS = new Set(['pc', 'laptop', 'server', 'tablet', 'pda']);

/* The form starts on the first host address in the workspace, preferring one
   that is not the device the window was opened from. */
function defaultTrafficIp(source) {
  const devices = (data && data.devices) || [];
  const hosts = devices.filter((d) => HOST_KINDS.has(d.kind) && d.ip);
  const host = hosts.find((d) => d.id !== (source && source.id)) || hosts[0];
  const any = devices.find((d) => d.ip);
  return (host || any || {}).ip || '';
}

function deviceByIp(ip) {
  return ((data && data.devices) || []).find((d) => d.ip === ip) || null;
}

/* Every Start invalidates the previous run, including one left behind by a
   window that was closed or reopened mid-run. */
let trafficGen = 0;

function openTraffic(d) {
  const win = document.getElementById('traffic-dialog');
  const ipInput = document.getElementById('traffic-ip');
  const countInput = document.getElementById('traffic-count');
  const intervalInput = document.getElementById('traffic-interval');
  const startBtn = document.getElementById('traffic-start');
  const stopBtn = document.getElementById('traffic-stop');
  const sentEl = document.getElementById('traffic-sent');
  const receivedEl = document.getElementById('traffic-received');
  const lostEl = document.getElementById('traffic-lost');
  const note = document.getElementById('traffic-note');
  const log = document.getElementById('traffic-log');

  document.getElementById('traffic-title').textContent = `Traffic Generator — ${d.name}`;
  /* A run left behind by an earlier window must not keep writing to the
     shared controls. */
  trafficGen += 1;
  ipInput.value = defaultTrafficIp(d);
  countInput.value = '4';
  intervalInput.value = '200';
  log.textContent = '';
  let sent = 0;
  let received = 0;
  let running = false;

  const showCounters = () => {
    sentEl.textContent = String(sent);
    receivedEl.textContent = String(received);
    lostEl.textContent = String(sent - received);
  };
  const showRoute = () => {
    const ip = ipInput.value.trim();
    const target = deviceByIp(ip);
    note.textContent = target
      ? `${d.name} → ${target.name} (${ip}) — one /api/pdu delivery per packet`
      : `${d.name} → ${ip || '(no address)'} — one ping through /api/cmd per packet`;
  };
  const setRunning = (on) => {
    running = on;
    startBtn.disabled = on;
    stopBtn.disabled = !on;
    ipInput.disabled = on;
    countInput.disabled = on;
    intervalInput.disabled = on;
  };

  /* One packet through the same engine the canvas forwards with. An address
     that belongs to a device is delivered by id; anything else runs the
     command prompt's real ping so the engine resolves and records it. */
  const sendOne = async (ip) => {
    const target = deviceByIp(ip);
    if (target && target.id !== d.id) {
      let r;
      try { r = await jsonRequest('/api/pdu', { src: d.id, dst: target.id }); }
      catch { return false; }
      if (r.error) return false;
      setData(r);
      return true;
    }
    try {
      const r = await cmdRequest(d.id, `ping ${ip}`);
      const m = /Received = (\d+)/.exec(r.output || '');
      const fresh = await getJson('/api/workspace');
      if (fresh && fresh.devices) setData(fresh);
      return !!(m && Number(m[1]) > 0);
    } catch {
      return false;
    }
  };

  const start = async () => {
    if (running) return;
    const ip = ipInput.value.trim();
    if (!/^\d{1,3}(\.\d{1,3}){3}$/.test(ip)) {
      note.textContent = `Enter a valid IPv4 address, not "${ip}"`;
      return;
    }
    const total = Math.max(1, Math.min(200, Math.floor(Number(countInput.value) || 1)));
    const gap = Math.max(0, Math.min(60000, Math.floor(Number(intervalInput.value) || 0)));
    countInput.value = String(total);
    intervalInput.value = String(gap);
    sent = 0;
    received = 0;
    showCounters();
    log.textContent = '';
    setRunning(true);
    const run = ++trafficGen;
    for (let i = 0; i < total; i++) {
      if (run !== trafficGen) break;
      const ok = await sendOne(ip);
      if (run !== trafficGen) break;
      sent += 1;
      if (ok) received += 1;
      showCounters();
      log.textContent += `#${sent} ping ${ip} — ${ok ? 'reply' : 'timeout'}\n`;
      log.scrollTop = log.scrollHeight;
      if (i < total - 1 && gap > 0) {
        await new Promise((resolve) => setTimeout(resolve, gap));
      }
    }
    if (run === trafficGen) {
      setRunning(false);
      note.textContent = `Finished — ${sent} sent, ${received} received, ${sent - received} lost`;
    }
  };

  const close = () => {
    if (running) {
      trafficGen += 1;
      setRunning(false);
    }
    win.hidden = true;
  };

  ipInput.oninput = showRoute;
  startBtn.onclick = start;
  stopBtn.onclick = () => {
    if (!running) return;
    trafficGen += 1;
    setRunning(false);
    note.textContent = `Stopped — ${sent} of ${countInput.value} packets sent`;
  };
  document.getElementById('traffic-close').onclick = close;
  win.onclick = (e) => { if (e.target === win) close(); };

  showCounters();
  showRoute();
  setRunning(false);
  win.hidden = false;
  bringToFront(win);
  ipInput.focus();
}
