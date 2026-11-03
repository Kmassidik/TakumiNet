# P3 browser native files result

- File > Export downloads `<name>.tnet` with a Blob and no server-side save. The picker accepts only `.tnet`; picker and workspace drop share one atomic import path, show every readable validation problem, and use the error mascot without changing current data on failure.
- Browser edits autosave the latest snapshot after a one-second debounce, flush on page exit, and offer “Restore last session” on reload. Storage access and calls remain guarded.
- L22 and L23 are registered in `provness/pt-web/LAWS.md`. `cargo test`: **218 passed, 0 failed**; `node --test tests/js/*.test.js`: **34 passed, 0 failed**.
- Actual Chrome export/picker round trip matched workspace JSON, T2 drop loaded 4 devices/3 links, `.txt` and malformed `.tnet` drops were atomic with readable mascot errors, and autosave/reload restored identical JSON. Final clean run: **0 console errors**. No P4 work was started.

# P2 beginner templates result

- `docs/templates-next.md` contains prompts only for T6 VLANs, T7 router-on-a-stick, T8 static routes, T9 ACLs, and T10 NAT. No T6–T10 template or P3 work was started.

- T5 ships two blank PCs, a switch, and a server without DNS records. The new `nslookup` evaluator invokes the same real terminal command and requires its exact name/address answer. L21 `l21_t5_dns_name_resolves_and_opens_website_after_solution` observes HTTP and DNS failure, configures hosts and the A record through the API, verifies terminal nslookup and a named browser fetch, then passes both checks. Tested 2026-11-03 with `cargo test`: **217 passed, 0 failed** across 6 suites. The L16 validator also loads every gallery template and opens T1–T5 without unresolved devices or ports.

- T4 ships two blank PC pairs, two switches, and a router with both router interfaces initially shut down. L20 `l20_t4_routed_networks_deliver_ttl127_and_connected_routes` observes the main ping failure, configures four hosts through the API and both router interfaces through the stateful CLI, verifies terminal TTL 127 and both connected routes, then passes ping, TTL, and both exact-prefix checks. Tested 2026-11-03 with `cargo test`: **216 passed, 0 failed** across 6 suites.

- T3 ships the required home-router, laptop, PC, and server star with no addresses, DHCP pool, clients, or leases. Home routers now expose four real FastEthernet LAN ports so all three links validate. L19 `l19_t3_dhcp_leases_and_web_page_after_solution` observes lease and HTTP failure, configures Server0 and its pool through the API, renews both clients through `ipconfig /renew`, fetches the actual page, and passes all three checks. Tested 2026-11-03 with `cargo test`: **215 passed, 0 failed** across 6 suites.

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
