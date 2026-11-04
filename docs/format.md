# Takumi native XML format (`.xml`)

`.xml` is Takumi's writable, UTF-8 workspace format. Version 1 stores a
flat sequence of XML records beneath one `<takumi>` root. Each known record
uses attributes only; there is no significant text content in native records.

```xml
<takumi version="1">
  <device id="pc0" kind="pc" model="PC-PT" x="100" y="300"
          name="PC0" ip="192.168.1.10" prefix="24"/>
  <device id="pc1" kind="pc" model="PC-PT" x="400" y="300"
          name="PC1" ip="192.168.1.11" prefix="24"/>
  <link a="pc0" a_port="Fa0" b="pc1" b_port="Fa0" kind="eCross"/>
</takumi>
```

## Document schema

- The root is a non-self-closing `<takumi version="1">` element. Version `0`
  is accepted and migrated to version 1; newer versions are rejected rather
  than partially interpreted. Saving always writes version `1`.
- Known records are direct children of the root. Attribute names and record
  names are case-sensitive. Attributes may appear in any order; the tables
  below show the canonical save order.
- Empty optional strings are written as `attribute=""`. If a schema attribute
  is omitted, the loader supplies an empty value, but required identifiers,
  addresses, numbers, and references must still pass semantic validation.
- Boolean attributes use `0` for false and `1` for true. `prefix` values are
  IPv4 prefix lengths (or accepted subnet masks where the loader supports
  them); IPv6 records use IPv6 prefix lengths. Coordinates and metrics are
  numeric values without unit suffixes.
- `id`, `dev`, `client`, `server`, `router`, `phone`, `ap`, `wlc`, and similar
  owner attributes refer to device IDs. Interface attributes such as `name`,
  `a_port`, `b_port`, and `iface` refer to ports on those devices.
- XML escaping applies to every attribute: `&`, `<`, `>`, `"`, and `'` use the
  standard named entities. Tabs, carriage returns, and newlines are saved as
  `&#9;`, `&#13;`, and `&#10;`. Decimal and hexadecimal numeric character
  references are accepted on input.
- DTDs, entity definitions, and other `<!...>` declarations are forbidden.
  The parser rejects malformed tags, mismatched closing elements, trailing
  content, unsupported declarations, and unknown entity names.

## Record reference

### Topology, addressing, and lessons

| Element | Attributes in schema order | Meaning |
| --- | --- | --- |
| `device` | `id kind model x y name ip prefix` | Device identity, model, canvas position, and primary IPv4 address |
| `link` | `a a_port b b_port kind` | Cable between two device ports |
| `net` | `id gw dns` | Device IPv4 default gateway and DNS server |
| `route` | `id net prefix via admin_distance` | Device static IPv4 route |
| `port` | `id name up ip prefix vlan trunk dot1q bandwidth_kbps delay_us` | Interface state, addressing, switching, and link metrics |
| `v6` | `id auto addr prefix gw dns` | Device IPv6 automatic/manual addressing |
| `lesson` | `id title level minutes goal` | Guided-lesson metadata |
| `step` | `n text` | Ordered lesson instruction |
| `check` | `id kind from to url expect label` | Live lesson assertion and its displayed label |

Supported lesson-check kinds are `ping`, `ttl`, `mac-table`, `lease`, `http`,
`arp`, `nslookup`, and `route`. Cable kinds are `eCopper`, `eCross`, `eConsole`,
`eFiber`, `ePhone`, `eCoax`, `eSerial`, and `eIoT`, subject to the selected
device ports.

### Device configuration and switching

| Element | Attributes in schema order | Meaning |
| --- | --- | --- |
| `vlan` | `id vlan name` | Switch VLAN number and name |
| `pool` | `id network prefix gw dns` | DHCP pool owned by a server |
| `dhcpclient` | `id` | Device configured to request DHCP |
| `banner` | `id text` | Device login banner |
| `linepw` | `id pw` | Device terminal-line password |
| `dot1x` | `id enabled user pass` | Device 802.1X state and credentials |
| `power` | `id state` | Device power state (`0` is powered off) |
| `module` | `id slot model` | Installed expansion module |
| `portsec` | `dev iface max macs` | Switch-port security limit and learned/sticky MAC set |
| `channel` | `dev iface group mode` | EtherChannel membership and negotiation mode |
| `stpmode` | `dev mode` | Spanning-tree mode |
| `stppriority` | `dev vlan priority` | Per-VLAN spanning-tree priority |

