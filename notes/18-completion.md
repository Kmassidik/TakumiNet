# 18 — CLI completion, `no` forms, help

Status: landed 2026-11-01.

## `no` forms

| Command | Mode | Effect |
|---|---|---|
| `no ip route DEST MASK NH` | config | removes the matching static route; prints `Removed static route 10.0.0.0/24 via 192.168.1.2`, or `% No matching static route …` |
| `no hostname` | config | resets to `<KindPrefix><n>` derived from the current name/id (`EDGE` → `Router0`) |
| `no banner motd` | config | drops the stored banner |
| `no password` | line | drops the line password |

Unknown `no …` and a bare `no` keep the IOS `% Invalid input detected at '^' marker.`
text.

## Completion

`cli::complete(ws, id, session, line) -> Vec<String>` is context aware:

- after `interface` / `intf` / `int`, it offers matching port names
  (`int g` → `GigabitEthernet0/0…`);
- otherwise it walks the per-mode command table and expands the current word to
  a full command line (`sh` in privileged mode → all eight `show …` commands,
  `show ip ` → `show ip interface brief` / `show ip route`).

Results are sorted and deduplicated. `POST /api/complete?id=&line=` exposes it,
and the console's `Tab` key lists multiple candidates or completes a single one.

`help` / `?` are generated from the same `commands(mode)` table that drives
completion, so the listing and the completer cannot drift apart.

## Verified

- 7 new unit tests: route removal + repeat error, `no hostname`, banner removal,
  password removal, unknown no-form, help contents, completion invariants.
- HTTP: `sh` → 8 `show` candidates; `show ip ` → 2; `int g` → 3 interfaces.
- Chromium: typing `sh` + Tab lists the candidates in the console; `show ip r`
  + Tab fills `show ip route`.
