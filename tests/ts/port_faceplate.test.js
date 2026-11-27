import { expect, test } from "bun:test";
import { portCardText, portLight, portMedia, portStateText, renderPortFaceplate } from "../../web/js/mod/ui/port_faceplate.js";

// tests/ts/fake_dom.js
class FakeElement {
  textContent = "";
  title = "";
  className = "";
  value = "";
  disabled = false;
  dataset = {};
  children = [];
  parent = null;
  attrs = new Map;
  listeners = new Map;
  tagName;
  constructor(tagName) {
    this.tagName = tagName.toUpperCase();
  }
  setAttribute(name, value) {
    this.attrs.set(name, value);
  }
  getAttribute(name) {
    return this.attrs.get(name) ?? null;
  }
  addEventListener(type, handler) {
    this.listeners.set(type, [...this.listeners.get(type) ?? [], handler]);
  }
  appendChild(child) {
    child.remove();
    child.parent = this;
    this.children.push(child);
    return child;
  }
  focus() {}
  select() {}
  replaceChildren() {
    for (const child of this.children)
      child.parent = null;
    this.children = [];
  }
  remove() {
    if (!this.parent)
      return;
    this.parent.children = this.parent.children.filter((c) => c !== this);
    this.parent = null;
  }
  dispatch(type, event) {
    for (const handler of this.listeners.get(type) ?? []) {
      handler({ key: "", target: this, preventDefault() {}, ...event });
    }
  }
  click() {
    if (this.disabled)
      return;
    for (const handler of this.listeners.get("click") ?? []) {
      handler({ key: "", target: this, preventDefault() {} });
    }
  }
}

class FakeDocument {
  body = new FakeElement("body");
  activeElement = null;
  createElement(tag) {
    return new FakeElement(tag);
  }
}

// tests/ts/kind_test_helpers.js
function allText(el) {
  return [el.textContent ?? "", ...el.children.map(allText)].filter(Boolean).join(" ");
}
function find(el, match) {
  if (match(el))
    return el;
  for (const child of el.children) {
    const hit = find(child, match);
    if (hit)
      return hit;
  }
  return null;
}

// tests/ts/__conv_port_faceplate.ts
function port(overrides) {
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
    ...overrides
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
    peer: { id: "sw1", name: "Switch1", port: "GigabitEthernet0/1" }
  });
  expect(portStateText(fibre)).toBe("connected \xB7 optical fibre \xB7 1000 Mb/s, full duplex \xB7 to Switch1 GigabitEthernet0/1");
  expect(portCardText(fibre)).toBe("connected \xB7 fibre \xB7 1000 Mb/s");
  expect(portCardText(port({ peer: { id: "s", name: "S", port: "Fa0/1" }, linkUp: true, link: "100 Mb/s, full duplex", fault: "duplex" }))).toBe("connected \xB7 duplex mismatch");
  expect(portStateText(port({}))).toBe("free");
  expect(portStateText(port({ up: false }))).toBe("shut down");
  expect(portStateText(port({ peer: { id: "s", name: "S", port: "Fa0/1" }, linkUp: false, fault: "speed" }))).toBe("no link");
  expect(portStateText(port({ errdisabled: "storm control" }))).toBe("shut down \xB7 storm control");
});
test("media falls back to rj45 and the connector follows it", () => {
  expect(portMedia(port({ media: undefined }))).toBe("rj45");
  const doc = new FakeDocument;
  const box = new FakeElement("div");
  renderPortFaceplate(doc, box, [
    port({ name: "Fa0/1", cable: "eFiber", media: "sfp", linkUp: true, peer: { id: "s", name: "S", port: "Fa0/2" } }),
    port({ name: "Serial0/0/0", media: "serial", eth: false, cable: "eSerial" }),
    port({ name: "Fa0/9", up: false, cable: null, linkUp: false }),
    port({ name: "Fa0/8", media: "rj45", cable: "eCopper", autoMdix: true, mdi: "mdi" })
  ]);
  const wrap = box.children[0];
  const grid = wrap.children.find((c) => c.className === "port-jack-grid");
  const cards = [...grid.children];
  const jacks = cards.filter((c) => c.className.startsWith("port-jack"));
  expect(jacks.length).toBe(4);
  expect(jacks[0].className).toContain("cable-fiber");
  expect(jacks[0].getAttribute("data-media")).toBe("sfp");
  expect(jacks[0].getAttribute("data-state")).toBe("up");
  expect(jacks[1].getAttribute("data-media")).toBe("serial");
  expect(jacks[2].getAttribute("data-state")).toBe("shut");
  const text = allText(box);
  expect(text).toContain("Ports");
  expect(text).toContain("Auto-MDI-X: either copper cable works.");
  expect(text).toContain("No link");
  expect(text).toContain("fibre");
  expect(find(box, (n) => n.className === "port-legend") !== null).toBe(true);
  expect(jacks[3].title).toContain("auto-MDI-X");
  expect(jacks[0].title).not.toContain("auto-MDI-X");
});
