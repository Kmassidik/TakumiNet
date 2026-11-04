'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '../..');
const source = fs.readFileSync(path.join(root, 'web/sw.js'), 'utf8');
const origin = 'https://takumi.test';

function filesUnder(directory, extension) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const filename = path.join(directory, entry.name);
    if (entry.isDirectory()) return filesUnder(filename, extension);
    return entry.isFile() && entry.name.endsWith(extension) ? [filename] : [];
  });
}

function requestKey(input) {
  return new URL(typeof input === 'string' ? input : input.url, origin).href;
}

function makeResponse(body) {
  return {
    body,
    ok: true,
    status: 200,
    cloneCount: 0,
    clone() {
      this.cloneCount += 1;
      return { body, ok: true, status: 200, clone() { return this; } };
    },
  };
}

function loadWorker() {
  const listeners = {};
  const stored = new Map();
  const opened = [];
  const puts = [];
  const deleted = [];
  const nativeFetches = [];
  const cacheNames = new Set(['TakumiNet-v1']);
  let skips = 0;
  let claims = 0;
  let matches = 0;
  let fetchImpl = async () => { throw new Error('offline'); };

  const cache = {
    additions: [],
    async addAll(urls) {
      this.additions.push(Array.from(urls));
      for (const url of urls) stored.set(requestKey(url), makeResponse(`precache:${url}`));
    },
    async match(request) {
      matches += 1;
      return stored.get(requestKey(request));
    },
    async put(request, response) {
      puts.push({ key: requestKey(request), response });
      stored.set(requestKey(request), response);
    },
  };
  const self = {
    location: { origin },
    clients: { async claim() { claims += 1; } },
    addEventListener(type, listener) { listeners[type] = listener; },
    async skipWaiting() { skips += 1; },
  };
  const context = vm.createContext({
    self,
    URL,
    caches: {
      async open(name) { opened.push(name); return cache; },
      async keys() { return Array.from(cacheNames); },
      async delete(name) { deleted.push(name); cacheNames.delete(name); return true; },
    },
    fetch: async (request) => {
      nativeFetches.push(request);
      return fetchImpl(request);
    },
  });
  vm.runInContext(source, context, { filename: 'web/sw.js' });
  vm.runInContext('globalThis.workerTest = { cacheName: CACHE_NAME, urls: PRECACHE_URLS };', context);

  return {
    listeners,
    stored,
    opened,
    puts,
    deleted,
    nativeFetches,
    cacheNames,
    cache,
    urls: Array.from(context.workerTest.urls),
    cacheName: context.workerTest.cacheName,
    setFetch(impl) { fetchImpl = impl; },
    get skips() { return skips; },
    get claims() { return claims; },
    get matches() { return matches; },
    dispatch(request) {
      let response;
      listeners.fetch({ request, respondWith(value) { response = Promise.resolve(value); } });
      return response;
    },
  };
}

function getRequest(pathname, options = {}) {
  return {
    url: new URL(pathname, origin).href,
    method: options.method || 'GET',
    mode: options.mode || 'same-origin',
  };
}

test('precache manifest contains every production file and no documentation assets', () => {
  const worker = loadWorker();
  const expected = ['/', '/workspace', '/about', '/tokens.css', '/landing.css', '/workspace.css', '/engine.wasm'];
  for (const filename of fs.readdirSync(path.join(root, 'web/js'))) {
    if (filename.endsWith('.js')) expected.push(`/js/${filename}`);
  }
  if (!expected.includes('/js/engine.js')) expected.push('/js/engine.js');
  for (const filename of filesUnder(path.join(root, 'web/art/3d'), '.webp')) {
    expected.push(`/art3d/${path.relative(path.join(root, 'web/art/3d'), filename).split(path.sep).join('/')}`);
  }
  for (const filename of fs.readdirSync(path.join(root, 'web/sounds'))) {
    if (filename.endsWith('.wav')) expected.push(`/sounds/${filename}`);
  }
  expected.push('/landing/takumi.glb'); // the landing page's 3D Takumi
  for (const filename of fs.readdirSync(path.join(root, 'web/templates'))) {
    if (filename.endsWith('.xml')) expected.push(`/templates/${filename}`);
  }
  expected.sort();

  assert.deepEqual(worker.urls.slice().sort(), expected);
  assert.equal(new Set(worker.urls).size, worker.urls.length);
  assert.equal(worker.urls.some((url) => /(?:\.md|MANIFEST\.json)$/i.test(url)), false);
});

