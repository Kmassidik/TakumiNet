# Audit of the references: what people come here to build

Report 3, 2026-11-04. Research and measurement only. Nothing was changed.

This is the main audit. The two earlier files are companions:
- `AUDIT-device-windows.md`, Part 1 (v2): how each device should open and feel.
- `AUDIT-device-windows.md`, Appendix A: the first count of missing screens and commands.

## 1. The point of this audit

People do not come to an emulator to click windows. They come with **an idea from the real world** that they want to build and try:

- a lab from a course or an exam they are studying for,
- a network they are about to set up at home or at school,
- a problem they want to reproduce and fix,
- a design they want to prove before buying equipment.

Our job is to make each component behave like **the real thing the idea came from**. So the audit starts from those references, lists what people build from them, and then checks every component against that.

## 2. Who comes, and what they bring

| Who | What they bring | Evidence I found |
|---|---|---|
| **Certification students** (routing and switching exams) | The published exam topic list as a to-do list | CCNA 200-301 has six domains and 53 numbered objectives. Published weights: network fundamentals 20%, security 15%, IP services 10%, automation 10%. I did not confirm the weights of the other two domains. |
| **IT support learners** (general networking exam) | A troubleshooting mindset | CompTIA Network+ N10-009: troubleshooting is the **largest domain (24%)**, then network implementation (20%), operations (19%) and security (14%). Fundamentals is about 23% in a third-party summary. |
| **Vocational students in Indonesia** (SMK, computer and network engineering) | MikroTik RouterOS labs and Packet Tracer VLAN modules | Training reports for SMK students list DHCP server, DNS forwarding, NAT masquerade, gateway and proxy, firewall, bandwidth management, hotspot and VLAN, aimed at the MTCNA certification and at national network skill contests. |
| **Self-learners and hobbyists** | "How do I set up my own router, Wi-Fi, printer?" | Home router guides repeat the same pages: DHCP and address reservation, port forwarding (which needs a reservation first), guest network, parental controls, MAC filtering, WAN type. |
| **Teachers** | Ready labs they can hand out | Lab books and lab lists are organised as: VLAN, trunking, router on a stick, SVI routing, STP and rapid STP, EtherChannel, OSPF (single and multi-area), NAT (static, dynamic, overload), ACLs, DHCP and relay, remote-access and site-to-site VPN, and "mega labs" that combine several. |

What the three kinds of tool are used for, from comparison articles: **Packet Tracer-style simulators for beginners and exam study**, **GNS3 and EVE-NG-style emulators (real device software) for realistic and professional labs**. We are a simulator, so the bar is **"behaves and looks the way the real device is used"**, not "runs real firmware".

This audience point matters for you: **Indonesia is a main audience (you chose English and Indonesian for the site), and there the reference device is often MikroTik, not only the router that the exam lists use.** We have nothing for that today.

## 3. The reference catalogue: what people try to build

Status key: **Works** = engine does it and a test proves it (`tests/labs`); **Engine only** = the engine can do it but a person cannot reach it from a screen (or only through the command line); **Partial** = some of it; **No** = missing.

### 3.1 Switching and cabling

| # | Idea | Status | Evidence and gap |
|---|---|---|---|
| 1 | Two computers on one cable, ping | **Works** | lesson 1, e2e tests |
| 2 | LAN with a switch, MAC learning | **Works** | lesson 2 |
| 3 | The right cable between the right ports (straight, crossover, serial, fiber, console) | **Partial** | 8 cable types exist; whether a wrong cable is refused or fails the way it does in real life is not covered by a test |
| 4 | VLANs, access and trunk ports | **Engine only** | `vlan` and `interface range` accepted; no VLAN screen |
| 5 | Router on a stick (inter-VLAN routing) | **Works** | `router_on_a_stick_routes_between_access_vlans` |
| 6 | Layer 3 switch with SVI routing | **No** | `interface vlan 10` is accepted but `ip routing` is refused |
| 7 | STP and RSTP root election | **Works** | `ieee_stp_and_rstp_elect_root_and_reconverge` |
| 8 | EtherChannel | **Works** | `etherchannel_bundles_parallel_links...` |
| 9 | Port security | **Partial** | `show port-security` exists; `switchport port-security` is refused on switches |
| 10 | VTP, DHCP snooping, LLDP/CDP, storm control, port mirroring | **No** | all refused |

