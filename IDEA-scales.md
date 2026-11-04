# Takumi from a house to the world: the scales idea

Written 2026-11-04. Plan only. Nothing in the app was changed by this document.

This is the detailed breakdown of the owner's idea: **one emulator that can be a home, an office, a big office, a data center, and also the Indonesian ladder of rumah, RT/RW Net, ISP, kota, kabupaten, provinsi, negara and dunia.** It sits next to `AUDIT-references.md` (what people come to build) and `AUDIT-device-windows.md` (how each device should feel).

How to read it:
- Part 1 is the idea, the ladder, the two simulation modes and the rules every level follows.
- Part 2 is one section per level. Each level has its own people, components, failures, templates, lessons and tests.
- Part 3 is the plan: what the engine and the screens need, how it is tested, in what order it is built.
- Templates and lessons are written as small `spec` blocks so a test can read them. The test is described in section 3.4 and lives in `tests/ts/idea_scales.test.ts`.

Decisions that the owner did not give are made here with a stated reason (section 3.9). Nothing is left as a question.

---

# Part 1. The idea

## 1.1 The one goal

Let anyone build the network they live in or work in, from their own house to the world, watch how traffic moves through it, and see what breaks and why.

That sentence is the same at every level. Four things follow from it and every level must keep them:

1. **Build.** The person places things and connects them, and the result is a network, not a drawing.
2. **Watch.** Traffic really moves through it, and the person can see the path, the delay and the load.
3. **Break.** Things fail the way they fail in real life: a cable is cut, a link fills up, a password is wrong, a power cut hits a building.
4. **Understand.** When it fails, the tool says where and why, in plain words.

## 1.2 Who this serves

| Person | What they bring | What they need from the level they use |
|---|---|---|
| A family member setting up the Wi-Fi | "The internet is slow in my room" | Home router, Wi-Fi range, a clear fix |
| A student in a vocational school | A lab from the curriculum | A router they will meet in class, a lab they can finish |
| Someone running a community internet link (RT/RW Net) | 50 neighbours, one upstream link | Login, speed limits, bandwidth sharing, monitoring |
| A small business owner or helper | Staff, guests, a printer, a server | Separate networks, a firewall, a safe remote login |
| A campus or company network student | A diagram from a textbook | Core, distribution, access, backup paths |
| A cloud or data center learner | Racks of servers | Leaf and spine, load balancing, failover |
| An ISP trainee | A city of customers | Access network, customer login, links to upstream |
| A city or province planner, or a curious person | "What if this cable is cut?" | A map, capacities, outages |
| A teacher | A class of 30 | Ready labs, checks, a way to see who finished |

## 1.3 The ladder

Eleven levels. The data center is not a size, it is a kind of building, so it hangs beside the ladder and joins at the ISP level.

```
L1 rumah ----- L2 RT/RW Net ----------+
L3 kantor kecil ----------------------+
L4 kantor besar / kampus --------------+--- L6 ISP lokal --- L7 kota ---+
L5 data center ------------------------+                 L8 kabupaten --+--- L9 provinsi --- L10 negara --- L11 dunia
```

| Level | English name | Indonesian name | Typical size | Who owns it |
|---|---|---|---|---|
| L1 | Home | Rumah | 3 to 25 devices | A family |
| L2 | Neighbourhood internet reseller | RT/RW Net | 20 to 300 homes | A person or a small group |
| L3 | Small office | Kantor kecil | 10 to 60 devices | A small business |
| L4 | Big office or campus | Kantor besar, kampus | 200 to 5,000 devices | A company or a school |
| L5 | Data center | Pusat data | 100 to 10,000 servers | A hosting company |
| L6 | Local internet provider | ISP lokal | 1,000 to 100,000 customers | A provider |
| L7 | City | Kota | Many providers and offices | The city and its providers |
| L8 | Regency | Kabupaten | Towns and villages, long links | The regency and its providers |
| L9 | Province | Provinsi | Cities and regencies joined | The province and carriers |
| L10 | Country | Negara | Operators, exchange points, gateways | The country's operators |
| L11 | World | Dunia | Countries, undersea cables | Everyone |

Notes on the Indonesian words: a **kota** and a **kabupaten** are both units directly under a **provinsi**. A city is dense and fibre-rich. A regency is large, has towns and villages, and its links are long and often wireless or satellite. That difference makes them two levels, not one.

## 1.4 Zoom: how the levels connect

A network is made of devices. At the next level up, that whole network becomes **one device**.

- A house (L1) becomes one **customer** of an RT/RW Net (L2) or of an ISP (L6).
- An RT/RW Net (L2), a small office (L3), a campus (L4) and a data center (L5) each become one **customer or tenant** of an ISP (L6).
- An ISP (L6) becomes one **operator** in a city (L7) or a regency (L8).
- A city (L7) and a regency (L8) each become one **region** in a province (L9).
- A province (L9) becomes one **region** of a country (L10).
- A country (L10) becomes one **country** in the world (L11).

The person can **double-click a collapsed node to go down into it**, and use a breadcrumb at the top to go back up. The collapsed node keeps a small **card** that tells the truth about what is inside: how many devices, its total capacity, its delay, its loss and whether it is up. Section 1.6 defines the card.

Parent of each level (used by the test in section 3.4):

| Level | Collapses into |
|---|---|
| L1 | L2 |
| L2 | L6 |
| L3 | L6 |
| L4 | L6 |
| L5 | L6 |
| L6 | L7 |
| L7 | L9 |
| L8 | L9 |
| L9 | L10 |
| L10 | L11 |
| L11 | (top) |

A rule: following the parent of any level always reaches L11 and never loops.

## 1.5 Two ways to simulate

A house has about ten devices and every packet matters. A province has millions of devices and no one can simulate every packet. So Takumi has two modes that share one screen.

**Packet mode** (L1 to L5, and inside any collapsed node when it is opened).
- Every packet exists. ARP, DHCP, ping, web, voice, all of it.
- A real command line on the devices that have one.
- The capture view shows layers and bytes.
- Limit: the workspace holds up to 2,000 devices today.

**Flow mode** (L6 to L11, and the outside view of a collapsed node).
- No single packets. The unit is a **flow**: from where, to where, how much, of what kind.
- The network is a graph of nodes and links with **capacity, delay and loss**.
- The tool computes the path, the load on each link and what is dropped.
- It answers questions of size: which link fills first, what happens if this cable is cut, how long is the delay from here to there.

**The bridge.** A packet-mode network that is collapsed gets a flow-mode summary computed from what is inside: its capacity is the slowest link on its uplink path, its delay is the measured path delay, its loss is the measured loss. When a person opens the node, the summary is replaced by the real network. When they close it, the summary is recomputed. This is what keeps the two modes honest with each other.

**Where each level lives:**

| Level | Packet mode | Flow mode |
|---|---|---|
| L1 to L5 | Yes, the main view | Summary of uplinks only |
| L6 | Yes, for the access and the customer login part | Yes, for the network of many customers |
| L7 to L9 | Only inside a node | Yes, the main view, on a map |
| L10, L11 | Only inside a node | Yes, the main view, on a map |

## 1.6 The node card

Every collapsed node shows the same card, so a person learns it once.

```
+------------------------------------------+
| RT/RW Net Mawar            [open] [info] |
| 64 homes   1 gateway   2 radios          |
| Up: 100 Mbit/s     Down: 100 Mbit/s      |
| Delay to upstream: 18 ms     Loss: 0.4 % |
| Load now: 71 %   Peak today: 96 %        |
| Status: UP, near full                    |
+------------------------------------------+
```

Fields, always the same: name, what it holds, capacity up and down, delay and loss to its parent, load now and peak, and a status word (up, near full, degraded, down). Colours follow the status. The card is also where "why" is answered: if the status is not "up", one line says the cause.

## 1.7 The rules every level follows

These come from the fidelity work in `AUDIT-references.md` and apply to every component at every level.

1. **Wrong input fails like the real thing.** A wrong password is refused. A wrong gateway gives "no route". An unplugged cable shows on both ends. A radio out of range does not connect.
2. **State is visible.** Lights, tables, logs, counters, and the card.
3. **Time is real enough.** Boots take a moment. A reboot drops the network. A lease expires. A cable cut takes a moment to be noticed by the protocols.
4. **One way in for everything the engine can do.** No feature exists only in the engine.
5. **Own art and own words.** No vendor names, logos or firmware screens. Skins are data.
6. **Plain language.** Errors say what happened and how to fix it. No blame, no jargon without a hint.
7. **Two languages.** English and Indonesian for the tool itself, not only for the website.
8. **Everything is a template or a lesson, and every template has checks.** A level is not done until its labs can be run by a test.
9. **Beginner mode and strict mode.** Beginner mode forgives: shorter waits, hints on screen, a visible "fix it for me" button. Strict mode behaves like the real thing. The mode is a setting per lab.
10. **No random behaviour in labs.** The same inputs give the same results, so a lesson can check them.

## 1.8 Check kinds

A lesson step is finished when a **check** passes. A check reads the live network. Existing kinds already work in the engine. New kinds are what this plan adds.

| Kind | Meaning | Status |
|---|---|---|
| ping | A can ping B | exists |
| ttl | The delivered TTL has a given value | exists |
| http | A client opens a page and the title matches | exists |
| lease | A client holds a DHCP address | exists |
| arp | A host has an ARP entry for an address | exists |
| login | A web or console login with given credentials is accepted or refused | new |
| config | A device setting has a given value (name, address, mask, mode) | new |
| noreach | A cannot reach B (the lab asks the person to block it) | new |
| route | A routing table has a route with given type and next hop | new |
| vlan | A port belongs to a VLAN, or a trunk carries it | new |
| pool | A DHCP pool exists with a given range | new |
| nat | A translation exists for an inside address | new |
| wifi | A wireless client is joined to a network with a given security | new |
| session | A customer login session is up (PPPoE or similar) | new |
| limit | A customer's measured rate is at or under a limit | new |
| bgp | A session between two operators is established | new |
| latency | The delay between two nodes is at or under a value | new |
| load | The load on a link is under a value | new |
| outage | After a given failure, a given pair is still reachable | new |
| count | A count of things (clients, sessions, routes) is at least a value | new |
| log | A log line of a given kind exists | new |

The test in section 3.4 fails if a template or lesson uses a kind that is not in this table.

## 1.9 How to read a spec block

Templates and lessons are written as fenced blocks starting with the word `spec`. One line per fact.

A template:

```spec
template: tpl-example
level: L1
status: new
devices: homerouter, pc, laptop
demo: ping pc0 -> laptop0
```

- `template` is the id. Ids are lower case, letters, digits and dashes.
- `level` is L1 to L11.
- `status` is `exists` (already in the repository with this id) or `new`.
- `devices` is the list of device kinds, in words from the palette (or `homerouter`, `rtrw-gateway` and similar new kinds, see section 3.2).
- `demo` is the traffic that runs when Play is pressed on a quiet template (one line, one step).

A lesson:

```spec
lesson: les-example
level: L1
minutes: 10
prereq: -
uses: tpl-example
step: Do this first
step: Then this
step: Then check
check: ping | PC0 reaches Laptop0 | pass when ping succeeds | Check the cable and the addresses
check: config | Router name is set | pass when name equals Home | Open the router page and change the name
```

- `prereq` is the id of one earlier lesson, or `-` for none. It must appear earlier in this document.
- `uses` is the template the lesson opens.
- At least three `step` lines and two `check` lines. A check line is: kind, label, pass rule, hint, separated by `|`.

## 1.10 What "done" means for a level

A level is done when all of these are true:

1. Its components open the experience described in its section.
2. Every template of the level opens, runs its demo traffic and passes its own checks.
3. Every lesson of the level can be finished by following its steps, and a test finishes it by script.
4. Breaking each failure listed for the level is possible and the tool explains it.
5. The level has no feature that exists only in the engine.
6. English and Indonesian text for the level's screens, errors and lessons exist.

---

# Part 2. The levels

Every level uses the same subsections so they can be compared. The words in brackets point to the section of the plan where the work is described.

---

