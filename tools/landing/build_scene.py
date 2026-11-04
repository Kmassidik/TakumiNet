"""Builds the TakumiNet landing scene in Blender and exports it.

Run (no window):
  /Applications/Blender.app/Contents/MacOS/Blender --background --python tools/landing/build_scene.py -- web/landing

Writes web/landing/network.glb (the models, for three.js) and
web/landing/poster-raw.png (a still render, turned into the WebP poster by
tools/landing/make_poster.py). Every shape here is made from boxes, cylinders
and curves written in this file: nothing is copied from any vendor's product.
"""
import math
import os
import sys

import bmesh
import bpy
from mathutils import Vector

OUT = sys.argv[sys.argv.index("--") + 1] if "--" in sys.argv else "web/landing"
os.makedirs(OUT, exist_ok=True)

bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene

# ---------------------------------------------------------------- materials
def hex_rgb(h):
    h = h.lstrip("#")
    return tuple(int(h[i:i + 2], 16) / 255 for i in (0, 2, 4))

def srgb_to_linear(c):
    return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4

def material(name, color, metallic=0.0, roughness=0.5, emission=None, strength=0.0):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    bsdf = m.node_tree.nodes["Principled BSDF"]
    rgb = [srgb_to_linear(c) for c in hex_rgb(color)] + [1]
    bsdf.inputs["Base Color"].default_value = rgb
    bsdf.inputs["Metallic"].default_value = metallic
    bsdf.inputs["Roughness"].default_value = roughness
    if emission:
        bsdf.inputs["Emission Color"].default_value = [srgb_to_linear(c) for c in hex_rgb(emission)] + [1]
        bsdf.inputs["Emission Strength"].default_value = strength
    return m

BODY = material("body", "#1d2733", metallic=0.55, roughness=0.28)
SHELL = material("shell", "#2a3647", metallic=0.35, roughness=0.35)
DARK = material("dark", "#0b0f15", metallic=0.2, roughness=0.6)
TRIM = material("trim", "#4c8dff", metallic=0.2, roughness=0.3, emission="#4c8dff", strength=1.6)
LED = material("led", "#2ee59d", emission="#2ee59d", strength=6.0)
SCREEN = material("screen", "#0e2a4a", roughness=0.15, emission="#2f7bff", strength=1.1)
CABLE = material("cable", "#52d6ff", roughness=0.4, emission="#52d6ff", strength=2.2)
FLOOR = material("floor", "#0a0f17", metallic=0.35, roughness=0.34)

# ---------------------------------------------------------------- geometry
def add_mesh(name, bm, mat, parent):
    mesh = bpy.data.meshes.new(name)
    bm.to_mesh(mesh)
    bm.free()
    obj = bpy.data.objects.new(name, mesh)
    obj.data.materials.append(mat)
    obj.parent = parent
    bpy.context.collection.objects.link(obj)
    for poly in mesh.polygons:
        poly.use_smooth = True
    return obj

def box(name, size, loc, mat, parent, bevel=0.04, seg=3):
    bm = bmesh.new()
    bmesh.ops.create_cube(bm, size=1.0)
    bmesh.ops.scale(bm, vec=size, verts=bm.verts)
    if bevel > 0:
        bmesh.ops.bevel(bm, geom=list(bm.edges), offset=bevel, segments=seg, affect="EDGES")
    bmesh.ops.translate(bm, vec=loc, verts=bm.verts)
    return add_mesh(name, bm, mat, parent)

def cylinder(name, radius, depth, loc, mat, parent, rot=(0, 0, 0), seg=24):
    bm = bmesh.new()
    bmesh.ops.create_cone(bm, cap_ends=True, segments=seg, radius1=radius, radius2=radius, depth=depth)
    bmesh.ops.rotate(bm, cent=(0, 0, 0), matrix=__import__("mathutils").Euler(rot).to_matrix(), verts=bm.verts)
    bmesh.ops.translate(bm, vec=loc, verts=bm.verts)
    return add_mesh(name, bm, mat, parent)

def device(name, pos, yaw=0.0):
    e = bpy.data.objects.new(name, None)
    e.location = pos
    e.rotation_euler[2] = yaw
    bpy.context.collection.objects.link(e)
    return e

