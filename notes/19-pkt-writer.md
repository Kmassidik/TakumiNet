# 19 — `.pkt` writer and corpus round-trip

Status: landed 2026-11-01.

## Encoder

`ptfile::encode(xml) -> Vec<u8>` is the canonical container writer (zlib with a
4-byte big-endian length → position-keyed XOR → Twofish-EAX → reverse-keyed
XOR). `encrypt` remains as a thin alias so existing callers (the `.ptd` catalog)
keep working; a test asserts both produce identical bytes.

## Corpus result

```
cargo run --bin pkt2rs -- --roundtrip intake/…/opt/pt/saves
roundtrip: 275 ok, 18 skipped, 0 failed
```

- **275 ok** — decrypt → encode → decrypt yields byte-identical XML.
- **18 skipped** — the known second container variant (`HTTPS.pkt`, `QoS.pkt`,
  `Ipsec.pkt`, `ZFW.pkt`, …) that this codec has never decoded: every key
  candidate fails the EAX tag. Same family as the README's 281/299 decode gap.
- **0 failed** — no decodable save changed across the round-trip.

Ciphertext identity is explicitly not required (zlib output can differ); the
contract is XML-level.

## Test gating

The corpus walk costs several minutes over 293 files, so the unit test
`ptfile::tests::corpus_round_trip_preserves_xml` returns early unless
`PT_CORPUS=1` is set (and it skips entirely in the `pkt2rs` target to avoid
running the walk twice). `cargo test` therefore stays at ~2 s, while
`PT_CORPUS=1 cargo test --bin pt-web` and the CLI mode run the full corpus.

## `pkt2rs --roundtrip`

Prints `ok <path>` / `skip <path>: <reason>` / `fail <path>: <reason>` per file,
then the summary line, and exits non-zero only on real mismatches. The existing
`--xml`, `--all` and single-file conversion paths are unchanged.
