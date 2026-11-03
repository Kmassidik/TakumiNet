/* Wireshark-style capture dock, protocol palette, narration and flow ladder. */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  Object.assign(root, api);
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const PROTOCOL_COLORS = Object.freeze({
    ARP: '#e8590c', ICMP: '#0a5ed7', TCP: '#7048e8', UDP: '#0ca678',
    HTTP: '#d6336c', DNS: '#f08c00', DHCP: '#2f9e44', OTHER: '#59636e',
  });
  const NARRATION_MASCOTS = Object.freeze({
    think: '/art3d/mascot/think.png', happy: '/art3d/mascot/happy.png', error: '/art3d/mascot/error.png',
  });
  let narrationState = 'think';

  function eventProtocol(event) {
    const direct = String(event && (event.proto || event.type) || '').toUpperCase();
    if (PROTOCOL_COLORS[direct]) return direct;
    const layers = [...(event && event.layers || []), ...((event && event.hops || []).flatMap((hop) => hop.layers || []))];
    const app = layers.map((layer) => String(layer.name).toUpperCase()).find((name) => PROTOCOL_COLORS[name]);
    if (app) return app;
    if (direct === 'SMTP' || direct === 'POP3' || direct === 'IMAP') return 'TCP';
    return direct || 'OTHER';
  }

  function protocolColor(proto) {
    return PROTOCOL_COLORS[String(proto || 'OTHER').toUpperCase()] || PROTOCOL_COLORS.OTHER;
  }

  function captureInfo(event) {
    if (!event) return '';
    if (event.status === 'Dropped' && event.reason) return `Dropped: ${event.reason}`;
    const proto = eventProtocol(event);
    if (proto === 'ARP') return event.note || `Address resolution ${event.last} → ${event.at}`;
    if (proto === 'ICMP') return `ICMP echo ${event.last} → ${event.at}`;
    const layers = [...(event.layers || []), ...((event.hops || []).flatMap((hop) => hop.layers || []))];
    const app = layers.find((layer) => ['HTTP', 'DNS', 'DHCP'].includes(String(layer.name).toUpperCase()));
    const request = app && (app.fields || []).find((field) => /Request Line|Query|Exchange/i.test(field.name));
    return request ? request.value : `${proto} ${event.last} → ${event.at}`;
  }

  function captureVisibleEvents() {
    if (typeof data === 'undefined' || !data || !Array.isArray(data.events)) return [];
    const enabled = typeof enabledFilters === 'function' ? enabledFilters() : new Set();
    const base = captureRows(data.events).map((row) => row.event).filter((event) => enabled.has(event.proto) || enabled.has(event.type));
    const input = document.getElementById('display-filter');
    const source = input ? input.value.trim() : '';
    const result = source ? applyCaptureFilter(base, source) : { events: base, error: '' };
    if (input) {
      input.classList.toggle('invalid', !!result.error);
      input.setAttribute('aria-invalid', result.error ? 'true' : 'false');
    }
    const message = document.getElementById('filter-error');
    if (message) message.textContent = result.error;
    return result.events;
  }

  function narrationFor(event) {
    if (!event) return 'Step through a capture to watch each device make its decision.';
    if (event.status === 'Dropped') return event.reason || event.note || 'The packet was dropped.';
    if (event.note) return event.note;
    const notes = (event.hops || []).map((hop) => hop.note).filter(Boolean);
    return notes.join(' ') || `${event.last} delivers ${eventProtocol(event)} to ${event.at}.`;
  }

  function setNarrationMascot(state) {
    narrationState = state;
    const mascot = document.getElementById('narration-mascot');
    if (!mascot) return;
    const name = state === 'error' ? 'error' : state === 'think' ? 'think' : 'happy';
    mascot.src = NARRATION_MASCOTS[name];
    mascot.alt = `TakumiNet mascot ${name}`;
  }

  function renderNarration(event) {
    const text = document.getElementById('narration-text');
    if (text) text.textContent = narrationFor(event);
    if (event && event.status === 'Dropped') setNarrationMascot('error');
    else setNarrationMascot(narrationState);
  }

  function selectCaptureEvent(id, animate = true) {
    if (typeof data === 'undefined' || !data) return;
    const event = data.events.find((candidate) => candidate.id === id);
    if (!event) return;
    simCursor = event.id;
    narrationState = event.status === 'Dropped' ? 'error' : 'think';
    renderEvents();
    if (animate) {
      animatePath(event.path, eventProtocol(event), () => {
        if (simCursor !== event.id) return;
        narrationState = event.status === 'Dropped' ? 'error' : 'happy';
        renderNarration(event);
      });
    } else {
      narrationState = event.status === 'Dropped' ? 'error' : 'happy';
      renderNarration(event);
    }
    if (typeof sfx === 'function') sfx('addPacketButton');
  }

  function renderCapture() {
    const body = document.getElementById('capture-rows');
    if (!body || typeof data === 'undefined' || !data) return;
    const events = captureVisibleEvents();
    body.replaceChildren();
    for (const event of events) {
      const row = document.createElement('tr');
      row.dataset.eventId = String(event.id);
      row.dataset.protocol = eventProtocol(event);
      row.style.setProperty('--protocol-color', protocolColor(eventProtocol(event)));
      if (event.id === simCursor) row.classList.add('current');
      const values = [
        event.id,
        Number(event.time || 0).toFixed(3),
        event.last,
        event.at,
        eventProtocol(event),
        event.size || 0,
        captureInfo(event),
      ];
      values.forEach((value) => {
        const cell = document.createElement('td');
        cell.textContent = String(value);
        row.appendChild(cell);
      });
      row.addEventListener('click', () => selectCaptureEvent(event.id));
      body.appendChild(row);
    }
    if (!events.length) {
      const row = document.createElement('tr');
      const cell = document.createElement('td');
      cell.colSpan = 7;
      cell.className = 'capture-empty';
      cell.textContent = data.events.length ? 'No packets match the display filter.' : 'No packets captured yet. Send a PDU or run Check my work.';
      row.appendChild(cell);
      body.appendChild(row);
    }
    const count = document.getElementById('capture-count');
    if (count) count.textContent = `${events.length} / ${data.events.length} frames`;
    const selected = data.events.find((event) => event.id === simCursor) || null;
    renderNarration(selected);
    renderPacketDetails(selected);
    renderFlow();
  }

  function wireEngineerView() {
    document.querySelectorAll('[data-engineer-tab]').forEach((button) => {
      button.addEventListener('click', () => {
        document.querySelectorAll('[data-engineer-tab]').forEach((tab) => tab.classList.toggle('active', tab === button));
        const capture = button.dataset.engineerTab === 'capture';
        document.getElementById('capture-view').hidden = !capture;
        document.getElementById('flow-view').hidden = capture;
        if (!capture) renderFlow();
      });
    });
    const filter = document.getElementById('display-filter');
    if (filter) filter.addEventListener('input', renderCapture);
    const save = document.getElementById('save-capture');
    if (save) save.addEventListener('click', () => {
      save.href = '/api/capture/export';
      save.download = `${String(typeof currentName === 'string' ? currentName : 'capture').replace(/[^a-z0-9_-]+/gi, '_')}.pcap`;
    });
  }

  return { PROTOCOL_COLORS, protocolColor, captureInfo, captureVisibleEvents, renderCapture, renderNarration, setNarrationMascot, selectCaptureEvent, wireEngineerView };
});
