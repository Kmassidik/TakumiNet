(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) Object.assign(root, api);
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  function ladder(events) {
    const lanes = [];
    const laneById = new Map();
    const arrows = [];

    for (const event of Array.isArray(events) ? events : []) {
      if (!event || typeof event !== 'object') continue;
      const hops = Array.isArray(event.hops) ? event.hops : [];
      const hopById = new Map();
      for (const hop of hops) {
        if (hop && hop.id != null) hopById.set(String(hop.id), hop);
      }
      const path = Array.isArray(event.path) && event.path.length
        ? event.path.map(String)
        : hops.filter((hop) => hop && hop.id != null).map((hop) => String(hop.id));

      for (const id of path) {
        if (laneById.has(id)) continue;
        const hop = hopById.get(id);
        const lane = { id, name: hop && hop.name ? String(hop.name) : id };
        laneById.set(id, lane);
        lanes.push(lane);
      }

      for (let i = 0; i + 1 < path.length; i += 1) {
        const from = path[i];
        const to = path[i + 1];
        const hop = hopById.get(to) || hopById.get(from) || hops[i + 1] || hops[i] || {};
        const parsedTtl = Number(hop.ttl);
        const ttl = Number.isFinite(parsedTtl) ? parsedTtl : 0;
        const protocol = event.type || event.proto || 'PDU';
        const source = event.last || (laneById.get(from) || {}).name || from;
        const destination = event.at || (laneById.get(to) || {}).name || to;
        const details = [`${protocol} ${source} → ${destination}`, `TTL: ${ttl}`];
        if (event.status) details.push(String(event.status));
        arrows.push({ eventId: event.id, from, to, ttl, info: details.join(' · ') });
      }
    }

    return { lanes, arrows };
  }

  function renderFlow() {
    const svg = document.getElementById('flow-graph');
    if (!svg || typeof data === 'undefined' || !data) return;
    const graph = ladder(captureVisibleEvents());
    const width = Math.max(640, 160 + graph.lanes.length * 150);
    const height = Math.max(130, 70 + graph.arrows.length * 42);
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    svg.replaceChildren();
    const defs = node('defs', {});
    const marker = node('marker', { id: 'flow-arrowhead', markerWidth: 8, markerHeight: 8, refX: 7, refY: 3, orient: 'auto', markerUnits: 'strokeWidth' });
    marker.appendChild(node('path', { d: 'M0,0 L0,6 L7,3 z', fill: 'context-stroke' }));
    defs.appendChild(marker);
    svg.appendChild(defs);
    const positions = new Map(graph.lanes.map((lane, index) => [lane.id, 80 + index * 150]));
    graph.lanes.forEach((lane) => {
      const x = positions.get(lane.id);
      const device = data.devices.find((candidate) => candidate.id === lane.id);
      const label = node('text', { x, y: 20, class: 'flow-lane-label', 'text-anchor': 'middle' });
      label.textContent = device ? device.name : lane.id;
      svg.appendChild(label);
      svg.appendChild(node('line', { x1: x, y1: 32, x2: x, y2: height - 16, class: 'flow-lane' }));
    });
    graph.arrows.forEach((arrow, index) => {
      const group = node('g', { class: 'flow-arrow', tabindex: 0, role: 'button', 'data-event-id': arrow.eventId });
      const y = 54 + index * 42;
      const x1 = positions.get(arrow.from);
      const x2 = positions.get(arrow.to);
      if (!Number.isFinite(x1) || !Number.isFinite(x2)) return;
      const color = protocolColor((data.events.find((event) => event.id === arrow.eventId) || {}).proto);
      group.appendChild(node('line', { x1, y1: y, x2, y2: y, stroke: color, 'marker-end': 'url(#flow-arrowhead)' }));
      const label = node('text', { x: (x1 + x2) / 2, y: y - 7, class: 'flow-arrow-label', 'text-anchor': 'middle' });
      label.textContent = arrow.info;
      group.appendChild(label);
      const choose = () => selectCaptureEvent(arrow.eventId);
      group.addEventListener('click', choose);
      group.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); choose(); }
      });
      svg.appendChild(group);
    });
  }

  return { ladder, renderFlow };
});
