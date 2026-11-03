import { expect, test } from "bun:test";
import { buildScene } from "../../web/ts/canvas/scene";
import { hitDevice } from "../../web/ts/canvas/hit";

function rng(seed: number) {
  let state = seed;
  return () => {
    state = (state * 1103515245 + 12345) & 0x7fffffff;
    return state / 0x7fffffff;
  };
}

const workspace = {
  devices: [
    { id: "a", name: "PC0", model: "PC-PT", icon: "/art3d/devices/pc.webp", x: 100, y: 100, ip: "10.0.0.2", prefix: 24 },
    { id: "b", name: "Switch0", model: "2960", icon: "/art3d/devices/switch.webp", x: 300, y: 100, ip: "", prefix: 0 },
  ],
  links: [{ a: "a", b: "b", aPort: "Fa0", bPort: "Fa0/1", aState: "green", bState: "green", kind: "copper" }],
};

test("L38 scene purity: the same workspace always builds the same scene and needs no DOM", () => {
  expect(typeof document).toBe("undefined");
  const first = JSON.stringify(buildScene(workspace));
  const second = JSON.stringify(buildScene(JSON.parse(JSON.stringify(workspace))));
  expect(second).toBe(first);
});

test("a link whose device is missing is dropped from the scene", () => {
  const scene = buildScene({ ...workspace, links: [{ ...workspace.links[0]!, b: "gone" }] });
  expect(scene.links).toHaveLength(0);
});

test("L36 hit-test matches a brute-force scan for 1000 random devices and points", () => {
  const next = rng(42);
  const devices = Array.from({ length: 1000 }, (_, i) => ({
    id: `d${i}`, name: `D${i}`, model: "PC-PT", icon: "", x: next() * 4000, y: next() * 4000, ip: "", prefix: 0,
  }));
  const scene = buildScene({ devices, links: [] });
  for (let i = 0; i < 1000; i++) {
    const p = { x: next() * 4000, y: next() * 4000 };
    const brute = scene.devices.findLast((d) => p.x >= d.box.x && p.x <= d.box.x + d.box.w && p.y >= d.box.y && p.y <= d.box.y + d.box.h);
    expect(hitDevice(scene, p)?.id ?? null).toBe(brute?.id ?? null);
  }
});
