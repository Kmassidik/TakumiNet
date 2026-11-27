import { expect, test } from "bun:test";
import { readFileSync } from "fs";
import { join } from "path";
var root = join(import.meta.dir, "../..");
var xml = readFileSync(join(root, "web/templates/tpl-l4-campus-three-layer.xml"), "utf8");

var element = (name, attrs) => elements(name).find((out) => attrs.every(([k, v]) => out[k] === v)) || null;
var elements = (name) => [...xml.matchAll(new RegExp(`<${name}\\b([^>]*)/>`, "g"))].map((m) => {
  const out = {};
  for (const a of m[1].matchAll(/(\w+)="([^"]*)"/g)) out[a[1]] = a[2];
  return out;
});

test("three layer campus: both distribution switches share each floor gateway with VRRP", () => {
  const groups = elements("fhrp").filter((g) => g.hsrp === "0");
  expect(groups.length).toBe(6);
  // Every floor gateway has exactly one preferred switch and one backup.
  for (const vip of ["172.17.10.1", "172.17.20.1", "172.18.10.1"]) {
    const members = groups.filter((g) => g.vip === vip);
    expect(members.map((m) => m.dev).sort()).toEqual(["d1", "d2"]);
    const prios = members.map((m) => Number(m.priority));
    expect(prios.some((p) => p > Math.max(...prios.filter((q) => q !== p))), `${vip} needs one preferred member`).toBe(true);
  }
  // Floor A: DistA is preferred; Floor B: DistB is the only member.
  expect(element("fhrp", [["dev", "d1"], ["vip", "172.17.10.1"], ["priority", "110"]])).toBeTruthy();
  expect(element("fhrp", [["dev", "d2"], ["vip", "172.17.10.1"], ["priority", "100"]])).toBeTruthy();
  expect(element("fhrp", [["dev", "d2"], ["vip", "172.18.10.1"], ["priority", "110"]])).toBeTruthy();
});

test("three layer campus: hosts point at the virtual addresses, never a real port", () => {
  const portIps = elements("port").map((p) => p.ip);
  for (const [pc, gw] of [["pc0", "172.17.10.1"], ["pc1", "172.17.20.1"], ["pc2", "172.18.10.1"]]) {
    expect(element("net", [["id", pc], ["gw", gw]]), `${pc} must use ${gw}`).toBeTruthy();
    expect(portIps, `${gw} must not sit on any port`).not.toContain(gw);
  }
  // Both distribution switches hold a real address in every gateway subnet.
  for (const subnet of ["172.17.10.", "172.17.20."]) {
    const holders = elements("port").filter((p) => (p.ip || "").startsWith(subnet)).map((p) => p.id);
    expect(holders).toEqual(expect.arrayContaining(["d1", "d2"]));
  }
});

test("three layer campus: a distribution transit link and OSPF keep failover honest", () => {
  expect(element("link", [["a", "d1"], ["a_port", "Gig0/3"], ["b", "d2"], ["b_port", "Gig0/3"]]), "DistA-DistB transit").toBeTruthy();
  for (const dev of ["d1", "d2", "core0"]) {
    expect(element("routing", [["dev", dev], ["proto", "ospf"]]), `${dev} runs OSPF`).toBeTruthy();
  }
  expect(elements("routenet").some((r) => r.dev === "d2" && r.net === "10.0.23.0"), "the transit subnet is advertised").toBe(true);
});

test("three layer campus: the note describes the redundancy truthfully", () => {
  const note = element("note", [["id", "note0"]]);
  expect(note).toBeTruthy();
  for (const phrase of ["VRRP", "both distribution switches share"]) {
    expect(note.text, `the note must say: ${phrase}`).toContain(phrase);
  }
  expect(note.text).toMatch(/power off DistA/);
});

test("three layer campus: built-in traffic still rides the template", () => {
  const demos = elements("demo").filter((d) => d.kind === "ping");
  expect(demos.length).toBeGreaterThanOrEqual(4);
  expect(demos.every((d) => element("device", [["id", d.from]]) && element("device", [["id", d.to]]))).toBe(true);
});
