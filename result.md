# P0b robust native workspace result

- Native `.tnet` loading is transactional and returns located `Problem` values. Schema 0 migrates to current schema 1; the frozen schema-1 fixture remains byte-stable and newer schemas are rejected.
- Validation covers unique device ids, catalog models, link endpoints and model-valid free ports, IPv4/IPv6 addresses and masks, and VLAN ranges. Duplicate IPv4 addresses on one subnet are warnings. Open-anyway omits only invalid records and returns the drop report to the UI.
- Unknown nested elements and unknown attributes on known records survive deterministic save. The iterative XML reader enforces 8 MB, 20,000 records, depth 8, and rejects DTD/entity declarations.
- Browser storage rotates current, previous and last-known-good snapshots, visibly reports recovery, and persists 100-step undo/redo in session storage.

## Verification

- `cargo test`: **202 passed, 0 failed** across 5 suites.
- `node --test tests/js/*.test.js`: **23 passed, 0 failed**.
- L29: 30 broken documents; L30: 5,000 mutations; L31: frozen v1 plus migration; L32: unknown attributes/elements.
- L33 measured in the debug test build: 9 MB rejection **0.014 ms**; 10,000-deep nesting rejection **0.178 ms** (both limits are 200 ms).