## L1. Rumah (Home)

### L1.1 Who and why

- A family that wants the Wi-Fi to work in every room.
- A student who is told "set up a router at home" for homework.
- A person who changed internet provider and must set the new modem.
- A parent who wants to limit a child's evening internet.
- A beginner for whom this is the first network they ever see.

What they feel: "this is my house." The tool must speak about rooms, phones and the internet, not about VLANs.

### L1.2 The real-world picture

A house has one internet line that arrives through a **modem or an optical terminal** put in by the provider. Behind it sits a **home router** that does four jobs at once: it gives out addresses (DHCP), shares the one public address among all devices (NAT), runs the Wi-Fi, and has a few cable ports. Phones, laptops, a television, a printer and sometimes smart plugs join by Wi-Fi or cable. Many houses add a second access point in a far room. The provider's login (a name and password, or nothing) lives in the router.

### L1.3 What the person builds

1. The line from the provider (modem or terminal).
2. A home router, a computer by cable.
3. The Wi-Fi name and password.
4. Phones and a laptop joining the Wi-Fi.
5. A printer, shared on the network.
6. A second access point in the far room (coverage).
7. A rule: block a device, or limit hours.

### L1.4 Components and how each one should feel

| Component | What it opens | Notes |
|---|---|---|
| Provider terminal (modem) | A small status page: line up, speed, account | The other end of the provider link |
| Home router | The router's own web page after a login | Wizard, internet type, Wi-Fi, devices, port forwarding, system |
| Access point | Its own web page, wireless part only | Shows the clients joined |
| Computer (Windows-style or Linux) | A desktop with network settings, a browser, a terminal | The place from which the router page is opened |
| Phone | A phone screen: Wi-Fi list, password prompt, signal bars | Joins by tapping a name |
| Printer | A small page with its address and a test page | Prints across the network |
| Television, smart plug | A status card | Needs the Wi-Fi to work, nothing else |

Home router web page, the pages in order of value: login, quick setup, internet (DHCP, fixed, PPPoE), local network (address, DHCP range, reserved addresses, lease list), wireless (name, password, security, channel, guest), connected devices, port forwarding, security (block a device, hours), system (reboot, reset, password, log). A **sticker** on the router shows its address, its default login and its Wi-Fi password.

### L1.5 Features and protocols at this level

- Addressing: private addresses, a mask, a gateway.
- DHCP: a pool, a lease time, reserved addresses.
- NAT: many inside addresses share one outside address; port forwarding for one inside host.
- DNS: the router forwards names to the provider's server.
- Wi-Fi: name, password, security type, channel, range, joining and leaving.
- Provider login: DHCP from the provider, a fixed address, or PPPoE with a name and password.
- ARP, ping, a web browser.
- A small amount of voice or video traffic for realism (a phone call on Wi-Fi).

### L1.6 Failures to explore

| Failure | What the person sees | What the tool says |
|---|---|---|
| Wrong Wi-Fi password | The phone refuses to join | "Wrong password for HomeNet" |
| Wi-Fi off | The name is not in the list | "No networks found" |
| Out of range | The phone sees the name with one bar and drops | "Signal too weak (1 of 4)" |
| Cable unplugged from the computer | The computer shows no network | "Network cable unplugged" |
| Two devices with the same address | Both work badly | "Address 192.168.0.20 is also used by Printer0" |
| Wrong gateway on a computer | Local things work, the internet does not | "No route to the internet from PC0: the gateway is wrong" |
| Provider login wrong | The router says internet is down | "The provider refused the login" |
| DHCP pool full | A new phone gets no address | "No free address in the pool" |
| Router restarted | Everything drops for a moment | "Router restarting, back in 20 seconds" |
| Channel crowded | Slow Wi-Fi, a log line about interference | "Channel 6 is used by 3 nearby networks" |

### L1.7 Takumi today and the gaps

Exists: devices (home router, laptop, pc, phone, printer, tv), cables, DHCP on servers and routers, NAT overload, DNS, a browser, a capture view, five lessons and five templates that run.

Missing: the home router has no behaviour (no wan and lan ports, no DHCP, no NAT, no Wi-Fi radio, no web page, no login); there is no provider side; the phone has no screen; Wi-Fi is in the engine without any screen; the computer has no system choice; the printer has no page; the failures above have no explanations.

### L1.8 Zoom

A house collapses into one **customer** node. Its card shows: how many devices, its uplink speed from the provider, the measured delay to the provider, and whether the line is up. At L2 and L6 the house is one of many customers.

### L1.9 Metrics shown

Signal bars per client; the router's four lights (power, internet, Wi-Fi, ports); the number of clients; the speed from the computer to the internet; the lease table.

### L1.10 Templates

```spec
template: tpl-connect
level: L1
status: exists
devices: pc, pc
demo: ping pc0 -> pc1
```

```spec
template: tpl-star
level: L1
status: exists
devices: switch, pc, pc, pc
demo: ping pc0 -> pc2
```

```spec
template: tpl-home
level: L1
status: exists
devices: homerouter, laptop, pc, server
demo: http laptop0 -> http://192.168.1.2/
```

```spec
template: tpl-web
level: L1
status: exists
devices: switch, pc, pc, server
demo: http pc0 -> http://www.takumi.lab/
```

```spec
template: tpl-l1-wifi-home
level: L1
status: new
devices: provider-terminal, homerouter, laptop, phone, phone, printer, tv
demo: http laptop0 -> http://www.example.lab/
```

```spec
template: tpl-l1-two-rooms
level: L1
status: new
devices: provider-terminal, homerouter, accesspoint, laptop, phone, tablet
demo: ping phone0 -> laptop0
```

```spec
template: tpl-l1-broken-wifi
level: L1
status: new
devices: provider-terminal, homerouter, laptop, phone
demo: ping phone0 -> laptop0
```

- `tpl-l1-wifi-home` is the full house: it opens working, with a sticker on the router.
- `tpl-l1-two-rooms` has a weak signal in the far room; the lesson fixes it with the second access point.
- `tpl-l1-broken-wifi` starts broken on purpose (wrong Wi-Fi password saved on the phone, a bad gateway on the laptop).

### L1.11 Lessons

```spec
lesson: t1
level: L1
status: exists
minutes: 5
prereq: -
uses: tpl-connect
step: Add two computers and join them with a copper cable
step: Give PC0 and PC1 addresses in the same network
step: Ping PC1 from PC0
check: ping | PC0 reaches PC1 | pass when ping succeeds | Check the cable type and that both addresses share the same network
check: config | Both computers have an address | pass when both addresses are set | Open the network settings on each computer
```

```spec
lesson: t2
level: L1
status: exists
minutes: 8
prereq: t1
uses: tpl-star
step: Join three computers to a switch
step: Give each computer an address in one network
step: Ping between all of them and watch the switch learn addresses
check: ping | All three computers reach each other | pass when every pair succeeds | A pair that fails has a wrong address or an unplugged cable
check: arp | The switch learned the computers | pass when each computer has an ARP entry for the others | Ping first, then look again
```

```spec
lesson: t3
level: L1
status: exists
minutes: 10
prereq: t2
uses: tpl-home
step: Turn on automatic addresses on the laptop and the computer
step: Check that each one received an address
step: Open the server's web page from the laptop
check: lease | The laptop and the computer have leased addresses | pass when both hold a lease | Switch each one to automatic and renew
check: http | The laptop opens the server page | pass when the page title is Server0 | Check the server address and that the web service is on
```

```spec
lesson: t5
level: L1
status: exists
minutes: 12
prereq: t3
uses: tpl-web
step: Open the browser on PC0
step: Type the name of the site instead of its address
step: Find out which server answered the name
check: http | PC0 opens the site by name | pass when the page title is Server0 | The name server must know the name; check the DNS record
check: ping | PC0 reaches the server | pass when ping succeeds | If the page fails but ping works, the name is the problem
```

```spec
lesson: les-l1-01-router-login
level: L1
minutes: 8
prereq: t3
uses: tpl-l1-wifi-home
step: Read the sticker on the router: address, user name and password
step: On the laptop open the browser and type the router address
step: Log in with the name and password from the sticker
step: Try a wrong password once and read the message
check: login | The router page accepts the sticker login | pass when the admin login succeeds | Type the exact words from the sticker
check: login | The router refuses a wrong password | pass when a wrong password is refused | Try a password that is not on the sticker
```

```spec
lesson: les-l1-02-wifi-name
level: L1
minutes: 10
prereq: les-l1-01-router-login
uses: tpl-l1-wifi-home
step: Open the wireless page of the router
step: Change the Wi-Fi name to your family name
step: Set a password of at least 8 characters with WPA2
step: On the phone, find the new name and join it
check: config | The Wi-Fi name was changed | pass when the name is not the default | Save the page after typing the name
check: wifi | The phone is joined with WPA2 | pass when the phone is joined and security is WPA2 | Type the password exactly as saved
```

```spec
lesson: les-l1-03-guest-wifi
level: L1
minutes: 10
prereq: les-l1-02-wifi-name
uses: tpl-l1-wifi-home
step: Turn on the guest network with its own name and password
step: Join the guest network with the second phone
step: Try to open the printer from the guest phone
check: wifi | The second phone joined the guest network | pass when the phone is on the guest network | Guest networks have a different name from the main one
check: noreach | The guest phone cannot reach the printer | pass when ping to the printer fails | Turn on "guests cannot see the home network"
```

```spec
lesson: les-l1-04-reserve-address
level: L1
minutes: 10
prereq: les-l1-02-wifi-name
uses: tpl-l1-wifi-home
step: Find the printer in the connected devices list
step: Reserve its current address so it never changes
step: Restart the printer and check that it kept the address
check: pool | The printer has a reserved address | pass when a reservation exists for the printer | Reserve by the printer's hardware address
check: ping | The laptop reaches the printer after its restart | pass when ping succeeds | The reserved address must be outside the dynamic range
```

```spec
lesson: les-l1-05-port-forward
level: L1
minutes: 15
prereq: les-l1-04-reserve-address
uses: tpl-l1-wifi-home
step: Run a small web page on the computer
step: Reserve the computer's address
step: Create a port forward from outside port 8080 to the computer's port 80
step: Open the page from outside using the router's public address and port 8080
check: nat | The forward exists for the computer | pass when a forward from 8080 to port 80 exists | The forward must point at the reserved address
check: http | The outside client opens the page | pass when the page title matches | Use the router's outside address, not the inside one
```

```spec
lesson: les-l1-06-far-room
level: L1
minutes: 12
prereq: les-l1-02-wifi-name
uses: tpl-l1-two-rooms
step: Look at the phone's signal in the far room
step: Move an access point to the hallway
step: Join the access point to the router by cable and give it the same Wi-Fi name
step: Check that the phone now shows full bars
check: wifi | The phone is joined with at least 3 of 4 bars | pass when signal is 3 or more | Move the access point closer to the phone
check: ping | The phone reaches the laptop | pass when ping succeeds | Both must be on the same network
```

```spec
lesson: les-l1-07-find-the-fault
level: L1
minutes: 15
prereq: les-l1-02-wifi-name
uses: tpl-l1-broken-wifi
step: Try to join the Wi-Fi with the phone and read the message
step: Fix the saved password
step: The laptop opens local pages but not the internet: find why
step: Fix the gateway on the laptop
check: wifi | The phone is joined | pass when the phone is joined | The saved password was wrong; forget the network and join again
check: ping | The laptop reaches the internet | pass when the laptop reaches the outside server | The gateway must be the router's address
```

### L1.12 Tests for this level

- Open each template, press Play, check events appear (exists for five templates).
- Script each lesson: apply its steps through the API and run its checks. All must pass.
- Break test for every failure in L1.6: apply the failure and assert the message text.
- A web page test for the router pages: login, wrong password refused, every page loads, a changed value persists after a reboot.
- A phone test: scan, join with a wrong password, join with the right one, signal bars change with distance.

### L1.13 Indonesian terms and copy notes

rumah, router rumah, kata sandi, nama Wi-Fi, tamu, jangkauan, sinyal, perangkat terhubung, penyedia internet, modem, kabel LAN. Say "kata sandi", not "password", in Indonesian screens where the real routers do. Use "Wi-Fi" as is.

