# TakumiNet PRD: a free network emulator that runs in the browser

Owner's words, kept: a replacement for the account-and-registration-gated Cisco Packet Tracer. Same idea and same kind of functions, our own code, our own art, free for everyone to learn from. Runs in the user's browser. We ship **templates for learning courses**; users build their own and **save / import / export XML like draw.io does**. The browser can cache assets, so it keeps working offline.

Read first: this file, then `task.md` (history, roadmap, audit) and `provness/pt-web/LAWS.md`. Do not read anything else until a task needs it.

## 0. Rules for the builder (omp). These override defaults.
1. Every task = failing test first, then code, then `cargo test` green, then commit and push to `main`. **No Co-Authored-By, no attribution line, ever.**
2. **Install nothing** (no Bend, Kani, Lean, Playwright, npm, further rustup targets; wasm32-unknown-unknown is already installed). Ask the previous session first. Python 3 + Pillow, swift, cargo are present.
3. **No vendor file formats at all** (decision 2026-11-03). Our only file format is our own XML, saved as `.xml` (earlier `.tnet` files still open).
3b. **Own art and own code only.** Never copy, download or reference Cisco files, names, icons, text or output. Do not feed any vendor file to an image generator. `tests/assets_free.rs` must stay at 0.
4. **Fix what you find.** If you see a bug, wrong output, broken image or console error while working: write a failing test, fix it, commit it separately (`fix: ...`), note it in `provness/pt-web/result.md`. Do not skip it, do not ask permission for fixes.
5. **If you are confused, ask the previous Claude session (`takuminet-d6`), do not stop.** Send one specific question with what you tried (`SendMessage({to: "takuminet-d6", ...})` if your harness has it; otherwise print it on its own line starting `ASK-CLAUDE:` so the user can relay it). Then keep working on any task that is not blocked by the answer. A step that fails twice is also a reason to ask. Never guess a product decision, never wait idle.
6. Claims need data. "Done" means a test or a measurement, shown. If something is unverified, say so.
7. Code style: small functions, readable names, few comments, no dead code, no AI slop. Match the existing layout (`src/net`, `src/workspace`, `src/cli`, `src/http`, `src/storage`, `web/js`).
8. Be token-frugal: ranged reads, no full-file rereads, no recaps.

## 1. Verification workflow ("Bend-style", as before)
Bend is **not installed and was never run**; the owner said not to install it. The workflow that replaces it, as in `provness/`:
- Every task adds one or more **laws** (a precise, testable sentence) to `provness/pt-web/LAWS.md` with the code that keeps it and the test that covers it. Laws continue from **L10**.
- Every law has an executable test (unit, property test over many generated inputs, lab, or e2e). Property tests use a tiny deterministic PRNG in the test file, no new crates.
- After each task update `provness/pt-web/result.md`: law, test name, pass/fail, command, date.
- Never write "proven". Write "tested by <test>". If the owner later installs Bend, laws map to specs one to one.

## 2. Where we are (measured, 2026-11-03)
- Engine: L2 switching, VLAN, STP/RSTP, EtherChannel, static/RIP/OSPF/EIGRP, DHCP, DNS, NAT, ACL, IPv6, wireless, IoT, simulation capture. 20 CCNA lab tests (`tests/labs/main.rs`), ~220 tests total, all green.
- UI: logical workspace, device windows (Physical/Config/Desktop/Services), CLI terminal, Realtime and Simulation modes, event list.
- Assets we own: **97 3D icons** (`web/art/3d/`: 31 devices, 21 toolbar, 7 sim, 8 cables, 9 groups, 12 apps, 3 misc, 6 mascot poses), 11 generated sounds (`web/sounds/`), 31 flat SVG fallbacks (`web/art/*.svg`). Vendor references in `web/`: 0.
- Files: own XML `.xml` (legacy `.tnet` is read only); the previous `.ptw` text format is read-only legacy compatibility.
- Server: Rust HTTP server holding **one shared workspace** (`ws: Arc<Mutex<Workspace>>`, `src/http/mod.rs:48`): every visitor edits the same network, so it cannot be hosted for many users as is. Target architecture (P5): the engine runs in the browser as WebAssembly and the server only serves static files.

