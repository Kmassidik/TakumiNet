import { expect, test } from "bun:test";
import { readFileSync } from "fs";
import { join } from "path";

// tpl-l5-overlay.xml: two tenant segments ride the same leaf-spine fabric.
// The template must wire the demo so a captured packet shows the VXLAN
// tunnel at the VTEP hops — the engine decodes it, but the XML must offer it.
var root = join(import.meta.dir, "../..");
var text = readFileSync(join(root, "web/templates/tpl-l5-overlay.xml"), "utf8");

function attr(tag, name) {
  const m = text.match(new RegExp(`<${tag}\\b[^>]*\\b${name}="([^"]*)"`));
  return m ? m[1] : null;
}

function attrsAll(tag) {
  return [...text.matchAll(new RegExp(`<${tag}\\b([^>]*?)\\s*/>`, "g"))]
    .map((m) => Object.fromEntries([...m[1].matchAll(/(\w+)="([^"]*)"/g)].map((a) => [a[1], a[2]])));
}

test("overlay: leaf VTEPs carry routable fabric addresses", () => {
  const ports = attrsAll("port");
  const leafAFabric = ports.find((p) => p.ip === "10.200.11.1");
  const leafBFabric = ports.find((p) => p.ip === "10.200.21.1");
  expect(leafAFabric).toBeTruthy();
  expect(leafBFabric).toBeTruthy();
  // The fabric links are real /30s, not borrowed server subnets.
  expect(leafAFabric.prefix).toBe("30");
  expect(leafBFabric.prefix).toBe("30");
  const spineEnds = ports.filter((p) => p.ip === "10.200.11.2" || p.ip === "10.200.21.2");
  expect(spineEnds.length).toBe(2);
});

test("overlay: both tenant segments join a VNI and the demo crosses the fabric", () => {
  const vnets = attrsAll("vnet2");
  expect(vnets.length).toBe(4);
  const byVni = Object.groupBy(vnets, (v) => v.vni);
  expect(Object.keys(byVni).sort()).toEqual(["100", "200"]);
  expect(byVni["100"].map((v) => v.dev).sort()).toEqual(["server0", "server2"]);
  expect(byVni["200"].map((v) => v.dev).sort()).toEqual(["server1", "server3"]);
  // Demo pings cross the fabric between leaves, so the capture shows the tunnel.
  const demo = attrsAll("demo").filter((d) => d.kind === "ping");
  expect(demo.length).toBe(4);
  for (const step of demo) {
    const fromA = step.from === "server0" || step.from === "server1";
    const toB = step.to === "server2" || step.to === "server3";
    // A→B and B→A both cross leaves; same-rack pings would not.
    expect(fromA === toB, `${step.from} → ${step.to} must cross leaves`).toBe(true);
  }
});

test("overlay: the note tells the reader what the capture shows", () => {
  const note = attr("note", "text") ?? "";
  expect(note).toContain("VXLAN");
  expect(note).toContain("VNI");
  expect(note).toContain("4789");
  expect(note).toContain("10.200.11.1");
  expect(note).toContain("10.200.21.1");
});

test("overlay: OSPF runs on every routed box so the underlay converges", () => {
  const routing = attrsAll("routing").filter((r) => r.proto === "ospf");
  expect(routing.map((r) => r.dev).sort()).toEqual(["l1", "l2", "s1", "s2"]);
  for (const dev of ["l1", "l2", "s1", "s2"]) {
    const nets = attrsAll("routenet").filter((n) => n.dev === dev);
    expect(nets.length).toBeGreaterThanOrEqual(2);
  }
});
