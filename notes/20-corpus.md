# 20 — Corpus open test and Desktop apps

Status: landed 2026-11-01.

## `tests/corpus.rs`

Opt-in (`PT_CORPUS=1`) integration test that drives the real server:

1. spawn `CARGO_BIN_EXE_pt-web` on port 38200,
2. `GET /api/pkt/list`,
3. `POST /api/pkt/open?path=<percent-encoded>` for each of the 299 saves across
   8 scoped worker threads (decrypt/parse happen before the workspace lock, so
   concurrent imports stay correct; a transport reset is retried up to 3×),
4. validate every response: HTTP 200, no `"error"` (except the two known
   non-errors), a `"devices"` array, and every link endpoint present among the
   response's device ids.

Buckets and result:

```
corpus: 239 opened, 18 skipped (undecodable container), 0 errors, 42 empty (299 total) in 34.4s
```

- **18 skipped** — the known second container variant (`could not decrypt:
  unknown container key`), the same family the `.pkt` writer skips.
- **42 empty** — the server reports `no devices in file` (activity/config-only
  saves with no logical devices).
- **0 errors** — no malformed import, no dangling link endpoint.

The test asserts `errors == 0` and `opened + empty + skipped == total`, so a new
regression shows up as an error bucket, not a silently skipped file.

## Desktop apps (from the same batch)

- **Text Editor**: per-device text persisted in
  `localStorage['pt-web:editor:<id>']`; verified save → close → reopen.
- **Traffic Generator**: 1–200 packets, interval in ms; each one is a real
  `/api/pdu` or `/api/cmd ping`, with sent/received/lost counters. Verified 10
  pings producing 10 ICMP events in the capture buffer.
- **MIB Browser**: live device table + per-device interface list, explicitly
  labelled local (no SNMP agent is simulated).

## Note

`cargo test` keeps the corpus test skipped, so the suite stays ~2 s; the full
corpus is a 35 s run once asked for.
