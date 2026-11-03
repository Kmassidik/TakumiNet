#!/usr/bin/env python3
"""Cut every downloaded 3D sheet into web/art/3d/<group>/<name>.png and write MANIFEST.json.

    swiftc -O tools/cutout.swift -o /tmp/cutout
    python3 tools/build_art.py ~/Downloads /tmp/cutout

Sheets are found by the title ChatGPT gave the file. Each sheet lists its icon names in
reading order, so a sheet with fewer icons simply lists fewer names.
"""
import hashlib, json, subprocess, sys, tempfile
from pathlib import Path
from PIL import Image
from slice_sheets import COLS, ROWS, cells, slice_sheet, square_icon

ROOT = Path(__file__).resolve().parent.parent / "web" / "art" / "3d"

SHEETS = [  # (file title, group, icon names in reading order)
    ("Stylized 3D Network Device Collection", "devices", "router switch pc laptop server ap"),
    ("3D Network Office Device Icon Sheet", "devices", "hub wlc asa homerouter printer phone"),
    ("Retro Tech Icon Collection", "devices", "analogphone tv pda tablet cloud sniffer"),
    ("3D IoT and Networking Device Set", "devices", "plc thing ioe linksys cablemodem dsl"),
    ("Soft 3D Network Infrastructure Icon Sheet", "devices", "multiuser celltower ie2000 netcontroller meraki historian"),
    ("Isometric Ethernet Patch Panel", "devices", "patchpanel"),
    ("Glossy 3D Utility Icon Grid", "toolbar", "new open save print undo redo"),
    ("Glossy Teal Document and Magnifier Icons", "toolbar", "copy paste delete zoomin zoomout zoomreset"),
    ("Glossy Teal and Amber Utility Icons", "toolbar", "templates toolbox topology wizard challenge help"),
    ("Glossy 3D Compass, Nature, and Home Icons", "toolbar", "compass environment home"),
    ("Glossy Mail and App Icons", "toolbar", "simple complex grid"),
    ("Glossy 3D Media Control Icon Sheet", "sim", "reset play pause stepa back stepb"),
    ("Glossy Teal Fast-Forward Button", "sim", "fastforward"),
    ("Glossy 3D Cable Connector Collection", "cables", "straight cross console fiber phone coiled"),
    ("Glossy Coaxial and Circuit Cables", "cables", "coax usb"),
    ("Glossy 3D Networking Icon Grid", "groups", "routers switches hubs wireless security wan"),
    ("Glossy Firewall and IPv6 Icon Set", "groups", "notes firewall firewall6"),
    ("Glossy 3D Networking Icon Set", "apps", "nic dialup terminal cmd browser wireless"),
    ("Glossy 3D Network Security Icon Set", "apps", "vpn traffic netsearch voip email pppoe"),
    ("Connected Devices and Network Icons", "misc", "devices cable network"),
    ("Fluffy Network Mascot Pose Sheet", "mascot", "idle wave think happy error sleep"),
]


def check(name, icon):
    """Invariants every icon must satisfy; returns the visible-pixel fraction."""
    alpha = icon.getchannel("A")
    assert icon.size[0] == icon.size[1], f"{name}: not square"
    box = alpha.getbbox()
    assert box, f"{name}: empty"
    cx, cy = (box[0] + box[2]) / 2, (box[1] + box[3]) / 2
    assert abs(cx - icon.width / 2) <= 2 and abs(cy - icon.height / 2) <= 2, f"{name}: off centre"
    cover = sum(1 for a in alpha.tobytes() if a > 8) / (icon.width * icon.height)
    assert 0.08 < cover < 0.9, f"{name}: coverage {cover:.2f} looks wrong"
    return cover


def main(downloads, cutout):
    manifest, seen = [], set()
    for title, group, names in SHEETS:
        src = Path(downloads) / f"{title}.png"
        names = names.split()
        with tempfile.TemporaryDirectory() as tmp:
            cut = Path(tmp) / "cut.png"
            subprocess.run([cutout, str(src), str(cut)], check=True, capture_output=True)
            icons = slice_sheet(Image.open(cut).convert("RGBA"), names)
            for name, cell in zip(names, cells(Image.open(src).convert("RGBA"))):
                if name not in icons:  # sheet-wide cutout missed it: retry on the lone cell
                    cell_in, cell_out = Path(tmp) / "in.png", Path(tmp) / "out.png"
                    cell.save(cell_in)
                    subprocess.run([cutout, str(cell_in), str(cell_out)], check=True, capture_output=True)
                    icon = square_icon(Image.open(cell_out).convert("RGBA"))
                    if icon is not None:
                        icons[name] = icon
                        print("    retried alone:", name)
        assert sorted(icons) == sorted(names), f"{title}: got {sorted(icons)}, wanted {sorted(names)}"
        out = ROOT / group
        out.mkdir(parents=True, exist_ok=True)
        for name, icon in icons.items():
            assert (group, name) not in seen, f"duplicate {group}/{name}"
            seen.add((group, name))
            check(f"{group}/{name}", icon)
            icon.save(out / f"{name}.png", optimize=True)
        manifest.append({"source": title, "sha256": hashlib.sha256(src.read_bytes()).hexdigest()[:16],
                         "group": group, "icons": names, "grid": f"{COLS}x{ROWS}"})
        print(f"ok  {group:8} {title}")
    (ROOT / "MANIFEST.json").write_text(json.dumps({
        "generator": "ChatGPT image generation, prompts from CHATGPT.md (words only, no vendor art)",
        "background_removal": "tools/cutout.swift (macOS Vision)", "sheets": manifest}, indent=2) + "\n")
    print(len(seen), "icons")


if __name__ == "__main__":
    main(*sys.argv[1:3])
