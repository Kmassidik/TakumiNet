# Model card — what's actually modeled in Takumi

Honest status of every feature: what works, what's partial, what's not modeled.
Evidence: engine paths, test suites, live browser checks. No claims of IEEE/Cisco certification.

## Devices & topology

| Feature | Status | Evidence |
|---|---|---|
| PC, Laptop, Server, Printer | WORKS | palette models, device tests |
| Router 100/300/500 | WORKS | routing, NAT, ACL, OSPF, BGP |
| Switch 24 / Hub / L3 switch | WORKS | MAC learning, VLANs, trunks, LLDP |
| Home Router | PARTIAL | L2 host; no routing/NAT (engine limit) |
| Access Point / WLC / Hotspot AP | WORKS | CAPWAP, WLANs, channels |
| Backbone POP / Internet Exchange | WORKS | BGP sessions + route propagation |
| Submarine Cable / Satellite | WORKS | bandwidth + delay models |
| Cell Tower / IoE / Thing / PLC | WORKS | cell association, Modbus registers |

## Packets & capture

| Feature | Status | Evidence |
|---|---|---|
| Ethernet + IPv4 delivery | WORKS | `src/net/fwd.rs`, frame decode, hop notes |
| ARP exchange | WORKS | auto-captured on first ping |
| DNS query/response | WORKS | `resolve_name_captured`, demo: dns |
| DHCP lease | WORKS | `acquire_dhcp`, demo: dhcp |
| HTTP page fetch | WORKS | `src/webapp.rs`, demo: http |
| Hub collision (CSMA/CD) | WORKS | concurrent wave on shared segment |
| Duplex/speed mismatch | WORKS | CRC counter + drop on link |
| Duplicate IP warning | WORKS | dialog + CLI + status |

## Routing & policy

| Feature | Status | Evidence |
|---|---|---|
| Static routes | WORKS | longest-prefix/AD/metric lookup |
| OSPF (single area) | WORKS | SPF over live topology |
| eBGP sessions + import | WORKS | established = shared live link |
| eBGP transit (multi-hop) | WORKS | re-export with loop guard + no_transit policy |
| BGP AS hygiene (private range) | WORKS | all templates/lessons in 64512–65534 |
| ACL deny/permit | WORKS | per-port, captured drop when tripped |
| NAT overload (source translate) | WORKS | NAT note on path |
| PPPoE login (AAA) | PARTIAL | config/session state, no packet capture |
| VRRP owner election | PARTIAL | state only, no timers/auth |
| Wi-Fi association | PARTIAL | SSID/PSK state; frames ride wired path |
| Captive portal / vouchers | PARTIAL | redemption API exists; demo doesn't fire |

## Capture & UI

| Feature | Status | Evidence |
|---|---|---|
| Capture dock rows + layers + bytes | WORKS | `/api/workspace` events |
| Flow ladder (hop-by-hop) | WORKS | Flows window |
| Packet export (.pcap) | WORKS | Save capture |
| Template canvas notes | WORKS | all 35 covered, no overlap, in view |
| Focus after open (no shortcut leaks) | WORKS | fixed `44ddd1e` |
| CLI Help dialog focus | WORKS | fixed `44ddd1e` |
| IP dialog Enter-to-Apply + select-all | WORKS | fixed `44ddd1e` |

## Templates (35 examples)

| Aspect | Status | Evidence |
|---|---|---|
| All demos play + capture rows | WORKS | formal P1/P2/P3 + `tests/e2e/demo_coverage.rs` |
| Real-world accuracy: FAITHFUL | 9 of 35 | `internal/product/audit-examples.md` |
| Real-world accuracy: PARTIAL | 21 of 35 | same |
| Real-world accuracy: STRETCH | 5 of 35 | all fixed since the audit |

## Lessons (68 guided labs)

| Aspect | Status | Evidence |
|---|---|---|
| Automated fail-before/pass-after checks | WORKS | every lesson has an engine test |
| Newest 13 played by clicking | WORKS | F2 round |
| PoE / VRRP / WiFi-channel lessons | IN PROGRESS | features exist; base lessons shipped (l1-10 PoE deny, l3-10/l4-04 VRRP, l4-08 channels); deeper lessons building |

## Not modeled

- Real 802.1X exchanges
- IPv6 routing / NDP / v6 TCP-UDP
- WPA3 handshakes / 802.11r roaming
- OSPF hellos / STP BPDUs in demo runs (realtime `advance()` only)
- BGP OPEN/UPDATE packets on the wire (config + route table only)
- ESP payload ciphertext (headers are real: SPI, protocol 50, outer tunnel IPs — payload rides verbatim)
- VXLAN payload fidelity beyond headers (VNI, UDP 4789, outer VTEP IPs are real; no BUM/multicast emulation — known-unicast only)
- Vendor OUI names in MAC addresses (made-up prefix by design)