### L1.14 Risks

- The home router is the most visible device and has the least engine behaviour today. It is the first thing to build.
- Signal strength needs a place model (x and y exist on every device; they would carry distance).
- Port forwarding needs static NAT, which does not exist yet.

---

## L2. RT/RW Net (neighbourhood internet reseller)

### L2.1 Who and why

- A person or a small group who buys one internet line and shares it with neighbours (an RT or RW is a neighbourhood unit).
- A vocational student who meets this exact setup in class and in competitions.
- A village or a housing estate that has no other provider.
- A teacher who wants a lab that matches what students will really run.

What they feel: "I am the provider." They care about who is connected, who pays, who is hogging the line, and how to keep it cheap.

### L2.2 The real-world picture

One **upstream link** (fibre or radio) from a bigger provider arrives at the operator's house. A **gateway router** there (often a low-cost router running a full router operating system) does the work of a small provider: it gives each customer a login, gives out addresses, shares the one public address with NAT, limits each customer's speed, and records usage. From the gateway, **radio links** or **cables** reach the homes. A tall pole carries a **sector radio** that many homes point at. Houses far away need a **point-to-point radio link** to a relay house. At each house sits a small **client radio** and the family's own router (which becomes a customer of this network, see L1).

Typical numbers: 20 to 300 homes, an upstream of 50 to 500 Mbit/s, home plans of 5 to 20 Mbit/s, so the line is shared on the idea that not everyone is online at the same time.

### L2.3 What the person builds

1. The upstream link from the provider.
2. The gateway router with a customer login.
3. A sector radio on a pole and client radios at homes.
4. A relay for a far house.
5. Plans: speed limits per customer.
6. A **hotspot with vouchers** for visitors (a code with a time or data limit).
7. A monitoring view: who is online, who is using how much.

### L2.4 Components and how each one should feel

| Component | What it opens | Notes |
|---|---|---|
| Upstream link | A small card: speed, delay, up or down | The other end is the provider |
| Gateway router (router-operating-system style) | A management window with menu on the left: interfaces, addresses, DHCP, firewall, NAT, queues, hotspot, users, logs, plus a terminal | Our own design, own names |
| Sector radio | A page with frequency, width, name, and the list of connected clients with signal | Coverage is drawn on the map as a sector |
| Client radio | A small status page: connected or not, signal, speed | Sits at a house |
| Relay radio pair | A link page: distance, signal, speed | Needs line of sight |
| Customer's home router | The L1 home router page | Logs in with the plan name and password |
| Voucher printer or page | A page that makes voucher codes | Used for the hotspot |

### L2.5 Features and protocols

- Customer login: PPPoE (a name and password per home) and the hotspot (a page and a code).
- Addressing: one pool per group of homes, a fixed address for important customers.
- NAT: many customers share one public address (the "masquerade" idea).
- **Queues**: a limit per customer, a parent limit for the whole group, burst for a short time, a fair share when the line is full.
- Firewall: block outside access to the gateway, allow only the operator's computer to manage it, drop bad traffic.
- Radio: frequency, channel width, distance, signal, noise, the speed that results.
- Monitoring: a list of sessions, bytes used, a graph of the line.
- DNS cache on the gateway for speed.
- Logs: logins, failed logins, link up and down.

### L2.6 Failures to explore

| Failure | What the person sees | What the tool says |
|---|---|---|
| One customer downloads without limit | Everyone else is slow | "Line full: Customer 17 uses 71 %" and the queue view |
| Wrong login | The home cannot connect | "Login refused: name or password is wrong" |
| Radio out of line of sight | The link flaps | "Signal 23 dB below needed, something is in the way" |
| Pole radio overloaded | Many homes slow, few fast | "Sector A has 58 clients, 10 is a safe number" |
| Upstream cut | Everyone down | "Upstream link is down, the provider's side" |
| Address pool empty | New homes fail | "No free address in pool RW-03" |
| Gateway restarted | Short outage, sessions drop | "Gateway rebooted, 64 sessions will reconnect" |
| Rain or interference | The link slows at some hours | "Noise rose 9 dB since 18:00" |
| Voucher used twice | The second use is refused | "Voucher already used" |
| Wrong NAT | Customers reach local things, not the internet | "No NAT rule for 10.10.0.0/16" |

### L2.7 Takumi today and the gaps

Exists: DHCP, NAT overload, ACL, PPPoE pieces without a screen, wireless engine pieces without a screen, VPN pieces without a screen.

Missing: the whole gateway experience (menu, queues, hotspot, users, firewall page); queue and speed-limit behaviour; radios with distance and signal; vouchers; session lists; a per-customer usage view; a way to simulate many customers at once; the map. This level is the largest new area and the one nobody else offers.

### L2.8 Zoom

An RT/RW Net collapses into one **customer of a provider** (L6). Its card shows: homes, upstream speed, delay and loss to the provider, load now and peak, sessions up. Opening it shows the gateway, the radios and the homes.

### L2.9 Metrics shown

Sessions online; line load as a graph; top users; per-sector client counts; signal per client; queue drops; login failures per hour.

### L2.10 Templates

```spec
template: tpl-l2-rtrw-small
level: L2
status: new
devices: provider-link, rtrw-gateway, sector-radio, client-radio, homerouter, homerouter, homerouter, laptop
demo: http laptop0 -> http://www.example.lab/
```

```spec
template: tpl-l2-rtrw-hotspot
level: L2
status: new
devices: provider-link, rtrw-gateway, hotspot-ap, phone, phone, laptop
demo: http phone0 -> http://www.example.lab/
```

```spec
template: tpl-l2-rtrw-busy
level: L2
status: new
devices: provider-link, rtrw-gateway, sector-radio, client-radio, homerouter, homerouter, homerouter, homerouter, pc
demo: ping pc0 -> server0
```

- `tpl-l2-rtrw-small` is a working 3-home network with a customer login.
- `tpl-l2-rtrw-hotspot` is a visitor hotspot with vouchers.
- `tpl-l2-rtrw-busy` is a congested network: one customer uses most of the line.

### L2.11 Lessons

```spec
lesson: les-l2-01-first-gateway
level: L2
minutes: 15
prereq: les-l1-02-wifi-name
uses: tpl-l2-rtrw-small
step: Open the gateway management window
step: Set the upstream address from the provider
step: Give the home side its own address range
step: Add a rule so customers share the public address
check: config | The upstream has an address | pass when the upstream address is set | Use the address the provider gave
check: nat | Customers are translated to the public address | pass when a translation exists for a customer | Add the masquerade rule on the upstream
check: http | A laptop at a home opens an outside page | pass when the page opens | Check the gateway address on the home router
```

```spec
lesson: les-l2-02-customer-login
level: L2
minutes: 15
prereq: les-l2-01-first-gateway
uses: tpl-l2-rtrw-small
step: Create a plan with a name and a speed
step: Create one login per home with its plan
step: On each home router choose the provider login type and type the name and password
step: Look at the list of online sessions
check: session | All three homes have a session | pass when 3 sessions are up | Each home router must use its own login
check: login | A wrong password is refused | pass when a wrong password is refused | Try a wrong password on one home
```

```spec
lesson: les-l2-03-speed-limits
level: L2
minutes: 15
prereq: les-l2-02-customer-login
uses: tpl-l2-rtrw-busy
step: Open the queue page and find the customer using most of the line
step: Give every customer a limit of 10 Mbit/s
step: Give the whole group a parent limit of the upstream speed
step: Download from two homes at once and read the graph
check: limit | Each customer is at or under 10 Mbit/s | pass when measured rates are 10 or less | Put the limit on the customer, not on the whole group
check: load | The upstream is under 100 percent | pass when load is under 100 | Set the parent limit to the upstream speed
```

```spec
lesson: les-l2-04-voucher-hotspot
level: L2
minutes: 12
prereq: les-l2-02-customer-login
uses: tpl-l2-rtrw-hotspot
step: Turn on the hotspot on the visitors network
step: Make a voucher with a time limit
step: Join from a phone, type the voucher on the login page
step: Try the same voucher on a second phone
check: login | The first phone logs in with the voucher | pass when the voucher is accepted | The voucher must be typed exactly
check: login | The second phone is refused | pass when the used voucher is refused | One-use vouchers work only once
```

```spec
lesson: les-l2-05-far-house
level: L2
minutes: 15
prereq: les-l2-01-first-gateway
uses: tpl-l2-rtrw-small
step: Place a house 1.5 km from the pole and look at its signal
step: Put a relay house halfway
step: Point the relay's two radios at the pole and at the far house
step: Check the speed at the far house
check: wifi | The far house is connected to a radio | pass when its radio shows connected | Point the radio at the relay, not at the pole
check: latency | The delay stays under 40 ms | pass when delay is 40 or less | Each relay adds a little delay
```

```spec
lesson: les-l2-06-find-the-hog
level: L2
minutes: 12
prereq: les-l2-03-speed-limits
uses: tpl-l2-rtrw-busy
step: Complaints say the evening is slow: read the log and the graph
step: Find which customer uses most
step: Decide between a limit and a talk with the customer
step: Apply a limit and check the others recover
check: count | Customers with a limit are at least 4 | pass when 4 or more customers have a limit | Limit every customer, not only the heavy one
check: outage | After the limit, the other homes can load a page | pass when a page opens from each home | Check that the limit applies to the right login
```

### L2.12 Tests for this level

- A scripted RT/RW lab: gateway, upstream, NAT, three logins, three home routers; all sessions up and a page loads.
- Queue tests: with a 10 Mbit/s limit a measured transfer is at most 10 (with a small tolerance); with two customers on a full line, shares are fair.
- A radio test: signal falls with distance; no line of sight blocks; two radios on the same channel interfere.
- A voucher test: valid, expired, used.
- Failure tests for each row in L2.6 with the exact message text.

### L2.13 Indonesian terms and copy notes

RT/RW Net, pelanggan, paket, kecepatan, batas kecepatan, voucher, hotspot, tiang, radio sektoral, radio klien, relay, upstream, sesi, antrian, pemakaian, pengguna teratas. The words "mikrotik-style" must not appear in the product; the gateway is called **Gateway RT/RW**.

### L2.14 Risks

- Radio physics must stay simple and honest: distance, line of sight, one noise number. A full radio planner is out of scope.
- Queues are the heart of this level; a wrong queue model teaches wrong things, so it needs its own fidelity tests.
- Many customers at once need flow-level counting inside packet mode (a customer is a counter, not a stream of packets).

---

## L3. Kantor kecil (Small office)

### L3.1 Who and why

- A small business owner or the person who "does the computers" for a shop, a clinic or a school office.
- A student learning VLANs, firewalls and safe remote access.
- A teacher who wants an office lab that is bigger than a home but small enough to finish.

### L3.2 The real-world picture

One internet line, one **router with a firewall**, one or two **switches**, a **wireless access point**, ten to forty computers, a printer, a file server, maybe a camera system and a few IP phones. Staff, guests and servers are kept in **separate networks (VLANs)**. A guest cannot reach the file server. An owner working from home reaches the office through a **VPN**. The router only allows what is needed.

### L3.3 What the person builds

1. Router and firewall with the internet line.
2. A managed switch with three VLANs: staff, guests, servers.
3. The router routing between the VLANs ("router on a stick").
4. A file server and a printer in the right VLAN.
5. A guest Wi-Fi that reaches only the internet.
6. A VPN from the owner's home.
7. A rule list that blocks what should not be reachable.

### L3.4 Components and how each one should feel

| Component | What it opens | Notes |
|---|---|---|
| Office router with firewall | Console and command line inside the window, plus tables: interfaces, routes, rules | Real commands, saved and running configuration |
| Managed switch | Port list with VLAN and lights, MAC table, VLAN table, console | Port lights go amber while a port is thinking |
| Access point | Web page with the staff and guest names | Maps each name to a VLAN |
| Computer | Desktop of the chosen system | Staff and guest computers |
| Server | Services page and a console | File, web, printing |
| Printer | A page and a test page | Needs to be reachable from staff only |
| IP phone | A small screen with its extension | Registered to a call server |

