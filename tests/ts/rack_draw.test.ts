import { expect, test } from "bun:test";
import { drawRacks } from "../../web/ts/canvas/rack_draw";
import { layoutRacks } from "../../web/ts/canvas/rack_layout";
import { Camera } from "../../web/ts/canvas/camera";
import type { Canvas2D } from "../../web/ts/canvas/draw";

function textRecorder() {
  const texts: string[] = [];
  const ctx = {
    canvas: { width: 800, height: 600 },
    fillStyle: "", strokeStyle: "", lineWidth: 1, font: "", textAlign: "left",
    clearRect() {}, strokeRect() {}, fillRect() {}, beginPath() {}, moveTo() {}, lineTo() {},
    stroke() {}, fill() {}, arc() {}, drawImage() {},
    fillText(text: string) { texts.push(text); },
  };
  return { ctx: ctx as unknown as Canvas2D, texts };
}

const devices = [
  { id: "p1", name: "PC0", model: "PC-PT", kind: "pc" },
  { id: "r1", name: "Router0", model: "2911", kind: "router" },
  { id: "p2", name: "PC1", model: "PC-PT", kind: "pc" },
];

test("the rack view paints every rack label and every device name once", () => {
  const { ctx, texts } = textRecorder();
  drawRacks(ctx, layoutRacks(devices), new Camera({ x: 0, y: 0, zoom: 1 }), { selected: new Set(["r1"]) });
  for (const name of ["Routers (1)", "Workstations (2)"]) expect(texts).toContain(name);
  for (const device of devices) expect(texts.filter((t) => t === device.name)).toHaveLength(1);
});
