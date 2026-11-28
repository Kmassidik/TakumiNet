import { expect, test } from "bun:test";
import { readFileSync } from "fs";
import { join } from "path";

var lesson = readFileSync(join(import.meta.dir, "../../web/templates/les-l4-09-power-budget.xml"), "utf8");

function attrs(tag, text) {
  return [...text.matchAll(new RegExp(`<${tag}\\b([^>]*)/>`, "g"))].map((m) => m[1]);
}

test("lesson id, level and goal cite the real PoE standard", () => {
  expect(lesson).toContain('id="les-l4-09-power-budget"');
  expect(lesson).toMatch(/level="4"/);
  expect(lesson).toMatch(/IEEE 802\.3af/);
  expect(lesson).toMatch(/120 W/);
});

test("one switch feeds seven APS and two phones over the cable", () => {
  const poe = attrs("poe", lesson);
  expect(poe.filter((a) => a.includes('dev="ap'))).toHaveLength(7);
  expect(poe.filter((a) => a.includes('dev="phone'))).toHaveLength(2);
  // Every powered device is cabled to ClosetSwitch, HallAP on port 8.
  expect(lesson).toContain('<link a="switch0" a_port="FastEthernet0/8" b="ap6"');
  expect(lesson).toContain('<link a="switch0" a_port="FastEthernet0/10" b="phone2"');
  // The escape route: HallSwitch is cabled and has free ports.
  expect(lesson).toContain('<device id="switch1" kind="switch"');
  expect(lesson).toContain('<link a="switch0" a_port="FastEthernet0/24" b="switch1"');
});

test("the budget math in the steps adds up", () => {
  expect(lesson).toContain("107.8 W");
  expect(lesson).toContain("114.3 W");
  expect(lesson).toContain("120.8 W");
  expect(lesson).toMatch(/port order/);
  // 7 * 15.4 + 2 * 6.5 exceeds the budget; without the last phone it does not.
  expect(7 * 15.4 + 2 * 6.5).toBe(120.8);
  expect(7 * 15.4 + 1 * 6.5).toBeLessThan(120);
});

test("the check is a ping to the dark phone and passes only after the fix", () => {
  expect(lesson).toContain('<check id="c1" kind="ping" from="pc0" to="phone2"');
  expect(lesson).toMatch(/expect="ok"/);
  expect(lesson).not.toContain('kind="poe"'); // only verified check kinds
});
