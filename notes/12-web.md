# 12 — Simulated HTTP server and browser (`webapp.rs`)

Status: landed 2026-11-01.

## The request path

`POST /api/webfetch?id=pc0&url=192.168.2.20` → `webapp::fetch`:

1. `host_of` strips scheme, port and path, so `http://h/`, `h` and
   `https://h:80/x.html` all resolve to the same host.
2. The host is matched against device addresses (`Device::ip` and every
   `PortCfg::ip`).
3. Only `kind == "server"` answers; anything else is
   `Connection refused by <host> (no HTTP service)`.
4. `Workspace::send_pdu` forwards the request through the real topology, so the
   capture buffer records it; the event's protocol is rewritten to `HTTP`.
5. A missing host or a broken path is `Request timed out`.

The page is our own text, not PT's bundled HTML: `Server0` plus its address.

## UI

Desktop → **Web Browser** opens a window with a URL bar:

```
http:// [192.168.2.20        ] [Go]
200 OK — 192.168.2.20
Server0
Welcome to Server0.
This page is served by the simulated HTTP server at 192.168.2.20.
```

The response is built with DOM calls (`textContent`), never `innerHTML`, so a
device name cannot inject markup.

## Bug found while verifying

`openBrowser` first used `api()`, which assumes every response is a workspace
snapshot and calls `setData(res)`. A page payload has no `devices`, so the
promise rejected and the window stayed on "Connecting…". Fixed by adding
`jsonRequest()` (a plain fetch used by page/CLI-style endpoints) and using it
for `/api/webfetch`.

## Verified

- Vitest-style unit tests: host extraction, cross-router fetch (200, event
  proto `HTTP`, at `Server0`), non-server refusal, unknown host timeout, broken
  path timeout.
- e2e: `e2e_web_browser_fetches_from_the_server` (HTTP 200, refusal, captured
  event).
- Chromium: PC0 → Web Browser → `192.168.2.20` renders `Server0`.

## Not covered yet

- DNS names resolve through the client's configured server; no auth or path routing.
- HTTPS is still on the list.
