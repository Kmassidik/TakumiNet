# TakumiNet PRD: a free network emulator that runs in the browser

Owner's words, kept: a replacement for the account-and-registration-gated Cisco Packet Tracer. Same idea and same kind of functions, our own code, our own art, free for everyone to learn from. Runs in the user's browser. We ship **templates for learning courses**; users build their own and **save / import / export XML like draw.io does**. The browser can cache assets, so it keeps working offline.

Read first: this file, then `task.md` (history, roadmap, audit) and `provness/pt-web/LAWS.md`. Do not read anything else until a task needs it.

## 0. Rules for the builder (omp). These override defaults.
1. Every task = failing test first, then code, then `cargo test` green, then commit and push to `main`. **No Co-Authored-By, no attribution line, ever.**
2. **Install nothing** (no Bend, Kani, Lean, Playwright, npm, rustup targets). Ask in `QUESTIONS.md` first. Python 3 + Pillow, swift, cargo are present.
3. **Own art and own code only.** Never copy, download or reference Cisco files, names, icons, text or output. Do not feed any vendor file to an image generator. `tests/assets_free.rs` must stay at 0.
4. **Fix what you find.** If you see a bug, wrong output, broken image or console error while working: write a failing test, fix it, commit it separately (`fix: ...`), note it in `provness/pt-web/result.md`. Do not skip it, do not ask permission for fixes.
5. If you are unsure about *what the user wants*, or a step fails twice: stop, append the question and what you tried to `QUESTIONS.md`, tell the user, wait. Do not guess a product decision.
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
- Files: own text `.ptw` (to be replaced, see P0), Cisco `.pkt/.pka` import (kept as optional compatibility).
- Server: Rust std-only HTTP server, hosted; the browser is only the UI.

## 3. Goals
- **G1 (first, what the owner wants to see):** 5 beginner templates, each opens in one click and **runs live**: packets animate, link lights change, terminal commands answer, and a "Check my work" button turns green when the lesson goal is met.
- **G2:** draw.io-style files: build anything, **Export** an XML file (download), **Import** one (picker or drag and drop), autosave in the browser. Our own schema.
- **G3:** works offline after first load (browser cache).
- **G4:** clean public face: name TakumiNet, mascot, licence/provenance page, no account, no login.

Non-goals now: BGP, HSRP, accounts, cloud sync, multiuser, grading server, mobile layout.

## 4. P0: own XML format (prerequisite for G1 and G2)
Native file = our own XML, extension `.tnet`, root `<takuminet version="1">`. The plan already agreed:
- `src/storage/xml.rs`: tiny std-only writer/reader for a flat list of self-closing child elements with attributes. Escape `& < > " '` and encode tab/CR/LF as `&#9; &#13; &#10;`. Unescape named and numeric references. Malformed input returns `None`, never panics.
- `src/workspace/tnet.rs`: **table-driven converter**: `RECORDS: &[(&str, &[&str])]` gives the field names of each of the 49 record types (take them from the match patterns in `ptw_load.rs`, longest form; extra trailing fields become `v<N>`; unknown tags are kept losslessly). `to_tnet()` turns each line of the existing record stream into `<device id="pc0" kind="pc" .../>`; `from_tnet()` maps attributes back in table order and reuses the proven loaders. Rename `ptw_save/ptw_load` to `records_save/records_load` (internal stream, no longer a file format). Keep a read-only legacy `.ptw` loader for one version.
- Cisco `.pkt/.pka/.pktz`: **import only**. Remove "Export Opened .pkt" and `pkt_source`. Never reuse Cisco's element names in our schema.
- API/UI: save/open/list use `.tnet`; labels "Save", "Open", "Import .pkt".
- Laws: **L10** `from_tnet(to_tnet(w))` has identical `to_tnet` (idempotent) and restores every edited field. **L11** `xml::unescape(xml::escape(s)) == s` for all strings (property test, 2000 random strings incl. tabs, quotes, `&amp;`, unicode). **L12** malformed XML never panics (property test on truncations and random bytes). **L13** a legacy `.ptw` loads to a workspace equal to the one saved.
- Done when: all old persistence tests also pass through `.tnet`, corpus test (299 `.pkt` import) still passes, e2e save/open works.

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
- **Import**: file picker and drag and drop anywhere on the workspace; accepts `.tnet` (native) and `.pkt/.pka` (compat). Bad file -> mascot `error` + readable message, never a blank screen.
- **Autosave**: every edit debounced 1 s to `localStorage` (or IndexedDB if > 4 MB); on load offer "Restore last session". Wrap every storage call in try/catch, app must work without storage.
- Laws: **L22** export then import yields an identical workspace (browser e2e via the HTTP API: POST exported text, GET workspace, compare). **L23** import never changes the saved server state when the file is invalid.

## 8. P4: "live" feel
Verify each in Chrome and fix what is missing: PDU animation along the real path at 1x speed in Realtime; link LEDs green/amber/red from port state; device state change sounds (`devicePlacement`, `removeDevice`, `popUp`, `errorMsg`); terminal typing answers instantly; mascot states in empty/error/loading. Law **L24** event order in Simulation mode follows the forwarding path (test on T4).

## 9. P5: offline (G3)
Service worker `web/sw.js` caching `/`, `/js/*`, `/style.css`, `/workspace.css`, `/art3d/*`, `/sounds/*`, `/templates/*`. The engine is still the Rust server, so offline can only mean UI loads from cache and shows "engine offline, read-only". Full offline needs the engine compiled to WASM: **write the study in `docs/wasm.md` (what blocks `wasm32-unknown-unknown`, estimate), do not install the target.** Law **L25** (Chrome, offline mode): reload shows the app shell and the offline notice, no console errors.

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
P0 -> P1 -> P2 (T1..T5) -> P3 -> P4 -> P5 -> P6. Gate after P2: owner reviews G1 live. Every task: laws added, `result.md` updated, `cargo test` green, pushed. Final report to the owner lists: laws and test names, commands, anything unverified, anything in `QUESTIONS.md`.
Owner reference: the real Packet Tracer is installed on the owner's Fedora laptop; use it only if the owner offers access. Otherwise rely on the protocol specs and the existing lab tests, and say what was not compared.
