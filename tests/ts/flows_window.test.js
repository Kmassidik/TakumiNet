import { expect, test } from "bun:test";
import { loadClass, parseFlows, renderFlowsWindow } from "../../web/js/mod/ui/flows_window.js";

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

// tests/ts/__conv_flows_window.ts
var workspace = {
  devices: [
    { id: "pc0", name: "PC0" },
    { id: "srv0", name: "Server0" }
  ],
  links: []
};
var loadedList = {
  links: [
    { a: "PC0", aPort: "Fa0", b: "Server0", bPort: "Fa0/1", mbit: 95, capacity: 100, percent: 95 },
    { a: "Server0", aPort: "Gi0", b: "PC0", bPort: "Gi1", mbit: 10, capacity: 1000, percent: 1 }
  ]
};
var exportXml = '<takumi version="1"><flow dev="pc0" to="srv0" mbit="95"/></takumi>';
function harness(options = {}) {
  const doc = new FakeDocument;
  const body = new FakeElement("div");
  const posts = [];
  const post = async (path) => {
    posts.push(path);
    if (path.startsWith("/api/flows/list"))
      return options.list ?? loadedList;
    if (path.startsWith("/api/flows/set"))
      return options.set ?? { devices: [] };
    throw new Error(`unexpected ${path}`);
  };
  const getText = async () => options.xml ?? exportXml;
  const done = renderFlowsWindow(doc, body, workspace, { post, getText });
  return { doc, body, posts, done };
}
test("the load colour follows the thresholds: ok under 70, warn to 99, danger from 100", () => {
  expect(loadClass(0)).toBe("kw-load-ok");
  expect(loadClass(69.9)).toBe("kw-load-ok");
  expect(loadClass(70)).toBe("kw-load-warn");
  expect(loadClass(99.9)).toBe("kw-load-warn");
  expect(loadClass(100)).toBe("kw-load-danger");
});
test("the export file yields the flow rows and the spread switch state", () => {
  const parsed = parseFlows('<flow dev="a" to="b" mbit="40"/><flowspread on="1"/>');
  expect(parsed.flows).toEqual([{ from: "a", to: "b", mbit: 40 }]);
  expect(parsed.spread).toBe(true);
  expect(parseFlows("<takumi/>")).toEqual({ flows: [], spread: false });
});
test("the dialog tables every cable with its load percent coloured by threshold", async () => {
  const { body, done } = harness();
  await done;
  const text = allText(body);
  expect(text).toContain("PC0 Fa0 \u2194 Server0 Fa0/1");
  expect(find(body, (n) => n.className === "kw-load-warn" && n.textContent === "95%")).not.toBeNull();
  expect(find(body, (n) => n.className === "kw-load-ok" && n.textContent === "1%")).not.toBeNull();
  expect(text).toContain("PC0 \u2192 Server0 \xB7 95 Mbit/s");
});
test("with no flows the dialog says so instead of showing a blank list", async () => {
  const { body, done } = harness({ xml: "<takumi/>" });
  await done;
  expect(allText(body)).toContain("No flows yet. Add one to light up the cables.");
});
test("while loading the dialog says so", () => {
  const doc = new FakeDocument;
  const body = new FakeElement("div");
  renderFlowsWindow(doc, body, workspace, {
    post: () => new Promise(() => {}),
    getText: () => new Promise(() => {})
  });
  expect(allText(body)).toContain("Loading\u2026");
});
test("a failed load shows the error state, and Try again recovers", async () => {
  const doc = new FakeDocument;
  const body = new FakeElement("div");
  let healthy = false;
  const post = async (path) => {
    if (!healthy)
      throw new Error("down");
    if (path.startsWith("/api/flows/list"))
      return loadedList;
    return {};
  };
  await renderFlowsWindow(doc, body, workspace, { post, getText: async () => exportXml });
  expect(allText(body)).toContain("Could not load the cable loads.");
  healthy = true;
  button(body, "Try again").click();
  await flush();
  expect(allText(body)).toContain("PC0 Fa0 \u2194 Server0 Fa0/1");
});
test("adding a flow resolves both names to ids and posts the right query", async () => {
  const { body, posts, done } = harness();
  await done;
  inputUnder(body, "From device").value = "PC0";
  inputUnder(body, "To device").value = "Server0";
  inputUnder(body, "Mbit/s").value = "40";
  button(body, "Add flow").click();
  await flush();
  expect(posts).toContain("/api/flows/set?from=pc0&to=srv0&mbit=40");
  expect(allText(body)).toContain("Flow set: PC0 \u2192 Server0 at 40 Mbit/s.");
});
test("a fractional rate is refused before anything is posted", async () => {
  const { body, posts, done } = harness();
  await done;
  inputUnder(body, "From device").value = "PC0";
  inputUnder(body, "To device").value = "Server0";
  inputUnder(body, "Mbit/s").value = "1.5";
  button(body, "Add flow").click();
  await flush();
  expect(posts.filter((p) => p.startsWith("/api/flows/set"))).toEqual([]);
  expect(allText(body)).toContain("Mbit/s must be a whole number; 0 removes the flow.");
});
test("Remove posts the flow again at zero", async () => {
  const { body, posts, done } = harness();
  await done;
  button(body, "Remove").click();
  await flush();
  expect(posts).toContain("/api/flows/set?from=pc0&to=srv0&mbit=0");
});
test("the spread switch posts its new state", async () => {
  const { body, posts, done } = harness();
  await done;
  const toggle = button(body, "Spread over spare paths");
  expect(toggle.getAttribute("aria-pressed")).toBe("false");
  toggle.click();
  await flush();
  expect(posts).toContain("/api/flows/set?spread=1");
});
test("the server's own error text reaches the person verbatim", async () => {
  const { body, done } = harness({ set: { error: "a flow must be at most 100000 Mbit/s" } });
  await done;
  inputUnder(body, "From device").value = "PC0";
  inputUnder(body, "To device").value = "Server0";
  inputUnder(body, "Mbit/s").value = "200000";
  button(body, "Add flow").click();
  await flush();
  expect(allText(body)).toContain("a flow must be at most 100000 Mbit/s");
});
