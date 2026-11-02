# Handoff: TakumiNet (pt-web), continue the 3D art migration

Repo `/Users/mac/Desktop/Apps/TakumiNet`, branch `main`, GitHub `Kmassidik/TakumiNet`. Rust (std only) Packet Tracer clone, plain HTML/SVG/JS front end. Read `task.md` (plan, PR list) and `web/art/3d/README.md` first. Read nothing else until needed.

## Hard rules (the user's words win over any default)
1. After EVERY build step: `cargo test` must pass, then commit and push to `main`. **Never add Co-Authored-By or any attribution line**, in commits or PR text.
2. **Never install anything** (Bend, Kani, Lean, Playwright, rembg...). Ask first. Python 3 + Pillow, swift, cargo are already there.
3. No Cisco/Packet Tracer art, names or files may be used or shown to any image generator. Own art only (README rule: "own art, rebuilt from scratch").
4. Back claims with data (tests, measurements, sources). Say what is unverified. No "proven" unless a checker ran.
5. Code style: readable, small functions, few comments, senior-level, no AI slop.
6. Be token-frugal: use Grep/Read with line ranges, no repeated full-file reads, no recaps.
7. **If you are confused, or a step fails twice, STOP and ask the previous session, not the user:** `SendMessage({to: "takuminet-d6", message: "<one specific question + what you tried>"})`. It has the full conversation and knows what the user wants. Only if that session does not answer, ask the user. Do not guess, do not loop.

## State (done and pushed, last commit `b9bd2eb`)
- 97 own 3D icons in `web/art/3d/<group>/<name>.png` (256x256, transparent). Groups: devices(31 = names of the old flat SVGs in `web/art/`), toolbar, sim, cables, groups, apps, misc, mascot. `MANIFEST.json` lists sources.
- Pipeline: ChatGPT sheets (3x2) -> `tools/cutout.swift` (macOS Vision, compile: `swiftc -O tools/cutout.swift -o /tmp/cutout`) -> `tools/slice_sheets.py` -> `tools/build_art.py ~/Downloads /tmp/cutout` (name table `SHEETS`, invariant checks, rewrites MANIFEST). Prompts for new sheets: `web/art/3d/CHATGPT.md`.
- Server route `/art3d/<group>/<name>.png` (`src/http/static_routes.rs`, `art3d_file` in `src/http/util.rs`). Front end helper `icon3d('group/name')` in `web/js/icons.js`.
- Toolbar (`web/js/toolbars.js`) and sim buttons (`web/index.html`, `web/js/actions.js`) already use it.
- Ratchet `tests/assets_free.rs` counts remaining vendor refs per file (`BASELINE`). Lower numbers as you replace; `baseline_is_not_stale` forces it. `tests/art3d.rs` checks icons on disk == manifest == what the front end uses.
- Tests as of now all green: 139 unit, art3d 4, assets_free 3, corpus 1, e2e 24.

## To do, in order (one commit each)
1. **Devices** (decided): the icon paths come from the SERVER, so edit the `icon`/`art` strings in `src/workspace/palette.rs` (32 `art/Workspace/Logical...` paths) to `/art3d/devices/<name>.png` via one model->name table (`asset()` passes paths starting with `/` through unchanged). Then clean the JS call sites: palette (`web/js/palette.js`, server list in `src/workspace/palette.rs`, 32 `art/Workspace/Logical` paths), canvas (`web/js/topology.js`), device windows (`device_window.js`, `device_tabs.js`) -> `devices/*`. Map device model -> icon name via one table, not scattered ifs.
2. **Cables**: palette cable row -> `cables/*` (straight, cross, console, fiber, phone, coiled, coax, usb).
3. **Palette groups** -> `groups/*`. **Desktop apps** (`device_tabs.js`) -> `apps/*`.
4. **Brand**: `web/index.html:13` still has `/assets/art/app.png` and the text "Cisco Packet Tracer". Rename to **TakumiNet**, use `mascot/idle.png` as logo/icon, other poses for empty/error/sleep states. Update title tags and README.
5. Six toolbar buttons use text glyphs (simple PDU, complex PDU, drawing, ellipse, navigate, grid). Write a ChatGPT prompt for one 3x2 sheet in `CHATGPT.md` (words only, same style block as the others), tell the user to generate it (only the user can), then add to `SHEETS` in `build_art.py`.
6. Physical view (decided): `device_tabs.js:72` already falls back to the device icon on error, so just use the 3D device icon there. A dedicated rack sheet is optional, later.
7. Goal: `BASELINE` in `assets_free.rs` becomes empty, then delete it and the `/assets` mount docs.
8. Component audit with Claude in Chrome (user's choice over Playwright): run `PORT=3111 ./target/debug/pt-web`, drive every button and tab, list placeholders. Known defects: `src/cmd.rs:163` prints hardcoded `TTL=128` for ping (PC0->PC2 crosses a router so it should be 127); Dialup app action empty; 6 toolbar buttons empty; Programming and Attributes device tabs say "not available".
9. Rebuild Docker (`docker rm -f pt-web`; image is stale; first build is slow, LTO). Wand icon lost its sparkles in the cutout (retry cut alone): regenerate only if the user cares.

## Verifying in the browser
Chrome extension tab: load tools with ONE ToolSearch call (`select:mcp__claude-in-chrome__tabs_context_mcp,...navigate,computer,javascript_tool,read_network_requests`). Check broken images with `[...document.images].filter(i=>!i.complete||!i.naturalWidth)`. Stop the local server when done.

## Bend
Not installed, never run. The user chose the plain test workflow (`provness/` has LAWS.md L1-L9 and result.md). Do not claim anything is Bend-proven.

## Decisions already made (do not re-ask)
- Sim `step` and `forward` both call `stepSim(1)` (`chrome.js:38`), so the two near-identical step icons (`stepa`, `stepb`) are fine.
- Ping TTL: write a failing test first (`cmd.rs` ping across a router must report 127, same subnet 128), then read the TTL from the delivered packet instead of the hardcoded 128 (`src/cmd.rs:163`; packet TTL lives in `src/net/fwd.rs`).
- Name is TakumiNet, logo is the fluffy mascot. Sounds are generated locally (`tools/make_sounds.py`), done.

## Phase 2 after art steps 1-4 (decided by the previous session, user said I am the decision maker)
Do NOT keep polishing art once devices, cables, groups, apps and brand are done. Functionality is what makes it "usable like the real one". Follow the section **"Roadmap to usable like the real one"** at the end of `task.md`: build `tests/labs/` first (CCNA lab conformance), then items 1-8 in that order. Real algorithms with property tests (Dijkstra vs brute force, loop-free tables, EIGRP/OSPF formulas), not hop-count shortcuts. Measured gap that motivates it: `src/workspace/routing.rs::recompute_routing` uses one hop-count search for RIP, OSPF and EIGRP.
