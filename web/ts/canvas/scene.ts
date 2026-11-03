export interface DeviceInput {
  id: string;
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

export interface SceneLink extends LinkInput {
  a: string;
  b: string;
  from: SceneDevice;
  to: SceneDevice;
}

export interface Scene {
  devices: SceneDevice[];
  links: SceneLink[];
}

const BOX = { left: 36, top: 34, size: 72 };

export function buildScene(workspace: WorkspaceInput): Scene {
  const devices: SceneDevice[] = workspace.devices.map((d) => ({
    ...d,
    box: { x: d.x - BOX.left, y: d.y - BOX.top, w: BOX.size, h: BOX.size },
  }));
  const byId = new Map(devices.map((d) => [d.id, d]));
  const links: SceneLink[] = [];
  for (const link of workspace.links) {
    const from = byId.get(link.a);
    const to = byId.get(link.b);
    if (from && to) links.push({ ...link, from, to });
  }
  return { devices, links };
}
