# P5 browser WASM and offline result

- The crate is split into a reusable engine library and a native static/development server. `src/engine.rs` exports raw `handle(request_ptr, len) -> response_ptr` plus exact-size allocation/deallocation, preserves method/path/query/body and status/content-type/bytes, and owns one complete workspace/history/CLI context per WASM instance. The small `web/js/engine.js` fetch shim queues behind initialization, falls back to native HTTP only when WASM loading fails, and keeps named saves in browser storage. Templates are embedded; PCAP export uses the active tab's engine.
- **L25:** the 20 canonical native labs recorded 1,218 exact response fixtures. Final headless Google Chrome replay through fresh WASM instances passed **20/20 labs and 1,218/1,218 byte-identical responses**, including status and content type, with zero console/page errors. Native recording command: `LAB_FIXTURE_DIR=tests/fixtures/labs cargo test --test labs -- --test-threads=1`.
- **L34:** real Google Chrome installed the complete precache, then reloaded in offline mode with `navigator.onLine === false`, a controlling service worker, WASM mode, the full Ready UI and all five templates. Solved T4 produced delivered TTL 127 and all four checks passed offline; final console/page errors: **0**.
- **L35:** two real Chrome tabs stayed independent. Tab A saved/new/reloaded a one-PC snapshot while tab B retained the original seven devices, then created a one-router workspace; tab A remained one PC. No server sessions were introduced.
- Budgets measured on the final `web/engine.wasm`: **1,709,275 bytes** (limit 3,000,000); offline cold start **13.3 ms** (limit 1,000 ms); five solved-T4 pings **5.7, 0.9, 0.7, 0.8, 0.6 ms** (worst 5.7 ms, limit 50 ms). Reproducible build: `./scripts/build-wasm.sh` using release `opt-level="z"`, LTO and `panic="abort"`.
- Failing tests came first: the new Rust raw-engine test failed with unresolved `pt_web`, and the loader test failed because `web/js/engine.js` did not exist. Final `cargo test`: **229 passed, 0 failed** across 9 suites. Final `node --test tests/js/*.test.js`: **63 passed, 0 failed**. Laws L25/L34/L35 are registered in `provness/pt-web/LAWS.md`. No P6 work was started.

# P4b network engineer view result

- The bottom Capture dock links all seven columns, fixed protocol colours and stable selection to an expandable details tree and real hex/ASCII wire bytes. Layer selection highlights exact byte ranges. The safe display-filter grammar covers every required protocol/address/MAC/TTL operator with readable errors. The Flow tab renders the same events as selectable pure-SVG lanes and arrows.
- First addressed traffic records real ARP request/reply frames before ICMP/HTTP and reuses valid ARP caches. Rust narration explains actual learning, flooding, ARP, TTL forwarding, delivery and drops. Playback provides 0.25×/0.5×/1×/2×, Step/Back/Play/Reset, Space/Left/Right shortcuts and protocol-coloured canvas packets. Live lesson checks show spinners, ticks/crosses and per-check reasons, then refresh captures and animate the checked path. Save capture downloads standard Ethernet `.pcap`.
- Laws registered in `provness/pt-web/LAWS.md`: **L24b** `L24b capture rows preserve every engine event exactly once in time order`; **L25b** `L25b conjunction equals intersection over generated packets and filters` (169 generated filter pairs); **L26** `l26_captured_ipv4_bytes_have_a_valid_rfc1071_checksum`; **L27** `l27_pcap_reparse_returns_identical_timestamped_frames`; **L28** `L28 T4 ladder has five path-ordered lanes and one arrow per inter-device hop`.
- Actual Google Chrome on solved T4 ran all four live checks to green and captured ARP request/reply plus two ICMP echoes. Capture listed exactly 4/4 events; ARP and ICMP wire panes held 42 and 74 bytes; IPv4 selection highlighted bytes 14–33. Stepping and Left/Right shortcuts traversed ARP → ICMP, narration showed TTL 128 → 127, and Flow showed PC0/Switch0/Router0/Switch1/PC3 with 12 arrows. Canvas ARP/ICMP colours matched the table, 0.25× playback and Space play/pause worked, and `t4.pcap` downloaded (320 bytes, correct magic). Final Chrome console/page errors: **0**; broken images: **0**.
- `cargo test`: **226 passed, 0 failed** across 6 suites. `node --test tests/js/*.test.js`: **52 passed, 0 failed**. The pcap is re-parsed byte-for-byte in L27 and the HTTP export test. **Owner opening the capture in Wireshark remains explicitly unverified.** No P5 work was started.

# P4 live feel result

- Actual Chrome Realtime animation followed the captured PC0 → Switch0 → Router0 → Switch1 → PC2 path, started at PC0 rather than SVG origin, and used 420 ms per segment at 1x. Command Prompt ping populated the capture and animated the same path.
- Link LEDs come from each endpoint's real `PortState`: solved links are green; a shutdown router interface is red and its connected switch peer amber. Terminal `no shutdown` refreshed them back to green. T4 started with red/amber router links and became all green after configuration.
- Chrome played `devicePlacement.wav`, `popUp.wav`, `removeDevice.wav`, and `errorMsg.wav` from their real placement, IP-save, removal, and invalid-action handlers.
- Router terminal output appeared in 41 ms and Command Prompt ping output in 13 ms, with input re-enabled immediately; workspace/capture refreshes happen behind the answers.
- Blank Logical workspaces show the sleeping mascot and a next step. The gallery shows think while loading, wave after success, and error on failure; workspace boot failures retain a visible error state and file actions.
- L24 is registered in `provness/pt-web/LAWS.md`. `l24_t4_simulation_device_order_equals_forwarding_path` checks solved T4 hop IDs and increasing times against PC0 → Switch0 → Router0 → Switch1 → PC3. Actual Chrome Simulation showed identical path/hop order and a completed PDU with zero console errors or broken images.
- `cargo test`: **220 passed, 0 failed**; `node --test tests/js/*.test.js`: **43 passed, 0 failed**. No P4b work was started.

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
