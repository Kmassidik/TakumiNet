"""Builds Takumi, the TakumiNet mascot, as a 3D model in Blender and exports it.

  /Applications/Blender.app/Contents/MacOS/Blender --background --python tools/landing/build_takumi.py -- web/landing

Writes web/landing/takumi.glb (for three.js) and web/landing/takumi-front.png,
takumi-side.png (stills used to check the likeness). The character is built
only from spheres, boxes and curves written in this file, following the
mascot artwork in web/art/3d/mascot/: a round grey bear with teal ears, a
teal network-cable scarf that ends in a plug, pink cheeks and big dark eyes.

Moving parts are separate nodes whose pivot is the joint, so the page can wave
an arm, tilt the head and turn the eyes by rotating a node:
  Takumi > body, head > (earL, earR, eyeL, eyeR), armL, armR, legL, legR, scarf
"""
import math
import os
import sys

import bmesh
import bpy
from mathutils import Euler, Vector

OUT = sys.argv[sys.argv.index("--") + 1] if "--" in sys.argv else "web/landing"
os.makedirs(OUT, exist_ok=True)
bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene


def lin(c):
    return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4


def rgb(h):
    h = h.lstrip("#")
    return [lin(int(h[i:i + 2], 16) / 255) for i in (0, 2, 4)]


def material(name, color, rough=0.5, metallic=0.0, sheen=0.0, emit=None, strength=0.0, coat=0.0):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    b = m.node_tree.nodes["Principled BSDF"]
    b.inputs["Base Color"].default_value = rgb(color) + [1]
    b.inputs["Roughness"].default_value = rough
    b.inputs["Metallic"].default_value = metallic
    if sheen:
        b.inputs["Sheen Weight"].default_value = sheen
        b.inputs["Sheen Roughness"].default_value = 0.5
    if coat:
        b.inputs["Coat Weight"].default_value = coat
    if emit:
        b.inputs["Emission Color"].default_value = rgb(emit) + [1]
        b.inputs["Emission Strength"].default_value = strength
    return m


FUR = material("fur", "#c9ced6", rough=0.95, sheen=0.55)
FUR_SHADE = material("fur_shade", "#b4bac3", rough=0.95, sheen=0.4)
TEAL = material("teal", "#1fae8f", rough=0.5, coat=0.35)
TEAL_SOFT = material("teal_soft", "#2fbf9f", rough=0.8, sheen=0.3)
PAW = material("paw", "#6d7279", rough=0.85, sheen=0.3)
PINK = material("pink", "#f3bcae", rough=0.9)
EYE = material("eye", "#07090c", rough=0.12, coat=1.0)
SHINE = material("shine", "#ffffff", emit="#ffffff", strength=3.0)
NOSE = material("nose", "#22262c", rough=0.4)
GOLD = material("gold", "#f0c24a", rough=0.3, metallic=0.9)
MOUTH = material("mouth", "#c14a52", rough=0.6)


def empty(name, loc, parent=None):
    e = bpy.data.objects.new(name, None)
    e.location = loc
    if parent:
        e.parent = parent
    bpy.context.collection.objects.link(e)
    return e


def finish(name, bm, mat, parent, smooth=True):
    mesh = bpy.data.meshes.new(name)
    bm.to_mesh(mesh)
    bm.free()
    obj = bpy.data.objects.new(name, mesh)
    obj.data.materials.append(mat)
    obj.parent = parent
    bpy.context.collection.objects.link(obj)
    if smooth:
        for p in mesh.polygons:
            p.use_smooth = True
    return obj


def ball(name, center, radii, mat, parent, seg=40, rings=24, rot=(0, 0, 0)):
    """An ellipsoid. `center` is relative to the parent pivot."""
    bm = bmesh.new()
    bmesh.ops.create_uvsphere(bm, u_segments=seg, v_segments=rings, radius=1.0)
    bmesh.ops.scale(bm, vec=radii, verts=bm.verts)
    bmesh.ops.rotate(bm, cent=(0, 0, 0), matrix=Euler(rot).to_matrix(), verts=bm.verts)
    bmesh.ops.translate(bm, vec=center, verts=bm.verts)
    return finish(name, bm, mat, parent)


