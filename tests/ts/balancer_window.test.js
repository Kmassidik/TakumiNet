import { expect, test } from "bun:test";
import { renderBalancerWindow } from "../../web/js/mod/ui/balancer_window.js";

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
function inputUnder(root, label) {
  const field = find(root, (n) => n.tagName === "LABEL" && n.textContent === label);
  const input = field && find(field, (n) => n.tagName === "INPUT");
  if (!input)
    throw new Error(`no field labelled ${label}`);
  return input;
}
function flush() {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

// tests/ts/__conv_balancer_window.ts
var balancer = { id: "lb1", name: "Balancer1", kind: "load-balancer" };
var workspace = {
  devices: [
    { id: "lb1", name: "Balancer1" },
    { id: "srv1", name: "Web1" },
    { id: "srv2", name: "Web2" }
  ],
  links: []
};
function mockPost(responses, calls = []) {
  const post = async (path) => {
    calls.push(path);
    const key = Object.keys(responses).find((k) => path.startsWith(k));
    if (!key)
      throw new Error(`unexpected ${path}`);
    const hit = responses[key];
    return typeof hit === "function" ? hit() : hit;
  };
  return { post, calls };
}
var fullResponses = {
  "/api/lb/list": { pool: [{ member: "srv1", served: 3 }, { member: "srv2", served: 0 }] },
  "/api/devices/lbpool": {}
};
function rendered(responses) {
  const doc = new FakeDocument;
  const body = new FakeElement("div");
  const { post, calls } = mockPost(responses);
  const done = renderBalancerWindow(doc, body, balancer, workspace, post);
  return { doc, body, done, calls };
}
test("the balancer window names each pool member with its served count", async () => {
  const { body, done } = rendered(fullResponses);
  await done;
  const text = allText(body);
  expect(text).toContain("Server pool");
  expect(text).toContain("Web1: 3 served");
  expect(text).toContain("Web2: 0 served");
});
test("an empty pool shows the empty state, never a blank pane", async () => {
  const { body, done } = rendered({ ...fullResponses, "/api/lb/list": { pool: [] } });
  await done;
  expect(allText(body)).toContain("The pool is empty: add servers.");
});
test("while the pool loads, the section says it is loading", () => {
  const doc = new FakeDocument;
  const body = new FakeElement("div");
  renderBalancerWindow(doc, body, balancer, workspace, () => new Promise(() => {}));
  expect(allText(body)).toContain("Loading\u2026");
});
test("a failed pool load shows the error state, and Try again recovers", async () => {
  let healthy = false;
  const { post } = mockPost(fullResponses);
  const flaky = (path) => healthy ? post(path) : Promise.reject(new Error("down"));
  const doc = new FakeDocument;
  const body = new FakeElement("div");
  await renderBalancerWindow(doc, body, balancer, workspace, flaky);
  expect(allText(body)).toContain("Could not load the pool.");
  healthy = true;
  button(body, "Try again").click();
  await flush();
  expect(allText(body)).toContain("Web1: 3 served");
});
test("adding a server resolves its name to the id and reloads the pool", async () => {
  const { body, done, calls } = rendered(fullResponses);
  await done;
  inputUnder(body, "Server").value = "Web2";
  button(body, "Add server").click();
  await flush();
  expect(calls).toContain("/api/devices/lbpool?id=lb1&member=srv2");
  expect(calls.filter((c) => c.startsWith("/api/lb/list")).length).toBe(2);
  expect(allText(body)).toContain("Web2 added to the pool.");
});
test("removing a member posts remove=1 and reloads the pool", async () => {
  const { body, done, calls } = rendered(fullResponses);
  await done;
  button(body, "Remove").click();
  await flush();
  expect(calls).toContain("/api/devices/lbpool?id=lb1&member=srv1&remove=1");
  expect(calls.filter((c) => c.startsWith("/api/lb/list")).length).toBe(2);
});
test("a pool failure shows the server's error text verbatim", async () => {
  const { body, done } = rendered({
    ...fullResponses,
    "/api/devices/lbpool": { error: "srv9 is not a server" }
  });
  await done;
  inputUnder(body, "Server").value = "srv9";
  button(body, "Add server").click();
  await flush();
  expect(allText(body)).toContain("srv9 is not a server");
});
