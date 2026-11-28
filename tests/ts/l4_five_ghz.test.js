import { expect, test } from "bun:test";
import { readFileSync } from "fs";
import { join } from "path";

var text = readFileSync(join(import.meta.dir, "../../web/templates/les-l4-10-five-ghz.xml"), "utf8");

test("lesson structure follows the takumi format", () => {
  expect(text).toContain('<takumi version="1">');
  expect(text).toMatch(/<lesson id="les-l4-10-five-ghz" title="[^"]+" level="4" minutes="\d+" goal="[^"]+"/);
  // Two access points, each on its own radio record.
  const aps = [...text.matchAll(/<device id="(ap\d)" kind="ap"/g)].map((m) => m[1]);
  expect(aps).toEqual(["ap0", "ap1"]);
  const radios = [...text.matchAll(/<wifiradio dev="(ap\d)" channel="(\d+)" band="([^"]+)"/g)].map((m) => m.slice(1));
  expect(radios).toHaveLength(2);
  // Both start crowded on 2.4 GHz, channels fewer than five apart.
  expect(radios).toContainEqual(["ap0", "1", "2.4"]);
  expect(radios).toContainEqual(["ap1", "3", "2.4"]);
  // One overlap check that clears once the student moves to 5 GHz.
  const checks = [...text.matchAll(/<check id="([^"]+)" kind="([^"]+)" from="([^"]+)"/g)].map((m) => m.slice(1));
  expect(checks).toContainEqual(["c1", "overlap", "ap0"]);
});

test("the steps teach the IEEE 802.11 channel story", () => {
  expect(text).toMatch(/IEEE 802\.11/);
  expect(text).toMatch(/channels 1, 6 and 11/);
  expect(text).toMatch(/5 GHz/);
  expect(text).toMatch(/channel 36/);
  // The goal names the real problem and the real fix.
  expect(text).toMatch(/three non-overlapping channels/);
});
