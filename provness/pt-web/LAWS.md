# pt-web laws

Each law names the Rust that keeps it and the test that covers it today.

| # | Law | Code | Covered by |
|---|---|---|---|
| L1 | A router forwards a packet only if its TTL is above 1, and the forwarded copy has TTL exactly one lower; every other field is unchanged. | `Packet::transit`, `src/net/packet.rs` | `pdu_is_a_real_frame_across_the_router` |
| L2 | A packet with TTL 0 or 1 is never forwarded; it becomes `TimeExceeded`. | `Packet::transit` | none specific, add one |
| L3 | The Internet checksum (RFC 1071) of a header that already contains its correct checksum is zero. | `checksum`, `src/net/packet.rs` | `checksum_matches_a_known_ip_header` (one example) |
| L4 | A VLAN id is accepted only in 1 to 4094. | `vlan_create`, `src/workspace/switching.rs` | `vlan_config_and_show` |
| L5 | A subnet mask is accepted only if its set bits are contiguous from the top; the prefix returned equals the number of set bits. | `parse_mask`, `src/model.rs` | `cli` mask tests |
| L6 | `unescape_field(escape_field(s)) == s` for every string, and an escaped string contains no tab or newline. | `src/workspace/util.rs` | indirectly by the ptw round-trip |
| L7 | `from_records(to_records(w))` restores every edited field of `w`. | `records_save.rs`, `records_load.rs` | `legacy_ptw_loads_to_the_same_workspace_as_tnet` |
| L8 | A switch never sends a frame out of the port it arrived on. | `src/net/fwd.rs` | `switch_learns_source_macs_and_then_hits` (partial) |
| L9 | `no vlan <id>` removes the VLAN. | `src/cli/config.rs` | `no_vlan_deletes_a_vlan` |
| L10 | `from_tnet(to_tnet(w))` restores every edited field and serializes back to byte-identical `.tnet`; unknown elements are retained. | `src/workspace/tnet.rs` | `tnet_round_trip_covers_every_edited_field`, `unknown_tnet_elements_survive_load_and_save` |
| L11 | `xml::unescape(xml::escape(s)) == Some(s)` for 2,000 deterministic random strings containing markup, controls and Unicode. | `src/storage/xml.rs` | `xml_escape_round_trips_2000_random_strings` |
| L12 | Malformed native XML returns without panicking for every truncation of a valid file and 2,000 random byte strings. | `src/storage/xml.rs`, `src/workspace/tnet.rs` | `malformed_tnet_truncations_and_random_bytes_never_panic` |
| L13 | Read-only legacy `.ptw` input produces the same native workspace and record stream as `.tnet`. | `src/workspace/records_load.rs` | `legacy_ptw_loads_to_the_same_workspace_as_tnet` |
| L14 | A lesson check passes exactly when the equivalent terminal command or browser operation succeeds against live engine state. | `src/workspace/checks.rs`, `src/workspace/routing.rs` | `ping_check_matches_the_terminal_before_and_after_repair`, `ttl_check_uses_the_same_delivered_hop_as_ping`, `http_check_fetches_the_real_page_and_title`, `lease_check_observes_dhcp_without_acquiring_a_lease`, `arp_check_requires_a_live_cache_entry`, `route_check_requires_the_exact_prefix_not_a_covering_default` |
| L15 | Loading the same native lesson template twice produces identical normalized workspaces and deterministic saves. | `src/workspace/lesson.rs`, `src/workspace/tnet.rs` | `l15_loading_a_template_twice_is_deterministic`, `e2e_lesson_templates_blank_new_and_checks` |
| L16 | Every `web/templates/*.tnet` file loads with no unresolved devices or ports; the same hook will validate P2 templates. | `src/workspace/tnet.rs`, `tests/templates.rs` | `l16_every_native_template_loads_without_unresolved_devices_or_ports` |
| L17 | T1 starts with blank host addressing and a failing ping; configuring both hosts through the real API makes the terminal ping and lesson check pass. | `web/templates/t1.tnet`, `src/workspace/checks.rs`, `tests/templates.rs` | `l17_t1_static_addresses_fail_before_and_ping_after` |
| L18 | T2 starts with blank hosts and no learned MACs; three real pairwise terminal pings make all ping checks pass and the switch MAC-table check report exactly three entries. | `web/templates/t2.tnet`, `src/workspace/checks.rs`, `src/workspace/types.rs` | `l18_t2_switch_star_learns_three_macs` |
| L19 | T3 starts without leases or a reachable web server; configuring the real DHCP service and renewing both clients through the terminal produces two leases and a successful HTTP check. | `web/templates/t3.tnet`, `src/workspace/dhcp.rs`, `src/workspace/checks.rs` | `l19_t3_dhcp_leases_and_web_page_after_solution` |
| L20 | T4 starts blank with router interfaces shut down; real host API configuration and router CLI commands produce cross-network delivery at TTL 127 and both exact connected prefixes. | `web/templates/t4.tnet`, `src/workspace/checks.rs`, `src/workspace/routing.rs` | `l20_t4_routed_networks_deliver_ttl127_and_connected_routes` |
| L21 | T5 starts without addressing or DNS records; the scripted API solution makes real terminal nslookup return the expected A record and the browser fetch the website by name, passing both checks. | `web/templates/t5.tnet`, `src/workspace/checks.rs`, `src/cmd.rs` | `l21_t5_dns_name_resolves_and_opens_website_after_solution` |
| L22 | Browser export then import of the exported text restores the identical HTTP workspace; export downloads `<name>.tnet` as a Blob without a server write. | `web/js/actions.js`, `src/http/file_routes.rs` | `l22_exported_text_import_restores_identical_http_workspace`, `export downloads the current name through a Blob without a server write` |
| L23 | A rejected picker/drop file or invalid native import leaves the current workspace unchanged and reports readable problems with the error mascot. | `web/js/actions.js`, `web/js/chrome.js`, `src/http/file_routes.rs` | `l23_invalid_http_import_never_changes_the_workspace`, `a non-tnet pick is rejected before reading or changing the workspace`, `invalid native XML reports every readable problem and preserves current data` |
| L24 | In Simulation mode, captured device events occur in exactly the same order as the forwarding path; on solved T4, PC0 to PC3 is PC0 → Switch0 → Router0 → Switch1 → PC3 with strictly increasing hop times. | `src/net/fwd.rs`, `src/workspace/traffic.rs` | `l24_t4_simulation_device_order_equals_forwarding_path` |
| L24b | The Capture table lists every recorded engine event exactly once in time order; filtering never mutates that underlying sequence. | `web/js/capture_filter.js`, `web/js/capture_table.js` | `L24b capture rows preserve every engine event exactly once in time order` |
| L25 | Each of the 20 canonical lab transcripts returns byte-identical status, content type and response bytes through native HTTP and a fresh raw-WASM browser engine. | `src/engine.rs`, `src/http/mod.rs`, `tests/labs/main.rs`, `tests/browser/labs.js` | `tests/fixtures/labs/39101.jsonl`–`39120.jsonl`; real Chrome replay of 1,218 responses |
| L25b | For generated packets and filters, `a && b` is exactly the intersection of the independent matches for `a` and `b`. | `web/js/capture_filter.js` | `L25b conjunction equals intersection over generated packets and filters` |
| L26 | Captured IPv4 wire headers retain a valid RFC 1071 checksum, including after a router decrements TTL. | `src/net/packet.rs`, `src/workspace/traffic.rs` | `l26_captured_ipv4_bytes_have_a_valid_rfc1071_checksum` |
| L27 | A written libpcap file reparses to the identical timestamped Ethernet frames. | `src/storage/pcap.rs` | `l27_pcap_reparse_returns_identical_timestamped_frames` |
| L28 | The pure SVG ladder model has one arrow per inter-device hop and first-path lane order; solved T4 PC0→PC3 has five lanes. | `web/js/flow.js` | `L28 T4 ladder has five path-ordered lanes and one arrow per inter-device hop` |
| L29 | Every native load error contains a line, element and attribute across 30 malformed or invalid documents. | `src/storage/xml.rs`, `src/workspace/tnet.rs` | `l29_thirty_broken_files_have_located_problems` |
| L30 | 5,000 deterministic byte/line mutations never panic or expose a partial workspace; every accepted workspace reloads byte-identically. | `src/workspace/tnet.rs` | `l30_five_thousand_mutations_are_all_or_nothing` |
| L31 | Older schemas migrate in order to the current version and reload equal; newer versions are rejected. | `src/workspace/tnet.rs`, `tests/fixtures/native_v1.tnet` | `l31_versions_migrate_and_newer_versions_are_rejected` |
| L32 | Unknown attributes on known records and unknown nested elements survive load/save. | `src/workspace/tnet.rs`, `src/storage/xml.rs` | `l32_unknown_attributes_and_elements_survive` |
| L33 | Files over 8 MB, nesting over depth 8, over 2,000 devices and over 20,000 records are rejected; 9 MB and 10,000-deep cases finish under 200 ms. | `src/storage/xml.rs`, `src/workspace/tnet.rs` | `l33_resource_limits_reject_within_200ms` |
| L34 | After one online load, Chrome offline mode reloads the complete application and its WASM engine, opens templates and runs real labs with no console or page errors. | `web/sw.js`, `web/js/engine.js`, `src/http/static_routes.rs` | `service_worker.test.js`; real Chrome offline solved-T4 run |
| L35 | Two browser tabs own independent WASM workspaces, history and CLI state; browser named-save/load in one tab does not mutate the other. | `src/engine.rs`, `web/js/engine.js` | `raw_engine_instances_and_embedded_templates_are_independent`; real Chrome two-tab run |

