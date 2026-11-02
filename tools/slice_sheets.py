#!/usr/bin/env python3
"""Cut a 3x2 sprite sheet (already background-free) into one square PNG per icon.

    swiftc -O tools/cutout.swift -o /tmp/cutout      # once, macOS only
    /tmp/cutout sheet.png cut.png                    # remove the background
    python3 tools/slice_sheets.py cut.png web/art/3d router switch pc laptop server ap

Names are given in reading order (left to right, top to bottom); use `-` to skip a cell.
Each icon is cropped to its visible pixels and centred on a transparent SIZE x SIZE square.
"""
import sys
from pathlib import Path
from PIL import Image

COLS, ROWS, SIZE, PAD = 3, 2, 512, 24


def cells(sheet):
    w, h = sheet.size
    for r in range(ROWS):
        for c in range(COLS):
            yield sheet.crop((c * w // COLS, r * h // ROWS, (c + 1) * w // COLS, (r + 1) * h // ROWS))


def square_icon(cell):
    box = cell.getchannel("A").point(lambda a: 255 if a > 8 else 0).getbbox()
    if box is None:
        return None
    icon = cell.crop(box)
    icon.thumbnail((SIZE - 2 * PAD, SIZE - 2 * PAD), Image.LANCZOS)
    out = Image.new("RGBA", (SIZE, SIZE))
    out.paste(icon, ((SIZE - icon.width) // 2, (SIZE - icon.height) // 2))
    return out


def slice_sheet(sheet, names):
    """Returns {name: image} for every named, non-empty cell."""
    icons = {}
    for name, cell in zip(names, cells(sheet)):
        icon = None if name == "-" else square_icon(cell)
        if icon is not None:
            icons[name] = icon
    return icons


if __name__ == "__main__":
    src, dest, *names = sys.argv[1:]
    names += ["-"] * (COLS * ROWS - len(names))
    out_dir = Path(dest)
    out_dir.mkdir(parents=True, exist_ok=True)
    for name, icon in slice_sheet(Image.open(src).convert("RGBA"), names).items():
        icon.save(out_dir / f"{name}.png")
        print("wrote", out_dir / f"{name}.png")