def tube(name, points, radius, mat, parent, res=10):
    curve = bpy.data.curves.new(name, "CURVE")
    curve.dimensions = "3D"
    curve.bevel_depth = radius
    curve.bevel_resolution = res
    curve.use_fill_caps = True
    sp = curve.splines.new("BEZIER")
    sp.bezier_points.add(len(points) - 1)
    for p, co in zip(sp.bezier_points, points):
        p.co = co
        p.handle_left_type = p.handle_right_type = "AUTO"
    obj = bpy.data.objects.new(name, curve)
    obj.data.materials.append(mat)
    obj.parent = parent
    bpy.context.collection.objects.link(obj)
    return obj


root = empty("Takumi", (0, 0, 0))

# ------------------------------------------------------------- body and legs
body = empty("body", (0, 0, 0), root)
ball("body_mesh", (0, 0, 0.78), (0.74, 0.66, 0.74), FUR, body)
ball("belly", (0, -0.1, 0.62), (0.52, 0.5, 0.5), FUR_SHADE, body)

for side, sx in (("L", -1), ("R", 1)):
    leg = empty(f"leg{side}", (sx * 0.34, -0.12, 0.3), root)
    ball(f"leg{side}_mesh", (0, 0, 0.0), (0.27, 0.3, 0.27), PAW, leg)

# ------------------------------------------------------------------- head
HEAD_PIVOT = (0, 0, 1.32)
head = empty("head", HEAD_PIVOT, root)
ball("head_mesh", (0, 0, 0.5), (0.9, 0.82, 0.8), FUR, head)
ball("muzzle", (0, -0.66, 0.34), (0.3, 0.22, 0.2), FUR, head)
# fur tuft on top
for i, (x, y, z, sx, sz) in enumerate([(-0.14, 0.0, 1.27, 0.14, 0.14), (0.04, 0.02, 1.3, 0.15, 0.17), (0.22, 0.04, 1.25, 0.12, 0.13)]):
    ball(f"tuft{i}", (x, y, z - 0.0), (sx, 0.09, sz), FUR, head, seg=16, rings=10, rot=(0, math.radians(20 - i * 20), 0))

for side, sx in (("L", -1), ("R", 1)):
    ear = empty(f"ear{side}", (sx * 0.64, 0.0, 1.02), head)
    ball(f"ear{side}_mesh", (0, 0, 0.0), (0.33, 0.22, 0.33), FUR, ear, seg=28, rings=16)
    ball(f"ear{side}_inner", (sx * -0.02, -0.17, 0.0), (0.23, 0.1, 0.23), TEAL_SOFT, ear, seg=24, rings=12)

for side, sx in (("L", -1), ("R", 1)):
    eye = empty(f"eye{side}", (sx * 0.3, -0.72, 0.55), head)
    ball(f"eye{side}_ring", (0, 0.05, 0), (0.17, 0.05, 0.17), TEAL, eye, seg=24, rings=12)
    ball(f"eye{side}_pupil", (0, -0.02, 0), (0.14, 0.08, 0.15), EYE, eye, seg=28, rings=16)
    ball(f"eye{side}_shine", (sx * 0.04, -0.09, 0.05), (0.04, 0.025, 0.04), SHINE, eye, seg=12, rings=8)
    ball(f"eye{side}_shine2", (sx * -0.04, -0.09, -0.05), (0.02, 0.015, 0.02), SHINE, eye, seg=10, rings=6)
    ball(f"cheek{side}", (sx * 0.52, -0.62, 0.28), (0.15, 0.06, 0.1), PINK, head, seg=20, rings=12, rot=(0, 0, math.radians(sx * 20)))

ball("nose", (0, -0.86, 0.4), (0.07, 0.05, 0.05), NOSE, head, seg=16, rings=10)
tube("mouth", [(-0.1, -0.84, 0.28), (0.0, -0.87, 0.22), (0.1, -0.84, 0.28)], 0.012, MOUTH, head, res=4)

# -------------------------------------------------------------------- arms
for side, sx in (("L", -1), ("R", 1)):
    arm = empty(f"arm{side}", (sx * 0.78, 0.0, 1.02), root)
    ball(f"arm{side}_mesh", (sx * 0.12, 0, -0.18), (0.2, 0.2, 0.36), FUR, arm, rot=(0, math.radians(sx * -18), 0))
    ball(f"arm{side}_paw", (sx * 0.2, 0, -0.5), (0.17, 0.17, 0.16), PAW, arm, seg=24, rings=14)
    ball(f"arm{side}_pad", (sx * 0.2, -0.13, -0.5), (0.08, 0.03, 0.07), PINK, arm, seg=16, rings=10)

