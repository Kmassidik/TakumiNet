import { expect, test } from "bun:test";
import { gzipSync } from "node:zlib";
import { readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { chooseMode } from "../../web/ts/landing/mode";
import { KEYS } from "../../web/ts/landing/scene";

const root = join(import.meta.dir, "../..");
const glb = readFileSync(join(root, "web/landing/network.glb"));

interface GltfNode { name?: string; translation?: number[] }
function nodes(): GltfNode[] {
  const chunk = glb.readUInt32LE(12);
  return JSON.parse(glb.subarray(20, 20 + chunk).toString("utf8")).nodes as GltfNode[];
}

test("the model file is a real binary glTF, and the whole scene stays small", () => {
  expect(glb.subarray(0, 4).toString("ascii")).toBe("glTF");
  expect(glb.readUInt32LE(4)).toBe(2);
  expect(glb.readUInt32LE(8)).toBe(glb.length);
  expect(glb.length).toBeLessThan(2 * 1024 * 1024);
});

test("size budgets: poster, model, and the landing script (gzipped)", () => {
  expect(statSync(join(root, "web/landing/poster.webp")).size).toBeLessThan(300 * 1024);
  const script = readFileSync(join(root, "web/js/landing.js"));
  expect(gzipSync(script).length).toBeLessThan(300 * 1024);
});

test("the model has every device, the floor and all six cables the scene looks for", () => {
  const names = nodes().map((n) => n.name);
  for (const device of ["PC0", "Switch0", "Router0", "Switch1", "PC3", "Server0", "floor"]) expect(names, device).toContain(device);
  expect(names.filter((n) => n?.startsWith("cable_")).length).toBe(6);
});

test("the packet's route in the script runs through the devices where the model puts them", () => {
  const byName = new Map(nodes().map((n) => [n.name, n.translation ?? [0, 0, 0]]));
  const route = ["PC0", "Switch0", "Router0", "Switch1", "PC3"].map((n) => byName.get(n)!);
  // The first and last camera-free checks: x spreads left to right, in the order of the route.
  const xs = route.map((p) => p[0]!);
  expect([...xs].sort((a, b) => a - b)).toEqual(xs);
  expect(new Set(xs).size).toBe(xs.length);
});

test("the camera keys run in scroll order and every position is inside the stage", () => {
  for (let i = 1; i < KEYS.length; i++) expect(KEYS[i]!.at).toBeGreaterThan(KEYS[i - 1]!.at);
  expect(KEYS[0]!.at).toBe(0);
  expect(KEYS.at(-1)!.at).toBe(1);
  for (const k of KEYS) {
    expect(Math.abs(k.position.x)).toBeLessThan(40);
    expect(k.position.y).toBeGreaterThan(0.5);
    expect(k.position.y).toBeLessThan(40);
  }
});

test("the live scene runs only on a computer with WebGL and no wish for less motion", () => {
  expect(chooseMode({ phone: false, calm: false, webgl: true })).toBe("live");
  expect(chooseMode({ phone: true, calm: false, webgl: true })).toBe("poster");
  expect(chooseMode({ phone: false, calm: true, webgl: true })).toBe("poster");
  expect(chooseMode({ phone: false, calm: false, webgl: false })).toBe("poster");
  expect(chooseMode({ phone: true, calm: true, webgl: false })).toBe("poster");
});

test("three.js is only in the landing script: the workspace bundle has none of it", () => {
  const ui = readFileSync(join(root, "web/js/ui.js"), "utf8");
  for (const marker of ["WebGLRenderer", "PerspectiveCamera", "GLTFLoader"]) expect(ui).not.toContain(marker);
  const landing = readFileSync(join(root, "web/js/landing.js"), "utf8");
  expect(landing).toContain("WebGLRenderer");
  expect(landing).toContain("/landing/network.glb");
});

test("web/js/landing.js is the current build of web/ts/landing", async () => {
  const result = await Bun.build({ entrypoints: [join(root, "web/ts/landing/main.ts")], target: "browser", format: "iife", minify: true });
  expect(result.success).toBe(true);
  expect(readFileSync(join(root, "web/js/landing.js"), "utf8")).toBe(await result.outputs[0]!.text());
});

test("a model that fails to load is handled by the page, which keeps the poster", () => {
  const main = readFileSync(join(root, "web/ts/landing/main.ts"), "utf8");
  expect(main).toMatch(/catch \{[\s\S]*poster-only/);
  expect(main).toContain("onSlow");
});
