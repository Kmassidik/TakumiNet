import { expect, test } from "bun:test";
import { portCardText, portLight, portMedia, portStateText, renderPortFaceplate, type FaceplatePort } from "../../web/ts/ui/port_faceplate";
import { FakeDocument, FakeElement } from "./fake_dom";
import { allText, find } from "./kind_test_helpers";

function port(overrides: Partial<FaceplatePort>): FaceplatePort {
  return {
    name: "GigabitEthernet0/0",
    ip: null,
    prefix: 0,
    up: true,
    peer: null,
    eth: true,
    speed: "auto",
    duplex: "auto",
    link: "",
    fault: "",
    media: "rj45",
    cable: "eCopper",
    linkUp: false,
    ...overrides,
  };
}

test("state combines admin, link and cable facts", () => {
  expect(portLight(port({}))).toBe("free");
  expect(portLight(port({ peer: { id: "sw", name: "Switch0", port: "Fa0/1" }, linkUp: true }))).toBe("up");
  expect(portLight(port({ peer: { id: "sw", name: "Switch0", port: "Fa0/1" }, linkUp: false, fault: "speed" }))).toBe("no-link");
  expect(portLight(port({ up: false }))).toBe("shut");
  expect(portLight(port({ errdisabled: "BPDU guard" }))).toBe("shut");
});

test("state text is readable and names fibre and the far end", () => {
  const fibre = port({
    media: "sfp",
    cable: "eFiber",
    linkUp: true,
    link: "1000 Mb/s, full duplex",
    peer: { id: "sw1", name: "Switch1", port: "GigabitEthernet0/1" },
  });
  expect(portStateText(fibre)).toBe("connected · optical fibre · 1000 Mb/s, full duplex · to Switch1 GigabitEthernet0/1");
  expect(portCardText(fibre)).toBe("connected · fibre · 1000 Mb/s");
  expect(portCardText(port({ peer: { id: "s", name: "S", port: "Fa0/1" }, linkUp: true, link: "100 Mb/s, full duplex", fault: "duplex" }))).toBe("connected · duplex mismatch");
  expect(portStateText(port({}))).toBe("free");
  expect(portStateText(port({ up: false }))).toBe("shut down");
  expect(portStateText(port({ peer: { id: "s", name: "S", port: "Fa0/1" }, linkUp: false, fault: "speed" }))).toBe("no link");
  expect(portStateText(port({ errdisabled: "storm control" }))).toBe("shut down · storm control");
});

test("media falls back to rj45 and the connector follows it", () => {
  expect(portMedia(port({ media: undefined }))).toBe("rj45");
  const doc = new FakeDocument();
  const box = new FakeElement("div");
  renderPortFaceplate(doc, box, [
    port({ name: "Fa0/1", cable: "eFiber", media: "sfp", linkUp: true, peer: { id: "s", name: "S", port: "Fa0/2" } }),
    port({ name: "Serial0/0/0", media: "serial", eth: false, cable: "eSerial" }),
    port({ name: "Fa0/9", up: false, cable: null, linkUp: false }),
    port({ name: "Fa0/8", media: "rj45", cable: "eCopper", autoMdix: true, mdi: "mdi" }),
  ]);
  const wrap = (box as unknown as { children: FakeElement[] }).children[0]!;
  const grid = wrap.children.find((c) => c.className === "port-jack-grid")!;
  const cards = [...grid.children];
  const jacks = cards.filter((c) => c.className.startsWith("port-jack"));
  expect(jacks.length).toBe(4);
  expect(jacks[0]!.className).toContain("cable-fiber");
  expect(jacks[0]!.getAttribute("data-media")).toBe("sfp");
  expect(jacks[0]!.getAttribute("data-state")).toBe("up");
  expect(jacks[1]!.getAttribute("data-media")).toBe("serial");
  expect(jacks[2]!.getAttribute("data-state")).toBe("shut");
  const text = allText(box);
  expect(text).toContain("Ports");
  expect(text).toContain("Auto-MDI-X: either copper cable works.");
  expect(text).toContain("No link");
  expect(text).toContain("fibre");
  expect(find(box, (n) => n.className === "port-legend") !== null).toBe(true);
  expect(jacks[3]!.title).toContain("auto-MDI-X");
  expect(jacks[0]!.title).not.toContain("auto-MDI-X");
});
