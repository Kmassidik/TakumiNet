# 05 — Full mesh: topology, endpoint, ports

**Status:** `Workspace::mesh` + `POST /api/mesh` implemented; `e2e_full_mesh`
covers the three-device case.

## What full mesh means

A full mesh connects every device to every other device directly. For `n`
devices that is `n(n-1)/2` links and every device ends up with degree `n-1`:

| devices | links | links per device |
|---|---|---|
| 2 | 1 | 1 |
| 3 | 3 | 2 |
| 4 | 6 | 3 |
| 5 | 10 | 4 |

The demo never builds intermediate switches: a mesh of three workstations gets
three separate cables, so a PDU can reach both peers in one hop.

## Endpoint contract

```
POST /api/mesh?ids=id1,id2,id3
```

- `ids` is a comma-separated list; surrounding spaces and empty entries are
  ignored.
- Duplicate ids are collapsed before pairing, so `ids=pc3,pc3,pc4` is the same
  as `ids=pc3,pc4`.
- Unknown ids are ignored. After that, fewer than two known devices is an
  error: `{"error":"..."}` and the workspace is left untouched (`apply`
  restores its snapshot).
- Every unordered pair without a link gets one, in `ids` order: `(0,1)`,
  `(0,2)`, `(1,2)`, ... Pairs that are already linked are skipped, so running
  the same request twice changes nothing.
- The response is the standard workspace JSON (the same shape as
  `GET /api/workspace`), not a link count. The number of new links is the
  return value of `Workspace::mesh` (`Ok(usize)`), which the HTTP layer
  discards.
- Because it goes through `apply(...)`, the whole mesh is one undo step and is
  rejected atomically on error.

## Port assignment

`link()` assigns each end through `next_port(id)`, which counts the links the
device already has and derives a name from its kind:

| kind | port name | example |
|---|---|---|
| `router` | `Gig0/<used>` | first link `Gig0/0`, second `Gig0/1` |
| `switch` | `Fa0/<used + 1>` | first link `Fa0/1`, second `Fa0/2` |
| everything else | always `Fa0` | every PC/Server link is `Fa0` |

Ports are fixed when the link is created; meshing an existing device later
continues the sequence, and `unlink` does not compact the numbering. Note that
`next_port` counts rather than searches, so deleting a middle link lowers the
count and the next link reuses a name that a surviving link on the same device
already holds (with `Fa0/1`, `Fa0/2`, `Fa0/3` present, removing `Fa0/2` makes
the next link `Fa0/3` again) — fine for the demo graph, not a faithful
interface table.

## Limitation: infinite ports

Real hardware has a finite port count: a 2960 has 24 Fast Ethernet ports, a
workstation has one NIC, a 2911 has three gigabit ports. The demo performs no
capacity check, so the mesh path can name ports that cannot exist:

- a workstation with three mesh links gets `Fa0` three times, because the
  fallback branch ignores the counter;
- a switch in a mesh of more than 24 devices eventually produces `Fa0/25` and
  beyond;
- the router branch keeps producing `Gig0/2`, `Gig0/3`, ... past its real
  interfaces.

This is deliberate for a canvas demo: links never fail to create, and the PDU
simulator only needs connectivity, not per-port capacity. A real that simulator
build would reject the link once the port budget is exhausted (or pick the next
free port). Any future port model has to keep `next_port`'s names stable so
saved topologies and the e2e assertions keep matching.

## Verification

`e2e_full_mesh` (port 38173) adds `pc3`, `pc4`, `pc5` to the demo, meshes
them, and checks the demo's 6 links plus exactly 3 new ones, degree 2 per new
device, an unchanged 9 links on a second call, an error for a single known id,
and the 7-device / 6-link demo after `/api/reset`.
