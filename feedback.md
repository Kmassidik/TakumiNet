# Feedback

What the owner sees wrong, where the trouble is in the code, and the todo list for each point.

How this file is used:
1. Owner reports a problem.
2. I research it and write the exact location here. Nothing is built or fixed.
3. Owner reads the file.
4. The word **build** starts the work. Until then nothing changes.

Status values: `open`, `planned`, `done`. Locations come from reading the code, not from running a browser, unless a line says "checked in browser".

## Test rules for every item (apply when building)

Each item below ends with a **Tests** block. Every item gets three kinds of check:

- **Behaviour test**: bun (`tests/ts`) or node (`tests/js`) or cargo, as the item needs.
- **Error test**: the failing input or the broken state, to prove the error is shown and nothing crashes.
- **Bend check**: a small `tests/bend/<item>.bend` file that states the item's pure rule (for example the file-extension rule or the layout width sum) and is checked with `bend <file> --verdict`. Bend cannot see the DOM, so it checks the rule, and the behaviour test checks the page.
- **Slop guard**: one repo-level test (`tests/ts/slop_guard.test.ts`) that fails when a known bad pattern comes back: a second hand-written dialog, a `.html` link, a hard-coded colour outside the tokens, a `.tnet` extension.

Not included, by owner's decision: no new formal-verification laws. Nothing is added to `provness/pt-web/LAWS.md` or `result.md`.

Every commit: `cargo test`, JS tests and TS tests pass first. No attribution lines.

---

## F1. The front end looks like generic "slop" (done)

Owner: the front end reads as templated and generic. No screen was named.

### Research
- `web/workspace.css` is 893 lines. It defines only a handful of colour tokens in `:root` (`--panel`, `--line`, `--accent`, `--chrome`, `--text`, `--muted`) but uses about 96 different hard-coded hex colours and 41 `border-radius` rules. So most of the look is not controlled by one set of tokens.
- Two design languages sit in one app:
  - The workspace is a grey desktop chrome (`#f7f8fa`, 3 to 4px radius, 11px text).
  - The gallery and lesson cards use gradients and large radii (for example `linear-gradient(155deg, #f5f9ff…)` at `workspace.css:179`).
- `web/about.html` has its own inline stylesheet with a different palette (`--teal`, `--paper`, 14px radius cards, system font at 16px). It looks like another product.
- The dialogs and sidebar problems (F5, F7, F8) are the largest visible parts of this.

### Todo
- [ ] F1.1 Owner names the 3 worst screens, so the direction is not guessed.
- [ ] F1.2 Write one token file (colours, spacing, radius, type scale) and move every hard-coded hex in `workspace.css` onto it.
- [ ] F1.3 Give `about.html` the same tokens (it should share the stylesheet, not keep its own).
- [ ] F1.4 Remove one-off styles that F5, F7 and F8 replace.

### Tests
- Behaviour: a test reads `workspace.css` and fails if a hex colour appears outside the token block.
- Error: the same test fails with a clear message that names the line, when a hex is added.
- Bend check: `tests/bend/tokens.bend` states that every colour used is in the token set.
- Slop guard: covers the hex rule above.

---

## F2. The gallery dialog has no close button (done)

Owner: the user has to restart the web to close it.

### Research
- Markup: `web/index.html:241` to `256`, `#lesson-gallery.overlay.gallery-overlay` containing `main.preview.gallery`. The header has the network image, the title and the mascot. No close button.
- The only code that hides it is `hideGallery()` (`web/js/lessons.js:24`), called when a template opens (`lessons.js:258`) and from New, Open and Import (`web/js/actions.js:58, 82, 99`).
- Escape does not close it. `watchOverlays` (`web/ts/ui/dialogs.ts:50`) pushes each `.overlay` onto the modal stack, but `stack.escape()` is only called from the confirm and text prompt (`web/ts/ui/modal.ts:54`). The page-level Escape handler (`web/js/chrome.js:90`) clears the canvas selection and closes nothing.
- Clicking the backdrop does not close it either. Other dialogs do close on backdrop click (`device_window.js:28`, `command_prompt.js:28`, `clients.js:17`, `web_apps.js:22, 85`). The gallery has no such handler.
- It opens by itself on the first visit (`gallery_once.ts`, key `pt-web:gallery-seen`) and from File > Lesson gallery, so a new user sees it first with no way out.
- Not yet confirmed: whether any visitor can leave through "New blank". That button works, but it also resets the workspace.

### Todo
- [ ] F2.1 Add a close control to the gallery header.
- [ ] F2.2 Escape and backdrop click close it.
- [ ] F2.3 Closing returns focus to the element that opened it.
- [ ] F2.4 Do this inside the shared dialog from F5, not as a one-off.

