# Device artwork

Original SVG icons for the topology device kinds used by pt-web. Every icon is
drawn on a 32x32 grid with a single `currentColor` stroke (no fill), so it
inherits text colour wherever it is inlined or referenced.

## Files

| File | Device kind | Description |
| --- | --- | --- |
| `router.svg` | router | Chassis with opposing in/out arrows above it. |
| `switch.svg` | switch | Port strip with four RJ-style ports. |
| `pc.svg` | pc | Monitor with stand and base. |
| `laptop.svg` | laptop | Screen over a trapezoid keyboard deck. |
| `server.svg` | server | Tall rack with three slats and status LEDs. |
| `printer.svg` | printer | Paper feed, body, and output tray. |
| `hub.svg` | hub | Central node fanned out to four corner ports. |
| `ap.svg` | ap | Access point base with two wireless arcs. |
| `wlc.svg` | wlc | Controller chassis with status LEDs and wireless arcs. |
| `asa.svg` | asa | Shield with firewall filter bars. |
| `phone.svg` | phone | Handset bar, screen line, and 2x3 keypad. |
| `analogphone.svg` | analogphone | Handset, coiled cord, and desk base. |
| `cloud.svg` | cloud | Outline cloud for WAN/Internet clouds. |
| `tv.svg` | tv | Wide screen on a two-leg stand. |
| `pda.svg` | pda | Handheld with screen and button row. |
| `tablet.svg` | tablet | Larger handheld with home button. |
| `sniffer.svg` | sniffer | Magnifier over packet bars. |
| `plc.svg` | plc | Four-module industrial controller rack. |
| `thing.svg` | thing | Pinned chip with a processor core. |
| `ioe.svg` | ioe | Globe for Internet-of-Everything endpoints. |
| `homerouter.svg` | homerouter | Home router with two antennas and LEDs. |

## Usage

Reference the file directly (`<img src="art/router.svg" alt="Router">`) or
inline the markup to inherit `currentColor` from surrounding CSS.

## Provenance

All artwork in this directory is original to this project: each icon was drawn
from scratch as plain geometric primitives for pt-web. None of it is copied,
traced, recoloured, or otherwise derived from Cisco Packet Tracer, Cisco's icon
libraries, or any other third-party asset set.
