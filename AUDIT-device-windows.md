# Plan and audit: devices that feel like the real thing

Report v2, 2026-11-04. Research and plan only. Nothing was changed.
This replaces the first version, which only counted missing features. The first version is kept at the end as Appendix A, because its measurements still hold.

## 1. The idea

Today, clicking any device opens the same PC-style window. The goal you described is different: **each device should open the way the real device is used.**

- A **home router** opens its **web admin page**, the same way you open a real router: from a computer's browser, at the router's address, with a login. You set the Wi-Fi name, the internet type and the DHCP range there.
- A **PC** opens like **a computer**: you choose its system (Windows-style or Linux), and it shows that system's desktop or terminal, its network settings and its browser.
- A **phone** opens like **a phone**: Wi-Fi settings, a list of networks, a password prompt.
- A **router or switch for companies** opens the **console and command line**, because that is how people really configure it.
- A **printer** opens its own small **web page** and can print a test page.

The test of success: someone who has configured a real home router can do the same steps here without being told where things are. People who have never done it learn the real steps.

## 2. The experience, device by device

Names and looks are **our own** (see section 5). "Takumi Router" below stands for any brand.

### 2.1 Home router: web admin, like opening a real router

How a person gets there, the real way:
1. Connect a PC to a router LAN port with a cable.
2. On the PC, open **Network settings**: it should get an address from the router by DHCP (the PC shows 192.168.0.x and gateway 192.168.0.1).
3. Open the **browser** and type `192.168.0.1`.
4. The router answers with a **login page**: name and password (the sticker on the router says the defaults).
5. After login: the dashboard.

```
+-- Takumi Router ---------------------------------------- admin  [Log out] --+
| Status | Quick setup | Internet | Local network | Wireless | Security | System |
+-----------------------------------------------------------------------------+
|  Internet        Wi-Fi 2.4 GHz        Connected devices (3)                  |
|  Connected       "HomeNet"  On        Laptop0   192.168.0.10  Wi-Fi         |
|  WAN 100.64.0.7  Channel 6            PC0       192.168.0.11  Cable         |
|  [Renew]         Password  ****       Phone0    192.168.0.12  Wi-Fi         |
|                                                                             |
|  LEDs (live):  Power ●   Internet ●   Wi-Fi ●   LAN1 ● LAN2 ○ LAN3 ○ LAN4 ○ |
+-----------------------------------------------------------------------------+
```

Pages that make it feel real, in order of value:
1. **Login** (default name and password, wrong password is refused, change-password prompt).
2. **Quick setup wizard**: internet type, Wi-Fi name and password, done.
3. **Internet (WAN)**: DHCP, static address, PPPoE with username and password.
4. **Local network (LAN)**: router address, DHCP on or off, address range, reserved addresses, lease list.
5. **Wireless**: name, password, security type, channel, guest network.
6. **Connected devices**: who is on the network, with address and how they connect.
7. **Port forwarding** and **DMZ**: send an outside request to a computer inside.
8. **Security**: simple firewall rules, block a device, parental schedule.
9. **System**: reboot, factory reset, firmware page, admin password, time, a log.

**What the engine has for this:** a DHCP server (on servers and routers), NAT rules (dynamic only), wireless access point logic (for access points and controllers), PPPoE client pieces, access lists, DNS. **What is missing:** the home router device **has no behaviour of its own today** (the kind `homerouter` is named only in two cable rules). It has no WAN versus LAN ports, no built-in DHCP server, no automatic NAT, no Wi-Fi radio, no web server, no login, no port forwarding, no internet to connect to (the cloud is only a cable endpoint).

### 2.2 PC: choose the system, get that system

When adding or opening a PC, a **System** choice: **Windows-style desktop**, **Linux (desktop with terminal)**, later **Mac-style**. Each is our own design, not a copy.

```
Windows-style                        Linux
+---------------------------------+  +-----------------------------------+
|  desktop                        |  | user@pc0:~$ ip addr               |
|  [Settings] [Browser] [Terminal]|  | 2: eth0: inet 192.168.0.11/24     |
|                                 |  | user@pc0:~$ ping 192.168.0.1      |
|  Start  [IP] [Browser] [Cmd]  . |  | 64 bytes from 192.168.0.1 ...     |
+---------------------------------+  +-----------------------------------+
```

