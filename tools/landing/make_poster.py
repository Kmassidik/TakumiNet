"""Turns the raw Blender render into the poster shown when WebGL is not used.

  python3 tools/landing/make_poster.py web/landing

Adds a soft bloom around the brightest pixels (the packet and the lights), then
writes poster.webp (1600 px wide) with cwebp.
"""
import subprocess
import sys

from PIL import Image, ImageChops, ImageFilter

out = sys.argv[1] if len(sys.argv) > 1 else "web/landing"
img = Image.open(f"{out}/poster-raw.png").convert("RGB")
bright = img.point(lambda v: max(0, v - 170) * 3)
glow = bright.filter(ImageFilter.GaussianBlur(26))
glow2 = bright.filter(ImageFilter.GaussianBlur(8))
img = ImageChops.add(img, glow)
img = ImageChops.add(img, glow2.point(lambda v: v // 2))
img = img.resize((1600, round(1600 * img.height / img.width)), Image.LANCZOS)
img.save(f"{out}/poster.png")
subprocess.run(["cwebp", "-q", "82", "-m", "6", f"{out}/poster.png", "-o", f"{out}/poster.webp"], check=True, capture_output=True)
print("poster.webp written")
