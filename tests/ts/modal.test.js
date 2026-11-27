import { expect, test } from "bun:test";
import { openModal } from "../../web/ts/mod/ui/modal.js";
import { ModalStack } from "../../web/ts/mod/ui/modal_stack.js";

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

// tests/ts/__conv_modal.ts
function openedModal(doc, options) {
  const stack = new ModalStack;
  const result = openModal(doc, stack, options);
  const box = doc.body.children[0].children[0];
  const buttons = box.children.at(-1).children;
  return { stack, result, box, cancel: buttons[0], ok: buttons[1] };
}
test("OK on a confirm resolves true and removes the modal", async () => {
  const doc = new FakeDocument;
  const { stack, result, ok } = openedModal(doc, { message: "Discard?" });
  ok.click();
  expect(await result).toBe(true);
  expect(stack.size).toBe(0);
  expect(doc.body.children).toHaveLength(0);
});
test("Escape on a confirm resolves false", async () => {
  const doc = new FakeDocument;
  const { box, result } = openedModal(doc, { message: "Discard?" });
  box.dispatch("keydown", { key: "Escape" });
  expect(await result).toBe(false);
});
test("a text prompt resolves to the typed value, or null on cancel", async () => {
  const doc = new FakeDocument;
  const typed = openedModal(doc, { message: "Name", input: "pc0" });
  const field = typed.box.children[1];
  field.value = "router9";
  typed.box.children.at(-1).children[1].click();
  expect(await typed.result).toBe("router9");
  const cancelled = openedModal(doc, { message: "Name", input: "pc0" });
  cancelled.box.children.at(-1).children[0].click();
  expect(await cancelled.result).toBe(null);
});
