import { expect, test } from "bun:test";
import { readFileSync } from "fs";
import { join } from "path";

// tpl-l2-rtrw-busy.xml: the busy WISP promises congestion in its note and its
// demands — four PPPoE homes pulling 110 Mbit/s through a 100 Mbit/s upstream.
// The engine models the steady-state outcome (per-session granted rate, drop
// share, queue delay; src/workspace/congestion.rs), and the template's play
// must end in a `demand` step so the beat actually fires on Play.
var text = readFileSync(join(import.meta.dir, "../../web/templates/tpl-l2-rtrw-busy.xml"), "utf8");

function attrsAll(tag) {
  return [...text.matchAll(new RegExp(`<${tag}\\b([^>]*?)\\s*/>`, "g"))]
    .map((m) => Object.fromEntries([...m[1].matchAll(/(\w+)="([^"]*)"/g)].map((a) => [a[1], a[2]])));
}

function attr(tag, name) {
  const m = text.match(new RegExp(`<${tag}\\b[^>]*\\b${name}="([^"]*)"`));
  return m ? m[1] : null;
}

test("busy: the play ends in a demand congestion beat on the gateway", () => {
  const demos = attrsAll("demo");
  const beat = demos.find((d) => d.kind === "congestion");
  expect(beat).toBeTruthy();
  expect(beat.from).toBe("gw0");
  // The beat is the finale: logins and routine traffic run before it.
  expect(demos.indexOf(beat)).toBe(demos.length - 1);
});

test("busy: evening demand really saturates the 100 Mbit/s upstream", () => {
  const demands = attrsAll("demand");
  expect(demands.length).toBe(4);
  const total = demands.reduce((sum, d) => sum + Number(d.mbit), 0);
  const uplink = attrsAll("port").find((p) => p.id === "gw0" && p.name === "Ether1");
  expect(Number(uplink.bandwidth_kbps)).toBe(100000);
  expect(total).toBeGreaterThan(100);
  // The shared upstream is one parent queue: the template must declare the
  // 100 Mbit/s group cap so the engine's fair-share math has a bottleneck.
  const parents = attrsAll("qparent").filter((p) => p.dev === "gw0");
  expect(parents).toHaveLength(1);
  expect(Number(parents[0].mbit)).toBe(100);
  // No per-home limit: the pile-up is what makes the beat saturate.
  expect(text).not.toMatch(/<queue\b/);
});

test("busy: no per-customer queue row softens the saturation story", () => {
  // The lesson fixes this by adding limits; the busy template stays raw.
  expect(attrsAll("queue")).toHaveLength(0);
});

test("busy: the note names the congestion beat and its honest limits", () => {
  const note = attr("note", "text") ?? "";
  expect(note).toContain("congestion");
  expect(note).toContain("queue drop");
  expect(note).toContain("steady-state");
  expect(note).toContain("110 Mbit/s");
});
