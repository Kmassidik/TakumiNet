# provness

Laws first, code second. Each project gets `provness/<name>/` holding the rules
its code must keep, written so a machine can check them later.

```
provness/<name>/
  LAWS.md      plain-language laws, each pointing at the Rust that keeps it
  LAWS.bend    the same laws as Bend axioms          (not written yet)
  PROOF.bend   proofs that reference LAWS.bend       (not written yet)
  main.bend    entry point                           (not written yet)
  result.md    verdict: which laws are proven, tested, or only stated
```

## Status

Workflow only. Nothing is installed and no `.bend` file exists, because the
Bend 2 toolchain has not been installed here and syntax written without a
compiler to check it would be guesswork.

Every law has a status in `result.md`:

| Status | Meaning |
|---|---|
| stated | written down, nothing checks it |
| tested | a unit or e2e test covers examples |
| asserted | the code carries a `debug_assert!` or a type that enforces it |
| proven | a Bend (or Kani/Lean) proof was checked, with the command that ran |

A law only moves to `proven` after the proof command has actually run and its
output is pasted into `result.md`.

## For AI agents

1. Read `LAWS.md` before changing the code a law points at.
2. A change that breaks a law must update the law and `result.md` in the same commit.
3. Never mark a law `proven` without running the proof.
