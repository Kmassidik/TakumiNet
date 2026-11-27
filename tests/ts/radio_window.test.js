import { expect, test } from "bun:test";
import { portDelayMs, renderRadioWindow } from "../../web/js/mod/ui/radio_window.js";

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
function button(root, label) {
  const hit = find(root, (n) => n.tagName === "BUTTON" && n.textContent === label);
  if (!hit)
    throw new Error(`no button labelled ${label}`);
  return hit;
}
function flush() {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

// tests/ts/__conv_radio_window.ts
var radioPorts = JSON.stringify({
  ports: [
    { name: "FastEthernet0", ip: null, prefix: 0, up: true, peer: { id: "sector1", name: "MenaraSektor", port: "FastEthernet1" } },
    { name: "FastEthernet1", ip: null, prefix: 0, up: true, peer: null }
  ]
});
var saved = [
  '<port id="radio9" name="FastEthernet0" up="1" ip="" prefix="24" vlan="1" trunk="0" dot1q="" bandwidth_kbps="10000" delay_us="60000"/>',
  '<port id="gw0" name="Ether1" up="1" ip="203.0.113.2" prefix="24" vlan="1" trunk="0" dot1q="" bandwidth_kbps="100000" delay_us="500000"/>'
].join(`
`);
var getText = async (path) => path.startsWith("/api/devices/ports") ? radioPorts : saved;
var post = async () => ({});
test("the saved workspace gives the port delay in milliseconds", () => {
  expect(portDelayMs(saved, "radio9")).toBe("60");
  expect(portDelayMs(saved, "sector1")).toBe("0.1");
});
test("a client radio shows its ports, the far end and the delay it adds", async () => {
  const doc = new FakeDocument;
  const body = new FakeElement("div");
  const device = { id: "radio9", name: "RadioJauh", kind: "client-radio" };
  await renderRadioWindow(doc, body, device, getText, post);
  const text = allText(body);
  expect(text).toContain("FastEthernet0 connected to MenaraSektor FastEthernet1");
  expect(text).toContain("FastEthernet1 free");
  expect(text).toContain("adds 60 ms");
});
test("a sector radio shows its ports without the delay section", async () => {
  const doc = new FakeDocument;
  const body = new FakeElement("div");
  const device = { id: "sector1", name: "MenaraSektor", kind: "sector-radio" };
  await renderRadioWindow(doc, body, device, getText, post);
  const text = allText(body);
  expect(text).toContain("FastEthernet0 connected to MenaraSektor FastEthernet1");
  expect(text).not.toContain("adds");
});
test("a port toggle posts the exact interface and reloads the rows", async () => {
  const doc = new FakeDocument;
  const body = new FakeElement("div");
  const device = { id: "sector1", name: "MenaraSektor", kind: "sector-radio" };
  const posts = [];
  await renderRadioWindow(doc, body, device, getText, async (path) => {
    posts.push(path);
    return {};
  });
  button(body, "Shut down").click();
  await flush();
  expect(posts).toEqual(["/api/devices/port?id=sector1&port=FastEthernet0&up=0"]);
});
test("a failed delay read shows the error state with a working retry", async () => {
  const doc = new FakeDocument;
  const body = new FakeElement("div");
  const device = { id: "radio9", name: "RadioJauh", kind: "client-radio" };
  let healthy = false;
  await renderRadioWindow(doc, body, device, async (path) => {
    if (path.startsWith("/api/devices/ports"))
      return radioPorts;
    if (!healthy)
      throw new Error("down");
    return saved;
  }, post);
  expect(allText(body)).toContain("Could not read the radio delay.");
  healthy = true;
  button(body, "Try again").click();
  await flush();
  expect(allText(body)).toContain("adds 60 ms");
});
