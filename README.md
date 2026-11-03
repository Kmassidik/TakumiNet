# TakumiNet

**Status:** Clean-room network simulator and workspace UI live on `:3000`.
**Stack:** Rust (std only, no crates) + plain HTML/SVG front end.
**Policy:** Nix/Docker only (`~/Desktop/NOTE.md`). Nothing installed globally.

---

## What this is

A clean-room, browser-based network simulator: topology canvas, L2/L3
forwarding, packet-path animation. Not a wrapper, not a Wine shell — the
simulation is ours and runs server-side in Rust.

## What is proven right now

- `cargo test` — 146 unit + 41 integration/HTTP conformance tests (187 total):
  frames, TTL, MAC/ARP tables, interface state, IOS CLI, VLAN/STP/EtherChannel,
  editing, assets, `.pkt` import.
- `cargo run` — asset browser on `http://localhost:3000`, verified in Chromium
  (icon grid renders, preview opens, 6,455 files / 811 MB indexed).
- Workspace UI verified in Chromium: 7 devices, 6 labeled links, 49 event
  filters, 20 palette tiles, Realtime/Simulation bar, toolbars from real art.
- Interactive editing verified: palette drag → device created on canvas,
  pointer drag moves it, `Delete` removes it, all persisted server-side.
- **Device window like the real one**: double-click any PC → window titled with
  its name and tabs `Physical | Config | Desktop | Programming | Attributes`.
  Desktop is the real app grid (15 icons from `art/Workstation`), `IP
  Configuration` opens the copied panel, and `Command Prompt` is a working
  terminal — `ipconfig`, `ping <ip>`, `cls`, `exit` with Packet Tracer's own
  output text and statistics.
- **Copied from the vendor's own UI catalog** (`notes/06-ui-copy.md`): the app
  ships 499 dialogs / 10,598 strings (`languages/default.ts`) and 1,442 dialog
  screenshots (`help/default/images`). Our IP panel is now a 1:1 copy of
  `config_PCs_3.jpg`, including the `802.1X` group.
- **IP Configuration mirrors the real dialog**: `Interface`, **Static / DHCP**,
  **IPv4** (IP Address, Subnet Mask, Default Gateway, DNS Server, DHCP Refresh)
  and **IPv6 Configuration** (Auto Config, IPv6 Address, Link Local, IPv6
  Gateway, IPv6 DNS Server). Field list taken from the shipped Qt translation
  source (`languages/default.ts`, context `CBaseWorkStationIPConfig`), which is
  the app's own UI text — 28 strings, all accounted for except the 802.1X block.
- **Bus lab in one click**: palette **Bus** builds a hub + N stations
  (2–24) already wired and addressed `192.168.1.10/24` upward. Double-click any
  device for **IP Configuration**; the address is drawn under the device.
  A PDU between two configured hosts on different subnets is refused with
  "different subnets — add a router". Verified in Chromium: bus → 5 devices /
  4 links / 4 addresses, PDU PC0 → PC1 captured, address edit re-labels live.
- **Full mesh**: 47 palette devices (routers, switches, ASA, IP phones, WLC,
  PLC, cell tower, patch panel, …). Multi-select with Shift/Ctrl, then
  **Tools → Create Full Mesh**, or the palette **Mesh** button to mesh
  everything. Verified: 3 selected → 6→9 links; all 7 → 21 links; undo → 6.
- Cabling verified: cable tool → click two devices → link created with
  auto-assigned ports (`Fa0`, `Fa0/4`, `Gig0/2`); parallel switch links use
  distinct ports, duplicate host links, self-links and unknown devices are
  rejected; links are selectable and deletable.
- Every control wired: New, Open, Save, Print, Undo, Redo, Copy, Paste, Delete,
  Zoom In/Out/Reset, Palette toggle, Grid toggle, Custom Device, Simple/Complex
  PDU, Reset Simulation, Play/Step/Back/Forward/Fast-forward, Show All/None,
  Help, Asset Browser. Menus mirror the toolbar.
