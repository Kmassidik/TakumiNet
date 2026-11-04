import { createButton } from "./button";
import type { DocLike, ElementLike } from "./dom";
import { asText, el, errorOf, type Post } from "./kind_parts";

export interface PortPeer {
  id: string;
  name: string;
  port: string;
}

export interface PortInfo {
  name: string;
  ip: string | null;
  prefix: number;
  up: boolean;
  peer: PortPeer | null;
}

/* One /api/devices/ports payload, parsed; an error payload throws. */
export function parsePortsInfo(text: string): PortInfo[] {
  const parsed = JSON.parse(text) as Record<string, unknown>;
  const err = errorOf(parsed);
  if (err) throw new Error(err);
  const raw = Array.isArray(parsed["ports"]) ? (parsed["ports"] as Record<string, unknown>[]) : [];
  return raw.map((p) => {
    const peer = p["peer"] as Record<string, unknown> | null | undefined;
    return {
      name: asText(p["name"]),
      ip: typeof p["ip"] === "string" ? (p["ip"] as string) : null,
      prefix: Number(p["prefix"]) || 0,
      up: p["up"] !== false,
      peer: peer ? { id: asText(peer["id"]), name: asText(peer["name"]), port: asText(peer["port"]) } : null,
    };
  });
}

/* Green needs both ends of the story: administratively up and cabled. */
export function portDotClass(port: PortInfo): string {
  if (!port.up) return "port-dot is-down";
  return port.peer ? "port-dot is-up" : "port-dot is-idle";
}

export function portPeerText(port: PortInfo): string {
  return port.peer ? `connected to ${port.peer.name} ${port.peer.port}` : "free";
}

export interface PortsPanelDeps {
  deviceId: string;
  /* When given, each row carries an up/down toggle that posts through it. */
  post?: Post;
  /* Runs after a successful toggle, so the caller can reload the rows. */
  refresh?: () => void;
  /* Optional per-port annotation, such as a VLAN tag. */
  extra?: (name: string) => string | null;
}

function portRow(doc: DocLike, port: PortInfo, deps: PortsPanelDeps): ElementLike {
  const row = el(doc, "li", "kw-row port-row");
  const dot = el(doc, "span", portDotClass(port));
  dot.setAttribute("aria-hidden", "true");
  row.appendChild(dot);
  row.appendChild(el(doc, "span", "port-name", port.name));
  if (port.ip) row.appendChild(el(doc, "span", "port-addr", `${port.ip}/${port.prefix}`));
  const tag = deps.extra?.(port.name);
  if (tag) row.appendChild(el(doc, "span", "port-extra", tag));
  row.appendChild(el(doc, "span", port.peer ? "port-peer" : "port-peer is-free", portPeerText(port)));
  const post = deps.post;
  if (post) {
    row.appendChild(
      createButton(doc, {
        label: port.up ? "Shut down" : "Bring up",
        title: port.up ? `Shut down ${port.name}` : `Bring up ${port.name}`,
        className: "port-toggle",
        onClick: () => {
          const enc = encodeURIComponent;
          void post(`/api/devices/port?id=${enc(deps.deviceId)}&port=${enc(port.name)}&up=${port.up ? "0" : "1"}`)
            .then((res) => {
              if (typeof res["error"] !== "string") deps.refresh?.();
            })
            .catch(() => undefined);
        },
      }),
    );
  }
  return row;
}

/* One row per interface: state dot, name, address, far end and the toggle. */
export function renderPortsPanel(doc: DocLike, box: ElementLike, ports: readonly PortInfo[], deps: PortsPanelDeps): void {
  const list = el(doc, "ul", "kw-list port-list");
  for (const port of ports) list.appendChild(portRow(doc, port, deps));
  box.appendChild(list);
}
