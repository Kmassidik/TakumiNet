import { expect, test } from "bun:test";
import { readFileSync } from "fs";
import { join } from "path";

var text = readFileSync(join(import.meta.dir, "../../web/templates/les-l4-11-preemption.xml"), "utf8");

var checks = [...text.matchAll(/<check id="([^"]+)" kind="([^"]+)" from="([^"]+)" to="([^"]+)"/g)].map((m) => m.slice(1));

test("lesson structure follows the takumi format and stays lesson-only", () => {
  expect(text).toContain('<takumi version="1">');
  expect(text).toMatch(/<lesson id="les-l4-11-preemption" title="[^"]+" level="4" minutes="\d+" goal="[^"]+"/);
  // Steps and checks are wired: every referenced check id exists on a check element.
  const stepChecks = [...text.matchAll(/<step n="\d+" text="[^"]+"(?: check="([^"]+)")?\/>/g)].map((m) => m[1]).filter(Boolean);
  const ids = checks.map((c) => c[0]);
  for (const id of stepChecks) expect(ids, `check ${id} must exist`).toContain(id);
  // Lessons carry no built-in demo traffic; the learner sends every packet.
  expect(text).not.toContain("<demo");
  expect(checks.every((c) => c[1] === "ping"), "every check is a ping across the group").toBe(true);
});

test("two gateways share one virtual address on the PC-facing segment", () => {
  const gw0 = text.match(/<port id="gw0" name="GigabitEthernet0\/0" up="1" ip="192\.168\.70\.2"/);
  const gw1 = text.match(/<port id="gw1" name="GigabitEthernet0\/0" up="1" ip="192\.168\.70\.3"/);
  expect(gw0 && gw1, "both gateways hold a real address in the shared subnet").toBeTruthy();
  // The virtual address belongs to no port.
  expect(text).not.toMatch(/ip="192\.168\.70\.1"/);
  // The PC points at the virtual address, never at a real router.
  expect(text).toContain('<net id="pc0" gw="192.168.70.1"');
});

test("the steps teach RFC 5798 preemption and the master-down arithmetic", () => {
  expect(text).toMatch(/RFC 5798/);
  // Priority 150 master over priority 100 backup, the lesson's whole point.
  expect(text).toContain("vrrp 1 ip 192.168.70.1 priority 150");
  expect(text).toContain("vrrp 1 ip 192.168.70.1 priority 100");
  // Master-down = three adverts plus skew; skew written out for 150.
  expect(text).toMatch(/three adverts plus the skew time/);
  expect(text).toMatch(/3 x 1 s \+ \(256-150\)\/256 s/);
  // Preemption on recovery is taught as election, and the PC keeps its settings.
  expect(text).toMatch(/preempts/);
  expect(text).toMatch(/never changes its settings/);
  // The timer lesson: advertise 200 ms, then the cut heals in about a second.
  expect(text).toContain("vrrp 1 timers advertise 200");
  expect(text).toMatch(/3 x 200 ms \+ 0\.41 s skew/);
});
