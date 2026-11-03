# 25 — Verification log

Every phase in this project ends with the Rust suite and a live Chromium pass.
Chromium is not installed in this repository or its container (assets are
mounted read-only at run time), so the browser checks below were executed from
the developer harness against `http://127.0.0.1:3000` and recorded here; the
HTTP half is automated in `tests/e2e.rs` and `tests/corpus.rs`.

## Automated

- `cargo test` — full unit, integration and canonical HTTP-lab suite.
  - unit: forwarding, VLAN/STP, ACL/NAT, routing (RIP/OSPF), port-security,
    EtherChannel, DHCP, DNS/HTTP/mail/TFTP/FTP/NTP/syslog/AAA, wireless/VPN/
    PPPoE/phone state, SLAAC, `.ptw` round-trip for every one of them.
  - labs (`tests/labs/main.rs`): routed protocols and services plus simulation
    parity for real TCP/HTTP layers, mixed PDU lists, partial-hop drop captures,
    and DHCP/DNS/SMTP control-plane inspection.
  - e2e (`tests/e2e.rs`): HTTP endpoints including mail send/list, TFTP, FTP/
    syslog/AAA/NTP, `/art` serving and traversal refusal, VLAN CLI + STP `BLK`.
- `node --test tests/js/simulation.test.js` — dependency-free DOM conformance
  for filters, stable event IDs, playback/capture counts and layer inspection.
- `PT_CORPUS=1 cargo test --test corpus` — 239 opened, 239 valid JSON,
  226 simulated, 96 delivered, 18 skipped containers, 0 errors.
- `cargo test --test e2e` covers the same endpoints without a browser.

## Chromium passes (feature → observed)

| Feature | Observed |
|---|---|
| Asset browser / workspace | 7 devices, 6 links, palette, simulation panel |
| Own artwork | canvas `href=/art/router.svg…`; `/art/router.svg` → 200 `image/svg+xml`; traversal → `not found` |
| Device window | tabs Physical/Config/Desktop/Programming/Services; IP configuration |
| CLI | `en`, `conf t`, `access-list 10 deny …`, `ip access-group 10 in`; `/api/pdu` → `ACL denied on Router0 GigabitEthernet0/0` |
| Mail | created `alice`/`bob`, sent `UI test`, server inbox showed unread dot |
| TFTP | added `startup.cfg`, listed, removed, list empty |
| Services tab | Reservations/DNS/HTTP/Mail/TFTP/FTP/AAA/Syslog/NTP |
| Physical view | 7 boxes grouped by kind, `Server0 · Server-PT — 1 cable · 1 cabled port · Fa0` |
| PC Wireless | `1 network visible`, joined `LAB-WIFI`, `Associated with LAB-WIFI via wlc0` |
| Dialogs | `200 shown · 200 fetched · 10598 rows in catalog` |

## Not automated here

A repo-resident Chromium runner is not possible without a browser in the
environment; the browser half is a recorded manual gate. `tests/e2e.rs` plus the
corpus test cover the same server behaviour headlessly.
