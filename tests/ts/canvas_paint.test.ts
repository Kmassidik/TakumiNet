import { expect, test } from "bun:test";
import { drawScene, type Canvas2D } from "../../web/ts/canvas/draw";
import { packetAt } from "../../web/ts/canvas/packets";
import { Camera } from "../../web/ts/canvas/camera";
import { buildScene } from "../../web/ts/canvas/scene";

interface Paint {
  arcFills: string[];
  fills: string[];
  texts: string[];
  fonts: string[];
  textFills: string[];
  images: unknown[];
}

function paintRecorder(): { ctx: Canvas2D; paint: Paint } {
  const paint: Paint = { arcFills: [], fills: [], texts: [], fonts: [], textFills: [], images: [] };
  const ctx = {
    canvas: { width: 800, height: 600 },
    fillStyle: "#000",
    strokeStyle: "#000",
    lineWidth: 1,
    font: "",
    textAlign: "left",
    clearRect() {},
    strokeRect() {},
    fillRect() { paint.fills.push(ctx.fillStyle); },
    beginPath() {},
    moveTo() {},
    lineTo() {},
    stroke() {},
    setLineDash() {},
    fill() { paint.arcFills.push(ctx.fillStyle); },
    arc() {},
    fillText(text: string) { paint.texts.push(text); paint.fonts.push(ctx.font); paint.textFills.push(ctx.fillStyle); },
    strokeText() {},
    drawImage(image: unknown) { paint.images.push(image); },
  };
  return { ctx: ctx as unknown as Canvas2D, paint };
}

const cabled = {
  devices: [
    { id: "a", name: "PC0", model: "PC-PT", icon: "/pc.webp", x: 100, y: 100, ip: "", prefix: 0 },
    { id: "b", name: "Switch0", model: "2960", icon: "/sw.webp", x: 300, y: 100, ip: "", prefix: 0 },
  ],
  links: [{ a: "a", b: "b", aPort: "Fa0", bPort: "Fa0/1", aState: "green", bState: "amber", kind: "copper" }],
};

test("link LEDs take their colour from the port state", () => {
  const { ctx, paint } = paintRecorder();
  drawScene(ctx, buildScene(cabled), new Camera({ x: 0, y: 0, zoom: 1 }), { grid: false, width: 800, height: 600 });
  expect(paint.arcFills).toEqual(["#0a7a3d", "#c98a00"]);
});

test("the device label stack: semibold name, 10px muted kind line, 11px IP", () => {
  const { ctx, paint } = paintRecorder();
  const addressed = {
    devices: [{ id: "a", name: "PC0", model: "PC-PT", icon: "", x: 100, y: 100, ip: "10.0.0.2", prefix: 24 }],
    links: [],
  };
  drawScene(ctx, buildScene(addressed), new Camera({ x: 0, y: 0, zoom: 1 }), { grid: false, width: 800, height: 600 });
  const at = (text: string) => paint.texts.indexOf(text);
  expect(paint.fonts[at("PC0")]).toBe("600 12px sans-serif");
  expect(paint.textFills[at("PC0")]).toBe("#1b1f23");
  expect(paint.fonts[at("PC-PT")]).toBe("10px sans-serif");
  expect(paint.textFills[at("PC-PT")]).toBe("#667085");
  expect(paint.fonts[at("10.0.0.2/24")]).toBe("11px sans-serif");
});

test("port labels are 10px and muted", () => {
  const { ctx, paint } = paintRecorder();
  drawScene(ctx, buildScene(cabled), new Camera({ x: 0, y: 0, zoom: 1 }), { grid: false, width: 800, height: 600 });
  const at = paint.texts.indexOf("Fa0");
  expect(at).toBeGreaterThanOrEqual(0);
  expect(paint.fonts[at]).toBe("10px sans-serif");
  expect(paint.textFills[at]).toBe("#667085");
});

test("an empty workspace shows the mascot and the next step", () => {
  const { ctx, paint } = paintRecorder();
  const mascot = { mascot: true };
  drawScene(ctx, buildScene({ devices: [], links: [] }), new Camera({ x: 0, y: 0, zoom: 1 }), {
    grid: false,
    width: 800,
    height: 600,
    image: (src) => (src === "/art3d/mascot/sleep.webp" ? mascot : undefined),
    empty: { message: "No devices yet. Drop a device here to begin", mascot: "/art3d/mascot/sleep.webp" },
  });
  expect(paint.images).toEqual([mascot]);
  expect(paint.texts).toEqual(["No devices yet. Drop a device here to begin"]);
});

test("a packet is drawn in its protocol colour", () => {
  const { ctx, paint } = paintRecorder();
  drawScene(ctx, buildScene(cabled), new Camera({ x: 0, y: 0, zoom: 1 }), {
    grid: false,
    width: 800,
    height: 600,
    packets: [{ at: { x: 200, y: 100 }, color: "#e8590c" }],
  });
  expect(paint.arcFills.at(-1)).toBe("#e8590c");
  expect(paint.fills.slice(-2)).toEqual(["#ffffff", "#ffffff"]);
});

test("a packet moves at the playback speed and finishes after its last hop", () => {
  const points = [{ x: 100, y: 100 }, { x: 300, y: 100 }];
  expect(packetAt(points, 105, 210)).toEqual({ x: 200, y: 100 });
  expect(packetAt(points, 210, 210)).toBeNull();
});

test("notes are painted in their colour with their wrapped text", () => {
  const { ctx, paint } = paintRecorder();
  drawScene(ctx, buildScene({ devices: [], links: [] }), new Camera({ x: 0, y: 0, zoom: 1 }), {
    grid: false,
    width: 800,
    height: 600,
    notes: [{ id: "n1", x: 40, y: 50, color: "#c8f7c5", text: "Read me first" }],
  });
  expect(paint.texts).toContain("Read me first");
  expect(paint.fills).toContain("#c8f7c5");
});