test('every static HTML asset is present in the precache manifest', () => {
  const worker = loadWorker();
  const html = fs.readFileSync(path.join(root, 'web/index.html'), 'utf8');
  const urls = Array.from(html.matchAll(/(?:src|href)="(\/[^"]+)"/g), (match) => match[1])
    .filter((url) => !url.startsWith('/api/'));
  for (const url of urls) assert.ok(worker.urls.includes(url), `${url} is not precached`);
});

test('install precaches the complete manifest and activates immediately', async () => {
  const worker = loadWorker();
  let pending;
  worker.listeners.install({ waitUntil(value) { pending = Promise.resolve(value); } });
  await pending;

  assert.equal(worker.opened[0], 'TakumiNet-v1');
  assert.deepEqual(worker.cache.additions, [worker.urls]);
  assert.equal(worker.stored.size, worker.urls.length);
  assert.equal(worker.skips, 1);
});

test('activate deletes only old TakumiNet caches and claims clients', async () => {
  const worker = loadWorker();
  worker.cacheNames.add('TakumiNet-v0');
  worker.cacheNames.add('TakumiNet-old');
  worker.cacheNames.add('another-app-v1');
  let pending;
  worker.listeners.activate({ waitUntil(value) { pending = Promise.resolve(value); } });
  await pending;

  assert.deepEqual(worker.deleted.sort(), ['TakumiNet-old', 'TakumiNet-v0']);
  assert.deepEqual(Array.from(worker.cacheNames).sort(), ['TakumiNet-v1', 'another-app-v1']);
  assert.equal(worker.claims, 1);
});

test('a reachable network answer wins over a stale cached copy and refreshes the cache', async () => {
  const worker = loadWorker();
  const request = getRequest('/js/simulation.js');
  worker.stored.set(requestKey(request), makeResponse('stale simulation.js'));
  const fresh = makeResponse('fresh simulation.js');
  worker.setFetch(async () => fresh);

  const response = await worker.dispatch(request);
  assert.equal(await response, fresh);
  assert.equal(worker.puts.length, 1);
});

test('offline falls back to the cached copy', async () => {
  const worker = loadWorker();
  const request = getRequest('/workspace.css');
  const cached = makeResponse('cached css');
  worker.stored.set(requestKey(request), cached);
  worker.setFetch(async () => { throw new Error('offline'); });

  const response = await worker.dispatch(request);
  assert.equal(await response, cached);
});

test('same-origin cache misses are fetched and cached for offline reuse', async () => {
  const worker = loadWorker();
  const request = getRequest('/js/main.js');
  const fetched = makeResponse('application javascript');
  worker.setFetch(async () => fetched);

  const response = await worker.dispatch(request);
  assert.equal(await response, fetched);
  assert.equal(worker.nativeFetches[0], request);
  assert.equal(fetched.cloneCount, 1);
  assert.equal(worker.puts.length, 1);
  assert.equal(worker.puts[0].key, request.url);
  assert.notEqual(worker.puts[0].response, fetched);
  assert.equal(worker.stored.get(request.url), worker.puts[0].response);
});

test('an offline navigation falls back to the cached application shell', async () => {
  const worker = loadWorker();
  const shell = makeResponse('application shell');
  worker.stored.set(requestKey('/'), shell);
  worker.setFetch(async () => { throw new Error('offline'); });

  const response = await worker.dispatch(getRequest('/labs/routing', { mode: 'navigate' }));
  assert.equal(await response, shell);
});

test('offline non-navigation misses preserve the network failure', async () => {
  const worker = loadWorker();
  worker.setFetch(async () => { throw new Error('offline'); });
  const response = worker.dispatch(getRequest('/missing.png'));
  await assert.rejects(response, /offline/);
});

test('API, non-GET, and cross-origin requests bypass the cache', async () => {
  const worker = loadWorker();
  worker.stored.set(requestKey('/api/workspace'), makeResponse('stale API response'));
  const requests = [
    getRequest('/api/workspace'),
    getRequest('/api/templates/open', { method: 'POST' }),
    getRequest('/workspace.css', { method: 'POST' }),
    getRequest('https://cdn.example/asset.js'),
  ];

  for (const request of requests) {
    assert.equal(await worker.dispatch(request), undefined);
  }
  assert.equal(worker.matches, 0);
  assert.equal(worker.nativeFetches.length, 0);
  assert.equal(worker.puts.length, 0);
});
