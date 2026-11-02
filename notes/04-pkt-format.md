# 04 — `.pkt` / `.pka` container: decoded

**Status:** working decoder in Rust. Samples decode to XML.

## Format (PT 6.0+)

Four reversible stages, outermost first:

| # | Stage | Detail |
|---|---|---|
| 1 | reverse + position XOR | `out[n-1-i] = in[i] ^ ((n - i*n) & 0xff)` |
| 2 | Twofish-EAX decrypt | key `0x89 × 16`, nonce `0x10 × 16`, 16-byte tag appended |
| 3 | position XOR | `b[i] ^= (len - i) & 0xff` |
| 4 | zlib | prefixed by 4-byte big-endian uncompressed length |

PT 5.x used only stages 1–2 (no Twofish). Verified against the shipped samples.

The pipeline was publicly documented by Mirco De Zorzi (mircodz/pka2xml) and
reimplemented by jeamxn/cisco-pka-to-xml and others. Ours is an independent
Rust implementation (`src/ptfile.rs`) for interoperability with own files.

## Decoded payload

Plain XML, root `<PACKETTRACER5>`:

```xml
<PACKETTRACER5>
 <VERSION>7.3.1.0000</VERSION>
 <NETWORK>
  <DEVICES>
   <DEVICE>
    <ENGINE>
     <TYPE model="1941" customModel="">Router</TYPE>
     <NAME>DHCPv6Server</NAME>
     <SAVE_REF_ID>save-ref-id:2483605108001286938</SAVE_REF_ID>
     <SYS_NAME>DHCPv6Server</SYS_NAME>
     ...
```

Links reference devices by `SAVE_REF_ID`:

```xml
<LINK>
 <TYPE>eCopper</TYPE>
 <CABLE>
  <FROM>save-ref-id:2483605108001286938</FROM>
  <PORT>GigabitEthernet0/0</PORT>
  <TO>save-ref-id:9218371147420901171</TO>
  <PORT>GigabitEthernet0/0</PORT>
```

## Converter

`src/bin/pkt2rs.rs`:

```
pkt2rs file.pkt [out.rs]     # one file -> typed Rust
pkt2rs --xml file.pkt        # decoded XML on stdout
pkt2rs --all saves/ out/     # whole corpus
```

Emitted module: `DEVICES` (name, model), `LINKS` (from/to resolved to device
names, both ports, cable type), plus the verbatim XML as a const.

## Corpus result

```
pkt2rs --all saves/ generated/
converted 281 files, 18 failures
```

281 of 299 decode cleanly to XML. The 18 failures raise `EAX authentication
tag mismatch`; the alternate `0xBA`/`0xBE` key and every stage-order permutation
were tried without success. They are a **second container variant** (likely a
different writer/version), not a bug in the primary path. Listed as an open
question.

## Limits

- XML extraction is tag-scanning, not a full schema model: modules, configs and
  per-device state are in the XML const but not yet typed.
- Activity (`.pka`) grading trees are not interpreted.
- `.ptd` device templates decode with the same pipeline (asserted by the
  container format, not yet exercised).
