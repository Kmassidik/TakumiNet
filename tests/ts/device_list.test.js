import { expect, test } from "bun:test";
import { renderDeviceList } from "../../web/js/mod/ui/device_list.js";

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

// tests/ts/__conv_device_list.ts
var devices = [
  { id: "a", name: "PC0", model: "PC-PT", ip: "10.0.0.2", prefix: 24 },
  { id: "b", name: "Switch0", model: "2960", ip: "", prefix: 0 }
];
test("the screen-reader device list has one button per device, named for screen readers", () => {
  const doc = new FakeDocument;
  const list = new FakeElement("ul");
  renderDeviceList(doc, list, devices, () => {});
  expect(list.children.map((c) => c.tagName)).toEqual(["LI", "LI"]);
  const first = list.children[0].children[0];
  expect(first.tagName).toBe("BUTTON");
  expect(first.getAttribute("aria-label")).toBe("PC0, PC-PT, 10.0.0.2/24");
  expect(list.children[1].children[0].getAttribute("aria-label")).toBe("Switch0, 2960");
});
test("activating a device button reports its id", () => {
  const doc = new FakeDocument;
  const list = new FakeElement("ul");
  const picked = [];
  renderDeviceList(doc, list, devices, (id) => picked.push(id));
  list.children[1].children[0].click();
  expect(picked).toEqual(["b"]);
});
test("rendering again replaces the previous list", () => {
  const doc = new FakeDocument;
  const list = new FakeElement("ul");
  renderDeviceList(doc, list, devices, () => {});
  renderDeviceList(doc, list, [devices[0]], () => {});
  expect(list.children).toHaveLength(1);
});