## C0 UI laws (PRD-UI section 7)

| Law | Claim | Where enforced | Executable check |
|-----|-------|----------------|------------------|
| L41 | Modal stack: Escape closes only the top dialog, focus returns to its opener, a dialog hidden by its own control leaves the stack without its close handler. | `web/ts/ui/modal_stack.ts`, `web/ts/ui/dialogs.ts` | `tests/ts/modal_stack.test.ts` (4 tests); `tests/ts/modal.test.ts` (OK, Escape, text value, cancel). Focus trap and backdrop focus are NOT covered. |
| L42 | Toolbar buttons render from the list with icon, action and title; separators divide groups; re-render replaces old buttons. | `web/ts/ui/toolbar.ts`, `web/ts/ui/button.ts` | `tests/ts/toolbar.test.ts` (2 tests); `tests/js/ui_placeholders.test.js` (every toolbar action exists) |
| L45 | The shipped `web/js/ui.js` is exactly the build of `web/ts/`. | `package.json` build script | `tests/ts/bundle_fresh.test.ts` |
| L46 | A missing or refused static file answers 404, never 200. | `src/http/static_routes.rs`, `src/http/util.rs` | `e2e_missing_or_refused_static_files_are_404` |

Not yet covered by any law: L36 (hit-test), L37 (camera), L38 (scene purity),
L39 (draw determinism), L40 (sidebar), L43 (one layout rule), L44 (200-device
redraw timing). Real-browser checks of the modal and toolbar are not run:
the Chrome extension was not connected.

Open items: L2 and L8 need dedicated tests, L3 and L6 need property tests
over many inputs, not one example.
