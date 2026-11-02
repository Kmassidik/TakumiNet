# 22 — Original device artwork

Status: landed 2026-11-01.

## Why

The canvas used Cisco's shipped logical icons from the mounted asset tree. That
is fine for analysis but not for shipping: the app must have its own art.

## What shipped

21 original SVGs under `web/art/`, one per logical device kind:

`router, switch, hub, ap, wlc, asa, homerouter, pc, laptop, server, printer,
phone, analogphone, tv, pda, tablet, cloud, sniffer, plc, thing, ioe`

- 32×32 viewBox, `fill="none"`, `stroke="currentColor"`, `stroke-width="2"`,
  round caps — so an icon inherits the theme colour and stays readable at 32 px.
- No scripts, no external `href`/`url()` references, no background fill.
- Total 7,166 bytes; `web/art/README.md` lists each file and states the artwork
  is original to this project.

## Wiring

- `http.rs` serves `GET /art/<name>.svg` from `web/art` with a name check
  (`.svg`, no `/`, no `..`); a traversal attempt returns `not found`.
- `workspace::logical_icon` now returns `/art/<kind>.svg` for the 21 kinds.
  Kinds without original art yet (`linksys`, `cablemodem`, `dsl`, `multiuser`,
  `celltower`, `ie2000`, `netcontroller`, `meraki`, `historian`, `patchpanel`)
  still point at the mounted tree.
- `asset()` in the UI passes absolute paths through instead of prefixing
  `/assets`, so both sources coexist.

## Verified

- `curl /art/router.svg` → 200 `image/svg+xml`.
- Canvas images now resolve to `/art/router.svg`, `/art/switch.svg`,
  `/art/pc.svg`, `/art/server.svg` (7 devices checked).
- Unit test `catalog_icons_exist_in_extracted_tree` now validates own-art paths
  against `web/art` and mounted paths against the asset tree.

## Not yet

Per-model variants (all 2911/1941/… currently share the router icon), physical
views, and any sound/toolbar art remain on the list.
