# PRD-UI: canvas rebuild of the front end

Status: draft, waiting for the owner to say "build". Builder rules are section 0 of `PRD.md` (failing test first, commit and push each step with no attribution line, install nothing, fix any error you see, ask `takuminet-d6` when confused). This file only adds UI scope.

## 1. Why
Today the page is hand-written HTML plus one SVG. Measured: the right panel is fixed at 330 px, the capture dock at 304 px, the palette at 7 columns of 26 px (`web/workspace.css`). Nothing in the main layout can be resized, and every device and cable is a DOM node. The owner wants a canvas workspace, a layout the user controls, and far fewer kinds of UI.

## 2. Decisions (owner, 2026-11-03)
1. The workspace is one HTML5 `<canvas>` (2D context). SVG topology is deleted.
2. The UI has exactly four components: **Button**, **Modal**, **Topbar**, **Workspace**. Nothing else may add a new layout container.
3. The right sidebar stays, can be dragged to any width, and can be hidden completely. It is part of Workspace.
4. The device palette is drawn inside Workspace as a left overlay and hides with the sidebar toggle.
5. Every dialog (device window, IP config, terminal, command prompt, browser, editor, firewall, PDU, preferences, lesson gallery, confirm and prompt) is a Modal.
6. Cut features stay cut (see `git show e1ff0a7`). Do not bring back the removed menus or desktop apps.

## 2b. Toolchain (owner: TypeScript, Bun, as few packages as possible)
- New UI code is TypeScript in `web/ts/` (strict, `noUncheckedIndexedAccess`). One dev dependency: `typescript` (type checking only). Runtime dependencies: none.
- `bun run check` type-checks; `bun run build` bundles `web/ts/main.ts` to the single file `web/js/ui.js`, which is committed so the Rust server and Docker image need no Node or Bun.
- Add a test that rebuilds into a temp file and fails if `web/js/ui.js` is stale. Add `/js/ui.js` to `web/sw.js`.
- Old plain JS files are deleted as each phase replaces them. No new packages without asking `takuminet-d6`.
- Existing Node `vm` tests keep running with `node --test`. New TS code is unit-tested through its built output or by importing the modules in Bun; pick one in C0 and keep it.
- Unverified: whether `bun build` output runs on the owner's Chrome without changes (checked in C0 with a smoke test).

## 3. Components (public API, one file each in `web/js/ui/`)
- `Button({label, icon, title, onClick, toggled, disabled})`: the only clickable control. Toolbar buttons, menu items, tabs, sidebar tabs and modal buttons are all Buttons. Keyboard focusable, visible focus ring.
- `Modal({title, body, buttons, onClose})`: one stack, Esc closes the top one, backdrop click closes, draggable by the title, focus trapped. Replaces `modal.js`, `windows.js`, all `*-dialog` and `*-window` markup in `index.html`.
- `Topbar({menus, toolbars, status})`: brand, menus (File, Edit, View, Tools, Help), the icon toolbar, a sidebar toggle Button, a status text. Built from Buttons only.
- `Workspace({model})`: owns the `<canvas>`, the palette overlay, the collapsible sidebar and the splitter. Sidebar tabs: Lesson, Events, Capture, Flow, all Buttons.

`index.html` shrinks to a mount point and script tags. Target: under 60 lines.

## 4. Canvas architecture (split into small modules, each unit-tested)
- `camera.js`: pan, zoom (wheel, pinch, buttons), world to screen and back. Zoom 10% to 400%.
- `scene.js`: turns the workspace JSON from `/api/workspace` into drawables (devices, links, labels, port LEDs). Pure function, no DOM.
- `draw.js`: draws a scene to a 2D context. Handles `devicePixelRatio`, redraws only when something changed (dirty flag plus `requestAnimationFrame`).
- `hit.js`: point to device, link, port. Spatial grid so lookup is O(1) for large topologies.
- `input.js`: select, box select, drag devices, cable tool, PDU tool, pan with space or middle drag, delete, copy and paste, undo and redo. Same actions the server already exposes.
- `packets.js`: animated packets along the real path, link highlight while a packet is on it, speed from the existing playback speed control.
- `physical.js`: the Physical tab drawn on the same canvas (same camera), reusing 3D icons from `/art3d`.
- `images.js`: preloads `/art3d` icons once; draws a placeholder box until loaded.
- Accessibility: a visually hidden list mirrors devices (name, type, IP) and each is focusable and reachable by Tab; Enter opens the device Modal. Sidebar and Topbar are real DOM.
- Offline: the new files go into `web/sw.js`; the service worker test must stay green.