# Blender is Z-up; the exporter converts to Y-up. Devices sit on z = 0 (the floor).
def router(name, pos):
    d = device(name, pos)
    box(name + "_body", (1.9, 1.1, 0.34), (0, 0, 0.17), BODY, d, 0.07)
    box(name + "_cap", (1.7, 0.9, 0.06), (0, 0, 0.36), SHELL, d, 0.025)
    for i in range(6):
        box(f"{name}_led{i}", (0.07, 0.04, 0.03), (-0.55 + i * 0.22, -0.56, 0.2), LED, d, 0.01, 2)
    box(name + "_strip", (1.5, 0.03, 0.04), (0, -0.56, 0.08), TRIM, d, 0.01, 2)
    for side in (-1, 1):
        cylinder(f"{name}_ant{side}", 0.035, 0.9, (side * 0.75, 0.3, 0.8), DARK, d)
        cylinder(f"{name}_antcap{side}", 0.05, 0.08, (side * 0.75, 0.3, 1.27), TRIM, d)
    return d

def switch(name, pos):
    d = device(name, pos)
    box(name + "_body", (2.5, 0.95, 0.3), (0, 0, 0.15), BODY, d, 0.06)
    box(name + "_face", (2.3, 0.06, 0.2), (0, -0.48, 0.15), DARK, d, 0.02)
    for i in range(8):
        box(f"{name}_port{i}", (0.2, 0.05, 0.13), (-0.98 + i * 0.28, -0.5, 0.15), SHELL, d, 0.012, 2)
        box(f"{name}_pled{i}", (0.05, 0.03, 0.025), (-0.98 + i * 0.28, -0.52, 0.27), LED, d, 0.005, 2)
    box(name + "_strip", (2.3, 0.03, 0.035), (0, -0.49, 0.03), TRIM, d, 0.008, 2)
    return d

def computer(name, pos):
    d = device(name, pos)
    box(name + "_base", (0.9, 0.55, 0.05), (0, 0, 0.025), SHELL, d, 0.02)
    box(name + "_neck", (0.14, 0.12, 0.5), (0, 0.1, 0.3), BODY, d, 0.03)
    box(name + "_monitor", (1.5, 0.1, 0.95), (0, 0.1, 0.92), BODY, d, 0.05)
    box(name + "_screen", (1.36, 0.02, 0.8), (0, 0.04, 0.92), SCREEN, d, 0.01, 2)
    box(name + "_tower", (0.42, 0.72, 0.9), (1.2, 0, 0.45), BODY, d, 0.05)
    box(name + "_towerled", (0.04, 0.03, 0.04), (1.2, -0.37, 0.75), LED, d, 0.005, 2)
    box(name + "_towerstrip", (0.05, 0.03, 0.5), (1.07, -0.37, 0.4), TRIM, d, 0.008, 2)
    return d

def server(name, pos):
    d = device(name, pos)
    for i in range(4):
        box(f"{name}_unit{i}", (1.2, 0.95, 0.26), (0, 0, 0.14 + i * 0.3), BODY, d, 0.04)
        box(f"{name}_vent{i}", (0.9, 0.04, 0.09), (-0.05, -0.49, 0.14 + i * 0.3), DARK, d, 0.01, 2)
        box(f"{name}_sled{i}", (0.05, 0.03, 0.05), (0.5, -0.49, 0.14 + i * 0.3), LED, d, 0.005, 2)
    box(name + "_strip", (0.04, 0.03, 1.1), (-0.56, -0.49, 0.6), TRIM, d, 0.008, 2)
    return d

# ---------------------------------------------------------------- layout
LAYOUT = {
    "PC0": (computer, (-9.0, 3.0, 0.0)),
    "Switch0": (switch, (-4.5, 0.0, 0.0)),
    "Router0": (router, (0.0, -3.0, 0.0)),
    "Switch1": (switch, (4.5, 0.0, 0.0)),
    "PC3": (computer, (9.0, 3.0, 0.0)),
    "Server0": (server, (0.0, 3.2, 0.0)),
}
LINKS = [("PC0", "Switch0"), ("Switch0", "Router0"), ("Router0", "Switch1"), ("Switch1", "PC3"), ("Switch0", "Server0"), ("Switch1", "Server0")]
objs = {}
for name, (builder, pos) in LAYOUT.items():
    objs[name] = builder(name, pos)