## 3. Goals
- **G1 (first, what the owner wants to see):** 5 beginner templates, each opens in one click and **runs live**: packets animate, link lights change, terminal commands answer, and a "Check my work" button turns green when the lesson goal is met.
- **G2:** draw.io-style files, XML is the only format and the engine's persistence layer: build anything, **Export** an XML file (download), **Import** one (picker or drag and drop), autosave in the browser. Our own schema.
- **G3:** works offline after first load (browser cache).
- **G4:** clean public face: name TakumiNet, mascot, licence/provenance page, no account, no login.

Non-goals now: BGP, HSRP, accounts, cloud sync, collaboration, grading server, mobile layout, any Cisco file format.

## 4. P0: own XML format (prerequisite for G1 and G2)
Native file = our own XML, extension `.tnet`, root `<takuminet version="1">`. The plan already agreed:
- `src/storage/xml.rs`: tiny std-only writer/reader for a flat list of self-closing child elements with attributes. Escape `& < > " '` and encode tab/CR/LF as `&#9; &#13; &#10;`. Unescape named and numeric references. Malformed input returns `None`, never panics.
- `src/workspace/tnet.rs`: **table-driven converter**: `RECORDS: &[(&str, &[&str])]` gives the field names of each of the 49 record types (taken from the longest legacy match patterns; extra trailing fields become `v<N>`; unknown tags are kept losslessly). `to_tnet()` turns each line of the existing record stream into `<device id="pc0" kind="pc" .../>`; `from_tnet()` maps attributes back in table order and reuses the proven loaders. The internal stream lives in `records_save/records_load` and is not a file format. Keep a read-only legacy `.ptw` loader for one version.
- **Delete all vendor-format code**, including its container readers, workspace importer, converter, corpus tests, asset tree and catalog readers, file APIs and UI actions. Remove `cipher`, `twofish` and `miniz_oxide` from `Cargo.toml` (zero dependencies afterwards: also makes the WASM build trivial). Update README and `task.md`. Never reuse vendor element names in our schema.
- API/UI: save/open/list use `.tnet`; labels "Save", "Open", "Import".
- Laws: **L10** `from_tnet(to_tnet(w))` has identical `to_tnet` (idempotent) and restores every edited field. **L11** `xml::unescape(xml::escape(s)) == s` for all strings (property test, 2000 random strings incl. tabs, quotes, `&amp;`, unicode). **L12** malformed XML never panics (property test on truncations and random bytes). **L13** a legacy `.ptw` loads to a workspace equal to the one saved.
- Done when: all old persistence tests also pass through `.tnet`, removed vendor extensions are absent from the repo except the changelog, `Cargo.toml` has no dependencies, e2e save/open works.

