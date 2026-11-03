# 11 — DHCP pools, leases, and the interface state machine

Status: landed 2026-11-01.

## Interface state

`Workspace::port_state` resolves three facts instead of one boolean:

| fact | source |
|---|---|
| `admin_up` | the interface's `shutdown` state (`PortCfg::up`) |
| `linked` | a cable ends on that interface (`peer_port`) |
| `line_up` | `admin_up` **and** `linked` **and** the peer's `admin_up` |

`show ip interface brief` maps them to IOS wording — `administratively down`,
`notconnect`, `up` with protocol `down` when the far end is shut — and
`show interfaces X` prints `up, line protocol is down` for that last case.
Verified by shutting Switch0's `Fa0/1` and watching Router0's `g0/0` lose its
line protocol, then regain it with `no shut` on the switch.

## DHCP

State lives on the workspace, not on `Device`, so no template or save format
had to change:

```rust
pub dhcp_pools: HashMap<String, Pool>,      // server id -> subnet/gateway/dns
pub dhcp_leases: HashMap<String, Vec<u32>>, // server id -> addresses handed out
pub dhcp_clients: HashSet<String>,          // hosts using DHCP
```

`set_dhcp_pool(id, network, prefix, gateway, dns)` validates the subnet and
stores the pool. `acquire_dhcp(id)`:

1. Finds a server **on the same L2 segment** — BFS over data links that refuses
   to traverse a router, so a pool across Router0 never answers.
2. Walks the pool from `.100`, skipping the gateway, every configured address
   and every outstanding lease.
3. Writes address, mask, gateway and DNS onto the client, marks it a DHCP
   client, records the lease, and pushes a `DHCP` event into the capture buffer.
4. Errors with `no DHCP server on this segment` or `DHCP pool exhausted`.

Renewal reuses the client's current address and never appends a duplicate
lease. `ipconfig /release` clears both the host configuration and the server
lease, so the next acquisition can reuse the address. Static configuration
(`set_ip`, `set_config`) also releases the old lease and removes the host from
`dhcp_clients`, so the radio in the dialog reflects reality. Relay discovery
uses the client's L2-connected router interface after release, when no old IP
address remains to identify the subnet.

## UI

- Server → Desktop → **IP Configuration** now shows a **DHCP Pool** fieldset
  (network, mask, gateway, DNS, Save Pool). Verified: "Pool saved".
- Client → **DHCP** radio → **Apply** calls `/api/dhcp/acquire` and fills the
  fields with the lease. Verified: PC2 went from `192.168.2.10` to
  `192.168.2.101/24 gw 192.168.2.1 dns 8.8.8.8`, note `Lease 192.168.2.101/24`.
- `ipconfig /renew` in the Command Prompt performs the same exchange.

## Bug found while verifying

`#ip-dialog` and `#device-window` were both `.overlay { z-index: 80 }`, and the
device window comes later in the DOM — so the IP dialog (opened **from** that
window) was painted underneath it and could not be clicked. Fixed with
`#ip-dialog { z-index: 95 }` and `#cmd-window, #term-window { z-index: 94 }`.

## Not covered yet

- DHCP relay (`ip helper-address`) and static reservations are still open.
- The lease is modelled as a control-plane action plus one captured event, not
  yet four broadcast frames (DISCOVER/OFFER/REQUEST/ACK) on the wire.

## Reservations and relay (added)

- `set_dhcp_reservation(server, client, ip)` pins a client; `acquire_dhcp` uses
  the pinned address instead of walking from `.100`, and refuses if another
  device already holds it.
- `set_dhcp_helper(router, iface, address)` / `remove_dhcp_helper` configure
  `ip helper-address` per interface. When no server answers on the client's
  segment, `relayed_server_for` looks for a router interface in the client's
  subnet with a helper pointing at a server that owns a pool, and leases from
  that pool instead.
- CLI: `ip helper-address A.B.C.D` / `no ip helper-address` in interface mode,
  `show ip helper-address` in privileged mode.
- HTTP: `POST /api/devices/dhcp/reserve?id=&client=&ip=` and
  `POST /api/devices/dhcp/helper?id=&iface=&helper=` (empty helper removes).
- Persistence: `reserve` and `helper` lines; the round-trip test asserts both
  survive save → load and stays byte-identical.
- Tests: reservation wins over the pool walk and validates inputs; relay leases
  `192.168.1.100` for PC0 through Router0's helper, and removing the helper
  restores `no DHCP server on this segment`.
