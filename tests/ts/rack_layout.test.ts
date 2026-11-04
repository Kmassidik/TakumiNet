import { expect, test } from "bun:test";
import { layoutRacks, hitRackBox, KIND_ORDER } from "../../web/ts/canvas/rack_layout";

const devices = [
  { id: "p1", name: "PC0", model: "PC-PT", kind: "pc" },
  { id: "r1", name: "Router0", model: "2911", kind: "router" },
  { id: "s1", name: "Switch0", model: "2960", kind: "switch" },
  { id: "p2", name: "PC1", model: "PC-PT", kind: "pc" },
  { id: "x1", name: "Gadget", model: "X", kind: "gizmo" },
];

test("every device gets exactly one box", () => {
  const layout = layoutRacks(devices);
  const placed = layout.racks.flatMap((r) => r.boxes.map((b) => b.device.id)).sort();
  expect(placed).toEqual(devices.map((d) => d.id).sort());
});

test("racks follow the kind order, unknown kinds last", () => {
  const layout = layoutRacks(devices);
  const kinds = layout.racks.map((r) => r.kind);
  expect(kinds).toEqual(["router", "switch", "pc", "gizmo"]);
  expect(KIND_ORDER.indexOf("router")).toBeLessThan(KIND_ORDER.indexOf("switch"));
});

test("boxes never overlap, inside a rack or between racks", () => {
  const layout = layoutRacks(devices);
  const boxes = layout.racks.flatMap((r) => r.boxes.map((b) => b.rect));
  for (let i = 0; i < boxes.length; i++) {
    for (let j = i + 1; j < boxes.length; j++) {
      const a = boxes[i]!;
      const b = boxes[j]!;
      const apart = a.x + a.w <= b.x || b.x + b.w <= a.x || a.y + a.h <= b.y || b.y + b.h <= a.y;
      expect(apart).toBe(true);
    }
  }
});

test("a point inside a box returns that device; outside returns null", () => {
  const layout = layoutRacks(devices);
  const box = layout.racks[0]!.boxes[0]!;
  expect(hitRackBox(layout, { x: box.rect.x + 2, y: box.rect.y + 2 })?.id).toBe(box.device.id);
  expect(hitRackBox(layout, { x: -500, y: -500 })).toBeNull();
});

test("an empty workspace has no racks", () => {
  expect(layoutRacks([]).racks).toHaveLength(0);
});
