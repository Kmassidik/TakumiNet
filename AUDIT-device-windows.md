# Audit: device windows and the features behind them

Written 2026-11-04, ready before 18:30 WIB. Research only. Nothing was changed.

## 1. Short answer

You are right. **Every device opens the same window.** A router, a switch, a printer, an access point and an IP phone all show the same four tabs (Physical, Config, Desktop, Services), and the Desktop tab always shows the same seven PC apps. The window was built for a PC and reused for everything.

Behind that window the engine is further along than the screen shows. Two measurements:

- **28 of the engine's 85 API routes are not used by any screen.** They cover Wi-Fi, VoIP phones, VPN, PPPoE, IoT sensors, cellular, mail, PTP and PRP. The engine can do these things; nobody can reach them from the interface.
- **Eight Desktop app icons already exist as artwork** (dial-up, wireless, VPN, traffic generator, network search, VoIP, email, PPPoE) and are not wired to anything.

So the main missing piece is not engine work first. It is a **device model**: a single place that says what each kind of device can do, so the window, the palette and the engine all follow it.

## 2. What exists today (facts, with where to look)

| Part | What it does now | Where |
|---|---|---|
| Window tabs | Four fixed tabs for every device | `web/index.html:364-367` |
| Opens on | Always the Desktop tab | `web/js/device_window.js:21` |
| Desktop apps | Always the same seven: IP Configuration, Terminal, Command Prompt, Web Browser, Text Editor, Firewall, IPv6 Firewall | `web/js/device_window.js:2-10`, `device_tabs.js:20` |
| Physical tab | Power button, and module slots only when the device has slots. The two modules offered are written into the code (HWIC-2T, NM-2FE2W). No view of ports, lights or the back panel | `device_tabs.js:48-125` (`:110`) |
| Config tab | Only the display name. Gateway and DNS are shown read-only. No interfaces, routing, VLANs, wireless or per-kind settings | `device_tabs.js:127-155` |
| Services tab | Routers get only "DHCP relay". Everything that is not a server gets only Syslog and NTP. Servers get the full set (HTTP, DNS, DHCP, FTP, TFTP, email, AAA) | `services_tab.js:10`, `:78` |
| Command line | Only routers and switches. Other kinds have no command line at all | `terminal.js:2` |
| Kinds in the palette | 31 kinds (47 models) | `src/workspace/palette.rs` |

Evidence for the first row: the engine JSON for a router, a switch and a PC has the **same 26 fields** (`dhcp, dns, dnsRecords, dot1x, ... slots, x, y`). There is no per-kind data for the window to show.

## 3. Engine features with no screen

Found by searching every UI file for each API route (85 routes, 28 not referenced). The last column is my reading of what each feature is for. The engine itself does not check the device kind for most of these routes (I found no kind test in the Wi-Fi, phone or VPN code), so the registry in section 5 is also where "this feature belongs to these kinds" must be decided and enforced.

| Area | Routes with no screen | Devices it is likely for |
|---|---|---|
| Wi-Fi | `wifi/scan`, `wifi/join`, `wifi/roam`, `wifi/disconnect`, `wifi/status`, `wifi/wlan`, `wifi/wlans`, `wifi/capwap` | access point, wireless controller, laptop, tablet, PDA, phone |
| Phones | `phone/register`, `phone/status` | IP phone, analog phone |
| VPN | `vpn/config`, `vpn/status` | PC, laptop, firewall, router |
| PPPoE | `pppoe/config`, `pppoe/status` | PC, DSL and cable modem, home router |
| IoT | `iot/read`, `iot/write`, `iot/send` | thing, IoE, PLC, data historian |
| Cellular | `cell/join`, `cell/status` | cell tower, phones, tablets |
| Mail | `mail/list`, `mail/send` | PC, laptop, server |
| Time and redundancy | `ptp/sync`, `prp/enable` | industrial switches |
| Security | `devices/inspect`, `devices/ips` | firewall |
| Other | `ping`, `reset`, `topology` | helpers; probably fine unused |

## 4. Command line coverage (measured)

I sent 73 common router commands, each in a fresh session in the right mode (user, global config, interface config), and counted which the engine accepts.

**Accepted: 39 of 73.** Not supported:

- **Show and diagnose (17 of 35 refused):** `show interfaces`, `show cdp neighbors`, `show ip protocols`, `show ip ospf`, `show ip ospf neighbor`, `show ip dhcp binding`, `show clock`, `show history`, `show users`, `show processes`, `show controllers`, `show flash:`, `traceroute`, `telnet`, `ssh`, `terminal length 0`, `debug ip icmp`.
- **Global config (11 of 23 refused):** `enable secret`, `ip dhcp pool`, `ip dhcp excluded-address`, `snmp-server`, `ntp server`, `logging`, `service password-encryption`, `ip domain-name`, `crypto key generate rsa`, `username`, `ipv6 unicast-routing`.
- **Interface config (6 of 15 refused):** `description`, `duplex`, `speed`, `ip ospf cost`, `standby` (first-hop redundancy), `ipv6 address`.

Accepted and working include `show version`, `show running-config`, `show ip route`, `show ip interface brief`, `ping`, `hostname`, `banner`, `ip route`, `router rip`, `router ospf`, `router eigrp`, `interface`, `ip address`, `no shutdown`, `access-list`, NAT, `vlan`, `spanning-tree`, `write memory`.

