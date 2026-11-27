import { expect, test } from "bun:test";
import { readFileSync } from "fs";
import { join } from "path";

// tpl-l2-rtrw-hotspot.xml: the café sells time. The demo must not stop at
// "voucher opens the internet" — it also walks the clock past the validity
// so the capture shows the session lapse and the guest blocked again.
var text = readFileSync(join(import.meta.dir, "../../web/templates/tpl-l2-rtrw-hotspot.xml"), "utf8");

function attr(tag, name) {
  const m = text.match(new RegExp(`<${tag}\\b[^>]*\\b${name}="([^"]*)"`));
  return m ? m[1] : null;
}

function attrsAll(tag) {
  return [...text.matchAll(new RegExp(`<${tag}\\b([^>]*?)\\s*/>`, "g"))]
    .map((m) => Object.fromEntries([...m[1].matchAll(/([\w.]+)="([^"]*)"/g)].map((a) => [a[1], a[2]])));
}

test("hotspot: the voucher is sold with a validity the note states", () => {
  const vouchers = attrsAll("voucher");
  expect(vouchers).toHaveLength(1);
  const minutes = Number(vouchers[0].minutes);
  // The engine sells 1 minute to 7 days; a café hour keeps the play honest.
  expect(minutes).toBeGreaterThanOrEqual(1);
  expect(minutes).toBeLessThanOrEqual(10080);
  const note = attr("note", "text") ?? "";
  expect(note).toContain(`${minutes} minutes`);
  expect(note).toContain("voucher expired");
});

test("hotspot: the play redeems a voucher and then advances past its validity", () => {
  const demo = attrsAll("demo");
  const redeem = demo.findIndex((d) => d.kind === "voucher");
  const expire = demo.findIndex((d) => d.kind === "expire");
  expect(redeem).toBeGreaterThanOrEqual(0);
  expect(expire).toBeGreaterThan(redeem);
  // The same guest lapses: phone0 redeems, phone0 expires.
  expect(demo[redeem].from).toBe(demo[expire].from);
  // A working browse sits between pay and lapse so the capture shows the
  // open session before it runs out.
  const browse = demo.findIndex((d) => d.kind === "http" && d.from === demo[redeem].from);
  expect(browse).toBeGreaterThan(redeem);
  expect(browse).toBeLessThan(expire);
});

test("hotspot: expire steps point at the gateway that holds the vouchers", () => {
  const gateways = attrsAll("device").filter((d) => d.kind === "rtrw-gateway").map((d) => d.id);
  expect(gateways.length).toBeGreaterThan(0);
  for (const step of attrsAll("demo").filter((d) => d.kind === "expire")) {
    expect(gateways).toContain(step.to);
  }
});