### L3.5 Features and protocols

- VLANs: access ports, trunk ports, the VLAN list, native VLAN.
- Routing between VLANs.
- DHCP per VLAN, with relay if the server is elsewhere.
- Access lists: standard and extended, with the implicit deny.
- NAT overload to the internet.
- Port security on switch ports.
- A site-to-site or remote-access VPN.
- Secure remote management: passwords, SSH, no plain remote login.
- Time, logs and a monitoring server.

### L3.6 Failures to explore

| Failure | What the person sees | What the tool says |
|---|---|---|
| Missing VLAN on the trunk | One VLAN has no network | "VLAN 20 is not allowed on trunk Gi0/1" |
| Wrong native VLAN | A warning in the log, some traffic leaks | "Native VLAN mismatch on Gi0/1" |
| ACL in the wrong direction | The rule does nothing | "The list is on the inbound side; the traffic leaves outbound" |
| Implicit deny forgotten | Everything is blocked after a new ACL | "No rule permits this; the list ends with an implicit deny" |
| DHCP does not cross VLANs | Guests get no address | "No helper address on VLAN 30" |
| Duplicate address | Intermittent drops | "Address is also used by Printer0" |
| VPN does not come up | The owner cannot reach the server | "Phase 1 failed: the pre-shared keys differ" |
| Port security shut a port | A computer is dead after a swap | "Port Fa0/5 is err-disabled: new MAC address" |
| Spanning tree blocks the wrong path | Slow path chosen | "Root is Switch1; raise Switch0's priority" |
| Router has no default route | Internet down | "No route to 0.0.0.0/0" |

### L3.7 Takumi today and the gaps

Exists and tested: VLANs, trunks, router on a stick, static and dynamic routing, ACLs, NAT overload, DHCP and relay, spanning tree, port security display. Missing: layer 3 switching (`ip routing`), DHCP pool on the router, secure remote login commands, a VPN screen, an interface and VLAN table in the window, the firewall rule view, switch port lights.

### L3.8 Zoom

A small office collapses into one **business customer** of an ISP. The card shows: devices, uplink speed, delay, status, and the security posture in one word (open, filtered, locked down), computed from the rules.

### L3.9 Metrics shown

Ports up and down; VLAN membership; rule hit counters; DHCP lease count; VPN tunnel state; log of denied traffic.

### L3.10 Templates

```spec
template: tpl-routed
level: L3
status: exists
devices: router, switch, switch, pc, pc, pc, pc
demo: ping pc0 -> pc3
```

```spec
template: tpl-l3-office-vlans
level: L3
status: new
devices: router, switch, accesspoint, pc, pc, pc, server, printer, laptop
demo: ping pc0 -> server0
```

```spec
template: tpl-l3-office-guest
level: L3
status: new
devices: router, switch, accesspoint, pc, server, phone, laptop
demo: http phone0 -> http://www.example.lab/
```

```spec
template: tpl-l3-office-vpn
level: L3
status: new
devices: router, switch, pc, server, cloud, laptop, router
demo: ping laptop0 -> server0
```

### L3.11 Lessons

```spec
lesson: t4
level: L3
status: exists
minutes: 15
prereq: t2
uses: tpl-routed
step: Address PC0 and PC1 on the left network and set their gateway
step: Address PC2 and PC3 on the right network and set their gateway
step: Give each router interface an address and turn it on
step: Ping from PC0 to PC3 and read the TTL
check: ping | PC0 reaches PC3 through Router0 | pass when ping succeeds | Check each gateway and each router interface
check: ttl | The router decrements the delivered TTL to 127 | pass when the delivered TTL is 127 | A routed ping crosses one router, so one hop is removed
```

```spec
lesson: les-l3-01-three-vlans
level: L3
minutes: 15
prereq: t4
uses: tpl-l3-office-vlans
step: Create VLANs 10 staff, 20 servers and 30 guests on the switch
step: Put each port in the right VLAN
step: Make the link to the router a trunk
step: Check that computers in one VLAN cannot reach another yet
check: vlan | The staff computers are in VLAN 10 | pass when all staff ports belong to VLAN 10 | Set the access VLAN on each port
check: vlan | The router link is a trunk that carries 10, 20 and 30 | pass when the trunk allows all three | Allow the VLANs on the trunk
check: noreach | Staff cannot reach the server before routing | pass when ping fails | Without routing, VLANs are separate networks
```

```spec
lesson: les-l3-02-inter-vlan
level: L3
minutes: 15
prereq: les-l3-01-three-vlans
uses: tpl-l3-office-vlans
step: Create one sub-interface on the router for each VLAN
step: Give each sub-interface the VLAN gateway address
step: Point each computer's gateway at its VLAN's address
step: Ping from a staff computer to the server
check: route | The router has a connected route for each VLAN | pass when three connected routes exist | Turn on each sub-interface
check: ping | A staff computer reaches the server | pass when ping succeeds | Check the gateway on both sides
```

```spec
lesson: les-l3-03-dhcp-per-vlan
level: L3
minutes: 12
prereq: les-l3-02-inter-vlan
uses: tpl-l3-office-vlans
step: Create a pool for the staff VLAN and one for the guest VLAN
step: Exclude the gateway addresses from the pools
step: Set computers to automatic and renew
check: pool | A pool exists for the staff and for the guests | pass when two pools exist | Create a pool per network
check: lease | Staff and guest computers hold leases from their own pools | pass when each lease is in its own range | Renew the lease after changing the pool
```

```spec
lesson: les-l3-04-acl-guests
level: L3
minutes: 15
prereq: les-l3-02-inter-vlan
uses: tpl-l3-office-guest
step: Join the guest Wi-Fi with the phone and find that it reaches the server
step: Write a list that denies the guest network to the server network
step: Permit everything else so the internet still works
step: Apply the list on the right interface in the right direction
check: noreach | The guest phone cannot reach the server | pass when ping to the server fails | Apply the list inbound on the guest side
check: http | The guest phone still opens an outside page | pass when the page opens | The last line must permit everything else
```

```spec
lesson: les-l3-05-port-security
level: L3
minutes: 10
prereq: les-l3-01-three-vlans
uses: tpl-l3-office-vlans
step: Turn on port security on the staff ports with one allowed address
step: Swap a computer with another one
step: Read the message and bring the port back
check: log | The port went down after the swap | pass when a port-security log line exists | Allow only one address per port
check: ping | After bringing the port back the new computer works | pass when ping succeeds | Clear the error state after fixing the cause
```

```spec
lesson: les-l3-06-remote-owner
level: L3
minutes: 20
prereq: les-l3-04-acl-guests
uses: tpl-l3-office-vpn
step: Create the tunnel on the office router with a shared key
step: Create the matching tunnel at the owner's home router
step: Allow the tunnel traffic through the firewall
step: Reach the server from the owner's laptop
check: config | A tunnel is configured on both routers | pass when both ends show a tunnel | Use the same key and the same peer addresses
check: ping | The owner's laptop reaches the server | pass when ping succeeds | Allow the traffic through the access list
```

### L3.12 Tests for this level

- Scripted office lab: VLANs, trunk, routing, DHCP, ACL, NAT. All lessons pass by script.
- ACL direction test: the same list inbound and outbound gives different results.
- Port security test: swap triggers the shutdown message; clearing works.
- VPN test: matching keys bring it up; different keys fail with the right message.
- Spanning tree test: the root moves when a priority changes.

### L3.13 Indonesian terms and copy notes

kantor kecil, tamu, karyawan, server berkas, VLAN, jalur trunk, aturan, daftar akses, pengaman port, jaringan pribadi virtual (VPN), kunci bersama.

### L3.14 Risks

- Layer 3 switching and secure remote login are commands people expect; their absence will be noticed in the first office lab.
- The VPN needs a real handshake model, not a switch that is on or off, or the failure messages cannot be honest.

---

## L4. Kantor besar dan kampus (Large office and campus)

### L4.1 Who and why
A network engineer in a company with several floors or buildings, a campus IT team, a student preparing for a networking exam. They care about design: layers, redundancy, and keeping a fault small.

### L4.2 The real-world picture
Three layers. **Access** switches in each floor closet connect people. **Distribution** switches join the floors of a building. A **core** pair joins the buildings and the server room. Every link has a spare. Routing between the layers uses OSPF. A **wireless controller** manages many access points. A firewall pair sits at the edge. Guests, staff, labs and servers each have their own VLAN and their own rules.

### L4.3 What the person builds
1. Two core switches, two distribution switches per building, access switches per floor.
2. Redundant links with link bundling (EtherChannel) and spanning tree that picks the right root.
3. OSPF in one area, then in several.
4. A first-hop spare gateway (HSRP-style) so a floor survives a switch loss.
5. A wireless controller with staff and guest names.
6. A server room with DHCP, DNS, web and file servers.
7. An edge firewall with a demilitarised zone.

### L4.4 Components
| Component | Opens | Notes |
|---|---|---|
| Core switch (layer 3) | Console, routing table, VLAN table, port lights | `ip routing` required |
| Distribution switch | Same as core with fewer ports | Spare gateway state shown |
| Access switch | Port list, MAC table, port security | PoE draw shown |
| Wireless controller | Access point list, names, client counts | Pushes config to many access points |
| Edge firewall | Zones, rules, hit counters, NAT | Own rule language |
| Server group | Services page | DHCP, DNS, web, file |
| Monitoring server | Link graphs, alarms | Reads counters |

### L4.5 Features
VLAN trunking and pruning; EtherChannel; rapid spanning tree with root and backup root; layer 3 switching; OSPF with areas, costs, passive interfaces; spare gateway with priority and preempt; DHCP relay; ACLs; zone firewall; NAT; QoS marking for voice; logging and time; a simple flow counter export.

### L4.6 Failures
| Failure | Seen | Message |
|---|---|---|
| Wrong root bridge | Traffic takes a long path | "Root is an access switch; set the core as root" |
| One bundle member down | Half the speed | "Bundle Po1 has 1 of 2 links" |
| OSPF neighbours stuck | No routes from a building | "Hello interval mismatch: 10 vs 30" |
| Area mismatch | Neighbour refused | "Area id differs on both sides" |
| Spare gateway both active | Duplicate answers | "Two active gateways: check the group number" |
| Loop with no spanning tree | Storm, everything slow | "Broadcast storm on 14 ports" |
| Wrong cost | Slow link preferred | "Route chosen via 100 Mbit/s link; cost not scaled" |
| Controller cannot reach access points | Wi-Fi gone | "0 of 12 access points joined" |
| Voice choppy | Calls break up | "Voice class dropped 4 %; no priority queue" |

### L4.7 Today and gaps
Exists: spanning tree, OSPF basics, VLANs, trunks, ACL, NAT, DHCP relay. Missing: layer 3 switching, EtherChannel, spare gateway, wireless controller, zone firewall, QoS, many-device canvas navigation (search, groups, floors), a fast engine for 100+ devices, stored monitoring counters.

### L4.8 Zoom
A campus collapses into one **large customer or institution** at L6. Its card shows buildings, uplink pairs (with state), peak load, and whether redundancy is intact (green if every layer has a spare, amber if one spare is lost, red if single points remain).

### L4.9 Metrics
Per-link load, root bridge, OSPF neighbour count, spare gateway state, wireless clients per access point, rule hits, storm count.

### L4.10 Templates
```spec
template: tpl-l4-campus-three-layer
level: L4
status: new
devices: switch-l3, switch-l3, switch-l3, switch-l3, switch, switch, switch, firewall, server, pc, pc, pc
demo: ping pc0 -> server0
```
```spec
template: tpl-l4-campus-ospf
level: L4
status: new
devices: router, router, router, router, switch-l3, switch-l3, pc, pc, server
demo: ping pc0 -> server0
```
```spec
template: tpl-l4-campus-wireless
level: L4
status: new
devices: wlc, accesspoint, accesspoint, accesspoint, switch-l3, switch, laptop, phone, server
demo: http phone0 -> http://www.example.lab/
```
```spec
template: tpl-l4-campus-dmz
level: L4
status: new
devices: firewall, switch-l3, switch, server, server, pc, pc, cloud
demo: http pc0 -> http://www.example.lab/
```

