# 06 — Copying the UI, component by component

**Question answered:** what is needed to make our UI behave like the real one.

## The app ships its own copy source

| Source | Volume | Use |
|---|---|---|
| `languages/default.ts` (Qt translation source) | **499 dialogs, 10,598 strings** | exact labels, group titles, button text |
| `help/default/images/*` | **1,442 dialog screenshots** | exact layout, field order, control types |
| `help/default/*.htm` | 2,536 pages | flow + behaviour prose |
| `art/**` | 1,316 files | icons, cursors, backgrounds |
| `bin/PacketTracer` symbols | 149,437 | behaviour, command tables |

`intake/ui-catalog.tsv` (gitignored) holds `dialog<TAB>string` for the whole
translation catalog, ready to drive our labels.

## Method

1. Pick a dialog context, e.g. `CBaseWorkStationIPConfig`.
2. Read its strings from the TSV to get the exact vocabulary.
3. Find its screenshot by caption in the matching `config_*.htm` and copy the
   layout: group boxes, radio pairs, field order, disabled states.
4. Model the fields in Rust, expose them over the API, render, test.

## Done this pass — `IP Configuration`

Copied from `config_PCs_3.jpg` + the `CBaseWorkStationIPConfig` context:

- blue title bar, `Interface` selector
- `IP Configuration` group: DHCP/Static radios, IPv4 Address, Subnet Mask,
  Default Gateway, DNS Server
- `IPv6 Configuration` group: Automatic/Static radios, IPv6 Address + prefix,
  Link Local Address, Default Gateway, DNS Server
- `802.1X` group: Use 802.1X Security, Authentication (MD5), Username, Password

## Done this pass — device window (copied from `config_PCs_1.jpg`)

- Window titled with the device name, tabs
  `Physical | Config | Desktop | Programming | Attributes`, `Top` checkbox
- **Desktop**: 5-column icon grid on light blue, 15 apps with their real icons
  (`ipconfig`, `dialup`, `terminal`, `cmdprompt`, `browser`, `PCWireless`,
  `VPNdialup`, `trafficGenerator`, `mibbrowser`, `IPCommunicator`,
  `EmailClient`, `PPPoEDialer`, `TextEditor`, `IPv4Firewall`, `IPv6Firewall`)
- **IP Configuration** → the copied panel (IPv4/IPv6/802.1X)
- **Command Prompt** → working terminal: XP banner, `ipconfig`, `ping <ip>`,
  `cls`, `exit`; ping prints PT's reply lines + statistics and records a PDU
- **Physical** shows the device image, **Config** allows rename (Display Name),
  **Programming/Attributes** state they are unavailable for the model

## Not copied yet, in dependency order

1. **Desktop apps** — Web Browser, Terminal (console), Email, PC Wireless,
   VPN, Traffic Generator, MIB Browser, Firewall.
2. **Config tab** — full global/interface/routing settings.
3. **CLI** — `CommandSet::Router` tables, the real behaviour bulk.