- **Network settings** the way each system shows them (adapters, DHCP or static, DNS), then the commands people really type: `ipconfig` / `ip addr`, `ping`, `tracert` / `traceroute`, `nslookup` / `dig`, `arp -a` / `ip neigh`, `netstat`.
- **Browser** that can open a router's admin page, a server's web page, and shows errors the real way (no route, refused, timed out).
- The apps the engine already supports: email, VPN, Wi-Fi client, PPPoE. Eight of their icons already exist as art.
- What is missing: the OS choice does not exist; the PC has one fixed Desktop; commands like `tracert`/`traceroute` are refused by the engine; no Linux command set at all.

### 2.3 Phone and tablet

Opens a **phone screen**: Settings, Wi-Fi (list of networks with signal bars, tap one, type the password, connected), cellular if a tower is near, a browser, and for IP phones a dial screen with registration status. The engine has Wi-Fi scan, join, roam, cellular and phone registration, **none of it reachable from a screen today**.

### 2.4 Company routers, switches, firewalls

- **Console and command line** (what exists today, separate window), moved into the device window as a tab, with **Config** and **Show** helpers beside it: an interface table with status lights, the routing table, the VLAN table.
- Optionally a **web interface** on some models later.
- Today 39 of 73 common router commands work; the ones most missing are listed in Appendix A.
- Firewalls and industrial switches have **no command line at all** today.

### 2.5 Everything else

| Device | Experience |
|---|---|
| Printer | Its own small web page (status, address, a "print test page" button that sends a real job over the network) |
| Access point | Web admin page like the home router, wireless part only; shows connected clients |
| Wireless controller | Web page listing access points and wireless networks |
| Modem (DSL, cable) | Status page: line up, speed, the account it uses; the other end of the ISP link |
| Server | Linux console plus the Services it already has (web, DNS, DHCP, mail, FTP) shown as service pages |
| TV, hub, patch panel | Almost nothing on purpose: a status card and a port list |
| IoT things, PLC | A dashboard with live values and a way to set them |
| Sniffer | A capture view tied to the port it listens on |
| Cloud / internet | The "other side": a simple internet with a few named sites to visit |

## 3. One whole story, to show what must exist

"Set up a home network", the way a person would:

| Step | What the person does | Exists today? |
|---|---|---|
| 1 | Add a home router, a PC, a phone | Devices yes. The router has no behaviour |
| 2 | Cable the PC to a LAN port | Cables yes. No WAN/LAN port roles |
| 3 | PC gets an address by itself | DHCP exists on servers and routers, not on the home router |
| 4 | Open the PC browser, type the router address | Browser exists; no web page comes back from a router |
| 5 | Log in with the default name and password | No |
| 6 | Run the setup wizard: Wi-Fi name and password | Wi-Fi logic exists for access points; no UI, not on home routers |
| 7 | Choose the internet type (DHCP or PPPoE) | PPPoE pieces exist; no internet side, no UI |
| 8 | Phone finds the Wi-Fi, types the password, connects | Engine yes; no phone screen |
| 9 | Phone opens a website | Browser/web exists for servers; there is no internet |
| 10 | Forward a port to a computer | NAT is dynamic only; no port forwarding |

So the first full story needs: the home router behaviour, a minimal internet, the router web pages, the PC's network settings and browser pages, and the phone's Wi-Fi screen. That is the **first vertical slice**: small in device count, complete in experience.

## 4. What would make it feel really good (my recommendations)

Ranked by how much each adds to the feeling, not by effort.

1. **Live lights and sounds.** Router LEDs that blink with traffic, a boot sequence when powered on, the small click of a cable plug, a "reboot" that really takes a few seconds and drops the network.
2. **Real mistakes and real errors.** A wrong password is refused, a wrong gateway gives "no route", a cable pulled out shows "network cable unplugged" on the PC. Wrong setups should fail the way real ones do.
3. **A device sticker.** Each router has a sticker with its address, default login and Wi-Fi password, because that is how people find them in real life. Click the device to read it.
4. **"Why does this not work?" helper.** A hint that follows a failed ping hop by hop on the map and points at the broken step. This is the best teaching tool and uses the packet trace that already exists.
5. **Guided scenarios inside the real screens.** "Your friend cannot connect to Wi-Fi": a pre-broken network to fix using the router page and the phone.
6. **Network map beside the workspace** that updates as devices join, like the map page in real router apps.
7. **A tiny internet** with a few sites (a search page, a news page, a speed test) so browsing means something.
8. **Skins.** Several router looks and PC looks, switchable (see section 5), which also makes each lesson feel different.
9. **Reset button and factory defaults** on every configurable device.
10. **Share a broken network as a link** for teachers.