### L4.11 Lessons
```spec
lesson: les-l4-01-three-layers
level: L4
minutes: 20
prereq: les-l3-02-inter-vlan
uses: tpl-l4-campus-three-layer
step: Name the layers on the canvas: access, distribution, core
step: Turn on routing on the core and distribution switches
step: Give every VLAN a gateway on its distribution pair
step: Ping from a floor computer to the server
check: ping | A floor computer reaches the server | pass when ping succeeds | Check routing is on and each VLAN has a gateway
check: route | The core has routes for every building | pass when the core routing table lists each building | Advertise each building network
```
```spec
lesson: les-l4-02-root-and-bundles
level: L4
minutes: 15
prereq: les-l4-01-three-layers
uses: tpl-l4-campus-three-layer
step: Find the current spanning tree root
step: Make the core the root and a second core the backup
step: Bundle the two links between the cores
step: Pull one cable and watch traffic continue
check: vlan | The core is the root for the staff VLAN | pass when the root is a core switch | Lower the priority on the core
check: outage | A cable pulled and a ping still works | pass when ping survives one link loss | The bundle must have two live members
```
```spec
lesson: les-l4-03-ospf-campus
level: L4
minutes: 20
prereq: les-l4-01-three-layers
uses: tpl-l4-campus-ospf
step: Turn on OSPF area 0 on all four routers
step: Make user-facing interfaces passive
step: Compare costs and tune the faster path
step: Break a link and watch the route move
check: route | Every router knows every network | pass when each router has all campus networks | Check the area and the network statements
check: outage | After a link fails the ping still works | pass when ping survives a failed link | Both paths must be in OSPF
```
```spec
lesson: les-l4-04-spare-gateway
level: L4
minutes: 15
prereq: les-l4-01-three-layers
uses: tpl-l4-campus-three-layer
step: Give the two distribution switches a shared gateway address
step: Set the preferred one with a higher priority
step: Shut the preferred one and ping again
check: ping | The ping survives the loss of the preferred gateway | pass when ping succeeds after shutdown | Both switches need the same group number
```
```spec
lesson: les-l4-05-campus-wifi
level: L4
minutes: 15
prereq: les-l3-04-acl-guests
uses: tpl-l4-campus-wireless
step: Let all access points join the controller
step: Create a staff name and a guest name on the controller
step: Map each name to a VLAN
step: Join from a phone as a guest and try the file server
check: wifi | All access points have joined | pass when every access point is joined | Check the controller address on the access points
check: noreach | A guest cannot reach the file server | pass when the guest ping to the file server fails | Map the guest name to the guest VLAN
```
```spec
lesson: les-l4-06-dmz
level: L4
minutes: 20
prereq: les-l3-04-acl-guests
uses: tpl-l4-campus-dmz
step: Create the three zones: inside, outside, dmz
step: Allow outside to the web server only on port 80
step: Allow inside to the dmz and to the outside
step: Deny dmz to inside
check: http | Outside can open the web page in the dmz | pass when the page opens from outside | Open port 80 from outside to dmz
check: noreach | The dmz cannot reach the inside | pass when ping from dmz to inside fails | Add the deny rule dmz to inside
```

### L4.12 Tests
Scripted campus lab for each template. Root election, bundle failure, OSPF neighbour mismatch, spare gateway failover and zone rule tests, each with the exact message. A scale test: 120 devices must load, converge and answer a ping inside a time budget.

### L4.13 Indonesian terms
kampus, gedung, lantai, lapisan akses, distribusi, inti, jalur cadangan, akar spanning tree, gerbang cadangan, pengendali nirkabel, zona demiliterisasi (DMZ).

### L4.14 Risks
The engine must scale first. The canvas needs groups, search and floors before 100 devices are usable. Over-teaching vendor protocols is a trap; keep each feature generic with its common name.

---

## L5. Pusat data (Data center)

### L5.1 Who and why
A server or cloud engineer, a student learning how big sites are wired, someone who runs a few racks for a company. They care about speed between servers, no single point of failure, and moving work around.

### L5.2 The real-world picture
Racks hold servers. A **top-of-rack switch** joins each rack. **Spine switches** join all racks (a leaf-spine fabric), so every rack is two hops from every other. Addresses are routed down to the rack (layer 3 to the edge). Overlays (VXLAN) let a virtual network stretch across racks. A **load balancer** spreads requests over servers. Storage has its own network. Two uplink routers connect the whole hall to the world.

### L5.3 What the person builds
1. Four racks of four servers.
2. Two leaf switches per rack pair and two spines.
3. BGP or OSPF between leaf and spine.
4. A virtual network spanning two racks.
5. A load balancer in front of three web servers.
6. Health checks that take a dead server out.
7. Two uplinks to the outside.

### L5.4 Components
| Component | Opens | Notes |
|---|---|---|
| Rack | A rack view with units and power | Racks are groupable on the canvas |
| Leaf and spine switch | Port table, routing table, fabric view | Show equal-cost paths |
| Server (virtualised) | Cards for virtual machines, their networks | Move a machine, watch traffic follow |
| Load balancer | Pool, members, health, method | Round robin, least connections |
| Storage network | Target list and paths | Simple model |
| Uplink router pair | Routes, BGP neighbours | |

### L5.5 Features
Leaf-spine routing; equal-cost multipath; BGP between layers; VXLAN-style overlay with a network id; virtual machine move; load balancing with health checks; storage paths; power and cooling cards as simple numbers; capacity view per rack.

### L5.6 Failures
| Failure | Seen | Message |
|---|---|---|
| Spine lost | Half the capacity | "Fabric at 50 %; 8 paths left of 16" |
| Hash puts all flows on one link | One link hot | "Link L1-S2 at 94 %; others under 30 %" |
| Health check wrong | A dead server still gets requests | "Server 3 failed 6 requests; health check path is wrong" |
| Overlay id mismatch | Two racks cannot talk on the virtual network | "Network id 5001 vs 5002" |
| Virtual machine moved, address not announced | Traffic goes to the old rack | "Host route still points to rack 1" |
| Rack power lost | A rack disappears | "Rack 3 off: 4 servers, 12 virtual machines down" |
| Uplink flaps | Outside slow | "Uplink B flapped 5 times in 10 min" |
| Oversubscription | Slow at peak | "Rack uplink ratio 6:1; target 3:1" |

### L5.7 Today and gaps
Exists: routing, BGP pieces without a screen, VLANs, a web service model. Missing: rack view and groups, leaf-spine template, multipath, overlay, virtual machines, load balancer, health checks, capacity numbers, engine speed for 200+ nodes, flow mode for traffic matrices.

### L5.8 Zoom
A hall collapses into a **content or cloud site** at L6 and L7. Its card shows racks, power state, capacity, uplinks, and requests per second served.

### L5.9 Metrics
Fabric utilisation, equal-cost path count, pool health, requests per second, rack power, oversubscription ratio.

### L5.10 Templates
```spec
template: tpl-l5-leaf-spine
level: L5
status: new
devices: switch-l3, switch-l3, switch-l3, switch-l3, switch-l3, server, server, server, server, router, router
demo: ping server0 -> server3
```
```spec
template: tpl-l5-load-balanced-web
level: L5
status: new
devices: load-balancer, server, server, server, switch-l3, router, pc
demo: http pc0 -> http://www.example.lab/
```
```spec
template: tpl-l5-overlay
level: L5
status: new
devices: switch-l3, switch-l3, switch-l3, server, server, server, server
demo: ping server0 -> server3
```

### L5.11 Lessons
```spec
lesson: les-l5-01-leaf-spine
level: L5
minutes: 20
prereq: les-l4-03-ospf-campus
uses: tpl-l5-leaf-spine
step: See why every server is two hops from every other
step: Number the links and address them point to point
step: Turn on routing between leaf and spine
step: Ping across racks and read the path
check: ping | Servers in different racks reach each other | pass when ping succeeds | Check each leaf has routes to every other rack
check: route | Each leaf has two equal paths | pass when each leaf has two routes to a remote rack | Enable multipath
```
```spec
lesson: les-l5-02-lose-a-spine
level: L5
minutes: 12
prereq: les-l5-01-leaf-spine
uses: tpl-l5-leaf-spine
step: Send steady traffic between two racks
step: Power off one spine
step: Read the capacity number and check the ping
check: outage | Traffic survives one spine loss | pass when ping succeeds with one spine off | Each leaf must connect to both spines
check: load | The remaining paths stay under 100 percent | pass when load is under 100 | Reduce the test traffic or add a spine
```
```spec
lesson: les-l5-03-load-balancer
level: L5
minutes: 15
prereq: les-l5-01-leaf-spine
uses: tpl-l5-load-balanced-web
step: Add three servers to the pool
step: Choose round robin and send ten requests
step: Break one server and watch the health check remove it
check: http | The page opens through the balancer | pass when the page opens | Use the balancer address, not a server address
check: count | Requests are shared across three servers | pass when each server served at least one request | Add all three to the pool
check: outage | With one server down the page still opens | pass when the page opens | Turn on health checks
```
```spec
lesson: les-l5-04-overlay-network
level: L5
minutes: 20
prereq: les-l5-01-leaf-spine
uses: tpl-l5-overlay
step: Give two servers in different racks the same virtual network id
step: Ping between them on their virtual addresses
step: Move one machine to another rack and ping again
check: ping | Servers on the virtual network reach each other | pass when ping succeeds | Use the same network id on both leaves
check: ping | The ping survives a machine move | pass when ping succeeds after the move | Announce the host after the move
```
```spec
lesson: les-l5-05-find-the-hot-link
level: L5
minutes: 12
prereq: les-l5-02-lose-a-spine
uses: tpl-l5-leaf-spine
step: Read the utilisation of every link
step: Find the link above 90 percent
step: Change the multipath setting so flows spread
check: load | No link is above 70 percent | pass when every link is at or under 70 | Turn on per-flow hashing
```

### L5.12 Tests
Leaf-spine builds from a script and converges. Equal-cost count checks. Spine loss keeps connectivity. Balancer shares requests and removes a dead member. Overlay moves keep reachability. Scale tests at 200 nodes.

### L5.13 Indonesian terms
pusat data, rak, server, penyeimbang beban, jalur sama biaya, jaringan virtual, mesin virtual, kapasitas, jalur panas.

### L5.14 Risks
Flow mode is needed for traffic matrices; packet mode alone cannot show a hot link. The load balancer and overlay need their own correct small models, not a pretend box.

---

## L6. ISP lokal (Local ISP)

### L6.1 Who and why
A person who runs or wants to run a small provider, a student learning how providers connect homes and companies, an engineer joining a provider. They care about customers per port, upstream deals, and not falling over when a link fails.

### L6.2 The real-world picture
A **point of presence (POP)** has a core router, aggregation switches, and an access network (fibre to the home, radio, or leased lines). **Customers** (L1, L2, L3, L4) connect and get an address by login. The ISP has its **own address blocks** and an **autonomous system number**. It buys **transit** from one or two larger providers (L9, L10) and **peers** at an exchange with other local providers. It runs BGP to announce its blocks and learn the world. It keeps a DNS resolver, a billing/login server and a monitoring system.

### L6.3 What the person builds
1. A POP with core, aggregation, access.
2. Customers of different kinds (home, RT/RW Net, small office).
3. A customer login server with plans.
4. Two upstream transit links and one exchange link.
5. BGP with prefix filters and path preference.
6. A resolver and a speed-test server.
7. A status page.

### L6.4 Components
| Component | Opens | Notes |
|---|---|---|
| Provider core router | Routes, BGP neighbours, interface counters | Full routing table size shown |
| Aggregation switch | Ports, customer counts | |
| Access concentrator | Sessions, plans, rates | Where logins end |
| Billing and login server | Customers, plans, sessions, usage | Our own simple page |
| Resolver | Cache size, hit rate, queries | |
| Peering link | Neighbour state, prefixes in and out | |
| Customer node card | The collapsed network from L1 to L4 | See the node card |

