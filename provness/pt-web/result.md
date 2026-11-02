# pt-web verdict

Checked on 2026-11-03. No proof tool has been run: Bend is not installed.

| Law | Status | Evidence |
|---|---|---|
| L1 | tested | `cargo test` (137 unit, 24 e2e pass) |
| L2 | stated | no dedicated test |
| L3 | tested | one known header only |
| L4 | tested | `cargo test` |
| L5 | tested | `cargo test` |
| L6 | tested | indirect, through the ptw round-trip |
| L7 | tested | `cargo test` |
| L8 | tested | partial |
| L9 | tested | `no_vlan_deletes_a_vlan`, which failed before the order fix |

Nothing is `proven`.
