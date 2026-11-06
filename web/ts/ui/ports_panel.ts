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
  /* Ethernet only: the fixed speed and duplex ("auto" while negotiating),
     what the cable actually runs at, and what is wrong with it, if anything. */
  eth?: boolean;
  speed?: string;
  duplex?: string;
  link?: string;
  fault?: string;
  /* PoE state of the device on the far end, when it is a PoE device. */
  poe?: { capable: boolean; on: boolean; powered: boolean; watts: number; reason: string };
  /* Set when the port was shut by a guard; the text is the switch's reason. */
  errdisabled?: string;
  /* CRC/input errors counted on this port. */
  errors?: number;
  /* Connector and cable the engine reports; `linkUp` is the data path state. */
  media?: "rj45" | "sfp" | "serial" | "console" | "other";
  cable?: string | null;
  linkUp?: boolean;
  mdi?: "mdi" | "mdi-x";
  autoMdix?: boolean;
}

/* One /api/devices/ports payload, parsed; an error payload throws. */
export function parsePortsInfo(text: string): PortInfo[] {
  const parsed = JSON.parse(text) as Record<string, unknown>;
  const err = errorOf(parsed);
  if (err) throw new Error(err);
  const raw = Array.isArray(parsed["ports"]) ? (parsed["ports"] as Record<string, unknown>[]) : [];
  return raw.map((p) => {
    const peer = p["peer"] as Record<string, unknown> | null | undefined;
    const poeRaw = p["poe"] as Record<string, unknown> | undefined;
    return {
      name: asText(p["name"]),
      ip: typeof p["ip"] === "string" ? (p["ip"] as string) : null,
      prefix: Number(p["prefix"]) || 0,
      up: p["up"] !== false,
      peer: peer ? { id: asText(peer["id"]), name: asText(peer["name"]), port: asText(peer["port"]) } : null,
      eth: p["eth"] === true,
      speed: asText(p["speed"]) || "auto",
      duplex: asText(p["duplex"]) || "auto",
      link: asText(p["link"]),
      fault: asText(p["fault"]),
      errdisabled: asText(p["errdisabled"]) || undefined,
      errors: Number(p["errors"]) || 0,
      media: ["rj45", "sfp", "serial", "console", "other"].includes(asText(p["media"]))
        ? (asText(p["media"]) as PortInfo["media"])
        : undefined,
      cable: typeof p["cable"] === "string" ? (p["cable"] as string) : null,
      linkUp: "linkUp" in p ? p["linkUp"] === true : undefined,
      mdi: p["mdi"] === "mdi" || p["mdi"] === "mdi-x" ? (p["mdi"] as PortInfo["mdi"]) : undefined,
      autoMdix: "autoMdix" in p ? p["autoMdix"] === true : undefined,
      poe: poeRaw
        ? {
            capable: poeRaw["capable"] === true,
            on: poeRaw["on"] === true,
            powered: poeRaw["powered"] === true,
            watts: Number(poeRaw["watts"]) || 0,
            reason: asText(poeRaw["reason"]),
          }
        : undefined,
    };
  });
}

/* Green needs both ends of the story: administratively up and cabled. */
export function portDotClass(port: PortInfo): string {
  if (!port.up || port.errdisabled) return "port-dot is-down";
  if (port.fault === "speed" || (port.peer && port.linkUp === false)) return "port-dot is-warn";
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

const SPEEDS = ["auto", "10", "100", "1000"];
const DUPLEXES = ["auto", "half", "full"];

export function faultText(port: PortInfo): string {
  if (port.errdisabled) return `errdisabled: ${port.errdisabled}`;
  if (port.fault === "speed") return "Speed mismatch: no link";
  if (port.fault === "duplex") return "Duplex mismatch: expect errors";
  return "";
}

/* PoE on the powered device at the far end: watts while supplied, otherwise
   the switch's own reason for denying power. */
export function poeText(port: PortInfo): string {
  const poe = port.poe;
  if (!poe || !poe.capable) return "";
  if (poe.powered) return `${poe.watts.toFixed(1)} W`;
  return `off: ${poe.reason || "not supplied"}`;
}

function choice(doc: DocLike, label: string, values: readonly string[], current: string, onPick: (value: string) => void): ElementLike {
  const wrap = el(doc, "label", "port-choice", label);
  const select = el(doc, "select", "kw-input");
  select.setAttribute("aria-label", label);
  for (const value of values) {
    const option = el(doc, "option", "", value === "auto" ? "auto" : value);
    option.setAttribute("value", value);
    select.appendChild(option);
  }
  select.value = current;
  select.addEventListener("change", () => onPick(select.value));
  wrap.appendChild(select);
  return wrap;
}

function linkControls(doc: DocLike, row: ElementLike, port: PortInfo, deps: PortsPanelDeps, post: Post): void {
  const state = { speed: port.speed ?? "auto", duplex: port.duplex ?? "auto" };
  const send = (): void => {
    const enc = encodeURIComponent;
    void post(`/api/devices/linkspeed?id=${enc(deps.deviceId)}&port=${enc(port.name)}&speed=${state.speed}&duplex=${state.duplex}`)
      .then(() => deps.refresh?.())
      .catch(() => undefined);
  };
  row.appendChild(choice(doc, "Speed", SPEEDS, state.speed, (v) => { state.speed = v; send(); }));
  row.appendChild(choice(doc, "Duplex", DUPLEXES, state.duplex, (v) => { state.duplex = v; send(); }));
  if (port.link) row.appendChild(el(doc, "span", "port-link", port.link));
  const fault = faultText(port);
  if (fault) {
    const flag = el(doc, "span", "port-fault", fault);
    flag.setAttribute("role", "status");
    row.appendChild(flag);
  }
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
  if (post && port.eth) linkControls(doc, row, port, deps, post);
  const poe = poeText(port);
  if (poe) row.appendChild(el(doc, "span", "port-poe", poe));
  if (port.errors) row.appendChild(el(doc, "span", "port-errors", `${port.errors} input errors`));
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
