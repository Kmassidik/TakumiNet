import type { DocLike, ElementLike } from "./dom";
import { parsePortsInfo, renderPortsPanel } from "./ports_panel";
import {
  asText,
  asyncSection,
  el,
  errorOf,
  note,
  type GetText,
  type KindDevice,
  type Post,
} from "./kind_parts";

const enc = encodeURIComponent;

export interface VlanTag {
  vlan: string;
  trunk: boolean;
}

/* The saved workspace lists a <port …/> row only when something differs from
   the defaults, so a missing row means access VLAN 1. */
export function vlanTags(saved: string, deviceId: string): Map<string, VlanTag> {
  const pattern =
    /<port id="([^"]*)" name="([^"]*)" up="[^"]*" ip="[^"]*" prefix="[^"]*" vlan="([^"]*)" trunk="([^"]*)"/g;
  const tags = new Map<string, VlanTag>();
  for (const m of saved.matchAll(pattern)) {
    if (m[1] === deviceId) tags.set(m[2] ?? "", { vlan: m[3] ?? "1", trunk: m[4] === "1" });
  }
  return tags;
}

export function portTagText(tag: VlanTag | undefined): string {
  if (tag?.trunk) return "trunk";
  return `VLAN ${tag?.vlan ?? "1"}`;
}

function portsSection(doc: DocLike, root: ElementLike, device: KindDevice, getText: GetText, post: Post): Promise<void> {
  return asyncSection(doc, root, "Ports", "Could not load the ports.", async function fill(box): Promise<void> {
    const [portsText, saved] = await Promise.all([
      getText(`/api/devices/ports?id=${enc(device.id)}`),
      getText("/api/export"),
    ]);
    const ports = parsePortsInfo(portsText);
    const tags = vlanTags(saved, device.id);
    box.replaceChildren();
    if (ports.length === 0) box.appendChild(note(doc, "empty", "This switch has no ports."));
    else {
      renderPortsPanel(doc, box, ports, {
        deviceId: device.id,
        post,
        refresh: () => void fill(box),
        extra: (name) => portTagText(tags.get(name)),
      });
    }
  });
}

/* The terminal panel reaches the routing table over /api/cli, and a fresh
   session starts in user mode, so `en` runs first like the terminal does. */
function routesSection(doc: DocLike, root: ElementLike, device: KindDevice, post: Post): Promise<void> {
  return asyncSection(doc, root, "Routes", "Could not load the routes.", async (box) => {
    const en = await post(`/api/cli?id=${enc(device.id)}&line=en`);
    const enErr = errorOf(en);
    if (enErr) throw new Error(enErr);
    const res = await post(`/api/cli?id=${enc(device.id)}&line=${enc("show ip route")}`);
    const err = errorOf(res);
    if (err) throw new Error(err);
    const output = asText(res["output"]).trim();
    box.replaceChildren();
    if (!output) box.appendChild(note(doc, "empty", "No routes yet."));
    else box.appendChild(el(doc, "pre", "kw-mono", output));
  });
}

export function renderL3SwitchWindow(
  doc: DocLike,
  body: ElementLike,
  device: KindDevice,
  getText: GetText,
  post: Post,
): Promise<void> {
  body.replaceChildren();
  return Promise.all([
    portsSection(doc, body, device, getText, post),
    routesSection(doc, body, device, post),
  ]).then(() => undefined);
}