## 4b. P0b: robust XML gameplay (the file is the product)
Players will edit, share and break these files by hand, like draw.io files. Loading must never crash, hang or half-load.
- **Schema versions + migration:** `version="1"` now; `from_tnet` accepts any version `<= current`, runs migrations in order (`migrate_1_to_2` ...), rejects newer with "made by a newer TakumiNet". Test with a frozen v1 fixture kept forever in `tests/fixtures/`.
- **Validation with useful errors:** every error names element, attribute and line ("line 14: <link> refers to device 'pc9' that does not exist"). Checks: unique ids, links point to existing devices and free ports, port names valid for the model, addresses/masks parse, VLAN 1..4094, no duplicate IPs on one subnet is a *warning* not an error. Returns `Result<Workspace, Vec<Problem>>`; the UI lists problems and offers "Open anyway without the broken parts" (drops only invalid records, reports what was dropped).
- **Forward compatibility:** unknown elements and attributes are ignored on load and preserved on re-save (carried in an `extras` list per record), so a newer file edited in an older build does not lose data.
- **Limits:** max file 8 MB, 2000 devices, 20 000 records, nesting depth 8; exceeding returns an error, never an allocation spike. XML reader is non-recursive (no stack overflow), rejects DTD/entity definitions (no billion-laughs), only the five named and numeric references.
- **Autosave and recovery:** 3 rotating snapshots in browser storage (current, previous, last-known-good = last load that passed validation); crash or corrupt snapshot falls back automatically with a visible notice. Undo/redo keeps the last 100 steps and is saved in the session, not the file.
- **Determinism:** `to_tnet` output is stable (sorted where order is not semantic, fixed attribute order, `\n` line ends, UTF-8, no timestamps) so files diff cleanly in git and two exports of the same network are byte-identical.
- **Laws:** **L29** every error string contains a line number and an element name (test over a table of 30 broken files). **L30** fuzz: 5000 random mutations of a valid file (delete/duplicate/swap bytes and lines) never panic and never return a partial workspace (either `Ok` identical to a valid network or `Err`). **L31** migration then save yields a v-current file that reloads equal. **L32** unknown attributes survive load then save. **L33** limits: a 9 MB file and a 10 000-deep nesting are rejected quickly (time < 200 ms in the test).
- **Gameplay tie-in:** templates (section 5) are ordinary `.tnet` files, so the same robustness protects lessons; "Reset lesson" reloads the pristine template; "Save my progress" exports a `.tnet` containing the lesson state.

## 5. P1: template engine
A template is a `.tnet` file in `web/templates/` plus lesson data in the same file (flat elements, so the P0 reader handles them):
```xml
<lesson id="t1" title="Connect two computers" level="1" minutes="5" goal="PC0 can ping PC1"/>
<step n="1" text="Click PC0, open Desktop, IP Configuration, set 192.168.1.10 / 255.255.255.0"/>
<check id="c1" kind="ping" from="pc0" to="pc1" expect="ok" label="PC0 reaches PC1"/>
```
Check kinds (all evaluated by the real engine, no faking): `ping` (ok/fail), `ttl` (value), `http` (url returns title), `lease` (device has DHCP address), `arp` (entry exists), `route` (prefix present). `Workspace::run_checks() -> Vec<CheckResult>`; endpoint `GET /api/checks`.
- UI: start screen = gallery of cards (own 3D icons + mascot `wave`/`happy`), "New blank", "Open file", "Import". A **lesson panel** (steps with tick marks) and a **Check my work** button; mascot `happy` + `popUp` sound when all checks pass, `think` while running, `error` + `errorMsg` sound on failure with a hint.
- Laws: **L14** a check is true iff the same command typed in the terminal succeeds. **L15** loading a template twice yields identical workspaces. **L16** every template loads with 0 unresolved devices/ports (validator test over `web/templates/*.tnet`).
- Done when: a lab-style test for each check kind; gallery renders in Chrome with 0 broken images.

## 6. P2: the 5 beginner templates (G1)
Each ships **starting state** (blank config, learner does the work) and a hidden **solved state** used only by its test. Acceptance for each = a test in `tests/templates.rs` that loads the template, applies the scripted solution through the real CLI/API, runs checks, all pass; and before the solution, the main check **fails**.
| # | Title | Topology (icons) | Learner does | Checks |
|---|---|---|---|---|
| T1 | Connect two computers | PC0 -- PC1, cross cable (`devices/pc`, `cables/cross`) | set static IPs 192.168.1.10/24 and .11/24 | ping pc0->pc1 ok |
| T2 | A star network with a switch | Switch0 + PC0, PC1, PC2 (`devices/switch`) | IPs in 192.168.1.0/24, ping all pairs, read `show mac address-table` | 3 pings ok; mac table has 3 entries |
| T3 | Home network with automatic addresses | home router/`homerouter` + laptop + PC + server (DHCP + web) | turn DHCP on at server, set PCs to DHCP, open the web page | both `lease`; `http` page ok |
| T4 | Two networks joined by a router | PC0, PC1 -- Switch -- Router -- Switch -- PC2, PC3 | IPs + default gateways, router interface IPs, `no shutdown` | ping pc0->pc3 ok, `ttl` 127, `route` connected prefixes |
| T5 | Visit a website by name | PCs + Switch + Server (DNS + web) | server IP, DNS record `www.takumi.lab`, PC DNS setting, browse the name | `http` by name ok; `nslookup` resolves |
Use real components only (no stubs). Template names, text and addressing are original. Run order T1 to T5, one commit each. Law per template (**L17-L21**): the failing-before / passing-after pair is the law's test.
After the five: write T6-T10 prompts in `docs/templates-next.md` (VLANs, router-on-a-stick, static routes, ACL, NAT) but do not build them.