def cable(a, b):
    pa = Vector(LAYOUT[a][1]) + Vector((0, 0, 0.15))
    pb = Vector(LAYOUT[b][1]) + Vector((0, 0, 0.15))
    mid = (pa + pb) / 2 + Vector((0, 0, 0.0))
    curve = bpy.data.curves.new(f"cable_{a}_{b}", "CURVE")
    curve.dimensions = "3D"
    curve.bevel_depth = 0.045
    curve.bevel_resolution = 4
    sp = curve.splines.new("BEZIER")
    sp.bezier_points.add(1)
    for p, co in zip(sp.bezier_points, (pa, pb)):
        p.co = co
        p.handle_left_type = p.handle_right_type = "AUTO"
    # lay the cable on the floor with a small lift so it reads as a cable
    sp.bezier_points[0].co.z = 0.1
    sp.bezier_points[1].co.z = 0.1
    obj = bpy.data.objects.new(f"cable_{a}_{b}", curve)
    obj.data.materials.append(CABLE)
    bpy.context.collection.objects.link(obj)
    return obj

for a, b in LINKS:
    cable(a, b)

# floor: a wide dark disc
bm = bmesh.new()
bmesh.ops.create_cone(bm, cap_ends=True, segments=96, radius1=26, radius2=26, depth=0.1)
bmesh.ops.translate(bm, vec=(0, 0, -0.05), verts=bm.verts)
floor = add_mesh("floor", bm, FLOOR, None)
bpy.context.collection.objects.link(floor) if floor.name not in bpy.context.collection.objects else None

# ---------------------------------------------------------------- export
glb = os.path.join(OUT, "network.glb")
bpy.ops.export_scene.gltf(
    filepath=glb,
    export_format="GLB",
    export_apply=True,
    export_cameras=False,
    export_lights=False,
    export_yup=True,
)
print("WROTE", glb, os.path.getsize(glb))

# ---------------------------------------------------------------- poster render
world = bpy.data.worlds.new("world")
scene.world = world
world.use_nodes = True
bg = world.node_tree.nodes["Background"]
bg.inputs["Color"].default_value = [srgb_to_linear(c) for c in hex_rgb("#05080d")] + [1]
bg.inputs["Strength"].default_value = 1.0

def light(name, kind, loc, energy, color="#ffffff", size=4.0, aim=(0, 0, 0), specular=1.0):
    data = bpy.data.lights.new(name, kind)
    data.specular_factor = specular
    data.energy = energy
    data.color = [srgb_to_linear(c) for c in hex_rgb(color)]
    if kind == "AREA":
        data.size = size
    obj = bpy.data.objects.new(name, data)
    obj.location = loc
    direction = Vector(aim) - Vector(loc)
    obj.rotation_euler = direction.to_track_quat("-Z", "Y").to_euler()
    bpy.context.collection.objects.link(obj)

light("top", "AREA", (0, 0, 14), 3200, "#cfe0ff", 22, specular=0.15)
light("key", "AREA", (-10, -12, 8), 2600, "#bcd4ff", 8)
light("rim", "AREA", (10, 10, 5), 1400, "#ff9a5c", 4, specular=0.0)
light("fill", "AREA", (0, -16, 3), 900, "#6aa8ff", 10)

# the packet, placed between Switch0 and Router0
packet_pos = Vector((-2.3, -1.45, 0.5))
bm = bmesh.new()
bmesh.ops.create_uvsphere(bm, u_segments=32, v_segments=16, radius=0.34)
bmesh.ops.translate(bm, vec=packet_pos, verts=bm.verts)
PACKET = material("packet", "#ff6a1f", emission="#ff6a1f", strength=14.0)
add_mesh("packet", bm, PACKET, None)
bpy.context.collection.objects.link(bpy.data.objects["packet"]) if "packet" not in bpy.context.collection.objects else None

cam_data = bpy.data.cameras.new("cam")
cam_data.lens = 30
cam_data.shift_x = -0.1
cam = bpy.data.objects.new("cam", cam_data)
cam.location = (-2.0, -17.0, 9.5)
cam.rotation_euler = (Vector((0, 0.2, 0.5)) - cam.location).to_track_quat("-Z", "Y").to_euler()
bpy.context.collection.objects.link(cam)
scene.camera = cam

scene.render.engine = "BLENDER_EEVEE"
scene.render.resolution_x = 1920
scene.render.resolution_y = 1080
scene.render.image_settings.file_format = "PNG"
scene.render.filepath = os.path.join(OUT, "poster-raw.png")
try:
    scene.eevee.taa_render_samples = 96
except Exception as exc:  # property names differ between Blender versions
    print("eevee samples not set:", exc)
scene.view_settings.view_transform = "AgX"
bpy.ops.render.render(write_still=True)
print("RENDERED", scene.render.filepath)
