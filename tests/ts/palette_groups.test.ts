import { expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { CONNECTIONS, DEFAULT_GROUP, GROUP_KINDS, groupForKind, startGroup, tilesFor, type PaletteDevice } from "../../web/ts/ui/palette_groups";

const catalog = readFileSync(join(import.meta.dir, "../../src/workspace/palette.rs"), "utf8");
const rows = [...catalog.matchAll(/\("([^"]+)", "([^"]+)", "([a-z0-9]+)"\)/g)];
const palette: PaletteDevice[] = rows.slice(0, rows.findIndex((m) => m[1] === "Patch Panel") + 1).map((m) => ({ label: m[1]!, icon: `/art3d/${m[3]}.webp`, kind: m[3]! }));
const groupsSrc = readFileSync(join(import.meta.dir, "../../src/workspace/palette.rs"), "utf8");
const groupLabels = [...groupsSrc.slice(groupsSrc.indexOf("GROUPS")).matchAll(/\("([A-Za-z ]+)", "\/art3d/g)].map((m) => m[1]!);

test("the catalog is read from the engine source (sanity)", () => {
  expect(palette.length).toBe(47);
});

test("every device in the palette belongs to exactly one category", () => {
  for (const device of palette) {
    const owners = Object.entries(GROUP_KINDS).filter(([, kinds]) => kinds.includes(device.kind));
    expect(owners.length, `${device.label} (${device.kind})`).toBe(1);
  }
});

test("a category shows only its own devices, and together they cover the whole palette", () => {
  let total = 0;
  for (const group of Object.keys(GROUP_KINDS)) {
    const tiles = tilesFor(group, palette);
    total += tiles.length;
    for (const tile of tiles) expect(groupForKind(tile.kind)).toBe(group);
  }
  expect(total).toBe(palette.length);
});

test("the server's category list matches the one the page filters with", () => {
  expect(new Set(groupLabels)).toEqual(new Set(Object.keys(GROUP_KINDS)));
});

test("Connections holds cables, not devices, and an unknown category is empty", () => {
  expect(tilesFor(CONNECTIONS, palette)).toEqual([]);
  expect(tilesFor("Nope", palette)).toEqual([]);
  expect(tilesFor("Routers", [])).toEqual([]);
});

test("the page opens on a category that exists", () => {
  const labels = Object.keys(GROUP_KINDS);
  expect(startGroup(null, labels)).toBe(DEFAULT_GROUP);
  expect(startGroup("Routers", labels)).toBe("Routers");
  expect(startGroup("Gone", labels)).toBe(DEFAULT_GROUP);
  expect(startGroup(undefined, ["A", "B"])).toBe("A");
});
