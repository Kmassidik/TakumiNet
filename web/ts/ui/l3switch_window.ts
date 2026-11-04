import { createButton } from "./button";
import type { DocLike, ElementLike } from "./dom";
import { parsePortsInfo, renderPortsPanel } from "./ports_panel";
import {
  asText,
  asyncSection,
  deviceField,
  el,
  errorOf,
  field,
  note,
  onEnter,
  rowList,
  section,
  showOutcome,
  type GetText,
  type KindDevice,
  type Post,
  type SharedGwEntry,
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

export function sharedGwLine(g: SharedGwEntry): string {
  return `${g.vip} · priority ${g.priority}${g.owner ? " · answering now" : ""}`;
}

/* Membership in a shared (first-hop redundant) gateway address: the highest
   healthy priority answers for the address. */
function sharedGatewaySection(doc: DocLike, root: ElementLike, device: KindDevice, post: Post): void {
  const box = section(doc, root, "Shared gateway");
  const list = el(doc, "div", "kw-gw-list");
  const outcome = el(doc, "div", "kw-outcome");

  const render = (rows: SharedGwEntry[]): void => {
    list.replaceChildren();
    if (rows.length === 0) {
      list.appendChild(note(doc, "empty", "Not sharing any address."));
      return;
    }
    for (const g of rows) {
      const row = el(doc, "div", "kw-row");
      row.appendChild(el(doc, "span", "kw-row-text", sharedGwLine(g)));
      row.appendChild(createButton(doc, {
        label: "Leave",
        className: "kw-retry",
        onClick: () => void leave(g),
      }));
      list.appendChild(row);
    }
  };

  const applied = (res: Record<string, unknown>): void => {
    const rows = deviceField(res, device.id, "sharedGws");
    render(Array.isArray(rows) ? (rows as SharedGwEntry[]) : []);
  };

  const leave = async (g: SharedGwEntry): Promise<void> => {
    try {
      const res = await post(`/api/devices/sharedgw?id=${enc(device.id)}&vip=${enc(g.vip)}&remove=1`);
      const err = errorOf(res);
      if (err) showOutcome(doc, outcome, "error", err);
      else {
        showOutcome(doc, outcome, "ok", `Left the shared address ${g.vip}.`);
        applied(res);
      }
    } catch {
      showOutcome(doc, outcome, "error", "The request failed. Check the connection and try again.");
    }
  };

  render(device.sharedGws ?? []);
  box.appendChild(list);

  const form = el(doc, "div", "kw-form");
  const vip = field(doc, form, "Shared address");
  const priority = field(doc, form, "Priority", "number");
  const submit = (): void => void share();
  const share = async (): Promise<void> => {
    const address = vip.value.trim();
    if (!address || !priority.value.trim()) {
      showOutcome(doc, outcome, "error", "Type the shared address and a priority.");
      return;
    }
    try {
      const res = await post(`/api/devices/sharedgw?id=${enc(device.id)}&vip=${enc(address)}&priority=${enc(priority.value.trim())}`);
      const err = errorOf(res);
      if (err) showOutcome(doc, outcome, "error", err);
      else {
        showOutcome(doc, outcome, "ok", `Sharing ${address}.`);
        applied(res);
      }
    } catch {
      showOutcome(doc, outcome, "error", "The request failed. Check the connection and try again.");
    }
  };
  onEnter(vip, submit);
  onEnter(priority, submit);
  form.appendChild(createButton(doc, { label: "Share", className: "kw-submit", onClick: submit }));
  form.appendChild(outcome);
  box.appendChild(form);
}

export function renderL3SwitchWindow(
  doc: DocLike,
  body: ElementLike,
  device: KindDevice,
  getText: GetText,
  post: Post,
): Promise<void> {
  body.replaceChildren();
  const loads = [
    portsSection(doc, body, device, getText, post),
    routesSection(doc, body, device, post),
  ];
  sharedGatewaySection(doc, body, device, post);
  return Promise.all(loads).then(() => undefined);
}
