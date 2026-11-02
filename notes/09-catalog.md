# 09 — Device catalogue from `.ptd` templates (`catalog.rs`)

Status: landed 2026-11-01.

## Where the data came from

`templates/*.ptd` (89 files) are the same container as a `.pkt` save — the
`ptfile` pipeline decodes them without changes. Decoded, each one is XML:

```xml
<PACKETTRACER templateType="COMPONENT" subGroup="Switches">
  <VERSION>9.0.1.0000</VERSION>
  <NETWORK><DEVICES><DEVICE><ENGINE>
    <TYPE model="2960-24TT">Switch</TYPE>
    <NAME>2960 IOS15</NAME>
    <DESCRIPTION>2960 with IOS15 preinstalled</DESCRIPTION>
    <MODULE>… <SLOT>… </SLOT> …</MODULE>
    <OS_IMAGE>2960_15.0_SE4</OS_IMAGE>
  </ENGINE></DEVICE></DEVICES></NETWORK>
</PACKETTRACER>
```

`catalog::parse` reads: model label, engine type, name, description, OS image,
`subGroup`, and the number of `<SLOT>` entries (module capacity). No ports are
listed — port counts live in the binary's device tables, not in a template, so
the workspace keeps its per-kind defaults until those are extracted.

## Loaded

```
models: 63
kinds:  thing 52 · router 6 · switch 2 · hmi 1 · laptop 1 · pc 1
groups: Sensors 21 · Actuators 13 · Miscellaneous 8 · Industrial 5 …
```

`GET /api/catalog` serves the list; it is decoded once per process
(`LazyLock`).

Router/switch templates present: `2811 IOS12`, `2811 IOS15`, `2960 IOS12`,
`2960 IOS15`, plus card bundles (`1841_WIC_2T`, `2621XM_NM_2FE2W_2_WIC_2T`,
`2811_NM_ESW_161_2_WIC_2T`).

## Container gap (26 templates)

These failures are all IoT/home templates (`AC.ptd`, `Door.ptd`, `Light.ptd`,
`Siren.ptd`, …). They are **not** plain zlib, and none of the six key/nonce
candidates decrypts them — the EAX tag never verifies, so it is a different
container generation rather than a wrong key. Tracked as a follow-up task; the
catalogue skips them instead of failing the load.

`tests`: `parses_the_shipped_template_shape`, `template_container_round_trips`
(encrypt → decrypt → parse), `rejects_non_templates`, and
`loads_the_extracted_tree_when_present` (skips when `intake/` is absent).
