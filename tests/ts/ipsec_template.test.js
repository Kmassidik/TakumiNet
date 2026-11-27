import { expect, test } from "bun:test";
import { readFileSync } from "fs";
import { join } from "path";

// tpl-l3-office-vpn.xml: two office LANs talk through a site-to-site ESP
// tunnel over the internet. The engine decodes the encapsulation, but the
// XML must configure matching tunnel ends, an IKE handshake step, and a
// demo that crosses the cloud so the capture shows ESP on the wire.
var root = join(import.meta.dir, "../..");
var text = readFileSync(join(root, "web/templates/tpl-l3-office-vpn.xml"), "utf8");

function attr(tag, name) {
  const m = text.match(new RegExp(`<${tag}\\b[^>]*\\b${name}="([^"]*)"`));
  return m ? m[1] : null;
}

function attrsAll(tag) {
  return [...text.matchAll(new RegExp(`<${tag}\\b([^>]*?)\\s*/>`, "g"))]
    .map((m) => Object.fromEntries([...m[1].matchAll(/(\w+)="([^"]*)"/g)].map((a) => [a[1], a[2]])));
}

test("vpn: both tunnel ends point at each other's WAN /30 and share a key", () => {
  const tunnels = attrsAll("tunnel");
  expect(tunnels.length).toBe(2);
  const byDev = Object.groupBy(tunnels, (t) => t.dev);
  expect(Object.keys(byDev).sort()).toEqual(["router0", "router1"]);
  // HomeEnd's WAN is 203.0.113.1/30, OfficeEnd's is 203.0.113.2/30.
  const ports = attrsAll("port");
  const homeWan = ports.find((p) => p.id === "router1" && p.ip === "203.0.113.1");
  const officeWan = ports.find((p) => p.id === "router0" && p.ip === "203.0.113.2");
  expect(homeWan).toBeTruthy();
  expect(officeWan).toBeTruthy();
  expect(homeWan.prefix).toBe("30");
  expect(officeWan.prefix).toBe("30");
  // Each end's peer is the other's WAN address, and both use the same key —
  // the key both ends derive the ESP SPI from.
  const home = tunnels.find((t) => t.dev === "router1");
  const office = tunnels.find((t) => t.dev === "router0");
  expect(home.peer).toBe("203.0.113.2");
  expect(office.peer).toBe("203.0.113.1");
  expect(home.key).toBe(office.key);
  expect(home.key.length).toBeGreaterThanOrEqual(4);
});

test("vpn: the demo plays IKE first, then a ping that crosses the cloud", () => {
  const demos = attrsAll("demo");
  // Step 1 brings the tunnel up in the capture: the IKE handshake.
  expect(demos[0].kind).toBe("ike");
  expect(demos[0].from).toBe("router1");
  // A ping then crosses the internet between the two private LANs, so the
  // capture shows the ESP-encapsulated frame at the WAN hop.
  const cross = demos.filter((d) => d.kind === "ping" && (
    (d.from === "laptop0" && d.to === "server0") || (d.from === "server0" && d.to === "laptop0")
  ));
  expect(cross.length).toBeGreaterThanOrEqual(1);
});

test("vpn: the note tells the reader the capture shows ESP, not the private IPs", () => {
  const note = attr("note", "text") ?? "";
  expect(note).toContain("ESP");
  expect(note).toContain("203.0.113.1");
  expect(note).toContain("203.0.113.2");
  expect(note).toContain("protocol 50");
  expect(note).toContain("SPI");
  expect(note).toContain("tunnel");
});

test("vpn: the WAN /30 carries only the two gateway addresses", () => {
  const ports = attrsAll("port").filter((p) => p.ip?.startsWith("203.0.113."));
  expect(ports.length).toBe(2);
  // Static routes point across the /30 toward the remote private LAN.
  const routes = attrsAll("route");
  const homeRoute = routes.find((r) => r.id === "router1" && r.net === "192.168.20.0");
  const officeRoute = routes.find((r) => r.id === "router0" && r.net === "192.168.99.0");
  expect(homeRoute?.via).toBe("203.0.113.2");
  expect(officeRoute?.via).toBe("203.0.113.1");
});
