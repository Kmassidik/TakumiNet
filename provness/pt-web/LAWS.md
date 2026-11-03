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
| L29 | Every native load error contains a line, element and attribute across 30 malformed or invalid documents. | `src/storage/xml.rs`, `src/workspace/tnet.rs` | `l29_thirty_broken_files_have_located_problems` |
| L30 | 5,000 deterministic byte/line mutations never panic or expose a partial workspace; every accepted workspace reloads byte-identically. | `src/workspace/tnet.rs` | `l30_five_thousand_mutations_are_all_or_nothing` |
| L31 | Older schemas migrate in order to the current version and reload equal; newer versions are rejected. | `src/workspace/tnet.rs`, `tests/fixtures/native_v1.tnet` | `l31_versions_migrate_and_newer_versions_are_rejected` |
| L32 | Unknown attributes on known records and unknown nested elements survive load/save. | `src/workspace/tnet.rs`, `src/storage/xml.rs` | `l32_unknown_attributes_and_elements_survive` |
| L33 | Files over 8 MB, nesting over depth 8, over 2,000 devices and over 20,000 records are rejected; 9 MB and 10,000-deep cases finish under 200 ms. | `src/storage/xml.rs`, `src/workspace/tnet.rs` | `l33_resource_limits_reject_within_200ms` |

Open items: L2 and L8 need dedicated tests, L3 and L6 need property tests
over many inputs, not one example.
