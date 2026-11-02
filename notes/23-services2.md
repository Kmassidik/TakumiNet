# 23 — FTP, NTP, syslog, AAA, ACLs, port security, EtherChannel

Status: landed 2026-11-01.

## Services

| Service | API | Behaviour |
|---|---|---|
| FTP | `POST /api/devices/ftp?id&name&content`, `/api/ftp/list` | per-server file table, empty content deletes, names reject `/` and `\` |
| NTP | `POST /api/devices/ntp?id&server`, `/api/ntp/status` | server must be a device address; one simulator clock, so the offset is 0 and is reported |
| Syslog | `POST /api/devices/syslog?id&on`, `/api/syslog/list` | per-device collection; one entry per delivered PDU on each enabled endpoint, capped at 200, cleared on disable |
| AAA | `POST /api/devices/aaa?id&user&pass`, `/api/aaa/list` | local user table per server, duplicate user refused, passwords never sent to the UI |

All four persist in `.ptw` (`ftp`, `ntp`, `syslogon`, `syslog`, `aaa` lines) and were
verified through HTTP and the Services tab.

## ACLs

- Standard (1–99): `access-list 10 permit|deny SRC WILDCARD`, matched on source.
- Extended (100–199): `access-list 100 permit|deny ip SRC WC DST WC`, matched on both.
- Bind with `ip access-group N in|out` on an interface; `no ip access-group` removes it.
- `show access-lists` prints the ACEs then the bindings.
- Enforcement sits in `fwd::deliver` at each router hop, inbound before the
  routing decision and outbound after it, so a denied frame never reaches the
  next link. Implicit deny applies when a bound list has no matching ACE.
- `any` and `host A.B.C.D` are accepted; rules and bindings persist.

Verified live: `access-list 10 deny 192.168.1.0 0.0.0.255` on Router0 g0/0 in
makes `pc0 → server0` fail with `ACL denied on Router0 GigabitEthernet0/0`.

## Port security

- `switchport port-security [maximum N]` on a switch port enables a MAC limit
  (default 1); `no switchport port-security` removes it.
- The forwarding path checks the ingress port; the first `max` distinct source
  MACs are learned, a further MAC is a `port-security violation`.
- `show port-security` lists port, limit, learned count.

## EtherChannel

- `channel-group N mode on|active|passive|auto|desirable` stores membership;
  `show etherchannel summary` prints group, member ports and `PoN(SU)`.
- The simulated forwarding already prefers one cable between the same pair, so
  membership is state plus reporting, not a new hashing model.

## Physical view (P6)

A Physical toggle in the toolbar and the existing Logical/Physical tabs swap in
a rack overlay grouped by device kind: name, model, cable count, cabled port
count and the port names taken from the link table. Clicking a box selects the
device and lists its ports from `/api/devices/ports`. The logical SVG is never
rebuilt, so switching back is exact.

Verified in Chromium: 7 boxes across Routers/Switches/Servers/Workstations,
`Server0 · Server-PT — 1 cable · 1 cabled port · Fa0`, and the Services tab now
shows DHCP Reservations, DNS, HTTP, Mail Users, TFTP, FTP, AAA Users, Syslog, NTP.

## Not implemented yet

Port-security violation modes (restrict/shutdown), sticky MACs, LACP negotiation,
RADIUS/TACACS+ off-box, ACL on switches, and NAT.
