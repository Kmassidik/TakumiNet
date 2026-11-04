import type { DocLike, ElementLike } from "./dom";
import { renderBalancerWindow } from "./balancer_window";
import { renderFirewallWindow } from "./firewall_window";
import { renderGatewayWindow } from "./gateway_window";
import { renderL3SwitchWindow } from "./l3switch_window";
import { renderHotspotWindow } from "./hotspot_window";
import { renderPhoneWindow } from "./phone_window";
import { renderProviderWindow } from "./provider_window";
import { renderRadioWindow } from "./radio_window";
import { el, modelBlurbLine, type GetText, type KindDevice, type KindWorkspace, type Post } from "./kind_parts";

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
  "asa": "firewall-window",
  "load-balancer": "balancer-window",
  "switch-l3": "l3switch-window",
  "phone": "phone-window",
  "analogphone": "phone-window",
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
  body.replaceChildren();
  const blurb = modelBlurbLine(workspace, device);
  if (blurb) body.appendChild(el(doc, "p", "kw-blurb", blurb));
  const pane = body.appendChild(el(doc, "div", "kw-pane"));
  switch (device.kind) {
    case "rtrw-gateway":
      return renderGatewayWindow(doc, pane, device, deps.post);
    case "client-radio":
    case "sector-radio":
      return renderRadioWindow(doc, pane, device, workspace, deps.getText);
    case "provider-link":
      renderProviderWindow(doc, pane, device, workspace);
      return Promise.resolve();
    case "hotspot-ap":
      return renderHotspotWindow(doc, pane, device, deps.post);
    case "asa":
      return renderFirewallWindow(doc, pane, device, deps.getText);
    case "load-balancer":
      return renderBalancerWindow(doc, pane, device, workspace, deps.post);
    case "switch-l3":
      return renderL3SwitchWindow(doc, pane, device, deps.getText, deps.post);
    case "phone":
    case "analogphone":
      return renderPhoneWindow(doc, pane, device, workspace, deps.post);
    default:
      return Promise.resolve();
  }
}
