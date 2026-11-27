import { expect, test } from "bun:test";
import { readFileSync } from "fs";
import { join } from "path";

var office = readFileSync(join(import.meta.dir, "../../web/templates/tpl-office-voice.xml"), "utf8");
var home = readFileSync(join(import.meta.dir, "../../web/templates/tpl-home-phone.xml"), "utf8");

function trunks(text) {
  return new Map([...text.matchAll(/<port id="([^"]*)" name="([^"]*)"[^>]*trunk="1"/g)].map((m) => [`${m[1]} ${m[2]}`]));
}
function vlans(text) {
  return [...text.matchAll(/<vlan id="([^"]*)" vlan="(\d+)" name="([^"]*)"/g)].map((m) => ({ id: m[1], vlan: Number(m[2]), name: m[3] }));
}
function subs(text) {
  return [...text.matchAll(/<port id="([^"]*)" name="([^"]*\.\d+)"[^>]*dot1q="(\d+)"/g)].map((m) => ({ id: m[1], name: m[2], dot1q: Number(m[3]) }));
}

test("office phone ports are data+voice trunks in a named voice VLAN", () => {
  expect(vlans(office)).toContainEqual({ id: "switch0", vlan: 110, name: "voice" });
  const t = trunks(office);
  // The phone ports and the router uplink carry the tagged voice VLAN; the
  // CallManager port stays an ordinary access port.
  expect(t.has("switch0 FastEthernet0/1")).toBe(true);
  expect(t.has("switch0 FastEthernet0/3")).toBe(true);
  expect(t.has("switch0 FastEthernet0/4")).toBe(true);
  expect(t.has("switch0 FastEthernet0/2")).toBe(false);
  // The voice gateway is a router subinterface tagged 110.
  expect(subs(office)).toContainEqual({ id: "router0", name: "GigabitEthernet0/0.110", dot1q: 110 });
  // Phones sit in the voice subnet and point at its gateway.
  expect(office).toContain('<net id="phone1" gw="10.20.110.1"');
  expect(office).toContain('<net id="phone2" gw="10.20.110.1"');
});

test("home desk phone port is a voice trunk and the analog line stays untagged", () => {
  expect(vlans(home)).toContainEqual({ id: "switch0", vlan: 110, name: "voice" });
  const t = trunks(home);
  expect(t.has("switch0 FastEthernet0/3")).toBe(true);
  expect(t.has("switch0 FastEthernet0/1")).toBe(true);
  expect(subs(home)).toContainEqual({ id: "router0", name: "GigabitEthernet0/0.110", dot1q: 110 });
  expect(home).toContain('<net id="phone1" gw="10.30.110.1"');
  // The analog phone hangs on an ePhone port; no port, VLAN or trunk for it.
  expect(home).toContain('<link a="router0" a_port="Voice0" b="analog0"');
});

test("desk phones are powered over their cable and the notes say so", () => {
  expect(office).toContain('<poe dev="phone1"/>');
  expect(office).toContain('<poe dev="phone2"/>');
  expect(home).toContain('<poe dev="phone1"/>');
  // The analog phone has no PoE record: the ePhone loop is its power.
  expect(home).not.toContain('<poe dev="analog0"');
  for (const [name, text] of [["office", office], ["home", home]]) {
    expect(text, name).toMatch(/PoE, IEEE 802\.3af/);
    expect(text, name).toMatch(/voice VLAN 110/);
  }
});
