import { expect, test } from "bun:test";
import { windowIdForKind } from "../../web/ts/ui/kind_windows";
import { renderProviderWindow } from "../../web/ts/ui/provider_window";
import { renderHotspotWindow } from "../../web/ts/ui/hotspot_window";
import { renderFirewallWindow } from "../../web/ts/ui/firewall_window";
import { renderL3SwitchWindow } from "../../web/ts/ui/l3switch_window";
import { FakeDocument, FakeElement } from "./fake_dom";
import { allText, button, find, flush } from "./kind_test_helpers";

const workspace = {
  devices: [
    { id: "wan1", name: "KeProvider" },
    { id: "gw1", name: "Gateway1" },
  ],
  links: [{ a: "gw1", aPort: "Ether1", b: "wan1", bPort: "FastEthernet0" }],
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
  for (const id of ["rtrw-gateway", "client-radio", "sector-radio", "provider-link", "hotspot-ap",
    "asa", "load-balancer", "switch-l3"]) {
    expect(windowIdForKind(id)).not.toBe("device-window");
  }
});

test("ordinary kinds keep the generic device window", () => {
  for (const kind of ["pc", "router", "switch", "server", ""]) {
    expect(windowIdForKind(kind)).toBe(null);
  }
});

test("the provider card names the provider side and both cable ends", () => {
  const doc = new FakeDocument();
  const body = new FakeElement("div");
  renderProviderWindow(doc, body, { id: "wan1", name: "KeProvider", kind: "provider-link" }, workspace);
  const text = allText(body);
  expect(text).toContain("The other end is the provider.");
  expect(text).toContain("FastEthernet0 to Gateway1 Ether1");
});

test("an uncabled provider link shows the empty state", () => {
  const doc = new FakeDocument();
  const body = new FakeElement("div");
  renderProviderWindow(doc, body, { id: "wan1", name: "KeProvider", kind: "provider-link" }, { devices: [], links: [] });
  expect(allText(body)).toContain("No cable is connected yet.");
});

test("the hotspot window lists its wireless networks and the voucher note", async () => {
  const doc = new FakeDocument();
  const body = new FakeElement("div");
  await renderHotspotWindow(doc, body, { id: "ap1", name: "WarungAP", kind: "hotspot-ap" }, async (path) => {
    expect(path).toBe("/api/wifi/wlans?id=ap1");
    return { wlans: [{ ssid: "Warung WiFi", security: "Open" }] };
  });
  const text = allText(body);
  expect(text).toContain("Warung WiFi (Open)");
  expect(text).toContain("Visitors sign in with a voucher on the gateway.");
});

test("a hotspot with no network set up shows the empty state", async () => {
  const doc = new FakeDocument();
  const body = new FakeElement("div");
  await renderHotspotWindow(doc, body, { id: "ap1", name: "WarungAP", kind: "hotspot-ap" }, async () => ({ wlans: [] }));
  expect(allText(body)).toContain("No wireless network is set up yet.");
});

test("a failed wlan load shows the error state with a working retry", async () => {
  const doc = new FakeDocument();
  const body = new FakeElement("div");
  let healthy = false;
  await renderHotspotWindow(doc, body, { id: "ap1", name: "WarungAP", kind: "hotspot-ap" }, async () => {
    if (!healthy) throw new Error("down");
    return { wlans: [{ ssid: "Warung WiFi", security: "Open" }] };
  });
  expect(allText(body)).toContain("Could not load the wireless networks.");
  healthy = true;
  button(body, "Try again").click();
  await flush();
  expect(allText(body)).toContain("Warung WiFi (Open)");
});

const asa = { id: "fw1", name: "Edge", kind: "asa" };
const asaPorts = JSON.stringify({
  ports: [
    { name: "GigabitEthernet1/1", ip: "203.0.113.1", prefix: 30, up: true },
    { name: "GigabitEthernet1/2", ip: "10.0.0.1", prefix: 24, up: true },
    { name: "GigabitEthernet1/3", ip: null, prefix: 0, up: true },
  ],
});
const asaExport = [
  '<acl dev="fw1" num="100" action="permit" src="10.0.0.0" swc="0.0.0.255" dip="-" dwc="-"/>',
  '<acl dev="fw1" num="100" action="deny" src="0.0.0.0" swc="255.255.255.255" dip="10.0.0.9" dwc="0.0.0.0"/>',
  '<acl dev="other" num="110" action="permit" src="1.2.3.4" swc="0.0.0.0" dip="-" dwc="-"/>',
].join("\n");

