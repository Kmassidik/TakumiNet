import { expect, test } from "bun:test";
import { renderToolbar } from "../../web/ts/mod/ui/toolbar.js";

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

// tests/ts/__conv_toolbar.ts
var icon = (key) => `/art3d/${key}.webp`;
test("a toolbar renders one icon button per item, with its action and title", () => {
  const doc = new FakeDocument;
  const bar = new FakeElement("div");
  renderToolbar(doc, bar, [["toolbar/new", "New", "new"], ["toolbar/open", "Open", "open"]], icon);
  expect(bar.children.map((c) => c.tagName)).toEqual(["BUTTON", "BUTTON"]);
  const [first] = bar.children;
  expect(first.title).toBe("New");
  expect(first.dataset.action).toBe("new");
  const img = first.children[0];
  expect(img.getAttribute("src")).toBe("/art3d/toolbar/new.webp");
  expect(img.getAttribute("alt")).toBe("New");
});
test("a null item becomes a separator and rendering replaces old content", () => {
  const doc = new FakeDocument;
  const bar = new FakeElement("div");
  renderToolbar(doc, bar, [["toolbar/new", "New", "new"], null, ["toolbar/help", "Help", "help"]], icon);
  expect(bar.children.map((c) => c.tagName)).toEqual(["BUTTON", "SPAN", "BUTTON"]);
  expect(bar.children[1]?.className).toBe("sep");
  renderToolbar(doc, bar, [["toolbar/help", "Help", "help"]], icon);
  expect(bar.children).toHaveLength(1);
});
