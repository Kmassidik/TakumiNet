'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const source = fs.readFileSync(require('node:path').resolve(__dirname, '../../web/js/engine.js'), 'utf8');

function load(WebAssembly, nativeFetch, storage = {}) {
  const context = vm.createContext({ WebAssembly, Response, TextEncoder, TextDecoder, Uint8Array, DataView, ArrayBuffer, URL, performance, console });
  vm.runInContext(source, context);
  return context.TakumiEngine.create({ nativeFetch, storage, wasmUrl: '/engine.wasm' });
}

function mockWasm(onRequest) {
  const memory = new WebAssembly.Memory({ initial: 1 });
  let next = 1024;
  const freed = [];
  return {
    freed,
    async instantiate() {
      return { instance: { exports: {
        memory,
        alloc(length) { const pointer = next; next += length + 16; return pointer; },
        dealloc(pointer, length) { freed.push([pointer, length]); },
        handle(pointer, length) {
          const request = new Uint8Array(memory.buffer, pointer, length);
          const view = new DataView(memory.buffer, pointer, length);
          const methodLength = view.getUint16(0, true);
          const targetLength = view.getUint16(2, true);
          const bodyLength = view.getUint32(4, true);
          const method = new TextDecoder().decode(request.slice(8, 8 + methodLength));
          const targetStart = 8 + methodLength;
          const target = new TextDecoder().decode(request.slice(targetStart, targetStart + targetLength));
          const body = request.slice(targetStart + targetLength, targetStart + targetLength + bodyLength);
          const result = onRequest(method, target, body);
          const type = new TextEncoder().encode(result.type || 'application/json');
          const responseBody = typeof result.body === 'string' ? new TextEncoder().encode(result.body) : result.body;
          const output = next;
          const total = 8 + type.length + responseBody.length;
          next += total + 16;
          const out = new DataView(memory.buffer, output, total);
          out.setUint16(0, result.status || 200, true);
          out.setUint16(2, type.length, true);
          out.setUint32(4, responseBody.length, true);
          new Uint8Array(memory.buffer, output + 8, type.length).set(type);
          new Uint8Array(memory.buffer, output + 8 + type.length, responseBody.length).set(responseBody);
          return output;
        },
      } } };
    },
  };
}

test('raw loader preserves method, target and body and frees both allocations', async () => {
  let seen;
  const wasm = mockWasm((method, target, body) => {
    seen = { method, target, body: new TextDecoder().decode(body) };
    return { body: '{"ok":true}' };
  });
  const nativeFetch = async () => new Response(new Uint8Array([0, 97, 115, 109]));
  const engine = load(wasm, nativeFetch);
  const response = await engine.fetch('/api/import?openAnyway=true', { method: 'POST', body: '<takumi/>' });
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('content-type'), 'application/json');
  assert.deepEqual(await response.json(), { ok: true });
  assert.equal(seen.method, 'POST');
  assert.equal(seen.target, '/api/import?openAnyway=true');
  assert.equal(seen.body, '<takumi/>');
  assert.equal(wasm.freed.length, 2);
  assert.equal(engine.mode, 'wasm');
});

test('loader falls back only when WASM initialization fails', async () => {
  const calls = [];
  const nativeFetch = async (input) => {
    calls.push(String(input));
    if (String(input) === '/engine.wasm') throw new Error('missing wasm');
    return new Response('{"native":true}', { headers: { 'Content-Type': 'application/json' } });
  };
  const engine = load({}, nativeFetch);
  const response = await engine.fetch('/api/workspace');
  assert.deepEqual(await response.json(), { native: true });
  assert.equal(engine.mode, 'server');
  assert.deepEqual(calls, ['/engine.wasm', '/api/workspace']);
});

test('on a phone the engine is never downloaded', async () => {
  const fetched = [];
  const context = vm.createContext({ WebAssembly, Response, TextEncoder, TextDecoder, Uint8Array, DataView, ArrayBuffer, URL, performance, console, isPhoneScreen: () => true });
  vm.runInContext(source, context);
  const engine = context.TakumiEngine.create({ nativeFetch: async (url) => { fetched.push(url); return new Response(''); }, storage: {}, wasmUrl: '/engine.wasm' });
  assert.equal(await engine.ready, false);
  assert.deepEqual(fetched, []);
  assert.equal(engine.mode, 'server');
});

test('on a normal screen the engine still downloads', async () => {
  const fetched = [];
  const context = vm.createContext({ WebAssembly, Response, TextEncoder, TextDecoder, Uint8Array, DataView, ArrayBuffer, URL, performance, console, isPhoneScreen: () => false });
  vm.runInContext(source, context);
  const engine = context.TakumiEngine.create({ nativeFetch: async (url) => { fetched.push(url); return new Response('', { status: 404 }); }, storage: {}, wasmUrl: '/engine.wasm' });
  await engine.ready;
  assert.deepEqual(fetched, ['/engine.wasm']);
});
