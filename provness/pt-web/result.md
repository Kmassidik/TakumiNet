# pt-web verdict

Checked on 2026-11-03. No proof tool has been run: Bend is not installed.

P4 Chrome found a hidden device-window icon with no initial source. `every static image has a real source before its window opens` failed before the fix; `cargo test` passed 218 tests and `node --test tests/js/*.test.js` passed 35 after it.

P4 Chrome had no link LEDs. `link_json_exposes_green_amber_and_red_endpoint_states` and `link endpoints render LEDs directly from green amber and red port states` failed before the fix. Chrome then showed twelve green LEDs on the demo and red/amber endpoints after shutting down Router0 GigabitEthernet0/0, with zero console errors or broken images.

P4 Chrome showed that terminal `shutdown` left the old LED colors on screen. `terminal output returns immediately while live port state refreshes behind it` failed before the fix. After it, Chrome printed `no shutdown` output in 41 ms, re-enabled input, and restored green LEDs without waiting for the background workspace refresh.

P4 Chrome Command Prompt ping answered but left zero captured events and no PDU. `command prompt ping answers immediately then captures and animates its real path` failed before the fix. After it, Chrome answered in 13 ms, captured PC0 → Switch0 → Router0 → Switch1 → PC2, and animated that identical event path.

| Law | Status | Evidence |
|---|---|---|
| L1 | tested | `cargo test` (137 unit, 24 e2e pass) |
| L2 | stated | no dedicated test |
| L3 | tested | one known header only |
| L4 | tested | `cargo test` |
| L5 | tested | `cargo test` |
| L6 | tested | indirect, through the ptw round-trip |
| L7 | tested | `cargo test` |
| L8 | tested | partial |
| L9 | tested | `no_vlan_deletes_a_vlan`, which failed before the order fix |
| L10 | tested | `tnet_round_trip_covers_every_edited_field`, `unknown_tnet_elements_survive_load_and_save`; `cargo test` on 2026-11-03 |
| L11 | tested | `xml_escape_round_trips_2000_random_strings`; `cargo test` on 2026-11-03 |
| L12 | tested | `malformed_tnet_truncations_and_random_bytes_never_panic`; `cargo test` on 2026-11-03 |
| L13 | tested | `legacy_ptw_loads_to_the_same_workspace_as_tnet`; `cargo test` on 2026-11-03 |
| L22 | tested | `l22_exported_text_import_restores_identical_http_workspace`; Blob download JS test; Chrome export/picker round trip on 2026-11-03 |
| L23 | tested | `l23_invalid_http_import_never_changes_the_workspace`; picker rejection/problem JS tests; Chrome bad-file drops preserved byte-identical JSON on 2026-11-03 |

P3 browser native-file verification on 2026-11-03:

- Failing first: the new browser suite reported 6 failures before implementation (picker extension filtering, pre-read rejection, readable problems/mascot, file drop, one-second debounce, and Restore offer). The two new focused HTTP law tests passed against the already transactional parser before UI work.
- `cargo test`: **218 passed, 0 failed** across 6 suites.
- `node --test tests/js/*.test.js`: **34 passed, 0 failed**.
- Actual Google Chrome 2026-11-03 smoke: Blob export downloaded `untitled.tnet` (37 bytes), native picker import produced identical workspace JSON, workspace drop imported T2 with 4 devices and 3 links, `.txt` and malformed `.tnet` drops both preserved workspace JSON and displayed the error mascot/readable problem, and the final clean run had **0 console errors**.
- Chrome also observed the one-second autosave containing all 4 dropped devices, displayed “Restore last session?”, and restored identical workspace JSON after reload. No P4 work was started.

P0 native XML verification on 2026-11-03:

- Failing first: `cargo test tnet_round_trip_preserves_topology` failed to compile because the native XML API did not exist.
- Persistence focus: `cargo test workspace::tests::persistence` — 7 passed.
- Full suite: `cargo test` — 194 passed (144 unit, 4 artwork, 3 asset policy, 23 HTTP e2e, 20 labs), 0 failed. This includes native save/open/list and export/import e2e coverage.
- Frontend: `node --test tests/js/*.test.js` — 9 passed, 0 failed. The first run caught a removed Help action; Help now opens About.
- Repository policy: `removed_vendor_formats_are_not_named_in_the_repo` passed; `frontend_has_no_vendor_art_references` remained at zero. `Cargo.lock` contains only `pt-web`.

No Bend or other proof tool was run.