function firewallGetText(exported: string) {
  return async (path: string): Promise<string> =>
    path.startsWith("/api/devices/ports") ? asaPorts : exported;
}

test("the firewall window shows its zones and colors each rule by action", async () => {
  const doc = new FakeDocument();
  const body = new FakeElement("div");
  await renderFirewallWindow(doc, body, asa, firewallGetText(asaExport));
  const text = allText(body);
  expect(text).toContain("GigabitEthernet1/1 — 203.0.113.1/30");
  expect(text).toContain("GigabitEthernet1/3 — no address yet");
  expect(text).toContain("100 permit 10.0.0.0 0.0.0.255 to any");
  expect(text).toContain("100 deny 0.0.0.0 255.255.255.255 to 10.0.0.9 0.0.0.0");
  expect(text).not.toContain("1.2.3.4");
  expect(find(body, (n) => n.className === "kw-row kw-permit")).not.toBe(null);
  expect(find(body, (n) => n.className === "kw-row kw-deny")).not.toBe(null);
});

test("a firewall with no rules says everything passes", async () => {
  const doc = new FakeDocument();
  const body = new FakeElement("div");
  await renderFirewallWindow(doc, body, asa, firewallGetText("<takumi/>"));
  expect(allText(body)).toContain("No rules yet. Everything passes.");
});

test("a failed firewall load shows the error state with a working retry", async () => {
  const doc = new FakeDocument();
  const body = new FakeElement("div");
  let up = false;
  const getText = async (path: string): Promise<string> => {
    if (!up) throw new Error("down");
    return firewallGetText(asaExport)(path);
  };
  await renderFirewallWindow(doc, body, asa, getText);
  expect(allText(body)).toContain("Could not load the ports.");
  expect(allText(body)).toContain("Could not load the rules.");
  up = true;
  button(body, "Try again").click();
  await flush();
  expect(allText(body)).toContain("GigabitEthernet1/1 — 203.0.113.1/30");
});

const l3 = { id: "sw1", name: "Core", kind: "switch-l3" };
const l3Ports = JSON.stringify({
  ports: [
    { name: "GigabitEthernet0/1", ip: "10.0.10.1", prefix: 24, up: true },
    { name: "GigabitEthernet0/2", ip: null, prefix: 0, up: true },
    { name: "GigabitEthernet0/3", ip: null, prefix: 0, up: true },
  ],
});
const l3Export = [
  '<port id="sw1" name="GigabitEthernet0/1" up="1" ip="10.0.10.1" prefix="24" vlan="10" trunk="0" dot1q="" bandwidth_kbps="1000000" delay_us="100"/>',
  '<port id="sw1" name="GigabitEthernet0/2" up="1" ip="" prefix="0" vlan="1" trunk="1" dot1q="" bandwidth_kbps="1000000" delay_us="100"/>',
].join("\n");

test("the layer 3 switch window shows VLAN tags and the routing table", async () => {
  const doc = new FakeDocument();
  const body = new FakeElement("div");
  const getText = async (path: string): Promise<string> =>
    path.startsWith("/api/devices/ports") ? l3Ports : l3Export;
  const calls: string[] = [];
  const post = async (path: string): Promise<Record<string, unknown>> => {
    calls.push(path);
    return path.includes("line=en")
      ? { output: "", prompt: "Core#" }
      : { output: "C 10.0.10.0/24 is directly connected" };
  };
  await renderL3SwitchWindow(doc, body, l3, getText, post);
  const text = allText(body);
  expect(text).toContain("GigabitEthernet0/1 — 10.0.10.1/24 · VLAN 10");
  expect(text).toContain("GigabitEthernet0/2 — no address yet · trunk");
  expect(text).toContain("GigabitEthernet0/3 — no address yet · VLAN 1");
  expect(text).toContain("C 10.0.10.0/24 is directly connected");
  expect(calls).toContain("/api/cli?id=sw1&line=en");
  expect(calls).toContain("/api/cli?id=sw1&line=show%20ip%20route");
  const pre = find(body, (n) => n.tagName === "PRE");
  expect(pre?.className).toBe("kw-mono");
});

test("a switch with no routes yet says so instead of an empty block", async () => {
  const doc = new FakeDocument();
  const body = new FakeElement("div");
  const getText = async (path: string): Promise<string> =>
    path.startsWith("/api/devices/ports") ? l3Ports : "<takumi/>";
  const post = async (): Promise<Record<string, unknown>> => ({ output: "" });
  await renderL3SwitchWindow(doc, body, l3, getText, post);
  expect(allText(body)).toContain("No routes yet.");
});