## 7. P3: import / export in the browser (G2, draw.io style)
- **Export**: toolbar/File menu -> downloads `<name>.tnet` via a Blob link (no server write). Also "Export PNG" of the canvas (SVG serialise -> canvas -> download), nice to have.
- **Import**: file picker and drag and drop anywhere on the workspace; accepts `.tnet` only. Bad file -> mascot `error` + readable message, never a blank screen.
- **Autosave**: every edit debounced 1 s to `localStorage` (or IndexedDB if > 4 MB); on load offer "Restore last session". Wrap every storage call in try/catch, app must work without storage.
- Laws: **L22** export then import yields an identical workspace (browser e2e via the HTTP API: POST exported text, GET workspace, compare). **L23** an invalid file never changes the current workspace (all-or-nothing load).

## 8. P4: "live" feel
Verify each in Chrome and fix what is missing: PDU animation along the real path at 1x speed in Realtime; link LEDs green/amber/red from port state; device state change sounds (`devicePlacement`, `removeDevice`, `popUp`, `errorMsg`); terminal typing answers instantly; mascot states in empty/error/loading. Law **L24** event order in Simulation mode follows the forwarding path (test on T4).

## 8b. P4b: "Watch it think": the network engineer view
**Concept (owner: "I love to see the computer or the packet do it").** The learner should *watch* the network work, slowly, and understand each step, not just read pass/fail. Four views of the same captured events, plus a live check runner. No new engine data is needed for most of it: it reads the events the simulation already records (`web/js/simulation.js`, per-hop `layers`, TTL, MACs).

