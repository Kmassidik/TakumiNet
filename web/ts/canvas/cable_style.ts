export interface CableStyle {
  color: string;
  width: number;
  dash: number[];
  /* Plain name for the legend and tooltips. */
  name: string;
}

/* Colours are literal because a canvas stroke cannot read CSS variables. Each
   kind differs by dash and width as well as colour, so the lines still tell
   apart for anyone who cannot see the hue. */
export const CABLE_STYLES: Record<string, CableStyle> = {
  eCopper: { color: "#1b1f23", width: 2, dash: [], name: "Copper straight-through" },
  eCross: { color: "#1b1f23", width: 2, dash: [10, 6], name: "Copper cross-over" },
  eFiber: { color: "#c2570c", width: 2.5, dash: [], name: "Optical fibre" },
  eSerial: { color: "#b42318", width: 2, dash: [12, 4, 2, 4], name: "Serial" },
  eConsole: { color: "#0f766e", width: 2, dash: [6, 4], name: "Console" },
  ePhone: { color: "#7c3aed", width: 2, dash: [2, 4], name: "Phone line" },
  eCoax: { color: "#8a5a14", width: 3.5, dash: [], name: "Coaxial" },
  eIoT: { color: "#be185d", width: 2, dash: [5, 3, 1, 3], name: "IoT" },
};

const FALLBACK: CableStyle = CABLE_STYLES["eCopper"]!;

export function cableStyle(kind: string | undefined): CableStyle {
  return (kind && CABLE_STYLES[kind]) || FALLBACK;
}
