'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { bytesFromHex, layerRange, formatByteRows } = require('../../web/js/packet_details.js');

const ipv4 = '00d0ba00000200d0ba000001080045000022000000007f01b8b80a0000010a0000030800000000010001000000000000';

test('wire hex decodes exactly and malformed hex is safe', () => {
  const bytes = bytesFromHex(ipv4);
  assert.equal(bytes.length, 48);
  assert.equal(bytes[12], 0x08);
  assert.equal(bytes[22], 127);
  assert.deepEqual(Array.from(bytesFromHex('not hex')), []);
  assert.deepEqual(Array.from(bytesFromHex('abc')), []);
});

test('details tree layers map to real frame byte ranges', () => {
  const bytes = bytesFromHex(ipv4);
  assert.deepEqual(layerRange('Frame', bytes), [0, bytes.length]);
  assert.deepEqual(layerRange('Ethernet II', bytes), [0, 14]);
  assert.deepEqual(layerRange('IPv4', bytes), [14, 34]);
  assert.deepEqual(layerRange('ICMP', bytes), [34, bytes.length]);
  assert.deepEqual(layerRange('TCP', bytes), [34, bytes.length]);
  const arp = new Uint8Array(42);
  arp[13] = 6;
  assert.deepEqual(layerRange('ARP', arp), [14, 42]);
  assert.deepEqual(layerRange('Unknown', bytes), null);
});

test('hex and ASCII rows retain offsets printable bytes and padding', () => {
  const rows = formatByteRows(Uint8Array.from([65, 0, 66, 255]));
  assert.equal(rows.length, 1);
  assert.equal(rows[0].offset, '0000');
  assert.deepEqual(rows[0].hex, ['41', '00', '42', 'ff']);
  assert.equal(rows[0].ascii, 'A.B.');
  assert.equal(formatByteRows(new Uint8Array(18)).length, 2);
});