### Tests
- Behaviour: opening the gallery, then clicking close, pressing Escape, or clicking the backdrop each hides it.
- Error: with the templates request failing (`renderGallery({error})`), the close control is still there and works.
- Bend check: `tests/bend/dialog_exit.bend`: a dialog state machine where every open state has a path to closed.
- Slop guard: every `.overlay` in `index.html` has a close control.

---

## F3. Import and export should use one common format, `.xml` (done)

Owner: `.tnet` is not commonly used.

### Research
The file content is already XML (`<takuminet version="1">`, `web/templates/t1.tnet`). The server already answers the export with `application/xml` (`src/http/file_routes.rs:80`). Only the name and the accepted type say `.tnet`. Places that hard-code it:

- Server (`src/http/file_routes.rs`): saves write `{name}.tnet` (`:28`), opens read `{name}.tnet` (`:37`), the save list filters on the `tnet` extension (`:65`), the embedded templates are `include_str!(…tnet)` (`:184` to `193`), the template reader uses `{id}.tnet` (`:208`), and the template list filters on it (`:232`).
- Engine (`src/workspace/tnet.rs`): `to_tnet`, `from_tnet`, `from_tnet_open_anyway`. The names are internal and can stay, but the doc comments and error text should say XML.
- Browser: the Open check and its error text (`web/js/actions.js:35`, `36`), the name strip on open (`:53`), the file picker `accept='.tnet'` (`:113`), the download name `.tnet` (`:124`), the drop message (`web/js/chrome.js:115`), and the texts in `boot.js:9` and `lessons.js:92`.
- Files: `web/templates/*.tnet` (10 files), `topologies/*.tnet` (7 files, some are test leftovers), and `web/sw.js` (precache list, 10 lines).
- Tests that name it: `tests/e2e.rs` (2), `tests/js/browser_files.test.js` (8), `tests/js/service_worker.test.js` (1). README and PRD mention it too.
- Leftover: `*.ptw` files in `topologies/` and a reference in `src/workspace/records_load.rs`. These belong to the old format and should go if the owner agrees.
- Risk: a generic `.xml` file can be any XML. Open must check that the root element is `takuminet` and show a clear error if not.