### Services, security, and industrial state

| Element | Attributes in schema order | Meaning |
| --- | --- | --- |
| `dns` | `id name ip` | DNS A record on a server |
| `page` | `id body` | Server HTTP page body |
| `reserve` | `server client ip` | DHCP address reservation |
| `helper` | `router iface ip` | DHCP relay/helper address on a router interface |
| `mailuser` | `server user pass` | Mail account |
| `mail` | `server from to subject body read` | Stored message and read state |
| `tftp` | `server name content` | TFTP file |
| `ftp` | `server name content` | FTP file |
| `ntp` | `client server offset` | NTP client/server association and clock offset |
| `syslogon` | `device` | Enables syslog for a device |
| `syslog` | `device time severity text` | Stored syslog entry |
| `aaa` | `server user pass` | AAA user record |
| `acl` | `dev num action src swc dip dwc` | Extended ACL entry, including source/destination wildcards |
| `aclbind` | `dev iface num dir` | ACL binding to an interface and direction |
| `v6net` | `dev net` | Device IPv6 network statement |
| `inspect` | `dev` | Enables protocol inspection |
| `ips` | `dev proto` | Per-device intrusion-prevention protocol setting |
| `iot` | `dev addr value` | IoT register/value state |
| `ptp` | `slave master offset` | Precision Time Protocol association and offset |
| `prpon` | `dev` | Enables Parallel Redundancy Protocol state |

### Wireless, WAN, telephony, and routing

| Element | Attributes in schema order | Meaning |
| --- | --- | --- |
| `cell` | `client tower` | Cellular client/tower association |
| `wlan` | `wlc ssid psk security` | Wireless LAN definition on a controller |
| `portfwd` | `router outside target inside` | Home-router port forward to an inside device |
| `sharedgw` | `dev vip priority` | Shared gateway membership; the healthiest highest priority answers |
| `voucher` | `dev code minutes used` | Hotspot voucher on a gateway, `used` is the device that typed it or `-` |
| `demand` | `client mbit` | What a home pulls, for the queue model |
| `queue` | `dev user mbit` | Per-customer speed limit on a gateway |
| `qparent` | `dev mbit` | Whole-group speed limit on a gateway |
| `tunnel` | `dev peer key` | Site-to-site tunnel end on a router |
| `guestnet` | `wlc ssid` | Marks a wireless LAN as a guest network |
| `capwap` | `ap wlc` | Access-point/controller association |
| `wifi` | `client ssid wlc` | Wireless client WLAN selection |
| `vpn` | `client server user` | VPN client association |
| `pppoe` | `client server user` | PPPoE client association |
| `phone` | `phone cm ext` | Phone, call-manager, and extension assignment |
| `routing` | `dev proto process_id` | Dynamic routing protocol and process ID |
| `routenet` | `dev net prefix area` | Dynamic-routing network statement and area |
| `natrole` | `dev iface dir` | NAT inside/outside interface role |
| `natrule` | `dev num iface` | NAT rule and translated interface |

## Validation and recovery

A normal import is atomic: any XML or semantic error rejects the entire file
and leaves the current workspace unchanged. Device IDs must be unique, device
models and kinds must agree, IP addresses and prefixes must be valid, links
must name real compatible ports, and a port cannot have conflicting cable
occupancy. Lesson steps and checks are validated together. Duplicate IPv4
addresses on the same subnet produce warnings.

The browser's **Open anyway** recovery path may omit semantically damaged
records and report each omission. XML syntax errors, unsupported schema
versions, and resource-limit failures remain fatal and cannot be recovered.

Current parser limits are **8 MiB** per file, **20,000 XML records**, nesting
**depth 8**, and **2,000 devices**. These limits apply before a workspace is
replaced.

## Forward-compatible extensions

Unknown elements are retained, including their nested children, and written
back on save. Unknown attributes on known records are also retained and matched
to the same logical record on export. Do not use `v0`, `v1`, and similar
numeric `vN` attribute names for extensions: they are reserved for positional
compatibility fields.

Extensions should be placed under a distinct element name or attribute prefix.
Preservation is not a promise that Takumi simulates an unknown extension;
it prevents an unrelated editor round trip from silently discarding it.

The implementation is dependency-free: `src/storage/xml.rs` handles XML syntax
and escaping, while `src/workspace/tnet.rs` defines this record schema and its
validation. The previous `.ptw` tab-separated format is read-only compatibility
input and is never emitted by new saves or exports.
