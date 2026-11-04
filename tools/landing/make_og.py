"""Draws the two social-card pictures (1200 x 630) shown when a link to Takumi is shared.

  python3 tools/landing/make_og.py

Writes web/landing/og-en.png and og-id.png: Takumi the bear on a teal card, the
name, and one line saying what it is. Drawn here in code from the mascot picture
and a system font, so there is no stock artwork.
"""
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

WEB = Path(__file__).resolve().parents[2] / "web"
BOLD = "/System/Library/Fonts/Supplemental/Arial Bold.ttf"
REG = "/System/Library/Fonts/Supplemental/Arial.ttf"
TEAL, INK, WHITE = (47, 191, 159), (21, 25, 31), (255, 255, 255)
LINES = {
    "en": ("Takumi", ["A free network lab", "in your browser."], "No account. Works offline."),
    "id": ("Takumi", ["Lab jaringan gratis", "di browser."], "Tanpa akun. Bisa offline."),
}

for code, (name, tagline, small) in LINES.items():
    card = Image.new("RGB", (1200, 630), WHITE)
    d = ImageDraw.Draw(card)
    d.rounded_rectangle((30, 30, 1170, 600), radius=56, fill=TEAL)
    d.text((96, 118), name, font=ImageFont.truetype(BOLD, 150), fill=INK)
    for i, line in enumerate(tagline):
        d.text((100, 306 + i * 62), line, font=ImageFont.truetype(BOLD, 54), fill=INK)
    d.text((100, 474), small, font=ImageFont.truetype(REG, 34), fill=INK)
    bear = Image.open(WEB / "landing/takumi-idle.webp").convert("RGBA")
    bear = bear.resize((470, 470), Image.LANCZOS)
    card.paste(bear, (660, 96), bear)
    out = WEB / f"landing/og-{code}.png"
    card.save(out, optimize=True)
    print("wrote", out.name, out.stat().st_size // 1024, "KB")
