# 03 — Binary REA: what the app is made of

**Target:** `opt/pt/bin/PacketTracer` (ELF64, 105 MB, **not stripped**)
**Method:** `nm -C --defined-only` → 149,437 demangled symbols, deduplicated.
**Status:** inventory + API surface. No decompilation yet, no engine needed.

Symbol names are the product's own architecture. This is the map to port into
Rust — not guesses.

## Core classes

| Class | Methods | What it is |
|---|---|---|
| `CommandSet::Router` | 1,366 | IOS command tables per model/version |
| `CommandSet::Common` | 594 | shared CLI verbs |
| `CommandSet::Switch` | 442 | switch CLI |
| `CommandSet::ASA` | 351 | ASA CLI |
| `CommandSet::CTerminalLine` | 298 | the terminal emulator itself |
| `Port::CPort` | 307 | interface state machine |
| `Device::CDevice` | 248 | device object |
| `Ptmp::CPtmpBuffer` | 107 | typed serialization buffer |
| `Traffic::CFrameInstance` | 82 | a frame in flight |
| `CommandSet::Pc` | 98 | host CLI (ipconfig, ping, tracert) |
| `CommandSet::AP` | 74 | access point CLI |

## The save format (`Ptmp::CPtmpBuffer`)

A typed stream, not a text format:

```
convertToVariant(bool|char|short|int|long long|float|double|QString|QByteArray|
                 QUuid|CIpAddress|CMacAddress|CIpcData)
peekBool / peekByte / peekInt / peekFloat / peekDouble / peekIpAddress / peekData
getReadIndex / flushRead / extract / getRawBuffer / append
CPtmpBuffer(EPtmpBufferMode, EPtmpBufferEncoding)
```

So `.pkt` is: ordered typed fields, mode+encoding selected at construction, an
explicit read cursor. To decode a file we need (a) the field order the writers
use and (b) the encoding layer. Field order comes from the `File::*` classes.

> Note: the `Ptmp` namespace is **two things** — this buffer, and a network
> protocol (`CPtmpServer`, `CPtmpConnection`, `CAuthChallengeMsg`,
> `CAuthResponseMsg`). Do not conflate them.

## Device model (`Device::CDevice`)

Visible through getters/setters: coordinates (`getCenterXCoordinate`,
`getAreaLeftX`), `getCustomVars` / `addCustomVar(name, QVariant)`, `addPort`,
`addModule(module, slot, id)`, `addDeviceExternalAttributes`,
`getConsumptionPower`, `getClockSource`, `getCommandLine`,
`getCustomLogicalImage` / `getCustomPhysicalImage`, `addSound`.
Plus activity grading hooks: `checkComparatorTree_ID_PORTS`, `..._ID_CUSTOM_VARS`.

## CLI

`CommandSet::Router` is built from **36 static IOS tables**, named by model and
train: `make_1841_12_3()`, `make_1900_universal_security_15_1()`,
`make_8200_universal_security()`, `make_8340_universalk9()`, each with a
matching `_size()` — i.e. the command text lives in `.rodata` as fixed arrays.

`CTerminalLine` also carries: privilege levels (`getActivePrivilegeLevel`),
parser views (`CParserView`, `CParserViewManager`), AAA (`getAaaMethodListName`,
`getAuthCount`), telnet clients (`addTelnetClient`), and grading
(`doCustomGrading`).

## File layer (`File::*`)

`CFileManager` (28), `CFileSystem` (22), `CFileContent`, plus per-OS payloads:
`CIosFileContent` (24), `CASAFileContent` (27), `COvaFileContent` (31),
`CIosBundleFileContent` (27), `CIoxClientConfigFileContent` (29),
`CPaasFileContent` (25), `CTextFileContent` (20), `CVlanDatFileContent` (17).
Multi-user save/load has its own messages (`CMUSaveNetworkReqMsg`).

These are the read/write order definitions the `.pkt` uses — the next thing to
decompile.

## Port plan (Rust)

| Rust module | Source class | First milestone |
|---|---|---|
| `ptmodel::device` | `Device::CDevice` | name, model, coords, ports, modules |
| `ptmodel::port` | `Port::CPort` | ifIndex, type, mac, ip, admin/oper state |
| `ptio::ptmp` | `Ptmp::CPtmpBuffer` | typed reader/writer with cursor + encoding |
| `ptio::pkt` | `File::CFileManager` | open 299 sample `.pkt`, dump fields |
| `ptcli::terminal` | `CommandSet::CTerminalLine` | prompt, modes, history |
| `ptcli::ios` | `CommandSet::Router` | one table (`1841_12_3`) end to end |
| `ptsim::frame` | `Traffic::CFrameInstance` | Ethernet/ARP/ICMP |

## Open questions (need decompilation, not symbols)

1. `.pkt` header: first bytes are high entropy, file has no ASCII magic —
   compression? obfuscation? Find the writer in `File::CFileManager`.
2. Field order and version gates per device type.
3. How the 36 IOS tables are laid out in `.rodata` (offset, count, entry size).
4. Whether `CPtmpBuffer` encoding is a wire codec or on-disk codec (or both).