- Simulation is real: PDU runs a BFS over the link graph, records an event
  (time, last device, at device, type) and animates the path.
- **`.pkt`/`.pka` decode in Rust** (`src/storage/ptfile.rs`): reverse-XOR → Twofish-EAX
  (key `0x89`×16, nonce `0x10`×16) → XOR → zlib with 4-byte BE length. Verified
  against shipped samples (`PACKETTRACER5`, PT 7.1–9.x). `pkt2rs` converts any
  save into typed Rust (`DEVICES`, `LINKS` with ports, plus the raw XML).
- **Open a real save in the app**: File → Open lists all 299 shipped `.pkt`
  files, decodes and types them (`src/ptxml.rs`), fits PT's logical coordinates
  onto the canvas, and renders devices + links with their real interface names.
- **Real packets, not path labels** (`src/net/packet.rs`, `src/net/fwd.rs`): a ping is
  an Ethernet frame carrying an IPv4/ICMP echo with a 32-byte payload and a
  correct header checksum. Switches learn source MACs (300 s ageing) and flood
  unknown unicast; every router decrements the TTL and re-encapsulates for the
  next segment. Each captured event carries per-hop detail — ingress/egress
  port, TTL, source/destination MAC and the decision taken.
- **Eight cable types with real eligibility**: Copper, Cross, Serial, Fiber,
  Console, Phone, Coax, IoT. Each is checked before a link exists — fiber only
  between switches/routers, serial only where both ends have a free `Serial`
  port (`Serial0/0/0` on the 2911), phone only analog-phone ↔ router/switch
  (`Phone0` ↔ `Voice0`), coax needs a cable modem/cloud, IoT joins IoT devices
  (optionally through a switch), and a console cable lands on `RS-232` ↔
  `Console`, renders dashed, and carries no user traffic.
- **Startup configuration**: `write memory` / `wr` / `copy run start` snapshots
  only the active device, including its banner, line password and routing;
  `show startup-config` prints that saved snapshot and `reload` restores it.
  `show run` includes hostname, banner, interfaces, static routes, routing
  blocks and line passwords. Common `show` abbreviations, inline `show ?` and
  invalid-input carets follow IOS, including `do show` in line mode.
- **Interface state is real**: `shut` / `no shut` (any unambiguous prefix) plus
  cable presence drive `up` / `administratively down` / `notconnect` in
  `show ip interface brief`; a down end breaks the PDU path and the error names
  the device and interface. The demo ships addressed — 192.168.1.0/24 and
  192.168.2.0/24 joined by Router0.
- **Device catalogue from PT's own templates** (`src/catalog.rs`): the 89
  `.ptd` files decode with the same container code as a save, giving model
  labels, names, descriptions, OS images, groups and slot counts.
  `GET /api/catalog` serves 63 of them; the other 26 are IoT/home templates
  whose container variant is still unidentified (`notes/09-catalog.md`).
- **PDU detail**: double-click an event row for PT's layer stack per device —
  In/Out layers, ingress/egress interface, TTL, source/destination MAC and the
  forwarding decision (learn, flood, route, ARP).
- **Command Prompt is the simulation** (`src/cmd.rs`): `ipconfig`, `ping`,
  `tracert`, `arp -a`, `nslookup`, `netstat` and `telnet` all run server-side
  against the same topology the packet engine uses, so `ping` produces a real
  PDU event and `tracert` lists router hops only (`192.168.1.1 → 192.168.2.10`,
  switches skipped). `telnet <router>` opens that router's CLI inside the
  prompt.
- **Discrete-event clock** (`src/sched.rs`): every delivery schedules one
  arrival per device at 1 ms intervals, so an event carries per-hop timestamps
  (`0.001 … 0.005`) and sends interleave by arrival time, not send order.
