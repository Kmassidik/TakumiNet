# 15 — Native `.tnet` save format coverage

Status: native XML landed 2026-11-03.

## Format

The root is `<takuminet version="1">`, with one flat self-closing element per
record. `src/workspace/tnet.rs` declares the attribute order for all 49 record
types. XML attributes escape markup characters and tab/CR/LF; parsing malformed
input returns no workspace rather than panicking. Unknown elements are retained
on a subsequent save.

The previous line-oriented stream remains internal in `records_save.rs` and
`records_load.rs`, so the proven record loaders still enforce the same behavior.
Its `.ptw` representation is accepted only as read-only legacy input.

## Verified

`tnet_round_trip_covers_every_edited_field` edits addresses, gateways, DNS,
IPv6, 802.1X, routes, port state and metrics, DHCP, banners, passwords, modules,
VLANs, trunks, subinterfaces, channels, STP, mail, TFTP and cable kinds. It
checks each restored value and requires byte-identical XML after another save.

Additional tests cover topology persistence, 2,000 deterministic random escape
round trips, malformed truncations and random bytes, unknown element retention,
and equality between legacy and native loads. All previous service, addressing,
routing, wireless and industrial persistence tests now round-trip through
`.tnet`.

Live HTTP checks cover Save → Reset → Open, file listing, Export → Import, and
rejection of malformed imports without changing the current workspace.

`startup` (the saved running configuration) and the simulation capture buffer
are session state, not native topology records.
