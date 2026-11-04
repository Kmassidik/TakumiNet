import { planGroups, type GroupInput, type GroupNode } from "./group_scene";

export interface DeviceInput {
  id: string;
  kind?: string;
  name: string;
  model: string;
  icon: string;
  x: number;
  y: number;
  ip: string;
  prefix: number;
}

export interface LinkInput {
  a: string;
  b: string;
  aPort: string;
  bPort: string;
  aState?: string;
  bState?: string;
  kind: string;
}

export interface WorkspaceInput {
  devices: DeviceInput[];
  links: LinkInput[];
  groups?: GroupInput[];
}

export interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface SceneDevice extends DeviceInput {
  box: Box;
}

export interface SceneGroup extends GroupNode {
  box: Box;
}

export interface SceneLink extends LinkInput {
  a: string;
  b: string;
  from: SceneDevice;
  to: SceneDevice;
}

export interface Scene {
  devices: SceneDevice[];
  links: SceneLink[];
  groups: SceneGroup[];
}

const BOX = { left: 36, top: 34, size: 72 };

function boxAt(x: number, y: number): Box {
  return { x: x - BOX.left, y: y - BOX.top, w: BOX.size, h: BOX.size };
}

export function buildScene(workspace: WorkspaceInput): Scene {
  const plan = planGroups(workspace.devices, workspace.links, workspace.groups ?? []);
  const devices: SceneDevice[] = plan.devices.map((d) => ({ ...d, box: boxAt(d.x, d.y) }));
  const groups: SceneGroup[] = plan.groups.map((g) => ({ ...g, box: boxAt(g.x, g.y) }));
  const byId = new Map<string, SceneDevice>(devices.map((d) => [d.id, d]));
  // A cable may end at a group node; it joins the map as a bare anchor point.
  for (const g of groups) {
    byId.set(g.id, {
      id: g.id, kind: "group", name: g.name, model: "", icon: "",
      x: g.x, y: g.y, ip: "", prefix: 0, box: g.box,
    });
  }
  const links: SceneLink[] = [];
  for (const link of plan.links) {
    const from = byId.get(link.a);
    const to = byId.get(link.b);
    if (from && to) links.push({ ...link, from, to });
  }
  return { devices, links, groups };
}