- **DHCP is served, not faked** (`Workspace::set_dhcp_pool` / `acquire_dhcp`):
  a server's pool is found over the same L2 segment (never across a router),
  leases start at .100 and skip addresses already in use, the client gets
  address/mask/gateway/DNS, a `DHCP` event is captured, and static config
  takes a host back off DHCP. Dialog: server → IP Configuration → **DHCP Pool**;
  client → **DHCP** → Apply. Reservations pin a client to a fixed address, and
  `ip helper-address` on a router interface relays a segment's requests to a
  server on another subnet (verified: PC0 leases `192.168.1.100` through
  Router0's helper).
- **Desktop apps beyond the basics**: Text Editor stores per-device text in
  `localStorage`; Traffic Generator sends 1–200 real PDUs to an address and
  counts sent/received/lost; MIB Browser lists the live device table and the
  selected device's interfaces (explicitly labelled local, no SNMP agent);
  Email resolves the server by IP, creates mailboxes, lists the inbox and sends
  messages (each send is a captured `SMTP` event).
- **`.pktz`/`.pksz` too**: `ptfile::decode_any` recognises a ZIP container
  (bounded central-directory walk, stored/deflate entries, 512 MiB cap, unsafe
  names skipped) and decrypts the inner save; `pkt2rs` uses it for `--xml`.
- **Web Browser talks to the server** (`src/webapp.rs`): the Desktop browser
  resolves the URL host, forwards a real delivery through the topology (so it
  appears in the capture buffer as `HTTP`), and renders the server's page —
  `200 OK — 192.168.2.20 / Server0`. A host without an HTTP service answers
  `Connection refused`, a missing host or broken path `Request timed out`.
- **Windows behave like windows**: drag any title bar, maximize (`□`) to fill
  the viewport and restore, minimize (`—`) without losing the session, and
  multiple windows stay open — clicking one raises it (`z-index` bump), and the
  backdrop no longer dims the workspace.
- **Native save covers what you edit**: `.ptw` persists device addresses,
  gateways, DNS, IPv6 (including auto/prefix/gateway), 802.1X credentials,
  interface addresses and admin state, static routes, DHCP pools and DHCP
  clients, banners, line passwords, and every link's cable kind. Save → reset →
  load returns an identical topology and `show run` output.
- **Physical view with power and modules**: the power button swaps the artwork
  and *gates traffic* — a powered-off device answers `Destination host
  unreachable`. Routers and switches expose two module slots; drag `HWIC-2T` or
  `NM-2FE2W` from the tray into a slot to add its ports (`Serial0/3/0-1`,
  `FastEthernet0/0-1`), click a filled slot to remove it (refused while a port
  is cabled). Both states ride in `.ptw` saves.
- **Server services**: a server's **Services** tab edits DNS records (name →
  address, added/removed live) and its HTTP page; clients resolve with
  `nslookup web.lab` (BFS stops at routers, so only same-segment servers
  answer) and the Desktop browser serves the configured page instead of the
  default welcome text.
- **Template catalogue in the palette**: `/api/catalog` now feeds a muted
  **Templates** section (grouped, 56 entries, tooltips carry the description)
  and annotates matching device tiles with their shipped description; palette
  behaviour for existing tiles is unchanged.
- **CLI parity work**: `Tab` completion uses the same command table as
  `help`/`?` (`sh` lists every `show` command, `int g` completes interfaces),
  and the `no` forms are real (`no ip route`, `no hostname`, `no banner motd`,
  `no password`).
- **`.pkt` writer**: `ptfile::encode` re-encodes a decrypted save; the corpus
  round-trip is **275 ok, 18 skipped (known undecodable container), 0 failed**,
  exposed as `cargo run --bin pkt2rs -- --roundtrip <dir>`.
- **VLANs, router-on-a-stick and IEEE spanning tree**: access/trunk ports
  enforce 802.1Q VLANs, while router subinterfaces (`interface g0/0.10`,
  `encapsulation dot1Q 10`, `ip address ...`) route between them with the usual
  TTL decrement. STP/RSTP elects a root by extended bridge priority then MAC,
  uses root path cost and IEEE port tie-breakers, and blocks only the
  non-designated endpoint of a redundant link. `spanning-tree vlan 1 priority`
  and `spanning-tree mode rapid-pvst` change the live topology and appear in
  running/startup configuration; shutdowns immediately reconverge the tree.
  VLAN, subinterface, mode and priority state persist in `.ptw`.
