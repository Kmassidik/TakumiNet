import { expect, test } from "bun:test";
import { windowIdForKind } from "../../web/ts/ui/kind_windows";
import { renderProviderWindow } from "../../web/ts/ui/provider_window";
import { renderHotspotWindow } from "../../web/ts/ui/hotspot_window";
import { FakeDocument, FakeElement } from "./fake_dom";
import { allText, button, flush } from "./kind_test_helpers";

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
  for (const id of ["rtrw-gateway", "client-radio", "sector-radio", "provider-link", "hotspot-ap"]) {
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
