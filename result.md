# P2 beginner templates result

- T2 ships a blank three-PC switch star. The new `mac-table` lesson evaluator reads the same live learned rows as `show mac address-table`; it is not a ping-only substitute. L18 `l18_t2_switch_star_learns_three_macs` checks ping and MAC failure before the solution, configures all hosts, runs three pairwise terminal pings, verifies the real switch CLI total of 3, then passes all four checks. Tested 2026-11-03 with `cargo test`: **214 passed, 0 failed** across 6 suites.

- T1 ships an ordinary `.tnet` cross-cable topology with blank host addressing. L17 `l17_t1_static_addresses_fail_before_and_ping_after` observes `c1` failing before configuration, then applies both static addresses through `/api/devices/ip`, succeeds with a real terminal ping, and passes the lesson check. Ping and TTL lesson checks now reject unaddressed endpoints instead of using the bare-L2 simulation fallback, matching terminal behavior. Tested 2026-11-03 with `cargo test`: **213 passed, 0 failed** across 6 suites.

# P1 native lesson template engine result

- Native `lesson`, `step`, and `check` records round-trip inside ordinary `.tnet` workspaces. Loading validates a single lesson, unique step/check identifiers, supported check kinds, numeric metadata, and device references; steps load in numeric order and check order remains stable.
- `Workspace::run_checks` evaluates ping, delivered TTL, HTTP page title, DHCP lease, unexpired ARP entry, and exact selected-RIB prefix using real engine state. Ping and HTTP checks populate captures. DHCP checks observe state without acquiring a lease, and route checks do not accept a covering default route.
- Added `GET /api/checks`, `GET /api/templates`, `POST /api/templates/open`, and `POST /api/new`. Template loading is transactional, template IDs are filename-safe, stale CLI sessions are cleared, and New blank installs an empty workspace rather than the demo.
- The Chrome start gallery uses original TakumiNet network, toolbar, and mascot artwork with New blank, Open file, and Import actions. The lesson panel provides ordered step tick marks, per-check pending/running/pass/fail feedback, hints, pristine-template reset, and think/happy/error mascot states with the required sounds.
- L14–L16 are registered in `provness/pt-web/LAWS.md`. Six lab-style check tests include failing-before/passing-after behavior and terminal equivalence. The L16 validator already enumerates `web/templates/*.tnet`; P2's T1–T5 files will enter the same hook without test changes. No T1–T5 template was built in P1.

## Verification

- `cargo test`: **212 passed, 0 failed** across 6 suites.
- `node --test tests/js/*.test.js`: **26 passed, 0 failed**.
- API/e2e coverage opens a native lesson fixture, sorts its steps, runs checks, observes the resulting ICMP capture, verifies deterministic reopen, rejects unsafe/missing template IDs, and confirms blank New.
- Headless Chromium loaded the gallery at 1440×1000 with all five visible artwork images complete at 256×256 natural size, **0 broken images**, and **0 console errors**. Clicking New blank hid the gallery, produced zero devices, and kept the blank lesson panel hidden.
