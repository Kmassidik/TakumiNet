import { expect, test } from "bun:test";
import { renderKindWindow, windowIdForKind } from "../../web/ts/mod/ui/kind_windows.js";
import { renderProviderWindow } from "../../web/ts/mod/ui/provider_window.js";
import { renderHotspotWindow } from "../../web/ts/mod/ui/hotspot_window.js";
import { renderFirewallWindow } from "../../web/ts/mod/ui/firewall_window.js";
import { renderL3SwitchWindow } from "../../web/ts/mod/ui/l3switch_window";

// tests/ts/fake_dom.js
class FakeElement {
  textContent = "";
  title = "";
  className = "";
  value = "";
  disabled = false;
  dataset = {};
  children = [];
  parent = null;
  attrs = new Map;
  listeners = new Map;
  tagName;
  constructor(tagName) {
    this.tagName = tagName.toUpperCase();
  }
  setAttribute(name, value) {
    this.attrs.set(name, value);
  }
  getAttribute(name) {
    return this.attrs.get(name) ?? null;
  }
  addEventListener(type, handler) {
    this.listeners.set(type, [...this.listeners.get(type) ?? [], handler]);
  }
  appendChild(child) {
    child.remove();
    child.parent = this;
    this.children.push(child);
    return child;
  }
  focus() {}
  select() {}
  replaceChildren() {
    for (const child of this.children)
      child.parent = null;
    this.children = [];
  }
  remove() {
    if (!this.parent)
      return;
    this.parent.children = this.parent.children.filter((c) => c !== this);
    this.parent = null;
  }
  dispatch(type, event) {
    for (const handler of this.listeners.get(type) ?? []) {
      handler({ key: "", target: this, preventDefault() {}, ...event });
    }
  }
  click() {
    if (this.disabled)
      return;
    for (const handler of this.listeners.get("click") ?? []) {
      handler({ key: "", target: this, preventDefault() {} });
    }
  }
}

class FakeDocument {
  body = new FakeElement("body");
  activeElement = null;
  createElement(tag) {
    return new FakeElement(tag);
  }
}

