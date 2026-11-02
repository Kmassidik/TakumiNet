# 15 — Native `.ptw` save format coverage

Status: landed 2026-11-01.

## Why

`to_ptw` wrote only `device` and `link` lines. Gateway, DNS, IPv6, 802.1X,
routes, port state, DHCP, banners and line passwords were lost on save/load.

## Format (tab separated, line oriented)

```
device   id kind model x y name ip prefix
net      id gateway dns
route    id network prefix via
port     id name up ip prefix
v6       id auto addr prefix gateway dns
dot1x    id enabled user pass
link     a a_port b b_port kind
pool     id network prefix gateway dns
dhcpclient id
banner   id text
linepw   id password
```

Rules that keep the file stable:

- Device/port/route lines are emitted in device order; map-backed records
  (`pool`, `dhcpclient`, `banner`, `linepw`) are sorted by id, so the same
  workspace always serializes to the same bytes.
- `port` lines are only written when they differ from the defaults (address
  set or administratively down).
- `link` keeps a 5-column form for old files (defaults to `eCopper`); new files
  add the cable kind as the sixth field.
- Banner and password text escapes `\`, tab and newline.

## Verified

`ptw_round_trip_covers_every_edited_field` builds a workspace with every one of
those fields edited, serializes, re-parses, and asserts:

- `back.to_ptw() == text` (idempotent, byte-identical),
- gateway/DNS/IPv6/802.1X survive,
- the shut Gigabit interface stays shut,
- the route, DHCP pool, DHCP client, banner (`authorised\naccess only`) and line
  password survive,
- the console link still reports `RS-232` on the PC side.

Live check over HTTP: `save?name=persist` → `reset` → `load?name=persist`
restores 7 devices / 6 links, and `show run` still prints
`banner motd ^saved banner^`, `line con 0`, `password cisco`.

## Not saved

`startup` (that *is* the saved running config) and the simulation capture buffer
are session state, not topology.
