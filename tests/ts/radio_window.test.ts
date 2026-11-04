import { expect, test } from "bun:test";
import { portDelayMs, renderRadioWindow } from "../../web/ts/ui/radio_window";
import { FakeDocument, FakeElement } from "./fake_dom";
import { allText, button, flush } from "./kind_test_helpers";

const workspace = {
  devices: [
    { id: "radio9", name: "RadioJauh" },
    { id: "sector1", name: "MenaraSektor" },
  ],
  links: [{ a: "radio9", aPort: "FastEthernet0", b: "sector1", bPort: "FastEthernet1" }],
};

const saved = [
  '<port id="radio9" name="FastEthernet0" up="1" ip="" prefix="24" vlan="1" trunk="0" dot1q="" bandwidth_kbps="10000" delay_us="60000"/>',
  '<port id="gw0" name="Ether1" up="1" ip="203.0.113.2" prefix="24" vlan="1" trunk="0" dot1q="" bandwidth_kbps="100000" delay_us="500000"/>',
].join("\n");

test("the saved workspace gives the port delay in milliseconds", () => {
  expect(portDelayMs(saved, "radio9")).toBe("60");
  expect(portDelayMs(saved, "sector1")).toBe("0.1");
});

test("a client radio shows its cabled links and the delay it adds", async () => {
  const doc = new FakeDocument();
  const body = new FakeElement("div");
  const device = { id: "radio9", name: "RadioJauh", kind: "client-radio" };
  await renderRadioWindow(doc, body, device, workspace, async () => saved);
  const text = allText(body);
  expect(text).toContain("FastEthernet0 to MenaraSektor FastEthernet1");
  expect(text).toContain("adds 60 ms");
});

test("a sector radio shows its links and asks nothing from the network", async () => {
  const doc = new FakeDocument();
  const body = new FakeElement("div");
  const device = { id: "sector1", name: "MenaraSektor", kind: "sector-radio" };
  await renderRadioWindow(doc, body, device, workspace, async () => {
    throw new Error("a sector radio must not fetch");
  });
  const text = allText(body);
  expect(text).toContain("FastEthernet1 to RadioJauh FastEthernet0");
  expect(text).not.toContain("adds");
});

test("a radio with no cable shows the empty state", async () => {
  const doc = new FakeDocument();
  const body = new FakeElement("div");
  const device = { id: "sector1", name: "MenaraSektor", kind: "sector-radio" };
  await renderRadioWindow(doc, body, device, { devices: [], links: [] }, async () => saved);
  expect(allText(body)).toContain("No cable is connected yet.");
});

test("a failed delay read shows the error state with a working retry", async () => {
  const doc = new FakeDocument();
  const body = new FakeElement("div");
  const device = { id: "radio9", name: "RadioJauh", kind: "client-radio" };
  let healthy = false;
  await renderRadioWindow(doc, body, device, workspace, async () => {
    if (!healthy) throw new Error("down");
    return saved;
  });
  expect(allText(body)).toContain("Could not read the radio delay.");
  healthy = true;
  button(body, "Try again").click();
  await flush();
  expect(allText(body)).toContain("adds 60 ms");
});
