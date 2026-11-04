import type { DocLike, ElementLike } from "./dom";
import {
  asText,
  asyncSection,
  el,
  note,
  rowList,
  type GetText,
  type KindDevice,
} from "./kind_parts";

interface PortRow {
  name: string;
  ip: string | null;
  prefix: number;
}

export function parsePortRows(text: string): PortRow[] {
  const parsed = JSON.parse(text) as Record<string, unknown>;
  if (typeof parsed["error"] === "string" && parsed["error"]) throw new Error(parsed["error"]);
  const raw = Array.isArray(parsed["ports"]) ? (parsed["ports"] as Record<string, unknown>[]) : [];
  return raw.map((p) => ({
    name: asText(p["name"]),
    ip: typeof p["ip"] === "string" ? (p["ip"] as string) : null,
    prefix: Number(p["prefix"]) || 0,
  }));
}

export function portText(port: PortRow): string {
  return port.ip ? `${port.name} — ${port.ip}/${port.prefix}` : `${port.name} — no address yet`;
}

export interface AclRule {
  num: string;
  permit: boolean;
  text: string;
}

/* The saved workspace keeps one <acl …/> row per ACE, attributes in the
   record order dev, num, action, src, swc, dip, dwc; "-" means any target. */
export function aclRules(saved: string, deviceId: string): AclRule[] {
  const pattern =
    /<acl dev="([^"]*)" num="([^"]*)" action="([^"]*)" src="([^"]*)" swc="([^"]*)" dip="([^"]*)" dwc="([^"]*)"/g;
  const rules: AclRule[] = [];
  for (const m of saved.matchAll(pattern)) {
    if (m[1] !== deviceId) continue;
    const target = m[6] === "-" ? "any" : `${m[6]} ${m[7]}`;
    rules.push({
      num: m[2] ?? "",
      permit: m[3] === "permit",
      text: `${m[2]} ${m[3]} ${m[4]} ${m[5]} to ${target}`,
    });
  }
  return rules;
}

function zonesSection(doc: DocLike, root: ElementLike, device: KindDevice, getText: GetText): Promise<void> {
  return asyncSection(doc, root, "Zones", "Could not load the ports.", async (box) => {
    const ports = parsePortRows(await getText(`/api/devices/ports?id=${encodeURIComponent(device.id)}`));
    box.replaceChildren();
    if (ports.length === 0) box.appendChild(note(doc, "empty", "This firewall has no ports."));
    else box.appendChild(rowList(doc, ports.map(portText)));
  });
}

function rulesSection(doc: DocLike, root: ElementLike, device: KindDevice, getText: GetText): Promise<void> {
  return asyncSection(doc, root, "Rules", "Could not load the rules.", async (box) => {
    const rules = aclRules(await getText("/api/export"), device.id);
    box.replaceChildren();
    if (rules.length === 0) {
      box.appendChild(note(doc, "empty", "No rules yet. Everything passes."));
      return;
    }
    const list = el(doc, "ul", "kw-list");
    for (const rule of rules) {
      list.appendChild(el(doc, "li", rule.permit ? "kw-row kw-permit" : "kw-row kw-deny", rule.text));
    }
    box.appendChild(list);
  });
}

export function renderFirewallWindow(
  doc: DocLike,
  body: ElementLike,
  device: KindDevice,
  getText: GetText,
): Promise<void> {
  body.replaceChildren();
  return Promise.all([
    zonesSection(doc, body, device, getText),
    rulesSection(doc, body, device, getText),
  ]).then(() => undefined);
}