### 3.2 Routing

| # | Idea | Status | Evidence and gap |
|---|---|---|---|
| 11 | Static, default and floating routes | **Works** | `static_and_default_ad_choose_floating_route...` |
| 12 | RIPv2 | **Works** | `ripv2_installs_fifteen_hops...` |
| 13 | OSPF, single and multi-area | **Works** | OSPF and multi-area tests; but `show ip ospf neighbor` and `show ip ospf` are refused, so a learner cannot see the adjacency they just built |
| 14 | EIGRP | **Works** | `eigrp_composite_uses_bottleneck...`; `show ip protocols` is refused |
| 15 | BGP | **No** | no implementation (the word appears only as a filter name); not in the plan |
| 16 | First-hop redundancy (HSRP) | **No** | `standby` refused |
| 17 | Route redistribution, passive interfaces, prefix lists, route maps | **No** | all refused |
| 18 | IPv6 addressing and routing | **Partial** | addressing exists; `ipv6 route` and `ipv6 unicast-routing` refused |

### 3.3 IP services

| # | Idea | Status | Evidence and gap |
|---|---|---|---|
| 19 | DHCP server on a server | **Works** | `dhcp_lease_options_and_renewal...` |
| 20 | DHCP server on a router (`ip dhcp pool`) | **No** | refused. This is the way most labs, and every home router, do it |
| 21 | DHCP relay | **Works** | screen exists (routers, Services tab) |
| 22 | DNS | **Works** | `routed_dns_resolves...` |
| 23 | NAT overload (PAT) | **Works** | `nat_overload_rewrites_only_matching_inside_sources` |
| 24 | Static NAT, NAT pools, port forwarding | **No** | `ip nat inside source static` and `ip nat pool` refused |
| 25 | NTP, syslog | **Partial** | services exist on servers (screen); `ntp server`, `logging`, `ntp master` refused on routers |
| 26 | SNMP | **No** | `snmp-server` refused; the MIB browser app has art but no behaviour |
| 27 | QoS (class and policy maps) | **No** | refused |

### 3.4 Security and remote access

| # | Idea | Status | Evidence and gap |
|---|---|---|---|
| 28 | Standard and extended ACLs | **Works** | `extended_acl_first_match_permit_and_implicit_deny` |
| 29 | AAA and RADIUS | **Engine only** | AAA exists on servers; routers cannot use `login local`, `username` |
| 30 | Firewall (zones, inspection) | **Engine only** | `devices/inspect`, `devices/ips` routes exist, no screen; firewalls have no command line |
| 31 | Site-to-site and remote-access VPN | **Engine only** | `vpn/config`, `vpn/status` exist, no screen; `crypto` commands and `interface tunnel` do nothing visible |
| 32 | Secure remote management (SSH, telnet) | **No** | `ssh`, `telnet`, `crypto key generate rsa`, `ip domain-name`, `enable secret`, `service password-encryption` refused |

### 3.5 Wireless, WAN and the internet

| # | Idea | Status | Evidence and gap |
|---|---|---|---|
| 33 | Home Wi-Fi: access point and a phone or laptop joins | **Engine only** | 8 Wi-Fi routes, no screen |
| 34 | Enterprise wireless (controller and access points) | **Engine only** | CAPWAP routes, no screen |
| 35 | Home internet: modem, PPPoE, the ISP side | **Engine only** | PPPoE routes, no screen; there is no internet to connect to |
| 36 | Cellular | **Engine only** | `cell/join`, `cell/status`, no screen |
| 37 | Setting up a home router from its own web page | **No** | the home router device has no behaviour at all (see Part 1 of the first report) |

### 3.6 Services, voice, devices