// tests/ts/kind_test_helpers.js
function allText(el) {
  return [el.textContent ?? "", ...el.children.map(allText)].filter(Boolean).join(" ");
}
function find(el, match) {
  if (match(el))
    return el;
  for (const child of el.children) {
    const hit = find(child, match);
    if (hit)
      return hit;
  }
  return null;
}
function button(root, label) {
  const hit = find(root, (n) => n.tagName === "BUTTON" && n.textContent === label);
  if (!hit)
    throw new Error(`no button labelled ${label}`);
  return hit;
}
function inputUnder(root, label) {
  const field = find(root, (n) => n.tagName === "LABEL" && n.textContent === label);
  const input = field && find(field, (n) => n.tagName === "INPUT");
  if (!input)
    throw new Error(`no field labelled ${label}`);
  return input;
}
function flush() {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

// tests/ts/__conv_kind_windows.ts
var workspace = {
  devices: [
    { id: "wan1", name: "KeProvider" },
    { id: "gw1", name: "Gateway1" }
  ],
  links: [{ a: "gw1", aPort: "Ether1", b: "wan1", bPort: "FastEthernet0" }]
};
test("every new kind opens its own window, never the generic device window", () => {
  expect(windowIdForKind("rtrw-gateway")).toBe("gateway-window");
  expect(windowIdForKind("client-radio")).toBe("radio-window");
  expect(windowIdForKind("sector-radio")).toBe("radio-window");
  expect(windowIdForKind("provider-link")).toBe("provider-window");
  expect(windowIdForKind("hotspot-ap")).toBe("hotspot-window");
  expect(windowIdForKind("asa")).toBe("firewall-window");
  expect(windowIdForKind("load-balancer")).toBe("balancer-window");
  expect(windowIdForKind("switch-l3")).toBe("l3switch-window");
  expect(windowIdForKind("phone")).toBe("phone-window");
  expect(windowIdForKind("analogphone")).toBe("phone-window");
  for (const id of [
    "rtrw-gateway",
    "client-radio",
    "sector-radio",
    "provider-link",
    "hotspot-ap",
    "asa",
    "load-balancer",
    "switch-l3",
    "phone",
    "analogphone"
  ]) {
    expect(windowIdForKind(id)).not.toBe("device-window");
  }
});
test("ordinary kinds keep the generic device window", () => {
  for (const kind of ["pc", "router", "switch", "server", ""]) {
    expect(windowIdForKind(kind)).toBe(null);
  }
});
test("a kind window opens with the model's one-line description on top", async () => {
  const doc = new FakeDocument;
  const body = new FakeElement("div");
  const blurb = "The line from a bigger provider; private addresses stop here without NAT.";
  await renderKindWindow(doc, body, { id: "wan1", name: "KeProvider", kind: "provider-link", model: "Provider Link" }, { ...workspace, palette: [{ label: "Provider Link", blurb }] }, { post: async () => ({}), getText: async () => "" });
  const line = find(body, (n) => n.className === "kw-blurb");
  expect(line?.textContent).toBe(`Provider Link \u2014 ${blurb}`);
  expect(body.children[0]).toBe(line);
  expect(allText(body)).toContain("The other end is the provider.");
});
test("a kind window without a known model shows no description line", async () => {
  const doc = new FakeDocument;
  const body = new FakeElement("div");
  await renderKindWindow(doc, body, { id: "wan1", name: "KeProvider", kind: "provider-link" }, workspace, { post: async () => ({}), getText: async () => "" });
  expect(find(body, (n) => n.className === "kw-blurb")).toBe(null);
});
test("the provider card names the provider side and both cable ends", () => {
  const doc = new FakeDocument;
  const body = new FakeElement("div");
  renderProviderWindow(doc, body, { id: "wan1", name: "KeProvider", kind: "provider-link" }, workspace);
  const text = allText(body);
  expect(text).toContain("The other end is the provider.");
  expect(text).toContain("FastEthernet0 to Gateway1 Ether1");
});
test("an uncabled provider link shows the empty state", () => {
  const doc = new FakeDocument;
  const body = new FakeElement("div");
  renderProviderWindow(doc, body, { id: "wan1", name: "KeProvider", kind: "provider-link" }, { devices: [], links: [] });
  expect(allText(body)).toContain("No cable is connected yet.");
});
test("the hotspot window lists its wireless networks and the voucher note", async () => {
  const doc = new FakeDocument;
  const body = new FakeElement("div");
  await renderHotspotWindow(doc, body, { id: "ap1", name: "CafeAP", kind: "hotspot-ap" }, async (path) => {
    expect(path).toBe("/api/wifi/wlans?id=ap1");
    return { wlans: [{ ssid: "Cafe WiFi", security: "Open" }] };
  });
  const text = allText(body);
  expect(text).toContain("Cafe WiFi (Open)");
  expect(text).toContain("Visitors sign in with a voucher on the gateway.");
});
test("a hotspot with no network set up shows the empty state", async () => {
  const doc = new FakeDocument;
  const body = new FakeElement("div");
  await renderHotspotWindow(doc, body, { id: "ap1", name: "CafeAP", kind: "hotspot-ap" }, async () => ({ wlans: [] }));
  expect(allText(body)).toContain("No wireless network is set up yet.");
});
test("a failed wlan load shows the error state with a working retry", async () => {
  const doc = new FakeDocument;
  const body = new FakeElement("div");
  let healthy = false;
  await renderHotspotWindow(doc, body, { id: "ap1", name: "CafeAP", kind: "hotspot-ap" }, async () => {
    if (!healthy)
      throw new Error("down");
    return { wlans: [{ ssid: "Cafe WiFi", security: "Open" }] };
  });
  expect(allText(body)).toContain("Could not load the wireless networks.");
  healthy = true;
  button(body, "Try again").click();
  await flush();
  expect(allText(body)).toContain("Cafe WiFi (Open)");
});
var asa = { id: "fw1", name: "Edge", kind: "asa" };
var asaPorts = JSON.stringify({
  ports: [
    { name: "GigabitEthernet1/1", ip: "203.0.113.1", prefix: 30, up: true },
    { name: "GigabitEthernet1/2", ip: "10.0.0.1", prefix: 24, up: true },
    { name: "GigabitEthernet1/3", ip: null, prefix: 0, up: true }
  ]
});
var asaExport = [
  '<acl dev="fw1" num="100" action="permit" src="10.0.0.0" swc="0.0.0.255" dip="-" dwc="-"/>',
  '<acl dev="fw1" num="100" action="deny" src="0.0.0.0" swc="255.255.255.255" dip="10.0.0.9" dwc="0.0.0.0"/>',
  '<acl dev="other" num="110" action="permit" src="1.2.3.4" swc="0.0.0.0" dip="-" dwc="-"/>'
].join(`
`);
function firewallGetText(exported) {
  return async (path) => path.startsWith("/api/devices/ports") ? asaPorts : exported;
}
test("the firewall window shows its zones and colors each rule by action", async () => {
  const doc = new FakeDocument;
  const body = new FakeElement("div");
  await renderFirewallWindow(doc, body, asa, firewallGetText(asaExport));
  const text = allText(body);
  expect(text).toContain("GigabitEthernet1/1 \u2014 203.0.113.1/30");
  expect(text).toContain("GigabitEthernet1/3 \u2014 no address yet");
  expect(text).toContain("100 permit 10.0.0.0 0.0.0.255 to any");
  expect(text).toContain("100 deny 0.0.0.0 255.255.255.255 to 10.0.0.9 0.0.0.0");
  expect(text).not.toContain("1.2.3.4");
  expect(find(body, (n) => n.className === "kw-row kw-permit")).not.toBe(null);
  expect(find(body, (n) => n.className === "kw-row kw-deny")).not.toBe(null);
});
test("a firewall with no rules says everything passes", async () => {
  const doc = new FakeDocument;
  const body = new FakeElement("div");
  await renderFirewallWindow(doc, body, asa, firewallGetText("<takumi/>"));
  expect(allText(body)).toContain("No rules yet. Everything passes.");
});
test("a failed firewall load shows the error state with a working retry", async () => {
  const doc = new FakeDocument;
  const body = new FakeElement("div");
  let up = false;
  const getText = async (path) => {
    if (!up)
      throw new Error("down");
    return firewallGetText(asaExport)(path);
  };
  await renderFirewallWindow(doc, body, asa, getText);
  expect(allText(body)).toContain("Could not load the ports.");
  expect(allText(body)).toContain("Could not load the rules.");
  up = true;
  button(body, "Try again").click();
  await flush();
  expect(allText(body)).toContain("GigabitEthernet1/1 \u2014 203.0.113.1/30");
});
var l3 = { id: "sw1", name: "Core", kind: "switch-l3" };
var l3Ports = JSON.stringify({
  ports: [
    { name: "GigabitEthernet0/1", ip: "10.0.10.1", prefix: 24, up: true, peer: { id: "r1", name: "Edge", port: "GigabitEthernet0/0" } },
    { name: "GigabitEthernet0/2", ip: null, prefix: 0, up: true, peer: null },
    { name: "GigabitEthernet0/3", ip: null, prefix: 0, up: true, peer: null }
  ]
});
var l3Export = [
  '<port id="sw1" name="GigabitEthernet0/1" up="1" ip="10.0.10.1" prefix="24" vlan="10" trunk="0" dot1q="" bandwidth_kbps="1000000" delay_us="100"/>',
  '<port id="sw1" name="GigabitEthernet0/2" up="1" ip="" prefix="0" vlan="1" trunk="1" dot1q="" bandwidth_kbps="1000000" delay_us="100"/>'
].join(`
`);
test("the layer 3 switch window shows VLAN tags and the routing table", async () => {
  const doc = new FakeDocument;
  const body = new FakeElement("div");
  const getText = async (path) => path.startsWith("/api/devices/ports") ? l3Ports : l3Export;
  const calls = [];
  const post = async (path) => {
    calls.push(path);
    return path.includes("line=en") ? { output: "", prompt: "Core#" } : { output: "C 10.0.10.0/24 is directly connected" };
  };
  await renderL3SwitchWindow(doc, body, l3, getText, post);
  const text = allText(body);
  expect(text).toContain("GigabitEthernet0/1 10.0.10.1/24 VLAN 10 connected to Edge GigabitEthernet0/0");
  expect(text).toContain("GigabitEthernet0/2 trunk free");
  expect(text).toContain("GigabitEthernet0/3 VLAN 1 free");
  expect(text).toContain("C 10.0.10.0/24 is directly connected");
  expect(calls).toContain("/api/cli?id=sw1&line=en");
  expect(calls).toContain("/api/cli?id=sw1&line=show%20ip%20route");
  const pre = find(body, (n) => n.tagName === "PRE");
  expect(pre?.className).toBe("kw-mono");
});
test("a switch with no routes yet says so instead of an empty block", async () => {
  const doc = new FakeDocument;
  const body = new FakeElement("div");
  const getText = async (path) => path.startsWith("/api/devices/ports") ? l3Ports : "<takumi/>";
  const post = async () => ({ output: "" });
  await renderL3SwitchWindow(doc, body, l3, getText, post);
  expect(allText(body)).toContain("No routes yet.");
});
test("the layer 3 switch shares a gateway address and leaves it", async () => {
  const doc = new FakeDocument;
  const body = new FakeElement("div");
  const getText = async (path) => path.startsWith("/api/devices/ports") ? l3Ports : "<takumi/>";
  const calls = [];
  const post = async (path) => {
    calls.push(path);
    if (path.startsWith("/api/devices/sharedgw")) {
      return { devices: [{ id: "sw1", sharedGws: [{ vip: "172.20.0.1", priority: 110, owner: true }] }] };
    }
    return { output: "" };
  };
  const member = { ...l3, sharedGws: [{ vip: "172.20.0.1", priority: 100, owner: false }] };
  await renderL3SwitchWindow(doc, body, member, getText, post);
  expect(allText(body)).toContain("172.20.0.1 \xB7 priority 100");
  inputUnder(body, "Shared address").value = "172.20.0.1";
  inputUnder(body, "Priority").value = "110";
  button(body, "Share").click();
  await flush();
  expect(calls).toContain("/api/devices/sharedgw?id=sw1&vip=172.20.0.1&priority=110");
  expect(allText(body)).toContain("172.20.0.1 \xB7 priority 110 \xB7 answering now");
  button(body, "Leave").click();
  await flush();
  expect(calls).toContain("/api/devices/sharedgw?id=sw1&vip=172.20.0.1&remove=1");
});
test("a switch sharing nothing says so, and a refusal shows verbatim", async () => {
  const doc = new FakeDocument;
  const body = new FakeElement("div");
  const getText = async (path) => path.startsWith("/api/devices/ports") ? l3Ports : "<takumi/>";
  const post = async (path) => path.startsWith("/api/devices/sharedgw") ? { error: "the shared address must sit in one of this device's networks, and not on a port" } : { output: "" };
  await renderL3SwitchWindow(doc, body, l3, getText, post);
  expect(allText(body)).toContain("Not sharing any address.");
  inputUnder(body, "Shared address").value = "10.9.9.1";
  inputUnder(body, "Priority").value = "110";
  button(body, "Share").click();
  await flush();
  expect(allText(body)).toContain("the shared address must sit in one of this device's networks");
});
