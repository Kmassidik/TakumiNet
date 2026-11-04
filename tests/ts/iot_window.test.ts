import { expect, test } from "bun:test";
import { windowIdForKind } from "../../web/ts/ui/kind_windows";
import {
  joinedClients,
  renderCellTowerWindow,
  renderIotWindow,
  SHOWN_REGISTERS,
  towerRows,
} from "../../web/ts/ui/iot_window";
import { FakeDocument, FakeElement } from "./fake_dom";
import { allText, button, flush, inputUnder } from "./kind_test_helpers";

const plc = { id: "plc1", name: "ValvePLC", kind: "plc" };
const workspace = {
  devices: [
    { id: "plc1", name: "ValvePLC" },
    { id: "ioe9", name: "FarUnit" },
  ],
};
const exported = [
  '<device id="tower1" kind="celltower" model="Cell Tower" x="1" y="2" name="HillTower" ip="" prefix="24"/>',
  '<cell client="ioe9" tower="tower1"/>',
].join("\n");

function fakePost(answers: (path: string) => Record<string, unknown>) {
  const calls: string[] = [];
  const post = async (path: string): Promise<Record<string, unknown>> => {
    calls.push(path);
    return answers(path);
  };
  return { calls, post };
}

function readAnswers(path: string): Record<string, unknown> {
  if (path.startsWith("/api/iot/read")) {
    const addr = Number(new URLSearchParams(path.split("?")[1]).get("addr"));
    return { value: addr === 2 ? 73 : 0 };
  }
  if (path.startsWith("/api/cell/status")) return { associated: false, tower: "" };
  return {};
}

test("IoT kinds and the cell tower route to their own windows", () => {
  for (const kind of ["plc", "thing", "ioe"]) expect(windowIdForKind(kind)).toBe("iot-window");
  expect(windowIdForKind("celltower")).toBe("celltower-window");
});

test("the registers panel reads the first 16 registers and shows each value", async () => {
  const doc = new FakeDocument();
  const body = new FakeElement("div");
  const { calls, post } = fakePost(readAnswers);
  await renderIotWindow(doc, body, plc, workspace, post, async () => exported);
  const reads = calls.filter((c) => c.startsWith("/api/iot/read"));
  expect(reads.length).toBe(SHOWN_REGISTERS);
  expect(reads[0]).toBe("/api/iot/read?id=plc1&addr=0");
  expect(reads[15]).toBe("/api/iot/read?id=plc1&addr=15");
  const text = allText(body);
  expect(text).toContain("Register 2 · 73");
  expect(text).toContain("Register 0 · 0");
});

test("a register write posts the exact address and value, then refreshes", async () => {
  const doc = new FakeDocument();
  const body = new FakeElement("div");
  const { calls, post } = fakePost((path) =>
    path.startsWith("/api/iot/write") ? { old: 0 } : readAnswers(path));
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
  const doc = new FakeDocument();
  const body = new FakeElement("div");
  const { post } = fakePost((path) => {
    if (path.startsWith("/api/iot/write")) return { error: "register out of range (0-255)" };
    if (path.startsWith("/api/iot/read")) return { error: "FloorSwitch has no Modbus registers" };
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
  const doc = new FakeDocument();
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
  const doc = new FakeDocument();
  const body = new FakeElement("div");
  const { calls, post } = fakePost((path) =>
    path.startsWith("/api/cell/join") ? {} : readAnswers(path));
  await renderIotWindow(doc, body, plc, workspace, post, async () => exported);
  expect(allText(body)).toContain("Not joined to a tower.");
  expect(allText(body)).toContain("HillTower");
  button(body, "Join").click();
  await flush();
  expect(calls).toContain("/api/cell/join?id=plc1&tower=tower1");
  expect(allText(body)).toContain("Joined to HillTower.");
});

test("sending over the tower posts the cellular protocol to the named device", async () => {
  const doc = new FakeDocument();
  const body = new FakeElement("div");
  const { calls, post } = fakePost((path) =>
    path.startsWith("/api/iot/send") ? { status: "Cellular delivered" } : readAnswers(path));
  await renderIotWindow(doc, body, plc, workspace, post, async () => exported);
  inputUnder(body, "Send to").value = "FarUnit";
  button(body, "Send over the tower").click();
  await flush();
  expect(calls).toContain("/api/iot/send?src=plc1&dst=ioe9&proto=cellular&seq=0");
  expect(allText(body)).toContain("Cellular delivered to FarUnit.");
});

test("a failed cellular send shows the engine's reason verbatim", async () => {
  const doc = new FakeDocument();
  const body = new FakeElement("div");
  const { post } = fakePost((path) =>
    path.startsWith("/api/iot/send")
      ? { error: "both devices must be associated with the same cell tower" }
      : readAnswers(path));
  await renderIotWindow(doc, body, plc, workspace, post, async () => exported);
  inputUnder(body, "Send to").value = "FarUnit";
  button(body, "Send over the tower").click();
  await flush();
  expect(allText(body)).toContain("both devices must be associated with the same cell tower");
});

test("the tower window lists its joined clients by name", async () => {
  const doc = new FakeDocument();
  const body = new FakeElement("div");
  const tower = { id: "tower1", name: "HillTower", kind: "celltower" };
  await renderCellTowerWindow(doc, body, tower, workspace, async () => exported);
  const text = allText(body);
  expect(text).toContain("FarUnit");
  expect(text).toContain("no cable terminates here");
});

test("an unjoined tower shows the empty state", async () => {
  const doc = new FakeDocument();
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