Limits of this test: it checks whether a command is accepted, not whether its result is right. Some accepted commands may do less than the real thing.

Also: switches and routers share the same command engine. Firewalls (`asa`), home routers and industrial switches (`ie2000`) have no command line at all.

## 4b. Reading the device list by kind

31 kinds, grouped by what a person expects to do with them:

| Group | Kinds | Today's window | What it should offer |
|---|---|---|---|
| Routers | router (12 models) | PC window plus DHCP relay | Command line, interface table with status and IP, routing table, protocol settings, module slots, port lights |
| Switches | switch (5), ie2000 | PC window | Command line, port list with VLAN and trunk state, VLAN database, spanning-tree view, MAC table |
| Hubs, patch panel | hub, patchpanel | PC window | Almost nothing: a port list. No apps, no config |
| Computers | pc, laptop, multiuser | PC window (correct) | Keep; add the missing apps (section 5) |
| Server | server | PC window plus full Services | Keep; Services is already per-kind |
| Printer | printer | PC window (Terminal, Browser, Firewall make no sense) | Address settings and a print queue; no terminal |
| Wireless | ap, wlc, homerouter, linksys | PC window | SSID, security, channel, connected clients; controller view for the WLC |
| Phones | phone, analogphone | PC window | Extension, registration status, call log |
| Mobile | tablet, pda, tv | PC window | Wi-Fi join, address, browser. TV: address only |
| Security | asa | PC window | Command line, interfaces, rules, inspection |
| WAN | cloud, cablemodem, dsl | PC window | Line settings, PPPoE, cloud connection table |
| IoT and industrial | thing, ioe, plc, historian, celltower, netcontroller, meraki | PC window | Sensor values, read and write, cell status, controller list |
| Capture | sniffer | PC window | A capture view tied to the port it listens on |

## 5. What is missing, by priority

**P0, the foundation (decide first).** A **device kind registry**: one table, one row per kind, saying which tabs it has, which Desktop apps it shows, whether it has a command line, which services it can run, and which engine features it supports. The window, the palette groups and the engine checks all read it. Without this, every new feature becomes another `if (d.kind === ...)` in the window code, which is how the PC window ended up serving everything.

**P1, a window that matches the device.**
1. Router and switch windows: a CLI tab inside the window (today it opens a separate terminal), an interfaces tab, a routing table tab.
2. Hide what does not apply: no Terminal or Firewall on a printer, no Desktop on a hub.
3. Switch window: ports and VLAN view.
4. Wireless window (access point, controller, clients). The engine is ready.
5. Phone window (registration). The engine is ready.

**P2, the PC Desktop apps that already have art and engine support.** Wireless client, VPN, email, PPPoE dialer, VoIP, traffic generator, network search (SNMP browser), dial-up. Each has an icon and, for most, an API.

**P3, engine gaps found by the command test.** The refused commands in section 4. The ones most needed for teaching: `show interfaces`, `ip dhcp pool` on a router, `description`, `enable secret`, `show ip ospf neighbor`, `traceroute`, `show cdp neighbors`, `ip ospf cost`, `standby`.

**P4, depth.** Per-port physical view with lights and a back panel, more module types than the two in the code, device-specific Physical images, print jobs for printers, IoT dashboards, a "send file" tool.

## 6. How I would build it (not started)

1. Write the registry as data (a TypeScript table plus a matching list in Rust, with a test that the two agree and that every palette kind has a row).
2. Make the window read the registry: tabs and apps come from the row. Start with router and switch, then printer and hub (the biggest visible change for the least work), then wireless and phone.
3. Add each Desktop app one at a time, each with its own window on the shared dialog from F5, a behaviour test, an error test and a Bend check of its rule.
4. Then the command-line gaps, one group at a time, each with a test that sends the command and checks the engine state, not just the reply text.

Test plan for the registry work: every kind has a row; no row lists an app without an API behind it; no API route is left without a screen unless the registry says so; a browser check opens a window of each of the 31 kinds and compares its tabs to its row.

## 7. Decisions needed from you

1. **Reference.** Which features are required for "the base feature"? I used the general set people expect from a network simulator (command line, interface tables, wireless, phones, VPN, mail). If you want a narrower first release (for example routers, switches, PCs and servers only), say so and I will cut the list.
2. **Order.** I recommend P0 then P1 (router, switch, printer, hub), then wireless and phone, then the Desktop apps. Agree?
3. **Command line scope.** Do you want the router and switch command line inside the device window (recommended), or kept as a separate terminal?
4. **Model names.** The vendor model numbers in the palette (still waiting on your naming) should be settled before the registry is written, because the registry will key on them.
5. **Printer, TV, hub.** Should these stay almost empty on purpose, or do you want something real in them (print queue, a TV browser)?

## 8. How this audit was done, and what it did not cover

Done: read the window code and the engine modules; searched every UI file for each of the 85 API routes; sent 73 commands to the engine over HTTP; counted device kinds and their fields from the live workspace JSON.

Not done: I did not click through all 31 windows by hand in a browser (the code and the JSON show they are identical, and I checked several). I did not measure how correct each accepted command's result is. Section 4b's "should offer" column comes from general knowledge of network teaching tools, not from a copy of any product's screens.
