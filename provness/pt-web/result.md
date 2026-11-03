# pt-web verdict

Checked on 2026-11-03. No proof tool has been run: Bend is not installed.

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

P0 native XML verification on 2026-11-03:

- Failing first: `cargo test tnet_round_trip_preserves_topology` failed to compile because the native XML API did not exist.
- Persistence focus: `cargo test workspace::tests::persistence` — 7 passed.
- Full suite: `cargo test` — 194 passed (144 unit, 4 artwork, 3 asset policy, 23 HTTP e2e, 20 labs), 0 failed. This includes native save/open/list and export/import e2e coverage.
- Frontend: `node --test tests/js/*.test.js` — 9 passed, 0 failed. The first run caught a removed Help action; Help now opens About.
- Repository policy: `removed_vendor_formats_are_not_named_in_the_repo` passed; `frontend_has_no_vendor_art_references` remained at zero. `Cargo.lock` contains only `pt-web`.

No Bend or other proof tool was run.
