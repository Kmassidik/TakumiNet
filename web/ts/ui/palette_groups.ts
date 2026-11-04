/* Which palette tiles belong to which category. Every device kind sits in
   exactly one category, and the Connections category holds the cables, the bus
   builder and the mesh tool instead of devices. */

export interface PaletteDevice {
  label: string;
  icon: string;
  kind: string;
}

export const CONNECTIONS = "Connections";
export const DEFAULT_GROUP = "End devices";

export const GROUP_KINDS: Readonly<Record<string, readonly string[]>> = {
  Routers: ["router", "rtrw-gateway", "district-hub", "city-exchange", "regency-hub", "village-pop"],
  Switches: ["switch", "switch-l3"],
  Hubs: ["hub", "patchpanel"],
  Wireless: ["ap", "wlc", "hotspot-ap", "sector-radio", "client-radio", "celltower", "microwave-link", "satellite-terminal"],
  Security: ["asa"],
  WAN: ["cloud", "provider-link", "homerouter", "cablemodem", "dsl"],
  "End devices": ["pc", "laptop", "server", "load-balancer", "printer", "phone", "analogphone", "tv", "tablet", "sniffer"],
  [CONNECTIONS]: [],
  IoE: ["ioe", "thing", "plc"],
};

export function groupForKind(kind: string): string | null {
  for (const [group, kinds] of Object.entries(GROUP_KINDS)) if (kinds.includes(kind)) return group;
  return null;
}

/* Only the tiles of the chosen category. An unknown category shows nothing. */
export function tilesFor(group: string, palette: readonly PaletteDevice[]): PaletteDevice[] {
  const kinds = GROUP_KINDS[group];
  if (!kinds) return [];
  return palette.filter((device) => kinds.includes(device.kind));
}

/* The cable tool only exists in the Connections category. Leaving that category
   must also leave cable mode, or clicks keep drawing cables that nothing on
   screen offers any more. */
export function keepsCableMode(group: string): boolean {
  return group === CONNECTIONS;
}

/* The category to open on: the saved one if it still exists. */
export function startGroup(saved: string | null | undefined, groups: readonly string[]): string {
  if (saved && groups.includes(saved)) return saved;
  return groups.includes(DEFAULT_GROUP) ? DEFAULT_GROUP : (groups[0] ?? DEFAULT_GROUP);
}
