import type { Point } from "./camera";

export interface RackDevice {
  id: string;
  name: string;
  model: string;
  kind: string;
}

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface RackBox {
  device: RackDevice;
  rect: Rect;
}

export interface Rack {
  kind: string;
  label: string;
  rect: Rect;
  boxes: RackBox[];
}

export interface RackLayout {
  racks: Rack[];
}

export const KIND_ORDER = [
  "router", "switch", "hub", "server", "pc", "laptop", "ap", "homerouter",
  "asa", "wlc", "phone", "printer", "cloud", "thing",
];

const KIND_LABEL: Record<string, string> = {
  router: "Routers", switch: "Switches", hub: "Hubs", server: "Servers",
  pc: "Workstations", laptop: "Laptops", ap: "Access Points",
  homerouter: "Wireless Routers", asa: "Firewalls", wlc: "Wireless LAN Controllers",
  phone: "IP Phones", printer: "Printers", cloud: "Clouds", thing: "IoT Devices",
};

const BOX = { w: 168, h: 72, gap: 12, perRow: 2, title: 28, rackGap: 28 };

const rank = (kind: string) => {
  const index = KIND_ORDER.indexOf(kind);
  return index < 0 ? KIND_ORDER.length : index;
};

export function layoutRacks(devices: readonly RackDevice[]): RackLayout {
  const groups = new Map<string, RackDevice[]>();
  for (const device of devices) {
    const list = groups.get(device.kind) ?? [];
    list.push(device);
    groups.set(device.kind, list);
  }
  const kinds = [...groups.keys()].sort((a, b) => rank(a) - rank(b) || a.localeCompare(b));

  let x = 0;
  const racks: Rack[] = kinds.map((kind) => {
    const members = groups.get(kind)!;
    const rows = Math.ceil(members.length / BOX.perRow);
    const width = BOX.perRow * BOX.w + (BOX.perRow + 1) * BOX.gap;
    const height = BOX.title + rows * (BOX.h + BOX.gap) + BOX.gap;
    const boxes: RackBox[] = members.map((device, i) => {
      const column = i % BOX.perRow;
      const row = Math.floor(i / BOX.perRow);
      return {
        device,
        rect: {
          x: x + BOX.gap + column * (BOX.w + BOX.gap),
          y: BOX.title + row * (BOX.h + BOX.gap),
          w: BOX.w,
          h: BOX.h,
        },
      };
    });
    const rack: Rack = {
      kind,
      label: `${KIND_LABEL[kind] ?? kind.charAt(0).toUpperCase() + kind.slice(1)} (${members.length})`,
      rect: { x, y: 0, w: width, h: height },
      boxes,
    };
    x += width + BOX.rackGap;
    return rack;
  });
  return { racks };
}

export function hitRackBox(layout: RackLayout, p: Point): RackDevice | null {
  for (const rack of layout.racks) {
    for (const box of rack.boxes) {
      const { x, y, w, h } = box.rect;
      if (p.x >= x && p.x <= x + w && p.y >= y && p.y <= y + h) return box.device;
    }
  }
  return null;
}