### Todo
- [ ] F3.1 Owner decides: should old `.tnet` files still open? (Recommended: yes, read only. Save and export always write `.xml`.)
- [ ] F3.2 Rename the 10 template files to `.xml` and update the embedded list, the reader, the listing and `sw.js`.
- [ ] F3.3 Save, open, export, import and drop use `.xml` (server and browser).
- [ ] F3.4 Open and import reject any XML whose root is not `takuminet`, with a message.
- [ ] F3.5 Update error texts, README, PRD and the tests.
- [ ] F3.6 Not done on purpose: the `topologies/*.ptw` and test-leftover files are not deleted (they may be the owner's). Old `.tnet` saves still open.

### Tests
- Behaviour: save then open round-trips as `.xml`. Export downloads `*.xml`. Dropping a `.xml` file opens it.
- Error: opening `.xml` with the wrong root, broken XML (`<broken`, already tested at `src/http/mod.rs:218`), an empty file, and a wrong extension each show an error and leave the workspace unchanged.
- Bend check: `tests/bend/format.bend`: the accept rule (extension `xml` and root `takuminet`) accepts exactly the valid names.
- Slop guard: no `.tnet` string remains in `web/`, except the legacy-read path if F3.1 says yes.

---

## F4. Print should print only the workspace, not the whole screen (done)

### Research
- `print()` in `web/js/actions.js:136` is `status('Printing…'); window.print();`. It prints the whole page.
- `web/workspace.css` has no `@media print` rule at all, so menus, toolbars, sidebar, palette and status bar all print.
- The workspace is a `<canvas id="topology">` inside `.canvas-wrap` (`web/index.html`). Canvas content prints as a bitmap at screen size, so it must be sized for the paper, and the Physical (rack) view draws on the same canvas.
- Print is reached from File > Print (`index.html:32`) and the toolbar (`web/js/toolbars.js:5`).

### Todo
- [ ] F4.1 Add print rules that hide everything except the workspace.
- [ ] F4.2 Fit the diagram to the page: fit-to-content scale, landscape.
- [ ] F4.3 Physical view prints the racks.
- [ ] F4.4 Empty workspace: tell the user there is nothing to print instead of an empty page.

### Tests
- Behaviour: print CSS hides every top-level element except the workspace (checked by reading the print rules).
- Error: empty workspace shows the message and does not call `window.print()`.
- Bend check: `tests/bend/print_fit.bend`: the scale rule keeps every device inside the page.
- Slop guard: `workspace.css` must contain an `@media print` block.

---

## F5. Dialogs and popups are inconsistent and some look broken (done)

Reference: the Preferences popup in the owner's screenshot.

### Research
Ten dialogs are written by hand in `web/index.html`, each with its own title bar and close markup:

| Dialog | Markup | Close | Notes |
|---|---|---|---|
| Preferences | `index.html:86` | `.winbtn` | Not in an `.overlay`: no backdrop, no stack, no Escape, no backdrop-click. Placed by `.prefs` (`workspace.css:835`), fixed at 120px from the top. The × sits after the title because `.devwin-title` is not a flex row for this one. |
| Gallery | `index.html:241` | none | See F2. |
| IP Configuration | `index.html:258` | `.close` | Own `.ip-titlebar` (`workspace.css:527`), closes by × only (`ip_dialog.js:70`). |
| Device window | `index.html:326` | `×` plus minimize | Minimize and close both just set `hidden` (`device_window.js:22`, `23`). |
| Command Prompt | `index.html:350` | `×` | |
| Terminal | `index.html:361` | `×` | The only one with its own Escape handler (`terminal.js:37`). |
| Web Browser | `index.html:372` | `×` | |
| Text Editor | `index.html:388` | `×` | |
| PDU Detail | `index.html:404` | `×` | Close wiring not found by search. Verify. |
| Firewall | `index.html:415` | `×` | |
| Confirm / text prompt | `web/ts/ui/modal.ts` | Cancel | The only dialog built with shared `Button` and `ModalStack`. |

- Close styles: `.close` (`workspace.css:508`), `.winbtn`, and a bare button in `.dw-btns` (`:550`).
- Each dialog has its own `onclick = () => { win.hidden = true; }` in 8 files (`actions.js`, `device_window.js`, `command_prompt.js`, `clients.js`, `terminal.js`, `web_apps.js`, `ip_dialog.js`, `lessons.js`).
- `.overlay` has `background: transparent` (`workspace.css:488`), so there is no dimming.
- Not checked in a browser: stacking when two dialogs are open, and small-screen layout.

### Todo
- [ ] F5.1 One shared dialog component in TS: title bar, close at the right edge, backdrop, Escape, click outside, focus in and back.
- [ ] F5.2 Move Preferences into it first (it is the worst), then the gallery (F2), IP, Command Prompt, Terminal, Web, Editor, PDU, Firewall, Device window.
- [ ] F5.3 Delete the per-dialog markup, the three close styles and the 8 hand-written close handlers.
- [ ] F5.4 Keep drag by title bar and maximize for the windows that have them.

### Tests
- Behaviour: for each dialog, open, close by button, close by Escape, close by backdrop.
- Error: with two dialogs open, Escape closes only the top one. A dialog whose content throws still closes.
- Bend check: `tests/bend/dialog_stack.bend`: Escape always removes the top of the stack and never the others.
- Slop guard: `index.html` has no hand-written dialog markup outside the shared component.

---

## F6. The minimize button belongs on the component, not in the bottom bar (done)

Correction to an earlier version: the palette can already be hidden. The sidebar and the palette each have a control, but not on the component.

### Research
- Sidebar: toggle button `#sidebar-toggle` in the status bar (`index.html:236`), the `\` key, code in `web/ts/ui/sidebar.ts:33` to `47`, state class `.main.sidebar-hidden` (`workspace.css:864`). It works.
- Palette: `toggle-palette` (`web/js/actions.js:178`) sets `#palette-bar.hidden`. It is reached from the toolbar "Palette" icon and View > Toggle Palette. Once hidden, the bar has no handle of its own to bring it back.
- Primary toolbar (`#toolbar-primary`) and secondary toolbar (`#toolbar-secondary`): no hide control at all. They are filled by `renderToolbar` (`web/ts/ui/toolbar.ts`).
- None of the three remembers its state after a refresh. The sidebar width is the only thing stored.

### Todo
- [ ] F6.1 One reusable "collapsible" behaviour: a small handle on the component's own edge that collapses it to a thin strip with a restore handle.
- [ ] F6.2 Use it on the sidebar (move the button from the status bar to the sidebar header, keep the `\` key), the palette, and both toolbars.
- [ ] F6.3 Owner decides: remember the collapsed state per browser. (Recommended: yes.)
- [ ] F6.4 Remove `#sidebar-toggle` from the status bar after the move.

### Tests
- Behaviour: each component collapses and restores by its own handle. The canvas gets the freed space.
- Error: restoring after a refresh with a broken stored value falls back to open and does not throw.
- Bend check: `tests/bend/collapse.bend`: collapse then restore returns the original state.
- Slop guard: the status bar contains no component toggles.

---

## F7. The bottom palette layout is poor (done)

### Research
- Root cause of the mismatch: category buttons do nothing but highlight and set the status text (`web/js/palette.js:13` to `17`). They never filter. The tile loop (`palette.js:77`) renders every cable, Bus, Mesh and every device in `data.palette`, regardless of the selected category. So "End devices" is selected while routers and cables show.
- Layout (`web/workspace.css:274` to `312`):
  - `.palette` has a fixed height of 108px.
  - `.groups` is a grid of 7 columns of 26px icon buttons with no labels (`:281`, `:290`).
  - `.devices` is `flex-wrap: nowrap; overflow-x: auto` (`:295`), so the long row scrolls sideways and cuts the last tile.
  - Tiles are 30px icons with 9px labels.
- Cables, Bus and Mesh are not devices, but they are mixed into the same strip.

### Todo
- [ ] F7.1 Make the category buttons filter the tiles shown. Cables, Bus and Mesh get their own category.
- [ ] F7.2 Category buttons: larger, with text labels.
- [ ] F7.3 Tiles wrap into rows (or scroll vertically inside the bar) so none is cut off.
- [ ] F7.4 Use the bar height well. No empty band under the icons.
- [ ] F7.5 Add the collapse handle (F6).

### Tests
- Behaviour: selecting each category renders exactly that category's tiles.
- Error: a category with no devices shows an empty-state line, and an unknown category does not throw.
- Bend check: `tests/bend/palette_filter.bend`: every device appears in exactly one category.
- Slop guard: palette tiles never render more than one category at a time.

---

## F8. The sidebar needs a rebuild and a UI refactor (done)

### Research
- Structure (`web/index.html:117` to `224`): four tabs (Events, Lesson, Capture, Log) and panels with `data-panel`. The Events panel is split into **two** separate `data-panel="events"` wrappers, with the Log panel between them (the table and reset row first, then the playbar and filters). That duplication is a layout smell.
- Events table overflow: header has 5 columns but `workspace.css:233` to `236` fixes only 4 widths (26, 78, 86, 80px = 270px). The panel is 330px by default (`SIDEBAR_DEFAULT_WIDTH`), minimum 240. The "Type" column gets what is left, or is clipped. The body is a fixed `height: 150px` (`:239`), so a large area stays empty while the filters below overflow.
- Filters: `#filters` (`workspace.css:265`) is a three-column grid of about 40 checkboxes with `white-space: nowrap`. It has no scroll area of its own, so the last row is cut.
- Capture overflow (cause found): `.capture-view` is a grid with `minmax(360px, 1.2fr) minmax(310px, 1fr)` (`workspace.css:379`). Its minimum is 670px, but the sidebar is 330px (minimum 240px). The capture dock cannot fit in the sidebar, so it overflows. There is a media rule at `:429` that lowers the minimums to 330px and 260px, which is still 590px.
- Lesson tab "still 0": not clear what the 0 is. The lesson panel is hidden until a lesson opens (`#lesson-panel hidden`), so the tab is empty on a blank workspace. The only "0" in the sidebar is `Captured: 0/0` (`index.html:157`). Owner to confirm.
- Run log is capped at `max-height: 160px` (`workspace.css:856`).

### Todo
- [ ] F8.1 Owner confirms what "lesson 0" meant.
- [ ] F8.2 Build one sidebar component with tab strip, header (with the collapse handle from F6) and a single scroll area per tab.
- [ ] F8.3 Events: one panel (merge the two wrappers), columns sized to the real width, table fills the remaining height.
- [ ] F8.4 Filters: group by layer (for example Link, Network, Transport, Application) in collapsible groups, with Show all and Hide all kept.
- [ ] F8.5 Capture: stack the table above the packet inspector (single column) so it fits at 240px and above.
- [ ] F8.6 Lesson tab with no lesson: show an empty state that says how to open one (links to F10's Examples menu).
- [ ] F8.7 Remove the dead rules the rebuild replaces.

### Tests
- Behaviour: at widths 240, 330 and 600px no tab has horizontal overflow (measured by `scrollWidth <= clientWidth` in a DOM test).
- Error: an empty event list, a very long device name, and 500 events keep the layout inside the panel.
- Bend check: `tests/bend/sidebar_width.bend`: the sum of column minimums is at most the minimum sidebar width.
- Slop guard: no `data-panel` name appears twice in `index.html`.

---

## F9. The About page URL ends in `.html`, and it needs an author and open-source section (done)

### Research
- Route: `src/http/static_routes.rs:8` serves exactly `/about.html`. There is no `/about` route.
- Links to it: `web/index.html:80` (Help menu), `web/sw.js:7` (precache), `README.md:118`, `tests/e2e.rs:136` and `138`, `tests/js/service_worker.test.js:121`.
- Only two pages exist: `index.html` (served at `/`) and `about.html`. So `about` is the only extension problem.
- `web/about.html` is 91 lines with its own inline `<style>` (see F1). Title "About & licence — TakumiNet". It has no author profile or repo link.
- The repo has no LICENSE file at the root (nothing found by `ls LICENSE*`), but the page and the Help menu say "licence".
- Repo URL from the git remote: `https://github.com/Kmassidik/TakumiNet`. Owner's X: `https://x.com/KMassidik`.

### Todo
- [ ] F9.1 Serve `/about`. `GET /about.html` answers with a redirect to `/about`.
- [ ] F9.2 Update the Help link, the service-worker precache, README and the tests.
- [ ] F9.3 Add an author section: name, the GitHub repo link and the X link.
- [ ] F9.4 Add an open-source section: anyone can open a pull request or rebuild it as their own, with the repo link.
- [x] F9.5 Licence: MIT (owner, 2026-11-04). `LICENSE` added, the About page names it.
- [ ] F9.6 Move the page onto the shared styles (F1).
- [ ] F9.7 Rename the Help item to just "About".

### Tests
- Behaviour: `/about` returns 200 HTML. `/about.html` returns a redirect to `/about`. The links on the page point at the two URLs above.
- Error: `/about/` and `/about.xyz` return 404 and not a crash.
- Bend check: `tests/bend/routes.bend`: the route table has no path ending in `.html`.
- Slop guard: no `href` or route in the repo ends in `.html`.

---

## F10. "Lesson gallery" is in the wrong place and has the wrong shape (done)

### Research
- Menu: File > "Lesson gallery…" (`web/index.html:29`, `data-action="show-gallery"`). Menus are File, Edit, Options, View, Tools, Help.
- Code: `showGallery` and `renderGallery` (`web/js/lessons.js:76`, `96`). It already receives lessons and templates separately from `/api/templates` (`{"lessons":[…],"templates":[…]}`), and draws two sections in one dialog. So the data split exists. Only the menu and the dialog shape are wrong.
- First-visit auto-open: `shouldAutoShowGallery` (`web/ts/ui/gallery_once.ts`).
- Lessons are `t1` to `t5`. Example templates are `tpl-connect`, `tpl-star`, `tpl-home`, `tpl-routed`, `tpl-web`.

### Todo
- [ ] F10.1 Add a top-level **Examples** menu between View and Tools (or after Help; owner picks).
- [x] F10.2 (changed by the owner, 2026-11-04) Examples has exactly two entries, Lessons and Example templates. Each opens the same window with just that list; picking a card opens it.
- [ ] F10.3 Remove "Lesson gallery…" from File. File keeps New, Open, Save, Import, Export, Print.
- [ ] F10.4 First visit: keep a welcome that points to Examples. Owner decides whether the big gallery dialog stays at all.
- [ ] F10.5 The Lesson tab empty state (F8.6) links to Examples.

### Tests
- Behaviour: Examples lists 5 lessons and 5 templates. Clicking an item opens it.
- Error: if `/api/templates` fails, the menu shows an error line and stays usable.
- Bend check: `tests/bend/examples.bend`: every template belongs to exactly one of the two entries.
- Slop guard: the File menu contains no gallery entry.

---

## F11. Play on a template says "Nothing to play yet. Send a PDU first" (done)

Owner: "i use template btw why still show Nothing to play yet".

### Research
- The message comes from `togglePlay` (`web/js/actions.js:297` to `299`). Play only replays captured events (`visibleEvents()`). With no events it stops with that text.
- The templates carry no traffic. A search of all 10 files in `web/templates/` finds no PDU, event, traffic or flow record. A template is devices, links and settings only. So a freshly opened template has zero events, and Play always shows the message.
- The gallery card promises the opposite: templates say "Ready to run · nothing to set" (`web/js/lessons.js:53`). The owner reads "ready to run" as "press Play and see it work".
- Events are only created when the user sends a PDU (the Send PDU tool, then two clicks). There is no built-in demo traffic.
- Related: in the earlier no-sound fix, Play with no events became silent. That removed the noise but not the confusion.

### Todo
- [ ] F11.1 Owner decides the behaviour. Options:
  - (a) Each template declares a default traffic scenario (for example one ping or one web request between named devices), and Play with no events sends it first, then plays it. Recommended, because it matches "ready to run".
  - (b) Play with no events opens the Send PDU tool.
  - (c) Keep the message but reword it and add a button.
- [ ] F11.2 If (a): add a `traffic` record to the `.xml` format (names the source, destination and protocol), write one for each of the 5 templates, and make Play use it.
- [ ] F11.3 Change the card text so it only promises what happens.
- [ ] F11.4 Lessons (`t1` to `t5`) keep their own flow: they ask the user to send traffic as a step. Do not auto-send there.

### Tests
- Behaviour: open each template, press Play: events appear and play, no message.
- Error: a template whose traffic names a missing device shows a clear error and the rest of the template still opens. Play on a blank workspace shows the helpful message.
- Bend check: `tests/bend/template_traffic.bend`: every template's traffic endpoints are devices of that template.
- Slop guard: every `tpl-*` file has a traffic record.

---

## F12. Menus should behave like Windows menus (done)

Owner: "build hover each menu like computer windows do".

- Click opens a menu; after that, hovering another menu name switches to it. Clicking the open name, clicking outside, Escape or losing the window closes it. Nothing opens on hover alone.
- Keyboard: arrows move across menus and through items (skipping separators and disabled items, wrapping round), Home and End, Enter runs the item, Escape closes the menu and then leaves the bar. Alt or F10 on its own puts the keyboard on the bar.
- Roles and `aria-expanded` are set (`menubar`, `menu`, `menuitem`, `separator`).
- Where: `web/ts/ui/menu_nav.ts` (rules, tested without a browser), `web/ts/ui/menubar.ts` (page glue), `tests/ts/menu_nav.test.ts`, `tests/bend/menu_nav.bend`.
- Not built: submenus and underlined Alt+letter shortcuts (no menu has a submenu yet, and Alt+letter clashes with browser shortcuts).

## F13. Icons should show their name on hover (done)

Owner: "when my mouse is on the image new file, just show the text".

- One hover label for every button with a `title` or `data-tip`: toolbars, palette tiles, collapse handles, play controls. It appears after 0.3 s, at once when sliding to a neighbouring button, also on keyboard focus, and hides on move away, click, scroll or Escape. Shortcuts show beside the name (Save: Ctrl+S).
- The browser's own tooltip is switched off for these buttons (the title moves to `data-tip`, and an `aria-label` is added to icon-only buttons).
- Where: `web/ts/ui/tooltip_rules.ts` (rules), `web/ts/ui/tooltip.ts` (page glue), `tests/ts/tooltip_rules.test.ts`, `tests/bend/tooltip_fit.bend`.
- Not built: the full SVG icon set (the owner has not chosen option 1, 2 or 3 yet).

## Build result (2026-11-04)

All eleven items were built in this order: F5 (with F2), F6, F7, F8, F10, F9, F3, F11, F4, F1. Each is one commit on `main`.

Decisions taken while building (the owner can change any of them):
- Bend and "no formal verification": each item has a small Bend test in `tests/bend/` that runs a model of its rule and must print 0. They are tests, not proofs. Nothing was added to `LAWS.md`. `tests/ts/bend.test.ts` runs them and skips them when `bend` is not installed.
- F1: the three worst screens were not named, so the work was done everywhere. One `web/tokens.css` now holds every colour, radius and font. `workspace.css` and `about.html` hold no raw colours (guarded by a test). The gallery cards were also tidied. Canvas drawing colours inside the TypeScript code are not moved yet.
- F3.1: old `.tnet` files still open (read only). Saves, export and templates are `.xml`.
- F3.6: nothing was deleted. The `topologies/*.ptw` and the `e2e.tnet`, `routing_*` leftovers are still there.
- F6.3: the collapsed state is remembered per browser.
- F9.5: the owner chose MIT afterwards; `LICENSE` added and named on the About page.
- F10.4: the welcome gallery stays for the first visit only. It is no longer in a menu.
- F11: option (a). Each `tpl-*` template carries a `<demo>` record, and Play on a quiet template sends it first.

Not done:
- Checked in a real browser: dialogs, bars, palette, sidebar widths 240/330/600, Examples menu, template Play, About page, print picture. Not checked: the system print dialog itself (it would block the browser tool), and phone-width layouts.

## Build order (proposed)

1. F5 shared dialog (it also solves F2).
2. F6 collapsible component.
3. F8 sidebar, then F7 palette (both use F6).
4. F10 Examples menu, then F9 About.
5. F3 `.xml`, then F11 (it adds a record to the same format).
6. F4 print.
7. F1 tokens last, so it covers everything.

## Note on the pasted text

The block pasted with F1 is about an AI security-operations product (detection rules, alert triage). It has nothing to do with TakumiNet, so it is not recorded. If it was meant as a style reference, tell me what to take from it.

---

# Round 2 (2026-11-04): bugs found in what was built, and a plain guide

Same rules as before: this part is research only. Nothing below is fixed. The word **build** starts the work. "Reproduced" means I saw it happen in Chrome. "From the code" means I read it and have not seen it fail.

## Part A. What each thing does, in plain words

| Thing | What it does for you | How to try it |
|---|---|---|
| **Dialog close (F2, F5)** | Every pop-up window can be closed three ways: the × button, the Escape key, or a click on the dim area outside it. Escape closes only the top window. | Open Options > Preferences, press Escape. |
| **Minimize handle (F6)** | A small button on each bar (toolbars, device palette, sidebar) shrinks it to a thin strip so the canvas gets more room. The strip has a button to bring it back. The choice is remembered after a refresh. | Click the **−** at the right end of the top toolbar. |
| **Palette tabs (F7)** | The bottom bar shows one category at a time (Routers, Switches, End devices...). Cables, Bus and Mesh are in the Connections tab. | Click the **Routers** tab, then **Connections**. |
| **Sidebar (F8)** | The right panel has four tabs. Events lists packets; filters are grouped by layer (Link, Network, Transport...) and each group opens or closes. Capture shows the packet table above the packet details. Lesson shows the guided steps, or a message when no lesson is open. | Open Examples > Example templates > Home network, press Play, then look at each tab. |
| **Examples menu (F10)** | Two entries. Lessons shows the five guided lessons. Example templates shows five ready-made networks. Both open the same window with only that list. | Examples > Lessons. |
| **About page (F9)** | `/about` (not `/about.html`). Shows the author, the GitHub and X links, and the MIT licence. | Help > About. |
| **.xml files (F3)** | Save, Open, Export and Import all use `.xml`. A `.tnet` file from before still opens. | File > Export. |
| **Built-in traffic (F11)** | Each example template carries one small piece of traffic (a ping or a web request). Pressing Play on a quiet template sends it first, then plays it. Your own networks have none, so Play asks you to send a PDU. | Open Examples > Example templates > Website by name, press Play. |
| **Print (F4)** | Draws the whole network onto one landscape page, fitted and centred, and prints only that. Menus and panels never reach the paper. | File > Print on a template. |
| **Colour tokens (F1)** | One file, `web/tokens.css`, holds every colour, corner radius and font. Change a value there and the whole app changes. | Open `web/tokens.css`. |
| **Menu bar (F12)** | Click a menu to open it, then move over the others to switch. Arrow keys move through items, Enter runs one, Escape closes. Alt or F10 puts the keyboard on the menu bar. | Click File, then move the mouse over Edit. |
| **Hover label (F13)** | Rest the mouse on an icon for a moment and its name appears, with its shortcut. | Hover the floppy-disk icon. |
| **Bend tests** | Small programs in `tests/bend/`. Each models one rule (for example "arrow keys never land on a disabled item") and prints how many cases broke. 0 means fine. They are checks, not proofs. | `bend tests/bend/menu_nav.bend` |
| **Slop guard** | One test file that fails if an old bad habit returns (a second hand-written dialog, a `.html` link, a raw colour, a `.tnet` name...). | `bun test tests/ts/slop_guard.test.ts` |

## Part B. Bugs found

### F14. The canvas picture goes wrong when a panel is minimized or the sidebar is resized (open, reproduced)

- **What you see:** hide the palette, hide the sidebar, minimize a toolbar, or drag the sidebar splitter. The drawing is stretched (devices look tall, text looks squashed), and clicks no longer land where the pictures are.
- **Measured in Chrome:** with the palette collapsed the canvas box grew to 1176 x 501 CSS pixels while its drawing buffer stayed 2352 x 826 (it should be 2352 x 1002). Same mismatch for sidebar hide (1512 wide, buffer for 1176) and toolbar collapse.
- **Where:** `web/ts/canvas/workspace_canvas.ts:60` resizes the buffer only on the window `resize` event (`resize()` at line 175). Nothing tells it when its own box changes size. Bars and the sidebar change that box without a window resize. The splitter drag (F8) and the minimize handles (F6) both do this.
- **Introduced by:** F6 (new) and the existing sidebar toggle/splitter (older, same cause).
- **Todo:**
  - [ ] F14.1 Watch the canvas box itself (a `ResizeObserver`), and resize the buffer whenever its size changes.
  - [ ] F14.2 Keep the camera centred on the same world point when the box changes.
- **Tests:**
  - Behaviour: after each of palette collapse, sidebar hide, toolbar collapse and splitter drag, buffer size equals CSS size times the pixel ratio (a browser check script).
  - Error: a zero-size canvas (hidden tab) does not throw or divide by zero.
  - Bend: `tests/bend/canvas_size.bend`, buffer = css x ratio for sample sizes.
  - Slop guard: `workspace_canvas.ts` must contain a `ResizeObserver`.

### F15. Pressing Play twice quickly makes Pause stop working (open, reproduced)

- **What you see:** on a template, click Play twice fast (or press Space twice). The traffic is sent twice (3 events become 4) and pressing Pause does not stop the playback; it keeps stepping.
- **Measured in Chrome:** after a double click, pressing Pause cleared `playTimer`, but the cursor still moved from event 1 to 4 over the next 2.5 seconds, so a second timer was still running.
- **Where:** `web/js/actions.js` `togglePlay()` became `async` in F11. While it waits for `/api/demo`, `playTimer` is still null, so a second press starts a second run. Each run creates its own `setInterval` and only the last one is remembered.
- **Introduced by:** F11.
- **Todo:**
  - [ ] F15.1 Mark "starting" at the top of `togglePlay` so a second press while it waits is ignored.
  - [ ] F15.2 Never start a timer if one is already running.
- **Tests:**
  - Behaviour: two calls in a row send the traffic once and leave exactly one timer.
  - Error: if the traffic request fails, the "starting" mark is cleared so the next press works.
  - Bend: `tests/bend/play_once.bend`, any number of presses before the answer yields one run.
  - Slop guard: no `setInterval` assignment without a guard.

### F16. After picking a cable, switching category hides it but leaves cable mode on (open, reproduced)

- **What you see:** in Connections choose Copper, then click the End devices tab. The cable tile disappears, but clicks on the canvas still try to draw a cable and the cursor stays a crosshair. Nothing on screen says why.
- **Measured in Chrome:** after the switch, `cableMode` was still `true`, no `.cable-tool` tile was in the page, and the canvas still had the `cable-mode` class.
- **Where:** `web/js/palette.js:47` sets cable mode; the category switch (`palette.js` group-tab click) only re-renders and never clears it. This follows from F7 (cables only appear in Connections).
- **Introduced by:** F7.
- **Todo:**
  - [ ] F16.1 Owner decides: leave cable mode when you change category (recommended), or keep a small "Copper cable: click two devices ✕" chip visible while it is on.
  - [ ] F16.2 Make Escape also leave cable mode and update the palette.
- **Tests:**
  - Behaviour: choosing a cable then another category turns cable mode off and clears the crosshair.
  - Error: switching category with no cable chosen changes nothing else.
  - Bend: `tests/bend/cable_mode.bend`, a state change away from Connections always ends with mode off.
  - Slop guard: any code that hides a cable tile must also clear the mode.

### F17. Alt held during another action can still pull the keyboard to the menu bar (open, from the code)

- **What you see (expected):** hold Alt (Option on a Mac), click something with the mouse, release Alt. The menu bar takes the keyboard even though you did not press Alt on its own.
- **Where:** `web/ts/ui/menubar.ts:85`. "Alt alone" is only cancelled by another key press, not by a mouse click.
- **Todo:**
  - [ ] F17.1 Cancel "Alt alone" on any mouse button press as well.
  - [ ] F17.2 Ignore Alt and F10 while a dialog is open.
- **Tests:** behaviour (Alt, click, Alt-up does nothing), error (Alt while a dialog is open does nothing), Bend (the Alt rule: toggles only with no other event between), slop guard none.

### F18. With a menu open and a dialog open, Escape needs three presses (open, reproduced)

- **What you see:** open Preferences, then press Alt or open a menu (reachable by keyboard behind the dialog). Escape closes the menu, the next Escape leaves the menu bar, and only the third Escape closes the dialog.
- **Measured in Chrome:** after two Escapes the dialog was still open.
- **Where:** `web/ts/ui/menubar.ts:78` handles keys in the capture phase, before the dialog's Escape (`dialog_close.ts`). `MenuController.key("Escape")` in `menu_nav.ts` consumes it twice (close menu, then leave bar).
- **Todo:**
  - [ ] F18.1 While a dialog is open, the menu bar does not take keys at all (same rule as F17.2).
  - [ ] F18.2 Owner decides: should the second Escape (leaving the bar) exist, or should one Escape close the menu and return the keyboard at once.
- **Tests:** behaviour (dialog plus menu: first Escape closes the menu, next closes the dialog), error (no dialog: unchanged), Bend (Escape count to close everything equals the number of open layers), slop guard none.

### F19. A hover label can stay on screen after its button is replaced (open, reproduced)

- **What you see:** the label for Save stays visible after the toolbar is redrawn under the pointer, until the pointer moves onto something else.
- **Measured in Chrome:** after re-rendering the toolbar while the Save label was showing, the tooltip element was still visible.
- **Where:** `web/ts/ui/tooltip.ts`. The label is hidden by mouse and key events only. Nothing notices that its button left the page.
- **Todo:**
  - [ ] F19.1 Hide the label when its button is no longer in the page (check before each show and when the toolbar redraws).
- **Tests:** behaviour (remove the button while shown: label hides), error (hide twice is harmless), Bend (none needed), slop guard none.

### F20. Everything built is wiped on refresh (open, a decision, not a defect in the code)

- **What you see:** any work on the canvas disappears when you refresh. This was a requested behaviour (blank workspace every load), but it is easy to lose work with a stray F5.
- **Where:** `web/js/boot.js` calls `/api/new` first.
- **Todo:**
  - [ ] F20.1 Owner decides: keep as is, or ask "Leave this page? You have unsaved work" (the browser's own leave warning) only when there are unsaved changes. Recommended: the leave warning, no restore prompt.
- **Tests:** behaviour (a changed workspace triggers the warning, a blank one does not), error (storage blocked: no crash).

## Part C. Not checked (risks, not bugs)

- Phone-width layout of every screen was never looked at.
- The system print dialog and the printed page itself (only the picture was checked).
- Offline use after the file renames (`.xml`, `tokens.css`): the service worker list was updated and tested as text, not run offline.
- The canvas drawing colours in `web/ts/canvas/*.ts` are still raw hex values, not tokens (F1 left-over).
- All layout checks are done by reading CSS text, not by a real browser test. A repeatable browser test (for F14 and similar) needs a tool such as Playwright installed. I will not install it without asking.
- Two exceptions in the browser console at 8:44 and 8:51 (`openTemplate ... reading 'title'`) came from the old unguarded code. The current code is guarded and no new errors appeared.

## Build order proposed for Round 2

F14 (it affects every screen), F15, F16, F18 with F17, F19, then F20 if the owner decides.