| # | Idea | Status | Evidence and gap |
|---|---|---|---|
| 38 | Web, FTP, TFTP, email servers | **Works / Partial** | web, FTP, TFTP have screens; email send and list routes have no screen |
| 39 | IP phones and calls | **Engine only** | `phone/register`, `phone/status`, no screen |
| 40 | IoT sensors, PLCs, industrial networks | **Engine only** | `iot/read`, `iot/write`, `iot/send`, PTP, PRP, no screen |

### 3.7 Operating, troubleshooting, learning

| # | Idea | Status | Evidence and gap |
|---|---|---|---|
| 41 | Follow a packet and read its layers | **Works** | capture view, `simulation_capture_has_real_http_layers...` |
| 42 | Find and fix a fault (wrong gateway, wrong mask, cable out, duplicate address, DNS failure) | **Partial** | lesson checks exist; no way to inject or reproduce faults, no step-by-step "where does it break" helper |
| 43 | Monitor with logs and time | **Partial** | syslog and NTP services; `show clock`, `show users`, `show processes` refused |
| 44 | Use the real command line (abbreviations, help, `show` commands) | **Partial** | abbreviations, inline help and error carets are tested; 39 of 73 common commands accepted; the missing ones are listed in Appendix A of the first report |
| 45 | MikroTik-style labs (DHCP server, NAT masquerade, queues, hotspot, firewall filter, WinBox-like management) | **No** | no device, no command set, no management screen |
| 46 | Linux host networking (`ip`, `ss`, `ping`, `curl`, `iptables`) | **No** | hosts have no operating system choice |
| 47 | Automation and programmability (controllers, REST, scripts) | **No** | a "network controller" device exists in the palette but does nothing; no API a user can script against |
| 48 | Cloud, data centre, load balancing | **No** | out of the current scope |

### 3.8 Scorecard

| Status | Count of 48 |
|---|---|
| Works (proven by a test) | 15 |
| Works for some parts, partial for others | 1 |
| Engine only (needs a screen) | 10 |
| Partial | 7 |
| No | 15 |

**Reading it plainly:** the routing and switching core is in good shape and tested. Almost everything a person would **see and touch** is missing, and a whole group of ideas (wireless, VPN, voice, IoT, the home router) exists in the engine **with no way in**. The biggest absent references are **MikroTik** (for the Indonesian audience), **Linux hosts**, **the home router story**, **layer 3 switching**, **DHCP and NAT done the usual way on a router**, and **fault injection for troubleshooting**, which is the largest topic in the support-oriented exam.

## 4. Fidelity: what each component is judged by

A person who has used the real component has an expectation for each one. This is the checklist a screen and its behaviour must meet. Status is for the **screen/feel**; behaviour in the engine is in section 3.

| Component | What the real one is judged by | Today |
|---|---|---|
| **Cable** | the right type for the right ports; link lights green, amber, off; a cable pulled out is visible on both ends; speed and duplex mismatch | cables and types exist; no lights, no mismatch |
| **Computer** | its own operating system tools; network settings screen; address by DHCP; the usual diagnostic commands with the usual output | one fixed desktop for every device; some commands missing (`tracert`) |
| **Server** | services start and stop; logs; the page it serves | services screen good |
| **Switch** | port lights and states; MAC table; VLAN table; spanning-tree port states; a console | console only; no lights or tables |
| **Router (company)** | boot messages; interface table with up and down; routing table codes (connected, static, learned); modes; saved versus running config | CLI works, partly; no tables, no boot |
| **Home router** | a login page, a wizard, Wi-Fi settings, a client list, port forwarding, LEDs, a sticker with default login | none of it |
| **Access point** | name, security, channel, signal strength by distance, connected clients | engine only |
| **Wireless controller** | access point list, WLAN list | engine only |
| **Modem and internet side** | line status, account, a working outside world | engine only, no outside world |
| **Firewall** | rule tables, hit counters, logs | engine only |
| **Phone (mobile)** | Wi-Fi list, password prompt, signal bars | engine only |
| **IP phone** | extension, registration, dial | engine only |
| **Printer** | its own page, address, a test page that crosses the network | PC desktop reused |
| **IoT and industrial** | live values, set a value, alarms | engine only |
| **Sniffer** | capture on one port | PC desktop reused |

