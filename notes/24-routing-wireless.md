# 24 — Routing, policies, wireless apps, and the corpus gate

Status: landed 2026-11-01.

## Routing protocols

`router rip`, `router ospf PID`, and `router eigrp AS` enter protocol-specific
router submodes. RIP uses `version 2` and retains classful `network A.B.C.D`;
OSPF accepts `network IP WILDCARD area N`. Interface `bandwidth KBPS` and
`delay USEC` control path metrics, and their `no` forms restore interface
defaults. Protocol IDs, areas, metrics, and static administrative distances
persist in running/startup configuration and `.ptw` saves.

Each protocol recomputes independently over live, addressed adjacencies:

- **RIPv2** runs synchronous Bellman-Ford with unit link cost. Metrics 1–15 are
  installable; 16 is infinity. Only RIPv2 neighbors exchange routes.
- **OSPF** originates router LSAs and runs Dijkstra over each area's LSDB. Link
  cost is `max(1, 100_000_000 / bandwidth_bps)`. ABRs attach area 0 and
  originate summaries so multi-area routes cross the backbone rather than
  merging every area into one SPF graph.
- **EIGRP** forms adjacencies only within the same AS. Path-vector relaxation
  tracks bottleneck bandwidth and cumulative delay, with composite metric
  `256 * (10_000_000 / min_bandwidth_kbps + delay_us / 10)`.
- **Static routes** accept `ip route DEST MASK NEXT_HOP [AD]` (default AD 1),
  including the corresponding `no` form. Floating routes become eligible when
  a lower-AD route's connected next hop is unavailable.

Connected, static, and learned routes share longest-prefix → administrative
distance → metric selection. ADs are 0 for connected, 90 for EIGRP internal,
110 for OSPF, and 120 for RIP; static AD is per route. `show ip route` renders
`[AD/metric]`, and forwarding consults the same selected table. Derived routes
and LSDBs are not persisted: load and reload recompute them from configuration.

## ACLs and NAT

- Standard (1–99) and extended (100–199) ACEs, `any`/`host`, bound per interface
  with `ip access-group N in|out`; implicit deny; `show access-lists` shows ACEs
  plus bindings. Enforcement runs at every L3 hop (routers and ASAs), inbound
  before routing and outbound after.
- `ip nat inside|outside` + `ip nat inside source list N interface IFACE
  overload`; the inside source is rewritten to the outside interface address and
  recorded for `show ip nat translations`. Both persist.

Verified live: a deny ACE on Router0 g0/0 makes `pc0 → server0` return
`ACL denied on Router0 GigabitEthernet0/0`; with NAT, the same flow yields
`192.168.1.10 -> 192.168.2.1`.

## IPv6

`set_ipv6(..., auto=true)` now performs SLAAC: a breadth-first walk across
switch/hub links finds a router/ASA with an IPv6 address, adopts its prefix and
derives a host id from the device id; the router address becomes the gateway.
DHCPv6 and OSPFv3 are not simulated.

## Wireless, VPN, PPPoE, phones

Backend state (all persisted in `.ptw`):

- WLC WLANs (`wlan_add`, PSK ≥ 8), scan across controllers, WPA2-PSK join with
  `authentication failed` on a wrong key, association status, and disconnect.
- VPN and PPPoE dialer configs require a real device address; IP phones register
  with a call-manager address and extension.

Desktop apps: PC Wireless (scan/join/status/disconnect, WLAN editor on a WLC),
VPN, PPPoE Dialer, IP Communicator, a Firewalls window that prints the device's
`show access-lists` over the CLI, and a Help → Dialogs browser over
`GET /api/dialogs` (10,598 rows, 499 dialogs).

Chromium proof: PC Wireless showed `1 network visible`, joined `LAB-WIFI`, and
reported `Associated with LAB-WIFI via wlc0`; Dialogs showed
`200 shown · 200 fetched · 10598 rows in catalog`.

## Corpus gate

`tests/corpus.rs` now imports each save on its own server, checks the JSON,
and attempts PDUs:

```
corpus: 239 opened, 239 json ok, 226 sim attempted, 96 delivered,
18 skipped (undecodable container), 0 errors, 42 empty (299 total)
```

Three consecutive runs produced identical totals.

## Negative result: the IoT/home template container

Binary evidence: `Util::decryptFileBytes` (0x3a9bd40) tries plain XML first, then
`Util::decrypt<CryptoPP::Twofish>(bytes, 0x89, 0x10)`, which applies the
stage-1 reverse/XOR (`data[n-1-i] ^ ((n - i*n) & 0xff)`), then
`EAX_Final<Twofish>` with 16-byte key/nonce buffers filled with the two bytes;
`decryptFileBytes` then XORs with `(len - i)` and `qUncompress`es. That is the
pipeline we already implement.

25 of the 88 `.ptd` templates do not decrypt with either known Twofish-EAX
pair (`0x89…/0x10…` or `0xBA…/0xBE…`). A bounded brute force over every
single-byte key × single-byte nonce (65,536 combinations per file, three files)
found no hit, and stage-1 formula variants (reverse vs in-place, `n-i`,
`i`, `i*n`), tag-first layout, and both known key pairs also fail. The variant is
therefore not a same-scheme key/nonce/stage-order change; it needs a different
cipher or container layout (the binary also links Rijndael/CAST256/Serpent
variants). Those templates stay
skipped (`catalog::load` reports 25 undecodable) and the decoding question stays
open rather than guessed.
