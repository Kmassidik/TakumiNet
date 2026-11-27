export class FakeElement {
  textContent = "";
  title = "";
  className = "";
  value = "";
  disabled = false;
  dataset = {};
  children = [];
  parent = null;
  attrs = new Map();
  listeners = new Map();
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
    this.listeners.set(type, [...(this.listeners.get(type) ?? []), handler]);
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
    for (const child of this.children) child.parent = null;
    this.children = [];
  }

  remove() {
    if (!this.parent) return;
    this.parent.children = this.parent.children.filter((c) => c !== this);
    this.parent = null;
  }

  dispatch(type, event) {
    for (const handler of this.listeners.get(type) ?? []) {
      handler({ key: "", target: this, preventDefault() {}, ...event });
    }
  }

  click() {
    if (this.disabled) return;
    for (const handler of this.listeners.get("click") ?? []) {
      handler({ key: "", target: this, preventDefault() {} });
    }
  }
}

export class FakeDocument {
  body = new FakeElement("body");
  activeElement = null;

  createElement(tag) {
    return new FakeElement(tag);
  }
}
