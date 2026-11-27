import { expect, test } from "bun:test";
import { callManagers, renderPhoneWindow } from "../../web/js/mod/ui/phone_window.js";

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

// tests/ts/__conv_phone_window.ts
var workspace = {
  devices: [
    { id: "server0", name: "CallManager", kind: "server", ip: "10.20.0.5" },
    { id: "server1", name: "BareServer", kind: "server", ip: "" },
    { id: "switch0", name: "OfficeSwitch", kind: "switch", ip: "" },
    { id: "phone1", name: "DeskPhone1", kind: "phone", ip: "10.20.0.11" }
  ],
  links: []
};
var device = { id: "phone1", name: "DeskPhone1", kind: "phone" };
function phoneBackend(state) {
  const requests = [];
  const post = async (path) => {
    requests.push(path);
    if (path.startsWith("/api/phone/status")) {
      return { registered: state.registered, cm: "10.20.0.5", extension: state.ext, call: state.call };
    }
    if (path.startsWith("/api/phone/register")) {
      state.registered = true;
      state.ext = Number(new URLSearchParams(path.split("?")[1]).get("ext"));
      return {};
    }
    if (path.startsWith("/api/phone/call")) {
      if (state.failCall)
        return { error: state.failCall };
      state.call = { from: state.ext, to: 2002, state: "established" };
      return {};
    }
    return {};
  };
  return { requests, post };
}
test("only addressed servers count as call managers", () => {
  expect(callManagers(workspace)).toEqual([{ label: "CallManager (10.20.0.5)", address: "10.20.0.5" }]);
  expect(callManagers({ devices: [], links: [] })).toEqual([]);
});
test("an unregistered phone shows the empty line state and registers through the picker", async () => {
  const doc = new FakeDocument;
  const body = new FakeElement("div");
  const backend = phoneBackend({ registered: false, ext: 0, call: null });
  await renderPhoneWindow(doc, body, device, workspace, backend.post);
  expect(allText(body)).toContain("Not registered at any call manager yet.");
  const picker = find(body, (n) => n.tagName === "SELECT");
  expect(picker.children[0]?.textContent).toBe("CallManager (10.20.0.5)");
  inputUnder(body, "Extension").value = "2001";
  button(body, "Register").click();
  await flush();
  expect(backend.requests).toContain("/api/phone/register?id=phone1&cm=10.20.0.5&ext=2001");
  expect(allText(body)).toContain("Registered as extension 2001.");
});
test("a registered phone shows its line and dials another extension", async () => {
  const doc = new FakeDocument;
  const body = new FakeElement("div");
  const backend = phoneBackend({ registered: true, ext: 2001, call: null });
  await renderPhoneWindow(doc, body, device, workspace, backend.post);
  expect(allText(body)).toContain("Registered at 10.20.0.5 as extension 2001.");
  inputUnder(body, "Extension to call").value = "2002";
  button(body, "Call").click();
  await flush();
  expect(backend.requests).toContain("/api/phone/call?from=2001&to=2002");
  expect(allText(body)).toContain("Call to extension 2002 established.");
  expect(allText(body)).toContain("In a call to extension 2002 (established).");
});
test("dialing before registering is refused in the window", async () => {
  const doc = new FakeDocument;
  const body = new FakeElement("div");
  const backend = phoneBackend({ registered: false, ext: 0, call: null });
  await renderPhoneWindow(doc, body, device, workspace, backend.post);
  inputUnder(body, "Extension to call").value = "2002";
  button(body, "Call").click();
  await flush();
  expect(allText(body)).toContain("Register this phone first.");
  expect(backend.requests.some((r) => r.startsWith("/api/phone/call"))).toBe(false);
});
test("a failed call shows the engine's reason verbatim", async () => {
  const doc = new FakeDocument;
  const body = new FakeElement("div");
  const reason = "no phone is registered as extension 2002";
  const backend = phoneBackend({ registered: true, ext: 2001, call: null, failCall: reason });
  await renderPhoneWindow(doc, body, device, workspace, backend.post);
  inputUnder(body, "Extension to call").value = "2002";
  button(body, "Call").click();
  await flush();
  expect(allText(body)).toContain(reason);
});
test("an analog phone explains that its router carries the call", async () => {
  const doc = new FakeDocument;
  const body = new FakeElement("div");
  const backend = phoneBackend({ registered: false, ext: 0, call: null });
  const analog = { id: "analog0", name: "WallPhone", kind: "analogphone" };
  await renderPhoneWindow(doc, body, analog, workspace, backend.post);
  expect(allText(body)).toContain("An analog phone talks through its phone cable");
});
test("without an addressed server the register section says what is missing", async () => {
  const doc = new FakeDocument;
  const body = new FakeElement("div");
  const backend = phoneBackend({ registered: false, ext: 0, call: null });
  await renderPhoneWindow(doc, body, device, { devices: [], links: [] }, backend.post);
  expect(allText(body)).toContain("No addressed server to register at.");
});