- **Industrial protocols**: Modbus holding registers per industrial device
  (`/api/iot/read|write`), PROFINET PDUs, PRP duplicate suppression by
  sequence number, PTP master/slave sync, and cellular clients that route
  through their cell tower. All persist in `.ptw`.
- **Security policy**: DHCPv6 from a server prefix, ASA `inspect icmp`
  (outside→inside drop), and IPS drop signatures enforced at every L3 hop
  (`IPS dropped icmp at Router0`); `show ips` reports them. IPv6 has no data
  plane, so OSPFv3 installs entries in `show ipv6 route` but no IPv6 frames
  are forwarded.
- **Menus and dialogs**: Options → Preferences (grid, sound, delete
  confirmation, persisted per browser), Help → About, Help → Dialogs catalog
  browser (10,598 rows / 499 dialogs).
- **Routing protocols, ACLs and NAT**: `router rip|ospf <id>|eigrp <as>` with
  `network A.B.C.D MASK` exchanges advertised networks over router links
  (distance-vector pass, `R`/`O`/`D` rows in `show ip route`); `access-list`
  standard/extended rules bound with `ip access-group N in|out` drop frames at
  the router hop; `ip nat inside|outside` plus `ip nat inside source list N
  interface g0/1 overload` rewrites inside sources and `show ip nat
  translations` reports the bindings.
- **Switch hardening and EtherChannel**: `switchport port-security maximum N`
  enforces a MAC limit with a `port-security violation` drop. Compatible
  `channel-group N mode on|active|passive|auto|desirable` members form one
  logical STP/forwarding link; `show etherchannel summary` reports LACP/PAgP,
  bundle and member state, and traffic fails over when a member is shut down.
  Group numbers and modes persist in running/startup configuration and `.ptw`.
  `dot1x port-control auto` sets the 802.1X state shown by `show authentication
  sessions`.
- **Wireless, VPN, PPPoE and phones**: controllers hold WLANs
  (`/api/wifi/wlan`), clients scan and associate with WPA2-PSK
  (`/api/wifi/scan`, `/api/wifi/join`, `/api/wifi/status`), and VPN/PPPoE
  dialer and IP-phone registration state live at `/api/vpn/*`, `/api/pppoe/*`
  and `/api/phone/*`. All persist in `.ptw`.
- **Services list**: FTP (`/api/devices/ftp`), NTP (`/api/devices/ntp`) and
  syslog collection (`/api/devices/syslog`, entries per delivered PDU) sit next
  to the DNS/HTTP/TFTP/mail panes, and AAA local users (`/api/devices/aaa`) back
  the wireless PSK/enterprise story.
- **UI catalog**: `GET /api/dialogs?q=&limit=` browses `intake/ui-catalog.tsv`
  (10,597 rows, 499 dialogs) when the extraction is present.
- **Mail and TFTP services**: servers hold mail users and inboxes
  (`/api/devices/mailuser`, `/api/mail/send`, `/api/mail/list` — each send is a
  captured `SMTP` event) and a TFTP file store (`/api/devices/tftp`,
  `/api/tftp/list`, empty body deletes). Both persist in `.ptw`.
- **Own artwork**: original 3D PNGs in `web/art/3d/` serve device, cable,
  palette, toolbar, simulation, application, and mascot imagery through
  `/art3d/<group>/<name>.png`. TakumiNet uses the fluffy mascot as its logo.
- **Tests**: 146 unit + 41 integration/HTTP tests. `tests/e2e.rs` and the
  router-on-a-stick, STP/RSTP and EtherChannel labs in `tests/labs/main.rs`
  spawn the real binary and drive HTTP; `tests/corpus.rs` (opt-in `PT_CORPUS=1`) opens all 299 shipped
  saves through `/api/pkt/open` — **239 opened, 42 empty, 18 skipped (known
  undecodable container), 0 errors** — and asserts every link endpoint exists.
