import type { DocLike, ElementLike } from "./dom";
import { el } from "./kind_parts";
import type { PortInfo } from "./ports_panel";

export type PortMedia = "rj45" | "sfp" | "serial" | "console" | "other";
export type PortLight = "up" | "free" | "no-link" | "shut";

export interface FaceplatePort extends PortInfo {
  media?: PortMedia;
  cable?: string | null;
  linkUp?: boolean;
}

/* State reads: green only when the port is up, cabled and takes traffic. */
export function portLight(port: FaceplatePort): PortLight {
  if (!port.up || port.errdisabled) return "shut";
  if (port.fault === "speed" || (port.peer && port.linkUp === false)) return "no-link";
  return port.peer ? "up" : "free";
}

export function portStateText(port: FaceplatePort): string {
  const light = portLight(port);
  if (light === "shut") return port.errdisabled ? `shut down · ${port.errdisabled}` : "shut down";
  if (light === "no-link") return "no link";
  if (light === "free") return "free";
  const parts = ["connected"];
  if (port.cable === "eFiber") parts.push("optical fibre");
  else if (port.cable === "eSerial") parts.push("serial");
  if (port.eth && port.link) parts.push(port.link);
  if (port.fault === "duplex") parts.push("duplex mismatch");
  parts.push(`to ${port.peer!.name} ${port.peer!.port}`);
  return parts.join(" · ");
}

/* The compact card line: peer name stays in the tooltip so the state fits. */
export function portCardText(port: FaceplatePort): string {
  const light = portLight(port);
  if (light === "shut") return "shut down";
  if (light === "no-link") return "no link";
  if (light === "free") return "free";
  if (port.fault === "duplex") return "connected · duplex mismatch";
  const parts = ["connected"];
  if (port.cable === "eFiber") parts.push("fibre");
  else if (port.cable === "eSerial") parts.push("serial");
  if (port.eth && port.link) parts.push(port.link.split(",")[0]!.trim());
  return parts.join(" · ");
}

export function portMedia(port: FaceplatePort): PortMedia {
  return port.media ?? "rj45";
}

const CABLES: Record<string, string> = {
  eCopper: "copper",
  eCross: "copper",
  eFiber: "fiber",
  eSerial: "serial",
  eConsole: "console",
  ePhone: "phone",
  eCoax: "coax",
  eIoT: "iot",
};

function svgNode(doc: DocLike, tag: string): ElementLike {
  if (doc.createElementNS) {
    return doc.createElementNS("http://www.w3.org/2000/svg", tag);
  }
  return doc.createElement(tag);
}

function shape(doc: DocLike, tag: string, attrs: Record<string, string | number>): ElementLike {
  const node = svgNode(doc, tag);
  for (const [name, value] of Object.entries(attrs)) node.setAttribute(name, String(value));
  return node;
}

function led(doc: DocLike, light: PortLight): ElementLike {
  const circle = shape(doc, "circle", { cx: 45, cy: 9, r: 3.2, class: `port-led led-${light}` });
  return circle;
}

function rj45(doc: DocLike, light: PortLight, kind: string): ElementLike {
  const body = shape(doc, "rect", { x: 5, y: 6, width: 34, height: 25, rx: 3, class: `port-body ${kind}` });
  const cavity = shape(doc, "rect", { x: 10, y: 11, width: 24, height: 12, rx: 1, class: "port-cavity" });
  const pins = shape(doc, "path", {
    d: "M12 12v10M15 12v10M18 12v10M21 12v10M24 12v10M27 12v10M30 12v10",
    class: "port-pin",
  });
  return group(doc, [body, cavity, pins, led(doc, light)]);
}

function sfp(doc: DocLike, light: PortLight, kind: string): ElementLike {
  const cage = shape(doc, "rect", { x: 4, y: 7, width: 34, height: 24, rx: 2, class: `port-body ${kind}` });
  const slot = shape(doc, "rect", { x: 9, y: 12, width: 24, height: 8, rx: 1, class: "port-cavity" });
  const latch = shape(doc, "path", { d: "M9 20h24M16 20v7M32 20v7", class: "port-pin" });
  return group(doc, [cage, slot, latch, led(doc, light)]);
}

