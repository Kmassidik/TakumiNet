import type { DocLike, ElementLike } from "./dom";
import { renderGatewayWindow } from "./gateway_window";
import { renderHotspotWindow } from "./hotspot_window";
import { renderProviderWindow } from "./provider_window";
import { renderRadioWindow } from "./radio_window";
import type { GetText, KindDevice, KindWorkspace, Post } from "./kind_parts";

export interface KindDeps {
  post: Post;
  getText: GetText;
}

const WINDOW_IDS: Record<string, string> = {
  "rtrw-gateway": "gateway-window",
  "client-radio": "radio-window",
  "sector-radio": "radio-window",
  "provider-link": "provider-window",
  "hotspot-ap": "hotspot-window",
};

/* Kinds without an entry here keep the generic PC-style device window. */
export function windowIdForKind(kind: string): string | null {
  return WINDOW_IDS[kind] ?? null;
}

export function renderKindWindow(
  doc: DocLike,
  body: ElementLike,
  device: KindDevice,
  workspace: KindWorkspace,
  deps: KindDeps,
): Promise<void> {
  switch (device.kind) {
    case "rtrw-gateway":
      return renderGatewayWindow(doc, body, device, deps.post);
    case "client-radio":
    case "sector-radio":
      return renderRadioWindow(doc, body, device, workspace, deps.getText);
    case "provider-link":
      renderProviderWindow(doc, body, device, workspace);
      return Promise.resolve();
    case "hotspot-ap":
      return renderHotspotWindow(doc, body, device, deps.post);
    default:
      return Promise.resolve();
  }
}