- Asset coverage 71/6,455 files (1.1%): toolbar, palette, logical device art,
  simulation transport icons, 8 sounds. Map: `notes/02-asset-coverage.md`.
- `docker build` + `docker run` — container serves the same UI and assets.
- `nix-instantiate --parse flake.nix` — flake parses; `nix build` fetches inputs.
- **Packet Tracer 9.0.1 unpacked and inventoried** — see `notes/01-artifact.md`.

## The artifact (verified 2026-11-01)

| | |
|---|---|
| Source | `~/Downloads/CiscoPacketTracer_901_Ubuntu_64bit.deb` |
| sha256 | `3683dd87…9479b` (400 MB) |
| payload | one AppImage (403 MB) → squashfs → 825 MB tree at `opt/pt` |
| binary | `opt/pt/bin/PacketTracer`, 105 MB, **not stripped**, DWARF, Qt 6.8.7 |
| UI | Qt6 WebEngine + WebChannel — the front end is already Chromium/JS |

Symbol namespaces give the architecture directly: `Device::CDevice`,
`Port::CPort`, `Traffic::CFrameInstance`, `CommandSet::CTerminalLine`,
`Ptmp::CPtmpBuffer` (save format), plus OSPF/EIGRP/DHCPv6/AAA/CAPWAP/VPN/QoS.
Shipped ground truth: 299 `.pkt`/`.pka` samples, 89 `.ptd` templates,
2,743 files of shipped API docs.

## Legal boundary (not negotiable)

Analysis of a binary you own for interoperability/learning is one thing.
Shipping Cisco's icons, device models, fonts, `.pkt` templates or decompiled
code inside a public web app is another. Plan:

| Thing | Approach |
|---|---|
| Behaviour, file format, protocol | Reverse-engineer, reimplement |
| Visual assets | Rebuild from scratch (our own SVG) |
| `.pkt` import | Interop parser, written from format evidence |
| Code | Clean-room Rust; never a port of their binary |

## Layout

```
src/main.rs        starts the server
src/model.rs       topology model + demo network
src/workspace/     devices and links; one file per domain
                   (types, palette, links, switching, dhcp, nat, acl, aaa,
                   routing, wireless, iot, wan, apps, ptw_save, ptw_load, ...)
src/net/           packet, forward (L2/L3), sim, sched
src/cli/           IOS CLI; one file per mode (exec, config, interface,
                   router, line) plus show and help
src/cmd.rs         PC command prompt
src/http/          HTTP server; one route group per file, plus util
src/storage/       ptfile + ptxml (.pkt), assets, catalog
web/index.html     workspace UI shell
web/js/            front end, plain scripts loaded in order by index.html
web/workspace.css  styles
web/browser.*      raw asset explorer at /browser
scripts/           intake.sh: unpack + inventory a PT installer
notes/             findings, one file per investigation
Dockerfile         multi-stage build; assets mounted at /assets, never copied
flake.nix          devShell + package
```

## Run

```bash
cargo test
cargo run                       # http://127.0.0.1:3000
```

Assets are auto-discovered under `intake/*/appimage/opt/pt`; override with
`ASSET_ROOT=/path/to/opt/pt`.

### Docker

```bash
docker build -t pt-web:dev .
docker run --rm -p 3000:3000 \
  --security-opt label=disable \
  -v "$PWD/intake/20261101-102334/appimage/opt/pt:/assets:ro" pt-web:dev
```

`--security-opt label=disable` is required on Fedora: SELinux `Enforcing`
otherwise denies the bind mount and the container sees an empty `/assets`.
(Alternative: suffix the volume with `:z` to relabel the directory.)

The image does **not** contain Cisco assets — they are mounted read-only.

### Nix

```bash
nix develop                     # dev shell: cargo, rustc, clippy
nix build .#default             # static binary in ./result/bin/pt-web
```

