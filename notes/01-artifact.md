# 01 — Artifact intake: Cisco Packet Tracer 9.0.1

**Date:** 2026-11-01
**Source:** `/home/kurnia/Downloads/CiscoPacketTracer_901_Ubuntu_64bit.deb`
**Extracted:** `intake/20261101-102334/` (gitignored)
**Status:** unpacked and inventoried. No code executed; no REA run yet.

---

## 1. Container chain

| Layer | Fact |
|---|---|
| `.deb` | 400,458,388 B, volume format 2.0 |
| sha256 | `3683dd87e779885372ae9a35c1a6e594d12f493e649e7c697408729c1459479b` |
| payload | **one file**: `opt/pt/packettracer.AppImage` (402,830,528 B) |
| AppImage | ELF runtime (193,728 B) + squashfs |
| squashfs | magic `hsqs` @ 193728, SquashFS 4.0, zlib, block 131072, 6868 inodes, `bytes_used` 402,653,490 |

No `dpkg-deb` on this host — extracted with `ar x` + `tar -xJf`, then the
squashfs with `7z x`. 7z refused one escaping symlink
(`opt/pt/bin/translations/qtwebengine_locales -> ../qtwebengine_locales`);
that link is simply absent, nothing else was lost.

Extracted tree: 825 MB under `opt/pt`, 3.7 MB under `usr`.

## 2. Main binary — the important part

`opt/pt/bin/PacketTracer`

| Property | Value |
|---|---|
| type | ELF64 PIE, x86-64, dynamically linked |
| size | 105,635,184 B |
| **stripped** | **NO** — `.symtab` 3,744,912 B (156,357 symbols) |
| debug info | `.debug_info`, `.debug_abbrev`, `.debug_line`, `.debug_str`, `.debug_loc`, `.debug_aranges` |
| toolkit | Qt **6.8.7** (GCC 11.4.0 release build) |
| build id | `6b425cb5abde5cdeed4adaf80965d2559f8564d0` |

Not stripped + full DWARF means class names, method names and structure are
recoverable directly — we are not guessing at a stripped blob.

### Linked Qt modules (toolkit tells us the architecture)

`Qt6WebEngineWidgets` / `Qt6WebEngineCore` (204 MB lib) + `Qt6WebChannel` +
`Qt6Qml`, `Qt6Quick`, `Qt6WebSockets`, `Qt6NetworkAuth`, `Qt6Sql`,
`Qt6Multimedia`, `Qt6TextToSpeech`, `Qt6Svg`, `Qt6PrintSupport`,
`Qt6Positioning`, `Qt6Core5Compat`, `libssl`/`libcrypto` 3.

**Read:** the GUI is Chromium/HTML; the C++ core talks to it over
WebChannel. That is exactly the split a web rebuild wants.

## 3. Internal architecture, from symbol namespaces

Top-level namespaces by defined function count (observed via `nm -C`):

| Namespace | Fns | Meaning |
|---|---|---|
| `Ipc` | 5,425 | IPC layer: `CIpcCall`, `CIpcCallMsg`, `CParser`, `CCepInstance` |
| `CommandSet` | 3,693 | device CLI: `CTerminalLine` (2,629), `Router` (1,344), `Switch` (442) |
| `Device` | 2,783 | `CDevice` (1,438), `CCiscoDevice` (336) |
| `io::swagger` | 2,790 | **Swagger/OpenAPI-generated server code** |
| `server::model` | 2,329 | server-side data model |
| `Ptmp::CPtmpBuffer` | 2,087 | `.pkt`/`.ptmp` serialization buffer |
| `Port` | 1,581 | `CPort`, `CRouterPort` (629) |
| `Traffic` | 997 | `CFrameInstance`, `CSignal` |
| `CryptoPP` | 1,559 | crypto library |
| `Ospf` / `Vpn` / `Netflow` / `Http` / `QoS` | 1,372 / 1,171 / 970 / 871 / 826 | protocol modules |
| `Dhcpv6` / `Dhcp` / `Eigrp` / `Aaa` / `Wireless` / `Capwap` / `Voip` | 752 / 752 / 550 / 529 / 527 / 516 / 680 | more protocol modules |

`server::api` + `io::swagger` + `Netcon::RestRequestInfo` mean the app already
has an HTTP/REST control surface, not just a GUI.

## 4. Shipped data (ground truth for the rebuild)

| Path | Content |
|---|---|
| `saves/` | **299** `.pkt` / `.pka` sample topologies in 6 curriculums (Networking, Infra Automation, Cybersecurity, IoT, Programming, Industrial/OT) |
| `templates/` | **89** `.ptd` device templates (`2811_IOS15.ptd`, `AC.ptd`, …) |
| `art/` | 34 dirs: `ComponentBox`, `DrawingTools`, `Cursors`, `IPPhone`, `IoE`, `MIBBrowser`, … |
| `font/CiscoFont` | 81,524,074 B |
| `Sounds/` | wav assets including `crickets.wav` |
| `languages/` | `default.ptl`, `default.ts`, `template.ts` |
| `extensions/` | 11: `MQTT` (broker+client `.pkp`), `LadderLogicRuntime`, `Marvel`, `ActivitySequencer` (14.9 MB `.pts`), `PTINTERNAL`, … |
| `plugins/` | `libptsaplayer.so` (14.1 MB), `libptbaplayer.so` (14.2 MB) |
| `help/default/` | `CLI_routerIOS.htm`, `CLI_switchIOS.htm`, `GUI_wrt300n.htm`, … + `IpcAPI/` = **2,743 files** of Doxygen for the Extensions API **8.1.0** |

`.pkt` and `.ptd` are **opaque binary** at offset 0 (no ASCII magic, high
entropy) — encrypted/compressed, produced by `Ptmp::CPtmpBuffer`. The 299
samples form a corpus for developing a parser.

## 5. Licensing (constrains the rebuild, not the study)

`license.txt` points at Cisco EULA + Packet Tracer SEULA. Shipping their
binary, art, fonts, `.pkt` samples or decompiled code in our web app is not
available to us. Behaviour, formats and interfaces we learn ourselves are fair
game; the assets get rebuilt from scratch.

## 6. What this means for the Rust rebuild

1. **UI split is already proven**: C++ core + Chromium front end over a bridge.
   Our `web/` + Rust server mirrors it.
2. **Domain model is readable, not guessed**: `Device::CDevice`,
   `Port::CPort`, `Traffic::CFrameInstance`, `Ptmp::CPtmpBuffer`.
3. **Persistence has a target**: reverse `CPtmpBuffer` against the 299 samples.
4. **CLI engine is a known component**: `CommandSet::CTerminalLine` (2,629 fns)
   is the IOS interpreter we must reproduce.
5. **Protocol modules are separable**: OSPF, EIGRP, DHCPv6, AAA, CAPWAP, VPN,
   Netflow, QoS each form their own namespace — natural crate boundaries.

## 7. Reproduction

```bash
./scripts/intake.sh ~/Downloads/CiscoPacketTracer_901_Ubuntu_64bit.deb
# then (7z has no offset support): slice the squashfs and unpack
A=intake/<stamp>/root/opt/pt/packettracer.AppImage
OFF=$(grep -abo hsqs "$A" | head -1 | cut -d: -f1)
tail -c +$((OFF+1)) "$A" > /tmp/pt.squashfs
7z x -y -otree /tmp/pt.squashfs
```
