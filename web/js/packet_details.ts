/* Selected capture: expandable decoded fields and real wire bytes. */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  Object.assign(root, api);
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  function bytesFromHex(hex) {
    if (typeof hex !== 'string' || hex.length % 2 || /[^0-9a-f]/i.test(hex)) return new Uint8Array();
    const out = new Uint8Array(hex.length / 2);
    for (let i = 0; i < out.length; i += 1) out[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
    return out;
  }

  function layerRange(name, bytes) {
    const length = bytes.length;
    if (!length) return null;
    if (name === 'Frame') return [0, length];
    if (name === 'Ethernet II') return [0, Math.min(14, length)];
    if (name === 'ARP') return length >= 42 ? [14, 42] : null;
    if (name === 'IPv4') return length >= 34 ? [14, 34] : null;
    if (name === 'ICMP') return length > 34 ? [34, length] : null;
    if (name === 'TCP') {
      if (length <= 34) return null;
      const header = Math.max(20, (bytes[46] >> 4) * 4);
      return [34, Math.min(length, 34 + header)];
    }
    if (name === 'UDP') return length >= 42 ? [34, 42] : null;
    if (name === 'HTTP' || name === 'DNS' || name === 'DHCP' || name === 'Application') {
      if (length <= 34) return null;
      if (name === 'HTTP' && length > 46) return [34 + Math.max(20, (bytes[46] >> 4) * 4), length];
      if ((name === 'DNS' || name === 'DHCP') && length >= 42) return [42, length];
      return [34, length];
    }
    return null;
  }

  function formatByteRows(bytes) {
    const rows = [];
    for (let at = 0; at < bytes.length; at += 16) {
      const slice = Array.from(bytes.slice(at, at + 16));
      rows.push({
        offset: at.toString(16).padStart(4, '0'),
        hex: slice.map((byte) => byte.toString(16).padStart(2, '0')),
        ascii: slice.map((byte) => byte >= 32 && byte <= 126 ? String.fromCharCode(byte) : '.').join(''),
      });
    }
    return rows;
  }

  let detailEventId = -1;
  let detailBytes = new Uint8Array();
  let selectedRange = null;
  let requestSerial = 0;

  function renderBytes() {
    const pane = document.getElementById('packet-bytes');
    if (!pane) return;
    pane.replaceChildren();
    if (!detailBytes.length) {
      pane.textContent = detailEventId < 0 ? 'Select a captured frame to inspect its bytes.' : 'No wire frame is stored for this control-plane event.';
      return;
    }
    for (const row of formatByteRows(detailBytes)) {
      const line = document.createElement('div');
      line.className = 'byte-row';
      const offset = document.createElement('span');
      offset.className = 'byte-offset';
      offset.textContent = row.offset;
      line.appendChild(offset);
      const hex = document.createElement('span');
      hex.className = 'byte-hex';
      row.hex.forEach((value, index) => {
        const byte = document.createElement('span');
        const at = parseInt(row.offset, 16) + index;
        byte.textContent = value;
        if (selectedRange && at >= selectedRange[0] && at < selectedRange[1]) byte.className = 'byte-selected';
        hex.appendChild(byte);
        if (index === 7) hex.appendChild(document.createTextNode(' '));
      });
      line.appendChild(hex);
      const ascii = document.createElement('span');
      ascii.className = 'byte-ascii';
      ascii.textContent = row.ascii;
      line.appendChild(ascii);
      pane.appendChild(line);
    }
  }

  function highlightByteRange(range) {
    selectedRange = range;
    renderBytes();
  }

  function appendTreeSection(parent, name, fields, bytes, open) {
    const range = layerRange(name, bytes);
    const section = document.createElement('details');
    section.className = 'detail-layer';
    section.open = open;
    const summary = document.createElement('summary');
    summary.textContent = name;
    if (range) {
      summary.title = `Bytes ${range[0]}–${range[1] - 1}`;
      summary.addEventListener('click', () => highlightByteRange(range));
    }
    section.appendChild(summary);
    const list = document.createElement('div');
    list.className = 'detail-fields';
    for (const field of fields) {
      const row = document.createElement('div');
      const label = document.createElement('span');
      label.textContent = field.name;
      const value = document.createElement('strong');
      value.textContent = field.value;
      row.appendChild(label);
      row.appendChild(value);
      list.appendChild(row);
    }
    section.appendChild(list);
    parent.appendChild(section);
  }

  function renderDetailTree(event) {
    const tree = document.getElementById('packet-details');
    if (!tree) return;
    tree.replaceChildren();
    if (!event) {
      tree.textContent = 'Select a packet in Capture or Flow.';
      return;
    }
    appendTreeSection(tree, 'Frame', [
      { name: 'Capture id', value: String(event.id) },
      { name: 'Arrival time', value: `${Number(event.time || 0).toFixed(3)} s` },
      { name: 'Frame length', value: `${event.size || detailBytes.length} bytes` },
      { name: 'Status', value: event.status || 'Successful' },
    ], detailBytes, true);
    const hop = event.hops && event.hops.length ? event.hops[event.hops.length - 1] : null;
    const layers = hop && hop.layers && hop.layers.length ? hop.layers : (event.layers || []);
    layers.forEach((layer, index) => appendTreeSection(tree, layer.name, layer.fields || [], detailBytes, index < 2));
    if (!layers.length) {
      const note = document.createElement('p');
      note.className = 'detail-empty';
      note.textContent = event.reason || 'No decoded fields were recorded.';
      tree.appendChild(note);
    }
  }

  async function renderPacketDetails(event) {
    const id = event ? event.id : -1;
    if (id === detailEventId) {
      renderDetailTree(event);
      return;
    }
    detailEventId = id;
    detailBytes = new Uint8Array();
    selectedRange = null;
    renderDetailTree(event);
    renderBytes();
    if (!event) return;
    const serial = ++requestSerial;
    const pane = document.getElementById('packet-bytes');
    if (pane) pane.textContent = 'Loading wire bytes…';
    const response = await getJson(`/api/capture/bytes?id=${encodeURIComponent(event.id)}`);
    if (serial !== requestSerial || detailEventId !== id) return;
    if (response.error) {
      detailBytes = new Uint8Array();
      if (pane) pane.textContent = response.error;
      return;
    }
    detailBytes = bytesFromHex(response.hex || '');
    selectedRange = layerRange('Frame', detailBytes);
    renderDetailTree(event);
    renderBytes();
  }

  function resetPacketDetails() {
    detailEventId = -1;
    detailBytes = new Uint8Array();
    selectedRange = null;
    requestSerial += 1;
  }

  return { bytesFromHex, layerRange, formatByteRows, renderPacketDetails, highlightByteRange, resetPacketDetails };
});
