# TakumiNet 3D art: brief for the image generator

This folder holds the 3D-style artwork. The pictures are made by an image
generator (Codex) from the prompts below; `tools/slice_sheets.py` cuts each
sheet into single icons. Nothing here is copied or derived from Cisco or any
third-party icon set.

## Hard rules

1. **Never give the generator a Cisco or Packet Tracer image, icon, screenshot
   or file as a reference.** Describe objects in words only.
2. Do not use the words "Cisco", "Packet Tracer" or any vendor model name in a
   prompt. Say "enterprise router", "managed switch", and so on.
3. One sheet = 6 icons in a **3 columns x 2 rows** grid, every cell the same
   size, 1536 x 1024 px total (each cell 512 x 512), reading order left to
   right, top row then bottom row.
4. No text, labels, numbers, borders, grid lines or watermarks in the picture.
5. Transparent background (PNG with alpha). If transparency is not possible,
   a flat pure `#00FF00` background.
6. After generating, add an entry to `MANIFEST.json` (sheet name, prompt,
   tool, date, who ran it).

## Shared style prefix (paste at the start of every sheet prompt)

> A sheet of 6 separate 3D icons in a 3 by 2 grid, each centered in its own
> equal square cell with empty space around it, nothing touching the cell
> edges. Soft rounded 3D, matte plastic and brushed aluminium, slightly
> toy-like and friendly. Three-quarter view from front-left and above, soft key
> light from the top left, gentle contact shadow under each object. One shared
> palette: blue-grey bodies, teal accents, warm amber status lights, off-white
> highlights. No text, no labels, no borders, no grid lines, no background
> (transparent). Every object fills about 80 percent of its cell and is
> drawn at the same scale and camera angle as the others.

## Sheet 1 (pilot): core devices

Append to the prefix, listing cells in order:

> Cell 1: a compact enterprise router, low flat chassis with a row of ports on
> the front and two small antennas-free vents.
> Cell 2: a 24-port managed network switch, flat rack-style body with two rows
> of small ports and tiny status lights.
> Cell 3: a desktop computer, boxy monitor on a stand with a keyboard in front
> and a small tower beside it.
> Cell 4: a laptop, open about 100 degrees, screen glowing softly, thin body.
> Cell 5: a tower server, tall narrow cabinet with three drive bays and a
> power light.
> Cell 6: a wireless access point, flat round disc with a small status ring,
> mounted slightly raised on a short base.

Output files after slicing: `router.webp switch.webp pc.webp laptop.webp
server.webp ap.webp` (256 px).

## Sheets still to request (after the pilot is approved)

| Sheet | Cells (in order) |
|---|---|
| 2 | hub, wlc, asa, homerouter, printer, phone |
| 3 | analogphone, tv, pda, tablet, cloud, sniffer |
| 4 | plc, thing, ioe, linksys, cablemodem, dsl |
| 5 | multiuser, celltower, ie2000, netcontroller, meraki, historian |
| 6 | patchpanel, plus 5 spare slots (per-model variants) |
| UI 1 to 5 | the 27 toolbar glyphs, 6 per sheet |
| UI 6 to 7 | the 8 simulation buttons |
| UI 8 to 9 | the 8 cable types |
| UI 10 to 12 | the 15 desktop-app icons |
| Mascot | fluffy creature, 6 poses: idle, wave, thinking, happy, error, sleeping |

## Acceptance (checked by the slicer)

- every cell non-empty, centered within 8 percent of the cell middle;
- corners fully transparent (no halo or leftover background);
- device icon under 40 KB, UI glyph under 8 KB after conversion;
- icon reads clearly at 32 px.
