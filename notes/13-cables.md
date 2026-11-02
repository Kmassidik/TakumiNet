# 13 — Cable media rules and startup configuration

Status: landed 2026-11-01.

## Cable eligibility (`Workspace::media_check`)

A link is refused unless both ends can host the medium. Ports are assigned per
medium, so a cable lands where the device actually has an interface.

| Cable | Rule | Ports |
|---|---|---|
| `eCopper`, `eCross` | both ends Ethernet-capable (PC, laptop, server, switch, router, AP, ASA, WLC, hub, phone, cloud…) | `Fa0`, `Fa0/n`, `Gig0/n` |
| `eFiber` | switch or router at both ends | `Fa0/n` / `Gig0/n` |
| `eSerial` | switch or router at both ends **and** a free serial port each | `Serial0/0/0`, `Serial0/1/0` |
| `eConsole` | exactly one host and one network device | `RS-232` ↔ `Console` |
| `ePhone` | exactly one analog phone and one router/switch | `Phone0` ↔ `Voice0` |
| `eCoax` | at least one endpoint is a home router or cloud | `Coax0` |
| `eIoT` | IoT endpoints on both sides (optionally through a switch/router) | `IoT0` |

Routers now carry two serial interfaces (`Serial0/0/0`, `Serial0/1/0`), so
`show ip interface brief` lists them as `notconnect` until cabled.

Verified live:

```
POST /api/links?kind=eSerial&a=router0&b=router1  →  Serial0/0/0 ↔ Serial0/0/0
POST /api/links?kind=eFiber&a=pc0&b=pc1          →  {"error":"a fiber cable joins switches or routers"}
POST /api/links?kind=eFiber&a=switch0&b=router1  →  Fa0/4 ↔ Gig0/1
```

Palette shows all eight tiles (`eCopper, eCross, eSerial, eFiber, eConsole,
ePhone, eCoax, eIoT`) with PT's own cable art.

## Startup configuration

- `Workspace::startup: Option<Vec<Device>>` — the snapshot written by
  `write memory` / `copy run start` (`Workspace::write_memory`).
- `Workspace::startup_config(id)` renders it through
  `cli::config_for(device, banner, line_password)`, the same renderer as
  `show run`.
- `Workspace::reload()` restores the snapshot over the live devices and clears
  the capture buffer, tables and clock.
- `banner motd #text#` stores per-device banner text; `line con 0` /
  `line vty 0 4` enter `Mode::Line`, where `password …` and `login` are stored
  and rendered in both configs.

Verified over the API on Router0:

```
banner: True   line con: True   password: True     (after write memory)
hostname BROKEN → reload → Router0                  (config restored)
```

## Note

`reload` replaces device configuration but keeps positions and links, which is
what an IOS reload does for a saved startup-config; it does not re-run the
boot sequence.
