import { expect, test } from "bun:test";
import { gzipSync } from "node:zlib";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { chooseMode } from "../../web/ts/landing/mode";

const root = join(import.meta.dir, "../..");
const glb = readFileSync(join(root, "web/landing/takumi.glb"));

interface GltfNode { name?: string; children?: number[] }
function gltf(): { nodes: GltfNode[]; materials?: Array<{ name?: string }> } {
  const chunk = glb.readUInt32LE(12);
  return JSON.parse(glb.subarray(20, 20 + chunk).toString("utf8"));
}

test("the model file is a real binary glTF and stays small", () => {
  expect(glb.subarray(0, 4).toString("ascii")).toBe("glTF");
  expect(glb.readUInt32LE(4)).toBe(2);
  expect(glb.readUInt32LE(8)).toBe(glb.length);
  expect(glb.length).toBeLessThan(1024 * 1024);
});

test("size budget: the landing script is under 300 KB gzipped", () => {
  expect(gzipSync(readFileSync(join(root, "web/js/landing.js"))).length).toBeLessThan(300 * 1024);
});

test("the model has every moving part the page turns, and the fur materials it roughens", () => {
  const names = gltf().nodes.map((n) => n.name);
  for (const part of ["Takumi", "body", "head", "earL", "earR", "eyeL", "eyeR", "armL", "armR", "legL", "legR", "scarf"]) expect(names, part).toContain(part);
  const materials = (gltf().materials ?? []).map((m) => m.name);
  for (const m of ["fur", "fur_shade", "teal"]) expect(materials, m).toContain(m);
});

test("the eyes and ears are inside the head, so they turn with it", () => {
  const { nodes } = gltf();
  const head = nodes.find((n) => n.name === "head")!;
  const childNames = (head.children ?? []).map((i) => nodes[i]!.name);
  for (const part of ["earL", "earR", "eyeL", "eyeR"]) expect(childNames, part).toContain(part);
});

test("the live scene runs only on a computer with WebGL and no wish for less motion", () => {
  expect(chooseMode({ phone: false, calm: false, webgl: true })).toBe("live");
  expect(chooseMode({ phone: true, calm: false, webgl: true })).toBe("flat");
  expect(chooseMode({ phone: false, calm: true, webgl: true })).toBe("flat");
  expect(chooseMode({ phone: false, calm: false, webgl: false })).toBe("flat");
  expect(chooseMode({ phone: true, calm: true, webgl: false })).toBe("flat");
});

test("three.js is only in the landing script: the workspace bundle has none of it", () => {
  const ui = readFileSync(join(root, "web/js/ui.js"), "utf8");
  for (const marker of ["WebGLRenderer", "PerspectiveCamera", "GLTFLoader"]) expect(ui).not.toContain(marker);
  const landing = readFileSync(join(root, "web/js/landing.js"), "utf8");
  expect(landing).toContain("WebGLRenderer");
  expect(landing).toContain("/landing/takumi.glb");
});

test("web/js/landing.js is the current build of web/ts/landing", async () => {
  const result = await Bun.build({ entrypoints: [join(root, "web/ts/landing/main.ts")], target: "browser", format: "iife", minify: true });
  expect(result.success).toBe(true);
  expect(readFileSync(join(root, "web/js/landing.js"), "utf8")).toBe(await result.outputs[0]!.text());
});

test("a model that fails to load is handled by the page, which keeps the flat pictures", () => {
  const main = readFileSync(join(root, "web/ts/landing/main.ts"), "utf8");
  expect(main).toMatch(/catch \{[\s\S]*flat-only/);
  expect(main).toContain("onSlow");
});

test("the scene only asks for model parts that the model file has", () => {
  const scene = readFileSync(join(root, "web/ts/landing/scene.ts"), "utf8");
  const asked = scene.match(/const NODES = \[([^\]]+)\]/)![1]!.match(/"([A-Za-z]+)"/g)!.map((s) => s.replace(/"/g, ""));
  const have = gltf().nodes.map((n) => n.name);
  for (const name of asked) expect(have, name).toContain(name);
});