### L6.5 Features
Address blocks and subnet plans; BGP with local preference, prepending, communities; prefix filters; route announcements; customer sessions by plan; capacity planning (customers per port, oversubscription); IPv6 alongside IPv4; resolver cache; monitoring; simple outage simulation; a customer node card list.

### L6.6 Failures
| Failure | Seen | Message |
|---|---|---|
| Upstream A fails | Traffic shifts to B | "Route to 8.8.8.0/24 moved from A to B" |
| Wrong prefix announced | The world sends you someone else's traffic | "You announce 10.0.0.0/8; only 203.0.113.0/24 is yours" |
| Customer hijacks your prefix | Some customers lose service | "Prefix filter would have blocked this" |
| Exchange link flaps | Local traffic goes via transit (costly) | "Local traffic via transit: 40 % more cost" |
| Access port full | Customers slow | "Port 7 has 480 customers; plan limit is 300" |
| Resolver overloaded | Pages load slow | "Resolver hit rate 38 %; cache too small" |
| BGP session reset | Short outage | "Neighbour AS 64600 reset: hold timer expired" |
| Billing server down | New customers cannot log in | "Login server unreachable; existing sessions continue" |

### L6.7 Today and gaps
Exists: BGP basics in the engine (no screen), static and dynamic routing, NAT, DHCP, PPPoE pieces. Missing: BGP screen and policy, prefix filters, address plan tool, customer collapse and node card, session table at scale, flow mode summaries, resolver model, outage injection at scale. This level introduces **flow mode**.

### L6.8 Zoom
A local ISP collapses into a **local operator** at L7, and into one **customer** of a regional provider at L9. Its card shows customers, address blocks, upstreams with state, peak traffic, and how many customers are in each class.

### L6.9 Metrics
Customers, sessions, traffic per upstream and per exchange, BGP neighbours up, prefixes in and out, resolver hit rate, port fill, cost estimate.

### L6.10 Templates
```spec
template: tpl-l6-isp-pop
level: L6
status: new
devices: router, router, switch-l3, switch-l3, access-concentrator, login-server, resolver, rtrw-gateway, homerouter, router
demo: ping homerouter0 -> resolver0
```
```spec
template: tpl-l6-isp-two-upstreams
level: L6
status: new
devices: router, router, router, router, switch-l3, server
demo: ping server0 -> router3
```
```spec
template: tpl-l6-isp-exchange
level: L6
status: new
devices: router, router, router, router, switch-l3
demo: ping router0 -> router3
```

### L6.11 Lessons
```spec
lesson: les-l6-01-address-plan
level: L6
minutes: 20
prereq: les-l3-03-dhcp-per-vlan
uses: tpl-l6-isp-pop
step: Take one address block and split it into customer, infrastructure and server ranges
step: Give every link a small point-to-point block
step: Write the plan in the plan table
check: config | Every link has an address from the plan | pass when no address is used twice | Use a small block per link
check: count | At least three ranges exist | pass when 3 or more ranges are planned | Separate customers, links and servers
```
```spec
lesson: les-l6-02-first-bgp
level: L6
minutes: 20
prereq: les-l4-03-ospf-campus
uses: tpl-l6-isp-two-upstreams
step: Give your router an autonomous system number
step: Open a session to the first upstream
step: Announce your block
step: See your block in the upstream's table
check: bgp | The session with the upstream is up | pass when the neighbour state is established | Check the neighbour address and number
check: route | The upstream learned your block | pass when the upstream lists your block | Announce exactly your block
```
```spec
lesson: les-l6-03-two-upstreams
level: L6
minutes: 20
prereq: les-l6-02-first-bgp
uses: tpl-l6-isp-two-upstreams
step: Open a second session to the other upstream
step: Prefer the first upstream with local preference
step: Shut the first link and watch traffic move
check: bgp | Both sessions are up | pass when both neighbours are established | Repeat the neighbour setup
check: outage | Traffic survives the loss of the first upstream | pass when ping succeeds after shutdown | The second upstream must carry your block
```
```spec
lesson: les-l6-04-prefix-filter
level: L6
minutes: 15
prereq: les-l6-02-first-bgp
uses: tpl-l6-isp-two-upstreams
step: Watch a customer announce a block that is not theirs
step: Write a filter that accepts only their own block
step: Apply it inbound on the customer session
check: route | The wrong block is not accepted | pass when the table lacks the wrong block | Apply the filter inbound
```
```spec
lesson: les-l6-05-peer-locally
level: L6
minutes: 15
prereq: les-l6-03-two-upstreams
uses: tpl-l6-isp-exchange
step: Join the exchange and open a session with a local peer
step: Exchange blocks and see traffic stay local
step: Break the exchange and see traffic go to transit
check: bgp | The peer session is up | pass when the neighbour is established | Use the exchange address
check: route | Local traffic prefers the exchange | pass when the next hop for the peer block is the exchange | Raise local preference on the peer
```
```spec
lesson: les-l6-06-customer-ports
level: L6
minutes: 12
prereq: les-l2-03-speed-limits
uses: tpl-l6-isp-pop
step: Count customers on every access port
step: Find the port above the plan limit
step: Move customers to a second port
check: limit | No port is above its plan limit | pass when every port count is at or under the limit | Move customers to a spare port
```

### L6.12 Tests
Two-upstream failover by script; BGP session establishes and drops on a wrong number; prefix filter accepts and rejects; exchange traffic stays local; address-plan checker finds overlap; collapse test shows an L2 network as a customer card and expands back unchanged.

### L6.13 Indonesian terms
penyedia layanan internet lokal, titik kehadiran, pelanggan, hulu (upstream), peering, titik pertukaran trafik, blok alamat, nomor AS, penyaring awalan.

### L6.14 Risks
Real BGP is large. Keep the model true for the decisions people make (preference, filters, announcements) and say plainly what is left out. Collapse and expand must lose nothing.
---

## L7. Kota (City)

### L7.1 Who and why
A city IT office, a smart-city planner, a student learning how many networks join into one. They care about public services staying up, shared fibre, and seeing the whole city on one screen.

### L7.2 The real-world picture
A city has a **fibre ring** joining district hubs, one or more **local ISPs** (L6), **government offices**, hospitals, schools, a **traffic control system**, **public Wi-Fi** and a **city exchange**. The ring is built so a single cut does not stop anything. Critical services have two paths and a backup power plan.

### L7.3 What the person builds
1. A ring of five district hubs.
2. Two ISPs peering at the city exchange.
3. A hospital and a government office with protected links.
4. Traffic lights and cameras on their own network.
5. Public Wi-Fi in a square.
6. A control room with a map view.

### L7.4 Components
| Component | Opens | Notes |
|---|---|---|
| District hub | Card with sites, links, state | A collapsed group |
| Ring link | Capacity, load, cut or not | Cuttable on the map |
| City exchange | Members and traffic | |
| Hospital site, government site | Service and priority cards | Priority classes |
| Traffic and camera network | Device counts, latency | Needs low delay |
| Control room map | Map layer with all hubs | Colour by state |

### L7.5 Features
Ring protection (a cut re-routes in a short, visible time); priority classes for critical sites; segmentation of services; map view; capacity view; outage injection (cut a link, lose a hub, lose power); a report of which services were hit.

### L7.6 Failures
| Failure | Seen | Message |
|---|---|---|
| One cut | Ring reroutes | "Ring cut between Hub 2 and 3; all sites still reachable; recovery 0.9 s" |
| Two cuts | A hub is isolated | "Hub 3 isolated: 2 schools, 1 clinic offline" |
| Power at a hub | A hub dark | "Hub 4 on battery; 38 min left" |
| Exchange down | ISPs use transit | "Local traffic leaves the city; delay +22 ms" |
| Camera network overloaded | Video stutters | "Camera traffic 91 % of the link" |
| Hospital on the wrong class | Slow during a surge | "Hospital traffic is best-effort" |

### L7.7 Today and gaps
Exists: map is not built yet. Missing: map layer, hubs as groups, ring protection, priority classes, outage report, flow mode, node cards (from L6), a way to scale to thousands of nodes by collapse.

### L7.8 Zoom
A city collapses into one **regional member** at L8. Its card shows districts, critical sites with state, exchange state, population served, and worst outage minutes.

### L7.9 Metrics
Sites up, population covered, ring load, protection events, critical site uptime, exchange traffic.

### L7.10 Templates
```spec
template: tpl-l7-city-ring
level: L7
status: new
devices: district-hub, district-hub, district-hub, district-hub, district-hub, city-exchange
demo: ping district-hub0 -> district-hub3
```
```spec
template: tpl-l7-city-services
level: L7
status: new
devices: district-hub, district-hub, district-hub, hospital-site, government-site, camera-network
demo: ping hospital-site0 -> government-site0
```

### L7.11 Lessons
```spec
lesson: les-l7-01-ring-cut
level: L7
minutes: 15
prereq: les-l6-03-two-upstreams
uses: tpl-l7-city-ring
step: Look at the ring and the load on every link
step: Cut one link on the map
step: Read how long the recovery took
check: outage | After one cut every hub is reachable | pass when all hubs answer a ping | A ring survives one cut if it is closed
check: latency | Recovery is under 2 seconds | pass when recovery is 2 seconds or less | Turn on fast protection on the ring
```
```spec
lesson: les-l7-02-two-cuts
level: L7
minutes: 15
prereq: les-l7-01-ring-cut
uses: tpl-l7-city-ring
step: Cut two links on the map
step: Read which sites lost service
step: Add one cross-link to survive two cuts
check: count | At most one hub is isolated after two cuts | pass when isolated hubs are 1 or fewer | Add a link between opposite hubs
```
```spec
lesson: les-l7-03-critical-sites
level: L7
minutes: 15
prereq: les-l7-01-ring-cut
uses: tpl-l7-city-services
step: Mark the hospital and the government office as priority one
step: Load the links with camera traffic
step: Check the hospital delay under load
check: latency | Hospital delay stays under 20 ms under load | pass when delay is 20 or less | Give the hospital the priority class
check: load | Camera traffic never exceeds 60 percent | pass when camera load is 60 or less | Rate-limit the camera network
```
```spec
lesson: les-l7-04-city-exchange
level: L7
minutes: 15
prereq: les-l6-05-peer-locally
uses: tpl-l7-city-ring
step: Connect two ISPs to the city exchange
step: Send traffic between their customers
step: Pull one ISP out and read the effect
check: bgp | Both ISPs have a session at the exchange | pass when both sessions are established | Use the exchange addresses
check: route | Traffic between the two ISPs stays in the city | pass when the next hop is the exchange | Prefer the exchange over transit
```
```spec
lesson: les-l7-05-power-cut
level: L7
minutes: 12
prereq: les-l7-03-critical-sites
uses: tpl-l7-city-services
step: Turn off power at one hub
step: Read how long the battery lasts
step: Move a critical site to a hub with a generator
check: outage | The hospital stays reachable during the power cut | pass when the hospital answers a ping | Home the hospital on a hub with backup power
```

### L7.12 Tests
Ring cut recovery by script; double cut isolates exactly the expected hub; priority class keeps the hospital delay low in flow mode; the exchange keeps local traffic local; collapse of a city to a card and back.

### L7.13 Indonesian terms
kota, kabupaten kota, simpul distrik, cincin serat, titik pertukaran kota, ruang kendali, layanan kritis, rumah sakit, kantor pemerintah, lampu lalu lintas, pemadaman.

### L7.14 Risks
Map data should be a plain layout the user draws or loads (no external map service). Do not pretend a ring protocol is exact; show the effect (recovery time, who is hit) and name the simplification.

---

## L8. Kabupaten (Regency)

### L8.1 Who and why
A regional government, a regional carrier planner, a student looking at rural reach. They care about covering many small towns, long links, radios and satellites, and backup.

### L8.2 The real-world picture
A regency joins a **capital town**, many **sub-district towns**, and **villages** far apart. Backbone is fibre between towns with **microwave radio** where fibre is too costly and **satellite** at the far edge. Each village has a small POP or a radio tower. Many of the villages run an RT/RW Net (L2). Power is unreliable, so batteries and solar matter.

