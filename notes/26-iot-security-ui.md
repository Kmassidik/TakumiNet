# 26 — Industrial protocols, security policy, and menu dialogs

Status: landed 2026-11-01.

## Industrial / IoT

- **Modbus**: every industrial device (PLC, Thing, IoE, PC, laptop, server)
  owns 256 holding registers. `POST /api/iot/write?id&addr&value` returns the
  old value, `/api/iot/read` returns the current one; out-of-range stays an
  error. Registers persist sparsely in `.ptw`.
- **PROFINET**: `POST /api/iot/send?src&dst&proto=profinet` requires industrial
  endpoints and records a `PROFINET` PDU over the real routed path.
- **PRP**: both ends must enable PRP (`/api/prp/enable`); the second frame with
  the same sequence number is reported as `duplicate seq N suppressed` and is
  not recorded.
- **PTP**: `/api/ptp/sync?master&slave` stores the peer and offset (one
  simulator clock, offset 0) shown by the status endpoint.
- **Cellular**: clients associate with a `celltower` (`/api/cell/join`); PDUs
  between two clients of the same tower take the `client → tower → client` path.
  Broadband already rides on the PPPoE dialer state.

Verified by `industrial_protocols_and_cell_tower_work`: register read/write,
PRP duplicate suppression, PTP master, cellular join and a rejected cross-tower
PDU, plus `.ptw` round-trip.

## Security

- **DHCPv6**: `/api/ipv6/dhcp?id&server` hands the client an address inside the
  server's /64 and sets the server as gateway.
- **Inspection**: `inspect icmp` on an ASA drops ICMP entering from an
  outside-role interface toward an inside-role one (roles from `ip nat
  inside|outside`); the drop is reported as `inspection denied icmp entering
  ASA from outside`.
- **IPS**: `ips signature 100 drop icmp` (or tcp/udp) makes every L3 hop drop
  that protocol (`IPS dropped icmp at Router0`); `show ips` lists the actions.
- Both policy sets persist in `.ptw`.

- **OSPFv3**: `router ospfv3 <pid>` plus `network 2001:db8:…/64` stores IPv6
  prefixes and `show ipv6 route` prints them as `O` rows next to connected
  addresses; the configuration and table persist.

Limits, stated rather than faked: IPv6 has no data plane in the simulator, so
OSPFv3 entries are not used for forwarding; ASA inspection is an ICMP policy, not a full stateful engine. The
`.ptd` container question was probed further: with a validated EAX
implementation (it recovers the known Twofish file at key `0x89`/nonce `0x10`),
all 65,536 single-byte key/nonce pairs fail for Twofish, AES-128, Serpent and
CAST6 on the 25 undecodable templates, and detached-tag layouts (8/16/20/32-byte
trailers, prepended or appended) also fail, so the variant is not a byte-key
change of any linked block cipher nor a tag-placement difference.

## Menus and dialogs

- Options → Preferences opens a real dialog: canvas grid, sound effects, and
  delete confirmation, stored per browser in `localStorage` and applied
  immediately (grid re-render, `sfx()` gate, delete prompt). Verified in
  Chromium: the grid persisted across a reload.
- Help → About shows the build facts; Help → Dialogs remains the searchable
  10,598-row catalog browser; Help → Contents/Asset Browser open the asset tree.

Catalog rows that correspond to implemented dialogs are now clickable: an
`IP Configuration` row opens that device's IP dialog, `Wireless` rows open the
PC Wireless app, mail rows open the Email app, and Preferences/About rows open
those dialogs. The rest of the 499 dialogs remain inventory; the 10,598-row
browser is the reference surface, and the ported dialogs are the state-backed
ones (IP/IPv6/DHCP/AAA/WLAN/ACL/NAT editors, preferences, about).
