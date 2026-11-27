import { planGroups } from "./group_scene.js";

const BOX = { left: 36, top: 34, size: 72 };

function boxAt(x, y) {
  return { x: x - BOX.left, y: y - BOX.top, w: BOX.size, h: BOX.size };
}

export function buildScene(workspace) {
  const plan = planGroups(workspace.devices, workspace.links, workspace.groups ?? []);
  const devices = plan.devices.map((d) => ({ ...d, box: boxAt(d.x, d.y) }));
  const groups = plan.groups.map((g) => ({ ...g, box: boxAt(g.x, g.y) }));
  const byId = new Map(devices.map((d) => [d.id, d]));
  // A cable may end at a group node; it joins the map as a bare anchor point.
  for (const g of groups) {
    byId.set(g.id, {
      id: g.id, kind: "group", name: g.name, model: "", icon: "",
      x: g.x, y: g.y, ip: "", prefix: 0, box: g.box,
    });
  }
  const links = [];
  for (const link of plan.links) {
    const from = byId.get(link.a);
    const to = byId.get(link.b);
    if (from && to) links.push({ ...link, from, to });
  }
  return { devices, links, groups };
}