## 5. Layout behaviour
- Sidebar width: drag the splitter; min 240 px, max 60 percent of the window; double click resets to 330 px.
- Sidebar toggle in the Topbar and the key `\`; hidden means width 0, the canvas takes the full width.
- The capture dock becomes the Capture and Flow tabs of the sidebar (no bottom dock). Packet Details and Bytes appear below the list inside the tab, with a horizontal splitter.
- Palette overlay: groups as a vertical Button strip, devices in a popover grid; drag a device onto the canvas to place it.
- Width, hidden state and zoom are saved in `localStorage` (wrapped in try/catch, the page works without it).

## 6. Bug to fix inside this rebuild: "Play shows nothing, only sound"
Report (owner): pressing Play, nothing visibly runs, only the sound plays.
Reading of the code (unverified, needs a failing test first): `togglePlay()` in `web/js/actions.js` replays the recorded event list. On a fresh or empty log the first timer tick finds no events and stops itself, so the user sees no motion. The click sound comes from the generic `data-sfx` handler in `chrome.js`, so it plays even when nothing happens.
Required behaviour:
1. Play with recorded events animates each one: the packet moves along its path on the canvas, the link under it is highlighted, and the Events row is highlighted.
2. Play with no events does not pretend: it shows a visible hint ("Send a PDU first") and highlights the PDU tool. The click sound plays only when something starts.
3. Pause stops the packet at its position; Step moves one event; Back moves one event back; Reset clears.
4. The play icon shows the real state (Play or Pause) and never gets stuck.
Test: a recording fake 2D context asserts that after Play, `fillRect` or `drawImage` is called at moving positions for at least 3 frames, and a second test asserts the empty-log hint.

## 7. Laws (add to `provness/pt-web/LAWS.md`, each with an executable test and an entry in `result.md`)
- L36 hit-test: for 1000 random devices and points, `hit(point)` returns a device whose box contains the point, and returns none when no box does (brute force comparison).
- L37 camera round trip: `toWorld(toScreen(p)) == p` within 1e-6 for random zoom and pan.
- L38 scene purity: the same workspace JSON gives the same scene; no DOM access (run in plain Node).
- L39 draw determinism: the same scene draws the same sequence of context calls (recording context).
- L40 sidebar: width after drag stays within min and max; hidden means canvas width equals window width.
- L41 Modal stack: Esc closes only the top Modal; focus returns to the opener.
- L42 Play: the behaviour in section 6.
- L43 one layout rule: a test fails if `index.html` or the JS creates any element type other than the four components, canvas and its hidden mirror list.
- L44 performance (measured, not assumed): 200 devices and 300 links redraw in under 8 ms on the owner's machine in Chrome; record the real number in `result.md`. If it fails, optimise, do not weaken the number.
Never write "proven". Say "tested" and name the test.

## 8. Phases (one commit each, `cargo test` and `node --test tests/js/*.test.js` green first)
- C0: `Button`, `Modal`, `Topbar`, mount page; port confirm/prompt and existing dialogs to Modal. Delete `windows.js` and old dialog markup.
- C1: `camera`, `scene`, `draw`, `images`; static topology on canvas, zoom and pan. Delete `topology.js` SVG path.
- C2: `hit`, `input`: select, drag, cable, delete, copy, paste, undo, redo, PDU tool.
- C3: `packets` and the Play fix (section 6).
- C4: Workspace sidebar: splitter, full hide, Lesson, Events, Capture, Flow tabs; remove the bottom dock.
- C5: palette overlay and drag-to-place.
- C6: physical view on canvas; hidden accessibility list; offline manifest; remove dead CSS and the old SVG code; update `README` and the asset map.
After C3 and after C6 send one short report and keep going.

## 9. Not in scope
New devices, new protocols, new templates, a different engine. Rust code stays as is except what a front-end change needs.

## 10. Risks (honest)
- Canvas loses free browser features (text selection, DOM focus, screen readers). Mitigation: the hidden mirror list and real DOM for text-heavy parts.
- Large rewrite touches about 15 files and 5 JS test files; tests that read DOM ids will need rewriting. Keep the old tests' intent.
- Performance numbers are targets until measured.
