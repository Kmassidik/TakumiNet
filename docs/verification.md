# Exhaustive checks for UI rules

These are machine-checked finite checks, not general theorems. Bend is a
language, not a proof assistant; what it gives here is an independent model that
enumerates every case in a small domain. `0` means no counterexample exists.

## Menu stepping

Rule: from a start item, Arrow Down or Arrow Up moves to the nearest enabled
item in that direction, wrapping, and never lands on a disabled item. With no
start, Down starts at the first enabled item and Up at the last. A menu with
nothing enabled returns "none".

`tests/bend/proof_menu_steps.bend` models this rule twice:

1. the algorithm: scan from the start, one position at a time;
2. a reference: compute the distance from the start to every enabled item and
   take the smallest.

It checks every enabled pattern of length 0 to 5 (all 2^n masks), every start
(none and each item) and both directions: 642 cases. Each case also checks that
a returned item is enabled and that "none" appears exactly when the pattern has
no enabled item. The program prints `0` when all cases hold.

`tests/ts/menu_nav.test.ts` runs the same 642 cases against the real
`stepItem` used by the menu bar, comparing it with an independent first-match
scan. This covers the implementation, while the Bend model covers the contract
on its own.

Reproduce:

```bash
bend tests/bend/proof_menu_steps.bend       # prints 0
bun test tests/ts/menu_nav.test.ts
```

## Cable pairing

`tests/bend/proof_cable_pairing.bend` checks the 16 combinations of auto-MDI-X
and fixed ports. `tests/workspace/tests/cabling.rs` runs the same table against
every pair of palette models. See `docs/cabling.md`.

## Scope

Verified:

- all enabled patterns up to five items, all starts, both directions;
- skip, wrap, nearest enabled item, empty menu, and disabled landing;
- the TypeScript implementation over the same finite domain;
- the copper pairing table for every catalog pair and both cable types.

Not verified:

- DOM focus, hover, click and keyboard event wiring;
- menu open/close state, submenu placement, Escape order;
- rendering, hit areas, tooltips and screen layout;
- any other UI tool until it gets its own model.

The Bend model is written by hand from the TypeScript rule. There is no
mechanical refinement proof connecting the two, so a change to `stepItem` must
change both or the TypeScript exhaustive test will fail.

`bend <file> --verdict` would recheck through BendTT's kernel, but this machine
has no Lean toolchain installed, so that stronger check was not run.