function serial(doc: DocLike, light: PortLight, kind: string): ElementLike {
  const shell = shape(doc, "path", { d: "M6 9h40l-4 18H10z", class: `port-body ${kind}` });
  const pins: ElementLike[] = [];
  for (let row = 0; row < 2; row += 1) {
    for (let col = 0; col < 5; col += 1) {
      pins.push(shape(doc, "circle", { cx: 15 + col * 6, cy: 15 + row * 6, r: 1.4, class: "port-pin-fill" }));
    }
  }
  return group(doc, [shell, ...pins, led(doc, light)]);
}

function group(doc: DocLike, children: ElementLike[]): ElementLike {
  const g = shape(doc, "g", { class: "port-icon" });
  for (const child of children) g.appendChild(child);
  return g;
}

function icon(doc: DocLike, port: FaceplatePort, light: PortLight, kind: string): ElementLike {
  const media = portMedia(port);
  if (media === "sfp") return sfp(doc, light, kind);
  if (media === "serial") return serial(doc, light, kind);
  if (media === "console") return rj45(doc, light, `${kind} console`);
  if (media === "other") return serial(doc, light, kind);
  return rj45(doc, light, kind);
}

/* Draw the physical port bank for one device: connector, LED and a text state. */
export function renderPortFaceplate(doc: DocLike, box: ElementLike, ports: readonly FaceplatePort[]): void {
  const wrap = el(doc, "div", "port-faceplate");
  const head = el(doc, "div", "port-faceplate-head");
  head.appendChild(el(doc, "strong", "", "Ports"));
  const legend = el(doc, "div", "port-legend");
  for (const [light, label] of [["up", "Up"], ["free", "Free"], ["no-link", "No link"], ["shut", "Shut down"]] as const) {
    const item = el(doc, "span", "port-legend-item");
    const dot = el(doc, "span", `port-led led-${light}`);
    dot.setAttribute("aria-hidden", "true");
    item.appendChild(dot);
    item.appendChild(el(doc, "span", "", label));
    legend.appendChild(item);
  }
  head.appendChild(legend);
  wrap.appendChild(head);
  const copper = ports.filter((port) => port.media === "rj45");
  if (copper.length) {
    const note = copper.some((port) => port.autoMdix)
      ? "Auto-MDI-X: either copper cable works."
      : "Fixed MDI-X: use a crossover cable between two fixed ports.";
    wrap.appendChild(el(doc, "p", "port-faceplate-note", note));
  }

  const grid = el(doc, "div", "port-jack-grid");
  for (const port of ports) {
    const light = portLight(port);
    const cable = CABLES[port.cable ?? ""] ?? "none";
    const card = el(doc, "div", `port-jack cable-${cable}`);
    card.setAttribute("data-media", portMedia(port));
    card.setAttribute("data-state", light);
    const pair = port.media === "rj45"
      ? port.autoMdix
        ? "auto-MDI-X"
        : port.mdi === "mdi"
          ? "fixed MDI"
          : "fixed MDI-X"
      : "";
    card.title = `${port.name}: ${portStateText(port)}${pair ? ` · ${pair}` : ""}`;
    const svg = svgNode(doc, "svg");
    svg.setAttribute("viewBox", "0 0 54 38");
    svg.setAttribute("aria-hidden", "true");
    svg.setAttribute("focusable", "false");
    svg.appendChild(icon(doc, port, light, "port-shape"));
    card.appendChild(svg);
    card.appendChild(el(doc, "span", "port-jack-name", port.name));
    card.appendChild(el(doc, "span", `port-jack-state state-${light}`, portCardText(port)));
    grid.appendChild(card);
  }
  wrap.appendChild(grid);
  box.appendChild(wrap);
}