## 5. Names, brands and copying

You gave a vendor router as the example. Our product should **not** copy a vendor's page layouts, logos, names or firmware screens, and should not use a vendor's name in the product. (Your earlier rule for the app: own art, own names.) What we can do, and what people actually want, is **the same familiar steps in our own design**:

- One original default look ("Takumi Router") with the layout people expect: left or top menu, status first, a wizard.
- **Skins as data**, so more looks can be added later by us or by contributors (open source): a skin is a set of colours, a layout choice and page names. No vendor names inside the product.
- For PCs, "Windows-style" is a **description**, not a copy: our own taskbar, icons and settings pages. The same for Linux and Mac-style.

## 6. How it would be built (not started)

1. **Device kind registry** (from the first audit): one table per kind with its experience, tabs, apps and engine features. Now it also holds the **experience type**: `web-admin`, `desktop`, `phone`, `console`, `status-card`.
2. **Virtual web servers.** A device with a web admin answers requests at its address inside the engine. The PC's browser sends the request over the simulated network, so a broken cable or wrong address really breaks the page. The page content comes from small page templates per device and skin.
3. **Host OS profiles**: Windows-style, Linux, Mac-style, phone. A profile decides the desktop, the settings pages, the command set and the browser look.
4. **Engine additions**, each with tests: home router behaviour (WAN/LAN, DHCP, NAT, Wi-Fi, port forwarding), a minimal internet, Linux and Windows command sets, the missing router commands.
5. **Quality rules for every page and screen**: a behaviour test, an error test (wrong password, unplugged cable), a Bend check of the rule behind it, and a real browser check. Original art only.

## 7. Suggested order

**Phase 1, the first vertical slice (UX proof):** home router with its web admin, minimal internet, PC with Windows-style and Linux profiles (network settings, browser, terminal basics), phone Wi-Fi screen. Ends with the story in section 3 working from end to end.
**Phase 2:** device kind registry applied to all 31 kinds, so every device opens something sensible (printer, hub, TV, modem, access point).
**Phase 3:** company routers and switches: command line inside the window, interface and VLAN tables, missing commands.
**Phase 4:** the extra apps (email, VPN, PPPoE dialer, VoIP), IoT dashboards, skins, scenarios.

Why this order: the first slice tells you quickly whether the "feels real" idea works, before the whole registry is built around it.

## 8. Decisions needed from you

1. **Start with the home router story (Phase 1)?** Or a different first device?
2. **Which systems for PCs first?** I recommend Windows-style and Linux; Mac-style later.
3. **Skins:** one default look first, with skins added later (my recommendation), or several from the start?
4. **Internet:** a tiny built-in internet with a few sites (recommended), or only what the user builds?
5. **Model names** (vendor model numbers in the palette): settle before the registry.
6. **Scope of "real":** wrong passwords, unplugged cables, reboots that take time. Do you want that strictness, or a gentler mode for beginners (a switch in settings)?

## 9. Method and limits

Read the window and engine code; searched the UI for every API route; sent 73 commands to the engine; checked how `homerouter` is used in the engine (only in cable-type rules). The look-and-feel descriptions in sections 2 and 4 come from general knowledge of how routers, operating systems and phones are used, not from copying any product's screens. I have not built or tested any of the new screens. The first audit follows.

---

# Appendix A: the first audit (device windows and the features behind them)

Written 2026-11-04, ready before 18:30 WIB. Research only. Nothing was changed.

## A1. Short answer

You are right. **Every device opens the same window.** A router, a switch, a printer, an access point and an IP phone all show the same four tabs (Physical, Config, Desktop, Services), and the Desktop tab always shows the same seven PC apps. The window was built for a PC and reused for everything.

Behind that window the engine is further along than the screen shows. Two measurements:

