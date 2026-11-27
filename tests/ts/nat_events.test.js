import { expect, test } from "bun:test";
import { readFileSync } from "fs";
import { join } from "path";

var lastMile = readFileSync(join(import.meta.dir, "../../web/templates/tpl-last-mile.xml"), "utf8");
var loadBalanced = readFileSync(join(import.meta.dir, "../../web/templates/tpl-l5-load-balanced-web.xml"), "utf8");

test("last mile demo plays home browsing over both NAT gateways", () => {
  const steps = [...lastMile.matchAll(/<demo kind="([^"]*)" from="([^"]*)"/g)].map((m) => ({ kind: m[1], from: m[2] }));
  const inside = [...lastMile.matchAll(/<natrole dev="([^"]*)" iface="([^"]*)" dir="([^"]*)"/g)];
  const rules = [...lastMile.matchAll(/<natrule dev="([^"]*)" num="([^"]*)" iface="([^"]*)"/g)];
  // Each gateway marks its LAN side inside, its ISP side outside, and holds a
  // masquerade rule for the LAN.
  for (const gw of ["gw0", "gw1"]) {
    const roles = inside.filter((m) => m[1] === gw);
    expect(roles.map((m) => m[3]).sort()).toEqual(["inside", "outside"]);
    expect(rules.some((m) => m[1] === gw && m[2] === "1")).toBe(true);
  }
  // The play crosses both gateways so both translations hit the capture.
  expect(steps).toContainEqual({ kind: "ping", from: "pc0" });
  expect(steps).toContainEqual({ kind: "ping", from: "pc1" });
  expect(steps.filter((s) => s.kind === "http" && s.from === "pc0")).toHaveLength(1);
  expect(steps.filter((s) => s.kind === "http" && s.from === "pc1")).toHaveLength(1);
});

test("natrole records use spellings the engine loader accepts", () => {
  const files = [lastMile, loadBalanced];
  for (const text of files) {
    for (const m of text.matchAll(/<natrole [^/]*dir="([^"]*)"/g)) {
      expect(["in", "inside", "out", "outside"]).toContain(m[1]);
    }
  }
});