### L8.3 What the person builds
1. A capital hub and six sub-district hubs on a tree with one cross-link.
2. Microwave links over hills.
3. A satellite link for a remote village.
4. Village POPs with RT/RW Nets behind them.
5. Service coverage and cost view.

### L8.4 Components
| Component | Opens | Notes |
|---|---|---|
| Regency hub | Card: towns, links, state | |
| Microwave link | Distance, clearance, rain margin | |
| Satellite terminal | Delay, throughput, weather | Delay about 600 ms round trip |
| Village POP | Same as a small ISP card | Collapsed |
| Power node | Grid, battery, solar | Simple numbers |

### L8.5 Features
Tree plus cross-link design; long-haul radio with weather fade; satellite delay; coverage and cost summaries; village aggregation; power model; planning mode (what to build next for most people covered per cost).

### L8.6 Failures
| Failure | Seen | Message |
|---|---|---|
| Heavy rain | Microwave speed drops | "Link A-B at 40 %: rain margin 6 dB, rain 9 dB" |
| Satellite congestion | Slow | "Satellite 94 % full at 19:00" |
| Hill blocks the link | No link | "Clearance 12 m below needed" |
| Battery empty | Village dark | "Village 5 off: battery empty after 7 h" |
| Tree has no cross-link | A cut isolates many | "Cut isolates 4 villages (6,200 people)" |

### L8.7 Today and gaps
All of it is missing beyond routing: radio link model, weather input, satellite delay, power model, coverage and cost view, planning mode.

### L8.8 Zoom
A regency collapses into one **provincial member** at L9. Card: towns, population served, backbone state, backup state, cost.

### L8.9 Metrics
People covered, cost per person, link margins, outage minutes, battery hours, satellite load.

### L8.10 Templates
```spec
template: tpl-l8-regency-tree
level: L8
status: new
devices: regency-hub, regency-hub, regency-hub, regency-hub, regency-hub, regency-hub, regency-hub, village-pop, village-pop
demo: ping village-pop0 -> regency-hub0
```
```spec
template: tpl-l8-regency-radio
level: L8
status: new
devices: regency-hub, regency-hub, microwave-link, microwave-link, satellite-terminal, village-pop
demo: ping village-pop0 -> regency-hub0
```

### L8.11 Lessons
```spec
lesson: les-l8-01-tree-and-cross
level: L8
minutes: 15
prereq: les-l7-02-two-cuts
uses: tpl-l8-regency-tree
step: Count the villages behind each town
step: Cut a link and read who loses service
step: Add one cross-link that saves the most people
check: count | A single cut leaves at most 1000 people offline | pass when offline population is 1000 or fewer | Join the largest isolated branch to another branch
```
```spec
lesson: les-l8-02-rain-fade
level: L8
minutes: 12
prereq: les-l8-01-tree-and-cross
uses: tpl-l8-regency-radio
step: Run heavy rain and read the link margin
step: Shorten the hop or raise the margin
check: load | The link keeps above 70 percent speed in heavy rain | pass when speed is 70 or more | Add margin or split the hop
```
```spec
lesson: les-l8-03-satellite-village
level: L8
minutes: 12
prereq: les-l8-01-tree-and-cross
uses: tpl-l8-regency-radio
step: Join the remote village by satellite
step: Measure the delay
step: Decide what is fine over satellite and what is not
check: latency | Delay to the village is between 500 and 700 ms | pass when delay is in 500 to 700 | Use the satellite terminal as the only link
```
```spec
lesson: les-l8-04-power-plan
level: L8
minutes: 12
prereq: les-l8-02-rain-fade
uses: tpl-l8-regency-tree
step: Read the battery hours of each village
step: Add solar to the weakest village
step: Run a night and check nobody goes dark
check: outage | No village goes dark overnight | pass when all villages stay up | Add solar or a bigger battery
```
```spec
lesson: les-l8-05-plan-the-next-link
level: L8
minutes: 20
prereq: les-l8-04-power-plan
uses: tpl-l8-regency-tree
step: With a fixed budget choose the next three links
step: Compare people covered per cost
check: count | The plan covers at least 8000 more people | pass when added coverage is 8000 or more | Prefer links that serve the biggest villages
```

### L8.12 Tests
Radio fade by table; satellite delay in range; power runs out at the expected hour; single cut counts isolated people; planner never goes over budget.

### L8.13 Indonesian terms
kabupaten, kecamatan, desa, gelombang mikro, satelit, menara, tenaga surya, baterai, jangkauan, biaya per jiwa.

### L8.14 Risks
Do not claim radio engineering accuracy. State clearly that numbers are a teaching model. Population data is a user-set number, not a claim about a real place.

---

## L9. Provinsi (Province)

### L9.1 Who and why
A provincial carrier or a regional backbone planner, a student learning how a backbone is built. They care about a few big links carrying a lot, and rerouting when one fails.

### L9.2 The real-world picture
A province has a **backbone ring or mesh** joining regency capitals (L8) and the provincial capital, with **submarine cables** between islands, **points of presence** that sell transit to local ISPs (L6), and **internet exchanges**. Capacity is measured in the tens or hundreds of Gbit/s. Failures are less frequent but cost a lot.

### L9.3 What the person builds
1. A backbone ring of six PoPs with two diagonal links.
2. A submarine link to an island province.
3. Transit sales to three ISPs.
4. An internet exchange with five members.
5. Capacity planning and a failure drill.

### L9.4 Components
| Component | Opens | Notes |
|---|---|---|
| Backbone PoP | Card with routers, capacity, state | |
| Long-haul link | Capacity, length, delay | |
| Submarine cable | Capacity, cut state, repair time | Repair takes days |
| Transit customer | Contract: speed, price | |
| Internet exchange | Member list and traffic | |
| Capacity planner | Table of load, headroom, growth | |

### L9.5 Features
Traffic matrix in flow mode; best-path with failure of any single link (an N-1 check); capacity headroom; transit contracts; exchange accounting; island links with long repair; what-if drill.

### L9.6 Failures
| Failure | Seen | Message |
|---|---|---|
| Submarine cut | Island degraded | "Island link down; backup carries 38 % of load; repair estimate 6 days" |
| Backbone link at 95 % | Drops | "Link P2-P4 at 95 %; add capacity or reroute" |
| N-1 fails | A single loss overloads another link | "If P3-P5 fails, P3-P6 reaches 130 %" |
| Transit customer exceeds contract | Billing event | "ISP 2 at 118 % of contract" |
| Exchange member leaves | Traffic shifts | "Member X left; 14 Gbit/s moved to transit" |

### L9.7 Today and gaps
Missing: flow mode (this level needs it), N-1 checker, long repair timeline, contract and billing view, capacity planner.

### L9.8 Zoom
A province collapses into one **national region** at L10. Card: capacity, headroom, N-1 status (safe or not), islands connected, exchanges.

### L9.9 Metrics
Link load and headroom, N-1 status, transit sold, exchange traffic, outage days.

### L9.10 Templates
```spec
template: tpl-l9-backbone-ring
level: L9
status: new
devices: backbone-pop, backbone-pop, backbone-pop, backbone-pop, backbone-pop, backbone-pop, internet-exchange
demo: ping backbone-pop0 -> backbone-pop3
```
```spec
template: tpl-l9-island
level: L9
status: new
devices: backbone-pop, backbone-pop, submarine-cable, submarine-cable, backbone-pop
demo: ping backbone-pop0 -> backbone-pop2
```

### L9.11 Lessons
```spec
lesson: les-l9-01-backbone-load
level: L9
minutes: 20
prereq: les-l7-03-critical-sites
uses: tpl-l9-backbone-ring
step: Load the traffic matrix and read link loads
step: Find links above 80 percent
step: Move traffic by changing link costs
check: load | No link is above 80 percent | pass when every link is at or under 80 | Tune costs so flows spread
```
```spec
lesson: les-l9-02-n-minus-one
level: L9
minutes: 20
prereq: les-l9-01-backbone-load
uses: tpl-l9-backbone-ring
step: Run the single-failure check
step: Read which failure overloads which link
step: Add capacity or a diagonal link until all pass
check: load | After any single failure no link is above 100 percent | pass when the N-1 check passes | Add a diagonal link or capacity
```
```spec
lesson: les-l9-03-island-cable
level: L9
minutes: 15
prereq: les-l9-01-backbone-load
uses: tpl-l9-island
step: Cut the main submarine cable
step: Read how much traffic the backup carries
step: Decide what traffic gets priority during six days of repair
check: load | Priority traffic stays under 100 percent on the backup | pass when priority load is under 100 | Mark the priority class
```
```spec
lesson: les-l9-04-sell-transit
level: L9
minutes: 12
prereq: les-l6-03-two-upstreams
uses: tpl-l9-backbone-ring
step: Sell transit to three ISPs with different speeds
step: Watch usage against each contract
step: Find the ISP over contract
check: count | All three ISPs have a contract | pass when 3 contracts exist | Create a contract per ISP
```
```spec
lesson: les-l9-05-exchange-members
level: L9
minutes: 12
prereq: les-l7-04-city-exchange
uses: tpl-l9-backbone-ring
step: Join five members to the exchange
step: Let one member leave
step: Read how traffic moved
check: bgp | Five sessions are up before the leave | pass when 5 sessions are established | Connect each member
```

### L9.12 Tests
Flow mode matrix sums to the offered load; N-1 check names the right failure; contract usage percentage; submarine repair timeline in days; collapse card shows N-1 status.

### L9.13 Indonesian terms
provinsi, tulang punggung (backbone), kabel laut, pulau, kapasitas, transit, pertukaran internet, kegagalan tunggal.

### L9.14 Risks
Flow mode must be correct before this level is credible. A teaching model must say it is not a traffic engineering tool.

---

## L10. Negara (Country)

### L10.1 Who and why
A national policy planner, a regulator, a student of national infrastructure. They care about how a nation reaches the world, how resilient it is, and who controls the gates.

### L10.2 The real-world picture
A country has several **international gateways** (landing stations for submarine cables), **national exchanges**, a few large **national carriers**, **content caches** from big content companies placed inside the country, and rules about data. The country connects to the world through a small number of cables and cities, so a cable cut or a political decision can matter a lot.

### L10.3 What the person builds
1. Three landing stations on different coasts.
2. Five international cables to different regions.
3. Two national carriers and one exchange.
4. Content caches inside the country.
5. A national drill: a cable cut, a landing station out, a content block.

### L10.4 Components
| Component | Opens | Notes |
|---|---|---|
| National gateway | Cables, capacity, state | |
| International cable | Route, capacity, owners, repair time | |
| National carrier | Backbone card (collapsed L9) | |
| National exchange | Members, traffic | |
| Content cache | Hit rate, size | Reduces cable use |
| Policy rule | A rule on a path | Teaching only |

### L10.5 Features
Country-level flow model; cable diversity score (are two cables on the same route?); content cache effect; national drill; dependency view (which services need which cable).

### L10.6 Failures
| Failure | Seen | Message |
|---|---|---|
| Two cables share a route | One accident cuts both | "Cables 2 and 3 share a trench near the strait" |
| Landing station down | A coast loses outbound capacity | "Gateway East out; 42 % of outbound capacity gone" |
| Cache empty | Cables fill up | "Cache hit rate 12 %; cables at 96 %" |
| Policy rule blocks a path | A service disappears | "Rule R7 blocks traffic to region B" |

### L10.7 Today and gaps
Missing everything above flow mode: country flow model, cable diversity, cache model, drill runner, dependency view.

### L10.8 Zoom
A country collapses into one **member of the world** at L11. Card: gateways, international capacity, cable diversity score, cache hit rate, and a one-word resilience grade.

### L10.9 Metrics
International capacity, diversity score, cache hit rate, resilience grade, drill result.

