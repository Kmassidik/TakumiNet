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

### Browser engine and offline use

Build the committed browser engine reproducibly with the already-installed
`wasm32-unknown-unknown` target:

```bash
./scripts/build-wasm.sh
```

This uses only Cargo, with release size optimization, LTO and aborting panics;
no npm, wasm-pack or bindings generator is involved. `web/js/engine.js` sends
`/api` requests to the raw WASM instance in each tab and falls back to the
native server only if WASM cannot load. Templates are embedded in the engine;
named saves and recovery snapshots use browser storage. The service worker
precaches the complete application and `engine.wasm`, so a previously loaded
app reloads and runs without a network.

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

## Engineer view

The bottom **Capture** dock links a seven-column packet list, an expandable
protocol-details tree, and a hex/ASCII wire-byte pane. Selecting a decoded layer
highlights its byte range. The display filter accepts protocol names,
`ip.src`, `ip.dst`, `eth.addr`, TTL comparisons, `&&`, `||`, `!`, and
parentheses; invalid expressions report an error without interrupting capture.
The **Flow** tab draws the same events as a selectable SVG ladder.

Step, Back, Play, and Reset are available from the transport controls. Space
plays or pauses, Right Arrow steps, and Left Arrow goes back. The speed slider
selects 0.25×, 0.5×, 1×, or 2×. Canvas packets use the same fixed protocol
palette as Capture, while the narration and mascot explain real switching,
ARP, routing, delivery, and drop decisions. **Check my work** runs the actual
lesson checks, shows progress and per-check reasons, refreshes Capture, and
animates the checked path.

**Save capture** exports standard Ethernet libpcap (`.pcap`) using
`GET /api/capture/export`. `GET /api/capture/bytes?id=` returns the selected
recorded frame as hexadecimal. Wireshark compatibility is covered by a binary
reparse test; opening the file interactively in Wireshark remains an owner
check.

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
- **Export** downloads `<name>.tnet` through a browser Blob using
  `GET /api/export`; it does not write a server-side save.
- **Import** accepts `.tnet` files from the File picker or a workspace drop,
  sends UTF-8 XML to `POST /api/import`, and replaces the workspace only when
  parsing succeeds. Validation errors are shown without discarding current work.
- **Browser recovery** autosaves the latest edit after a one-second debounce and
  offers to restore the last session on reload. Storage failures are non-fatal.

The previous `.ptw` text format has a read-only compatibility loader. New files
are always `.tnet`.

## Layout

```text
src/lib.rs            reusable simulation engine crate
src/main.rs           optional static/development server entry point
src/engine.rs         transport-independent raw WASM ABI
src/model.rs          topology JSON and demo network
src/workspace/        live devices, links, protocols and persistence
src/workspace/tnet.rs native XML record conversion
src/net/              packet model, forwarding and simulation
src/cli/              device command-line interface
src/http/             HTTP server and route groups
src/storage/xml.rs    dependency-free XML reader/writer
src/storage/pcap.rs   dependency-free Ethernet libpcap writer
web/                  original artwork, sounds and browser application
tests/                HTTP, protocol, asset-policy and JavaScript checks
provness/pt-web/      executable laws and their latest results
```

## Verification

```bash
./scripts/build-wasm.sh
cargo test
cargo test --test e2e
node --test tests/js/*.test.js
```

Regenerate the 20 native golden lab transcripts after an intentional engine
contract change, then replay them in real Chrome with `tests/browser/labs.html`:

```bash
LAB_FIXTURE_DIR=tests/fixtures/labs cargo test --test labs -- --test-threads=1
```

The persistence tests cover edited-field round trips, byte idempotence, 2,000
random XML escaping cases, malformed truncations and random bytes, unknown
element retention, legacy loading, and native HTTP save/open/import/export.
`tests/assets_free.rs` requires zero vendor asset references in the frontend.

See `PRD.md` for the product roadmap and `provness/pt-web/LAWS.md` plus
`provness/pt-web/result.md` for testable persistence laws and evidence.
