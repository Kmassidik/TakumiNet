import { expect, test } from "bun:test";
import { createButton } from "../../web/js/mod/ui/button.js";

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

// tests/ts/__conv_button.ts
test("a button renders its label, title and pressed state", () => {
  const doc = new FakeDocument;
  const button = createButton(doc, { label: "Play", title: "Play events", toggled: true, onClick: () => {} });
  expect(button.textContent).toBe("Play");
  expect(button.title).toBe("Play events");
  expect(button.getAttribute("aria-pressed")).toBe("true");
});
test("a button calls its handler on click and not when disabled", () => {
  const doc = new FakeDocument;
  let clicks = 0;
  const button = createButton(doc, { label: "Step", onClick: () => {
    clicks++;
  } });
  button.click();
  expect(clicks).toBe(1);
  button.disabled = true;
  button.click();
  expect(clicks).toBe(1);
});