### L10.10 Templates
```spec
template: tpl-l10-national-gateways
level: L10
status: new
devices: national-gateway, national-gateway, national-gateway, national-carrier, national-carrier, national-exchange
demo: ping national-carrier0 -> national-carrier1
```
```spec
template: tpl-l10-cables-and-cache
level: L10
status: new
devices: national-gateway, national-gateway, intl-cable, intl-cable, intl-cable, content-cache, national-carrier
demo: http national-carrier0 -> http://www.example.lab/
```

### L10.11 Lessons
```spec
lesson: les-l10-01-cable-diversity
level: L10
minutes: 20
prereq: les-l9-02-n-minus-one
uses: tpl-l10-national-gateways
step: Read the route of every international cable
step: Find two cables on the same route
step: Re-route one to a different coast
check: count | No two cables share a route | pass when shared routes are 0 | Move one cable to another gateway
```
```spec
lesson: les-l10-02-cache-saves-cables
level: L10
minutes: 15
prereq: les-l10-01-cable-diversity
uses: tpl-l10-cables-and-cache
step: Read the cable load without caches
step: Place a cache inside the country
step: Read the cable load again
check: load | Cable load drops by at least 30 percent | pass when load drops by 30 or more | Increase the cache size
```
```spec
lesson: les-l10-03-national-drill
level: L10
minutes: 20
prereq: les-l10-01-cable-diversity
uses: tpl-l10-national-gateways
step: Run the drill: cut the busiest cable
step: Read which services were hit
step: Add a plan so the drill ends with no critical outage
check: outage | No critical service is down at the end of the drill | pass when critical services are up | Add capacity on another coast
```
```spec
lesson: les-l10-04-two-carriers
level: L10
minutes: 12
prereq: les-l9-04-sell-transit
uses: tpl-l10-national-gateways
step: Connect two carriers to the national exchange
step: Send traffic between their customers
check: bgp | Both carriers have a session at the exchange | pass when both are established | Use the exchange addresses
```
```spec
lesson: les-l10-05-policy-effects
level: L10
minutes: 12
prereq: les-l10-03-national-drill
uses: tpl-l10-cables-and-cache
step: Add a rule that blocks one region
step: Read which services broke
step: Remove the rule and confirm recovery
check: noreach | With the rule the blocked region is unreachable | pass when ping to the region fails | Apply the rule on the gateway path
check: ping | Without the rule the region is reachable again | pass when ping succeeds | Remove the rule
```

### L10.12 Tests
Diversity checker on a shared route; cache effect on cable load; drill ends with expected survivors; policy rule effect; collapse of a province to a card and expand.

### L10.13 Indonesian terms
negara, gerbang internasional, stasiun pendaratan, kabel laut internasional, operator nasional, cache konten, ketahanan, simulasi darurat nasional.

### L10.14 Risks
This level touches policy. Keep it a neutral teaching model. No real country data in the product unless the user supplies it. No real-world targeting or attack instructions: drills are about resilience only.

---

## L11. Dunia (World)

### L11.1 Who and why
A curious learner, a student, a teacher showing how the internet connects the world. They care about the big picture: how a request crosses oceans, and what a cable cut means for everybody.

### L11.2 The real-world picture
The world is **regions** joined by **submarine cable systems**, **tier-1 carriers**, **big content networks**, and **root name servers** spread around. A request from one country passes through its exchange, an international cable, a far exchange, and a content server. Delay is bounded by distance and by the speed of light in fibre.

### L11.3 What the person builds
1. Six regions with a gateway each.
2. A cable map with a dozen systems.
3. A root name service with copies in several regions.
4. A content network with caches near each region.
5. A world drill: a major cable cut.

### L11.4 Components
| Component | Opens | Notes |
|---|---|---|
| Region | Collapsed country card list | |
| Cable system | Route, capacity, owners | |
| Tier-1 carrier | Backbone card | |
| Root name service | Copies and query rates | |
| Content network | Caches by region | |
| World clock and light-speed view | Shows minimum delay | |

### L11.5 Features
World flow model; minimum delay from distance; cable system map; root name service copies; content placement; world drill; the one-page "request journey" that shows a single request across all levels.

### L11.6 Failures
| Failure | Seen | Message |
|---|---|---|
| Major cable cut | Latency to a region rises | "Region B delay +90 ms; 3 of 7 cables left" |
| Content origin far away | Slow first load | "No cache in Region C; first byte 340 ms" |
| Root copy lost | Slightly slower names | "Root copies 12 of 13 sites" |
| Region isolated | Region offline | "Region D isolated: 0 usable cables" |

### L11.7 Today and gaps
Everything above packet mode is not built. The request journey is the key feature: it connects L1 to L11 in one story.

### L11.8 Zoom
Top of the ladder. Zoom in goes to any country, then province, and so on, down to the house.

### L11.9 Metrics
Cables up, minimum and actual delay by pair of regions, cache hit rate by region, drill result.

### L11.10 Templates
```spec
template: tpl-l11-world-map
level: L11
status: new
devices: region, region, region, region, region, region, cable-system, cable-system, cable-system
demo: ping region0 -> region5
```
```spec
template: tpl-l11-content-world
level: L11
status: new
devices: region, region, region, content-network, root-service
demo: http region0 -> http://www.example.lab/
```

### L11.11 Lessons
```spec
lesson: les-l11-01-light-speed
level: L11
minutes: 12
prereq: les-l10-01-cable-diversity
uses: tpl-l11-world-map
step: Pick two regions and read the minimum delay from distance
step: Read the real delay on the cable path
step: See why a ping to the other side of the world cannot be fast
check: latency | The measured delay is at least the minimum | pass when measured is at or above the minimum | Delay can never beat distance over light speed
```
```spec
lesson: les-l11-02-big-cable-cut
level: L11
minutes: 20
prereq: les-l10-03-national-drill
uses: tpl-l11-world-map
step: Cut the busiest cable system
step: Read which regions slowed down
step: Add capacity so no region rises above 150 ms
check: latency | No region is above 150 ms after the cut | pass when worst region delay is 150 or less | Add a cable on the affected route
```
```spec
lesson: les-l11-03-caches-near-users
level: L11
minutes: 15
prereq: les-l10-02-cache-saves-cables
uses: tpl-l11-content-world
step: Serve a page from a far origin
step: Put a cache in each region
step: Compare the first-byte time
check: latency | First byte drops below 100 ms in each region | pass when first byte is 100 or less in every region | Place a cache in each region
```
```spec
lesson: les-l11-04-name-service
level: L11
minutes: 12
prereq: les-l11-03-caches-near-users
uses: tpl-l11-content-world
step: Look at the copies of the root name service
step: Remove copies and watch name lookups slow
check: count | At least 5 copies remain | pass when 5 or more copies exist | Keep copies in several regions
```
```spec
lesson: les-l11-05-request-journey
level: L11
minutes: 25
prereq: les-l11-03-caches-near-users
uses: tpl-l11-content-world
step: Start at a phone in a house and open a page
step: Watch the request rise through the levels
step: Read the delay added at each level
step: Come back down the same path
check: latency | Every level adds a delay and the total is below 400 ms | pass when total delay is 400 or less | Use a cache to shorten the path
```

### L11.12 Tests
Minimum delay equals distance over light speed within a tolerance; cable cut changes delay as expected; the request journey visits one stage per level and the stage delays sum to the total; zoom from world to house and back loses nothing.

### L11.13 Indonesian terms
dunia, wilayah, sistem kabel, kecepatan cahaya, server nama akar, jaringan konten, perjalanan permintaan.

### L11.14 Risks
Scale and honesty: it is a teaching model, not a map of real infrastructure. Do not draw real cables as fact unless sourced. Never include instructions for harming real infrastructure.
---

# Part 3. The plan

## 3.1 Engine roadmap
1. **Fidelity first (L1 to L3).** Layer 3 switching, router DHCP pools, secure remote login, VPN handshake, port lights, ACL hit counters, queues.
2. **Collapse and node card (L2 to L6).** Group any network into one node. Expand back without loss. Node card computed from the engine, never typed by hand.
3. **Scale (L4, L5).** Engine runs 200 devices inside a time budget. Needs indexed lookups and event batching.
4. **Flow mode (L6 to L11).** Rates and capacities, not packets. A bridge summary turns packet-mode results into a flow input.
5. **Models (L2, L7 to L11).** Radio, queue, ring protection, power, light-speed delay, each small and honest.

## 3.2 New device kinds
`rtrw-gateway`, `sector-radio`, `client-radio`, `hotspot-ap`, `provider-link`, `switch-l3`, `firewall`, `wlc`, `load-balancer`, `access-concentrator`, `login-server`, `resolver`, `district-hub`, `city-exchange`, `hospital-site`, `government-site`, `camera-network`, `regency-hub`, `microwave-link`, `satellite-terminal`, `village-pop`, `backbone-pop`, `submarine-cable`, `internet-exchange`, `national-gateway`, `national-carrier`, `national-exchange`, `intl-cable`, `content-cache`, `region`, `cable-system`, `content-network`, `root-service`.
Rule: a new kind needs a window, a model and at least one check kind before it ships.

## 3.3 UI roadmap
Zoom control with breadcrumbs (World > Country > ... > House). Group and collapse on the canvas. Node card panel. Level badge on templates and lessons. A level filter in the Examples menu. Flow-mode toolbar with a traffic matrix editor. Map layer for L7 and up.

## 3.4 The end-to-end test with Bend
The test lives in `tests/ts/idea_scales.test.ts`.
1. Read `IDEA-scales.md` and parse every fenced `spec` block.
2. Check structure: eleven levels, each with at least 2 templates and 3 lessons; every lesson has steps and checks; check kinds are from the allowed list.
3. Check references: every `uses` names a template, every `prereq` names a lesson or `-`, no lesson depends on a later level, and no cycle exists.
4. Check the ladder: every level has a parent that reaches L11.
5. Build a Bend program from the parsed numbers (counts, levels, prerequisite depth). The program recomputes the same facts with its own recursion and prints `0` when they agree.
6. Run `bend <file>` on it and expect `0`. If `bend` is missing, the Bend step is skipped, the structural checks still run.
This is a model test, not a proof. When it fails, the failure message names the spec block and the line.

## 3.5 Staging
| Stage | Content | Exit |
|---|---|---|
| S1 | L1 fidelity, level badges, doc test | L1 lessons all pass by script |
| S2 | L3 fidelity, VPN, layer 3 switching | L3 lessons pass |
| S3 | Collapse and node card, L2 gateway | L2 lessons pass, collapse test passes |
| S4 | Scale to 200 devices, L4 and L5 | scale test in budget |
| S5 | Flow mode, L6 | BGP lessons pass |
| S6 | Models and maps, L7 to L9 | drills pass |
| S7 | L10 and L11, request journey | journey test passes |

## 3.6 Risks
Scope is large; ship by stage. Models can mislead; label each. Vendor look-alikes are forbidden; use our own names. Performance must be measured at each stage.

## 3.7 Glossary
**Level**: one rung of the ladder. **Collapse**: turn a group into one node. **Node card**: the summary a collapsed node shows. **Packet mode**: one packet at a time. **Flow mode**: rates and capacities. **Bridge**: summary from packet to flow. **Spec block**: the fenced block that holds a template or lesson. **Drill**: a scripted failure.

## 3.8 Acceptance criteria
1. This file parses and every reference resolves.
2. The Bend step prints `0`.
3. Each level has a template that loads and a lesson that a script can pass.
4. No vendor names appear in the product copy.
5. All existing suites still pass.

## 3.9 Decisions and the reason for each
| Decision | Reason |
|---|---|
| One ladder with zoom, not eleven separate tools | One mental model; lessons chain across levels |
| Flow mode starts at L6 | Packet-level detail is too heavy and too noisy above an ISP |
| Our own device names | No vendor look-alikes, per standing rule |
| Checks use a fixed kind list | A checker can verify each kind; no vague "proven" |
| Bend is a model test | Bend proves nothing about Rust; it checks the plan's own numbers |
| Existing templates and lessons keep their ids | No saved file or link breaks |
| Teaching models are labelled | Honesty about radio, ring and cable simplifications |
| Indonesian terms carried in every level | The first audience is Indonesian |
