# 02 — Asset coverage

**Date:** 2026-11-01
**Tree:** `intake/20261101-102334/appimage/opt/pt` (6,455 files, 811 MB)
**Measured:** referenced-by-code vs present-on-disk.

## Headline

| | |
|---|---|
| files served | 6,455 |
| files the UI actually uses | **71 (1.1%)** |
| art files present | 1,316 |
| art files used | 61 (27 toolbar + 28 ComponentBox/Logical + 6 simulation icons) |

Serving a file is not using it. Everything below the line is a *feature* that
does not exist yet, which is why the asset is unused.

## Coverage by family

| Family | Files | Used | What has to exist first |
|---|---|---|---|
| `art/Toolbar` | 84 | 27 | remaining buttons need real actions: print, undo/redo, drawing palette, custom device, clusters, activity wizard, challenge mode |
| `art/ComponentBox` | 185 | 28 | more device types in the catalogue (ASA variants, WLC, IoT, patch panels, wall mounts, cables) |
| `art/Workspace/Logical` | 83 | 10 | remaining kinds: 3560, WLC, sniffer, cluster, multiuser cloud, patch panels, cable icons |
| `art/PhysicalView` | 463 | 0 | **Physical view** — device front/back faces, cable routing, power |
| `art/RackView` | 79 | 0 | rack editor |
| `art/Workstation` | 63 | 0 | device desktop: IP config, command prompt, web browser, e-mail, IP phone |
| `art/Simulation` | 73 | 7 | play/pause/step/reset/ffw icons wired; PDU markers and animation still absent |
| `art/IoE` | 152 | 0 | IoT devices and components |
| `art/DrawingTools` + `Cursors` + `PLToolbox` | 38 | 0 | drawing overlay, shapes, cursors |
| `art/Background` + `Activity` | 17 | 0 | activity/background scenes |
| `art/Switches` | 30 | 0 | switch faceplates |
| `art/MIBBrowser` + `PDUInfo` + `userCreatedPDU` | 19 | 0 | SNMP MIB browser, PDU editor |
| `font/CiscoFont` | 1 (78 MB) | 0 | it is a **Qt binary resource bundle**, not a font file — needs an RCC parser before CSS can use it |
| `Sounds` | 43 | 8 | placement, connect, remove, error, control, tab sounds wired |
| `templates/*.ptd` | 95 | 0 | device templates in the palette |
| `saves/*.pkt` | 330 | 0 | File → Open (needs `Ptmp` decoding) |
| `help/` | 4,165 | 0 | in-app help, CLI reference |
| `languages/` | 3 | 0 | localisation |
| `extensions/` | 16 | 0 | extension host (MQTT, ladder logic, activity sequencer) |
| `plugins/` | 2 (27 MB) | 0 | PTSA/PTBA activity players |

## Order that unlocks the most assets per unit of work

1. **`font/CiscoFont`** — one line of CSS, changes the whole look. Cheapest win.
2. **`Sounds`** — wire click/select/error to a handful of wavs.
3. **`Workspace/Logical` + `ComponentBox` remainder** — pure catalogue work:
   add the missing kinds, they all render through the existing path.
4. **`PhysicalView` + `RackView`** — the Physical tab; the second-biggest visible
   feature after the CLI.
5. **`Workstation`** — device dialogs; needs the device model (IP config) first.
6. **`Simulation` + `PDUInfo`** — needs the packet engine.
7. **`saves/*.pkt`** — needs `Ptmp::CPtmpBuffer` reverse engineering.
8. **Rest** (IoE, help, languages, extensions, plugins) — elective.

Rule: never wire an asset just to "use it". If the feature is missing, the
asset stays unused and the count above is the honest progress bar.
