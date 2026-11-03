# Next template prompts (T6–T10)

These are implementation prompts only. Do not create these templates during P2. When scheduled, build one at a time in this order, with an ordinary blank-start `.tnet`, a hidden scripted solution only in `tests/templates.rs`, a failing-before/passing-after API/CLI test, a new law, a full `cargo test`, and one commit per template. Add only real evaluators backed by live engine state or the equivalent terminal command.

## T6 — Separate two groups with VLANs

Create a beginner lesson with one switch and four PCs. Put PC0 and PC1 in VLAN 10 and PC2 and PC3 in VLAN 20, using a different IP subnet for each VLAN. Start with every PC unaddressed and every access port in its default VLAN. Ask the learner to create and name both VLANs, assign the correct access ports, and configure the host addresses. Include successful same-VLAN ping checks in both groups and failing cross-VLAN ping checks. Add a real VLAN/port-membership check if needed, evaluated from the same switching state shown by the switch CLI. Verify that no cross-VLAN delivery succeeds without a router.

## T7 — Route between VLANs on a stick

Create two PCs on different VLANs, one switch, and one router connected to the switch by a single trunk. Start with blank host addresses, default switch-port assignments, and no router subinterfaces. Ask the learner to create VLANs 10 and 20, assign the PC access ports, configure the router-facing trunk, create the two 802.1Q router subinterfaces, and set host gateways. Use 192.168.10.0/24 and 192.168.20.0/24 with router addresses `.1` and host addresses `.10`. Check cross-VLAN ping delivery, delivered TTL 127, both exact connected prefixes, and real trunk/subinterface state. Drive interface, encapsulation, and no-shutdown steps through the stateful router CLI.

## T8 — Join remote networks with static routes

Create two LANs connected by two directly linked routers, with one PC on each LAN. Start with blank host and router addressing and no static routes. Ask the learner to address all interfaces and hosts, enable the interfaces, set each PC gateway, and add a static route on each router for the remote LAN through the other router. Check ping in both directions, delivered TTL 126, and the exact remote static prefixes in each RIB. The route evaluator must distinguish static routes from connected or dynamically learned routes; do not accept a covering default route. Script the entire solution through the real host API and both router CLI sessions.

## T9 — Protect a server with an ACL

Create a client LAN, a server LAN, and a router joining them. Start with blank addressing and no ACL or interface binding. Ask the learner to configure the routed network, then create and apply an original numbered extended ACL that permits ICMP from one approved client to the server but denies HTTP from another client on the same LAN. Keep a second service or protocol available so the lesson demonstrates a specific rule rather than a disconnected network. Check the permitted ping, the denied browser operation, and the real ACL entries and binding shown by the router CLI. Assert the failing-before and passing-after behavior for both clients without substituting a configuration-text-only check for traffic.

## T10 — Share a public address with NAT

Create an inside PC, an inside switch, a dual-interface router, and an outside web server. Start with blank addresses, gateways, NAT roles, and translation rules. Ask the learner to address and enable the path, identify inside and outside router interfaces, configure an original inside-source ACL and interface-overload NAT rule, and add any required route to reach the outside network. Check that the PC opens the outside web page, that the router records a translation from the PC’s private address to its outside interface address, and that the expected NAT roles and rule are active. Use real forwarded traffic and the live translation table; do not pass the lesson merely because NAT configuration text exists.
