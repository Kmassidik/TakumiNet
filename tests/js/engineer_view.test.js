'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { captureRows, applyCaptureFilter } = require('../../web/js/capture_filter.js');
const { ladder } = require('../../web/js/flow.js');

function packet(id, proto, extra = {}) {
  return {
    id, time: id / 1000, last: 'PC0', at: 'PC3', type: proto, proto,
    size: 74, status: 'Successful', path: ['pc0', 'switch0', 'router0', 'switch1', 'pc3'],
    hops: [
      { id: 'pc0', name: 'PC0', srcIp: '10.0.0.1', dstIp: '10.0.0.3', srcMac: '0254.4b00.0001', dstMac: '0254.4b00.0002', ttl: 128 },
      { id: 'switch0', name: 'Switch0', srcIp: '10.0.0.1', dstIp: '10.0.0.3', srcMac: '0254.4b00.0001', dstMac: '0254.4b00.0002', ttl: 128 },
      { id: 'router0', name: 'Router0', srcIp: '10.0.0.1', dstIp: '10.0.0.3', srcMac: '0254.4b00.0002', dstMac: '0254.4b00.0003', ttl: 127 },
      { id: 'switch1', name: 'Switch1', srcIp: '10.0.0.1', dstIp: '10.0.0.3', srcMac: '0254.4b00.0002', dstMac: '0254.4b00.0003', ttl: 127 },
      { id: 'pc3', name: 'PC3', srcIp: '10.0.0.1', dstIp: '10.0.0.3', srcMac: '0254.4b00.0002', dstMac: '0254.4b00.0003', ttl: 127 },
    ],
    ...extra,
  };
}

test('L24b capture rows preserve every engine event exactly once in time order', () => {
  const events = [packet(3, 'ICMP'), packet(1, 'ARP'), packet(2, 'TCP')];
  const rows = captureRows(events);
  assert.deepEqual(rows.map((row) => row.event.id), [1, 2, 3]);
  assert.deepEqual(rows.map((row) => row.event), events.slice().sort((a, b) => a.time - b.time));
});

test('capture grammar matches protocols addresses MACs TTL and application layers', () => {
  const events = [packet(1, 'ARP'), packet(2, 'ICMP'), packet(3, 'HTTP', { layers: [{ name: 'HTTP', fields: [] }] })];
  assert.deepEqual(applyCaptureFilter(events, 'icmp').events.map((e) => e.id), [2]);
  assert.deepEqual(applyCaptureFilter(events, 'arp || http').events.map((e) => e.id), [1, 3]);
  assert.deepEqual(applyCaptureFilter(events, 'ip.src == 10.0.0.1 && ip.dst == 10.0.0.3').events.map((e) => e.id), [1, 2, 3]);
  assert.deepEqual(applyCaptureFilter(events, 'eth.addr == 0254.4b00.0003 && ttl < 128').events.map((e) => e.id), [1, 2, 3]);
  assert.deepEqual(applyCaptureFilter(events, '!arp && !(http || udp)').events.map((e) => e.id), [2]);
});

test('L25b conjunction equals intersection over generated packets and filters', () => {
  const filters = ['icmp', 'arp', 'tcp', 'udp', 'http', 'dns', 'dhcp', 'ip.src == 10.0.0.1', 'ip.dst == 10.0.0.9', 'eth.addr == 0254.4b00.0002', 'ttl < 128', 'ttl >= 127', '!arp'];
  const protocols = ['ICMP', 'ARP', 'TCP', 'UDP', 'HTTP', 'DNS', 'DHCP'];
  const events = Array.from({ length: 70 }, (_, i) => packet(i + 1, protocols[i % protocols.length], {
    hops: [
      { srcIp: i % 2 ? '10.0.0.1' : '10.0.0.2', dstIp: i % 3 ? '10.0.0.3' : '10.0.0.9', srcMac: '0254.4b00.0002', dstMac: '0254.4b00.0003', ttl: i % 4 ? 127 : 128 },
    ],
  }));
  for (const a of filters) for (const b of filters) {
    const both = applyCaptureFilter(events, `${a} && ${b}`);
    assert.equal(both.error, '', `${a} && ${b}: ${both.error}`);
    const left = new Set(applyCaptureFilter(events, a).events.map((e) => e.id));
    const expected = applyCaptureFilter(events, b).events.filter((e) => left.has(e.id)).map((e) => e.id);
    assert.deepEqual(both.events.map((e) => e.id), expected, `${a} && ${b}`);
  }
});

test('invalid filters return safe readable errors and never throw', () => {
  const events = [packet(1, 'ICMP')];
  for (const source of ['', '   ', 'icmp &&', 'ip.src = 10.0.0.1', 'ttl < nope', '(icmp', 'icmp || || arp', 'bogus == 4', '!']) {
    const result = applyCaptureFilter(events, source);
    assert.equal(result.events.length, 1, source);
    assert.ok(result.error.length > 0, source);
  }
});

test('L28 T4 ladder has five path-ordered lanes and one arrow per inter-device hop', () => {
  const first = packet(1, 'ICMP');
  const second = packet(2, 'ICMP', { last: 'PC3', at: 'PC0', path: [...first.path].reverse(), hops: [...first.hops].reverse() });
  const graph = ladder([first, second]);
  assert.deepEqual(graph.lanes.map((lane) => lane.id), first.path);
  assert.equal(graph.arrows.length, 8);
  assert.deepEqual(graph.arrows.slice(0, 4).map((arrow) => [arrow.from, arrow.to, arrow.eventId]), [
    ['pc0', 'switch0', 1], ['switch0', 'router0', 1], ['router0', 'switch1', 1], ['switch1', 'pc3', 1],
  ]);
  assert.ok(graph.arrows.every((arrow) => Number.isFinite(arrow.ttl) && arrow.info.includes('ICMP')));
});
