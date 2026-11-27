import { expect, test } from "bun:test";
import { drawRacks } from "../../web/ts/mod/canvas/rack_draw.js";
import { layoutRacks } from "../../web/ts/mod/canvas/rack_layout.js";
import { Camera } from "../../web/ts/mod/canvas/camera.js";
function textRecorder() {
  const texts = [];
  const ctx = {
    canvas: { width: 800, height: 600 },
    fillStyle: "",
    strokeStyle: "",
    lineWidth: 1,
    font: "",
    textAlign: "left",
    clearRect() {},
    strokeRect() {},
    fillRect() {},
    beginPath() {},
    moveTo() {},
    lineTo() {},
    stroke() {},
    fill() {},
    arc() {},
    drawImage() {},
    fillText(text) {
      texts.push(text);
    }
  };
  return { ctx, texts };
}
var devices = [
  { id: "p1", name: "PC0", model: "PC-PT", kind: "pc" },
  { id: "r1", name: "Router0", model: "2911", kind: "router" },
  { id: "p2", name: "PC1", model: "PC-PT", kind: "pc" }
];
test("the rack view paints every rack label and every device name once", () => {
  const { ctx, texts } = textRecorder();
  drawRacks(ctx, layoutRacks(devices), new Camera({ x: 0, y: 0, zoom: 1 }), { selected: new Set(["r1"]) });
  for (const name of ["Routers (1)", "Workstations (2)"])
    expect(texts).toContain(name);
  for (const device of devices)
    expect(texts.filter((t) => t === device.name)).toHaveLength(1);
});