- **28 of the engine's 85 API routes are not used by any screen.** They cover Wi-Fi, VoIP phones, VPN, PPPoE, IoT sensors, cellular, mail, PTP and PRP. The engine can do these things; nobody can reach them from the interface.
- **Eight Desktop app icons already exist as artwork** (dial-up, wireless, VPN, traffic generator, network search, VoIP, email, PPPoE) and are not wired to anything.

So the main missing piece is not engine work first. It is a **device model**: a single place that says what each kind of device can do, so the window, the palette and the engine all follow it.

## A2. What exists today (facts, with where to look)

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

## A3. Engine features with no screen

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

## A4. Command line coverage (measured)

I sent 73 common router commands, each in a fresh session in the right mode (user, global config, interface config), and counted which the engine accepts.

**Accepted: 39 of 73.** Not supported:

- **Show and diagnose (17 of 35 refused):** `show interfaces`, `show cdp neighbors`, `show ip protocols`, `show ip ospf`, `show ip ospf neighbor`, `show ip dhcp binding`, `show clock`, `show history`, `show users`, `show processes`, `show controllers`, `show flash:`, `traceroute`, `telnet`, `ssh`, `terminal length 0`, `debug ip icmp`.
- **Global config (11 of 23 refused):** `enable secret`, `ip dhcp pool`, `ip dhcp excluded-address`, `snmp-server`, `ntp server`, `logging`, `service password-encryption`, `ip domain-name`, `crypto key generate rsa`, `username`, `ipv6 unicast-routing`.
- **Interface config (6 of 15 refused):** `description`, `duplex`, `speed`, `ip ospf cost`, `standby` (first-hop redundancy), `ipv6 address`.

Accepted and working include `show version`, `show running-config`, `show ip route`, `show ip interface brief`, `ping`, `hostname`, `banner`, `ip route`, `router rip`, `router ospf`, `router eigrp`, `interface`, `ip address`, `no shutdown`, `access-list`, NAT, `vlan`, `spanning-tree`, `write memory`.

Limits of this test: it checks whether a command is accepted, not whether its result is right. Some accepted commands may do less than the real thing.

Also: switches and routers share the same command engine. Firewalls (`asa`), home routers and industrial switches (`ie2000`) have no command line at all.

## A4b. Reading the device list by kind

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

## A5. What is missing, by priority

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

## A6. How I would build it (not started)

1. Write the registry as data (a TypeScript table plus a matching list in Rust, with a test that the two agree and that every palette kind has a row).
2. Make the window read the registry: tabs and apps come from the row. Start with router and switch, then printer and hub (the biggest visible change for the least work), then wireless and phone.
3. Add each Desktop app one at a time, each with its own window on the shared dialog from F5, a behaviour test, an error test and a Bend check of its rule.
4. Then the command-line gaps, one group at a time, each with a test that sends the command and checks the engine state, not just the reply text.

Test plan for the registry work: every kind has a row; no row lists an app without an API behind it; no API route is left without a screen unless the registry says so; a browser check opens a window of each of the 31 kinds and compares its tabs to its row.

## A7. Decisions needed from you

1. **Reference.** Which features are required for "the base feature"? I used the general set people expect from a network simulator (command line, interface tables, wireless, phones, VPN, mail). If you want a narrower first release (for example routers, switches, PCs and servers only), say so and I will cut the list.
2. **Order.** I recommend P0 then P1 (router, switch, printer, hub), then wireless and phone, then the Desktop apps. Agree?
3. **Command line scope.** Do you want the router and switch command line inside the device window (recommended), or kept as a separate terminal?
4. **Model names.** The vendor model numbers in the palette (still waiting on your naming) should be settled before the registry is written, because the registry will key on them.
5. **Printer, TV, hub.** Should these stay almost empty on purpose, or do you want something real in them (print queue, a TV browser)?

## A8. How this audit was done, and what it did not cover

Done: read the window code and the engine modules; searched every UI file for each of the 85 API routes; sent 73 commands to the engine over HTTP; counted device kinds and their fields from the live workspace JSON.

Not done: I did not click through all 31 windows by hand in a browser (the code and the JSON show they are identical, and I checked several). I did not measure how correct each accepted command's result is. Section 4b's "should offer" column comes from general knowledge of network teaching tools, not from a copy of any product's screens.
