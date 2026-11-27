import { expect, test } from "bun:test";
import { windowIdForKind } from "../../web/js/mod/ui/kind_windows.js";
import {
  joinedClients,
  renderCellTowerWindow,
  renderIotWindow,
  SHOWN_REGISTERS,
  towerRows
} from "../../web/js/mod/ui/iot_window.js";

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

// tests/ts/__conv_iot_window.ts
var plc = { id: "plc1", name: "ValvePLC", kind: "plc" };
var workspace = {
  devices: [
    { id: "plc1", name: "ValvePLC" },
    { id: "ioe9", name: "FarUnit" }
  ]
};
var exported = [
  '<device id="tower1" kind="celltower" model="Cell Tower" x="1" y="2" name="HillTower" ip="" prefix="24"/>',
  '<cell client="ioe9" tower="tower1"/>'
].join(`
`);
function fakePost(answers) {
  const calls = [];
  const post = async (path) => {
    calls.push(path);
    return answers(path);
  };
  return { calls, post };
}
function readAnswers(path) {
  if (path.startsWith("/api/iot/read")) {
    const addr = Number(new URLSearchParams(path.split("?")[1]).get("addr"));
    return { value: addr === 2 ? 73 : 0 };
  }
  if (path.startsWith("/api/cell/status"))
    return { associated: false, tower: "" };
  return {};
}
test("IoT kinds and the cell tower route to their own windows", () => {
  for (const kind of ["plc", "thing", "ioe"])
    expect(windowIdForKind(kind)).toBe("iot-window");
  expect(windowIdForKind("celltower")).toBe("celltower-window");
});
test("the registers panel reads the first 16 registers and shows each value", async () => {
  const doc = new FakeDocument;
  const body = new FakeElement("div");
  const { calls, post } = fakePost(readAnswers);
  await renderIotWindow(doc, body, plc, workspace, post, async () => exported);
  const reads = calls.filter((c) => c.startsWith("/api/iot/read"));
  expect(reads.length).toBe(SHOWN_REGISTERS);
  expect(reads[0]).toBe("/api/iot/read?id=plc1&addr=0");
  expect(reads[15]).toBe("/api/iot/read?id=plc1&addr=15");
  const text = allText(body);
  expect(text).toContain("Register 2 \xB7 73");
  expect(text).toContain("Register 0 \xB7 0");
});
test("a register write posts the exact address and value, then refreshes", async () => {
  const doc = new FakeDocument;
  const body = new FakeElement("div");
  const { calls, post } = fakePost((path) => path.startsWith("/api/iot/write") ? { old: 0 } : readAnswers(path));
  await renderIotWindow(doc, body, plc, workspace, post, async () => exported);
  inputUnder(body, "Register").value = "2";
  inputUnder(body, "Value").value = "73";
  button(body, "Write").click();
  await flush();
  expect(calls).toContain("/api/iot/write?id=plc1&addr=2&value=73");
  expect(allText(body)).toContain("Register 2 is now 73 (was 0).");
  expect(calls.filter((c) => c.startsWith("/api/iot/read")).length).toBe(SHOWN_REGISTERS * 2);
});
test("a rejected write and a rejected read show the engine's words verbatim", async () => {
  const doc = new FakeDocument;
  const body = new FakeElement("div");
  const { post } = fakePost((path) => {
    if (path.startsWith("/api/iot/write"))
      return { error: "register out of range (0-255)" };
    if (path.startsWith("/api/iot/read"))
      return { error: "FloorSwitch has no Modbus registers" };
    return readAnswers(path);
  });
  await renderIotWindow(doc, body, plc, workspace, post, async () => exported);
  expect(allText(body)).toContain("FloorSwitch has no Modbus registers");
  inputUnder(body, "Register").value = "4";
  inputUnder(body, "Value").value = "9";
  button(body, "Write").click();
  await flush();
  expect(allText(body)).toContain("register out of range (0-255)");
});
test("a nonsense register never reaches the engine", async () => {
  const doc = new FakeDocument;
  const body = new FakeElement("div");
  const { calls, post } = fakePost(readAnswers);
  await renderIotWindow(doc, body, plc, workspace, post, async () => exported);
  inputUnder(body, "Register").value = "900";
  inputUnder(body, "Value").value = "1";
  button(body, "Write").click();
  await flush();
  expect(calls.some((c) => c.startsWith("/api/iot/write"))).toBe(false);
  expect(allText(body)).toContain("Type a register from 0 to 255 and a value from 0 to 65535.");
});
test("the cell tower section lists towers and Join posts the tower's id", async () => {
  const doc = new FakeDocument;
  const body = new FakeElement("div");
  const { calls, post } = fakePost((path) => path.startsWith("/api/cell/join") ? {} : readAnswers(path));
  await renderIotWindow(doc, body, plc, workspace, post, async () => exported);
  expect(allText(body)).toContain("Not joined to a tower.");
  expect(allText(body)).toContain("HillTower");
  button(body, "Join").click();
  await flush();
  expect(calls).toContain("/api/cell/join?id=plc1&tower=tower1");
  expect(allText(body)).toContain("Joined to HillTower.");
});
test("sending over the tower posts the cellular protocol to the named device", async () => {
  const doc = new FakeDocument;
  const body = new FakeElement("div");
  const { calls, post } = fakePost((path) => path.startsWith("/api/iot/send") ? { status: "Cellular delivered" } : readAnswers(path));
  await renderIotWindow(doc, body, plc, workspace, post, async () => exported);
  inputUnder(body, "Send to").value = "FarUnit";
  button(body, "Send over the tower").click();
  await flush();
  expect(calls).toContain("/api/iot/send?src=plc1&dst=ioe9&proto=cellular&seq=0");
  expect(allText(body)).toContain("Cellular delivered to FarUnit.");
});
test("a failed cellular send shows the engine's reason verbatim", async () => {
  const doc = new FakeDocument;
  const body = new FakeElement("div");
  const { post } = fakePost((path) => path.startsWith("/api/iot/send") ? { error: "both devices must be associated with the same cell tower" } : readAnswers(path));
  await renderIotWindow(doc, body, plc, workspace, post, async () => exported);
  inputUnder(body, "Send to").value = "FarUnit";
  button(body, "Send over the tower").click();
  await flush();
  expect(allText(body)).toContain("both devices must be associated with the same cell tower");
});
test("the tower window lists its joined clients by name", async () => {
  const doc = new FakeDocument;
  const body = new FakeElement("div");
  const tower = { id: "tower1", name: "HillTower", kind: "celltower" };
  await renderCellTowerWindow(doc, body, tower, workspace, async () => exported);
  const text = allText(body);
  expect(text).toContain("FarUnit");
  expect(text).toContain("no cable terminates here");
});
test("an unjoined tower shows the empty state", async () => {
  const doc = new FakeDocument;
  const body = new FakeElement("div");
  const tower = { id: "tower2", name: "EmptyTower", kind: "celltower" };
  await renderCellTowerWindow(doc, body, tower, workspace, async () => exported);
  expect(allText(body)).toContain("No device has joined this tower yet.");
});
test("tower and client rows come straight from the saved workspace", () => {
  expect(towerRows(exported)).toEqual([{ id: "tower1", name: "HillTower" }]);
  expect(joinedClients(exported, "tower1", workspace)).toEqual(["FarUnit"]);
  expect(joinedClients(exported, "tower1", {})).toEqual(["ioe9"]);
});
