# 24 — Routing, policies and wireless apps

Status: landed 2026-11-01.

## Routing protocols

`router rip`, `router ospf PID`, and `router eigrp AS` enter protocol-specific
router submodes. RIP uses `version 2` and retains classful `network A.B.C.D`;
OSPF accepts `network IP WILDCARD area N`. Interface `bandwidth KBPS` and
`delay USEC` control path metrics, and their `no` forms restore interface
defaults. Protocol IDs, areas, metrics, and static administrative distances
persist in running/startup configuration and `.tnet` saves.

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

Backend state (all persisted in `.tnet`):

- WLC WLANs (`wlan_add`, PSK ≥ 8), scan across controllers, WPA2-PSK join with
  `authentication failed` on a wrong key, association status, and disconnect.
- VPN and PPPoE dialer configs require a real device address; IP phones register
  with a call-manager address and extension.

Desktop apps: PC Wireless (scan/join/status/disconnect, WLAN editor on a WLC),
VPN, PPPoE Dialer, IP Communicator, and a Firewalls window that prints the
device's `show access-lists` over the CLI.

Chromium check: PC Wireless showed `1 network visible`, joined `LAB-WIFI`, and
reported `Associated with LAB-WIFI via wlc0`.