**Research it is based on (checked 2026-11-03):**
- Wireshark's main window has three linked panes: packet list (one summary line per packet), packet details (the selected packet's fields as a tree) and packet bytes (raw data, with the field selected in the tree highlighted), plus a display-filter bar. Source: [Wireshark User's Guide 3.3](https://www.wireshark.org/docs/wsug_html_chunked/ChUseMainWindowSection.html).
- Wireshark's Flow Graph is a ladder diagram: one vertical line per host, one arrow per packet, port numbers at the arrow ends, filterable by ICMP/TCP flows. Source: [Wireshark User's Guide 8.20](https://www.wireshark.org/docs/wsug_html_chunked/ChStatFlowGraph.html).
- Packet Tracer's Simulation mode stops time and shows packets as animated envelopes you step through with Capture/Forward, an Event List with filters, and a PDU window with an **OSI Model tab (In Layers / Out Layers per device)** and Inbound/Outbound PDU Details. Source: Packet Tracer help page mirror [mode_simulation_PDUinfo](https://gemfury.com/koyuawsmbrtn/deb:PacketTracer/-/content/opt/pt/help/default/mode_simulation_PDUinfo.htm) and a CCNA lab handout ([Cisco lab 3.2.4.6 PDF](https://cisco.tu-sofia.bg/wp-content/uploads/courses/CCNA1/course/files/3.2.4.6%20Packet%20Tracer%20-%20Investigating%20the%20TCP-IP%20and%20OSI%20Models%20in%20Action%20Instructions.pdf)). We use these only as a description of *behaviour*; no Cisco text or art is copied.
- MiniNAM (Mininet animator): playback speed control to slow packets down, packets colour-coded by type and by source node, show/hide filters, aimed at teaching. Source: [MiniNAM, UCC](https://ucc.ie/en/misl/research/software/mininam).
- **Not verified:** I found nothing on GNS3 or EVE-NG packet visualisation, and Wireshark's current default colouring-rule table and the Follow TCP Stream dialog were not covered. Do not claim parity with them.

**Build (all browser-side, vanilla JS in `web/js/`, one new file per view):**
1. **Capture table** (Wireshark-style, bottom dock, tab "Capture"): columns No., Time, Source, Destination, Protocol, Length, Info; row colour by protocol (fixed palette, same colour on the canvas packet); click selects a packet. Display-filter box with a small grammar: `icmp`, `arp`, `tcp`, `udp`, `http`, `dns`, `dhcp`, `ip.src == 10.0.0.1`, `ip.dst == ...`, `eth.addr == ...`, `ttl < 5`, joined by `&&`, `||`, `!`. Invalid filter turns the box red with a message; never throws. Filter logic is a pure function in `web/js/capture_filter.js`, unit tested under `tests/js/` the same way the other JS tests run.
2. **Details tree + bytes pane** (right of the table): selected packet as an expandable tree (Frame, Ethernet II, IPv4/ARP, ICMP/TCP/UDP, application). Bytes pane shows hex + ASCII; clicking a tree node highlights its byte range. Bytes come from the packet model (`src/net/packet.rs` already builds real headers with checksums); add `GET /api/capture/bytes?id=` returning hex of the frame as built on the wire.
3. **Ladder diagram** (tab "Flow"): one vertical lane per device on the path, one arrow per hop, labelled with the Info text and TTL; click an arrow selects the packet in the table and the canvas. Pure SVG, laid out by a pure function `ladder(events) -> {lanes, arrows}` (tested).
4. **Narration** (the "watch it think" part): each event carries a plain-English line generated from the real state, e.g. "Switch0 does not know PC1's MAC yet, so it floods the frame out of all other ports", "Router0 decrements TTL 128 to 127 and forwards", "PC1 has no ARP entry for 192.168.1.1, so it asks first". The mascot sits beside the narration (`think` while stepping, `happy` on delivery, `error` on a drop with the reason). Narration text is generated in Rust next to the event (`src/net/fwd.rs` already notes `routed: TTL a -> b`); add a `note` for flood/learn/ARP/drop cases. Own wording, written from the protocol behaviour.
5. **Playback controls** (existing sim buttons): speed 0.25x / 0.5x / 1x / 2x slider, Step, Back, Play, Reset; keyboard: Space = play/pause, Right = step, Left = back. The animated packet on the canvas is coloured with the protocol colour.
6. **Live check runner**: pressing "Check my work" lists each lesson check; each row shows a spinner, then green tick or red cross with its reason; the canvas highlights the path of the ping it is running and the capture table fills with the packets it sent. The checks are the real ones from section 5 (`GET /api/checks`), so what the learner sees is what the test uses.
7. **Export**: "Save capture" downloads the capture as `.pcap` (libpcap global header, magic `0xa1b2c3d4`, link type 1, one record per frame; write it in `src/storage/pcap.rs`, std only). The file must open in Wireshark: **tested** by re-parsing our own file with a minimal reader in the test and by the owner opening one by hand.

**Laws:** **L24b** the capture table lists exactly the events the engine recorded, in time order, none dropped or duplicated. **L25b** the filter `a && b` equals the intersection of filter `a` and filter `b` (property test over generated packets and filters). **L26** the bytes pane for an IPv4 header has a valid RFC 1071 checksum (reuses L3). **L27** a `.pcap` we write re-parses to the same frames (round trip). **L28** the ladder has exactly one arrow per hop and lanes in path order (T4: PC0 to PC3 gives 5 lanes).

**Done when:** on template T4, step through a ping and see in the three panes and the ladder the ARP exchange, the ICMP echo, the TTL going 128 to 127, the narration for each step, and the checks lighting up; a `.pcap` of it opens in Wireshark (owner check); no console errors; no broken images.

## 9. P5: engine in the browser (WebAssembly) and offline (G3)
Decision (owner, 2026-11-03): the Rust engine runs **in the browser as WebAssembly**; the server only serves static files (a tiny machine is enough, no shared-state problem, many users at once). The install of the target is **approved**: `rustup target add wasm32-unknown-unknown` (nothing else; no wasm-bindgen, no npm, no wasm-pack: use the raw `extern "C"` ABI and a ~100-line JS loader).
- **Step 1, split the crate:** `src/lib.rs` holds the engine (`net`, `workspace`, `cli`, `cmd`, `model`, tnet), `src/main.rs` keeps only the HTTP server. The server becomes optional (dev + static hosting).
- **Step 2, engine API for WASM:** one exported function `handle(request_ptr, len) -> response_ptr` taking the same method/path/query/body the HTTP layer takes today and returning the same JSON, so `web/js/*` keeps calling `fetch('/api/...')` through a thin shim `web/js/engine.js` that routes those calls to WASM (and falls back to the server if WASM fails to load). Reuse `src/http/*::route` functions unchanged: factor them so they do not touch `TcpStream`.
- **Step 3, state per tab:** workspace lives in WASM memory; persistence = P0b snapshots in browser storage.
- **Step 4, service worker** `web/sw.js` caches `/`, `/js/*`, css, `/art3d/*`, `/sounds/*`, `/templates/*`, `engine.wasm`: full offline.
- **Size/speed budget:** `engine.wasm` <= 3 MB uncompressed (release, `opt-level="z"`, `lto`, `panic="abort"`), cold start <= 1 s, a ping on template T4 <= 50 ms. Measure and record in `result.md`.
- **Laws:** **L25** the same scripted lab gives byte-identical output through the native test harness and through WASM (run the 20 lab scripts in headless Chrome via the Chrome tool and compare to the native results stored as fixtures). **L34** offline reload (Chrome offline mode) shows the full working app, no console errors. **L35** two browser tabs have independent workspaces.
- **Interim (only if WASM is blocked):** per-session workspaces on the server (session cookie, 30 min idle expiry, max 200 sessions, 5 MB each). Ask the previous session before choosing this.

## 10. P6: public face and housekeeping
- About/licence page `web/about.html`: what this is, own code/art, how art was made (ChatGPT sheets + `tools/build_art.py`, `MANIFEST.json`), no Cisco account needed, "not affiliated with Cisco". Link in the Help menu.
- README rewritten around the product (quick start with Docker, templates, file format spec in `docs/format.md` with the XML schema).
- Rebuild Docker (`docker rm -f pt-web`, build, run on 3000); the current image is stale.
- Remaining art gaps: the six toolbar glyph fallbacks, the wand sparkles (low priority). Prompts are in `web/art/3d/CHATGPT.md`.

## 11. Assets: what to use where (use wisely, all already in the repo)
- Template gallery cards: device icons as the card art, level badges from `misc/*`, mascot `idle/wave/happy`.
- Lesson panel: mascot `think`; success: `happy` + `popUp.wav`; failure: `error` + `errorMsg.wav`; sleeping mascot when idle > 60 s.
- Cables palette: `cables/*` (straight, cross, console, fiber, phone, coiled, coax, usb). Groups: `groups/*`. Desktop apps: `apps/*`.
- Missing and allowed to request from the owner (ChatGPT, words only): template cover images, level badges, a "check passed" medal, an empty-state illustration. Write the prompts into `CHATGPT.md`; do not block on them (use existing icons meanwhile).

## 12. Task order and gates
P0 -> P0b -> P1 -> P2 (T1..T5) -> P3 -> P4 -> P4b -> P5 -> P6. Milestones (report in one short message, then keep going, do not stop): after P2 the owner can review G1 live; after P4b the engineer view. Every task: laws added, `result.md` updated, `cargo test` green, pushed. Final report to the owner lists: laws and test names, commands, anything unverified, any open `ASK-CLAUDE` questions.
Owner reference: the real Packet Tracer is installed on the owner's Fedora laptop; use it only if the owner offers access. Otherwise rely on the protocol specs and the existing lab tests, and say what was not compared.
