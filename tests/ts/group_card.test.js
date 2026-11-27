import { expect, test } from "bun:test";
import { makeGroupPress, renderGroupCard } from "../../web/ts/mod/ui/group_card.js";

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
function flush() {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

// tests/ts/__conv_group_card.ts
var group = { id: "group0", name: "Office", devices: 3, status: "degraded" };
test("the card names the group, counts its devices and explains the status", () => {
  const doc = new FakeDocument;
  const body = new FakeElement("div");
  renderGroupCard(doc, body, group);
  const text = allText(body);
  expect(text).toContain("Office");
  expect(text).toContain("3 devices inside");
  expect(text).toContain("Degraded: a device inside has a port down");
});
function pressHarness(response = { devices: [] }) {
  const calls = [];
  const cards = [];
  const applied = [];
  let clock = 0;
  const press = makeGroupPress({
    now: () => clock,
    post: async (path) => {
      calls.push(path);
      return response;
    },
    card: (g) => cards.push(g),
    applied: (res) => applied.push(res)
  });
  return { press, calls, cards, applied, tick: (ms) => {
    clock += ms;
  } };
}
test("one press opens the card; a quick second press posts the expand and hands the workspace on", async () => {
  const { press, calls, cards, applied, tick } = pressHarness();
  press(group);
  expect(cards).toHaveLength(1);
  tick(200);
  press(group);
  await flush();
  expect(calls).toEqual(["/api/groups/expand?id=group0"]);
  expect(applied).toHaveLength(1);
  expect(cards).toHaveLength(1);
});
test("a slow second press is a fresh single press, not an expand", async () => {
  const { press, calls, cards, tick } = pressHarness();
  press(group);
  tick(1000);
  press(group);
  await flush();
  expect(calls).toEqual([]);
  expect(cards).toHaveLength(2);
});
test("a failed expand never applies the response", async () => {
  const { press, applied, tick } = pressHarness({ error: "no such group" });
  press(group);
  tick(100);
  press(group);
  await flush();
  expect(applied).toEqual([]);
});
