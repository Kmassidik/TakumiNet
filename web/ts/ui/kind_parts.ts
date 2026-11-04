import { createButton } from "./button";
import type { DocLike, ElementLike } from "./dom";

export type Post = (path: string) => Promise<Record<string, unknown>>;
export type GetText = (path: string) => Promise<string>;

export interface KindDevice {
  id: string;
  name: string;
  kind: string;
  model?: string;
  /* Every DHCP pool this device serves, from the workspace snapshot. */
  pools?: PoolEntry[];
  /* Shared gateway memberships, from the workspace snapshot. */
  sharedGws?: SharedGwEntry[];
}

export interface PoolEntry {
  network: string;
  prefix: number;
  gateway?: string | null;
  dns?: string | null;
}

export interface SharedGwEntry {
  vip: string;
  priority: number;
  owner: boolean;
}

/* One field of a device inside a workspace reply, for refreshing a list
   after a change without a second request. */
export function deviceField(res: Record<string, unknown>, id: string, key: string): unknown {
  const devices = Array.isArray(res["devices"]) ? (res["devices"] as Record<string, unknown>[]) : [];
  return devices.find((d) => d["id"] === id)?.[key];
}

export interface PaletteEntry {
  label: string;
  blurb?: string;
}

export interface WorkspaceDevice {
  id: string;
  name: string;
  kind?: string;
  ip?: string | null;
}

export interface WorkspaceLink {
  a: string;
  aPort: string;
  b: string;
  bPort: string;
}

export interface KindWorkspace {
  devices?: WorkspaceDevice[];
  links?: WorkspaceLink[];
  palette?: PaletteEntry[];
}

/* "Router 300 — The everyday branch router: …", or "" when the palette does
   not know the model. */
export function modelBlurbLine(workspace: KindWorkspace, device: KindDevice): string {
  const blurb = workspace.palette?.find((p) => p.label === device.model)?.blurb;
  return blurb && device.model ? `${device.model} — ${blurb}` : "";
}

export type NoteState = "plain" | "loading" | "empty" | "error" | "ok";

export function el(doc: DocLike, tag: string, className: string, text?: string): ElementLike {
  const node = doc.createElement(tag);
  node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

export function note(doc: DocLike, state: NoteState, text: string): ElementLike {
  const p = el(doc, "p", `kw-note kw-${state}`, text);
  p.setAttribute("role", state === "error" ? "alert" : "status");
  return p;
}

export function rowList(doc: DocLike, items: readonly string[]): ElementLike {
  const list = el(doc, "ul", "kw-list");
  for (const item of items) list.appendChild(el(doc, "li", "kw-row", item));
  return list;
}

export function section(doc: DocLike, root: ElementLike, title: string): ElementLike {
  const wrap = el(doc, "section", "kw-section");
  wrap.appendChild(el(doc, "h3", "kw-heading", title));
  const body = el(doc, "div", "kw-section-body");
  wrap.appendChild(body);
  root.appendChild(wrap);
  return body;
}

/* A section whose contents come from the network: it shows "Loading…" first,
   lets `fill` replace that on success, and on any failure offers a retry that
   runs the same load again. */
export function asyncSection(
  doc: DocLike,
  root: ElementLike,
  title: string,
  errorText: string,
  fill: (box: ElementLike) => Promise<void>,
): Promise<void> {
  const box = section(doc, root, title);
  const run = async (): Promise<void> => {
    box.replaceChildren();
    box.appendChild(note(doc, "loading", "Loading…"));
    try {
      await fill(box);
    } catch {
      box.replaceChildren();
      box.appendChild(note(doc, "error", errorText));
      box.appendChild(createButton(doc, { label: "Try again", className: "kw-retry", onClick: () => void run() }));
    }
  };
  return run();
}

export function field(doc: DocLike, form: ElementLike, labelText: string, type = "text"): ElementLike {
  const label = el(doc, "label", "kw-field", labelText);
  const input = el(doc, "input", "kw-input");
  input.setAttribute("type", type);
  if (type === "number") input.setAttribute("min", "1");
  input.setAttribute("autocomplete", "off");
  input.setAttribute("spellcheck", "false");
  label.appendChild(input);
  form.appendChild(label);
  return input;
}

export function onEnter(input: ElementLike, action: () => void): void {
  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter") action();
  });
}

export function showOutcome(doc: DocLike, target: ElementLike, state: NoteState, text: string): void {
  target.replaceChildren();
  target.appendChild(note(doc, state, text));
}

export function records(res: Record<string, unknown>, key: string): Record<string, unknown>[] {
  const value = res[key];
  return Array.isArray(value) ? (value as Record<string, unknown>[]) : [];
}

export function asText(value: unknown): string {
  return typeof value === "string" ? value : value == null ? "" : String(value);
}

export function errorOf(res: Record<string, unknown>): string | null {
  return typeof res["error"] === "string" && res["error"] ? (res["error"] as string) : null;
}

/* Every cable end of one device, written out with the far end's name. */
export function linkEnds(workspace: KindWorkspace, id: string): string[] {
  const name = (deviceId: string): string =>
    workspace.devices?.find((d) => d.id === deviceId)?.name ?? deviceId;
  const ends: string[] = [];
  for (const link of workspace.links ?? []) {
    if (link.a === id) ends.push(`${link.aPort} to ${name(link.b)} ${link.bPort}`);
    else if (link.b === id) ends.push(`${link.bPort} to ${name(link.a)} ${link.aPort}`);
  }
  return ends;
}
