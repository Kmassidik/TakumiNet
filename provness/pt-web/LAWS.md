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
| L7 | `from_ptw(to_ptw(w))` restores every edited field of `w`. | `ptw_save.rs`, `ptw_load.rs` | `ptw_round_trip_covers_every_edited_field` |
| L8 | A switch never sends a frame out of the port it arrived on. | `src/net/fwd.rs` | `switch_learns_source_macs_and_then_hits` (partial) |
| L9 | `no vlan <id>` removes the VLAN. | `src/cli/config.rs` | `no_vlan_deletes_a_vlan` |

Open items: L2 and L8 need dedicated tests, L3 and L6 need property tests
over many inputs, not one example.
