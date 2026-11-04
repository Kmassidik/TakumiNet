# TakumiNet

TakumiNet is a free, clean-room network emulator that runs in your browser.
Build a topology, configure devices, inspect real Ethernet/IP packets, and
follow guided labs without an account. The Rust simulation engine runs as
WebAssembly in each tab; the interface is plain HTML and CSS, with the workspace drawn on a canvas by TypeScript modules in `web/ts/` (built by Bun into `web/js/ui.js`).
All bundled artwork and sounds are original. TakumiNet is not affiliated with
Cisco.

## Quick start with Docker

```bash
docker build -t takuminet .
docker run --rm --name pt-web -p 3000:3000 takuminet
```

Open **http://127.0.0.1:3000**. Stop the container with `docker rm -f pt-web`.
The image contains the native static/development server, the complete web app,
all five templates, original assets, and the committed WebAssembly engine. It
needs no runtime package installation or external asset service.

For native development instead:

```bash
cargo run
```

The server listens on `127.0.0.1:3000` by default. Set `HOST`, `PORT`, or
`WEB_ROOT` to override its defaults.

## Start a lab or build a network

The opening gallery includes five guided lessons and five ready-to-run example templates, all `.xml` files:

| Template | Lab |
| --- | --- |
| T1 | Connect and address two computers |
| T2 | Build a switched star and inspect MAC learning |
| T3 | Configure DHCP and visit a local web server |
| T4 | Join two networks through a router and inspect TTL |
| T5 | Resolve a DNS name and open a website |

Choose a card to load its topology and steps. **Check my work** runs the actual
lesson checks against the live simulation. You can also close the gallery and
start from a blank workspace: place devices, choose cable types, open a device's
Physical/Config/Desktop/Services views, and use its terminal or desktop apps.

Realtime and Simulation modes share the same protocol engine. The Capture dock
shows packet rows, decoded fields, and wire bytes; Flow draws a hop-by-hop
ladder. **Save capture** exports standard Ethernet `.pcap` files.

## Browser WASM and offline use

No build step is required to run the committed app. On startup,
`web/js/engine.js` loads `web/engine.wasm` and routes `/api` calls to that tab's
own engine. Named saves and recovery snapshots use browser storage. The native
server remains a fallback if WebAssembly cannot load.

The service worker precaches the application shell, About page, JavaScript,
CSS, all art and sounds, all templates, and the WASM binary. After a successful
online load and service-worker installation, reloads and simulations work with
the network disabled. Clear the site's storage to remove the offline cache and
browser-local saves.

To reproduce the committed engine after changing Rust code:

```bash
./scripts/build-wasm.sh
```

This uses Cargo's `wasm32-unknown-unknown` target with release size
optimization, LTO, and aborting panics—no npm, wasm-pack, or bindings generator.

## Native files

**File → Export** downloads the workspace as a UTF-8 `.xml` file. **Open** and
workspace drag-and-drop import the same format atomically: invalid input leaves
the current workspace intact. Save/Open also manage named browser saves when
WASM is active.

See **[docs/format.md](docs/format.md)** for the native XML schema, record and
attribute reference, validation rules, resource limits, and extension
preservation. The older `.ptw` text format has a read-only compatibility loader;
new exports are always `.xml`. A `.tnet` file from an earlier version still opens.

## Project map

```text
src/lib.rs            reusable simulation engine crate
src/main.rs           optional native static/development server
src/engine.rs         transport-independent raw WASM ABI
src/workspace/        devices, links, protocols, lessons, and persistence
src/net/              packet model, forwarding, and simulation
src/cli/              device command-line interface
src/http/             shared HTTP routes and native server
src/storage/          XML and libpcap readers/writers
web/                  browser app, templates, original art, and sounds
tests/                native, HTTP, JavaScript, and browser checks
provness/pt-web/      executable laws and recorded evidence
```

## Verification

```bash
./scripts/build-wasm.sh
cargo test
node --test tests/js/*.test.js
```

The 20 native golden lab transcripts can be regenerated after an intentional
engine contract change, then replayed in real Chrome with
`tests/browser/labs.html`:

```bash
LAB_FIXTURE_DIR=tests/fixtures/labs cargo test --test labs -- --test-threads=1
```

See [About](web/about.html) for code/art provenance and independence,
`PRD.md` for the roadmap, and `provness/pt-web/LAWS.md` plus `result.md` for
verification laws and evidence.
