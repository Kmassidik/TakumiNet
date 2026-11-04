/* ---------------- capture app (sniffer desktop) ---------------- */
/* An in-path sniffer passes frames through unchanged and keeps the last 200.
   This window lists that buffer; Refresh re-reads it, Clear empties it. */

function captureDialog() {
  let win = document.getElementById('capture-dialog');
  if (win) return win;
  win = document.createElement('div');
  win.id = 'capture-dialog';
  win.className = 'overlay';
  win.hidden = true;
  win.innerHTML = `
    <div class="preview webwin">
      <div class="devwin-title">
        <span id="capture-app-title">Capture</span>
        <span class="dw-btns"><button class="dlg-close" data-dialog-close title="Close" aria-label="Close">×</button></span>
      </div>
      <div class="web-bar">
        <button class="btn" id="capture-app-refresh">Refresh</button>
        <button class="btn" id="capture-app-clear">Clear</button>
      </div>
      <div id="capture-app-status" class="meta"></div>
      <div class="web-body" id="capture-app-body"></div>
    </div>`;
  document.body.appendChild(win);
  return win;
}

async function captureFetch(id, clear) {
  const res = await fetch(`/api/sniffer/${id}${clear ? '/clear' : ''}`, {
    method: clear ? 'POST' : 'GET',
  });
  return res.json();
}

function renderCaptureRows(body, frames) {
  body.replaceChildren();
  if (!frames.length) {
    const p = document.createElement('p');
    p.className = 'meta';
    p.textContent = 'No frames captured yet. Send traffic through the sniffer, then refresh.';
    body.appendChild(p);
    return;
  }
  const table = document.createElement('table');
  table.className = 'pdu-table';
  const head = document.createElement('tr');
  for (const label of ['Time', 'Source', 'Destination', 'Protocol', 'Length', 'Info']) {
    const th = document.createElement('th');
    th.textContent = label;
    head.appendChild(th);
  }
  table.appendChild(head);
  for (const f of frames) {
    const tr = document.createElement('tr');
    const cells = [
      `${Number(f.t).toFixed(3)} s`,
      f.srcIp || f.srcMac,
      f.dstIp || f.dstMac,
      (f.proto || '').toUpperCase(),
      String(f.length),
      f.info,
    ];
    cells.forEach((text, i) => {
      const td = document.createElement('td');
      td.textContent = text;
      td.title = i === 1 ? f.srcMac : i === 2 ? f.dstMac : text;
      tr.appendChild(td);
    });
    table.appendChild(tr);
  }
  body.appendChild(table);
}

function openCapture(d) {
  const win = captureDialog();
  win.hidden = false;
  bringToFront(win);
  document.getElementById('capture-app-title').textContent = `Capture — ${d.name}`;
  const body = document.getElementById('capture-app-body');
  const statusEl = document.getElementById('capture-app-status');
  body.replaceChildren();
  statusEl.textContent = 'Loading…';

  const load = async (clear) => {
    try {
      const r = await captureFetch(d.id, clear);
      if (r.error) {
        statusEl.textContent = r.error;
        renderCaptureRows(body, []);
        return;
      }
      const n = (r.frames || []).length;
      statusEl.textContent = n
        ? `${n} frame${n === 1 ? '' : 's'} captured (the sniffer keeps the last 200)`
        : 'The buffer is empty.';
      renderCaptureRows(body, r.frames || []);
    } catch {
      statusEl.textContent = 'The sniffer did not answer. Close the window and try again.';
    }
  };

  document.getElementById('capture-app-refresh').onclick = () => load(false);
  document.getElementById('capture-app-clear').onclick = () => load(true);
  load(false);
}
