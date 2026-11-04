/* Raw WebAssembly engine: no framework, bindings generator, or server session. */
(function (root) {
  'use strict';

  function create(options = {}) {
    const nativeFetch = options.nativeFetch || root.fetch.bind(root);
    const storage = options.storage || (() => { try { return root.localStorage; } catch (_) { return null; } })();
    const wasmUrl = options.wasmUrl || '/engine.wasm';
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();
    let exports = null;
    let mode = 'loading';
    let coldStartMs = null;

    async function readWithProgress(response) {
      if (!response.body || typeof response.body.getReader !== 'function') return response.arrayBuffer();
      const total = Number(response.headers.get('content-length')) || 0;
      const reader = response.body.getReader();
      const chunks = [];
      let loaded = 0;
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
        loaded += value.byteLength;
        if (root.dispatchEvent && typeof root.CustomEvent === 'function') {
          root.dispatchEvent(new root.CustomEvent('engine-progress', { detail: { loaded, total } }));
        }
      }
      const out = new Uint8Array(loaded);
      let offset = 0;
      for (const chunk of chunks) {
        out.set(chunk, offset);
        offset += chunk.byteLength;
      }
      return out.buffer;
    }

    const ready = (async () => {
      const started = performance.now();
      try {
        const response = await nativeFetch(wasmUrl);
        if (!response.ok) throw new Error('engine unavailable');
        const bytes = await readWithProgress(response);
        const result = await root.WebAssembly.instantiate(bytes, {});
        exports = result.instance.exports;
        coldStartMs = performance.now() - started;
        mode = 'wasm';
        return true;
      } catch (_) {
        mode = 'server';
        return false;
      }
    })();

    function bytes(value) {
      if (value == null) return new Uint8Array();
      if (typeof value === 'string') return encoder.encode(value);
      if (value instanceof ArrayBuffer) return new Uint8Array(value);
      if (ArrayBuffer.isView(value)) return new Uint8Array(value.buffer, value.byteOffset, value.byteLength);
      return encoder.encode(String(value));
    }

    function response(type, body, status = 200) {
      return new Response(body, { status, headers: { 'Content-Type': type } });
    }

    function call(method, target, body) {
      const methodBytes = encoder.encode(method);
      const targetBytes = encoder.encode(target);
      const bodyBytes = bytes(body);
      const input = new Uint8Array(8 + methodBytes.length + targetBytes.length + bodyBytes.length);
      const header = new DataView(input.buffer);
      header.setUint16(0, methodBytes.length, true);
      header.setUint16(2, targetBytes.length, true);
      header.setUint32(4, bodyBytes.length, true);
      input.set(methodBytes, 8);
      input.set(targetBytes, 8 + methodBytes.length);
      input.set(bodyBytes, 8 + methodBytes.length + targetBytes.length);
      const inputPointer = exports.alloc(input.length);
      new Uint8Array(exports.memory.buffer, inputPointer, input.length).set(input);
      let outputPointer;
      try {
        outputPointer = exports.handle(inputPointer, input.length);
      } finally {
        exports.dealloc(inputPointer, input.length);
      }
      const outputHeader = new DataView(exports.memory.buffer, outputPointer, 8);
      const status = outputHeader.getUint16(0, true);
      const typeLength = outputHeader.getUint16(2, true);
      const bodyLength = outputHeader.getUint32(4, true);
      const total = 8 + typeLength + bodyLength;
      const output = new Uint8Array(exports.memory.buffer, outputPointer, total);
      const type = decoder.decode(output.slice(8, 8 + typeLength));
      const responseBody = output.slice(8 + typeLength);
      exports.dealloc(outputPointer, total);
      return response(type, responseBody, status);
    }

    const savePrefix = 'pt-web:saved:';
    const cleanName = (name) => String(name || '').replace(/[^a-z0-9_-]/gi, '_') || 'untitled';
    async function browserRoute(method, target) {
      const url = new URL(target, 'http://takuminet.local');
      if (!['/api/save', '/api/load', '/api/saves'].includes(url.pathname)) return null;
      if (!storage) return response('application/json', '{"error":"browser storage unavailable"}');
      if (url.pathname === '/api/saves' && method === 'GET') {
        const names = [];
        for (let i = 0; i < storage.length; i++) {
          const key = storage.key(i);
          if (key && key.startsWith(savePrefix)) names.push(key.slice(savePrefix.length));
        }
        names.sort();
        return response('application/json', `{"names":[${names.map(JSON.stringify).join(',')}]}`);
      }
      if (url.pathname === '/api/save' && method === 'POST') {
        const exported = call('GET', '/api/export', new Uint8Array());
        if (!exported.ok) return exported;
        const name = cleanName(url.searchParams.get('name'));
        try { storage.setItem(savePrefix + name, await exported.text()); }
        catch (error) { return response('application/json', JSON.stringify({ error: `save failed: ${error.message}` })); }
        return call('GET', '/api/workspace', new Uint8Array());
      }
      if (url.pathname === '/api/load' && method === 'POST') {
        const name = cleanName(url.searchParams.get('name'));
        const saved = storage.getItem(savePrefix + name);
        if (saved === null) return response('application/json', '{"error":"no such topology"}');
        return call('POST', '/api/import' + url.search, saved);
      }
      return null;
    }

    async function fetch(input, init = {}) {
      const originalUrl = typeof input === 'string' ? input : input.url;
      const url = new URL(originalUrl, root.location ? root.location.href : 'http://takuminet.local');
      if (!url.pathname.startsWith('/api/')) return nativeFetch(input, init);
      if (!await ready) return nativeFetch(input, init);
      const method = (init.method || (typeof input === 'object' && input.method) || 'GET').toUpperCase();
      let body = init.body;
      if (body == null && typeof input === 'object' && !['GET', 'HEAD'].includes(method)) {
        body = await input.arrayBuffer();
      }
      const target = url.pathname + url.search;
      const browser = await browserRoute(method, target);
      return browser || call(method, target, body);
    }

    return {
      fetch,
      ready,
      get mode() { return mode; },
      get coldStartMs() { return coldStartMs; },
    };
  }

  const api = { create };
  if (root.window === root && typeof root.fetch === 'function') {
    api.default = create();
    root.fetch = api.default.fetch;
    Object.defineProperties(api, {
      ready: { get: () => api.default.ready },
      mode: { get: () => api.default.mode },
      coldStartMs: { get: () => api.default.coldStartMs },
    });
  }
  root.TakumiEngine = api;
})(typeof window !== 'undefined' ? window : globalThis);
