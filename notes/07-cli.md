# 07 — Router/switch CLI and console cabling (`cli.rs`, `links`)

Status: landed 2026-11-01.

## Session model

`cli::Session` holds the IOS mode (`User`/`Priv`/`Config`/`Iface`) plus the
selected interface. `http.rs` keeps one session per device id
(`POST /api/cli`, `POST /api/cli/reset`), so the prompt survives across
requests exactly like a real console line.

## Commands parsed

| Mode | Commands |
|---|---|
| User | `enable`/`en`, `exit`, `help`/`?`, `ping HOST` |
| Priv | `disable`, `configure terminal`/`conf t`, `show run`, `show ip int br`, `show ip route`, `show version`, `show interfaces X`, `write memory`, `clock`, `do …` |
| Config | `hostname NAME`, `interface`/`int`/`intf NAME`, `ip route DEST MASK NH`, `end`, `do …` |
| Iface | `ip address ADDR MASK`, `shut`/`no shut` (any unambiguous prefix), `interface`/`int NAME`, `exit`, `end`, `do …` |

`show run` is generated from live state: addresses come from `PortCfg`, and a
port prints `no shutdown` only when it is administratively up.

## Console cabling

PT joins a PC to a router/switch with a console cable, and the Desktop →
Terminal icon then opens that device's CLI. Implemented as
`Link::kind == "eConsole"`:

- `link_kind` refuses a console cable unless it joins a host to a network
  device, and names the ports `RS-232` (host) / `Console` (router, switch).
- `carries_data()` excludes it from `fwd::bfs`, so it is out of band.
- `GET/POST /api/console?id=` resolves the peer; the browser's
  `openTerm` binds the session to that peer and titles the window
  `Terminal — PC0 → Router0`.
- Palette offers Copper / Cross / Serial / Fiber / Console; console links draw
  dashed blue.

## Interface state

`up` is the administrative state; the line protocol additionally requires a
cable. `show ip interface brief` therefore prints one of:

| admin | cabled | status | protocol |
|---|---|---|---|
| up | yes | `up` | `up` |
| up | no | `notconnect` | `down` |
| down | either | `administratively down` | `down` |

`fwd` uses the same predicate on both ends of a cable, so shutting one end
breaks the path with a message naming that device and interface.

## Verified in Chromium

PC0 → Desktop → Terminal (console cable to Router0), then typed:

```
Router0> en
Router0# show ip interface brief
GigabitEthernet0/0   192.168.1.1  YES manual up           up
GigabitEthernet0/1   192.168.2.1  YES manual up           up
GigabitEthernet0/2   unassigned   YES unset  notconnect   down
Router0# conf t
Router0(config)# hostname CORE-R1
CORE-R1(config)# int g0/0
CORE-R1(config-if)# no shut
```

`show run` afterwards showed `hostname CORE-R1` and `no shutdown` on g0/0.
