# 08 — Frame-level simulation (`packet.rs`, `fwd.rs`)

Status: landed 2026-11-01. Replaces the "path label" PDU with actual bytes.

## What changed

`Workspace::send_pdu` used to return a device-id path chosen by BFS over the
link graph. It now hands the job to `fwd::deliver`, which moves one
`packet::Frame` and reports what happened at every device.

| Piece | Evidence in code |
|---|---|
| Ethernet + IPv4 + ICMP encode/decode | `packet.rs`, round-trip and checksum tests |
| L2 decision (learn, hit, flood) | `fwd.rs` switch arm, `MacTable` |
| TTL decrement per router | `Packet::transit`, `Transit::TimeExceeded` |
| Re-encapsulation per segment | `cur_src` + `next_l3_id` in `fwd.rs` |
| ARP cache | `ArpTable`, 120 s timeout |
| Admin-down breaks the path | `bfs(.., require_up)` checks **both** cable ends |

## Rules implemented

- A router drops the datagram when the decremented TTL reaches zero
  (RFC 1812 §5.3.1) and the event never appears.
- Switches never learn multicast/broadcast source addresses.
- Unknown unicast, broadcast and multicast flood every port but ingress.
- A console cable (`eConsole`) is out of band: excluded from `bfs`, lands on
  `RS-232`/`Console`, and never consumes a Gigabit interface.
- A port is only `up` when it is administratively enabled **and** cabled;
  otherwise `show ip interface brief` reports `notconnect`.

## Verified

```
pdu?src=pc0&dst=pc2   →  path pc0,switch0,router0,switch1,pc2   size 74
  PC0      —        → Fa0        ttl 128
  Switch0  Fa0/2    → Fa0/1       ttl 128  flooding (unknown 00d0.ba0a.46dc)
  Router0  Gig0/0   → Gig0/1      ttl 127  routed: TTL 128 -> 127
  Switch1  Fa0/1    → Fa0/3       ttl 127
  PC2      Fa0      —             ttl 127
```

`show ip interface brief` on the demo router:

```
GigabitEthernet0/0  192.168.1.1  up           up
GigabitEthernet0/1  192.168.2.1  up           up
GigabitEthernet0/2  unassigned   notconnect   down
```

Shutting g0/0 makes the same PDU fail with
`Router0 GigabitEthernet0/0 is administratively down — bring it up with
`no shutdown``.

## Not done yet

- Event scheduler/transport is still one event per PDU; replay controls walk
  the recorded list.
- PDU detail dialog renders the hops as a table, not PT's In/Out layer stack.
- No TCP/UDP segments yet — `IpProto::{Tcp,Udp}` exist but carry opaque bytes.