Three rules that apply to every component, because they are what makes a person say "this is real":
1. **Wrong input fails like the real thing:** wrong password, wrong gateway, unplugged cable, wrong cable type.
2. **State is visible:** lights, tables, logs, counters.
3. **Time is real enough:** boots take a moment, reboots drop the network, leases expire.

## 5. Gaps ranked by demand

Ranking uses the evidence in section 2 (what people study and build), not effort.

**Tier 1, build first (the base feature):**
1. **Home and small-office story**: home router with web admin, DHCP, NAT, Wi-Fi, port forwarding, a minimal internet. (Highest everyday relevance; hobbyists, teachers and first-time learners; refs 20, 24, 33, 35, 37.)
2. **Router the usual way**: `ip dhcp pool`, static NAT and pools, `enable secret`, `username`, SSH, `description`, `show interfaces`, OSPF and EIGRP `show` commands, `traceroute`. (Every course lab uses these; refs 13, 14, 20, 24, 32.)
3. **Make hidden engine features reachable**: wireless, phones, VPN, mail, IoT screens. (Large value, engine already done; refs 29 to 31, 33 to 36, 38 to 40.)
4. **Fault injection and "where does it break"**: break a cable, wrong gateway, wrong mask; show the failing hop. (Troubleshooting is the largest support-exam domain; ref 42.)

**Tier 2:**
5. **Layer 3 switching** (`ip routing`, SVI), VLAN screen, port security on switches, DHCP snooping. (Refs 4, 6, 9, 10.)
6. **MikroTik-style router** as an additional device experience (RouterOS-style commands and a WinBox-like management screen; DHCP server, NAT masquerade, queues, hotspot, firewall filter). (Main Indonesian curriculum reference; ref 45.)
7. **Linux and Windows-style computers** with their real commands. (Ref 46.)
8. **Route redistribution, passive interfaces, prefix lists, HSRP.** (Refs 16, 17.)

**Tier 3:**
9. SNMP and a MIB browser, QoS, IPv6 routing, NTP/logging commands on routers. (Refs 18, 25 to 27.)
10. Automation: a documented controller or REST interface a user can script. (Ref 47.)
11. BGP. (Ref 15; currently outside the plan.)

## 6. How to decide what is "replicated enough"

For every reference (rows in section 3) and every component (section 4), define a **fidelity test** before building:

1. **Script it the way the reference does it** (the exact steps of the lab or the setup guide).
2. **Run it in the emulator** and check the state, not just the printed reply.
3. **Break it on purpose** (wrong value, unplugged cable) and check that it fails the way the real thing does.
4. Keep the lab as a **ready-made template with checks**, so it is both a teaching asset and a regression test (`tests/labs` already does this for the "Works" group).

This turns the catalogue in section 3 into the project's backlog and its test suite at the same time.

## 7. Decisions needed from you (see also section 10)

1. **Tier 1 as the base feature?** In particular item 1 (the home router story) and item 4 (fault injection).
2. **MikroTik**: add it to Tier 1 given the Indonesian audience, or keep it in Tier 2?
3. **Exam alignment**: should lessons map to published exam topics (CCNA-style and network-support-style), or stay vendor-neutral? (Mapping helps teachers find labs; the topic names are public but the exam names are trademarks, so we would say "routing and switching exam topics", not the exam name.)
4. **Model names**: settle the vendor model numbers in the palette first.
5. **Beginner mode versus strict mode** (wrong passwords, slow reboots) from the first report.
6. **The seven tiers (section 10):** is this the right ladder, and where do you want to stop for the first public version? My suggestion: Tiers 1 to 3, then 4, before any new device types.
7. **Learning layer:** do you want subnetting drills and flashcards inside Takumi, or do you want Takumi to stay a lab only?
8. **Labs as files:** should teachers be able to write labs as readable files and share them by link?

