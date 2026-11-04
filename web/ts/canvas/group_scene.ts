import type { DeviceInput, LinkInput } from "./scene";

export interface GroupInput {
  id: string;
  name: string;
  members: string[];
  devices: number;
  status: string;
}

export interface GroupNode {
  id: string;
  name: string;
  devices: number;
  status: string;
  x: number;
  y: number;
}

export interface GroupPlan {
  devices: DeviceInput[];
  links: LinkInput[];
  groups: GroupNode[];
}

/* What the canvas draws once some devices are folded into groups: a grouped
   device and its internal cables disappear, a cable that crosses the boundary
   re-ends at the group node, and the group node sits at the average position
   of its members. A group whose members are all gone draws nothing. */
export function planGroups(
  devices: readonly DeviceInput[],
  links: readonly LinkInput[],
  groups: readonly GroupInput[],
): GroupPlan {
  const owner = new Map<string, string>();
  const nodes: GroupNode[] = [];
  for (const group of groups) {
    const members = devices.filter((d) => group.members.includes(d.id));
    if (!members.length) continue;
    nodes.push({
      id: group.id,
      name: group.name,
      devices: group.devices,
      status: group.status,
      x: members.reduce((sum, d) => sum + d.x, 0) / members.length,
      y: members.reduce((sum, d) => sum + d.y, 0) / members.length,
    });
    for (const member of members) owner.set(member.id, group.id);
  }
  const visible = devices.filter((d) => !owner.has(d.id));
  const drawn: LinkInput[] = [];
  for (const link of links) {
    const a = owner.get(link.a) ?? link.a;
    const b = owner.get(link.b) ?? link.b;
    if (a === b && (owner.has(link.a) || owner.has(link.b))) continue;
    drawn.push(a === link.a && b === link.b ? link : { ...link, a, b });
  }
  return { devices: visible, links: drawn, groups: nodes };
}