# ------------------------------------------------- scarf: a cable with a plug
scarf = empty("scarf", (0, 0, 1.2), root)
ring = bpy.data.objects.new("scarf_ring", bpy.data.meshes.new("scarf_ring"))
bm = bmesh.new()
bmesh.ops.create_circle(bm, cap_ends=False, segments=48, radius=1.0)
bm.to_mesh(ring.data)
bm.free()
bpy.context.collection.objects.link(ring)
ring.parent = scarf
# three loops of cable around the neck
for i, (z, r) in enumerate([(0.06, 0.66), (-0.02, 0.7), (-0.1, 0.68)]):
    pts = []
    for k in range(0, 13):
        a = math.radians(-90 + k * 30 + i * 22)
        pts.append((math.cos(a) * r * 1.0, math.sin(a) * r * 0.9 - 0.04, z))
    tube(f"scarf_loop{i}", pts, 0.115, TEAL, scarf, res=8)
# the free end with its plug
tube("scarf_tail", [(0.2, -0.66, -0.02), (0.3, -0.7, -0.28), (0.34, -0.66, -0.55)], 0.1, TEAL, scarf, res=8)
plug = empty("plug", (0.34, -0.66, -0.7), scarf)
bm = bmesh.new()
bmesh.ops.create_cube(bm, size=1.0)
bmesh.ops.scale(bm, vec=(0.2, 0.14, 0.26), verts=bm.verts)
bmesh.ops.bevel(bm, geom=list(bm.edges), offset=0.02, segments=2, affect="EDGES")
finish("plug_body", bm, TEAL, plug)
bm = bmesh.new()
bmesh.ops.create_cube(bm, size=1.0)
bmesh.ops.scale(bm, vec=(0.15, 0.02, 0.12), verts=bm.verts)
bmesh.ops.translate(bm, vec=(0, -0.075, -0.06), verts=bm.verts)
finish("plug_gold", bm, GOLD, plug)

# ------------------------------------------------------------------ export
glb = os.path.join(OUT, "takumi.glb")
bpy.ops.export_scene.gltf(filepath=glb, export_format="GLB", export_apply=True, export_cameras=False, export_lights=False, export_yup=True)
print("WROTE", glb, os.path.getsize(glb))

# ------------------------------------------------------------ check renders
world = bpy.data.worlds.new("world")
scene.world = world
world.use_nodes = True
bg = world.node_tree.nodes["Background"]
bg.inputs["Color"].default_value = [1, 1, 1, 1]
bg.inputs["Strength"].default_value = 0.7

floor_bm = bmesh.new()
bmesh.ops.create_grid(floor_bm, x_segments=2, y_segments=2, size=8)
fl = finish("floor", floor_bm, material("floor", "#ffffff", rough=1.0), None, smooth=False)
bpy.context.collection.objects.link(fl) if fl.name not in bpy.context.collection.objects else None


def light(name, kind, loc, energy, size):
    d = bpy.data.lights.new(name, kind)
    d.energy = energy
    if kind == "AREA":
        d.size = size
    o = bpy.data.objects.new(name, d)
    o.location = loc
    o.rotation_euler = (Vector((0, 0, 1.2)) - Vector(loc)).to_track_quat("-Z", "Y").to_euler()
    bpy.context.collection.objects.link(o)


light("key", "AREA", (-3.5, -5.0, 5.5), 250, 4)
light("fill", "AREA", (4.5, -4.0, 2.5), 90, 5)
light("rim", "AREA", (0.5, 5.0, 4.0), 110, 3)

cam_data = bpy.data.cameras.new("cam")
cam_data.lens = 85
cam = bpy.data.objects.new("cam", cam_data)
bpy.context.collection.objects.link(cam)
scene.camera = cam
scene.render.engine = "BLENDER_EEVEE"
scene.render.resolution_x = 900
scene.render.resolution_y = 900
scene.view_settings.view_transform = "Standard"
try:
    scene.eevee.taa_render_samples = 64
except Exception as exc:
    print("samples:", exc)

for label, loc in (("front", (0, -9.0, 2.2)), ("side", (6.4, -6.4, 2.2))):
    cam.location = loc
    cam.rotation_euler = (Vector((0, 0, 1.35)) - Vector(loc)).to_track_quat("-Z", "Y").to_euler()
    scene.render.filepath = os.path.join(OUT, f"takumi-{label}.png")
    bpy.ops.render.render(write_still=True)
    print("RENDERED", scene.render.filepath)
