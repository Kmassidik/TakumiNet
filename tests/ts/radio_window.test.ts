import { expect, test } from "bun:test";
import { portDelayMs, renderRadioWindow } from "../../web/ts/ui/radio_window";
import { FakeDocument, FakeElement } from "./fake_dom";
import { allText, button, flush } from "./kind_test_helpers";

const radioPorts = JSON.stringify({
  ports: [
    { name: "FastEthernet0", ip: null, prefix: 0, up: true, peer: { id: "sector1", name: "MenaraSektor", port: "FastEthernet1" } },
    { name: "FastEthernet1", ip: null, prefix: 0, up: true, peer: null },
  ],
});

const saved = [
  '<port id="radio9" name="FastEthernet0" up="1" ip="" prefix="24" vlan="1" trunk="0" dot1q="" bandwidth_kbps="10000" delay_us="60000"/>',
  '<port id="gw0" name="Ether1" up="1" ip="203.0.113.2" prefix="24" vlan="1" trunk="0" dot1q="" bandwidth_kbps="100000" delay_us="500000"/>',
].join("\n");

const getText = async (path: string): Promise<string> =>
  path.startsWith("/api/devices/ports") ? radioPorts : saved;
const post = async (): Promise<Record<string, unknown>> => ({});

test("the saved workspace gives the port delay in milliseconds", () => {
  expect(portDelayMs(saved, "radio9")).toBe("60");
  expect(portDelayMs(saved, "sector1")).toBe("0.1");
});

test("a client radio shows its ports, the far end and the delay it adds", async () => {
  const doc = new FakeDocument();
  const body = new FakeElement("div");
  const device = { id: "radio9", name: "RadioJauh", kind: "client-radio" };
  await renderRadioWindow(doc, body, device, getText, post);
  const text = allText(body);
  expect(text).toContain("FastEthernet0 connected to MenaraSektor FastEthernet1");
  expect(text).toContain("FastEthernet1 free");
  expect(text).toContain("adds 60 ms");
});

test("a sector radio shows its ports without the delay section", async () => {
  const doc = new FakeDocument();
  const body = new FakeElement("div");
  const device = { id: "sector1", name: "MenaraSektor", kind: "sector-radio" };
  await renderRadioWindow(doc, body, device, getText, post);
  const text = allText(body);
  expect(text).toContain("FastEthernet0 connected to MenaraSektor FastEthernet1");
  expect(text).not.toContain("adds");
});

test("a port toggle posts the exact interface and reloads the rows", async () => {
  const doc = new FakeDocument();
  const body = new FakeElement("div");
  const device = { id: "sector1", name: "MenaraSektor", kind: "sector-radio" };
  const posts: string[] = [];
  await renderRadioWindow(doc, body, device, getText, async (path) => {
    posts.push(path);
    return {};
  });
  button(body, "Shut down").click();
  await flush();
  expect(posts).toEqual(["/api/devices/port?id=sector1&port=FastEthernet0&up=0"]);
});

test("a failed delay read shows the error state with a working retry", async () => {
  const doc = new FakeDocument();
  const body = new FakeElement("div");
  const device = { id: "radio9", name: "RadioJauh", kind: "client-radio" };
  let healthy = false;
  await renderRadioWindow(doc, body, device, async (path) => {
    if (path.startsWith("/api/devices/ports")) return radioPorts;
    if (!healthy) throw new Error("down");
    return saved;
  }, post);
  expect(allText(body)).toContain("Could not read the radio delay.");
  healthy = true;
  button(body, "Try again").click();
  await flush();
  expect(allText(body)).toContain("adds 60 ms");
});
