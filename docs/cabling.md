# Copper cable pairing

Ethernet pairs are wired from one of two roles:

- **MDI**: a host network card, or a router port.
- **MDI-X**: a switch or hub port, which crosses the pairs internally.

Two ports of the same role need a crossover cable. Opposite roles need a
straight-through cable.

| End A | End B | Fixed 10/100 ports | Auto-MDI-X ports |
|---|---|---|---|
| MDI (PC) | MDI (PC) | crossover | either cable |
| MDI (PC) | MDI-X (switch) | straight | either cable |
| MDI-X (switch) | MDI-X (switch) | crossover | either cable |
| MDI (router) | MDI-X (switch) | straight | either cable |

Auto-MDI-X detects which pairs carry transmit and receive and swaps them. It is
standard on modern 10/100/1000 ports, so straight-through works for PC to PC.

## What Takumi models

`src/workspace/mdi.rs` gives each kind a role and an auto flag:

- every model except the hub is **auto**;
- the **hub** is a fixed MDI-X port, because it is the one deliberately old
  device;
- `eCopper` is a straight-through cable and `eCross` a crossover.

Consequences:

- PC to PC accepts either cable, because both ends auto-detect.
- PC to switch accepts either cable.
- Hub to hub accepts a crossover and refuses a straight cable with the reason
  “two fixed MDI-X ports need a crossover cable”.
- One auto end lifts the fixed rule.

This is deliberate: enforcing the old PC-to-PC crossover rule would reject 103
links across 33 existing templates that use modern auto-sensing hardware. The
model follows the hardware it presents, not the 1990s rule.

Fiber, serial, console, phone, coax and IoT cables are unaffected.

## Machine check

`tests/bend/proof_cable_pairing.bend` checks all 16 combinations of auto flags,
role equality and cable type. `tests/workspace/tests/cabling.rs` checks the same
rule against every pair of catalog models. Both print zero counterexamples.

```bash
bend tests/bend/proof_cable_pairing.bend
cargo test cabling --lib
```
