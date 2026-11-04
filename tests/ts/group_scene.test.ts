import { expect, test } from "bun:test";
import { planGroups } from "../../web/ts/canvas/group_scene";
import { buildScene } from "../../web/ts/canvas/scene";
import { hitGroup } from "../../web/ts/canvas/hit";

const device = (id: string, x: number, y: number) => ({
  id, name: id.toUpperCase(), model: "PC-PT", icon: "/i.webp", x, y, ip: "", prefix: 0,
});
const link = (a: string, b: string) => ({ a, b, aPort: "Fa0", bPort: "Fa0/1", kind: "copper" });

const devices = [device("a", 100, 100), device("b", 300, 100), device("c", 500, 300)];
const group = { id: "group0", name: "Office", members: ["a", "b"], devices: 2, status: "up" };

test("grouped devices disappear and the group node sits at their average position", () => {
  const plan = planGroups(devices, [], [group]);
  expect(plan.devices.map((d) => d.id)).toEqual(["c"]);
  expect(plan.groups).toEqual([{ id: "group0", name: "Office", devices: 2, status: "up", x: 200, y: 100 }]);
});

test("a cable inside the group is not drawn; one that crosses the boundary re-ends at the group", () => {
  const plan = planGroups(devices, [link("a", "b"), link("b", "c")], [group]);
  expect(plan.links).toEqual([{ ...link("b", "c"), a: "group0" }]);
});

test("a cable between two different groups keeps both group ends", () => {
  const second = { id: "group1", name: "Lab", members: ["c"], devices: 1, status: "degraded" };
  const plan = planGroups(devices, [link("a", "c")], [group, second]);
  expect(plan.links).toEqual([{ ...link("a", "c"), a: "group0", b: "group1" }]);
});

test("a group whose members are all gone draws nothing", () => {
  const plan = planGroups([device("c", 500, 300)], [], [group]);
  expect(plan.groups).toEqual([]);
  expect(plan.devices.map((d) => d.id)).toEqual(["c"]);
});

test("ungrouped devices and cables pass through untouched", () => {
  const plan = planGroups(devices, [link("b", "c")], []);
  expect(plan.devices).toEqual(devices);
  expect(plan.links).toEqual([link("b", "c")]);
  expect(plan.groups).toEqual([]);
});

test("the scene gives the group node a box the pointer can hit, and its cable an anchor", () => {
  const scene = buildScene({ devices, links: [link("b", "c")], groups: [group] });
  expect(scene.devices.map((d) => d.id)).toEqual(["c"]);
  expect(hitGroup(scene, { x: 200, y: 100 })?.id).toBe("group0");
  expect(hitGroup(scene, { x: 500, y: 300 })).toBeNull();
  expect(scene.links[0]?.from.id).toBe("group0");
  expect(scene.links[0]?.to.id).toBe("c");
});