API: `GET /api/workspace`, `POST /api/devices?model=&x=&y=`,
`POST /api/devices/move?id=&x=&y=`, `POST /api/devices/delete?id=`,
`POST /api/devices/duplicate?id=`, `POST /api/devices/rename?id=&name=`, `POST /api/mesh?ids=a,b,c`, `POST /api/bus?count=N`,
`POST /api/devices/ip?id=&ip=&mask=&gateway=&dns=`,
`POST /api/devices/ipv6?id=&auto=&addr=&prefix=&gateway=&dns=`,
`POST /api/devices/dhcp?id=&network=&mask=&gateway=&dns=`,
`POST /api/dhcp/acquire?id=`,
`POST /api/webfetch?id=&url=`,
`POST /api/links?a=&b=&kind=eCopper|eCross|eSerial|eFiber|eConsole`,
`POST /api/links/delete?a=&b=`,
`POST /api/pdu?src=&dst=`, `POST /api/sim/reset`,
`POST /api/undo`, `POST /api/redo`, `POST /api/reset`,
`POST /api/save?name=`, `POST /api/load?name=`, `GET /api/saves`,
`GET /api/pkt/list`, `POST /api/pkt/open?path=`,
`GET /api/status`, `GET /api/catalog`, `POST /api/cmd`, `GET /api/assets?dir=art`, `GET /assets/<path>`,
`GET /api/topology`, `POST /api/ping?src=pc1&dst=192.168.2.10`.
Raw asset explorer: `http://localhost:3000/browser`.

## Convert `.pkt` / `.pka` → Rust

```bash
cargo run --bin pkt2rs -- file.pkt out.rs   # one save -> typed Rust
cargo run --bin pkt2rs -- --xml file.pkt    # decoded XML
cargo run --bin pkt2rs -- --all saves/ out/ # whole corpus
```

Corpus run: **281 / 299** shipped saves decoded (18 are a second container
variant — see `notes/04-pkt-format.md`). Each `.rs` carries `DEVICES`
(name, model), `LINKS` (resolved device names, both ports, cable type) and the
verbatim XML.

## Tests

```bash
cargo test            # 136 unit + 24 e2e
cargo test --test e2e # end-to-end only
```

`tests/e2e.rs` starts the real binary on a spare port and exercises the same
HTTP surface the browser uses, including `.pkt` listing and import.

## Demo topology

```
PC0 192.168.1.10/24 --+
PC1 192.168.1.11/24 --+-- SW0 -- R0 g0/0 192.168.1.1/24
                                     g0/1 192.168.2.1/24
                            SW1 -- Server0 192.168.2.20/24
                                -- PC2 192.168.2.10/24
```

Connected routes only; every host has a default gateway. One PDU crosses
Router0, so the TTL drops 128 → 127 and each switch learns a MAC.

## Next, in order

1. ~~**`Traffic::CFrameInstance`**~~ — landed as `src/net/packet.rs` + `src/net/fwd.rs`
   (Ethernet/IPv4/ICMP, TTL, checksums, MAC/ARP tables). Evidence:
   `notes/08-packets.md`.
2. **`Ptmp::CPtmpBuffer`** — the `.pkt` writer. 299 samples as a corpus. The
   decoder works; the encoder is what makes saving and round-tripping real.
3. **`Device::CDevice` / `Port::CPort`** — load all 88 `.ptd` templates so the
   palette, port counts, modules and power state come from PT's own data.
4. **`CommandSet::CTerminalLine`** — the IOS CLI (2,629 functions). Started: four
   modes, `?`-less abbreviation resolution, `show run|ip int br|ip route|
   interfaces|version`, `hostname`, `ip address`, `ip route`, `shut`/`no shut`,
   static routes. Remaining: completion, `no` forms, VLAN/STP/MAC show output,
   line config, startup-config.
5. Protocol modules as crate boundaries: DHCP, OSPF, EIGRP, AAA, CAPWAP, VPN.

Each step gets a `notes/NN-*.md` with evidence, and lands in Rust only after
the behaviour is established.
# TakumiNet
