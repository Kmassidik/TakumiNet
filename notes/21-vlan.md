# 21 — VLANs, trunks and spanning tree

Status: landed 2026-11-01.

## Model

`PortCfg` gained two fields: `vlan: u16` (access VLAN, default 1) and
`trunk: bool`. Physical ports keep their address fields; a switch port simply
also carries its VLAN membership.

`Workspace::vlans: HashMap<device id, Vec<(vlan id, name)>>` holds the named
VLANs per switch — VLAN 1 is implicit and cannot be deleted or renamed away.

| Method | Behaviour |
|---|---|
| `vlan_create(id, vlan, name)` | create/rename; rejects ids outside 1–4094 |
| `vlan_delete(id, vlan)` | refuses VLAN 1 and any VLAN still used by an access port |
| `set_access_vlan(id, iface, vlan)` | requires the VLAN to exist; refuses trunk ports |
| `set_trunk(id, iface, bool)` | switches the port between access and 802.1Q trunk |
| `stp_blocked_ports()` | ports put in blocking state by the spanning tree |

## Data plane

`fwd` now tracks the frame's VLAN:

- the first switch **access** ingress port pins the frame to its VLAN;
- an **access** egress port must match, otherwise
  `VLAN mismatch: Switch0 FastEthernet0/3 is VLAN 20`;
- a **trunk** port carries the frame tagged (no mismatch);
- a router boundary clears the VLAN (untagged again).

Spanning tree: switches are the only participants. The tree is built by BFS
from the lowest bridge id (device id order) over switch-to-switch links; every
switch-switch port not in that tree is blocking, and `fwd` refuses to use it.
If no path exists and a loop is present the error names the blocking port.

Verified: PC0→PC1 fails with the VLAN mismatch once PC1's port moves to VLAN 20,
and succeeds when both ports are in VLAN 20; a three-switch loop blocks exactly
one link (two ports) and PC0→PC2 still traverses the tree via Router0.

## CLI

- Config: `vlan 20 SALES`, `no vlan 20`.
- Interface: `switchport mode access|trunk`, `switchport access vlan 20`,
  `switchport trunk encapsulation dot1q`, `switchport nonegotiate`.
- Show: `show vlan brief`, `show spanning-tree`, `show interfaces switchport`,
  `show interfaces trunk`.

Live check on `:3000`:

```
VLAN Name                             Status    Ports
1    default                          active    FastEthernet0/1, …
20   SALES                            active    FastEthernet0/3

FastEthernet0/5  Altn BLK        (switch1, after adding a redundant link)
```

## Persistence

`port` lines now carry `vlan` and `trunk` (6-field form still parses as VLAN 1 /
access), and `vlan <switch> <id> <name>` records the names. The round-trip test
asserts both survive save → load and that the reserialized file is identical.
