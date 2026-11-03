# TakumiNet

TakumiNet is a clean-room, browser-based network emulator for learning. The
simulation engine and HTTP server use only the Rust standard library; the UI is
plain HTML, SVG, CSS and JavaScript. Artwork and sounds are original.

## Run

```bash
cargo run
```

Open `http://127.0.0.1:3000`. `HOST`, `PORT` and `WEB_ROOT` may override the
server defaults. No external asset tree or runtime package installation is
needed.

### Docker

```bash
docker build -t takumi-net:dev .
docker run --rm -p 3000:3000 takumi-net:dev
```

## Workspace

The logical canvas supports device placement, movement, renaming, duplication,
deletion, eight cable types, bus and mesh construction, undo/redo, and
Realtime/Simulation modes. Device windows expose Physical, Config, Desktop and
Services views. The command line and desktop applications operate on the same
live workspace as the canvas.

The engine includes L2 switching, MAC learning, ARP, IPv4 forwarding with real
Ethernet/IP/ICMP frames, TTL and checksums, static routes, RIP, OSPF, EIGRP,
VLANs, STP/RSTP, EtherChannel, DHCP, DNS, HTTP, mail, FTP, TFTP, NTP, syslog,
AAA, ACLs, NAT, IPv6 configuration, wireless, VPN, PPPoE, phones and industrial
protocol state. Captured events retain per-hop protocol details and drop
reasons.

## Native `.tnet` files

The only writable persistence format is TakumiNet XML:

```xml
<takuminet version="1">
<device id="pc0" kind="pc" model="PC-PT" x="100" y="300" name="PC0" ip="192.168.1.10" prefix="24"/>
</takuminet>
```

The root contains a flat list of self-closing records. Attributes preserve the
complete editable workspace, including device configuration, links, services,
routing, switching, security, wireless and industrial state. Unknown elements
are retained when a file is loaded and saved. XML text escaping is implemented
in `src/storage/xml.rs`; the table-driven record converter is
`src/workspace/tnet.rs`.

- **Save / Open** manage named files under `topologies/` through `POST
  /api/save?name=`, `POST /api/load?name=` and `GET /api/saves`.
- **Export** downloads the current workspace from `GET /api/export`.
- **Import** sends UTF-8 `.tnet` XML to `POST /api/import` and replaces the
  workspace only when parsing succeeds.

The previous `.ptw` text format has a read-only compatibility loader. New files
are always `.tnet`.

## Layout

```text
src/main.rs           server entry point
src/model.rs          topology JSON and demo network
src/workspace/        live devices, links, protocols and persistence
src/workspace/tnet.rs native XML record conversion
src/net/              packet model, forwarding and simulation
src/cli/              device command-line interface
src/http/             HTTP server and route groups
src/storage/xml.rs    dependency-free XML reader/writer
web/                  original artwork, sounds and browser application
tests/                HTTP, protocol, asset-policy and JavaScript checks
provness/pt-web/      executable laws and their latest results
```

## Verification

```bash
cargo test
cargo test --test e2e
node --test tests/js/*.test.js
```

The persistence tests cover edited-field round trips, byte idempotence, 2,000
random XML escaping cases, malformed truncations and random bytes, unknown
element retention, legacy loading, and native HTTP save/open/import/export.
`tests/assets_free.rs` requires zero vendor asset references in the frontend.

See `PRD.md` for the product roadmap and `provness/pt-web/LAWS.md` plus
`provness/pt-web/result.md` for testable persistence laws and evidence.
