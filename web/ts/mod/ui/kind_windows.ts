import { renderBalancerWindow } from "./balancer_window.js";
import { renderFirewallWindow } from "./firewall_window.js";
import { renderGatewayWindow } from "./gateway_window.js";
import { renderL3SwitchWindow } from "./l3switch_window.js";
import { renderHotspotWindow } from "./hotspot_window.js";
import { renderCellTowerWindow, renderIotWindow } from "./iot_window.js";
import { renderPhoneWindow } from "./phone_window.js";
import { renderProviderWindow } from "./provider_window.js";
import { renderRadioWindow } from "./radio_window.js";
import { el, modelBlurbLine } from "./kind_parts.js";

const WINDOW_IDS = {
  "rtrw-gateway": "gateway-window",
  "client-radio": "radio-window",
  "sector-radio": "radio-window",
  "provider-link": "provider-window",
  "hotspot-ap": "hotspot-window",
  "asa": "firewall-window",
  "load-balancer": "balancer-window",
  "switch-l3": "l3switch-window",
  "plc": "iot-window",
  "thing": "iot-window",
  "ioe": "iot-window",
  "celltower": "celltower-window",
  "phone": "phone-window",
  "analogphone": "phone-window",
};

/* Kinds without an entry here keep the generic PC-style device window. */
export function windowIdForKind(kind) {
  return WINDOW_IDS[kind] ?? null;
}

export function renderKindWindow(doc, body, device, workspace, deps) {
  body.replaceChildren();
  const blurb = modelBlurbLine(workspace, device);
  if (blurb) body.appendChild(el(doc, "p", "kw-blurb", blurb));
  const pane = body.appendChild(el(doc, "div", "kw-pane"));
  switch (device.kind) {
    case "rtrw-gateway":
      return renderGatewayWindow(doc, pane, device, deps.post);
    case "client-radio":
    case "sector-radio":
      return renderRadioWindow(doc, pane, device, deps.getText, deps.post);
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
    case "plc":
    case "thing":
    case "ioe":
      return renderIotWindow(doc, pane, device, workspace, deps.post, deps.getText);
    case "celltower":
      return renderCellTowerWindow(doc, pane, device, workspace, deps.getText);
    case "phone":
    case "analogphone":
      return renderPhoneWindow(doc, pane, device, workspace, deps.post);
    default:
      return Promise.resolve();
  }
}
