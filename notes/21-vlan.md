# 21 — VLANs, trunks and spanning tree

Status: landed 2026-11-01.

## Model

`PortCfg` carries `vlan: u16` (access VLAN, default 1), `trunk: bool`, and
`dot1q: Option<u16>` for router subinterfaces. Physical ports keep their
address fields; a switch port also carries its VLAN membership. Router
subinterfaces share their parent's cable and line state but have independent
IP and 802.1Q configuration.

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
- a routed boundary clears ingress VLAN context, then the outgoing router
  subinterface selects and validates the egress 802.1Q tag.

Spanning tree uses the IEEE extended bridge id `(priority + VLAN, MAC)` with
default priority 32768. Dijkstra root path costs run over active logical links;
root ports use root-cost/sender-bridge/sender-port/local-port tie-breakers.
Each segment has one designated side, and only the non-root, non-designated
endpoint blocks. Shutdown links are excluded, so the tree reconverges on the
next delivery/show command. Rapid-PVST uses the same deterministic loop-free
state and displays `protocol rstp`.

Compatible EtherChannel members collapse into one logical STP edge with
aggregate cost. The data path records exact cable indices, so a failed member
is skipped while its surviving bundle peer continues forwarding. Incompatible
or down members are not bundled.

Verified by HTTP labs: PC0→PC1 fails with a VLAN mismatch until both access
ports agree; router subinterfaces deliver inter-VLAN ICMP with TTL 127; a
three-switch loop blocks exactly one endpoint, honors MAC/priority root
election, and reconverges after shutdown; a two-member LACP bundle survives
one member failure and goes down when both fail.

## CLI

- Config: `vlan 20 SALES`, `no vlan 20`.
- Interface: `switchport mode access|trunk`, `switchport access vlan 20`,
  `switchport trunk encapsulation dot1q`, `switchport nonegotiate`,
  `channel-group 1 mode active`, `encapsulation dot1Q 10` on a subinterface.
- Config: `interface g0/0.10`, `spanning-tree vlan 1 priority 4096`,
  `spanning-tree mode rapid-pvst`.
- Show: `show vlan brief`, `show spanning-tree`, `show interfaces switchport`,
  `show interfaces trunk`, `show etherchannel summary`. STP, channel group and
  subinterface commands are included in running and startup configuration.

Live check on `:3000`:

```
VLAN Name                             Status    Ports
1    default                          active    FastEthernet0/1, …
20   SALES                            active    FastEthernet0/3

FastEthernet0/5  Altn BLK        (switch1, after adding a redundant link)
```

## Persistence

`port` lines carry `vlan`, `trunk`, and optional `dot1q`; older forms still
parse as physical access ports. `vlan`, `channel`, `stpmode`, and
`stppriority` records preserve the remaining configuration. Round-trip tests
cover subinterface creation/addressing, LACP mode, rapid-PVST, and per-VLAN
priority, and assert identical reserialization.
