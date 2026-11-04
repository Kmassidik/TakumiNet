"""Cuts Takumi's six poses out of the original pose sheet at 512 px for the landing page.

  swiftc -O tools/cutout.swift -o /tmp/cutout        # once, macOS only
  python3 tools/landing/cut_mascot.py "<Downloads>/Fluffy Network Mascot Pose Sheet.png" /tmp/cutout web/landing

The app icons in web/art/3d/mascot are 256 px; the landing page shows him much
bigger, so each pose is cut again from the same sheet at full size. Writes
web/landing/takumi-<pose>.webp for the four poses the page shows.

Optional trailing arguments change the output: a size in pixels (default 512),
a comma list of poses to keep (default the four landing ones), and a filename
prefix (default "takumi-"). The app icons come from the same sheet with
  python3 tools/landing/cut_mascot.py <sheet> /tmp/cutout web/art/3d/mascot 256 idle,wave,think,happy,error,sleep ""
"""
import subprocess
import sys
import tempfile
from pathlib import Path

from PIL import Image

POSES = "idle wave think happy error sleep".split()
COLS, ROWS, PAD = 3, 2, 16

sheet_path, cutout, out_dir = sys.argv[1], sys.argv[2], Path(sys.argv[3])
SIZE = int(sys.argv[4]) if len(sys.argv) > 4 else 512
KEEP = set(sys.argv[5].split(",")) if len(sys.argv) > 5 else {"idle", "wave", "think", "happy"}
PREFIX = sys.argv[6] if len(sys.argv) > 6 else "takumi-"
out_dir.mkdir(parents=True, exist_ok=True)
sheet = Image.open(sheet_path).convert("RGBA")
w, h = sheet.size
with tempfile.TemporaryDirectory() as tmp:
    for i, pose in enumerate(POSES):
        if pose not in KEEP:
            continue
        cell = sheet.crop(((i % COLS) * w // COLS, (i // COLS) * h // ROWS, (i % COLS + 1) * w // COLS, (i // COLS + 1) * h // ROWS))
        cell_in, cell_out = Path(tmp) / "in.png", Path(tmp) / "out.png"
        cell.save(cell_in)
        subprocess.run([cutout, str(cell_in), str(cell_out)], check=True, capture_output=True)
        cut = Image.open(cell_out).convert("RGBA")
        box = cut.getchannel("A").point(lambda a: 255 if a > 8 else 0).getbbox()
        assert box, f"{pose}: nothing left after the cut"
        art = cut.crop(box)
        art.thumbnail((SIZE - 2 * PAD, SIZE - 2 * PAD), Image.LANCZOS)
        icon = Image.new("RGBA", (SIZE, SIZE))
        icon.paste(art, ((SIZE - art.width) // 2, SIZE - PAD - art.height))  # feet on the bottom edge
        icon.save(out_dir / f"{PREFIX}{pose}.webp", "WEBP", quality=90, method=6)
        print("ok", pose, art.size)