## 9. More references, found on GitHub

Searched GitHub for network simulators, emulators and lab collections (2026-11-04) and read the README of the closest ones. Star counts are from the search. I studied what each one offers, not its code; their licences differ and none of it is copied.

### 9.1 The field, in one table

| Project | Stars | What it is | What people come to it for |
|---|---|---|---|
| [mininet/mininet](https://github.com/mininet/mininet) | 5,876 | Emulator for software-defined networks | OpenFlow and controller labs, research |
| [srl-labs/containerlab](https://github.com/srl-labs/containerlab) | 2,926 | Networking labs from a topology file, using containers | Real network software in labs, labs as code |
| [GNS3/gns3-gui](https://github.com/GNS3/gns3-gui) | 2,662 | Graphical emulator that runs real device images | Exam study and realistic labs |
| [shadow/shadow](https://github.com/shadow/shadow) | 1,743 | Discrete-event simulator that runs real application code | Research on distributed systems |
| [coreemu/core](https://github.com/coreemu/core) | 843 | Common Open Research Emulator | Quick virtual networks, wireless and mobility |
| [intrig-unicamp/mininet-wifi](https://github.com/intrig-unicamp/mininet-wifi) | 543 | Mininet plus wireless | Wi-Fi and mobility labs |
| [ipspace/netlab](https://github.com/ipspace/netlab) | 753 | "Making virtual networking labs suck less": lab description in a short file | Repeatable labs for many device types |
| [errorinn/netsim](https://github.com/errorinn/netsim) | 181 | Web simulator for teaching security to high school students | Attack and defence games |
| [gnu-gnu/network-fundamentals-lab](https://github.com/gnu-gnu/network-fundamentals-lab) | 132 | Troubleshooting labs where the lab starts broken | Break, observe, fix, with a walkthrough |
| [Crequency/TopoSmith](https://github.com/Crequency/TopoSmith) | 6 | Browser-only topology simulator and analyser | Design a network and check it before building it |
| [furrkanyasar/stp-simulator](https://github.com/furrkanyasar/stp-simulator) | 2 | Interactive spanning-tree simulator | Watch root election, failover, BPDUs |
| [cornerstonian/ccna-command-center](https://github.com/cornerstonian/ccna-command-center) | 1 | Browser IOS-style lab, subnetting drills, flashcards | Exam practice with scoring |
| [cochimbo/networksim](https://github.com/cochimbo/networksim) | 2 | Network topology with visual editor and chaos injection | Delay, loss, bandwidth limits, partitions |
| [lukaudev/broadcast-studio](https://github.com/lukaudev/broadcast-studio) | 1 | Open source "alternative to GNS3 and Packet Tracer", web | Drag and drop plus a terminal with ping and traceroute |
| [Prajwal-k-tech/EvoRoute](https://github.com/Prajwal-k-tech/EvoRoute) and other OSPF visualisers | 0-1 | Routing protocol visualisers | See OSPF and RIP converge when a link fails |

**What the table says about us.** Our closest peers (browser-only, topology editor, packet view) are small projects. The large projects are all **emulators of real software** and need installs, images or containers. A **free browser-only simulator with a realistic feel, bilingual, with guided labs** has almost no direct competition. The things the small projects do well are listed next; they are the new tiers.

### 9.2 What the small, closest projects do that we do not

From TopoSmith, stp-simulator, ccna-command-center, network-fundamentals-lab, networksim and netsim:

1. **Cables and ports are physical.** Cable type and length take part in the maths; ports are drawn on the device panel by medium (copper, fiber, PON, antenna); cabling by dragging from port to port; link aggregation is different from "two cables making a loop".
2. **Wireless has space.** Access points and cell towers have a coverage area (circle or sector, radius in metres); right-click any point to measure which signals reach it, on which channel, with what quality; a chart of channel overlap (why 1, 6 and 11 do not overlap).
3. **Diagnostics that explain.** "Can A reach B? If not, at which hop and with what reason code." A hop-by-hop path with link speed, VLAN and addresses. The end-to-end bottleneck and effective throughput. The DNS resolution path (which server, cache hit, forwarded, no such name). Detection of a layer 2 loop with the loop's path named and why the broadcast does not die.
4. **Protocol internals made visible.** Spanning tree: protocol version, timers, root election, the frame inspector, failover when a cable is cut, a categorised log. Routing: visualise convergence when a link fails (RIP and OSPF).
5. **Link impairments (chaos).** Delay, packet loss, bandwidth limits, corruption, duplication, partition between two parts of the network, set per link.
6. **A learning layer around the labs.** Timed subnetting drills with streaks and step-by-step solutions; flashcards by topic; scenarios with an objective checklist and difficulty levels; a guided tour; labs that **start broken** with a walkthrough that says "intent, what was seen, what it means"; preset scenarios with **deliberate pitfalls** (for example a missing trunk tag on a guest uplink).
7. **Racks and cabinets** with real unit sizes, front and back views. (We have a rack view in Physical; it has no unit sizes or back view.)
8. **Labs as files.** The lab described in a short readable file (netlab, containerlab), so a teacher can write, share and version it. (We have `.xml`; it is not meant to be written by hand.)
9. **Two languages in the tool itself** (stp-simulator has Turkish and English for the interface and the log messages).
10. **Attack and defence games** for security (netsim for high school students).

### 9.3 Ideas from the larger projects that are further away

- **Software-defined networking** (OpenFlow, controllers) from mininet: a whole teaching area, mostly university.
- **Bring your own network**: export a real network from an inventory tool and load it (nrx, digital twins), to test a change before doing it.
- **Run real application code** (Shadow): research, out of scope.
- **Real device images** (GNS3, containerlab): the opposite of what we are; our strength is no install.
- **Mobility** (mininet-wifi, CORE): devices that move and hand over between access points.

## 10. The tiers, extended

The first report had three tiers. With the GitHub references there are seven. Each tier is a step in realism or reach; none depends on skipping an earlier one except where noted.

| Tier | Name | What is in it | Evidence |
|---|---|---|---|
| **1** | **The real home and office story** | Home router web admin and its behaviour, DHCP and NAT done the usual way on a router, SSH and secrets, `show` commands that explain, a minimal internet | exam lists, home router guides, Indonesian reports |
| **2** | **Every hidden engine feature gets a way in** | Screens for wireless, phones, VPN, mail, IoT, PPPoE, cellular; a window that matches each device kind | first audit |
| **3** | **Explain failures** | "Where does it break and why" with a reason code; hop-by-hop path with speed and VLAN; DNS resolution path; loop detection with the loop named; fault injection | largest support-exam domain; TopoSmith; network-fundamentals-lab |
| **4** | **A learning layer** | Subnetting drills; objective checklists with difficulty; guided tour; labs that start broken with a walkthrough; preset scenarios with deliberate pitfalls; flashcards | ccna-command-center; network-fundamentals-lab; stp-simulator |
| **5** | **Physical realism** | Cable type and length matter; ports drawn by medium; wireless coverage and a signal probe; channel overlap; link lights; rack units with back view; link impairments (delay, loss, bandwidth, corruption, duplication, partition) | TopoSmith; networksim; mininet-wifi |
| **6** | **Other platforms people ask for** | MikroTik-style router, Linux and Windows-style hosts, layer 3 switching, first-hop redundancy, route redistribution, SNMP, QoS | Indonesian curriculum; exam topics |
| **7** | **Reach and reuse** | Labs written as readable files; share a lab by link; teacher mode (assign, check, see results); two-language interface for the tool itself; security attack and defence labs; scripting interface; import a real network; SDN and controller labs | netlab, containerlab, netsim, stp-simulator, mininet |

**Where the five tiers I proposed earlier fit:** my earlier Tier 1 is now Tiers 1 to 3; earlier Tier 2 is Tier 6; earlier Tier 3 is the end of Tier 6 and Tier 7.

**Why this order.** Tiers 1 to 3 give the base: a person sets up a believable network and can see why it fails. Tier 4 makes it teachable. Tier 5 makes it believable down to the cable. Tier 6 widens the devices. Tier 7 is reach. The **troubleshooting** and **learning** tiers (3 and 4) are what the small browser projects invest in most, and they are cheap next to new device types, because most of the engine already exists.

**One finding that should change the plan.** The project that is closest to us in method (TopoSmith) deliberately does **not** simulate packets one by one and has no command line. We do both. That is the strongest point of difference: **a real command line and real packets, in a browser, with no install.** The tiers above protect and build on that, so each new feature should keep both working.

## 11. Method and limits

Searched the web for the published exam topic lists, the support-exam objectives, Indonesian vocational training reports, simulator comparisons, common lab lists, and home router settings; read `tests/labs` (what the engine proves); sent about 170 probe commands to the engine; searched the UI for every API route.

Limits you should know:
- The search results are mostly study sites and course outlines, **not the official documents**. The exam domain weights are as reported by those sources; I could not confirm the weights of two CCNA domains. Check the official lists before using the numbers in anything public.
- I found no usage survey, so "who comes" is built from what the references and the courses contain, not from measured visitor data. Real data will come from the site once it is live (which labs are opened).
- "Works" means a test in `tests/labs` or the unit tests passes; it does not prove every option of a feature behaves like the real one.
- Command probes check that a command is accepted, not that the result is right; for a few accepted commands (for example `router bgp`) the engine accepts the line but has no behaviour behind it.

## Sources

- [CCNA exam topics (computingforgeeks)](https://computingforgeeks.com/ccna-exam-topics/)
- [CCNA 200-301 exam topics and lab blueprint, 2026 (open-exam-prep)](https://open-exam-prep.com/blog/ccna-200-301-exam-topics-lab-blueprint-2026)
- [CCNA 200-301 v1.0 exam topics document (learningcontent.cisco.com)](https://learningcontent.cisco.com/documents/200-301-CCNA-v1.0.pdf)
- [CompTIA Network+ N10-009 changes, objectives and study guide (DestCert)](https://destcert.com/resources/comptia-network-n10-009/)
- [N10-009 objectives explained (DestCert)](https://destcert.com/resources/n10-009-objectives/)
- [Pelatihan Olimpiade Jaringan MikroTik APJII 2020, SMKN 1 Kota Jambi](https://jurnal.unprimdn.ac.id/index.php/mitra_prima/article/view/7184)
- [Modul pelatihan VLAN dengan Packet Tracer (EdutechJ UPI)](https://ejournal.upi.edu/index.php/edutech/article/download/99786/pdf)
- [Laporan Uji Kompetensi TKJ: VLAN (Scribd)](https://id.scribd.com/document/585454697/VLAN)
- [GNS3 vs Packet Tracer: where to start and when to upgrade (CloudMyLab)](https://blog.cloudmylab.com/gns3-vs-packet-tracer)
- [Network simulation comparison of GNS3, EVE-NG and Packet Tracer](https://evenglab.blogspot.com/2023/06/network-simulation-comparison-of-gns3.html)
- [CML, Packet Tracer, GNS3, EVE-NG: which tool for your labs (IT-Connect)](https://www.it-connect.fr/cml-cisco-packet-tracer-gns3-eve-ng-quel-outil-choisir-pour-vos-labs-reseau/)
- [CCNA labs practice (computingforgeeks)](https://computingforgeeks.com/ccna-labs-practice/)
- [Small office and home office: home router settings (MCSI library)](https://mcsi-library.readthedocs.io/articles/2023/09/soho-home-router-settings/soho-home-router-settings.html)
- [Router setup guide (ipfyi)](https://ipfyi.com/guides/home-network/router-setup-guide/)
- [How to configure DHCP settings on your router (busuk.org)](https://busuk.org/guide/dhcp-settings/)
- GitHub projects in section 9.1 (links in the table), found with `gh search repos` on 2026-11-04
